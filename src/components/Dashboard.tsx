"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Droplets,
  HeartPulse,
  PersonStanding,
  Wind,
} from "lucide-react";
import {
  getPendingTelemetryCount,
  processSyncQueue,
  saveTelemetryLocally,
  startAutoSync,
  type TelemetryMode,
} from "@/lib/telemetry";
import {
  formatModeLabel,
  formatPostureLabel,
  formatSleepStage,
  generateMockTelemetry,
  pickAnomalyKind,
  type AnomalyKind,
  type MockTelemetryPacket,
} from "@/lib/mockTelemetry";
import {
  getHealthAlerts,
  getOverallSeverity,
  getVitalSeverities,
  parseBloodPressure,
  type VitalSeverities,
} from "@/lib/healthStatus";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { AlertBanner } from "./dashboard/AlertBanner";
import { ControlToolbar } from "./dashboard/ControlToolbar";
import { VitalCard } from "./dashboard/VitalCard";
import { TrendCharts } from "./dashboard/TrendCharts";
import { SleepPanel } from "./dashboard/SleepPanel";
import { SyncPanel } from "./dashboard/SyncPanel";

const CREW_ID = "CDR-01";
const STREAM_INTERVAL_MS = 3_000;
const HISTORY_LIMIT = 24;

const NOMINAL_VITAL_SEVERITIES: VitalSeverities = {
  heart_rate: "nominal",
  spo2: "nominal",
  blood_pressure: "nominal",
  posture: "nominal",
};

