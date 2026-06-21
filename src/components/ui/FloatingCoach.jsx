// ── FloatingCoach — the one coach presence, on every screen except chat ──
// Messenger-style chat head, anchored bottom-right inside the app frame (so it
// never drifts off-screen on desktop). It carries a queue of actions that need
// attention and shows ONE at a time:
//   1. thought   — quote of the day (commit)
//   2. checkin   — Biki checking in (mood / energy pulse)
//   3. bloodwork — asks for a health report, routes to Reviews to upload
//   4. surplus   — only when the day is off-plan; tap opens a meal-adjust sheet
// The message does NOT change on a timer. It stays put until you complete the
// current action; the next one only appears ~30s after that. A numeric badge
// shows how many actions are still waiting (like an unread count).

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, X, Quote, Check, ChevronRight, Upload, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { track } from '../../lib/analytics';
import { T } from '../../tokens';
import { COACH_QUOTES, PHOTOS, PLAN_TOTALS } from '../../data/mockData';
import { BottomSheet } from './Components';
import AvatarMark from './AvatarMark';
import MuskaanCheckIn from './MuskaanCheckIn';

const HIDE_AFTER_MS = 5000;   // avatar hides itself 5s after an action is done
const NEXT_DELAY_MS = 30000;  // next action surfaces 30s after the current is done

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

