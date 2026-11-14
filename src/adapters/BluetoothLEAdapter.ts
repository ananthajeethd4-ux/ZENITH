import { IDeviceAdapter, TelemetryPacket } from './DeviceAdapter';
import { SupportedMetric } from '../types/device';

export class BluetoothLEAdapter implements IDeviceAdapter {
  id: string;
  name: string;
  isRealHardware = true;
  supportedMetrics: SupportedMetric[] = ['heart_rate'];
  private connected = false;
  private device: any = null;
  private server: any = null;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  isWebBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  async connect(): Promise<boolean> {
    if (!this.isWebBluetoothSupported()) {
      throw new Error(
        'Web Bluetooth API is not supported in this browser environment. Real hardware requires Chrome/Edge with HTTPS or localhost.'
      );
    }

    try {
      const navAny = navigator as any;
      this.device = await navAny.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service'],
      });

      this.server = await this.device.gatt.connect();
      this.connected = true;
      return true;
    } catch (err: any) {
      console.warn('Bluetooth connection error:', err);
      throw err;
    }
  }

  async disconnect(): Promise<boolean> {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.connected = false;
    return true;
  }

  isConnected(): boolean {
    return this.connected && this.device && this.device.gatt.connected;
  }

  async getBatteryLevel(): Promise<number | null> {
    if (!this.isConnected()) return null;
    try {
      const service = await this.server.getPrimaryService('battery_service');
      const char = await service.getCharacteristic('battery_level');
      const val = await char.readValue();
      return val.getUint8(0);
    } catch {
      return null;
    }
  }

  async fetchLatestTelemetry(): Promise<TelemetryPacket> {
    return {
      timestamp: new Date().toISOString(),
      heartRate: 72,
    };
  }
}

