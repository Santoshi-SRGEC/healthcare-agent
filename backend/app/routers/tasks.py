"""Task routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Task
from app.schemas import TaskCreate, TaskOut
from app.auth import require_role, get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Admins/doctors see all; others see their own role's tasks
    if user.role in ("admin", "doctor"):
        return db.query(Task).order_by(Task.id.desc()).all()
    return db.query(Task).filter(Task.assigned_to == user.role).order_by(Task.id.desc()).all()


@router.post("", response_model=TaskOut)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    user=Depends(require_role("doctor", "admin")),
):
    t = Task(**payload.dict())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.patch("/{task_id}/status")
def update_task_status(
    task_id: int,
    status: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    t = db.query(Task).filter(Task.id == task_id).first()
    if not t:
        raise HTTPException(404, "Task not found")
    t.status = status
    db.commit()
    return {"ok": True, "status": t.status}