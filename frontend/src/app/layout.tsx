"use client";

import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastProvider } from "@/context/ToastContext";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { getUser } from "@/lib/auth";
import { usePathname } from "next/navigation";
import React from "react";

// export const metadata: Metadata = {
//   title: "QuickDesk",
//   description: "AI-Assisted Internal Helpdesk",
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = getUser();
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/";
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <html lang="en">
        <body>
          <ToastProvider>
            {children}
          </ToastProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {isAuthPage ? (
            children
          ) : (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
              <Navbar />
              <div style={{ display: "flex", flex: 1 }}>
                <Sidebar />
                <main style={{ flex: 1, padding: "var(--space-8)", overflow: "auto" }}>
                  {children}
                </main>
              </div>
            </div>
          )}
        </ToastProvider>
      </body>
    </html>
  );
}
