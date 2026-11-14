import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { HealthAlert } from "@/lib/healthStatus";

interface AlertBannerProps {
  alerts: HealthAlert[];
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  if (alerts.length === 0) return null;

  const critical = alerts.some((alert) => alert.severity === "critical");
  const primary = alerts[0];
  const secondary = alerts.slice(1, 3);

  return (
    <section
      role="alert"
      aria-live="assertive"
      className={`relative mt-5 overflow-hidden rounded-2xl border px-4 py-4 shadow-2xl backdrop-blur sm:px-5 ${
        critical
          ? "border-red-500/40 bg-red-950/55 shadow-red-950/30"
          : "border-amber-500/35 bg-amber-950/40 shadow-amber-950/20"
      }`}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 ${
          critical ? "bg-red-400" : "bg-amber-400"
        }`}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            critical
              ? "bg-red-500/15 text-red-300 ring-1 ring-inset ring-red-400/30"
              : "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/30"
          }`}
        >
          {critical ? (
            <ShieldAlert className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.22em] ${
                critical ? "text-red-300" : "text-amber-300"
              }`}
            >
              {critical ? "Critical anomaly" : "Crew caution"}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                critical
                  ? "bg-red-500/15 text-red-200"
                  : "bg-amber-500/15 text-amber-200"
              }`}
            >
              {alerts.length} active {alerts.length === 1 ? "alert" : "alerts"}
            </span>
          </div>
          <p className="mt-1.5 text-base font-semibold text-slate-50">
            {primary.title}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            {primary.detail}
          </p>

          {secondary.length > 0 ? (
            <ul className="mt-2 hidden flex-wrap gap-x-4 gap-y-1 sm:flex">
              {secondary.map((alert) => (
                <li
                  key={alert.id}
                  className="text-xs leading-5 text-slate-400"
                >
                  <span
                    className={
                      alert.severity === "critical"
                        ? "text-red-300"
                        : "text-amber-300"
                    }
                  >
                    ●
                  </span>{" "}
                  {alert.title} <span className="text-slate-500">—</span>{" "}
                  {alert.detail}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <span
          className={`shrink-0 self-start rounded-lg border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
            critical
              ? "border-red-400/25 bg-red-500/10 text-red-200"
              : "border-amber-400/25 bg-amber-500/10 text-amber-200"
          }`}
        >
          Triage now
        </span>
      </div>
    </section>
  );
}
