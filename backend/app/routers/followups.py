"""Follow-up routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models import Task, Patient
from app.auth import get_current_user, require_role
from app.routers.notifications import create_notification

router = APIRouter(prefix="/api/followups", tags=["followups"])


class FollowUpCreate(BaseModel):
    patient_id: int
    reason: str
    requested_date: Optional[str] = None


@router.get("")
def list_followups(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Return follow-up tasks for the current user's role."""
    tasks = (
        db.query(Task)
        .filter(Task.department == "Follow-up")
        .order_by(Task.id.desc())
        .all()
    )
    patients = db.query(Patient).all()
    name_by_id = {p.id: p.name for p in patients}

    return [
        {
            "id": str(t.id),
            "patientId": str(t.patient_id or ""),
            "patientName": name_by_id.get(t.patient_id, "") if t.patient_id else "",
            "reason": t.description or t.title,
            "status": t.status,
            "priority": t.priority,
            "requestedDate": t.due_date.strftime("%Y-%m-%d") if t.due_date else "",
        }
        for t in tasks
    ]


@router.post("")
def create_followup(
    payload: FollowUpCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("doctor", "admin", "receptionist")),
):
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(404, "Patient not found")

    task = Task(
        title=f"Follow-up for {patient.name}",
        description=payload.reason,
        patient_id=payload.patient_id,
        assigned_to="receptionist",
        department="Follow-up",
        priority="Medium",
        status="Requested",
        due_date=datetime.utcnow(),
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Notify reception
    create_notification(
        db,
        user_role="receptionist",
        title="New follow-up requested",
        message=f"Follow-up needed for {patient.name}: {payload.reason}",
    )

    return {
        "id": str(task.id),
        "patientId": str(task.patient_id),
        "patientName": patient.name,
        "reason": task.description,
        "status": task.status,
    }


@router.patch("/{followup_id}/status")
def update_followup_status(
    followup_id: int,
    status: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == followup_id).first()
    if not task:
        raise HTTPException(404, "Follow-up not found")
    task.status = status
    db.commit()
    return {"ok": True, "status": status}