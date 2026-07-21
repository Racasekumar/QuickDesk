"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUser, clearAuth } from "@/lib/auth";
import { User, Ticket } from "@/types";
import { api } from "@/lib/api";
import TicketForm from "@/components/tickets/TicketForm";
import { useSSE } from "@/hooks/useSSE";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MyTicketsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [user, setUserState] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.replace("/login");
    } else if (currentUser.role !== "employee") {
      router.replace("/dashboard");
    } else {
      setUserState(currentUser);
      api.get<Ticket[]>("/tickets/mine")
        .then(setTickets)
        .catch((err) => addToast(err.message, "error"))
        .finally(() => setLoading(false));
    }
  }, [router, addToast]);

  useSSE((type, data) => {
    if (type === "ticket_resolved") {
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
    <div style={{ maxWidth: "880px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-8)" }}>
        <div>
          <h1>My Tickets</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
            Welcome, {user.full_name}
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
      </div>

      <div style={{ display: "grid", gap: "var(--space-6)" }}>
        <Card>
          <TicketForm onCreated={(ticket) => setTickets((current) => [ticket, ...current])} />
        </Card>

        <Card>
          <h3 style={{ marginBottom: "var(--space-5)" }}>Your Tickets</h3>
          {loading ? (
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "grid", gap: "var(--space-2)" }}>
                  <Skeleton width="60%" height="24px" />
                  <Skeleton width="100%" height="16px" />
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--space-10)", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "1.125rem", marginBottom: "var(--space-2)" }}>No tickets yet</p>
              <p>Submit your first support ticket above!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/my-tickets/${ticket.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    padding: "var(--space-4)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "var(--space-4)",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
                      <h4 style={{ margin: 0 }}>{ticket.title}</h4>
                      <Badge
                        variant={ticket.status === "resolved" ? "success" : "warning"}
                        size="sm"
                      >
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </Badge>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "var(--space-2)" }}>
                      {ticket.description.length > 120 ? `${ticket.description.slice(0, 120)}...` : ticket.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                      <span>
                        Category: {ticket.final_category || ticket.ai_category}
                      </span>
                      <span>
                        Priority: {ticket.final_priority || ticket.ai_priority}
                      </span>
                      <span>
                        Created: {formatDate(ticket.created_at)}
                      </span>
                      {ticket.resolved_at && (
                        <span>
                          Resolved: {formatDate(ticket.resolved_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
