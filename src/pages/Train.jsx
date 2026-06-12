// ── Train Screen ──
// Full training session view with exercise cards, set tracking,
// session-complete takeover, and rest-day variant.

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Clock, Dumbbell, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HeroPhoto, PillChip, RingCounter, GoldMarquee, SplitCTA, NumericCounter } from '../components/ui/Components';
import { PLAN_PROGRESS, BIKI_MESSAGES, PHOTOS } from '../data/mockData';

// ── Set Pill (checkable) ──
function SetPill({ set, setIndex, exerciseIndex, toggleSet, shouldReduce }) {
  const isDone = set.done;
  const label = `${setIndex + 1} × ${set.reps} × ${set.load} kg`;

  return (
    <motion.button
      onClick={() => toggleSet(exerciseIndex, setIndex)}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors"
      style={{
        background: isDone ? 'rgba(212,167,78,0.1)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isDone ? 'rgba(212,167,78,0.3)' : 'rgba(255,255,255,0.08)'}`,
      }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {isDone && (
          <motion.div
            key="check"
            initial={shouldReduce ? {} : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 15,
              mass: 0.5,
            }}
          >
            <Check size={13} strokeWidth={2.5} color="#D4A74E" />
          </motion.div>
        )}
      </AnimatePresence>
      <span
        className="font-body text-[13px] tabular-nums whitespace-nowrap"
        style={{ color: isDone ? '#D4A74E' : 'rgba(255,255,255,0.4)' }}
      >
        {label}
      </span>
    </motion.button>
  );
}

