import React from 'react';
import {
  Activity,
  Brain,
  Dumbbell,
  Moon,
  RadioTower,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card, CardHeader } from '../common/Card';
import { Badge } from '../common/Badge';
import { MODE_LABELS, TELEMETRY_MODES, type TelemetryMode } from '../../types/telemetry';

interface TelemetryControlsProps {
  mode: TelemetryMode;
  onModeChange: (mode: TelemetryMode) => void;
  onInjectAnomaly: () => void;
  isOnline: boolean;
  onToggleConnectivity: () => void;
  emergencyActive: boolean;
}

const MODE_ICONS: Record<TelemetryMode, React.ReactNode> = {
  rest: <Activity className="h-3.5 w-3.5" />,
  exercise: <Dumbbell className="h-3.5 w-3.5" />,
  sleep: <Moon className="h-3.5 w-3.5" />,
  stress: <Brain className="h-3.5 w-3.5" />,
};

export const TelemetryControls: React.FC<TelemetryControlsProps> = ({
  mode,
  onModeChange,
  onInjectAnomaly,
  isOnline,
  onToggleConnectivity,
  emergencyActive,
}) => {
  return (
    <Card className="h-full">
      <CardHeader
        title="Telemetry Controls"
        subtitle="Simulation mode, emergency injection, and link state"
        action={
          <Badge variant={isOnline ? 'normal' : 'attention'} size="sm" dot>
            {isOnline ? 'Linked' : 'Offline'}
          </Badge>
        }
      />

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-secondary">
              Operational mode
            </span>
            <span className="font-mono text-[10px] text-ink-muted">
              {MODE_LABELS[mode]}
            </span>
          </div>

          <div
            className="grid grid-cols-2 gap-2"
            role="group"
            aria-label="Operational mode"
          >
            {TELEMETRY_MODES.map((item) => {
              const active = item === mode;
              return (
                <Button
                  key={item}
                  size="sm"
                  variant={active ? 'primary' : 'secondary'}
                  onClick={() => onModeChange(item)}
                  icon={MODE_ICONS[item]}
                  aria-pressed={active}
                >
                  {MODE_LABELS[item]}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 border-t border-edge/60 pt-4">
          <Button
            variant="danger"
            size="sm"
            onClick={onInjectAnomaly}
            icon={<Zap className="h-3.5 w-3.5" />}
          >
            {emergencyActive ? 'Emergency Anomaly Active' : 'Inject Emergency Anomaly'}
          </Button>

          <Button
            variant={isOnline ? 'secondary' : 'outline'}
            size="sm"
            onClick={onToggleConnectivity}
            icon={isOnline ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
            aria-pressed={!isOnline}
          >
            {isOnline ? 'Simulate Offline Link' : 'Restore Online Link'}
          </Button>
        </div>

        <div className="flex items-start gap-2 rounded-sm border border-edge bg-paper px-3 py-2">
          <RadioTower className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-primary" />
          <p className="text-[11px] leading-relaxed text-ink-secondary">
            Offline mode keeps every packet in IndexedDB. The queue uploads on the
            browser <span className="font-mono">online</span> event or the 60-second
            fallback sweep — never on a rapid polling loop.
          </p>
        </div>
      </div>
    </Card>
  );
};