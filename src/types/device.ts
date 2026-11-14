export type DeviceType =
  | 'Biomarker Chest Harness'
  | 'Astroglove & Pulse Ring'
  | 'Hexoskin Microgravity Vest'
  | 'Dry-Electrode EEG Headband'
  | 'Clinical Multi-Parameter Station';

export type DeviceConnectionStatus = 'connected' | 'disconnected' | 'pairing' | 'standby';

export type SupportedMetric =
  | 'heart_rate'
  | 'spo2'
  | 'skin_temperature'
  | 'respiratory_rate'
  | 'accelerometry'
  | 'eeg_waveforms'
  | 'blood_pressure';

export interface DeviceConsentSettings {
  heartRate: boolean;
  spo2: boolean;
  sleepStages: boolean;
  rawMotion: boolean;
  eegWaveforms: boolean;
  cameraRecordings: boolean;
}

export interface MedicalDevice {
  id: string;
  name: string;
  model: string;
  type: DeviceType;
  assignedAstronautId: string;
  connectionStatus: DeviceConnectionStatus;
  batteryLevelPercent?: number;
  lastSyncTimestamp: string;
  firmwareVersion: string;
  supportedMetrics: SupportedMetric[];
  isRealHardware: boolean;
  adapterName: string;
  signalStrengthDbm?: number;
}

