import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Database,
  Gauge,
  HeartPulse,
  PersonStanding,
  Thermometer,
  Wind,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { MetricCard, type MetricStatus } from '../components/dashboard/MetricCard';
import { SafetyBanner } from '../components/dashboard/SafetyBanner';
import { SyncStatusPanel } from '../components/dashboard/SyncStatusPanel';
import { TelemetryControls } from '../components/dashboard/TelemetryControls';
import { generateTelemetryPacket } from '../services/mockGenerator';
import {
  SyncManager,
  type SyncSnapshot,
} from '../services/syncManager';
import {
  getIsOnline,
  isSimulatedConnectivity,
  setSimulatedOnline,
  subscribeConnectivity,
} from '../services/connectivity';
import {
  evaluateVitals,
  getModeSafetyProfile,
  type BreachMetric,
} from '../services/vitalThresholds';
import {
  getPendingTelemetryCount,
  getRecentTelemetryLogs,
  pruneSyncedTelemetryLogs,
  saveTelemetryLog,
} from '../db/localDb';
import {
  MODE_LABELS,
  POSTURE_LABELS,
  type TelemetryLog,
  type TelemetryMode,
} from '../types/telemetry';

const SAMPLE_INTERVAL_MS = 3_000;
const EMERGENCY_HOLD_MS = 8_000;
const RECENT_LIMIT = 8;

