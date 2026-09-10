"""Lab report routes - upload and retrieve medical documents."""

from pathlib import Path
from typing import List
import shutil

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LabReport
from app.schemas import LabReportOut
from app.auth import get_current_user


router = APIRouter(
    prefix="/api/reports",
    tags=["reports"],
)


# Folder where uploaded PDF files will be stored
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/app/
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# GET ALL REPORTS
# ============================================================

@router.get(
    "",
    response_model=List[LabReportOut]
)
def list_reports(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    reports = (
        db.query(LabReport)
        .order_by(LabReport.id.desc())
        .all()
    )

    return reports


# ============================================================
# GET ONE REPORT
# ============================================================

@router.get(
    "/{report_id}",
    response_model=LabReportOut
)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    report = (
        db.query(LabReport)
        .filter(LabReport.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    return report


# ============================================================
# UPLOAD PDF REPORT
# ============================================================

@router.post(
    "/upload"
)
def upload_report(
    patient_id: int = Form(...),
    report_name: str = Form(...),
    report_type: str = Form(...),
    uploaded_by: str = Form(...),
    file: UploadFile = File(...),

    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # --------------------------------------------------------
    # Check file type
    # --------------------------------------------------------

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    # --------------------------------------------------------
    # Check patient exists
    # --------------------------------------------------------

    from app.models import Patient

    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # --------------------------------------------------------
    # Create safe file name
    # --------------------------------------------------------

    original_name = Path(file.filename or "report.pdf").name

    safe_name = (
        f"patient_{patient_id}_"
        f"{original_name.replace(' ', '_')}"
    )

    file_path = UPLOAD_DIR / safe_name

    # --------------------------------------------------------
    # Save PDF to uploads folder
    # --------------------------------------------------------

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save uploaded file: {str(e)}"
        )

    # --------------------------------------------------------
    # Create database record
    # --------------------------------------------------------

    report = LabReport(
        patient_id=patient_id,
        report_name=report_name,
        report_type=report_type,
        file_path=str(file_path),
        status="Uploaded",
        ai_summary=None,
        needs_doctor_review="true",
        uploaded_by=uploaded_by,
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    # --------------------------------------------------------
    # Return upload information
    # --------------------------------------------------------

    return {
        "message": "Report uploaded successfully",

        "report": {
            "id": report.id,
            "patient_id": report.patient_id,
            "report_name": report.report_name,
            "report_type": report.report_type,
            "status": report.status,
            "uploaded_by": report.uploaded_by,
        },

        "next_step": (
            "Run the CareFlow AI workflow to "
            "summarize this document."
        ),
    }