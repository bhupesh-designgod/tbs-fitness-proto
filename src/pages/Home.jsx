// ── Home — "Scoreboard" ──
// Open-air score hero with oversized number, week strip,
// task queue, plan rings, workout card, coach quote, sleep note.

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Utensils, Droplets, Dumbbell, Clock, ChevronRight,
  Bell, Moon, Check,
} from 'lucide-react';
import { NumericCounter } from '../components/ui/Components';
import { useApp } from '../context/AppContext';
import { T, enter, stagger } from '../tokens';
import {
  USER_PROFILE, PHOTOS, DAILY_TARGETS,
  BIKI_MESSAGES, PLAN_PROGRESS,
} from '../data/mockData';

// ── Greeting by time of day ──
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Coach daily quotes ──
const COACH_QUOTES = [
  "Champions are built on ordinary days. This is one of them. Own it.",
  "You showed up. That's the hard part. Now make it count.",
  "Consistency beats intensity. Don't be perfect today — be present.",
  "One meal, one rep, one glass of water at a time. Stay locked in.",
  "Rest when you need to. Push when you can. Never quit on yourself.",
  "Every rep today is a vote for who you're becoming.",
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

  const ringColor = isToday ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.30)';

  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={isToday ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.06)'}
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

// ── Status ring for plan cards ──
function StatusRing({ percentage, size = 60, strokeWidth = 4, color, children }) {
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
            fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={shouldReduce ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.6, ease: T.easeOut, delay: 0.3 }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default function Home({ onProfileClick, onNavigate }) {
  const { training, meals, hydration, isRestDay, history } = useApp();

  const shouldReduce = useReducedMotion();
  const today = new Date();

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

  const hydrationPct = Math.min(Math.round((hydration / DAILY_TARGETS.water) * 100), 100);
  const mealsLogged = meals.filter(m => m.logged).length;
  const totalMeals = meals.length;
  const nutritionPct = Math.round((mealsLogged / totalMeals) * 100);

  // Up-next task queue
  const tasks = useMemo(() => {
    const queue = [];
    const nextMealIdx = meals.findIndex(m => !m.logged);
    if (nextMealIdx !== -1) {
      const meal = meals[nextMealIdx];
      const totalCal = meal.foods.reduce((s, f) => s + (f.calories || 0), 0);
      const totalProtein = meal.foods.reduce((s, f) => s + (f.protein || 0), 0);
      queue.push({
        key: `meal-${nextMealIdx}`,
        icon: Utensils,
        title: `Log ${meal.label}`,
        subtitle: `${Math.round(totalCal)} cal · ${Math.round(totalProtein)}g protein`,
        points: 5,
        target: 'nutrition',
      });
    }
    if (hydration < DAILY_TARGETS.water) {
      const pct = Math.round((hydration / DAILY_TARGETS.water) * 100);
      queue.push({
        key: 'hydration',
        icon: Droplets,
        title: 'Drink water',
        subtitle: `${pct}% of today's goal`,
        points: 5,
        target: 'nutrition',
      });
    }
    return queue.slice(0, 2);
  }, [meals, hydration]);

  const exerciseCount = training.exercises?.length || 0;
  const muscleList = training.muscles?.join(' · ') || '';

  const coachQuote = useMemo(() => {
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24),
    );
    return COACH_QUOTES[dayOfYear % COACH_QUOTES.length];
  }, []);

  const totalDots = 6;
  const filledDots = Math.floor(score.earned / 5);
  const greeting = getGreeting();
  const ptsToGo = score.total - score.earned;

  return (
    <div className="min-h-screen bg-black pb-24">

      {/* ═══ 1. GREETING ═══ */}
      <motion.div
        className="flex items-center justify-between px-5 pt-5 pb-2"
        {...enter(0)}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={T.tapSmall}
            onClick={onProfileClick}
            className="w-11 h-11 rounded-full flex items-center justify-center font-display text-[18px]"
            style={{
              background: T.goldTint,
              border: `2px solid ${T.goldBorder}`,
              color: T.gold,
            }}
          >
            {USER_PROFILE.name.charAt(0)}
          </motion.button>
          <div>
            <p className="font-body text-[13px] font-medium" style={{ color: T.textLow }}>
              {greeting},
            </p>
            <p className="display-md text-white" style={{ marginTop: '-1px' }}>
              {USER_PROFILE.name.toUpperCase()}.
            </p>
          </div>
        </div>

        <div
          className="relative w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: T.surface, border: `1px solid ${T.hairline}` }}
        >
          <Bell size={18} strokeWidth={T.stroke} style={{ color: T.textLow }} />
          <div
            className="absolute top-2 right-2.5 w-2 h-2 rounded-full"
            style={{ background: T.gold }}
          />
        </div>
      </motion.div>

      {/* ═══ 2. SCORE HERO — open air, number bleeds right ═══ */}
      <motion.div className="pl-5 pt-6 pb-2 relative overflow-hidden" {...enter(0.05)}>
        <div className="flex items-center gap-2">
          <span className="kicker">Today's score</span>
          {/* Tilted plan-day badge */}
          <motion.span
            className="font-body text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block"
            style={{
              color: T.textLow,
              border: `1px solid ${T.hairlineStrong}`,
              rotate: '-2.5deg',
            }}
            {...enter(0.15)}
          >
            Day {PLAN_PROGRESS.currentDay} of {PLAN_PROGRESS.totalDays}
          </motion.span>
        </div>

        <div className="flex items-end gap-3 mt-1 -mb-2">
          <NumericCounter
            value={score.earned}
            className="display-2xl"
            duration={0.6}
          />
          <div className="flex items-baseline gap-1 pb-4">
            <span className="display-md" style={{ color: T.textFaint }}>/{score.total}</span>
            <span className="display-xs" style={{ color: T.textFaint }}>PTS</span>
          </div>
        </div>

        <p className="font-body text-[13px] font-medium mt-2 mb-4" style={{ color: T.textLow }}>
          {score.earned >= score.total
            ? 'Goal hit. Take a bow.'
            : `${ptsToGo} pts to go. Keep moving.`}
        </p>

        {/* Progress dots */}
        <div className="flex gap-1.5 pr-5">
          {Array.from({ length: totalDots }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 h-[5px] rounded-full"
              initial={shouldReduce ? {} : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.25 + i * 0.04, duration: 0.2, ease: T.easeOut }}
              style={{
                transformOrigin: 'left',
                background: i < filledDots ? T.goldGrad : 'rgba(255,255,255,0.07)',
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* ═══ 3. UP NEXT ═══ */}
      {tasks.length > 0 && (
        <motion.div className="mx-5 mt-6 mb-3" {...enter(0.1)}>
          <p className="kicker mb-3">Up next</p>
          <div className="flex flex-col gap-2">
            {tasks.map((t, i) => {
              const Icon = t.icon;
              return (
                <motion.button
                  key={t.key}
                  {...stagger(i, 0.14)}
                  whileTap={T.tap}
                  onClick={() => onNavigate && onNavigate(t.target)}
                  className="card w-full flex items-center gap-3 p-3 text-left"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}
                  >
                    <Icon size={20} strokeWidth={T.stroke} style={{ color: T.textMid }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="display-xs text-white leading-tight">
                      {t.title}
                    </p>
                    <p className="font-body text-[12px] font-medium mt-0.5 truncate" style={{ color: T.textLow }}>
                      {t.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="font-body text-[11px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md inline-block"
                      style={{
                        color: T.gold,
                        border: `1px solid ${T.goldBorder}`,
                        rotate: '-2deg',
                      }}
                    >
                      +{t.points} pts
                    </span>
                    <ChevronRight size={16} strokeWidth={T.stroke} style={{ color: T.textFaint }} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ 4. TODAY'S PLAN — 2-col rings ═══ */}
      <motion.div className="mx-5 mb-3" {...enter(0.16)}>
        <p className="kicker mb-3">Today's plan</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="card flex flex-col items-center gap-2.5 py-5 px-4">
            <StatusRing percentage={nutritionPct} color={T.gold} size={60} strokeWidth={4}>
              {nutritionPct >= 100 ? (
                <Check size={22} strokeWidth={2.5} style={{ color: T.gold }} />
              ) : (
                <Utensils size={20} strokeWidth={T.stroke} style={{ color: T.textMid }} />
              )}
            </StatusRing>
            <span className="font-body text-[12px] font-bold uppercase tracking-wider" style={{ color: T.textMid }}>
              Nutrition
            </span>
            <span className="display-xs" style={{ color: nutritionPct >= 100 ? T.gold : '#fff' }}>
              {nutritionPct >= 100 ? 'Done' : `${mealsLogged} of ${totalMeals}`}
            </span>
          </div>

          <div className="card flex flex-col items-center gap-2.5 py-5 px-4">
            <StatusRing percentage={hydrationPct} color={T.water} size={60} strokeWidth={4}>
              {hydrationPct >= 100 ? (
                <Check size={22} strokeWidth={2.5} style={{ color: T.water }} />
              ) : (
                <Droplets size={20} strokeWidth={T.stroke} style={{ color: T.textMid }} />
              )}
            </StatusRing>
            <span className="font-body text-[12px] font-bold uppercase tracking-wider" style={{ color: T.textMid }}>
              Hydration
            </span>
            <span className="display-xs" style={{ color: hydrationPct >= 100 ? T.water : '#fff' }}>
              {hydrationPct >= 100 ? 'Done' : `${hydrationPct}%`}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ═══ 5. WORKOUT CARD ═══ */}
      <motion.div className="card mx-5 mb-3 overflow-hidden relative" {...enter(0.2)}>
        <div className="flex">
          <div className="flex-1 p-5">
            <p className="kicker mb-2">
              {isRestDay ? 'Recovery' : "Today's workout"}
            </p>
            <h2 className="display-lg text-white uppercase">
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

      {/* ═══ 6. THIS WEEK STRIP ═══ */}
      <motion.div className="px-5 pt-3 mb-4" {...enter(0.24)}>
        <p className="kicker mb-3">This week</p>
        <div className="grid grid-cols-7 gap-1.5">
          {weekStrip.days.map((day, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-1"
              {...stagger(i, 0.26)}
            >
              <span className="font-body text-[9px] font-bold uppercase tracking-wider" style={{ color: T.textFaint }}>
                {day.label}
              </span>

              <div
                className="w-[42px] h-[42px] rounded-full flex items-center justify-center relative"
                style={{
                  background: day.isToday ? T.goldGrad : T.surface,
                  border: day.isToday ? 'none' : `1px solid ${T.hairline}`,
                }}
              >
                <MiniRing percentage={day.pct} isToday={day.isToday} />
                <span
                  className="font-display text-[18px] leading-none relative z-10"
                  style={{
                    color: day.isToday ? '#000'
                      : day.pts !== null ? 'rgba(255,255,255,0.8)'
                      : 'rgba(255,255,255,0.22)',
                  }}
                >
                  {day.date}
                </span>
              </div>

              <span
                className="font-body text-[9px] font-bold tabular-nums"
                style={{
                  color: day.isToday ? T.gold
                    : day.pts !== null && day.isPast ? T.textLow
                    : 'rgba(255,255,255,0.14)',
                }}
              >
                {day.pts !== null ? `${day.pts}` : '—'}
              </span>
            </motion.div>
          ))}
        </div>

        <p className="font-body text-[12px] font-medium mt-3" style={{ color: T.textLow }}>
          <span className="font-display text-[16px] mr-1" style={{ color: T.gold }}>
            {weekStrip.completedDays}
          </span>
          of 7 days on the board
        </p>
      </motion.div>

      {/* ═══ 7. COACH QUOTE ═══ */}
      <motion.div className="mx-5 mb-3" {...enter(0.28)}>
        <div className="coach-quote-card p-4 pl-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 relative">
              <div
                className="w-10 h-10 rounded-full overflow-hidden"
                style={{ border: `2px solid ${T.goldBorder}` }}
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
                style={{ background: T.success, border: `2px solid ${T.surface}` }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="kicker kicker-gold mb-1.5">Coach Biki</p>
              <p className="font-body text-[14px] font-medium leading-relaxed" style={{ color: T.textMid }}>
                "{coachQuote}"
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ 8. SLEEP NOTE ═══ */}
      <motion.div className="card mx-5 mb-4 p-4 pl-5" {...enter(0.32)}>
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: T.surface2 }}
          >
            <Moon size={16} strokeWidth={T.stroke} style={{ color: T.textMid }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="kicker mb-1.5">Sleep</p>
            <p className="display-sm text-white mb-1.5">
              7–8 HOURS TONIGHT
            </p>
            <p className="font-body text-[13px] font-medium leading-relaxed" style={{ color: T.textLow }}>
              Muscle is built while you sleep. Lights off early.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
