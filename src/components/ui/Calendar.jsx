// ── Calendar primitives ──
// Shared WeekStrip + MonthSheet in three modes:
//   score     — Home. One gold ring per day = daily goal completion.
//   nutrition — Diet adherence. Dual rings: meals (orange) + hydration (cobalt).
//   training  — Workout vs rest days (volt = trained, cobalt = rest).
// Today is always an outlined gold cell, same structure as every other day.

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Dumbbell, Moon } from 'lucide-react';
import { BottomSheet } from './Components';
import { useApp } from '../../context/AppContext';
import { T, stagger } from '../../tokens';
import { DAILY_TARGETS, getTodaySplit } from '../../data/mockData';

const DAY_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Live daily score → pct (same points logic as Home hero)
function liveScore(meals, hydration) {
  let pts = 0;
  meals.forEach(m => { if (m.logged) pts += 5; });
  if (hydration >= DAILY_TARGETS.water * 0.5) pts += 5;
  if (hydration >= DAILY_TARGETS.water) pts += 5;
  return { pts, pct: Math.round((pts / 30) * 100) };
}

function histPts(day) {
  if (!day || day.adherence === null || day.adherence === undefined) return null;
  return Math.round((day.adherence / 100) * 30);
}

// ── Single ring ──
export function MiniRing({ percentage, size = 42, strokeWidth = 3, color = T.gold, inset = 0 }) {
  const radius = (size - strokeWidth) / 2 - inset;
  if (radius <= 0 || percentage === null || percentage === undefined) return null;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="rgba(244,242,236,0.07)"
        strokeWidth={strokeWidth}
      />
      {percentage > 0 && (
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      )}
    </svg>
  );
}

// ── Dual ring: meals (outer, orange) + hydration (inner, cobalt) ──
function DualRing({ mealPct, hydPct, size = 42 }) {
  return (
    <>
      <MiniRing percentage={mealPct} size={size} strokeWidth={3} color={T.meal} />
      <MiniRing percentage={hydPct} size={size} strokeWidth={3} color={T.cobalt} inset={5} />
    </>
  );
}

// ── Per-day data for the current week ──
function useWeekDays() {
  const { history, meals, hydration, dayIndex } = useApp();
  const today = new Date();
  const live = liveScore(meals, hydration);
  const liveMealPct = Math.round((meals.filter(m => m.logged).length / meals.length) * 100);
  const liveHydPct = Math.min(Math.round((hydration / DAILY_TARGETS.water) * 100), 100);

  return useMemo(() => {
    const startOfWeek = new Date(today);
    const daysSinceMonday = (today.getDay() + 6) % 7;
    startOfWeek.setDate(today.getDate() - daysSinceMonday);

    const days = [];
    let completedDays = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const hist = history.find(h => h.date === dateStr);
      const isToday = d.toDateString() === today.toDateString();
      const isPast = d < new Date(today.toDateString());
      const isFuture = !isToday && !isPast;

      const pts = isToday ? live.pts : histPts(hist);
      const pct = pts !== null ? Math.round((pts / 30) * 100) : null;
      if ((isPast || isToday) && pts !== null && pts > 0) completedDays++;

      const mealPct = isToday ? liveMealPct : (hist?.adherence ?? null);
      const hydPct = isToday
        ? liveHydPct
        : hist?.waterMl
          ? Math.min(Math.round((hist.waterMl / DAILY_TARGETS.water) * 100), 100)
          : null;

      const offsetFromToday = Math.round((d - new Date(today.toDateString())) / 86_400_000);
      const split = hist?.split ?? (isFuture ? getTodaySplit(dayIndex + offsetFromToday) : null);

      days.push({
        label: DAY_ABBR[d.getDay()],
        date: d.getDate(),
        isToday, isPast, isFuture,
        pts, pct, mealPct, hydPct, split,
        trained: hist?.trained ?? false,
      });
    }
    return { days, completedDays };
  }, [history, live.pts, liveMealPct, liveHydPct, dayIndex]);
}

