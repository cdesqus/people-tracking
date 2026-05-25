from datetime import datetime, timedelta
from typing import Union, Any
import enum
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import settings
from app.database import get_db
from app.models.user import User

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"

# Token URL matching where the client logs in
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
    auto_error=False
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify standard string password against bcrypt hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate bcrypt hash for a password"""
    return pwd_context.hash(password)


def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    """Generate a JWT access token"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=60 * 24)  # 24 hours for dev sessions
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    """Generate a JWT refresh token"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)  # 7 days
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """FastAPI Dependency to retrieve current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Query the user by username or email
    query = select(User).where((User.username == username) | (User.email == username))
    result = await db.execute(query)
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
        
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """FastAPI Dependency to check if the current user is active"""
    # supports both string '1' and integer 1
    if str(current_user.is_active) != "1":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
    return current_user
