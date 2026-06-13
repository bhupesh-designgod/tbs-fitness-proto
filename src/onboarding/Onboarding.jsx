// ── Onboarding flow controller ──
// Holds step index + collected answers, drives springy horizontal slides,
// and renders persistent chrome (progress bar, back, skip) over the steps.
// Splash → Welcome → Goal → About → Keep Moving → Diet → Supplements →
// Routine → Health → Photos → That's all → Pledge.

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { T } from '../tokens';
import { track } from '../lib/analytics';
import { STEP_COMPONENTS } from './steps';

// kind: 'hero' (full-bleed moment) | 'form' (questionnaire with progress bar)
const STEPS = [
  { id: 'splash', kind: 'hero' },
  { id: 'welcome', kind: 'hero' },
  { id: 'goal', kind: 'form' },
  { id: 'about', kind: 'form' },
  { id: 'keepMoving', kind: 'hero' },
  { id: 'diet', kind: 'form' },
  { id: 'supplements', kind: 'form' },
  { id: 'routine', kind: 'form' },
  { id: 'health', kind: 'form' },
  { id: 'photos', kind: 'form' },
  { id: 'allDone', kind: 'hero' },
  { id: 'pledge', kind: 'hero' },
];

const FORM_IDS = STEPS.filter(s => s.kind === 'form').map(s => s.id);
const LAST_INDEX = STEPS.length - 1;

const DEFAULT_ANSWERS = {
  goal: null,
  age: '', weight: '', weightUnit: 'kg', gender: 'male', height: '', heightUnit: 'cm', targetWeight: '', note: '',
  dietType: 'veg', mealsPerDay: 4, foodsEnjoy: [], allergies: [],
  supplements: [], steroidsNote: '',
  workType: 'desk', wakeTime: '07:00', trainTime: '18:30',
  conditions: [], bloodTest: 'no',
  photos: { front: false, side: false, back: false },
};

const slideVariants = {
  enter: (dir) => ({ x: dir >= 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (dir) => ({ x: dir >= 0 ? '-100%' : '100%' }),
};

// Snappy spring ~200ms feel
const slideTransition = { type: 'spring', stiffness: 520, damping: 42, mass: 0.7 };

export default function Onboarding({ onComplete }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);

  const step = STEPS[index];
  const Screen = STEP_COMPONENTS[step.id];

  useEffect(() => { track('onboarding_started'); }, []);

  const update = useCallback((patch) => setAnswers(prev => ({ ...prev, ...patch })), []);

  const goNext = useCallback(() => {
    setDir(1);
    setIndex(i => {
      if (i >= LAST_INDEX) return i;
      return i + 1;
    });
  }, []);

  const goBack = useCallback(() => {
    setDir(-1);
    setIndex(i => Math.max(0, i - 1));
  }, []);

  const complete = useCallback(() => {
    track('onboarding_completed', { answers });
    onComplete(answers);
  }, [answers, onComplete]);

  const skip = useCallback(() => {
    track('onboarding_skipped', { screenIndex: index, screenId: step.id });
    onComplete(answers);
  }, [index, step.id, answers, onComplete]);

  // Splash auto-advances
  useEffect(() => {
    if (step.id !== 'splash') return undefined;
    const t = setTimeout(goNext, 1500);
    return () => clearTimeout(t);
  }, [step.id, goNext]);

  // Pledge commit finishes the flow
  const handleNext = step.id === 'pledge' ? complete : goNext;

  // Chrome visibility
  const showChrome = step.id !== 'splash';
  const showBack = index >= 2; // from Goal onward (splash + welcome have none)
  const showSkip = step.id !== 'splash' && step.id !== 'pledge';
  const isForm = step.kind === 'form';
  const formPos = FORM_IDS.indexOf(step.id); // 0..6 for forms, -1 otherwise

  return (
    <div className="relative mx-auto overflow-hidden" style={{ maxWidth: 430, height: '100dvh', background: T.bg }}>

      {/* Sliding step content */}
      <AnimatePresence custom={dir} initial={false}>
        <motion.div
          key={step.id}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
          className="absolute inset-0"
          style={{ paddingTop: isForm ? 64 : 0 }}
        >
          <Screen
            answers={answers}
            update={update}
            onNext={handleNext}
            onCommit={complete}
            onSkipField={goNext}
          />
        </motion.div>
      </AnimatePresence>

      {/* Persistent chrome overlay */}
      {showChrome && (
        <div className="absolute top-0 inset-x-0 z-20 px-5 pt-4 pb-2 flex items-center gap-3 pointer-events-none">
          {/* Back */}
          <div className="w-9 shrink-0">
            {showBack && (
              <motion.button
                whileTap={T.tapSmall}
                onClick={goBack}
                aria-label="Back"
                className="w-9 h-9 rounded-full flex items-center justify-center pointer-events-auto"
                style={{ background: 'rgba(11,11,12,0.5)', border: `1px solid ${T.hairline}` }}
              >
                <ArrowLeft size={18} strokeWidth={2} style={{ color: T.text }} />
              </motion.button>
            )}
          </div>

          {/* Progress bar — forms only */}
          <div className="flex-1 flex items-center gap-1.5">
            {isForm && FORM_IDS.map((id, i) => (
              <div key={id} className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: T.hairline }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={false}
                  animate={{ width: i <= formPos ? '100%' : '0%' }}
                  transition={{ duration: 0.3, ease: T.easeOut }}
                  style={{ background: T.gold }}
                />
              </div>
            ))}
          </div>

          {/* Skip */}
          <div className="shrink-0 flex justify-end" style={{ minWidth: 36 }}>
            {showSkip && (
              <button
                onClick={skip}
                className="font-body text-[14px] font-medium pointer-events-auto px-1"
                style={{ color: T.textMid }}
              >
                Skip
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
