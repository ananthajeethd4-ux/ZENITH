# ZENITH

**Peak Astronaut Health Monitoring**

ZENITH is a concept prototype for viewing crew health information during long-duration space missions. It brings simulated crew vitals, sleep, exercise, EEG visualizations, alerts and reports into one interface.

> **Prototype notice:** Crew members and health readings are simulated. ZENITH is not a medical device and must not be used for diagnosis or clinical decisions.

## Live concept

The [ZENITH demonstration](https://zenith-silk-ten.vercel.app/) uses a separate dark frontend. This repository's `master` branch contains an earlier version of the application, so its appearance and features can differ from the deployed site.

## Features in this repository

- Crew overview with fictional astronaut profiles and health summaries.
- Vitals, sleep, exercise, nutrition and lab views using demonstration data.
- Simulated EEG visualization and device adapters.
- Alert and reporting interfaces, including a printable report.
- Browser-based storage for prototype records and settings.
- A telemetry dashboard with mock vitals and an IndexedDB queue.

The role selection, audit information and consent controls are demonstration interfaces. They are not a production security or medical compliance system.

## Mock EEG and ECG work

[Pull request #5](https://github.com/ananthajeethd4-ux/ZENITH/pull/5) adds synthetic EEG and ECG samples to the existing mock telemetry stream. These changes are on a separate branch and are not yet connected to the dark frontend.

The repository's Vite telemetry sync endpoint runs in development and preview. It validates and acknowledges batches but does not provide durable server storage. It is not deployed as a production backend on the current Vercel site.

## Communication concept

A future system could package telemetry for a spacecraft communications system and decode received packets on the ground. ZENITH does not currently transmit radio signals. A real link would require suitable radio hardware, antennas, ground equipment and integration with the mission's communications system.

## Technology

- React and TypeScript
- Vite and Tailwind CSS
- Lucide React
- Dexie and IndexedDB for the telemetry queue
- SVG and canvas visualizations

## Run locally

Requires Node.js and npm.

```bash
git clone https://github.com/ananthajeethd4-ux/ZENITH.git
cd ZENITH
npm install
npm run dev
```

Open the local URL printed by Vite. To build and preview:

```bash
npm run build
npm run preview
```

## Next steps

- Integrate the mock telemetry stream with the dark frontend.
- Develop an authenticated backend with durable storage.
- Test simulated communication and recovery after connectivity loss.
- Evaluate compatible sensors and radio hardware for a physical prototype.
