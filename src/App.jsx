import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  HeartHandshake,
  Mic, 
  MicOff, 
  Trash2, 
  Wand2, 
  ArrowRight, 
  CheckCircle2, 
  UtensilsCrossed, 
  MapPin, 
  Phone, 
  Truck, 
  Building2, 
  Zap, 
  Send, 
  ShieldCheck, 
  Star, 
  Copy, 
  Check, 
  X, 
  AlertTriangle, 
  BarChart3, 
  Compass, 
  Layers, 
  ChevronRight,
  Terminal,
  FileText,
  Plus,
  PlusCircle,
  Briefcase,
  Navigation,
  Locate,
  LocateFixed,
  Route,
  ExternalLink,
  Car
} from 'lucide-react';
import confetti from 'canvas-confetti';
import GoogleMapDispatchRadar from './components/GoogleMapDispatchRadar';
import {
  calculateNGODeliveryMetrics,
  calculateDrivingDistanceKm,
  calculateDeliveryTimeMinutes,
  getGoogleMapsDirectionsUrl,
  MUMBAI_LOCATION_PRESETS,
  NGO_VERIFIED_LOCATIONS,
  registerNgoLocation,
  reverseGeocodeCoordinates,
  calculateMetricsFromAddress,
  acquireUserGeolocation,
  geocodeAddressToCoordinates,
  fetchLiveRouteDistance,
  ROUTE_DISTANCE_CACHE,
  clearRouteCacheForDestination
} from './utils/googleMapsService';
import { cyberSound } from './utils/soundEffects';
import { parseDonorMessage } from './utils/aiParser';
import { rankNGOsForMission, generateWhatsAppDispatchURL } from './utils/ngoMatcher';
import {
  INITIAL_STATS,
  PRESET_SCENARIOS,
  INITIAL_NGOS,
  getInitialRescueMissions
} from './data/mockData';



function triggerRescueConfetti() {
  const count = 180;
  const defaults = { origin: { y: 0.7 } };
  function fire(particleRatio, opts) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
  }
  fire(0.25, { spread: 26, startVelocity: 55, colors: ['#10b981', '#34d399', '#a855f7'] });
  fire(0.2, { spread: 60, colors: ['#f59e0b', '#fbbf24', '#c084fc'] });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#06b6d4', '#10b981'] });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, colors: ['#ffffff', '#a855f7'] });
}



// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState('rescue');

  // Donor / User Organisation state
  const [donorOrg, setDonorOrg] = useState('Grand Royal Banquets & Hospitality');

  // Input & NLP State
  const [inputText, setInputText] = useState(
    '4 handi chicken biryani aur dal bacha hai at Grand Banquet Kandivali, 150-180 people, gate 3, safe till 1:30 AM. Call Chef Ramesh 9820198201'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Speech-to-text with Pause Persistence
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micStatusMsg, setMicStatusMsg] = useState('');
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const baseTextRef = useRef('');
  const currentTextRef = useRef(inputText);

  useEffect(() => {
    currentTextRef.current = inputText;
  }, [inputText]);

  // Extraction State
  const [currentExtraction, setCurrentExtraction] = useState(() =>
    parseDonorMessage(inputText, donorOrg)
  );

  // Registered NGOs State (Dynamic - allows adding more NGOs)
  const [ngos, setNgos] = useState(INITIAL_NGOS);

  // Modal State for adding new NGO
  const [isAddNGOModalOpen, setIsAddNGOModalOpen] = useState(false);
  const [newNGOForm, setNewNGOForm] = useState({
    name: '',
    address: '',
    locality: '',
    tagline: 'Rapid Community Kitchen Fleet',
    servingCapacity: '450',
    transportReadiness: 'Insulated Electric Van Ready',
    phone: '+91 98200 88776',
    whatsappNumber: '919820088776',
    acceptsNonVeg: true
  });

  // Live Auto-Calculation Preview for New NGO Address
  const [ngoAddressPreview, setNgoAddressPreview] = useState(null);
  const [isCalculatingNgoDistance, setIsCalculatingNgoDistance] = useState(false);

  // Live Missions State (Pre-seeded with 3 realistic active missions)
  const [missions, setMissions] = useState(() => getInitialRescueMissions());
  const [stats, setStats] = useState(INITIAL_STATS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Global second-by-second ticker
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Sync sound manager
  useEffect(() => {
    cyberSound.enabled = soundEnabled;
  }, [soundEnabled]);

  // User Location State (tracks current GPS location of donor/user)
  const [userLocation, setUserLocation] = useState({
    coordinates: { lat: 19.2065, lng: 72.8358 }, // Initial: Grand Banquet, Kandivali West
    address: 'Grand Banquet, MG Road, Near Link Road, Kandivali West, Mumbai, Maharashtra 400067',
    locality: 'Kandivali West',
    accuracyMeters: 12,
    speedKmh: 0,
    isLiveGps: false,
    trackingActive: false,
    lastUpdated: Date.now(),
    error: null
  });

  const [activeMapNgoId, setActiveMapNgoId] = useState('ngo-1');

  // Automatically start geolocation on mount if available with resilient fallback
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const loc = await acquireUserGeolocation();
        if (!isMounted) return;
        setUserLocation(prev => ({
          ...prev,
          coordinates: loc.coordinates,
          address: loc.address,
          locality: loc.locality,
          accuracyMeters: loc.accuracyMeters,
          isLiveGps: loc.source === 'gps-high-accuracy' || loc.source === 'wifi-network',
          trackingActive: true,
          lastUpdated: Date.now(),
          error: null
        }));
      } catch (e) {
        // Fallback silently to default Mumbai location without throwing errors
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Version counter that increments each time live OSRM route data lands in the cache,
  // forcing ngosWithLiveMetrics to recompute with accurate distances instead of estimates.
  const [routeDataVersion, setRouteDataVersion] = useState(0);

  // Fetch real road distances from OSRM for every registered NGO whenever the
  // user/donor location changes (e.g. GPS lock, preset switch, new NGO added).
  // Results are written to ROUTE_DISTANCE_CACHE which calculateNGODeliveryMetrics reads.
  useEffect(() => {
    let cancelled = false;
    const userCoords = userLocation.coordinates;

    const fetchAll = async () => {
      // Evict stale cache entries from a previous pickup location before fetching new routes
      clearRouteCacheForDestination(userCoords);

      // Resolve NGO coordinates from their stored address / verified locations
      const ngoCoordsList = ngos.map(ngo => {
        const verified = NGO_VERIFIED_LOCATIONS[ngo.id];
        return {
          id: ngo.id,
          coords: ngo.coordinates || verified?.coordinates || null
        };
      }).filter(n => n.coords !== null);

      let anyUpdated = false;
      await Promise.all(
        ngoCoordsList.map(async ({ id, coords }) => {
          // Skip if already cached for this exact origin→destination pair
          const cacheKey = `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}->${userCoords.lat.toFixed(4)},${userCoords.lng.toFixed(4)}`;
          if (ROUTE_DISTANCE_CACHE.has(cacheKey)) return;

          const result = await fetchLiveRouteDistance(coords, userCoords);
          if (result && !cancelled) {
            anyUpdated = true;
          }
        })
      );

      // Bump version to trigger ngosWithLiveMetrics recompute with fresh cache data
      if (anyUpdated && !cancelled) {
        setRouteDataVersion(v => v + 1);
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [ngos, userLocation]);

  // Dynamically calculate driving distance and delivery ETA from each NGO's address to userLocation.
  // routeDataVersion is intentionally included: it bumps when live OSRM data lands in the cache,
  // causing this memo to recompute with accurate road distances instead of Haversine estimates.
  const ngosWithLiveMetrics = useMemo(() => {
    void routeDataVersion; // Declare dependency — cache is already populated by the effect above
    return ngos.map(ngo => {
      const metric = calculateNGODeliveryMetrics(ngo, userLocation);
      return {
        ...ngo,
        distanceKm: metric.drivingDistanceKm,
        etaMinutes: metric.totalEtaMinutes,
        address: metric.ngoAddress,
        coordinates: metric.ngoCoordinates,
        routeSummary: metric.routeSummary,
        trafficStatus: metric.trafficStatus,
        googleMapsDirectionsUrl: metric.googleMapsDirectionsUrl
      };
    });
  }, [ngos, userLocation, routeDataVersion]);

  // Dynamically ranked NGOs using current calculated metrics
  const rankedNgos = useMemo(() => {
    return rankNGOsForMission(currentExtraction, ngosWithLiveMetrics);
  }, [currentExtraction, ngosWithLiveMetrics]);

  // Live address-to-distance auto-calculation for registering new NGOs
  useEffect(() => {
    if (!isAddNGOModalOpen) return;
    const query = (newNGOForm.address || newNGOForm.locality || '').trim();
    if (!query || query.length < 3) {
      setNgoAddressPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCalculatingNgoDistance(true);
      try {
        const metrics = await calculateMetricsFromAddress(query, userLocation);
        setNgoAddressPreview(metrics);
        if (!newNGOForm.locality.trim()) {
          setNewNGOForm(prev => ({ ...prev, locality: metrics.locality }));
        }
      } catch (err) {
        console.error('Error calculating distance from NGO address:', err);
      } finally {
        setIsCalculatingNgoDistance(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [newNGOForm.address, newNGOForm.locality, isAddNGOModalOpen, userLocation]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setMicStatusMsg('LIVE LISTENING... Speak unorganized Hinglish/English');
      };

      recognition.onresult = (event) => {
        let sessionFinal = '';
        let sessionInterim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item && item[0]) {
            const transcript = item[0].transcript;
            if (item.isFinal) sessionFinal += transcript + ' ';
            else sessionInterim += transcript;
          }
        }

        const base = baseTextRef.current ? baseTextRef.current.trim() : '';
        const speechPart = (sessionFinal + sessionInterim).trim();
        const combined = base && speechPart ? `${base} ${speechPart}` : (base || speechPart);

        if (combined) {
          setInputText(combined);
          currentTextRef.current = combined;
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setMicStatusMsg('MIC PERMISSION DENIED');
          isListeningRef.current = false;
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          setMicStatusMsg('MIC ON // PAUSE DETECTED (KEEP TALKING)');
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          baseTextRef.current = currentTextRef.current;
          try {
            recognition.start();
            setMicStatusMsg('LISTENING RESUMED // APPENDING WORDS');
          } catch (e) {
            setIsListening(false);
            isListeningRef.current = false;
          }
        } else {
          setIsListening(false);
          setMicStatusMsg('');
        }
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleListening = () => {
    cyberSound.playClick();
    if (!speechSupported) {
      setMicStatusMsg('SIMULATING AUDIO DICTATION...');
      setIsListening(true);
      isListeningRef.current = true;
      const sample = '3 handi mutton biryani aur 2 handi dal bacha hai at Sun-n-Sand Juhu, around 160 people, Gate 4 kitchen alley, safe till 2:00 AM, call Chef Irfan 9820011223';
      const existing = currentTextRef.current.trim();
      const prefix = existing ? existing + ' ' : '';
      let charIdx = 0;
      const t = setInterval(() => {
        charIdx += 4;
        const next = prefix + sample.slice(0, charIdx);
        setInputText(next);
        currentTextRef.current = next;
        if (charIdx >= sample.length) {
          clearInterval(t);
          setIsListening(false);
          isListeningRef.current = false;
          setMicStatusMsg('VOICE CAPTURED // READY TO EXTRACT');
          cyberSound.playRadarPing();
        }
      }, 45);
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      setIsListening(false);
      setMicStatusMsg('');
    } else {
      baseTextRef.current = currentTextRef.current.trim();
      isListeningRef.current = true;
      try {
        recognitionRef.current?.start();
        setMicStatusMsg('MIC ARMED // SPEAK FREELY');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const showToast = (type, title, message) => {
    setToast({ id: String(Date.now()), type, title, message });
    setTimeout(() => {
      setToast(prev => (prev?.title === title ? null : prev));
    }, 4500);
  };

  const handleParse = async (text, explicitOrg = donorOrg) => {
    setIsAnalyzing(true);
    cyberSound.playClick();

    // Brief processing animation
    await new Promise(r => setTimeout(r, 260));

    const result = parseDonorMessage(text, explicitOrg);
    setCurrentExtraction(result);

    // Synchronize extracted donor/host organization so UI input and cards update dynamically
    if (result.donorOrg && result.donorOrg !== 'Private Donor Entity') {
      setDonorOrg(result.donorOrg);
    }

    // Geocode the extracted donor pickup location to synchronize Google Maps radar and NGO distances
    if (result.pickupLocation) {
      try {
        const geocoded = await geocodeAddressToCoordinates(result.pickupLocation);
        if (geocoded?.coordinates) {
          setUserLocation(prev => ({
            ...prev,
            coordinates: geocoded.coordinates,
            address: geocoded.formattedAddress || result.pickupLocation,
            locality: geocoded.locality,
            isLiveGps: false,
            lastUpdated: Date.now()
          }));
        }
      } catch (err) {
        console.warn('Could not geocode extracted donor location:', err);
      }
    }

    setIsAnalyzing(false);
    cyberSound.playRadarPing();
    showToast('success', 'AI EXTRACTION COMPLETED', `${result.estimatedServings} PAX • ${result.foodType}`);
  };

  const handleApplyPreset = (preset) => {
    cyberSound.playClick();
    if (preset.donorOrg) {
      setDonorOrg(preset.donorOrg);
    }
    if (preset.location) {
      setUserLocation(prev => ({
        ...prev,
        coordinates: preset.location.coordinates,
        address: preset.location.address,
        locality: preset.location.locality,
        isLiveGps: false,
        lastUpdated: Date.now()
      }));
    }
    baseTextRef.current = preset.text;
    currentTextRef.current = preset.text;
    setInputText(preset.text);
    handleParse(preset.text, preset.donorOrg || donorOrg);
  };

  const handleConfirmAndBroadcast = () => {
    setIsBroadcasting(true);
    cyberSound.playRadarPing();

    setTimeout(() => {
      const newId = `MISSION-${Math.floor(7100 + Math.random() * 800)}`;
      const newMission = {
        id: newId,
        donorOrg: donorOrg || 'Private Donor Entity',
        title: currentExtraction.foodType,
        venueName: currentExtraction.pickupLocation.split(',')[0] || currentExtraction.pickupLocation,
        location: currentExtraction.pickupLocation,
        gate: currentExtraction.pickupGate,
        contactName: currentExtraction.contactPerson,
        contactPhone: currentExtraction.contactPhone,
        dietCategory: currentExtraction.dietCategory,
        foodItems: currentExtraction.items,
        servings: currentExtraction.estimatedServings,
        containersDescription: currentExtraction.containerBreakdown,
        safeUntil: currentExtraction.safeUntilTime,
        safeUntilTimestamp: currentExtraction.safeUntilTimestamp,
        status: 'Available',
        driverInstructions: currentExtraction.driverInstructions,
        createdAt: 'Just now',
        packagingNotes: currentExtraction.packagingNotes
      };

      setMissions(prev => [newMission, ...prev]);
      setStats(prev => ({
        ...prev,
        activeRescues: prev.activeRescues + 1,
        servingsSaved: prev.servingsSaved + currentExtraction.estimatedServings
      }));

      setIsBroadcasting(false);
      triggerRescueConfetti();
      cyberSound.playSuccessChime();

      showToast('success', `DISPATCH BROADCAST // ${newId}`, `Dispatched to ${rankedNgos.length} verified shelters. Top target: ${rankedNgos[0]?.name}`);
    }, 600);
  };

  const handleClaimMission = (id) => {
    const topNgo = rankedNgos[0] || ngos[0];
    setMissions(prev =>
      prev.map(m => {
        if (m.id === id) {
          return {
            ...m,
            status: 'Claimed',
            claimedAt: 'Just now',
            claimedByNGO: {
              id: topNgo.id,
              name: topNgo.name,
              phone: topNgo.phone,
              driverName: 'Unit R-04 (Electric Van)',
              vehicleType: 'Tata Ace Insulated EV',
              etaMinutes: topNgo.etaMinutes
            }
          };
        }
        return m;
      })
    );
    cyberSound.playClick();
    showToast('purple', 'STATUS: MISSION CLAIMED', `En route with ${topNgo.name} (ETA ${topNgo.etaMinutes}m)`);
  };

  const handleAdvanceStatus = (id) => {
    setMissions(prev =>
      prev.map(m => {
        if (m.id === id) {
          return {
            ...m,
            status: 'Picked Up',
            pickedUpAt: 'Just now'
          };
        }
        return m;
      })
    );
    triggerRescueConfetti();
    cyberSound.playSuccessChime();
    showToast('success', 'STATUS: PICKED UP & SECURED', 'Surplus safely transferred to temperature-controlled canisters.');
  };

  const handleWhatsAppTrigger = (ngo) => {
    cyberSound.playSuccessChime();
    const url = generateWhatsAppDispatchURL(ngo, currentExtraction, donorOrg);
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('emerald', `1-CLICK WHATSAPP DISPATCH`, `Payload dispatched to ${ngo.name} dispatcher.`);
  };

  const handleCopyInstructions = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    cyberSound.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Add NGO Form Submission — System automatically calculates distance, ETA, coordinates, and route from address
  const handleAddNewNGO = async (e) => {
    e.preventDefault();
    if (!newNGOForm.name.trim()) return;

    const userEnteredAddress = (newNGOForm.address || newNGOForm.locality || `${newNGOForm.name}, Mumbai`).trim();

    // System automatically calculates distance, ETA, coordinates, and route corridor from the physical address
    const metrics = ngoAddressPreview || await calculateMetricsFromAddress(userEnteredAddress, userLocation);

    const capacity = parseInt(newNGOForm.servingCapacity, 10) || 400;
    const cleanWhatsapp = newNGOForm.whatsappNumber.replace(/[^0-9]/g, '') || '919820012345';
    const newId = `ngo-custom-${Date.now()}`;

    const newNgoItem = {
      id: newId,
      name: newNGOForm.name.trim(),
      locality: newNGOForm.locality.trim() || metrics.locality,
      address: userEnteredAddress || metrics.formattedAddress,
      coordinates: metrics.coordinates,
      tagline: newNGOForm.tagline.trim() || 'Rapid Community Relief Fleet',
      distanceKm: metrics.drivingDistanceKm,
      etaMinutes: metrics.totalEtaMinutes,
      servingCapacity: capacity,
      transportReadiness: newNGOForm.transportReadiness.trim() || 'Rapid Insulated Vehicle Ready',
      phone: newNGOForm.phone.trim() || `+${cleanWhatsapp}`,
      whatsappNumber: cleanWhatsapp,
      acceptsNonVeg: newNGOForm.acceptsNonVeg,
      activeDriversCount: 3,
      rating: 4.9,
      matchScore: 94,
      matchReason: `Auto-calculated via Google Maps: ${metrics.drivingDistanceKm} km (${metrics.routeSummary})`,
      verifiedBadge: true,
      routeSummary: metrics.routeSummary,
      googleMapsDirectionsUrl: metrics.googleMapsDirectionsUrl
    };

    // Register into memory lookup table so Google Maps radar resolves it immediately
    registerNgoLocation(newNgoItem.id, newNgoItem.address, newNgoItem.coordinates, newNgoItem.locality);

    setNgos(prev => [newNgoItem, ...prev]);
    setActiveMapNgoId(newNgoItem.id);
    setIsAddNGOModalOpen(false);
    cyberSound.playSuccessChime();
    triggerRescueConfetti();
    showToast('emerald', 'NEW SHELTER FLEET ENROLLED', `${newNgoItem.name} • ${newNgoItem.address} • ${metrics.drivingDistanceKm} km (ETA: ~${metrics.totalEtaMinutes}m)`);

    // Reset Form
    setNewNGOForm({
      name: '',
      locality: '',
      address: '',
      tagline: 'Community Kitchen & Night Shelter',
      servingCapacity: '400',
      transportReadiness: 'Electric Insulated Van Ready',
      phone: '+91 98200 88776',
      whatsappNumber: '919820088776',
      acceptsNonVeg: true
    });
    setNgoAddressPreview(null);
  };

  // Quick fill preset templates for Add NGO with instant address calculation
  const handleQuickFillNGO = async (type) => {
    cyberSound.playClick();
    let template = null;
    if (type === 'feeding-india') {
      template = {
        name: 'Feeding India - Bandra West Wing',
        locality: 'Bandra West / Khar Promenade',
        address: 'Feeding India Depot, Hill Road, Near Mehboob Studio, Bandra West, Mumbai, Maharashtra 400050',
        tagline: 'Rapid Midnight Shelter Transit Fleet',
        servingCapacity: '550',
        transportReadiness: '2 Insulated Thermal Vans + 4 Volunteers',
        phone: '+91 98200 33445',
        whatsappNumber: '919820033445',
        acceptsNonVeg: true
      };
    } else if (type === 'goonj') {
      template = {
        name: 'Goonj Relief Hub - Central',
        locality: 'Dadar West / Prabhadevi',
        address: 'Goonj Collection Center, Senapati Bapat Marg, Dadar West, Mumbai, Maharashtra 400028',
        tagline: 'Zero-Hunger Midnight Rescue Fleet',
        servingCapacity: '420',
        transportReadiness: 'Bolero Camper with Thermal Tubs',
        phone: '+91 98333 77889',
        whatsappNumber: '919833377889',
        acceptsNonVeg: false
      };
    }

    if (template) {
      setNewNGOForm(template);
      setIsCalculatingNgoDistance(true);
      try {
        const metrics = await calculateMetricsFromAddress(template.address, userLocation);
        setNgoAddressPreview(metrics);
      } catch (err) {
        console.error(err);
      } finally {
        setIsCalculatingNgoDistance(false);
      }
    }
  };

  // Live countdown calculation for confirmation card
  const extractionDiff = Math.max(0, currentExtraction.safeUntilTimestamp - now);
  const extTotalSecs = Math.floor(extractionDiff / 1000);
  const extHours = Math.floor(extTotalSecs / 3600);
  const extMins = Math.floor((extTotalSecs % 3600) / 60);
  const extSecs = extTotalSecs % 60;
  const extMinutesTotal = Math.floor(extTotalSecs / 60);

  return (
    <div className="min-h-screen bg-[#0b0f12] text-slate-100 flex flex-col md:flex-row font-sans selection:bg-purple-500/30 selection:text-purple-300">
      
      {/* ======================================================== */}
      {/* 1. LEFT RAIL SIDEBAR (Attack Mode Aesthetic)             */}
      {/* ======================================================== */}
      <aside className="w-full md:w-64 lg:w-72 bg-[#11171d] border-b md:border-b-0 md:border-r border-[#1e293b] flex flex-col shrink-0 p-4 md:p-5 select-none justify-between">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 shadow-tactical">
                <Flame className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-widest text-slate-100 uppercase font-mono">
                  ANNADAATA AI
                </h1>
                <div className="text-[10px] font-mono text-slate-400">
                  TACTICAL RESCUE GRID
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
              LIVE GRID
            </span>
          </div>

          {/* Navigation Pills */}
          <nav className="space-y-1.5 font-mono text-xs">
            <button
              onClick={() => {
                setActiveTab('rescue');
                cyberSound.playClick();
                document.getElementById('donor-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-left ${
                activeTab === 'rescue'
                  ? 'bg-purple-950/30 border-purple-500/50 text-purple-300 shadow-glow-purple font-semibold'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-[#1a232e] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className={`w-4 h-4 ${activeTab === 'rescue' ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>Rescue Mission</span>
              </div>
              <span className="text-[10px] opacity-60">01</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('map');
                cyberSound.playClick();
                document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-left ${
                activeTab === 'map'
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-glow-cyan font-semibold'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-[#1a232e] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin className={`w-4 h-4 ${activeTab === 'map' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>Google Maps Radar</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                LIVE GPS
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('radar');
                cyberSound.playClick();
                document.getElementById('radar-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-left ${
                activeTab === 'radar'
                  ? 'bg-purple-950/30 border-purple-500/50 text-purple-300 shadow-glow-purple font-semibold'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-[#1a232e] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Radio className={`w-4 h-4 ${activeTab === 'radar' ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>Live Dispatch Radar</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 rounded bg-[#1e293b] text-emerald-400">
                {missions.filter(m => m.status === 'Available').length} ACT
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('ngos');
                cyberSound.playClick();
                document.getElementById('shelter-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-left ${
                activeTab === 'ngos'
                  ? 'bg-purple-950/30 border-purple-500/50 text-purple-300 shadow-glow-purple font-semibold'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-[#1a232e] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className={`w-4 h-4 ${activeTab === 'ngos' ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>NGO Registry</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {ngos.length} FLEETS
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('metrics');
                cyberSound.playClick();
                document.getElementById('metrics-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-left ${
                activeTab === 'metrics'
                  ? 'bg-purple-950/30 border-purple-500/50 text-purple-300 shadow-glow-purple font-semibold'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-[#1a232e] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className={`w-4 h-4 ${activeTab === 'metrics' ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>Telemetry & Metrics</span>
              </div>
              <span className="text-[10px] opacity-60">LIVE</span>
            </button>
          </nav>

          {/* Quick Action: Register New NGO */}
          <div className="p-3 rounded-lg bg-[#0b0f12] border border-[#1e293b] space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>SHELTER NETWORK</span>
              <span className="text-cyan-400 font-bold">{ngos.length} ACTIVE</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAddNGOModalOpen(true);
                cyberSound.playClick();
              }}
              className="w-full py-1.5 px-2 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ ADD NEW NGO FLEET</span>
            </button>
          </div>
        </div>

        {/* Bottom Status Indicator */}
        <div className="pt-4 border-t border-[#1e293b] mt-4">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="truncate">Conflict-Free Engine • Realtime Dispatch Sync</span>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN WORKSPACE WITH TOP COMMAND BAR                   */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Command Bar */}
        <header className="sticky top-0 z-40 bg-[#11171d]/90 backdrop-blur-xl border-b border-[#1e293b] px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Greeting */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
            </span>
            <div>
              <div className="text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-200">
                Rescue Dispatch Command // Active Operations
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                MUMBAI METROPOLITAN SECTOR • ZERO WASTE PROTOCOL
              </div>
            </div>
          </div>

          {/* Telemetry pill badges */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Live GPS Location telemetry button */}
            <button
              onClick={() => {
                setActiveTab('map');
                cyberSound.playClick();
                document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1 rounded-full bg-[#0b0f12] border border-[#1e293b] hover:border-cyan-500/50 text-[11px] font-mono flex items-center gap-1.5 shadow-sm transition-all"
              title="Click to view live Google Maps Radar"
            >
              <span className={`w-2 h-2 rounded-full ${userLocation.isLiveGps ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
              <span className="text-slate-400">GPS:</span>
              <span className="text-cyan-300 font-bold max-w-[130px] truncate">{userLocation.locality}</span>
            </button>

            <div className="px-3 py-1 rounded-full bg-[#0b0f12] border border-[#1e293b] text-[11px] font-mono flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-slate-400">ACTIVE:</span>
              <span className="text-purple-300 font-bold">{stats.activeRescues} MISSIONS</span>
            </div>

            <div className="px-3 py-1 rounded-full bg-[#0b0f12] border border-[#1e293b] text-[11px] font-mono flex items-center gap-1.5 shadow-sm">
              <span className="text-slate-400">SAVED:</span>
              <span className="text-amber-400 font-bold">{stats.servingsSaved.toLocaleString()} PAX</span>
            </div>

            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>HOTLINE 1098 // READY</span>
            </div>

            {/* Add NGO quick button in top bar */}
            <button
              onClick={() => {
                setIsAddNGOModalOpen(true);
                cyberSound.playClick();
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1 transition-all"
              title="Add More NGOs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add NGO</span>
            </button>

            {/* Sound Mute Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                cyberSound.playClick();
              }}
              title={soundEnabled ? 'Mute Cyber Audio' : 'Unmute Cyber Audio'}
              className="p-1.5 rounded-lg bg-[#0b0f12] border border-[#1e293b] text-slate-400 hover:text-slate-200 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* 3. CONTENT AREA WITH ATTACK MODE CARD ARCHITECTURE       */}
        {/* ======================================================== */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* SECTION 1: RUSHED DONOR INTAKE (01 RESCUE LOGS) */}
          <section id="donor-section" className="bg-[#11171d] rounded-xl border border-[#1e293b] p-5 sm:p-6 relative overflow-hidden shadow-cyber-card">
            {/* Header Dark Pill with custom code tag */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-[#0b0f12] border border-[#1e293b] text-[11px] font-mono font-bold text-purple-400 tracking-wider">
                  01 RESCUE LOGS
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase">
                  PROTOCOL // SIGHTING INTAKE TERMINAL
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isListening && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    LIVE AUDIO STREAMING
                  </span>
                )}
                <span className="text-[10px] font-mono text-slate-400">
                  INPUT ENCODING: UTF-8 / HINGLISH NLP
                </span>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="my-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  TACTICAL BANQUET PRESETS // 1-CLICK POPULATE:
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PRESET_SCENARIOS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3 rounded-lg bg-[#0b0f12] hover:bg-[#151c24] border border-[#1e293b] hover:border-purple-500/50 transition-all text-left group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 font-mono">
                          {preset.label.split(':')[1]?.trim() || preset.label}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1e293b] text-slate-300">
                          {preset.urgencyHint}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-purple-400 mb-1">
                        {preset.badge}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 italic font-sans">
                        "{preset.text}"
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-slate-400 group-hover:text-purple-400 flex items-center gap-1">
                      <span>ARM SCENARIO</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* LIVE USER GPS LOCATION TRACKER BAR */}
            <div className="mb-3.5 p-3 rounded-lg bg-[#0b0f12] border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 text-xs font-mono">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <LocateFixed className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
                      TRACKED PICKUP LOCATION (GOOGLE MAPS):
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      userLocation.isLiveGps
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-[#151c24] text-slate-400 border border-[#1e293b]'
                    }`}>
                      {userLocation.isLiveGps ? '● LIVE GPS FIX' : 'PRESET VENUE'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans truncate max-w-lg mt-0.5">
                    {userLocation.address}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    cyberSound.playClick();
                    try {
                      const loc = await acquireUserGeolocation();
                      setUserLocation(prev => ({
                        ...prev,
                        coordinates: loc.coordinates,
                        address: loc.address,
                        locality: loc.locality,
                        accuracyMeters: loc.accuracyMeters,
                        isLiveGps: loc.source === 'gps-high-accuracy' || loc.source === 'wifi-network',
                        lastUpdated: Date.now()
                      }));
                      setCurrentExtraction(prev => ({
                        ...prev,
                        pickupLocation: loc.address
                      }));
                      cyberSound.playSuccessChime();
                      showToast('emerald', 'GPS LOCATION ACQUIRED', `${loc.locality} (${loc.note || 'Active'})`);
                    } catch (e) {
                      showToast('purple', 'LOCATION FALLBACK', 'Using preset Mumbai hub.');
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <Locate className="w-3 h-3 text-cyan-400" />
                  <span>REFRESH GPS</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('map');
                    cyberSound.playClick();
                    document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#151c24] hover:bg-[#1f2937] border border-[#1e293b] text-slate-300 hover:text-cyan-300 text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>VIEW MAP</span>
                </button>
              </div>
            </div>

            {/* DONOR / USER ORGANISATION FIELD */}
            <div className="mb-3.5 p-3 rounded-lg bg-[#0b0f12] border border-[#1e293b] focus-within:border-cyan-500/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Building2 className="w-4 h-4 shrink-0 text-cyan-400" />
                <span className="font-bold tracking-wider uppercase">DONOR / USER ORGANISATION:</span>
              </div>
              <div className="flex-1 max-w-lg">
                <input
                  type="text"
                  value={donorOrg}
                  onChange={(e) => {
                    setDonorOrg(e.target.value);
                    setCurrentExtraction(prev => ({
                      ...prev,
                      donorOrg: e.target.value
                    }));
                  }}
                  placeholder="e.g. Grand Royal Banquets, Taj Lands End Catering, Marriott Ballroom, Ambani Wedding Host..."
                  className="w-full bg-[#11171d] px-3.5 py-1.5 rounded border border-[#1e293b] text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            {/* Natural Text Box with Mic Controls */}
            <div className="relative rounded-lg border border-[#1e293b] focus-within:border-purple-500/60 bg-[#0b0f12] transition-all">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={3}
                placeholder='Paste hurried message here (e.g. "4 handi chicken biryani aur dal bacha hai at Grand Banquet Kandivali, 150-180 people, gate 3, safe till 1:30 AM. Call Chef Ramesh 9820198201")...'
                className="w-full bg-transparent px-4 pt-3 pb-14 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-sans"
              />

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between border-t border-[#1e293b] pt-2 px-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      isListening
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-glow-rose animate-pulse'
                        : 'bg-[#151c24] hover:bg-[#1c2631] text-slate-300 border border-[#1e293b] hover:text-emerald-400'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-rose-400" />
                        <span>DISARM MIC</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                        <span>VOICE INPUT</span>
                      </>
                    )}
                  </button>

                  {inputText && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputText('');
                        baseTextRef.current = '';
                        currentTextRef.current = '';
                        cyberSound.playClick();
                      }}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Clear Buffer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {micStatusMsg && (
                    <span className="text-[10px] font-mono text-amber-300/90 hidden sm:inline">
                      {micStatusMsg}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
                    {inputText.length} BYTES
                  </span>
                  <button
                    type="button"
                    onClick={() => handleParse(inputText, donorOrg)}
                    disabled={!inputText.trim() || isAnalyzing}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-mono font-semibold text-xs transition-all shadow-glow-purple active:scale-95"
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>PARSING...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>RUN EXTRACTION</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: AI EXTRACTION CONFIRMATION CARD (02 VERIFIED EXTRACTION) */}
          <section id="extraction-section" className="bg-[#11171d] rounded-xl border border-[#1e293b] p-5 sm:p-6 relative overflow-hidden shadow-cyber-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-[#0b0f12] border border-[#1e293b] text-[11px] font-mono font-bold text-emerald-400 tracking-wider">
                  02 VERIFIED EXTRACTION
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase">
                  CONFIRMATION MATRIX & SPOILAGE WINDOW
                </span>
              </div>

              {/* Ticking Spoilage Countdown */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border font-mono ${
                extMinutesTotal < 45
                  ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 animate-flash-critical shadow-glow-rose'
                  : extMinutesTotal < 120
                  ? 'bg-amber-950/50 border-amber-500/50 text-amber-300 shadow-glow-amber'
                  : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-glow-emerald'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] text-slate-400 uppercase">SPOILAGE COUNTDOWN:</span>
                <span className="text-xs font-bold">
                  {String(extHours).padStart(2, '0')}:{String(extMins).padStart(2, '0')}:{String(extSecs).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* High-Density Telemetry Metric Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4 font-mono">
              {/* Tile 1: Diet & Food Category */}
              <div className="p-3.5 rounded-lg bg-[#0b0f12] border border-[#1e293b] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>DIET CATEGORY</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    currentExtraction.dietCategory === 'Veg'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : currentExtraction.dietCategory === 'Non-Veg'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {currentExtraction.dietCategory === 'Veg' ? '🟢 PURE VEG' : currentExtraction.dietCategory === 'Non-Veg' ? '🔴 NON-VEG' : '🟡 MIXED'}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-200 line-clamp-1">
                  {currentExtraction.foodType}
                </div>
                <div className="text-[10px] text-slate-400">
                  {currentExtraction.items.slice(0, 2).join(' • ')}
                </div>
              </div>

              {/* Tile 2: Serving Capacity */}
              <div className="p-3.5 rounded-lg bg-[#0b0f12] border border-[#1e293b] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>QUANTITY ESTIMATE</span>
                  <span className="text-amber-400">CALCULATED</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-amber-300">
                    {currentExtraction.estimatedServings}
                  </span>
                  <span className="text-xs text-slate-400">PAX MEALS</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentExtraction.containerBreakdown}
                </div>
              </div>

              {/* Tile 3: Host / Donor Organisation Tile */}
              <div className="p-3.5 rounded-lg bg-[#0b0f12] border border-[#1e293b] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>DONOR / HOST ENTITY</span>
                  <span className="text-cyan-400 font-bold">VERIFIED</span>
                </div>
                <div className="text-xs font-bold text-cyan-300 truncate" title={currentExtraction.donorOrg || donorOrg || 'Private Donor Entity'}>
                  {currentExtraction.donorOrg || donorOrg || 'Private Donor Entity'}
                </div>
                <div className="text-[10px] text-slate-400 truncate" title={currentExtraction.pickupGate}>
                  📍 {currentExtraction.pickupGate}
                </div>
              </div>

              {/* Tile 4: Contact & Window */}
              <div className="p-3.5 rounded-lg bg-[#0b0f12] border border-[#1e293b] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>ON-SITE COORDINATOR</span>
                  <span className="text-slate-400">AUTHORITY</span>
                </div>
                <div className="text-xs font-bold text-slate-200">
                  {currentExtraction.contactPerson}
                </div>
                <div className="text-[10px] text-emerald-400">
                  {currentExtraction.contactPhone}
                </div>
                <div className="pt-1 border-t border-[#1e293b] flex items-center gap-1 text-[10px] text-amber-300 truncate">
                  <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">{currentExtraction.safeUntilTime}</span>
                </div>
              </div>
            </div>

            {/* Driver Instructions Micro-Brief */}
            <div className="p-3 rounded-lg bg-[#0b0f12] border border-[#1e293b] flex items-start gap-2.5 text-xs text-slate-300 font-sans mb-4">
              <Truck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-purple-400 font-semibold text-[11px] block">
                  AI DRIVER LOGISTICS BRIEF:
                </span>
                <span>{currentExtraction.driverInstructions}</span>
              </div>
            </div>

            {/* Broadcast Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#1e293b]">
              <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>READY FOR BROADCAST TO {ngos.length} REGISTERED REGIONAL NGO FLEETS</span>
              </div>

              <button
                type="button"
                onClick={handleConfirmAndBroadcast}
                disabled={isBroadcasting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0b0f12] font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-tactical transition-all active:scale-95"
              >
                {isBroadcasting ? (
                  <>
                    <Radio className="w-4 h-4 animate-spin" />
                    <span>BROADCASTING TO SHELTERS...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>CONFIRM & BROADCAST TO NEAREST SHELTERS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </section>

          {/* SECTION: GOOGLE MAPS DISPATCH RADAR & LIVE GPS MATRIX */}
          <section id="map-section">
            <GoogleMapDispatchRadar
              userLocation={userLocation}
              onUpdateUserLocation={(updated) => {
                setUserLocation(prev => ({ ...prev, ...updated }));
                if (updated.address) {
                  setCurrentExtraction(prev => ({
                    ...prev,
                    pickupLocation: updated.address
                  }));
                }
              }}
              ngos={ngosWithLiveMetrics}
              activeNgoId={activeMapNgoId}
              onSelectNgo={(ngoId) => {
                setActiveMapNgoId(ngoId);
                cyberSound.playClick();
              }}
              pickupGate={currentExtraction.pickupGate}
              onApplyLocationToDonorForm={(address, venueName) => {
                setCurrentExtraction(prev => ({
                  ...prev,
                  pickupLocation: address
                }));
                showToast('emerald', 'LOCATION APPLIED', venueName);
              }}
            />
          </section>

          {/* SECTION 3: INTELLIGENT NGO MATCHING (03 SHELTER MATCH ENGINE) */}
          <section id="shelter-section" className="bg-[#11171d] rounded-xl border border-[#1e293b] p-5 sm:p-6 relative overflow-hidden shadow-cyber-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-[#0b0f12] border border-[#1e293b] text-[11px] font-mono font-bold text-cyan-400 tracking-wider">
                  03 SHELTER MATCH ENGINE
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase">
                  DYNAMIC PROXIMITY & FLEET READINESS
                </span>
              </div>

              {/* Action: Add New NGO Button */}
              <button
                type="button"
                onClick={() => {
                  setIsAddNGOModalOpen(true);
                  cyberSound.playClick();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ REGISTER NEW SHELTER FLEET</span>
              </button>
            </div>

            {/* NGO Cards List */}
            <div className="mt-4 space-y-3 font-mono">
              {rankedNgos.map((ngo, idx) => {
                const isRank1 = idx === 0;

                return (
                  <div
                    key={ngo.id}
                    className={`p-4 rounded-xl border transition-all relative ${
                      isRank1
                        ? 'bg-[#151c24] border-emerald-500/70 shadow-tactical ring-1 ring-emerald-500/30'
                        : 'bg-[#0b0f12] border-[#1e293b] hover:border-slate-700'
                    }`}
                  >
                    {/* Rank 1 Tactical Badge */}
                    {isRank1 && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-[#0b0f12] text-[10px] font-mono font-black uppercase tracking-wider mb-2 shadow-sm">
                        <Zap className="w-3 h-3 fill-current" />
                        #1 OPTIMAL MATCH // HIGHEST DISPATCH PROBABILITY
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: NGO Identity & High-Density Micro-Metrics */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1e293b] text-slate-300">
                            RANK #{idx + 1}
                          </span>
                          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                            {ngo.name}
                            {ngo.verifiedBadge && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </h3>
                          <span className="text-[11px] text-slate-400">
                            // {ngo.locality}
                          </span>
                        </div>

                        {/* Verified Depot Physical Address */}
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>DEPOT: <strong className="text-slate-200">{ngo.address || `${ngo.name}, ${ngo.locality}`}</strong></span>
                        </div>

                        {/* Structured Micro-Metrics */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-[#11171d] border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1">
                            <Navigation className="w-2.5 h-2.5 text-cyan-400" />
                            DISTANCE: {ngo.distanceKm} KM
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#11171d] border border-purple-500/40 text-purple-400 font-bold flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-purple-400" />
                            DELIVERY ETA: ~{ngo.etaMinutes} MIN
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#11171d] border border-[#1e293b] text-amber-400 font-bold">
                            CAPACITY: {ngo.servingCapacity} PAX
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#11171d] border border-[#1e293b] text-emerald-400">
                            CORRIDOR: {ngo.routeSummary || 'via Western Corridor'}
                          </span>
                        </div>

                        <div className="text-[11px] font-sans text-slate-400">
                          <strong className="font-mono text-slate-300">Rationale: </strong>
                          {ngo.matchReason}
                        </div>
                      </div>

                      {/* Right: Tactical Score & 1-Click WhatsApp Trigger */}
                      <div className="flex items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#1e293b]">
                        <div className="text-right">
                          <div className="text-[9px] uppercase tracking-wider text-slate-400">
                            FIT SCORE
                          </div>
                          <div className="text-lg font-black text-emerald-400">
                            {ngo.matchScore}%
                          </div>
                        </div>

                        {/* Route Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMapNgoId(ngo.id);
                              setActiveTab('map');
                              cyberSound.playClick();
                              document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-3 py-2 rounded-lg bg-[#0b0f12] hover:bg-[#1a232e] text-cyan-300 hover:text-cyan-200 border border-[#1e293b] hover:border-cyan-500/50 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                            title="View delivery route on Google Map"
                          >
                            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                            <span>MAP ROUTE</span>
                          </button>

                          {/* Tactical 1-Click WhatsApp Dispatch Button */}
                          {isRank1 ? (
                            <button
                              type="button"
                              onClick={() => handleWhatsAppTrigger(ngo)}
                              className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-mono tracking-wider flex items-center gap-2 shadow-tactical hover:shadow-lg transition-all active:scale-95 group"
                            >
                              <Zap className="w-4 h-4 fill-slate-950" />
                              <span>⚡ ALERT NGO</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleWhatsAppTrigger(ngo)}
                              className="px-3.5 py-2 rounded-lg bg-[#11171d] hover:bg-[#1a232e] text-slate-300 hover:text-emerald-400 border border-[#1e293b] hover:border-emerald-500/50 text-xs font-mono flex items-center gap-1.5 transition-all"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>DISPATCH</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 4: LIVE RESCUE BOARD & STATUS LIFECYCLE (04 LIVE MISSION RADAR) */}
          <section id="radar-section" className="bg-[#11171d] rounded-xl border border-[#1e293b] p-5 sm:p-6 relative overflow-hidden shadow-cyber-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1e293b]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-[#0b0f12] border border-[#1e293b] text-[11px] font-mono font-bold text-amber-400 tracking-wider">
                  04 LIVE MISSION RADAR
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase">
                  ACTIVE MISSION LIFECYCLE & DRIVER LOGISTICS
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[#0b0f12] text-slate-300 border border-[#1e293b]">
                  TOTAL QUEUED: {missions.length}
                </span>
              </div>
            </div>

            {/* Mission Cards Grid */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {missions.map((mission) => {
                const diff = Math.max(0, mission.safeUntilTimestamp - now);
                const totalSeconds = Math.floor(diff / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                const totalMinutes = Math.floor(totalSeconds / 60);

                const isExpired = totalSeconds <= 0 && mission.status !== 'Picked Up';
                const isCritical = totalMinutes < 45 && !isExpired && mission.status !== 'Picked Up';
                const isAmber = totalMinutes >= 45 && totalMinutes < 120 && !isExpired && mission.status !== 'Picked Up';

                return (
                  <div
                    key={mission.id}
                    className={`rounded-xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                      mission.status === 'Claimed'
                        ? 'bg-[#151c24] border-purple-500/60 shadow-glow-purple ring-1 ring-purple-500/30'
                        : isCritical
                        ? 'bg-gradient-to-br from-[#11171d] via-rose-950/20 to-[#11171d] border-rose-500/60 shadow-glow-rose'
                        : 'bg-[#0b0f12] border-[#1e293b]'
                    }`}
                  >
                    <div>
                      {/* Top Header Row with Status Badge with glowing dots */}
                      <div className="flex items-center justify-between gap-2 mb-2 font-mono">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-bold text-slate-300">{mission.id}</span>
                          <span>•</span>
                          <span>{mission.createdAt}</span>
                        </div>

                        {/* Status Badges with Glowing Dots */}
                        <div>
                          {mission.status === 'Available' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              AWAITING DISPATCH
                            </span>
                          )}
                          {mission.status === 'Claimed' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/50 shadow-glow-purple">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                              CLAIMED // IN-TRANSIT
                            </span>
                          )}
                          {mission.status === 'Picked Up' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              RESCUED // COMPLETED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Venue & Host Organisation */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <h4 className="text-sm font-bold text-slate-100 font-sans">
                            {mission.venueName}
                          </h4>
                          <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-cyan-400" />
                            <span>Host: {mission.donorOrg || 'Private Donor Entity'}</span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                          mission.dietCategory === 'Veg'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : mission.dietCategory === 'Non-Veg'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {mission.dietCategory === 'Veg' ? 'VEG' : mission.dietCategory === 'Non-Veg' ? 'NON-VEG' : 'MIXED'}
                        </span>
                      </div>

                      {/* Structured Micro-Metrics */}
                      <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-[#11171d] border border-[#1e293b] text-slate-300">
                          CAPACITY: {mission.servings} PAX
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#11171d] border border-[#1e293b] text-emerald-400">
                          GATE: {mission.gate}
                        </span>
                      </div>

                      {/* Real-time Ticking Countdown Window */}
                      <div className={`p-2.5 rounded-lg border font-mono text-xs flex items-center justify-between mb-1.5 ${
                        isExpired
                          ? 'bg-slate-900 border-slate-700 text-slate-500'
                          : isCritical
                          ? 'bg-rose-950/70 border-rose-500/70 text-rose-300 animate-flash-critical shadow-glow-rose'
                          : isAmber
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                          : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      }`}>
                        <div className="flex items-center gap-1.5 text-[10px] uppercase">
                          <Clock className="w-3.5 h-3.5" />
                          <span>SAFE SPOILAGE WINDOW:</span>
                        </div>
                        <div className="font-bold tracking-wider">
                          {isExpired ? (
                            '00:00:00 EXPIRED'
                          ) : (
                            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${isCritical ? '(CRITICAL)' : isAmber ? '(URGENT)' : '(OPTIMAL)'}`
                          )}
                        </div>
                      </div>

                      {/* Synchronized Food Safety Deadline */}
                      <div className="text-[10px] font-mono text-slate-400 mb-3 flex items-center justify-between px-1">
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="text-slate-500">Deadline:</span>
                          <span className="text-amber-300 font-semibold">{mission.safeUntil}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0 font-sans">FSSAI Safe</span>
                      </div>

                      {/* AI-Written Pickup Message box on claimed cards */}
                      {mission.status === 'Claimed' && (
                        <div className="p-3 rounded-lg bg-[#0b0f12] border border-purple-500/40 mb-3 space-y-1.5 font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-purple-400 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              AI DRIVER LOGISTICS INSTRUCTIONS:
                            </span>
                            <button
                              onClick={() => handleCopyInstructions(mission.id, mission.driverInstructions)}
                              className="text-[10px] text-slate-400 hover:text-purple-300 flex items-center gap-1"
                            >
                              {copiedId === mission.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">COPIED</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>COPY</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                            {mission.driverInstructions}
                          </p>
                          {mission.claimedByNGO && (
                            <div className="text-[10px] text-purple-300 pt-1 border-t border-[#1e293b] flex items-center justify-between">
                              <span>DISPATCHED: {mission.claimedByNGO.name}</span>
                              <span className="text-emerald-400">ETA: ~{mission.claimedByNGO.etaMinutes}m</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Workflow State Buttons */}
                    <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between gap-2 font-mono">
                      <div className="text-[10px] text-slate-400 truncate">
                        {mission.contactName} ({mission.contactPhone})
                      </div>

                      <div>
                        {mission.status === 'Available' && (
                          <button
                            type="button"
                            onClick={() => handleClaimMission(mission.id)}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple transition-all active:scale-95"
                          >
                            CLAIM / ACCEPT MISSION
                          </button>
                        )}
                        {mission.status === 'Claimed' && (
                          <div className="flex items-center gap-2">
                            <a
                              href={getGoogleMapsDirectionsUrl(
                                mission.claimedByNGO ? (NGO_VERIFIED_LOCATIONS[mission.claimedByNGO.id]?.address || mission.claimedByNGO.name) : 'Kandivali, Mumbai',
                                mission.location
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-[#0b0f12] hover:bg-[#1a232e] text-cyan-300 border border-[#1e293b] hover:border-cyan-500/50 text-[11px] font-mono flex items-center gap-1 transition-all"
                              title="Track driver transit on Google Maps"
                            >
                              <Navigation className="w-3 h-3 text-cyan-400" />
                              <span>LIVE GPS ROUTE</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleAdvanceStatus(mission.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-tactical transition-all active:scale-95"
                            >
                              ADVANCE (CLAIMED → PICKED UP)
                            </button>
                          </div>
                        )}
                        {mission.status === 'Picked Up' && (
                          <span className="text-[10px] font-bold text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30">
                            DELIVERED TO SHELTER
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 5: TELEMETRY & METRICS (05 TELEMETRY & AUDIT) */}
          <section id="metrics-section" className="bg-[#11171d] rounded-xl border border-[#1e293b] p-5 sm:p-6 font-mono shadow-cyber-card">
            <div className="flex items-center gap-3 pb-4 border-b border-[#1e293b] mb-4">
              <span className="px-2.5 py-1 rounded-md bg-[#0b0f12] border border-[#1e293b] text-[11px] font-bold text-emerald-400 tracking-wider">
                05 TELEMETRY & AUDIT
              </span>
              <span className="text-xs text-slate-400 uppercase">
                SYSTEM-WIDE AGGREGATE LOGISTICS
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#0b0f12] border border-[#1e293b]">
                <div className="text-slate-400 text-[10px]">TOTAL DISPATCHES TODAY</div>
                <div className="text-lg font-bold text-slate-100 mt-1">28 RUNS</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0b0f12] border border-[#1e293b]">
                <div className="text-slate-400 text-[10px]">MEAL VALUE PRESERVED</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">₹ 2,97,000</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0b0f12] border border-[#1e293b]">
                <div className="text-slate-400 text-[10px]">AVG TRANSIT TIME</div>
                <div className="text-lg font-bold text-purple-400 mt-1">{stats.averageDispatchMins} MINS</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0b0f12] border border-[#1e293b]">
                <div className="text-slate-400 text-[10px]">ACTIVE REGISTERED FLEETS</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">{ngos.length} SHELTERS</div>
              </div>
            </div>
          </section>
        </main>

        {/* ======================================================== */}
        {/* 4. MODAL: REGISTER NEW NGO / SHELTER FLEET               */}
        {/* ======================================================== */}
        {isAddNGOModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#11171d] border border-[#1e293b] rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative font-mono space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                      REGISTER NEW SHELTER FLEET
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      PROTOCOL ENROLLMENT // REAL-TIME DISPATCH GRID
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddNGOModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick-fill helpers */}
              <div className="p-2.5 rounded bg-[#0b0f12] border border-[#1e293b] space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                  1-CLICK VERIFIED PRESET TEMPLATES:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFillNGO('feeding-india')}
                    className="px-2 py-1 rounded bg-[#151c24] hover:bg-[#1f2937] text-[10px] text-emerald-400 border border-[#1e293b] transition-all"
                  >
                    + Feeding India Bandra (Veg & Non-Veg)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFillNGO('goonj')}
                    className="px-2 py-1 rounded bg-[#151c24] hover:bg-[#1f2937] text-[10px] text-amber-400 border border-[#1e293b] transition-all"
                  >
                    + Goonj Dadar Hub (Pure Veg)
                  </button>
                </div>
              </div>

              {/* Add NGO Form */}
              <form onSubmit={handleAddNewNGO} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">
                    NGO / Shelter Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newNGOForm.name}
                    onChange={(e) => setNewNGOForm({ ...newNGOForm, name: e.target.value })}
                    placeholder="e.g. Feeding India West, Robin Hood Army Powai..."
                    className="w-full bg-[#0b0f12] border border-[#1e293b] rounded px-3 py-1.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">
                      Locality / Zone *
                    </label>
                    <input
                      type="text"
                      required
                      value={newNGOForm.locality}
                      onChange={(e) => setNewNGOForm({ ...newNGOForm, locality: e.target.value })}
                      placeholder="e.g. Bandra West, Dadar, Thane..."
                      className="w-full bg-[#0b0f12] border border-[#1e293b] rounded px-3 py-1.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">
                      Fleet Tagline
                    </label>
                    <input
                      type="text"
                      value={newNGOForm.tagline}
                      onChange={(e) => setNewNGOForm({ ...newNGOForm, tagline: e.target.value })}
                      placeholder="e.g. Rapid Midnight Response"
                      className="w-full bg-[#0b0f12] border border-[#1e293b] rounded px-3 py-1.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>NGO DEPOT PHYSICAL STREET ADDRESS *</span>
                    </label>
                    <span className="text-[9px] text-cyan-400 font-mono">
                      AUTOCALCULATES DISTANCE & ETA
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={newNGOForm.address || ''}
                    onChange={(e) => setNewNGOForm({ ...newNGOForm, address: e.target.value })}
                    placeholder="e.g. Plot 22, Hill Road, Near Railway Colony, Bandra West, Mumbai 400050"
                    className="w-full bg-[#0b0f12] border border-[#1e293b] focus:border-cyan-400 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none text-xs font-mono"
                  />

                  {/* Quick-fill address chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[9px] text-slate-500 uppercase self-center mr-1">SUGGESTIONS:</span>
                    {[
                      { label: 'Bandra West (Hill Rd)', addr: 'Hill Road, Near Mehboob Studio, Bandra West, Mumbai 400050', loc: 'Bandra West' },
                      { label: 'Powai (Hiranandani)', addr: 'Central Avenue, Hiranandani Gardens, Powai, Mumbai 400076', loc: 'Powai' },
                      { label: 'Andheri West (Lokhandwala)', addr: 'Lokhandwala Complex, 4 Bungalows, Andheri West, Mumbai 400053', loc: 'Andheri West' },
                      { label: 'Dadar West (Shivaji Park)', addr: 'Senapati Bapat Marg, Shivaji Park, Dadar West, Mumbai 400028', loc: 'Dadar West' },
                      { label: 'Goregaon West (SV Rd)', addr: 'SV Road, Near Filmistan Studio, Goregaon West, Mumbai 400062', loc: 'Goregaon West' },
                      { label: 'Borivali (Gorai Rd)', addr: 'Gorai Road, Near Shimpoli, Borivali West, Mumbai 400091', loc: 'Borivali West' }
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setNewNGOForm({ ...newNGOForm, address: chip.addr, locality: chip.loc })}
                        className="px-2 py-0.5 rounded bg-[#151c24] hover:bg-[#1f2937] text-[9px] text-cyan-300 border border-[#1e293b] hover:border-cyan-500/50 transition-all"
                      >
                        + {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LIVE SYSTEM AUTO-CALCULATION DISPLAY BOX */}
                <div className="p-3 rounded-lg bg-[#070b0e] border border-cyan-500/40 relative overflow-hidden font-mono space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                      <Route className="w-3.5 h-3.5 text-cyan-400" />
                      GOOGLE MAPS ENGINE AUTO-CALCULATION:
                    </span>
                    {isCalculatingNgoDistance ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        CALCULATING...
                      </span>
                    ) : ngoAddressPreview ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ROUTE COMPUTED
                      </span>
                    ) : (
                      <span className="text-slate-500">AWAITING ADDRESS</span>
                    )}
                  </div>

                  {ngoAddressPreview ? (
                    <div className="space-y-2 pt-1 border-t border-[#1e293b]">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-[#0b0f12] border border-[#1e293b]">
                          <div className="text-[9px] text-slate-400 uppercase">SYSTEM DRIVING DISTANCE</div>
                          <div className="text-base font-extrabold text-cyan-300 mt-0.5">
                            {ngoAddressPreview.drivingDistanceKm} <span className="text-[10px] text-slate-400 font-normal">KM</span>
                          </div>
                        </div>

                        <div className="p-2 rounded bg-[#0b0f12] border border-[#1e293b]">
                          <div className="text-[9px] text-slate-400 uppercase">ESTIMATED DELIVERY TIME</div>
                          <div className="text-base font-extrabold text-purple-300 mt-0.5">
                            ~{ngoAddressPreview.totalEtaMinutes} <span className="text-[10px] text-slate-400 font-normal">MINS</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-300 bg-[#0b0f12] p-2 rounded border border-[#1e293b] space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>DETECTED AREA / GPS:</span>
                          <span className="text-cyan-300 font-bold">{ngoAddressPreview.locality} ({ngoAddressPreview.coordinates.lat.toFixed(4)}, {ngoAddressPreview.coordinates.lng.toFixed(4)})</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>FASTEST TRANSIT CORRIDOR:</span>
                          <span className="text-emerald-400 font-bold">{ngoAddressPreview.routeSummary}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>TRAFFIC FLOW CONDITIONS:</span>
                          <span className="text-cyan-300">{ngoAddressPreview.trafficStatus} Flow (~{ngoAddressPreview.transitMinutes}m road travel)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 truncate">
                          <span>DELIVERY DESTINATION:</span>
                          <span className="text-slate-200 truncate max-w-[200px]" title={userLocation.address}>{userLocation.address}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-[10px] text-slate-400 italic">
                      Type the NGO's physical address or select a preset above. The system will automatically calculate the driving distance, transit duration, and traffic corridor from your current location.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">
                      Serving Capacity (PAX) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newNGOForm.servingCapacity}
                      onChange={(e) => setNewNGOForm({ ...newNGOForm, servingCapacity: e.target.value })}
                      placeholder="e.g. 450"
                      className="w-full bg-[#0b0f12] border border-[#1e293b] rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase block mb-1">
                      Vehicle Fleet Readiness
                    </label>
                    <input
                      type="text"
                      value={newNGOForm.transportReadiness}
                      onChange={(e) => setNewNGOForm({ ...newNGOForm, transportReadiness: e.target.value })}
                      placeholder="e.g. Electric Insulated Van"
                      className="w-full bg-[#0b0f12] border border-[#1e293b] rounded px-3 py-1.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">
                    WhatsApp Dispatch Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newNGOForm.whatsappNumber}
                    onChange={(e) => setNewNGOForm({ ...newNGOForm, whatsappNumber: e.target.value })}
                    placeholder="e.g. 919820012345"
                    className="w-full bg-[#0b0f12] border border-[#1e293b] rounded px-3 py-1.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Dietary Toggle */}
                <div className="p-2.5 rounded bg-[#0b0f12] border border-[#1e293b] flex items-center justify-between">
                  <div className="text-[11px]">
                    <span className="text-slate-200 font-bold block">Accepts Non-Veg & Mixed Feasts</span>
                    <span className="text-[10px] text-slate-400">If unchecked, shelter will only receive Pure Veg surplus</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newNGOForm.acceptsNonVeg}
                    onChange={(e) => setNewNGOForm({ ...newNGOForm, acceptsNonVeg: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 bg-[#11171d] border-[#1e293b] focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-[#1e293b] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddNGOModalOpen(false)}
                    className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ENROLL SHELTER FLEET</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tactical Toast Notification */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-slideUp font-mono">
            <div className={`p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start justify-between gap-3 ${
              toast.type === 'purple'
                ? 'bg-[#11171d]/95 border-purple-500/60 shadow-glow-purple text-purple-200'
                : toast.type === 'emerald'
                ? 'bg-[#11171d]/95 border-emerald-500/60 shadow-tactical text-emerald-200'
                : 'bg-[#11171d]/95 border-emerald-500/50 text-slate-200'
            }`}>
              <div className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {toast.title}
                  </div>
                  <div className="text-[11px] font-sans text-slate-300 mt-0.5">
                    {toast.message}
                  </div>
                </div>
              </div>
              <button onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
