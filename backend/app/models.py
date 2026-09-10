"""Database models — SQLAlchemy ORM."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # receptionist | doctor | lab | pharmacy | admin
    organization = Column(String, default="City General Hospital")
    created_at = Column(DateTime, default=datetime.utcnow)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(String, unique=True, index=True)  # e.g. PAT-0001
    name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)  # Male | Female | Other
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    status = Column(String, default="Active")  # Active | Inactive
    created_at = Column(DateTime, default=datetime.utcnow)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_name = Column(String)
    department = Column(String)
    scheduled_at = Column(DateTime)
    status = Column(String, default="Pending")  # Confirmed | Pending | Completed | Cancelled
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    assigned_to = Column(String)  # role
    department = Column(String)
    priority = Column(String, default="Medium")  # Low | Medium | High
    status = Column(String, default="Pending")  # Pending | In Progress | Completed | Needs Approval
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    report_name = Column(String, nullable=False)
    report_type = Column(String)  # CBC | LFT | X-Ray | etc.
    file_path = Column(String)
    status = Column(String, default="Uploaded")  # Uploaded | Under Review | Reviewed
    ai_summary = Column(Text, nullable=True)
    needs_doctor_review = Column(String, default="true")
    uploaded_by = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_role = Column(String)  # target role
    title = Column(String)
    message = Column(Text)
    is_read = Column(String, default="false")
    created_at = Column(DateTime, default=datetime.utcnow)