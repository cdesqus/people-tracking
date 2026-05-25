from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional


class CameraBase(BaseModel):
    name: str
    location: str
    stream_url: str
    resolution: Optional[str] = None
    fps: Optional[int] = 30
    branch: Optional[str] = "br-hq"


class CameraCreate(CameraBase):
    pass


class CameraUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    stream_url: Optional[str] = None
    resolution: Optional[str] = None
    fps: Optional[int] = None
    branch: Optional[str] = None


class CameraResponse(CameraBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
