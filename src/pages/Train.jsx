// ── Train Screen ──
// Editorial hero, stat strip, expandable exercise list with set tracking,
// session-complete takeover, and rest-day variant.

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check, Clock, Dumbbell, Moon, CalendarDays, ChevronDown, BarChart3,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  HeroPhoto, RingCounter, GoldMarquee, SplitCTA, NumericCounter,
} from '../components/ui/Components';
import { PLAN_PROGRESS, BIKI_MESSAGES, PHOTOS } from '../data/mockData';
import { T } from '../tokens';

// ── Aliases from the token sheet — no local values ──
const CARD_BG = T.surface;
const CARD_BORDER = T.hairline;
const GOLD = T.gold;
const GOLD_START = T.goldStart;
const GOLD_END = T.goldEnd;

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
function WorkoutHero({ training, planPercentage }) {
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
      {/* Gradient scrim — bottom-heavy, edge-fade on the title side */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.55) 70%, #000 100%)',
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
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
          style={{ border: `1px solid rgba(212,167,78,0.3)`, background: 'rgba(0,0,0,0.4)' }}
        >
          <CalendarDays size={14} strokeWidth={T.stroke} style={{ color: GOLD }} />
          <span className="font-body text-[11px] font-extrabold uppercase tracking-wider" style={{ color: GOLD }}>
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
            background: `linear-gradient(135deg, ${GOLD_END} 0%, ${GOLD} 45%, ${GOLD_START} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 4px 24px rgba(0,0,0,0.5)',
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
              <span className="font-body text-[12px] font-extrabold text-white uppercase tracking-[0.18em]">
                {m}
              </span>
              {i < training.muscles.length - 1 && (
                <span className="w-1 h-1 rounded-full" style={{ background: GOLD }} />
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
      className="mx-5 -mt-4 relative z-20 rounded-2xl p-4 flex"
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
            className="flex-1 flex items-center gap-2.5 px-1"
            style={{
              borderLeft: i > 0 ? `1px solid ${CARD_BORDER}` : 'none',
              paddingLeft: i > 0 ? 14 : 4,
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,167,78,0.12)', border: `1px solid rgba(212,167,78,0.22)` }}
            >
              <Icon size={16} strokeWidth={T.stroke} style={{ color: GOLD }} />
            </div>
            <div className="min-w-0">
              {isString ? (
                <p
                  className="font-body text-[13px] font-extrabold text-white uppercase tracking-wider leading-none truncate"
                  style={{ marginBottom: 4 }}
                >
                  {s.value}
                </p>
              ) : (
                <p className="font-display text-[20px] text-white tabular-nums leading-none">
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
// Set Pill (inside expanded card)
// ─────────────────────────────────────────────
function SetPill({ set, setIndex, exerciseIndex, toggleSet, shouldReduce }) {
  const isDone = set.done;
  return (
    <motion.button
      onClick={() => toggleSet(exerciseIndex, setIndex)}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
      style={{
        background: isDone ? 'rgba(212,167,78,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isDone ? 'rgba(212,167,78,0.35)' : CARD_BORDER}`,
      }}
    >
      <AnimatePresence mode="wait">
        {isDone && (
          <motion.div
            key="check"
            initial={shouldReduce ? {} : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15, mass: 0.5 }}
          >
            <Check size={13} strokeWidth={2.5} color={GOLD} />
          </motion.div>
        )}
      </AnimatePresence>
      <span
        className="font-body text-[12px] tabular-nums whitespace-nowrap"
        style={{ color: isDone ? GOLD : 'rgba(255,255,255,0.5)' }}
      >
        {setIndex + 1} × {set.reps} × {set.load}kg
      </span>
    </motion.button>
  );
}

