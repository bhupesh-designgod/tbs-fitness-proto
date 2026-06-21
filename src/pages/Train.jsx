// ── Train Screen ──
// Editorial hero, stat strip, expandable exercise list (prescribed plan,
// read-only), and rest-day variant. Workout logging is out of scope.

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check, Clock, Dumbbell, Moon, CalendarDays, ChevronDown, BarChart3,
  MessageSquareText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HeroPhoto, RingCounter } from '../components/ui/Components';
import { WeekStrip, MonthSheet } from '../components/ui/Calendar';
import { PLAN_PROGRESS, BIKI_MESSAGES, PHOTOS, EXERCISE_NOTES } from '../data/mockData';
import { T } from '../tokens';

// ── Aliases from the token sheet — no local values ──
const CARD_BG = T.surface;
const CARD_BORDER = T.hairline;
const GOLD = T.gold;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

// Map exercise name → primary muscle group label
function primaryMuscleFor(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('incline')) return 'Upper Chest';
  if (n.includes('bench') || n.includes('pec') || n.includes('fly')) return 'Chest';
  if (n.includes('lateral') || n.includes('shoulder press') || n.includes('overhead press')) return 'Shoulders';
  if (n.includes('tricep') || n.includes('pushdown') || n.includes('dip')) return 'Triceps';
  if (n.includes('curl') && !n.includes('leg curl') && !n.includes('hamstring curl')) return 'Biceps';
  if (n.includes('face pull') || n.includes('rear delt')) return 'Rear Delts';
  if (n.includes('lat') || n.includes('pulldown')) return 'Back';
  if (n.includes('row') || n.includes('deadlift')) return 'Back';
  if (n.includes('squat') || n.includes('leg press') || n.includes('lunge')) return 'Quads';
  if (n.includes('hamstring') || n.includes('romanian') || n.includes('leg curl')) return 'Hamstrings';
  if (n.includes('glute') || n.includes('hip thrust')) return 'Glutes';
  if (n.includes('calf')) return 'Calves';
  return 'Strength';
}

// Estimate session minutes (~2 min per set)
function estimateMinutes(exercises) {
  if (!exercises) return 0;
  const totalSets = exercises.reduce((s, e) => s + (e.sets?.length || 0), 0);
  return Math.max(20, Math.round(totalSets * 2.5));
}

// Estimate level
function estimateLevel(exercises) {
  const total = exercises?.reduce((s, e) => s + (e.sets?.length || 0), 0) || 0;
  if (total >= 16) return 'Advanced';
  if (total >= 10) return 'Intermediate';
  return 'Beginner';
}

