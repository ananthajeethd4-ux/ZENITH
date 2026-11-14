import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export type MetricStatus = 'normal' | 'warning' | 'critical' | 'neutral';

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  icon: React.ReactNode;
  target?: string;
  status?: MetricStatus;
  detail?: string;
}

const STATUS_LABEL: Record<MetricStatus, string> = {
  normal: 'Nominal',
  warning: 'Warning',
  critical: 'Critical',
  neutral: 'Standby',
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon,
  target,
  status = 'neutral',
  detail,
}) => {
  const badgeVariant =
    status === 'normal' ? 'normal' : status === 'neutral' ? 'neutral' : 'attention';

  return (
    <Card
      variant={status === 'critical' ? 'alert' : 'default'}
      className="h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-secondary">
            {label}
          </span>
          <span
            className={
              status === 'critical'
                ? 'text-brick'
                : status === 'warning'
                  ? 'text-brick'
                  : 'text-slate-primary'
            }
          >
            {icon}
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="telemetry-val text-2xl sm:text-3xl font-semibold text-ink">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-normal text-ink-secondary">{unit}</span>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          {target ? (
            <span className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
              {target}
            </span>
          ) : (
            <span />
          )}
          <Badge variant={badgeVariant} size="sm" dot={status !== 'neutral'}>
            {STATUS_LABEL[status]}
          </Badge>
        </div>
        {detail && <p className="text-[11px] text-ink-secondary">{detail}</p>}
      </div>
    </Card>
  );
};