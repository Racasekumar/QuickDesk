"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";
import { LoginResponse } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAgent, setIsAgent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isAgent ? "/auth/agent/login" : "/auth/employee/login";
      const data = await api.post<LoginResponse>(endpoint, { email, password });
      
      setToken(data.access_token);
      setUser(data.user);

      if (data.user.role === "agent") {
        router.push("/dashboard");
      } else {
        router.push("/my-tickets");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <div style={{
        background: "var(--bg-card)",
        padding: "40px",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{ marginBottom: "10px", textAlign: "center" }}>QuickDesk Sign In</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", marginBottom: "30px" }}>
          Access your helpdesk account
        </p>

        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid var(--danger)",
            color: "var(--danger)",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "20px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                color: "var(--text)",
                outline: "none"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                color: "var(--text)",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", marginBottom: "25px", gap: "8px" }}>
            <input
              type="checkbox"
              id="isAgent"
              checked={isAgent}
              onChange={(e) => setIsAgent(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="isAgent" style={{ fontSize: "14px", cursor: "pointer" }}>
              Sign in as a Support Agent
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "var(--primary)",
              border: "none",
              borderRadius: "6px",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "15px"
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ fontSize: "14px", textAlign: "center", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "var(--primary)" }}>
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
