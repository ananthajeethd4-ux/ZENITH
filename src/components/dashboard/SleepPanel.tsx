import { BedDouble, Moon, Wind } from "lucide-react";
import type { MockTelemetryPacket, SleepStage } from "@/lib/mockTelemetry";

interface SleepPanelProps {
  latest: MockTelemetryPacket | null;
}

const STAGE_STYLES: Record<
  SleepStage,
  { label: string; className: string; bar: string }
> = {
  awake: {
    label: "Awake",
    className: "bg-slate-500/10 text-slate-300 ring-slate-400/20",
    bar: "bg-slate-400",
  },
  light: {
    label: "Light sleep",
    className: "bg-sky-500/10 text-sky-300 ring-sky-400/20",
    bar: "bg-sky-400",
  },
  deep: {
    label: "Deep sleep",
    className: "bg-indigo-500/10 text-indigo-300 ring-indigo-400/20",
    bar: "bg-indigo-400",
  },
  rem: {
    label: "REM",
    className: "bg-violet-500/10 text-violet-300 ring-violet-400/20",
    bar: "bg-violet-400",
  },
};

export function SleepPanel({ latest }: SleepPanelProps) {
  const metrics = latest?.sleep_metrics;
  const stage = STAGE_STYLES[metrics?.stage ?? "awake"];
  const efficiency = metrics?.efficiency ?? 0;
  const apneaEvents = metrics?.apnea_events ?? 0;
  const sleepMode = latest?.mode === "sleep";

  return (
    <section className="rounded-2xl border border-white/5 bg-slate-950/55 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-300 ring-1 ring-inset ring-indigo-400/15">
            <Moon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Sleep & recovery
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {sleepMode
                ? "Live polysomnography summary"
                : "Recovery baseline · sleep mode to stream"}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${stage.className}`}
        >
          {stage.label}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Duration
          </p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-100 tabular-nums">
            {metrics ? metrics.duration_hours.toFixed(1) : "—"}
            <span className="ml-1 text-xs font-medium text-slate-500">h</span>
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-black/20 p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Apnea events
          </p>
          <p
            className={`mt-1.5 text-2xl font-semibold tabular-nums ${
              apneaEvents > 2 ? "text-amber-300" : "text-slate-100"
            }`}
          >
            {metrics ? apneaEvents : "—"}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Wind className="h-3 w-3" />
            Sleep efficiency
          </span>
          <span className="font-mono text-slate-300">
            {metrics ? `${Math.round(efficiency)}%` : "—"}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${stage.bar}`}
            style={{ width: `${Math.max(0, Math.min(100, efficiency))}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2.5">
        <BedDouble className="h-3.5 w-3.5 text-slate-500" />
        <p className="text-[11px] leading-4 text-slate-500">
          {sleepMode
            ? "Cadence: one sleep sample every 3 seconds. Duration advances one simulated minute per sample."
            : "Switch the simulation to sleep mode to advance sleep-stage telemetry."}
        </p>
      </div>
    </section>
  );
}
