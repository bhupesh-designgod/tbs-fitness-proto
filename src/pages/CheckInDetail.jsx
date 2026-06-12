// ── Check-in Detail / Week Review Screen ──
// Coach summary, photo compare, 2-col submitted data grid,
// plan changes, message Biki CTA.

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft, MoreHorizontal, ArrowUp, ArrowDown,
  MessageCircle, Scale, Beef, Dumbbell, Footprints, Ruler, Zap, Check,
} from 'lucide-react';
import { CHECK_IN_HISTORY, PHOTOS } from '../data/mockData';

// ── Tokens ──
const CARD_BG = '#131318';
const CARD_BORDER = 'rgba(255,255,255,0.07)';
const GOLD = '#D4A74E';
const GOLD_START = '#B8893C';
const GOLD_END = '#E0C074';
const ON_TRACK = '#4ADE80';
const RED = '#F87171';

// ─────────────────────────────────────────────
// Top bar
// ─────────────────────────────────────────────
function TopBar({ title, subtitle, onBack }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className="px-5 pt-4 pb-3 flex items-center gap-3"
      initial={shouldReduce ? {} : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={onBack}
        aria-label="Back"
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
      >
        <ArrowLeft size={18} strokeWidth={1.75} className="text-white/80" />
      </button>
      <div className="flex-1 text-center min-w-0">
        <h1 className="font-display text-[14px] text-white uppercase tracking-[0.2em] truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="font-body text-[11px] text-white/45 mt-1">{subtitle}</p>
        )}
      </div>
      <button
        aria-label="More"
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
      >
        <MoreHorizontal size={18} strokeWidth={1.5} className="text-white/70" />
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Coach Summary card
// ─────────────────────────────────────────────
function CoachSummaryCard({ summary }) {
  if (!summary) return null;
  return (
    <motion.div
      className="mx-5 mb-5 rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(212,167,78,0.08), rgba(212,167,78,0.02))',
        border: '1px solid rgba(212,167,78,0.3)',
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Biki photo faded right */}
      <div className="absolute top-0 right-0 bottom-0 w-[40%] pointer-events-none">
        <img
          src={PHOTOS.bikiPortrait}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ filter: 'grayscale(15%) contrast(1.05)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.45) 60%, transparent 100%)',
          }}
        />
      </div>
      <div className="relative">
        <p className="font-display text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: GOLD }}>
          Coach Summary
        </p>
        <p className="font-body text-[13px] text-white/85 leading-relaxed whitespace-pre-line max-w-[62%]">
          {summary}
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Angle toggle
// ─────────────────────────────────────────────
function AngleToggle({ active, onChange }) {
  const angles = ['front', 'side', 'back'];
  return (
    <div
      className="rounded-xl p-1 flex"
      style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${CARD_BORDER}` }}
    >
      {angles.map(a => {
        const isActive = active === a;
        return (
          <motion.button
            key={a}
            onClick={() => onChange(a)}
            whileTap={{ scale: 0.96 }}
            className="flex-1 py-2 rounded-lg font-display text-[11px] uppercase tracking-wider"
            style={{
              background: isActive ? `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` : 'transparent',
              color: isActive ? '#000' : 'rgba(255,255,255,0.5)',
            }}
          >
            {a.charAt(0).toUpperCase() + a.slice(1)}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Photo compare
// ─────────────────────────────────────────────
function PhotoCompare({ checkIn, angle, onAngleChange }) {
  const left = checkIn.photosBaseline?.[angle];
  const right = checkIn.photos?.[angle];
  return (
    <div className="mx-5 mb-5">
      <p className="font-display text-[12px] text-white/40 uppercase tracking-[0.2em] mb-3">
        Photos Comparison
      </p>
      <AngleToggle active={angle} onChange={onAngleChange} />

      <div
        className="relative mt-3 rounded-xl overflow-hidden"
        style={{ aspectRatio: '4 / 3', background: '#0A0A0A' }}
      >
        <img
          src={left}
          alt={checkIn.baselineLabel}
          className="absolute top-0 left-0 w-1/2 h-full object-cover"
          style={{ filter: 'grayscale(30%) contrast(1.05) brightness(0.85)' }}
          loading="lazy"
        />
        <img
          src={right}
          alt={checkIn.label}
          className="absolute top-0 right-0 w-1/2 h-full object-cover"
          style={{ filter: 'contrast(1.05)' }}
          loading="lazy"
        />
        <div
          className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px"
          style={{ background: 'rgba(212,167,78,0.55)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', border: `1px solid ${GOLD}88` }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2L2 7l3 5M9 2l3 5-3 5" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="absolute top-2 left-2">
          <p className="font-display text-[11px] text-white/85 uppercase tracking-wider leading-none">
            {checkIn.baselineLabel}
          </p>
          <p className="font-body text-[10px] text-white/55 mt-0.5">
            {checkIn.baselineDateLabel}
          </p>
        </div>
        <div className="absolute top-2 right-2 text-right">
          <p className="font-display text-[11px] text-white/85 uppercase tracking-wider leading-none">
            {checkIn.label}
          </p>
          <p className="font-body text-[10px] text-white/55 mt-0.5">
            {checkIn.dateLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Submitted Data 2-column grid
// ─────────────────────────────────────────────
const METRIC_ICONS = {
  weight:  { icon: Scale,      tint: '#5B9DD9' },
  protein: { icon: Beef,       tint: '#B57DD9' },
  workout: { icon: Dumbbell,   tint: '#FF8855' },
  steps:   { icon: Footprints, tint: '#4ADE80' },
  waist:   { icon: Ruler,      tint: '#7BA7C9' },
  energy:  { icon: Zap,        tint: GOLD },
};

function formatNumber(v) {
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return v.toLocaleString();
    return v.toFixed(1);
  }
  return v;
}
function formatDelta(d) {
  const abs = Math.abs(d);
  return abs.toLocaleString();
}

function MetricGridCard({ k, m }) {
  const meta = METRIC_ICONS[k] || { icon: Scale, tint: GOLD };
  const Icon = meta.icon;
  const hasDelta = !m.noDelta && typeof m.delta === 'number' && m.delta !== 0;
  const isGood = hasDelta && (
    (m.goodDir === 'up' && m.delta > 0) ||
    (m.goodDir === 'down' && m.delta < 0)
  );

  return (
    <div
      className="rounded-2xl p-3.5"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${meta.tint}1F`, border: `1px solid ${meta.tint}3D` }}
        >
          <Icon size={14} strokeWidth={1.6} style={{ color: meta.tint }} />
        </div>
        <p className="font-display text-[10px] text-white/45 uppercase tracking-wider leading-tight">
          {m.label}
        </p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-[26px] text-white tabular-nums leading-none">
          {formatNumber(m.value)}
        </span>
        {m.unit && (
          <span className="font-body text-[11px] text-white/35">{m.unit}</span>
        )}
      </div>
      <div className="mt-2">
        {hasDelta ? (
          <div className="flex items-center gap-1">
            {m.delta > 0
              ? <ArrowUp   size={11} strokeWidth={2.5} style={{ color: isGood ? ON_TRACK : RED }} />
              : <ArrowDown size={11} strokeWidth={2.5} style={{ color: isGood ? ON_TRACK : RED }} />}
            <span
              className="font-display text-[13px] tabular-nums"
              style={{ color: isGood ? ON_TRACK : RED }}
            >
              {formatDelta(m.delta)}{m.unit}
            </span>
          </div>
        ) : (
          <span className="font-body text-[12px] text-white/30">—</span>
        )}
        <p className="font-body text-[10px] text-white/30 mt-0.5">vs last week</p>
      </div>
    </div>
  );
}

