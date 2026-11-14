import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { PageId } from '../components/layout/Navigation';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PrecisionLineChart } from '../components/charts/PrecisionLineChart';
import { MiniSparkline } from '../components/charts/MiniSparkline';
import {
  Activity,
  Moon,
  Dumbbell,
  Utensils,
  Brain,
  Shield,
  Clock,
  Plus,
  FileText,
  AlertCircle,
  Radio,
  ArrowRight,
} from 'lucide-react';

interface AstronautProfilePageProps {
  onNavigate: (page: PageId) => void;
}

export const AstronautProfilePage: React.FC<AstronautProfilePageProps> = ({ onNavigate }) => {
  const { selectedAstronaut, vitalsMap, sleepSessions, exerciseSessions, foodLogs, eegSessions, alerts, addMedicalNote } =
    useApp();
  const { canEditMedicalNotes, currentUser } = useAuth();

  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('day');
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!selectedAstronaut) return null;

  const vitals = vitalsMap[selectedAstronaut.id] || [];
  const latestVital = vitals[vitals.length - 1];

  const chartData = vitals.map((v) => ({
    timestamp: v.timestamp,
    value: v.heartRate_bpm,
    source: v.source,
    isSimulated: v.isSimulated,
  }));

  const spo2ChartData = vitals.map((v) => ({
    timestamp: v.timestamp,
    value: v.spo2_percent,
    source: v.source,
    isSimulated: v.isSimulated,
  }));

  const astronautSleep = sleepSessions.filter((s) => s.astronautId === selectedAstronaut.id);
  const astronautExercise = exerciseSessions.filter((e) => e.astronautId === selectedAstronaut.id);
  const astronautNutrition = foodLogs.filter((f) => f.astronautId === selectedAstronaut.id);
  const astronautEEG = eegSessions.filter((e) => e.astronautId === selectedAstronaut.id);
  const astronautAlerts = alerts.filter((a) => a.astronautId === selectedAstronaut.id);

  const handleSaveNote = () => {
    if (!newNoteText.trim()) return;
    addMedicalNote(selectedAstronaut.id, newNoteText.trim());
    setNewNoteText('');
    setIsAddingNote(false);
  };

  return (
    <div className="space-y-6">
      {/* Astronaut Overview Header Card */}
      <div className="paper-surface rounded-sm p-5 border border-edge">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-edge/60 pb-5">
          <div className="flex items-center gap-4">
            <img
              src={selectedAstronaut.avatarUrl}
              alt={selectedAstronaut.name}
              className="w-16 h-16 rounded-sm object-cover border border-edge shadow-tactile"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
                  {selectedAstronaut.name}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 bg-paper border border-edge rounded-sm text-ink-secondary">
                  "{selectedAstronaut.callsign}"
                </span>
                <Badge
                  variant={selectedAstronaut.status === 'normal' ? 'normal' : 'attention'}
                  size="sm"
                  dot
                >
                  {selectedAstronaut.status === 'normal' ? 'Normal' : 'Attention Required'}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-ink-secondary mt-1">
                {selectedAstronaut.role} • {selectedAstronaut.agency} • Astronaut ID: <span className="font-mono">{selectedAstronaut.id}</span>
              </p>
            </div>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1.5 self-start md:self-center border border-edge rounded-sm bg-paper p-1 text-xs font-mono">
            <span className="px-2 text-ink-muted text-[11px] uppercase">Telemetry Range:</span>
            {(['day', 'week', 'month'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-1 rounded-sm uppercase tracking-wider transition-colors ${
                  timeFilter === tf
                    ? 'bg-slate-primary text-paper font-medium shadow-tactile'
                    : 'text-ink-secondary hover:text-ink hover:bg-paper-dark'
                }`}
              >
                {tf === 'day' ? '24 Hours' : tf === 'week' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Bio-Mission Parameter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-ink-muted font-mono uppercase text-[10px]">Blood Group & Rh</span>
            <div className="text-sm font-semibold text-ink mt-0.5">{selectedAstronaut.bloodType}</div>
          </div>
          <div>
            <span className="text-ink-muted font-mono uppercase text-[10px]">Age</span>
            <div className="text-sm font-semibold text-ink mt-0.5">{selectedAstronaut.age} years</div>
          </div>
          <div>
            <span className="text-ink-muted font-mono uppercase text-[10px]">Cum. Ionizing Radiation</span>
            <div className="text-sm font-semibold text-ink mt-0.5 font-mono">
              {selectedAstronaut.cumulativeRadiation_mSv} <span className="text-ink-secondary text-xs">mSv</span>
            </div>
          </div>
          <div>
            <span className="text-ink-muted font-mono uppercase text-[10px]">Primary Telemetry Source</span>
            <div className="text-xs font-mono text-ink mt-0.5 flex items-center gap-1">
              <Radio className="w-3 h-3 text-slate-primary" />
              <span>{selectedAstronaut.dataSource}</span>
            </div>
          </div>
        </div>

        {/* EVA Qualifications */}
        <div className="mt-4 pt-3 border-t border-edge/60 flex items-center gap-2 flex-wrap text-xs">
          <span className="font-mono text-ink-secondary text-[11px] uppercase">EVA Certifications:</span>
          {selectedAstronaut.evaQualifications.map((qual, i) => (
            <span key={i} className="px-2 py-0.5 bg-paper border border-edge rounded-sm font-mono text-[11px] text-ink">
              {qual}
            </span>
          ))}
        </div>
      </div>

      {/* Vitals Telemetry Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader
            title="Heart Rate Profile"
            subtitle="Resting vs active telemetry trend (24 hours)"
            action={
              <Button size="sm" variant="ghost" onClick={() => onNavigate('vitals')}>
                View Vitals <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            }
          />
          <PrecisionLineChart
            data={chartData}
            title="PULSE TELEMETRY"
            unit="bpm"
            thresholdHigh={110}
            thresholdLow={48}
            height={190}
          />
        </Card>

        <Card>
          <CardHeader
            title="SpO₂ Blood Oxygen Saturation"
            subtitle="Peripheral capillary oxygenation readings"
            action={
              <Button size="sm" variant="ghost" onClick={() => onNavigate('vitals')}>
                View Vitals <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            }
          />
          <PrecisionLineChart
            data={spo2ChartData}
            title="SPO2 OXYGENATION"
            unit="%"
            thresholdLow={94}
            minVal={90}
            maxVal={100}
            height={190}
          />
        </Card>
      </div>

      {/* Subsystem Health Summaries (Sleep, Exercise, Nutrition, EEG) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sleep Card */}
        <Card
          className="hover:border-slate-primary transition-colors cursor-pointer"
          onClick={() => onNavigate('sleep')}
        >
          <div className="flex items-center justify-between text-ink-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Sleep Profile</span>
            <Moon className="w-4 h-4 text-slate-primary" />
          </div>
          {astronautSleep[0] ? (
            <div>
              <div className="text-xl font-semibold text-ink telemetry-val">
                {Math.floor(astronautSleep[0].totalDurationMinutes / 60)}h {astronautSleep[0].totalDurationMinutes % 60}m
              </div>
              <div className="text-xs text-ink-secondary mt-1">
                Efficiency: <span className="font-mono font-medium text-ink">{astronautSleep[0].efficiencyPercent}%</span>
              </div>
              <div className="text-[11px] font-mono text-ink-muted mt-2">
                Debt: {astronautSleep[0].sleepDebtMinutes > 0 ? `+${astronautSleep[0].sleepDebtMinutes}m` : 'None'}
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-muted font-mono">No sleep sessions recorded</p>
          )}
        </Card>

        {/* Exercise Card */}
        <Card
          className="hover:border-slate-primary transition-colors cursor-pointer"
          onClick={() => onNavigate('exercise')}
        >
          <div className="flex items-center justify-between text-ink-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Exercise Counters</span>
            <Dumbbell className="w-4 h-4 text-slate-primary" />
          </div>
          {astronautExercise[0] ? (
            <div>
              <div className="text-xl font-semibold text-ink telemetry-val">
                {astronautExercise[0].durationMinutes}m
              </div>
              <div className="text-xs text-ink-secondary mt-1 line-clamp-1">
                {astronautExercise[0].modality}
              </div>
              <div className="text-[11px] font-mono text-ink-muted mt-2">
                HR Avg: {astronautExercise[0].avgHeartRate} bpm
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-muted font-mono">No workouts logged today</p>
          )}
        </Card>

        {/* Nutrition Card */}
        <Card
          className="hover:border-slate-primary transition-colors cursor-pointer"
          onClick={() => onNavigate('nutrition')}
        >
          <div className="flex items-center justify-between text-ink-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Nutrition & Labs</span>
            <Utensils className="w-4 h-4 text-slate-primary" />
          </div>
          {astronautNutrition[0] ? (
            <div>
              <div className="text-xl font-semibold text-ink telemetry-val">
                {astronautNutrition[0].calories_kcal} kcal
              </div>
              <div className="text-xs text-ink-secondary mt-1">
                Hydration: <span className="font-mono text-ink">{astronautNutrition[0].hydration_ml} ml</span>
              </div>
              <div className="text-[11px] font-mono text-ink-muted mt-2">
                {astronautNutrition[0].supplementsTaken.length} supplements logged
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-muted font-mono">No nutrition entries recorded</p>
          )}
        </Card>

        {/* EEG Card */}
        <Card
          className="hover:border-slate-primary transition-colors cursor-pointer"
          onClick={() => onNavigate('eeg')}
        >
          <div className="flex items-center justify-between text-ink-secondary mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">EEG Neuro-Fatigue</span>
            <Brain className="w-4 h-4 text-slate-primary" />
          </div>
          {astronautEEG[0] ? (
            <div>
              <div className="text-xl font-semibold text-ink telemetry-val">
                {astronautEEG[0].channels.length} Channels
              </div>
              <div className="text-xs text-ink-secondary mt-1 line-clamp-1">
                {astronautEEG[0].protocol}
              </div>
              <div className="text-[11px] font-mono text-ink-muted mt-2">
                Alpha Coherence: {astronautEEG[0].bandPowerSummary.alpha.toFixed(1)}%
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-muted font-mono">No EEG records uploaded</p>
          )}
        </Card>
      </div>

      {/* Clinical Notes & Flight Surgeon Observations */}
      <Card>
        <CardHeader
          title="Flight Surgeon Medical Log"
          subtitle="Authorized clinical notes, countermeasures, and health assessments"
          action={
            canEditMedicalNotes ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddingNote(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Clinical Note
              </Button>
            ) : (
              <span className="text-xs font-mono text-ink-muted">Read-Only View</span>
            )
          }
        />

        {/* Form to add note */}
        {isAddingNote && (
          <div className="mb-4 p-4 bg-paper border border-edge rounded-sm space-y-3 animate-in fade-in duration-150">
            <div className="text-xs font-mono text-ink font-medium">New Clinical Observation:</div>
            <textarea
              rows={3}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Enter countermeasure assessment, sleep guidance, or medication note..."
              className="w-full p-2.5 bg-paper-dark border border-edge rounded-sm text-xs text-ink focus-visible:outline-slate-primary"
            />
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsAddingNote(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleSaveNote}>
                Save Clinical Note
              </Button>
            </div>
          </div>
        )}

        {/* Notes list */}
        <div className="space-y-3">
          {selectedAstronaut.medicalNotes.map((note) => (
            <div key={note.id} className="p-3.5 bg-paper rounded-sm border border-edge/80 text-xs">
              <div className="flex items-center justify-between text-ink-secondary font-mono mb-1.5">
                <span className="font-semibold text-ink">
                  {note.author} ({note.role})
                </span>
                <span>{new Date(note.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
              <p className="text-ink leading-relaxed">{note.content}</p>
            </div>
          ))}

          {selectedAstronaut.medicalNotes.length === 0 && (
            <p className="text-xs text-ink-secondary py-4 text-center font-mono">
              No clinical notes recorded for this astronaut.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

