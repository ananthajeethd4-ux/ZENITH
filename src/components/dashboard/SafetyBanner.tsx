import React from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { MODE_LABELS, type TelemetryMode } from '../../types/telemetry';
import { hasCriticalBreach, type ThresholdBreach } from '../../services/vitalThresholds';

interface SafetyBannerProps {
  breaches: ThresholdBreach[];
  mode: TelemetryMode;
  checkedAt?: string;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({
  breaches,
  mode,
  checkedAt,
}) => {
  if (breaches.length === 0) {
    return (
      <div
        className="flex flex-wrap items-center gap-2 rounded-sm border border-edge bg-paper-dark px-4 py-3"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="h-4 w-4 text-slate-primary" />
        <span className="text-sm text-ink">
          All measured vitals are within the NASA operational reference envelope.
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
          {MODE_LABELS[mode]} · {checkedAt ? new Date(checkedAt).toLocaleTimeString() : 'awaiting packet'}
        </span>
      </div>
    );
  }

  const critical = hasCriticalBreach(breaches);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`rounded-sm border px-4 py-3 ${
        critical
          ? 'border-brick-border bg-brick-surface'
          : 'border-edge bg-paper-dark'
      }`}
    >
      <div className="flex items-start gap-3">
        <ShieldAlert
          className={`mt-0.5 h-5 w-5 shrink-0 ${
            critical ? 'text-brick' : 'text-slate-primary'
          }`}
        />
        <div className="min-w-0">
          <h2
            className={`text-sm font-semibold tracking-tight ${
              critical ? 'text-brick' : 'text-ink'
            }`}
          >
            {critical
              ? 'Critical physiological threshold breach'
              : 'Vitals outside operational bounds'}
          </h2>
          <p className="mt-0.5 text-xs text-ink-secondary">
            {critical
              ? 'Immediate flight-surgeon review recommended. Telemetry remains queued locally if the link is degraded.'
              : 'Monitor the affected metric. The next sample will re-evaluate automatically.'}
          </p>

          <ul className="mt-2 space-y-1">
            {breaches.map((breach, index) => (
              <li
                key={`${breach.metric}-${breach.label}-${index}`}
                className="font-mono text-[11px] text-ink"
              >
                <span
                  className={`mr-1.5 font-semibold uppercase ${
                    breach.severity === 'critical' ? 'text-brick' : 'text-slate-primary'
                  }`}
                >
                  [{breach.severity}]
                </span>
                {breach.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};