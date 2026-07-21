"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";
import { LoginResponse } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAgent, setIsAgent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isAgent ? "/auth/agent/login" : "/auth/employee/login";
      const data = await api.post<LoginResponse>(endpoint, { email, password });
      
      setToken(data.access_token);
      setUser(data.user);
      addToast("Successfully signed in!", "success");

      if (data.user.role === "agent") {
        router.push("/dashboard");
      } else {
        router.push("/my-tickets");
      }
    } catch (err: any) {
      addToast(err.message || "Invalid credentials or server error", "error");
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
      padding: "var(--space-6)",
    }}>
      <Card style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <h1 style={{ marginBottom: "var(--space-2)", fontSize: "2rem", color: "var(--primary)" }}>QuickDesk</h1>
          <p style={{ color: "var(--text-muted)" }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div>
            <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "0.875rem", fontWeight: 500 }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%" }}
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "0.875rem", fontWeight: 500 }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%" }}
              placeholder="••••••••"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <input
              type="checkbox"
              id="isAgent"
              checked={isAgent}
              onChange={(e) => setIsAgent(e.target.checked)}
            />
            <label htmlFor="isAgent" style={{ fontSize: "0.875rem", cursor: "pointer" }}>
              Sign in as a Support Agent
            </label>
          </div>

          <Button type="submit" disabled={loading} style={{ width: "100%", marginTop: "var(--space-2)" }}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p style={{
          marginTop: "var(--space-6)",
          textAlign: "center",
          fontSize: "0.875rem",
          color: "var(--text-muted)",
        }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "var(--primary)", fontWeight: 500 }}>
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
