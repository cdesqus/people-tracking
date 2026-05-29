from sqlalchemy import Column, String, DateTime, Enum, JSON, LargeBinary
from sqlalchemy.sql import func
import enum
from app.database import Base


class EmployeeStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"


class Employee(Base):
    __tablename__ = "employees"

    id = Column(String(36), primary_key=True, index=True)
    emp_id = Column(String(100), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    department = Column(String(255), nullable=False, index=True)
    status = Column(Enum(EmployeeStatus), default=EmployeeStatus.ACTIVE, index=True)
    photo_url = Column(String(500), nullable=True)
    photo_data = Column(LargeBinary, nullable=True)
    badge_id = Column(String(100), nullable=True)
    contact = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    face_id = Column(String(255), nullable=True)
    face_encoding = Column(JSON, nullable=True)
    last_detected = Column(DateTime(timezone=True), nullable=True)
    current_location = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<Employee(id={self.id}, name={self.name}, department={self.department})>"
