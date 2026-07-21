"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearAuth } from "@/lib/auth";
import { TicketCategory, TicketPriority } from "@/types";
import TicketDetailView from "@/components/tickets/TicketDetail";
import { useTicketDetail } from "@/hooks/useTickets";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToast } = useToast();
  const ticketId = Number(params.id);
  const [user, setUserState] = useState<ReturnType<typeof getUser>>(null);
  const [saving, setSaving] = useState(false);
  const draftRequested = React.useRef(false);
  const { ticket, loading, error, load, generateDraft, updateClassification, sendReply } =
    useTicketDetail(ticketId);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.replace("/login");
    } else if (currentUser.role !== "agent") {
      router.replace("/my-tickets");
    } else if (Number.isNaN(ticketId)) {
      router.replace("/dashboard");
    } else {
      setUserState(currentUser);
      load();
    }
  }, [router, ticketId, load]);

  const run = async (action: () => Promise<unknown>) => {
    setSaving(true);
    try {
      await action();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "An error occurred", "error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!ticket || ticket.status === "resolved" || ticket.ai_draft_reply || saving || draftRequested.current) {
      return;
    }
    draftRequested.current = true;
    run(generateDraft);
  }, [ticket, saving, generateDraft]);

  if (!user) return null;

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto" }}>
      {error && (
        <p style={{ color: "var(--danger)", marginBottom: "var(--space-4)" }}>
          {error}
        </p>
      )}
      {loading ? (
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          <Skeleton width="150px" height="20px" />
          <div style={{ display: "flex", gap: "var(--space-4)" }}>
            <Skeleton variant="circle" width="80px" height="80px" />
            <div style={{ flex: 1, display: "grid", gap: "var(--space-2)" }}>
              <Skeleton width="60%" height="32px" />
              <Skeleton width="100%" height="16px" />
            </div>
          </div>
          <Skeleton width="100%" height="150px" />
          <Skeleton width="100%" height="300px" />
        </div>
      ) : ticket ? (
        <TicketDetailView
          ticket={ticket}
          saving={saving}
          onGenerateDraft={() => run(generateDraft)}
          onSaveClassification={(category: TicketCategory, priority: TicketPriority) =>
            run(() => updateClassification({ final_category: category, final_priority: priority }))
          }
          onSendReply={(reply: string, category: TicketCategory, priority: TicketPriority) =>
            run(() =>
              sendReply({
                final_reply: reply,
                final_category: category,
                final_priority: priority,
              })
            )
          }
        />
      ) : (
        <p style={{ color: "var(--text-muted)" }}>Ticket not found.</p>
      )}
    </div>
  );
}
