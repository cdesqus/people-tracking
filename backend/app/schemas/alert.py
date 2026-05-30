from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AlertBase(BaseModel):
    type: str
    severity: str
    title: str
    description: str
    camera_id: str


class AlertCreate(AlertBase):
    person_id: Optional[str] = None
    face_id: Optional[str] = None


class AlertResponse(AlertBase):
    id: str
    person_id: Optional[str] = None
    face_id: Optional[str] = None
    acknowledged: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedAlertResponse(BaseModel):
    items: list[AlertResponse]
    total: int
