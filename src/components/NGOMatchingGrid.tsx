import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  Truck, 
  Zap, 
  Send, 
  ExternalLink, 
  CheckCircle, 
  ShieldCheck, 
  Star,
  Clock,
  Sparkles,
  PhoneCall,
  Flame
} from 'lucide-react';
import { NGOProfile, ExtractionResult, RescueMission } from '../types';
import { generateWhatsAppDispatchURL } from '../utils/ngoMatcher';
import { cyberSound } from '../utils/soundEffects';

interface NGOMatchingGridProps {
  ngos: NGOProfile[];
  currentContext: ExtractionResult | RescueMission;
  onDispatchTriggered: (ngo: NGOProfile) => void;
}

export const NGOMatchingGrid: React.FC<NGOMatchingGridProps> = ({
  ngos,
  currentContext,
  onDispatchTriggered
}) => {
  const [filter, setFilter] = useState<'all' | 'van' | 'pureveg'>('all');
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);

  const filteredNgos = ngos.filter(ngo => {
    if (filter === 'van') return ngo.transportReadiness.toLowerCase().includes('van');
    if (filter === 'pureveg') return !ngo.acceptsNonVeg;
    return true;
  });

  const handleWhatsAppDispatch = (ngo: NGOProfile) => {
    cyberSound.playSuccessChime();
    setDispatchedId(ngo.id);
    const url = generateWhatsAppDispatchURL(ngo, currentContext);
    window.open(url, '_blank', 'noopener,noreferrer');
    onDispatchTriggered(ngo);
    setTimeout(() => setDispatchedId(null), 3000);
  };

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 sm:p-6 border border-emerald-500/30 relative overflow-hidden shadow-cyber-card">
      {/* Background glow */}
      <div className="absolute top-0 left-1/3 w-96 h-48 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                3. Intelligent NGO Matching & Proximity Ranking
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                AI Logistics Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ranked dynamically by rapid distance, serving capacity buffer, and vehicle readiness
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => {
              setFilter('all');
              cyberSound.playClick();
            }}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Verified ({ngos.length})
          </button>
          <button
            onClick={() => {
              setFilter('van');
              cyberSound.playClick();
            }}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filter === 'van'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Van Fleet Ready
          </button>
          <button
            onClick={() => {
              setFilter('pureveg');
              cyberSound.playClick();
            }}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filter === 'pureveg'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pure Veg Only
          </button>
        </div>
      </div>

      {/* NGO Cards List */}
      <div className="mt-5 space-y-4">
        {filteredNgos.map((ngo, index) => {
          const isRank1 = index === 0;
          const isDispatched = dispatchedId === ngo.id;

          return (
            <div
              key={ngo.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all duration-300 relative ${
                isRank1
                  ? 'bg-gradient-to-r from-slate-900/95 via-emerald-950/20 to-slate-900/95 border-emerald-500/60 shadow-glow-emerald ring-1 ring-emerald-500/40'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              {/* Badge for Rank #1 */}
              {isRank1 && (
                <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[11px] font-extrabold font-mono tracking-wider flex items-center gap-1.5 shadow-md">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  #1 OPTIMAL AI MATCH — FASTEST DISPATCH
                </div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left NGO info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      RANK #{index + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      {ngo.name}
                      {ngo.verifiedBadge && (
                        <span title="Verified Night Response NGO">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      • {ngo.tagline}
                    </span>
                  </div>

                  {/* Badges bar */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{ngo.locality}</span>
                      <span className="text-slate-400 font-mono">({ngo.distanceKm} km • ~{ngo.etaMinutes} min ETA)</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-amber-300 font-mono">
                      <Users className="w-3.5 h-3.5" />
                      <span>Capacity: {ngo.servingCapacity} servings</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-cyan-300 font-mono">
                      <Truck className="w-3.5 h-3.5" />
                      <span>{ngo.transportReadiness}</span>
                    </div>
                  </div>

                  {/* AI Match Reason Rationale */}
                  <div className="text-xs font-sans text-slate-400 flex items-start gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-300 font-mono">Match Factor: </strong>
                      {ngo.matchReason}
                    </span>
                  </div>
                </div>

                {/* Right side: Score & Action Button */}
                <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                  {/* Match Score Badge */}
                  <div className="text-center sm:text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Match Fit
                    </div>
                    <div className="text-xl font-extrabold font-mono text-emerald-400 flex items-center justify-end gap-1">
                      {ngo.matchScore}%
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </div>
                  </div>

                  {/* PRIMARY ACTION BUTTON FOR #1 RANKED NGO */}
                  {isRank1 ? (
                    <button
                      type="button"
                      onClick={() => handleWhatsAppDispatch(ngo)}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm font-sans flex items-center gap-2 shadow-glow-emerald hover:shadow-lg transition-all active:scale-95 group"
                    >
                      <Zap className="w-4 h-4 fill-slate-950 animate-bounce" />
                      <span>⚡ Alert NGO (1-Click WhatsApp Dispatch)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleWhatsAppDispatch(ngo)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 font-medium text-xs font-mono flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Alert via WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Instant notification alert if clicked */}
              {isDispatched && (
                <div className="mt-3 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-xs font-mono text-emerald-300 flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp alert window opened with prefilled mission brief for {ngo.name}!</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Mission Marked Active</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