// ─────────────────────────────────────────────
// Exercise Row Card (collapsible)
// ─────────────────────────────────────────────
function ExerciseRow({ exercise, exerciseIndex, toggleSet, shouldReduce, expanded, onToggle, delay }) {
  const muscle = primaryMuscleFor(exercise.name);
  const totalSets = exercise.sets?.length || 0;
  const doneSets = exercise.sets?.filter(s => s.done).length || 0;
  // Most common rep count across sets
  const reps = exercise.sets?.[0]?.reps || 0;
  const allComplete = totalSets > 0 && doneSets === totalSets;
  const indexLabel = String(exerciseIndex + 1).padStart(2, '0');

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{
        background: CARD_BG,
        border: `1px solid ${allComplete ? 'rgba(212,167,78,0.25)' : CARD_BORDER}`,
      }}
      initial={shouldReduce ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.05 + 0.3, duration: 0.3 }}
    >
      {/* Header row — tap to expand */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3.5 text-left"
      >
        {/* Index */}
        <span
          className="font-display text-[22px] tabular-nums tracking-tight shrink-0 w-9 text-center"
          style={{ color: allComplete ? GOLD : 'rgba(255,255,255,0.35)' }}
        >
          {indexLabel}
        </span>

        {/* Muscle badge */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 relative"
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: `1px solid ${allComplete ? 'rgba(212,167,78,0.35)' : CARD_BORDER}`,
          }}
        >
          <Dumbbell
            size={18}
            strokeWidth={T.stroke}
            style={{ color: allComplete ? GOLD : 'rgba(255,255,255,0.55)' }}
          />
          {allComplete && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: GOLD, border: `2px solid ${CARD_BG}` }}
            >
              <Check size={9} strokeWidth={3} color="#000" />
            </div>
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p
            className="display-xs uppercase leading-tight truncate"
            style={{ color: allComplete ? 'rgba(255,255,255,0.65)' : '#fff' }}
          >
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
            {doneSets > 0 && doneSets < totalSets && (
              <span className="font-body text-[10px] font-semibold text-white/35 tabular-nums ml-1">
                · {doneSets}/{totalSets} done
              </span>
            )}
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

      {/* Set pills (expanded) */}
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
                  <SetPill
                    key={si}
                    set={set}
                    setIndex={si}
                    exerciseIndex={exerciseIndex}
                    toggleSet={toggleSet}
                    shouldReduce={shouldReduce}
                  />
                ))}
              </div>
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
          background: checked ? `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` : 'transparent',
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
// Session Complete Takeover
// ─────────────────────────────────────────────
function SessionCompleteTakeover({ training, doneSets, behaviorState, onDismiss, shouldReduce }) {
  const totalVolume = useMemo(() => {
    if (!training.exercises) return 0;
    return training.exercises.reduce((sum, ex) =>
      sum + ex.sets.filter(s => s.done).reduce((acc, s) => acc + s.load * s.reps, 0)
    , 0);
  }, [training]);

  const marqueeText = `SESSION COMPLETE — ${training.name?.toUpperCase() || 'TRAINING'} —`;
  const bikiMessage = BIKI_MESSAGES[behaviorState]?.[0] || BIKI_MESSAGES.ON_TRACK[0];
  const minutes = estimateMinutes(training.exercises);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0">
        <img
          src={PHOTOS.sessionComplete}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'grayscale(100%) contrast(1.1) brightness(0.5)' }}
        />
        <div className="absolute inset-0 scrim-heavy" />
      </div>
      <div className="relative z-10 flex flex-col flex-1 justify-center items-center px-5">
        <GoldMarquee text={marqueeText} />
        <motion.div
          className="grid grid-cols-3 gap-6 mt-8 mb-8 w-full max-w-xs"
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex flex-col items-center gap-1">
            <Clock size={18} strokeWidth={T.stroke} className="text-white/40 mb-1" />
            <NumericCounter value={minutes} className="text-[28px] font-bold text-white" />
            <span className="font-body text-[11px] text-white/40 uppercase tracking-wider">min</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Dumbbell size={18} strokeWidth={T.stroke} className="text-white/40 mb-1" />
            <NumericCounter value={doneSets} className="text-[28px] font-bold text-white" />
            <span className="font-body text-[11px] text-white/40 uppercase tracking-wider">sets</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="font-body text-[11px] font-extrabold text-white/40 uppercase mb-1 tracking-wider">vol</div>
            <NumericCounter value={totalVolume} className="text-[28px] font-bold text-white" duration={1.2} />
            <span className="font-body text-[11px] text-white/40 uppercase tracking-wider">kg</span>
          </div>
        </motion.div>
        <motion.p
          className="font-body text-[14px] text-white/60 text-center max-w-[280px] leading-relaxed mb-10"
          initial={shouldReduce ? {} : { opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {bikiMessage}
        </motion.p>
        <motion.div
          className="w-full max-w-xs"
          initial={shouldReduce ? {} : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <SplitCTA leftLabel="Done" rightLabel="Share" onLeft={onDismiss} onRight={() => {}} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Main Train Screen
// ─────────────────────────────────────────────
export default function Train() {
  const {
    training, toggleSet, sessionComplete, behaviorState, doneSets, totalSets,
  } = useApp();

  const shouldReduce = useReducedMotion();
  const [showTakeover, setShowTakeover] = useState(true);
  const [expandedSet, setExpandedSet] = useState(() => new Set());

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
      <div className="min-h-screen bg-black pb-24">
        <HeroPhoto src={PHOTOS.restHero} height={300} heavy>
          <motion.h1
            className="font-display text-[38px] leading-tight text-white tracking-wider"
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
            className="rounded-2xl px-5 py-4 flex items-center gap-4"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,167,78,0.1)' }}
            >
              <Moon size={22} strokeWidth={T.stroke} color={GOLD} />
            </div>
            <div>
              <span className="kicker">Sleep target</span>
              <div className="font-display text-[22px] text-white mt-0.5 tracking-wider">
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
          <div className="rounded-2xl px-4" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
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
      </div>
    );
  }

  // ── TRAINING DAY ──
  return (
    <div className="min-h-screen bg-black pb-24">
      <AnimatePresence>
        {sessionComplete && showTakeover && (
          <SessionCompleteTakeover
            training={training}
            doneSets={doneSets}
            behaviorState={behaviorState}
            onDismiss={() => setShowTakeover(false)}
            shouldReduce={shouldReduce}
          />
        )}
      </AnimatePresence>

      <WorkoutHero training={training} planPercentage={planPercentage} />

      <StatStrip exerciseCount={exerciseCount} minutes={minutes} level={level} />

      {/* Session progress (slim) */}
      <div className="px-5 mt-5 mb-1">
        <div className="flex items-center justify-between mb-2">
          <span className="kicker">Session progress</span>
          <span className="font-body text-[12px] font-bold tabular-nums text-white/70">
            {doneSets}
            <span className="text-white/30"> / {totalSets}</span>
          </span>
        </div>
        <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${GOLD_START}, ${GOLD_END})` }}
            initial={shouldReduce ? { width: `${(doneSets / totalSets) * 100}%` } : { width: '0%' }}
            animate={{ width: totalSets > 0 ? `${(doneSets / totalSets) * 100}%` : '0%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Today's Workout header */}
      <div className="px-5 mt-5 mb-3 flex items-center justify-between">
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
            toggleSet={toggleSet}
            shouldReduce={shouldReduce}
            expanded={expandedSet.has(ei)}
            onToggle={() => toggleExpanded(ei)}
            delay={ei}
          />
        ))}
      </div>
    </div>
  );
}
