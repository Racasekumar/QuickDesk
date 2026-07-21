"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "var(--space-6)",
        boxShadow: "var(--shadow-sm)",
        transition: "var(--transition)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}
