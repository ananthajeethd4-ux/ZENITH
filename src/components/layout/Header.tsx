import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Bell, Shield, Clock, UserCheck, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onNavigateToAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToAlerts }) => {
  const { currentUser, allUsers, switchUser } = useAuth();
  const { mission, alerts } = useApp();
  const [metSeconds, setMetSeconds] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Live seconds ticker for mission elapsed time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setMetSeconds((s) => (s + 1) % 60);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  // Format MET display
  const metDays = mission.currentMetDays;
  const now = new Date();
  const hoursStr = String(now.getUTCHours()).padStart(2, '0');
  const minutesStr = String(now.getUTCMinutes()).padStart(2, '0');
  const secondsStr = String(now.getUTCSeconds()).padStart(2, '0');

  return (
    <header className="border-b border-edge bg-paper-dark/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-slate-primary flex items-center justify-center text-paper font-mono font-bold text-sm tracking-wider shadow-tactile">
            Z
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold tracking-tight text-ink text-base sm:text-lg">
                ZENITH
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-widest text-ink-secondary">
                Peak Astronaut Health
              </span>
            </div>
            <p className="text-[10px] text-ink-muted -mt-0.5 tracking-tight">
              NASA Space Apps Challenge Concept
            </p>
          </div>
        </div>

        {/* Center: Mission Elapsed Time Clock (Aerospace Instrument style) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-paper border border-edge rounded-sm text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-primary" />
          <span className="text-ink-secondary">MET:</span>
          <span className="telemetry-val font-semibold text-ink">
            +{metDays}d {hoursStr}h {minutesStr}m {secondsStr}s
          </span>
          <span className="text-[10px] px-1.5 py-0.2 bg-paper-dark border border-edge rounded-sm text-ink-secondary uppercase">
            {mission.name.split(' ')[0]}
          </span>
        </div>

        {/* Right side: Alerts badge & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Alerts trigger */}
          <button
            onClick={onNavigateToAlerts}
            className="relative p-1.5 text-ink-secondary hover:text-ink hover:bg-paper rounded-sm border border-transparent hover:border-edge transition-colors"
            title={`${activeAlertsCount} active alerts`}
            aria-label="View alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brick text-paper text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-paper">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* User & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-paper hover:bg-paper-dark border border-edge rounded-sm text-left transition-colors text-xs"
              aria-expanded={userDropdownOpen}
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-edge shrink-0"
              />
              <div className="hidden sm:block">
                <div className="font-medium text-ink leading-tight line-clamp-1">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-mono text-ink-secondary uppercase">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-ink-secondary shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-64 bg-paper-dark border border-edge rounded-sm shadow-tactile-lg z-40 py-1 divide-y divide-edge animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-ink-secondary">
                      Switch Demo Role / Account
                    </p>
                  </div>
                  <div className="py-1">
                    {allUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          switchUser(user.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-xs hover:bg-paper transition-colors ${
                          user.id === currentUser.id ? 'bg-slate-surface text-slate-primary font-medium' : 'text-ink'
                        }`}
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover border border-edge shrink-0"
                        />
                        <div className="grow">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-[10px] text-ink-secondary font-mono capitalize">
                            Role: {user.role.replace('_', ' ')}
                          </div>
                        </div>
                        {user.id === currentUser.id && (
                          <UserCheck className="w-4 h-4 text-slate-primary shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="px-3 py-2 text-[10px] text-ink-secondary bg-paper">
                    <Shield className="w-3 h-3 inline mr-1 text-slate-primary" />
                    Role-Based Access Simulation Active
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

