/**
 * Realistic simulated telemetry.
 *
 * Values are modelled from published spaceflight physiology reference ranges
 * (resting/ambulatory heart rate, pulse oximetry, auscultatory blood pressure,
 * and core temperature). This is a demonstration generator, not a clinical
 * device and not a substitute for certified medical hardware.
 */

import type {
  BloodPressure,
  Posture,
  TelemetryLog,
  TelemetryMode,
  TelemetryVitals,
} from '../types/telemetry';

interface ModeProfile {
  heartRate: readonly [number, number];
  spo2: readonly [number, number];
  systolic: readonly [number, number];
  diastolic: readonly [number, number];
  bodyTemp: readonly [number, number];
  postures: readonly Posture[];
}

/**
 * Baseline ranges per operational mode. Ranges deliberately overlap real
 * circadian and exertional variation rather than returning a fixed value.
 */
const MODE_PROFILES: Record<TelemetryMode, ModeProfile> = {
  rest: {
    heartRate: [58, 74],
    spo2: [96, 99],
    systolic: [110, 126],
    diastolic: [68, 80],
    bodyTemp: [36.4, 36.8],
    postures: ['seated', 'free_float'],
  },
  exercise: {
    heartRate: [126, 164],
    spo2: [94, 98],
    systolic: [142, 172],
    diastolic: [78, 92],
    bodyTemp: [37.0, 37.6],
    postures: ['treadmill_stride', 'cycle_seated'],
  },
  sleep: {
    heartRate: [46, 58],
    spo2: [95, 98],
    systolic: [100, 114],
    diastolic: [60, 72],
    bodyTemp: [35.9, 36.4],
    postures: ['supine'],
  },
  stress: {
    heartRate: [98, 126],
    spo2: [95, 98],
    systolic: [136, 154],
    diastolic: [82, 94],
    bodyTemp: [36.7, 37.2],
    postures: ['seated', 'standing'],
  },
};

export type AnomalyKind =
  | 'hypoxia'
  | 'tachycardia'
  | 'bradycardia'
  | 'hypertensive_crisis'
  | 'hypotension'
  | 'hyperthermia'
  | 'hypothermia';

export interface MockGeneratorOptions {
  /** Crew identifier written onto the packet. */
  crewId?: string;
  /** Probability [0,1] of an unforced anomaly. Defaults to 4%. */
  anomalyChance?: number;
  /** Force an anomaly. `true` picks a critical anomaly. */
  forceAnomaly?: boolean | AnomalyKind;
  /** Injectable clock for deterministic tests. */
  timestamp?: Date;
}

/** Anomaly kinds guaranteed to breach critical limits in any mode. */
const CRITICAL_ANOMALIES: readonly AnomalyKind[] = [
  'hypoxia',
  'tachycardia',
  'hypertensive_crisis',
  'hypotension',
  'hyperthermia',
];

const ALL_ANOMALIES: readonly AnomalyKind[] = [
  ...CRITICAL_ANOMALIES,
  'bradycardia',
  'hypothermia',
];

export const DEFAULT_ANOMALY_CHANCE = 0.04;

function randomInRange([min, max]: readonly [number, number]): number {
  return min + Math.random() * (max - min);
}

function randomIntInRange([min, max]: readonly [number, number]): number {
  return Math.round(randomInRange([min, max]));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function applyAnomaly(vitals: TelemetryVitals, kind: AnomalyKind): void {
  switch (kind) {
    case 'hypoxia':
      // Critical desaturation; below every mode's critical SpO2 floor.
      vitals.spo2 = randomIntInRange([78, 85]);
      break;
    case 'tachycardia':
      vitals.heart_rate = randomIntInRange([205, 218]);
      break;
    case 'bradycardia':
      vitals.heart_rate = randomIntInRange([34, 42]);
      break;
    case 'hypertensive_crisis':
      vitals.blood_pressure = {
        systolic: randomIntInRange([192, 214]),
        diastolic: randomIntInRange([108, 124]),
      };
      break;
    case 'hypotension':
      vitals.blood_pressure = {
        systolic: randomIntInRange([66, 76]),
        diastolic: randomIntInRange([40, 52]),
      };
      break;
    case 'hyperthermia':
      vitals.body_temp = Number(randomInRange([39.2, 40.2]).toFixed(1));
      break;
    case 'hypothermia':
      vitals.body_temp = Number(randomInRange([34.4, 35.2]).toFixed(1));
      break;
  }
}

/**
 * Generate one telemetry packet for the given operational mode.
 *
 * @param mode   Current crew activity mode.
 * @param options Crew id, anomaly injection controls, and injectable clock.
 */
export function generateTelemetryPacket(
  mode: TelemetryMode,
  options: MockGeneratorOptions = {}
): TelemetryLog {
  const profile = MODE_PROFILES[mode];
  const {
    crewId = 'AST-0824',
    anomalyChance = DEFAULT_ANOMALY_CHANCE,
    forceAnomaly = false,
    timestamp = new Date(),
  } = options;

  const vitals: TelemetryVitals = {
    heart_rate: randomIntInRange(profile.heartRate),
    spo2: clamp(randomIntInRange(profile.spo2), 0, 100),
    blood_pressure: {
      systolic: randomIntInRange(profile.systolic),
      diastolic: randomIntInRange(profile.diastolic),
    } satisfies BloodPressure,
    body_temp: Number(randomInRange(profile.bodyTemp).toFixed(1)),
  };

  if (forceAnomaly) {
    const kind =
      forceAnomaly === true ? pick(CRITICAL_ANOMALIES) : forceAnomaly;
    applyAnomaly(vitals, kind);
  } else if (Math.random() < clamp(anomalyChance, 0, 1)) {
    applyAnomaly(vitals, pick(ALL_ANOMALIES));
  }

  return {
    timestamp: timestamp.toISOString(),
    crew_id: crewId,
    mode,
    vitals,
    posture: pick(profile.postures),
    sync_status: 'pending',
    waveforms: generateMockWaveforms(vitals.heart_rate, timestamp),
  };
}

/** Demonstration signals only; these are not sensor measurements. */
function generateMockWaveforms(heartRate: number, timestamp: Date): NonNullable<TelemetryLog['waveforms']> {
  const sampleRate = 64;
  const start = timestamp.getTime() / 1000;
  const eeg: number[] = [];
  const ecg: number[] = [];
  const gaussian = (x: number, centre: number, width: number) =>
    Math.exp(-(((x - centre) / width) ** 2));
  for (let i = 0; i < sampleRate * 2; i++) {
    const t = start + i / sampleRate;
    eeg.push(Number((18 * Math.sin(2 * Math.PI * 10 * t) + 7 * Math.sin(2 * Math.PI * 6 * t) + (Math.random() - 0.5) * 5).toFixed(2)));
    const phase = ((t * heartRate / 60) % 1 + 1) % 1;
    const value = 0.12 * gaussian(phase, 0.18, 0.055) - 0.15 * gaussian(phase, 0.36, 0.018) + 1.0 * gaussian(phase, 0.40, 0.018) - 0.25 * gaussian(phase, 0.44, 0.02) + 0.3 * gaussian(phase, 0.68, 0.10);
    ecg.push(Number((value + (Math.random() - 0.5) * 0.025).toFixed(3)));
  }
  return { source: 'simulated', sample_rate_hz: sampleRate, eeg_microvolts: eeg, ecg_millivolts: ecg };
}
