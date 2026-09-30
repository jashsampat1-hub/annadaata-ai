# ⚡ Annadaata AI (अन्नदाता AI)

> **Emergency Food-Rescue Platform** that bridges late-night wedding banquets, caterers, and food donors directly with nearby shelters and NGOs before surplus cooked food spoils.

![Theme](https://img.shields.io/badge/Theme-Dark--Cyber%20SaaS-emerald)
![Protocol](https://img.shields.io/badge/Protocol-Zero%20Food%20Waste-amber)
![Build](https://img.shields.io/badge/Build-Production%20Ready-success)

---

## 🌟 Product Vision & Architecture

Every midnight across metro cities like Mumbai, thousands of kilograms of pristine cooked meals from banquet celebrations and corporate galas are disposed of simply because there is no instant, frictionless logistical bridge to homeless shelters and night kitchens before spoilage sets in.

**Annadaata AI** solves this with an unformatted natural language intake engine, instant food safety categorization, live ticking spoilage timers, and intelligent 1-click WhatsApp dispatch to nearest verified NGO fleets.

---

## 🚀 Key Features & Flow

### 1. Rushed Donor Intake Terminal
- **Hurried Hinglish / English NLP Engine:** Donors, banquet managers, and bride/groom relatives can paste hurried, unorganized messages like:
  > *"4 handi chicken biryani aur dal bacha hai at Grand Banquet Kandivali, 150-180 people, gate 3, safe till 1:30 AM"*
- **Working Voice Input (Mic button):** Built-in Web Speech API voice capture allowing hands-free dictation on mobile and desktop with interactive audio waveforms and fallback support.
- **3 One-Click Banquet Presets:** Pre-loaded with realistic wedding scenarios:
  1. *Kandivali Wedding (Hinglish Biryani Feast)*
  2. *BKC Corporate Gala (Pure Veg Deluxe Buffet)*
  3. *Borivali Sangeet (Urgent Critical Feast - <45 mins)*

### 2. AI Extraction & Donor Confirmation Card
- **Automated Extraction:** Instantly classifies:
  - Food Type & Diet Category badges (`Veg`, `Non-Veg`, `Mixed`)
  - Estimated Servings Count (auto-calculated from containers, handis, trays, or headcount)
  - Pickup Location & Gate / Loading Dock details
  - Contact Person & Phone number
  - Safe-Until Time with a **live ticking countdown timer**
  - AI Driver Logistics brief & packaging recommendations
- **Confirmation Action:** Clean primary button *"Confirm & Broadcast to Nearest Shelters"* triggers celebratory confetti, sound feedback, and live mission creation.

### 3. Intelligent NGO Matching & Ranking
- **Multi-Factor Scoring Algorithm:** Evaluates verified shelter networks on:
  - Proximity / Distance (ETA in minutes)
  - Serving Capacity Fit (matching meal count with shelter capacity)
  - Transport Fleet Readiness (Electric insulated vans, refrigerated mini-trucks, cargo two-wheelers)
  - Dietary Compatibility (ensuring non-veg batches are only routed to authorized organizations)
- **#1 Ranked NGO Card:** Prominent primary action button:
  - `⚡ Alert NGO (1-Click WhatsApp Dispatch)`: Opens WhatsApp with a ready-to-send prefilled logistical payload containing mission ID, food item, exact gate, and ticking countdown deadline.

### 4. Live Rescue Mission Board & Status Lifecycle
- **Pre-Loaded Demo State:** Launches pre-seeded with 3 realistic active rescue missions:
  - Mission 1: *Grand Royal Palace, Andheri West* — **Critical Flashing Red** (< 45 minutes remaining)
  - Mission 2: *Shagun Banquet, Kandivali East* — **Amber Alert** (< 2 hours remaining, Claimed by Roti Bank)
  - Mission 3: *Sea Breeze Lawns, Bandra West* — **Safe Emerald** (> 2 hours remaining)
- **Live Ticking Countdown Timers:** Independent second-by-second countdown with dynamic color shifts (Emerald -> Amber -> Flashing Red -> Expired).
- **Interactive State Lifecycle:**
  - `Claim / Accept Mission`
  - `Advance Status (Claimed → Picked Up)`
- **Dedicated AI-Written Pickup Message Box:** Clear driver logistics (canister requirements, chef contact, loading dock ramp access).

### 5. Cyber Aesthetic & Audio Feedback
- **Slate-950 Dark Cyber UI:** Glowing emerald and amber accents, glassmorphic blur panels, scanline subtle elements, and responsive layout.
- **Synthesized Web Audio:** Cyber radar pings, critical countdown beeps, and success chords generated dynamically via the Web Audio API without external asset dependencies.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite 6
- **Styling:** Tailwind CSS, Glassmorphism, Custom Cyber Shaders
- **Icons:** Lucide React
- **Celebration Effects:** Canvas Confetti
- **Audio Synthesizer:** Native Web Audio API
- **Speech Dictation:** Web Speech API (`webkitSpeechRecognition`)

---

## 💻 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in your browser
http://localhost:3000
```
