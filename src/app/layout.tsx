import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEGIS | Crew Health Command",
  description:
    "Offline-first astronaut health monitoring, telemetry triage, and crew vitals dashboard.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#04070f] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
