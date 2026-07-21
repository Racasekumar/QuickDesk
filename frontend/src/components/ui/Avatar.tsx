"use client";

import React from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Avatar({
  name,
  src,
  size = "md",
  className = "",
  ...props
}: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const sizeStyles = {
    sm: { width: "32px", height: "32px", fontSize: "0.875rem" },
    md: { width: "40px", height: "40px", fontSize: "1rem" },
    lg: { width: "48px", height: "48px", fontSize: "1.125rem" },
    xl: { width: "64px", height: "64px", fontSize: "1.5rem" },
  };

  const colors = [
    "var(--primary)",
    "var(--success)",
    "var(--warning)",
    "#ec4899",
    "#8b5cf6",
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

  return (
    <div
      className={className}
      style={{
        width: sizeStyles[size].width,
        height: sizeStyles[size].height,
        borderRadius: "999px",
        background: src ? "transparent" : colors[colorIndex],
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        overflow: "hidden",
        flexShrink: 0,
        ...sizeStyles[size],
      }}
      {...props}
    >
      {src ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </div>
  );
}
