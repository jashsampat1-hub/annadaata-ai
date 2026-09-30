import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Locate,
  LocateFixed,
  Route,
  Truck,
  ExternalLink,
  Clock,
  Building2,
  RefreshCw,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import {
  Coordinates,
  UserLocationState,
  NGODeliveryMetrics,
  LocationPreset,
  MUMBAI_LOCATION_PRESETS,
  NGO_VERIFIED_LOCATIONS,
  calculateNGODeliveryMetrics,
  acquireUserGeolocation
} from '../utils/googleMapsService';

interface NGO {
  id: string;
  name: string;
  tagline: string;
  locality: string;
  distanceKm: number;
  etaMinutes: number;
  servingCapacity: number;
  transportReadiness: string;
  phone: string;
  whatsappNumber: string;
  acceptsNonVeg: boolean;
  activeDriversCount: number;
  rating: number;
  matchScore: number;
  matchReason: string;
  verifiedBadge: boolean;
  address?: string;
  coordinates?: Coordinates;
}

interface GoogleMapDispatchRadarProps {
  userLocation: UserLocationState;
  onUpdateUserLocation: (updated: Partial<UserLocationState>) => void;
  ngos: NGO[];
  activeNgoId?: string;
  onSelectNgo?: (ngoId: string) => void;
  pickupGate?: string;
  onApplyLocationToDonorForm?: (address: string, venueName: string) => void;
}

