"""CareFlow AI — FastAPI entry point."""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import Base, engine

# Import routers
from app.routers import (
    auth,
    patients,
    appointments,
    tasks,
    reports,
    ai_workflow,
    notifications,
    followups,
    prescriptions,
    documents,
    audit_logs,
    users,
)

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Powered Healthcare Workflow & Care Coordination Platform",
)

# ============================================================
# CORS — allows localhost (dev) + deployed frontend (prod)
# ============================================================

# Always allow these for local development
default_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
]

# Production frontend URL — set this on Render as FRONTEND_URL
frontend_url = os.getenv("FRONTEND_URL", "").strip()
if frontend_url:
    default_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=default_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # allow any Vercel preview URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# ROUTES
# ============================================================

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(tasks.router)
app.include_router(reports.router)
app.include_router(ai_workflow.router)
app.include_router(notifications.router)
app.include_router(followups.router)
app.include_router(prescriptions.router)
app.include_router(documents.router)
app.include_router(audit_logs.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}