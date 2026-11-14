import { Astronaut } from '../types/astronaut';
import { VitalReading, VitalThresholds } from '../types/vitals';
import { SleepSession, SleepDiaryEntry } from '../types/sleep';
import { ExerciseSession, ExerciseGoal } from '../types/exercise';
import { FoodLogEntry, MicronutrientLabRecord, NutritionGoals } from '../types/nutrition';
import { EEGSession } from '../types/eeg';
import { MedicalDevice, DeviceConsentSettings } from '../types/device';
import { HealthAlert } from '../types/alert';
import { AuditLogEntry, CameraMediaRecord } from '../types/audit';
import { UserSession } from '../types/user';

export const INITIAL_MISSION = {
  name: 'ARES-IV Deep Space Transit',
  target: 'Lunar Gateway & Mars Flyby Simulation',
  launchDate: '2026-06-25T08:00:00Z',
  totalDays: 360,
  currentMetDays: 142,
  habitatPressureKpa: 101.3,
  ambientCo2_percent: 0.32,
  radiationRate_uSv_hr: 24.8,
};

export const INITIAL_USERS: UserSession[] = [
  {
    id: 'USR-MED-01',
    name: 'Dr. Kenjiro Sato, MD',
    role: 'medical_officer',
    callsign: 'Ronin',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
    securityClearance: 'Flight Surgeon Level 2',
  },
  {
    id: 'USR-AST-01',
    name: 'Elena Vance, Ph.D.',
    role: 'astronaut',
    astronautId: 'AST-0824',
    callsign: 'Vanguard',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    securityClearance: 'Flight Crew Level 1',
  },
  {
    id: 'USR-ADM-01',
    name: 'Flight Director Sarah Sterling',
    role: 'mission_administrator',
    callsign: 'CAPCOM-Lead',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    securityClearance: 'Mission Director Level 3',
  },
];

export const INITIAL_ASTRONAUTS: Astronaut[] = [
  {
    id: 'AST-0824',
    name: 'Elena Vance',
    role: 'Commander',
    agency: 'NASA',
    callsign: 'Vanguard',
    status: 'normal',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    missionAssigned: 'ARES-IV Deep Space Transit',
    bloodType: 'O+',
    age: 39,
    cumulativeRadiation_mSv: 34.2,
    evaQualifications: ['EVA Lead Level 3', 'Robotic Arm Specialist', 'Emergency Tether Op'],
    lastSync: '2026-11-14T08:42:00Z',
    dataSource: 'BioHarness v3 [Simulated]',
    isSimulatedData: true,
    medicalNotes: [
      {
        id: 'NOT-01',
        date: '2026-11-12T14:00:00Z',
        author: 'Dr. Kenjiro Sato',
        role: 'Flight Surgeon',
        content: 'Post-aerobic cardiopulmonary recovery is stable. Resting pulse is within prime baseline. Advised continuation of 1200 mg Calcium and Vitamin D3 countermeasure.',
        isConfidential: false,
      },
    ],
  },
  {
    id: 'AST-0912',
    name: 'Dr. Kenjiro Sato',
    role: 'Flight Surgeon',
    agency: 'JAXA',
    callsign: 'Ronin',
    status: 'normal',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250',
    missionAssigned: 'ARES-IV Deep Space Transit',
    bloodType: 'A+',
    age: 44,
    cumulativeRadiation_mSv: 28.6,
    evaQualifications: ['EVA Medical Rescue', 'Hyperbaric Chamber Supervisor'],
    lastSync: '2026-11-14T08:44:00Z',
    dataSource: 'Hexoskin Astro',
    isSimulatedData: true,
    medicalNotes: [
      {
        id: 'NOT-02',
        date: '2026-11-10T16:30:00Z',
        author: 'Ground Medical Ops (Dr. H. Adams)',
        role: 'Deputy Flight Surgeon',
        content: 'Surgeon self-assessment routine verified. CEVIS cycle ergometer power profile demonstrates 98% VO2 max maintenance.',
        isConfidential: false,
      },
    ],
  },
  {
    id: 'AST-1045',
    name: 'Maya Lin',
    role: 'Mission Specialist (Robotics)',
    agency: 'CSA',
    callsign: 'Helix',
    status: 'attention',
    statusReason: 'Sleep deficit detected (-2.3h vs baseline) following 6.5h EVA maintenance. Mild resting tachycardia.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    missionAssigned: 'ARES-IV Deep Space Transit',
    bloodType: 'B+',
    age: 34,
    cumulativeRadiation_mSv: 41.5,
    evaQualifications: ['Canadarm3 Chief Operator', 'Extravehicular Bio-Sampling'],
    lastSync: '2026-11-14T08:39:00Z',
    dataSource: 'Astroglove Live',
    isSimulatedData: true,
    medicalNotes: [
      {
        id: 'NOT-03',
        date: '2026-11-14T06:00:00Z',
        author: 'Dr. Kenjiro Sato',
        role: 'Flight Surgeon',
        content: 'Subject reported residual neck and shoulder tightness post-tether work. Prescribed 30 min microgravity stretching countermeasure and scheduled 45 min light sleep nap window before evening shift.',
        isConfidential: false,
      },
    ],
  },
  {
    id: 'AST-0773',
    name: 'Marcus Thorne',
    role: 'Mission Specialist (ECLSS)',
    agency: 'ESA',
    callsign: 'Vulcan',
    status: 'normal',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    missionAssigned: 'ARES-IV Deep Space Transit',
    bloodType: 'O-',
    age: 41,
    cumulativeRadiation_mSv: 31.8,
    evaQualifications: ['Life Support Cryo Specialist', 'Pressure Hull Repair'],
    lastSync: '2026-11-14T08:40:00Z',
    dataSource: 'BioHarness v3 [Simulated]',
    isSimulatedData: true,
    medicalNotes: [
      {
        id: 'NOT-04',
        date: '2026-11-11T10:15:00Z',
        author: 'Dr. Kenjiro Sato',
        role: 'Flight Surgeon',
        content: 'Routine monthly orthostatic check normal. Blood pressure stable at 116/74 mmHg (manual cuff entry). Dietary sodium within target parameters.',
        isConfidential: false,
      },
    ],
  },
];

