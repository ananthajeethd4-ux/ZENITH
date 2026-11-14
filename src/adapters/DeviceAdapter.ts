import { SupportedMetric } from '../types/device';

export interface TelemetryPacket {
  timestamp: string;
  heartRate?: number;
  spo2?: number;
  skinTemperature?: number;
  respiratoryRate?: number;
  accelerometry?: { x: number; y: number; z: number };
  batteryPercent?: number;
  rssi_dbm?: number;
  rawSample?: number[];
}

export interface IDeviceAdapter {
  id: string;
  name: string;
  isRealHardware: boolean;
  supportedMetrics: SupportedMetric[];
  
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): boolean;
  getBatteryLevel(): Promise<number | null>;
  fetchLatestTelemetry(): Promise<TelemetryPacket>;
  subscribeStream?(callback: (packet: TelemetryPacket) => void): () => void;
}

