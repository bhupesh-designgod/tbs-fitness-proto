// ── FloatingCoach — the one coach presence, on every screen except chat ──
// Messenger-style chat head. Draggable (and swipe-to-dock); stays inside the
// app frame so it never drifts off-screen on desktop. Cadence is faked for the
// prototype: it cycles through every scenario every 30s so all states are
// demoable on any day, in this order:
//   1. thought   — quote of the day
//   2. checkin   — Biki checking in (mood / energy pulse)
//   3. bloodwork — asks for a health report, routes to Reviews to upload
//   4. surplus   — off-plan macros; tap opens a meal-adjust sheet
// Confirming a scenario slides the avatar away after ~6s; a swipe brings it back.

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, X, Quote, Check, ChevronRight, Activity, FileText, Flame, Upload, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { track } from '../../lib/analytics';
import { coachTeaser } from '../../lib/coachState';
import { T } from '../../tokens';
import { COACH_QUOTES, PHOTOS, PLAN_TOTALS } from '../../data/mockData';
import { BottomSheet } from './Components';
import AvatarMark from './AvatarMark';
import MuskaanCheckIn from './MuskaanCheckIn';

const sumFoods = (foods) => foods.reduce(
  (a, f) => ({
    calories: a.calories + (f.calories || 0),
    protein: a.protein + (f.protein || 0),
    carbs: a.carbs + (f.carbs || 0),
    fat: a.fat + (f.fat || 0),
  }),
  { calories: 0, protein: 0, carbs: 0, fat: 0 },
);