export const INITIAL_THRESHOLDS: Record<string, VitalThresholds> = {
  'AST-0824': {
    astronautId: 'AST-0824',
    minHeartRate: 48,
    maxHeartRate: 115,
    minSpo2: 94,
    maxTemperature: 37.8,
    maxSystolicBP: 135,
    minDiastolicBP: 55,
    maxRespiratoryRate: 22,
  },
  'AST-0912': {
    astronautId: 'AST-0912',
    minHeartRate: 45,
    maxHeartRate: 110,
    minSpo2: 94,
    maxTemperature: 37.8,
    maxSystolicBP: 130,
    minDiastolicBP: 55,
    maxRespiratoryRate: 20,
  },
  'AST-1045': {
    astronautId: 'AST-1045',
    minHeartRate: 50,
    maxHeartRate: 118,
    minSpo2: 94,
    maxTemperature: 37.8,
    maxSystolicBP: 135,
    minDiastolicBP: 55,
    maxRespiratoryRate: 22,
  },
  'AST-0773': {
    astronautId: 'AST-0773',
    minHeartRate: 48,
    maxHeartRate: 115,
    minSpo2: 94,
    maxTemperature: 37.8,
    maxSystolicBP: 135,
    minDiastolicBP: 55,
    maxRespiratoryRate: 22,
  },
};

// Generate realistic time-series for 24-hr vitals
export function generate24HourVitals(astronautId: string): VitalReading[] {
  const readings: VitalReading[] = [];
  const now = new Date();
  const baseHr = astronautId === 'AST-1045' ? 76 : astronautId === 'AST-0912' ? 58 : 64;
  const baseSpo2 = astronautId === 'AST-1045' ? 96 : 98;

  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 3600 * 1000).toISOString();
    // Circadian variation: lower HR during night hours (hours 0 - 6)
    const hour = (now.getHours() - i + 24) % 24;
    const isNight = hour >= 23 || hour <= 6;
    const nightDampening = isNight ? -8 : 2;
    const noise = Math.round((Math.sin(i * 0.7) + (Math.random() - 0.5)) * 3);

    const hr = baseHr + nightDampening + noise;
    const spo2 = Math.min(100, Math.max(92, baseSpo2 + (isNight ? -1 : 0) + (Math.random() > 0.8 ? -1 : 0)));
    const temp = Number((36.5 + (isNight ? -0.3 : 0.2) + (Math.random() - 0.5) * 0.1).toFixed(1));
    const resp = isNight ? 12 : 14 + (Math.random() > 0.7 ? 1 : 0);

    const reading: VitalReading = {
      id: `VIT-${astronautId}-${i}`,
      astronautId,
      timestamp,
      heartRate_bpm: hr,
      spo2_percent: spo2,
      respiratoryRate_brpm: resp,
      temperature_celsius: temp,
      source: 'Wearable Sensor (Simulated)',
      isSimulated: true,
      qualityScore: 98,
    };

    // Add manual validated blood pressure every 12 hours
    if (i === 2 || i === 14) {
      reading.bloodPressure = {
        systolic: 118 + (astronautId === 'AST-1045' ? 6 : 0) + Math.round((Math.random() - 0.5) * 4),
        diastolic: 76 + Math.round((Math.random() - 0.5) * 3),
        method: 'manual_cuff',
        calibrated: true,
      };
    }

    readings.push(reading);
  }
  return readings;
}

