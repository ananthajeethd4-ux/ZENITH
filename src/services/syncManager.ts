/**
 * Battery-efficient telemetry sync.
 *
 * Design constraints:
 *  - No fixed short polling loop.
 *  - Immediate flush on `window online` / manual "Sync now".
 *  - One 60-second fallback sweep for events the browser missed.
 *  - Batched, oldest-first uploads; only marked `synced` after HTTP success.
 *  - `inFlight` guard prevents overlapping requests.
 */

import {
  getPendingTelemetryCount,
  getPendingTelemetryLogs,
  markTelemetryLogsSynced,
} from '../db/localDb';
import type { TelemetryLog } from '../types/telemetry';
import { getIsOnline } from './connectivity';

export type SyncPhase = 'idle' | 'offline' | 'syncing' | 'success' | 'error';

export interface SyncSnapshot {
  phase: SyncPhase;
  online: boolean;
  pending: number;
  lastSyncedAt: string | null;
  lastError: string | null;
  lastBatchCount: number;
}

export interface SyncManagerOptions {
  /** Same-origin API endpoint. */
  endpoint?: string;
  /** Maximum packets per HTTP request. */
  batchSize?: number;
  /** Battery-safe fallback sweep. Defaults to 60 seconds. */
  fallbackIntervalMs?: number;
  /** Per-request timeout. */
  requestTimeoutMs?: number;
  /** Injectable connectivity source for tests. */
  isOnline?: () => boolean;
  /** Called whenever sync state changes. */
  onStatusChange?: (snapshot: SyncSnapshot) => void;
}

const DEFAULT_ENDPOINT = '/api/telemetry/sync';
const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_TIMEOUT_MS = 10_000;

export class SyncManager {
  private readonly endpoint: string;
  private readonly batchSize: number;
  private readonly fallbackIntervalMs: number;
  private readonly requestTimeoutMs: number;
  private readonly isOnline: () => boolean;
  private readonly onStatusChange?: (snapshot: SyncSnapshot) => void;

  private timerId: number | null = null;
  private started = false;
  private inFlight = false;
  private snapshot: SyncSnapshot;

  constructor(options: SyncManagerOptions = {}) {
    this.endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
    this.batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
    this.fallbackIntervalMs = options.fallbackIntervalMs ?? DEFAULT_INTERVAL_MS;
    this.requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.isOnline = options.isOnline ?? getIsOnline;
    this.onStatusChange = options.onStatusChange;

    this.snapshot = {
      phase: this.isOnline() ? 'idle' : 'offline',
      online: this.isOnline(),
      pending: 0,
      lastSyncedAt: null,
      lastError: null,
      lastBatchCount: 0,
    };
  }

  /** Begin listening for connectivity changes and the 60-second fallback. */
  start(): void {
    if (this.started || typeof window === 'undefined') return;

    this.started = true;
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    this.notify({ online: this.isOnline() });
    this.timerId = window.setInterval(() => {
      void this.flushNow();
    }, this.fallbackIntervalMs);

    // One opportunistic sweep at startup. This is not a polling loop.
    void this.flushNow();
  }

  stop(): void {
    if (!this.started || typeof window === 'undefined') return;

    this.started = false;
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  getSnapshot(): SyncSnapshot {
    return { ...this.snapshot };
  }

  /** Public manual trigger used by the dashboard "Sync now" action. */
  async flushNow(): Promise<void> {
    if (this.inFlight) return;

    if (!this.isOnline()) {
      const pending = await this.safePendingCount();
      this.notify({ phase: 'offline', online: false, pending });
      return;
    }

    this.inFlight = true;
    this.notify({ phase: 'syncing', online: true, lastError: null });

    try {
      const pending = await getPendingTelemetryLogs(this.batchSize);

      if (pending.length === 0) {
        this.notify({
          phase: 'idle',
          online: true,
          pending: await getPendingTelemetryCount(),
        });
        return;
      }

      let syncedCount = 0;

      for (const [crewId, logs] of groupByCrew(pending)) {
        await this.uploadBatch(crewId, logs);

        const ids = logs
          .map((log) => log.id)
          .filter((id): id is number => typeof id === 'number');

        await markTelemetryLogsSynced(ids);
        syncedCount += ids.length;
      }

      this.notify({
        phase: 'success',
        online: true,
        pending: await getPendingTelemetryCount(),
        lastSyncedAt: new Date().toISOString(),
        lastBatchCount: syncedCount,
        lastError: null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown telemetry sync error';

      console.warn('[syncManager] Telemetry sync failed; packets remain queued.', error);

      this.notify({
        phase: 'error',
        online: this.isOnline(),
        pending: await this.safePendingCount(),
        lastError: message,
      });
    } finally {
      this.inFlight = false;
    }
  }

  private handleOnline = (): void => {
    this.notify({ online: this.isOnline(), phase: this.isOnline() ? 'idle' : 'offline' });
    void this.flushNow();
  };

  private handleOffline = (): void => {
    this.notify({ online: false, phase: 'offline' });
  };

  private async uploadBatch(crewId: string, logs: TelemetryLog[]): Promise<void> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crew_id: crewId, logs }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(
          `Sync rejected (${response.status})${detail ? `: ${detail.slice(0, 180)}` : ''}`
        );
      }

      const result = (await response.json().catch(() => null)) as
        | { success?: boolean }
        | null;

      if (result && result.success === false) {
        throw new Error('Ground sync endpoint rejected the batch.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Ground sync request timed out.');
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  private async safePendingCount(): Promise<number> {
    try {
      return await getPendingTelemetryCount();
    } catch {
      return this.snapshot.pending;
    }
  }

  private notify(patch: Partial<SyncSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    this.onStatusChange?.({ ...this.snapshot });
  }
}

function groupByCrew(logs: TelemetryLog[]): Map<string, TelemetryLog[]> {
  const groups = new Map<string, TelemetryLog[]>();

  for (const log of logs) {
    const crewLogs = groups.get(log.crew_id) ?? [];
    crewLogs.push(log);
    groups.set(log.crew_id, crewLogs);
  }

  return groups;
}