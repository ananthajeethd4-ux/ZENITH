import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, UserRole } from '../types/user';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: UserSession;
  allUsers: UserSession[];
  switchUser: (userId: string) => void;
  canViewAllCrew: boolean;
  canEditMedicalNotes: boolean;
  canAdjustThresholds: boolean;
  canManageSystem: boolean;
  canAccessCamera: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    const saved = localStorage.getItem('zenith_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Default to Medical Officer (Dr. Kenjiro Sato) to give full demonstration access
    return INITIAL_USERS[0];
  });

  useEffect(() => {
    localStorage.setItem('zenith_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const switchUser = (userId: string) => {
    const found = INITIAL_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const canViewAllCrew = currentUser.role === 'medical_officer' || currentUser.role === 'mission_administrator';
  const canEditMedicalNotes = currentUser.role === 'medical_officer';
  const canAdjustThresholds = currentUser.role === 'medical_officer' || currentUser.role === 'mission_administrator';
  const canManageSystem = currentUser.role === 'mission_administrator';
  const canAccessCamera = true; // Governed by explicit user opt-in in camera page

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers: INITIAL_USERS,
        switchUser,
        canViewAllCrew,
        canEditMedicalNotes,
        canAdjustThresholds,
        canManageSystem,
        canAccessCamera,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

