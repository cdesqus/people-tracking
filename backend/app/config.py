from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application configuration settings"""

    # Database
    database_url: str = "postgresql://user:password@localhost:5432/cctv_db"
    echo_sql: bool = False

    # Redis
    redis_url: str = "redis://localhost:6379"

    # AWS
    aws_region: str = "us-east-1"
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None

    # Application
    app_env: str = "development"
    debug: bool = True
    secret_key: str = "dev-secret-key-change-in-production"
    allowed_hosts: list[str] = ["localhost", "127.0.0.1"]

    # API
    api_title: str = "CCTV Face Recognition Dashboard"
    api_version: str = "1.0.0"
    api_description: str = "Real-time face recognition and tracking system"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]
    cors_allow_credentials: bool = True
    cors_allow_methods: list[str] = ["*"]
    cors_allow_headers: list[str] = ["*"]

    # File Upload
    max_upload_size: int = 52428800  # 50MB
    upload_dir: str = "./uploads"

    # Face Recognition
    confidence_threshold: float = 0.9
    max_faces_per_image: int = 10
    face_match_threshold: float = 0.6

    # Alert Configuration
    alert_retention_days: int = 30

    # Logging
    log_level: str = "INFO"
    log_dir: str = "./logs"

    class Config:
        env_file = ".env"
        case_sensitive = False

    def get_database_url(self) -> str:
        """Get database URL for async connections"""
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.database_url


# Create settings instance
settings = Settings()