const HEART_RATE_GUIDANCE: Record<TelemetryMode, string> = {
  rest: "Mode-adjusted nominal range: 50–105 bpm",
  exercise: "Mode-adjusted nominal range: 55–175 bpm",
  sleep: "Mode-adjusted nominal range: 42–80 bpm",
  stress: "Mode-adjusted nominal range: 55–145 bpm",
};

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default function Dashboard() {
  const [mode, setMode] = useState<TelemetryMode>("rest");
  const [history, setHistory] = useState<MockTelemetryPacket[]>([]);
  const [networkOnline, setNetworkOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [anomalyQueued, setAnomalyQueued] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const onlineRef = useRef(true);
  const anomalyRef = useRef<AnomalyKind | null>(null);
  const previousPacketRef = useRef<MockTelemetryPacket | null>(null);
  const mountedRef = useRef(true);

  const refreshPending = useCallback(async () => {
    try {
      const count = await getPendingTelemetryCount();
      if (mountedRef.current) setPendingSync(count);
    } catch (error) {
      if (mountedRef.current) setSyncError(toErrorMessage(error));
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!onlineRef.current) {
      await refreshPending();
      return;
    }

    if (mountedRef.current) setSyncing(true);

    try {
      const result = await processSyncQueue({
        connectivity: () => onlineRef.current,
      });

      if (!mountedRef.current) return;

      if (result.uploaded > 0) setLastSyncAt(Date.now());

      if (result.error !== undefined && onlineRef.current) {
        setSyncError(toErrorMessage(result.error));
      } else {
        setSyncError(null);
      }

      await refreshPending();
    } catch (error) {
      if (mountedRef.current && onlineRef.current) {
        setSyncError(toErrorMessage(error));
      }
    } finally {
      if (mountedRef.current) setSyncing(false);
    }
  }, [refreshPending]);

  // Initialise connectivity and the existing offline sync engine once.
  useEffect(() => {
    mountedRef.current = true;

    const actuallyOnline =
      typeof navigator === "undefined" ? true : navigator.onLine;
    onlineRef.current = actuallyOnline;
    setNetworkOnline(actuallyOnline);

    void refreshPending();

    const stop = startAutoSync({
      intervalMs: 15_000,
      connectivity: () => onlineRef.current,
      onSync: (result) => {
        if (!mountedRef.current) return;
        if (result.uploaded > 0) setLastSyncAt(Date.now());
        if (!result.error) setSyncError(null);
        void refreshPending();
      },
      onError: (error) => {
        if (mountedRef.current && onlineRef.current) {
          setSyncError(toErrorMessage(error));
        }
      },
    });

    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [refreshPending]);

  // Real-time stream: one packet every 3 seconds, plus an immediate packet on
  // mount or whenever the simulation mode changes.
  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      const anomaly = anomalyRef.current;
      if (anomaly) {
        anomalyRef.current = null;
        if (!cancelled) setAnomalyQueued(false);
      }

      const packet = generateMockTelemetry({
        crewId: CREW_ID,
        mode,
        previous: previousPacketRef.current,
        anomaly,
      });
      previousPacketRef.current = packet;

      if (cancelled) return;

      setHistory((current) => [...current, packet].slice(-HISTORY_LIMIT));

      try {
        // Persist the core vitals locally first. The richer sleep/posture
        // fields stay in the live dashboard state for this demo.
        await saveTelemetryLocally({
          crew_id: packet.crew_id,
          timestamp: packet.timestamp,
          mode: packet.mode,
          vitals: packet.vitals,
        });

        if (cancelled) return;
        await refreshPending();
      } catch (error) {
        if (!cancelled) setSyncError(toErrorMessage(error));
        console.error("[dashboard] Local telemetry write failed:", error);
      }
    };

    void tick();
    const intervalId = window.setInterval(() => {
      void tick();
    }, STREAM_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [mode, refreshPending]);

  const handleModeChange = useCallback((nextMode: TelemetryMode) => {
    setMode(nextMode);
  }, []);

  const handleInjectAnomaly = useCallback(() => {
    if (anomalyRef.current) return;
    anomalyRef.current = pickAnomalyKind();
    setAnomalyQueued(true);
  }, []);

  const handleToggleNetwork = useCallback(() => {
    const nextOnline = !onlineRef.current;
    onlineRef.current = nextOnline;
    setNetworkOnline(nextOnline);
    setSyncError(null);

    // Restoring the uplink should drain the queue immediately rather than
    // waiting for the fallback interval.
    if (nextOnline) void syncNow();
    else void refreshPending();
  }, [refreshPending, syncNow]);

  const latest = history.length > 0 ? history[history.length - 1] : null;
  const alerts = useMemo(
    () => (latest ? getHealthAlerts(latest) : []),
    [latest],
  );
  const overallSeverity = getOverallSeverity(alerts);
  const severities = latest
    ? getVitalSeverities(latest)
    : NOMINAL_VITAL_SEVERITIES;

  const pressure = latest
    ? parseBloodPressure(latest.vitals.blood_pressure)
    : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#04070f] text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-48 h-[36rem] w-[36rem] rounded-full bg-cyan-500/5 blur-[140px]" />
        <div className="absolute -right-32 top-1/3 h-[30rem] w-[30rem] rounded-full bg-indigo-500/5 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148, 163, 184, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.035) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          }}
        />
      </div>

      <main className="relative mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <DashboardHeader
          crewId={CREW_ID}
          mode={mode}
          latestTimestamp={latest?.timestamp}
          severity={overallSeverity}
        />

        <AlertBanner alerts={alerts} />

        <ControlToolbar
          mode={mode}
          onModeChange={handleModeChange}
          anomalyQueued={anomalyQueued}
          onInjectAnomaly={handleInjectAnomaly}
          isOnline={networkOnline}
          onToggleNetwork={handleToggleNetwork}
          pendingSync={pendingSync}
          syncing={syncing}
          onSyncNow={() => void syncNow()}
        />

        <section
          aria-label="Core vitals"
          className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <VitalCard
            label="Heart rate"
            value={latest ? latest.vitals.heart_rate : "—"}
            unit="bpm"
            icon={<HeartPulse className="h-5 w-5" />}
            severity={severities.heart_rate}
            subtitle={HEART_RATE_GUIDANCE[mode]}
            detail={
              latest
                ? `${formatModeLabel(latest.mode)} cadence · ${latest.vitals.heart_rate} bpm`
                : "Awaiting first telemetry packet"
            }
            series={history.map((packet) => packet.vitals.heart_rate)}
          />

          <VitalCard
            label="Blood oxygen"
            value={latest ? latest.vitals.spo2 : "—"}
            unit="% SpO2"
            icon={<Wind className="h-5 w-5" />}
            severity={severities.spo2}
            subtitle="Nominal saturation: 95–100%"
            detail={
              latest
                ? `${latest.vitals.spo2 >= 95 ? "Saturation nominal" : "Oxygen support review required"}`
                : "Awaiting first telemetry packet"
            }
            series={history.map((packet) => packet.vitals.spo2)}
          />

          <VitalCard
            label="Blood pressure"
            value={latest ? latest.vitals.blood_pressure : "—"}
            unit="mmHg"
            icon={<Droplets className="h-5 w-5" />}
            severity={severities.blood_pressure}
            subtitle={
              pressure
                ? `Systolic ${pressure.systolic} · diastolic ${pressure.diastolic}`
                : "Systolic / diastolic"
            }
            detail={
              latest
                ? `Core temperature ${latest.vitals.body_temp.toFixed(1)} °C`
                : "Awaiting first telemetry packet"
            }
            series={history.map(
              (packet) => parseBloodPressure(packet.vitals.blood_pressure).systolic,
            )}
          />

          <VitalCard
            label="Posture / mode"
            value={
              latest ? formatPostureLabel(latest.posture.label) : "—"
            }
            unit={formatModeLabel(mode)}
            icon={<PersonStanding className="h-5 w-5" />}
            severity={severities.posture}
            subtitle={
              latest
                ? `Stability ${latest.posture.stability}% · tilt ${latest.posture.tilt_degrees}°`
                : "Awaiting posture telemetry"
            }
            detail={
              latest
                ? `${formatSleepStage(latest.sleep_metrics.stage)} · ${latest.anomaly ? "injected anomaly" : "sensor fusion stable"}`
                : "Awaiting first telemetry packet"
            }
            series={history.map((packet) => packet.posture.stability)}
          />
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <TrendCharts history={history} />

          <div className="grid content-start gap-4">
            <SleepPanel latest={latest} />
            <SyncPanel
              online={networkOnline}
              pendingSync={pendingSync}
              lastSyncAt={lastSyncAt}
              syncing={syncing}
              syncError={syncError}
              onSyncNow={() => void syncNow()}
            />
          </div>
        </div>

        <footer className="mt-6 flex flex-col gap-2 border-t border-white/5 pt-4 text-[11px] leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            AEGIS · Crew health command · Simulation environment
          </span>
          <span>
            3s telemetry cadence · 24-packet rolling buffer · Not for clinical
            use
          </span>
        </footer>
      </main>
    </div>
  );
}
