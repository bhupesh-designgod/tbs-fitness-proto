// ── Muskaan check-in — twice-weekly mood + energy pulse ──
// Wednesday (mid-week) and Sunday (week close). Two calm steps, then a
// one-line Biki reply that reflects what was picked. The answer feeds the
// coach feedback loop (see lib/coachState). Forgiveness, not punishment.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check } from 'lucide-react';
import { BottomSheet, RingCounter } from './Components';
import AvatarMark from './AvatarMark';
import { T } from '../../tokens';
import { muskaanResponse } from '../../lib/coachState';

const MOODS = [
  { v: 'low',   label: 'Low',   color: T.macroFat },
  { v: 'okay',  label: 'Okay',  color: T.textMid },
  { v: 'good',  label: 'Good',  color: T.gold },
  { v: 'great', label: 'Great', color: T.green },
];

export default function MuskaanCheckIn({ isOpen, onClose, onSubmit, variant = 'mid' }) {
  const [step, setStep] = useState('mood');
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(3);

  useEffect(() => {
    if (isOpen) { setStep('mood'); setMood(null); setEnergy(3); }
  }, [isOpen]);

  const title = variant === 'close' ? 'Week-close check-in' : 'Mid-week check-in';

  const handleMood = (m) => { setMood(m); setStep('energy'); };
  const handleSubmit = () => {
    onSubmit && onSubmit({ mood, energy });
    setStep('done');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center gap-3 mb-5">
        <AvatarMark size={40} ring status />
        <div className="min-w-0">
          <p className="font-body text-[10px] font-extrabold uppercase tracking-wider" style={{ color: T.gold }}>
            Biki · {title}
          </p>
          <h2 className="display-sm text-[#F4F2EC] uppercase leading-none mt-0.5">
            {step === 'mood' ? 'How are you feeling?' : step === 'energy' ? "What's your energy?" : 'Got it.'}
          </h2>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'mood' && (
          <motion.div key="mood" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
            <p className="font-body text-[13px] font-medium mb-4" style={{ color: T.textLow }}>
              No wrong answer. Be honest, it shapes your week.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {MOODS.map(m => (
                <motion.button
                  key={m.v}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleMood(m.v)}
                  className="flex items-center gap-2.5 rounded-xl px-4 py-4"
                  style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m.color }} />
                  <span className="font-body text-[15px] font-bold" style={{ color: T.text }}>{m.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'energy' && (
          <motion.div key="energy" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
            <button
              onClick={() => setStep('mood')}
              className="font-body text-[12px] mb-3 flex items-center gap-1 uppercase tracking-wider"
              style={{ color: T.textLow }}
            >
              <ChevronLeft size={13} strokeWidth={T.stroke} /> Back
            </button>
            <div className="flex flex-col items-center py-2">
              <RingCounter percentage={energy * 20} size={120} strokeWidth={9} color={T.gold} delay={0}>
                <div className="flex flex-col items-center">
                  <span className="font-display text-[40px] text-[#F4F2EC] leading-none">{energy}</span>
                  <span className="font-body text-[9px] font-extrabold uppercase tracking-wider mt-0.5" style={{ color: T.textFaint }}>of 5</span>
                </div>
              </RingCounter>
              <div className="flex gap-2 mt-6">
                {[1, 2, 3, 4, 5].map(n => (
                  <motion.button
                    key={n}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEnergy(n)}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-display text-[20px]"
                    style={{
                      background: energy === n ? T.goldGradCss : T.surface2,
                      color: energy === n ? T.goldInk : T.textLow,
                      border: `1px solid ${energy === n ? T.gold : T.hairline}`,
                    }}
                  >
                    {n}
                  </motion.button>
                ))}
              </div>
            </div>
            <motion.button whileTap={T.tap} onClick={handleSubmit} className="btn-primary mt-6">
              <Check size={16} strokeWidth={2.5} /> Submit check-in
            </motion.button>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start gap-3 rounded-xl p-4 mb-5" style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}>
              <AvatarMark size={36} ring />
              <p className="font-body text-[14px] font-medium leading-relaxed flex-1" style={{ color: T.text }}>
                {muskaanResponse({ mood, energy })}
              </p>
            </div>
            <motion.button whileTap={T.tap} onClick={onClose} className="btn-primary">Done</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}
