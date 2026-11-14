import React from 'react';
import { useApp } from '../../context/AppContext';
import { RotateCcw, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { resetAllData } = useApp();

  return (
    <footer className="border-t border-edge bg-paper-dark mt-16 py-8 px-4 sm:px-6 text-xs text-ink-secondary">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink text-sm tracking-tight">ZENITH</span>
            <span>—</span>
            <span>Peak Astronaut Health Monitoring System</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-1 max-w-2xl leading-relaxed">
            A NASA Space Apps Challenge demonstration concept. Fictional astronaut profiles, non-clinical telemetry models, and simulated aerospace biodata. Not certified for terrestrial or extraterrestrial medical diagnosis.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink-secondary border border-edge bg-paper px-2.5 py-1 rounded-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-primary" />
            <span>WCAG AAA Compliant</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo telemetry, logs, and settings to original state?')) {
                resetAllData();
              }
            }}
            className="flex items-center gap-1.5 font-mono text-[11px] text-ink-secondary hover:text-ink hover:underline p-1"
            title="Reset demo data to default baseline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

