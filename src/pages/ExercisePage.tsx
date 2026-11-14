import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ZoneBarChart } from '../components/charts/ZoneBarChart';
import {
  Dumbbell,
  Flame,
  Heart,
  Calendar,
  Plus,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import { ExerciseModality } from '../types/exercise';

export const ExercisePage: React.FC = () => {
  const { selectedAstronaut, exerciseSessions, exerciseGoalsMap, addExerciseSession } = useApp();

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [modalModality, setModalModality] = useState<ExerciseModality>('ARED Resistive');
  const [modalDuration, setModalDuration] = useState(45);
  const [modalAvgHr, setModalAvgHr] = useState(135);
  const [modalPeakHr, setModalPeakHr] = useState(162);
  const [modalCalories, setModalCalories] = useState(380);
  const [modalRpe, setModalRpe] = useState(7);
  const [modalNotes, setModalNotes] = useState('');
  const [modalForce, setModalForce] = useState(1650);

  const astronautSessions = exerciseSessions.filter((e) => e.astronautId === selectedAstronaut.id);
  const goals = exerciseGoalsMap[selectedAstronaut.id] || {
    astronautId: selectedAstronaut.id,
    weeklyAredSessionsTarget: 6,
    weeklyAerobicMinutesTarget: 210,
    targetDailyCaloricBurn: 650,
    minimumRpeLevel: 7,
  };

  // Weekly progress calculation
  const aredSessionsCount = astronautSessions.filter((s) => s.modality === 'ARED Resistive').length;
  const aerobicMinutesCount = astronautSessions
    .filter((s) => s.modality === 'T2 Treadmill' || s.modality === 'CEVIS Cycle Ergometer')
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const todayCalories = astronautSessions[0] ? astronautSessions[0].energyExpenditure_kcal : 0;

  const handleSaveWorkout = () => {
    addExerciseSession({
      astronautId: selectedAstronaut.id,
      date: new Date().toISOString(),
      modality: modalModality,
      durationMinutes: Number(modalDuration),
      completed: true,
      targetDurationMinutes: Number(modalDuration),
      avgHeartRate: Number(modalAvgHr),
      peakHeartRate: Number(modalPeakHr),
      energyExpenditure_kcal: Number(modalCalories),
      rpe_score: Number(modalRpe),
      countermeasureDetails: {
        peakForceNewtons: modalModality === 'ARED Resistive' ? Number(modalForce) : undefined,
      },
      notes: modalNotes,
      source: 'Manual Log',
    });
    setIsEntryModalOpen(false);
    setModalNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Manual Entry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
            Microgravity Exercise Countermeasures
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Musculoskeletal conditioning, bone density preservation, and aerobic load
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsEntryModalOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Record Workout
        </Button>
      </div>

      {/* Countermeasures Disclaimer */}
      <div className="p-3 bg-paper-dark border border-edge rounded-sm flex items-start gap-2.5 text-xs text-ink-secondary">
        <ShieldAlert className="w-4 h-4 text-slate-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-ink">Operational Countermeasure Protocol:</strong> Exercise targets reflect standard NASA Human Research Program (HRP) bone and muscle retention recommendations. They do not constitute personalized medical prescriptions.
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Weekly ARED */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>ARED RESISTIVE</span>
            <Dumbbell className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {aredSessionsCount} / {goals.weeklyAredSessionsTarget}
            <span className="text-xs font-normal text-ink-secondary ml-1">sessions</span>
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">
            Target: 6x / week for osteo-protection
          </div>
        </div>

        {/* Aerobic Duration */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>AEROBIC (T2 / CEVIS)</span>
            <Clock className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {aerobicMinutesCount} / {goals.weeklyAerobicMinutesTarget}
            <span className="text-xs font-normal text-ink-secondary ml-1">min</span>
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">
            Pacing: {Math.round((aerobicMinutesCount / goals.weeklyAerobicMinutesTarget) * 100)}% weekly goal
          </div>
        </div>

        {/* Energy Burn */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>TODAY'S CALORIES</span>
            <Flame className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {todayCalories}
            <span className="text-xs font-normal text-ink-secondary ml-1">kcal</span>
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">
            Goal: {goals.targetDailyCaloricBurn} kcal / day
          </div>
        </div>

        {/* Exertion RPE */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>MEAN RPE INTENSITY</span>
            <Zap className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {astronautSessions[0] ? `${astronautSessions[0].rpe_score} / 10` : '7.0'}
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">Borg RPE Scale: Vigorous</div>
        </div>
      </div>

      {/* Weekly Compliance & Goals Progress */}
      <Card>
        <CardHeader
          title="Weekly Countermeasure Compliance"
          subtitle="Progress against Human Research Program protocols"
          tag={<Badge variant="normal" size="sm">Active Week 21</Badge>}
        />
        <ZoneBarChart
          items={[
            {
              label: 'ARED Resistive Sessions',
              sublabel: 'Squat, Deadlift, Bench Press',
              current: aredSessionsCount,
              target: goals.weeklyAredSessionsTarget,
              unit: 'sessions',
            },
            {
              label: 'Aerobic Exercise Volume',
              sublabel: 'T2 Treadmill & CEVIS Cycle',
              current: aerobicMinutesCount,
              target: goals.weeklyAerobicMinutesTarget,
              unit: 'min',
            },
            {
              label: 'Daily Countermeasure Energy',
              sublabel: 'Active metabolic expenditure',
              current: todayCalories,
              target: goals.targetDailyCaloricBurn,
              unit: 'kcal',
            },
          ]}
        />
      </Card>

      {/* Workout Sessions List */}
      <Card>
        <CardHeader
          title="Recorded Countermeasure Sessions"
          subtitle="Detailed hardware logs, power profiles, and heart-rate telemetry"
        />

        <div className="space-y-3">
          {astronautSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 bg-paper rounded-sm border border-edge/80 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink text-sm">{session.modality}</span>
                  <Badge variant={session.completed ? 'normal' : 'attention'} size="sm">
                    {session.completed ? 'Completed' : 'Modified'}
                  </Badge>
                  <span className="font-mono text-ink-secondary">
                    {new Date(session.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                {session.notes && <p className="text-ink-secondary text-xs">{session.notes}</p>}
                {session.countermeasureDetails && (
                  <div className="flex items-center gap-3 font-mono text-[11px] text-ink-secondary mt-1">
                    {session.countermeasureDetails.peakForceNewtons && (
                      <span>Peak Force: <strong className="text-ink">{session.countermeasureDetails.peakForceNewtons} N</strong></span>
                    )}
                    {session.countermeasureDetails.avgWatts && (
                      <span>Avg Power: <strong className="text-ink">{session.countermeasureDetails.avgWatts} W</strong></span>
                    )}
                    {session.countermeasureDetails.harnessLoadingPercent && (
                      <span>Harness Load: <strong className="text-ink">{session.countermeasureDetails.harnessLoadingPercent}% BW</strong></span>
                    )}
                  </div>
                )}
              </div>

              {/* Metrics Pill Grid */}
              <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                <div className="text-right">
                  <div className="text-[10px] text-ink-secondary">DURATION</div>
                  <div className="font-semibold text-ink">{session.durationMinutes} min</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-ink-secondary">PULSE (AVG / PEAK)</div>
                  <div className="font-semibold text-ink">
                    {session.avgHeartRate} / {session.peakHeartRate} <span className="text-[10px] font-normal text-ink-secondary">bpm</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-ink-secondary">ENERGY</div>
                  <div className="font-semibold text-ink">
                    {session.energyExpenditure_kcal} <span className="text-[10px] font-normal text-ink-secondary">kcal</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {astronautSessions.length === 0 && (
            <p className="text-xs text-ink-secondary py-6 text-center font-mono">
              No exercise sessions recorded for this astronaut.
            </p>
          )}
        </div>
      </Card>

      {/* Record Workout Modal */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title="Record Countermeasure Workout"
        subtitle={`Entering exercise session for ${selectedAstronaut.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEntryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveWorkout}>
              Save Workout
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-ink mb-1 font-mono">Countermeasure Modality</label>
            <select
              value={modalModality}
              onChange={(e) => setModalModality(e.target.value as ExerciseModality)}
              className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-xs"
            >
              <option value="ARED Resistive">ARED Resistive (Squat / Deadlift / Bench)</option>
              <option value="T2 Treadmill">T2 Treadmill (Vibration Isolation System)</option>
              <option value="CEVIS Cycle Ergometer">CEVIS Cycle Ergometer</option>
              <option value="Microgravity Core Conditioning">Microgravity Core Conditioning</option>
              <option value="EVA Pre-Breathe Protocol">EVA Pre-Breathe Conditioning</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1 font-mono">Duration (Minutes)</label>
              <input
                type="number"
                value={modalDuration}
                onChange={(e) => setModalDuration(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1 font-mono">Energy Burn (kcal)</label>
              <input
                type="number"
                value={modalCalories}
                onChange={(e) => setModalCalories(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1 font-mono">Avg Heart Rate (bpm)</label>
              <input
                type="number"
                value={modalAvgHr}
                onChange={(e) => setModalAvgHr(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1 font-mono">Peak Heart Rate (bpm)</label>
              <input
                type="number"
                value={modalPeakHr}
                onChange={(e) => setModalPeakHr(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
          </div>

          {modalModality === 'ARED Resistive' && (
            <div>
              <label className="block font-medium text-ink mb-1 font-mono">Peak Force (Newtons)</label>
              <input
                type="number"
                value={modalForce}
                onChange={(e) => setModalForce(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
          )}

          <div>
            <label className="block font-medium text-ink mb-1 font-mono">Rate of Perceived Exertion (RPE 1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              value={modalRpe}
              onChange={(e) => setModalRpe(Number(e.target.value))}
              className="w-full accent-slate-primary"
            />
            <div className="flex justify-between text-[11px] font-mono text-ink-secondary mt-1">
              <span>1 Light</span>
              <span className="font-semibold text-ink">RPE {modalRpe}</span>
              <span>10 Maximum Effort</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1 font-mono">Session Notes</label>
            <textarea
              rows={2}
              value={modalNotes}
              onChange={(e) => setModalNotes(e.target.value)}
              placeholder="e.g. Completed 12 sets of squats, full knee extension achieved..."
              className="w-full p-2 bg-paper border border-edge rounded-sm text-xs text-ink"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

