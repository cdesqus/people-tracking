from pydantic import AliasChoices, BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any


class BoundingBox(BaseModel):
    # Accept legacy/AWS-style capitalized records while always returning the
    # lowercase API shape expected by the frontend.
    top: float = Field(validation_alias=AliasChoices("top", "Top"))
    left: float = Field(validation_alias=AliasChoices("left", "Left"))
    width: float = Field(validation_alias=AliasChoices("width", "Width"))
    height: float = Field(validation_alias=AliasChoices("height", "Height"))


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
    camera_name: Optional[str] = None
    location: Optional[str] = None
    face_match: Optional[str] = None
    has_image: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
