// ── First-run Walkthrough ──
// Runs once after onboarding (new users only). A coachmark tour that spotlights
// real UI across tabs: the daily score, logging a meal, and adjusting when you
// ate something else. Persisted via the parent so it never shows twice.

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { T } from '../tokens';
import { track } from '../lib/analytics';

// Each step pins to a real element (data-tour) on a given tab.
const STEPS = [
  {
    tab: 'home',
    selector: '[data-tour="score"]',
    kicker: 'Your daily score',
    title: 'POINTS = MOMENTUM',
    body: 'You earn points for logging meals and hitting your water — 30 a day. It’s how you and Biki see your consistency at a glance.',
  },
  {
    tab: 'nutrition',
    selector: '[data-tour="meal-card"]',
    kicker: 'Logging meals',
    title: 'ONE TAP TO LOG',
    body: 'Tap any meal to log it exactly as Biki planned it. That’s it — your macros and score update instantly.',
  },
  {
    tab: 'nutrition',
    selector: '[data-tour="meal-card"]',
    kicker: 'Ate something else?',
    title: 'ADJUST OR REPLACE',
    body: 'Open the meal and hit Adjust to tweak portions, or Replace to swap it out. Grabbed something totally off-plan? Use Add Meal at the bottom.',
  },
];

const PAD = 10; // spotlight padding around the target

export default function Walkthrough({ onNavigate, onDone }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);
  const step = STEPS[i];
  const isLast = i === STEPS.length - 1;

  // Keep the navigate callback in a ref so the step effect depends only on `i`
  // (the parent passes a fresh function each render — depending on it loops).
  const navRef = useRef(onNavigate);
  useEffect(() => { navRef.current = onNavigate; });

  useEffect(() => { track('walkthrough_started'); }, []);

  // On each step: switch tab, then poll for the target element and measure it.
  useEffect(() => {
    const s = STEPS[i];
    let raf = 0;
    let tries = 0;
    let cancelled = false;

    navRef.current(s.tab);
    setRect(null);

    const locate = () => {
      if (cancelled) return;
      const el = document.querySelector(s.selector);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'auto' });
        raf = requestAnimationFrame(() => {
          if (cancelled) return;
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        });
      } else if (tries++ < 50) {
        raf = requestAnimationFrame(locate);
      }
    };

    const t = setTimeout(locate, 120); // let the tab transition mount
    return () => { cancelled = true; clearTimeout(t); cancelAnimationFrame(raf); };
  }, [i]);

  const finish = useCallback((skipped) => {
    track(skipped ? 'walkthrough_skipped' : 'walkthrough_completed', { stepIndex: i });
    onDone();
  }, [i, onDone]);

  const next = () => { if (isLast) finish(false); else setI(v => v + 1); };
  const back = () => setI(v => Math.max(0, v - 1));

  // Tooltip placement: below the target if it sits in the top half, else above.
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const placeBelow = rect ? rect.top + rect.height / 2 < vh * 0.5 : true;

  const spotlight = rect && {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };

  return (
    <div className="fixed inset-0 z-[60]" style={{ pointerEvents: 'auto' }}>
      {/* Dimmer + spotlight cutout (box-shadow trick) */}
      <AnimatePresence mode="wait">
        {spotlight ? (
          <motion.div
            key={`hole-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute rounded-2xl"
            style={{
              top: spotlight.top, left: spotlight.left,
              width: spotlight.width, height: spotlight.height,
              boxShadow: '0 0 0 9999px rgba(11,11,12,0.82)',
              border: `2px solid ${T.gold}`,
            }}
          />
        ) : (
          // Fallback while measuring — full dim, no hole
          <div className="absolute inset-0" style={{ background: 'rgba(11,11,12,0.82)' }} />
        )}
      </AnimatePresence>

      {/* Skip */}
      <button
        onClick={() => finish(true)}
        className="absolute top-4 right-5 font-body text-[14px] font-medium z-10"
        style={{ color: T.textMid }}
      >
        Skip tour
      </button>

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`tip-${i}`}
          initial={{ opacity: 0, y: placeBelow ? -8 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: T.easeOut }}
          className="absolute left-1/2 -translate-x-1/2 w-[88%]"
          style={{
            maxWidth: 360,
            ...(rect
              ? (placeBelow
                  ? { top: Math.min(rect.top + rect.height + PAD + 14, vh - 220) }
                  : { top: Math.max(rect.top - PAD - 14 - 200, 70) })
              : { top: '50%', transform: 'translate(-50%, -50%)' }),
          }}
        >
          <div className="card p-5" style={{ borderColor: T.hairlineStrong }}>
            <p className="kicker kicker-gold mb-2">{step.kicker}</p>
            <h2 className="display-sm text-[#F4F2EC] mb-2">{step.title}</h2>
            <p className="font-body text-[13px] leading-relaxed mb-4" style={{ color: T.textMid }}>
              {step.body}
            </p>

            <div className="flex items-center justify-between">
              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: idx === i ? 18 : 6,
                      background: idx === i ? T.gold : T.hairlineStrong,
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {i > 0 && (
                  <motion.button
                    whileTap={T.tapSmall}
                    onClick={back}
                    aria-label="Back"
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ border: `1px solid ${T.hairlineStrong}` }}
                  >
                    <ArrowLeft size={16} strokeWidth={2} style={{ color: T.textMid }} />
                  </motion.button>
                )}
                <motion.button
                  whileTap={T.tap}
                  onClick={next}
                  className="flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-full font-display text-[15px] uppercase tracking-wider"
                  style={{ background: T.gold, color: T.bg }}
                >
                  {isLast ? 'Got it' : 'Next'}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
