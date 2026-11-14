import {
  CloudOff,
  Database,
  RefreshCw,
  Satellite,
  Wifi,
  WifiOff,
} from "lucide-react";

interface SyncPanelProps {
  online: boolean;
  pendingSync: number;
  lastSyncAt: number | null;
  syncing: boolean;
  syncError: string | null;
  onSyncNow: () => void;
}

function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return "No uplink yet";

  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1_000));
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

export function SyncPanel({
  online,
  pendingSync,
  lastSyncAt,
  syncing,
  syncError,
  onSyncNow,
}: SyncPanelProps) {
  const status = !online
    ? {
        label: "Offline capture",
        message: "Packets are being written to IndexedDB. Nothing is lost.",
        className: "border-amber-500/20 bg-amber-500/5 text-amber-200",
        Icon: WifiOff,
      }
    : pendingSync > 0
      ? {
          label: "Awaiting uplink",
          message: "Records are queued and will sync automatically.",
          className: "border-cyan-500/20 bg-cyan-500/5 text-cyan-200",
          Icon: CloudOff,
        }
      : {
          label: "Fully synced",
          message: "Every local record has reached the cloud relay.",
          className: "border-emerald-500/20 bg-emerald-500/5 text-emerald-200",
          Icon: Wifi,
        };

  const StatusIcon = status.Icon;

  return (
    <section className="rounded-2xl border border-white/5 bg-slate-950/55 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/15">
            <Satellite className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Uplink & local buffer
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Offline-first sync queue
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
            online
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/20 bg-amber-500/10 text-amber-300"
          }`}
        >
          <StatusIcon className="h-3 w-3" />
          {online ? "Online" : "Offline"}
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 rounded-xl border border-white/5 bg-black/20 p-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Pending packets
          </p>
          <p className="mt-1 text-4xl font-semibold leading-none text-slate-50 tabular-nums">
            {pendingSync}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Last uplink
          </p>
          <p className="mt-1.5 font-mono text-xs text-slate-300">
            {formatRelativeTime(lastSyncAt)}
          </p>
        </div>
      </div>

      <div
        className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[11px] leading-4 ${status.className}`}
      >
        <StatusIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div>
          <p className="font-semibold">{status.label}</p>
          <p className="mt-0.5 text-slate-400">{status.message}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Database className="h-3 w-3" />
          IndexedDB · local-first
        </span>
        <span className="font-mono">
          {pendingSync === 0 ? "0 records buffered" : `${pendingSync} buffered`}
        </span>
      </div>

      {syncError ? (
        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[11px] leading-4 text-red-300">
          {syncError}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onSyncNow}
        disabled={!online || syncing || pendingSync === 0}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Uploading queue…" : "Flush sync queue"}
      </button>
    </section>
  );
}
