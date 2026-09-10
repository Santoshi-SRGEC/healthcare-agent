"""Generic document routes (non-PDF metadata)."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import LabReport, Patient
from app.auth import get_current_user

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("")
def list_documents(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Return all uploaded documents (from lab_reports as source of truth)."""
    reports = db.query(LabReport).order_by(LabReport.id.desc()).all()
    patients = db.query(Patient).all()
    name_by_id = {p.id: p.name for p in patients}

    return [
        {
            "id": str(r.id),
            "name": r.report_name,
            "patientId": str(r.patient_id),
            "patientName": name_by_id.get(r.patient_id, ""),
            "type": r.report_type,
            "uploadedBy": r.uploaded_by,
            "date": r.uploaded_at.strftime("%Y-%m-%d") if r.uploaded_at else "",
            "status": r.status,
            "aiSummary": r.ai_summary,
        }
        for r in reports
    ]