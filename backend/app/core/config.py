"""CyberAI-Expert v8.0 — Configuration"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database - CockroachDB for Agentic Memory
    database_url: str = "postgresql+asyncpg://cyberai:CyberAI_S3cur3_2024!@cockroachdb:26257/cyberai_soc?sslmode=disable"
    database_url_sync: str = "postgresql://cyberai:CyberAI_S3cur3_2024!@cockroachdb:26257/cyberai_soc?sslmode=disable"

    # Auth
    secret_key: str = "cyberai-jwt-secret-v8"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 12
    api_key_admin: str = "cyberai-admin-key-v8-2024"
    api_key_analyst: str = "cyberai-analyst-key-v8-2024"

    # Services
    elasticsearch_url: str = "http://elasticsearch:9200"
    kafka_broker: str = "kafka:29092"
    redis_url: str = "redis://:Redis_CyberAI_2024!@redis:6379/0"
    influxdb_url: str = "http://influxdb:8086"
    influxdb_token: str = ""
    influxdb_org: str = "cyberai-org"
    influxdb_bucket: str = "cyberai-metrics"
    mlflow_tracking_uri: str = "http://mlflow:5050"

    # MinIO
    minio_endpoint: str = "minio:9000"
    minio_access_key: str = "cyberai-minio"
    minio_secret_key: str = "MinIO_CyberAI_S3cure_2024!"

    # Celery
    celery_broker_url: str = "redis://:Redis_CyberAI_2024!@redis:6379/1"
    celery_result_backend: str = "redis://:Redis_CyberAI_2024!@redis:6379/2"

    # CORS
    cors_origins: str = "http://localhost:3001,http://localhost:80,http://localhost"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
