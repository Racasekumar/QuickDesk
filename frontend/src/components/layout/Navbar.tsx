"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getUser, clearAuth } from "@/lib/auth";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const router = useRouter();
  const user = getUser();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSignOut = () => {
    clearAuth();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <header style={{
      height: "64px",
      background: "var(--bg-card)",
      borderBottom: "1px solid var(--border)",
      padding: "0 var(--space-6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <Link href={user.role === "agent" ? "/dashboard" : "/my-tickets"} style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--primary)",
          textDecoration: "none",
        }}>
          QuickDesk
        </Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Avatar name={user.full_name} size="sm" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{user.full_name}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{user.role}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
