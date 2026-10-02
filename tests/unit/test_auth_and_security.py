"""
Unit tests for Auth, Security, JWT Tokens, and Role-Based Access Control (RBAC).
"""

import asyncio
import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from backend.app.api.auth import LoginRequest, login
from backend.app.core.config import Settings
from backend.app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    SECRET_KEY,
    ALGORITHM
)
from jose import jwt
from passlib.hash import bcrypt as legacy_bcrypt


def test_password_hashing_and_verification():
    raw_pass = "secret123"
    hashed = get_password_hash(raw_pass)

    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("wrongpass", hashed) is False


def test_long_password_is_not_truncated_and_legacy_bcrypt_still_verifies():
    raw_pass = "retailsense-long-password-" * 5
    hashed = get_password_hash(raw_pass)
    legacy_hash = legacy_bcrypt.hash("legacy-password")

    assert hashed.startswith("$bcrypt-sha256$")
    assert verify_password(raw_pass, hashed) is True
    assert verify_password(raw_pass[:72], hashed) is False
    assert verify_password("legacy-password", legacy_hash) is True


def test_empty_password_is_rejected():
    with pytest.raises(ValueError, match="must not be empty"):
        get_password_hash("")


def test_production_settings_reject_weak_or_placeholder_secrets():
    with pytest.raises(ValidationError, match="Production requires"):
        Settings(APP_ENV="production", SECRET_KEY="super_secret_dev_key")

    with pytest.raises(ValidationError, match="Production requires"):
        Settings(APP_ENV="production", SECRET_KEY="replace-with-a-random-secret-before-deployment")

    Settings(APP_ENV="production", SECRET_KEY="random-production-secret-value-over-32-chars")


def test_login_succeeds_and_rejects_wrong_password():
    user = type("TestUser", (), {
        "user_id": "USER_TEST",
        "email": "test@retailsense.ai",
        "hashed_password": get_password_hash("correct-password"),
        "full_name": "Test User",
        "role": "analyst",
        "is_active": True,
    })()

    class Result:
        def scalars(self):
            return self

        def first(self):
            return user

    class Session:
        async def execute(self, _statement):
            return Result()

    response = asyncio.run(login(LoginRequest(
        email=user.email,
        password="correct-password",
    ), Session()))
    assert response["user"]["email"] == user.email
    assert response["access_token"]

    with pytest.raises(HTTPException) as error:
        asyncio.run(login(LoginRequest(
            email=user.email,
            password="incorrect-password",
        ), Session()))
    assert error.value.status_code == 401


def test_jwt_token_creation_and_decoding():
    payload = {
        "sub": "USER_ADMIN",
        "email": "admin@retailsense.ai",
        "role": "admin",
        "full_name": "System Administrator"
    }

    token = create_access_token(payload)
    assert isinstance(token, str)
    assert len(token) > 20

    decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert decoded["sub"] == "USER_ADMIN"
    assert decoded["email"] == "admin@retailsense.ai"
    assert decoded["role"] == "admin"
    assert "exp" in decoded
