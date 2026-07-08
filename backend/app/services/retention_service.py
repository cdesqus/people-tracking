import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any

from sqlalchemy import delete, select, update

from app.database import async_session
from app.models.alert import Alert
from app.models.face import Face
from app.models.system_settings import SystemSettings

logger = logging.getLogger(__name__)


class RetentionService:
    def __init__(self) -> None:
        self.is_running = False
        self.last_cleanup_result: dict[str, Any] | None = None

    async def start(self) -> None:
        self.is_running = True
        logger.info("[Retention] Retention service started.")
        while self.is_running:
            try:
                await self.run_cleanup()
            except Exception as err:
                logger.error("[Retention] Cleanup failed: %s", err)
            await asyncio.sleep(24 * 60 * 60)

    async def stop(self) -> None:
        self.is_running = False
        logger.info("[Retention] Retention service stopped.")

    async def run_cleanup(self) -> dict[str, Any]:
        async with async_session() as session:
            result = await session.execute(
                select(SystemSettings).where(SystemSettings.id == "singleton")
            )
            cfg = result.scalar_one_or_none()

            if not cfg:
                cfg = SystemSettings(id="singleton")
                session.add(cfg)
                await session.flush()

            if not cfg.auto_delete:
                self.last_cleanup_result = {
                    "status": "skipped",
                    "reason": "auto_delete_disabled",
                    "ran_at": datetime.utcnow().isoformat(),
                }
                await session.commit()
                return self.last_cleanup_result

            now = datetime.utcnow()
            face_image_cutoff = now - timedelta(days=cfg.face_image_retention_days)
            detection_log_cutoff = now - timedelta(days=cfg.detection_log_retention_days)

            # Keep face log rows until detection_log_cutoff, but strip heavy image blobs earlier.
            face_image_res = await session.execute(
                update(Face)
                .where(Face.image_data.is_not(None), Face.timestamp < face_image_cutoff)
                .values(image_data=None, updated_at=now)
            )

            old_faces_res = await session.execute(
                delete(Face).where(Face.timestamp < detection_log_cutoff)
            )

            # Keep active unresolved alerts. Clean old acknowledged/resolved/false-positive alerts.
            old_alerts_res = await session.execute(
                delete(Alert).where(
                    Alert.created_at < detection_log_cutoff,
                    (Alert.resolved_at.is_not(None))
                    | (Alert.acknowledged.is_(True))
                    | (Alert.false_positive.is_(True)),
                )
            )

            await session.commit()

            self.last_cleanup_result = {
                "status": "completed",
                "ran_at": now.isoformat(),
                "policy": {
                    "faceImageDays": cfg.face_image_retention_days,
                    "detectionLogDays": cfg.detection_log_retention_days,
                    "videoArchiveDays": cfg.video_archive_retention_days,
                    "autoDelete": cfg.auto_delete,
                },
                "deleted": {
                    "faceImagesCleared": int(face_image_res.rowcount or 0),
                    "faceLogsDeleted": int(old_faces_res.rowcount or 0),
                    "alertsDeleted": int(old_alerts_res.rowcount or 0),
                    "videoArchivesDeleted": 0,
                },
                "note": "Video archive cleanup is reserved until a video archive table/storage path exists.",
            }
            logger.info("[Retention] Cleanup completed: %s", self.last_cleanup_result)
            return self.last_cleanup_result

    def status(self) -> dict[str, Any]:
        return self.last_cleanup_result or {
            "status": "not_run",
            "message": "Retention cleanup has not run in this process yet.",
        }


retention_service = RetentionService()
