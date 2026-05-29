from sqlalchemy import Column, String, DateTime, Enum, Boolean, ForeignKey, Index
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


class AlertType(str, enum.Enum):
    MATCH = "match"
    UNKNOWN_FACE = "unknown_face"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    SYSTEM_ERROR = "system_error"


class AlertSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, index=True)
    type = Column(Enum(AlertType), nullable=False, index=True)
    severity = Column(Enum(AlertSeverity), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=False)
    camera_id = Column(String(36), ForeignKey("cameras.id"), nullable=False, index=True)
    person_id = Column(String(36), ForeignKey("employees.id"), nullable=True, index=True)
    face_id = Column(String(36), ForeignKey("faces.id"), nullable=True)
    acknowledged = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    __table_args__ = (
        Index('ix_alerts_camera_created', 'camera_id', 'created_at'),
        Index('ix_alerts_severity_created', 'severity', 'created_at'),
    )

    def __repr__(self):
        return f"<Alert(id={self.id}, type={self.type}, severity={self.severity})>"