// ── Daily-quote modal — coach portrait bg, the line, a commitment ──
function CoachQuoteModal({ quote, committed, onCommit, onClose, onMessage }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-[400px] rounded-3xl overflow-hidden"
        style={{ border: `1px solid ${T.hairlineStrong}` }}
        initial={shouldReduce ? {} : { opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={PHOTOS.bikiPortrait} alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(30%) contrast(1.05) brightness(0.5)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(11,11,12,0.97) 6%, rgba(11,11,12,0.72) 46%, rgba(11,11,12,0.30) 100%)' }} />

        <motion.button whileTap={T.tapSmall} onClick={onClose} aria-label="Close"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${T.hairlineStrong}` }}>
          <X size={16} strokeWidth={2} style={{ color: T.text }} />
        </motion.button>

        <div className="relative pt-32 px-6 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Quote size={16} strokeWidth={2} style={{ color: T.gold }} />
            <p className="font-body text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: T.gold }}>Today's mindset</p>
          </div>
          <p className="font-body text-[20px] font-semibold leading-[1.4] text-[#F4F2EC] mb-5">{quote.text}</p>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0" style={{ border: `1.5px solid ${T.gold}` }}>
              <img src={PHOTOS.bikiPortrait} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="leading-tight">
              <p className="font-body text-[12px] font-bold" style={{ color: T.text }}>Biki Singh</p>
              <p className="font-body text-[10px] font-medium uppercase tracking-wider" style={{ color: T.textLow }}>IFBB Pro · Head Coach</p>
            </div>
          </div>
          {committed ? (
            <div className="btn-primary" style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.gold }}>
              <Check size={16} strokeWidth={2.5} /> Committed for today
            </div>
          ) : (
            <motion.button whileTap={T.tap} onClick={onCommit} className="btn-primary btn-shine-wrap">
              <Sparkles size={15} strokeWidth={2} /> I'm committed
            </motion.button>
          )}
          <button onClick={onMessage} className="btn-ghost mt-3.5 mx-auto" style={{ color: T.textMid }}>
            Message Biki <ChevronRight size={13} strokeWidth={T.stroke} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Meal-adjust sheet — where the surplus / deficit gets resolved ──
function MealAdjustSheet({ isOpen, onClose, gap, meals, onPick, onAddNew }) {
  const short = gap.calories > 0;
  const accent = short ? T.cal : T.macroFat;
  const macroBits = [
    { v: gap.protein, label: 'Protein', color: T.macroProtein },
    { v: gap.fat, label: 'Fat', color: T.macroFat },
    { v: gap.carbs, label: 'Carbs', color: T.macroCarbs },
  ].filter(b => Math.abs(b.v) >= 2);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center gap-3 mb-1.5">
        <AvatarMark size={38} ring />
        <div className="min-w-0">
          <p className="font-body text-[10px] font-extrabold uppercase tracking-wider" style={{ color: T.gold }}>From Biki</p>
          <h2 className="display-sm text-[#F4F2EC] uppercase leading-none mt-0.5">
            {short ? 'Where should it go?' : 'Ease back where?'}
          </h2>
        </div>
      </div>
      <p className="font-body text-[13px] font-medium mb-3 leading-snug" style={{ color: T.textLow }}>
        {short
          ? `You're ${Math.abs(gap.calories).toLocaleString()} kcal short of today's plan. Add it to a meal, or log it as a new one.`
          : `You're ${Math.abs(gap.calories).toLocaleString()} kcal over today's plan. Pick a meal to ease back.`}
      </p>

      {macroBits.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <span className="font-body text-[11px] font-extrabold uppercase tracking-wider" style={{ color: T.textFaint }}>
            {short ? 'Need' : 'Over'}
          </span>
          {macroBits.map(b => (
            <span key={b.label} className="font-body text-[13px] font-bold tabular-nums" style={{ color: b.color }}>
              {b.v > 0 ? '+' : ''}{b.v}g
              <span className="font-body text-[10px] font-medium ml-1" style={{ color: T.textLow }}>{b.label}</span>
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2.5">
        {meals.map(({ m, i }) => {
          const cur = Math.round(sumFoods(m.foods).calories);
          const nextCals = Math.max(0, Math.round(cur + gap.calories));
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPick(i)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl"
              style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}
            >
              <div className="text-left min-w-0">
                <p className="font-body text-[14px] font-bold leading-tight" style={{ color: T.text }}>{m.label}</p>
                <p className="font-body text-[12px] tabular-nums mt-0.5" style={{ color: T.textMid }}>
                  {cur} <span style={{ color: T.textFaint }}>→</span> <span className="font-bold" style={{ color: accent }}>{nextCals}</span> kcal
                </p>
              </div>
              <span
                className="flex items-center gap-1 px-3 py-1.5 rounded-full font-body text-[11px] font-extrabold uppercase tracking-wider shrink-0"
                style={{ background: `${accent}1F`, color: accent }}
              >
                {short ? 'Add' : 'Trim'}
                <ChevronRight size={13} strokeWidth={2.5} />
              </span>
            </motion.button>
          );
        })}

        {short && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onAddNew}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl"
            style={{ border: `1px dashed ${T.hairlineStrong}` }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}>
              <Plus size={16} strokeWidth={2.5} style={{ color: T.gold }} />
            </div>
            <div className="text-left min-w-0">
              <p className="font-body text-[14px] font-bold leading-tight" style={{ color: T.text }}>Log as a new meal</p>
              <p className="font-body text-[12px] mt-0.5" style={{ color: T.textMid }}>
                Add {Math.abs(gap.calories).toLocaleString()} kcal as a separate entry
              </p>
            </div>
          </motion.button>
        )}
      </div>
    </BottomSheet>
  );
}

// Prototype cycle order — shows every scenario regardless of the day.
const SCENARIOS = ['thought', 'checkin', 'bloodwork', 'surplus'];
const CYCLE_MS = 30000;   // next scenario appears after 30s
const DOCK_MS = 6000;     // slide away ~6s after a confirmation

// Demo gap so the surplus state is always presentable in the proto.
const DEMO_GAP = { calories: 320, protein: 24, carbs: 22, fat: 6 };

export default function FloatingCoach({ onNavigate, hidden = false }) {
  const { submitMuskaan, logBloodwork, meals, redistributeToMeal, addMeal } = useApp();
  const frameRef = useRef(null);

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const mode = SCENARIOS[scenarioIdx % SCENARIOS.length];

  const [docked, setDocked] = useState(false);
  const [bubbleShown, setBubbleShown] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [muskaanOpen, setMuskaanOpen] = useState(false);
  const [bloodOpen, setBloodOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);
  const anyOpen = quoteOpen || muskaanOpen || bloodOpen || mealOpen;

  const [commit, setCommit] = useLocalStorage('tbs-commit', { date: null });
  const todayKey = new Date().toDateString();
  const committed = commit.date === todayKey;

  const quote = useMemo(() => {
    const now = new Date();
    const doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86_400_000);
    return COACH_QUOTES[doy % COACH_QUOTES.length];
  }, []);

  // Off-plan gap — real if something's logged off-target, else a demo deficit.
  const { gap, pickMeals } = useMemo(() => {
    const projected = meals.reduce((acc, m) => {
      const s = sumFoods(m.foods);
      return {
        calories: acc.calories + s.calories,
        protein: acc.protein + s.protein,
        carbs: acc.carbs + s.carbs,
        fat: acc.fat + s.fat,
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    const real = {
      calories: Math.round(PLAN_TOTALS.calories - projected.calories),
      protein: Math.round(PLAN_TOTALS.protein - projected.protein),
      carbs: Math.round(PLAN_TOTALS.carbs - projected.carbs),
      fat: Math.round(PLAN_TOTALS.fat - projected.fat),
    };
    const g = Math.abs(real.calories) >= 25 ? real : DEMO_GAP;
    const upcoming = meals.map((m, i) => ({ m, i })).filter(({ m }) => !m.logged);
    return { gap: g, pickMeals: upcoming.length ? upcoming : meals.map((m, i) => ({ m, i })) };
  }, [meals]);

  const dockTimer = useRef();

  // First reveal.
  useEffect(() => {
    const t = setTimeout(() => setBubbleShown(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Advance to the next scenario every 30s (prototype demo cadence).
  useEffect(() => {
    const t = setTimeout(() => {
      setQuoteOpen(false); setMuskaanOpen(false); setBloodOpen(false); setMealOpen(false);
      setScenarioIdx(i => i + 1);
      setDocked(false);
    }, CYCLE_MS);
    return () => clearTimeout(t);
  }, [scenarioIdx]);

  useEffect(() => () => clearTimeout(dockTimer.current), []);

  const scheduleDock = useCallback(() => {
    clearTimeout(dockTimer.current);
    dockTimer.current = setTimeout(() => setDocked(true), DOCK_MS);
  }, []);

  // Teaser bubble copy per scenario.
  const teaser = useMemo(() => {
    if (mode === 'thought') return coachTeaser('thought', { thoughtShort: quote.short });
    if (mode === 'checkin') return { kicker: 'Checking in', text: "How's your week going? Quick pulse." };
    if (mode === 'bloodwork') return { kicker: 'Health report', text: 'Got recent bloodwork? Send it over.' };
    // surplus
    return {
      kicker: gap.calories > 0 ? 'Behind target' : 'Over plan',
      text: gap.calories > 0
        ? `You're ${Math.abs(gap.calories).toLocaleString()} kcal short today.`
        : `You're ${Math.abs(gap.calories).toLocaleString()} kcal over today.`,
    };
  }, [mode, quote.short, gap.calories]);

  const openCoach = useCallback(() => {
    if (docked) { setDocked(false); return; } // swipe/tap recalls it
    if (mode === 'thought') { setQuoteOpen(true); track('coach_open', { mode: 'thought' }); }
    else if (mode === 'checkin') { setMuskaanOpen(true); track('coach_open', { mode: 'checkin' }); }
    else if (mode === 'bloodwork') { setBloodOpen(true); track('coach_open', { mode: 'bloodwork' }); }
    else { setMealOpen(true); track('coach_open', { mode: 'surplus' }); }
  }, [docked, mode]);

  const handleCommit = useCallback(() => {
    setCommit({ date: todayKey });
    track('coach_quote_committed');
    setTimeout(() => setQuoteOpen(false), 900);
    scheduleDock();
  }, [setCommit, todayKey, scheduleDock]);

  const handlePickMeal = useCallback((i) => {
    redistributeToMeal(i);
    track('coach_surplus_fixed', { meal: i });
    setMealOpen(false);
    scheduleDock();
  }, [redistributeToMeal, scheduleDock]);

  const handleAddNew = useCallback(() => {
    addMeal({
      id: `meal-topup-${Date.now()}`,
      time: '',
      label: 'Coach top-up',
      foods: [{
        name: 'Top-up to hit plan',
        portion: 'custom',
        protein: Math.max(0, gap.protein),
        carbs: Math.max(0, gap.carbs),
        fat: Math.max(0, gap.fat),
        calories: Math.max(0, gap.calories),
      }],
      logged: true,
    });
    setMealOpen(false);
    scheduleDock();
  }, [addMeal, gap, scheduleDock]);

  if (hidden) return null;

  const badge = mode === 'checkin'
    ? <Activity size={10} strokeWidth={2.5} style={{ color: T.goldInk }} />
    : mode === 'bloodwork'
      ? <FileText size={10} strokeWidth={2.5} style={{ color: T.goldInk }} />
      : mode === 'surplus'
        ? <Flame size={10} strokeWidth={2.5} style={{ color: T.goldInk }} />
        : <Sparkles size={10} strokeWidth={2.5} style={{ color: T.goldInk }} />;

  return (
    <>
      {/* Frame — keeps the chat head inside the 430px app column on every screen */}
      <div
        ref={frameRef}
        className="fixed inset-0 z-40 mx-auto pointer-events-none"
        style={{ maxWidth: 430 }}
      >
        {/* Chat head — draggable anywhere in the frame; swipe right to dock */}
        <motion.div
          className="absolute flex items-end gap-2 pointer-events-auto"
          style={{ bottom: 90, right: 20, touchAction: 'none' }}
          drag
          dragConstraints={frameRef}
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            if (info.offset.x > 48) setDocked(true);
            else if (info.offset.x < -48) setDocked(false);
          }}
          animate={{ x: docked ? 66 : 0, opacity: docked ? 0.55 : 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        >
          {/* Bubble — what the coach is surfacing */}
          <AnimatePresence>
            {bubbleShown && !anyOpen && !docked && (
              <motion.button
                key={`bubble-${mode}`}
                onClick={openCoach}
                initial={{ opacity: 0, x: 12, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 12, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className="relative mb-1 max-w-[200px] text-left rounded-2xl rounded-br-md px-3.5 py-2.5"
                style={{ background: T.surface, border: `1px solid ${T.hairlineStrong}`, boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }}
              >
                <p className="font-body text-[9px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: T.gold }}>
                  {mode === 'thought' && committed ? 'Locked in' : teaser.kicker}
                </p>
                <p className="font-body text-[12px] font-semibold leading-snug" style={{ color: T.text }}>
                  {mode === 'thought' && committed ? "That's the standard. Keep it." : teaser.text}
                </p>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Avatar */}
          <motion.button
            whileTap={T.tapSmall}
            onClick={openCoach}
            aria-label="Coach Biki"
            className="relative shrink-0"
          >
            <AvatarMark size={56} pulse={!docked} status badge={badge} />
          </motion.button>
        </motion.div>
      </div>

      {/* Surfaces — one at a time */}
      <AnimatePresence>
        {quoteOpen && (
          <CoachQuoteModal
            quote={quote}
            committed={committed}
            onCommit={handleCommit}
            onClose={() => setQuoteOpen(false)}
            onMessage={() => { setQuoteOpen(false); onNavigate && onNavigate('coach'); }}
          />
        )}
      </AnimatePresence>

      <MuskaanCheckIn
        isOpen={muskaanOpen}
        onClose={() => setMuskaanOpen(false)}
        onSubmit={(r) => { submitMuskaan(r); track('muskaan_submit', r); scheduleDock(); }}
        variant={new Date().getDay() === 0 ? 'close' : 'mid'}
      />

      {/* Bloodwork push — routes to Reviews where the upload card lives */}
      <BottomSheet isOpen={bloodOpen} onClose={() => setBloodOpen(false)}>
        <div className="flex items-center gap-3 mb-4">
          <AvatarMark size={42} ring />
          <div className="min-w-0">
            <p className="font-body text-[10px] font-extrabold uppercase tracking-wider" style={{ color: T.gold }}>Health report</p>
            <h2 className="display-sm text-[#F4F2EC] uppercase leading-none mt-0.5">Got bloodwork?</h2>
          </div>
        </div>
        <p className="font-body text-[14px] leading-relaxed mb-5" style={{ color: T.text }}>
          Send me your latest blood panel or any health report. I'll use it to fine-tune your plan and flag anything worth watching.
        </p>
        <motion.button
          whileTap={T.tap}
          onClick={() => { logBloodwork(); setBloodOpen(false); scheduleDock(); onNavigate && onNavigate('progress'); }}
          className="btn-primary"
        >
          <Upload size={15} strokeWidth={2} /> Upload report
        </motion.button>
      </BottomSheet>

      {/* Off-plan macros — adjust where the surplus / deficit lands */}
      <MealAdjustSheet
        isOpen={mealOpen}
        onClose={() => setMealOpen(false)}
        gap={gap}
        meals={pickMeals}
        onPick={handlePickMeal}
        onAddNew={handleAddNew}
      />
    </>
  );
}
