export type ExerciseModality =
  | 'ARED Resistive'
  | 'T2 Treadmill'
  | 'CEVIS Cycle Ergometer'
  | 'Microgravity Core Conditioning'
  | 'EVA Pre-Breathe Protocol';

export interface ExerciseSession {
  id: string;
  astronautId: string;
  date: string;
  modality: ExerciseModality;
  durationMinutes: number;
  completed: boolean;
  targetDurationMinutes: number;
  avgHeartRate: number;
  peakHeartRate: number;
  energyExpenditure_kcal: number;
  rpe_score: number; // Rate of Perceived Exertion (1 - 10)
  countermeasureDetails: {
    peakForceNewtons?: number;
    harnessLoadingPercent?: number; // For T2 treadmill microgravity harness
    avgWatts?: number;             // For CEVIS cycle ergometer
    cadenceRpm?: number;
    setsCompleted?: number;
  };
  notes?: string;
  source: 'Station Telemetry Interface' | 'Manual Log' | 'Sensor Stream';
  isSimulated: boolean;
}

export interface ExerciseGoal {
  astronautId: string;
  weeklyAredSessionsTarget: number;
  weeklyAerobicMinutesTarget: number;
  targetDailyCaloricBurn: number;
  minimumRpeLevel: number;
}