// ─────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────
function WorkoutHero({ training, planPercentage, onCalendar }) {
  const shouldReduce = useReducedMotion();
  const title = (training.name || 'Workout').toUpperCase().split(' ');

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 380 }}>
      {/* Photo */}
      <img
        src={training.photo || PHOTOS.pushHero}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'contrast(1.08) saturate(0.92) brightness(0.78)' }}
        loading="eager"
      />
      {/* Standard bottom-up scrim + subtle edge-fade on the title side */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, #000 0%, rgba(0,0,0,0.75) 28%, rgba(0,0,0,0) 65%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 35%, transparent 60%)',
        }}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-5 z-10">
        <div className="flex items-center gap-2">
          {/* Plan progress */}
          <RingCounter percentage={planPercentage} size={42} strokeWidth={2} delay={0.2}>
            <span className="font-body text-[9px] font-extrabold text-white/80 tabular-nums leading-none text-center">
              {PLAN_PROGRESS.currentDay}
              <span className="text-white/30">/{PLAN_PROGRESS.totalDays}</span>
            </span>
          </RingCounter>
        </div>

        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={onCalendar}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
          style={{ border: `1px solid ${T.goldBorder}`, background: 'rgba(0,0,0,0.4)' }}
        >
          <CalendarDays size={14} strokeWidth={T.stroke} style={{ color: T.gold }} />
          <span className="font-body text-[11px] font-extrabold uppercase tracking-wider" style={{ color: T.gold }}>
            Calendar
          </span>
        </motion.button>
      </div>

      {/* Title block — bottom left */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 pb-7 z-10">
        <motion.h1
          className="font-display leading-[0.85] tracking-tight"
          style={{
            fontSize: 'clamp(56px, 16vw, 78px)',
            color: T.gold,
          }}
          initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {title.map((word, i) => (
            <span key={i} className="block">{word}</span>
          ))}
        </motion.h1>

        {/* Muscle dots row */}
        <motion.div
          className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-4"
          initial={shouldReduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {training.muscles?.map((m, i) => (
            <span key={m} className="flex items-center gap-2">
              <span className="font-body text-[12px] font-extrabold text-[#F4F2EC] uppercase tracking-[0.18em]">
                {m}
              </span>
              {i < training.muscles.length - 1 && (
                <span className="w-1 h-1 rounded-full" style={{ background: T.gold }} />
              )}
            </span>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="font-body text-[13px] text-white/55 mt-3 max-w-[60%] leading-snug"
          initial={shouldReduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Build strength, add size and improve {training.muscles?.[0]?.toLowerCase() || 'body'} power.
        </motion.p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stat Strip
// ─────────────────────────────────────────────
function StatStrip({ exerciseCount, minutes, level }) {
  const stats = [
    { icon: Dumbbell, value: exerciseCount, label: 'Exercises' },
    { icon: Clock, value: minutes, label: 'Minutes' },
    { icon: BarChart3, value: level, label: 'Level' },
  ];

  return (
    <motion.div
      className="mx-5 -mt-4 relative z-20 rounded-xl p-4 flex"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 10px 40px rgba(0,0,0,0.45)' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      {stats.map((s, i) => {
        const Icon = s.icon;
        const isString = typeof s.value === 'string';
        return (
          <div
            key={s.label}
            className="flex-1 min-w-0 flex items-center gap-2.5 px-1"
            style={{
              borderLeft: i > 0 ? `1px solid ${CARD_BORDER}` : 'none',
              paddingLeft: i > 0 ? 14 : 4,
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}
            >
              <Icon size={16} strokeWidth={T.stroke} style={{ color: T.textMid }} />
            </div>
            <div className="min-w-0">
              {isString ? (
                <p
                  className="font-body text-[12px] font-extrabold text-[#F4F2EC] uppercase leading-none truncate"
                  style={{ marginBottom: 4, letterSpacing: '0.02em' }}
                >
                  {s.value}
                </p>
              ) : (
                <p className="font-display text-[20px] text-[#F4F2EC] tabular-nums leading-none">
                  {s.value}
                </p>
              )}
              <p className="font-body text-[9px] font-extrabold text-white/40 uppercase tracking-wider mt-1">
                {s.label}
              </p>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Set Chip (read-only — prescribed set)
// ─────────────────────────────────────────────
function SetChip({ set, setIndex }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${CARD_BORDER}` }}
    >
      <span className="font-body text-[10px] font-extrabold tabular-nums" style={{ color: T.textFaint }}>
        {setIndex + 1}
      </span>
      <span className="font-body text-[12px] font-semibold tabular-nums whitespace-nowrap" style={{ color: 'rgba(244,242,236,0.6)' }}>
        {set.reps} reps
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Exercise Row Card (collapsible)
// ─────────────────────────────────────────────
function ExerciseRow({ exercise, exerciseIndex, shouldReduce, expanded, onToggle, delay }) {
  const muscle = primaryMuscleFor(exercise.name);
  const totalSets = exercise.sets?.length || 0;
  const reps = exercise.sets?.[0]?.reps || 0;
  const note = exercise.note || EXERCISE_NOTES[exercise.name];
  const indexLabel = String(exerciseIndex + 1).padStart(2, '0');

  return (
    <motion.div
      className="rounded-xl overflow-hidden"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      initial={shouldReduce ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.05 + 0.3, duration: 0.3 }}
    >
      {/* Header row — tap to expand */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3.5 p-3.5 text-left"
      >
        {/* Index — numeral-only treatment, no per-row icon */}
        <span
          className="font-display text-[40px] tabular-nums tracking-tight shrink-0 w-12 text-center leading-none"
          style={{ color: 'rgba(244,242,236,0.85)' }}
        >
          {indexLabel}
        </span>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p className="display-xs uppercase leading-tight truncate text-[#F4F2EC]">
            {exercise.name}
          </p>
          <p className="font-body text-[11px] text-white/35 mt-1 uppercase tracking-wider">
            {muscle}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-body text-[12px] font-extrabold tabular-nums" style={{ color: GOLD }}>
              {totalSets}
            </span>
            <span className="font-body text-[9px] font-bold text-white/45 uppercase tracking-wider">
              Sets
            </span>
            <span className="text-white/15">×</span>
            <span className="font-body text-[12px] font-extrabold tabular-nums" style={{ color: GOLD }}>
              {reps}
            </span>
            <span className="font-body text-[9px] font-bold text-white/45 uppercase tracking-wider">
              Reps
            </span>
          </div>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
        >
          <ChevronDown size={18} strokeWidth={T.stroke} className="text-white/35" />
        </motion.div>
      </button>

      {/* Set chips (expanded) — prescribed plan, read-only */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="sets"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="px-3.5 pb-3.5 pt-1"
              style={{ borderTop: `1px solid ${CARD_BORDER}` }}
            >
              <div className="pt-3 flex flex-wrap gap-2">
                {exercise.sets.map((set, si) => (
                  <SetChip key={si} set={set} setIndex={si} />
                ))}
              </div>

              {/* Trainer note */}
              {note && (
                <div
                  className="flex gap-2.5 mt-3 rounded-lg p-3"
                  style={{ background: T.goldTint, border: `1px solid ${T.goldBorder}` }}
                >
                  <MessageSquareText size={14} strokeWidth={T.stroke} style={{ color: GOLD }} className="shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-body text-[9px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: GOLD }}>
                      Biki's note
                    </p>
                    <p className="font-body text-[12px] leading-snug" style={{ color: T.textMid }}>
                      {note}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Mobility (rest day)
// ─────────────────────────────────────────────
function MobilityRow({ item, index, shouldReduce }) {
  const [checked, setChecked] = useState(false);

  return (
    <motion.button
      onClick={() => setChecked(!checked)}
      className="flex items-center gap-3 w-full py-3 group"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      initial={shouldReduce ? {} : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 + 0.2, duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
        style={{
          background: checked ? T.gold : 'transparent',
          border: `1.5px solid ${checked ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
        }}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Check size={12} strokeWidth={3} color="#000" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex-1 text-left">
        <span
          className="font-body text-[14px]"
          style={{ color: checked ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)' }}
        >
          {item.name}
        </span>
      </div>
      <span className="font-body text-[12px] text-white/30 tabular-nums shrink-0">
        {item.duration}
      </span>
    </motion.button>
  );
}

// ─────────────────────────────────────────────
// Main Train Screen
// ─────────────────────────────────────────────
export default function Train() {
  const { training } = useApp();

  const shouldReduce = useReducedMotion();
  const [expandedSet, setExpandedSet] = useState(() => new Set());
  const [monthOpen, setMonthOpen] = useState(false);

  const isRest = training.type === 'rest';
  const planPercentage = (PLAN_PROGRESS.currentDay / PLAN_PROGRESS.totalDays) * 100;

  const exerciseCount = training.exercises?.length || 0;
  const minutes = useMemo(() => estimateMinutes(training.exercises), [training.exercises]);
  const level = useMemo(() => estimateLevel(training.exercises), [training.exercises]);

  const allExpanded = expandedSet.size === exerciseCount && exerciseCount > 0;

  const toggleExpanded = (i) => {
    setExpandedSet(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSet(prev => {
      if (prev.size === exerciseCount) return new Set();
      return new Set(training.exercises.map((_, i) => i));
    });
  };

  // ── REST DAY ──
  if (isRest) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] pb-24">
        <div className="pt-4 pb-4">
          <WeekStrip mode="training" />
        </div>
        <HeroPhoto src={PHOTOS.restHero} height={300} heavy>
          <motion.h1
            className="font-display text-[38px] leading-tight text-[#F4F2EC] tracking-wider"
            initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            REST DAY
          </motion.h1>
          <motion.p
            className="font-body text-[13px] text-white/55 mt-1"
            initial={shouldReduce ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            Recovery is part of the plan
          </motion.p>
        </HeroPhoto>

        <div className="px-5 mt-5">
          <motion.div
            className="rounded-xl px-5 py-4 flex items-center gap-4"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: T.cobaltTint }}
            >
              <Moon size={22} strokeWidth={T.stroke} color={T.cobalt} />
            </div>
            <div>
              <span className="kicker">Sleep target</span>
              <div className="font-display text-[22px] text-[#F4F2EC] mt-0.5 tracking-wider">
                {training.recovery?.sleepTarget || '8+ HOURS'}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="px-5 mt-6">
          <motion.h2
            className="kicker mb-3"
            initial={shouldReduce ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            Mobility Work
          </motion.h2>
          <div className="rounded-xl px-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
            {training.recovery?.mobility?.map((item, i) => (
              <MobilityRow key={i} item={item} index={i} shouldReduce={shouldReduce} />
            ))}
          </div>
        </div>

        <div className="px-5 mt-6">
          <motion.p
            className="font-body text-[13px] text-white/35 text-center italic leading-relaxed"
            initial={shouldReduce ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            "{BIKI_MESSAGES.REST[0]}"
          </motion.p>
        </div>

        <MonthSheet isOpen={monthOpen} onClose={() => setMonthOpen(false)} mode="training" />
      </div>
    );
  }

  // ── TRAINING DAY ──
  return (
    <div className="min-h-screen bg-[#0B0B0C] pb-24">
      {/* Week at a glance — top of tab */}
      <div className="pt-4 pb-4">
        <WeekStrip mode="training" />
      </div>

      <WorkoutHero training={training} planPercentage={planPercentage} onCalendar={() => setMonthOpen(true)} />

      <StatStrip exerciseCount={exerciseCount} minutes={minutes} level={level} />

      {/* Today's Workout header */}
      <div className="px-5 mt-6 mb-3 flex items-center justify-between">
        <p className="kicker">Today's workout</p>
        <button
          onClick={expandAll}
          className="btn-ghost !py-0 text-[12px]"
        >
          {allExpanded ? 'Collapse All' : 'Expand All'}
          <motion.span
            animate={{ rotate: allExpanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="inline-flex"
          >
            <ChevronDown size={13} strokeWidth={T.stroke} />
          </motion.span>
        </button>
      </div>

      {/* Exercise rows */}
      <div className="px-5 flex flex-col gap-2.5">
        {training.exercises?.map((exercise, ei) => (
          <ExerciseRow
            key={ei}
            exercise={exercise}
            exerciseIndex={ei}
            shouldReduce={shouldReduce}
            expanded={expandedSet.has(ei)}
            onToggle={() => toggleExpanded(ei)}
            delay={ei}
          />
        ))}
      </div>

      <MonthSheet isOpen={monthOpen} onClose={() => setMonthOpen(false)} mode="training" />
    </div>
  );
}
