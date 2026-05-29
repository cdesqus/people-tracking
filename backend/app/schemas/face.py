from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any


class BoundingBox(BaseModel):
    top: float
    left: float
    width: float
    height: float


class FaceBase(BaseModel):
    camera_id: str
    confidence: float
    boundingbox: BoundingBox
    timestamp: datetime
    image_url: Optional[str] = None


class FaceCreate(FaceBase):
    person_id: Optional[str] = None
    face_match: Optional[str] = None


class FaceResponse(FaceBase):
    id: str
    person_id: Optional[str] = None
    person_name: Optional[str] = None
    location: Optional[str] = None
    face_match: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
