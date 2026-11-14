import React from 'react';

interface ZoneBarItem {
  label: string;
  current: number;
  target: number;
  unit: string;
  sublabel?: string;
  warning?: boolean;
}

interface ZoneBarChartProps {
  items: ZoneBarItem[];
  className?: string;
}

export const ZoneBarChart: React.FC<ZoneBarChartProps> = ({ items, className = '' }) => {
  return (
    <div className={`space-y-3.5 ${className}`}>
      {items.map((item, i) => {
        const percent = Math.min(100, Math.round((item.current / item.target) * 100));
        const isExcess = item.current > item.target && item.warning;
        const barColor = isExcess ? 'bg-brick' : 'bg-slate-primary';

        return (
          <div key={i} className="text-xs">
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-medium text-ink flex items-center gap-1.5">
                {item.label}
                {item.sublabel && <span className="text-[11px] text-ink-secondary">({item.sublabel})</span>}
              </span>
              <span className="font-mono text-ink">
                <span className="font-semibold">{item.current}</span>
                <span className="text-ink-secondary"> / {item.target} {item.unit}</span>
                <span className="ml-2 text-[11px] text-ink-secondary">({percent}%)</span>
              </span>
            </div>

            {/* Track and Progress Bar */}
            <div className="w-full h-2 bg-paper border border-edge rounded-sm overflow-hidden relative">
              <div
                className={`h-full ${barColor} transition-all duration-300`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

