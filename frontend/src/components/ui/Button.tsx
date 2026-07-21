"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  style,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-h focus:ring-primary",
    secondary: "bg-border text-text hover:bg-border-light focus:ring-border-light",
    danger: "bg-danger text-white hover:opacity-90 focus:ring-danger",
    ghost: "bg-transparent text-text hover:bg-border focus:ring-border",
    outline: "border border-border text-text hover:bg-border focus:ring-border",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-7 py-3.5 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={{
        outlineOffset: "2px",
        backgroundColor: variant === "primary" ? "var(--primary)" :
                         variant === "danger" ? "var(--danger)" :
                         variant === "secondary" ? "var(--border)" :
                         variant === "ghost" ? "transparent" :
                         "transparent",
        color:
          variant === "primary" || variant === "danger"
            ? "#fff"
            : variant === "ghost"
              ? "var(--text-muted)"
              : "var(--text)",
        border: variant === "outline" ? "1px solid var(--border)" : "none",
        padding: size === "sm" ? "var(--space-2) var(--space-4)" :
                size === "md" ? "var(--space-3) var(--space-5)" :
                "var(--space-4) var(--space-6)",
        borderRadius: "var(--radius-sm)",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: size === "sm" ? "36px" : size === "md" ? "42px" : "48px",
        boxShadow: variant === "primary" ? "var(--shadow-sm)" : "none",
        opacity: props.disabled ? 0.6 : 1,
        cursor: props.disabled ? "not-allowed" : "pointer",
        ...style,
      }}
      {...props}
    />
  );
}
