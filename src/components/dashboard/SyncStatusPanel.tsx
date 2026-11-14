import React from 'react';
import {
  CheckCircle2,
  CloudOff,
  CloudUpload,
  Database,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import type { SyncSnapshot } from '../../services/syncManager';

interface SyncStatusPanelProps {
  snapshot: SyncSnapshot;
  onSyncNow: () => void;
  simulatedConnectivity: boolean;
}

const PHASE_LABEL: Record<SyncSnapshot['phase'], string> = {
  idle: 'Queue idle',
  offline: 'Queued offline',
  syncing: 'Uploading batch',
  success: 'Batch acknowledged',
  error: 'Upload failed',
};

function formatClock(iso: string | null): string {
  if (!iso) return 'No successful sync yet';
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export const SyncStatusPanel: React.FC<SyncStatusPanelProps> = ({
  snapshot,
  onSyncNow,
  simulatedConnectivity,
}) => {
  const canSync = snapshot.online && snapshot.pending > 0;
  const phaseBadge =
    snapshot.phase === 'error'
      ? 'attention'
      : snapshot.phase === 'offline'
        ? 'attention'
        : snapshot.phase === 'success'
          ? 'normal'
          : 'neutral';

  return (
    <Card className="h-full">
      <CardHeader
        title="Ground Sync Queue"
        subtitle="Event-driven upload with a battery-safe 60-second fallback"
        action={
          <Badge variant={snapshot.online ? 'normal' : 'attention'} size="sm" dot>
            {snapshot.online ? (simulatedConnectivity ? 'Simulated link' : 'Online') : 'Offline'}
          </Badge>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-sm border border-edge bg-paper px-3 py-2">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-muted">
            <Database className="h-3 w-3" />
            Pending
          </div>
          <div className="telemetry-val mt-1 text-xl font-semibold text-ink">
            {snapshot.pending}
          </div>
        </div>

        <div className="rounded-sm border border-edge bg-paper px-3 py-2">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-muted">
            {snapshot.online ? (
              <CloudUpload className="h-3 w-3" />
            ) : (
              <CloudOff className="h-3 w-3" />
            )}
            State
          </div>
          <div className="mt-1.5">
            <Badge variant={phaseBadge} size="sm">
              {PHASE_LABEL[snapshot.phase]}
            </Badge>
          </div>
        </div>

        <div className="rounded-sm border border-edge bg-paper px-3 py-2">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-muted">
            <CheckCircle2 className="h-3 w-3" />
            Last sync
          </div>
          <div className="mt-1 truncate font-mono text-[11px] text-ink">
            {formatClock(snapshot.lastSyncedAt)}
          </div>
        </div>

        <div className="rounded-sm border border-edge bg-paper px-3 py-2">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-muted">
            <CloudUpload className="h-3 w-3" />
            Last batch
          </div>
          <div className="telemetry-val mt-1 text-xl font-semibold text-ink">
            {snapshot.lastBatchCount}
          </div>
        </div>
      </div>

      {snapshot.lastError && (
        <div
          className="mt-3 rounded-sm border border-brick-border bg-brick-surface px-3 py-2 text-xs text-brick"
          role="alert"
        >
          {snapshot.lastError}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-edge/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-mono text-[11px] text-ink-muted">
          POST /api/telemetry/sync · batch limit 50 · fallback 60s
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onSyncNow}
          loading={snapshot.phase === 'syncing'}
          disabled={!canSync}
          icon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Sync now
        </Button>
      </div>
    </Card>
  );
};