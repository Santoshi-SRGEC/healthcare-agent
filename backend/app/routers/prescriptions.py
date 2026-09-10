"""Prescription routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models import Task, Patient
from app.auth import get_current_user, require_role
from app.routers.notifications import create_notification

router = APIRouter(prefix="/api/prescriptions", tags=["prescriptions"])


class PrescriptionCreate(BaseModel):
    patient_id: int
    medications: str
    notes: Optional[str] = None


@router.get("")
def list_prescriptions(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    tasks = (
        db.query(Task)
        .filter(Task.department == "Pharmacy")
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
            "medications": t.description or "",
            "status": t.status,
            "date": t.due_date.strftime("%Y-%m-%d") if t.due_date else "",
        }
        for t in tasks
    ]


@router.post("")
def create_prescription(
    payload: PrescriptionCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("doctor", "admin")),
):
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(404, "Patient not found")

    task = Task(
        title=f"Prescription for {patient.name}",
        description=f"{payload.medications}\n\nNotes: {payload.notes or 'None'}",
        patient_id=payload.patient_id,
        assigned_to="pharmacy",
        department="Pharmacy",
        priority="Medium",
        status="Pending",
        due_date=datetime.utcnow(),
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    create_notification(
        db,
        user_role="pharmacy",
        title="New prescription received",
        message=f"Prescription for {patient.name} awaiting processing",
    )

    return {
        "id": str(task.id),
        "patientId": str(task.patient_id),
        "patientName": patient.name,
        "medications": task.description,
        "status": task.status,
    }


@router.patch("/{prescription_id}/status")
def update_prescription_status(
    prescription_id: int,
    status: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == prescription_id).first()
    if not task:
        raise HTTPException(404, "Prescription not found")
    task.status = status
    db.commit()
    return {"ok": True, "status": status}