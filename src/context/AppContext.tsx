import React, { createContext, useContext, useState, useEffect } from 'react';
import { Astronaut } from '../types/astronaut';
import { VitalReading, VitalThresholds } from '../types/vitals';
import { SleepSession, SleepDiaryEntry } from '../types/sleep';
import { ExerciseSession, ExerciseGoal } from '../types/exercise';
import { FoodLogEntry, MicronutrientLabRecord, NutritionGoals } from '../types/nutrition';
import { EEGSession } from '../types/eeg';
import { MedicalDevice, DeviceConsentSettings } from '../types/device';
import { HealthAlert } from '../types/alert';
import { AuditLogEntry, CameraMediaRecord } from '../types/audit';
import {
  INITIAL_ASTRONAUTS,
  INITIAL_THRESHOLDS,
  INITIAL_SLEEP_SESSIONS,
  INITIAL_SLEEP_DIARIES,
  INITIAL_EXERCISE_SESSIONS,
  INITIAL_EXERCISE_GOALS,
  INITIAL_FOOD_LOGS,
  INITIAL_LAB_RECORDS,
  INITIAL_NUTRITION_GOALS,
  INITIAL_EEG_SESSIONS,
  INITIAL_DEVICES,
  INITIAL_CONSENT_SETTINGS,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CAPTURED_MEDIA,
  INITIAL_MISSION,
  generate24HourVitals,
} from '../data/mockData';
import { useAuth } from './AuthContext';

