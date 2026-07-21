"""In-memory event bus for Server-Sent Events (SSE)."""
import queue
from typing import Any


class EventBus:
    """Thread-safe pub/sub using stdlib queue.Queue.

    Safe to call publish() from FastAPI's sync threadpool endpoints.
    The async SSE generator polls with get_nowait() + asyncio.sleep().
    """

    def __init__(self) -> None:
        self._subscribers: set[queue.Queue] = set()

    def subscribe(self) -> queue.Queue:
        q: queue.Queue = queue.Queue(maxsize=100)
        self._subscribers.add(q)
        return q

    def unsubscribe(self, q: queue.Queue) -> None:
        self._subscribers.discard(q)

    def publish(self, event_type: str, data: dict) -> None:
        event = {"type": event_type, "data": data}
        for q in list(self._subscribers):
            try:
                q.put_nowait(event)
            except queue.Full:
                pass  # Drop if subscriber is slow


event_bus = EventBus()
