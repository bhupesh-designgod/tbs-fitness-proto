// ── App Shell ──
// Tab routing, page transitions, 430px centered layout

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Home as HomeIcon, Utensils, Dumbbell, MessageCircle, BarChart3 } from 'lucide-react';
import { TabBar, Header } from './components/ui/Components';
import { AppProvider } from './context/AppContext';

// Pages
import Home from './pages/Home';
import Nutrition from './pages/Nutrition';
import Train from './pages/Train';
import Coach from './pages/Coach';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import CheckIn from './pages/CheckIn';
import MacroDetail from './pages/MacroDetail';

const TABS = [
  { id: 'home', label: 'Home', icon: <HomeIcon size={20} strokeWidth={1.5} /> },
  { id: 'nutrition', label: 'Nutrition', icon: <Utensils size={20} strokeWidth={1.5} /> },
  { id: 'train', label: 'Train', icon: <Dumbbell size={20} strokeWidth={1.5} /> },
  { id: 'coach', label: 'Coach', icon: <MessageCircle size={20} strokeWidth={1.5} /> },
  { id: 'progress', label: 'Progress', icon: <BarChart3 size={20} strokeWidth={1.5} /> },
];

function AppContent() {
  const shouldReduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState('home');
  const [overlay, setOverlay] = useState(null); // 'profile' | 'checkin' | 'macroDetail'

  const pageVariants = shouldReduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  const renderPage = () => {
    // Overlays take priority
    if (overlay === 'profile') return <Profile />;
    if (overlay === 'checkin') return <CheckIn onDone={() => setOverlay(null)} />;
    if (overlay === 'macroDetail') return <MacroDetail onBack={() => setOverlay(null)} />;

    switch (activeTab) {
      case 'home': return <Home />;
      case 'nutrition': return <Nutrition onMacroDetail={() => setOverlay('macroDetail')} />;
      case 'train': return <Train />;
      case 'coach': return <Coach onCheckIn={() => setOverlay('checkin')} />;
      case 'progress': return <Progress />;
      default: return <Home />;
    }
  };

  const handleTabChange = (tab) => {
    setOverlay(null);
    setActiveTab(tab);
  };

  return (
    <div className="app-shell">
      {/* Header (always visible unless in overlay) */}
      {!overlay && activeTab !== 'home' && (
        <Header
          onProfileClick={() => setOverlay('profile')}
          onBikiClick={() => handleTabChange('coach')}
        />
      )}

      {/* Overlay back button */}
      {overlay && (
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
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
