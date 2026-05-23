from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
