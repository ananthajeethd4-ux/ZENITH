import type { TelemetryMode } from "./telemetry";

/**
 * Mock telemetry source for the dashboard demo.
 *
 * Each packet carries the same core vitals as the offline store plus the
 * richer sleep/posture fields the command center visualizes. Swap
 * `generateMockTelemetry` for a WebSocket message handler when real hardware
 * is available; the packet shape can stay the same.
 */

export type SleepStage = "awake" | "light" | "deep" | "rem";

export type PostureLabel =
  | "upright"
  | "seated"
  | "supine"
  | "prone"
  | "moving";

export type AnomalyKind =
  | "hypoxia"
  | "tachycardia"
  | "hypertensive"
  | "hyperthermia";

export interface SleepMetrics {
  stage: SleepStage;
  duration_hours: number;
  /** Sleep efficiency as a percentage, 0-100. */
  efficiency: number;
  /** Cumulative apnea events observed during the mission. */
  apnea_events: number;
}

export interface Posture {
  label: PostureLabel;
  tilt_degrees: number;
  /** Postural stability as a percentage, 0-100. */
  stability: number;
}

export interface MockTelemetryPacket {
  /** Client-side identity for React keys and chart data. */
  id: string;
  timestamp: number;
  crew_id: string;
  mode: TelemetryMode;
  vitals: {
    heart_rate: number;
    spo2: number;
    /** Kept as a string so it matches the Dexie schema from the previous step. */
    blood_pressure: string;
    body_temp: number;
  };
  sleep_metrics: SleepMetrics;
  posture: Posture;
  anomaly: AnomalyKind | null;
}

interface Range {
  min: number;
  max: number;
}

interface ModeProfile {
  heartRate: Range;
  spo2: Range;
  systolic: Range;
  diastolic: Range;
  bodyTemp: Range;
  efficiency: Range;
  stability: Range;
  posture: PostureLabel;
  sleepStage: SleepStage;
}

const MODE_PROFILES: Record<TelemetryMode, ModeProfile> = {
  rest: {
    heartRate: { min: 62, max: 82 },
    spo2: { min: 96, max: 99 },
    systolic: { min: 112, max: 126 },
    diastolic: { min: 70, max: 82 },
    bodyTemp: { min: 36.4, max: 37 },
    efficiency: { min: 86, max: 92 },
    stability: { min: 82, max: 96 },
    posture: "seated",
    sleepStage: "awake",
  },
  exercise: {
    heartRate: { min: 128, max: 166 },
    spo2: { min: 95, max: 99 },
    systolic: { min: 128, max: 145 },
    diastolic: { min: 78, max: 90 },
    bodyTemp: { min: 37.2, max: 37.8 },
    efficiency: { min: 80, max: 88 },
    stability: { min: 60, max: 82 },
    posture: "moving",
    sleepStage: "awake",
  },
  sleep: {
    heartRate: { min: 46, max: 60 },
    spo2: { min: 95, max: 99 },
    systolic: { min: 104, max: 118 },
    diastolic: { min: 62, max: 74 },
    bodyTemp: { min: 36, max: 36.5 },
    efficiency: { min: 88, max: 96 },
    stability: { min: 88, max: 99 },
    posture: "supine",
    sleepStage: "light",
  },
  stress: {
    heartRate: { min: 96, max: 132 },
    spo2: { min: 94, max: 98 },
    systolic: { min: 138, max: 158 },
    diastolic: { min: 86, max: 98 },
    bodyTemp: { min: 37, max: 37.7 },
    efficiency: { min: 66, max: 78 },
    stability: { min: 48, max: 68 },
    posture: "upright",
    sleepStage: "awake",
  },
};

const ANOMALY_KINDS: AnomalyKind[] = [
  "hypoxia",
  "tachycardia",
  "hypertensive",
  "hyperthermia",
];

