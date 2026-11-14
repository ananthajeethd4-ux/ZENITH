import Dexie, { type Table } from "dexie";

/**
 * Local-first telemetry storage for the astronaut health monitor.
 *
 * Everything in this file is synchronous with the user's device: writes go to
 * IndexedDB first and never wait for the network. Sync metadata lives on the
 * record itself so the upload queue survives page reloads.
 */

export const TELEMETRY_MODES = ["rest", "exercise", "sleep", "stress"] as const;

export type TelemetryMode = (typeof TELEMETRY_MODES)[number];

/** `pending` records are candidates for upload; `synced` records are done. */
export type SyncStatus = "pending" | "synced";

export interface Vitals {
  /** Beats per minute. */
  heart_rate: number;
  /** Peripheral oxygen saturation, typically 0-100. */
  spo2: number;
  /** Blood pressure reading, e.g. "120/80". */
  blood_pressure: string;
  /** Body temperature in degrees Celsius. */
  body_temp: number;
}

export interface TelemetryLog {
  /** Auto-increment primary key, assigned by Dexie. */
  id?: number;
  /** Unix epoch milliseconds (not an ISO string) so it can be indexed/sorted. */
  timestamp: number;
  crew_id: string;
  mode: TelemetryMode;
  vitals: Vitals;
  sync_status: SyncStatus;
}

/**
 * Shape accepted by `saveTelemetryLocally`.
 *
 * `timestamp` is optional (defaults to `Date.now()`) and `sync_status` is
 * intentionally not accepted from callers: new records are always pending.
 */
export type TelemetryInput = Omit<
  TelemetryLog,
  "id" | "timestamp" | "sync_status"
> & {
  timestamp?: number;
};

export const TELEMETRY_DB_NAME = "astronaut-health-db";

export class TelemetryDatabase extends Dexie {
  // `declare` emits no JS field, so it cannot overwrite the table that Dexie
  // attaches in the constructor when `useDefineForClassFields` is enabled.
  declare telemetryLogs: Table<TelemetryLog, number>;

  constructor() {
    super(TELEMETRY_DB_NAME);

    this.version(1).stores({
      // `++id`     -> auto-increment primary key
      // Other entries are indexes used by the sync queue and crew timeline.
      telemetryLogs:
        "++id, timestamp, crew_id, mode, sync_status, [crew_id+timestamp], [sync_status+timestamp]",
    });

    // If the shape changes later, add this instead of editing version 1:
    //
    // this.version(2).stores({
    //   telemetryLogs:
    //     "++id, timestamp, crew_id, mode, sync_status, [crew_id+timestamp], [sync_status+timestamp]",
    // }).upgrade((tx) => {
    //   return tx.table("telemetryLogs").toCollection().modify((record) => {
    //     record.mode ??= "rest";
    //   });
    // });
  }
}

/** Shared singleton used by the app and the sync engine. */
export const db = new TelemetryDatabase();

export function isTelemetryMode(value: unknown): value is TelemetryMode {
  return (
    typeof value === "string" &&
    (TELEMETRY_MODES as readonly string[]).includes(value)
  );
}

function assertFiniteNumber(
  value: unknown,
  field: string,
): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`[telemetry] "${field}" must be a finite number.`);
  }
}

/**
 * Validates and normalizes an incoming packet.
 *
 * Keeping normalization here means the DB never contains half-valid records
 * and callers cannot accidentally create a record that is already "synced".
 */
export function normalizeTelemetryPacket(input: TelemetryInput): TelemetryLog {
  if (typeof input !== "object" || input === null) {
    throw new TypeError("[telemetry] Packet must be an object.");
  }

  const crewId = typeof input.crew_id === "string" ? input.crew_id.trim() : "";
  if (!crewId) {
    throw new TypeError('[telemetry] "crew_id" must be a non-empty string.');
  }

  if (!isTelemetryMode(input.mode)) {
    throw new TypeError(
      `[telemetry] "mode" must be one of: ${TELEMETRY_MODES.join(", ")}.`,
    );
  }

  const vitals = input.vitals;
  if (typeof vitals !== "object" || vitals === null) {
    throw new TypeError('[telemetry] "vitals" must be an object.');
  }

  assertFiniteNumber(vitals.heart_rate, "vitals.heart_rate");
  assertFiniteNumber(vitals.spo2, "vitals.spo2");
  assertFiniteNumber(vitals.body_temp, "vitals.body_temp");

  const bloodPressure =
    typeof vitals.blood_pressure === "string"
      ? vitals.blood_pressure.trim()
      : "";
  if (!bloodPressure) {
    throw new TypeError(
      '[telemetry] "vitals.blood_pressure" must be a non-empty string (e.g. "120/80").',
    );
  }

  const timestamp = input.timestamp ?? Date.now();
  assertFiniteNumber(timestamp, "timestamp");
  if (timestamp <= 0) {
    throw new RangeError(
      '[telemetry] "timestamp" must be a positive Unix epoch in milliseconds.',
    );
  }

  // Build a fresh object so unknown/extra properties (including a spoofed
  // `sync_status` or `id`) are not written to IndexedDB.
  return {
    timestamp,
    crew_id: crewId,
    mode: input.mode,
    vitals: {
      heart_rate: vitals.heart_rate,
      spo2: vitals.spo2,
      blood_pressure: bloodPressure,
      body_temp: vitals.body_temp,
    },
    sync_status: "pending",
  };
}

/**
 * Save one health packet locally. Resolves with the new auto-increment id.
 *
 * This does not call the network. That is intentional: sensor ingestion should
 * stay fast and must work with the radio/network completely unavailable.
 */
export async function saveTelemetryLocally(
  packet: TelemetryInput,
): Promise<number> {
  const record = normalizeTelemetryPacket(packet);
  return db.telemetryLogs.add(record);
}

/**
 * Convenience helper for sensor batches. Writes atomically so a failure does
 * not leave half of a batch behind.
 */
export async function saveTelemetryBatchLocally(
  packets: TelemetryInput[],
): Promise<number[]> {
  const records = packets.map(normalizeTelemetryPacket);

  return db.transaction("rw", db.telemetryLogs, () =>
    Promise.all(records.map((record) => db.telemetryLogs.add(record))),
  );
}

/**
 * Pending records ordered oldest-first using the compound index
 * `[sync_status+timestamp]`. The sync engine uses this instead of loading the
 * whole table into memory.
 */
export function getPendingTelemetry(limit = 100): Promise<TelemetryLog[]> {
  return db.telemetryLogs
    .where("[sync_status+timestamp]")
    .between(
      ["pending", 0],
      ["pending", Number.MAX_SAFE_INTEGER],
      true,
      true,
    )
    .limit(limit)
    .toArray();
}

export function getPendingTelemetryCount(): Promise<number> {
  return db.telemetryLogs.where("sync_status").equals("pending").count();
}

/** Most recent records first, useful for a crew dashboard. */
export function getTelemetryForCrew(
  crewId: string,
  limit = 100,
): Promise<TelemetryLog[]> {
  return db.telemetryLogs
    .where("[crew_id+timestamp]")
    .between(
      [crewId, 0],
      [crewId, Number.MAX_SAFE_INTEGER],
      true,
      true,
    )
    .reverse()
    .limit(limit)
    .toArray();
}

/**
 * Optional retention helper: remove data that has reached the cloud to keep
 * the local DB small on long missions. Do not call this before you have a
 * server-side copy you trust.
 */
export function deleteSyncedTelemetry(): Promise<number> {
  return db.telemetryLogs.where("sync_status").equals("synced").delete();
}