interface AppContextType {
  mission: typeof INITIAL_MISSION;
  setMissionDuration: (days: number) => void;
  astronauts: Astronaut[];
  selectedAstronautId: string;
  selectedAstronaut: Astronaut;
  setSelectedAstronautId: (id: string) => void;
  vitalsMap: Record<string, VitalReading[]>;
  thresholdsMap: Record<string, VitalThresholds>;
  updateThresholds: (astronautId: string, thresholds: VitalThresholds) => void;
  addManualVitalReading: (reading: Omit<VitalReading, 'id' | 'isSimulated'>) => void;
  sleepSessions: SleepSession[];
  sleepDiaries: SleepDiaryEntry[];
  addSleepDiary: (diary: Omit<SleepDiaryEntry, 'id' | 'createdAt'>) => void;
  exerciseSessions: ExerciseSession[];
  exerciseGoalsMap: Record<string, ExerciseGoal>;
  addExerciseSession: (session: Omit<ExerciseSession, 'id' | 'isSimulated'>) => void;
  foodLogs: FoodLogEntry[];
  labRecords: MicronutrientLabRecord[];
  nutritionGoalsMap: Record<string, NutritionGoals>;
  addFoodLog: (entry: Omit<FoodLogEntry, 'id'>) => void;
  addLabRecord: (record: Omit<MicronutrientLabRecord, 'id'>) => void;
  eegSessions: EEGSession[];
  addEEGSession: (session: EEGSession) => void;
  devices: MedicalDevice[];
  toggleDeviceConnection: (deviceId: string) => void;
  consentSettingsMap: Record<string, DeviceConsentSettings>;
  updateConsentSettings: (astronautId: string, settings: Partial<DeviceConsentSettings>) => void;
  alerts: HealthAlert[];
  acknowledgeAlert: (alertId: string, note?: string) => void;
  resolveAlert: (alertId: string, note: string) => void;
  capturedMedia: CameraMediaRecord[];
  addCapturedMedia: (media: Omit<CameraMediaRecord, 'id'>) => void;
  deleteCapturedMedia: (mediaId: string) => void;
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, details: string, targetAstronautId?: string) => void;
  addMedicalNote: (astronautId: string, content: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Mission
  const [mission, setMission] = useState(() => {
    const s = localStorage.getItem('zenith_mission');
    return s ? JSON.parse(s) : INITIAL_MISSION;
  });

  const setMissionDuration = (days: number) => {
    setMission((prev: typeof INITIAL_MISSION) => ({ ...prev, totalDays: days }));
  };

  // Astronauts
  const [astronauts, setAstronauts] = useState<Astronaut[]>(() => {
    const s = localStorage.getItem('zenith_astronauts');
    return s ? JSON.parse(s) : INITIAL_ASTRONAUTS;
  });

  // Selected astronaut
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>(() => {
    if (currentUser.role === 'astronaut' && currentUser.astronautId) {
      return currentUser.astronautId;
    }
    const s = localStorage.getItem('zenith_selected_astronaut');
    return s || INITIAL_ASTRONAUTS[0].id;
  });

  // Automatically restrict selected astronaut when logged in as astronaut
  useEffect(() => {
    if (currentUser.role === 'astronaut' && currentUser.astronautId) {
      setSelectedAstronautId(currentUser.astronautId);
    }
  }, [currentUser]);

  const selectedAstronaut =
    astronauts.find((a) => a.id === selectedAstronautId) || astronauts[0];

  // Vitals map
  const [vitalsMap, setVitalsMap] = useState<Record<string, VitalReading[]>>(() => {
    const s = localStorage.getItem('zenith_vitals_map');
    if (s) {
      try {
        return JSON.parse(s);
      } catch {}
    }
    const map: Record<string, VitalReading[]> = {};
    INITIAL_ASTRONAUTS.forEach((a) => {
      map[a.id] = generate24HourVitals(a.id);
    });
    return map;
  });

  // Thresholds
  const [thresholdsMap, setThresholdsMap] = useState<Record<string, VitalThresholds>>(() => {
    const s = localStorage.getItem('zenith_thresholds');
    return s ? JSON.parse(s) : INITIAL_THRESHOLDS;
  });

  // Sleep
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>(() => {
    const s = localStorage.getItem('zenith_sleep_sessions');
    return s ? JSON.parse(s) : INITIAL_SLEEP_SESSIONS;
  });

  const [sleepDiaries, setSleepDiaries] = useState<SleepDiaryEntry[]>(() => {
    const s = localStorage.getItem('zenith_sleep_diaries');
    return s ? JSON.parse(s) : INITIAL_SLEEP_DIARIES;
  });

  // Exercise
  const [exerciseSessions, setExerciseSessions] = useState<ExerciseSession[]>(() => {
    const s = localStorage.getItem('zenith_exercise_sessions');
    return s ? JSON.parse(s) : INITIAL_EXERCISE_SESSIONS;
  });

  const [exerciseGoalsMap] = useState<Record<string, ExerciseGoal>>(INITIAL_EXERCISE_GOALS);

  // Nutrition & Labs
  const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>(() => {
    const s = localStorage.getItem('zenith_food_logs');
    return s ? JSON.parse(s) : INITIAL_FOOD_LOGS;
  });

  const [labRecords, setLabRecords] = useState<MicronutrientLabRecord[]>(() => {
    const s = localStorage.getItem('zenith_lab_records');
    return s ? JSON.parse(s) : INITIAL_LAB_RECORDS;
  });

  const [nutritionGoalsMap] = useState<Record<string, NutritionGoals>>(INITIAL_NUTRITION_GOALS);

  // EEG
  const [eegSessions, setEegSessions] = useState<EEGSession[]>(() => {
    const s = localStorage.getItem('zenith_eeg_sessions');
    return s ? JSON.parse(s) : INITIAL_EEG_SESSIONS;
  });

  // Devices & Consent
  const [devices, setDevices] = useState<MedicalDevice[]>(() => {
    const s = localStorage.getItem('zenith_devices');
    return s ? JSON.parse(s) : INITIAL_DEVICES;
  });

  const [consentSettingsMap, setConsentSettingsMap] = useState<Record<string, DeviceConsentSettings>>(() => {
    const s = localStorage.getItem('zenith_consent_settings');
    return s ? JSON.parse(s) : INITIAL_CONSENT_SETTINGS;
  });

  // Alerts
  const [alerts, setAlerts] = useState<HealthAlert[]>(() => {
    const s = localStorage.getItem('zenith_alerts');
    return s ? JSON.parse(s) : INITIAL_ALERTS;
  });

  // Media
  const [capturedMedia, setCapturedMedia] = useState<CameraMediaRecord[]>(() => {
    const s = localStorage.getItem('zenith_captured_media');
    return s ? JSON.parse(s) : INITIAL_CAPTURED_MEDIA;
  });

  // Audit
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const s = localStorage.getItem('zenith_audit_logs');
    return s ? JSON.parse(s) : INITIAL_AUDIT_LOGS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('zenith_astronauts', JSON.stringify(astronauts));
  }, [astronauts]);

  useEffect(() => {
    localStorage.setItem('zenith_selected_astronaut', selectedAstronautId);
  }, [selectedAstronautId]);

  useEffect(() => {
    localStorage.setItem('zenith_vitals_map', JSON.stringify(vitalsMap));
  }, [vitalsMap]);

  useEffect(() => {
    localStorage.setItem('zenith_thresholds', JSON.stringify(thresholdsMap));
  }, [thresholdsMap]);

  useEffect(() => {
    localStorage.setItem('zenith_sleep_sessions', JSON.stringify(sleepSessions));
  }, [sleepSessions]);

  useEffect(() => {
    localStorage.setItem('zenith_sleep_diaries', JSON.stringify(sleepDiaries));
  }, [sleepDiaries]);

  useEffect(() => {
    localStorage.setItem('zenith_exercise_sessions', JSON.stringify(exerciseSessions));
  }, [exerciseSessions]);

  useEffect(() => {
    localStorage.setItem('zenith_food_logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('zenith_lab_records', JSON.stringify(labRecords));
  }, [labRecords]);

  useEffect(() => {
    localStorage.setItem('zenith_eeg_sessions', JSON.stringify(eegSessions));
  }, [eegSessions]);

  useEffect(() => {
    localStorage.setItem('zenith_devices', JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem('zenith_consent_settings', JSON.stringify(consentSettingsMap));
  }, [consentSettingsMap]);

  useEffect(() => {
    localStorage.setItem('zenith_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('zenith_captured_media', JSON.stringify(capturedMedia));
  }, [capturedMedia]);

  useEffect(() => {
    localStorage.setItem('zenith_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addAuditLog = (action: string, details: string, targetAstronautId?: string) => {
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role === 'medical_officer' ? 'Medical Officer' : currentUser.role === 'astronaut' ? 'Astronaut' : 'Mission Admin',
      action,
      targetAstronautId,
      details,
      terminalIp: 'HAB-DECK-STATION-ONLINE',
      outcome: 'success',
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const updateThresholds = (astronautId: string, thresholds: VitalThresholds) => {
    setThresholdsMap((prev) => ({ ...prev, [astronautId]: thresholds }));
    addAuditLog('UPDATE_THRESHOLDS', `Adjusted telemetry threshold bounds for ${astronautId}`, astronautId);
  };

  const addManualVitalReading = (reading: Omit<VitalReading, 'id' | 'isSimulated'>) => {
    const newId = `VIT-MANUAL-${Date.now()}`;
    const fullReading: VitalReading = {
      ...reading,
      id: newId,
      isSimulated: false, // Flagged clearly as manual user entry
    };

    setVitalsMap((prev) => {
      const currentList = prev[reading.astronautId] || [];
      return {
        ...prev,
        [reading.astronautId]: [...currentList, fullReading],
      };
    });

    addAuditLog(
      'MANUAL_VITAL_ENTRY',
      `Manual entry: HR ${reading.heartRate_bpm} bpm, SpO2 ${reading.spo2_percent}% via ${reading.source}`,
      reading.astronautId
    );
  };

  const addSleepDiary = (diary: Omit<SleepDiaryEntry, 'id' | 'createdAt'>) => {
    const newEntry: SleepDiaryEntry = {
      ...diary,
      id: `DIA-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    };
    setSleepDiaries((prev) => [newEntry, ...prev]);
    addAuditLog('LOG_SLEEP_DIARY', `Logged subjective rest rating ${diary.sleepQualityRating}/5`, diary.astronautId);
  };

  const addExerciseSession = (session: Omit<ExerciseSession, 'id' | 'isSimulated'>) => {
    const newSession: ExerciseSession = {
      ...session,
      id: `EXE-${Date.now().toString(36)}`,
      isSimulated: false,
    };
    setExerciseSessions((prev) => [newSession, ...prev]);
    addAuditLog('LOG_EXERCISE', `Recorded ${session.durationMinutes}m ${session.modality} countermeasure`, session.astronautId);
  };

  const addFoodLog = (entry: Omit<FoodLogEntry, 'id'>) => {
    const newLog: FoodLogEntry = {
      ...entry,
      id: `FOD-${Date.now().toString(36)}`,
    };
    setFoodLogs((prev) => [newLog, ...prev]);
    addAuditLog('LOG_NUTRITION', `Added ${entry.mealType} log: ${entry.calories_kcal} kcal estimated`, entry.astronautId);
  };

  const addLabRecord = (record: Omit<MicronutrientLabRecord, 'id'>) => {
    const newLab: MicronutrientLabRecord = {
      ...record,
      id: `LAB-${Date.now().toString(36)}`,
    };
    setLabRecords((prev) => [newLab, ...prev]);
    addAuditLog('ENTER_LAB_RECORD', `Entered in-flight micronutrient panel with Vit D ${record.vitaminD_25OH_ng_ml} ng/mL`, record.astronautId);
  };

  const addEEGSession = (session: EEGSession) => {
    setEegSessions((prev) => [session, ...prev]);
    addAuditLog('UPLOAD_EEG_SESSION', `Uploaded/Recorded EEG session: ${session.title}`, session.astronautId);
  };

  const toggleDeviceConnection = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const nextStatus = d.connectionStatus === 'connected' ? 'disconnected' : 'connected';
          return {
            ...d,
            connectionStatus: nextStatus,
            lastSyncTimestamp: nextStatus === 'connected' ? new Date().toISOString() : d.lastSyncTimestamp,
          };
        }
        return d;
      })
    );
    addAuditLog('TOGGLE_DEVICE', `Toggled connection status for device ID: ${deviceId}`);
  };

  const updateConsentSettings = (astronautId: string, settings: Partial<DeviceConsentSettings>) => {
    setConsentSettingsMap((prev) => ({
      ...prev,
      [astronautId]: {
        ...(prev[astronautId] || INITIAL_CONSENT_SETTINGS['AST-0824']),
        ...settings,
      },
    }));
    addAuditLog('UPDATE_CONSENT', `Modified data collection consent permissions`, astronautId);
  };

  const acknowledgeAlert = (alertId: string, note?: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          return {
            ...a,
            status: 'acknowledged',
            acknowledgedBy: currentUser.name,
            acknowledgedAt: new Date().toISOString(),
            resolutionNote: note || a.resolutionNote,
          };
        }
        return a;
      })
    );
    addAuditLog('ACKNOWLEDGE_ALERT', `Acknowledged alert ${alertId} with note: ${note || 'Standard protocol'}`);
  };

  const resolveAlert = (alertId: string, note: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          return {
            ...a,
            status: 'resolved',
            resolutionNote: note,
          };
        }
        return a;
      })
    );
    addAuditLog('RESOLVE_ALERT', `Resolved alert ${alertId}: ${note}`);
  };

  const addCapturedMedia = (media: Omit<CameraMediaRecord, 'id'>) => {
    const newMedia: CameraMediaRecord = {
      ...media,
      id: `MED-${Date.now().toString(36)}`,
    };
    setCapturedMedia((prev) => [newMedia, ...prev]);
    addAuditLog('CAPTURE_MEDIA', `Captured ${media.type} for ${media.purpose}`, media.astronautId);
  };

  const deleteCapturedMedia = (mediaId: string) => {
    setCapturedMedia((prev) => prev.filter((m) => m.id !== mediaId));
    addAuditLog('DELETE_MEDIA', `Permanently deleted media ID: ${mediaId}`);
  };

  const addMedicalNote = (astronautId: string, content: string) => {
    const newNote = {
      id: `NOT-${Date.now().toString(36)}`,
      date: new Date().toISOString(),
      author: currentUser.name,
      role: currentUser.role === 'medical_officer' ? 'Flight Surgeon' : 'Mission Officer',
      content,
      isConfidential: false,
    };

    setAstronauts((prev) =>
      prev.map((a) => (a.id === astronautId ? { ...a, medicalNotes: [newNote, ...a.medicalNotes] } : a))
    );
    addAuditLog('ADD_MEDICAL_NOTE', `Added flight surgeon clinical note to astronaut ${astronautId}`, astronautId);
  };

  const resetAllData = () => {
    localStorage.clear();
    setMission(INITIAL_MISSION);
    setAstronauts(INITIAL_ASTRONAUTS);
    setSelectedAstronautId(INITIAL_ASTRONAUTS[0].id);
    const map: Record<string, VitalReading[]> = {};
    INITIAL_ASTRONAUTS.forEach((a) => {
      map[a.id] = generate24HourVitals(a.id);
    });
    setVitalsMap(map);
    setThresholdsMap(INITIAL_THRESHOLDS);
    setSleepSessions(INITIAL_SLEEP_SESSIONS);
    setSleepDiaries(INITIAL_SLEEP_DIARIES);
    setExerciseSessions(INITIAL_EXERCISE_SESSIONS);
    setFoodLogs(INITIAL_FOOD_LOGS);
    setLabRecords(INITIAL_LAB_RECORDS);
    setEegSessions(INITIAL_EEG_SESSIONS);
    setDevices(INITIAL_DEVICES);
    setConsentSettingsMap(INITIAL_CONSENT_SETTINGS);
    setAlerts(INITIAL_ALERTS);
    setCapturedMedia(INITIAL_CAPTURED_MEDIA);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  return (
    <AppContext.Provider
      value={{
        mission,
        setMissionDuration,
        astronauts,
        selectedAstronautId,
        selectedAstronaut,
        setSelectedAstronautId,
        vitalsMap,
        thresholdsMap,
        updateThresholds,
        addManualVitalReading,
        sleepSessions,
        sleepDiaries,
        addSleepDiary,
        exerciseSessions,
        exerciseGoalsMap,
        addExerciseSession,
        foodLogs,
        labRecords,
        nutritionGoalsMap,
        addFoodLog,
        addLabRecord,
        eegSessions,
        addEEGSession,
        devices,
        toggleDeviceConnection,
        consentSettingsMap,
        updateConsentSettings,
        alerts,
        acknowledgeAlert,
        resolveAlert,
        capturedMedia,
        addCapturedMedia,
        deleteCapturedMedia,
        auditLogs,
        addAuditLog,
        addMedicalNote,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

