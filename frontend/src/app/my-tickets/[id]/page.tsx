"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { TicketDetail as TicketDetailType, TicketCategory, TicketPriority } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [ticket, setTicket] = React.useState<TicketDetailType | null>(null);
  const [loading, setLoading] = React.useState(true);

  const ticketId = params.id as string;

  React.useEffect(() => {
    async function fetchTicket() {
      try {
        const data = await api.get<TicketDetailType>(`/tickets/mine/${ticketId}`);
        setTicket(data);
      } catch (error) {
        console.error(error);
        addToast("Failed to load ticket", "error");
      } finally {
        setLoading(false);
      }
    }
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId, addToast]);

  if (loading) {
    return (
      <div style={{ display: "grid", gap: "var(--space-6)" }}>
        <Skeleton height="24px" width="200px" />
        <div style={{ display: "flex", gap: "var(--space-4)" }}>
          <Skeleton height="80px" width="80px" circle />
          <div style={{ flex: 1 }}>
            <Skeleton height="32px" width="60%" />
            <Skeleton height="16px" width="80%" style={{ marginTop: "var(--space-2)" }} />
          </div>
        </div>
        <Skeleton height="200px" />
      </div>
    );
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  const resolved = ticket.status === "resolved";

  return (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <Link href="/my-tickets" style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
          ← Back to My Tickets
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "start" }}>
          <Avatar name={ticket.creator.full_name} size="xl" />
          <div>
            <h1 style={{ marginBottom: "var(--space-2)" }}>{ticket.title}</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              <span>Created: {formatDate(ticket.created_at)}</span>
              {resolved && <span>Resolved: {formatDate(ticket.resolved_at)}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Badge variant={resolved ? "success" : "warning"}>
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </Badge>
          <Badge variant="primary">
            {ticket.final_category || ticket.ai_category}
          </Badge>
          <Badge variant="muted">
            {ticket.final_priority || ticket.ai_priority}
          </Badge>
        </div>
      </div>

      <Card>
        <h3 style={{ marginBottom: "var(--space-3)" }}>Your Ticket</h3>
        <p style={{ lineHeight: "1.7", marginBottom: "var(--space-3)" }}>{ticket.description}</p>
        {ticket.attachment_filename && (
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Attachment: {ticket.attachment_filename}
          </p>
        )}
      </Card>

      {resolved && ticket.final_reply && (
        <Card style={{ borderColor: "var(--success)" }}>
          <h3 style={{ marginBottom: "var(--space-3)", color: "var(--success)" }}>Agent Response</h3>
          <p style={{ lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{ticket.final_reply}</p>
        </Card>
      )}
    </div>
  );
}
