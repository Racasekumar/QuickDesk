from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


Category = Literal["IT", "HR", "Finance", "Admin", "Other"]
Priority = Literal["Low", "Medium", "High"]


class TicketCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=3, max_length=5000)
    attachment_filename: Optional[str] = Field(default=None, max_length=255)


class Categorization(BaseModel):
    """The only category and priority values the application accepts from Groq."""

    category: Category
    priority: Priority


class TicketCreator(BaseModel):
    id: int
    full_name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class TicketOut(BaseModel):
    id: int
    title: str
    description: str
    attachment_filename: Optional[str]
    status: str
    ai_category: Optional[str]
    ai_priority: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]
    creator: TicketCreator

    model_config = ConfigDict(from_attributes=True)


class CitationOut(BaseModel):
    title: str
    filename: str
    last_updated: str = ""


class AuditLogOut(BaseModel):
    id: int
    field: str
    from_value: str
    to_value: str
    changed_at: datetime
    agent: TicketCreator

    model_config = ConfigDict(from_attributes=True)


class TicketDetailOut(TicketOut):
    final_category: Optional[str]
    final_priority: Optional[str]
    ai_draft_reply: Optional[str]
    ai_draft_citations: list[CitationOut] = []
    final_reply: Optional[str]
    audit_logs: list[AuditLogOut] = []

    @field_validator("ai_draft_citations", mode="before")
    @classmethod
    def parse_citations(cls, value):
        if not value:
            return []
        if isinstance(value, str):
            import json
            return json.loads(value)
        return value


class ClassificationUpdate(BaseModel):
    final_category: Optional[Category] = None
    final_priority: Optional[Priority] = None


class ReplyCreate(BaseModel):
    final_reply: str = Field(min_length=1, max_length=10000)
    final_category: Optional[Category] = None
    final_priority: Optional[Priority] = None
