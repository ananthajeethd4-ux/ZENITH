export type CrewRole =
  | 'Commander'
  | 'Command Module Pilot'
  | 'Flight Surgeon'
  | 'Mission Specialist (Robotics)'
  | 'Mission Specialist (ECLSS)'
  | 'Payload Specialist';

export type CrewStatus = 'normal' | 'attention' | 'unavailable';

export interface Astronaut {
  id: string; // e.g. "AST-0824"
  name: string;
  role: CrewRole;
  agency: 'NASA' | 'ESA' | 'JAXA' | 'CSA';
  callsign: string;
  status: CrewStatus;
  statusReason?: string;
  avatarUrl: string;
  missionAssigned: string;
  bloodType: string;
  age: number;
  cumulativeRadiation_mSv: number;
  evaQualifications: string[];
  lastSync: string; // ISO string
  dataSource: 'BioHarness v3 [Simulated]' | 'Astroglove Live' | 'Clinical Station [Manual]' | 'Hexoskin Astro' | 'Stale Telemetry';
  isSimulatedData: boolean;
  medicalNotes: AstronautMedicalNote[];
}

export interface AstronautMedicalNote {
  id: string;
  date: string;
  author: string;
  role: string;
  content: string;
  isConfidential: boolean;
}

