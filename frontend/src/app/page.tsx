"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const user = getUser();
    if (!user) return router.replace("/login");
    if (user.role === "agent") return router.replace("/dashboard");
    router.replace("/my-tickets");
  }, [router]);

  return null;
}
