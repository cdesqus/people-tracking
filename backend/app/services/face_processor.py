import asyncio
import cv2
import logging
import os
import uuid
import threading
import time
from datetime import datetime
from sqlalchemy import select
from app.database import async_session
from app.models.camera import Camera, CameraStatus
from app.models.employee import Employee
from app.models.face import Face
from app.models.alert import Alert, AlertSeverity, AlertType
from app.services.aws_rekognition import rekognition_service, NoFacesException
from app.utils.websocket_manager import ws_manager
from app.services import waha_service
from app.config import settings
from app.services.rtsp_service import RTSPService

from ultralytics import YOLO
import supervision as sv

logger = logging.getLogger(__name__)


def _safe_create_task(coro, name: str = "waha_task"):
    """Create an asyncio task that logs exceptions instead of silently swallowing them."""
    task = asyncio.create_task(coro, name=name)
    def _on_done(t):
        if t.cancelled():
            logger.warning(f"[Task:{name}] was cancelled")
        elif t.exception():
            logger.error(f"[Task:{name}] FAILED with exception: {t.exception()}", exc_info=t.exception())
    task.add_done_callback(_on_done)
    return task


# Persistent background readers per camera to avoid OpenCV buffering latency
_camera_threads: dict = {}   # camera_id -> threading.Thread
_camera_active: dict = {}    # camera_id -> bool

def _camera_worker(camera_id: str, stream_url: str):
    """Background thread that continuously reads from the camera to flush the buffer."""
    cap = cv2.VideoCapture(stream_url, cv2.CAP_FFMPEG)
    try:
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSECS, 3000)
        cap.set(cv2.CAP_PROP_READ_TIMEOUT_MSECS, 3000)
    except Exception:
        pass
    
    logger.info(f"Started frame grabber thread for camera {camera_id}")
    
    while _camera_active.get(camera_id, False):
        if not cap.isOpened():
            time.sleep(1)
            cap = cv2.VideoCapture(stream_url, cv2.CAP_FFMPEG)
            continue
            
        ret, frame = cap.read()
        if not ret or frame is None:
            # Connection lost or EOF, release and try to reconnect
            cap.release()
            time.sleep(1)
            continue
            
        # Store latest frame safely in RTSPService cache
        RTSPService.latest_frames[camera_id] = frame
        
    cap.release()
    logger.info(f"Stopped frame grabber thread for camera {camera_id}")


def _crop_face_from_frame(frame, bounding_box: dict, padding: float = 0.20):
    """Crop a face from a frame using a normalized bounding box with padding.
    
    Args:
        frame: The video frame (numpy array)
        bounding_box: Dict with 'Top', 'Left', 'Width', 'Height' (0.0-1.0 normalized)
        padding: Fraction of face size to add as margin (default 20%)
    
    Returns:
        Tuple of (crop_bytes, normalized_box_dict) or (None, box_dict) on failure
    """
    try:
        h, w = frame.shape[:2]
        
        f_left = bounding_box.get("Left", 0.0)
        f_top = bounding_box.get("Top", 0.0)
        f_width = bounding_box.get("Width", 0.0)
        f_height = bounding_box.get("Height", 0.0)
        
        # Add padding around the face for better visual context
        pad_x = f_width * padding
        pad_y = f_height * padding
        
        crop_left = max(0.0, f_left - pad_x)
        crop_top = max(0.0, f_top - pad_y)
        crop_right = min(1.0, f_left + f_width + pad_x)
        crop_bottom = min(1.0, f_top + f_height + pad_y)
        
        px_left = int(crop_left * w)
        px_top = int(crop_top * h)
        px_right = int(crop_right * w)
        px_bottom = int(crop_bottom * h)
        
        if px_right > px_left + 10 and px_bottom > px_top + 10:
            face_crop = frame[px_top:px_bottom, px_left:px_right]
            _, crop_buffer = cv2.imencode(".jpg", face_crop)
            return crop_buffer.tobytes(), {
                "top": f_top,
                "left": f_left,
                "width": f_width,
                "height": f_height,
            }
    except Exception as crop_err:
        logger.error(f"Error cropping face: {crop_err}")
    
    return None, {
        "top": bounding_box.get("Top", 0.2),
        "left": bounding_box.get("Left", 0.3),
        "width": bounding_box.get("Width", 0.4),
        "height": bounding_box.get("Height", 0.4),
    }


