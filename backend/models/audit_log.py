from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    field = Column(String(50), nullable=False)       # "category" or "priority"
    from_value = Column(String(50), nullable=False)
    to_value = Column(String(50), nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("Ticket", back_populates="audit_logs")
    agent = relationship("User", back_populates="audit_logs")
