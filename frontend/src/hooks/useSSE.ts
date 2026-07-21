import { useEffect, useRef } from "react";
import { getToken } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useSSE(onEvent: (type: string, data: any) => void) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const es = new EventSource(`${BASE_URL}/events/stream?token=${token}`);

    const handleEvent = (e: MessageEvent, eventType: string) => {
      try {
        const data = JSON.parse(e.data);
        handlerRef.current(eventType, data);
      } catch {
        // Ignore non-JSON messages (keep-alive)
      }
    };

    es.addEventListener("ticket_created", (e: MessageEvent) => handleEvent(e, "ticket_created"));
    es.addEventListener("ticket_resolved", (e: MessageEvent) => handleEvent(e, "ticket_resolved"));
    es.onmessage = (e: MessageEvent) => handleEvent(e, "message");

    es.onerror = () => {
      // EventSource auto-reconnects natively
    };

    return () => {
      es.close();
    };
  }, []);
}
