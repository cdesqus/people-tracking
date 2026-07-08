from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float
from sqlalchemy.sql import func
from app.database import Base


class SystemSettings(Base):
    """System-wide settings (single-row table, singleton pattern)"""
    __tablename__ = "system_settings"

    id = Column(String(36), primary_key=True, default="singleton")

    # Data Retention
    face_image_retention_days = Column(Integer, nullable=False, default=90)
    detection_log_retention_days = Column(Integer, nullable=False, default=180)
    video_archive_retention_days = Column(Integer, nullable=False, default=30)
    auto_delete = Column(Boolean, nullable=False, default=True)

    # Thresholds
    confidence_threshold = Column(Integer, nullable=False, default=80)
    detection_sensitivity = Column(Integer, nullable=False, default=75)

    # Camera
    camera_check_interval = Column(Integer, nullable=False, default=30)

    # Camera obstruction/tamper detection
    obstruction_dark_mean_threshold = Column(Float, nullable=False, default=20.0)
    obstruction_flat_stddev_threshold = Column(Float, nullable=False, default=10.0)
    obstruction_consecutive_frames = Column(Integer, nullable=False, default=8)

    # Alert Rules
    email_enabled = Column(Boolean, nullable=False, default=True)
    sms_enabled = Column(Boolean, nullable=False, default=False)
    slack_enabled = Column(Boolean, nullable=False, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self):
        return (
            f"<SystemSettings("
            f"face={self.face_image_retention_days}d, "
            f"logs={self.detection_log_retention_days}d, "
            f"video={self.video_archive_retention_days}d, "
            f"auto_delete={self.auto_delete})>"
        )

    def to_frontend_dict(self) -> dict:
        """Serialize to the shape expected by the frontend Redux store."""
        return {
            "alertRules": {
                "emailEnabled": self.email_enabled,
                "smsEnabled": self.sms_enabled,
                "slackEnabled": self.slack_enabled,
            },
            "thresholds": {
                "confidenceThreshold": self.confidence_threshold,
                "detectionSensitivity": self.detection_sensitivity,
            },
            "camera": {
                "checkInterval": self.camera_check_interval,
                "obstructionDarkMeanThreshold": self.obstruction_dark_mean_threshold,
                "obstructionFlatStddevThreshold": self.obstruction_flat_stddev_threshold,
                "obstructionConsecutiveFrames": self.obstruction_consecutive_frames,
            },
            "dataRetention": {
                "faceImageDays": self.face_image_retention_days,
                "detectionLogDays": self.detection_log_retention_days,
                "videoArchiveDays": self.video_archive_retention_days,
                "autoDelete": self.auto_delete,
            },
            "notifications": {
                "emailEnabled": self.email_enabled,
                "notificationTypes": {
                    "alerts": True,
                    "dailyReport": False,
                    "weeklySummary": True,
                },
                "slackWebhookUrl": "",
                "smsGatewayConfig": {
                    "provider": "",
                    "apiKey": "",
                },
            },
        }
