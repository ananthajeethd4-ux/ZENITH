import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { ShieldAlert, RefreshCw, Radio } from 'lucide-react';

interface SubHeaderProps {
  showAstronautSelector?: boolean;
}

export const SubHeader: React.FC<SubHeaderProps> = ({ showAstronautSelector = true }) => {
  const { astronauts, selectedAstronautId, setSelectedAstronautId, selectedAstronaut } = useApp();
  const { currentUser } = useAuth();

  if (!showAstronautSelector || !selectedAstronaut) return null;

  const isRoleRestricted = currentUser.role === 'astronaut';

  return (
    <div className="bg-paper-dark border-b border-edge py-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Astronaut Selector or Display */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedAstronaut.avatarUrl}
              alt={selectedAstronaut.name}
              className="w-10 h-10 rounded-sm object-cover border border-edge shadow-tactile"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-paper-dark ${
                selectedAstronaut.status === 'attention'
                  ? 'bg-brick'
                  : selectedAstronaut.status === 'normal'
                  ? 'bg-slate-primary'
                  : 'bg-ink-muted'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {isRoleRestricted ? (
                <span className="font-semibold text-ink text-sm sm:text-base">
                  {selectedAstronaut.name}
                </span>
              ) : (
                <select
                  value={selectedAstronautId}
                  onChange={(e) => setSelectedAstronautId(e.target.value)}
                  className="bg-paper border border-edge text-ink font-semibold text-sm rounded-sm px-2 py-0.5 focus-visible:outline-slate-primary cursor-pointer"
                  aria-label="Select Crew Member"
                >
                  {astronauts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role} — {a.agency})
                    </option>
                  ))}
                </select>
              )}

              <span className="font-mono text-xs text-ink-secondary">
                [{selectedAstronaut.id}]
              </span>

              <Badge
                variant={selectedAstronaut.status === 'normal' ? 'normal' : selectedAstronaut.status === 'attention' ? 'attention' : 'unavailable'}
                size="sm"
                dot
              >
                {selectedAstronaut.status === 'normal' ? 'Normal' : selectedAstronaut.status === 'attention' ? 'Attention Required' : 'Offline'}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-ink-secondary mt-0.5 font-mono">
              <span>Role: <strong className="text-ink font-sans font-medium">{selectedAstronaut.role}</strong></span>
              <span>•</span>
              <span>Blood: <strong className="text-ink">{selectedAstronaut.bloodType}</strong></span>
              <span>•</span>
              <span>Rad: <strong className="text-ink">{selectedAstronaut.cumulativeRadiation_mSv} mSv</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry Source & Sync Tag */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-ink-secondary font-mono bg-paper border border-edge px-2.5 py-1 rounded-sm">
            <Radio className="w-3.5 h-3.5 text-slate-primary animate-pulse" />
            <span>Source:</span>
            <span className="text-ink font-medium">{selectedAstronaut.dataSource}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-ink-muted">
            <RefreshCw className="w-3 h-3" />
            <span>Sync: {new Date(selectedAstronaut.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};

