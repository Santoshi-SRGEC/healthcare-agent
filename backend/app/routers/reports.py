"""Lab report routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import LabReport
from app.schemas import LabReportOut
from app.auth import require_role, get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("", response_model=List[LabReportOut])
def list_reports(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return db.query(LabReport).order_by(LabReport.id.desc()).all()


@router.get("/{report_id}", response_model=LabReportOut)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    r = db.query(LabReport).filter(LabReport.id == report_id).first()
    if not r:
        raise HTTPException(404, "Report not found")
    return r