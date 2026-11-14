import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { HypnogramChart } from '../components/charts/HypnogramChart';
import { PrecisionLineChart } from '../components/charts/PrecisionLineChart';
import {
  Moon,
  Clock,
  Sparkles,
  BookOpen,
  Plus,
  AlertCircle,
  ShieldAlert,
  Volume2,
} from 'lucide-react';

export const SleepPage: React.FC = () => {
  const { selectedAstronaut, sleepSessions, sleepDiaries, addSleepDiary } = useApp();

  const [isDiaryModalOpen, setIsDiaryModalOpen] = useState(false);
  const [diaryRating, setDiaryRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [diaryNotes, setDiaryNotes] = useState('');
  const [caffeineEvening, setCaffeineEvening] = useState(false);
  const [selectedDisturbances, setSelectedDisturbances] = useState<string[]>([]);

  const astronautSleep = sleepSessions.filter((s) => s.astronautId === selectedAstronaut.id);
  const latestSleep = astronautSleep[0];

  const astronautDiaries = sleepDiaries.filter((d) => d.astronautId === selectedAstronaut.id);

  // Disturbance presets common to long-duration space flight
  const disturbanceOptions = [
    'Cabin ventilation acoustic hum',
    'Restraint tether tension / drift',
    'Berth localized CO₂ pocketing',
    'Post-EVA muscular soreness',
    'Orbital sunrise light leak',
  ];

  const toggleDisturbance = (dist: string) => {
    setSelectedDisturbances((prev) =>
      prev.includes(dist) ? prev.filter((d) => d !== dist) : [...prev, dist]
    );
  };

  const handleSaveDiary = () => {
    addSleepDiary({
      astronautId: selectedAstronaut.id,
      date: new Date().toISOString().split('T')[0],
      sleepQualityRating: diaryRating,
      ambientDisturbances: selectedDisturbances,
      caffeineIntakeEvening: caffeineEvening,
      notes: diaryNotes,
    });
    setIsDiaryModalOpen(false);
    setDiaryNotes('');
    setSelectedDisturbances([]);
  };

  // Build trend chart data for sleep duration
  const sleepTrendData = [
    { timestamp: '2026-11-08T06:00:00Z', value: 7.2 },
    { timestamp: '2026-11-09T06:00:00Z', value: 7.5 },
    { timestamp: '2026-11-10T06:00:00Z', value: 7.8 },
    { timestamp: '2026-11-11T06:00:00Z', value: 6.9 },
    { timestamp: '2026-11-12T06:00:00Z', value: 8.1 },
    { timestamp: '2026-11-13T06:00:00Z', value: 7.4 },
    {
      timestamp: '2026-11-14T06:00:00Z',
      value: latestSleep ? Number((latestSleep.totalDurationMinutes / 60).toFixed(1)) : 7.4,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Log Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
            Circadian Sleep Architecture
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Microgravity sleep duration, stage hypnograms, and astronaut rest diaries
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsDiaryModalOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Log Sleep Diary
        </Button>
      </div>

      {/* Non-Diagnostic Disclaimer Callout */}
      <div className="p-3 bg-paper-dark border border-edge rounded-sm flex items-start gap-2.5 text-xs text-ink-secondary">
        <ShieldAlert className="w-4 h-4 text-slate-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-ink">Informational Health Telemetry:</strong> Sleep stages and efficiency are derived from multi-sensor sleep pads and actigraphy. These measurements are informational and do not constitute clinical polysomnography or diagnose sleep apnea, insomnia, or neurological sleep disorders.
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Sleep */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>TOTAL SLEEP</span>
            <Moon className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {latestSleep
              ? `${Math.floor(latestSleep.totalDurationMinutes / 60)}h ${latestSleep.totalDurationMinutes % 60}m`
              : '--'}
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">Target: 8h 00m / night</div>
        </div>

        {/* Sleep Efficiency */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>EFFICIENCY SCORE</span>
            <span className="text-slate-primary font-mono text-xs">%</span>
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {latestSleep ? `${latestSleep.efficiencyPercent}%` : '--'}
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">Normal: &gt; 85% in orbit</div>
        </div>

        {/* Sleep Schedule */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>SCHEDULE ONSET</span>
            <Clock className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-lg font-semibold text-ink telemetry-val mt-1">
            {latestSleep ? new Date(latestSleep.bedtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
            <span className="text-xs font-normal text-ink-secondary ml-1">UTC</span>
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">
            Awake: {latestSleep ? new Date(latestSleep.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
          </div>
        </div>

        {/* Rolling Sleep Debt */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>SLEEP DEBT</span>
            <Sparkles className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {latestSleep && latestSleep.sleepDebtMinutes > 0
              ? `+${latestSleep.sleepDebtMinutes}m`
              : '0m'}
          </div>
          <div className="text-[11px] font-mono text-ink-secondary mt-2">
            {latestSleep && latestSleep.sleepDebtMinutes > 60 ? (
              <span className="text-brick font-medium">Nap countermeasure advised</span>
            ) : (
              'Circadian baseline aligned'
            )}
          </div>
        </div>
      </div>

      {/* Hypnogram & Stage Architecture */}
      <Card>
        <CardHeader
          title="Last Night Sleep Stages (Hypnogram)"
          subtitle={`Session: ${latestSleep?.date} (${latestSleep?.source})`}
          tag={<Badge variant="simulated" size="sm">Sensor Hypnogram</Badge>}
        />
        {latestSleep && latestSleep.stages && latestSleep.stages.length > 0 ? (
          <div className="space-y-4">
            <HypnogramChart
              stages={latestSleep.stages}
              totalDurationMinutes={latestSleep.totalDurationMinutes}
            />

            {/* Stages Breakdown Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-edge/60 text-xs">
              <div className="bg-paper p-3 rounded-sm border border-edge/60">
                <span className="text-ink-secondary font-mono text-[10px]">DEEP (SLOW WAVE)</span>
                <div className="text-base font-semibold text-ink telemetry-val mt-0.5">
                  {latestSleep.deepMinutes} min
                  <span className="text-[11px] font-normal text-ink-secondary ml-1">
                    ({Math.round((latestSleep.deepMinutes / latestSleep.totalDurationMinutes) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="bg-paper p-3 rounded-sm border border-edge/60">
                <span className="text-ink-secondary font-mono text-[10px]">REM SLEEP</span>
                <div className="text-base font-semibold text-ink telemetry-val mt-0.5">
                  {latestSleep.remMinutes} min
                  <span className="text-[11px] font-normal text-ink-secondary ml-1">
                    ({Math.round((latestSleep.remMinutes / latestSleep.totalDurationMinutes) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="bg-paper p-3 rounded-sm border border-edge/60">
                <span className="text-ink-secondary font-mono text-[10px]">LIGHT SLEEP</span>
                <div className="text-base font-semibold text-ink telemetry-val mt-0.5">
                  {latestSleep.lightMinutes} min
                  <span className="text-[11px] font-normal text-ink-secondary ml-1">
                    ({Math.round((latestSleep.lightMinutes / latestSleep.totalDurationMinutes) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="bg-paper p-3 rounded-sm border border-edge/60">
                <span className="text-ink-secondary font-mono text-[10px]">WASO (WAKE TIME)</span>
                <div className="text-base font-semibold text-ink telemetry-val mt-0.5">
                  {latestSleep.wakeMinutes} min
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-ink-muted font-mono py-8 text-center">
            No hypnogram stages available for this sleep record.
          </p>
        )}
      </Card>

      {/* 7-Day Sleep Duration Trend & Diary Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader
            title="Weekly Sleep Duration (Hours)"
            subtitle="Rolling 7-day sleep time vs target line"
          />
          <PrecisionLineChart
            data={sleepTrendData}
            title="SLEEP HOURS"
            unit="hrs"
            thresholdLow={7.0}
            minVal={4}
            maxVal={10}
            height={180}
          />
        </Card>

        {/* Astronaut Sleep Diaries */}
        <Card>
          <CardHeader
            title="Astronaut Sleep Diaries"
            subtitle="Subjective quality logs and environmental disturbances"
          />

          <div className="space-y-3">
            {astronautDiaries.map((diary) => (
              <div key={diary.id} className="p-3.5 bg-paper rounded-sm border border-edge/80 text-xs">
                <div className="flex items-center justify-between text-ink-secondary font-mono mb-1.5">
                  <span className="text-ink font-semibold">
                    Quality Rating: {diary.sleepQualityRating} / 5
                  </span>
                  <span>{diary.date}</span>
                </div>

                {diary.ambientDisturbances.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {diary.ambientDisturbances.map((dist, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-paper-dark border border-edge rounded-sm text-[10px] text-ink-secondary font-mono"
                      >
                        {dist}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-ink leading-relaxed">{diary.notes}</p>
              </div>
            ))}

            {astronautDiaries.length === 0 && (
              <p className="text-xs text-ink-secondary py-6 text-center font-mono">
                No subjective sleep diaries logged yet. Click "Log Sleep Diary" above.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Log Sleep Diary Modal */}
      <Modal
        isOpen={isDiaryModalOpen}
        onClose={() => setIsDiaryModalOpen(false)}
        title="Submit Morning Sleep Diary"
        subtitle={`Log subjective restfulness for ${selectedAstronaut.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDiaryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveDiary}>
              Save Sleep Diary
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-ink mb-1.5 font-mono">
              Subjective Restfulness (1 = Poor, 5 = Highly Restorative)
            </label>
            <div className="flex items-center gap-2">
              {([1, 2, 3, 4, 5] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDiaryRating(r)}
                  className={`w-10 h-9 rounded-sm border font-mono font-semibold transition-colors ${
                    diaryRating === r
                      ? 'bg-slate-primary text-paper border-slate-pressed shadow-tactile'
                      : 'bg-paper text-ink border-edge hover:bg-paper-dark'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1.5 font-mono">
              Microgravity Environmental Disturbances (Select all that apply)
            </label>
            <div className="space-y-1.5">
              {disturbanceOptions.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 p-2 bg-paper border border-edge rounded-sm cursor-pointer hover:bg-paper-dark"
                >
                  <input
                    type="checkbox"
                    checked={selectedDisturbances.includes(opt)}
                    onChange={() => toggleDisturbance(opt)}
                    className="rounded-sm"
                  />
                  <span className="text-xs text-ink">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={caffeineEvening}
                onChange={(e) => setCaffeineEvening(e.target.checked)}
                className="rounded-sm"
              />
              <span className="text-xs text-ink">Consumed caffeine within 4 hours of sleep onset</span>
            </label>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1 font-mono">Notes & Observations</label>
            <textarea
              rows={3}
              value={diaryNotes}
              onChange={(e) => setDiaryNotes(e.target.value)}
              placeholder="e.g. Tether loosened at 03:00, earplugs reduced air duct resonance..."
              className="w-full p-2.5 bg-paper border border-edge rounded-sm text-xs text-ink focus-visible:outline-slate-primary"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

