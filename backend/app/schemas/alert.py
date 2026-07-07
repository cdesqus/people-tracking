from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, Any


class AlertBase(BaseModel):
    type: str
    severity: str
    title: str
    description: str
    camera_id: str


class AlertCreate(AlertBase):
    person_id: Optional[str] = None
    face_id: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None
    image_data: Optional[bytes] = None


class AlertUpdate(BaseModel):
    acknowledged: Optional[bool] = None
    resolved: Optional[bool] = None
    false_positive: Optional[bool] = None
    resolution_note: Optional[str] = None


class AlertResponse(AlertBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    person_id: Optional[str] = None
    face_id: Optional[str] = None
    acknowledged: bool
    first_seen_at: Optional[datetime] = None
    last_seen_at: Optional[datetime] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    false_positive: bool = False
    resolution_note: Optional[str] = None
    metadata: Optional[dict[str, Any]] = Field(default=None, validation_alias="metadata_json")
    has_image: bool = False
    created_at: datetime
    updated_at: datetime


class PaginatedAlertResponse(BaseModel):
    items: list[AlertResponse]
    total: int
