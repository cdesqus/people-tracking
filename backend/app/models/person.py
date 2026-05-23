from sqlalchemy import Column, String, DateTime, Integer, Enum, JSON
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


class PersonStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    WATCHLIST = "watchlist"


class Person(Base):
    __tablename__ = "persons"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(String(500), nullable=True)
    status = Column(Enum(PersonStatus), default=PersonStatus.ACTIVE)
    face_encodings = Column(JSON, default=list)
    first_seen = Column(DateTime(timezone=True), nullable=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    encounter_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self):
        return f"<Person(id={self.id}, name={self.name}, status={self.status})>"
