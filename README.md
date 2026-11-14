# ZENITH — Peak Astronaut Health Monitoring
### NASA Space Apps Challenge Concept Demonstration

> **Important Notice:** ZENITH is a research concept and prototype demonstration developed for the NASA Space Apps Challenge. Telemetry streams and clinical values are predominantly simulated based on aerospace human research models. This software is **not a certified medical device** and is not intended for terrestrial or extraterrestrial clinical diagnosis.

---

## 1. Project Goal & Architecture

**ZENITH** is a crew health and wellness monitoring platform engineered for long-duration space missions (e.g. Lunar Gateway, Mars transit habitats). It gives flight surgeons, mission administrators, and astronauts a unified, calm, and rigorous view of individual and crew physiological readiness across:

- Continuous biosensor vitals (heart rate, SpO₂, validated sphygmomanometer blood pressure, core temperature, respiratory rate)
- Microgravity sleep architecture and circadian hypnograms
- Countermeasure exercise tracking (ARED resistive force, T2 treadmill vibration-isolated running, CEVIS cycle ergometer)
- Space nutrition, hydration balance, and certified blood chemistry assays
- 6-Channel electroencephalography (EEG) neuro-workload and fatigue monitoring
- Opt-in visual wellbeing and posture inspection camera utilities
- Adapter-based device fleet management with granular per-metric consent controls
- Automated threshold alarms and printable flight medical digests
- Role-based access control (Astronaut, Medical Officer, Mission Administrator) and an immutable security audit trail

---

## 2. Brand & Design System

The application deliberately avoids glowing glassmorphism, rainbow charts, neon dashboards, and generic AI-generated interface tropes. Instead, it pairs:

- **Japanese-Inspired Neutral Elegance:** Understated depth, warm unbleached paper textures, and intentional whitespace.
- **Scientific Instrument Calibration:** Discrete tick lines, oscilloscope zero-lines, tabular monospace telemetry figures, and legible data readouts.
- **Editorial Typography:** High-contrast, WCAG AAA-compliant information hierarchy designed for cognitive clarity during high-stress mission operations.

### Color Tokens
- **Primary Accent:** Archival Slate Navy (`#34465A`) — Used sparingly for primary actions, navigation active states, and calibration trends.
- **Primary Hover & Pressed:** `#2F3F51` / `#293747`
- **Background:** Warm Unbleached Paper (`#F9F8F6`)
- **Main Surfaces:** Soft Ivory (`#F1EFEB`)
- **Primary Text:** Deep Charcoal (`#1A1A1A`)
- **Secondary Text:** Calibrated Slate (`#5F6670`)
- **Borders & Dividers:** Warm Gray (`#DAD7D1`)
- **Semantic Alert:** Muted Brick (`#A34A3E`) — Reserved strictly for abnormal thresholds, active alerts, and sleep deficits.

---

## 3. Application Structure (11 Functional Pages)

1. **Crew Overview:** Fleet readiness dashboard showing all crew members, status badges (Normal, Attention Required, Data Unavailable), latest vitals, last sync source, active alerts count, and configurable mission duration.
2. **Astronaut Profile:** Individual flight record with personal information, cumulative radiation exposure ($mSv$), EVA certifications, 24h / 7d / 30d time filters, and Flight Surgeon clinical notes.
3. **Vitals Telemetry:** Precision time-series strip charts for pulse, capillary oxygenation ($SpO_2$), core body temperature, and respiration, plus manual validated blood pressure cuff entries and configurable alert bounds.
4. **Sleep Architecture:** Daily and weekly sleep duration, rolling sleep debt, sleep stage hypnograms (Deep/SWS, REM, Light, Wake), and subjective astronaut sleep diaries logging microgravity disturbances (acoustic ventilation hum, restraint drift).
5. **Exercise Countermeasures:** Musculoskeletal preservation tracking for ARED (Newtons of force), T2 treadmill, and CEVIS cycle ergometer, complete with Borg RPE exertion ratings and weekly target progress.
6. **Nutrition & Labs:** Space ration logging, hydration tracking, and certified blood chemistry panels ($25\text{-OH Vitamin D}$, ferritin, electrolytes, calcium, $B_{12}$) with explicit disclaimers that optical cameras cannot diagnose nutritional deficiencies.
7. **EEG Neuro-Fatigue:** 60 FPS HTML5 Canvas waveform engine rendering 6-channel EEG traces ($Fp1, Fp2, C3, C4, Pz, O1$), $50\text{ Hz}$ notch filter, relative band power spectral densities (Delta, Theta, Alpha, Beta, Gamma), and electrode impedance monitoring ($< 5\text{ k}\Omega$).
8. **Optional Camera:** Opt-in local camera preview for posture form check and wellbeing, featuring mandatory pre-capture consent disclosures, local in-browser buffer isolation, and permanent deletion controls.
9. **Wearable & Device Fleet:** Device management for BioHarness, Astroglove, Hexoskin, and DryEEG headbands. Includes real Web Bluetooth LE detection, hardware adapter interfaces, and per-metric consent toggles.
10. **Alerts & Reports:** Threshold breach logs, stale sensor alarms, single-click flight surgeon acknowledgment, and a dedicated printable flight medical summary.
11. **Settings, RBAC & Privacy:** Switchable sample accounts (Astronaut Elena Vance, Flight Surgeon Dr. Kenjiro Sato, Mission Director Sarah Sterling), RBAC permission matrix, immutable security audit log, and full JSON telemetry data export.

