// ── Profile Screen ──
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { User, Target, Ruler, Bell, RotateCcw, Eye, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { USER_PROFILE } from '../data/mockData';
import { T } from '../tokens';

const STATES = [null, 'ON_TRACK', 'LAGGING', 'REST', 'DEPLETED'];
const STATE_LABELS = ['Auto', 'On Track', 'Lagging', 'Rest', 'Depleted'];

export default function Profile() {
  const { stateOverride, setStateOverride, resetData } = useApp();
  const shouldReduce = useReducedMotion();
  const [showStateToggle, setShowStateToggle] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  // Hidden toggle: tap "Preview" label 3 times
  const handleHiddenTap = () => {
    const count = tapCount + 1;
    setTapCount(count);
    if (count >= 3) {
      setShowStateToggle(true);
      setTapCount(0);
    }
  };

  const rows = [
    { icon: <Target size={18} strokeWidth={T.stroke} />, label: 'Plan', value: USER_PROFILE.plan },
    { icon: <User size={18} strokeWidth={T.stroke} />, label: 'Goal', value: USER_PROFILE.goal },
    { icon: <Ruler size={18} strokeWidth={T.stroke} />, label: 'Units', value: USER_PROFILE.units === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lb, in)' },
    { icon: <Bell size={18} strokeWidth={T.stroke} />, label: 'Notifications', value: 'On' },
  ];

  return (
    <div className="px-5 pb-24">
      {/* Profile header */}
      <motion.div
        initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 pt-2 pb-6"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-display text-[24px]"
          style={{ background: T.gold }}
        >
          <span className="text-black">{USER_PROFILE.name[0]}</span>
        </div>
        <div>
          <h1 className="display-md text-[#F4F2EC] uppercase">{USER_PROFILE.name}</h1>
          <p className="font-body text-[13px] font-medium text-white/45">Week {USER_PROFILE.weekNumber} of {USER_PROFILE.totalWeeks}</p>
        </div>
      </motion.div>

      <div className="metallic-divider mb-5" />

      {/* Settings rows */}
      <div className="space-y-1">
        {rows.map((row, i) => (
          <motion.button
            key={row.label}
            initial={shouldReduce ? {} : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="w-full flex items-center gap-4 py-3.5 px-1"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-white/30">{row.icon}</span>
            <span className="font-body text-[14px] text-white/70 flex-1 text-left">{row.label}</span>
            <span className="font-body text-[13px] text-white/35">{row.value}</span>
            <ChevronRight size={14} strokeWidth={T.stroke} className="text-white/15" />
          </motion.button>
        ))}
      </div>

      {/* Hidden state preview toggle */}
      <div className="mt-8">
        <button
          onClick={handleHiddenTap}
          className="font-body text-[11px] text-white/15 select-none"
        >
          <Eye size={12} strokeWidth={T.stroke} className="inline mr-1 opacity-30" />
          Preview
        </button>

        {showStateToggle && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 rounded-xl p-4"
            style={{ background: T.surface, border: `1px solid ${T.hairlineStrong}` }}
          >
            <p className="kicker mb-3">State preview</p>
            <div className="flex flex-wrap gap-2">
              {STATES.map((state, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStateOverride(state)}
                  className="px-3 py-1.5 rounded-full font-body text-[12px] transition-all"
                  style={{
                    background: stateOverride === state ? T.goldGrad : T.surface2,
                    color: stateOverride === state ? '#0B0B0C' : 'rgba(255,255,255,0.5)',
                    border: `1px solid ${stateOverride === state ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {STATE_LABELS[i]}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Reset demo data */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={resetData}
        className="btn-secondary w-full mt-8"
      >
        <RotateCcw size={14} strokeWidth={T.stroke} />
        Reset demo data
      </motion.button>

      {/* Version */}
      <p className="text-center font-body text-[11px] text-white/15 mt-6">TBS v0.1 Prototype</p>
    </div>
  );
}
