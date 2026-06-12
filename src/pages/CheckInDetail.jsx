// ── Check-in Detail Screen ──
// Overview / Metrics / Answers / Plan tabs, photo compare,
// metrics summary, Biki review, changes for next week.

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft, MoreHorizontal, ArrowUp, ArrowDown, Download,
  MessageCircle, Scale, Beef, Dumbbell, Ruler, Check, Quote,
} from 'lucide-react';
import { CHECK_IN_HISTORY, PHOTOS, LAST_CHECK_IN } from '../data/mockData';

// ── Tokens ──
const CARD_BG = '#131318';
const CARD_BORDER = 'rgba(255,255,255,0.07)';
const GOLD = '#D4A74E';
const GOLD_START = '#B8893C';
const GOLD_END = '#E0C074';
const ON_TRACK = '#4ADE80';
const RED = '#F87171';

// ─────────────────────────────────────────────
// Sub-tabs
// ─────────────────────────────────────────────
function DetailTabs({ active, onChange }) {
  const tabs = ['Overview', 'Metrics', 'Answers', 'Plan'];
  return (
    <div className="px-5 mb-4 flex">
      {tabs.map(t => {
        const k = t.toLowerCase();
        const isActive = active === k;
        return (
          <button
            key={t}
            onClick={() => onChange(k)}
            className="flex-1 py-2 relative"
          >
            <span
              className="font-display text-[12px] uppercase tracking-wider"
              style={{ color: isActive ? GOLD : 'rgba(255,255,255,0.4)' }}
            >
              {t}
            </span>
            {isActive && (
              <motion.div
                layoutId="detail-tab-underline"
                className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[2px] w-8 rounded-full"
                style={{ background: GOLD }}
              />
            )}
          </button>
        );
      })}
    </div>
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

      <div className="relative mt-3 rounded-xl overflow-hidden" style={{ aspectRatio: '16 / 11', background: '#0A0A0A' }}>
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
          style={{ background: 'rgba(255,255,255,0.6)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2L2 7l3 5M9 2l3 5-3 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
// Metrics summary list
// ─────────────────────────────────────────────
function MetricsSummary({ metrics }) {
  const items = [
    { key: 'weight',  icon: Scale,    label: 'Weight',             tint: '#5B9DD9' },
    { key: 'protein', icon: Beef,     label: 'Protein Adherence',  tint: '#E07B7B' },
    { key: 'workout', icon: Dumbbell, label: 'Workout Compliance', tint: GOLD },
    { key: 'waist',   icon: Ruler,    label: 'Waist',              tint: '#7BA7C9' },
  ];

  return (
    <div className="mx-5 mb-5">
      <p className="font-display text-[12px] text-white/40 uppercase tracking-[0.2em] mb-3">
        Metrics Summary
      </p>
      <div className="space-y-2">
        {items.map(it => {
          const m = metrics?.[it.key];
          if (!m) return null;
          const delta = m.value - m.prev;
          const isGood = (m.goodDir === 'up' && delta > 0) || (m.goodDir === 'down' && delta < 0);
          const Icon = it.icon;
          const formatV = v => Number.isInteger(v) ? v : v.toFixed(1);
          return (
            <div
              key={it.key}
              className="rounded-2xl p-3.5 flex items-center gap-3"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${it.tint}1F`, border: `1px solid ${it.tint}44` }}
              >
                <Icon size={18} strokeWidth={1.5} style={{ color: it.tint }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-[13px] text-white uppercase tracking-wider leading-tight">
                  {it.label}
                </p>
                <p className="font-body text-[12px] text-white/45 mt-0.5 tabular-nums">
                  {formatV(m.prev)} {m.unit} <span className="text-white/30">→</span> {formatV(m.value)} {m.unit}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {delta > 0
                  ? <ArrowUp   size={13} strokeWidth={2} style={{ color: isGood ? ON_TRACK : RED }} />
                  : <ArrowDown size={13} strokeWidth={2} style={{ color: isGood ? ON_TRACK : RED }} />}
                <span
                  className="font-display text-[13px] tabular-nums"
                  style={{ color: isGood ? ON_TRACK : RED }}
                >
                  {Math.abs(delta).toFixed(delta % 1 === 0 ? 0 : 1)} {m.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Biki's Review
// ─────────────────────────────────────────────
function BikiReview({ review }) {
  return (
    <div className="mx-5 mb-5">
      <p className="font-display text-[12px] text-white/40 uppercase tracking-[0.2em] mb-3">
        Biki's Review
      </p>
      <div
        className="rounded-2xl p-4 relative overflow-hidden flex gap-3"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      >
        <Quote size={18} strokeWidth={1.5} className="shrink-0 mt-0.5" style={{ color: GOLD }} />
        <div className="flex-1 min-w-0">
          <p className="font-body text-[13px] text-white/80 leading-relaxed whitespace-pre-line">
            {review}
          </p>
        </div>
        <div
          className="shrink-0 w-12 h-12 rounded-full overflow-hidden self-end"
          style={{ border: '1.5px solid rgba(212,167,78,0.3)' }}
        >
          <img
            src={PHOTOS.bikiPortrait}
            alt="Biki"
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(20%) contrast(1.05)' }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Changes list
// ─────────────────────────────────────────────
function ChangesList({ changes }) {
  return (
    <div className="mx-5 mb-5">
      <p className="font-display text-[12px] text-white/40 uppercase tracking-[0.2em] mb-3">
        Changes For Next Week
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
// Check-in Details (submitted at)
// ─────────────────────────────────────────────
function CheckInDetails({ submittedAt }) {
  return (
    <div className="mx-5 mb-5">
      <p className="font-display text-[12px] text-white/40 uppercase tracking-[0.2em] mb-3">
        Check-in Details
      </p>
      <div
        className="rounded-2xl p-4 flex items-center justify-between"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      >
        <span className="font-body text-[12px] text-white/45">Submitted on</span>
        <span className="font-display text-[12px] text-white/85 tabular-nums uppercase tracking-wider">
          {submittedAt}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Answers tab — re-use LAST_CHECK_IN.feel ratings
// ─────────────────────────────────────────────
function AnswersView() {
  const feel = LAST_CHECK_IN.feel || {};
  const dims = [
    { key: 'energy', label: 'Energy' },
    { key: 'hunger', label: 'Hunger' },
    { key: 'sleep',  label: 'Sleep' },
    { key: 'stress', label: 'Stress' },
  ];

  return (
    <div className="px-5 mb-5">
      <p className="font-display text-[12px] text-white/40 uppercase tracking-[0.2em] mb-3">
        Self-report
      </p>
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      >
        {dims.map(d => (
          <div key={d.key} className="flex items-center justify-between">
            <span className="font-body text-[13px] text-white/75">{d.label}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => {
                const filled = n <= (feel[d.key] || 0);
                return (
                  <div
                    key={n}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: filled ? GOLD : 'rgba(255,255,255,0.1)' }}
                  />
                );
              })}
            </div>
          </div>
        ))}
        {LAST_CHECK_IN.note && (
          <div className="pt-3" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
            <p className="font-display text-[10px] text-white/35 uppercase tracking-wider mb-1.5">
              Note
            </p>
            <p className="font-body text-[12px] text-white/70 italic">
              "{LAST_CHECK_IN.note}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Plan tab — same changes list
// ─────────────────────────────────────────────
function PlanView({ changes }) {
  return <ChangesList changes={changes} />;
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
export default function CheckInDetail({ checkInId, onBack }) {
  const shouldReduce = useReducedMotion();
  const checkIn = useMemo(
    () => CHECK_IN_HISTORY.find(c => c.id === checkInId) || CHECK_IN_HISTORY[0],
    [checkInId]
  );

  const [tab, setTab] = useState('overview');
  const [angle, setAngle] = useState('front');

  const reviewed = checkIn.status === 'reviewed';
  const hasFullData = !!checkIn.metrics;

  return (
    <div className="min-h-screen pb-32" style={{ background: '#000' }}>
      {/* Top bar */}
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
            {checkIn.label} Check-in
          </h1>
          {reviewed && (
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span
                className="w-3 h-3 rounded-full flex items-center justify-center"
                style={{ background: ON_TRACK }}
              >
                <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                  <path d="M1 3.5L2.5 5L6 1.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-body text-[11px]" style={{ color: ON_TRACK }}>
                Reviewed by Biki
              </span>
              <span className="text-white/25">|</span>
              <span className="font-body text-[11px] text-white/45">
                on {checkIn.reviewedOn}
              </span>
            </div>
          )}
        </div>
        <button
          aria-label="More"
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        >
          <MoreHorizontal size={18} strokeWidth={1.5} className="text-white/70" />
        </button>
      </motion.div>

      <DetailTabs active={tab} onChange={setTab} />

      <AnimatePresence mode="wait">
        {tab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {hasFullData ? (
              <>
                <PhotoCompare checkIn={checkIn} angle={angle} onAngleChange={setAngle} />
                <MetricsSummary metrics={checkIn.metrics} />
                <BikiReview review={checkIn.bikiReview} />
                <ChangesList changes={checkIn.changes} />
                <CheckInDetails submittedAt={checkIn.submittedAt} />
              </>
            ) : (
              <EmptyState label={checkIn.label} />
            )}
          </motion.div>
        )}

        {tab === 'metrics' && (
          <motion.div
            key="metrics"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {hasFullData
              ? <MetricsSummary metrics={checkIn.metrics} />
              : <EmptyState label={checkIn.label} />}
          </motion.div>
        )}

        {tab === 'answers' && (
          <motion.div
            key="answers"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AnswersView />
          </motion.div>
        )}

        {tab === 'plan' && (
          <motion.div
            key="plan"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {hasFullData
              ? <PlanView changes={checkIn.changes} />
              : <EmptyState label={checkIn.label} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-5 pt-3 mx-auto" style={{ maxWidth: 430, background: 'linear-gradient(to top, #000 60%, transparent)' }}>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-3.5 rounded-2xl font-display text-[13px] uppercase tracking-wider text-black flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` }}
          >
            <MessageCircle size={15} strokeWidth={2} />
            Share with Coach
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            aria-label="Download"
            className="shrink-0 w-14 rounded-2xl flex items-center justify-center"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            <Download size={18} strokeWidth={1.5} className="text-white/65" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="font-display text-[14px] text-white/55 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="font-body text-[12px] text-white/35">
        Detailed metrics aren't recorded for this week yet.
      </p>
    </div>
  );
}
