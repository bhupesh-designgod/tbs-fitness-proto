// ── Home Screen — "Deep & Energized" ──
// Dashboard: greeting, week strip (dates + rings), coach quote,
// score card (points), nutrition/hydration ring cards,
// workout card, sleep recommendation.

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Utensils, Droplets, Dumbbell, Clock, ChevronRight,
  Bell, Moon, Sparkles, Check,
} from 'lucide-react';
import { NumericCounter } from '../components/ui/Components';
import { useApp } from '../context/AppContext';
import {
  USER_PROFILE, PHOTOS, DAILY_TARGETS,
  BIKI_MESSAGES, CHECKIN_DUE,
} from '../data/mockData';

// ── Color constants ──
const CARD_BG = '#131318';
const CARD_BORDER = 'rgba(255,255,255,0.07)';
const EMERALD = '#34D399';
const STEEL = '#5B7C99';
const GOLD = '#D4A74E';
const GOLD_START = '#B8893C';
const GOLD_END = '#E0C074';

// ── Greeting by time of day ──
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Coach daily quotes ──
const COACH_QUOTES = [
  "Champions aren't made in the gym — they're made from the decisions they make every single day. Let's own this one.",
  "You showed up. That already puts you ahead of 90% of people. Now let's make it count.",
  "Consistency beats intensity. You don't need to be perfect today — just present.",
  "The body you want is built one meal, one rep, one glass of water at a time. Stay locked in.",
  "Rest when you need to. Push when you can. But never quit on yourself.",
  "Every rep you do today is a vote for the person you're becoming. Make it count.",
];

// ── Points system ──
function calcDailyScore(meals, hydration, targets) {
  let pts = 0;
  meals.forEach(m => { if (m.logged) pts += 5; });
  if (hydration >= targets.water * 0.5) pts += 5;
  if (hydration >= targets.water) pts += 5;
  return { earned: pts, total: 30 };
}

function calcHistoryPts(day) {
  if (!day || day.adherence === null || day.adherence === undefined) return null;
  return Math.round((day.adherence / 100) * 30);
}

const DAY_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// ── Mini ring for weekly strip ──
function MiniRing({ percentage, size = 42, strokeWidth = 3, isToday = false }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  const ringColor = isToday
    ? '#000000'
    : percentage >= 80 ? GOLD
    : percentage >= 40 ? GOLD_START
    : 'rgba(255,255,255,0.12)';

  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={isToday ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.05)'}
        strokeWidth={strokeWidth}
      />
      {percentage > 0 && (
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      )}
    </svg>
  );
}

