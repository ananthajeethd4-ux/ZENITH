/**
 * Local-first telemetry database.
 *
 * IndexedDB is the durable source of truth while the habitat link is degraded.
 * Packets are written here first, then uploaded in batches by the sync manager.
 *
 * Schema notes:
 *  - `++id`          → auto-incrementing primary key
 *  - `timestamp`     → indexed for recent-history queries
 *  - `sync_status`   → indexed so pending batches are cheap to find
 *  - `crew_id`       → indexed for per-astronaut exports/queries
 *  - `mode`          → indexed for filtering by operational mode
 *  - `[sync_status+timestamp]` → compound index for ordered pending batches
 */

import Dexie, { type Table } from 'dexie';
import type { TelemetryLog } from '../types/telemetry';

export class ZenithLocalDatabase extends Dexie {
  telemetryLogs!: Table<TelemetryLog, number>;

  constructor() {
    super('zenith_local_db');

    this.version(1).stores({
      telemetryLogs: '++id, timestamp, crew_id, mode, sync_status, [sync_status+timestamp]',
    });
  }
}

export const localDb = new ZenithLocalDatabase();

export type NewTelemetryLog = Omit<TelemetryLog, 'id'>;

/** Persist a newly generated packet. Returns the Dexie-assigned id. */
export async function saveTelemetryLog(log: NewTelemetryLog): Promise<number> {
  return localDb.telemetryLogs.add(log as TelemetryLog);
}

/**
 * Return the oldest pending packets, capped by `limit`.
 * Oldest-first ordering avoids starvation if the queue grows during an outage.
 */
export async function getPendingTelemetryLogs(limit = 50): Promise<TelemetryLog[]> {
  const pending = await localDb.telemetryLogs
    .where('sync_status')
    .equals('pending')
    .toArray();

  return pending
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(0, Math.max(0, limit));
}

export async function getPendingTelemetryCount(): Promise<number> {
  return localDb.telemetryLogs.where('sync_status').equals('pending').count();
}

/** Mark a successfully uploaded batch as synced. */
export async function markTelemetryLogsSynced(ids: number[]): Promise<number> {
  if (ids.length === 0) return 0;

  return localDb.telemetryLogs
    .where('id')
    .anyOf(ids)
    .modify({ sync_status: 'synced' });
}

/** Most recent packets for the dashboard's local queue view. */
export async function getRecentTelemetryLogs(limit = 8): Promise<TelemetryLog[]> {
  return localDb.telemetryLogs.orderBy('timestamp').reverse().limit(limit).toArray();
}

/** Drop old synced packets so the local database stays bounded on long missions. */
export async function pruneSyncedTelemetryLogs(maxAgeHours = 48): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();

  return localDb.telemetryLogs
    .where('[sync_status+timestamp]')
    .between(['synced', Dexie.minKey], ['synced', cutoff], true, false)
    .delete();
}

/** Development/demo utility: clear the local queue. */
export async function clearTelemetryLogs(): Promise<void> {
  await localDb.telemetryLogs.clear();
}