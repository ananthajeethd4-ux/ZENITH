import React, { useRef, useEffect, useState } from 'react';
import { EEGChannelId, EEGChannelQuality } from '../../types/eeg';
import { Play, Pause, RotateCcw, Filter, Activity } from 'lucide-react';
import { Button } from '../common/Button';

interface EEGWaveformCanvasProps {
  channels?: EEGChannelId[];
  isSimulated?: boolean;
  channelQualities?: EEGChannelQuality[];
  className?: string;
}

export const EEGWaveformCanvas: React.FC<EEGWaveformCanvasProps> = ({
  channels = ['Fp1', 'Fp2', 'C3', 'C4', 'Pz', 'O1'],
  isSimulated = true,
  channelQualities = [],
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [notchFilter, setNotchFilter] = useState(true);
  const [gain, setGain] = useState<number>(1); // 1x, 2x, 0.5x
  const [speed, setSpeed] = useState<number>(1);

  const animFrameRef = useRef<number | null>(null);
  const sweepXRef = useRef<number>(0);
  const channelHistoriesRef = useRef<Record<string, number[]>>({});

  // Initialize channel histories
  useEffect(() => {
    channels.forEach((ch) => {
      if (!channelHistoriesRef.current[ch]) {
        channelHistoriesRef.current[ch] = new Array(800).fill(0);
      }
    });
  }, [channels]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localT = 0;

    const render = () => {
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const height = canvas.height;
      const chCount = channels.length;
      const rowHeight = height / chCount;

      if (isPlaying) {
        localT += 0.05 * speed;
        sweepXRef.current = (sweepXRef.current + 2 * speed) % width;
      }

      // Draw paper background
      ctx.fillStyle = '#F9F8F6';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid (aerospace paper instrument look)
      ctx.strokeStyle = '#EBE7E1';
      ctx.lineWidth = 1;
      const gridSize = 25;

      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Render each EEG channel trace
      channels.forEach((ch, chIdx) => {
        const centerY = chIdx * rowHeight + rowHeight / 2;

        // Channel zero-line
        ctx.strokeStyle = '#DAD7D1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Channel label HUD
        ctx.fillStyle = '#34465A';
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.fillText(ch, 12, centerY - rowHeight / 2 + 16);

        // Quality badge
        const qual = channelQualities.find((q) => q.channel === ch);
        const imp = qual ? `${qual.impedance_kOhm.toFixed(1)} kΩ` : '< 5 kΩ';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = qual?.status === 'marginal' ? '#A34A3E' : '#5F6670';
        ctx.fillText(imp, 48, centerY - rowHeight / 2 + 16);

        // Compute simulated EEG physiological signals
        // Alpha (10 Hz), Beta (20 Hz), Theta (6 Hz), with physiological amplitude modulation
        const phaseShift = chIdx * 0.45;
        const alpha = Math.sin(localT * 10 + phaseShift) * 16;
        const theta = Math.sin(localT * 5.2 + phaseShift) * 12;
        const beta = Math.sin(localT * 22 + phaseShift) * 6;
        const noise = notchFilter ? (Math.random() - 0.5) * 3 : (Math.random() - 0.5) * 18;

        const currentVal = (alpha + theta + beta + noise) * gain;

        // Update history buffer
        const hist = channelHistoriesRef.current[ch];
        if (hist) {
          const sampleIdx = Math.floor(sweepXRef.current);
          hist[sampleIdx] = currentVal;
        }

        // Draw trace
        ctx.strokeStyle = '#34465A';
        ctx.lineWidth = 1.6;
        ctx.beginPath();

        let started = false;
        const sweepX = sweepXRef.current;

        for (let x = 0; x < width; x++) {
          // Leave gap near current sweep cursor
          if (Math.abs(x - sweepX) < 14) continue;

          const val = hist ? (hist[x] ?? 0) : 0;
          const y = centerY + val;

          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Draw sweeping vertical line
      ctx.strokeStyle = '#A34A3E';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sweepXRef.current, 0);
      ctx.lineTo(sweepXRef.current, height);
      ctx.stroke();

      // Draw 50 uV calibration scale pulse in corner
      const calX = width - 70;
      const calY = height - 25;
      ctx.strokeStyle = '#34465A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(calX, calY);
      ctx.lineTo(calX + 10, calY);
      ctx.lineTo(calX + 10, calY - 20 * gain);
      ctx.lineTo(calX + 25, calY - 20 * gain);
      ctx.lineTo(calX + 25, calY);
      ctx.lineTo(calX + 35, calY);
      ctx.stroke();

      ctx.fillStyle = '#5F6670';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('50 µV', calX + 40, calY - 8);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, notchFilter, gain, speed, channels, channelQualities]);

  const handleReset = () => {
    channels.forEach((ch) => {
      channelHistoriesRef.current[ch] = new Array(800).fill(0);
    });
    sweepXRef.current = 0;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top telemetry status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-paper-dark px-3 py-2 border border-edge rounded-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <Activity className="w-4 h-4 text-slate-primary animate-pulse" />
            <span className="font-semibold text-ink">LIVE 6-CHANNEL MONTAGE</span>
          </div>
          {isSimulated && (
            <span className="bg-paper text-ink-secondary border border-edge px-1.5 py-0.5 rounded-sm font-mono text-[10px] uppercase">
              Simulated Telemetry
            </span>
          )}
          <span className="text-ink-secondary font-mono">Sampling: 250 Hz</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotchFilter(!notchFilter)}
            className={`px-2 py-1 border rounded-sm font-mono text-[11px] flex items-center gap-1 transition-colors ${
              notchFilter ? 'bg-slate-primary text-paper border-slate-pressed' : 'bg-paper text-ink border-edge'
            }`}
            title="Toggle 50/60Hz notch filter"
          >
            <Filter className="w-3 h-3" />
            <span>50Hz Notch: {notchFilter ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex items-center border border-edge rounded-sm bg-paper overflow-hidden text-[11px] font-mono">
            <button
              onClick={() => setGain(0.5)}
              className={`px-2 py-1 ${gain === 0.5 ? 'bg-slate-primary text-paper' : 'hover:bg-paper-dark'}`}
            >
              0.5x
            </button>
            <button
              onClick={() => setGain(1)}
              className={`px-2 py-1 border-x border-edge ${gain === 1 ? 'bg-slate-primary text-paper' : 'hover:bg-paper-dark'}`}
            >
              1.0x
            </button>
            <button
              onClick={() => setGain(2)}
              className={`px-2 py-1 ${gain === 2 ? 'bg-slate-primary text-paper' : 'hover:bg-paper-dark'}`}
            >
              2.0x
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={isPlaying ? 'secondary' : 'primary'}
              onClick={() => setIsPlaying(!isPlaying)}
              icon={isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            >
              {isPlaying ? 'Pause' : 'Resume'}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas container */}
      <div className="border border-edge rounded-sm overflow-hidden bg-paper shadow-tactile">
        <canvas
          ref={canvasRef}
          width={800}
          height={380}
          className="w-full h-auto block select-none"
        />
      </div>

      {/* Disclaimers & calibration footer */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-ink-secondary px-1">
        <span>Timebase: 25 mm/s | Amplitude: 10 mm = 50 µV</span>
        <span>Electrode Standard: International 10-20 System (Dry Gel Array)</span>
      </div>
    </div>
  );
};

