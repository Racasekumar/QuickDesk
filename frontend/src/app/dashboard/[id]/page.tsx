"use client";
import React from "react";

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ padding: "40px" }}>
      <h2>Ticket Detail {params.id}</h2>
      <p style={{ color: "var(--text-muted)" }}>Details will be implemented in Segment 3</p>
    </div>
  );
}
