"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearAuth } from "@/lib/auth";
import { User } from "@/types";

export default function MyTicketsPage() {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.replace("/login");
    } else if (currentUser.role !== "employee") {
      router.replace("/dashboard");
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
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "40px",
        borderBottom: "1px solid var(--border)",
        paddingBottom: "20px"
      }}>
        <div>
          <h2>My Tickets</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Welcome, {user.full_name} ({user.email})
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
        <h3 style={{ marginBottom: "10px" }}>No tickets found</h3>
        <p style={{ color: "var(--text-muted)" }}>Submit a ticket to get started (Segment 2 coming soon!)</p>
      </div>
    </div>
  );
}
