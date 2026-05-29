import asyncio
import cv2
import logging
import os
import uuid
from datetime import datetime
from sqlalchemy import select
from app.database import async_session
from app.models.camera import Camera, CameraStatus
from app.models.employee import Employee
from app.models.face import Face
from app.models.alert import Alert, AlertSeverity, AlertType
from app.services.aws_rekognition import rekognition_service
from app.utils.websocket_manager import ws_manager

logger = logging.getLogger(__name__)


async def start_face_processor():
    """Background loop that processes active camera streams and performs face recognition"""
    logger.info("Initializing background face processor loop...")

    # Wait a few seconds for database and services to settle
    await asyncio.sleep(5)

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

            # --- MOCK SIMULATION MODE (If AWS is not configured or no employees registered) ---
            if not is_aws_configured or not employees:
                if not is_aws_configured:
                    logger.debug(
                        "AWS credentials not configured. Running in Demo Simulation Mode."
                    )
                else:
                    logger.debug(
                        "No employees registered. Running in Demo Simulation Mode."
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
                    cap = cv2.VideoCapture(camera.stream_url)

                    # Set standard timeout parameters if available in build
                    try:
                        cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSECS, 3000)
                        cap.set(cv2.CAP_PROP_READ_TIMEOUT_MSECS, 3000)
                    except Exception:
                        pass

                    if not cap.isOpened():
                        logger.error(
                            f"Could not open stream for camera: {camera.name}"
                        )
                        cap.release()
                        continue

                    ret, frame = cap.read()
                    cap.release()

                    if not ret or frame is None:
                        logger.warning(
                            f"Could not read frame from camera: {camera.name}"
                        )
                        continue

                    # Resize to keep bandwidth minimal and match AWS standard
                    resized = cv2.resize(frame, (640, 480))
                    _, buffer = cv2.imencode(".jpg", resized)
                    frame_bytes = buffer.tobytes()

                    # Search face in Rekognition collection
                    collection_id = os.getenv(
                        "REKOGNITION_EMPLOYEES_COLLECTION", "employees"
                    )
                    logger.debug(
                        f"Searching face in AWS Rekognition collection: {collection_id}"
                    )
                    matches = await rekognition_service.search_faces_by_image(
                        collection_id=collection_id,
                        image_bytes=frame_bytes,
                        threshold=0.6,
                    )

                    if matches:
                        for match in matches:
                            similarity = match.get("Similarity", 0.0)
                            face_details = match.get("Face", {})
                            external_id = face_details.get("ExternalImageId")
                            face_match_id = face_details.get("FaceId")

                            logger.info(
                                f"AWS Match Found! ID: {external_id}, Similarity: {similarity}%"
                            )

                            async with async_session() as session:
                                # Retrieve employee
                                emp_stmt = select(Employee).where(
                                    Employee.id == external_id,
                                    Employee.deleted_at == None,
                                )
                                emp_res = await session.execute(emp_stmt)
                                employee = emp_res.scalar_one_or_none()

                                if employee:
                                    face_id = str(uuid.uuid4())
                                    db_face = Face(
                                        id=face_id,
                                        camera_id=camera.id,
                                        person_id=employee.id,
                                        confidence=similarity / 100.0,
                                        face_match=face_match_id,
                                        boundingbox={
                                            "top": 0.2,
                                            "left": 0.3,
                                            "width": 0.4,
                                            "height": 0.4,
                                        },
                                        timestamp=datetime.utcnow(),
                                    )
                                    session.add(db_face)

                                    # Update employee last seen
                                    employee.last_detected = datetime.utcnow()
                                    employee.current_location = camera.name

                                    await session.commit()

                                    # Broadcast new detection
                                    await ws_manager.broadcast(
                                        {
                                            "type": "new_detection",
                                            "data": {
                                                "id": face_id,
                                                "camera_id": camera.id,
                                                "person_id": employee.id,
                                                "person_name": employee.name,
                                                "confidence": similarity,
                                                "timestamp": db_face.timestamp.isoformat(),
                                                "image_url": employee.photo_url,
                                                "location": camera.name,
                                            },
                                        }
                                    )
                    else:
                        # If no registered match, check if ANY face is present to register an alert
                        faces_found = await rekognition_service.detect_faces(
                            frame_bytes
                        )
                        if faces_found:
                            logger.info("Unknown face detected! Creating alert.")
                            confidence = faces_found[0].get("Confidence", 90.0)

                            face_id = str(uuid.uuid4())
                            db_face = Face(
                                id=face_id,
                                camera_id=camera.id,
                                person_id=None,
                                confidence=confidence / 100.0,
                                boundingbox={
                                    "top": 0.2,
                                    "left": 0.3,
                                    "width": 0.4,
                                    "height": 0.4,
                                },
                                timestamp=datetime.utcnow(),
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

                            # Broadcast detection
                            await ws_manager.broadcast(
                                {
                                    "type": "new_detection",
                                    "data": {
                                        "id": face_id,
                                        "camera_id": camera.id,
                                        "person_id": None,
                                        "person_name": "Unknown Subject",
                                        "confidence": confidence,
                                        "timestamp": db_face.timestamp.isoformat(),
                                        "image_url": None,
                                        "location": camera.name,
                                    },
                                }
                            )

                            # Broadcast alert
                            await ws_manager.broadcast(
                                {
                                    "type": "new_alert",
                                    "data": {
                                        "id": alert_id,
                                        "title": db_alert.title,
                                        "description": db_alert.description,
                                        "camera_id": camera.id,
                                        "severity": "critical",
                                        "created_at": datetime.utcnow().isoformat(),
                                    },
                                }
                            )

                except Exception as cam_err:
                    logger.error(
                        f"Error checking camera stream {camera.name}: {cam_err}"
                    )

            # Wait 3 seconds before next camera stream checking cycle
            await asyncio.sleep(3)

        except Exception as e:
            logger.error(f"Error in background face processor: {e}")
            await asyncio.sleep(10)
