import React, { useState } from 'react';
import { SleepStageSegment } from '../../types/sleep';

interface HypnogramChartProps {
  stages: SleepStageSegment[];
  totalDurationMinutes: number;
  className?: string;
}

export const HypnogramChart: React.FC<HypnogramChartProps> = ({
  stages,
  totalDurationMinutes,
  className = '',
}) => {
  const [hoveredStage, setHoveredStage] = useState<SleepStageSegment | null>(null);

  if (!stages || stages.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center border border-dashed border-edge rounded-sm text-xs font-mono text-ink-muted">
        Sleep stages breakdown not supported by current sensor profile
      </div>
    );
  }

  const height = 150;
  const width = 650;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 25;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Stages levels: Wake = 0, REM = 1, Light = 2, Deep = 3
  const stageLevelMap: Record<string, number> = {
    wake: 0,
    rem: 1,
    light: 2,
    deep: 3,
  };

  const getStageY = (stage: string) => {
    const level = stageLevelMap[stage] ?? 2;
    return paddingTop + (level / 3) * plotHeight;
  };

  // Build step-line coordinates
  let currentMinute = 0;
  const pathParts: string[] = [];

  stages.forEach((segment, idx) => {
    const startX = paddingLeft + (currentMinute / totalDurationMinutes) * plotWidth;
    const endX = paddingLeft + ((currentMinute + segment.durationMinutes) / totalDurationMinutes) * plotWidth;
    const y = getStageY(segment.stage);

    if (idx === 0) {
      pathParts.push(`M ${startX},${y}`);
    } else {
      pathParts.push(`L ${startX},${y}`);
    }
    pathParts.push(`L ${endX},${y}`);

    currentMinute += segment.durationMinutes;
  });

  const pathD = pathParts.join(' ');

  return (
    <div className={`w-full select-none ${className}`}>
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-mono text-ink-secondary uppercase tracking-wider">Sleep Architecture (Hypnogram)</span>
        {hoveredStage && (
          <span className="font-mono text-ink">
            Stage: <span className="uppercase font-semibold">{hoveredStage.stage}</span> ({hoveredStage.durationMinutes} min)
          </span>
        )}
      </div>

      <div className="border border-edge rounded-sm bg-paper-dark p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block">
          {/* Level guidelines */}
          {(['wake', 'rem', 'light', 'deep'] as const).map((stage) => {
            const y = getStageY(stage);
            return (
              <g key={stage}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#DAD7D1"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-ink-secondary uppercase"
                >
                  {stage}
                </text>
              </g>
            );
          })}

          {/* Stepped Hypnogram Curve */}
          <path d={pathD} fill="none" stroke="#34465A" strokeWidth="2.5" strokeLinecap="square" />

          {/* Interactive stage rectangles for hover inspection */}
          {(() => {
            let m = 0;
            return stages.map((seg, i) => {
              const startX = paddingLeft + (m / totalDurationMinutes) * plotWidth;
              const segWidth = (seg.durationMinutes / totalDurationMinutes) * plotWidth;
              const y = getStageY(seg.stage);
              m += seg.durationMinutes;

              return (
                <g key={i}>
                  <rect
                    x={startX}
                    y={y - 8}
                    width={segWidth}
                    height={16}
                    fill="transparent"
                    className="cursor-pointer hover:fill-slate-primary/20"
                    onMouseEnter={() => setHoveredStage(seg)}
                    onMouseLeave={() => setHoveredStage(null)}
                  />
                  <circle cx={startX + segWidth / 2} cy={y} r="2.5" fill="#34465A" />
                </g>
              );
            });
          })()}

          {/* Time axis */}
          <text x={paddingLeft} y={height - 6} className="text-[10px] font-mono fill-ink-secondary">
            Sleep Onset
          </text>
          <text x={width - paddingRight} y={height - 6} className="text-[10px] font-mono fill-ink-secondary" textAnchor="end">
            Awakening (+{Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}m)
          </text>
        </svg>
      </div>

      <div className="flex items-center justify-center gap-6 mt-2 text-[11px] font-mono text-ink-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-brick" /> Wake
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-ink-secondary" /> REM
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-edge-dark" /> Light
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-slate-primary" /> Deep / SWS
        </span>
      </div>
    </div>
  );
};