function randomBetween(range: Range, decimals = 0): number {
  const value = range.min + Math.random() * (range.max - range.min);
  return Number(value.toFixed(decimals));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Move gradually toward a target instead of jumping every packet. This makes
 * the live charts look like a sensor feed rather than random noise.
 */
function smooth(
  previous: number | undefined,
  target: number,
  volatility: number,
  decimals = 0,
): number {
  const base =
    previous === undefined ? target : previous + (target - previous) * 0.42;
  const jitter = (Math.random() - 0.5) * volatility;
  return Number((base + jitter).toFixed(decimals));
}

function pickSleepStage(previous?: MockTelemetryPacket | null): SleepStage {
  if (
    previous?.mode === "sleep" &&
    previous.sleep_metrics.stage !== "awake" &&
    Math.random() > 0.35
  ) {
    return previous.sleep_metrics.stage;
  }

  const stages: SleepStage[] = ["light", "deep", "rem"];
  return stages[Math.floor(Math.random() * stages.length)] ?? "light";
}

function bloodPressure(systolic: number, diastolic: number): string {
  return `${Math.round(systolic)}/${Math.round(diastolic)}`;
}

function parseBloodPressure(value: string | undefined): {
  systolic?: number;
  diastolic?: number;
} {
  const [systolic, diastolic] = (value ?? "")
    .split("/")
    .map((part) => Number(part));

  return {
    systolic: Number.isFinite(systolic) ? systolic : undefined,
    diastolic: Number.isFinite(diastolic) ? diastolic : undefined,
  };
}

function applyAnomaly(
  packet: MockTelemetryPacket,
  anomaly: AnomalyKind,
): MockTelemetryPacket {
  const vitals = { ...packet.vitals };
  const posture = { ...packet.posture };

  switch (anomaly) {
    case "hypoxia":
      vitals.spo2 = randomBetween({ min: 82, max: 87 });
      vitals.heart_rate = randomBetween({ min: 118, max: 142 });
      posture.label = "supine";
      posture.stability = randomBetween({ min: 34, max: 46 });
      break;

    case "tachycardia":
      vitals.heart_rate = randomBetween({ min: 196, max: 212 });
      vitals.spo2 = randomBetween({ min: 90, max: 94 });
      vitals.blood_pressure = bloodPressure(
        randomBetween({ min: 152, max: 172 }),
        randomBetween({ min: 96, max: 108 }),
      );
      posture.label = "seated";
      posture.stability = randomBetween({ min: 40, max: 52 });
      break;

    case "hypertensive":
      vitals.blood_pressure = bloodPressure(
        randomBetween({ min: 185, max: 205 }),
        randomBetween({ min: 120, max: 132 }),
      );
      vitals.heart_rate = randomBetween({ min: 110, max: 138 });
      vitals.spo2 = randomBetween({ min: 92, max: 96 });
      posture.label = "upright";
      posture.stability = randomBetween({ min: 48, max: 60 });
      break;

    case "hyperthermia":
      vitals.body_temp = randomBetween({ min: 39.4, max: 40.2 }, 1);
      vitals.heart_rate = randomBetween({ min: 140, max: 165 });
      vitals.spo2 = randomBetween({ min: 92, max: 96 });
      posture.label = "supine";
      posture.stability = randomBetween({ min: 42, max: 55 });
      break;
  }

  return {
    ...packet,
    vitals,
    posture,
    anomaly,
  };
}

export interface GenerateTelemetryOptions {
  mode: TelemetryMode;
  previous?: MockTelemetryPacket | null;
  anomaly?: AnomalyKind | null;
  crewId?: string;
  timestamp?: number;
}

/**
 * Produce one plausible packet for the selected mission mode. Values drift
 * from the previous packet so the live charts remain readable.
 */
export function generateMockTelemetry({
  mode,
  previous = null,
  anomaly = null,
  crewId = "CDR-01",
  timestamp = Date.now(),
}: GenerateTelemetryOptions): MockTelemetryPacket {
  const profile = MODE_PROFILES[mode];
  const previousVitals = previous?.vitals;
  const previousPressure = parseBloodPressure(previousVitals?.blood_pressure);

  const heartRate = clamp(
    smooth(
      previousVitals?.heart_rate,
      randomBetween(profile.heartRate),
      mode === "exercise" ? 9 : 4,
    ),
    30,
    225,
  );
  const spo2 = clamp(
    smooth(previousVitals?.spo2, randomBetween(profile.spo2), 1.2),
    70,
    100,
  );
  const systolic = clamp(
    smooth(
      previousPressure.systolic,
      randomBetween(profile.systolic),
      4,
    ),
    70,
    240,
  );
  const diastolic = clamp(
    smooth(
      previousPressure.diastolic,
      randomBetween(profile.diastolic),
      3,
    ),
    40,
    150,
  );
  const bodyTemp = clamp(
    smooth(
      previousVitals?.body_temp,
      randomBetween(profile.bodyTemp, 1),
      0.16,
      1,
    ),
    34,
    42,
  );

  const previousSleep = previous?.sleep_metrics;
  const sleepStage = mode === "sleep" ? pickSleepStage(previous) : "awake";
  const durationHours = Number(
    (
      (previousSleep?.duration_hours ?? 7.1) +
      (mode === "sleep" ? 60 / 3_600 : 0)
    ).toFixed(2),
  );
  const efficiency = clamp(
    smooth(
      previousSleep?.efficiency,
      randomBetween(profile.efficiency),
      2.5,
    ),
    0,
    100,
  );
  const apneaEvents =
    (previousSleep?.apnea_events ?? 0) +
    (mode === "sleep" && Math.random() < 0.025 ? 1 : 0);

  const packet: MockTelemetryPacket = {
    id: `${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp,
    crew_id: crewId,
    mode,
    vitals: {
      heart_rate: heartRate,
      spo2: spo2,
      blood_pressure: bloodPressure(systolic, diastolic),
      body_temp: bodyTemp,
    },
    sleep_metrics: {
      stage: sleepStage,
      duration_hours: durationHours,
      efficiency,
      apnea_events: apneaEvents,
    },
    posture: {
      label: profile.posture,
      tilt_degrees: randomBetween({ min: -12, max: 28 }),
      stability: clamp(
        smooth(
          previous?.posture.stability,
          randomBetween(profile.stability),
          5,
        ),
        0,
        100,
      ),
    },
    anomaly: null,
  };

  return anomaly ? applyAnomaly(packet, anomaly) : packet;
}

export function pickAnomalyKind(): AnomalyKind {
  return (
    ANOMALY_KINDS[Math.floor(Math.random() * ANOMALY_KINDS.length)] ??
    "hypoxia"
  );
}

export function formatPostureLabel(label: PostureLabel): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatModeLabel(mode: TelemetryMode): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

export function formatSleepStage(stage: SleepStage): string {
  return stage === "awake"
    ? "Awake"
    : `${stage.charAt(0).toUpperCase()}${stage.slice(1)} sleep`;
}
