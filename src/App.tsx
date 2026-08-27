// Komponen root aplikasi.
// Mengatur navigasi antar halaman (tab) dan menampilkan semua modal global seperti login, pilih pet, dan evolusi.

import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HabitatDashboard } from './components/screens/HabitatDashboard';
import { ManageHabitsScreen } from './components/screens/ManageHabitsScreen';
import { BattleScreen } from './components/screens/BattleScreen';
import { MarriageScreen } from './components/MarriageScreen';
import { StoreScreen } from './components/screens/StoreScreen';
import { EvolutionScreen } from './components/screens/EvolutionScreen';
import { PetStatsScreen } from './components/screens/PetStatsScreen';
import { SanctuaryScreen } from './components/screens/SanctuaryScreen';
import { ChooseCompanionModal } from './components/modals/ChooseCompanionModal';
import { AddHabitModal } from './components/modals/AddHabitModal';
import { EditHabitModal } from './components/modals/EditHabitModal';
import { AuthModal } from './components/modals/AuthModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { AddPartnerModal } from './components/modals/AddPartnerModal';
import { FocusTimerModal } from './components/modals/FocusTimerModal';
import { EvolutionCutsceneModal } from './components/modals/EvolutionCutsceneModal';
import { GuideBookModal } from './components/modals/GuideBookModal';
import { Toast } from './components/Toast';

const AppContent: React.FC = () => {
  const {
    activeTab,
    isEvolutionCutsceneOpen,
    currentPet,
    pendingEvolutionStages,
    completeEvolutionCutscene,
    setIsEvolutionCutsceneOpen,
    isGuideBookOpen,
    setIsGuideBookOpen,
    guideBookInitialTab,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2e] flex flex-col selection:bg-[#4ade80] selection:text-[#005e2d]">
      <Header />
      <Toast />

      <main className="flex-1 w-full">
        {activeTab === 'habitat' && <HabitatDashboard />}
        {activeTab === 'habits' && <ManageHabitsScreen />}
        {activeTab === 'battle' && <BattleScreen />}
        {activeTab === 'marriage' && <MarriageScreen />}
        {activeTab === 'store' && <StoreScreen />}
        {activeTab === 'evolution' && <EvolutionScreen />}
        {activeTab === 'stats' && <PetStatsScreen />}
        {activeTab === 'sanctuary' && <SanctuaryScreen />}
      </main>

      <BottomNav />
      <ChooseCompanionModal />
      <AddHabitModal />
      <EditHabitModal />
      <AuthModal />
      <ProfileModal />
      <AddPartnerModal />
      <FocusTimerModal />
      <GuideBookModal
        isOpen={isGuideBookOpen}
        onClose={() => setIsGuideBookOpen(false)}
        initialTab={guideBookInitialTab}
      />
      
      {pendingEvolutionStages && (
        <EvolutionCutsceneModal
          isOpen={isEvolutionCutsceneOpen}
          pet={currentPet}
          currentStageData={pendingEvolutionStages.current}
          nextStageData={pendingEvolutionStages.next}
          onComplete={completeEvolutionCutscene}
          onCancel={() => setIsEvolutionCutsceneOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
