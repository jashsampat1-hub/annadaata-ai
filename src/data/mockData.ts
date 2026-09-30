import { RescueMission, NGOProfile, ExtractionResult } from '../types';

export const INITIAL_STATS = {
  activeRescues: 3,
  servingsSaved: 14850,
  averageDispatchMins: 14.2,
  criticalUnder45m: 1
};

export const PRESET_SCENARIOS = [
  {
    id: 'preset-1',
    label: 'Banquet 1: Kandivali Wedding (Hinglish)',
    badge: 'Non-Veg Biryani Feast',
    urgencyHint: 'Safe ~75m',
    donorOrg: 'Grand Royal Banquets & Hospitality (Kandivali)',
    text: '4 handi chicken biryani aur dal bacha hai at Grand Banquet Kandivali West, 150-180 people, gate 3 near kitchen loading dock, safe till 1:30 AM. Call Chef Ramesh 9820198201',
    location: {
      address: 'Grand Banquet, MG Road, Near Link Road, Kandivali West, Mumbai, Maharashtra 400067',
      locality: 'Kandivali West',
      coordinates: { lat: 19.2065, lng: 72.8358 }
    }
  },
  {
    id: 'preset-2',
    label: 'Banquet 2: BKC Corporate Gala (English)',
    badge: 'Pure Veg Deluxe',
    urgencyHint: 'Safe ~160m',
    donorOrg: 'Sofitel BKC Grand Ballroom & Events',
    text: 'Excess luxury buffet surplus at Grand Sapphire BKC: 3 thermal trays Paneer Lababdar, 4 warmers Dal Makhani, 50kg fragrant Jeera Rice and Rotis. Approx 240 servings, 100% Pure Veg, safe till 2:45 AM, rear service dock B, contact banquet supervisor Vikram 9811223344',
    location: {
      address: 'Grand Sapphire, C-57, G Block, Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051',
      locality: 'Bandra Kurla Complex (BKC)',
      coordinates: { lat: 19.0657, lng: 72.8688 }
    }
  },
  {
    id: 'preset-3',
    label: 'Banquet 3: Borivali Sangeet (Critical)',
    badge: 'Mixed Feast • Urgent',
    urgencyHint: 'Safe ~38m',
    donorOrg: 'Royal Heritage Lawns & Cultural Events',
    text: 'URGENT: Sangeet ceremony ended abruptly at Royal Heritage Borivali. 6 handis of Pav Bhaji, Biryani & Gulab Jamun, safe for only 40 mins till 12:45 AM. Around 320 portions, Gate 1 loading bay, ask for Caterer Mahendra 9899001122',
    location: {
      address: 'Royal Heritage Lawns, Gorai Road, Borivali West, Mumbai, Maharashtra 400091',
      locality: 'Borivali West',
      coordinates: { lat: 19.2315, lng: 72.8562 }
    }
  }
];

