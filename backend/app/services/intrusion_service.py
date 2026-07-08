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
from app.services.alert_service import create_or_update_active_alert, resolve_active_alerts
from app.services.camera_capabilities import camera_has_any_capability, normalize_ai_capabilities
from sqlalchemy import select

logger = logging.getLogger(__name__)


def _scale_polygon_to_frame(
    polygon: np.ndarray,
    source_resolution_wh: tuple[int, int],
    target_resolution_wh: tuple[int, int],
) -> np.ndarray:
    """Scale stored zone coordinates to the actual decoded frame size."""
    src_w, src_h = source_resolution_wh
    dst_w, dst_h = target_resolution_wh

    if src_w <= 0 or src_h <= 0 or dst_w <= 0 or dst_h <= 0:
        scaled = polygon.copy()
    elif (src_w, src_h) == (dst_w, dst_h):
        scaled = polygon.copy()
    else:
        scale = np.array([dst_w / src_w, dst_h / src_h], dtype=np.float32)
        scaled = np.rint(polygon.astype(np.float32) * scale).astype(np.int32)

    scaled[:, 0] = np.clip(scaled[:, 0], 0, max(dst_w - 1, 0))
    scaled[:, 1] = np.clip(scaled[:, 1], 0, max(dst_h - 1, 0))
    return scaled


