/**
 * NASA-informed operational safety thresholds.
 *
 * These bounds are simulation guardrails derived from common spaceflight
 * physiology practice (HR, pulse oximetry, auscultatory BP, core temperature).
 * Exercise and sleep use wider mode-specific windows to avoid predictable false
 * alarms. This is decision-support for a prototype, not a diagnosis.
 */

import type { TelemetryMode, TelemetryVitals } from '../types/telemetry';

export interface MetricBounds {
  min: number;
  max: number;
  criticalMin: number;
  criticalMax: number;
  unit: string;
  label: string;
}

export interface ModeSafetyProfile {
  heart_rate: MetricBounds;
  spo2: MetricBounds;
  systolic: MetricBounds;
  diastolic: MetricBounds;
  body_temp: MetricBounds;
}

export type BreachMetric = 'heart_rate' | 'spo2' | 'blood_pressure' | 'body_temp';

export interface ThresholdBreach {
  metric: BreachMetric;
  label: string;
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  unit: string;
}

const profile = (
  heartRate: Omit<MetricBounds, 'unit' | 'label'>,
  spo2: Omit<MetricBounds, 'unit' | 'label'>,
  systolic: Omit<MetricBounds, 'unit' | 'label'>,
  diastolic: Omit<MetricBounds, 'unit' | 'label'>,
  bodyTemp: Omit<MetricBounds, 'unit' | 'label'>
): ModeSafetyProfile => ({
  heart_rate: { ...heartRate, unit: 'bpm', label: 'Heart rate' },
  spo2: { ...spo2, unit: '%', label: 'SpO₂' },
  systolic: { ...systolic, unit: 'mmHg', label: 'Systolic BP' },
  diastolic: { ...diastolic, unit: 'mmHg', label: 'Diastolic BP' },
  body_temp: { ...bodyTemp, unit: '°C', label: 'Core temperature' },
});

export const NASA_SAFETY_THRESHOLDS: Record<TelemetryMode, ModeSafetyProfile> = {
  rest: profile(
    { min: 45, max: 120, criticalMin: 40, criticalMax: 150 },
    { min: 92, max: 100, criticalMin: 89, criticalMax: 100 },
    { min: 90, max: 140, criticalMin: 80, criticalMax: 180 },
    { min: 55, max: 90, criticalMin: 40, criticalMax: 110 },
    { min: 35.5, max: 37.8, criticalMin: 35.0, criticalMax: 38.5 }
  ),
  exercise: profile(
    { min: 55, max: 180, criticalMin: 45, criticalMax: 200 },
    { min: 92, max: 100, criticalMin: 86, criticalMax: 100 },
    { min: 100, max: 180, criticalMin: 85, criticalMax: 210 },
    { min: 55, max: 100, criticalMin: 40, criticalMax: 115 },
    { min: 36.0, max: 38.2, criticalMin: 35.0, criticalMax: 39.0 }
  ),
  sleep: profile(
    { min: 38, max: 90, criticalMin: 30, criticalMax: 120 },
    { min: 92, max: 100, criticalMin: 86, criticalMax: 100 },
    { min: 85, max: 130, criticalMin: 75, criticalMax: 170 },
    { min: 50, max: 85, criticalMin: 38, criticalMax: 105 },
    { min: 35.3, max: 37.5, criticalMin: 34.5, criticalMax: 38.2 }
  ),
  stress: profile(
    { min: 55, max: 150, criticalMin: 45, criticalMax: 190 },
    { min: 92, max: 100, criticalMin: 88, criticalMax: 100 },
    { min: 95, max: 150, criticalMin: 85, criticalMax: 190 },
    { min: 60, max: 95, criticalMin: 45, criticalMax: 115 },
    { min: 35.8, max: 38.0, criticalMin: 35.2, criticalMax: 38.8 }
  ),
};

export function getModeSafetyProfile(mode: TelemetryMode): ModeSafetyProfile {
  return NASA_SAFETY_THRESHOLDS[mode];
}

function evaluateMetric(
  metric: BreachMetric,
  value: number,
  bounds: MetricBounds
): ThresholdBreach | null {
  const severity: ThresholdBreach['severity'] | null =
    value < bounds.criticalMin || value > bounds.criticalMax
      ? 'critical'
      : value < bounds.min || value > bounds.max
        ? 'warning'
        : null;

  if (!severity) return null;

  const direction =
    value < bounds.min
      ? `below the ${bounds.min}${bounds.unit} floor`
      : `above the ${bounds.max}${bounds.unit} ceiling`;

  return {
    metric,
    label: bounds.label,
    severity,
    value,
    unit: bounds.unit,
    message: `${bounds.label} ${value}${bounds.unit} is ${direction}.`,
  };
}

/**
 * Evaluate a packet against the mode-specific operational safety envelope.
 * Returns every breach so the dashboard can highlight each affected card.
 */
export function evaluateVitals(
  vitals: TelemetryVitals,
  mode: TelemetryMode
): ThresholdBreach[] {
  const p = getModeSafetyProfile(mode);

  return [
    evaluateMetric('heart_rate', vitals.heart_rate, p.heart_rate),
    evaluateMetric('spo2', vitals.spo2, p.spo2),
    evaluateMetric('blood_pressure', vitals.blood_pressure.systolic, p.systolic),
    evaluateMetric('blood_pressure', vitals.blood_pressure.diastolic, p.diastolic),
    evaluateMetric('body_temp', vitals.body_temp, p.body_temp),
  ].filter((breach): breach is ThresholdBreach => breach !== null);
}

export function hasCriticalBreach(breaches: ThresholdBreach[]): boolean {
  return breaches.some((breach) => breach.severity === 'critical');
}