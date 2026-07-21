"use client";

import React from "react";
import Link from "next/link";
import { TicketDetail as TicketDetailType, TicketCategory, TicketPriority } from "@/types";
import ReplyEditor from "./ReplyEditor";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";

interface TicketDetailViewProps {
  ticket: TicketDetailType;
  saving: boolean;
  onGenerateDraft: () => void;
  onSaveClassification: (category: TicketCategory, priority: TicketPriority) => void;
  onSendReply: (reply: string, category: TicketCategory, priority: TicketPriority) => void;
}

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

export default function TicketDetailView({
  ticket,
  saving,
  onGenerateDraft,
  onSaveClassification,
  onSendReply,
}: TicketDetailViewProps) {
  const [category, setCategory] = React.useState<TicketCategory | "">(
    ticket.final_category || ticket.ai_category || ""
  );
  const [priority, setPriority] = React.useState<TicketPriority | "">(
    ticket.final_priority || ticket.ai_priority || ""
  );

  React.useEffect(() => {
    setCategory(ticket.final_category || ticket.ai_category || "");
    setPriority(ticket.final_priority || ticket.ai_priority || "");
  }, [ticket]);

  const resolved = ticket.status === "resolved";

  return (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "start" }}>
          <Avatar name={ticket.creator.full_name} size="xl" />
          <div>
            <h1 style={{ marginBottom: "var(--space-2)" }}>{ticket.title}</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              <span>Opened by <strong style={{ color: "var(--text)" }}>{ticket.creator.full_name}</strong> ({ticket.creator.email})</span>
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
        <h3 style={{ marginBottom: "var(--space-3)" }}>Original Ticket</h3>
        <p style={{ lineHeight: "1.7", marginBottom: "var(--space-3)" }}>{ticket.description}</p>
        {ticket.attachment_filename && (
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Attachment: {ticket.attachment_filename}
          </p>
        )}
      </Card>

      {!resolved && !ticket.ai_draft_reply && (
        <Button onClick={onGenerateDraft} disabled={saving} variant="outline">
          {saving ? "Generating draft..." : "Generate AI Draft"}
        </Button>
      )}

      {(ticket.ai_draft_reply || !resolved) && (
        <Card>
          <ReplyEditor
            draft={ticket.ai_draft_reply || ""}
            citations={ticket.ai_draft_citations}
            category={category}
            priority={priority}
            savedCategory={ticket.final_category}
            savedPriority={ticket.final_priority}
            aiCategory={ticket.ai_category}
            aiPriority={ticket.ai_priority}
            resolved={resolved}
            saving={saving}
            onCategoryChange={(val) => setCategory(val)}
            onPriorityChange={(val) => setPriority(val)}
            onSaveClassification={() => {
              if (category && priority) onSaveClassification(category, priority);
            }}
            onSendReply={(reply) => {
              if (category && priority) onSendReply(reply, category, priority);
            }}
          />
        </Card>
      )}

      {resolved && ticket.final_reply && (
        <Card style={{ borderColor: "var(--success)" }}>
          <h3 style={{ marginBottom: "var(--space-3)", color: "var(--success)" }}>Sent Reply</h3>
          <p style={{ lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{ticket.final_reply}</p>
          {ticket.ai_draft_reply && ticket.ai_draft_reply !== ticket.final_reply && (
            <details style={{ marginTop: "var(--space-5)" }}>
              <summary style={{ cursor: "pointer", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Compare with AI draft
              </summary>
              <p style={{ marginTop: "var(--space-3)", lineHeight: "1.7", whiteSpace: "pre-wrap", color: "var(--text-muted)" }}>
                {ticket.ai_draft_reply}
              </p>
            </details>
          )}
        </Card>
      )}

      <Card>
        <h3 style={{ marginBottom: "var(--space-4)" }}>Override Audit Log</h3>
        {ticket.audit_logs.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No classification overrides yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "var(--space-3)" }}>
            {ticket.audit_logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "var(--space-3)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                }}
              >
                <Avatar name={log.agent.full_name} size="sm" />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "0.875rem" }}>
                    <strong>{log.agent.full_name}</strong> changed {log.field} from{" "}
                    <em>{log.from_value || "—"}</em> to <em>{log.to_value}</em>
                  </p>
                  <p style={{ margin: 0, marginTop: "var(--space-1)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {formatDate(log.changed_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