export const INITIAL_SLEEP_SESSIONS: SleepSession[] = [
  {
    id: 'SLP-0824-01',
    astronautId: 'AST-0824',
    date: '2026-11-13',
    bedtime: '2026-11-13T22:30:00Z',
    wakeTime: '2026-11-14T06:10:00Z',
    totalDurationMinutes: 460, // 7h 40m
    efficiencyPercent: 91,
    remMinutes: 98,
    deepMinutes: 110,
    lightMinutes: 220,
    wakeMinutes: 32,
    sleepDebtMinutes: 20,
    stagesAvailable: true,
    source: 'Smart Sleep Pad [Simulated]',
    isSimulated: true,
    stages: [
      { stage: 'light', startTime: '2026-11-13T22:30:00Z', durationMinutes: 35 },
      { stage: 'deep', startTime: '2026-11-13T23:05:00Z', durationMinutes: 65 },
      { stage: 'light', startTime: '2026-11-14T00:10:00Z', durationMinutes: 40 },
      { stage: 'rem', startTime: '2026-11-14T00:50:00Z', durationMinutes: 45 },
      { stage: 'deep', startTime: '2026-11-14T01:35:00Z', durationMinutes: 45 },
      { stage: 'light', startTime: '2026-11-14T02:20:00Z', durationMinutes: 70 },
      { stage: 'rem', startTime: '2026-11-14T03:30:00Z', durationMinutes: 53 },
      { stage: 'wake', startTime: '2026-11-14T04:23:00Z', durationMinutes: 15 },
      { stage: 'light', startTime: '2026-11-14T04:38:00Z', durationMinutes: 75 },
      { stage: 'wake', startTime: '2026-11-14T05:53:00Z', durationMinutes: 17 },
    ],
  },
  {
    id: 'SLP-1045-01',
    astronautId: 'AST-1045',
    date: '2026-11-13',
    bedtime: '2026-11-14T00:45:00Z',
    wakeTime: '2026-11-14T06:05:00Z',
    totalDurationMinutes: 320, // 5h 20m
    efficiencyPercent: 82,
    remMinutes: 55,
    deepMinutes: 48,
    lightMinutes: 172,
    wakeMinutes: 45,
    sleepDebtMinutes: 160,
    stagesAvailable: true,
    source: 'Hexoskin Vest',
    isSimulated: true,
    stages: [
      { stage: 'light', startTime: '2026-11-14T00:45:00Z', durationMinutes: 40 },
      { stage: 'deep', startTime: '2026-11-14T01:25:00Z', durationMinutes: 48 },
      { stage: 'wake', startTime: '2026-11-14T02:13:00Z', durationMinutes: 20 },
      { stage: 'light', startTime: '2026-11-14T02:33:00Z', durationMinutes: 72 },
      { stage: 'rem', startTime: '2026-11-14T03:45:00Z', durationMinutes: 55 },
      { stage: 'wake', startTime: '2026-11-14T04:40:00Z', durationMinutes: 25 },
      { stage: 'light', startTime: '2026-11-14T05:05:00Z', durationMinutes: 60 },
    ],
  },
  {
    id: 'SLP-0912-01',
    astronautId: 'AST-0912',
    date: '2026-11-13',
    bedtime: '2026-11-13T22:00:00Z',
    wakeTime: '2026-11-14T06:10:00Z',
    totalDurationMinutes: 490, // 8h 10m
    efficiencyPercent: 94,
    remMinutes: 115,
    deepMinutes: 125,
    lightMinutes: 230,
    wakeMinutes: 20,
    sleepDebtMinutes: 0,
    stagesAvailable: true,
    source: 'Smart Sleep Pad [Simulated]',
    isSimulated: true,
    stages: [],
  },
  {
    id: 'SLP-0773-01',
    astronautId: 'AST-0773',
    date: '2026-11-13',
    bedtime: '2026-11-13T22:45:00Z',
    wakeTime: '2026-11-14T06:00:00Z',
    totalDurationMinutes: 435, // 7h 15m
    efficiencyPercent: 89,
    remMinutes: 90,
    deepMinutes: 95,
    lightMinutes: 215,
    wakeMinutes: 35,
    sleepDebtMinutes: 45,
    stagesAvailable: true,
    source: 'Smart Sleep Pad [Simulated]',
    isSimulated: true,
    stages: [],
  },
];

