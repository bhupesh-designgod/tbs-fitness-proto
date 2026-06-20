// ── Home — "Scoreboard" ──
// Greeting, week strip, coach quote, macro + hydration summary,
// task queue, workout card, sleep note.

import { useMemo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Utensils, Droplets, Dumbbell, Clock, ChevronRight, ChevronLeft,
  Bell, MoonStar, Moon, Check, CalendarDays, Sparkles, X, Quote,
} from 'lucide-react';

import { WeekStrip, MonthSheet } from '../components/ui/Calendar';
import PlanNudge from '../components/ui/PlanNudge';
import { useApp } from '../context/AppContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import CoachTip from '../onboarding/CoachTip';
import { track } from '../lib/analytics';
import { T, enter } from '../tokens';
import {
  USER_PROFILE, PHOTOS, DAILY_TARGETS,
  PLAN_PROGRESS, COACH_QUOTES,
} from '../data/mockData';

// ── Greeting by time of day ──
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Coach daily notes — written like a DM from Biki, not a poster ──
// {name} is swapped for the athlete's first name at render time.


// ── Points system ──
function calcDailyScore(meals, hydration, targets) {
  let pts = 0;
  meals.forEach(m => { if (m.logged) pts += 5; });
  if (hydration >= targets.water * 0.5) pts += 5;
  if (hydration >= targets.water) pts += 5;
  return { earned: pts, total: 30 };
}

