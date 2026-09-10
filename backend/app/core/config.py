"""Application configuration.

Secrets and environment-specific values are read from environment variables.
Never hardcode production secrets in source code.
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API / Server
    app_name: str = "CareFlow AI"
    app_version: str = "1.0.0"
    debug: bool = True
    openrouter_api_key: str = ""

    # CORS
    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    # Database (placeholder for future PostgreSQL integration)
    database_url: str = os.getenv("DATABASE_URL", "")

    # AI / LLM (placeholder for future LLM API integration)
    llm_api_key: str = os.getenv("LLM_API_KEY", "")
    llm_model: str = os.getenv("LLM_MODEL", "gpt-4o")

    # Auth (placeholder for future real authentication)
    jwt_secret: str = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    # Rate limiting (placeholder)
    rate_limit_per_minute: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