export const INITIAL_SLEEP_DIARIES: SleepDiaryEntry[] = [
  {
    id: 'DIA-01',
    astronautId: 'AST-0824',
    date: '2026-11-14',
    sleepQualityRating: 4,
    ambientDisturbances: ['Cabin ventilation air duct whisper'],
    caffeineIntakeEvening: false,
    notes: 'Slept soundly with sleep restraint tether set to low slack. Woke refreshed at scheduled tone.',
    createdAt: '2026-11-14T06:20:00Z',
  },
  {
    id: 'DIA-02',
    astronautId: 'AST-1045',
    date: '2026-11-14',
    sleepQualityRating: 2,
    ambientDisturbances: ['Shoulder tension post-EVA', 'Sleep berth CO2 localized ventilation pocket'],
    caffeineIntakeEvening: true,
    notes: 'Awoke twice around 02:00 and 04:30. Shoulder fatigued from rigid EMU suit gloves. Planning 30m power nap.',
    createdAt: '2026-11-14T06:30:00Z',
  },
];

export const INITIAL_EXERCISE_SESSIONS: ExerciseSession[] = [
  {
    id: 'EXE-01',
    astronautId: 'AST-0824',
    date: '2026-11-13T15:00:00Z',
    modality: 'ARED Resistive',
    durationMinutes: 45,
    completed: true,
    targetDurationMinutes: 45,
    avgHeartRate: 132,
    peakHeartRate: 161,
    energyExpenditure_kcal: 380,
    rpe_score: 8,
    countermeasureDetails: {
      peakForceNewtons: 1650, // Squat load
      setsCompleted: 12,
    },
    notes: 'Prescribed squats and heel raises performed to full ROM. Bone mineral preservation protocol on schedule.',
    source: 'Station Telemetry Interface',
    isSimulated: true,
  },
  {
    id: 'EXE-02',
    astronautId: 'AST-0824',
    date: '2026-11-13T16:00:00Z',
    modality: 'T2 Treadmill',
    durationMinutes: 30,
    completed: true,
    targetDurationMinutes: 30,
    avgHeartRate: 148,
    peakHeartRate: 168,
    energyExpenditure_kcal: 310,
    rpe_score: 7,
    countermeasureDetails: {
      harnessLoadingPercent: 78, // % of body mass pulled into belt
    },
    notes: 'Steady aerobic tempo run at 10.5 km/h. Vibration isolation active.',
    source: 'Station Telemetry Interface',
    isSimulated: true,
  },
  {
    id: 'EXE-03',
    astronautId: 'AST-0912',
    date: '2026-11-13T14:30:00Z',
    modality: 'CEVIS Cycle Ergometer',
    durationMinutes: 50,
    completed: true,
    targetDurationMinutes: 45,
    avgHeartRate: 140,
    peakHeartRate: 158,
    energyExpenditure_kcal: 440,
    rpe_score: 7,
    countermeasureDetails: {
      avgWatts: 195,
      cadenceRpm: 84,
    },
    notes: 'Interval protocol completed. Excellent aerobic response.',
    source: 'Station Telemetry Interface',
    isSimulated: true,
  },
  {
    id: 'EXE-04',
    astronautId: 'AST-1045',
    date: '2026-11-13T17:00:00Z',
    modality: 'Microgravity Core Conditioning',
    durationMinutes: 25,
    completed: false, // cut short due to EVA fatigue
    targetDurationMinutes: 45,
    avgHeartRate: 110,
    peakHeartRate: 126,
    energyExpenditure_kcal: 140,
    rpe_score: 5,
    countermeasureDetails: {
      setsCompleted: 6,
    },
    notes: 'Session modified due to post-EVA shoulder fatigue.',
    source: 'Manual Log',
    isSimulated: true,
  },
  {
    id: 'EXE-05',
    astronautId: 'AST-0773',
    date: '2026-11-13T13:00:00Z',
    modality: 'ARED Resistive',
    durationMinutes: 60,
    completed: true,
    targetDurationMinutes: 60,
    avgHeartRate: 128,
    peakHeartRate: 156,
    energyExpenditure_kcal: 460,
    rpe_score: 8,
    countermeasureDetails: {
      peakForceNewtons: 1820,
      setsCompleted: 15,
    },
    notes: 'Deadlift and bent-over row series completed. Upper back engagement optimal.',
    source: 'Station Telemetry Interface',
    isSimulated: true,
  },
];

