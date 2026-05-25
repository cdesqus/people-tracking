from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    OPERATOR = "operator"
    SECURITY = "security"
    RECEPTIONIST = "receptionist"
    VIEWER = "viewer"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER)
    is_active = Column(String(1), default="1")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
