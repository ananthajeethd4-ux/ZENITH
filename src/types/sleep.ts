export type SleepStageType = 'deep' | 'rem' | 'light' | 'wake';

export interface SleepStageSegment {
  stage: SleepStageType;
  startTime: string; // ISO
  durationMinutes: number;
}

export interface SleepSession {
  id: string;
  astronautId: string;
  date: string; // YYYY-MM-DD
  bedtime: string; // ISO
  wakeTime: string; // ISO
  totalDurationMinutes: number;
  efficiencyPercent: number;
  remMinutes: number;
  deepMinutes: number;
  lightMinutes: number;
  wakeMinutes: number;
  sleepDebtMinutes: number;
  stagesAvailable: boolean;
  stages: SleepStageSegment[];
  source: 'Smart Sleep Pad [Simulated]' | 'Hexoskin Vest' | 'Manual Log';
  isSimulated: boolean;
}

export interface SleepDiaryEntry {
  id: string;
  astronautId: string;
  date: string;
  sleepQualityRating: 1 | 2 | 3 | 4 | 5; // 1 = poor, 5 = restorative
  ambientDisturbances: string[]; // e.g. "Ventilation acoustic noise", "CO2 localized spike", "Restraint belt tension"
  caffeineIntakeEvening: boolean;
  notes: string;
  createdAt: string;
}

