"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearAuth } from "@/lib/auth";
import { User } from "@/types";

export default function AgentDashboardPage() {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.replace("/login");
    } else if (currentUser.role !== "agent") {
      router.replace("/my-tickets");
    } else {
      setUserState(currentUser);
    }
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "40px",
        borderBottom: "1px solid var(--border)",
        paddingBottom: "20px"
      }}>
        <div>
          <h2>Agent Dashboard</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Signed in as {user.full_name} ({user.email})
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid var(--danger)",
            borderRadius: "5px",
            color: "var(--danger)",
            cursor: "pointer"
          }}
        >
          Sign Out
        </button>
      </div>

      <div style={{
        background: "var(--bg-card)",
        padding: "30px",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        textAlign: "center"
      }}>
        <h3 style={{ marginBottom: "10px" }}>No active tickets in queue</h3>
        <p style={{ color: "var(--text-muted)" }}>Tickets from employees will appear here (Segment 2 coming soon!)</p>
      </div>
    </div>
  );
}
