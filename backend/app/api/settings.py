"""
System Settings API
GET  /api/settings   — Fetch current settings (returns defaults if none saved)
PUT  /api/settings   — Create or update system settings
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.system_settings import SystemSettings
from app.services.retention_service import retention_service

router = APIRouter()


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class AlertRules(BaseModel):
    emailEnabled: bool = True
    smsEnabled: bool = False
    slackEnabled: bool = False


class Thresholds(BaseModel):
    confidenceThreshold: int = 80
    detectionSensitivity: int = 75


class CameraSettings(BaseModel):
    checkInterval: int = 30
    obstructionDarkMeanThreshold: float = 20.0
    obstructionFlatStddevThreshold: float = 10.0
    obstructionConsecutiveFrames: int = 8


class DataRetention(BaseModel):
    faceImageDays: int = 90
    detectionLogDays: int = 180
    videoArchiveDays: int = 30
    autoDelete: bool = True


class SmsGatewayConfig(BaseModel):
    provider: str = ""
    apiKey: str | None = ""


class NotificationTypes(BaseModel):
    alerts: bool = True
    dailyReport: bool = False
    weeklySummary: bool = True


class Notifications(BaseModel):
    emailEnabled: bool = True
    notificationTypes: NotificationTypes = NotificationTypes()
    slackWebhookUrl: str | None = ""
    smsGatewayConfig: SmsGatewayConfig | None = SmsGatewayConfig()


class SystemSettingsPayload(BaseModel):
    alertRules: AlertRules = AlertRules()
    thresholds: Thresholds = Thresholds()
    camera: CameraSettings = CameraSettings()
    dataRetention: DataRetention = DataRetention()
    notifications: Notifications = Notifications()


# ─── Default response (used when no row exists in DB) ────────────────────────

_DEFAULTS = SystemSettingsPayload().model_dump()


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("")
async def get_settings(db: AsyncSession = Depends(get_db)):
    """Fetch current system settings."""
    result = await db.execute(
        select(SystemSettings).where(SystemSettings.id == "singleton")
    )
    cfg = result.scalar_one_or_none()

    if not cfg:
        return _DEFAULTS

    return cfg.to_frontend_dict()


@router.put("")
async def update_settings(
    data: SystemSettingsPayload,
    db: AsyncSession = Depends(get_db),
):
    """Create or update system settings (upsert)."""
    result = await db.execute(
        select(SystemSettings).where(SystemSettings.id == "singleton")
    )
    cfg = result.scalar_one_or_none()

    if cfg:
        # Update existing
        cfg.face_image_retention_days = data.dataRetention.faceImageDays
        cfg.detection_log_retention_days = data.dataRetention.detectionLogDays
        cfg.video_archive_retention_days = data.dataRetention.videoArchiveDays
        cfg.auto_delete = data.dataRetention.autoDelete
        cfg.confidence_threshold = data.thresholds.confidenceThreshold
        cfg.detection_sensitivity = data.thresholds.detectionSensitivity
        cfg.camera_check_interval = data.camera.checkInterval
        cfg.obstruction_dark_mean_threshold = data.camera.obstructionDarkMeanThreshold
        cfg.obstruction_flat_stddev_threshold = data.camera.obstructionFlatStddevThreshold
        cfg.obstruction_consecutive_frames = data.camera.obstructionConsecutiveFrames
        cfg.email_enabled = data.alertRules.emailEnabled
        cfg.sms_enabled = data.alertRules.smsEnabled
        cfg.slack_enabled = data.alertRules.slackEnabled
    else:
        # Create new singleton row
        cfg = SystemSettings(
            id="singleton",
            face_image_retention_days=data.dataRetention.faceImageDays,
            detection_log_retention_days=data.dataRetention.detectionLogDays,
            video_archive_retention_days=data.dataRetention.videoArchiveDays,
            auto_delete=data.dataRetention.autoDelete,
            confidence_threshold=data.thresholds.confidenceThreshold,
            detection_sensitivity=data.thresholds.detectionSensitivity,
            camera_check_interval=data.camera.checkInterval,
            obstruction_dark_mean_threshold=data.camera.obstructionDarkMeanThreshold,
            obstruction_flat_stddev_threshold=data.camera.obstructionFlatStddevThreshold,
            obstruction_consecutive_frames=data.camera.obstructionConsecutiveFrames,
            email_enabled=data.alertRules.emailEnabled,
            sms_enabled=data.alertRules.smsEnabled,
            slack_enabled=data.alertRules.slackEnabled,
        )
        db.add(cfg)

    await db.commit()
    await db.refresh(cfg)

    return cfg.to_frontend_dict()


@router.get("/retention/status")
async def get_retention_status():
    return retention_service.status()


@router.post("/retention/run")
async def run_retention_cleanup():
    return await retention_service.run_cleanup()