export const INITIAL_EXERCISE_GOALS: Record<string, ExerciseGoal> = {
  'AST-0824': {
    astronautId: 'AST-0824',
    weeklyAredSessionsTarget: 6,
    weeklyAerobicMinutesTarget: 210,
    targetDailyCaloricBurn: 650,
    minimumRpeLevel: 7,
  },
  'AST-0912': {
    astronautId: 'AST-0912',
    weeklyAredSessionsTarget: 5,
    weeklyAerobicMinutesTarget: 200,
    targetDailyCaloricBurn: 600,
    minimumRpeLevel: 6,
  },
  'AST-1045': {
    astronautId: 'AST-1045',
    weeklyAredSessionsTarget: 6,
    weeklyAerobicMinutesTarget: 210,
    targetDailyCaloricBurn: 650,
    minimumRpeLevel: 7,
  },
  'AST-0773': {
    astronautId: 'AST-0773',
    weeklyAredSessionsTarget: 6,
    weeklyAerobicMinutesTarget: 210,
    targetDailyCaloricBurn: 700,
    minimumRpeLevel: 7,
  },
};

export const INITIAL_FOOD_LOGS: FoodLogEntry[] = [
  {
    id: 'FOD-01',
    astronautId: 'AST-0824',
    date: '2026-11-14',
    mealType: 'Breakfast',
    description: 'Thermo-stabilized scrambled eggs, dried peaches, fortified whole-grain tortilla, green tea with lemon.',
    calories_kcal: 620,
    protein_g: 32,
    carbs_g: 68,
    fat_g: 22,
    sodium_mg: 820,
    potassium_mg: 1100,
    hydration_ml: 650,
    supplementsTaken: ['Vitamin D3 (2000 IU)', 'Calcium Citrate (500 mg)'],
    isEstimated: true,
  },
  {
    id: 'FOD-02',
    astronautId: 'AST-0824',
    date: '2026-11-13',
    mealType: 'Dinner',
    description: 'Rehydrated salmon fillet, brown rice with quinoa, asparagus spears, irradiated berry crumble.',
    calories_kcal: 890,
    protein_g: 54,
    carbs_g: 94,
    fat_g: 28,
    sodium_mg: 950,
    potassium_mg: 1450,
    hydration_ml: 900,
    supplementsTaken: ['Omega-3 Fatty Acids (1000 mg)'],
    isEstimated: true,
  },
  {
    id: 'FOD-03',
    astronautId: 'AST-1045',
    date: '2026-11-14',
    mealType: 'Breakfast',
    description: 'Fortified steel-cut oatmeal with blueberries, whey protein isolate pouch, black coffee.',
    calories_kcal: 540,
    protein_g: 38,
    carbs_g: 72,
    fat_g: 10,
    sodium_mg: 450,
    potassium_mg: 850,
    hydration_ml: 500,
    supplementsTaken: ['Vitamin D3 (2000 IU)', 'Magnesium Glycinate (200 mg)'],
    isEstimated: true,
  },
];

export const INITIAL_LAB_RECORDS: MicronutrientLabRecord[] = [
  {
    id: 'LAB-0824-01',
    astronautId: 'AST-0824',
    drawDate: '2026-11-01T07:30:00Z',
    analyzedDate: '2026-11-01T11:00:00Z',
    vitaminD_25OH_ng_ml: 46.2, // Reference: 30 - 80 ng/mL
    ferritin_ng_ml: 124,       // Reference: 30 - 300 ng/mL
    potassium_mEq_L: 4.3,      // Reference: 3.5 - 5.0 mEq/L
    sodium_mEq_L: 139,         // Reference: 135 - 145 mEq/L
    folate_ng_ml: 9.8,         // Reference: > 4.0 ng/mL
    vitaminB12_pg_ml: 610,     // Reference: 200 - 900 pg/mL
    calcium_mg_dl: 9.4,        // Reference: 8.5 - 10.2 mg/dL
    labTechnician: 'Dr. Kenjiro Sato, Flight Surgeon',
    method: 'In-Flight Blood Analysis Module (i-STAT / MinION)',
    nextFollowUpDueDate: '2026-12-01',
    clinicalNotes: 'Electrolytes and lipid biomarkers balanced. Microgravity osteoclast markers within target countermeasure range.',
  },
  {
    id: 'LAB-1045-01',
    astronautId: 'AST-1045',
    drawDate: '2026-10-28T08:00:00Z',
    analyzedDate: '2026-10-28T12:30:00Z',
    vitaminD_25OH_ng_ml: 38.5,
    ferritin_ng_ml: 88,
    potassium_mEq_L: 4.1,
    sodium_mEq_L: 141,
    folate_ng_ml: 8.4,
    vitaminB12_pg_ml: 520,
    calcium_mg_dl: 9.2,
    labTechnician: 'Dr. Kenjiro Sato, Flight Surgeon',
    method: 'In-Flight Blood Analysis Module (i-STAT / MinION)',
    nextFollowUpDueDate: '2026-11-28',
    clinicalNotes: 'Serum ferritin and B12 adequate. Recommend maintaining current hydration schedule.',
  },
];

