# ⚡ Annadaata AI (अन्नदाता AI)

> **Autonomous Midnight Emergency Food-Rescue Protocol & Dispatch Platform**
> Bridging late-night wedding banquets, caterers, and bulk food donors directly with verified shelters and NGO fleets across Mumbai before surplus cooked food spoils.

[![GitHub Repository](https://img.shields.io/badge/GitHub-jashsampat1--hub%2Fannadaata--ai-181717?logo=github)](https://github.com/jashsampat1-hub/annadaata-ai)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Location](https://img.shields.io/badge/Coverage-Mumbai%20Metropolitan-emerald)](https://maps.google.com)
[![Protocol](https://img.shields.io/badge/Protocol-Zero%20Food%20Waste-amber)](https://github.com/jashsampat1-hub/annadaata-ai)

---

## 🌟 The Core Problem & Vision

Every midnight across metropolitan centers like Mumbai, thousands of kilograms of pristine, freshly prepared food from grand wedding celebrations, corporate galas, and banquet halls are discarded simply because:
1. Donors and caterers are exhausted at 1:00 AM and cannot navigate complex NGO sign-up forms.
2. Cooked food has a perishable window of under 2 to 3 hours before bacterial spoilage sets in.
3. NGOs and volunteer fleets lack real-time visibility into exact gate numbers, loading docks, container counts, and vehicle clearance requirements.

**Annadaata AI** solves this with an instantaneous, low-friction emergency response system: an unformatted natural language intake engine (supporting hurried Hinglish/English text and hands-free voice dictation), intelligent food safety extraction, an interactive **Google Maps Dispatch Radar**, and **1-click WhatsApp dispatch** to verified NGO response vehicles.

---

## 🚀 Key Modules & Capabilities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             ANNADAATA AI PIPELINE                           │
└─────────────────────────────────────────────────────────────────────────────┘
  [ Voice / Hinglish Donor Input ] 
                 │
                 ▼
  [ AI Parser & Extraction Engine ] ──► (Diet, Servings, Gate, Spoilage Expiry)
                 │
                 ▼
  [ Google Maps Dispatch Radar ]   ──► (Live GPS, Mumbai Locality Presets, Distance)
                 │
                 ▼
  [ Multi-Factor NGO Matcher ]     ──► (Proximity, Capacity, Fleet, Veg/Non-Veg)
                 │
                 ▼
  [ 1-Click WhatsApp Driver Link ] ──► (Instant Dispatch to Electric Vans/Trucks)
                 │
                 ▼
  [ Live Mission Command Board ]   ──► (Ticking Countdown Timers & State Transitions)
```

### 1. Rushed Donor Intake Terminal
- **Hurried Hinglish / English NLP Engine:** Banqueters and caterers can type or paste messy messages without any rigid formatting:
  > *"4 handi chicken biryani aur dal bacha hai at Grand Banquet Kandivali, 150-180 people, gate 3 near kitchen loading dock, safe till 1:30 AM. Call Chef Ramesh 9820198201"*
- **Hands-Free Voice Dictation (Web Speech API):** Live microphone capture with speech recognition (`webkitSpeechRecognition`), animated audio waveforms, and instant transcription for rapid hands-free entry in busy kitchens.
- **One-Click Mumbai Banquet Presets:**
  - *Preset 1 (Kandivali Wedding):* Hinglish Non-Veg Chicken Biryani & Dal feast.
  - *Preset 2 (BKC Corporate Gala):* English Pure-Veg Deluxe Buffet (Paneer Lababdar, Dal Makhani, Jeera Rice).
  - *Preset 3 (Borivali Sangeet):* Urgent mixed feast under 40 minutes remaining.

### 2. AI Extraction & Donor Confirmation Card
- **Instant Parameter Extraction:**
  - **Diet & Category:** Categorized into `Veg`, `Non-Veg`, or `Mixed`.
  - **Servings Estimation:** Automatically computes meal count from handis, containers, trays, or headcounts.
  - **Logistical Clearance:** Identifies exact pickup gates, loading ramps, and kitchen contact persons with phone numbers.
  - **Safe-Until Window:** Computes safety window with a real-time ticking countdown clock.
  - **Driver Handling Instructions:** Recommends thermal containers, insulated bags, and vehicle types.
- **One-Click Confirmation:** Generates an active rescue mission with audio chords and celebration confetti (`canvas-confetti`).

### 3. Google Maps Dispatch Radar & Mumbai Geolocation Routing
- **Interactive Radar Visualization:**
  - Radial concentric range rings (2 km, 5 km, 10 km) with animated cyber radar sweeps.
  - Real-time location marker showing the donor's banquet location in Mumbai.
  - Interactive NGO fleet pins with status, distance in kilometers, and estimated drive time.
- **Live Device Geolocation (`navigator.geolocation`):**
  - One-tap device GPS lock with automatic latitude/longitude acquisition.
  - Reverse geocoding of coordinates into Mumbai street addresses.
- **Mumbai Locality Quick-Switcher:**
  - Instant preset coordinates for major banquet hubs: *Kandivali West, BKC G-Block, Borivali West, Andheri West, Bandra West, Powai, Dadar, and Colaba*.
- **Google Maps Navigation Integration:**
  - Generates direct Google Maps turn-by-turn navigation URLs (`https://www.google.com/maps/dir/?api=1&...`) for drivers.
  - Computes driving distance and ETA using coordinates and road curvature heuristics.

### 4. Intelligent NGO Matching & WhatsApp 1-Click Dispatch
- **Multi-Factor Ranking Algorithm:**
  - **Proximity:** Evaluates nearest response vehicles within response radius.
  - **Serving Capacity:** Matches batch size with shelter distribution limits.
  - **Fleet Readiness:** Evaluates transport capability (Electric Insulated Vans, Refrigerated Trucks, Two-Wheeler Quick Response).
  - **Dietary Strictness:** Ensures non-veg food is never routed to pure-vegetarian shelters.
- **Instant WhatsApp Dispatch Payload:**
  - Generates pre-formatted WhatsApp deep links (`https://api.whatsapp.com/send?phone=...`) ready to send directly to fleet coordinators:
    ```
    🚨 EMERGENCY FOOD RESCUE DISPATCH #MUM-2026-884
    📍 Pickup: Grand Royal Palace, Link Road, Andheri West
    🚪 Gate/Dock: Kitchen Gate 4 (Basement ramp)
    🍲 Food: 220-250 Servings (Chicken Biryani & Mixed Starters)
    ⏳ SAFE UNTIL: 01:15 AM (38m remaining - CRITICAL)
    👤 Contact: Banquet Manager Suresh (9820198201)
    🗺️ Route: https://www.google.com/maps/dir/?api=1&destination=19.1363,72.8277
    ```

### 5. Live Rescue Mission Board & Status Lifecycle
- **Real-Time Ticking Countdowns:** Independent second-by-second countdown timers on every mission.
- **Dynamic Threat Level Alerts:**
  - 🟢 **Safe (> 2 hrs):** Emerald indicator, calm delivery window.
  - 🟡 **Warning (< 2 hrs):** Amber indicator, priority dispatch needed.
  - 🔴 **Critical (< 45 mins):** Pulsing red emergency alert, highest fleet priority.
  - ⚫ **Expired:** Marked as spoiled/expired to ensure food safety compliance.
- **Interactive Lifecycle Progression:**
  - `Accept / Claim Mission` ➔ `Mark as Picked Up` ➔ `Complete Delivery`.

### 6. Impact Analytics & Telemetry Dashboard
- Real-time performance indicators:
  - **Total Servings Rescued:** Live cumulative counter (14,850+ meals).
  - **Average Response Latency:** Rapid response tracking (~14.2 minutes).
  - **Active Emergency Rescues:** Real-time active mission counter.
  - **Critical Missions (<45m):** High-priority triage indicator.
  - **Estimated Carbon Offset:** Environmental savings from avoided organic landfill methane emissions.

### 7. Cyber-Slate Aesthetic & Procedural Web Audio Engine
- **Visual Design:** High-contrast Dark Cyber UI (`slate-950`), glowing emerald/amber status accents, scanline overlays, and responsive mobile-first grid.
- **Native Web Audio Synthesizer:** Pure procedural audio generated directly via the browser's `AudioContext` without requiring external sound files:
  - Radar sweep pings
  - Mission accepted harmonic chords
  - Critical timer warning beeps
  - Confetti burst fanfare

---

## 📂 Project Directory Structure

```
Annadaata AI/
├── index.html                   # HTML entry point with dark cyber viewport meta
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration (port 3000, React plugin)
├── tailwind.config.js           # Cyber theme colors (emerald, amber, cyan, slate)
├── postcss.config.js            # PostCSS configuration
│
├── src/
│   ├── main.tsx                 # React application bootstrapper
│   ├── App.jsx                  # Main application orchestrator & tab controller
│   ├── index.css                # Custom cyber CSS variables & radar animations
│   │
│   ├── components/
│   │   ├── DonorInputPanel.tsx             # Voice/text intake & banquet scenario presets
│   │   ├── ExtractionConfirmationCard.tsx  # Extracted parameters & mission trigger
│   │   ├── GoogleMapDispatchRadar.tsx      # Interactive radar, GPS locator & Mumbai map
│   │   ├── NGOMatchingGrid.tsx             # Ranked NGO cards & 1-click WhatsApp dispatch
│   │   ├── LiveRescueBoard.tsx             # Active missions, status lifecycle & timers
│   │   └── Header.tsx                      # Top bar with cyber telemetry & audio toggle
│   │
│   ├── utils/
│   │   ├── aiParser.ts          # Natural language extraction & food safety parser
│   │   ├── googleMapsService.ts # Geolocation, reverse geocoding & route calculations
│   │   ├── ngoMatcher.ts        # NGO scoring algorithm & WhatsApp payload generator
│   │   ├── soundEffects.ts      # Native Web Audio API procedural sound synthesizer
│   │   └── confetti.ts          # Celebration particle effects
│   │
│   ├── data/
│   │   └── mockData.ts          # Verified Mumbai NGOs, preset scenarios & seed missions
│   │
│   └── types/
│       └── index.ts             # TypeScript interfaces (Missions, NGOs, ExtractionResult)
```

---

## 🛠️ Tech Stack & Libraries

| Technology | Purpose |
| :--- | :--- |
| **React 18** | High-performance reactive UI rendering |
| **TypeScript 5.7** | Type safety across mission states, coordinates, and NGO schemas |
| **Vite 6** | Ultra-fast build tool and development server |
| **Tailwind CSS 3.4** | Modern dark-mode utility-first styling |
| **Lucide React** | Clean, minimalist cyber UI icons |
| **Canvas Confetti** | Confetti celebration on mission confirmation |
| **Web Audio API** | Zero-latency procedural audio synthesis |
| **Web Speech API** | In-browser speech-to-text voice recognition |
| **Google Maps API Helpers** | Geolocation, distance matrix, and directions deep linking |

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/jashsampat1-hub/annadaata-ai.git
cd annadaata-ai

# 2. Install dependencies (already committed in repo for offline reproducibility)
npm install

# 3. Launch development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

### Production Build

```bash
# Type check and build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🤝 Verified NGO Partner Network (Mumbai Pilot)

- **Roti Bank Mumbai Central** — Rapid Night Response Fleet (Electric Insulated Vans)
- **Annamrita Foundation Hub** — Mega Kitchen Distribution Network (Refrigerated Trucks)
- **Khaana Chahiye Emergency Response** — Western Express Corridor Fleet
- **Robin Hood Army (Andheri/Bandra Chapter)** — Night Volunteer Network (Insulated Cargo)
- **No Food Waste Foundation** — South & Central Mumbai Logistics

---

## 📄 License

This project is open-source and dedicated to eliminating midnight food waste across urban communities.
