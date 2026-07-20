from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "QuickDesk"
    DEBUG: bool = False
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    DATABASE_URL: str = "sqlite:///./quickdesk.db"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "quickdesk-kb"
    PINECONE_ENVIRONMENT: str = "us-east-1-aws"
    PINECONE_NAMESPACE: str = "quickdesk-kb"

    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384
    RAG_RELEVANCE_THRESHOLD: float = 0.35

    SEED_AGENT_EMAIL: str = "agent@quickdesk.com"
    SEED_AGENT_PASSWORD: str = "Agent@123"
    SEED_EMPLOYEE_EMAIL: str = "employee@quickdesk.com"
    SEED_EMPLOYEE_PASSWORD: str = "Employee@123"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def read_debug_value(cls, value):
        # Some Windows/dev tools set DEBUG=release. Treat that as disabled.
        if isinstance(value, str) and value.lower() in {"release", "production", "false", "0", "no"}:
            return False
        return value


settings = Settings()
