"use client";

import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "muted";
  size?: "sm" | "md" | "lg";
}

export default function Badge({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: { background: "var(--border)", color: "var(--text)" },
    primary: { background: "var(--primary-a)", color: "var(--primary)" },
    success: { background: "var(--success-a)", color: "var(--success)" },
    warning: { background: "var(--warning-a)", color: "var(--warning)" },
    danger: { background: "var(--danger-a)", color: "var(--danger)" },
    muted: { background: "var(--bg-input)", color: "var(--text-muted)" },
  };

  const sizeStyles = {
    sm: { padding: "2px 8px", fontSize: "0.7rem" },
    md: { padding: "4px 10px", fontSize: "0.75rem" },
    lg: { padding: "6px 12px", fontSize: "0.875rem" },
  };

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 500,
        borderRadius: "999px",
        border: "1px solid transparent",
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
      {...props}
    >
      {children}
    </span>
  );
}
