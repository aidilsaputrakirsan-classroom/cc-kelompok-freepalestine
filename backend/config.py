"""
Application Configuration — Modul 11
Membaca environment variables dengan fallback ke default values.
Memisahkan config development vs production.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings — dibaca dari environment variables."""

    # General
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = ENVIRONMENT == "development"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres123@localhost:5432/cloudapp"
    )

    # Auth / JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production-min-32-chars")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # CORS
    ALLOWED_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:3000"
        ).split(",")
    ]

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "DEBUG" if DEBUG else "INFO")

    # Service info
    SERVICE_NAME: str = "cloudapp-backend"
    VERSION: str = "1.0.0"


settings = Settings()