export default function GoogleMapDispatchRadar({
  userLocation,
  onUpdateUserLocation,
  ngos,
  activeNgoId,
  onSelectNgo,
  pickupGate = 'Gate 3 - Kitchen Loading Bay',
  onApplyLocationToDonorForm
}: GoogleMapDispatchRadarProps) {
  // Selected NGO and mode state
  const [selectedNgoId, setSelectedNgoId] = useState<string>(activeNgoId || ngos[0]?.id || 'ngo-1');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showPresetsDropdown, setShowPresetsDropdown] = useState<boolean>(false);
  const [googleEmbedMode, setGoogleEmbedMode] = useState<'route' | 'depot'>('route');

  // Keep internal selected NGO synced with external prop
  useEffect(() => {
    if (activeNgoId && activeNgoId !== selectedNgoId) {
      setSelectedNgoId(activeNgoId);
    }
  }, [activeNgoId]);

  // Selected NGO object
  const selectedNgo = useMemo(() => {
    return ngos.find(n => n.id === selectedNgoId) || ngos[0];
  }, [ngos, selectedNgoId]);

  // Calculate live delivery metrics for all NGOs based on user location
  const allNgoMetrics = useMemo(() => {
    return ngos.map(ngo => {
      const metric = calculateNGODeliveryMetrics(ngo, userLocation);
      return {
        ...metric,
        drivingDistanceKm: ngo.distanceKm ?? metric.drivingDistanceKm,
        totalEtaMinutes: ngo.etaMinutes ?? metric.totalEtaMinutes
      };
    });
  }, [ngos, userLocation]);

  // Active delivery metric for selected NGO
  const activeMetric = useMemo(() => {
    if (!selectedNgo) return null;
    const metric = calculateNGODeliveryMetrics(selectedNgo, userLocation);
    return {
      ...metric,
      drivingDistanceKm: selectedNgo.distanceKm ?? metric.drivingDistanceKm,
      totalEtaMinutes: selectedNgo.etaMinutes ?? metric.totalEtaMinutes
    };
  }, [selectedNgo, userLocation]);

  // Resilient Geolocation Handler with Multi-Stage Fallback (GPS -> Wi-Fi -> IP Network -> Preset)
  const handleTrackCurrentGPSLocation = async () => {
    setIsLocating(true);
    setGpsError(null);

    try {
      const loc = await acquireUserGeolocation();
      setIsLocating(false);

      onUpdateUserLocation({
        coordinates: loc.coordinates,
        address: loc.address,
        locality: loc.locality,
        accuracyMeters: loc.accuracyMeters,
        speedKmh: 0,
        heading: null,
        isLiveGps: loc.source === 'gps-high-accuracy' || loc.source === 'wifi-network',
        trackingActive: true,
        lastUpdated: Date.now(),
        error: null
      });

      if (onApplyLocationToDonorForm) {
        onApplyLocationToDonorForm(loc.address, loc.locality);
      }
    } catch (err: any) {
      setIsLocating(false);
      setGpsError('Unable to detect physical GPS fix. Switching to closest Mumbai banquet hub.');
    }
  };

  // Apply a known preset location
  const handleSelectPreset = (preset: LocationPreset) => {
    onUpdateUserLocation({
      coordinates: preset.coordinates,
      address: preset.address,
      locality: preset.locality,
      accuracyMeters: 8,
      speedKmh: 0,
      isLiveGps: false,
      trackingActive: true,
      lastUpdated: Date.now(),
      error: null
    });

    if (onApplyLocationToDonorForm) {
      onApplyLocationToDonorForm(preset.address, preset.venueName);
    }
    setShowPresetsDropdown(false);
  };

  return (
    <div className="bg-[#11171d] rounded-xl border border-[#1e293b] p-5 sm:p-6 relative overflow-hidden shadow-cyber-card font-mono text-slate-200">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & TELEMETRY CONTROLS                       */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-[#0b0f12] border border-cyan-500/50 text-[11px] font-bold text-cyan-400 tracking-wider flex items-center gap-1.5 shadow-sm">
              <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
              GOOGLE MAPS RADAR
            </span>
            <span className="text-xs font-mono text-slate-400 uppercase">
              GPS SATELLITE DISPATCH & DISTANCE MATRIX
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Real-time tracking of donor coordinates and turn-by-turn dispatch calculations from registered NGO addresses.
          </p>
        </div>

        {/* Action Controls & GPS Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
              className="px-3 py-1.5 rounded-lg bg-[#0b0f12] hover:bg-[#151c24] border border-[#1e293b] text-xs font-mono text-slate-300 hover:text-cyan-300 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="max-w-[130px] truncate">{userLocation.locality || 'Presets'}</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {showPresetsDropdown && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-xl bg-[#0b0f12] border border-[#1e293b] shadow-2xl p-2 space-y-1 text-xs animate-fadeIn">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 border-b border-[#1e293b]">
                  SELECT MUMBAI BANQUET HUB:
                </div>
                {MUMBAI_LOCATION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full p-2 rounded-lg text-left hover:bg-[#151c24] hover:border-cyan-500/40 border border-transparent transition-all flex flex-col"
                  >
                    <span className="font-bold text-slate-200 text-xs">{preset.name}</span>
                    <span className="text-[10px] text-slate-400 truncate">{preset.address}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live GPS Locate Me Button */}
          <button
            type="button"
            onClick={handleTrackCurrentGPSLocation}
            disabled={isLocating}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-tactical active:scale-95 ${
              userLocation.isLiveGps
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow-emerald ring-1 ring-emerald-400'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
            }`}
          >
            {isLocating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>ACQUIRING GPS FIX...</span>
              </>
            ) : userLocation.isLiveGps ? (
              <>
                <LocateFixed className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                <span>GPS LIVE (±{userLocation.accuracyMeters || 12}m)</span>
              </>
            ) : (
              <>
                <Locate className="w-3.5 h-3.5 text-cyan-400" />
                <span>TRACK MY LIVE GPS</span>
              </>
            )}
          </button>

          {/* Open in Official Google Maps Button */}
          {activeMetric && (
            <a
              href={activeMetric.googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#0b0f12] hover:bg-[#1a232e] text-slate-300 hover:text-emerald-400 border border-[#1e293b] hover:border-emerald-500/40 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
              title="Launch Google Maps in new tab with directions"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>OPEN GOOGLE MAPS</span>
            </a>
          )}
        </div>
      </div>

      {/* GPS Error alert banner if any */}
      {gpsError && (
        <div className="my-3 p-3 rounded-lg bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button
            onClick={() => setGpsError(null)}
            className="text-slate-400 hover:text-slate-200 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. GOOGLE LIVE EMBED CONTROLS & ROUTE TELEMETRY BAR      */}
      {/* ======================================================== */}
      <div className="my-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Navigation Mode: Turn-by-Turn Route vs Depot Pin */}
        <div className="flex items-center gap-1.5 bg-[#0b0f12] p-1 rounded-lg border border-[#1e293b]">
          <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            GOOGLE MAPS LIVE:
          </span>
          <button
            type="button"
            onClick={() => setGoogleEmbedMode('route')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              googleEmbedMode === 'route'
                ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Turn-by-Turn Route
          </button>
          <button
            type="button"
            onClick={() => setGoogleEmbedMode('depot')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              googleEmbedMode === 'depot'
                ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            NGO Depot Pin
          </button>
        </div>

        {/* Live Route Telemetry Pill */}
        {activeMetric && (
          <div className="flex items-center gap-2 bg-[#0b0f12] px-3 py-1.5 rounded-lg border border-[#1e293b] text-[11px] font-mono">
            <span className="text-slate-400">ACTIVE TARGET:</span>
            <span className="font-bold text-purple-300">{selectedNgo?.name}</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-bold">{activeMetric.drivingDistanceKm} KM</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-bold">~{activeMetric.totalEtaMinutes} MIN ETA</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN MAP WORKSPACE: GOOGLE LIVE EMBED                 */}
      {/* ======================================================== */}
      <div className="relative rounded-xl border border-[#1e293b] overflow-hidden bg-[#070b0e] h-[460px] sm:h-[500px] shadow-inner select-none">
        {/* Real Google Maps Iframe Embed with Direction Coords */}
        <div className="w-full h-full relative">
            <iframe
              title="Google Map Live Directions"
              src={
                activeMetric
                  ? googleEmbedMode === 'route'
                    ? activeMetric.googleMapsEmbedUrl
                    : `https://maps.google.com/maps?q=${activeMetric.ngoCoordinates.lat},${activeMetric.ngoCoordinates.lng}&z=15&output=embed`
                  : `https://maps.google.com/maps?q=${userLocation.coordinates.lat},${userLocation.coordinates.lng}&z=14&output=embed`
              }
              className="w-full h-full border-0 filter contrast-105"
              loading="lazy"
              allowFullScreen
            />
            {/* Overlay Banner & Controls */}
            <div className="absolute top-3 left-3 right-3 sm:right-auto bg-[#11171d]/95 backdrop-blur-md p-2.5 rounded-lg border border-[#1e293b] text-xs font-mono flex flex-wrap items-center justify-between sm:justify-start gap-2 shadow-2xl z-30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-200 font-bold">Google Maps Live</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-1 bg-[#0b0f12] p-0.5 rounded border border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setGoogleEmbedMode('route')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    googleEmbedMode === 'route'
                      ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Turn-by-Turn Route
                </button>
                <button
                  type="button"
                  onClick={() => setGoogleEmbedMode('depot')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    googleEmbedMode === 'depot'
                      ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  NGO Depot Pin
                </button>
              </div>
              {activeMetric && (
                <div className="text-[10px] text-cyan-300 truncate max-w-[280px] sm:max-w-xs font-sans" title={activeMetric.ngoAddress}>
                  📍 {activeMetric.ngoAddress}
                </div>
              )}
            </div>

            {/* Bottom Left Quick Status Info */}
            <div className="absolute bottom-3 left-3 z-30 px-3 py-1.5 rounded-lg bg-[#0b0f12]/90 backdrop-blur-md border border-[#1e293b] text-[10px] font-mono flex items-center gap-2 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">
                TARGET: <strong className="text-purple-300">{selectedNgo?.name}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-400 font-bold">
                {activeMetric?.drivingDistanceKm} KM ROUTE
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">
                ~{activeMetric?.totalEtaMinutes} MIN ETA
              </span>
            </div>
          </div>
      </div>

      {/* ======================================================== */}
      {/* 4. REAL-TIME DISTANCE & DELIVERY TIME CALCULATOR PANEL   */}
      {/* ======================================================== */}
      {activeMetric && (
        <div className="mt-4 p-4 rounded-xl bg-[#0b0f12] border border-[#1e293b] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1e293b]">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                CALCULATED DISTANCE & DELIVERY TIME FROM NGO ADDRESS:
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="text-slate-400">CORRIDOR:</span>
              <span className="text-emerald-400 font-bold">{activeMetric.routeSummary}</span>
            </div>
          </div>

          {/* 4 Metric Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* NGO Physical Address */}
            <div className="p-3 rounded-lg bg-[#11171d] border border-[#1e293b] space-y-1">
              <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                <Building2 className="w-3 h-3 text-purple-400" />
                <span>NGO DEPOT ADDRESS</span>
              </div>
              <div className="text-xs font-bold text-slate-200 line-clamp-1">
                {activeMetric.ngoName}
              </div>
              <div className="text-[10px] text-slate-400 line-clamp-2">
                {activeMetric.ngoAddress}
              </div>
            </div>

            {/* Calculated Driving Distance */}
            <div className="p-3 rounded-lg bg-[#11171d] border border-[#1e293b] space-y-1">
              <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                <Navigation className="w-3 h-3 text-cyan-400" />
                <span>DRIVING DISTANCE</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-cyan-300">
                  {activeMetric.drivingDistanceKm}
                </span>
                <span className="text-xs text-slate-400">KM</span>
              </div>
              <div className="text-[10px] text-slate-400">
                (Straight-line: {activeMetric.straightDistanceKm} km)
              </div>
            </div>

            {/* Calculated Delivery ETA */}
            <div className="p-3 rounded-lg bg-[#11171d] border border-[#1e293b] space-y-1">
              <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-400" />
                <span>ESTIMATED DELIVERY TIME</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-purple-300">
                  ~{activeMetric.totalEtaMinutes}
                </span>
                <span className="text-xs text-slate-400">MINS</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Direct driving transit time (Google Maps)
              </div>
            </div>

            {/* Traffic & Vehicle Readiness */}
            <div className="p-3 rounded-lg bg-[#11171d] border border-[#1e293b] space-y-1">
              <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-400" />
                <span>TRAFFIC & FLEET</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  activeMetric.trafficStatus === 'Clear' ? 'bg-emerald-400' : activeMetric.trafficStatus === 'Heavy' ? 'bg-rose-400' : 'bg-amber-400'
                }`} />
                <span className="text-xs font-bold text-slate-200">
                  {activeMetric.trafficStatus} Flow
                </span>
              </div>
              <div className="text-[10px] text-emerald-400 truncate">
                {selectedNgo.transportReadiness}
              </div>
            </div>
          </div>

          {/* Turn-by-turn Navigation Micro-Guide */}
          <div className="p-2.5 rounded-lg bg-[#151c24] border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2 text-slate-300 font-sans">
              <span className="font-mono text-purple-400 font-bold text-[10px]">ROUTE DISPATCH:</span>
              <span className="truncate">
                {activeMetric.ngoName} Depot → {activeMetric.routeSummary} → Reach {pickupGate} at {userLocation.address}
              </span>
            </div>

            <a
              href={activeMetric.googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-[11px] flex items-center justify-center gap-1 shrink-0 transition-all shadow-tactical active:scale-95"
            >
              <span>START GOOGLE MAPS NAVIGATION</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. ALL REGISTERED NGOS DISTANCE MATRIX LIST              */}
      {/* ======================================================== */}
      <div className="mt-4 space-y-2">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>FLEET DISTANCE & ETA MATRIX FROM YOUR LOCATION:</span>
          <span className="text-cyan-400">{allNgoMetrics.length} FLEETS ENROLLED</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {allNgoMetrics.map((metric) => {
            const isSelected = metric.ngoId === selectedNgoId;
            const originalNgo = ngos.find(n => n.id === metric.ngoId);

            return (
              <button
                key={metric.ngoId}
                type="button"
                onClick={() => {
                  setSelectedNgoId(metric.ngoId);
                  if (onSelectNgo) onSelectNgo(metric.ngoId);
                }}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#151c24] border-purple-500/70 shadow-glow-purple ring-1 ring-purple-500/40'
                    : 'bg-[#0b0f12] border-[#1e293b] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-200 truncate font-mono">
                      {metric.ngoName}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                      ~{metric.totalEtaMinutes} MIN
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mb-1">
                    📍 {metric.ngoAddress}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-400 font-bold">
                    {metric.drivingDistanceKm} KM DISTANCE
                  </span>
                  <span className="text-slate-400 group-hover:text-purple-300">
                    {isSelected ? '✓ ACTIVE ROUTE' : 'SELECT TARGET'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
