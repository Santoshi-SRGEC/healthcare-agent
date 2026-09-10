"""CareFlow AI Agent - workflow assistance and document summarization."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Patient, LabReport, Task
from app.schemas import AIWorkflowRequest
from app.auth import require_role

from app.agents.careflow_agent import (
    extract_pdf_text,
    summarize_medical_document,
)

router = APIRouter(prefix="/api/ai", tags=["ai_workflow"])


# ============================================================
# STATUS
# ============================================================

@router.get("/status")
def agent_status(
    user=Depends(require_role("doctor", "admin", "lab"))
):
    return {
        "agent": "CareFlow AI Workflow Coordinator",
        "status": "Active",
        "capabilities": [
            "read_medical_documents",
            "summarize_documents",
            "identify_pending_workflow_actions",
            "create_workflow_tasks",
            "suggest_followups",
        ],
        "restrictions": [
            "no_diagnosis",
            "no_prescribing",
            "no_unsupervised_clinical_decisions",
        ],
        "human_approval_required_for": [
            "doctor_review",
            "appointment_scheduling",
            "clinical_decisions",
        ],
    }


# ============================================================
# RUN WORKFLOW
# ============================================================

@router.post("/run")
def run_workflow(
    payload: AIWorkflowRequest,
    db: Session = Depends(get_db),
    user=Depends(require_role("doctor", "admin")),
):
    # STEP 1: Get patient
    patient = (
        db.query(Patient)
        .filter(Patient.id == payload.patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    steps = []

    steps.append({
        "step": 1,
        "action": "Retrieved patient context",
        "status": "done",
    })

    # STEP 2: Get patient's reports
    reports = (
        db.query(LabReport)
        .filter(LabReport.patient_id == payload.patient_id)
        .order_by(LabReport.id.desc())
        .all()
    )

    steps.append({
        "step": 2,
        "action": f"Retrieved {len(reports)} lab report(s)",
        "status": "done",
    })

    # ---------------------------------------------------------
    # ACTION 1: SUMMARIZE REPORT
    # ---------------------------------------------------------

    if payload.action == "summarize_report":

        if not reports:
            return {
                "workflow": "summarize_report",
                "result": "No reports found for this patient.",
                "steps": steps,
                "human_approval_required": False,
            }

        latest = reports[0]

        if not latest.file_path:
            raise HTTPException(
                status_code=400,
                detail="This report does not have a PDF file attached."
            )

        try:
            document_text = extract_pdf_text(latest.file_path)

            steps.append({
                "step": 3,
                "action": "Extracted text from medical document",
                "status": "done",
            })

            summary = summarize_medical_document(
                document_text=document_text,
                patient_name=patient.name,
                report_name=latest.report_name,
                report_type=latest.report_type,
            )

            steps.append({
                "step": 4,
                "action": "AI generated document summary",
                "status": "done",
            })

        except FileNotFoundError:
            raise HTTPException(
                status_code=404,
                detail="Uploaded report file was not found."
            )

        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=str(e))

        # Save AI summary to database
        latest.ai_summary = summary
        latest.status = "Under Review"
        latest.needs_doctor_review = "true"

        db.commit()

        steps.append({
            "step": 5,
            "action": "Saved AI summary to database",
            "status": "done",
        })

        # Create doctor review task
        task = Task(
            title=f"Review {latest.report_type} report for {patient.name}",
            description=(
                "AI generated a workflow summary for this report. "
                "Doctor must review the original report and AI summary. "
                "Clinical decisions remain with the doctor."
            ),
            patient_id=patient.id,
            assigned_to="doctor",
            department="Clinical",
            priority="High",
            status="Needs Approval",
            due_date=datetime.utcnow(),
        )

        db.add(task)
        db.commit()
        db.refresh(task)

        steps.append({
            "step": 6,
            "action": "Created doctor review task",
            "status": "done",
        })

        steps.append({
            "step": 7,
            "action": "Waiting for human/doctor approval",
            "status": "pending",
        })

        return {
            "workflow": "summarize_report",
            "patient": {
                "id": patient.id,
                "name": patient.name,
            },
            "report": {
                "id": latest.id,
                "name": latest.report_name,
                "type": latest.report_type,
            },
            "ai_summary": summary,
            "task_created": {
                "id": task.id,
                "title": task.title,
                "status": task.status,
            },
            "steps": steps,
            "human_approval_required": True,
            "disclaimer": (
                "AI-generated workflow summary only. "
                "This is not a diagnosis or medical advice. "
                "Qualified healthcare staff must verify the original document."
            ),
        }

    # ---------------------------------------------------------
    # ACTION 2: CHECK PENDING WORK
    # ---------------------------------------------------------

    if payload.action == "check_pending":

        pending_tasks = (
            db.query(Task)
            .filter(
                Task.patient_id == patient.id,
                Task.status != "Completed",
            )
            .all()
        )

        steps.append({
            "step": 3,
            "action": f"Found {len(pending_tasks)} pending task(s)",
            "status": "done",
        })

        return {
            "workflow": "check_pending",
            "patient": {
                "id": patient.id,
                "name": patient.name,
            },
            "pending_tasks": [
                {
                    "id": task.id,
                    "title": task.title,
                    "status": task.status,
                    "priority": task.priority,
                }
                for task in pending_tasks
            ],
            "steps": steps,
            "human_approval_required": False,
        }

    # ---------------------------------------------------------
    # UNKNOWN ACTION
    # ---------------------------------------------------------

    raise HTTPException(
        status_code=400,
        detail=f"Unknown action: {payload.action}",
    )


# ============================================================
# SUMMARIZE A SPECIFIC REPORT BY ID
# ============================================================

@router.post("/summarize-report/{report_id}")
def summarize_report(
    report_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role("doctor", "lab", "admin")),
):
    """
    Summarize a specific lab report PDF using the CareFlow AI agent.
    Creates a doctor review task. Requires human approval for clinical decisions.
    """

    # STEP 1: Find report
    report = (
        db.query(LabReport)
        .filter(LabReport.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.file_path:
        raise HTTPException(
            status_code=400,
            detail="This report has no PDF file attached."
        )

    # STEP 2: Find patient
    patient = (
        db.query(Patient)
        .filter(Patient.id == report.patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    steps = []

    steps.append({
        "step": 1,
        "action": "Retrieved report context from database",
        "status": "done",
    })

    # STEP 3: Extract text from PDF
    try:
        document_text = extract_pdf_text(report.file_path)
        steps.append({
            "step": 2,
            "action": "Extracted text from PDF",
            "status": "done",
        })
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Uploaded PDF file not found on disk."
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # STEP 4: Send to LLM
    try:
        summary = summarize_medical_document(
            document_text=document_text,
            patient_name=patient.name,
            report_name=report.report_name,
            report_type=report.report_type,
        )
        steps.append({
            "step": 3,
            "action": "AI generated workflow summary",
            "status": "done",
        })
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # STEP 5: Save summary
    report.ai_summary = summary
    report.status = "Under Review"
    report.needs_doctor_review = "true"
    db.commit()

    steps.append({
        "step": 4,
        "action": "Saved AI summary to database",
        "status": "done",
    })

    # STEP 6: Create doctor review task
    task = Task(
        title=f"Review {report.report_type} report for {patient.name}",
        description=(
            "AI generated a workflow summary. Doctor must verify against "
            "the original report. Clinical decisions remain with the doctor."
        ),
        patient_id=patient.id,
        assigned_to="doctor",
        department="Clinical",
        priority="High",
        status="Needs Approval",
        due_date=datetime.utcnow(),
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    steps.append({
        "step": 5,
        "action": "Created doctor review task",
        "status": "done",
    })

    steps.append({
        "step": 6,
        "action": "Waiting for doctor approval",
        "status": "pending",
    })

    return {
        "workflow": "summarize_report_by_id",
        "report": {
            "id": report.id,
            "name": report.report_name,
            "type": report.report_type,
        },
        "patient": {
            "id": patient.id,
            "name": patient.name,
        },
        "ai_summary": summary,
        "task_created": {
            "id": task.id,
            "title": task.title,
            "status": task.status,
        },
        "steps": steps,
        "human_approval_required": True,
        "disclaimer": (
            "AI-generated workflow summary only. Not a diagnosis. "
            "Verify against original report. Clinical decisions remain "
            "with the doctor."
        ),
    }


# ============================================================
# LIST RECENT WORKFLOWS (for frontend AI Workflow page)
# ============================================================

@router.get("/workflows")
def list_workflows(
    db: Session = Depends(get_db),
    user=Depends(require_role("doctor", "lab", "admin", "receptionist", "pharmacy")),
):
    """Return recent AI-generated tasks as workflow instances."""
    tasks = (
        db.query(Task)
        .filter(Task.status.in_(["Needs Approval", "Needs Review"]))
        .order_by(Task.id.desc())
        .limit(20)
        .all()
    )

    patients = db.query(Patient).all()
    name_by_id = {p.id: p.name for p in patients}

    return [
        {
            "id": f"wf-{t.id}",
            "trigger": t.title,
            "patientId": str(t.patient_id) if t.patient_id else "",
            "patientName": name_by_id.get(t.patient_id, "") if t.patient_id else "",
            "status": "In Progress",
            "createdAt": t.due_date.strftime("%d %b %Y, %H:%M") if t.due_date else "",
            "suggestion": t.description or "",
            "suggestionType": "review",
            "approvalStatus": "pending",
            "steps": [],
            "agentActivity": [],
        }
        for t in tasks
    ]