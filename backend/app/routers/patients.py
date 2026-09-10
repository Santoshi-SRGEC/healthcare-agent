"""Patient routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Patient
from app.schemas import PatientCreate, PatientOut
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("", response_model=List[PatientOut])
def list_patients(
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist", "doctor", "admin")),
):
    return db.query(Patient).order_by(Patient.id.desc()).all()


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist", "doctor", "admin")),
):
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p:
        raise HTTPException(404, "Patient not found")
    return p

@router.post("", response_model=PatientOut)
def create_patient(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("receptionist", "admin")),
):
    # Check for duplicate phone
    existing_phone = (
        db.query(Patient).filter(Patient.phone == payload.phone).first()
    )
    if existing_phone:
        raise HTTPException(
            status_code=409,
            detail=f"A patient with phone {payload.phone} already exists ({existing_phone.name})",
        )

    # Check for duplicate email (if provided)
    if payload.email:
        existing_email = (
            db.query(Patient).filter(Patient.email == payload.email).first()
        )
        if existing_email:
            raise HTTPException(
                status_code=409,
                detail=f"A patient with email {payload.email} already exists ({existing_email.name})",
            )

    count = db.query(Patient).count() + 1
    code = f"PAT-{count:04d}"

    p = Patient(patient_code=code, **payload.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p