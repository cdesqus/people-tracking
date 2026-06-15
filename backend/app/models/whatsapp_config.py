from sqlalchemy import Column, String, Boolean, JSON
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from app.database import Base


class WhatsappConfig(Base):
    """Waha WhatsApp gateway configuration (single-row table)"""
    __tablename__ = "whatsapp_configs"

    id = Column(String(36), primary_key=True, default="singleton")
    waha_url = Column(String(500), nullable=False, default="http://localhost:3000")
    waha_api_key = Column(String(255), nullable=True)
    session_name = Column(String(100), nullable=False, default="default")
    is_enabled = Column(Boolean, default=False, nullable=False)
    # JSON array of severity strings to notify: ["critical", "high", "medium", "low"]
    alert_severities = Column(JSON, nullable=False, default=["critical", "high"])
    # JSON array of alert types to notify: ["match", "unknown_face", "suspicious_activity", "intrusion", "system_error"]
    alert_types = Column(JSON, nullable=False, default=["match", "unknown_face", "suspicious_activity", "intrusion", "system_error"])
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self):
        return f"<WhatsappConfig(url={self.waha_url}, session={self.session_name}, enabled={self.is_enabled})>"
