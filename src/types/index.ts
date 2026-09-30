export type DietCategory = 'Veg' | 'Non-Veg' | 'Mixed';

export type MissionStatus = 'Available' | 'Claimed' | 'Picked Up' | 'Expired';

export interface ExtractionResult {
  foodType: string;
  items: string[];
  dietCategory: DietCategory;
  rawServingsInput: string;
  estimatedServings: number;
  containerBreakdown: string;
  pickupLocation: string;
  pickupGate: string;
  contactPerson: string;
  contactPhone: string;
  safeUntilTime: string;
  safeUntilTimestamp: number;
  minutesRemaining: number;
  packagingNotes: string;
  driverInstructions: string;
  donorOrg?: string;
  rawText: string;
  confidenceScore: number;
}

export interface NGOProfile {
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
  coordinates?: {
    lat: number;
    lng: number;
  };
  routeSummary?: string;
  googleMapsDirectionsUrl?: string;
}

export interface RescueMission {
  id: string;
  title: string;
  donorOrg?: string;
  venueName: string;
  location: string;
  gate: string;
  contactName: string;
  contactPhone: string;
  dietCategory: DietCategory;
  foodItems: string[];
  servings: number;
  containersDescription: string;
  safeUntil: string;
  safeUntilTimestamp: number;
  status: MissionStatus;
  claimedByNGO?: {
    id: string;
    name: string;
    phone: string;
    driverName: string;
    vehicleType: string;
    etaMinutes: number;
  };
  claimedAt?: string;
  pickedUpAt?: string;
  driverInstructions: string;
  createdAt: string;
  packagingNotes: string;
}

export interface TelemetryStats {
  activeRescues: number;
  servingsSaved: number;
  averageDispatchMins: number;
  criticalUnder45m: number;
}
