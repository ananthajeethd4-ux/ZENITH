export type AlertSeverity = 'advisory' | 'caution' | 'alert';
export type AlertCategory = 'vitals_threshold' | 'missed_checkin' | 'stale_sensor' | 'fatigue_risk' | 'device_fault';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface HealthAlert {
  id: string;
  astronautId: string;
  timestamp: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  status: AlertStatus;
  triggerValue?: string;
  thresholdLimit?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolutionNote?: string;
}

export interface CrewHealthReport {
  id: string;
  generatedAt: string;
  missionElapsedTime: string;
  reportingOfficer: string;
  crewSummary: {
    totalAstronauts: number;
    normalCount: number;
    attentionCount: number;
    activeAlertsCount: number;
    overallSleepAdherencePercent: number;
    overallExerciseAdherencePercent: number;
  };
  individualSummaries: {
    astronautId: string;
    astronautName: string;
    role: string;
    meanHeartRate24h: number;
    meanSpo2_24h: number;
    sleepDebtMinutes: number;
    weeklyExerciseHours: number;
    activeAlerts: number;
    fitForDutyStatus: 'Full Duty' | 'Light Duty' | 'Medical Monitoring';
  }[];
  officerObservations: string;
}

