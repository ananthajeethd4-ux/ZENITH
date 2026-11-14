import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EEGWaveformCanvas } from '../components/charts/EEGWaveformCanvas';
import {
  Brain,
  Upload,
  Activity,
  ShieldAlert,
  Clock,
  Sparkles,
  Zap,
  Info,
  CheckCircle,
} from 'lucide-react';
import { EEGSession, EEGChannelId } from '../types/eeg';

export const EEGPage: React.FC = () => {
  const { selectedAstronaut, eegSessions, addEEGSession } = useApp();

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const astronautSessions = eegSessions.filter((s) => s.astronautId === selectedAstronaut.id);
    return astronautSessions[0]?.id || eegSessions[0]?.id || '';
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('Pre-EVA Dual-Task Psychomotor Baseline');
  const [uploadProtocol, setUploadProtocol] = useState<'Cognitive Workload Test' | 'Pre-Sleep Baseline' | 'Neuro-Fatigue Check' | 'Resting State'>('Cognitive Workload Test');
  const [uploadNotes, setUploadNotes] = useState('High alpha synchronization detected across occipital and parietal leads.');

  const astronautSessions = eegSessions.filter((s) => s.astronautId === selectedAstronaut.id);
  const currentSession =
    astronautSessions.find((s) => s.id === activeSessionId) || astronautSessions[0] || eegSessions[0];

  const handleUploadSimulatedFile = () => {
    const newSession: EEGSession = {
      id: `EEG-${selectedAstronaut.id}-${Date.now().toString(36)}`,
      astronautId: selectedAstronaut.id,
      title: uploadTitle,
      timestamp: new Date().toISOString(),
      durationSeconds: 300,
      samplingRateHz: 250,
      channels: ['Fp1', 'Fp2', 'C3', 'C4', 'Pz', 'O1'],
      protocol: uploadProtocol,
      isSimulated: true,
      bandPowerSummary: {
        delta: 18.0,
        theta: 24.5,
        alpha: 32.8,
        beta: 20.2,
        gamma: 4.5,
      },
      channelQualities: [
        { channel: 'Fp1', impedance_kOhm: 3.2, status: 'good' },
        { channel: 'Fp2', impedance_kOhm: 3.5, status: 'good' },
        { channel: 'C3', impedance_kOhm: 4.1, status: 'good' },
        { channel: 'C4', impedance_kOhm: 4.3, status: 'good' },
        { channel: 'Pz', impedance_kOhm: 3.8, status: 'good' },
        { channel: 'O1', impedance_kOhm: 4.5, status: 'good' },
      ],
      notes: uploadNotes,
      recordedBy: 'Dr. Kenjiro Sato, Flight Surgeon',
    };

    addEEGSession(newSession);
    setActiveSessionId(newSession.id);
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
            Electroencephalography (EEG) Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Microgravity neuro-workload monitoring, fatigue assessment, and multi-channel waveforms
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsUploadModalOpen(true)}
          icon={<Upload className="w-3.5 h-3.5" />}
        >
          Load / Import EEG Dataset
        </Button>
      </div>

      {/* Prominent Non-Clinical Disclaimer */}
      <div className="p-4 bg-paper-dark border border-edge rounded-sm space-y-2 text-xs text-ink-secondary">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <ShieldAlert className="w-4 h-4 text-slate-primary shrink-0" />
          <span>Neuro-Monitoring Operational Notice</span>
        </div>
        <p className="text-ink-secondary leading-relaxed">
          <strong className="text-ink">Non-Diagnostic Research Instrument:</strong> The waveforms and frequency band powers displayed below are simulated research representations for spaceflight cognitive workload assessment. They <strong className="text-ink">do NOT</strong> constitute clinical diagnostic electroencephalography and cannot be used to diagnose epilepsy, traumatic brain injury, psychiatric conditions, or clinical sleep disorders.
        </p>
      </div>

      {/* Live Waveform Canvas */}
      <Card>
        <CardHeader
          title={currentSession ? currentSession.title : 'Live 6-Channel EEG Montage'}
          subtitle={
            currentSession
              ? `Protocol: ${currentSession.protocol} • Recorded: ${new Date(currentSession.timestamp).toLocaleString()} • Duration: ${currentSession.durationSeconds}s`
              : 'Continuous dry-electrode bio-potential acquisition'
          }
          tag={<Badge variant="simulated" size="sm">Simulated Montage</Badge>}
        />

        <EEGWaveformCanvas
          channels={currentSession?.channels || ['Fp1', 'Fp2', 'C3', 'C4', 'Pz', 'O1']}
          isSimulated={true}
          channelQualities={currentSession?.channelQualities}
        />
      </Card>

      {/* Frequency Band Spectral Distribution & Impedance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Spectral Band Power */}
        <Card>
          <CardHeader
            title="Frequency Band Power Distribution"
            subtitle="Relative power density across physiological rhythms"
          />

          {currentSession ? (
            <div className="space-y-3">
              {[
                { name: 'Delta (0.5 - 4 Hz)', val: currentSession.bandPowerSummary.delta, desc: 'Slow wave restorative / fatigue marker' },
                { name: 'Theta (4 - 8 Hz)', val: currentSession.bandPowerSummary.theta, desc: 'Drowsiness / working memory load' },
                { name: 'Alpha (8 - 12 Hz)', val: currentSession.bandPowerSummary.alpha, desc: 'Alert relaxation / sensorimotor rhythm' },
                { name: 'Beta (13 - 30 Hz)', val: currentSession.bandPowerSummary.beta, desc: 'Active analytical cognitive processing' },
                { name: 'Gamma (30 - 50 Hz)', val: currentSession.bandPowerSummary.gamma, desc: 'Cross-modal sensory binding' },
              ].map((band) => (
                <div key={band.name} className="text-xs">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-mono font-medium text-ink">{band.name}</span>
                    <span className="font-mono text-ink font-semibold">{band.val.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-paper border border-edge rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-slate-primary"
                      style={{ width: `${Math.min(100, band.val * 2.2)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-ink-muted mt-0.5">{band.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-muted font-mono py-4">No spectral data available.</p>
          )}
        </Card>

        {/* Electrode Impedance HUD */}
        <Card>
          <CardHeader
            title="Electrode Impedance & Contact Quality"
            subtitle="International 10-20 dry gel montage connection status"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(currentSession?.channelQualities || [
              { channel: 'Fp1', impedance_kOhm: 3.4, status: 'good' },
              { channel: 'Fp2', impedance_kOhm: 3.8, status: 'good' },
              { channel: 'C3', impedance_kOhm: 4.1, status: 'good' },
              { channel: 'C4', impedance_kOhm: 4.6, status: 'good' },
              { channel: 'Pz', impedance_kOhm: 3.9, status: 'good' },
              { channel: 'O1', impedance_kOhm: 5.2, status: 'marginal' },
            ]).map((q) => (
              <div key={q.channel} className="p-3 bg-paper border border-edge rounded-sm text-xs">
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className="font-semibold text-ink">{q.channel}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      q.status === 'good' ? 'bg-slate-primary' : 'bg-brick'
                    }`}
                  />
                </div>
                <div className="text-base font-semibold font-mono text-ink">
                  {q.impedance_kOhm.toFixed(1)} <span className="text-xs font-normal text-ink-secondary">kΩ</span>
                </div>
                <div className="text-[10px] font-mono text-ink-secondary mt-1 uppercase">
                  {q.status === 'good' ? 'Optimal Contact' : 'Marginal Contact'}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-edge/60 text-xs text-ink-secondary font-mono flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-slate-primary" />
            <span>Target impedance threshold: &lt; 5.0 kΩ for microgravity flight</span>
          </div>
        </Card>
      </div>

      {/* Historical EEG Sessions List */}
      <Card>
        <CardHeader
          title="Recorded EEG Sessions History"
          subtitle="Select session to load waveform traces and flight surgeon clinical notes"
        />

        <div className="space-y-3">
          {astronautSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`p-3.5 bg-paper rounded-sm border cursor-pointer transition-all ${
                session.id === currentSession?.id ? 'border-slate-primary bg-slate-surface/30' : 'border-edge hover:border-slate-primary/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{session.title}</span>
                  <Badge variant="simulated" size="sm">
                    {session.protocol}
                  </Badge>
                </div>
                <span className="font-mono text-ink-secondary">
                  {new Date(session.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-1.5 leading-relaxed">{session.notes}</p>
            </div>
          ))}

          {astronautSessions.length === 0 && (
            <p className="text-xs text-ink-secondary py-6 text-center font-mono">
              No EEG sessions recorded for this astronaut.
            </p>
          )}
        </div>
      </Card>

      {/* Load/Import Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Load / Import Sample EEG Session"
        subtitle={`Select or import spaceflight cognitive test data for ${selectedAstronaut.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUploadSimulatedFile}>
              Load Dataset
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-ink mb-1 font-mono">Session Protocol</label>
            <select
              value={uploadProtocol}
              onChange={(e) => setUploadProtocol(e.target.value as any)}
              className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-xs"
            >
              <option value="Cognitive Workload Test">Cognitive Workload Test (Mental Rotation / Math)</option>
              <option value="Pre-Sleep Baseline">Pre-Sleep Baseline (Alpha Desynchronization)</option>
              <option value="Neuro-Fatigue Check">Neuro-Fatigue Check (Post-EVA Vigilance)</option>
              <option value="Resting State">Resting State (Eyes Open / Closed 5 Min)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1 font-mono">Session Title</label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full p-2 bg-paper border border-edge rounded-sm text-ink text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-ink mb-1 font-mono">Dataset File (EDF / CSV / JSON)</label>
            <div className="border border-dashed border-edge rounded-sm p-4 text-center bg-paper">
              <Upload className="w-5 h-5 mx-auto text-slate-primary mb-1" />
              <p className="text-xs text-ink">Simulated Aerospace Sample Dataset (ARES-IV-EEG-0824.edf)</p>
              <span className="text-[10px] text-ink-muted">Pre-packaged with 250 Hz 6-channel montage</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1 font-mono">Session Notes</label>
            <textarea
              rows={2}
              value={uploadNotes}
              onChange={(e) => setUploadNotes(e.target.value)}
              className="w-full p-2 bg-paper border border-edge rounded-sm text-xs text-ink"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

