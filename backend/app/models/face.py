from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Index, LargeBinary
from sqlalchemy.sql import func
from datetime import datetime
from app.database import Base


class Face(Base):
    __tablename__ = "faces"

    id = Column(String(36), primary_key=True, index=True)
    camera_id = Column(String(36), ForeignKey("cameras.id"), nullable=False, index=True)
    person_id = Column(String(36), ForeignKey("persons.id"), nullable=True, index=True)
    confidence = Column(Float, nullable=False)
    face_match = Column(String(255), nullable=True)
    boundingbox = Column(JSON, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    image_data = Column(LargeBinary, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    __table_args__ = (
        Index('ix_faces_camera_timestamp', 'camera_id', 'timestamp'),
        Index('ix_faces_person_timestamp', 'person_id', 'timestamp'),
    )

    def __repr__(self):
        return f"<Face(id={self.id}, camera_id={self.camera_id}, confidence={self.confidence})>"
