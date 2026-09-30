# Surplus Food Matcher

> Built for **Vibe Coding Event 2026 — Day 2 (30th)**  
> **Problem Statement #5:** Surplus Food Matcher  
> **Target Persona:** Food Donors (Wedding Halls / Caterers) & Shelter Coordinators  
> **Live Demo:** [https://annadaata-ai.vercel.app](https://annadaata-ai.vercel.app)  
> **Repository:** [https://github.com/jashsampat1-hub/annadaata-ai](https://github.com/jashsampat1-hub/annadaata-ai)

## Problem & Solution
How might we turn a donor's quick message into a clear listing with AI, and match it to the right NGO before the food spoils?

Every midnight across cities like Mumbai, banquets, wedding halls, and caterers generate massive amounts of pristine cooked surplus food. Because donors are exhausted at 1:00 AM and cannot navigate complex portals, and because cooked meals spoil within 2 to 3 hours, meals are tragically discarded.

**Annadaata AI (Surplus Food Matcher)** solves this by allowing donors to paste raw, unorganized messages (in Hinglish or English) or speak via a hands-free microphone. The system instantly extracts food type, estimated servings, pickup gate, contact info, and spoilage deadlines, calculates nearby NGO proximity via an interactive dispatch radar, and triggers a 1-click WhatsApp dispatch directly to verified response vehicles.

### Constraint Addressed
Cooked food stays safe for only a few hours, so each listing has a deadline and the match must happen fast.
- Every rescue mission features a **live ticking countdown timer** with dynamic visual threat states (🟢 Safe > 2h ➔ 🟡 Warning < 2h ➔ 🔴 Critical < 45m ➔ ⚫ Expired).
- Multi-factor NGO ranking prioritizes closest fleets with matching insulated vehicles (Electric Vans, Refrigerated Trucks) to guarantee pickup within the safe window.

## Core AI Architecture
- **Model / Service:**
  - **Natural Language Parsing Engine (`aiParser.ts`):** Context-aware heuristic and semantic NLP parser capable of handling rushed multi-lingual (Hinglish/English) expressions, kitchen units (handis, trays, kg, headcounts), and colloquial time references ("safe till 1:30 AM", "only 40 mins left").
  - **Voice Capture Service (`Web Speech API`):** In-browser speech-to-text dictation using `webkitSpeechRecognition` with dynamic waveform animations for hands-free intake in busy banquet kitchens (runs client-side, zero latency, zero API key required).
  - **Geolocation & Route Service (`googleMapsService.ts`):** OpenStreetMap / Photon Geocoding API (`photon.komoot.io`) for high-speed Indian address geocoding, plus Google Maps Directions API deep-link integration.
  - **Procedural Synthesizer (`Web Audio API`):** Zero-latency browser audio synthesis for cyber radar sweeps, critical countdown alerts, and confirmation chords.

- **Workflow:**
  1. **Intake:** Donor speaks or pastes a raw message or selects a realistic banquet preset (Kandivali Biryani Feast, BKC Pure-Veg Gala, Borivali Urgent Sangeet).
  2. **Extraction & Classification:** The AI parser structures the raw input into diet category (`Veg`, `Non-Veg`, `Mixed`), servings count, pickup gate/dock, contact info, and safe-until deadline.
  3. **Radar & Proximity Mapping:** Visualizes donor location against verified Mumbai shelters on an interactive concentric dispatch radar (2 km, 5 km, 10 km).
  4. **Intelligent NGO Matching:** Evaluates shelter networks on proximity, spare capacity, dietary compatibility, and vehicle readiness.
  5. **1-Click WhatsApp Dispatch:** Generates a prefilled, structured dispatch message with driver GPS directions, gate access details, and urgency countdown.
  6. **Live Mission Command Board:** Tracks active rescues with live ticking timers and interactive lifecycle states (`Claimed` ➔ `Picked Up` ➔ `Delivered`).

- **Error Handling:**
  - **Missing Input Tolerance:** Automatically applies sensible fallback estimations if quantities or contact details are omitted.
  - **Dietary Safety Guardrails:** Restricts non-veg food batches from ever being routed to pure-vegetarian shelters or food banks.
  - **GPS Fallback Presets:** If browser location access is denied, smoothly falls back to verified Mumbai banquet cluster presets (Kandivali, BKC, Borivali, Andheri, Bandra, Powai, Dadar, Colaba).
  - **Speech Error Recovery:** Catches microphone permission denials and unsupported browser environments with clear text-based fallback alerts.

## API Keys & Integrations

The platform is designed to be instantly usable out-of-the-box using native browser APIs and open endpoints, while also supporting optional cloud API keys:

| API / Service | Key Name | Purpose | Required / Default |
| :--- | :--- | :--- | :--- |
| **Google Gemini API** | `GEMINI_API_KEY` / `VITE_GEMINI_API_KEY` | Optional cloud LLM inference for extended multi-lingual reasoning | *Optional* (In-app AI parser runs client-side by default) |
| **Google Maps Platform** | `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript SDK & custom vector tiles | *Optional* (Dynamic radar & directions URLs work without keys) |
| **Photon Geocoding API** | *(No key needed)* | Free Indian address geocoding & reverse geocoding via OpenStreetMap | *Built-in / Zero Config* |
| **Web Speech API** | *(Browser Native)* | Real-time speech-to-text voice dictation | *Built-in / Zero Config* |
| **Web Audio API** | *(Browser Native)* | Synthetic procedural audio radar pings & emergency countdown alarms | *Built-in / Zero Config* |

## Prerequisites & Installation

```bash
# 1. Clone repository
git clone https://github.com/jashsampat1-hub/annadaata-ai.git
cd "Annadaata AI"

# 2. Install dependencies
npm install

# 3. Environment variables
# Copy template and add optional keys to .env.local:
cp .env.example .env.local

# In .env.local:
# GEMINI_API_KEY=your_gemini_api_key_here
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Participant Info
- **Name:** Jash Sampat
- **College ID:** [Your ID]
- **Day:** Day 2 (30th)