function SubmittedData({ data }) {
  if (!data) return null;
  const keys = Object.keys(data);
  return (
    <div className="mx-5 mb-5">
      <p className="font-display text-[12px] text-white/40 uppercase tracking-[0.2em] mb-3">
        Submitted Data
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {keys.map(k => <MetricGridCard key={k} k={k} m={data[k]} />)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Plan Changes
// ─────────────────────────────────────────────
function PlanChanges({ changes }) {
  if (!changes?.length) return null;
  return (
    <div className="mx-5 mb-5">
      <p className="font-display text-[12px] text-white/40 uppercase tracking-[0.2em] mb-3">
        Plan Changes
      </p>
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      >
        {changes.map((c, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 + 0.1 }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: 'rgba(212,167,78,0.12)', border: '1.5px solid rgba(212,167,78,0.45)' }}
            >
              <Check size={11} strokeWidth={2.5} style={{ color: GOLD }} />
            </div>
            <p className="font-body text-[13px] text-white/75 leading-snug">
              {c}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────
function EmptyState({ label }) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="font-display text-[14px] text-white/55 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="font-body text-[12px] text-white/35">
        Detailed review for this week isn't recorded yet.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
export default function CheckInDetail({ checkInId, onBack, onMessageBiki }) {
  const checkIn = useMemo(
    () => CHECK_IN_HISTORY.find(c => c.id === checkInId) || CHECK_IN_HISTORY[0],
    [checkInId]
  );
  const [angle, setAngle] = useState('front');

  const hasFullData = !!checkIn.submittedData;
  const subtitle = checkIn.reviewedOn ? `Reviewed on ${checkIn.reviewedOn}` : null;

  return (
    <div className="min-h-screen pb-32" style={{ background: '#000' }}>
      <TopBar
        title={`${checkIn.label} Review`}
        subtitle={subtitle}
        onBack={onBack}
      />

      {hasFullData ? (
        <AnimatePresence>
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CoachSummaryCard summary={checkIn.coachSummary} />
            <PhotoCompare checkIn={checkIn} angle={angle} onAngleChange={setAngle} />
            <SubmittedData data={checkIn.submittedData} />
            <PlanChanges changes={checkIn.planChanges} />
          </motion.div>
        </AnimatePresence>
      ) : (
        <EmptyState label={checkIn.label} />
      )}

      {/* Fixed bottom action — Message Biki */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-5 pt-3 mx-auto"
        style={{ maxWidth: 430, background: 'linear-gradient(to top, #000 60%, transparent)' }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onMessageBiki}
          className="w-full py-3.5 rounded-2xl font-display text-[14px] uppercase tracking-wider text-black flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` }}
        >
          <MessageCircle size={16} strokeWidth={2} />
          Message Biki
        </motion.button>
      </div>
    </div>
  );
}
