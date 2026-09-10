"""Security utilities.

This module provides authentication and authorization helpers.
Currently using mock authentication — structured so real JWT/OAuth
can replace it later without changing the API surface.
"""
from fastapi import HTTPException, status
from app.core.permissions import has_permission


def mock_authenticate(email: str, password: str, role: str) -> dict | None:
    """Mock authentication. Replace with real auth (JWT/OAuth) later.

    NEVER store real passwords in frontend code or source files.
    This is a placeholder for development only.
    """
    from app.mock_data.users import LOGIN_CREDENTIALS, MOCK_USERS

    cred = LOGIN_CREDENTIALS.get(email)
    if not cred or cred["password"] != password or cred["role"] != role:
        return None

    user = MOCK_USERS.get(cred["user_id"])
    if not user:
        return None

    return user


def require_permission(user: dict | None, permission: str) -> None:
    """Raise 403 if the user lacks the required permission."""
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    if not has_permission(user.get("role", ""), permission):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Permission denied: {permission}")


def get_current_user_mock(role: str = "receptionist") -> dict:
    """Get a mock user for development. Replace with real session extraction."""
    from app.mock_data.users import MOCK_USERS
    # Return first user matching role
    for u in MOCK_USERS.values():
        if u["role"] == role:
            return u
    return list(MOCK_USERS.values())[0]
