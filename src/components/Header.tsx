import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  ShieldAlert, 
  Clock, 
  Users, 
  Volume2, 
  VolumeX, 
  Radio, 
  Sparkles, 
  Activity,
  HeartHandshake
} from 'lucide-react';
import { TelemetryStats } from '../types';
import { cyberSound } from '../utils/soundEffects';

interface HeaderProps {
  stats: TelemetryStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTriggerQuickDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  soundEnabled,
  onToggleSound,
  onTriggerQuickDemo
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-950/40 bg-[#030712]/90 backdrop-blur-xl transition-all duration-300">
      {/* Top micro-bar for network status */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-amber-950/40 px-4 py-1 text-[11px] font-mono border-b border-emerald-900/30 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-medium">LIVE PROTOCOL:</span>
          <span>MUMBAI & SUBURBAN SHELTER DISPATCH GRID ACTIVE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 hidden sm:inline">TIME REMAINING CLUSTER: <span className="text-amber-400">NORMAL-OPTIMIZED</span></span>
          <span className="text-emerald-400 font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            {timeStr || '11:48:00 AM'} IST
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-40 group-hover:opacity-80 transition duration-300 animate-pulse-slow"></div>
            <div className="relative p-2.5 bg-slate-900/90 border border-emerald-500/40 rounded-xl shadow-glow-emerald flex items-center justify-center">
              <Flame className="w-6 h-6 text-emerald-400 animate-bounce" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent font-sans">
                Annadaata AI
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v2.4 Live Grid
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span>Midnight Food Rescue Network</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400/90 flex items-center gap-1">
                <HeartHandshake className="w-3 h-3" /> Zero Wastage Protocol
              </span>
            </p>
          </div>
        </div>

        {/* Live Telemetry Stats Bar */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-4">
          {/* Active Rescues */}
          <div className="glass-panel px-3.5 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-2.5 shadow-sm">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Active Rescues</div>
              <div className="text-base font-bold font-mono text-emerald-400 flex items-center gap-1">
                {stats.activeRescues}
                <span className="text-[10px] font-normal text-slate-400">missions</span>
              </div>
            </div>
          </div>

          {/* Servings Saved */}
          <div className="glass-panel px-3.5 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-2.5 shadow-sm">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Servings Saved</div>
              <div className="text-base font-bold font-mono text-amber-300">
                {stats.servingsSaved.toLocaleString()}
                <span className="text-[10px] font-normal text-slate-400 ml-1">meals</span>
              </div>
            </div>
          </div>

          {/* Average Dispatch Time */}
          <div className="glass-panel px-3.5 py-1.5 rounded-lg border border-cyan-500/20 flex items-center gap-2.5 shadow-sm hidden sm:flex">
            <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Avg Dispatch</div>
              <div className="text-base font-bold font-mono text-cyan-300">
                {stats.averageDispatchMins}
                <span className="text-[10px] font-normal text-slate-400 ml-1">mins</span>
              </div>
            </div>
          </div>

          {/* Action buttons: Sound & Simulation */}
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <button
              onClick={() => {
                onToggleSound();
                cyberSound.playClick();
              }}
              title={soundEnabled ? 'Mute Cyber Audio' : 'Enable Cyber Audio'}
              className={`p-2 rounded-lg border transition-all ${
                soundEnabled 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40 shadow-glow-emerald' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                cyberSound.playRadarPing();
                onTriggerQuickDemo();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium transition-all shadow-sm group active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span>Simulate</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
