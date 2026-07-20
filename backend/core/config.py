from typing import List
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
    GROQ_MODEL: str = "llama3-8b-8192"

    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "quickdesk-kb"
    PINECONE_ENVIRONMENT: str = "us-east-1-aws"

    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 1536

    SEED_AGENT_EMAIL: str = "agent@quickdesk.com"
    SEED_AGENT_PASSWORD: str = "Agent@123"
    SEED_EMPLOYEE_EMAIL: str = "employee@quickdesk.com"
    SEED_EMPLOYEE_PASSWORD: str = "Employee@123"


settings = Settings()
