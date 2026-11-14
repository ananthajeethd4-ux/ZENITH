import type { TelemetryMode } from "./telemetry";
import type { MockTelemetryPacket, Posture } from "./mockTelemetry";

/**
 * Thresholds are deliberately simple and mode-aware: 140 bpm is alarming at
 * rest but normal during exercise. In a real system these would come from a
 * flight surgeon's config rather than source code.
 */

export type Severity = "nominal" | "warning" | "critical";

export type VitalKey = "heart_rate" | "spo2" | "blood_pressure" | "posture";

export type VitalSeverities = Record<VitalKey, Severity>;

export interface HealthAlert {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
}

interface HeartRateLimits {
  lowCritical: number;
  lowWarning: number;
  highWarning: number;
  highCritical: number;
}

const HEART_RATE_LIMITS: Record<TelemetryMode, HeartRateLimits> = {
  rest: {
    lowCritical: 42,
    lowWarning: 50,
    highWarning: 105,
    highCritical: 130,
  },
  exercise: {
    lowCritical: 45,
    lowWarning: 55,
    highWarning: 175,
    highCritical: 190,
  },
  sleep: {
    lowCritical: 35,
    lowWarning: 42,
    highWarning: 80,
    highCritical: 105,
  },
  stress: {
    lowCritical: 45,
    lowWarning: 55,
    highWarning: 145,
    highCritical: 170,
  },
};

const SEVERITY_RANK: Record<Severity, number> = {
  nominal: 0,
  warning: 1,
  critical: 2,
};

const MODE_LABEL: Record<TelemetryMode, string> = {
  rest: "rest",
  exercise: "exercise",
  sleep: "sleep",
  stress: "stress",
};

export function parseBloodPressure(value: string): {
  systolic: number;
  diastolic: number;
} {
  const [systolic, diastolic] = value.split("/").map((part) => Number(part));

  return {
    systolic: Number.isFinite(systolic) ? systolic : 0,
    diastolic: Number.isFinite(diastolic) ? diastolic : 0,
  };
}

export function worseSeverity(a: Severity, b: Severity): Severity {
  return SEVERITY_RANK[b] > SEVERITY_RANK[a] ? b : a;
}

export function getHeartRateSeverity(
  heartRate: number,
  mode: TelemetryMode,
): Severity {
  const limits = HEART_RATE_LIMITS[mode];

  if (heartRate <= limits.lowCritical || heartRate >= limits.highCritical) {
    return "critical";
  }
  if (heartRate <= limits.lowWarning || heartRate >= limits.highWarning) {
    return "warning";
  }
  return "nominal";
}

export function getSpo2Severity(spo2: number): Severity {
  if (spo2 < 90) return "critical";
  if (spo2 < 95) return "warning";
  return "nominal";
}

export function getBloodPressureSeverity(value: string): Severity {
  const { systolic, diastolic } = parseBloodPressure(value);

  if (systolic >= 180 || diastolic >= 120 || systolic <= 80) {
    return "critical";
  }
  if (systolic >= 150 || diastolic >= 95 || systolic < 90) {
    return "warning";
  }
  return "nominal";
}

export function getTemperatureSeverity(bodyTemp: number): Severity {
  if (bodyTemp >= 39 || bodyTemp <= 35) return "critical";
  if (bodyTemp >= 38 || bodyTemp <= 35.7) return "warning";
  return "nominal";
}

export function getPostureSeverity(posture: Posture): Severity {
  if (posture.label === "prone" || posture.stability <= 45) return "critical";
  if (posture.stability <= 65) return "warning";
  return "nominal";
}

export function getVitalSeverities(
  packet: MockTelemetryPacket,
): VitalSeverities {
  return {
    heart_rate: getHeartRateSeverity(
      packet.vitals.heart_rate,
      packet.mode,
    ),
    spo2: getSpo2Severity(packet.vitals.spo2),
    blood_pressure: getBloodPressureSeverity(packet.vitals.blood_pressure),
    posture: getPostureSeverity(packet.posture),
  };
}

export function getHealthAlerts(
  packet: MockTelemetryPacket,
): HealthAlert[] {
  const alerts: HealthAlert[] = [];
  const mode = MODE_LABEL[packet.mode];

  const heartRateSeverity = getHeartRateSeverity(
    packet.vitals.heart_rate,
    packet.mode,
  );
  if (heartRateSeverity !== "nominal") {
    const limits = HEART_RATE_LIMITS[packet.mode];
    const isHigh = packet.vitals.heart_rate >= limits.highWarning;

    alerts.push({
      id: "heart_rate",
      severity: heartRateSeverity,
      title: isHigh ? "Heart rate spike" : "Heart rate below threshold",
      detail: `${packet.vitals.heart_rate} bpm during ${mode} mode.`,
    });
  }

  const spo2Severity = getSpo2Severity(packet.vitals.spo2);
  if (spo2Severity !== "nominal") {
    alerts.push({
      id: "spo2",
      severity: spo2Severity,
      title:
        spo2Severity === "critical"
          ? "Critical hypoxia detected"
          : "Oxygen saturation low",
      detail: `SpO2 at ${packet.vitals.spo2}% — nominal is 95% or higher.`,
    });
  }

  const bpSeverity = getBloodPressureSeverity(packet.vitals.blood_pressure);
  if (bpSeverity !== "nominal") {
    const { systolic } = parseBloodPressure(packet.vitals.blood_pressure);
    const isLow = systolic < 90;

    alerts.push({
      id: "blood_pressure",
      severity: bpSeverity,
      title: isLow
        ? "Hypotension detected"
        : bpSeverity === "critical"
          ? "Blood pressure critical"
          : "Blood pressure elevated",
      detail: `${packet.vitals.blood_pressure} mmHg during ${mode} mode.`,
    });
  }

  const temperatureSeverity = getTemperatureSeverity(
    packet.vitals.body_temp,
  );
  if (temperatureSeverity !== "nominal") {
    alerts.push({
      id: "body_temp",
      severity: temperatureSeverity,
      title:
        temperatureSeverity === "critical"
          ? "Thermal emergency"
          : "Body temperature out of range",
      detail: `${packet.vitals.body_temp.toFixed(1)} °C — nominal is 36.0–37.8 °C.`,
    });
  }

  const postureSeverity = getPostureSeverity(packet.posture);
  if (postureSeverity !== "nominal") {
    alerts.push({
      id: "posture",
      severity: postureSeverity,
      title: "Posture instability",
      detail: `Postural stability at ${packet.posture.stability}% while ${packet.posture.label}.`,
    });
  }

  return alerts.sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity],
  );
}

export function getOverallSeverity(alerts: HealthAlert[]): Severity {
  return alerts.reduce<Severity>(
    (worst, alert) => worseSeverity(worst, alert.severity),
    "nominal",
  );
}
