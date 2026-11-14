export type UserRole = 'astronaut' | 'medical_officer' | 'mission_administrator';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  astronautId?: string; // If role is astronaut, bound to this ID
  callsign: string;
  avatarUrl: string;
  securityClearance: 'Flight Crew Level 1' | 'Flight Surgeon Level 2' | 'Mission Director Level 3';
}

