import React, { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-paper-dark border-b border-edge py-2 px-4 text-xs text-ink-secondary">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-primary shrink-0" />
          <span>
            <strong className="font-medium text-ink">NASA Space Apps Challenge Concept:</strong> ZENITH is a research demonstration prototype. Telemetry is predominantly simulated and does not constitute a certified medical device or clinical diagnostic tool.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-ink-muted hover:text-ink p-1 rounded-sm focus-visible:outline-2 focus-visible:outline-slate-primary"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