// ── Status ring for nutrition/hydration cards ──
function StatusRing({ percentage, size = 60, strokeWidth = 4, color, children }) {
  const shouldReduce = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        {percentage > 0 && (
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={shouldReduce ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.35,
            }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const {
    behaviorState, training, meals,
    hydration, isRestDay, history,
  } = useApp();

  const shouldReduce = useReducedMotion();
  const today = new Date();

  // Score
  const score = useMemo(
    () => calcDailyScore(meals, hydration, DAILY_TARGETS),
    [meals, hydration],
  );

  // Week strip (Mon–Sun)
  const weekStrip = useMemo(() => {
    const startOfWeek = new Date(today);
    const daysSinceMonday = (today.getDay() + 6) % 7;
    startOfWeek.setDate(today.getDate() - daysSinceMonday);

    const days = [];
    let completedDays = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const histDay = history.find(h => h.date === dateStr);
      const isToday = d.toDateString() === today.toDateString();
      const isPast = d < new Date(today.toDateString());
      const pts = isToday ? score.earned : calcHistoryPts(histDay);
      const pct = pts !== null ? Math.round((pts / 30) * 100) : 0;

      if ((isPast || isToday) && pts !== null && pts > 0) completedDays++;

      days.push({ label: DAY_ABBR[d.getDay()], date: d.getDate(), isToday, isPast, pts, pct });
    }
    return { days, completedDays };
  }, [today, history, score.earned]);

  // Hydration / nutrition completion
  const hydrationPct = Math.min(Math.round((hydration / DAILY_TARGETS.water) * 100), 100);
  const mealsLogged = meals.filter(m => m.logged).length;
  const totalMeals = meals.length;
  const nutritionPct = Math.round((mealsLogged / totalMeals) * 100);

  // Training info
  const exerciseCount = training.exercises?.length || 0;
  const muscleList = training.muscles?.join(' · ') || '';

  // Coach quote (deterministic per day)
  const coachQuote = useMemo(() => {
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24),
    );
    return COACH_QUOTES[dayOfYear % COACH_QUOTES.length];
  }, []);

  // Biki behavioural line
  const bikiLine = BIKI_MESSAGES[behaviorState]?.[0] || '';

  // Progress dots
  const totalDots = 6;
  const filledDots = Math.floor(score.earned / 5);

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-black pb-24">

      {/* ═══════════════════════════════════════════
          1. GREETING HEADER  (single identity anchor)
          ═══════════════════════════════════════════ */}
      <motion.div
        className="flex items-center justify-between px-5 pt-5 pb-4"
        initial={shouldReduce ? {} : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center font-display text-[18px]"
            style={{
              background: `linear-gradient(135deg, rgba(184,137,60,0.15), rgba(224,192,116,0.08))`,
              border: `2px solid rgba(212,167,78,0.3)`,
              color: GOLD,
            }}
          >
            {USER_PROFILE.name.charAt(0)}
          </div>
          <div>
            <p className="font-body text-[13px] text-white/40 font-medium">{greeting},</p>
            <p
              className="font-display text-[28px] text-white leading-none tracking-wider"
              style={{ marginTop: '-2px' }}
            >
              {USER_PROFILE.name.toUpperCase()}.
            </p>
          </div>
        </div>

        {/* Notification bell */}
        <div
          className="relative w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${CARD_BORDER}` }}
        >
          <Bell size={18} strokeWidth={1.5} className="text-white/40" />
          <div
            className="absolute top-2 right-2.5 w-2 h-2 rounded-full"
            style={{ background: GOLD }}
          />
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          2. THIS WEEK STRIP  (dates + completion rings)
          ═══════════════════════════════════════════ */}
      <motion.div
        className="px-5 mb-4"
        initial={shouldReduce ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.06 }}
      >
        <p className="font-display text-[13px] text-white/25 uppercase tracking-[0.2em] mb-3">
          This Week
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {weekStrip.days.map((day, i) => (
            <motion.div
              key={i}
              className="weekly-ring-cell"
              initial={shouldReduce ? {} : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 + 0.12, duration: 0.25 }}
            >
              <span className="font-body text-[9px] text-white/30 uppercase font-semibold tracking-wider">
                {day.label}
              </span>

              <div
                className="w-[42px] h-[42px] rounded-full flex items-center justify-center relative"
                style={{
                  background: day.isToday
                    ? `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})`
                    : CARD_BG,
                }}
              >
                <MiniRing percentage={day.pct} isToday={day.isToday} />
                <span
                  className="font-display text-[18px] leading-none relative z-10"
                  style={{
                    color: day.isToday ? '#000'
                      : day.pts !== null ? 'rgba(255,255,255,0.8)'
                      : 'rgba(255,255,255,0.2)',
                  }}
                >
                  {day.date}
                </span>
              </div>

              <span
                className="font-body text-[9px] font-semibold tabular-nums"
                style={{
                  color: day.isToday ? GOLD
                    : day.pts !== null && day.isPast ? 'rgba(212,167,78,0.7)'
                    : 'rgba(255,255,255,0.12)',
                }}
              >
                {day.pts !== null ? `${day.pts}pts` : '\u2014'}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span className="font-display text-[14px] tracking-wider" style={{ color: GOLD }}>
            {weekStrip.completedDays}
          </span>
          <span className="font-body text-[11px] text-white/30 font-medium uppercase tracking-wider">
            of 7 days completed
          </span>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          3. COACH BIKI QUOTE  (reacting to your week)
          ═══════════════════════════════════════════ */}
      <motion.div
        className="mx-5 mb-4"
        initial={shouldReduce ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
      >
        <div className="coach-quote-card p-4 pl-5">
          <div className="flex items-start gap-3">
            {/* Coach avatar */}
            <div className="shrink-0 relative">
              <div
                className="w-10 h-10 rounded-full overflow-hidden"
                style={{ border: '2px solid rgba(212,167,78,0.35)' }}
              >
                <img
                  src={PHOTOS.bikiPortrait}
                  alt="Coach Biki"
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(40%) contrast(1.1)' }}
                />
              </div>
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                style={{ background: '#4ADE80', border: '2px solid #131318' }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={12} strokeWidth={1.5} style={{ color: GOLD }} />
                <span
                  className="font-display text-[12px] uppercase tracking-widest"
                  style={{ color: GOLD }}
                >
                  Coach Biki
                </span>
              </div>
              <p className="font-body text-[14px] text-white/70 leading-relaxed">
                "{coachQuote}"
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Divider ── */}
      <div className="mx-5 mb-4" style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

      {/* ═══════════════════════════════════════════
          4. TODAY'S SCORE CARD  (points-based)
          ═══════════════════════════════════════════ */}
      <motion.div
        className="mx-5 mb-3 rounded-2xl p-5 relative overflow-hidden"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.35 }}
      >
        <p className="font-display text-[13px] text-white/25 uppercase tracking-[0.2em] mb-2">
          Today
        </p>

        {/* Big score */}
        <div className="flex items-end gap-2 mb-1">
          <NumericCounter
            value={score.earned}
            className="text-[72px] leading-none text-white"
            duration={0.8}
          />
          <div className="flex items-baseline gap-1 pb-2.5">
            <span className="font-display text-[24px] text-white/20">/{score.total}</span>
            <span className="font-display text-[16px] text-white/20 uppercase">pts</span>
          </div>
        </div>

        {/* Subtitle */}
        <p className="font-body text-[12px] text-white/30 font-medium mb-4">
          {score.earned >= score.total
            ? 'You hit your daily goal'
            : `${score.total - score.earned} pts away from your goal`}
        </p>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {Array.from({ length: totalDots }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 h-[5px] rounded-full"
              initial={shouldReduce ? {} : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.35 + i * 0.04 }}
              style={{
                transformOrigin: 'left',
                background: i < filledDots
                  ? `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})`
                  : 'rgba(255,255,255,0.05)',
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          5. TODAY'S PLAN — Nutrition & Hydration rings
          ═══════════════════════════════════════════ */}
      <motion.div
        className="mx-5 mb-3"
        initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="font-display text-[13px] text-white/25 uppercase tracking-[0.2em] mb-3">
          Today's Plan
        </p>
        <div className="grid grid-cols-2 gap-3">

          {/* ── Nutrition ring card ── */}
          <div className="status-card">
            <StatusRing percentage={nutritionPct} color={EMERALD} size={60} strokeWidth={4}>
              {nutritionPct >= 100 ? (
                <Check size={22} strokeWidth={2.5} style={{ color: EMERALD }} />
              ) : (
                <Utensils size={20} strokeWidth={1.5} style={{ color: EMERALD }} />
              )}
            </StatusRing>

            <span className="font-display text-[14px] text-white/60 uppercase tracking-wider">
              Nutrition
            </span>

            <span
              className="font-body text-[12px] font-bold uppercase tracking-wider"
              style={{ color: EMERALD }}
            >
              {nutritionPct >= 100 ? 'Done' : `${mealsLogged} of ${totalMeals}`}
            </span>
          </div>

          {/* ── Hydration ring card ── */}
          <div className="status-card">
            <StatusRing percentage={hydrationPct} color={STEEL} size={60} strokeWidth={4}>
              {hydrationPct >= 100 ? (
                <Check size={22} strokeWidth={2.5} style={{ color: STEEL }} />
              ) : (
                <Droplets size={20} strokeWidth={1.5} style={{ color: STEEL }} />
              )}
            </StatusRing>

            <span className="font-display text-[14px] text-white/60 uppercase tracking-wider">
              Hydration
            </span>

            <span
              className="font-body text-[12px] font-bold uppercase tracking-wider"
              style={{ color: STEEL }}
            >
              {hydrationPct >= 100 ? 'Done' : `${hydrationPct}%`}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          6. WORKOUT CARD  (standalone)
          ═══════════════════════════════════════════ */}
      <motion.div
        className="mx-5 mb-3 rounded-2xl overflow-hidden relative"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36 }}
      >
        <div className="flex">
          <div className="flex-1 p-5">
            <p className="font-display text-[12px] text-white/25 uppercase tracking-[0.2em] mb-2">
              {isRestDay ? 'Recovery' : "Today's Workout"}
            </p>
            <h2 className="font-display text-[32px] text-white leading-none tracking-wider uppercase">
              {training.name}
            </h2>
            {!isRestDay && (
              <>
                <div className="flex items-center gap-3 mt-2.5 mb-2">
                  <span className="flex items-center gap-1.5 font-body text-[11px] text-white/40 font-medium">
                    <Dumbbell size={12} strokeWidth={1.5} /> {exerciseCount} exercises
                  </span>
                  <span className="font-body text-[11px] text-white/15">|</span>
                  <span className="flex items-center gap-1.5 font-body text-[11px] text-white/40 font-medium">
                    <Clock size={12} strokeWidth={1.5} /> 60 min
                  </span>
                </div>
                <p className="font-body text-[11px] text-white/25 font-medium">{muscleList}</p>
              </>
            )}
            {isRestDay && (
              <p className="font-body text-[12px] text-white/30 mt-2 font-medium">
                Recovery + mobility work
              </p>
            )}

            <motion.div
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2.5 rounded-lg"
              style={{ border: `1px solid rgba(212,167,78,0.25)` }}
            >
              <span className="font-body text-[12px] font-semibold" style={{ color: GOLD }}>
                View Workout
              </span>
              <ChevronRight size={12} strokeWidth={1.5} style={{ color: GOLD }} />
            </motion.div>
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
                style={{ background: `linear-gradient(to right, ${CARD_BG} 0%, transparent 60%)` }}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          7. SLEEP RECOMMENDATION BANNER
          ═══════════════════════════════════════════ */}
      <motion.div
        className="mx-5 mb-4"
        initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="sleep-banner p-4 pl-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div
                className="w-9 h-9 rounded-full overflow-hidden"
                style={{ border: `1.5px solid rgba(91,124,153,0.25)` }}
              >
                <img
                  src={PHOTOS.bikiPortrait}
                  alt="Coach Biki"
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(60%) brightness(0.8)' }}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Moon size={12} strokeWidth={1.5} style={{ color: STEEL }} />
                <span
                  className="font-display text-[12px] uppercase tracking-[0.15em]"
                  style={{ color: STEEL }}
                >
                  Sleep Recommendation
                </span>
              </div>
              <p className="font-display text-[22px] text-white leading-none tracking-wider mb-1.5">
                GET 7–8 HOURS TONIGHT
              </p>
              <p className="font-body text-[12px] text-white/30 leading-relaxed font-medium">
                "Your body recovers and builds muscle while you sleep. This is non-negotiable.
                Lights off early tonight."
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
