"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, clearAuth } from "@/lib/auth";
import { Ticket, TicketCategory, TicketPriority, User } from "@/types";
import { api } from "@/lib/api";
import { useSSE } from "@/hooks/useSSE";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AgentDashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [user, setUserState] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TicketCategory | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [status, setStatus] = useState<"open" | "resolved" | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.replace("/login");
    } else if (currentUser.role !== "agent") {
      router.replace("/my-tickets");
    } else {
      setUserState(currentUser);
      loadTickets();
    }
  }, [router]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (priority) params.set("priority", priority);
      if (status) params.set("status", status);
      const query = params.toString();
      setTickets(await api.get<Ticket[]>(`/tickets${query ? `?${query}` : ""}`));
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Could not load tickets", "error");
    } finally {
      setLoading(false);
    }
  };

  useSSE((type, data) => {
    if (type === "ticket_created") {
      setTickets((prev) => [data, ...prev]);
    } else if (type === "ticket_resolved") {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === data.id ? { ...t, status: "resolved", resolved_at: data.resolved_at } : t
        )
      );
    }
  });

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-8)" }}>
        <div>
          <h1>Agent Dashboard</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
            Manage and resolve support tickets
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <Link href="/metrics" passHref>
            <Button variant="outline">View Metrics</Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout}>Sign Out</Button>
        </div>
      </div>

      <Card style={{ marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "end" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "0.875rem", fontWeight: 500 }}>Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket title"
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ minWidth: "150px" }}>
            <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "0.875rem", fontWeight: 500 }}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              style={{ width: "100%" }}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div style={{ minWidth: "150px" }}>
            <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "0.875rem", fontWeight: 500 }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              style={{ width: "100%" }}
            >
              <option value="">All</option>
              {(["IT", "HR", "Finance", "Admin", "Other"] as TicketCategory[]).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: "150px" }}>
            <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "0.875rem", fontWeight: 500 }}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              style={{ width: "100%" }}
            >
              <option value="">All</option>
              {(["Low", "Medium", "High"] as TicketPriority[]).map((prio) => (
                <option key={prio} value={prio}>{prio}</option>
              ))}
            </select>
          </div>
          <Button onClick={loadTickets}>Apply Filters</Button>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", gap: "var(--space-4)", alignItems: "start" }}>
                <Skeleton variant="circle" width="40px" height="40px" />
                <div style={{ flex: 1, display: "grid", gap: "var(--space-2)" }}>
                  <Skeleton width="70%" height="20px" />
                  <Skeleton width="100%" height="16px" />
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--space-10)", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "1.125rem", marginBottom: "var(--space-2)" }}>No tickets found</p>
            <p>Try adjusting your filters or check back later!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/${ticket.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    padding: "var(--space-4)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    gap: "var(--space-4)",
                    alignItems: "start",
                    transition: "var(--transition)",
                    ":hover": {
                      borderColor: "var(--primary)",
                      boxShadow: "var(--shadow-sm)",
                    },
                  }}
                >
                  <Avatar name={ticket.creator.full_name} size="md" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
                      <h4 style={{ margin: 0 }}>{ticket.title}</h4>
                      <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        <Badge
                          variant={ticket.status === "resolved" ? "success" : "warning"}
                          size="sm"
                        >
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </Badge>
                        <Badge variant="primary" size="sm">
                          {ticket.final_category || ticket.ai_category}
                        </Badge>
                        <Badge variant="muted" size="sm">
                          {ticket.final_priority || ticket.ai_priority}
                        </Badge>
                      </div>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "var(--space-2)" }}>
                      {ticket.description.length > 150 ? `${ticket.description.slice(0, 150)}...` : ticket.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                      <span>
                        From <strong style={{ color: "var(--text)" }}>{ticket.creator.full_name}</strong> ({ticket.creator.email})
                      </span>
                      <span>Created: {formatDate(ticket.created_at)}</span>
                      {ticket.resolved_at && <span>Resolved: {formatDate(ticket.resolved_at)}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
