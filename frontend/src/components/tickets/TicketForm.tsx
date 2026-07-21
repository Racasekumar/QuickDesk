"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { Ticket } from "@/types";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

export default function TicketForm({ onCreated }: { onCreated: (ticket: Ticket) => void }) {
  const { addToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentFilename, setAttachmentFilename] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const ticket = await api.post<Ticket>("/tickets", {
        title,
        description,
        attachment_filename: attachmentFilename || null,
      });
      onCreated(ticket);
      setTitle("");
      setDescription("");
      setAttachmentFilename("");
      addToast("Ticket submitted successfully!", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Could not submit ticket", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: "var(--space-4)" }}>
      <h3 style={{ marginBottom: "var(--space-2)" }}>Submit a Support Ticket</h3>
      <div>
        <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "0.875rem", fontWeight: 500 }}>Title</label>
        <input required minLength={3} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief title for your ticket" style={{ width: "100%" }} />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "0.875rem", fontWeight: 500 }}>Description</label>
        <textarea required minLength={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your issue in detail" rows={5} style={{ width: "100%", resize: "vertical" }} />
      </div>
      <div>
        <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "0.875rem", fontWeight: 500 }}>Attachment (Optional)</label>
        <input value={attachmentFilename} onChange={(e) => setAttachmentFilename(e.target.value)} placeholder="Filename (e.g. screenshot.png)" style={{ width: "100%" }} />
      </div>
      <Button type="submit" disabled={saving} style={{ width: "fit-content", marginTop: "var(--space-2)" }}>
        {saving ? "Submitting..." : "Submit Ticket"}
      </Button>
    </form>
  );
}
