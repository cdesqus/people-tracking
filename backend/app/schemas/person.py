from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class PersonBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"


class PersonCreate(PersonBase):
    pass


class PersonUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class PersonResponse(PersonBase):
    id: str
    face_encodings: List[str]
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    encounter_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
