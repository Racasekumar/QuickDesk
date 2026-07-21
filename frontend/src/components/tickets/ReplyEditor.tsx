"use client";

import React from "react";
import { Citation, TicketCategory, TicketPriority } from "@/types";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface ReplyEditorProps {
  draft: string;
  citations: Citation[];
  category: TicketCategory | "";
  priority: TicketPriority | "";
  savedCategory: TicketCategory | null;
  savedPriority: TicketPriority | null;
  aiCategory: TicketCategory | null;
  aiPriority: TicketPriority | null;
  resolved: boolean;
  saving: boolean;
  onCategoryChange: (value: TicketCategory) => void;
  onPriorityChange: (value: TicketPriority) => void;
  onSaveClassification: () => void;
  onSendReply: (reply: string) => void;
}

const CATEGORIES: TicketCategory[] = ["IT", "HR", "Finance", "Admin", "Other"];
const PRIORITIES: TicketPriority[] = ["Low", "Medium", "High"];

export default function ReplyEditor({
  draft,
  citations,
  category,
  priority,
  savedCategory,
  savedPriority,
  aiCategory,
  aiPriority,
  resolved,
  saving,
  onCategoryChange,
  onPriorityChange,
  onSaveClassification,
  onSendReply,
}: ReplyEditorProps) {
  const [reply, setReply] = React.useState(draft);

  React.useEffect(() => {
    setReply(draft);
  }, [draft]);

  const classificationDirty =
    (category && category !== (savedCategory || "")) ||
    (priority && priority !== (savedPriority || ""));

  return (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <div>
        <h4 style={{ marginBottom: "var(--space-3)" }}>Classification</h4>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "end" }}>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "0.875rem", fontWeight: 500 }}>
              Category {aiCategory && <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}>(AI: {aiCategory})</span>}
            </label>
            <select
              value={category}
              disabled={resolved}
              onChange={(e) => onCategoryChange(e.target.value as TicketCategory)}
              style={{ width: "100%" }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "0.875rem", fontWeight: 500 }}>
              Priority {aiPriority && <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}>(AI: {aiPriority})</span>}
            </label>
            <select
              value={priority}
              disabled={resolved}
              onChange={(e) => onPriorityChange(e.target.value as TicketPriority)}
              style={{ width: "100%" }}
            >
              {PRIORITIES.map((prio) => (
                <option key={prio} value={prio}>{prio}</option>
              ))}
            </select>
          </div>
          {!resolved && classificationDirty && (
            <Button onClick={onSaveClassification} disabled={saving} variant="outline">
              Save Override
            </Button>
          )}
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: "var(--space-3)" }}>AI Draft Reply</h4>
        {citations.length > 0 && (
          <div style={{ marginBottom: "var(--space-3)" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "var(--space-2)" }}>
              Citations from knowledge base:
            </p>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {[...citations]
                .sort((a, b) => (b.last_updated || "").localeCompare(a.last_updated || ""))
                .map((citation) => (
                  <Badge key={citation.filename} variant="muted">
                    {citation.title}
                    {citation.last_updated && <span style={{ marginLeft: "var(--space-1)" }}>· {citation.last_updated}</span>}
                  </Badge>
                ))}
            </div>
          </div>
        )}
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          disabled={resolved}
          rows={10}
          style={{
            width: "100%",
            padding: "var(--space-3)",
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text)",
            resize: "vertical",
            fontFamily: "inherit",
            fontSize: "1rem",
            lineHeight: "1.6",
          }}
        />
        {!resolved && (
          <Button
            onClick={() => onSendReply(reply)}
            disabled={saving || !reply.trim()}
            size="md"
            style={{ marginTop: "var(--space-3)", minWidth: "160px" }}
          >
            {saving ? "Sending..." : "Send Reply"}
          </Button>
        )}
      </div>
    </div>
  );
}
