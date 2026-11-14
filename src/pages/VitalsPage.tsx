import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { PrecisionLineChart } from '../components/charts/PrecisionLineChart';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Plus,
  Sliders,
  AlertCircle,
  Radio,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { ReadingSource } from '../types/vitals';

export const VitalsPage: React.FC = () => {
  const { selectedAstronaut, vitalsMap, thresholdsMap, updateThresholds, addManualVitalReading } = useApp();
  const { canAdjustThresholds } = useAuth();

  const [activeTab, setActiveTab] = useState<'trends' | 'table'>('trends');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  // Manual entry form state
  const [manualHr, setManualHr] = useState(72);
  const [manualSpo2, setManualSpo2] = useState(98);
  const [manualTemp, setManualTemp] = useState(36.6);
  const [manualResp, setManualResp] = useState(14);
  const [manualSystolic, setManualSystolic] = useState(120);
  const [manualDiastolic, setManualDiastolic] = useState(80);
  const [includeBp, setIncludeBp] = useState(true);
  const [manualSource, setManualSource] = useState<ReadingSource>('Manual Sphygmomanometer Cuff');

  // Threshold form state
  const currentThresholds = thresholdsMap[selectedAstronaut.id] || {
    astronautId: selectedAstronaut.id,
    minHeartRate: 48,
    maxHeartRate: 110,
    minSpo2: 94,
    maxTemperature: 37.8,
    maxSystolicBP: 135,
    minDiastolicBP: 55,
    maxRespiratoryRate: 22,
  };

  const [tempThresholds, setTempThresholds] = useState(currentThresholds);

  const vitals = vitalsMap[selectedAstronaut.id] || [];
  const latestVital = vitals[vitals.length - 1];

  const hrData = vitals.map((v) => ({
    timestamp: v.timestamp,
    value: v.heartRate_bpm,
    source: v.source,
    isSimulated: v.isSimulated,
  }));

  const spo2Data = vitals.map((v) => ({
    timestamp: v.timestamp,
    value: v.spo2_percent,
    source: v.source,
    isSimulated: v.isSimulated,
  }));

  const tempData = vitals.map((v) => ({
    timestamp: v.timestamp,
    value: v.temperature_celsius ?? 36.6,
    source: v.source,
    isSimulated: v.isSimulated,
  }));

  const respData = vitals.map((v) => ({
    timestamp: v.timestamp,
    value: v.respiratoryRate_brpm,
    source: v.source,
    isSimulated: v.isSimulated,
  }));

  const handleSaveManualReading = () => {
    addManualVitalReading({
      astronautId: selectedAstronaut.id,
      timestamp: new Date().toISOString(),
      heartRate_bpm: Number(manualHr),
      spo2_percent: Number(manualSpo2),
      temperature_celsius: Number(manualTemp),
      respiratoryRate_brpm: Number(manualResp),
      bloodPressure: includeBp
        ? {
            systolic: Number(manualSystolic),
            diastolic: Number(manualDiastolic),
            method: 'manual_cuff',
            calibrated: true,
          }
        : undefined,
      source: manualSource,
      qualityScore: 100,
    });
    setIsManualModalOpen(false);
  };

  const handleSaveThresholds = () => {
    updateThresholds(selectedAstronaut.id, tempThresholds);
    setIsThresholdModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
            Vital Signs Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Continuous biosensor streams, manual clinical cuffs, and threshold monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canAdjustThresholds && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setTempThresholds(currentThresholds);
                setIsThresholdModalOpen(true);
              }}
              icon={<Sliders className="w-3.5 h-3.5" />}
            >
              Alert Thresholds
            </Button>
          )}

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsManualModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Manual Entry
          </Button>
        </div>
      </div>

      {/* KPI Cards Row (Units, Last Sync, Sources) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Heart Rate */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>HEART RATE</span>
            <Heart className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {latestVital ? latestVital.heartRate_bpm : '--'}
            <span className="text-xs font-normal text-ink-secondary ml-1">bpm</span>
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">
            Target: {currentThresholds.minHeartRate}-{currentThresholds.maxHeartRate} bpm
          </div>
        </div>

        {/* SpO2 */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>SPO₂ SATURATION</span>
            <Activity className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {latestVital ? latestVital.spo2_percent : '--'}
            <span className="text-xs font-normal text-ink-secondary ml-1">%</span>
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">
            Limit: ≥ {currentThresholds.minSpo2}%
          </div>
        </div>

        {/* Blood Pressure (Sphygmomanometer only) */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>BLOOD PRESSURE</span>
            <span className="text-[10px] uppercase text-slate-primary font-mono">Cuff Only</span>
          </div>
          <div className="text-xl font-semibold text-ink telemetry-val mt-1">
            {latestVital && latestVital.bloodPressure
              ? `${latestVital.bloodPressure.systolic}/${latestVital.bloodPressure.diastolic}`
              : '118/76'}
            <span className="text-xs font-normal text-ink-secondary ml-1">mmHg</span>
          </div>
          <div className="text-[10px] font-mono text-ink-secondary mt-2">
            Method: Validated Manual Cuff
          </div>
        </div>

        {/* Core Temperature */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>CORE TEMP</span>
            <Thermometer className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {latestVital && latestVital.temperature_celsius ? latestVital.temperature_celsius : 36.6}
            <span className="text-xs font-normal text-ink-secondary ml-1">°C</span>
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">
            Max: {currentThresholds.maxTemperature}°C
          </div>
        </div>

        {/* Respiratory Rate */}
        <div className="paper-surface rounded-sm p-4 border border-edge col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>RESPIRATORY</span>
            <Wind className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {latestVital ? latestVital.respiratoryRate_brpm : 14}
            <span className="text-xs font-normal text-ink-secondary ml-1">brpm</span>
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">
            Limit: ≤ {currentThresholds.maxRespiratoryRate} brpm
          </div>
        </div>
      </div>

      {/* Main Trends Charts */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader
              title="Heart Rate (Continuous Stream)"
              subtitle="24-hour strip recorder telemetry"
              tag={<Badge variant="simulated" size="sm">Simulated</Badge>}
            />
            <PrecisionLineChart
              data={hrData}
              title="CARDIAC PULSE"
              unit="bpm"
              thresholdHigh={currentThresholds.maxHeartRate}
              thresholdLow={currentThresholds.minHeartRate}
              height={180}
            />
          </Card>

          <Card>
            <CardHeader
              title="Blood Oxygen Saturation (SpO₂)"
              subtitle="Continuous photoplethysmography"
              tag={<Badge variant="simulated" size="sm">Simulated</Badge>}
            />
            <PrecisionLineChart
              data={spo2Data}
              title="SPO2"
              unit="%"
              thresholdLow={currentThresholds.minSpo2}
              minVal={90}
              maxVal={100}
              height={180}
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader
              title="Core Body Temperature"
              subtitle="Sub-skin & ambient thermal sensor"
              tag={<Badge variant="simulated" size="sm">Simulated</Badge>}
            />
            <PrecisionLineChart
              data={tempData}
              title="TEMPERATURE"
              unit="°C"
              thresholdHigh={currentThresholds.maxTemperature}
              minVal={35.5}
              maxVal={38.5}
              height={180}
            />
          </Card>

          <Card>
            <CardHeader
              title="Respiratory Rate"
              subtitle="Transthoracic impedance plethysmography"
              tag={<Badge variant="simulated" size="sm">Simulated</Badge>}
            />
            <PrecisionLineChart
              data={respData}
              title="RESPIRATION"
              unit="brpm"
              thresholdHigh={currentThresholds.maxRespiratoryRate}
              minVal={8}
              maxVal={26}
              height={180}
            />
          </Card>
        </div>
      </div>

      {/* Telemetry Log Table */}
      <Card>
        <CardHeader
          title="Recent Telemetry Packets"
          subtitle="Audit-compliant time-indexed readings"
          tag={<span className="text-xs font-mono text-ink-secondary">{vitals.length} records</span>}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-edge bg-paper text-ink-secondary font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">HR (bpm)</th>
                <th className="py-2.5 px-3">SpO₂ (%)</th>
                <th className="py-2.5 px-3">Temp (°C)</th>
                <th className="py-2.5 px-3">Resp (brpm)</th>
                <th className="py-2.5 px-3">BP (mmHg)</th>
                <th className="py-2.5 px-3">Source & Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge/60 font-mono">
              {vitals
                .slice(-8)
                .reverse()
                .map((reading) => (
                  <tr key={reading.id} className="hover:bg-paper transition-colors">
                    <td className="py-2.5 px-3 text-ink">
                      {new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-ink">{reading.heartRate_bpm}</td>
                    <td className="py-2.5 px-3 font-semibold text-ink">{reading.spo2_percent}%</td>
                    <td className="py-2.5 px-3 text-ink-secondary">{reading.temperature_celsius?.toFixed(1) ?? '--'}</td>
                    <td className="py-2.5 px-3 text-ink-secondary">{reading.respiratoryRate_brpm}</td>
                    <td className="py-2.5 px-3 text-ink">
                      {reading.bloodPressure ? `${reading.bloodPressure.systolic}/${reading.bloodPressure.diastolic}` : '--'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="flex items-center gap-1.5">
                        <Badge variant={reading.isSimulated ? 'simulated' : 'manual'} size="sm">
                          {reading.isSimulated ? 'Simulated' : 'Manual'}
                        </Badge>
                        <span className="text-[11px] text-ink-secondary font-sans truncate">{reading.source}</span>
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Reading Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Record Manual Clinical Vitals"
        subtitle={`Entering manual check for ${selectedAstronaut.name} (${selectedAstronaut.id})`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveManualReading}>
              Save Reading
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-paper border border-edge rounded-sm flex items-start gap-2 text-ink-secondary">
            <ShieldAlert className="w-4 h-4 text-slate-primary shrink-0 mt-0.5" />
            <span>
              Manual entries are flagged in the mission audit log and labeled as clinician-provided rather than automated wearable telemetry.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1 font-mono">Heart Rate (bpm)</label>
              <input
                type="number"
                value={manualHr}
                onChange={(e) => setManualHr(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1 font-mono">SpO₂ Oxygen (%)</label>
              <input
                type="number"
                value={manualSpo2}
                onChange={(e) => setManualSpo2(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1 font-mono">Body Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={manualTemp}
                onChange={(e) => setManualTemp(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1 font-mono">Respiratory Rate (brpm)</label>
              <input
                type="number"
                value={manualResp}
                onChange={(e) => setManualResp(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
          </div>

          {/* Blood pressure section */}
          <div className="pt-2 border-t border-edge">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-ink">Blood Pressure (Sphygmomanometer)</span>
              <label className="flex items-center gap-1.5 cursor-pointer font-mono text-ink-secondary">
                <input
                  type="checkbox"
                  checked={includeBp}
                  onChange={(e) => setIncludeBp(e.target.checked)}
                  className="rounded-sm"
                />
                Include Cuff Reading
              </label>
            </div>

            {includeBp && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-secondary mb-1 font-mono text-[11px]">Systolic (mmHg)</label>
                  <input
                    type="number"
                    value={manualSystolic}
                    onChange={(e) => setManualSystolic(Number(e.target.value))}
                    className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
                  />
                </div>
                <div>
                  <label className="block text-ink-secondary mb-1 font-mono text-[11px]">Diastolic (mmHg)</label>
                  <input
                    type="number"
                    value={manualDiastolic}
                    onChange={(e) => setManualDiastolic(Number(e.target.value))}
                    className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-medium text-ink mb-1 font-mono">Measurement Device Source</label>
            <select
              value={manualSource}
              onChange={(e) => setManualSource(e.target.value as ReadingSource)}
              className="w-full p-2 bg-paper border border-edge rounded-sm text-ink text-xs font-mono"
            >
              <option value="Manual Sphygmomanometer Cuff">Manual Sphygmomanometer Cuff</option>
              <option value="Flight Diagnostic Station">Flight Diagnostic Station</option>
              <option value="Clinical Thermometer (Manual)">Clinical Thermometer (Manual)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Thresholds Modal */}
      <Modal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        title="Configure Alert Thresholds"
        subtitle={`Adjust physiological alarm triggers for ${selectedAstronaut.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsThresholdModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveThresholds}>
              Apply Bounds
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-ink-secondary">
            Readings that breach these boundaries for consecutive measurement windows generate automated mission alerts.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-ink mb-1">Min Heart Rate (bpm)</label>
              <input
                type="number"
                value={tempThresholds.minHeartRate}
                onChange={(e) =>
                  setTempThresholds({ ...tempThresholds, minHeartRate: Number(e.target.value) })
                }
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
            <div>
              <label className="block font-mono text-ink mb-1">Max Heart Rate (bpm)</label>
              <input
                type="number"
                value={tempThresholds.maxHeartRate}
                onChange={(e) =>
                  setTempThresholds({ ...tempThresholds, maxHeartRate: Number(e.target.value) })
                }
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-ink mb-1">Min SpO₂ (%)</label>
              <input
                type="number"
                value={tempThresholds.minSpo2}
                onChange={(e) =>
                  setTempThresholds({ ...tempThresholds, minSpo2: Number(e.target.value) })
                }
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
            <div>
              <label className="block font-mono text-ink mb-1">Max Core Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={tempThresholds.maxTemperature}
                onChange={(e) =>
                  setTempThresholds({ ...tempThresholds, maxTemperature: Number(e.target.value) })
                }
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-ink mb-1">Max Systolic BP (mmHg)</label>
              <input
                type="number"
                value={tempThresholds.maxSystolicBP}
                onChange={(e) =>
                  setTempThresholds({ ...tempThresholds, maxSystolicBP: Number(e.target.value) })
                }
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
            <div>
              <label className="block font-mono text-ink mb-1">Max Respiratory Rate (brpm)</label>
              <input
                type="number"
                value={tempThresholds.maxRespiratoryRate}
                onChange={(e) =>
                  setTempThresholds({ ...tempThresholds, maxRespiratoryRate: Number(e.target.value) })
                }
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

