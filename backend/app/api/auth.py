"""
RetailSense AI — Authentication & Role Management API Router
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models.models import User
from backend.app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    require_roles
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication & Access Control"])


class LoginRequest(BaseModel):
    email: str
    password: str


class UserRegisterRequest(BaseModel):
    user_id: str
    email: EmailStr
    password: str
    full_name: str
    role: str = "viewer"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    user_id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    permissions: List[str]


ROLE_PERMISSIONS = {
    "admin": ["*"],
    "retail_manager": ["dashboard", "sales", "inventory", "orders", "forecast", "pricing", "suppliers", "agents"],
    "inventory_manager": ["dashboard", "inventory", "forecast", "suppliers", "procurement"],
    "procurement_manager": ["dashboard", "suppliers", "procurement", "inventory", "orders"],
    "analyst": ["dashboard", "forecast", "reports", "knowledge_base", "sales"],
    "customer_support": ["dashboard", "customers", "orders", "returns", "support"],
    "viewer": ["dashboard", "forecast", "products"]
}


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticates user email/password and returns a JWT access token."""
    result = await db.execute(select(User).filter(User.email == req.email))
    user = result.scalars().first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    token_payload = {
        "sub": user.user_id,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name
    }
    access_token = create_access_token(data=token_payload)

    user_dict = {
        "user_id": user.user_id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "permissions": ROLE_PERMISSIONS.get(user.role, ROLE_PERMISSIONS["viewer"])
    }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile and role permissions for the currently authenticated user."""
    return UserResponse(
        user_id=current_user.user_id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        permissions=ROLE_PERMISSIONS.get(current_user.role, ROLE_PERMISSIONS["viewer"])
    )


@router.post("/users", response_model=UserResponse)
async def register_user(
    req: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_roles(["admin"]))
):
    """Registers a new user (Admin authorization required)."""
    result = await db.execute(select(User).filter(User.email == req.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = User(
        user_id=req.user_id,
        email=req.email,
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name,
        role=req.role.lower(),
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return UserResponse(
        user_id=new_user.user_id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        is_active=new_user.is_active,
        permissions=ROLE_PERMISSIONS.get(new_user.role, ROLE_PERMISSIONS["viewer"])
    )


@router.get("/roles")
async def get_available_roles():
    """Returns supported system roles and their permission scopes."""
    return {
        "roles": list(ROLE_PERMISSIONS.keys()),
        "permissions_map": ROLE_PERMISSIONS
    }