export const INITIAL_NGOS: NGOProfile[] = [
  {
    id: 'ngo-1',
    name: 'Roti Bank Mumbai Central',
    tagline: 'Rapid Night Response Fleet',
    locality: 'Kandivali / Malad Corridor',
    address: 'Plot 14, Charkop Sector 2, Link Road, Kandivali West, Mumbai, Maharashtra 400067',
    coordinates: { lat: 19.2140, lng: 72.8335 },
    distanceKm: 2.0,
    etaMinutes: 8,
    servingCapacity: 450,
    transportReadiness: 'Electric Insulated Van Ready',
    phone: '+91 98200 12345',
    whatsappNumber: '919820012345',
    acceptsNonVeg: true,
    activeDriversCount: 4,
    rating: 4.95,
    matchScore: 95,
    matchReason: 'Optimal proximity (<2.5 km) • Electric Insulated Van • 4 active drivers',
    verifiedBadge: true
  },
  {
    id: 'ngo-2',
    name: 'Annamrita Foundation Hub',
    tagline: 'Community Kitchen & Night Shelters',
    locality: 'Borivali East',
    address: 'Annamrita Central Kitchen, Dahisar-Borivali Link Rd, Borivali West, Mumbai, Maharashtra 400103',
    coordinates: { lat: 19.2437, lng: 72.8550 },
    distanceKm: 7.3,
    etaMinutes: 21,
    servingCapacity: 600,
    transportReadiness: 'Refrigerated Mini-Truck on Standby',
    phone: '+91 98200 67890',
    whatsappNumber: '919820067890',
    acceptsNonVeg: false,
    activeDriversCount: 3,
    rating: 4.90,
    matchScore: 82,
    matchReason: 'High serving capacity (600+ PAX) • Refrigerated Mini-Truck • Pure Veg focus',
    verifiedBadge: true
  },
  {
    id: 'ngo-3',
    name: 'Robin Hood Army - Suburbs North',
    tagline: 'Volunteer Fast Response Network',
    locality: 'Andheri West / Lokhandwala',
    address: 'Robin Hood Hub, 4 Bungalows, Lokhandwala Complex, Andheri West, Mumbai, Maharashtra 400053',
    coordinates: { lat: 19.1363, lng: 72.8277 },
    distanceKm: 9.5,
    etaMinutes: 25,
    servingCapacity: 250,
    transportReadiness: '3 Cargo Two-Wheelers with Thermal Tubs',
    phone: '+91 98333 44556',
    whatsappNumber: '919833344556',
    acceptsNonVeg: true,
    activeDriversCount: 6,
    rating: 4.88,
    matchScore: 74,
    matchReason: 'Agile cargo two-wheeler fleet (6 drivers) • Quick alleyway pickups',
    verifiedBadge: true
  },
  {
    id: 'ngo-4',
    name: 'Khaana Chahiye Emergency Wing',
    tagline: 'Night Transit & Homeless Shelters',
    locality: 'Goregaon West',
    address: 'WEH Transit Station, SV Road, Near Filmistan Studio, Goregaon West, Mumbai, Maharashtra 400062',
    coordinates: { lat: 19.1663, lng: 72.8480 },
    distanceKm: 6.3,
    etaMinutes: 18,
    servingCapacity: 350,
    transportReadiness: 'Bolero Maxi-Van with 4 Handlers',
    phone: '+91 98700 99887',
    whatsappNumber: '919870099887',
    acceptsNonVeg: true,
    activeDriversCount: 2,
    rating: 4.82,
    matchScore: 78,
    matchReason: 'Western Express Highway corridor fleet • Heavy batch transport',
    verifiedBadge: true
  }
];

