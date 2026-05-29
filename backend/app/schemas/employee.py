from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class EmployeeBase(BaseModel):
    name: str
    department: str
    status: str = "active"
    badge_id: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None


class EmployeeCreate(EmployeeBase):
    id: str
    emp_id: Optional[str] = None


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    badge_id: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    id: str
    emp_id: str
    photo_url: Optional[str] = None
    last_detected: Optional[datetime] = None
    current_location: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
