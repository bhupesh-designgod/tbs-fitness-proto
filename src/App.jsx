// ── App Shell ──
// Tab routing, page transitions, 430px centered layout

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Home as HomeIcon, Utensils, Dumbbell, MessageCircle, ClipboardCheck } from 'lucide-react';
import { TabBar } from './components/ui/Components';
import { AppProvider } from './context/AppContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import Onboarding from './onboarding/Onboarding';
import Walkthrough from './onboarding/Walkthrough';
import Auth from './auth/Auth';

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
import Notifications from './pages/Notifications';

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
  // First-run product tour (set by signup; cleared once seen).
  const [walkthrough, setWalkthrough] = useLocalStorage('tbs-walkthrough', { done: false });

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
    if (overlay === 'notifications') return (
      <Notifications
        onBack={() => setOverlay(null)}
        onNavigate={handleTabChange}
      />
    );
    if (overlay === 'checkinDetail') return (
      <CheckInDetail
        checkInId={checkInId}
        onBack={() => setOverlay(null)}
        onMessageBiki={() => { setOverlay(null); handleTabChange('coach'); }}
      />
    );

    switch (activeTab) {
      case 'home': return <Home onProfileClick={() => setOverlay('profile')} onNavigate={handleTabChange} onNotifications={() => setOverlay('notifications')} />;
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

  const handleTabChange = useCallback((tab) => {
    setOverlay(null);
    setActiveTab(tab);
  }, []);

  return (
    <div className="app-shell">
      {/* Overlay back button — pages with their own header don't need this */}
      {overlay && overlay !== 'checkinDetail' && overlay !== 'notifications' && (
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

      {/* First-run walkthrough — coachmarks over the live app */}
      {!walkthrough.done && !overlay && (
        <Walkthrough
          onNavigate={handleTabChange}
          onDone={() => { setWalkthrough({ done: true }); handleTabChange('home'); }}
        />
      )}
    </div>
  );
}

export default function App() {
  // Persisted gates. Auth first, then onboarding (new sign-ups only), then app.
  const [auth, setAuth] = useLocalStorage('tbs-auth', { loggedIn: false, user: null });
  const [onboarding, setOnboarding] = useLocalStorage('tbs-onboarding', { done: false, answers: null });
  const [, setWalkthrough] = useLocalStorage('tbs-walkthrough', { done: false });

  // New account → run onboarding, then the first-run tour.
  const handleSignup = (user) => {
    setOnboarding({ done: false, answers: null });
    setWalkthrough({ done: false });
    setAuth({ loggedIn: true, user });
  };

  // Returning user → assume already onboarded + toured, straight to home.
  const handleLogin = (user) => {
    setOnboarding(prev => (prev.done ? prev : { done: true, answers: prev.answers }));
    setWalkthrough({ done: true });
    setAuth({ loggedIn: true, user });
  };

  const finishOnboarding = (answers) => {
    setOnboarding({ done: true, answers });
  };

  if (!auth.loggedIn) {
    return <Auth onLogin={handleLogin} onSignup={handleSignup} />;
  }

  if (!onboarding.done) {
    return <Onboarding onComplete={finishOnboarding} />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
