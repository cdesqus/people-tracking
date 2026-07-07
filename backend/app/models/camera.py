from sqlalchemy import Column, String, Integer, Float, DateTime, Enum, Boolean, JSON
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


class CameraStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    status = Column(Enum(CameraStatus), default=CameraStatus.INACTIVE)
    stream_url = Column(String(500), nullable=False)
    resolution = Column(String(50))
    fps = Column(Integer, default=30)
    branch = Column(String(100), nullable=True, default="br-hq")
    
    # RTSP Configuration fields
    brand = Column(String(50), nullable=True, default="generic")  # hikvision, dahua, uniview, axis, tp-link, reolink, generic
    rtsp_ip = Column(String(50), nullable=True)  # Camera IP address
    rtsp_port = Column(Integer, nullable=True, default=554)  # RTSP port
    rtsp_username = Column(String(255), nullable=True)  # RTSP username
    rtsp_password = Column(String(255), nullable=True)  # RTSP password (should be encrypted in production)
    rtsp_channel = Column(String(50), nullable=True, default="1")  # Channel/stream number
    rtsp_stream_path = Column(String(255), nullable=True)  # Stream path for generic RTSP
    
    # Intrusion Detection settings
    intrusion_zones = Column(String, nullable=True)  # Store JSON as string: [[[x1,y1], [x2,y2], ...], ...]
    ai_capabilities = Column(JSON, nullable=True)  # Optional per-camera feature toggles/rule defaults
    
    # Status tracking
    last_status_check = Column(DateTime(timezone=True), nullable=True)
    connection_error = Column(String(500), nullable=True)  # Last connection error message
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self):
        return f"<Camera(id={self.id}, name={self.name}, brand={self.brand}, status={self.status})>"
