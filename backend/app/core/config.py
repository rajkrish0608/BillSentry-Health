"""
BillSentry Health - Application Configuration
Centralized settings loaded from environment variables.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # ── Application ──
    APP_NAME: str = "BillSentry Health"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"

    # ── Database (SQLite default for local dev) ──
    DATABASE_URL: str = "sqlite:///./billsentry_dev.db"

    # ── Redis ──
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── JWT / Auth ──
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_supersecretkey123"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── AWS S3 ──
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "ap-south-1"
    S3_BUCKET_NAME: str = "billsentry-uploads"

    # ── CORS ──
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3005"]

    # ── File Upload ──
    MAX_UPLOAD_SIZE_MB: int = 15

    # ── OCR Config ──
    OCR_PROVIDER: str = "tesseract"  # "tesseract" or "google_vision"
    TESSERACT_CMD: Optional[str] = None  # Path to tesseract binary if not in PATH
    GOOGLE_VISION_API_KEY: Optional[str] = None

    # ── Processing ──
    SYNC_PROCESSING: bool = True  # True = process inline, False = use Celery

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
