import asyncio
import logging
import os
from datetime import datetime
from typing import Dict

from sqlalchemy import select

from app.database import async_session
from app.models.alert import AlertSeverity, AlertType
from app.models.camera import Camera, CameraStatus
from app.services.alert_service import create_or_update_active_alert, resolve_active_alerts
from app.services.rtsp_service import RTSPService

logger = logging.getLogger(__name__)


def _capability_enabled(camera: Camera, key: str, default: bool = True) -> bool:
    caps = camera.ai_capabilities or {}
    if not isinstance(caps, dict):
        return default
    return bool(caps.get(key, default))


class CameraOfflineMonitor:
    def __init__(self):
        self.is_running = False
        self._fail_counts: Dict[str, int] = {}
        self._success_counts: Dict[str, int] = {}

    async def start(self):
        self.is_running = True
        interval = float(os.getenv("CAMERA_OFFLINE_CHECK_INTERVAL_SECONDS", "30"))
        logger.info("[CameraOffline] Monitor started interval=%ss", interval)
        while self.is_running:
            try:
                await self._check_all()
            except Exception as exc:
                logger.error("[CameraOffline] Monitor loop failed: %s", exc)
            await asyncio.sleep(interval)

    async def stop(self):
        self.is_running = False
        logger.info("[CameraOffline] Monitor stopped")

    async def _check_all(self):
        async with async_session() as session:
            res = await session.execute(select(Camera))
            cameras = res.scalars().all()

        loop = asyncio.get_running_loop()
        tasks = [
            self._check_camera(loop, camera)
            for camera in cameras
            if _capability_enabled(camera, "camera_offline", True)
        ]
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    async def _check_camera(self, loop: asyncio.AbstractEventLoop, camera: Camera):
        timeout = int(os.getenv("CAMERA_OFFLINE_RTSP_TIMEOUT_SECONDS", "5"))
        fail_threshold = int(os.getenv("CAMERA_OFFLINE_FAIL_THRESHOLD", "3"))
        recover_threshold = int(os.getenv("CAMERA_OFFLINE_RECOVER_THRESHOLD", "2"))

        result = await loop.run_in_executor(
            None,
            RTSPService.test_rtsp_connection,
            camera.stream_url,
            timeout,
        )
        connected = result.get("status") == "connected"

        if connected:
            self._fail_counts[camera.id] = 0
            self._success_counts[camera.id] = self._success_counts.get(camera.id, 0) + 1
        else:
            self._success_counts[camera.id] = 0
            self._fail_counts[camera.id] = self._fail_counts.get(camera.id, 0) + 1

        async with async_session() as session:
            db_cam = await session.get(Camera, camera.id)
            if not db_cam:
                return

            db_cam.last_status_check = datetime.utcnow()
            if connected:
                db_cam.status = CameraStatus.ACTIVE
                db_cam.connection_error = None
                if result.get("resolution"):
                    db_cam.resolution = result["resolution"]
                if result.get("fps"):
                    try:
                        db_cam.fps = int(float(result["fps"]))
                    except Exception:
                        pass

                if self._success_counts[camera.id] >= recover_threshold:
                    await resolve_active_alerts(
                        session,
                        alert_type=AlertType.CAMERA_OFFLINE,
                        camera_id=camera.id,
                        dedupe_key="offline",
                        note="Camera stream recovered.",
                    )
            else:
                db_cam.status = CameraStatus.ERROR
                db_cam.connection_error = result.get("message") or "Camera stream unreachable"

                if self._fail_counts[camera.id] >= fail_threshold:
                    await create_or_update_active_alert(
                        session,
                        alert_type=AlertType.CAMERA_OFFLINE,
                        severity=AlertSeverity.CRITICAL,
                        title="Camera Offline",
                        description=f"Camera {camera.name} is offline or unreachable: {db_cam.connection_error}",
                        camera_id=camera.id,
                        dedupe_key="offline",
                        camera_name=camera.name,
                        metadata={
                            "capability": "camera_offline",
                            "fail_count": self._fail_counts[camera.id],
                            "last_error": db_cam.connection_error,
                        },
                    )

            await session.commit()


camera_offline_monitor = CameraOfflineMonitor()
