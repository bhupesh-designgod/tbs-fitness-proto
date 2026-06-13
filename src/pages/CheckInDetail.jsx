// ── Check-in Detail / Week Review Screen ──
// Coach summary, photo compare, 2-col submitted data grid,
// plan changes, message Biki CTA.

import { useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft, MoreHorizontal, ArrowUp, ArrowDown,
  MessageCircle, Scale, Beef, Dumbbell, Footprints, Ruler, Zap, Check,
} from 'lucide-react';
import { CHECK_IN_HISTORY, PHOTOS } from '../data/mockData';
import { T } from '../tokens';

// ── Aliases from the token sheet — no local values ──
const CARD_BG = T.surface;
const CARD_BORDER = T.hairline;
const GOLD = T.volt;
const GOLD_START = T.goldStart;
const GOLD_END = T.goldEnd;
const ON_TRACK = T.success;
const RED = T.danger;

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
        <h1 className="display-xs text-[#F4F2EC] uppercase truncate">
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
        <MoreHorizontal size={18} strokeWidth={T.stroke} className="text-white/70" />
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
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
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
        <p className="kicker kicker-gold mb-2">Coach summary</p>
        <p className="font-body text-[13px] text-white/85 leading-relaxed whitespace-pre-line max-w-[62%]">
          {summary}
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Submitted Data 2-column grid
// ─────────────────────────────────────────────
const METRIC_ICONS = {
  weight:  { icon: Scale,      tint: T.cobalt },
  protein: { icon: Beef,       tint: T.volt },
  workout: { icon: Dumbbell,   tint: T.red },
  steps:   { icon: Footprints, tint: T.textMid },
  waist:   { icon: Ruler,      tint: T.cobalt },
  energy:  { icon: Zap,        tint: T.gold },
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
          <Icon size={14} strokeWidth={T.stroke} style={{ color: meta.tint }} />
        </div>
        <p className="font-body text-[10px] font-extrabold text-white/45 uppercase tracking-wider leading-tight">
          {m.label}
        </p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-[26px] text-[#F4F2EC] tabular-nums leading-none">
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
              className="font-body text-[13px] font-extrabold tabular-nums"
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
      <p className="kicker mb-3">Submitted data</p>
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
      <p className="kicker mb-3">Plan changes</p>
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
              style={{ background: 'rgba(215,255,62,0.12)', border: '1.5px solid rgba(215,255,62,0.45)' }}
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
      <p className="display-xs text-white/55 uppercase mb-2">
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

  const hasFullData = !!checkIn.submittedData;
  const subtitle = checkIn.reviewedOn ? `Reviewed on ${checkIn.reviewedOn}` : null;

  return (
    <div className="min-h-screen pb-32" style={{ background: T.bg }}>
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
          whileTap={T.tap}
          onClick={onMessageBiki}
          className="btn-primary"
        >
          <MessageCircle size={16} strokeWidth={2} />
          Message Biki
        </motion.button>
      </div>
    </div>
  );
}