---

## 4. Technical Stack & Architecture

- **Framework:** React 18 with TypeScript 5
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS with custom tactile paper tokens and print media stylesheets
- **Icons:** Lucide React
- **Visualizations:** Custom SVG precision strip charts and high-frequency HTML5 Canvas rendering
- **Device Integration:** Adapter Pattern (`IDeviceAdapter`, `SimulatedDeviceAdapter`, `BluetoothLEAdapter`)
- **State Management:** React Context with LocalStorage persistence and sanitized schema validation

```
src/
├── adapters/          # Device hardware & simulation adapters
├── components/
│   ├── charts/        # PrecisionLineChart, HypnogramChart, EEGWaveformCanvas, MiniSparkline
│   ├── common/        # Badge, Button, Card, Modal, DisclaimerBanner
│   └── layout/        # Header, Navigation, SubHeader, Footer
├── context/           # AppContext (Telemetry & Data) and AuthContext (RBAC)
├── data/              # Mock aerospace datasets, astronauts, labs, devices
├── pages/             # All 11 dedicated application views
├── types/             # Complete TypeScript interfaces
├── App.tsx            # Routing & Master layout
└── main.tsx           # Entrypoint
```

---

## 5. Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm or pnpm

### Setup Instructions
```bash
# 1. Clone or navigate to the repository
cd ZENITH

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 6. Implementation Note

### 1. What is Fully Functional
- **Complete 11-page responsive navigation** with full keyboard accessibility and active visual focus states.
- **Real-time Mission Elapsed Time (MET) clock** with configurable planned mission duration.
- **Search, multi-attribute filtering, and profile switching** across all fictional crew members.
- **60 FPS multi-channel EEG waveform canvas** with live sweep cursor, $50\text{ Hz}$ notch filter toggle, gain magnification, and electrode impedance tracking.
- **Sleep hypnogram visualization** rendering stepped sleep stages (Deep, REM, Light, Wake).
- **Manual clinical vitals logging** and **flight surgeon clinical notes entry** with automatic timestamping.
- **Interactive alert threshold configuration** that updates boundary lines on telemetry charts.
- **Opt-in camera preview and capture** using standard `navigator.mediaDevices.getUserMedia` with fallback simulated stream.
- **Printable flight medical report** with dedicated `@media print` layout formatting.
- **Role-based access control (RBAC)** simulation switching permissions between Astronaut, Medical Officer, and Mission Administrator.
- **Client-side LocalStorage persistence** allowing edits, logs, alerts, and settings to survive page reloads.

### 2. What Uses Simulated Data
- **Physiological telemetry streams** (heart rate, $SpO_2$, temperature, respiration) are generated using circadian and exertional models based on spaceflight human research data.
- **EEG waveforms** are mathematically synthesized using superimposed alpha, beta, theta, and noise vectors with physiological amplitude modulation.
- **Fictional crew profiles**, blood chemistry panels, and historical mission alerts.

### 3. What Requires External Hardware, Credentials, or Services
- **Physical Wearable Linkage:** Connecting a real physical heart rate strap requires a Chromium-based browser supporting the Web Bluetooth API with HTTPS or localhost. If unavailable, the system defaults to the calibrated hardware simulation adapter.
- **Certified Clinical Blood Chemistry:** Certified micronutrient assays require in-flight medical hardware (e.g. i-STAT cartridges or MinION sequencers). The application provides manual entry interfaces for these laboratory results.
- **Cloud Backend:** The current implementation operates as a client-side prototype with local encrypted persistence; multi-habitat synchronization would require an authenticated ground-to-orbit MQTT/REST relay.

