import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "QuickDesk",
  description: "AI-Assisted Internal Helpdesk",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