export const INITIAL_NUTRITION_GOALS: Record<string, NutritionGoals> = {
  'AST-0824': {
    astronautId: 'AST-0824',
    dailyCaloriesTarget: 2750,
    dailyHydrationTarget_ml: 2800,
    dailyProteinTarget_g: 110,
    maxSodiumTarget_mg: 2300,
    targetPotassium_mg: 3500,
  },
  'AST-0912': {
    astronautId: 'AST-0912',
    dailyCaloriesTarget: 2600,
    dailyHydrationTarget_ml: 2600,
    dailyProteinTarget_g: 105,
    maxSodiumTarget_mg: 2200,
    targetPotassium_mg: 3500,
  },
  'AST-1045': {
    astronautId: 'AST-1045',
    dailyCaloriesTarget: 2500,
    dailyHydrationTarget_ml: 2700,
    dailyProteinTarget_g: 100,
    maxSodiumTarget_mg: 2200,
    targetPotassium_mg: 3400,
  },
  'AST-0773': {
    astronautId: 'AST-0773',
    dailyCaloriesTarget: 2900,
    dailyHydrationTarget_ml: 3000,
    dailyProteinTarget_g: 120,
    maxSodiumTarget_mg: 2400,
    targetPotassium_mg: 3600,
  },
};

export const INITIAL_EEG_SESSIONS: EEGSession[] = [
  {
    id: 'EEG-0824-01',
    astronautId: 'AST-0824',
    title: 'Pre-EVA Psychomotor Vigilance & Neuro-Workload Baseline',
    timestamp: '2026-11-13T09:15:00Z',
    durationSeconds: 300, // 5 min
    samplingRateHz: 250,
    channels: ['Fp1', 'Fp2', 'C3', 'C4', 'Pz', 'O1'],
    protocol: 'Cognitive Workload Test',
    isSimulated: true,
    bandPowerSummary: {
      delta: 14.2,
      theta: 22.8,
      alpha: 35.4, // Good relaxed focus
      beta: 23.1,
      gamma: 4.5,
    },
    channelQualities: [
      { channel: 'Fp1', impedance_kOhm: 3.4, status: 'good' },
      { channel: 'Fp2', impedance_kOhm: 3.8, status: 'good' },
      { channel: 'C3', impedance_kOhm: 4.1, status: 'good' },
      { channel: 'C4', impedance_kOhm: 4.6, status: 'good' },
      { channel: 'Pz', impedance_kOhm: 3.9, status: 'good' },
      { channel: 'O1', impedance_kOhm: 5.2, status: 'marginal' },
    ],
    notes: 'Commander exhibited sharp attention response with sustained alpha coherence during mental rotation trials.',
    recordedBy: 'Dr. Kenjiro Sato, Flight Surgeon',
  },
  {
    id: 'EEG-1045-01',
    astronautId: 'AST-1045',
    title: 'Post-EVA Acute Neuro-Fatigue Evaluation',
    timestamp: '2026-11-14T07:10:00Z',
    durationSeconds: 300,
    samplingRateHz: 250,
    channels: ['Fp1', 'Fp2', 'C3', 'C4', 'Pz', 'O1'],
    protocol: 'Neuro-Fatigue Check',
    isSimulated: true,
    bandPowerSummary: {
      delta: 24.5, // Increased slow wave indicates fatigue
      theta: 31.2, // Elevated theta indicates micro-drowsiness
      alpha: 22.1,
      beta: 18.4,
      gamma: 3.8,
    },
    channelQualities: [
      { channel: 'Fp1', impedance_kOhm: 4.0, status: 'good' },
      { channel: 'Fp2', impedance_kOhm: 4.2, status: 'good' },
      { channel: 'C3', impedance_kOhm: 4.5, status: 'good' },
      { channel: 'C4', impedance_kOhm: 4.7, status: 'good' },
      { channel: 'Pz', impedance_kOhm: 4.1, status: 'good' },
      { channel: 'O1', impedance_kOhm: 4.8, status: 'good' },
    ],
    notes: 'Mild theta rhythm elevation observed in frontal channels consistent with acute post-EVA physical exertion. Rest period recommended.',
    recordedBy: 'Dr. Kenjiro Sato, Flight Surgeon',
  },
];

