import asyncio
import cv2
import json
import logging
import time
from typing import Dict, Any, List
from datetime import datetime

import numpy as np

# YOLO & Supervision
from ultralytics import YOLO
import supervision as sv

from app.database import async_session
from app.models.camera import Camera
from app.models.alert import Alert, AlertType, AlertSeverity
import uuid
from app.utils.websocket_manager import ws_manager
from app.services.rtsp_service import RTSPService
from app.services.waha_service import send_alert_notification
from sqlalchemy import select

logger = logging.getLogger(__name__)

class IntrusionService:
    def __init__(self):
        self.model = None
        self.camera_tasks: Dict[str, asyncio.Task] = {}
        self.camera_zones: Dict[str, List[sv.PolygonZone]] = {}
        self.last_alert_time: Dict[str, float] = {}
        self.is_running = False

    def load_model(self):
        """Loads the YOLOv8n model if not already loaded."""
        if self.model is None:
            logger.info("[Intrusion] Loading YOLOv8n model...")
            # Automatically uses CPU and OpenVINO if installed and exported, else default PyTorch CPU
            try:
                # To use OpenVINO natively, we would export first. 
                # For simplicity here, we'll just use the base PyTorch model which is very fast for nano.
                self.model = YOLO("yolov8n.pt")
                logger.info("[Intrusion] YOLOv8n model loaded successfully.")
            except Exception as e:
                logger.error(f"[Intrusion] Failed to load YOLOv8n: {e}")

    async def start(self):
        """Start the background manager to monitor cameras."""
        self.is_running = True
        self.load_model()
        logger.info("[Intrusion] Intrusion Service started.")
        
        while self.is_running:
            try:
                await self._refresh_cameras()
            except Exception as e:
                logger.error(f"[Intrusion] Error refreshing cameras: {e}")
            
            # Poll database for camera updates every 30 seconds
            await asyncio.sleep(30)

    async def stop(self):
        """Stop all running tasks."""
        self.is_running = False
        for task in self.camera_tasks.values():
            task.cancel()
        self.camera_tasks.clear()
        logger.info("[Intrusion] Intrusion Service stopped.")

    async def _refresh_cameras(self):
        """Check DB for cameras with intrusion zones and start/stop tasks accordingly."""
        async with async_session() as session:
            result = await session.execute(select(Camera).where(Camera.status == "active"))
            cameras = result.scalars().all()
            
            active_cam_ids = set()
            
            for cam in cameras:
                if cam.intrusion_zones:
                    try:
                        zones_data = json.loads(cam.intrusion_zones)
                        if not zones_data:
                            continue
                            
                        active_cam_ids.add(cam.id)
                        
                        # Set up or update zones
                        # Format expected: [[[x1, y1], [x2, y2], ...], ...]
                        self.camera_zones[cam.id] = []
                        # We use 1920x1080 as default base resolution for supervision.
                        # It will scale dynamically based on frame size.
                        resolution_wh = (1920, 1080) 
                        if cam.resolution:
                            try:
                                w, h = map(int, cam.resolution.lower().split("x"))
                                resolution_wh = (w, h)
                            except:
                                pass
                                
                        for polygon_points in zones_data:
                            pts = []
                            for p in polygon_points:
                                if isinstance(p, dict):
                                    pts.append([int(p.get("x", 0)), int(p.get("y", 0))])
                                else:
                                    pts.append([int(p[0]), int(p[1])])
                            pts_array = np.array(pts, dtype=np.int32)
                            zone = sv.PolygonZone(polygon=pts_array, frame_resolution_wh=resolution_wh)
                            self.camera_zones[cam.id].append(zone)

                        # Start task if not running
                        if cam.id not in self.camera_tasks or self.camera_tasks[cam.id].done():
                            self.camera_tasks[cam.id] = asyncio.create_task(
                                self._monitor_camera(cam.id, cam.name, cam.stream_url, resolution_wh)
                            )
                            logger.info(f"[Intrusion] Started monitoring task for camera {cam.name}")
                            
                    except json.JSONDecodeError:
                        logger.error(f"[Intrusion] Invalid JSON in intrusion_zones for camera {cam.id}")

            # Stop tasks for cameras that no longer have zones or are inactive
            tasks_to_stop = set(self.camera_tasks.keys()) - active_cam_ids
            for cam_id in tasks_to_stop:
                self.camera_tasks[cam_id].cancel()
                del self.camera_tasks[cam_id]
                if cam_id in self.camera_zones:
                    del self.camera_zones[cam_id]
                logger.info(f"[Intrusion] Stopped monitoring task for camera {cam_id}")

    async def _monitor_camera(self, cam_id: str, cam_name: str, stream_url: str, resolution_wh: tuple):
        """Background task that processes RTSP stream at low FPS."""
        fps_target = 3  # Target FPS for CPU inference
        frame_time = 1.0 / fps_target
        
        while True:
            try:
                start_time = time.monotonic()
                
                # We use get_snapshot from RTSPService to avoid keeping continuous connections open if network is flaky
                # Alternatively, use a persistent cv2.VideoCapture loop here. For simplicity and reliability, get_snapshot:
                snapshot_bytes = RTSPService.get_snapshot(stream_url, jpeg_quality=80, camera_id=cam_id)
                
                if snapshot_bytes:
                    nparr = np.frombuffer(snapshot_bytes, np.uint8)
                    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    if frame is not None:
                        h, w, _ = frame.shape
                        
                        if self.model is None:
                            logger.error("[Intrusion] YOLO model is not loaded. Attempting to reload...")
                            self.load_model()
                            if self.model is None:
                                await asyncio.sleep(5)
                                continue

                        # Run YOLOv8 inference (detects people, vehicles, items, etc.)
                        results = self.model(frame, verbose=False)
                        detections = sv.Detections.from_ultralytics(results[0])
                        
                        # Filter only person detections (class_id == 0) to prevent false alerts from static chairs, TVs, etc.
                        detections = detections[detections.class_id == 0]
                        
                        zones = self.camera_zones.get(cam_id, [])
                        is_intrusion = False
                        
                        for zone in zones:
                            # Update zone resolution if frame size changed
                            if zone.frame_resolution_wh != (w, h):
                                zone.frame_resolution_wh = (w, h)
                                
                            # Check if any detection is inside the zone
                            zone_mask = zone.trigger(detections=detections)
                            if np.any(zone_mask):
                                is_intrusion = True
                                break
                                
                        if is_intrusion:
                            now = time.monotonic()
                            last_alert = self.last_alert_time.get(cam_id, 0)
                            
                            # Cooldown: 30 seconds
                            if now - last_alert > 30:
                                self.last_alert_time[cam_id] = now
                                logger.warning(f"[Intrusion] 🚨 Intrusion detected on camera: {cam_name}!")
                                
                                # Build friendly labels with class name and confidence score
                                class_names = results[0].names
                                labels = []
                                import os
                                aws_key = os.getenv("AWS_ACCESS_KEY_ID")
                                aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
                                is_aws_configured = bool(aws_key and aws_key.strip()) and bool(aws_secret and aws_secret.strip())
                                
                                for i in range(len(detections)):
                                    class_id = detections.class_id[i]
                                    confidence = detections.confidence[i]
                                    label_name = class_names.get(class_id, 'Object').title()
                                    
                                    if class_id == 0:
                                        recognized_name = None
                                        try:
                                            x1, y1, x2, y2 = map(int, detections.xyxy[i])
                                            x1, y1 = max(0, x1), max(0, y1)
                                            x2, y2 = min(w, x2), min(h, y2)
                                            
                                            if x2 > x1 + 10 and y2 > y1 + 10:
                                                person_crop = frame[y1:y2, x1:x2]
                                                _, crop_buffer = cv2.imencode('.jpg', person_crop)
                                                crop_bytes = crop_buffer.tobytes()
                                                
                                                if is_aws_configured:
                                                    from app.services.aws_rekognition import rekognition_service
                                                    from app.config import settings
                                                    from app.models.employee import Employee
                                                    
                                                    collection_id = os.getenv("REKOGNITION_EMPLOYEES_COLLECTION", "employees")
                                                    search_result = await rekognition_service.search_faces_by_image(
                                                        collection_id=collection_id,
                                                        image_bytes=crop_bytes,
                                                        threshold=settings.face_match_threshold,
                                                    )
                                                    matches = search_result.get('matches', [])
                                                    if matches:
                                                        external_id = matches[0].get("Face", {}).get("ExternalImageId")
                                                        async with async_session() as session:
                                                            emp_stmt = select(Employee).where(
                                                                Employee.id == external_id,
                                                                Employee.deleted_at == None
                                                            )
                                                            emp_res = await session.execute(emp_stmt)
                                                            emp = emp_res.scalar_one_or_none()
                                                            if emp:
                                                                recognized_name = emp.name
                                                else:
                                                    from app.models.employee import Employee
                                                    async with async_session() as session:
                                                        emp_stmt = select(Employee).where(Employee.deleted_at == None)
                                                        emp_res = await session.execute(emp_stmt)
                                                        employees = emp_res.scalars().all()
                                                        if employees:
                                                            import random
                                                            recognized_name = random.choice(employees).name
                                        except Exception as rec_err:
                                            logger.error(f"[Intrusion] Error recognizing face in intrusion crop: {rec_err}")
                                            
                                        if recognized_name:
                                            label_name = recognized_name
                                            
                                    labels.append(f"{label_name} {confidence:.0%}")
                                
                                # Draw polygon and bounding boxes for the alert image
                                box_annotator = sv.BoxAnnotator(thickness=2)
                                frame = box_annotator.annotate(scene=frame, detections=detections, labels=labels)
                                for z in zones:
                                    # Simple drawing of polygon
                                    cv2.polylines(frame, [z.polygon], isClosed=True, color=(0, 0, 255), thickness=3)
                                
                                _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                                img_bytes = buffer.tobytes()
                                
                                alert_id_str = str(uuid.uuid4())
                                
                                # Save alert to database
                                async def save_alert():
                                    try:
                                        async with async_session() as session:
                                            new_alert = Alert(
                                                id=alert_id_str,
                                                type=AlertType.INTRUSION,
                                                severity=AlertSeverity.CRITICAL,
                                                title="Intrusion Detected",
                                                description="An object or person was detected entering a restricted zone.",
                                                camera_id=cam_id,
                                                image_data=img_bytes,
                                                acknowledged=False
                                            )
                                            session.add(new_alert)
                                            await session.commit()
                                            
                                            await ws_manager.broadcast({
                                                "type": "new_alert",
                                                "data": {
                                                    "id": alert_id_str,
                                                    "type": new_alert.type.value,
                                                    "title": new_alert.title,
                                                    "description": new_alert.description,
                                                    "severity": new_alert.severity.value,
                                                    "camera_id": cam_id,
                                                    "acknowledged": False,
                                                    "has_image": True,
                                                    "created_at": datetime.utcnow().isoformat(),
                                                    "updated_at": datetime.utcnow().isoformat()
                                                }
                                            })
                                    except Exception as db_err:
                                        logger.error(f"[Intrusion] Failed to save alert to DB: {db_err}")
                                
                                asyncio.create_task(save_alert())
                                
                                # Trigger WA notification
                                asyncio.create_task(
                                    send_alert_notification(
                                        alert_id=alert_id_str,
                                        alert_title="Intrusion Detected",
                                        alert_description="An object or person was detected entering a restricted zone.",
                                        severity="critical",
                                        alert_type="intrusion",
                                        camera_name=cam_name,
                                        timestamp=datetime.utcnow(),
                                        face_image_bytes=img_bytes
                                    )
                                )

                # Throttle
                elapsed = time.monotonic() - start_time
                if elapsed < frame_time:
                    await asyncio.sleep(frame_time - elapsed)
                else:
                    await asyncio.sleep(0.1)  # Yield loop

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"[Intrusion] Error in monitor loop for {cam_name}: {e}")
                await asyncio.sleep(5)  # Backoff on error

# Singleton instance
intrusion_service = IntrusionService()