export default function FloatingCoach({ onNavigate, hidden = false }) {
  const { submitMuskaan, logBloodwork, meals, redistributeToMeal, addMeal } = useApp();
  const frameRef = useRef(null);
  const hideTimer = useRef();
  const nextTimer = useRef();

  // Actions the user has already cleared this session (so they don't re-surface).
  const [completed, setCompleted] = useState(() => new Set());
  const [bubbleShown, setBubbleShown] = useState(false);
  // Whole avatar visible? It hides 5s after an action, reappears with the next.
  const [coachVisible, setCoachVisible] = useState(true);
  // True from completing an action until the next one is due (~30s).
  const [cooldown, setCooldown] = useState(false);

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

  // Off-plan gap — only counts as an action when something's been logged and
  // there's a meal left to absorb the difference.
  const { gap, offPlan, pickMeals } = useMemo(() => {
    const projected = meals.reduce((acc, m) => {
      const s = sumFoods(m.foods);
      return {
        calories: acc.calories + s.calories,
        protein: acc.protein + s.protein,
        carbs: acc.carbs + s.carbs,
        fat: acc.fat + s.fat,
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    const g = {
      calories: Math.round(PLAN_TOTALS.calories - projected.calories),
      protein: Math.round(PLAN_TOTALS.protein - projected.protein),
      carbs: Math.round(PLAN_TOTALS.carbs - projected.carbs),
      fat: Math.round(PLAN_TOTALS.fat - projected.fat),
    };
    const loggedCount = meals.filter(m => m.logged).length;
    const upcoming = meals.map((m, i) => ({ m, i })).filter(({ m }) => !m.logged);
    const isOff = loggedCount > 0 && upcoming.length > 0 && Math.abs(g.calories) >= 25;
    return { gap: g, offPlan: isOff, pickMeals: upcoming.length ? upcoming : meals.map((m, i) => ({ m, i })) };
  }, [meals]);

  // The queue of actions needing attention, in priority order:
  // quote of the day → bloodwork → check-in → (off-plan surplus, when relevant).
  // A quote already committed today is treated as done so it never blocks.
  const queue = useMemo(() => {
    const all = ['thought', 'bloodwork', 'checkin', ...(offPlan ? ['surplus'] : [])];
    return all.filter(k => !completed.has(k) && !(k === 'thought' && committed));
  }, [offPlan, completed, committed]);

  const current = queue[0] || null;
  const count = queue.length;

  // First reveal.
  useEffect(() => {
    const t = setTimeout(() => setBubbleShown(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => () => { clearTimeout(hideTimer.current); clearTimeout(nextTimer.current); }, []);

  // Mark the current action done. The avatar lingers 5s, hides itself, then the
  // next action surfaces ~30s after completion.
  const completeAction = useCallback((key) => {
    setCompleted(prev => new Set(prev).add(key));
    setCooldown(true);
    clearTimeout(hideTimer.current);
    clearTimeout(nextTimer.current);
    hideTimer.current = setTimeout(() => setCoachVisible(false), HIDE_AFTER_MS);
    nextTimer.current = setTimeout(() => { setCoachVisible(true); setCooldown(false); }, NEXT_DELAY_MS);
  }, []);

  const teaser = useMemo(() => {
    if (current === 'thought') {
      return committed
        ? { kicker: 'Locked in', text: "That's the standard. Keep it." }
        : { kicker: 'Biki says', text: quote.short };
    }
    if (current === 'checkin') return { kicker: 'Checking in', text: "How's your week going? Quick pulse." };
    if (current === 'bloodwork') return { kicker: 'Health report', text: 'Got recent bloodwork? Send it over.' };
    if (current === 'surplus') {
      return {
        kicker: gap.calories > 0 ? 'Behind target' : 'Over plan',
        text: gap.calories > 0
          ? `You're ${Math.abs(gap.calories).toLocaleString()} kcal short today.`
          : `You're ${Math.abs(gap.calories).toLocaleString()} kcal over today.`,
      };
    }
    return null;
  }, [current, committed, quote.short, gap.calories]);

  const openCoach = useCallback(() => {
    if (!current) { onNavigate && onNavigate('coach'); return; }
    if (current === 'thought') { setQuoteOpen(true); track('coach_open', { mode: 'thought' }); }
    else if (current === 'checkin') { setMuskaanOpen(true); track('coach_open', { mode: 'checkin' }); }
    else if (current === 'bloodwork') { setBloodOpen(true); track('coach_open', { mode: 'bloodwork' }); }
    else { setMealOpen(true); track('coach_open', { mode: 'surplus' }); }
  }, [current, onNavigate]);

  const handleCommit = useCallback(() => {
    setCommit({ date: todayKey });
    track('coach_quote_committed');
    setTimeout(() => setQuoteOpen(false), 900);
    completeAction('thought');
  }, [setCommit, todayKey, completeAction]);

  const handlePickMeal = useCallback((i) => {
    redistributeToMeal(i);
    track('coach_surplus_fixed', { meal: i });
    setMealOpen(false);
    completeAction('surplus');
  }, [redistributeToMeal, completeAction]);

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
    completeAction('surplus');
  }, [addMeal, gap, completeAction]);

  if (hidden) return null;

  // Numeric "unread"-style badge — how many actions still need attention.
  const badge = count > 0
    ? <span className="font-body text-[10px] font-extrabold leading-none tabular-nums" style={{ color: T.goldInk }}>{count}</span>
    : null;

  // The avatar only exists on screen when there's a live action to show.
  const showAvatar = !!current && coachVisible;
  const showBubble = showAvatar && bubbleShown && !cooldown && !anyOpen;

  return (
    <>
      {/* Frame — keeps the chat head inside the 430px app column on every screen */}
      <div
        ref={frameRef}
        className="fixed inset-0 z-40 mx-auto pointer-events-none"
        style={{ maxWidth: 430 }}
      >
        {/* Chat head — anchored bottom-right; draggable but snaps back so it
            never gets stranded mid-screen. Hidden between actions. */}
        <AnimatePresence>
        {showAvatar && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="absolute flex items-end gap-2 pointer-events-auto"
          style={{ bottom: 90, right: 20, touchAction: 'none' }}
          drag
          dragConstraints={frameRef}
          dragElastic={0.15}
          dragMomentum={false}
          dragSnapToOrigin
        >
          {/* Bubble — the current action; stays until it's completed */}
          <AnimatePresence>
            {showBubble && (
              <motion.button
                key={`bubble-${current}`}
                onClick={openCoach}
                initial={{ opacity: 0, x: 12, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 12, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className="relative mb-1 max-w-[200px] text-left rounded-2xl rounded-br-md px-3.5 py-2.5"
                style={{ background: T.surface, border: `1px solid ${T.hairlineStrong}`, boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }}
              >
                <p className="font-body text-[9px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: T.gold }}>
                  {teaser?.kicker}
                </p>
                <p className="font-body text-[12px] font-semibold leading-snug" style={{ color: T.text }}>
                  {teaser?.text}
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
            <AvatarMark size={56} pulse={!cooldown} status badge={badge} />
          </motion.button>
        </motion.div>
        )}
        </AnimatePresence>
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
        onSubmit={(r) => { submitMuskaan(r); track('muskaan_submit', r); completeAction('checkin'); }}
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
          onClick={() => { logBloodwork(); setBloodOpen(false); completeAction('bloodwork'); onNavigate && onNavigate('progress'); }}
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
