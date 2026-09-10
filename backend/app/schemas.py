"""Pydantic schemas for API input/output — with validation."""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime


# ============================================================
# AUTH
# ============================================================

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=200)
    password: str = Field(..., min_length=4, max_length=100)
    role: str = Field(..., min_length=3, max_length=30)

    @field_validator("email")
    @classmethod
    def email_must_have_at(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Please enter a valid email address")
        return v

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        allowed = {"receptionist", "doctor", "lab", "pharmacy", "admin"}
        v = v.strip().lower()
        if v not in allowed:
            raise ValueError(f"Role must be one of: {', '.join(sorted(allowed))}")
        return v


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ============================================================
# PATIENTS
# ============================================================

class PatientCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(..., min_length=3, max_length=10)
    phone: str = Field(..., min_length=10, max_length=15)
    email: Optional[str] = Field(None, max_length=200)
    address: Optional[str] = Field(None, max_length=500)

    @field_validator("name")
    @classmethod
    def name_strip_and_validate(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        if not all(c.isalpha() or c.isspace() or c in ".-'" for c in v):
            raise ValueError("Name contains invalid characters")
        return v

    @field_validator("gender")
    @classmethod
    def gender_valid(cls, v: str) -> str:
        allowed = {"Male", "Female", "Other", "male", "female", "other"}
        v = v.strip()
        if v.lower() not in {"male", "female", "other"}:
            raise ValueError("Gender must be Male, Female, or Other")
        return v.capitalize()

    @field_validator("phone")
    @classmethod
    def phone_valid(cls, v: str) -> str:
        v = v.strip()
        # Allow digits, spaces, dashes, plus
        cleaned = v.replace(" ", "").replace("-", "")
        if cleaned.startswith("+"):
            cleaned = cleaned[1:]
        if not cleaned.isdigit():
            raise ValueError("Phone must contain only digits, spaces, +, and -")
        if len(cleaned) < 10:
            raise ValueError("Phone must be at least 10 digits")
        return v

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v.strip() == "":
            return None
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v


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
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# APPOINTMENTS
# ============================================================

class AppointmentCreate(BaseModel):
    patient_id: int = Field(..., ge=1)
    doctor_name: str = Field(..., min_length=2, max_length=100)
    department: str = Field(..., min_length=2, max_length=50)
    scheduled_at: datetime
    notes: Optional[str] = Field(None, max_length=500)

    @field_validator("scheduled_at")
    @classmethod
    def not_in_past(cls, v: datetime) -> datetime:
        # Allow appointments starting from 1 hour ago (timezone tolerance)
        now = datetime.utcnow()
        if v < now.replace(hour=now.hour - 1):
            raise ValueError("Appointment cannot be scheduled in the past")
        return v

    @field_validator("doctor_name", "department")
    @classmethod
    def strip_strings(cls, v: str) -> str:
        return v.strip()


class AppointmentOut(BaseModel):
    id: int
    patient_id: int
    doctor_name: str
    department: str
    scheduled_at: datetime
    status: str

    class Config:
        from_attributes = True


# ============================================================
# TASKS
# ============================================================

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    patient_id: Optional[int] = Field(None, ge=1)
    assigned_to: str = Field(..., min_length=3, max_length=30)
    department: str = Field(..., min_length=2, max_length=50)
    priority: str = Field("Medium", min_length=3, max_length=10)
    due_date: Optional[datetime] = None

    @field_validator("priority")
    @classmethod
    def priority_valid(cls, v: str) -> str:
        allowed = {"Low", "Medium", "High", "Urgent"}
        v = v.strip().capitalize()
        if v not in allowed:
            raise ValueError(f"Priority must be one of: {', '.join(allowed)}")
        return v

    @field_validator("assigned_to")
    @classmethod
    def assigned_valid(cls, v: str) -> str:
        allowed = {"receptionist", "doctor", "lab", "pharmacy", "admin"}
        v = v.strip().lower()
        if v not in allowed:
            raise ValueError("assigned_to must be a valid role")
        return v

    @field_validator("title")
    @classmethod
    def title_strip(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Title must be at least 3 characters")
        return v


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


# ============================================================
# LAB REPORTS
# ============================================================

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


# ============================================================
# AI WORKFLOW
# ============================================================

class AIWorkflowRequest(BaseModel):
    patient_id: int = Field(..., ge=1)
    action: str = Field(..., min_length=3, max_length=50)

    @field_validator("action")
    @classmethod
    def action_valid(cls, v: str) -> str:
        allowed = {"summarize_report", "check_pending"}
        v = v.strip().lower()
        if v not in allowed:
            raise ValueError(f"Action must be one of: {', '.join(sorted(allowed))}")
        return v