export const INITIAL_DEVICES: MedicalDevice[] = [
  {
    id: 'DEV-001',
    name: 'BioHarness Mk-IV Chest Sensor',
    model: 'AeroBio-400X',
    type: 'Biomarker Chest Harness',
    assignedAstronautId: 'AST-0824',
    connectionStatus: 'connected',
    batteryLevelPercent: 92,
    lastSyncTimestamp: '2026-11-14T08:42:00Z',
    firmwareVersion: 'v4.1.8-flight',
    supportedMetrics: ['heart_rate', 'respiratory_rate', 'skin_temperature', 'accelerometry'],
    isRealHardware: false,
    adapterName: 'SimulatedDeviceAdapter',
    signalStrengthDbm: -56,
  },
  {
    id: 'DEV-002',
    name: 'Astroglove & Pulse Ring Array',
    model: 'GloveSense-MicroG',
    type: 'Astroglove & Pulse Ring',
    assignedAstronautId: 'AST-1045',
    connectionStatus: 'connected',
    batteryLevelPercent: 68,
    lastSyncTimestamp: '2026-11-14T08:39:00Z',
    firmwareVersion: 'v2.8.3',
    supportedMetrics: ['heart_rate', 'spo2', 'accelerometry'],
    isRealHardware: false,
    adapterName: 'SimulatedDeviceAdapter',
    signalStrengthDbm: -64,
  },
  {
    id: 'DEV-003',
    name: 'Hexoskin Astro Microgravity Vest',
    model: 'Hexoskin-Orbital-3',
    type: 'Hexoskin Microgravity Vest',
    assignedAstronautId: 'AST-0912',
    connectionStatus: 'connected',
    batteryLevelPercent: 84,
    lastSyncTimestamp: '2026-11-14T08:44:00Z',
    firmwareVersion: 'v3.2.0',
    supportedMetrics: ['heart_rate', 'respiratory_rate', 'accelerometry', 'skin_temperature'],
    isRealHardware: false,
    adapterName: 'SimulatedDeviceAdapter',
    signalStrengthDbm: -52,
  },
  {
    id: 'DEV-004',
    name: 'NeuroGlove DryEEG 8-Ch Headband',
    model: 'DryCap-8X-Flight',
    type: 'Dry-Electrode EEG Headband',
    assignedAstronautId: 'AST-0824',
    connectionStatus: 'standby',
    batteryLevelPercent: 100,
    lastSyncTimestamp: '2026-11-13T09:20:00Z',
    firmwareVersion: 'v5.0.2',
    supportedMetrics: ['eeg_waveforms'],
    isRealHardware: false,
    adapterName: 'SimulatedDeviceAdapter',
    signalStrengthDbm: -48,
  },
  {
    id: 'DEV-005',
    name: 'Station Clinical Diagnostic Console',
    model: 'MedBay-Cuff-Temp-900',
    type: 'Clinical Multi-Parameter Station',
    assignedAstronautId: 'AST-0773',
    connectionStatus: 'connected',
    batteryLevelPercent: 100, // Wired to station bus
    lastSyncTimestamp: '2026-11-14T08:40:00Z',
    firmwareVersion: 'v1.4.9',
    supportedMetrics: ['blood_pressure', 'skin_temperature', 'spo2'],
    isRealHardware: false,
    adapterName: 'ClinicalDiagnosticAdapter',
    signalStrengthDbm: -32,
  },
];

export const INITIAL_CONSENT_SETTINGS: Record<string, DeviceConsentSettings> = {
  'AST-0824': {
    heartRate: true,
    spo2: true,
    sleepStages: true,
    rawMotion: true,
    eegWaveforms: true,
    cameraRecordings: true,
  },
  'AST-0912': {
    heartRate: true,
    spo2: true,
    sleepStages: true,
    rawMotion: true,
    eegWaveforms: true,
    cameraRecordings: false,
  },
  'AST-1045': {
    heartRate: true,
    spo2: true,
    sleepStages: true,
    rawMotion: true,
    eegWaveforms: true,
    cameraRecordings: true,
  },
  'AST-0773': {
    heartRate: true,
    spo2: true,
    sleepStages: true,
    rawMotion: false,
    eegWaveforms: false,
    cameraRecordings: false,
  },
};

