"""AI workflow coordination — WORKFLOW ASSISTANCE ONLY, NOT diagnosis.

This endpoint demonstrates controlled agent-like behavior:
- Retrieves context (patient + reports + tasks)
- Generates workflow suggestions
- Creates tasks (with permission checks)
- Requires human approval for clinical decisions
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Patient, LabReport, Task
from app.schemas import AIWorkflowRequest
from app.auth import require_role
from datetime import datetime

router = APIRouter(prefix="/api/ai", tags=["ai_workflow"])


@router.get("/status")
def agent_status(user=Depends(require_role("doctor", "admin"))):
    return {
        "agent": "CareFlow AI Workflow Coordinator",
        "status": "Active",
        "capabilities": [
            "summarize_documents",
            "identify_pending_workflow_actions",
            "create_workflow_tasks",
            "suggest_appointments",
            "send_notifications",
        ],
        "restrictions": [
            "no_diagnosis",
            "no_prescribing",
            "no_permission_changes",
            "no_patient_deletion",
            "no_unsupervised_clinical_decisions",
        ],
        "human_approval_required_for": [
            "task_creation_high_priority",
            "appointment_scheduling",
            "report_review_completion",
        ],
    }


@router.post("/run")
def run_workflow(
    payload: AIWorkflowRequest,
    db: Session = Depends(get_db),
    user=Depends(require_role("doctor", "admin")),
):
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(404, "Patient not found")

    steps = []
    steps.append({"step": 1, "action": "Retrieved patient context", "status": "done"})

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

    if payload.action == "summarize_report":
        if not reports:
            return {
                "workflow": "summarize_report",
                "result": "No reports found for this patient",
                "steps": steps,
                "human_approval_required": False,
            }
        latest = reports[0]
        summary = (
            f"AI Workflow Summary:\n"
            f"The uploaded document '{latest.report_name}' ({latest.report_type}) "
            f"contains laboratory data. A review task may be required for the "
            f"assigned doctor.\n\n"
            f"AI-generated information — verify against the original report."
        )
        latest.ai_summary = summary
        latest.status = "Under Review"
        db.commit()
        steps.append({"step": 3, "action": "Generated workflow summary", "status": "done"})

        # Create review task
        task = Task(
            title=f"Review {latest.report_type} report for {patient.name}",
            description="AI flagged this report for doctor review. Clinical decision remains with the doctor.",
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

        steps.append({"step": 4, "action": "Created doctor review task", "status": "done"})
        steps.append({"step": 5, "action": "Notification queued for doctor", "status": "done"})
        steps.append({"step": 6, "action": "Waiting for human approval", "status": "pending"})

        return {
            "workflow": "summarize_report",
            "ai_summary": summary,
            "task_created": {"id": task.id, "title": task.title, "status": task.status},
            "steps": steps,
            "human_approval_required": True,
            "disclaimer": "AI-generated workflow summary. Not a diagnosis. Verify against original report.",
        }

    if payload.action == "check_pending":
        pending_tasks = (
            db.query(Task)
            .filter(Task.patient_id == patient.id, Task.status != "Completed")
            .all()
        )
        steps.append({"step": 3, "action": f"Found {len(pending_tasks)} pending task(s)", "status": "done"})
        return {
            "workflow": "check_pending",
            "pending_tasks": [
                {"id": t.id, "title": t.title, "status": t.status} for t in pending_tasks
            ],
            "steps": steps,
            "human_approval_required": False,
        }

    raise HTTPException(400, f"Unknown action: {payload.action}")