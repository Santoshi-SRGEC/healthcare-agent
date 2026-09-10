"""Audit log routes (admin only)."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.auth import require_role

router = APIRouter(prefix="/api/audit-logs", tags=["audit"])

# In-memory log store (replace with DB table later)
_AUDIT_STORE: list[dict] = []


def log_action(
    user_role: str,
    user_name: str,
    action: str,
    resource: str,
    resource_id: str = "",
):
    """Call from anywhere to log an action."""
    _AUDIT_STORE.append({
        "id": len(_AUDIT_STORE) + 1,
        "timestamp": datetime.utcnow().isoformat(),
        "userRole": user_role,
        "userName": user_name,
        "action": action,
        "resource": resource,
        "resourceId": resource_id,
    })
    # Keep last 500
    if len(_AUDIT_STORE) > 500:
        _AUDIT_STORE.pop(0)


@router.get("")
def list_audit_logs(
    user=Depends(require_role("admin")),
):
    return list(reversed(_AUDIT_STORE))


@router.get("/recent")
def recent_audit_logs(
    user=Depends(require_role("admin", "doctor")),
):
    return list(reversed(_AUDIT_STORE[-20:]))
    