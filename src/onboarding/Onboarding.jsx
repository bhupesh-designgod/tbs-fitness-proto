// ── Onboarding controller (v4) ──
// Drives the 18-screen flow: horizontal slides, persistent chrome
// (progress bar + back + skip), auto-advance for single-select cards,
// tap CTA on the Door ("Let's Do This"), press-and-hold on the Pledge.
// Ambient synth music with mute toggle.

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { T } from '../tokens';
import { track } from '../lib/analytics';
import { STEPS } from './steps';
// import useOnboardingMusic from './useOnboardingMusic'; // shelved

const LAST = STEPS.length - 1;

const DEFAULT_ANSWERS = {
  name: '', age: 25, sex: null,
  height: 170, heightUnit: 'cm',
  weight: 70, weightUnit: 'kg',
  goal: null, experience: null, trainingTime: null,
  routine: null, diet: null,
  meals_per_day: 3, shakes_per_day: 1, snacks_per_day: 1,
  supplements: [], anabolics: 'none', anabolicsNote: '',
  allergies: [],
  photos: { front: false, back: false, side: false },
  bloodwork: null, bloodworkSkipped: false, kidneyTest: null,
  // Health intake
  trainingDays: 4, sessionLength: null, preferredDays: [],
  injuries: '', conditions: '',
  sleepTime: '', wakeTime: '', sleepDuration: null,
  favoriteFoods: [], water: null,
  digestion: null, acidity: null, digestiveIssues: [],
  notes: '',
};

const slide = {
  enter: (d) => ({ x: d >= 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (d) => ({ x: d >= 0 ? '-100%' : '100%' }),
};
const slideT = { duration: 0.25, ease: [0.16, 1, 0.3, 1] };

export default function Onboarding({ onComplete }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);

  // Music (shelved)
  // const { muted, toggleMute, setProgress } = useOnboardingMusic();
  // useEffect(() => { setProgress(i / LAST); }, [i, setProgress]);

  const step = STEPS[i];
  const { Comp } = step;

  const update = useCallback((patch) => setAnswers(prev => ({ ...prev, ...patch })), []);

  const next = useCallback(() => {
    setDir(1);
    setI(v => {
      if (v >= LAST) { track('onboarding_completed', { answers }); onComplete(answers); return v; }
      return v + 1;
    });
  }, [answers, onComplete]);

  const back = useCallback(() => { setDir(-1); setI(v => Math.max(0, v - 1)); }, []);

  // Single-select: apply value, let the 200ms selection animation play, then slide.
  const selectNext = useCallback((patch) => {
    setAnswers(prev => ({ ...prev, ...patch }));
    setTimeout(() => { setDir(1); setI(v => Math.min(LAST, v + 1)); }, 220);
  }, []);

  const skip = useCallback(() => {
    track('onboarding_skipped', { screen_index: i, screen_name: step.id });
    onComplete(answers);
  }, [i, step.id, answers, onComplete]);

  // Chrome rules
  const isPledge = step.kind === 'pledge';
  const isDoor = step.kind === 'door';
  const isMotivation = step.id === 'motivation';
  const showChrome = !isDoor && !isPledge;             // door & pledge have none
  const showProgress = showChrome && i < LAST - 1;    // hide on reveal + pledge
  const showSkip = showChrome && !isMotivation && i < LAST - 1; // hide on motivation, reveal, pledge
  const padTop = (isDoor || isPledge) ? 0 : 52;
  const progress = (i / (LAST - 1)) * 100;            // cap at reveal (100%)

  return (
    <div className="relative mx-auto overflow-hidden" style={{ maxWidth: 430, height: '100dvh', background: T.bg }}>
      <AnimatePresence custom={dir} initial={false}>
        <motion.div
          key={step.id}
          custom={dir}
          variants={slide}
          initial="enter" animate="center" exit="exit"
          transition={slideT}
          className="absolute inset-0"
          style={{ paddingTop: padTop }}
        >
          <Comp
            answers={answers}
            update={update}
            next={next}
            selectNext={selectNext}
            skipField={next}
          />
        </motion.div>
      </AnimatePresence>

      {/* Chrome */}
      {showChrome && (
        <div className="absolute top-0 inset-x-0 z-20 px-5 pt-4 pb-2 flex items-center gap-3 pointer-events-none">
          <motion.button
            whileTap={T.tapSmall}
            onClick={back}
            aria-label="Back"
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 pointer-events-auto -ml-1"
            style={{ background: 'rgba(11,11,12,0.45)' }}
          >
            <ArrowLeft size={20} strokeWidth={2} style={{ color: T.text }} />
          </motion.button>

          <div className="flex-1">
            {showProgress && (
              <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(244,242,236,0.14)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: T.gold }}
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2 pointer-events-auto" style={{ minWidth: 32 }}>
            {showSkip && (
              <button onClick={skip} className="font-body text-[14px] font-medium" style={{ color: T.textMid }}>
                Skip
              </button>
            )}
          </div>
        </div>
      )}

      {/* 🔊 Music mute toggle — shelved for now */}
    </div>
  );
}
