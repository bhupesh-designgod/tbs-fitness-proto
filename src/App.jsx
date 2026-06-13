// ── App Shell ──
// Tab routing, page transitions, 430px centered layout

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Home as HomeIcon, Utensils, Dumbbell, MessageCircle, ClipboardCheck } from 'lucide-react';
import { TabBar } from './components/ui/Components';
import { AppProvider } from './context/AppContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import Onboarding from './onboarding/Onboarding';

// Pages
import Home from './pages/Home';
import Nutrition from './pages/Nutrition';
import Train from './pages/Train';
import Coach from './pages/Coach';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import CheckIn from './pages/CheckIn';
import CheckInDetail from './pages/CheckInDetail';
import MacroDetail from './pages/MacroDetail';

const TABS = [
  { id: 'home', label: 'Home', icon: <HomeIcon size={20} strokeWidth={1.75} /> },
  { id: 'nutrition', label: 'Nutrition', icon: <Utensils size={20} strokeWidth={1.75} /> },
  { id: 'coach', label: 'Coach', icon: <MessageCircle size={20} strokeWidth={1.75} /> },
  { id: 'train', label: 'Train', icon: <Dumbbell size={20} strokeWidth={1.75} /> },
  { id: 'progress', label: 'Reviews', icon: <ClipboardCheck size={20} strokeWidth={1.75} /> },
];

function AppContent() {
  const shouldReduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState('home');
  const [overlay, setOverlay] = useState(null); // 'profile' | 'checkin' | 'macroDetail' | 'checkinDetail'
  const [checkInId, setCheckInId] = useState(null);

  const pageVariants = shouldReduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  const openCheckInDetail = (id) => {
    setCheckInId(id);
    setOverlay('checkinDetail');
  };

  const renderPage = () => {
    // Overlays take priority
    if (overlay === 'profile') return <Profile />;
    if (overlay === 'checkin') return <CheckIn onDone={() => setOverlay(null)} />;
    if (overlay === 'macroDetail') return <MacroDetail onBack={() => setOverlay(null)} />;
    if (overlay === 'checkinDetail') return (
      <CheckInDetail
        checkInId={checkInId}
        onBack={() => setOverlay(null)}
        onMessageBiki={() => { setOverlay(null); handleTabChange('coach'); }}
      />
    );

    switch (activeTab) {
      case 'home': return <Home onProfileClick={() => setOverlay('profile')} onNavigate={handleTabChange} />;
      case 'nutrition': return <Nutrition onMacroDetail={() => setOverlay('macroDetail')} />;
      case 'train': return <Train />;
      case 'coach': return <Coach onCheckIn={() => setOverlay('checkin')} />;
      case 'progress': return (
        <Progress
          onOpenCheckIn={openCheckInDetail}
          onStartCheckIn={() => setOverlay('checkin')}
        />
      );
      default: return <Home />;
    }
  };

  const handleTabChange = (tab) => {
    setOverlay(null);
    setActiveTab(tab);
  };

  return (
    <div className="app-shell">
      {/* Overlay back button — pages with their own header don't need this */}
      {overlay && overlay !== 'checkinDetail' && (
        <div className="px-5 pt-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setOverlay(null)}
            className="font-body text-[14px] text-white/50 flex items-center gap-1"
          >
            <span className="text-white/30">&larr;</span> Back
          </motion.button>
        </div>
      )}

      {/* Page content with transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={overlay || activeTab}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {/* Tab bar (hidden during overlays) */}
      {!overlay && (
        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabs={TABS}
        />
      )}
    </div>
  );
}

export default function App() {
  // Persisted onboarding gate — users never see the flow twice.
  const [onboarding, setOnboarding] = useLocalStorage('tbs-onboarding', { done: false, answers: null });

  const finishOnboarding = (answers) => {
    setOnboarding({ done: true, answers });
  };

  if (!onboarding.done) {
    return <Onboarding onComplete={finishOnboarding} />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