class IntrusionService:
    def __init__(self):
        self.model = None
        self.camera_tasks: Dict[str, asyncio.Task] = {}
        self.camera_zones: Dict[str, List[tuple]] = {}
        self.camera_capabilities: Dict[str, dict] = {}
        self.last_alert_time: Dict[str, float] = {}
        self.zone_occupied_since: Dict[str, float] = {}
        self.door_baselines: Dict[str, np.ndarray] = {}
        self.door_open_since: Dict[str, float] = {}
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
        logger.info("[Intrusion] Intrusion Service started (YOLO lazy-load enabled).")
        
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
                    if not camera_has_any_capability(
                        cam,
                        ["unauthorized_access", "loitering", "crowd_detected", "door_left_open"],
                    ):
                        if cam.id in self.camera_tasks:
                            self.camera_tasks[cam.id].cancel()
                            del self.camera_tasks[cam.id]
                        continue
                    try:
                        zones_data = json.loads(cam.intrusion_zones)
                        if not zones_data:
                            continue
                            
                        active_cam_ids.add(cam.id)
                        self.camera_capabilities[cam.id] = normalize_ai_capabilities(cam.ai_capabilities)
                        
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
                                
                        for idx, polygon_data in enumerate(zones_data):
                            pts = []
                            zone_name = f"Zone {idx + 1}"
                            zone_type = "restricted_area"
                            enabled_rules = ["unauthorized_access"]
                            thresholds = {
                                "loitering_threshold_seconds": 60,
                                "crowd_threshold": 5,
                                "crowd_duration_seconds": 10,
                                "door_open_threshold_seconds": 60,
                                "door_change_threshold": 0.18,
                            }
                            
                            points_data = polygon_data
                            if isinstance(polygon_data, dict) and "points" in polygon_data:
                                points_data = polygon_data["points"]
                                zone_name = polygon_data.get("name", zone_name)
                                zone_type = polygon_data.get("type") or polygon_data.get("zone_type") or zone_type
                                enabled_rules = polygon_data.get("enabled_rules") or polygon_data.get("rules") or enabled_rules
                                for key in thresholds:
                                    if key in polygon_data:
                                        thresholds[key] = polygon_data[key]

                            for p in points_data:
                                if isinstance(p, dict):
                                    pts.append([int(p.get("x", 0)), int(p.get("y", 0))])
                                else:
                                    pts.append([int(p[0]), int(p[1])])
                            pts_array = np.array(pts, dtype=np.int32)
                            zone = sv.PolygonZone(polygon=pts_array, frame_resolution_wh=resolution_wh)
                            self.camera_zones[cam.id].append(
                                (zone, zone_name, zone_type, enabled_rules, thresholds, resolution_wh)
                            )

                        # Start task if not running
                        if cam.id not in self.camera_tasks or self.camera_tasks[cam.id].done():
                            analytics_stream_url = cam.sub_stream_url or cam.stream_url
                            analytics_stream_key = f"{cam.id}:sub" if cam.sub_stream_url else cam.id
                            self.camera_tasks[cam.id] = asyncio.create_task(
                                self._monitor_camera(
                                    cam.id,
                                    cam.name,
                                    analytics_stream_url,
                                    resolution_wh,
                                    analytics_stream_key,
                                )
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
                if cam_id in self.camera_capabilities:
                    del self.camera_capabilities[cam_id]
                logger.info(f"[Intrusion] Stopped monitoring task for camera {cam_id}")

    async def _monitor_camera(self, cam_id: str, cam_name: str, stream_url: str, resolution_wh: tuple, stream_key: str):
        """Background task that processes RTSP stream at low FPS."""
        fps_target = 3  # Target FPS for CPU inference
        frame_time = 1.0 / fps_target
        
        while True:
            try:
                start_time = time.monotonic()
                
                # We use get_snapshot from RTSPService to avoid keeping continuous connections open if network is flaky
                # Alternatively, use a persistent cv2.VideoCapture loop here. For simplicity and reliability, get_snapshot:
                snapshot_bytes = RTSPService.get_snapshot(stream_url, jpeg_quality=80, camera_id=stream_key)
                
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
                        triggered_events = []
                        active_zone_keys = set()

                        for idx, (
                            zone,
                            zone_name,
                            zone_type,
                            enabled_rules,
                            thresholds,
                            zone_resolution_wh,
                        ) in enumerate(zones):
                            scaled_polygon = _scale_polygon_to_frame(
                                zone.polygon,
                                zone_resolution_wh,
                                (w, h),
                            )
                            runtime_zone = sv.PolygonZone(
                                polygon=scaled_polygon,
                                frame_resolution_wh=(w, h),
                            )
                            
                            # Check if any detection is inside the zone
                            zone_mask = runtime_zone.trigger(detections=detections)
                            person_count = int(np.sum(zone_mask)) if len(zone_mask) else 0
                            zone_key = f"{cam_id}:{idx}:{zone_name}"
                            caps = self.camera_capabilities.get(cam_id, {})
                            rules = set(enabled_rules or [])
                            if zone_type == "restricted_area":
                                rules.add("unauthorized_access")
                            if zone_type == "loitering_area":
                                rules.add("loitering")
                            if zone_type == "crowd_area":
                                rules.add("crowd_detected")
                            if zone_type == "door_area":
                                rules.add("door_left_open")
                            rules = {rule for rule in rules if caps.get(rule, False)}

                            if person_count > 0:
                                active_zone_keys.add(zone_key)
                                if "unauthorized_access" in rules or "intrusion" in rules:
                                    triggered_events.append({
                                        "type": AlertType.UNAUTHORIZED_ACCESS,
                                        "title": "Unauthorized Area Access",
                                        "description": f"Person detected entering restricted zone {zone_name}.",
                                        "dedupe_key": f"unauthorized:{zone_name}",
                                        "zone_name": zone_name,
                                        "person_count": person_count,
                                    })

                                if "loitering" in rules:
                                    started = self.zone_occupied_since.setdefault(zone_key, time.monotonic())
                                    duration = time.monotonic() - started
                                    threshold = float(thresholds.get("loitering_threshold_seconds", 60))
                                    if duration >= threshold:
                                        triggered_events.append({
                                            "type": AlertType.LOITERING,
                                            "title": "Loitering Detected",
                                            "description": f"Person stayed in {zone_name} for {int(duration)} seconds.",
                                            "dedupe_key": f"loitering:{zone_name}",
                                            "zone_name": zone_name,
                                            "person_count": person_count,
                                            "duration_seconds": int(duration),
                                            "threshold_seconds": threshold,
                                        })
                            else:
                                self.zone_occupied_since.pop(zone_key, None)

                            if "crowd_detected" in rules or "crowd_detection" in rules:
                                threshold = int(thresholds.get("crowd_threshold", 5))
                                if person_count >= threshold:
                                    started = self.zone_occupied_since.setdefault(f"{zone_key}:crowd", time.monotonic())
                                    duration = time.monotonic() - started
                                    min_duration = float(thresholds.get("crowd_duration_seconds", 10))
                                    if duration >= min_duration:
                                        triggered_events.append({
                                            "type": AlertType.CROWD_DETECTED,
                                            "title": "Crowd Detected",
                                            "description": f"{person_count} people detected in {zone_name}.",
                                            "dedupe_key": f"crowd:{zone_name}",
                                            "zone_name": zone_name,
                                            "person_count": person_count,
                                            "threshold": threshold,
                                        })
                                else:
                                    self.zone_occupied_since.pop(f"{zone_key}:crowd", None)

                            if "door_left_open" in rules:
                                mask = np.zeros((h, w), dtype=np.uint8)
                                cv2.fillPoly(mask, [scaled_polygon], 255)
                                x, y, bw, bh = cv2.boundingRect(scaled_polygon)
                                x1 = max(0, x)
                                y1 = max(0, y)
                                x2 = min(w, x + bw)
                                y2 = min(h, y + bh)
                                if x2 - x1 > 8 and y2 - y1 > 8:
                                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                                    crop = gray[y1:y2, x1:x2]
                                    crop_mask = mask[y1:y2, x1:x2]
                                    if crop.size == 0 or crop_mask.size == 0:
                                        continue
                                    masked_crop = cv2.bitwise_and(crop, crop, mask=crop_mask)
                                    if masked_crop.size == 0:
                                        continue
                                    normalized = cv2.resize(masked_crop, (96, 96))
                                    baseline_key = f"{zone_key}:door"
                                    if baseline_key not in self.door_baselines:
                                        self.door_baselines[baseline_key] = normalized
                                    diff = cv2.absdiff(normalized, self.door_baselines[baseline_key])
                                    change_ratio = float(np.count_nonzero(diff > 35) / diff.size)
                                    change_threshold = float(thresholds.get("door_change_threshold", 0.18))
                                    if change_ratio >= change_threshold:
                                        started = self.door_open_since.setdefault(baseline_key, time.monotonic())
                                        duration = time.monotonic() - started
                                        threshold = float(thresholds.get("door_open_threshold_seconds", 60))
                                        if duration >= threshold:
                                            triggered_events.append({
                                                "type": AlertType.DOOR_LEFT_OPEN,
                                                "title": "Door Left Open",
                                                "description": f"Door area {zone_name} appears open for {int(duration)} seconds.",
                                                "dedupe_key": f"door:{zone_name}",
                                                "zone_name": zone_name,
                                                "duration_seconds": int(duration),
                                                "threshold_seconds": threshold,
                                                "change_ratio": round(change_ratio, 4),
                                            })
                                    else:
                                        self.door_open_since.pop(baseline_key, None)
                                
                        # Populate YOLO detections for Live View
                        yolo_objects = []
                        class_names = results[0].names
                        
                        # Try to match YOLO persons with face processor detections
                        current_faces = RTSPService.last_detections.get(cam_id, [])
                        active_faces = [
                            f for f in current_faces 
                            if (time.time() - f["timestamp"].timestamp()) < 4.0
                        ]
                        
                        for i in range(len(detections)):
                            x1, y1, x2, y2 = map(int, detections.xyxy[i])
                            class_id = int(detections.class_id[i])
                            class_name = class_names.get(class_id, 'object').lower()
                            label_name = class_name
                            
                            # If person, check if any face is inside this bounding box
                            if class_name == 'person':
                                for face in active_faces:
                                    face_box = face["box"]
                                    fx = face_box.get("left", 0) * w
                                    fy = face_box.get("top", 0) * h
                                    fw = face_box.get("width", 0) * w
                                    fh = face_box.get("height", 0) * h
                                    # Face center
                                    fcx = fx + fw / 2
                                    fcy = fy + fh / 2
                                    
                                    # Is face center inside person box?
                                    if x1 <= fcx <= x2 and y1 <= fcy <= y2:
                                        if face["name"] != "Unknown Subject":
                                            label_name = face["name"].upper()
                                        break
                                        
                            yolo_objects.append({
                                "name": label_name,
                                "box": {
                                    "left": x1 / w,
                                    "top": y1 / h,
                                    "width": (x2 - x1) / w,
                                    "height": (y2 - y1) / h
                                },
                                "timestamp": datetime.utcnow()
                            })
                            
                        RTSPService.last_yolo_detections[cam_id] = yolo_objects
                        
                        if triggered_events:
                            now = time.monotonic()
                            last_alert = self.last_alert_time.get(cam_id, 0)
                            
                            # Cooldown: 30 seconds
                            if now - last_alert > 30:
                                self.last_alert_time[cam_id] = now
                                logger.warning(f"[Intrusion] 🚨 Intrusion detected on camera: {cam_name}!")
                                
                                # Build friendly labels with class name and confidence score
                                class_names = results[0].names
                                labels = []
                                for i in range(len(detections)):
                                    # Only use detections in the zone for the alert image
                                    x1, y1, x2, y2 = map(int, detections.xyxy[i])
                                    class_id = int(detections.class_id[i])
                                    confidence = float(detections.confidence[i])
                                    
                                    # Use the matched name from yolo_objects if available
                                    label_name = yolo_objects[i]["name"] if i < len(yolo_objects) else class_names.get(class_id, 'Object').title()
                                    labels.append(f"{label_name} {confidence:.0%}")
                            
                                # Draw polygon and bounding boxes for the alert image
                                box_annotator = sv.BoxAnnotator(thickness=2)
                                frame = box_annotator.annotate(scene=frame, detections=detections, labels=labels)
                                for z, z_name, _zt, _rules, _thresholds, z_resolution_wh in zones:
                                    scaled_polygon = _scale_polygon_to_frame(
                                        z.polygon,
                                        z_resolution_wh,
                                        (w, h),
                                    )
                                    # Simple drawing of polygon
                                    cv2.polylines(frame, [scaled_polygon], isClosed=True, color=(0, 0, 255), thickness=3)
                                    # Optional: Draw zone name
                                    # cv2.putText(frame, z_name, (z.polygon[0][0], z.polygon[0][1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                                
                                _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                                img_bytes = buffer.tobytes()
                                
                                async with async_session() as session:
                                    for event in triggered_events:
                                        await create_or_update_active_alert(
                                            session,
                                            alert_type=event["type"],
                                            severity=AlertSeverity.CRITICAL,
                                            title=event["title"],
                                            description=event["description"],
                                            camera_id=cam_id,
                                            dedupe_key=event["dedupe_key"],
                                            image_data=img_bytes,
                                            camera_name=cam_name,
                                            metadata={
                                                "capability": event["type"].value,
                                                **{
                                                    k: v
                                                    for k, v in event.items()
                                                    if k not in {"type", "title", "description"}
                                                },
                                            },
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
