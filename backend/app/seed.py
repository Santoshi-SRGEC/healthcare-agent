"""Seed database with demo data."""
from app.database import SessionLocal, Base, engine
from app.models import User, Patient, Appointment, Task, LabReport
from app.auth import hash_password
from datetime import datetime, timedelta

# Ensure tables exist
Base.metadata.create_all(bind=engine)


DEMO_PASSWORD = "demo123"


def seed():
    db = SessionLocal()

    if db.query(User).count() > 0:
        print("✅ Database already seeded. Skipping.")
        db.close()
        return

    # ---------- USERS ----------
    users = [
        ("receptionist@careflow.ai", "Anita Receptionist", "receptionist"),
        ("doctor@careflow.ai", "Dr. Meera Sharma", "doctor"),
        ("lab@careflow.ai", "Ravi LabTech", "lab"),
        ("pharmacy@careflow.ai", "Sunil Pharmacist", "pharmacy"),
        ("admin@careflow.ai", "Kiran Admin", "admin"),
    ]
    for email, name, role in users:
        db.add(User(
            email=email,
            name=name,
            role=role,
            password_hash=hash_password(DEMO_PASSWORD),
            organization="City General Hospital",
        ))
    db.commit()

    # ---------- PATIENTS ----------
    patients_data = [
        ("Ravi Kumar", 42, "Male", "+91-9876543210"),
        ("Anita Reddy", 35, "Female", "+91-9876543211"),
        ("Suresh Nair", 58, "Male", "+91-9876543212"),
        ("Lakshmi Iyer", 6, "Female", "+91-9876543213"),
        ("Karan Mehta", 29, "Male", "+91-9876543214"),
    ]
    for i, (name, age, gender, phone) in enumerate(patients_data, start=1):
        db.add(Patient(
            patient_code=f"PAT-{i:04d}",
            name=name,
            age=age,
            gender=gender,
            phone=phone,
            email=f"{name.lower().replace(' ', '.')}@example.com",
            address="Hyderabad, India",
            status="Active",
        ))
    db.commit()

    # ---------- APPOINTMENTS ----------
    now = datetime.utcnow()
    appointments = [
        (1, "Dr. Meera Sharma", "General", now + timedelta(hours=2), "Confirmed"),
        (2, "Dr. Arjun Patel", "Cardiology", now + timedelta(hours=4), "Pending"),
        (3, "Dr. Meera Sharma", "General", now + timedelta(hours=6), "Confirmed"),
        (4, "Dr. Kavita Rao", "Pediatrics", now + timedelta(days=1), "Pending"),
    ]
    for pid, doc, dept, when, status in appointments:
        db.add(Appointment(
            patient_id=pid, doctor_name=doc, department=dept,
            scheduled_at=when, status=status,
        ))
    db.commit()

    # ---------- TASKS ----------
    tasks = [
        ("Review CBC report", 1, "doctor", "Clinical", "High", "Needs Approval"),
        ("Process prescription", 3, "pharmacy", "Pharmacy", "Medium", "Pending"),
        ("Confirm follow-up slot", 2, "receptionist", "Reception", "High", "In Progress"),
        ("Upload LFT report", 4, "lab", "Laboratory", "Medium", "Pending"),
    ]
    for title, pid, role, dept, prio, status in tasks:
        db.add(Task(
            title=title, patient_id=pid, assigned_to=role,
            department=dept, priority=prio, status=status,
        ))
    db.commit()

    # ---------- LAB REPORTS ----------
    reports = [
        (1, "CBC_Report_Ravi.pdf", "CBC"),
        (3, "LFT_Report_Suresh.pdf", "LFT"),
        (4, "XRay_Lakshmi.pdf", "X-Ray"),
    ]
    for pid, name, rtype in reports:
        db.add(LabReport(
            patient_id=pid, report_name=name, report_type=rtype,
            status="Uploaded", uploaded_by="Ravi LabTech",
            needs_doctor_review="true",
        ))
    db.commit()

    print("✅ Seeded:")
    print(f"   - {len(users)} users")
    print(f"   - {len(patients_data)} patients")
    print(f"   - {len(appointments)} appointments")
    print(f"   - {len(tasks)} tasks")
    print(f"   - {len(reports)} lab reports")
    print(f"\n   Login password for ALL users: {DEMO_PASSWORD}")
    db.close()


if __name__ == "__main__":
    seed()