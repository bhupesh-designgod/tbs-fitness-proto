// ── Reviews Screen ──
// Latest weekly review, conditional next-check-in card (≤3 days),
// review-history list. (Internal tab id remains "progress".)

import { motion, useReducedMotion } from 'framer-motion';
import {
  Bell, ChevronRight, ArrowRight, ArrowUp, ArrowDown,
  CalendarDays, Quote,
} from 'lucide-react';
import { CHECK_IN_HISTORY, NEXT_CHECKIN, PHOTOS } from '../data/mockData';

// ── Tokens ──
const CARD_BG = '#131318';
const CARD_BORDER = 'rgba(255,255,255,0.07)';
const GOLD = '#D4A74E';
const GOLD_START = '#B8893C';
const GOLD_END = '#E0C074';
const ON_TRACK = '#4ADE80';
const RED = '#F87171';

const DAY = 86_400_000;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function daysUntil(isoDate) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const a = new Date(todayKey + 'T00:00:00Z').getTime();
  const b = new Date(isoDate + 'T00:00:00Z').getTime();
  return Math.round((b - a) / DAY);
}

// ─────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────
function ReviewsHeader() {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className="px-5 pt-5 pb-4 flex items-start justify-between"
      initial={shouldReduce ? {} : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h1 className="font-display text-[32px] text-white leading-none tracking-wider">
          REVIEWS
        </h1>
        <p className="font-body text-[12px] text-white/40 mt-2">
          Your weekly check-ins reviewed by Biki.
        </p>
      </div>
      <button
        aria-label="Notifications"
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <Bell size={18} strokeWidth={1.5} className="text-white/55" />
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Latest Review hero
// ─────────────────────────────────────────────
function LatestReviewCard({ checkIn, onView }) {
  return (
    <motion.div
      className="mx-5 mb-4 rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(212,167,78,0.08), rgba(212,167,78,0.02))',
        border: '1px solid rgba(212,167,78,0.3)',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      {/* Biki portrait faded right */}
      <div className="absolute top-0 right-0 bottom-0 w-[42%] pointer-events-none">
        <img
          src={PHOTOS.bikiPortrait}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ filter: 'grayscale(20%) contrast(1.05)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 55%, transparent 100%)',
          }}
        />
      </div>

      <div className="relative">
        <p className="font-display text-[10px] uppercase tracking-[0.2em]" style={{ color: GOLD }}>
          Latest Review
        </p>

        <div className="flex items-center gap-2.5 mt-1.5">
          <h2 className="font-display text-[26px] text-white uppercase tracking-wider leading-none">
            {checkIn.label.toUpperCase()}
          </h2>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex items-center justify-center"
              style={{ background: ON_TRACK }}
            >
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                <path d="M1 3.5L2.5 5L6 1.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-display text-[10px]" style={{ color: ON_TRACK }}>
              Reviewed
            </span>
          </span>
        </div>

        {/* Reviewer chip */}
        <div className="flex items-center gap-2 mt-3">
          <div
            className="w-7 h-7 rounded-full overflow-hidden shrink-0"
            style={{ border: '1px solid rgba(212,167,78,0.3)' }}
          >
            <img
              src={PHOTOS.bikiPortrait}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(15%) contrast(1.05)' }}
            />
          </div>
          <div className="leading-tight">
            <p className="font-body text-[11px] text-white/75">Reviewed by Biki</p>
            <p className="font-body text-[10px] text-white/35">
              {checkIn.reviewedAgo || `Reviewed on ${checkIn.reviewedOn}`}
            </p>
          </div>
        </div>

        {/* Summary quote */}
        {checkIn.summary && (
          <div
            className="mt-4 rounded-xl p-3.5 flex gap-2.5 max-w-[60%]"
            style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid ${CARD_BORDER}` }}
          >
            <Quote size={14} strokeWidth={1.5} style={{ color: GOLD }} className="shrink-0 mt-0.5" />
            <p className="font-body text-[12px] text-white/75 leading-snug">
              {checkIn.summary}
            </p>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onView}
          className="mt-5 w-full py-3 rounded-xl font-display text-[13px] uppercase tracking-wider text-black flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` }}
        >
          View Full Review
          <ArrowRight size={14} strokeWidth={2} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Next check-in card (only ≤3 days)
// ─────────────────────────────────────────────
function NextCheckInCard({ next, onStart }) {
  const days = daysUntil(next.date);
  if (days < 0 || days > 3) return null;

  const dueDayName = DAY_NAMES[new Date(next.date + 'T00:00:00Z').getUTCDay()];
  const headline = `Due ${dueDayName}, ${next.dateLabel}`.toUpperCase();
  const sub = days === 0
    ? 'Due today'
    : days === 1
      ? '1 day left to submit'
      : `${days} days left to submit`;
  const pct = 100 - (days / 3) * 100;
  const size = 56;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;

  return (
    <motion.div
      className="mx-5 mb-5 rounded-2xl p-5"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(212,167,78,0.1)', border: '1px solid rgba(212,167,78,0.25)' }}
        >
          <CalendarDays size={20} strokeWidth={1.5} style={{ color: GOLD }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-[10px] uppercase tracking-[0.2em]" style={{ color: GOLD }}>
            Next Check-in
          </p>
          <p className="font-display text-[14px] text-white uppercase tracking-wider mt-1 leading-tight truncate">
            {headline}
          </p>
          <p className="font-body text-[11px] text-white/40 mt-1">{sub}</p>
        </div>
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
            <circle
              cx={size/2} cy={size/2} r={r} fill="none"
              stroke={GOLD} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={off}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[14px] text-white tabular-nums leading-none">
              {days}
            </span>
            <span className="font-display text-[8px] text-white/45 uppercase tracking-wider">
              days
            </span>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="mt-4 w-full py-3 rounded-xl font-display text-[13px] uppercase tracking-wider text-black flex items-center justify-center gap-2"
        style={{ background: `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` }}
      >
        Start Check-In
        <ArrowRight size={14} strokeWidth={2} />
      </motion.button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// History row
// ─────────────────────────────────────────────
function HistoryRow({ item, delay, onOpen }) {
  const p = item.preview;
  const reviewed = item.status === 'reviewed';
  return (
    <motion.button
      onClick={() => onOpen(item.id)}
      whileTap={{ scale: 0.99 }}
      className="w-full rounded-2xl p-3 flex items-center gap-3 text-left"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.04 + 0.25 }}
    >
      {/* Thumbnail */}
      <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0" style={{ background: '#0A0A0A' }}>
        {item.thumbnail && (
          <img
            src={item.thumbnail}
            alt={item.label}
            className="w-full h-full object-cover"
            style={{ filter: 'contrast(1.05) saturate(0.95)' }}
            loading="lazy"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-display text-[14px] text-white uppercase tracking-wider leading-tight">
          {item.label}
          <span className="text-white/35 mx-1.5">·</span>
          {item.dateLabel}
        </p>

        {reviewed && (
          <div className="flex items-center gap-1 mt-1.5">
            <span
              className="w-3 h-3 rounded-full flex items-center justify-center"
              style={{ background: ON_TRACK }}
            >
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                <path d="M1 3.5L2.5 5L6 1.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-body text-[10px]" style={{ color: ON_TRACK }}>
              Reviewed
            </span>
          </div>
        )}

        {p && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="font-body text-[12px] text-white/60">
              {p.label} <span className="text-white/85 tabular-nums">{p.value}</span>
            </span>
            <div className="flex items-center gap-0.5">
              {p.deltaDir === 'up'
                ? <ArrowUp size={10} strokeWidth={2.5} style={{ color: p.deltaTone === 'good' ? ON_TRACK : RED }} />
                : <ArrowDown size={10} strokeWidth={2.5} style={{ color: p.deltaTone === 'good' ? ON_TRACK : RED }} />}
              <span
                className="font-display text-[11px] tabular-nums"
                style={{ color: p.deltaTone === 'good' ? ON_TRACK : RED }}
              >
                {p.delta}
              </span>
            </div>
          </div>
        )}
      </div>

      <div
        className="shrink-0 px-3 py-1.5 rounded-lg"
        style={{ border: '1px solid rgba(212,167,78,0.3)' }}
      >
        <span className="font-display text-[11px] uppercase tracking-wider" style={{ color: GOLD }}>
          View
        </span>
      </div>
      <ChevronRight size={14} strokeWidth={1.5} className="text-white/25 shrink-0 -ml-1" />
    </motion.button>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
export default function Progress({ onOpenCheckIn, onStartCheckIn }) {
  const latest = CHECK_IN_HISTORY[0];
  const olderHistory = CHECK_IN_HISTORY; // include latest in the list too

  const openLatest = () => onOpenCheckIn?.(latest.id);
  const startCheckIn = () => onStartCheckIn?.();

  return (
    <div className="min-h-screen pb-24" style={{ background: '#000' }}>
      <ReviewsHeader />

      <LatestReviewCard checkIn={latest} onView={openLatest} />

      <NextCheckInCard next={NEXT_CHECKIN} onStart={startCheckIn} />

      <div className="px-5 mb-3 flex items-center justify-between">
        <p className="font-display text-[13px] text-white/55 uppercase tracking-[0.2em]">
          Review History
        </p>
        <button className="font-display text-[11px] uppercase tracking-wider" style={{ color: GOLD }}>
          View All
        </button>
      </div>

      <div className="px-5 flex flex-col gap-2.5">
        {olderHistory.map((item, i) => (
          <HistoryRow key={item.id} item={item} delay={i} onOpen={onOpenCheckIn} />
        ))}
      </div>
    </div>
  );
}
