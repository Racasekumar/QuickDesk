"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser } from "@/lib/auth";

interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const user = getUser();

  if (!user) return null;

  const employeeItems: NavItem[] = [
    { label: "My Tickets", href: "/my-tickets" },
  ];

  const agentItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Metrics", href: "/metrics" },
  ];

  const items = user.role === "agent" ? agentItems : employeeItems;

  return (
    <aside style={{
      width: "260px",
      background: "var(--bg-card)",
      borderRight: "1px solid var(--border)",
      height: "calc(100vh - 64px)",
      position: "sticky",
      top: "64px",
      padding: "var(--space-6) 0",
    }}>
      <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "var(--space-3) var(--space-6)",
                color: isActive ? "var(--primary)" : "var(--text-muted)",
                background: isActive ? "var(--primary-a)" : "transparent",
                borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent",
                textDecoration: "none",
                fontWeight: isActive ? 500 : 400,
                transition: "var(--transition)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--border)";
                  e.currentTarget.style.color = "var(--text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-muted)";
                }
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
