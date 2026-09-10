"""Notification routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import Notification
from app.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def create_notification(
    db: Session,
    user_role: str,
    title: str,
    message: str,
):
    """Helper — call from other routers to create a notification."""
    n = Notification(
        user_role=user_role,
        title=title,
        message=message,
        is_read="false",
    )
    db.add(n)
    db.commit()
    return n


@router.get("")
def list_notifications(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Return notifications for the current user's role."""
    notifs = (
        db.query(Notification)
        .filter(
            (Notification.user_role == user.role)
            | (Notification.user_role == "all")
        )
        .order_by(Notification.id.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "isRead": n.is_read == "true",
            "createdAt": n.created_at.isoformat() if n.created_at else "",
        }
        for n in notifs
    ]


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        raise HTTPException(404, "Notification not found")
    n.is_read = "true"
    db.commit()
    return {"ok": True, "id": n.id}


@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    db.query(Notification).filter(
        (Notification.user_role == user.role) | (Notification.user_role == "all")
    ).update({"is_read": "true"})
    db.commit()
    return {"ok": True}