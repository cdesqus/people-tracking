"""
User Management API

Production-safe user administration for the Settings > User Management screen.
"""

import uuid
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.utils.auth import get_password_hash

router = APIRouter()


FrontendRole = Literal[
    "admin",
    "manager",
    "operator",
    "security",
    "receptionist",
    "user",
    "viewer",
]
FrontendStatus = Literal["active", "inactive"]


def _normalize_role(role: str | UserRole) -> UserRole:
    value = role.value if isinstance(role, UserRole) else str(role).lower()
    if value == "user":
        value = UserRole.OPERATOR.value
    try:
        return UserRole(value)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported role: {role}",
        ) from exc


def _user_to_frontend(user: User) -> dict:
    role = user.role.value if isinstance(user.role, UserRole) else str(user.role)
    return {
        "id": user.id,
        "name": user.full_name,
        "email": user.email,
        "username": user.username,
        "role": role,
        "status": "active" if str(user.is_active) == "1" else "inactive",
        "createdAt": user.created_at.isoformat() if user.created_at else None,
        "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
    }


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    username: str | None = Field(default=None, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    role: FrontendRole = "operator"
    status: FrontendStatus = "active"


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    email: EmailStr | None = None
    username: str | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=128)
    role: FrontendRole | None = None
    status: FrontendStatus | None = None


@router.get("")
async def list_users(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    total_res = await db.execute(select(func.count()).select_from(User))
    total = int(total_res.scalar() or 0)
    res = await db.execute(
        select(User)
        .order_by(User.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    users = res.scalars().all()
    return {
        "items": [_user_to_frontend(user) for user in users],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_user(data: UserCreate, db: AsyncSession = Depends(get_db)):
    username = (data.username or data.email.split("@")[0]).strip().lower()
    email = data.email.lower()

    existing = await db.execute(
        select(User).where(or_(User.email == email, User.username == username))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or username already exists",
        )

    user = User(
        id=str(uuid.uuid4()),
        email=email,
        username=username,
        full_name=data.name.strip(),
        hashed_password=get_password_hash(data.password),
        role=_normalize_role(data.role),
        is_active="1" if data.status == "active" else "0",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return _user_to_frontend(user)


@router.put("/{user_id}")
async def update_user(user_id: str, data: UserUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.email is not None:
        email = data.email.lower()
        existing = await db.execute(
            select(User).where(User.email == email, User.id != user_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Email already exists")
        user.email = email

    if data.username is not None:
        username = data.username.strip().lower()
        existing = await db.execute(
            select(User).where(User.username == username, User.id != user_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Username already exists")
        user.username = username

    if data.name is not None:
        user.full_name = data.name.strip()
    if data.password:
        user.hashed_password = get_password_hash(data.password)
    if data.role is not None:
        new_role = _normalize_role(data.role)
        if user.role == UserRole.ADMIN and new_role != UserRole.ADMIN:
            admin_count = await _active_admin_count(db)
            if admin_count <= 1:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot demote the last active administrator",
                )
        user.role = new_role
    if data.status is not None:
        if data.status == "inactive" and user.role == UserRole.ADMIN and str(user.is_active) == "1":
            admin_count = await _active_admin_count(db)
            if admin_count <= 1:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot deactivate the last active administrator",
                )
        user.is_active = "1" if data.status == "active" else "0"

    user.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    return _user_to_frontend(user)


@router.delete("/{user_id}")
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == UserRole.ADMIN and str(user.is_active) == "1":
        admin_count = await _active_admin_count(db)
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete the last active administrator",
            )

    await db.delete(user)
    await db.commit()
    return {"success": True, "message": "User deleted successfully"}


async def _active_admin_count(db: AsyncSession) -> int:
    res = await db.execute(
        select(func.count()).select_from(User).where(
            User.role == UserRole.ADMIN,
            User.is_active == "1",
        )
    )
    return int(res.scalar() or 0)