function MockTrace({ label, unit, samples }: { label: string; unit: string; samples: number[] }) {
  const min = Math.min(...samples);
  const span = Math.max(0.01, Math.max(...samples) - min);
  const points = samples.map((value, i) => `${(i / Math.max(1, samples.length - 1)) * 600},${55 - ((value - min) / span) * 45}`).join(' ');
  return (
    <div className="min-w-0 border border-edge p-3">
      <div className="flex justify-between text-xs font-semibold text-ink"><span>{label}</span><span className="text-ink-muted">{unit} · 64 Hz</span></div>
      <svg viewBox="0 0 600 65" className="mt-2 h-20 w-full" preserveAspectRatio="none" role="img" aria-label={`Simulated ${label} waveform`}>
        <line x1="0" y1="32" x2="600" y2="32" stroke="#dad7d1" />
        <polyline points={points} fill="none" stroke="#34465a" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

const EXPECTED_POSTURE: Record<TelemetryMode, string> = {
  rest: 'Seated / free float',
  exercise: 'Treadmill / cycle',
  sleep: 'Supine',
  stress: 'Seated / standing',
};

const INITIAL_SYNC_STATE: SyncSnapshot = {
  phase: getIsOnline() ? 'idle' : 'offline',
  online: getIsOnline(),
  pending: 0,
  lastSyncedAt: null,
  lastError: null,
  lastBatchCount: 0,
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown local database error';
}

export const DashboardPage: React.FC = () => {
  const { selectedAstronaut } = useApp();

  const [mode, setMode] = useState<TelemetryMode>('rest');
  const [latest, setLatest] = useState<TelemetryLog | null>(null);
  const [recent, setRecent] = useState<TelemetryLog[]>([]);
  const [sync, setSync] = useState<SyncSnapshot>(INITIAL_SYNC_STATE);
  const [isOnline, setIsOnline] = useState(getIsOnline());
  const [simulated, setSimulated] = useState(isSimulatedConnectivity());
  const [storageError, setStorageError] = useState<string | null>(null);
  const [emergencyUntil, setEmergencyUntil] = useState(0);

  const syncManagerRef = useRef<SyncManager | null>(null);
  const modeRef = useRef<TelemetryMode>(mode);
  const crewIdRef = useRef(selectedAstronaut.id);
  const previousCrewIdRef = useRef(selectedAstronaut.id);
  const generatingRef = useRef(false);
  const holdUntilRef = useRef(0);
  const refreshRecentRef = useRef<() => Promise<void>>(async () => undefined);

  const refreshRecent = useCallback(async () => {
    try {
      const [rows, pending] = await Promise.all([
        getRecentTelemetryLogs(RECENT_LIMIT),
        getPendingTelemetryCount(),
      ]);
      setRecent(rows);
      setSync((previous) => ({ ...previous, pending }));
      setStorageError(null);
    } catch (error) {
      setStorageError(errorMessage(error));
    }
  }, []);

  refreshRecentRef.current = refreshRecent;

  /**
   * Generate, display, then persist one packet.
   * UI updates first so the instrument never appears frozen if IndexedDB is slow.
   */
  const generateAndStore = useCallback(
    async (nextMode: TelemetryMode, crewId: string, forceAnomaly = false) => {
      const packet = generateTelemetryPacket(nextMode, { crewId, forceAnomaly });
      setLatest(packet);

      try {
        const id = await saveTelemetryLog(packet);
        const stored: TelemetryLog = { ...packet, id };

        setRecent((previous) => [stored, ...previous].slice(0, RECENT_LIMIT));
        setStorageError(null);

        const pending = await getPendingTelemetryCount();
        setSync((previous) => ({ ...previous, pending }));
      } catch (error) {
        setStorageError(errorMessage(error));
      }
    },
    []
  );

  // Sync lifecycle: online listener + one 60s fallback sweep + manual trigger.
  useEffect(() => {
    let cancelled = false;

    const manager = new SyncManager({
      onStatusChange: (snapshot) => {
        if (cancelled) return;
        setSync(snapshot);
        if (snapshot.phase === 'success') {
          void refreshRecentRef.current();
        }
      },
    });

    syncManagerRef.current = manager;
    manager.start();

    const unsubscribe = subscribeConnectivity((online) => {
      if (cancelled) return;
      setIsOnline(online);
      setSimulated(isSimulatedConnectivity());
    });

    void pruneSyncedTelemetryLogs(48)
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) void refreshRecentRef.current();
      });

    return () => {
      cancelled = true;
      unsubscribe();
      manager.stop();
      syncManagerRef.current = null;
    };
  }, []);

  // Keep the packet clock on the current crew/mode without restarting the timer.
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    crewIdRef.current = selectedAstronaut.id;
  }, [selectedAstronaut.id]);

  // 3-second live capture loop.
  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (
        cancelled ||
        generatingRef.current ||
        holdUntilRef.current > Date.now()
      ) {
        return;
      }

      generatingRef.current = true;
      try {
        await generateAndStore(modeRef.current, crewIdRef.current);
      } finally {
        generatingRef.current = false;
      }
    };

    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, SAMPLE_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [generateAndStore]);

  // Generate immediately when the operator selects a different crew member.
  useEffect(() => {
    if (previousCrewIdRef.current === selectedAstronaut.id) return;

    previousCrewIdRef.current = selectedAstronaut.id;
    crewIdRef.current = selectedAstronaut.id;
    void generateAndStore(modeRef.current, selectedAstronaut.id);
  }, [selectedAstronaut.id, generateAndStore]);

  // Clear the visible emergency state after the hold window.
  useEffect(() => {
    if (emergencyUntil === 0) return;

    const delay = Math.max(0, emergencyUntil - Date.now());
    const timer = window.setTimeout(() => setEmergencyUntil(0), delay);
    return () => window.clearTimeout(timer);
  }, [emergencyUntil]);

  const handleModeChange = (nextMode: TelemetryMode) => {
    if (nextMode === mode) return;

    setMode(nextMode);
    modeRef.current = nextMode;
    holdUntilRef.current = 0;
    setEmergencyUntil(0);
    void generateAndStore(nextMode, selectedAstronaut.id);
  };

  const handleInjectAnomaly = () => {
    const holdUntil = Date.now() + EMERGENCY_HOLD_MS;
    holdUntilRef.current = holdUntil;
    setEmergencyUntil(holdUntil);
    void generateAndStore(modeRef.current, selectedAstronaut.id, true);
  };

  const handleToggleConnectivity = () => {
    const nextOnline = !getIsOnline();
    setSimulatedOnline(nextOnline);
    setIsOnline(nextOnline);
    setSimulated(true);

    if (nextOnline) {
      void syncManagerRef.current?.flushNow();
    }
  };

  const breaches = useMemo(
    () => (latest ? evaluateVitals(latest.vitals, latest.mode) : []),
    [latest]
  );

  const profile = getModeSafetyProfile(mode);
  const vitals = latest?.vitals;

  const statusFor = (metric: BreachMetric): MetricStatus => {
    if (!latest) return 'neutral';

    const metricBreaches = breaches.filter((breach) => breach.metric === metric);
    if (metricBreaches.some((breach) => breach.severity === 'critical')) {
      return 'critical';
    }
    return metricBreaches.length > 0 ? 'warning' : 'normal';
  };

  const emergencyActive = emergencyUntil > Date.now();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Live Telemetry Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-ink-secondary sm:text-sm">
            Local-first capture for {selectedAstronaut.name} ({selectedAstronaut.id}) ·
            3-second sampling · IndexedDB queue
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="normal" size="sm" dot>
            Live capture
          </Badge>
          <Badge variant="simulated" size="sm">
            Dexie / IndexedDB
          </Badge>
          <span className="font-mono text-[10px] text-ink-muted">
            {latest
              ? `PKT ${new Date(latest.timestamp).toLocaleTimeString()}`
              : 'Awaiting first packet'}
          </span>
        </div>
      </div>

      {storageError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-sm border border-brick-border bg-brick-surface px-4 py-3 text-xs text-brick"
        >
          <Database className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong className="font-semibold">Local persistence unavailable.</strong>{' '}
            {storageError}
          </div>
        </div>
      )}

      <SafetyBanner breaches={breaches} mode={mode} checkedAt={latest?.timestamp} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label="Heart Rate"
          value={vitals?.heart_rate ?? '—'}
          unit="bpm"
          icon={<HeartPulse className="h-4 w-4" />}
          target={`${profile.heart_rate.min}–${profile.heart_rate.max} bpm`}
          status={statusFor('heart_rate')}
        />
        <MetricCard
          label="SpO₂"
          value={vitals?.spo2 ?? '—'}
          unit="%"
          icon={<Wind className="h-4 w-4" />}
          target={`≥ ${profile.spo2.min}%`}
          status={statusFor('spo2')}
        />
        <MetricCard
          label="Blood Pressure"
          value={
            vitals
              ? `${vitals.blood_pressure.systolic}/${vitals.blood_pressure.diastolic}`
              : '—'
          }
          unit="mmHg"
          icon={<Gauge className="h-4 w-4" />}
          target={`${profile.systolic.min}–${profile.systolic.max} / ${profile.diastolic.min}–${profile.diastolic.max}`}
          status={statusFor('blood_pressure')}
        />
        <MetricCard
          label="Core Temp"
          value={vitals ? vitals.body_temp.toFixed(1) : '—'}
          unit="°C"
          icon={<Thermometer className="h-4 w-4" />}
          target={`${profile.body_temp.min.toFixed(1)}–${profile.body_temp.max.toFixed(1)} °C`}
          status={statusFor('body_temp')}
        />
        <MetricCard
          label="Posture"
          value={latest ? POSTURE_LABELS[latest.posture] : '—'}
          icon={<PersonStanding className="h-4 w-4" />}
          target={EXPECTED_POSTURE[mode]}
          status={latest ? 'normal' : 'neutral'}
          detail="Biosensor orientation channel"
        />
        <MetricCard
          label="Mode"
          value={MODE_LABELS[mode]}
          icon={<Activity className="h-4 w-4" />}
          target="3 s sample cadence"
          status="normal"
          detail="Operator-selected simulation profile"
        />
      </div>

      <Card>
        <CardHeader title="Synthetic signal snapshots" subtitle="Two-second EEG and ECG examples generated with each packet. Simulated data, not sensor measurements." />
        {latest?.waveforms ? (
          <div className="grid gap-3 md:grid-cols-2">
            <MockTrace label="EEG · single channel" unit="µV" samples={latest.waveforms.eeg_microvolts} />
            <MockTrace label="ECG · single lead" unit="mV" samples={latest.waveforms.ecg_millivolts} />
          </div>
        ) : <p className="text-xs text-ink-muted">Waiting for the next simulated packet.</p>}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <TelemetryControls
            mode={mode}
            onModeChange={handleModeChange}
            onInjectAnomaly={handleInjectAnomaly}
            isOnline={isOnline}
            onToggleConnectivity={handleToggleConnectivity}
            emergencyActive={emergencyActive}
          />
        </div>
        <div className="lg:col-span-3">
          <SyncStatusPanel
            snapshot={sync}
            onSyncNow={() => void syncManagerRef.current?.flushNow()}
            simulatedConnectivity={simulated}
          />
        </div>
      </div>

      <Card>
        <CardHeader
          title="Local Packet Ledger"
          subtitle="Newest IndexedDB records. Status flips to synced only after ground acknowledgement."
          action={
            <Badge variant={sync.pending > 0 ? 'attention' : 'normal'} size="sm" dot>
              {sync.pending} pending
            </Badge>
          }
        />

        {recent.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-muted">
            No packets recorded yet. The first sample is written immediately.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-edge text-[10px] uppercase tracking-widest text-ink-muted">
                  <th className="px-2 py-2 font-medium">Time</th>
                  <th className="px-2 py-2 font-medium">Mode</th>
                  <th className="px-2 py-2 font-medium">HR</th>
                  <th className="px-2 py-2 font-medium">SpO₂</th>
                  <th className="px-2 py-2 font-medium">BP</th>
                  <th className="px-2 py-2 font-medium">Temp</th>
                  <th className="px-2 py-2 font-medium">Posture</th>
                  <th className="px-2 py-2 font-medium">Sync</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((log) => (
                  <tr
                    key={log.id ?? `${log.timestamp}-${log.mode}`}
                    className="border-b border-edge/50 last:border-0"
                  >
                    <td className="whitespace-nowrap px-2 py-2 font-mono text-ink-secondary">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                    </td>
                    <td className="px-2 py-2">
                      <Badge variant="neutral" size="sm">
                        {MODE_LABELS[log.mode]}
                      </Badge>
                    </td>
                    <td className="telemetry-val px-2 py-2 text-ink">
                      {log.vitals.heart_rate}
                    </td>
                    <td className="telemetry-val px-2 py-2 text-ink">
                      {log.vitals.spo2}%
                    </td>
                    <td className="telemetry-val whitespace-nowrap px-2 py-2 text-ink">
                      {log.vitals.blood_pressure.systolic}/
                      {log.vitals.blood_pressure.diastolic}
                    </td>
                    <td className="telemetry-val px-2 py-2 text-ink">
                      {log.vitals.body_temp.toFixed(1)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-ink-secondary">
                      {POSTURE_LABELS[log.posture]}
                    </td>
                    <td className="px-2 py-2">
                      <Badge
                        variant={log.sync_status === 'synced' ? 'normal' : 'attention'}
                        size="sm"
                        dot
                      >
                        {log.sync_status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="text-[11px] leading-relaxed text-ink-muted">
        <strong className="font-semibold text-ink-secondary">Simulation notice:</strong>{' '}
        Telemetry is synthetic and generated from published spaceflight physiology
        reference ranges. Thresholds support demonstration and are not a certified
        medical diagnosis. Ground sync is implemented as Vite middleware in this
        prototype; replace it with the authenticated habitat relay in production.
      </p>
    </div>
  );
};

export default DashboardPage;
