"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";
import { LoginResponse } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
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
      const endpoint = isAgent ? "/auth/agent/register" : "/auth/employee/register";
      const data = await api.post<LoginResponse>(endpoint, {
        full_name: fullName,
        email,
        password
      });

      setToken(data.access_token);
      setUser(data.user);

      if (data.user.role === "agent") {
        router.push("/dashboard");
      } else {
        router.push("/my-tickets");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Try a different email.");
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
        <h2 style={{ marginBottom: "10px", textAlign: "center" }}>Create Account</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", marginBottom: "30px" }}>
          Join QuickDesk helpdesk portal
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
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              Join as a Support Agent
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p style={{ fontSize: "14px", textAlign: "center", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "var(--primary)" }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