// ── Status ring for plan cards ──
function StatusRing({ percentage, size = 60, strokeWidth = 6, color, children }) {
  const shouldReduce = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}
        />
        {percentage > 0 && (
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="butt"
            strokeDasharray={circumference}
            initial={shouldReduce ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.25 }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// ── Macro + Hydration summary — tri-segment ring ──
function MacroHydrationSummary({ onNavigate }) {
  const { meals, hydration, logged } = useApp();
  const caloriesLogged = logged.calories;
  const proteinLogged = logged.protein;
  const carbsLogged = logged.carbs;
  const fatLogged = logged.fat;

  const calTarget = DAILY_TARGETS.calories;
  const proTarget = DAILY_TARGETS.protein;
  const carbTarget = DAILY_TARGETS.carbs;
  const fatTarget = DAILY_TARGETS.fat;
  const waterTarget = DAILY_TARGETS.water;

  // Calculate each macro's caloric contribution for proportional ring sizing
  const proCals = proTarget * 4;
  const carbCals = carbTarget * 4;
  const fatCals = fatTarget * 9;
  const totalMacroCals = proCals + carbCals + fatCals;

  // Each macro's fraction of the ring (proportional to calorie contribution)
  const carbFrac = carbCals / totalMacroCals;
  const proFrac = proCals / totalMacroCals;
  const fatFrac = fatCals / totalMacroCals;

  // Fill percentages per macro
  const proPct = Math.min(proteinLogged / proTarget, 1);
  const carbPct = Math.min(carbsLogged / carbTarget, 1);
  const fatPct = Math.min(fatLogged / fatTarget, 1);
  const hydPct = Math.min(Math.round((hydration / waterTarget) * 100), 100);

  const shouldReduce = useReducedMotion();

  // Ring geometry
  const ringSize = 150;
  const ringStroke = 10;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;

  // Gap between segments (in circumference units)
  const gapSize = ringCircumference * 0.02;
  const usableCircumference = ringCircumference - (gapSize * 3);

  // Segment arc lengths (proportional to calorie contribution)
  const carbArc = usableCircumference * carbFrac;
  const proArc = usableCircumference * proFrac;
  const fatArc = usableCircumference * fatFrac;

  // Segment start offsets (cumulative, with gaps)
  // Order: Carbs (top) → Protein (right) → Fats (bottom-left)
  const carbStart = 0;
  const proStart = carbArc + gapSize;
  const fatStart = proStart + proArc + gapSize;

  const segments = [
    { key: 'carbs',   arc: carbArc,  offset: carbStart, fill: carbPct,  color: T.macroCarbs },
    { key: 'protein', arc: proArc,   offset: proStart,  fill: proPct,   color: T.macroProtein },
    { key: 'fats',    arc: fatArc,   offset: fatStart,  fill: fatPct,   color: T.macroFat },
  ];

  return (
    <motion.div
      className="card mx-5 mb-3 p-5"
      {...enter(0.12)}
    >
      <div className="flex items-stretch gap-3.5">
        {/* Tri-segment calorie ring */}
        <div className="relative shrink-0" style={{ width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} className="absolute inset-0 -rotate-90">
            {segments.map((seg) => (
              <g key={seg.key}>
                {/* Track (dim) */}
                <circle
                  cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                  fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={ringStroke}
                  strokeLinecap="round"
                  strokeDasharray={`${seg.arc} ${ringCircumference - seg.arc}`}
                  strokeDashoffset={-seg.offset}
                />
                {/* Fill */}
                {seg.fill > 0 && (
                  <motion.circle
                    cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                    fill="none" stroke={seg.color} strokeWidth={ringStroke}
                    strokeLinecap="round"
                    strokeDasharray={`${seg.arc * seg.fill} ${ringCircumference - seg.arc * seg.fill}`}
                    strokeDashoffset={-seg.offset}
                    initial={shouldReduce ? {} : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-body text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2"
              style={{ background: T.surface2, border: `1px solid ${T.hairline}`, color: T.textMid }}
            >
              Day {PLAN_PROGRESS.currentDay}
            </span>
            <span className="font-display text-[36px] text-[#F4F2EC] leading-none">
              {Math.round(caloriesLogged)}
            </span>
            <span className="font-body text-[10px] font-medium mt-1" style={{ color: T.textLow }}>
              {calTarget} kcal
            </span>
          </div>
        </div>

        {/* Macro legend — right side */}
        <div className="flex-1 flex flex-col justify-center gap-5">
          {/* Carbs */}
          <div className="flex items-center gap-3">
            <div className="flex gap-[2px]">
              {[0,1,2].map(i => (
                <div key={i} className="w-[3px] h-[14px] rounded-full" style={{ background: i < Math.ceil(carbPct * 3) ? T.macroCarbs : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
            <div>
              <p className="font-display text-[22px] text-[#F4F2EC] leading-none">
                <span>{Math.round(carbsLogged)}</span>
                <span style={{ color: T.textFaint }}>/{carbTarget}g</span>
              </p>
              <p className="font-body text-[11px] font-bold uppercase tracking-wider mt-0.5" style={{ color: T.macroCarbs }}>Carbs</p>
            </div>
          </div>

          {/* Protein */}
          <div className="flex items-center gap-3">
            <div className="flex gap-[2px]">
              {[0,1,2].map(i => (
                <div key={i} className="w-[3px] h-[14px] rounded-full" style={{ background: i < Math.ceil(proPct * 3) ? T.macroProtein : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
            <div>
              <p className="font-display text-[22px] text-[#F4F2EC] leading-none">
                <span>{Math.round(proteinLogged)}</span>
                <span style={{ color: T.textFaint }}>/{proTarget}g</span>
              </p>
              <p className="font-body text-[11px] font-bold uppercase tracking-wider mt-0.5" style={{ color: T.macroProtein }}>Proteins</p>
            </div>
          </div>

          {/* Fats */}
          <div className="flex items-center gap-3">
            <div className="flex gap-[2px]">
              {[0,1,2].map(i => (
                <div key={i} className="w-[3px] h-[14px] rounded-full" style={{ background: i < Math.ceil(fatPct * 3) ? T.macroFat : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
            <div>
              <p className="font-display text-[22px] text-[#F4F2EC] leading-none">
                <span>{Math.round(fatLogged)}</span>
                <span style={{ color: T.textFaint }}>/{fatTarget}g</span>
              </p>
              <p className="font-body text-[11px] font-bold uppercase tracking-wider mt-0.5" style={{ color: T.macroFat }}>Fats</p>
            </div>
          </div>
        </div>

        {/* Hydration — vertical bar on the right */}
        <div className="flex flex-col items-center shrink-0" style={{ width: 34 }}>
          <Droplets size={13} strokeWidth={T.stroke} style={{ color: T.water }} />
          <div className="relative flex-1 w-[7px] rounded-full overflow-hidden my-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="absolute bottom-0 left-0 right-0 rounded-full"
              style={{ background: T.water }}
              initial={shouldReduce ? { height: `${hydPct}%` } : { height: 0 }}
              animate={{ height: `${hydPct}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 16, delay: 0.3 }}
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="font-body text-[12px] font-bold tabular-nums leading-none" style={{ color: T.water }}>
              {(hydration / 1000).toFixed(1)}
            </span>
            <span className="font-body text-[8px] font-semibold tabular-nums leading-none mt-0.5" style={{ color: T.textLow }}>
              /{(waterTarget / 1000).toFixed(1)}L
            </span>
          </div>
        </div>
      </div>

      {/* View diet plan CTA */}
      <motion.button
        whileTap={T.tap}
        onClick={() => onNavigate && onNavigate('nutrition')}
        className="btn-primary mt-4 btn-shine-wrap"
      >
        <Utensils size={15} strokeWidth={2} />
        View diet plan
      </motion.button>
    </motion.div>
  );
}

// ── Profile avatar — photo with initial fallback ──
function Avatar({ onClick }) {
  const [err, setErr] = useState(false);
  return (
    <motion.button
      whileTap={T.tapSmall}
      onClick={onClick}
      aria-label="Profile"
      className="relative w-11 h-11 rounded-full overflow-hidden flex items-center justify-center font-display text-[18px]"
      style={{ background: T.surface, border: `2px solid ${T.hairlineStrong}`, color: T.text }}
    >
      {(err || !PHOTOS.userAvatar)
        ? USER_PROFILE.name.charAt(0)
        : (
          <img
            src={PHOTOS.userAvatar}
            alt={USER_PROFILE.name}
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(15%) contrast(1.05)' }}
            onError={() => setErr(true)}
          />
        )}
    </motion.button>
  );
}

// ── Split → friendly name ──
const SPLIT_NAME = { push: 'Push Day', pull: 'Pull Day', legs: 'Legs Day', rest: 'Rest Day' };

// ── Selected-day recap (past or future) ──
// Replaces the live sections when the user taps a non-today date in the week strip.
function DayRecap({ day, onBack }) {
  const isFuture = day.isFuture;
  const isRest = day.split === 'rest';
  const splitName = SPLIT_NAME[day.split] || 'Training';
  const scorePts = day.pts ?? 0;
  const mealPct = day.mealPct ?? 0;
  const hydPct = day.hydPct ?? 0;

  return (
    <motion.div
      className="px-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: T.easeOut }}
    >
      <button onClick={onBack} className="btn-ghost !py-0 mb-4" style={{ color: T.textMid }}>
        <ChevronLeft size={14} strokeWidth={T.stroke} /> Back to today
      </button>

      {isFuture ? (
        // ── Future day — what's scheduled ──
        <>
          <p className="kicker mb-1">Scheduled · {day.label} {day.date}</p>
          <h2 className="display-lg text-[#F4F2EC] uppercase leading-none mb-1.5">
            {isRest ? 'Rest Day' : splitName}
          </h2>
          <p className="font-body text-[13px] font-medium mb-5" style={{ color: T.textLow }}>
            {isRest
              ? 'Recovery and mobility. Earn the next one.'
              : "On the board. Nothing to log until the day arrives."}
          </p>

          <div className="card p-4 flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}
            >
              {isRest
                ? <Moon size={20} strokeWidth={T.stroke} style={{ color: T.textMid }} />
                : <Dumbbell size={20} strokeWidth={T.stroke} style={{ color: T.gold }} />}
            </div>
            <div className="min-w-0">
              <p className="kicker mb-0.5">Training</p>
              <p className="display-xs text-[#F4F2EC]">{isRest ? 'Rest & recover' : splitName}</p>
            </div>
          </div>
        </>
      ) : (
        // ── Past day — what got done ──
        <>
          <p className="kicker mb-1">Recap · {day.label} {day.date}</p>
          <div className="flex items-end gap-3 -mb-1">
            <span className="display-xl text-[#F4F2EC] tabular-nums">{scorePts}</span>
            <div className="flex items-baseline gap-1 pb-2.5">
              <span className="display-sm" style={{ color: T.textFaint }}>/30</span>
              <span className="display-xs" style={{ color: T.textFaint }}>PTS</span>
            </div>
          </div>
          <p className="font-body text-[13px] font-medium mt-1 mb-5" style={{ color: T.textLow }}>
            {scorePts >= 25 ? 'Strong day. That’s the standard.'
              : scorePts >= 15 ? 'Solid effort on the board.'
                : 'Logged, with room to build on.'}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="card flex flex-col items-center gap-2.5 py-5 px-4">
              <StatusRing percentage={mealPct} color={T.cal} size={60} strokeWidth={6}>
                <Utensils size={20} strokeWidth={T.stroke} style={{ color: T.textMid }} />
              </StatusRing>
              <span className="font-body text-[12px] font-bold uppercase tracking-wider" style={{ color: T.textMid }}>Nutrition</span>
              <span className="display-xs text-[#F4F2EC]">{mealPct}%</span>
            </div>
            <div className="card flex flex-col items-center gap-2.5 py-5 px-4">
              <StatusRing percentage={hydPct} color={T.water} size={60} strokeWidth={6}>
                <Droplets size={20} strokeWidth={T.stroke} style={{ color: T.textMid }} />
              </StatusRing>
              <span className="font-body text-[12px] font-bold uppercase tracking-wider" style={{ color: T.textMid }}>Hydration</span>
              <span className="display-xs text-[#F4F2EC]">{hydPct}%</span>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}
            >
              {isRest
                ? <Moon size={20} strokeWidth={T.stroke} style={{ color: T.textMid }} />
                : <Dumbbell size={20} strokeWidth={T.stroke} style={{ color: day.trained ? T.gold : T.textMid }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="kicker mb-0.5">Training</p>
              <p className="display-xs text-[#F4F2EC]">{isRest ? 'Rest Day' : splitName}</p>
            </div>
            <span
              className="font-body text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md"
              style={!isRest && day.trained
                ? { color: T.gold, border: `1px solid ${T.goldBorder}` }
                : { color: T.textLow, border: `1px solid ${T.hairlineStrong}` }}
            >
              {isRest ? 'Recovery' : day.trained ? 'Trained' : 'Missed'}
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
}

// ── Coach daily-quote modal ──
// Coach portrait in the background, the day's line up top, a commitment below.
function CoachQuoteModal({ quote, committed, onCommit, onClose, onMessage }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
        {/* Coach image background */}
        <img
          src={PHOTOS.bikiPortrait}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(30%) contrast(1.05) brightness(0.5)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(11,11,12,0.97) 6%, rgba(11,11,12,0.72) 46%, rgba(11,11,12,0.30) 100%)' }}
        />

        {/* Close */}
        <motion.button
          whileTap={T.tapSmall}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${T.hairlineStrong}` }}
        >
          <X size={16} strokeWidth={2} style={{ color: T.text }} />
        </motion.button>

        {/* Content */}
        <div className="relative pt-32 px-6 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Quote size={16} strokeWidth={2} style={{ color: T.gold }} />
            <p className="font-body text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: T.gold }}>
              Today's mindset
            </p>
          </div>

          <p className="font-body text-[20px] font-semibold leading-[1.4] text-[#F4F2EC] mb-5">
            {quote.text}
          </p>

          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0" style={{ border: `1.5px solid ${T.gold}` }}>
              <img src={PHOTOS.bikiPortrait} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="leading-tight">
              <p className="font-body text-[12px] font-bold" style={{ color: T.text }}>Biki Singh</p>
              <p className="font-body text-[10px] font-medium uppercase tracking-wider" style={{ color: T.textLow }}>
                IFBB Pro · Head Coach
              </p>
            </div>
          </div>

          {committed ? (
            <div
              className="btn-primary"
              style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.gold }}
            >
              <Check size={16} strokeWidth={2.5} /> Committed for today
            </div>
          ) : (
            <motion.button whileTap={T.tap} onClick={onCommit} className="btn-primary btn-shine-wrap">
              <Sparkles size={15} strokeWidth={2} /> I'm committed
            </motion.button>
          )}

          <button
            onClick={onMessage}
            className="btn-ghost mt-3.5 mx-auto"
            style={{ color: T.textMid }}
          >
            Message Biki <ChevronRight size={13} strokeWidth={T.stroke} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home({ onProfileClick, onNavigate, onNotifications }) {
  const { training, meals, hydration, isRestDay } = useApp();
  const [selectedDay, setSelectedDay] = useState(null);
  const viewingDay = selectedDay && !selectedDay.isToday;

  const today = new Date();
  const [monthOpen, setMonthOpen] = useState(false);

  // ── Daily coach quote (deterministic per calendar day) ──
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [bubbleShown, setBubbleShown] = useState(false);
  const [commit, setCommit] = useLocalStorage('tbs-commit', { date: null });
  const todayKey = today.toDateString();
  const committed = commit.date === todayKey;
  const quote = useMemo(() => {
    const start = new Date(today.getFullYear(), 0, 0);
    const doy = Math.floor((today - start) / 86_400_000);
    return COACH_QUOTES[doy % COACH_QUOTES.length];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bubble drifts in shortly after the screen settles.
  useEffect(() => {
    const t = setTimeout(() => setBubbleShown(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const handleCommit = useCallback(() => {
    setCommit({ date: todayKey });
    track('coach_quote_committed');
  }, [setCommit, todayKey]);

  const score = useMemo(
    () => calcDailyScore(meals, hydration, DAILY_TARGETS),
    [meals, hydration],
  );

  // ── First-visit contextual coach tour (points + tasks) ──
  const [tour, setTour] = useLocalStorage('tbs-tour', { home: false, nutrition: false });
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    if (tour.home) return undefined;
    const t = setTimeout(() => setTourStep(s => (s === 0 ? 1 : s)), 700);
    return () => clearTimeout(t);
  }, [tour.home]);

  const endHomeTour = useCallback((skipped) => {
    track(skipped ? 'coach_tour_skipped' : 'coach_tour_completed', { area: 'home', step: tourStep });
    setTour(prev => ({ ...prev, home: true }));
    setTourStep(0);
  }, [tourStep, setTour]);

  const HOME_TOUR = {
    1: { target: '[data-tour="score"]', msg: 'This is your daily score. Hit your targets and it climbs to 30.', cta: 'Next', go: () => setTourStep(2) },
    2: { target: '[data-tour="up-next"]', msg: 'Knock these out to stack points — five each, thirty a day.', cta: 'Got It', go: () => endHomeTour(false) },
  };
  const activeTip = tourStep > 0 ? HOME_TOUR[tourStep] : null;

  const exerciseCount = training.exercises?.length || 0;
  const muscleList = training.muscles?.join(' · ') || '';

  const greeting = getGreeting();


  return (
    <div className="min-h-screen bg-[#0B0B0C] pb-24">

      {/* ═══ 1. GREETING ═══ */}
      <motion.div
        className="flex items-center justify-between px-5 pt-5 pb-2"
        {...enter(0)}
      >
        <div className="flex items-center gap-3">
          <Avatar onClick={onProfileClick} />
          <div>
            <p className="font-body text-[13px] font-medium" style={{ color: T.textLow }}>
              {greeting},
            </p>
            <p className="display-md text-[#F4F2EC]" style={{ marginTop: '-1px' }}>
              {USER_PROFILE.name.toUpperCase()}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={T.tapSmall}
            onClick={onNotifications}
            aria-label="Notifications"
            className="relative w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: T.surface, border: `1px solid ${T.hairline}` }}
          >
            <Bell size={18} strokeWidth={T.stroke} style={{ color: T.textLow }} />
            <div
              className="absolute top-2 right-2.5 w-2 h-2 rounded-full"
              style={{ background: T.red }}
            />
          </motion.button>
          <motion.button
            whileTap={T.tapSmall}
            onClick={() => setMonthOpen(true)}
            aria-label="Month view"
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: T.surface, border: `1px solid ${T.hairline}` }}
          >
            <CalendarDays size={18} strokeWidth={T.stroke} style={{ color: T.textLow }} />
          </motion.button>
        </div>
      </motion.div>

      {/* ═══ 2. THIS WEEK STRIP ═══ */}
      <motion.div {...enter(0.04)} className="pt-3 mb-4">
        <WeekStrip
          mode="score"
          selectedIso={selectedDay?.iso}
          onSelectDay={(day) => setSelectedDay(day.isToday ? null : day)}
          todayScore={score.earned}
          todayTotal={score.total}
          planDay={PLAN_PROGRESS.currentDay}
          planTotalDays={PLAN_PROGRESS.totalDays}
        />
      </motion.div>

      {/* ═══ SELECTED-DAY RECAP — replaces live sections when a past/future day is tapped ═══ */}
      {viewingDay && (
        <DayRecap day={selectedDay} onBack={() => setSelectedDay(null)} />
      )}

      {!viewingDay && (
      <>

      {/* ═══ MEAL-ADJUSTMENT NUDGE — surfaces only when the day is off-plan; routes to Nutrition ═══ */}
      <PlanNudge mode="home" onNavigate={onNavigate} />

      {/* ═══ 4. MACRO + HYDRATION SUMMARY ═══ */}
      <MacroHydrationSummary onNavigate={onNavigate} />


      {/* ═══ 7. WORKOUT CARD ═══ */}
      <motion.div className="card mx-5 mb-3 overflow-hidden relative" {...enter(0.24)}>
        <div className="flex">
          <div className="flex-1 p-5">
            <p className="kicker mb-2">
              {isRestDay ? 'Recovery' : "Today's workout"}
            </p>
            <h2 className="display-lg text-[#F4F2EC] uppercase">
              {training.name}
            </h2>
            {!isRestDay && (
              <>
                <div className="flex items-center gap-3 mt-2.5 mb-2">
                  <span className="flex items-center gap-1.5 font-body text-[12px] font-medium" style={{ color: T.textLow }}>
                    <Dumbbell size={12} strokeWidth={T.stroke} /> {exerciseCount} exercises
                  </span>
                  <span style={{ color: T.textFaint }}>|</span>
                  <span className="flex items-center gap-1.5 font-body text-[12px] font-medium" style={{ color: T.textLow }}>
                    <Clock size={12} strokeWidth={T.stroke} /> 60 min
                  </span>
                </div>
                <p className="font-body text-[12px] font-medium" style={{ color: T.textFaint }}>{muscleList}</p>
              </>
            )}
            {isRestDay && (
              <p className="font-body text-[13px] font-medium mt-2" style={{ color: T.textLow }}>
                Recovery and mobility. Earn the next one.
              </p>
            )}

            <motion.button
              whileTap={T.tap}
              onClick={() => onNavigate && onNavigate('train')}
              className="btn-ghost mt-4"
            >
              View workout <ChevronRight size={13} strokeWidth={T.stroke} />
            </motion.button>
          </div>

          {!isRestDay && (
            <div className="w-[130px] relative">
              <img
                src={training.photo || PHOTOS.pushHero}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'grayscale(60%) contrast(1.1) brightness(0.7)' }}
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to right, ${T.surface} 0%, transparent 60%)` }}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══ 8. SLEEP NOTE — bare violet moon: the one off-palette accent ═══ */}
      <motion.div className="card mx-5 mb-4 p-4 pl-5" {...enter(0.28)}>
        <div className="flex items-start gap-3.5">
          <MoonStar
            size={28}
            strokeWidth={1.5}
            style={{ color: T.macroCarbs }}
            className="shrink-0 mt-1"
          />
          <div className="flex-1 min-w-0">
            <p className="kicker mb-1.5" style={{ color: T.macroCarbs, opacity: 0.85 }}>Wind down</p>
            <p className="display-sm text-[#F4F2EC] mb-1.5">
              7–8 HOURS TONIGHT
            </p>
            <p className="font-body text-[13px] font-medium leading-relaxed" style={{ color: T.textLow }}>
              Muscle is built while you sleep. Lights low, screens down.
            </p>
          </div>
        </div>
      </motion.div>
      </>
      )}

      {/* Month overlay */}

      {/* ═══ FLOATING COACH — daily-quote bubble + avatar ═══ */}
      <div className="fixed z-40 flex items-end gap-2" style={{ bottom: 90, right: 20 }}>
        {/* Speech bubble — Biki "says" the day's line */}
        <AnimatePresence>
          {bubbleShown && !quoteOpen && (
            <motion.button
              key="bubble"
              onClick={() => { setQuoteOpen(true); track('coach_quote_open', { from: 'bubble' }); }}
              initial={{ opacity: 0, x: 12, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="relative mb-1 max-w-[190px] text-left rounded-2xl rounded-br-md px-3.5 py-2.5"
              style={{ background: T.surface, border: `1px solid ${T.hairlineStrong}`, boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }}
            >
              <p className="font-body text-[9px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: T.gold }}>
                {committed ? 'Locked in' : 'Biki says'}
              </p>
              <p className="font-body text-[12px] font-semibold leading-snug" style={{ color: T.text }}>
                {committed ? "That's the standard. Keep it." : quote.short}
              </p>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Avatar — opens the mindset modal */}
        <motion.button
          whileTap={T.tapSmall}
          onClick={() => { setQuoteOpen(true); track('coach_quote_open', { from: 'avatar' }); }}
          aria-label="Today's mindset from Coach Biki"
          className="relative shrink-0 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Pulse ring */}
          <div
            className="absolute -inset-1 rounded-full"
            style={{
              background: `radial-gradient(circle, ${T.goldTint} 0%, transparent 70%)`,
              animation: 'pulse-glow 2.5s ease-in-out infinite',
            }}
          />
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-full overflow-hidden relative"
            style={{ border: `2.5px solid ${T.gold}`, boxShadow: `0 4px 20px rgba(246,180,28,0.25)` }}
          >
            <img
              src={PHOTOS.bikiPortrait}
              alt="Coach Biki"
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(30%) contrast(1.1)' }}
            />
          </div>
          {/* Online indicator */}
          <div
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full"
            style={{ background: T.green, border: `2.5px solid ${T.bg}` }}
          />
          {/* Mindset badge */}
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: T.gold }}
          >
            <Sparkles size={10} strokeWidth={2.5} style={{ color: T.goldInk }} />
          </div>
        </motion.button>
      </div>

      {/* Daily-quote modal */}
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

      <MonthSheet isOpen={monthOpen} onClose={() => setMonthOpen(false)} mode="score" />

      {/* Contextual coach intro (points + tasks) */}
      {activeTip && (
        <CoachTip
          stepKey={tourStep}
          targetSelector={activeTip.target}
          message={activeTip.msg}
          cta={activeTip.cta}
          onCta={activeTip.go}
          onSkip={() => endHomeTour(true)}
        />
      )}
    </div>
  );
}
