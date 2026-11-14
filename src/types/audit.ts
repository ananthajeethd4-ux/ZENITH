export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  targetAstronautId?: string;
  details: string;
  terminalIp: string;
  outcome: 'success' | 'denied' | 'flagged';
}

export interface CameraMediaRecord {
  id: string;
  astronautId: string;
  type: 'photo' | 'video';
  dataUrl: string; // Base64 or Blob URL
  timestamp: string;
  purpose: 'Wellbeing Check' | 'Exercise Posture Form' | 'Microgravity Skin Inspection';
  fileSizeKb: number;
  encrypted: boolean;
}

