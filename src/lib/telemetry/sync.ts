import {
  db,
  getPendingTelemetry,
  getPendingTelemetryCount,
  type TelemetryLog,
} from "./db";

/**
 * Background sync queue.
 *
 * Design rules:
 *  - Never lose a record because the network failed: upload first, then mark
 *    the local row as synced.
 *  - Never run two sync cycles at once (online event + interval can overlap).
 *  - Never hold a Dexie transaction open across `await uploader(...)`;
 *    IndexedDB transactions auto-commit when they go idle.
 */

export type BatchUploader = (records: TelemetryLog[]) => Promise<void>;

export interface SyncOptions {
  /** Records sent to the uploader per request. Defaults to 50. */
  batchSize?: number;
  /**
   * Replace the mock uploader with a real API call. It must reject/throw when
   * the server does not acknowledge the batch; pending rows are then kept.
   */
  uploader?: BatchUploader;
  /**
   * Optional connectivity probe. Defaults to `navigator.onLine`.
   *
   * Supplying this lets a demo toggle a React state variable instead of trying
   * to mutate the read-only `navigator.onLine` property.
   */
  connectivity?: () => boolean;
}

export type SyncRunStatus =
  | "offline"
  | "empty"
  | "synced"
  | "partial"
  | "error";

export interface SyncResult {
  status: SyncRunStatus;
  /** Number of local records successfully marked as synced this run. */
  uploaded: number;
  /** Number of upload round-trips attempted. */
  batches: number;
  /** Set for `error` (or `partial` when the failure happened mid-run). */
  error?: unknown;
}

export const DEFAULT_BATCH_SIZE = 50;
export const DEFAULT_SYNC_INTERVAL_MS = 30_000;
/**
 * Safety cap so a continuous sensor stream cannot keep one sync run alive
 * forever. Leftover rows are picked up on the next interval.
 */
const MAX_BATCHES_PER_RUN = 20;

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Connection hint only. `navigator.onLine === true` does not guarantee that
 * the server is reachable; a failed upload simply leaves rows pending and the
 * next interval retries them.
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === true;
}

/**
 * Stand-in for a cloud endpoint. It waits one second to mimic a batch request.
 * Replace it via `uploader` when wiring up the real backend (see docs).
 */
export function createMockUploader(
  delayMs = 1_000,
  connectivity: () => boolean = isOnline,
): BatchUploader {
  return async (records) => {
    await delay(delayMs);

    // Simulate losing connectivity while the request was in flight.
    if (!connectivity()) {
      throw new Error(
        "[telemetry-sync] Mock upload failed: connection dropped mid-request.",
      );
    }

    console.info(
      `[telemetry-sync] Mock server acknowledged ${records.length} record(s).`,
    );
  };
}

export const mockBatchUpload = createMockUploader();

function normalizeBatchSize(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return DEFAULT_BATCH_SIZE;
  }
  return Math.max(1, Math.floor(value));
}

/**
 * Shared in-flight promise. The `online` event and the fallback interval can
 * fire close together; both callers then await the same run instead of
 * uploading the same pending rows twice.
 */
let activeSync: Promise<SyncResult> | null = null;

/**
 * Upload all pending rows in batches. Safe to call frequently; it is a no-op
 * while offline or while another sync cycle is running.
 *
 * This function resolves with a result instead of throwing for expected
 * failures (offline, HTTP error, server rejection), so timer callbacks cannot
 * produce unhandled promise rejections.
 */
export function processSyncQueue(
  options: SyncOptions = {},
): Promise<SyncResult> {
  if (activeSync) return activeSync;

  const task = runSyncQueue(options).finally(() => {
    activeSync = null;
  });
  activeSync = task;

  return task;
}

