"""Metrics router — agent-only dashboard statistics."""
import statistics

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from core.dependencies import require_agent
from database import get_db
from models.ticket import Ticket
from models.user import User

router = APIRouter()


@router.get("/metrics")
def get_metrics(
    current_user: User = Depends(require_agent),
    db: Session = Depends(get_db),
):
    # 1. Total tickets by status
    status_rows = db.query(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status).all()
    by_status = {status.value: count for status, count in status_rows}

    # 2. Tickets by category (use final_category — always populated)
    category_rows = db.query(Ticket.final_category, func.count(Ticket.id)).group_by(Ticket.final_category).all()
    by_category = {cat.value: count for cat, count in category_rows}

    # 3. Median resolution time (SQLite has no MEDIAN — compute in Python)
    resolved_tickets = db.query(Ticket).filter(Ticket.resolved_at.isnot(None)).all()
    if resolved_tickets:
        durations = [
            (t.resolved_at - t.created_at).total_seconds()
            for t in resolved_tickets
        ]
        median_seconds = statistics.median(durations)
    else:
        median_seconds = None

    # 4. AI override percentage (ai_category != final_category)
    total = db.query(func.count(Ticket.id)).scalar() or 0
    overridden = db.query(func.count(Ticket.id)).filter(Ticket.ai_category != Ticket.final_category).scalar() or 0
    override_pct = round((overridden / total * 100), 1) if total > 0 else 0.0

    return {
        "by_status": by_status,
        "by_category": by_category,
        "median_resolution_seconds": median_seconds,
        "ai_override_percentage": override_pct,
    }
