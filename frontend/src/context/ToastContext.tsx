"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div style={{
        position: "fixed",
        bottom: "var(--space-6)",
        right: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        zIndex: 9999,
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "var(--space-4) var(--space-5)",
              boxShadow: "var(--shadow-lg)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              minWidth: "300px",
            }}
          >
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background:
                toast.type === "success" ? "var(--success)" :
                toast.type === "error" ? "var(--danger)" :
                toast.type === "warning" ? "var(--warning)" :
                "var(--primary)",
            }} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "var(--space-1)",
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