// Helper to generate dynamic timestamps relative to current session
export const getInitialRescueMissions = (): RescueMission[] => {
  const now = Date.now();

  return [
    {
      id: 'MISSION-7081',
      title: 'Grand Royal Palace Banquet',
      donorOrg: 'Grand Royal Banquets & Hospitality',
      venueName: 'Grand Royal Palace, Andheri West',
      location: 'New Link Road, Near Andheri Sports Complex, Andheri West, Mumbai',
      gate: 'Gate 3 - Rear Kitchen Loading Dock',
      contactName: 'Chef Mohan Sharma',
      contactPhone: '+91 98201 44552',
      dietCategory: 'Veg',
      foodItems: ['Paneer Lababdar (2 Handis)', 'Dal Makhani (3 Warmers)', 'Jeera Rice & Tandoori Rotis'],
      servings: 240,
      containersDescription: '5 Heavy Warmers / Handis, approx 240 portions',
      safeUntil: 'Safe till 12:35 AM',
      safeUntilTimestamp: now + 38 * 60 * 1000 + 15 * 1000, // 38 mins remaining → CRITICAL
      status: 'Available',
      driverInstructions: 'Driver Instructions: Food is packed in hot cauldrons. Bring 4 insulated food grade tubs. Enter through Gate 3 service ramp, ask for Chef Mohan.',
      createdAt: '22m ago',
      packagingNotes: 'Requires 4-5 insulated transport tubs. Hot food at 68°C.'
    },
    {
      id: 'MISSION-7082',
      title: 'Shagun Imperial Banquet Hall',
      donorOrg: 'Shagun Imperial Banquets',
      venueName: 'Shagun Banquet, Kandivali East',
      location: 'Akurli Road, Near Growel 101, Kandivali East, Mumbai',
      gate: 'Gate 2 - Service Elevator Bay',
      contactName: 'Catering Incharge Sunil',
      contactPhone: '+91 98212 99881',
      dietCategory: 'Non-Veg',
      foodItems: ['Chicken Dum Biryani (4 Large Handis)', 'Mutton Rogan Josh', 'Rumali Roti & Mirchi Ka Salan'],
      servings: 180,
      containersDescription: '4 Sealed copper-finish Handis + 2 large gravies',
      safeUntil: 'Safe till 1:15 AM',
      safeUntilTimestamp: now + 74 * 60 * 1000 + 40 * 1000, // 74 mins → AMBER
      status: 'Claimed',
      claimedByNGO: {
        id: 'ngo-1',
        name: 'Roti Bank Mumbai Central',
        phone: '+91 98200 12345',
        driverName: 'Dilip (Driver ID: RB-09)',
        vehicleType: 'Tata Ace Insulated Electric Van',
        etaMinutes: 11
      },
      claimedAt: '12m ago',
      driverInstructions: 'Driver Instructions: Verified with Chef Sunil. 4 Large Handis sealed with foil. Hand trolley recommended for quick dispatch from Gate 2.',
      createdAt: '34m ago',
      packagingNotes: 'Handis are hot and sealed. Insulated vehicle floor mats recommended.'
    },
    {
      id: 'MISSION-7083',
      title: 'Sea Breeze Open Lawns',
      donorOrg: 'Sea Breeze Events & Lawns',
      venueName: 'Sea Breeze Lawns, Bandra West',
      location: 'Carter Road Promenade, Bandra West, Mumbai',
      gate: 'Main Service Gate near Sea Face Entry',
      contactName: 'Banquet Lead Zaid Khan',
      contactPhone: '+91 98199 77665',
      dietCategory: 'Veg',
      foodItems: ['Vegetable Pulao (3 Degchas)', 'Kadai Vegetable', 'Gulab Jamun (2 Tubs)', 'Raita & Papad'],
      servings: 350,
      containersDescription: '3 Large Degchas + 2 Stainless Steel Tubs',
      safeUntil: 'Safe till 2:30 AM',
      safeUntilTimestamp: now + 165 * 60 * 1000, // 2h 45m → NORMAL EMERALD
      status: 'Available',
      driverInstructions: 'Driver Instructions: Enter via Carter road service lane. Ample parking for van. Contact Zaid at security desk.',
      createdAt: '10m ago',
      packagingNotes: 'Desserts packed separately in lidded tubs. Veg verification seal applied.'
    }
  ];
};

export const INITIAL_EXTRACTION_PREVIEW: ExtractionResult = {
  foodType: 'Chicken Dum Biryani & Dal / Tadka',
  items: ['4 Handi Chicken Dum Biryani', 'Yellow Dal Tadka', 'Steamed Rice'],
  dietCategory: 'Non-Veg',
  rawServingsInput: '4 handis (~168 servings)',
  estimatedServings: 168,
  containerBreakdown: '4 Large Handis (40-45 servings each)',
  pickupLocation: 'Grand Banquet & Lawns, Link Road, Kandivali West, Mumbai',
  pickupGate: 'Gate 3 - Kitchen Loading Dock',
  contactPerson: 'Chef Ramesh',
  contactPhone: '9820198201',
  safeUntilTime: 'Safe till 1:30 AM',
  safeUntilTimestamp: Date.now() + 95 * 60 * 1000,
  minutesRemaining: 95,
  packagingNotes: 'Non-Veg preparation. Requires separate heavy-duty hot canisters to prevent spillage.',
  driverInstructions: 'Driver Instructions: Bring 4 large insulated canisters. Reach Gate 3 - Kitchen Loading Dock at Grand Banquet & Lawns, Link Road, Kandivali West, Mumbai. Coordinate with Grand Royal Banquets & Hospitality staff (Contact: Chef Ramesh 9820198201) at loading ramp.',
  donorOrg: 'Grand Royal Banquets & Hospitality',
  rawText: '4 handi chicken biryani aur dal bacha hai at Grand Banquet Kandivali West, 150-180 people, gate 3 near kitchen loading dock, safe till 1:30 AM. Call Chef Ramesh 9820198201',
  confidenceScore: 97
};
