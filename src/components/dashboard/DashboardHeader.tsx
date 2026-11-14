import { Radio, Satellite, ShieldCheck } from "lucide-react";
import type { Severity } from "@/lib/healthStatus";
import type { TelemetryMode } from "@/lib/telemetry";
import { formatModeLabel } from "@/lib/mockTelemetry";
import { SEVERITY_STYLES } from "./severity";

interface DashboardHeaderProps {
  crewId: string;
  mode: TelemetryMode;
  latestTimestamp?: number;
  severity: Severity;
}

function formatUtcClock(timestamp?: number): string {
  if (!timestamp) return "—";

  return `${new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(timestamp)} UTC`;
}

export function DashboardHeader({
  crewId,
  mode,
  latestTimestamp,
  severity,
}: DashboardHeaderProps) {
  const tone = SEVERITY_STYLES[severity];

  return (
    <header className="flex flex-col gap-5 border-b border-white/5 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-400">
          <Satellite className="h-4 w-4" />
          Aegis mission control
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Crew Health Command
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Live biomedical telemetry from{" "}
          <span className="font-medium text-slate-200">{crewId}</span> in low
          Earth orbit. Local-first capture, autonomous uplink recovery, and
          flight-surgeon triage.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live stream
        </span>

        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-300">
          <Radio className="h-3.5 w-3.5 text-cyan-300" />
          {formatModeLabel(mode)} mode
        </span>

        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${tone.pill}`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {tone.label}
        </span>

        <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
          {formatUtcClock(latestTimestamp)}
        </span>
      </div>
    </header>
  );
}
