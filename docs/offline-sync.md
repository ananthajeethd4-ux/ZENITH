# Offline-first telemetry store

The module lives in `src/lib/telemetry/`:

| File | Responsibility |
| --- | --- |
| `db.ts` | Dexie schema, types, validation, local save/query helpers |
| `sync.ts` | Batch upload queue, mock uploader, online/interval auto-sync |
| `index.ts` | Public exports |

## 1. Install

```bash
npm install dexie
```

The files already import from `dexie`; no other runtime dependency is needed.

## 2. Save locally first

```ts
import { saveTelemetryLocally } from "./lib/telemetry";

// Sensor ingest path: never awaits the network.
const id = await saveTelemetryLocally({
  crew_id: "CDR-01",
  mode: "exercise",
  vitals: {
    heart_rate: 142,
    spo2: 96,
    blood_pressure: "128/82",
    body_temp: 37.4,
  },
});

console.log("Stored locally as record", id);
```

Every new record is forced to `sync_status: "pending"`. `timestamp` defaults to
`Date.now()` (epoch milliseconds) but can be supplied for backfilled readings:

```ts
await saveTelemetryLocally({
  crew_id: "CDR-01",
  mode: "sleep",
  timestamp: Date.parse("2026-11-14T02:15:00Z"),
  vitals: {
    heart_rate: 54,
    spo2: 98,
    blood_pressure: "112/70",
    body_temp: 36.5,
  },
});
```

For bursts from a sensor, `saveTelemetryBatchLocally(packets)` writes all
packets in one transaction and returns their ids.

## 3. Start the background sync queue

Call this once during app bootstrap, and clean it up on teardown. It is
idempotent, so repeated calls replace the previous listeners instead of
stacking them.

```ts
import { startAutoSync } from "./lib/telemetry";

const stopAutoSync = startAutoSync({
  intervalMs: 15_000, // fallback poll; default is 30s
  onSync: (result) => {
    console.log(
      `sync=${result.status} uploaded=${result.uploaded} batches=${result.batches}`,
    );
  },
  onError: (error) => {
    console.warn("Telemetry will retry later:", error);
  },
});

// Later, e.g. on HMR dispose, route unmount, or beforeunload:
// stopAutoSync();
```

React example:

```tsx
import { useEffect } from "react";
import { startAutoSync } from "./lib/telemetry";

export function useTelemetrySync() {
  useEffect(() => startAutoSync({ intervalMs: 15_000 }), []);
}
```

What the engine does:

1. Checks the connectivity probe (`navigator.onLine` by default) before each batch.
2. Reads pending rows oldest-first, `50` per batch by default.
3. Calls the uploader (the mock waits one second and logs an acknowledgement).
4. Only after the uploader resolves, marks those exact rows `"synced"`.
5. Repeats until no pending rows remain, connectivity drops, an upload fails,
   or the per-run safety cap is reached. Leftovers are picked up next run.
6. Triggers again on the `online` event, on tab visibility, and every
   `intervalMs`. Overlapping triggers share one in-flight run, so a batch is
   never uploaded twice by two timers in the same tab.

### Simulating offline mode

`navigator.onLine` is read-only, so the dashboard passes a state-backed probe
instead. This is also handy for tests and hackathon demos:

```ts
let simulatedOnline = true;

startAutoSync({
  connectivity: () => simulatedOnline,
  uploader: async (batch) => {
    // ...
  },
});
```

The Dashboard's uplink switch toggles exactly this value and then calls
`processSyncQueue()` immediately when connectivity returns.

## 4. Use the real backend

Pass any function that resolves only after the server has acknowledged the
batch. If it throws, the rows stay pending and are retried automatically.

```ts
import { startAutoSync, type BatchUploader } from "./lib/telemetry";

const uploader: BatchUploader = async (batch) => {
  const response = await fetch("https://api.example.com/telemetry/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
    // Sending the local id lets the server deduplicate retries.
    body: JSON.stringify({ records: batch }),
  });

  if (!response.ok) {
    throw new Error(`Batch upload failed with HTTP ${response.status}`);
  }
};

startAutoSync({ uploader, intervalMs: 30_000 });
```

## 5. Show the pending badge

```ts
import { getPendingTelemetryCount } from "./lib/telemetry";

const pending = await getPendingTelemetryCount();
// e.g. "8 readings waiting for uplink"
```

Other helpers in `db.ts`:

- `getPendingTelemetry(limit)` — oldest pending rows (used by the sync engine).
- `getTelemetryForCrew(crewId, limit)` — newest-first crew timeline.
- `deleteSyncedTelemetry()` — optional retention cleanup; only after you trust
  the server-side copy.

## 6. Demo offline-first behavior

1. Open DevTools → Network → set **Offline**.
2. Save a few packets. They appear immediately and stay `"pending"`.
3. Set **Online** again.
4. The `online` listener fires `processSyncQueue()`; within roughly one second
   per batch the rows become `"synced"`.

You can inspect the data in DevTools → Application → IndexedDB →
`astronaut-health-db` → `telemetryLogs`.

## Design notes and caveats

- **Idempotency is still required server-side.** If the browser crashes after
  the server stores a batch but before Dexie marks it synced, that batch is
  re-sent. Deduplicate on `(crew_id, id, timestamp)` in the API.
- **`navigator.onLine` is only a hint.** It says a network interface exists,
  not that the API is reachable. A rejected `fetch` keeps records pending and
  the next interval retries.
- **No network inside a Dexie transaction.** IndexedDB transactions commit
  when they go idle, so the code uploads first and opens a write transaction
  afterwards.
- **Retries are interval-based, not exponential.** For a prototype this is
  predictable and battery-friendly enough. For production, add jitter and a
  `retry_count`/`next_retry_at` index instead of polling every 30 seconds.
- **Storage limits.** IndexedDB can be evicted under storage pressure. Call
  `navigator.storage.persist()` during onboarding if the browser allows it,
  and prune synced rows with `deleteSyncedTelemetry()` on long missions.
- **Multi-tab.** The in-flight guard is per tab. Two tabs could upload the same
  pending batch; server-side deduplication covers that case. A `BroadcastChannel`
  or Web Lock can reduce duplicate requests later.
