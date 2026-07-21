import os
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Explicitly load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = os.getenv("APP_NAME")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in {"true", "1", "yes", "t"}
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS").strip('[]').replace('"', '').replace("'", "").split(",") if os.getenv("CORS_ORIGINS") else ["http://localhost:3000"]

    DATABASE_URL: str = os.getenv("DATABASE_URL")

    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL")

    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY")
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME")
    PINECONE_ENVIRONMENT: str = os.getenv("PINECONE_ENVIRONMENT")
    PINECONE_NAMESPACE: str = os.getenv("PINECONE_NAMESPACE")

    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL")
    EMBEDDING_DIMENSION: int = int(os.getenv("EMBEDDING_DIMENSION"))
    RAG_RELEVANCE_THRESHOLD: float = float(os.getenv("RAG_RELEVANCE_THRESHOLD", "0.35"))

    SEED_AGENT_EMAIL: str = os.getenv("SEED_AGENT_EMAIL")
    SEED_AGENT_PASSWORD: str = os.getenv("SEED_AGENT_PASSWORD")
    SEED_EMPLOYEE_EMAIL: str = os.getenv("SEED_EMPLOYEE_EMAIL")
    SEED_EMPLOYEE_PASSWORD: str = os.getenv("SEED_EMPLOYEE_PASSWORD")

    @field_validator("DEBUG", mode="before")
    @classmethod
    def read_debug_value(cls, value):
        # Some Windows/dev tools set DEBUG=release. Treat that as disabled.
        if isinstance(value, str) and value.lower() in {"release", "production", "false", "0", "no"}:
            return False
        return value


settings = Settings()
