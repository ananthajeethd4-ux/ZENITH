import {
  AlertTriangle,
  Brain,
  Cloud,
  CloudOff,
  Dumbbell,
  HeartPulse,
  Moon,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { TelemetryMode } from "@/lib/telemetry";

const MODE_OPTIONS = [
  { value: "rest", label: "Rest", Icon: HeartPulse },
  { value: "exercise", label: "Exercise", Icon: Dumbbell },
  { value: "sleep", label: "Sleep", Icon: Moon },
  { value: "stress", label: "Stress", Icon: Brain },
] satisfies Array<{
  value: TelemetryMode;
  label: string;
  Icon: typeof HeartPulse;
}>;

interface ControlToolbarProps {
  mode: TelemetryMode;
  onModeChange: (mode: TelemetryMode) => void;
  anomalyQueued: boolean;
  onInjectAnomaly: () => void;
  isOnline: boolean;
  onToggleNetwork: () => void;
  pendingSync: number;
  syncing: boolean;
  onSyncNow: () => void;
}

export function ControlToolbar({
  mode,
  onModeChange,
  anomalyQueued,
  onInjectAnomaly,
  isOnline,
  onToggleNetwork,
  pendingSync,
  syncing,
  onSyncNow,
}: ControlToolbarProps) {
  return (
    <section className="mt-5 rounded-2xl border border-white/5 bg-slate-950/55 p-2.5 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Simulation mode
          </span>
          <div
            className="inline-flex flex-wrap gap-1 rounded-xl border border-white/5 bg-black/25 p-1"
            role="group"
            aria-label="Telemetry simulation mode"
          >
            {MODE_OPTIONS.map(({ value, label, Icon }) => {
              const active = value === mode;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onModeChange(value)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-cyan-400 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.22)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onInjectAnomaly}
            disabled={anomalyQueued}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
              anomalyQueued
                ? "animate-pulse border-red-400/60 bg-red-500/20 text-red-200"
                : "border-red-500/30 bg-red-500/10 text-red-300 hover:border-red-400/50 hover:bg-red-500/20"
            } disabled:cursor-not-allowed`}
          >
            <AlertTriangle className="h-4 w-4" />
            {anomalyQueued ? "Anomaly armed" : "Inject emergency anomaly"}
          </button>

          {pendingSync > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs font-medium text-amber-200">
              <CloudOff className="h-3.5 w-3.5" />
              {pendingSync} pending
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-xs font-medium text-emerald-300">
              <Cloud className="h-3.5 w-3.5" />
              Queue clear
            </span>
          )}

          <button
            type="button"
            onClick={onSyncNow}
            disabled={!isOnline || syncing || pendingSync === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing" : "Sync now"}
          </button>

          <button
            type="button"
            role="switch"
            aria-checked={isOnline}
            onClick={onToggleNetwork}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
              isOnline
                ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15"
                : "border-amber-400/25 bg-amber-400/10 text-amber-200 hover:bg-amber-400/15"
            }`}
          >
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            {isOnline ? "Uplink online" : "Uplink offline"}
            <span
              aria-hidden="true"
              className={`ml-1 flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                isOnline ? "bg-cyan-400/80" : "bg-slate-700"
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
                  isOnline ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
