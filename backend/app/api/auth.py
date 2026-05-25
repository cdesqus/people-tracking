from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserLogin
from app.utils.auth import (
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_active_user,
    ALGORITHM
)
from app.config import settings

router = APIRouter()


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/login")
async def login(
    login_data: UserLogin = None,
    form_data: OAuth2PasswordRequestForm = Depends(None),
    db: AsyncSession = Depends(get_db)
):
    """
    User login endpoint. Supports both JSON body and OAuth2 form-data formats.
    """
    username = None
    password = None

    if login_data:
        username = login_data.email
        password = login_data.password
    elif form_data:
        username = form_data.username
        password = form_data.password
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Login credentials must be provided via JSON body or Form data"
        )

    # Query user by username or email
    query = select(User).where((User.username == username) | (User.email == username))
    result = await db.execute(query)
    user = result.scalars().first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if str(user.is_active) != "1":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Generate access and refresh tokens
    access_token = create_access_token(subject=user.username)
    refresh_token = create_refresh_token(subject=user.username)

    user_info = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_info
        }
    }


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_active_user)):
    """
    Get current authenticated user info.
    """
    user_info = {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }
    return {
        "success": True,
        "data": user_info
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """
    Log out active user session.
    """
    return {
        "success": True,
        "message": "Logged out successfully"
    }


@router.post("/refresh-token")
async def refresh_token(
    request: RefreshRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using a refresh token.
    """
    try:
        payload = jwt.decode(request.refresh_token, settings.secret_key, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    query = select(User).where(User.username == username)
    result = await db.execute(query)
    user = result.scalars().first()

    if not user or str(user.is_active) != "1":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    new_access_token = create_access_token(subject=user.username)
    return {
        "success": True,
        "data": {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
    }