export const INITIAL_ALERTS: HealthAlert[] = [
  {
    id: 'ALT-101',
    astronautId: 'AST-1045',
    timestamp: '2026-11-14T06:15:00Z',
    title: 'Cumulative Sleep Deficit Advisory',
    description: 'Astronaut logged 5h 20m sleep (sleep debt +160m) following 6.5h EVA maintenance protocol. Daytime fatigue countermeasure advised.',
    severity: 'caution',
    category: 'fatigue_risk',
    status: 'active',
    triggerValue: '320 min total sleep',
    thresholdLimit: '420 min minimum',
  },
  {
    id: 'ALT-102',
    astronautId: 'AST-1045',
    timestamp: '2026-11-14T07:30:00Z',
    title: 'Elevated Resting Pulse Above Subject Baseline',
    description: 'Resting pulse reached 82 bpm for > 20 min interval. Subjective fatigue noted in morning diary.',
    severity: 'advisory',
    category: 'vitals_threshold',
    status: 'acknowledged',
    triggerValue: '82 bpm',
    thresholdLimit: '75 bpm baseline',
    acknowledgedBy: 'Dr. Kenjiro Sato (Flight Surgeon)',
    acknowledgedAt: '2026-11-14T07:45:00Z',
    resolutionNote: 'Scheduled 30m stretching protocol and monitoring subsequent cycle.',
  },
  {
    id: 'ALT-103',
    astronautId: 'AST-0824',
    timestamp: '2026-11-13T20:00:00Z',
    title: 'Quarterly Micronutrient Panel Follow-up Scheduled',
    description: 'In-flight blood draw module (i-STAT) serum vitamin D and bone turnover panel due in 17 days.',
    severity: 'advisory',
    category: 'missed_checkin',
    status: 'active',
    triggerValue: '17 days to due',
    thresholdLimit: '30 day interval',
  },
  {
    id: 'ALT-104',
    astronautId: 'AST-0773',
    timestamp: '2026-11-12T11:20:00Z',
    title: 'ECLSS Stale Wearable Sync Reconnected',
    description: 'BioHarness telemetry packet delayed > 45 minutes during module transit. Link restored with zero data loss from onboard cache.',
    severity: 'advisory',
    category: 'stale_sensor',
    status: 'resolved',
    acknowledgedBy: 'Sarah Sterling (Flight Director)',
    acknowledgedAt: '2026-11-12T12:00:00Z',
    resolutionNote: 'Local antenna relay buffer cleared and verified.',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-11-14T08:30:00Z',
    userId: 'USR-MED-01',
    userName: 'Dr. Kenjiro Sato',
    userRole: 'Medical Officer',
    action: 'VIEW_EEG_RECORD',
    targetAstronautId: 'AST-1045',
    details: 'Reviewed post-EVA acute neuro-fatigue session EEG-1045-01 waveform data.',
    terminalIp: 'HAB-DECK2-MEDBAY-01',
    outcome: 'success',
  },
  {
    id: 'AUD-002',
    timestamp: '2026-11-14T07:45:00Z',
    userId: 'USR-MED-01',
    userName: 'Dr. Kenjiro Sato',
    userRole: 'Medical Officer',
    action: 'ACKNOWLEDGE_ALERT',
    targetAstronautId: 'AST-1045',
    details: 'Acknowledged Alert ALT-102 (Elevated Resting Pulse). Appended clinical stretching countermeasure.',
    terminalIp: 'HAB-DECK2-MEDBAY-01',
    outcome: 'success',
  },
  {
    id: 'AUD-003',
    timestamp: '2026-11-14T06:35:00Z',
    userId: 'USR-AST-01',
    userName: 'Elena Vance',
    userRole: 'Astronaut',
    action: 'UPDATE_SLEEP_DIARY',
    targetAstronautId: 'AST-0824',
    details: 'Submitted morning subjective restfulness diary DIA-01.',
    terminalIp: 'CREW-BERTH-01-TABLET',
    outcome: 'success',
  },
  {
    id: 'AUD-004',
    timestamp: '2026-11-13T18:10:00Z',
    userId: 'USR-ADM-01',
    userName: 'Sarah Sterling',
    userRole: 'Mission Administrator',
    action: 'EXPORT_CREW_REPORT',
    details: 'Generated weekly 7-day crew physiological readiness telemetry digest for Capcom review.',
    terminalIp: 'GROUND-MCC-CONSOLE-04',
    outcome: 'success',
  },
];

export const INITIAL_CAPTURED_MEDIA: CameraMediaRecord[] = [
  {
    id: 'MED-01',
    astronautId: 'AST-0824',
    type: 'photo',
    dataUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=400',
    timestamp: '2026-11-13T16:45:00Z',
    purpose: 'Exercise Posture Form',
    fileSizeKb: 340,
    encrypted: true,
  },
];

