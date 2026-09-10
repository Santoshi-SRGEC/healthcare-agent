"""Role-based permission definitions.

The frontend hides unauthorized navigation, but the backend independently
enforces all permissions. Never rely on frontend hiding alone for security.
"""
from enum import Enum


class Role(str, Enum):
    RECEPTIONIST = "receptionist"
    DOCTOR = "doctor"
    LAB = "lab"
    PHARMACY = "pharmacy"
    ADMIN = "admin"


ROLE_PERMISSIONS: dict[Role, list[str]] = {
    Role.RECEPTIONIST: [
        "patients.read",
        "patients.create",
        "appointments.read",
        "appointments.create",
        "appointments.update",
        "tasks.read",
        "notifications.read",
    ],
    Role.DOCTOR: [
        "patients.read",
        "appointments.read",
        "lab_reports.read",
        "documents.read",
        "documents.create",
        "tasks.read",
        "tasks.create",
        "prescriptions.read",
        "prescriptions.create",
        "followups.read",
        "followups.create",
        "ai_workflow.review",
        "ai_workflow.run",
    ],
    Role.LAB: [
        "lab_requests.read",
        "lab_reports.read",
        "lab_reports.create",
        "lab_reports.update",
        "notifications.read",
    ],
    Role.PHARMACY: [
        "prescriptions.read",
        "prescriptions.update",
        "notifications.read",
    ],
    Role.ADMIN: [
        "users.manage",
        "roles.manage",
        "audit.read",
        "security.read",
        "patients.read",
        "appointments.read",
        "documents.read",
        "lab_reports.read",
        "tasks.read",
        "prescriptions.read",
        "followups.read",
        "ai_workflow.read",
    ],
}


def has_permission(role: str, permission: str) -> bool:
    """Check if a role has a specific permission."""
    try:
        r = Role(role)
    except ValueError:
        return False
    return permission in ROLE_PERMISSIONS.get(r, [])


def get_role_permissions(role: str) -> list[str]:
    """Get all permissions for a role."""
    try:
        r = Role(role)
    except ValueError:
        return []
    return ROLE_PERMISSIONS.get(r, [])
