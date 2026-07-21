"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Metrics } from "@/types";
import { api } from "@/lib/api";
import MetricsChart from "@/components/metrics/MetricsChart";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";

export default function MetricsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "agent") {
      router.replace("/my-tickets");
    } else {
      fetchMetrics();
    }
  }, [router]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      setMetrics(await api.get<Metrics>("/metrics"));
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Could not load metrics", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <div>
          <Link href="/dashboard" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none" }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ marginTop: "var(--space-2)" }}>Metrics</h1>
        </div>
        <Button onClick={fetchMetrics} variant="outline" disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: "var(--space-6)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
            <Card>
              <Skeleton width="100%" height="80px" />
            </Card>
            <Card>
              <Skeleton width="100%" height="80px" />
            </Card>
          </div>
          <Card>
            <Skeleton width="40%" height="24px" style={{ marginBottom: "var(--space-4)" }} />
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              <Skeleton width="100%" height="28px" />
              <Skeleton width="90%" height="28px" />
            </div>
          </Card>
          <Card>
            <Skeleton width="40%" height="24px" style={{ marginBottom: "var(--space-4)" }} />
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              <Skeleton width="100%" height="28px" />
              <Skeleton width="80%" height="28px" />
              <Skeleton width="70%" height="28px" />
            </div>
          </Card>
        </div>
      ) : metrics ? (
        <MetricsChart metrics={metrics} />
      ) : (
        <Card>
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>No data available.</p>
        </Card>
      )}
    </div>
  );
}
