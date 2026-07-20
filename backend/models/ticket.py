import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


class TicketStatus(str, enum.Enum):
    open = "open"
    resolved = "resolved"


class TicketCategory(str, enum.Enum):
    IT = "IT"
    HR = "HR"
    Finance = "Finance"
    Admin = "Admin"
    Other = "Other"


class TicketPriority(str, enum.Enum):
    Low = "Low"
    Medium = "Medium"
    High = "High"


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    attachment_filename = Column(String(255), nullable=True)
    status = Column(Enum(TicketStatus), default=TicketStatus.open, nullable=False)

    # AI suggested
    ai_category = Column(Enum(TicketCategory), nullable=True)
    ai_priority = Column(Enum(TicketPriority), nullable=True)

    # Agent override
    final_category = Column(Enum(TicketCategory), nullable=True)
    final_priority = Column(Enum(TicketPriority), nullable=True)

    # Replies
    ai_draft_reply = Column(Text, nullable=True)
    ai_draft_citations = Column(Text, nullable=True)  # stored as JSON string
    final_reply = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    creator = relationship("User", back_populates="tickets")
    audit_logs = relationship("AuditLog", back_populates="ticket")
