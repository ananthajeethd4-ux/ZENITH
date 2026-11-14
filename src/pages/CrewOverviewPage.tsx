import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageId } from '../components/layout/Navigation';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { MiniSparkline } from '../components/charts/MiniSparkline';
import {
  Search,
  Filter,
  Activity,
  Moon,
  Dumbbell,
  Clock,
  ArrowRight,
  AlertTriangle,
  Radio,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface CrewOverviewPageProps {
  onNavigate: (page: PageId, astronautId?: string) => void;
}

export const CrewOverviewPage: React.FC<CrewOverviewPageProps> = ({ onNavigate }) => {
  const {
    mission,
    setMissionDuration,
    astronauts,
    vitalsMap,
    sleepSessions,
    exerciseSessions,
    alerts,
    setSelectedAstronautId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isConfiguringMission, setIsConfiguringMission] = useState(false);
  const [missionDaysInput, setMissionDaysInput] = useState(mission.totalDays);

  // Filter astronauts
  const filteredCrew = astronauts.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || a.role.includes(roleFilter);
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate crew-wide aggregates
  const totalCrew = astronauts.length;
  const normalCrew = astronauts.filter((a) => a.status === 'normal').length;
  const attentionCrew = astronauts.filter((a) => a.status === 'attention').length;
  const activeAlerts = alerts.filter((a) => a.status === 'active');

  const handleOpenProfile = (astronautId: string) => {
    setSelectedAstronautId(astronautId);
    onNavigate('astronaut-profile', astronautId);
  };

  return (
    <div className="space-y-6">
      {/* Top Mission Banner & Metrics */}
      <div className="paper-surface rounded-sm p-4 sm:p-5 border border-edge">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-edge/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-primary font-semibold">
                MISSION MONITOR
              </span>
              <span className="text-edge-dark">•</span>
              <span className="text-xs font-mono text-ink-secondary">{mission.target}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight mt-1">
              {mission.name}
            </h1>
          </div>

          {/* Configurable Mission Duration */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-ink-secondary font-mono">MISSION PROGRESS</div>
              <div className="text-sm font-semibold text-ink font-mono">
                Day {mission.currentMetDays} of {mission.totalDays} ({Math.round((mission.currentMetDays / mission.totalDays) * 100)}%)
              </div>
            </div>
            <button
              onClick={() => setIsConfiguringMission(!isConfiguringMission)}
              className="p-1.5 border border-edge rounded-sm hover:bg-paper-dark text-ink-secondary hover:text-ink transition-colors"
              title="Configure Mission Duration"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mission Configuration Drawer */}
        {isConfiguringMission && (
          <div className="mt-3 p-3 bg-paper border border-edge rounded-sm flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-ink">Planned Mission Duration (Days):</span>
              <input
                type="number"
                min="30"
                max="1000"
                value={missionDaysInput}
                onChange={(e) => setMissionDaysInput(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-paper-dark border border-edge rounded-sm font-mono text-xs text-ink focus-visible:outline-slate-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setMissionDuration(missionDaysInput);
                  setIsConfiguringMission(false);
                }}
              >
                Apply Duration
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsConfiguringMission(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Summary Telemetry Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-paper p-3 rounded-sm border border-edge/60">
            <span className="text-[11px] font-mono text-ink-secondary uppercase">Fleet Status</span>
            <div className="text-lg font-semibold text-ink mt-0.5 flex items-baseline gap-1.5">
              <span>{normalCrew} / {totalCrew}</span>
              <span className="text-xs font-normal text-slate-primary">Normal</span>
            </div>
          </div>

          <div className="bg-paper p-3 rounded-sm border border-edge/60">
            <span className="text-[11px] font-mono text-ink-secondary uppercase">Active Alerts</span>
            <div className="text-lg font-semibold text-ink mt-0.5 flex items-baseline gap-1.5">
              <span className={activeAlerts.length > 0 ? 'text-brick' : 'text-slate-primary'}>
                {activeAlerts.length}
              </span>
              <span className="text-xs font-normal text-ink-secondary">Unacknowledged</span>
            </div>
          </div>

          <div className="bg-paper p-3 rounded-sm border border-edge/60">
            <span className="text-[11px] font-mono text-ink-secondary uppercase">Habitat Pressure</span>
            <div className="text-lg font-semibold text-ink mt-0.5 font-mono">
              {mission.habitatPressureKpa} <span className="text-xs text-ink-secondary">kPa</span>
            </div>
          </div>

          <div className="bg-paper p-3 rounded-sm border border-edge/60">
            <span className="text-[11px] font-mono text-ink-secondary uppercase">Cosmic Rad Rate</span>
            <div className="text-lg font-semibold text-ink mt-0.5 font-mono">
              {mission.radiationRate_uSv_hr} <span className="text-xs text-ink-secondary">µSv/h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative grow max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
          <input
            type="text"
            placeholder="Search by name, callsign, or astronaut ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-paper-dark border border-edge rounded-sm text-ink placeholder:text-ink-muted focus-visible:outline-slate-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-paper-dark border border-edge rounded-sm px-2.5 py-1.5 text-ink focus-visible:outline-slate-primary cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="Commander">Commander</option>
            <option value="Pilot">Pilot</option>
            <option value="Surgeon">Flight Surgeon</option>
            <option value="Specialist">Specialist</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-paper-dark border border-edge rounded-sm px-2.5 py-1.5 text-ink focus-visible:outline-slate-primary cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="normal">Normal Only</option>
            <option value="attention">Attention Required</option>
          </select>
        </div>
      </div>

      {/* Crew Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCrew.map((astronaut) => {
          const vitals = vitalsMap[astronaut.id] || [];
          const latestVital = vitals[vitals.length - 1];
          const hrSpark = vitals.slice(-12).map((v) => v.heartRate_bpm);

          const sleepLogs = sleepSessions.filter((s) => s.astronautId === astronaut.id);
          const latestSleep = sleepLogs[0];

          const exerciseLogs = exerciseSessions.filter((e) => e.astronautId === astronaut.id);
          const latestExercise = exerciseLogs[0];

          return (
            <div
              key={astronaut.id}
              className={`paper-surface rounded-sm p-4 sm:p-5 border transition-all ${
                astronaut.status === 'attention' ? 'border-brick-border' : 'border-edge'
              }`}
            >
              {/* Header: Photo, Names, Status */}
              <div className="flex items-start justify-between gap-3 border-b border-edge/60 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={astronaut.avatarUrl}
                    alt={astronaut.name}
                    className="w-12 h-12 rounded-sm object-cover border border-edge shadow-tactile"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-ink text-base tracking-tight">
                        {astronaut.name}
                      </h3>
                      <span className="text-xs font-mono text-ink-secondary">
                        "{astronaut.callsign}"
                      </span>
                    </div>
                    <div className="text-xs text-ink-secondary font-mono flex items-center gap-2 mt-0.5">
                      <span>{astronaut.role}</span>
                      <span>•</span>
                      <span>{astronaut.agency}</span>
                      <span>•</span>
                      <span>{astronaut.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={astronaut.status === 'normal' ? 'normal' : 'attention'}
                    size="sm"
                    dot
                  >
                    {astronaut.status === 'normal' ? 'Normal' : 'Attention Required'}
                  </Badge>
                  <span className="text-[10px] font-mono text-ink-muted">
                    Sync: {new Date(astronaut.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Status Reason Banner if Attention Required */}
              {astronaut.statusReason && (
                <div className="mt-3 p-2 bg-brick-surface border border-brick-border rounded-sm flex items-start gap-2 text-xs text-brick">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{astronaut.statusReason}</span>
                </div>
              )}

              {/* Telemetry Snapshot Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5">
                {/* Heart Rate */}
                <div className="bg-paper p-2.5 rounded-sm border border-edge/60">
                  <div className="flex items-center justify-between text-[10px] font-mono text-ink-secondary">
                    <span>HEART RATE</span>
                    <Activity className="w-3 h-3 text-slate-primary" />
                  </div>
                  <div className="text-base font-semibold text-ink telemetry-val mt-0.5">
                    {latestVital ? latestVital.heartRate_bpm : '--'}
                    <span className="text-[11px] font-normal text-ink-secondary ml-1">bpm</span>
                  </div>
                  <div className="mt-1">
                    <MiniSparkline data={hrSpark} width={65} height={16} />
                  </div>
                </div>

                {/* SpO2 */}
                <div className="bg-paper p-2.5 rounded-sm border border-edge/60">
                  <div className="flex items-center justify-between text-[10px] font-mono text-ink-secondary">
                    <span>OXYGEN (SpO₂)</span>
                    <span className="text-[10px] text-slate-primary font-mono">%</span>
                  </div>
                  <div className="text-base font-semibold text-ink telemetry-val mt-0.5">
                    {latestVital ? latestVital.spo2_percent : '--'}
                    <span className="text-[11px] font-normal text-ink-secondary ml-1">%</span>
                  </div>
                  <div className="text-[10px] text-ink-secondary font-mono mt-1">
                    {latestVital && latestVital.spo2_percent >= 95 ? 'Normal range' : 'Borderline'}
                  </div>
                </div>

                {/* Sleep Duration */}
                <div className="bg-paper p-2.5 rounded-sm border border-edge/60">
                  <div className="flex items-center justify-between text-[10px] font-mono text-ink-secondary">
                    <span>LAST SLEEP</span>
                    <Moon className="w-3 h-3 text-slate-primary" />
                  </div>
                  <div className="text-base font-semibold text-ink telemetry-val mt-0.5">
                    {latestSleep ? `${Math.floor(latestSleep.totalDurationMinutes / 60)}h ${latestSleep.totalDurationMinutes % 60}m` : '--'}
                  </div>
                  <div className="text-[10px] text-ink-secondary font-mono mt-1">
                    Eff: {latestSleep ? `${latestSleep.efficiencyPercent}%` : '--'}
                  </div>
                </div>

                {/* Exercise */}
                <div className="bg-paper p-2.5 rounded-sm border border-edge/60">
                  <div className="flex items-center justify-between text-[10px] font-mono text-ink-secondary">
                    <span>EXERCISE</span>
                    <Dumbbell className="w-3 h-3 text-slate-primary" />
                  </div>
                  <div className="text-sm font-semibold text-ink line-clamp-1 mt-0.5">
                    {latestExercise ? `${latestExercise.durationMinutes}m` : 'None'}
                  </div>
                  <div className="text-[10px] text-ink-secondary font-mono mt-1 truncate">
                    {latestExercise ? latestExercise.modality.split(' ')[0] : '--'}
                  </div>
                </div>
              </div>

              {/* Footer: Source tag and View Profile CTA */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-edge/40">
                <div className="flex items-center gap-1.5 text-ink-secondary font-mono text-[11px]">
                  <Radio className="w-3 h-3 text-slate-primary" />
                  <span>{astronaut.dataSource}</span>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOpenProfile(astronaut.id)}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  iconPosition="right"
                >
                  View Profile
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCrew.length === 0 && (
        <div className="p-12 text-center border border-dashed border-edge rounded-sm bg-paper-dark">
          <p className="text-sm text-ink-secondary">No crew members match your search criteria.</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('all');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

