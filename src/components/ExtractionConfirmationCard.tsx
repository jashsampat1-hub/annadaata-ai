import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Users, 
  UtensilsCrossed, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  ArrowRight, 
  Truck,
  Phone,
  Flame,
  Info
} from 'lucide-react';
import { ExtractionResult } from '../types';
import { cyberSound } from '../utils/soundEffects';

interface ExtractionConfirmationCardProps {
  extraction: ExtractionResult;
  onConfirmAndBroadcast: () => void;
  isBroadcasting: boolean;
}

export const ExtractionConfirmationCard: React.FC<ExtractionConfirmationCardProps> = ({
  extraction,
  onConfirmAndBroadcast,
  isBroadcasting
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  // Live ticking countdown timer
  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const diff = Math.max(0, extraction.safeUntilTimestamp - now);
      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds, totalSeconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [extraction.safeUntilTimestamp]);

  // Determine urgency tier based on remaining minutes
  const totalMinutes = Math.floor(timeLeft.totalSeconds / 60);
  const isCritical = totalMinutes < 45;
  const isAmber = totalMinutes >= 45 && totalMinutes < 120;
  const isSafe = totalMinutes >= 120;

  const getDietBadgeColor = (diet: string) => {
    switch (diet) {
      case 'Veg':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-glow-emerald';
      case 'Non-Veg':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-glow-rose';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-glow-amber';
    }
  };

  const handleConfirm = () => {
    cyberSound.playSuccessChime();
    onConfirmAndBroadcast();
  };

  return (
    <div className="glass-panel-elevated rounded-2xl p-5 sm:p-6 border border-emerald-500/40 relative overflow-hidden shadow-cyber-card transition-all">
      {/* Top glowing gradient border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

      {/* Header with confidence telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                2. AI Extraction & Donor Confirmation Card
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {extraction.confidenceScore}% AI Confidence
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Verified food safety metrics extracted automatically from natural language prompt
            </p>
          </div>
        </div>

        {/* Live Spoilage Countdown Timer */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono ${
          isCritical 
            ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 animate-flash-critical shadow-glow-rose'
            : isAmber 
            ? 'bg-amber-950/50 border-amber-500/50 text-amber-300 shadow-glow-amber'
            : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-glow-emerald'
        }`}>
          <Clock className={`w-4 h-4 ${isCritical ? 'text-rose-400 animate-spin' : isAmber ? 'text-amber-400' : 'text-emerald-400'}`} />
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-sans">
              Safe Before Spoilage
            </div>
            <div className="text-sm font-bold tracking-wider">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              <span className="text-[10px] ml-1 font-normal opacity-80">
                ({isCritical ? 'CRITICAL' : isAmber ? 'URGENT' : 'OPTIMAL'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Extracted Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        {/* Metric 1: Food & Diet Category */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
                Food & Diet
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDietBadgeColor(extraction.dietCategory)}`}>
                {extraction.dietCategory === 'Veg' ? '🟢 PURE VEG' : extraction.dietCategory === 'Non-Veg' ? '🔴 NON-VEG' : '🟡 MIXED'}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-100 line-clamp-2">
              {extraction.foodType}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-0.5">
            {extraction.items.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metric 2: Estimated Servings Count */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Serving Capacity
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Calculated
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-amber-300">
                {extraction.estimatedServings}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Portions
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="text-slate-300 font-medium">Conversion: </span>
            <span>{extraction.containerBreakdown}</span>
          </div>
        </div>

        {/* Metric 3: Pickup Location & Gate Details */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Pickup Location
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Geo-Locked
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-100 line-clamp-2">
              {extraction.pickupLocation}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-emerald-300 font-mono font-medium truncate flex items-center gap-1">
            <span>📍 {extraction.pickupGate}</span>
          </div>
        </div>

        {/* Metric 4: Safe-Until Time & Contact */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Contact & Window
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                On-Site
              </span>
            </div>
            <div className="text-xs font-bold text-slate-100">
              {extraction.contactPerson}
            </div>
            <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
              {extraction.contactPhone}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="truncate">{extraction.safeUntilTime}</span>
          </div>
        </div>
      </div>

      {/* Driver Packaging Recommendation Alert Box */}
      <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 mb-5 flex items-start gap-3">
        <Truck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="font-semibold text-emerald-300 font-mono mb-0.5">
            LOGISTICAL READINESS INSTRUCTIONS:
          </div>
          <p className="text-slate-300 font-sans leading-relaxed">
            {extraction.driverInstructions}
          </p>
        </div>
      </div>

      {/* Clean Primary Confirmation Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Clicking will broadcast this emergency rescue to verified local night response NGOs</span>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isBroadcasting}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm font-sans flex items-center justify-center gap-2.5 shadow-glow-emerald transition-all active:scale-95 group"
        >
          {isBroadcasting ? (
            <>
              <Radio className="w-4 h-4 text-slate-950 animate-spin" />
              <span>Broadcasting to Nearest Shelters...</span>
            </>
          ) : (
            <>
              <Radio className="w-4 h-4 text-slate-950 group-hover:animate-pulse" />
              <span>Confirm & Broadcast to Nearest Shelters</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
