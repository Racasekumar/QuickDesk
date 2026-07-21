import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from core.dependencies import require_agent, require_employee
from database import get_db
from models.ticket import Ticket, TicketCategory, TicketPriority, TicketStatus
from models.user import User
from models.audit_log import AuditLog
from schemas.ticket import ClassificationUpdate, ReplyCreate, TicketCreate, TicketDetailOut, TicketOut
from services.ai_service import suggest_ticket_details
from services.rag_service import RagUnavailableError, generate_draft
from services.event_bus import event_bus

router = APIRouter()


@router.post("", response_model=TicketOut, status_code=201)
def create_ticket(
    payload: TicketCreate,
    current_user: User = Depends(require_employee),
    db: Session = Depends(get_db),
):
    suggestion = suggest_ticket_details(payload.title, payload.description)
    ticket = Ticket(
        title=payload.title,
        description=payload.description,
        attachment_filename=payload.attachment_filename,
        ai_category=TicketCategory(suggestion.category),
        ai_priority=TicketPriority(suggestion.priority),
        final_category=TicketCategory(suggestion.category),
        final_priority=TicketPriority(suggestion.priority),
        created_by=current_user.id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    event_bus.publish("ticket_created", TicketOut.model_validate(ticket).model_dump(mode="json"))
    return ticket


@router.get("/mine", response_model=list[TicketOut])
def get_my_tickets(
    current_user: User = Depends(require_employee),
    db: Session = Depends(get_db),
):
    return (
        db.query(Ticket)
        .options(joinedload(Ticket.creator))
        .filter(Ticket.created_by == current_user.id)
        .order_by(Ticket.created_at.desc())
        .all()
    )


@router.get("/mine/{ticket_id}", response_model=TicketDetailOut)
def get_my_ticket_detail(
    ticket_id: int,
    current_user: User = Depends(require_employee),
    db: Session = Depends(get_db),
):
    ticket = (
        db.query(Ticket)
        .options(joinedload(Ticket.creator), joinedload(Ticket.audit_logs).joinedload(AuditLog.agent))
        .filter(Ticket.id == ticket_id, Ticket.created_by == current_user.id)
        .first()
    )
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return _detail(ticket)


@router.get("", response_model=list[TicketOut])
def get_all_tickets(
    status: Optional[TicketStatus] = None,
    category: Optional[TicketCategory] = None,
    priority: Optional[TicketPriority] = None,
    search: Optional[str] = Query(default=None, max_length=255),
    current_user: User = Depends(require_agent),
    db: Session = Depends(get_db),
):
    query = db.query(Ticket).options(joinedload(Ticket.creator))
    if status:
        query = query.filter(Ticket.status == status)
    if category:
        query = query.filter(Ticket.final_category == category)
    if priority:
        query = query.filter(Ticket.final_priority == priority)
    if search:
        query = query.filter(Ticket.title.ilike(f"%{search}%"))
    return query.order_by(Ticket.created_at.desc()).all()


def _get_ticket_or_404(ticket_id: int, db: Session) -> Ticket:
    ticket = (
        db.query(Ticket)
        .options(joinedload(Ticket.creator), joinedload(Ticket.audit_logs).joinedload(AuditLog.agent))
        .filter(Ticket.id == ticket_id)
        .first()
    )
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


def _detail(ticket: Ticket) -> dict:
    data = TicketDetailOut.model_validate(ticket).model_dump()
    data["ai_draft_citations"] = json.loads(ticket.ai_draft_citations or "[]")
    return data


@router.get("/{ticket_id}", response_model=TicketDetailOut)
def get_ticket_detail(
    ticket_id: int,
    current_user: User = Depends(require_agent),
    db: Session = Depends(get_db),
):
    return _detail(_get_ticket_or_404(ticket_id, db))


@router.post("/{ticket_id}/draft", response_model=TicketDetailOut)
def create_draft(
    ticket_id: int,
    current_user: User = Depends(require_agent),
    db: Session = Depends(get_db),
):
    ticket = _get_ticket_or_404(ticket_id, db)
    if ticket.status == TicketStatus.resolved:
        raise HTTPException(status_code=409, detail="Resolved tickets cannot receive a new draft")
    try:
        draft, citations = generate_draft(ticket.title, ticket.description, ticket.created_by, ticket.id)
    except RagUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Could not generate AI draft") from exc
    ticket.ai_draft_reply = draft
    ticket.ai_draft_citations = json.dumps(citations)
    db.commit()
    db.refresh(ticket)
    return _detail(_get_ticket_or_404(ticket_id, db))


def _apply_classification(ticket: Ticket, update: ClassificationUpdate, agent_id: int, db: Session) -> None:
    changes = (("category", "final_category", update.final_category), ("priority", "final_priority", update.final_priority))
    for field, attribute, new_value in changes:
        if new_value is None:
            continue
        old_value = getattr(ticket, attribute)
        if old_value and old_value.value == new_value:
            continue
        db.add(AuditLog(
            ticket_id=ticket.id,
            agent_id=agent_id,
            field=field,
            from_value=old_value.value if old_value else "",
            to_value=new_value,
        ))
        enum_type = TicketCategory if field == "category" else TicketPriority
        setattr(ticket, attribute, enum_type(new_value))


@router.patch("/{ticket_id}/classification", response_model=TicketDetailOut)
def update_classification(
    ticket_id: int,
    payload: ClassificationUpdate,
    current_user: User = Depends(require_agent),
    db: Session = Depends(get_db),
):
    ticket = _get_ticket_or_404(ticket_id, db)
    _apply_classification(ticket, payload, current_user.id, db)
    db.commit()
    return _detail(_get_ticket_or_404(ticket_id, db))


@router.post("/{ticket_id}/reply", response_model=TicketDetailOut)
def send_reply_and_resolve(
    ticket_id: int,
    payload: ReplyCreate,
    current_user: User = Depends(require_agent),
    db: Session = Depends(get_db),
):
    ticket = _get_ticket_or_404(ticket_id, db)
    if ticket.status == TicketStatus.resolved:
        raise HTTPException(status_code=409, detail="Ticket is already resolved")
    _apply_classification(ticket, ClassificationUpdate(final_category=payload.final_category, final_priority=payload.final_priority), current_user.id, db)
    ticket.final_reply = payload.final_reply
    ticket.status = TicketStatus.resolved
    ticket.resolved_at = datetime.utcnow()
    db.commit()
    event_bus.publish("ticket_resolved", {"id": ticket.id, "status": "resolved", "resolved_at": ticket.resolved_at.isoformat() if ticket.resolved_at else None, "created_by": ticket.created_by})
    return _detail(_get_ticket_or_404(ticket_id, db))
