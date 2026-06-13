// ── Macro Detail Screen ──
import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { MacroBar, NumericCounter } from '../components/ui/Components';
import { useApp } from '../context/AppContext';
import { DAILY_TARGETS } from '../data/mockData';
import { T } from '../tokens';

const MACROS = [
  { key: 'protein', label: 'Protein', color: 'gold', unit: 'g' },
  { key: 'carbs', label: 'Carbs', color: 'platinum', unit: 'g' },
  { key: 'fat', label: 'Fat', color: 'bronze', unit: 'g' },
  { key: 'calories', label: 'Calories', color: 'white', unit: '' },
];

const colorValues = {
  gold: T.gold,
  platinum: T.macroFat,
  bronze: T.macroCarbs,
  white: '#F4F2EC',
};

export default function MacroDetail({ onBack }) {
  const { logged, history } = useApp();
  const shouldReduce = useReducedMotion();

  // 7-day mini history per macro
  const last7 = useMemo(() => history.slice(-7), [history]);

  return (
    <div className="px-5 pb-24">
      {/* Back button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="flex items-center gap-1 py-3 font-body text-[14px] text-white/50"
      >
        <ChevronLeft size={18} strokeWidth={T.stroke} />
        Back
      </motion.button>

      <motion.h1
        className="display-md text-[#F4F2EC] mb-6"
        initial={shouldReduce ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Macros
      </motion.h1>

      <div className="space-y-8">
        {MACROS.map((macro, i) => {
          const current = logged[macro.key] || 0;
          const target = DAILY_TARGETS[macro.key];

          // 7-day history bars
          const historyValues = last7.map(d => d.macros?.[macro.key] ?? 0);
          const maxHist = Math.max(...historyValues, target);

          return (
            <motion.div
              key={macro.key}
              initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              {/* Large numeral */}
              <div className="flex items-baseline gap-2 mb-2">
                <NumericCounter
                  value={current}
                  className="text-[40px]"
                  duration={0.6}
                />
                <span className="font-body text-[14px] text-white/30">/ {target}{macro.unit}</span>
              </div>

              {/* Full-width bar */}
              <MacroBar
                label={macro.label}
                current={current}
                target={target}
                color={macro.color}
              />

              {/* 7-day mini history */}
              <div className="mt-3">
                <p className="font-body text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Last 7 days</p>
                <div className="flex items-end gap-1 h-[32px]">
                  {historyValues.map((val, j) => (
                    <motion.div
                      key={j}
                      className="flex-1 rounded-t-sm"
                      style={{
                        background: colorValues[macro.color] || macro.color,
                        opacity: 0.4,
                      }}
                      initial={shouldReduce ? { height: `${(val / maxHist) * 100}%` } : { height: 0 }}
                      animate={{ height: `${Math.max((val / maxHist) * 100, 4)}%` }}
                      transition={{ delay: 0.3 + j * 0.05, duration: 0.4 }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {last7.map((d, j) => (
                    <span key={j} className="flex-1 text-center font-body text-[8px] text-white/15">
                      {d.dayOfWeek}
                    </span>
                  ))}
                </div>
              </div>

              {i < MACROS.length - 1 && <div className="metallic-divider mt-6" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
