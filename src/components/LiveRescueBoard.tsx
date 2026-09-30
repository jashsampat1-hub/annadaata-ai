import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Truck, 
  AlertOctagon, 
  AlertTriangle, 
  ChevronRight, 
  Share2, 
  Copy, 
  Check, 
  ArrowUpRight,
  Shield,
  Phone,
  Flame,
  FileText
} from 'lucide-react';
import { RescueMission, MissionStatus } from '../types';
import { cyberSound } from '../utils/soundEffects';

interface LiveRescueBoardProps {
  missions: RescueMission[];
  onClaimMission: (missionId: string) => void;
  onAdvanceStatus: (missionId: string) => void;
  onSelectMissionForDispatch?: (mission: RescueMission) => void;
}

export const LiveRescueBoard: React.FC<LiveRescueBoardProps> = ({
  missions,
  onClaimMission,
  onAdvanceStatus,
  onSelectMissionForDispatch
}) => {
  const [filter, setFilter] = useState<'ALL' | 'URGENT' | 'AVAILABLE' | 'CLAIMED' | 'PICKED_UP'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Global tick for live countdowns across all cards
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyInstructions = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    cyberSound.playClick();
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredMissions = missions.filter(m => {
    const diff = m.safeUntilTimestamp - now;
    const minutesLeft = Math.floor(diff / 60000);

    if (filter === 'URGENT') return minutesLeft > 0 && minutesLeft < 45 && m.status !== 'Picked Up';
    if (filter === 'AVAILABLE') return m.status === 'Available';
    if (filter === 'CLAIMED') return m.status === 'Claimed';
    if (filter === 'PICKED_UP') return m.status === 'Picked Up';
    return true;
  });

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 sm:p-6 border border-emerald-500/30 relative overflow-hidden shadow-cyber-card">
      {/* Background glow accent */}
      <div className="absolute top-0 right-1/4 w-96 h-48 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                4. Live Rescue Mission Board & Status Lifecycle
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {missions.length} Active Missions
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time ticking food safety timers, live mission state changes, and automated driver dispatch briefs
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center flex-wrap gap-1.5 p-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
          {(['ALL', 'URGENT', 'AVAILABLE', 'CLAIMED', 'PICKED_UP'] as const).map(tab => {
            const labelMap = {
              ALL: `All (${missions.length})`,
              URGENT: '🚨 Urgent (<45m)',
              AVAILABLE: 'Available',
              CLAIMED: 'In-Transit',
              PICKED_UP: 'Rescued'
            };
            return (
              <button
                key={tab}
                onClick={() => {
                  setFilter(tab);
                  cyberSound.playClick();
                }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filter === tab
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {labelMap[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Missions Grid */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredMissions.map((mission) => {
          // Calculate countdown
          const diff = Math.max(0, mission.safeUntilTimestamp - now);
          const totalSeconds = Math.floor(diff / 1000);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          const totalMinutes = Math.floor(totalSeconds / 60);

          const isExpired = totalSeconds <= 0 && mission.status !== 'Picked Up';
          const isCritical = totalMinutes < 45 && !isExpired && mission.status !== 'Picked Up';
          const isAmber = totalMinutes >= 45 && totalMinutes < 120 && !isExpired && mission.status !== 'Picked Up';

          // Countdown color scheme
          let timerBoxClasses = 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300';
          if (isExpired) {
            timerBoxClasses = 'bg-slate-900 border-slate-700 text-slate-500';
          } else if (isCritical) {
            timerBoxClasses = 'bg-rose-950/80 border-rose-500 text-rose-300 animate-flash-critical shadow-glow-rose';
          } else if (isAmber) {
            timerBoxClasses = 'bg-amber-950/60 border-amber-500/60 text-amber-300 shadow-glow-amber';
          }

          // Status badge
          const statusBadge = () => {
            if (isExpired) {
              return (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  Expired
                </span>
              );
            }
            switch (mission.status) {
              case 'Available':
                return (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 shadow-glow-emerald">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Available
                  </span>
                );
              case 'Claimed':
                return (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/40 shadow-glow-amber">
                    <Truck className="w-3.5 h-3.5 animate-pulse" />
                    Claimed / In-Transit
                  </span>
                );
              case 'Picked Up':
                return (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 shadow-glow-cyan">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Picked Up & Saved
                  </span>
                );
              default:
                return null;
            }
          };

          return (
            <div
              key={mission.id}
              className={`rounded-xl p-5 border transition-all duration-300 flex flex-col justify-between relative ${
                isCritical
                  ? 'bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 border-rose-500/60 shadow-glow-rose ring-1 ring-rose-500/30'
                  : mission.status === 'Claimed'
                  ? 'bg-gradient-to-br from-slate-900 via-amber-950/15 to-slate-900 border-amber-500/40 shadow-glow-amber'
                  : mission.status === 'Picked Up'
                  ? 'bg-slate-900/60 border-cyan-500/30 opacity-90'
                  : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div>
                {/* Top Bar inside Card */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {mission.id}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {mission.createdAt}
                    </span>
                  </div>
                  <div>{statusBadge()}</div>
                </div>

                {/* Venue Title & Diet Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300">
                    {mission.venueName}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                    mission.dietCategory === 'Veg'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : mission.dietCategory === 'Non-Veg'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {mission.dietCategory === 'Veg' ? '🟢 VEG' : mission.dietCategory === 'Non-Veg' ? '🔴 NON-VEG' : '🟡 MIXED'}
                  </span>
                </div>

                {/* Location & Gate */}
                <div className="space-y-1 text-xs text-slate-300 mb-3 font-sans">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{mission.location}</span>
                  </div>
                  <div className="text-emerald-400 font-mono text-[11px] font-medium pl-5">
                    🚪 {mission.gate}
                  </div>
                </div>

                {/* Food items & Servings */}
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Rescuable Food</div>
                    <div className="text-xs font-semibold text-slate-200 truncate max-w-[220px]">
                      {mission.foodItems.join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Servings</div>
                    <div className="text-base font-extrabold font-mono text-amber-300">
                      {mission.servings}
                    </div>
                  </div>
                </div>

                {/* Real-time Ticking Spoilage Countdown Timer */}
                <div className={`p-3 rounded-xl border flex items-center justify-between mb-4 font-mono ${timerBoxClasses}`}>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${isCritical ? 'animate-spin text-rose-400' : 'text-amber-400'}`} />
                    <span className="text-xs uppercase font-sans tracking-wide">
                      {isExpired ? 'Food Safety Expired' : 'Safe-Until Countdown:'}
                    </span>
                  </div>
                  <div className="text-sm font-extrabold tracking-wider">
                    {isExpired ? (
                      <span className="text-rose-400">00:00:00 EXPIRED</span>
                    ) : (
                      <>
                        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        <span className="text-[10px] font-normal ml-1">
                          {isCritical ? '(FLASH RED)' : isAmber ? '(AMBER)' : '(SAFE)'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* DEDICATED AI-WRITTEN PICKUP MESSAGE BOX ON CLAIMED CARDS */}
                {mission.status === 'Claimed' && (
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 mb-4 relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>AI-WRITTEN PICKUP & DRIVER INSTRUCTIONS</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyInstructions(mission.id, mission.driverInstructions)}
                        className="text-[11px] font-mono text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                        title="Copy Driver Instructions"
                      >
                        {copiedId === mission.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Brief</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      {mission.driverInstructions}
                    </p>

                    {mission.claimedByNGO && (
                      <div className="mt-2 pt-2 border-t border-amber-900/40 text-[11px] font-mono text-amber-200/90 flex flex-wrap items-center justify-between gap-1">
                        <span>🚑 Dispatched: {mission.claimedByNGO.name}</span>
                        <span className="text-emerald-400">ETA: ~{mission.claimedByNGO.etaMinutes} mins ({mission.claimedByNGO.driverName})</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Workflow Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{mission.contactName}: {mission.contactPhone}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* If Available: Claim Mission */}
                  {mission.status === 'Available' && (
                    <button
                      type="button"
                      onClick={() => {
                        cyberSound.playClick();
                        onClaimMission(mission.id);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-glow-emerald flex items-center gap-1.5 active:scale-95"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Claim / Accept Mission</span>
                    </button>
                  )}

                  {/* If Claimed: Advance Status (Claimed -> Picked Up) */}
                  {mission.status === 'Claimed' && (
                    <button
                      type="button"
                      onClick={() => {
                        cyberSound.playSuccessChime();
                        onAdvanceStatus(mission.id);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-glow-cyan flex items-center gap-1.5 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Advance Status (Claimed → Picked Up)</span>
                    </button>
                  )}

                  {/* If Picked Up: Completed Badge */}
                  {mission.status === 'Picked Up' && (
                    <div className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Rescued & Dispatched</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
