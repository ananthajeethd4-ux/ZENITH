import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { BluetoothLEAdapter } from '../adapters/BluetoothLEAdapter';
import {
  Radio,
  Battery,
  BatteryCharging,
  RefreshCw,
  Sliders,
  CheckCircle,
  XCircle,
  Bluetooth,
  Shield,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { SupportedMetric } from '../types/device';

export const DevicesPage: React.FC = () => {
  const {
    selectedAstronaut,
    devices,
    toggleDeviceConnection,
    consentSettingsMap,
    updateConsentSettings,
    addAuditLog,
  } = useApp();

  const [bleScanning, setBleScanning] = useState(false);
  const [bleStatusMsg, setBleStatusMsg] = useState<string | null>(null);

  const astronautConsent = consentSettingsMap[selectedAstronaut.id] || {
    heartRate: true,
    spo2: true,
    sleepStages: true,
    rawMotion: true,
    eegWaveforms: true,
    cameraRecordings: true,
  };

  const astronautDevices = devices.filter((d) => d.assignedAstronautId === selectedAstronaut.id);

  // Web Bluetooth LE real scanner handler
  const handleScanBluetooth = async () => {
    setBleScanning(true);
    setBleStatusMsg(null);
    const bleAdapter = new BluetoothLEAdapter('BLE-GENERIC', 'Web BLE Sensor');

    try {
      if (bleAdapter.isWebBluetoothSupported()) {
        setBleStatusMsg('Web Bluetooth is supported. Browser pairing dialog opened.');
        await bleAdapter.connect();
        setBleStatusMsg('Hardware device paired successfully via GATT Heart Rate Service!');
        addAuditLog('CONNECT_BLE_DEVICE', 'Paired real physical BLE heart rate sensor');
      } else {
        setBleStatusMsg(
          'Web Bluetooth API is not active in this environment (requires Chromium with HTTPS or localhost). System continues operating via verified hardware simulation adapters.'
        );
      }
    } catch (err: any) {
      setBleStatusMsg(
        err.message || 'Bluetooth connection was cancelled or timed out. Falling back to calibrated simulator adapter.'
      );
    } finally {
      setBleScanning(false);
    }
  };

  const getMetricLabel = (metric: SupportedMetric) => {
    switch (metric) {
      case 'heart_rate':
        return 'Pulse / HR';
      case 'spo2':
        return 'SpO₂ Oxygen';
      case 'skin_temperature':
        return 'Skin Temp';
      case 'respiratory_rate':
        return 'Respiration';
      case 'accelerometry':
        return '3-Axis Actigraphy';
      case 'eeg_waveforms':
        return '8-Ch EEG Potentials';
      case 'blood_pressure':
        return 'Validated Pressure Cuff';
      default:
        return metric;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and BLE Scanner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
            Wearable & Medical Device Fleet
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Adapter-based integration for spaceflight sensor telemetry, dry EEGs, and diagnostic stations
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleScanBluetooth}
          loading={bleScanning}
          icon={<Bluetooth className="w-3.5 h-3.5" />}
        >
          Scan Web Bluetooth LE
        </Button>
      </div>

      {/* Bluetooth Status Message if triggered */}
      {bleStatusMsg && (
        <div className="p-3 bg-paper border border-edge rounded-sm flex items-start gap-2.5 text-xs text-ink animate-in fade-in duration-150">
          <Info className="w-4 h-4 text-slate-primary shrink-0 mt-0.5" />
          <span>{bleStatusMsg}</span>
        </div>
      )}

      {/* Adapter Architecture & Truth in Measurement Disclosure */}
      <div className="p-4 bg-paper-dark border border-edge rounded-sm space-y-2 text-xs text-ink-secondary">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <Shield className="w-4 h-4 text-slate-primary shrink-0" />
          <span>Device Adapter Architecture & Sensor Fidelity Standards</span>
        </div>
        <p className="leading-relaxed">
          <strong className="text-ink">Truth in physiological measurement:</strong> Generic commercial wearables cannot measure blood pressure, clinical EEG, or core body temperature without validated specialized transducers. Each device in ZENITH adheres to an explicit capability schema (<code className="font-mono text-ink text-[11px]">supportedMetrics[]</code>). When physical hardware is not linked, simulated adapters generate realistic circadian streams labeled with transparent <strong className="text-ink">Simulated</strong> flags.
        </p>
      </div>

      {/* Assigned Devices Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-ink font-mono uppercase tracking-wider">
          Assigned Devices for {selectedAstronaut.name} ({selectedAstronaut.id})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {astronautDevices.map((device) => {
            const isConnected = device.connectionStatus === 'connected';

            return (
              <div
                key={device.id}
                className={`paper-surface rounded-sm p-4 sm:p-5 border transition-all ${
                  isConnected ? 'border-edge' : 'border-dashed border-edge/80 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3 border-b border-edge/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-ink text-sm sm:text-base">
                        {device.name}
                      </h3>
                      <Badge variant={isConnected ? 'normal' : 'unavailable'} size="sm" dot>
                        {isConnected ? 'Connected' : 'Offline'}
                      </Badge>
                    </div>
                    <div className="text-xs text-ink-secondary font-mono mt-0.5">
                      Model: {device.model} • FW: {device.firmwareVersion}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    {device.batteryLevelPercent !== undefined && (
                      <span className="flex items-center gap-1 text-ink">
                        <Battery className="w-3.5 h-3.5 text-slate-primary" />
                        {device.batteryLevelPercent}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Supported Capabilities */}
                <div className="my-3">
                  <span className="text-[10px] font-mono uppercase text-ink-secondary block mb-1.5">
                    Validated Metrics:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {device.supportedMetrics.map((metric) => (
                      <span
                        key={metric}
                        className="px-2 py-0.5 bg-paper border border-edge rounded-sm text-[11px] font-mono text-ink"
                      >
                        {getMetricLabel(metric)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Adapter & Last Sync */}
                <div className="text-xs font-mono text-ink-secondary flex items-center justify-between pt-2 border-t border-edge/60">
                  <div>
                    <span>Adapter: </span>
                    <strong className="text-ink">{device.adapterName}</strong>
                    {device.isRealHardware ? (
                      <Badge variant="primary" size="sm" className="ml-1.5">Hardware</Badge>
                    ) : (
                      <Badge variant="simulated" size="sm" className="ml-1.5">Simulator</Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={isConnected ? 'secondary' : 'primary'}
                    onClick={() => toggleDeviceConnection(device.id)}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Granular Consent Controls per Shared Data Type */}
      <Card>
        <CardHeader
          title="Telemetry Data Sharing & Consent Permissions"
          subtitle={`Granular astronaut control over biosensors transmitting from ${selectedAstronaut.name}'s suite`}
          tag={<Badge variant="normal" size="sm">Self-Sovereign Consent</Badge>}
        />

        <div className="space-y-3">
          {[
            {
              key: 'heartRate' as const,
              label: 'Cardiac Pulse & R-R Interval Stream',
              desc: 'Permits flight surgeon to observe continuous resting and exertion pulse metrics.',
            },
            {
              key: 'spo2' as const,
              label: 'Capillary Blood Oxygenation (SpO₂)',
              desc: 'Continuous photoplethysmography transmission during EVA and sleep.',
            },
            {
              key: 'sleepStages' as const,
              label: 'Circadian Sleep Stages & Hypnograms',
              desc: 'Calculated deep, REM, light, and wake sleep duration records.',
            },
            {
              key: 'rawMotion' as const,
              label: 'Raw 3-Axis Actigraphy & Micro-Acceleration',
              desc: 'High-frequency vibration and body velocity data for biomechanical analysis.',
            },
            {
              key: 'eegWaveforms' as const,
              label: 'Electroencephalography (EEG) Potentials',
              desc: 'Raw multi-channel brainwave voltage telemetry and neuro-fatigue spectral summaries.',
            },
            {
              key: 'cameraRecordings' as const,
              label: 'Visual Wellbeing & Posture Camera Access',
              desc: 'Allows manual opt-in activation of local camera utility for form checking.',
            },
          ].map((item) => {
            const isConsented = astronautConsent[item.key];

            return (
              <div
                key={item.key}
                className="p-3.5 bg-paper rounded-sm border border-edge/80 flex items-start justify-between gap-4 text-xs"
              >
                <div>
                  <div className="font-semibold text-ink text-sm flex items-center gap-2">
                    <span>{item.label}</span>
                    <Badge variant={isConsented ? 'normal' : 'unavailable'} size="sm">
                      {isConsented ? 'Active Consent' : 'Access Revoked'}
                    </Badge>
                  </div>
                  <p className="text-ink-secondary text-xs mt-0.5">{item.desc}</p>
                </div>

                <Button
                  size="sm"
                  variant={isConsented ? 'secondary' : 'primary'}
                  onClick={() => updateConsentSettings(selectedAstronaut.id, { [item.key]: !isConsented })}
                >
                  {isConsented ? 'Revoke Consent' : 'Grant Consent'}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

