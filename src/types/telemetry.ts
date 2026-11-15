/**
 * Shared telemetry contracts.
 *
 * These types are intentionally the single source of truth for:
 *  - IndexedDB records (see `src/db/localDb.ts`)
 *  - Mock packet generation (see `src/services/mockGenerator.ts`)
 *  - The sync payload posted to `/api/telemetry/sync`
 *  - The live dashboard UI
 */

export type TelemetryMode = 'rest' | 'exercise' | 'sleep' | 'stress';

export type SyncStatus = 'pending' | 'synced';

export type Posture =
  | 'supine'
  | 'seated'
  | 'standing'
  | 'free_float'
  | 'treadmill_stride'
  | 'cycle_seated';

export interface BloodPressure {
  systolic: number;
  diastolic: number;
}

export interface TelemetryVitals {
  heart_rate: number;
  spo2: number;
  blood_pressure: BloodPressure;
  body_temp: number;
}

/**
 * A single locally persisted telemetry packet.
 *
 * `id` is assigned by Dexie (auto-incremented primary key), so it is optional
 * on records that have not been written yet.
 */
export interface TelemetryLog {
  id?: number;
  timestamp: string;
  crew_id: string;
  mode: TelemetryMode;
  vitals: TelemetryVitals;
  posture: Posture;
  sync_status: SyncStatus;
  /** Synthetic two-second snapshots; absent on older saved records. */
  waveforms?: {
    source: 'simulated';
    sample_rate_hz: number;
    eeg_microvolts: number[];
    ecg_millivolts: number[];
  };
}

/** Request body accepted by POST /api/telemetry/sync. */
export interface TelemetryBatchPayload {
  crew_id: string;
  logs: TelemetryLog[];
}

/** Successful response from POST /api/telemetry/sync. */
export interface TelemetrySyncResponse {
  success: true;
  batch_id: string;
  crew_id: string;
  received: number;
  accepted: number;
  processed_at: string;
}

export const TELEMETRY_MODES: readonly TelemetryMode[] = [
  'rest',
  'exercise',
  'sleep',
  'stress',
] as const;

export const POSTURE_LABELS: Record<Posture, string> = {
  supine: 'Supine',
  seated: 'Seated',
  standing: 'Standing',
  free_float: 'Free float',
  treadmill_stride: 'Treadmill stride',
  cycle_seated: 'Cycle seated',
};

export const MODE_LABELS: Record<TelemetryMode, string> = {
  rest: 'Rest',
  exercise: 'Exercise',
  sleep: 'Sleep',
  stress: 'Stress',
};
