// ── Home Screen ──
// Card-based dashboard: greeting, week strip, score card, next action,
// training preview, accountability, Biki message.

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Utensils, Droplets, Dumbbell, Clock, ChevronRight, Bell } from 'lucide-react';
import { PillChip, NumericCounter } from '../components/ui/Components';
import { useApp } from '../context/AppContext';
import {
  USER_PROFILE, BIKI, PHOTOS, DAILY_TARGETS,
  BIKI_MESSAGES, CHECKIN_DUE, TRAINING_SESSIONS,
} from '../data/mockData';

// ── Greeting by time of day ──
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Points system ──
// Meal logged = 5 pts each (4 meals = 20 max)
// Hydration >=50% = 5 pts, >=100% = additional 5 pts
// Total = 30 pts
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

// ── Day abbreviations ──
const DAY_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function Home() {
  const {
    behaviorState, training, meals, logged,
    hydration, isRestDay, history,
  } = useApp();

  const shouldReduce = useReducedMotion();
  const today = new Date();
  const todayDay = today.getDay(); // 0=Sun

  // Score
  const score = useMemo(() => calcDailyScore(meals, hydration, DAILY_TARGETS), [meals, hydration]);
  const awayFromGoal = score.total - score.earned;

  // Build this-week strip (Mon–Sun of current week)
  const weekStrip = useMemo(() => {
    const startOfWeek = new Date(today);
    const daysSinceMonday = (today.getDay() + 6) % 7; // Mon=0
    startOfWeek.setDate(today.getDate() - daysSinceMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const histDay = history.find(h => h.date === dateStr);
      const isToday = d.toDateString() === today.toDateString();
      const isPast = d < new Date(today.toDateString());
      const pts = isToday ? score.earned : calcHistoryPts(histDay);

      days.push({
        label: DAY_ABBR[d.getDay()],
        date: d.getDate(),
        isToday,
        isPast,
        pts,
      });
    }
    return days;
  }, [today, history, score.earned]);

  // Tasks breakdown (the 3 task icons shown in score card)
  const taskIcons = useMemo(() => {
    const t = [];
    const unlogged = meals.filter(m => !m.logged);
    if (unlogged.length > 0) {
      t.push({ icon: <Utensils size={14} strokeWidth={1.5} />, label: unlogged[0].label, pts: 5, done: false });
    }
    if (unlogged.length > 1) {
      t.push({ icon: <Utensils size={14} strokeWidth={1.5} />, label: unlogged[1].label, pts: 5, done: false });
    }
    // Hydration
    const waterDone = hydration >= DAILY_TARGETS.water;
    t.push({ icon: <Droplets size={14} strokeWidth={1.5} />, label: 'Water', pts: waterDone ? 0 : 5, done: waterDone });

    // Fill logged meals as done
    const loggedMeals = meals.filter(m => m.logged);
    loggedMeals.forEach(m => {
      t.unshift({ icon: <Utensils size={14} strokeWidth={1.5} />, label: m.label, pts: 5, done: true });
    });

    return t.slice(0, 6); // Show up to 6 task dots
  }, [meals, hydration]);

  // Next action (single biggest thing to do)
  const nextAction = useMemo(() => {
    const unlogged = meals.filter(m => !m.logged);
    if (unlogged.length > 0) {
      return { label: `Log ${unlogged[0].label}`, pts: 5, type: 'meal' };
    }
    if (hydration < DAILY_TARGETS.water) {
      return { label: 'Drink Water', pts: 5, type: 'water' };
    }
    return null;
  }, [meals, hydration]);

  // Training info
  const exerciseCount = training.exercises?.length || 0;
  const muscleList = training.muscles?.join(' \u00B7 ') || '';

  // Biki line
  const bikiLine = BIKI_MESSAGES[behaviorState]?.[0] || '';

  // Check-in days away
  const checkinDaysAway = useMemo(() => {
    // Simple: parse CHECKIN_DUE.date and compare
    const parts = CHECKIN_DUE.date.replace(',', '').split(' ');
    // "Sunday Jun 15"
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const targetDate = new Date(today.getFullYear(), months[parts[1]] || 5, parseInt(parts[2]) || 15);
    const diff = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, []);

  // Score progress dots (6 dots for 30 pts, each dot = 5 pts)
  const totalDots = 6;
  const filledDots = Math.floor(score.earned / 5);

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* ── Header ── */}
      <motion.div
        className="flex items-center justify-between px-5 pt-4 pb-3"
        initial={shouldReduce ? {} : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar initials */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-display text-[14px] font-bold"
            style={{
              background: 'linear-gradient(135deg, rgba(184,137,60,0.15), rgba(224,192,116,0.08))',
              border: '1px solid rgba(212,167,78,0.2)',
              color: '#D4A74E',
            }}
          >
            {USER_PROFILE.name.charAt(0)}
          </div>
          <div>
            <p className="font-body text-[13px] text-white/45">{greeting},</p>
            <p className="font-display text-[18px] font-extrabold text-white leading-tight">Biki.</p>
          </div>
        </div>
        {/* Notification bell */}
        <div
          className="relative w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <Bell size={18} strokeWidth={1.5} className="text-white/40" />
          <div
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: '#D4A74E' }}
          />
        </div>
      </motion.div>

      {/* ── This Week Strip ── */}
      <motion.div
        className="px-5 mb-4"
        initial={shouldReduce ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <p className="font-body text-[10px] text-white/30 uppercase tracking-widest mb-2.5">This week</p>
        <div className="grid grid-cols-7 gap-1.5">
          {weekStrip.map((day, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-1"
              initial={shouldReduce ? {} : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 + 0.1, duration: 0.25 }}
            >
              <span className="font-body text-[10px] text-white/30 uppercase">{day.label}</span>
              <div
                className="w-full aspect-square rounded-[14px] flex flex-col items-center justify-center gap-0.5 relative"
                style={{
                  background: day.isToday
                    ? 'linear-gradient(135deg, #B8893C, #E0C074)'
                    : '#121212',
                  border: day.isToday
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span
                  className="font-display text-[16px] font-bold tabular-nums leading-none"
                  style={{ color: day.isToday ? '#000' : 'rgba(255,255,255,0.7)' }}
                >
                  {day.date}
                </span>
                {/* Today indicator dot */}
                {day.isToday && (
                  <div className="absolute -bottom-2 w-1.5 h-1.5 rounded-full" style={{ background: '#D4A74E' }} />
                )}
              </div>
              {/* Points label */}
              <span
                className="font-body text-[10px] tabular-nums"
                style={{
                  color: day.isToday ? '#D4A74E'
                    : day.pts !== null && day.isPast ? '#D4A74E'
                    : 'rgba(255,255,255,0.15)',
                }}
              >
                {day.pts !== null ? `${day.pts} pts` : '\u2014'}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Today's Score Card ── */}
      <motion.div
        className="mx-5 mb-3 rounded-2xl p-5 relative overflow-hidden"
        style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.08)' }}
        initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
      >
        {/* Medal image — top right */}
        <img
          src="/medal.png"
          alt=""
          className="absolute -top-2 -right-2 w-28 h-28 object-contain pointer-events-none"
          style={{ opacity: score.earned > 0 ? 0.85 : 0.25, filter: score.earned === 0 ? 'grayscale(0.8)' : 'none' }}
        />

        <p className="font-body text-[10px] text-white/30 uppercase tracking-widest mb-2">Today's score</p>

        {/* Big score number */}
        <div className="flex items-baseline gap-1.5 mb-1">
          <NumericCounter
            value={score.earned}
            className="text-[56px] font-extrabold leading-none"
            duration={0.8}
          />
          <span className="font-body text-[16px] text-white/30 font-medium">/{score.total} pts</span>
        </div>

        {/* Away message */}
        <p className="font-body text-[13px] text-white/40 mb-4">
          {score.earned >= score.total
            ? 'You hit your daily goal'
            : `${awayFromGoal} away from your goal`}
        </p>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-5">
          {Array.from({ length: totalDots }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 h-[5px] rounded-full"
              initial={shouldReduce ? {} : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              style={{
                transformOrigin: 'left',
                background: i < filledDots
                  ? 'linear-gradient(135deg, #B8893C, #E0C074)'
                  : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>

        {/* Task breakdown icons */}
        <div className="flex gap-4">
          {taskIcons.slice(0, 3).map((task, i) => (
            <div key={i} className="flex items-center gap-2">
              <span style={{ color: task.done ? '#D4A74E' : 'rgba(255,255,255,0.3)' }}>
                {task.icon}
              </span>
              <div>
                <span className="font-body text-[11px] text-white/50 block leading-tight">{task.label}</span>
                <span className="font-body text-[10px] font-medium" style={{ color: '#D4A74E' }}>
                  {task.done ? 'Done' : `+${task.pts} pts`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Next Action Card ── */}
      {nextAction && (
        <motion.div
          className="mx-5 mb-3 rounded-2xl p-4 flex items-center justify-between"
          style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.08)' }}
          initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: nextAction.type === 'water'
                  ? 'rgba(91,124,153,0.12)' : 'rgba(212,167,78,0.1)',
                border: `1px solid ${nextAction.type === 'water' ? 'rgba(91,124,153,0.2)' : 'rgba(212,167,78,0.15)'}`,
              }}
            >
              {nextAction.type === 'water'
                ? <Droplets size={18} strokeWidth={1.5} style={{ color: '#5B7C99' }} />
                : <Utensils size={18} strokeWidth={1.5} style={{ color: '#D4A74E' }} />
              }
            </div>
            <div>
              <p className="font-body text-[10px] text-white/25 uppercase tracking-widest">Next action</p>
              <p className="font-display text-[16px] font-bold text-white mt-0.5">{nextAction.label}</p>
              <p className="font-body text-[11px] mt-0.5" style={{ color: '#D4A74E' }}>Worth +{nextAction.pts} pts</p>
            </div>
          </div>

          {/* CTA pill */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(184,137,60,0.15), rgba(224,192,116,0.08))',
              border: '1px solid rgba(212,167,78,0.25)',
            }}
          >
            <span className="font-body text-[13px] font-medium" style={{ color: '#D4A74E' }}>Complete</span>
            <ChevronRight size={14} strokeWidth={1.5} style={{ color: '#D4A74E' }} />
          </motion.div>
        </motion.div>
      )}

      {/* ── Today's Training Card ── */}
      <motion.div
        className="mx-5 mb-3 rounded-2xl overflow-hidden relative"
        style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.08)' }}
        initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
      >
        <div className="flex">
          {/* Content */}
          <div className="flex-1 p-5">
            <p className="font-body text-[10px] text-white/25 uppercase tracking-widest mb-2">Today's training</p>
            <h2 className="font-display text-[24px] font-extrabold text-white leading-tight uppercase">
              {training.name}
            </h2>
            {!isRestDay && (
              <>
                <div className="flex items-center gap-3 mt-2 mb-2">
                  <span className="flex items-center gap-1 font-body text-[11px] text-white/40">
                    <Dumbbell size={12} strokeWidth={1.5} /> {exerciseCount} exercises
                  </span>
                  <span className="font-body text-[11px] text-white/20">|</span>
                  <span className="flex items-center gap-1 font-body text-[11px] text-white/40">
                    <Clock size={12} strokeWidth={1.5} /> 60 min
                  </span>
                </div>
                <p className="font-body text-[12px] text-white/30">{muscleList}</p>
              </>
            )}
            {isRestDay && (
              <p className="font-body text-[12px] text-white/30 mt-2">Recovery + mobility work</p>
            )}

            {/* View Workout button */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-2 rounded-lg"
              style={{ border: '1px solid rgba(212,167,78,0.25)' }}
            >
              <span className="font-body text-[12px] font-medium" style={{ color: '#D4A74E' }}>
                View Workout
              </span>
              <ChevronRight size={12} strokeWidth={1.5} style={{ color: '#D4A74E' }} />
            </motion.div>
          </div>

          {/* Training photo — right side */}
          {!isRestDay && (
            <div className="w-[120px] relative">
              <img
                src={training.photo || PHOTOS.pushHero}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'grayscale(60%) contrast(1.1) brightness(0.7)' }}
              />
              {/* Left fade */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to right, #0E0E0E 0%, transparent 60%)',
                }}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Accountability Card (Check-in countdown) ── */}
      <motion.div
        className="mx-5 mb-3 rounded-2xl p-4 flex items-center gap-3"
        style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.08)' }}
        initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(212,167,78,0.08)',
            border: '1px solid rgba(212,167,78,0.12)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A74E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-body text-[10px] text-white/25 uppercase tracking-widest">Accountability</p>
          <p className="font-body text-[13px] text-white/60 mt-0.5">
            Biki reviews your week in
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-display text-[22px] font-extrabold text-white">
              {checkinDaysAway} DAYS
            </span>
          </div>
          <p className="font-body text-[11px] mt-0.5" style={{ color: '#D4A74E' }}>
            {CHECKIN_DUE.date}
          </p>
        </div>
        <ChevronRight size={18} strokeWidth={1.5} className="text-white/15 shrink-0" />
      </motion.div>

      {/* ── Biki Message Card ── */}
      <motion.div
        className="mx-5 mb-4 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden"
        style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.08)' }}
        initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Star icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(212,167,78,0.08)',
            border: '1px solid rgba(212,167,78,0.12)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A74E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-body text-[10px] text-white/25 uppercase tracking-widest">Biki</p>
          <p className="font-display text-[15px] font-bold text-white mt-0.5 leading-snug">
            {behaviorState === 'DEPLETED' ? 'Start small.' : behaviorState === 'REST' ? 'Recovery day.' : 'Keep going.'}
          </p>
          <p className="font-body text-[13px] text-white/40 mt-0.5 leading-relaxed">
            {bikiLine}
          </p>
        </div>

        {/* Biki portrait — faded right edge */}
        <div className="w-[70px] h-full absolute right-0 top-0 bottom-0">
          <img
            src={PHOTOS.bikiPortrait}
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: 'grayscale(100%) brightness(0.4)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, #0E0E0E 0%, transparent 100%)' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
