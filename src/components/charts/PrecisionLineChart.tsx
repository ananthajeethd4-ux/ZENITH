import React, { useState, useId } from 'react';

export interface DataPoint {
  timestamp: string; // ISO or label
  value: number;
  label?: string;
  source?: string;
  isSimulated?: boolean;
}

interface PrecisionLineChartProps {
  data: DataPoint[];
  title?: string;
  unit: string;
  height?: number;
  minVal?: number;
  maxVal?: number;
  thresholdHigh?: number;
  thresholdLow?: number;
  className?: string;
  lineColor?: string;
}

export const PrecisionLineChart: React.FC<PrecisionLineChartProps> = ({
  data,
  title,
  unit,
  height = 200,
  minVal,
  maxVal,
  thresholdHigh,
  thresholdLow,
  className = '',
  lineColor = '#34465A', // archival slate navy
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartId = useId();

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center border border-dashed border-edge rounded-sm text-xs text-ink-muted font-mono"
      >
        No telemetry stream data available
      </div>
    );
  }

  // Calculate scales
  const values = data.map((d) => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);

  const paddingBottom = 30;
  const paddingTop = 20;
  const paddingLeft = 45;
  const paddingRight = 20;
  const width = 650; // SVG viewBox width

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const yMin = minVal !== undefined ? minVal : Math.floor(rawMin - 5);
  const yMax = maxVal !== undefined ? maxVal : Math.ceil(rawMax + 5);
  const yRange = yMax - yMin || 1;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return paddingTop + plotHeight - ((clamped - yMin) / yRange) * plotHeight;
  };

  // Build SVG path
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`);
  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${getX(data.length - 1)},${paddingTop + plotHeight} L ${getX(0)},${paddingTop + plotHeight} Z`;

  // Grid steps (4 horizontal calibration lines)
  const gridSteps = 4;
  const yTicks = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const val = yMin + (yRange / gridSteps) * i;
    return { val: Math.round(val), y: getY(val) };
  });

  const activePoint = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  return (
    <div className={`w-full select-none ${className}`}>
      {/* Readout Header */}
      <div className="flex items-baseline justify-between mb-2">
        {title && <span className="text-xs uppercase font-mono tracking-wider text-ink-secondary">{title}</span>}
        <div className="flex items-center gap-2">
          {activePoint && (
            <>
              <span className="text-xs text-ink-secondary font-mono">
                {new Date(activePoint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="telemetry-val text-lg font-semibold text-ink">
                {activePoint.value}
                <span className="text-xs font-normal text-ink-secondary ml-1">{unit}</span>
              </span>
              {activePoint.isSimulated && (
                <span className="text-[10px] uppercase font-mono px-1 py-0.5 border border-edge rounded-sm text-ink-muted">
                  Simulated
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="relative w-full overflow-hidden border border-edge/80 rounded-sm bg-paper-dark/60">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block"
          style={{ maxHeight: height }}
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const svgX = (mouseX / rect.width) * width;
            const relativeX = svgX - paddingLeft;
            const index = Math.round((relativeX / plotWidth) * (data.length - 1));
            if (index >= 0 && index < data.length) {
              setHoverIndex(index);
            }
          }}
        >
          <defs>
            <linearGradient id={`${chartId}-area-grad`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.12" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis tick values */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="#DAD7D1"
                strokeWidth="1"
                strokeDasharray="2,3"
              />
              <text
                x={paddingLeft - 8}
                y={tick.y + 3.5}
                textAnchor="end"
                className="text-[10px] font-mono fill-ink-secondary"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* High threshold line if defined */}
          {thresholdHigh && thresholdHigh <= yMax && thresholdHigh >= yMin && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(thresholdHigh)}
                x2={width - paddingRight}
                y2={getY(thresholdHigh)}
                stroke="#A34A3E"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={width - paddingRight}
                y={getY(thresholdHigh) - 4}
                textAnchor="end"
                className="text-[9px] font-mono fill-brick"
              >
                MAX LIMIT {thresholdHigh}
              </text>
            </g>
          )}

          {/* Low threshold line if defined */}
          {thresholdLow && thresholdLow <= yMax && thresholdLow >= yMin && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(thresholdLow)}
                x2={width - paddingRight}
                y2={getY(thresholdLow)}
                stroke="#A34A3E"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={width - paddingRight}
                y={getY(thresholdLow) - 4}
                textAnchor="end"
                className="text-[9px] font-mono fill-brick"
              >
                MIN LIMIT {thresholdLow}
              </text>
            </g>
          )}

          {/* Subdued Area fill */}
          <path d={areaD} fill={`url(#${chartId}-area-grad)`} />

          {/* Primary Trend Line */}
          <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Hover Crosshair and Dot */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={paddingTop + plotHeight}
                stroke="#34465A"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(data[hoverIndex].value)}
                r="4.5"
                fill="#F9F8F6"
                stroke="#34465A"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* X-axis time boundary labels */}
          <text
            x={paddingLeft}
            y={height - 8}
            className="text-[10px] font-mono fill-ink-secondary"
            textAnchor="start"
          >
            {new Date(data[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </text>
          <text
            x={width - paddingRight}
            y={height - 8}
            className="text-[10px] font-mono fill-ink-secondary"
            textAnchor="end"
          >
            {new Date(data[data.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </text>
        </svg>
      </div>
    </div>
  );
};

