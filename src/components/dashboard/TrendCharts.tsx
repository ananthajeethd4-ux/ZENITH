import type { ReactNode } from "react";
import { Activity, Droplets } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { parseBloodPressure } from "@/lib/healthStatus";
import type { MockTelemetryPacket } from "@/lib/mockTelemetry";

interface TrendChartsProps {
  history: MockTelemetryPacket[];
}

interface ChartPoint {
  time: string;
  heartRate: number;
  spo2: number;
  systolic: number;
  diastolic: number;
  temperature: number;
}

function toChartData(history: MockTelemetryPacket[]): ChartPoint[] {
  return history.map((packet) => {
    const pressure = parseBloodPressure(packet.vitals.blood_pressure);

    return {
      time: new Date(packet.timestamp).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }),
      heartRate: packet.vitals.heart_rate,
      spo2: packet.vitals.spo2,
      systolic: pressure.systolic,
      diastolic: pressure.diastolic,
      temperature: packet.vitals.body_temp,
    };
  });
}

interface LegendItem {
  label: string;
  color: string;
}

function Legend({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

interface ChartFrameProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  legend: LegendItem[];
  sampleCount: number;
  children: ReactNode;
}

function ChartFrame({
  icon,
  title,
  subtitle,
  legend,
  sampleCount,
  children,
}: ChartFrameProps) {
  return (
    <section className="rounded-2xl border border-white/5 bg-slate-950/55 p-4 shadow-2xl shadow-black/20 backdrop-blur sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/15">
            {icon}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Legend items={legend} />
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
            {sampleCount} samples
          </span>
        </div>
      </div>

      <div className="mt-4 h-[230px] w-full">
        {sampleCount < 2 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 bg-black/20">
            <div className="flex items-center gap-1">
              {[3, 5, 4, 7, 5, 8, 6].map((height, index) => (
                <span
                  key={`${height}-${index}`}
                  className="w-1 animate-pulse rounded-full bg-cyan-400/30"
                  style={{
                    height: `${height * 4}px`,
                    animationDelay: `${index * 90}ms`,
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Collecting live samples — first trend appears after two packets.
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

const TOOLTIP_STYLE = {
  backgroundColor: "#080e1b",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "12px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.35)",
  fontSize: "11px",
  color: "#e2e8f0",
} as const;

const AXIS_TICK = { fill: "#64748b", fontSize: 10 } as const;

export function TrendCharts({ history }: TrendChartsProps) {
  const data = toChartData(history);

  return (
    <div className="grid gap-4">
      <ChartFrame
        icon={<Activity className="h-4 w-4" />}
        title="Cardio & oxygen saturation"
        subtitle="Continuous heart rate and SpO2 telemetry"
        legend={[
          { label: "Heart rate", color: "#fb7185" },
          { label: "SpO2", color: "#38bdf8" },
        ]}
        sampleCount={data.length}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 0, left: -18, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.09)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />
            <YAxis
              yAxisId="left"
              domain={[40, 220]}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={42}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[80, 100]}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={42}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#94a3b8" }}
              itemStyle={{ color: "#e2e8f0" }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="heartRate"
              name="Heart rate"
              stroke="#fb7185"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="spo2"
              name="SpO2"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame
        icon={<Droplets className="h-4 w-4" />}
        title="Hemodynamics & thermal load"
        subtitle="Blood pressure and core temperature"
        legend={[
          { label: "Systolic", color: "#fbbf24" },
          { label: "Diastolic", color: "#a78bfa" },
          { label: "Temp", color: "#fb923c" },
        ]}
        sampleCount={data.length}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 0, left: -18, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.09)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />
            <YAxis
              yAxisId="left"
              domain={[50, 220]}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={42}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[34, 41]}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={42}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: "#94a3b8" }}
              itemStyle={{ color: "#e2e8f0" }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="systolic"
              name="Systolic"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="diastolic"
              name="Diastolic"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="temperature"
              name="Temperature"
              stroke="#fb923c"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}
