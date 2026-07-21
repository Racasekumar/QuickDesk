"use client";
import React from "react";
import { Metrics } from "@/types";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
      <span style={{ width: "120px", fontSize: "0.875rem", color: "var(--text-muted)" }}>{label}</span>
      <div style={{ flex: 1, background: "var(--bg-input)", borderRadius: "var(--radius-sm)", height: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "var(--radius-sm)", transition: "width 0.3s ease" }} />
      </div>
      <span style={{ width: "40px", fontSize: "0.875rem", textAlign: "right", fontWeight: "500" }}>{value}</span>
    </div>
  );
}

function formatTime(s: number | null): string {
  if (s == null) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export default function MetricsChart({ metrics }: { metrics: Metrics }) {
  const maxStatus = Math.max(...Object.values(metrics.by_status), 1);
  const maxCategory = Math.max(...Object.values(metrics.by_category), 1);

  return (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
        <Card>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>
            Median Resolution Time
          </p>
          <p style={{ fontSize: "2.5rem", fontWeight: "700", margin: 0 }}>
            {formatTime(metrics.median_resolution_seconds)}
          </p>
        </Card>
        <Card>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>
            AI Override Rate
          </p>
          <p style={{ fontSize: "2.5rem", fontWeight: "700", margin: 0 }}>
            {metrics.ai_override_percentage}%
          </p>
        </Card>
      </div>

      <Card>
        <h4 style={{ marginBottom: "var(--space-4)" }}>Tickets by Status</h4>
        <div>
          {Object.entries(metrics.by_status).map(([status, count]) => (
            <Bar
              key={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              value={count}
              max={maxStatus}
              color={status === "resolved" ? "var(--success)" : "var(--warning)"}
            />
          ))}
        </div>
      </Card>

      <Card>
        <h4 style={{ marginBottom: "var(--space-4)" }}>Tickets by Category</h4>
        <div>
          {Object.entries(metrics.by_category).map(([category, count]) => (
            <Bar
              key={category}
              label={category}
              value={count}
              max={maxCategory}
              color="var(--primary)"
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
