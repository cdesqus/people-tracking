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
from app.models.alert import Alert
import uuid
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
                                
                                # Draw polygon and bounding boxes for the alert image
                                box_annotator = sv.BoxAnnotator(thickness=2)
                                frame = box_annotator.annotate(scene=frame, detections=detections)
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
                                                type="suspicious_activity",
                                                severity="critical",
                                                title="Intrusion Detected",
                                                description="An object or person was detected entering a restricted zone.",
                                                camera_id=cam_id,
                                                image_data=img_bytes,
                                                acknowledged=False
                                            )
                                            session.add(new_alert)
                                            await session.commit()
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
                                        alert_type="suspicious_activity",
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
