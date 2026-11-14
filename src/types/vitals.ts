export type ReadingSource =
  | 'Wearable Sensor (Simulated)'
  | 'Wearable Sensor (Connected LE)'
  | 'Manual Sphygmomanometer Cuff'
  | 'Flight Diagnostic Station'
  | 'Clinical Thermometer (Manual)';

export interface VitalReading {
  id: string;
  astronautId: string;
  timestamp: string; // ISO
  heartRate_bpm: number;
  spo2_percent: number;
  respiratoryRate_brpm: number;
  temperature_celsius?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    method: 'manual_cuff' | 'validated_station';
    calibrated: boolean;
  };
  source: ReadingSource;
  isSimulated: boolean;
  qualityScore: number; // 0 - 100%
}

export interface VitalThresholds {
  astronautId: string;
  minHeartRate: number;
  maxHeartRate: number;
  minSpo2: number;
  maxTemperature: number;
  maxSystolicBP: number;
  minDiastolicBP: number;
  maxRespiratoryRate: number;
}

