from sqlalchemy import Column, String, Integer, Float, DateTime, Enum
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
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self):
        return f"<Camera(id={self.id}, name={self.name}, status={self.status})>"