// ── Exercise Card ──
function ExerciseCard({ exercise, exerciseIndex, toggleSet, shouldReduce, delay }) {
  return (
    <motion.div
      className="rounded-xl px-4 py-3"
      style={{
        background: '#121212',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
      initial={shouldReduce ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.06 + 0.15, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Exercise name */}
      <div className="flex items-center gap-2 mb-2.5">
        <Dumbbell size={15} strokeWidth={1.5} className="text-white/30 shrink-0" />
        <span className="font-body text-[15px] font-medium text-white/90">
          {exercise.name}
        </span>
      </div>

      {/* Set pills row */}
      <div className="flex flex-wrap gap-2">
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
    </motion.div>
  );
}

// ── Mobility Row (rest day) ──
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
      {/* Checkbox */}
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors"
        style={{
          background: checked ? 'linear-gradient(135deg, #B8893C, #E0C074)' : 'transparent',
          border: `1.5px solid ${checked ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
        }}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <Check size={12} strokeWidth={3} color="#000" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Label & duration */}
      <div className="flex-1 text-left">
        <span
          className="font-body text-[14px] transition-colors"
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

// ── Session Complete Takeover ──
function SessionCompleteTakeover({ training, doneSets, behaviorState, onDismiss, shouldReduce }) {
  // Calculate total volume from done sets
  const totalVolume = useMemo(() => {
    if (!training.exercises) return 0;
    return training.exercises.reduce((sum, ex) =>
      sum + ex.sets
        .filter(s => s.done)
        .reduce((acc, s) => acc + s.load * s.reps, 0)
    , 0);
  }, [training]);

  const marqueeText = `SESSION COMPLETE — ${training.name?.toUpperCase() || 'TRAINING'} —`;
  const bikiMessage = BIKI_MESSAGES[behaviorState]?.[0] || BIKI_MESSAGES.ON_TRACK[0];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background photo */}
      <div className="absolute inset-0">
        <img
          src={PHOTOS.sessionComplete}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'grayscale(100%) contrast(1.1) brightness(0.5)' }}
        />
        <div className="absolute inset-0 scrim-heavy" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 justify-center items-center px-5">
        {/* Marquee */}
        <GoldMarquee text={marqueeText} />

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-3 gap-6 mt-8 mb-8 w-full max-w-xs"
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {/* Duration */}
          <div className="flex flex-col items-center gap-1">
            <Clock size={18} strokeWidth={1.5} className="text-white/40 mb-1" />
            <NumericCounter value={45} className="text-[28px] font-bold text-white" />
            <span className="font-body text-[11px] text-white/40 uppercase tracking-wider">min</span>
          </div>

          {/* Sets */}
          <div className="flex flex-col items-center gap-1">
            <Dumbbell size={18} strokeWidth={1.5} className="text-white/40 mb-1" />
            <NumericCounter value={doneSets} className="text-[28px] font-bold text-white" />
            <span className="font-body text-[11px] text-white/40 uppercase tracking-wider">sets</span>
          </div>

          {/* Volume */}
          <div className="flex flex-col items-center gap-1">
            <div className="font-display text-[11px] font-bold text-white/40 uppercase mb-1 tracking-wider">vol</div>
            <NumericCounter value={totalVolume} className="text-[28px] font-bold text-white" duration={1.2} />
            <span className="font-body text-[11px] text-white/40 uppercase tracking-wider">kg</span>
          </div>
        </motion.div>

        {/* Biki message */}
        <motion.p
          className="font-body text-[14px] text-white/60 text-center max-w-[280px] leading-relaxed mb-10"
          initial={shouldReduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {bikiMessage}
        </motion.p>

        {/* CTA */}
        <motion.div
          className="w-full max-w-xs"
          initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <SplitCTA
            leftLabel="Done"
            rightLabel="Share"
            onLeft={onDismiss}
            onRight={() => {}}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main Train Screen ──
export default function Train() {
  const {
    training,
    toggleSet,
    sessionComplete,
    behaviorState,
    doneSets,
    totalSets,
  } = useApp();

  const shouldReduce = useReducedMotion();
  const [showTakeover, setShowTakeover] = useState(true);

  const isRest = training.type === 'rest';
  const planPercentage = (PLAN_PROGRESS.currentDay / PLAN_PROGRESS.totalDays) * 100;

  // ── REST DAY VARIANT ──
  if (isRest) {
    return (
      <div className="min-h-screen bg-black pb-24">
        {/* Rest Hero */}
        <HeroPhoto src={PHOTOS.restHero} height={300} heavy>
          <motion.h1
            className="font-display text-[38px] font-[800] leading-tight text-white"
            initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Rest Day
          </motion.h1>
          <motion.p
            className="font-body text-[14px] text-white/50 mt-1"
            initial={shouldReduce ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            Recovery is part of the plan
          </motion.p>
        </HeroPhoto>

        {/* Sleep target card */}
        <div className="px-5 mt-5">
          <motion.div
            className="rounded-xl px-5 py-4 flex items-center gap-4"
            style={{
              background: '#121212',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,167,78,0.1)' }}
            >
              <Moon size={22} strokeWidth={1.5} color="#D4A74E" />
            </div>
            <div>
              <span className="font-body text-[11px] text-white/40 uppercase tracking-wider">Sleep Target</span>
              <div className="font-display text-[24px] font-bold text-white mt-0.5">
                {training.recovery?.sleepTarget || '8+ hours'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobility checklist */}
        <div className="px-5 mt-6">
          <motion.h2
            className="font-display text-[13px] font-bold text-white/50 uppercase tracking-wider mb-3"
            initial={shouldReduce ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            Mobility Work
          </motion.h2>

          <div
            className="rounded-xl px-4"
            style={{
              background: '#121212',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {training.recovery?.mobility?.map((item, i) => (
              <MobilityRow
                key={i}
                item={item}
                index={i}
                shouldReduce={shouldReduce}
              />
            ))}
          </div>
        </div>

        {/* Biki rest message */}
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
      {/* Session Complete Takeover */}
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

      {/* Hero */}
      <HeroPhoto src={training.photo} height={300}>
        {/* Plan progress ring — top right */}
        <div className="absolute top-5 right-5">
          <RingCounter
            percentage={planPercentage}
            size={50}
            strokeWidth={2}
            delay={0.2}
          >
            <span className="font-display text-[10px] font-bold text-white/70 tabular-nums leading-none text-center">
              {PLAN_PROGRESS.currentDay}
              <span className="text-white/30">/{PLAN_PROGRESS.totalDays}</span>
            </span>
          </RingCounter>
        </div>

        {/* Session title */}
        <motion.h1
          className="font-display text-[38px] font-[800] leading-tight text-white"
          initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {training.name}
        </motion.h1>

        {/* Muscle group tags */}
        <div className="flex gap-2 mt-2">
          {training.muscles?.map((muscle, i) => (
            <PillChip key={muscle} delay={i + 2}>
              {muscle}
            </PillChip>
          ))}
        </div>
      </HeroPhoto>

      {/* Session progress bar */}
      <div className="px-5 mt-4 mb-1">
        <div className="flex items-center justify-between mb-2">
          <span className="font-body text-[11px] text-white/40 uppercase tracking-wider">
            Session Progress
          </span>
          <span className="font-display text-[13px] font-bold tabular-nums text-white/70">
            {doneSets}
            <span className="text-white/30"> / {totalSets}</span>
          </span>
        </div>
        <div
          className="w-full h-[3px] rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <motion.div
            className="h-full rounded-full bg-gold-gradient"
            initial={shouldReduce ? { width: `${(doneSets / totalSets) * 100}%` } : { width: '0%' }}
            animate={{ width: totalSets > 0 ? `${(doneSets / totalSets) * 100}%` : '0%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Exercise list */}
      <div className="px-5 mt-5 flex flex-col gap-3">
        {training.exercises?.map((exercise, ei) => (
          <ExerciseCard
            key={ei}
            exercise={exercise}
            exerciseIndex={ei}
            toggleSet={toggleSet}
            shouldReduce={shouldReduce}
            delay={ei}
          />
        ))}
      </div>
    </div>
  );
}
