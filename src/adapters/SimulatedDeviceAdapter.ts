import { IDeviceAdapter, TelemetryPacket } from './DeviceAdapter';
import { SupportedMetric } from '../types/device';

export class SimulatedDeviceAdapter implements IDeviceAdapter {
  id: string;
  name: string;
  isRealHardware = false;
  supportedMetrics: SupportedMetric[];
  private connected = false;
  private batteryLevel = 88;
  private streamInterval: number | null = null;
  private baseHeartRate: number;
  private baseSpo2: number;

  constructor(
    id: string,
    name: string,
    metrics: SupportedMetric[] = ['heart_rate', 'spo2', 'skin_temperature', 'respiratory_rate'],
    baseHr = 68,
    baseSpo2 = 98
  ) {
    this.id = id;
    this.name = name;
    this.supportedMetrics = metrics;
    this.baseHeartRate = baseHr;
    this.baseSpo2 = baseSpo2;
  }

  async connect(): Promise<boolean> {
    // Simulate brief handshake
    await new Promise((r) => setTimeout(r, 400));
    this.connected = true;
    return true;
  }

  async disconnect(): Promise<boolean> {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }
    this.connected = false;
    return true;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getBatteryLevel(): Promise<number | null> {
    return this.batteryLevel;
  }

  async fetchLatestTelemetry(): Promise<TelemetryPacket> {
    const jitterHr = Math.round((Math.random() - 0.5) * 4);
    const jitterSpo2 = Math.random() > 0.8 ? -1 : 0;
    const tempJitter = Number(((Math.random() - 0.5) * 0.2).toFixed(1));

    return {
      timestamp: new Date().toISOString(),
      heartRate: this.baseHeartRate + jitterHr,
      spo2: Math.min(100, Math.max(90, this.baseSpo2 + jitterSpo2)),
      skinTemperature: Number((36.6 + tempJitter).toFixed(1)),
      respiratoryRate: 14 + Math.round((Math.random() - 0.5) * 2),
      batteryPercent: this.batteryLevel,
      rssi_dbm: -58 + Math.round(Math.random() * 5),
    };
  }

  subscribeStream(callback: (packet: TelemetryPacket) => void): () => void {
    const interval = window.setInterval(async () => {
      if (this.connected) {
        const packet = await this.fetchLatestTelemetry();
        callback(packet);
      }
    }, 2000);

    return () => clearInterval(interval);
  }
}

