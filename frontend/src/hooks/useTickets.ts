import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import { ClassificationUpdate, ReplyPayload, TicketDetail } from "@/types";

export function useTicketDetail(ticketId: number) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setTicket(await api.get<TicketDetail>(`/tickets/${ticketId}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load ticket");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  const generateDraft = useCallback(async () => {
    setError("");
    try {
      const updated = await api.post<TicketDetail>(`/tickets/${ticketId}/draft`, {});
      setTicket(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not generate draft";
      setError(message);
      throw err;
    }
  }, [ticketId]);

  const updateClassification = useCallback(async (payload: ClassificationUpdate) => {
    setError("");
    try {
      const updated = await api.patch<TicketDetail>(`/tickets/${ticketId}/classification`, payload);
      setTicket(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update classification";
      setError(message);
      throw err;
    }
  }, [ticketId]);

  const sendReply = useCallback(async (payload: ReplyPayload) => {
    setError("");
    try {
      const updated = await api.post<TicketDetail>(`/tickets/${ticketId}/reply`, payload);
      setTicket(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not send reply";
      setError(message);
      throw err;
    }
  }, [ticketId]);

  return { ticket, loading, error, load, generateDraft, updateClassification, sendReply, setError };
}
