export type EEGChannelId = 'Fp1' | 'Fp2' | 'C3' | 'C4' | 'Pz' | 'O1';

export interface EEGChannelQuality {
  channel: EEGChannelId;
  impedance_kOhm: number; // < 5 kOhm is excellent, 5-10 is good, > 10 is noisy
  status: 'good' | 'marginal' | 'poor';
}

export interface EEGBandPower {
  delta: number; // 0.5 - 4 Hz (deep restorative / slow wave)
  theta: number; // 4 - 8 Hz (drowsiness / cognitive load)
  alpha: number; // 8 - 12 Hz (calm alertness / eyes closed)
  beta: number;  // 13 - 30 Hz (active thinking / focus)
  gamma: number; // 30 - 50 Hz (high cognitive processing)
}

export interface EEGSession {
  id: string;
  astronautId: string;
  title: string;
  timestamp: string; // ISO
  durationSeconds: number;
  samplingRateHz: number; // e.g. 250 Hz
  channels: EEGChannelId[];
  bandPowerSummary: EEGBandPower;
  channelQualities: EEGChannelQuality[];
  protocol: 'Cognitive Workload Test' | 'Pre-Sleep Baseline' | 'Neuro-Fatigue Check' | 'Resting State';
  isSimulated: boolean;
  notes: string;
  recordedBy: string;
}

export interface RawEEGDataPoint {
  timeOffsetMs: number;
  channels: Record<EEGChannelId, number>; // in microvolts (uV)
}

