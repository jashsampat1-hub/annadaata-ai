import { NGOProfile, ExtractionResult, RescueMission } from '../types';
import { getGoogleMapsDirectionsUrl } from './googleMapsService';

export function rankNGOsForMission(
  extraction: ExtractionResult,
  ngos: NGOProfile[]
): NGOProfile[] {
  return ngos
    .map(ngo => {
      const reasons: string[] = [];

      // 1. Proximity & ETA Pillar (40 points max)
      const dist = ngo.distanceKm ?? 5;
      let proximityScore = 40;
      if (dist <= 2.5) {
        proximityScore = 40 - (dist / 2.5) * 3; // 37–40
        reasons.push(`Optimal proximity (${dist} km • ETA ~${ngo.etaMinutes || 9}m)`);
      } else if (dist <= 6.0) {
        proximityScore = 37 - ((dist - 2.5) / 3.5) * 8; // 29–37
        reasons.push(`Close transit corridor (${dist} km • ETA ~${ngo.etaMinutes || 18}m)`);
      } else if (dist <= 12.0) {
        proximityScore = 29 - ((dist - 6.0) / 6.0) * 9; // 20–29
        reasons.push(`Medium distance (${dist} km • ETA ~${ngo.etaMinutes || 25}m)`);
      } else if (dist <= 25.0) {
        proximityScore = 20 - ((dist - 12.0) / 13.0) * 10; // 10–20
        reasons.push(`Extended highway route (${dist} km • ETA ~${ngo.etaMinutes || 40}m)`);
      } else {
        proximityScore = Math.max(3, 10 - (dist - 25.0) * 0.4);
        reasons.push(`Long haul route (${dist} km)`);
      }

      // 2. Fleet Readiness & Active Drivers Pillar (25 points max)
      const drivers = ngo.activeDriversCount || 3;
      const driverPts = Math.min(12, Math.round(drivers * 2.2));
      let vehiclePts = 8;
      const v = (ngo.transportReadiness || '').toLowerCase();
      if (v.includes('insulated') || v.includes('refrigerated') || v.includes('electric') || v.includes('thermal')) {
        vehiclePts = 13;
        reasons.push(`${ngo.transportReadiness || 'Insulated Fleet'} (${drivers} drivers ready)`);
      } else if (v.includes('van') || v.includes('truck') || v.includes('camper')) {
        vehiclePts = 11;
        reasons.push(`${ngo.transportReadiness || 'Van Fleet'} (${drivers} drivers ready)`);
      } else if (v.includes('two-wheeler') || v.includes('cargo') || v.includes('bike')) {
        vehiclePts = 9;
        reasons.push(`Agile cargo fleet (${drivers} active riders)`);
      } else {
        vehiclePts = 7;
        reasons.push(`${drivers} standby drivers`);
      }
      const fleetScore = driverPts + vehiclePts;

      // 3. Capacity Matching Fit Pillar (20 points max)
      const targetServings = Math.max(50, extraction.estimatedServings || 250);
      const cap = ngo.servingCapacity || 400;
      const ratio = cap / targetServings;
      let capacityScore = 14;
      if (ratio >= 1.0 && ratio <= 2.2) {
        capacityScore = 20;
        reasons.push(`Ideal capacity (${cap} PAX cap for ${targetServings} PAX batch)`);
      } else if (ratio > 2.2 && ratio <= 3.5) {
        capacityScore = 17;
        reasons.push(`High capacity surplus buffer (${cap} PAX)`);
      } else if (ratio >= 0.7 && ratio < 1.0) {
        capacityScore = 13;
        reasons.push(`Partial batch match (${cap} of ${targetServings} PAX)`);
      } else {
        capacityScore = 9;
        reasons.push(`Capacity: ${cap} PAX`);
      }

      // 4. Dietary Compatibility & Reliability Pillar (15 points max)
      let dietScore = 10;
      const diet = extraction.dietCategory || 'Veg';
      if (diet === 'Non-Veg' || diet === 'Mixed') {
        if (!ngo.acceptsNonVeg) {
          dietScore = -35; // Critical dietary mismatch
          reasons.unshift('⚠️ Pure-veg only shelter — Ineligible for non-veg surplus');
        } else {
          dietScore = 10;
          reasons.push('Authorized for non-veg distribution');
        }
      } else {
        if (!ngo.acceptsNonVeg) {
          dietScore = 10;
          reasons.push('Dedicated pure-veg shelter');
        } else {
          dietScore = 9;
        }
      }

      const rating = ngo.rating || 4.8;
      const ratingBonus = Math.max(0, Math.min(5, Math.round((rating - 4.5) * 10)));
      const verifiedBonus = ngo.verifiedBadge ? 2 : 0;

      const rawTotal = Math.round(proximityScore + fleetScore + capacityScore + dietScore + ratingBonus + verifiedBonus);
      const finalScore = Math.max(25, Math.min(99, rawTotal));

      return {
        ...ngo,
        matchScore: finalScore,
        matchReason: reasons.slice(0, 3).join(' • ')
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function generateWhatsAppDispatchURL(
  ngo: NGOProfile,
  missionOrExtraction: ExtractionResult | RescueMission,
  donorOrgName = ''
): string {
  const isMission = 'status' in missionOrExtraction;
  const id = isMission
    ? (missionOrExtraction as RescueMission).id
    : `RESCUE-${Math.floor(1000 + Math.random() * 9000)}`;
  const title = isMission
    ? (missionOrExtraction as RescueMission).title
    : (missionOrExtraction as ExtractionResult).foodType;
  const servings = isMission
    ? (missionOrExtraction as RescueMission).servings
    : (missionOrExtraction as ExtractionResult).estimatedServings;
  const diet = missionOrExtraction.dietCategory;
  const location = isMission
    ? (missionOrExtraction as RescueMission).venueName
    : (missionOrExtraction as ExtractionResult).pickupLocation;
  const gate = isMission
    ? (missionOrExtraction as RescueMission).gate
    : (missionOrExtraction as ExtractionResult).pickupGate;
  const safeUntil = isMission
    ? (missionOrExtraction as RescueMission).safeUntil
    : (missionOrExtraction as ExtractionResult).safeUntilTime;
  const contact = isMission
    ? `${(missionOrExtraction as RescueMission).contactName} (${(missionOrExtraction as RescueMission).contactPhone})`
    : `${(missionOrExtraction as ExtractionResult).contactPerson} (${(missionOrExtraction as ExtractionResult).contactPhone})`;
  const instructions = missionOrExtraction.driverInstructions;
  const org = missionOrExtraction.donorOrg || donorOrgName || 'Verified Donor Entity';

  const dietTag = diet === 'Veg' ? '🟢 PURE VEG' : diet === 'Non-Veg' ? '🔴 NON-VEG' : '🟡 MIXED';

  const ngoOrigin = ngo.coordinates || ngo.address || `${ngo.name}, ${ngo.locality}`;
  const mapsNavigationLink = getGoogleMapsDirectionsUrl(ngoOrigin, location);

  const text = `🚨 *ANNADAATA AI — EMERGENCY FOOD RESCUE DISPATCH* 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆔 *Mission Code:* ${id}
🏛️ *Host / Donor Organisation:* ${org}
🍲 *Food Surplus:* ${title}
🏷️ *Diet Category:* ${dietTag}
👥 *Quantity:* ${servings} Servings (PAX)
⏳ *Spoilage Deadline:* ${safeUntil}

📍 *TACTICAL PICKUP:*
🏢 *Venue:* ${location}
🚪 *Pickup Gate:* ${gate}
📞 *Contact Coordinator:* ${contact}

🗺️ *GOOGLE MAPS LIVE ROUTE NAVIGATION:*
${mapsNavigationLink}
📏 *Route Distance:* ${ngo.distanceKm || '2.4'} km (ETA: ~${ngo.etaMinutes || '12'} mins via ${ngo.routeSummary || 'Arterial Corridor'})

📋 *DRIVER LOGISTICS BRIEF:*
${instructions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Reply "ACCEPT ${id}" to confirm vehicle en route.
*Annadaata AI Realtime Dispatch Grid*`;

  return `https://wa.me/${ngo.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
