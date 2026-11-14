import type { Severity } from "@/lib/healthStatus";

export interface SeverityStyle {
  label: string;
  text: string;
  border: string;
  surface: string;
  icon: string;
  pill: string;
  glow: string;
  stroke: string;
}

/**
 * Static class strings keep Tailwind's scanner happy. Avoid composing class
 * names dynamically (e.g. `text-${color}-300`) or the classes may be purged.
 */
export const SEVERITY_STYLES: Record<Severity, SeverityStyle> = {
  nominal: {
    label: "Nominal",
    text: "text-emerald-300",
    border: "border-emerald-500/25",
    surface: "bg-emerald-500/5",
    icon: "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/20",
    pill: "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25",
    glow: "bg-emerald-500/10",
    stroke: "#34d399",
  },
  warning: {
    label: "Caution",
    text: "text-amber-300",
    border: "border-amber-500/30",
    surface: "bg-amber-500/5",
    icon: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-400/25",
    pill: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-400/30",
    glow: "bg-amber-500/10",
    stroke: "#fbbf24",
  },
  critical: {
    label: "Critical",
    text: "text-red-300",
    border: "border-red-500/40",
    surface: "bg-red-500/5",
    icon: "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-400/30",
    pill: "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-400/30",
    glow: "bg-red-500/10",
    stroke: "#f87171",
  },
};
