import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Navigation, PageId } from './components/layout/Navigation';
import { SubHeader } from './components/layout/SubHeader';
import { Footer } from './components/layout/Footer';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { CrewOverviewPage } from './pages/CrewOverviewPage';
import { AstronautProfilePage } from './pages/AstronautProfilePage';
import { VitalsPage } from './pages/VitalsPage';
import { SleepPage } from './pages/SleepPage';
import { ExercisePage } from './pages/ExercisePage';
import { NutritionPage } from './pages/NutritionPage';
import { EEGPage } from './pages/EEGPage';
import { CameraPage } from './pages/CameraPage';
import { DevicesPage } from './pages/DevicesPage';
import { AlertsReportsPage } from './pages/AlertsReportsPage';
import { SettingsPrivacyPage } from './pages/SettingsPrivacyPage';

const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('crew-overview');
  const { setSelectedAstronautId } = useApp();

  const handleNavigate = (page: PageId, astronautId?: string) => {
    if (astronautId) {
      setSelectedAstronautId(astronautId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine whether to display the Astronaut selector sub-header
  const isAstronautSpecificPage = [
    'live-dashboard',
    'astronaut-profile',
    'vitals',
    'sleep',
    'exercise',
    'nutrition',
    'eeg',
    'camera',
    'devices',
  ].includes(currentPage);

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      {/* Top Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Mission Header */}
      <Header onNavigateToAlerts={() => handleNavigate('alerts-reports')} />

      {/* Primary 11-Page Navigation */}
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Astronaut Specific Sub-Header (when on profile, vitals, etc.) */}
      {isAstronautSpecificPage && <SubHeader />}

      {/* Main Content Area */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentPage === 'live-dashboard' && <DashboardPage />}
        {currentPage === 'crew-overview' && (
          <CrewOverviewPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'astronaut-profile' && (
          <AstronautProfilePage onNavigate={handleNavigate} />
        )}
        {currentPage === 'vitals' && <VitalsPage />}
        {currentPage === 'sleep' && <SleepPage />}
        {currentPage === 'exercise' && <ExercisePage />}
        {currentPage === 'nutrition' && <NutritionPage />}
        {currentPage === 'eeg' && <EEGPage />}
        {currentPage === 'camera' && <CameraPage />}
        {currentPage === 'devices' && <DevicesPage />}
        {currentPage === 'alerts-reports' && <AlertsReportsPage />}
        {currentPage === 'settings-privacy' && <SettingsPrivacyPage />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;

