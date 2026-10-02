"""
RetailSense AI — Authentication & Security Core Module

Provides password hashing, verification, JWT token creation, decoding,
and FastAPI dependency wrappers for Role-Based Access Control (RBAC).
"""

import os
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.future import select

from backend.app.core.config import settings
from database.session import get_db
from database.models.models import User

import bcrypt
if not hasattr(bcrypt, "__about__"):
    class BcryptAbout:
        __version__ = getattr(bcrypt, "__version__", "4.0.0")
    bcrypt.__about__ = BcryptAbout()

# Password Context
pwd_context = CryptContext(schemes=["bcrypt_sha256", "bcrypt"], deprecated=["bcrypt"])

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    full_name: Optional[str] = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify bcrypt-sha256 and legacy bcrypt password hashes."""
    if not hashed_password or not plain_password:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except (TypeError, ValueError):
        return False


def get_password_hash(password: str) -> str:
    """Hash a password without truncation; new hashes use bcrypt-sha256."""
    if not password:
        raise ValueError("Password must not be empty")
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db = Depends(get_db)
) -> Optional[User]:
    """Resolves current user if token is provided, returns None if anonymous."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            return None
    except JWTError:
        return None

    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    return user


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db = Depends(get_db)
) -> User:
    """FastAPI dependency requiring a valid authenticated JWT user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        # Fallback to dev default admin user if in dev mode
        if settings.DEBUG:
            result = await db.execute(select(User).filter(User.email == "admin@retailsense.ai"))
            user = result.scalars().first()
            if user:
                return user
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    if user is None or not user.is_active:
        raise credentials_exception

    return user


def require_roles(allowed_roles: List[str]):
    """FastAPI dependency factory enforcing Role-Based Access Control (RBAC)."""
    async def role_checker(current_user: User = Depends(get_current_user)):
        # Admin super-user bypass
        if current_user.role == "admin":
            return current_user
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action prohibited for role '{current_user.role}'. Required roles: {allowed_roles}"
            )
        return current_user
    return role_checker