async function runSyncQueue(options: SyncOptions): Promise<SyncResult> {
  const connectivity = options.connectivity ?? isOnline;

  if (!connectivity()) {
    return { status: "offline", uploaded: 0, batches: 0 };
  }

  const batchSize = normalizeBatchSize(options.batchSize);
  const uploader =
    options.uploader ?? createMockUploader(1_000, connectivity);

  let uploaded = 0;
  let batches = 0;

  try {
    // Re-check connectivity before each batch. If the link dies mid-run we
    // stop and leave the remaining rows pending for the next reconnect.
    while (connectivity() && batches < MAX_BATCHES_PER_RUN) {
      const batch = await getPendingTelemetry(batchSize);
      if (batch.length === 0) break;

      await uploader(batch);

      const ids = batch
        .map((record) => record.id)
        .filter((id): id is number => typeof id === "number");

      if (ids.length !== batch.length) {
        throw new Error(
          "[telemetry-sync] Pending record is missing its auto-increment id.",
        );
      }

      // Network call is finished, so it is safe to open a write transaction.
      // The `.and(...)` guard avoids re-marking a row another tab synced.
      const updated = await db.telemetryLogs
        .where("id")
        .anyOf(ids)
        .and((record) => record.sync_status === "pending")
        .modify((record) => {
          record.sync_status = "synced";
        });

      uploaded += updated;
      batches += 1;

      // A concurrent writer could have changed the rows. Stop rather than
      // spin forever re-uploading the same pending batch.
      if (updated === 0) break;
    }

    const remaining = await getPendingTelemetryCount();
    if (remaining > 0) {
      if (!connectivity()) {
        return {
          status: uploaded > 0 ? "partial" : "offline",
          uploaded,
          batches,
        };
      }

      // New packets may have arrived while the batch was in flight, or the
      // per-run batch cap was reached. This is normal for a live stream; the
      // next run will continue draining it. Do not report an error.
      return {
        status: "partial",
        uploaded,
        batches,
      };
    }

    return {
      status: uploaded > 0 ? "synced" : "empty",
      uploaded,
      batches,
    };
  } catch (error) {
    if (!connectivity()) {
      // Losing the uplink mid-batch is an expected offline scenario, not a
      // server failure. Keep the queued rows and let the next tick retry.
      console.info(
        "[telemetry-sync] Uplink interrupted; unsent records remain pending.",
      );
      return {
        status: uploaded > 0 ? "partial" : "offline",
        uploaded,
        batches,
      };
    }

    console.error(
      "[telemetry-sync] Upload failed; unsent records remain pending.",
      error,
    );

    return {
      status: uploaded > 0 ? "partial" : "error",
      uploaded,
      batches,
      error,
    };
  }
}

export interface AutoSyncOptions extends SyncOptions {
  /** Fallback polling interval when no online/visibility event fires. */
  intervalMs?: number;
  /** Run a catch-up sync immediately on startup. Defaults to true. */
  runImmediately?: boolean;
  /** Called after every run, including `offline` and `empty` runs. */
  onSync?: (result: SyncResult) => void;
  /** Called when a run reports an error, including a mid-run upload failure. */
  onError?: (error: unknown, result: SyncResult) => void;
}

let stopActiveAutoSync: (() => void) | null = null;

/**
 * Wire the queue to browser connectivity. Returns an idempotent cleanup
 * function; call it on app teardown / React `useEffect` cleanup.
 *
 * Triggers:
 *  - `online`                -> immediate sync when the radio comes back
 *  - `visibilitychange`      -> catch up when a backgrounded tab is reopened
 *  - `intervalMs` fallback   -> covers missed events and flaky connections
 */
export function startAutoSync(options: AutoSyncOptions = {}): () => void {
  if (typeof window === "undefined") {
    console.warn(
      "[telemetry-sync] startAutoSync() requires a browser; ignoring.",
    );
    return () => {};
  }

  // HMR or a second app mount must not stack listeners/intervals.
  stopAutoSync();

  const requestedInterval = options.intervalMs ?? DEFAULT_SYNC_INTERVAL_MS;
  const intervalMs = Number.isFinite(requestedInterval)
    ? Math.max(1_000, Math.floor(requestedInterval))
    : DEFAULT_SYNC_INTERVAL_MS;

  const run = (): void => {
    void processSyncQueue(options)
      .then((result) => {
        try {
          options.onSync?.(result);
        } catch (callbackError) {
          console.error(
            "[telemetry-sync] onSync callback threw.",
            callbackError,
          );
        }

        if (result.error !== undefined) {
          try {
            options.onError?.(result.error, result);
          } catch (callbackError) {
            console.error(
              "[telemetry-sync] onError callback threw.",
              callbackError,
            );
          }
        }
      })
      .catch((unexpectedError) => {
        // processSyncQueue normally resolves, but keep the timer safe if a
        // future change makes it reject.
        console.error("[telemetry-sync] Unexpected sync failure.", unexpectedError);
        try {
          options.onError?.(unexpectedError, {
            status: "error",
            uploaded: 0,
            batches: 0,
            error: unexpectedError,
          });
        } catch (callbackError) {
          console.error(
            "[telemetry-sync] onError callback threw.",
            callbackError,
          );
        }
      });
  };

  const handleOnline = (): void => {
    run();
  };

  const handleVisibilityChange = (): void => {
    if (document.visibilityState === "visible") run();
  };

  window.addEventListener("online", handleOnline);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  const intervalId = window.setInterval(() => {
    run();
  }, intervalMs);

  const stop = (): void => {
    window.clearInterval(intervalId);
    window.removeEventListener("online", handleOnline);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };

  stopActiveAutoSync = stop;

  if (options.runImmediately !== false) run();

  // Only stop the currently registered engine. Calling a stale cleanup after
  // a restart should not tear down the newer listeners.
  return () => {
    if (stopActiveAutoSync === stop) stopAutoSync();
  };
}

/** Stop the online listener, visibility listener, and fallback interval. */
export function stopAutoSync(): void {
  const stop = stopActiveAutoSync;
  if (!stop) return;
  stopActiveAutoSync = null;
  stop();
}
