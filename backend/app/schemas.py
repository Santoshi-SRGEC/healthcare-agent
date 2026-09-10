"""Pydantic schemas for API input/output."""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: str
    password: str
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ---------- Patient ----------
class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None


class PatientOut(BaseModel):
    id: int
    patient_code: str
    name: str
    age: int
    gender: str
    phone: str
    email: Optional[str]
    address: Optional[str]
    status: str

    class Config:
        from_attributes = True


# ---------- Appointment ----------
class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_name: str
    department: str
    scheduled_at: datetime
    notes: Optional[str] = None


class AppointmentOut(BaseModel):
    id: int
    patient_id: int
    doctor_name: str
    department: str
    scheduled_at: datetime
    status: str

    class Config:
        from_attributes = True


# ---------- Task ----------
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    patient_id: Optional[int] = None
    assigned_to: str
    department: str
    priority: str = "Medium"
    due_date: Optional[datetime] = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    patient_id: Optional[int]
    assigned_to: str
    department: str
    priority: str
    status: str
    due_date: Optional[datetime]

    class Config:
        from_attributes = True


# ---------- Lab Report ----------
class LabReportOut(BaseModel):
    id: int
    patient_id: int
    report_name: str
    report_type: str
    status: str
    ai_summary: Optional[str]
    needs_doctor_review: str
    uploaded_by: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ---------- AI Workflow ----------
class AIWorkflowRequest(BaseModel):
    patient_id: int
    action: str  # "summarize_report" | "suggest_followup" | "check_pending"