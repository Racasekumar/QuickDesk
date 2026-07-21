"""SSE events router for real-time ticket updates."""
import asyncio
import json

from fastapi import APIRouter, Depends
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.orm import Session

from core.dependencies import get_current_user_from_query
from database import get_db
from models.user import User
from services.event_bus import event_bus

router = APIRouter()


@router.get("/events/stream")
async def stream_events(
    current_user: User = Depends(get_current_user_from_query),
    db: Session = Depends(get_db),
):
    q = event_bus.subscribe()

    async def event_generator():
        try:
            while True:
                try:
                    event = q.get_nowait()
                    yield {
                        "event": event["type"],
                        "data": json.dumps(event["data"], default=str),
                    }
                except Exception:
                    # queue.Empty — poll again after brief sleep
                    await asyncio.sleep(0.1)
                    yield {"comment": "keep-alive"}
        finally:
            event_bus.unsubscribe(q)

    return EventSourceResponse(event_generator())
