import time

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.config import settings
from app.models.camera import Camera
from app.models.camera import CameraStatus
from app.services.camera_capabilities import normalize_ai_capabilities
from app.services.face_processor import obstruction_telemetry
from app.services.intrusion_service import intrusion_service
from app.services.rtsp_service import RTSPService

router = APIRouter()


@router.get("/health")
async def health_check():
    """System health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.api_version,
        "environment": settings.app_env,
    }


@router.get("/config")
async def get_config(db: AsyncSession = Depends(get_db)):
    """Get system configuration"""
    return {
        "app_name": settings.api_title,
        "app_version": settings.api_version,
        "debug": settings.debug,
        "max_faces_per_image": settings.max_faces_per_image,
        "confidence_threshold": settings.confidence_threshold,
        "alert_retention_days": settings.alert_retention_days,
    }


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Get dashboard statistics"""
    # TODO: Implement stats calculation
    return {
        "total_cameras": 0,
        "active_cameras": 0,
        "total_faces_today": 0,
        "total_alerts_today": 0,
        "unique_persons_today": 0,
        "system_health": 100,
    }


def _stream_state(stream_key: str) -> dict:
    now = time.time()
    last_frame_ts = RTSPService.latest_frame_times.get(stream_key)
    has_frame = stream_key in RTSPService.latest_frames
    age_seconds = round(now - last_frame_ts, 2) if last_frame_ts else None

    if has_frame and age_seconds is not None and age_seconds <= 5:
        status = "live"
    elif has_frame and age_seconds is not None and age_seconds <= 15:
        status = "stale"
    else:
        status = "waiting"

    return {
        "stream_key": stream_key,
        "status": status,
        "has_frame": has_frame,
        "last_frame_age_seconds": age_seconds,
    }


@router.get("/ai-status")
async def get_ai_status(db: AsyncSession = Depends(get_db)):
    """Read-only AI/camera processing status without opening new RTSP connections."""
    result = await db.execute(select(Camera).where(Camera.status == CameraStatus.ACTIVE))
    cameras = result.scalars().all()

    now = time.time()
    items = []
    live_streams = 0
    stale_streams = 0
    waiting_streams = 0
    ai_enabled_cameras = 0

    for camera in cameras:
        capabilities = normalize_ai_capabilities(camera.ai_capabilities)
        enabled_features = [
            feature for feature, enabled in capabilities.items() if enabled
        ]
        if enabled_features:
            ai_enabled_cameras += 1

        main_key = f"{camera.id}:main"
        preview_key = f"{camera.id}:sub" if camera.sub_stream_url else camera.id
        main_state = _stream_state(main_key)
        preview_state = _stream_state(preview_key)

        for state in (main_state, preview_state):
            if state["status"] == "live":
                live_streams += 1
            elif state["status"] == "stale":
                stale_streams += 1
            else:
                waiting_streams += 1

        face_detections = RTSPService.last_detections.get(camera.id, [])
        fresh_face_detections = [
            detection
            for detection in face_detections
            if now - detection["timestamp"].timestamp() <= 10
        ]
        yolo_detections = RTSPService.last_yolo_detections.get(camera.id, [])
        fresh_yolo_detections = [
            detection
            for detection in yolo_detections
            if now - detection["timestamp"].timestamp() <= 10
        ]
        door_zones = [
            telemetry
            for key, telemetry in intrusion_service.door_telemetry.items()
            if key.startswith(f"{camera.id}:")
        ]

        items.append({
            "camera_id": camera.id,
            "name": camera.name,
            "enabled_features": enabled_features,
            "main_stream": main_state,
            "preview_stream": preview_state,
            "fresh_face_detections": len(fresh_face_detections),
            "fresh_yolo_detections": len(fresh_yolo_detections),
            "last_face_detection_at": (
                max((d["timestamp"] for d in face_detections), default=None)
            ),
            "last_yolo_detection_at": (
                max((d["timestamp"] for d in yolo_detections), default=None)
            ),
            "door_zones": door_zones,
            "obstruction": obstruction_telemetry.get(camera.id),
        })

    return {
        "status": "ok",
        "active_cameras": len(cameras),
        "ai_enabled_cameras": ai_enabled_cameras,
        "stream_summary": {
            "live": live_streams,
            "stale": stale_streams,
            "waiting": waiting_streams,
        },
        "cameras": items,
    }
