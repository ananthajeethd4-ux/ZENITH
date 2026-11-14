import React from 'react';
import {
  Users,
  User,
  Activity,
  Moon,
  Dumbbell,
  Utensils,
  Brain,
  Camera,
  Radio,
  FileText,
  Settings,
} from 'lucide-react';

export type PageId =
  | 'crew-overview'
  | 'astronaut-profile'
  | 'vitals'
  | 'sleep'
  | 'exercise'
  | 'nutrition'
  | 'eeg'
  | 'camera'
  | 'devices'
  | 'alerts-reports'
  | 'settings-privacy';

interface NavigationProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const navItems: NavItem[] = [
    { id: 'crew-overview', label: 'Crew Overview', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'astronaut-profile', label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'vitals', label: 'Vitals', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'sleep', label: 'Sleep', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'exercise', label: 'Exercise', icon: <Dumbbell className="w-3.5 h-3.5" /> },
    { id: 'nutrition', label: 'Nutrition & Labs', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'eeg', label: 'EEG Waveforms', icon: <Brain className="w-3.5 h-3.5" /> },
    { id: 'camera', label: 'Camera', icon: <Camera className="w-3.5 h-3.5" /> },
    { id: 'devices', label: 'Devices', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'alerts-reports', label: 'Alerts & Reports', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'settings-privacy', label: 'Settings & Privacy', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <nav className="border-b border-edge bg-paper sticky top-[49px] z-30 overflow-x-auto no-scrollbar shadow-tactile">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center space-x-1 sm:space-x-2 py-1 min-w-max">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-sm transition-all duration-150 relative ${
                isActive
                  ? 'bg-slate-primary text-paper shadow-tactile'
                  : 'text-ink-secondary hover:text-ink hover:bg-paper-dark'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

