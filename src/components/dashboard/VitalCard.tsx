import type { ReactNode } from "react";
import type { Severity } from "@/lib/healthStatus";
import { SEVERITY_STYLES } from "./severity";

interface SparklineProps {
  values: number[];
  color: string;
}

function Sparkline({ values, color }: SparklineProps) {
  if (values.length < 2) return null;

  const width = 112;
  const height = 34;
  const padding = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - padding - ((value - min) / span) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      className="h-8 w-24 shrink-0 overflow-visible"
      preserveAspectRatio="none"
    >
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={color}
        fillOpacity={0.08}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export interface VitalCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  severity: Severity;
  subtitle: string;
  detail?: string;
  series?: number[];
}

export function VitalCard({
  label,
  value,
  unit,
  icon,
  severity,
  subtitle,
  detail,
  series = [],
}: VitalCardProps) {
  const tone = SEVERITY_STYLES[severity];

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-slate-950/65 p-5 shadow-2xl shadow-black/20 backdrop-blur ${tone.border}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full blur-3xl ${tone.glow}`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.icon}`}
        >
          {icon}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${tone.pill}`}
        >
          {tone.label}
        </span>
      </div>

      <p className="relative mt-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <div className="relative mt-1.5 flex items-end gap-1.5">
        <span className="text-4xl font-semibold leading-none tracking-tight text-slate-50 tabular-nums">
          {value}
        </span>
        {unit ? (
          <span className="pb-0.5 text-sm font-medium text-slate-400">
            {unit}
          </span>
        ) : null}
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-3">
        <p className="text-xs leading-5 text-slate-400">{subtitle}</p>
        <Sparkline values={series} color={tone.stroke} />
      </div>

      {detail ? (
        <p className={`relative mt-2 text-[11px] leading-4 ${tone.text}`}>
          {detail}
        </p>
      ) : null}
    </article>
  );
}