// ── Training day cell content ──
function SplitIcon({ split, isToday, isPast, trained, size = 15 }) {
  const isRest = split === 'rest';
  const color = isToday ? T.volt
    : isRest ? T.cobalt
    : isPast && trained ? T.volt
    : T.textLow;

  return isRest
    ? <Moon size={size} strokeWidth={T.stroke} style={{ color }} />
    : <Dumbbell size={size} strokeWidth={T.stroke} style={{ color }} />;
}

const SPLIT_SHORT = { push: 'PUSH', pull: 'PULL', legs: 'LEGS', rest: 'REST' };

// ── Shared cell circle — same structure for every day, today gets gold outline ──
function DayCircle({ day, mode, size = 42 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center relative"
      style={{
        width: size,
        height: size,
        background: T.surface,
        border: day.isToday
          ? `2px solid ${T.gold}`
          : mode === 'training' && day.split === 'rest'
            ? `1px dashed ${T.hairlineStrong}`
            : `1px solid ${T.hairline}`,
      }}
    >
      {mode === 'score' && <MiniRing percentage={day.pct} size={size - (day.isToday ? 4 : 2)} strokeWidth={3} color={T.gold} />}
      {mode === 'nutrition' && <DualRing mealPct={day.mealPct} hydPct={day.hydPct} size={size - (day.isToday ? 4 : 2)} />}

      {mode === 'training' ? (
        <SplitIcon split={day.split} isToday={day.isToday} isPast={day.isPast} trained={day.trained} />
      ) : (
        <span
          className="font-body text-[12px] font-extrabold tabular-nums relative z-10"
          style={{
            color: day.isToday ? T.gold
              : (mode === 'score' ? day.pts !== null : day.mealPct !== null)
                ? 'rgba(244,242,236,0.85)'
                : 'rgba(244,242,236,0.25)',
          }}
        >
          {day.date}
        </span>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════
// WeekStrip
// ═════════════════════════════════════════════
export function WeekStrip({ mode = 'score', showPoints = true, className = '' }) {
  const { days, completedDays } = useWeekDays();

  return (
    <div className={`px-5 ${className}`}>
      <p className="kicker mb-3">This week</p>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-1"
            {...stagger(i, 0.05)}
          >
            <span className="font-body text-[9px] font-bold uppercase tracking-wider" style={{ color: T.textFaint }}>
              {day.label}
            </span>

            <DayCircle day={day} mode={mode} />

            {mode === 'score' && showPoints ? (
              <span
                className="font-body text-[9px] font-bold tabular-nums"
                style={{
                  color: day.isToday ? T.gold
                    : day.pts !== null && day.isPast ? T.textLow
                    : 'rgba(244,242,236,0.14)',
                }}
              >
                {day.pts !== null ? `${day.pts}` : '—'}
              </span>
            ) : mode === 'training' ? (
              <span
                className="font-body text-[8px] font-extrabold uppercase tracking-wider"
                style={{
                  color: day.isToday ? T.gold
                    : day.split === 'rest' ? T.textFaint
                    : T.textLow,
                }}
              >
                {SPLIT_SHORT[day.split] || '—'}
              </span>
            ) : null}
          </motion.div>
        ))}
      </div>

      {mode === 'score' && showPoints && (
        <p className="font-body text-[12px] font-medium mt-3" style={{ color: T.textLow }}>
          <span className="font-display text-[18px] mr-1" style={{ color: T.gold }}>
            {completedDays}
          </span>
          of 7 days on the board
        </p>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════
// MonthSheet
// ═════════════════════════════════════════════
const MODE_KICKER = {
  score: 'Goal completion',
  nutrition: 'Diet adherence',
  training: 'Training plan',
};

export function MonthSheet({ isOpen, onClose, mode = 'score' }) {
  const { history, meals, hydration, dayIndex } = useApp();
  const shouldReduce = useReducedMotion();
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekday = new Date(y, m, 1).getDay(); // 0 = Sun
  const monthLabel = today.toLocaleDateString('en', { month: 'long', year: 'numeric' });
  const live = liveScore(meals, hydration);
  const liveMealPct = Math.round((meals.filter(mm => mm.logged).length / meals.length) * 100);
  const liveHydPct = Math.min(Math.round((hydration / DAILY_TARGETS.water) * 100), 100);

  const cells = useMemo(() => {
    const out = [];
    for (let i = 0; i < firstWeekday; i++) out.push({ blank: true });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(y, m, d);
      const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hist = history.find(h => h.date === iso);
      const isToday = d === today.getDate();
      const isPast = dateObj < new Date(today.toDateString());
      const isFuture = !isToday && !isPast;
      const pts = isToday ? live.pts : histPts(hist);
      const pct = pts !== null ? Math.round((pts / 30) * 100) : null;
      const mealPct = isToday ? liveMealPct : (hist?.adherence ?? null);
      const hydPct = isToday
        ? liveHydPct
        : hist?.waterMl
          ? Math.min(Math.round((hist.waterMl / DAILY_TARGETS.water) * 100), 100)
          : null;
      const offsetFromToday = Math.round((dateObj - new Date(today.toDateString())) / 86_400_000);
      const split = hist?.split ?? (isFuture ? getTodaySplit(dayIndex + offsetFromToday) : null);

      out.push({
        date: d, isToday, isPast, isFuture,
        pts, pct, mealPct, hydPct, split,
        trained: hist?.trained ?? false,
      });
    }
    return out;
  }, [history, live.pts, liveMealPct, liveHydPct, y, m, daysInMonth, firstWeekday, dayIndex]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="display-sm text-[#F4F2EC] uppercase">{monthLabel}</h2>
        <span className="kicker">{MODE_KICKER[mode]}</span>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="text-center font-body text-[9px] font-bold uppercase tracking-wider" style={{ color: T.textFaint }}>
            {d}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-5">
        {cells.map((c, i) => {
          if (c.blank) return <div key={i} />;
          return (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-0.5"
              initial={shouldReduce ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.008, duration: 0.15 }}
            >
              <DayCircle day={c} mode={mode} size={40} />
              {mode === 'training' && (
                <span className="font-body text-[8px] font-bold tabular-nums" style={{ color: c.isToday ? T.gold : T.textFaint }}>
                  {c.date}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap pb-2">
        {mode === 'score' && (
          <span className="flex items-center gap-1.5 font-body text-[11px] font-medium" style={{ color: T.textLow }}>
            <span className="relative inline-block w-4 h-4 rounded-full" style={{ border: `1px solid ${T.hairline}` }}>
              <MiniRing percentage={75} size={16} strokeWidth={2} color={T.gold} />
            </span>
            Goal completion
          </span>
        )}
        {mode === 'nutrition' && (
          <>
            <span className="flex items-center gap-1.5 font-body text-[11px] font-medium" style={{ color: T.textLow }}>
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: T.meal }} />
              Meals
            </span>
            <span className="flex items-center gap-1.5 font-body text-[11px] font-medium" style={{ color: T.textLow }}>
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: T.cobalt }} />
              Hydration
            </span>
          </>
        )}
        {mode === 'training' && (
          <>
            <span className="flex items-center gap-1.5 font-body text-[11px] font-medium" style={{ color: T.textLow }}>
              <Dumbbell size={13} strokeWidth={T.stroke} style={{ color: T.volt }} />
              Workout
            </span>
            <span className="flex items-center gap-1.5 font-body text-[11px] font-medium" style={{ color: T.textLow }}>
              <Moon size={13} strokeWidth={T.stroke} style={{ color: T.cobalt }} />
              Rest
            </span>
          </>
        )}
        <span className="flex items-center gap-1.5 font-body text-[11px] font-medium" style={{ color: T.textLow }}>
          <span className="inline-block w-4 h-4 rounded-full" style={{ border: `2px solid ${T.gold}`, background: T.surface }} />
          Today
        </span>
      </div>
    </BottomSheet>
  );
}
