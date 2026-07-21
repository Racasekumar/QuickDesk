"use client";

import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  variant = "rect",
  width,
  height,
  className = "",
  ...props
}: SkeletonProps) {
  const baseStyles = {
    background: "linear-gradient(90deg, var(--bg-input) 25%, var(--border) 50%, var(--bg-input) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite ease-in-out",
    borderRadius: variant === "circle" ? "50%" : "var(--radius-sm)",
  };

  const sizeStyles: any = {};
  if (width) sizeStyles.width = typeof width === "number" ? `${width}px` : width;
  if (height) sizeStyles.height = typeof height === "number" ? `${height}px` : height;
  if (variant === "text" && !height) sizeStyles.height = "1.2em";
  if (variant === "circle" && !width && !height) sizeStyles.width = sizeStyles.height = "40px";

  return (
    <div
      className={className}
      style={{
        ...baseStyles,
        ...sizeStyles,
      }}
      {...props}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