def _open_and_read_frame(camera_id: str, stream_url: str):
    """Get the latest frame from the background grabber thread."""
    if camera_id not in _camera_threads or not _camera_threads[camera_id].is_alive():
        _camera_active[camera_id] = True
        t = threading.Thread(target=_camera_worker, args=(camera_id, stream_url), daemon=True)
        _camera_threads[camera_id] = t
        t.start()
        # Give it a moment to fetch the first frame
        time.sleep(1.0)
        
    frame = RTSPService.latest_frames.get(camera_id)
    if frame is not None:
        return True, frame.copy()
    return False, None


async def start_face_processor():
    """Background loop that processes active camera streams and performs face recognition"""
    logger.info("Initializing background face processor loop...")

    obstructed_counts = {}  # camera_id -> count of consecutive obstructed frames
    last_alert_sent = {}    # camera_id -> timestamp of last sent alert
    last_unknown_alert_sent = {} # camera_id -> timestamp of last unknown face alert
    last_employee_alert_sent = {} # (camera_id, employee_id) -> timestamp of last employee alert

    # Load YOLOv8 for first-pass person detection
    logger.info("Loading YOLOv8n model for face processor...")
    try:
        yolo_model = YOLO("yolov8n.pt")
    except Exception as e:
        logger.error(f"Failed to load YOLOv8n: {e}")
        yolo_model = None

    # Wait a few seconds for database and services to settle
    await asyncio.sleep(5)

    # Auto-index any employees who have photo_data but no face_id (e.g. registered before AWS was configured)
    try:
        async with async_session() as session:
            stmt = select(Employee).where(
                Employee.face_id == None,
                Employee.photo_data != None,
                Employee.deleted_at == None
            )
            res = await session.execute(stmt)
            unindexed_employees = res.scalars().all()
            
            if unindexed_employees:
                logger.info(f"Found {len(unindexed_employees)} unindexed employee(s). Attempting AWS Rekognition indexing...")
                collection_id = os.getenv("REKOGNITION_EMPLOYEES_COLLECTION", "employees")
                for emp in unindexed_employees:
                    try:
                        logger.info(f"Indexing face for employee: {emp.name} ({emp.id})")
                        face_id = await rekognition_service.index_face(
                            collection_id=collection_id,
                            image_bytes=emp.photo_data,
                            external_id=emp.id
                        )
                        if face_id:
                            emp.face_id = face_id
                            logger.info(f"Successfully indexed face for {emp.name}. FaceId: {face_id}")
                        else:
                            logger.warning(f"Could not index face for {emp.name} (no face detected in profile photo)")
                    except Exception as index_err:
                        logger.error(f"Error indexing face for {emp.name}: {index_err}")
                await session.commit()
    except Exception as sync_err:
        logger.error(f"Error during auto-indexing startup check: {sync_err}")

    while True:
        try:
            # 1. Fetch active cameras and registered employees
            async with async_session() as session:
                stmt = select(Camera).where(Camera.status == CameraStatus.ACTIVE)
                res = await session.execute(stmt)
                cameras = res.scalars().all()

                emp_stmt = select(Employee).where(Employee.deleted_at == None)
                emp_res = await session.execute(emp_stmt)
                employees = emp_res.scalars().all()

            if not cameras:
                logger.debug("No active cameras found. Retrying in 10 seconds.")
                await asyncio.sleep(10)
                continue

            # Check if AWS credentials are set and not empty
            aws_key = os.getenv("AWS_ACCESS_KEY_ID")
            aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
            is_aws_configured = bool(aws_key and aws_key.strip()) and bool(aws_secret and aws_secret.strip())

            # --- MOCK SIMULATION MODE (If AWS is not configured) ---
            if not is_aws_configured:
                logger.debug(
                    "AWS credentials not configured. Running in Demo Simulation Mode."
                )

                if employees:
                    import random

                    # Generate a mock detection for a registered employee on an active camera
                    camera = random.choice(cameras)
                    employee = random.choice(employees)

                    face_id = str(uuid.uuid4())
                    db_face = Face(
                        id=face_id,
                        camera_id=camera.id,
                        person_id=employee.id,
                        confidence=random.uniform(0.91, 0.99),
                        boundingbox={
                            "top": 0.25,
                            "left": 0.35,
                            "width": 0.3,
                            "height": 0.3,
                        },
                        timestamp=datetime.utcnow(),
                    )

                    async with async_session() as session:
                        session.add(db_face)
                        # Fetch and update employee location/timestamp
                        db_emp_res = await session.execute(
                            select(Employee).where(Employee.id == employee.id)
                        )
                        db_emp = db_emp_res.scalar_one_or_none()
                        if db_emp:
                            db_emp.last_detected = datetime.utcnow()
                            db_emp.current_location = camera.name
                        await session.commit()

                    logger.info(
                        f"[Simulated] Recognized {employee.name} (ID: {employee.id}) on camera {camera.name}"
                    )

                    # Broadcast detection
                    await ws_manager.broadcast(
                        {
                            "type": "new_detection",
                            "data": {
                                "id": face_id,
                                "camera_id": camera.id,
                                "person_id": employee.id,
                                "person_name": employee.name,
                                "confidence": db_face.confidence * 100,
                                "timestamp": db_face.timestamp.isoformat(),
                                "image_url": employee.photo_url,
                                "location": camera.name,
                            },
                        }
                    )
                else:
                    logger.debug(
                        "No employees registered yet. Skip simulated detection."
                    )

                # Wait 15 seconds before generating next simulation
                await asyncio.sleep(15)
                continue

            # --- REAL-TIME ACTIVE PROCESSING MODE (AWS Configured) ---
            for camera in cameras:
                try:
                    logger.debug(f"Grabbing frame from camera: {camera.name}")
                    
                    # Run the blocking OpenCV stream opening and frame reading in a background thread executor
                    # to prevent blocking the main asyncio event loop (which causes login/HTTP requests to freeze).
                    loop = asyncio.get_running_loop()
                    ret, frame = await loop.run_in_executor(
                        None, _open_and_read_frame, camera.id, camera.stream_url
                    )

                    if not ret or frame is None:
                        logger.warning(
                            f"Could not read frame from camera: {camera.name}"
                        )
                        continue

                    # Check for camera obstruction (tampering)
                    try:
                        # Analyze only the center 50% region to avoid watermarks/timestamps at the edges
                        h, w = frame.shape[:2]
                        cy, cx = h // 2, w // 2
                        dy, dx = h // 4, w // 4
                        center_crop = frame[cy-dy:cy+dy, cx-dx:cx+dx]

                        gray = cv2.cvtColor(center_crop, cv2.COLOR_BGR2GRAY)
                        mean_val, std_val = cv2.meanStdDev(gray)
                        mean = mean_val[0][0]
                        std_dev = std_val[0][0]

                        # Obstructed if center region is too dark (mean < 20.0) or too flat/uniform (std_dev < 15.0)
                        is_obstructed = (mean < 20.0) or (std_dev < 15.0)

                        if is_obstructed:
                            obstructed_counts[camera.id] = obstructed_counts.get(camera.id, 0) + 1
                            logger.warning(
                                f"Camera {camera.name} is possibly obstructed (Mean={mean:.2f}, StdDev={std_dev:.2f}). Count={obstructed_counts[camera.id]}"
                            )

                            # Trigger alert if consecutive count reaches 3 (approx 9 seconds of solid blockage)
                            if obstructed_counts[camera.id] >= 3:
                                now = datetime.utcnow()
                                last_sent = last_alert_sent.get(camera.id)
                                if not last_sent or (now - last_sent).total_seconds() > 60.0:
                                    last_alert_sent[camera.id] = now

                                    # Create critical suspicious activity alert
                                    alert_id = str(uuid.uuid4())
                                    db_alert = Alert(
                                        id=alert_id,
                                        type=AlertType.SUSPICIOUS_ACTIVITY,
                                        severity=AlertSeverity.CRITICAL,
                                        title="Camera Obstructed / Tampering Detected",
                                        description=f"Camera {camera.name} is obstructed or covered (feed signal is too dark or flat).",
                                        camera_id=camera.id,
                                        person_id=None,
                                        face_id=None,
                                        acknowledged=False,
                                    )

                                    async with async_session() as session:
                                        session.add(db_alert)
                                        await session.commit()

                                    # Broadcast alert via WebSocket
                                    await ws_manager.broadcast({
                                        "type": "new_alert",
                                        "data": {
                                            "id": alert_id,
                                            "type": db_alert.type.value,
                                            "title": db_alert.title,
                                            "description": db_alert.description,
                                            "camera_id": camera.id,
                                            "severity": "critical",
                                            "created_at": now.isoformat(),
                                        }
                                    })
                                    logger.error(f"CRITICAL: Camera {camera.name} is obstructed! Raised Alert {alert_id}")

                                    # Encode current frame to attach as proof
                                    resized = cv2.resize(frame, (640, 480))
                                    _, buffer = cv2.imencode(".jpg", resized)
                                    obstruction_image_bytes = buffer.tobytes()

                                    # Send WhatsApp notification (non-blocking)
                                    _safe_create_task(waha_service.send_alert_notification(
                                        alert_id=alert_id,
                                        alert_title=db_alert.title,
                                        alert_description=db_alert.description,
                                        severity="critical",
                                        alert_type="suspicious_activity",
                                        camera_name=camera.name,
                                        timestamp=now,
                                        face_image_bytes=obstruction_image_bytes,
                                    ), name=f"waha_obstruction_{alert_id[:8]}")
                        else:
                            # Reset count if it is clear
                            if obstructed_counts.get(camera.id, 0) > 0:
                                logger.info(f"Camera {camera.name} obstruction cleared.")
                            obstructed_counts[camera.id] = 0
                    except Exception as tamper_err:
                        logger.error(f"Error checking camera tampering for {camera.name}: {tamper_err}")

                    # --- DIRECT AWS REKOGNITION FACE DETECTION & RECOGNITION ---
                    # Encode current frame as JPEG bytes
                    _, frame_buffer = cv2.imencode(".jpg", frame)
                    frame_bytes = frame_buffer.tobytes()

                    collection_id = os.getenv("REKOGNITION_EMPLOYEES_COLLECTION", "employees")
                    try:
                        # Search face in Rekognition collection directly from the full frame
                        search_result = await rekognition_service.search_faces_by_image(
                            collection_id=collection_id,
                            image_bytes=frame_bytes,
                            threshold=settings.face_match_threshold,
                        )
                        
                        matches = search_result.get('matches', [])
                        searched_face_box_relative = search_result.get('searched_face_bounding_box', {})
                        
                        # Crop the face using the bounding box returned by Rekognition
                        crop_bytes, bounding_box = _crop_face_from_frame(frame, searched_face_box_relative)
                        if crop_bytes is None:
                            crop_bytes = frame_bytes

                        active_employee = None
                        active_employee_match = None
                        matched_face_details = None

                        if matches:
                            async with async_session() as session:
                                for match in matches:
                                    face_details = match.get("Face", {})
                                    external_id = face_details.get("ExternalImageId")
                                    
                                    emp_stmt = select(Employee).where(
                                        Employee.id == external_id,
                                        Employee.deleted_at == None,
                                    )
                                    emp_res = await session.execute(emp_stmt)
                                    emp = emp_res.scalar_one_or_none()
                                    
                                    if emp:
                                        active_employee_match = match
                                        active_employee = emp
                                        matched_face_details = face_details
                                        break

                        if active_employee_match and active_employee:
                            similarity = active_employee_match.get("Similarity", 0.0)
                            face_match_id = matched_face_details.get("FaceId")

                            logger.info(f"AWS Match Found! ID: {active_employee.id} ({active_employee.name}), Similarity: {similarity}%")

                            async with async_session() as session:
                                session.add(active_employee)
                                
                                face_id = str(uuid.uuid4())
                                db_face = Face(
                                    id=face_id,
                                    camera_id=camera.id,
                                    person_id=active_employee.id,
                                    confidence=similarity / 100.0,
                                    face_match=face_match_id,
                                    boundingbox=bounding_box,
                                    timestamp=datetime.utcnow(),
                                    image_data=crop_bytes,
                                )
                                session.add(db_face)

                                active_employee.last_detected = datetime.utcnow()
                                active_employee.current_location = camera.name
                                await session.commit()

                                # Update overlay cache
                                from app.services.rtsp_service import RTSPService
                                if camera.id not in RTSPService.last_detections:
                                    RTSPService.last_detections[camera.id] = []
                                
                                now = datetime.utcnow()
                                RTSPService.last_detections[camera.id] = [
                                    d for d in RTSPService.last_detections[camera.id]
                                    if (now - d["timestamp"]).total_seconds() < 5.0
                                ]
                                RTSPService.last_detections[camera.id].append({
                                    "name": active_employee.name,
                                    "box": bounding_box,
                                    "timestamp": now
                                })

                                # Broadcast new detection
                                await ws_manager.broadcast({
                                    "type": "new_detection",
                                    "data": {
                                        "id": face_id,
                                        "camera_id": camera.id,
                                        "person_id": active_employee.id,
                                        "person_name": active_employee.name,
                                        "confidence": similarity,
                                        "timestamp": db_face.timestamp.isoformat(),
                                        "image_url": f"/api/detections/{face_id}/image",
                                        "location": camera.name,
                                    },
                                })

                                # Alerts
                                last_emp_alert = last_employee_alert_sent.get((camera.id, active_employee.id))
                                if not last_emp_alert or (now - last_emp_alert).total_seconds() > 300.0:
                                    last_employee_alert_sent[(camera.id, active_employee.id)] = now
                                    match_alert_id = str(uuid.uuid4())
                                    _safe_create_task(waha_service.send_alert_notification(
                                        alert_id=match_alert_id,
                                        alert_title=f"Employee Detected: {active_employee.name}",
                                        alert_description=f"{active_employee.name} was detected on camera {camera.name} with {similarity:.1f}% confidence.",
                                        severity="low",
                                        alert_type="match",
                                        camera_name=camera.name,
                                        timestamp=db_face.timestamp,
                                        face_image_bytes=crop_bytes,
                                    ), name=f"waha_match_{match_alert_id[:8]}")
                        else:
                            # Found face but no match -> Unknown Face
                            # Use detect_faces to find ALL faces in the frame.
                            logger.info("Unknown face(s) detected! Scanning for all faces in frame.")

                            faces_found = []
                            try:
                                faces_found = await rekognition_service.detect_faces(frame_bytes)
                            except Exception as detect_err:
                                logger.error(f"Error detecting faces for multi-person scan: {detect_err}")

                            if not faces_found:
                                faces_found = [{"Confidence": 90.0, "BoundingBox": {"Top": 0.2, "Left": 0.3, "Width": 0.4, "Height": 0.4}}]

                            logger.info(f"Found {len(faces_found)} face(s) in frame from camera {camera.name}")

                            for face_detail in faces_found:
                                confidence = face_detail.get("Confidence", 90.0)
                                box = face_detail.get("BoundingBox", {})

                                crop_bytes, bounding_box = _crop_face_from_frame(frame, box)
                                if crop_bytes is None:
                                    crop_bytes = frame_bytes

                                face_id = str(uuid.uuid4())
                                db_face = Face(
                                    id=face_id,
                                    camera_id=camera.id,
                                    person_id=None,
                                    confidence=confidence / 100.0,
                                    boundingbox=bounding_box,
                                    timestamp=datetime.utcnow(),
                                    image_data=crop_bytes,
                                )

                                alert_id = str(uuid.uuid4())
                                db_alert = Alert(
                                    id=alert_id,
                                    type=AlertType.UNKNOWN_FACE,
                                    severity=AlertSeverity.CRITICAL,
                                    title="Unrecognized Subject Detected",
                                    description=f"An unrecognized individual was detected on camera {camera.name}.",
                                    camera_id=camera.id,
                                    face_id=face_id,
                                    acknowledged=False,
                                )

                                async with async_session() as session:
                                    session.add(db_face)
                                    await session.flush()
                                    session.add(db_alert)
                                    await session.commit()

                                    from app.services.rtsp_service import RTSPService
                                    if camera.id not in RTSPService.last_detections:
                                        RTSPService.last_detections[camera.id] = []

                                    now = datetime.utcnow()
                                    RTSPService.last_detections[camera.id] = [
                                        d for d in RTSPService.last_detections[camera.id]
                                        if (now - d["timestamp"]).total_seconds() < 5.0
                                    ]
                                    RTSPService.last_detections[camera.id].append({
                                        "name": "Unknown Subject",
                                        "box": bounding_box,
                                        "timestamp": now
                                    })

                                # Broadcast detection
                                await ws_manager.broadcast({
                                    "type": "new_detection",
                                    "data": {
                                        "id": face_id,
                                        "camera_id": camera.id,
                                        "person_id": None,
                                        "person_name": "Unknown Subject",
                                        "confidence": confidence,
                                        "timestamp": db_face.timestamp.isoformat(),
                                        "image_url": f"/api/detections/{face_id}/image",
                                        "location": camera.name,
                                    },
                                })

                                # Broadcast alert
                                await ws_manager.broadcast({
                                    "type": "new_alert",
                                    "data": {
                                        "id": alert_id,
                                        "type": db_alert.type.value,
                                        "title": db_alert.title,
                                        "description": db_alert.description,
                                        "camera_id": camera.id,
                                        "severity": "critical",
                                        "created_at": now.isoformat(),
                                    },
                                })

                                # Send WhatsApp notification (non-blocking)
                                _safe_create_task(waha_service.send_alert_notification(
                                    alert_id=alert_id,
                                    alert_title=db_alert.title,
                                    alert_description=db_alert.description,
                                    severity="critical",
                                    alert_type="unknown_face",
                                    camera_name=camera.name,
                                    timestamp=db_face.timestamp,
                                    face_image_bytes=crop_bytes,
                                ), name=f"waha_unknown_{alert_id[:8]}")

                    except NoFacesException:
                        logger.debug(f"No faces detected on camera {camera.name}")
                    except Exception as aws_err:
                        logger.error(f"Error calling AWS for camera {camera.name}: {aws_err}")

                except Exception as cam_err:
                    logger.error(f"Error processing camera {camera.name}: {cam_err}")

            # Wait 3 seconds before next camera stream checking cycle
            await asyncio.sleep(3)

        except Exception as e:
            logger.error(f"Error in background face processor: {e}")
            await asyncio.sleep(10)

