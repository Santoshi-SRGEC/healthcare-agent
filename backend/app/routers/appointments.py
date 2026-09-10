"""Appointment routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Appointment
from app.schemas import AppointmentCreate, AppointmentOut
from app.auth import require_role

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.get("", response_model=List[AppointmentOut])
def list_appointments(
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist", "doctor", "admin")),
):
    return db.query(Appointment).order_by(Appointment.scheduled_at.desc()).all()


@router.post("", response_model=AppointmentOut)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist", "doctor", "admin")),
):
    a = Appointment(**payload.dict(), status="Pending")
    db.add(a)
    db.commit()
    db.refresh(a)
    return a


@router.patch("/{appointment_id}/status")
def update_status(
    appointment_id: int,
    status: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist", "doctor", "admin")),
):
    a = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not a:
        raise HTTPException(404, "Appointment not found")
    a.status = status
    db.commit()
    return {"ok": True, "status": a.status}