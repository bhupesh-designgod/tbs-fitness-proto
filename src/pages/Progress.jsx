// ── Progress Screen ──
// Latest check-in hero, conditional next-check-in card (≤3 days),
// transformation overview with photo compare, key metrics, history list.

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Bell, ChevronRight, ChevronDown, ArrowRight, ArrowUp, ArrowDown,
  CalendarDays, Scale, Beef, Dumbbell, Ruler, BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  CHECK_IN_HISTORY, NEXT_CHECKIN, PHOTOS, BLOODWORK,
} from '../data/mockData';

// ── Tokens ──
const CARD_BG = '#131318';
const CARD_BORDER = 'rgba(255,255,255,0.07)';
const GOLD = '#D4A74E';
const GOLD_START = '#B8893C';
const GOLD_END = '#E0C074';
const ON_TRACK = '#4ADE80';
const COOL_BLUE = '#5B9DD9';

const DAY = 86_400_000;

// Compute days until target date (negative if past). Use UTC date keys to avoid TZ drift.
function daysUntil(isoDate) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const a = new Date(todayKey + 'T00:00:00Z').getTime();
  const b = new Date(isoDate + 'T00:00:00Z').getTime();
  return Math.round((b - a) / DAY);
}

// Format metric delta with arrow + sign
function deltaText(delta, unit) {
  const abs = Math.abs(delta);
  const rounded = Number.isInteger(abs) ? abs : abs.toFixed(1);
  return `${rounded}${unit}`;
}

// ─────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────
function ProgressHeader() {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className="px-5 pt-5 pb-4 flex items-start justify-between"
      initial={shouldReduce ? {} : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h1 className="font-display text-[32px] text-white leading-none tracking-wider">
          PROGRESS
        </h1>
        <p className="font-body text-[12px] text-white/40 mt-2">
          Track. Review. Improve.
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
// Latest check-in hero card
// ─────────────────────────────────────────────
function LatestCheckInCard({ checkIn, onView }) {
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
      {/* Biki portrait — right side faded into card */}
      <div className="absolute top-0 right-0 bottom-0 w-[40%] pointer-events-none">
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
              'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.45) 50%, transparent 100%)',
          }}
        />
      </div>

      <div className="relative">
        <p className="font-display text-[10px] uppercase tracking-[0.2em]" style={{ color: GOLD }}>
          Latest Check-in
        </p>

        <div className="flex items-center gap-1.5 mt-2">
          <div
            className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
            style={{ background: ON_TRACK }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4l1.7 1.7L6.5 2.4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-body text-[11px]" style={{ color: ON_TRACK }}>
            Reviewed by Biki
          </span>
        </div>

        <p className="font-display text-[22px] text-white uppercase tracking-wider mt-2 leading-none">
          {checkIn.label.toUpperCase()}
          <span className="text-white/45 mx-1.5">·</span>
          <span>{checkIn.dateLabel.toUpperCase()}</span>
        </p>
        <p className="font-body text-[11px] text-white/40 mt-1.5">
          Reviewed on {checkIn.reviewedOn}
        </p>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onView}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-display text-[12px] uppercase tracking-wider text-black"
          style={{ background: `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` }}
        >
          View Report
          <ArrowRight size={14} strokeWidth={2} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Next check-in card (only when ≤3 days away)
// ─────────────────────────────────────────────
function NextCheckInCard({ next }) {
  const days = daysUntil(next.date);
  if (days < 0 || days > 3) return null;
  const dueLabel = days === 0 ? 'Due today'
                  : days === 1 ? 'Due tomorrow'
                  : `Due in ${days} days`;
  // Ring fill: closer to 0 = more urgent (more filled)
  const pct = 100 - (days / 3) * 100;
  const size = 56;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;

  return (
    <motion.div
      className="mx-5 mb-5 rounded-2xl p-4 flex items-center gap-4"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
    >
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
        <p className="font-body text-[13px] text-white/80 mt-1 truncate">
          {dueLabel} <span className="text-white/35">·</span> {next.dateLabel}
        </p>
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
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Sub-tabs (Overview / Trends / Timeline)
// ─────────────────────────────────────────────
function SubTabs({ active, onChange }) {
  const tabs = ['Overview', 'Trends', 'Timeline'];
  return (
    <div
      className="mx-5 mb-5 rounded-full p-1 flex"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      {tabs.map(t => {
        const k = t.toLowerCase();
        const isActive = active === k;
        return (
          <motion.button
            key={t}
            onClick={() => onChange(k)}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-2 rounded-full font-display text-[12px] uppercase tracking-wider"
            style={{
              background: isActive ? `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` : 'transparent',
              color: isActive ? '#000' : 'rgba(255,255,255,0.5)',
            }}
          >
            {t}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Photo angle toggle
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
// Photo comparison
// ─────────────────────────────────────────────
function PhotoCompare({ checkIn, angle, onAngleChange }) {
  const left = checkIn.photosBaseline?.[angle];
  const right = checkIn.photos?.[angle];
  return (
    <div
      className="mx-5 mb-4 rounded-2xl p-4"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      <AngleToggle active={angle} onChange={onAngleChange} />

      <div className="relative mt-3 rounded-xl overflow-hidden" style={{ aspectRatio: '16 / 11', background: '#0A0A0A' }}>
        {/* Left photo */}
        <img
          src={left}
          alt={`${checkIn.baselineLabel}`}
          className="absolute top-0 left-0 w-1/2 h-full object-cover"
          style={{ filter: 'grayscale(30%) contrast(1.05) brightness(0.85)' }}
          loading="lazy"
        />
        {/* Right photo */}
        <img
          src={right}
          alt={`${checkIn.label}`}
          className="absolute top-0 right-0 w-1/2 h-full object-cover"
          style={{ filter: 'contrast(1.05)' }}
          loading="lazy"
        />
        {/* Center divider + handle */}
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
        {/* Labels */}
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
// Key Metrics row
// ─────────────────────────────────────────────
function KeyMetrics({ metrics }) {
  const items = [
    { key: 'weight',  icon: Scale,    label: 'Weight' },
    { key: 'protein', icon: Beef,     label: 'Protein\nAdherence' },
    { key: 'workout', icon: Dumbbell, label: 'Workout\nCompliance' },
  ];

  return (
    <div className="px-5 mb-5">
      <div className="flex items-baseline justify-between mb-3">
        <p className="font-display text-[12px] text-white/40 uppercase tracking-[0.2em]">
          Key Metrics
        </p>
        <span className="font-body text-[10px] text-white/30 normal-case">
          (vs 12 weeks ago)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {items.map(it => {
          const m = metrics[it.key];
          if (!m) return null;
          const delta = m.value - m.prev;
          const isGood = (m.goodDir === 'up' && delta > 0) || (m.goodDir === 'down' && delta < 0);
          const Icon = it.icon;
          return (
            <div
              key={it.key}
              className="rounded-2xl p-3"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(91,157,217,0.12)', border: '1px solid rgba(91,157,217,0.25)' }}
                >
                  <Icon size={13} strokeWidth={1.6} style={{ color: COOL_BLUE }} />
                </div>
                <p
                  className="font-display text-[9px] text-white/45 uppercase tracking-wider leading-tight whitespace-pre-line"
                >
                  {it.label}
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-[24px] text-white tabular-nums leading-none">
                  {Number.isInteger(m.value) ? m.value : m.value.toFixed(1)}
                </span>
                <span className="font-body text-[11px] text-white/35">{m.unit}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {delta === 0 ? (
                  <span className="font-body text-[11px] text-white/40">—</span>
                ) : (
                  <>
                    {delta > 0
                      ? <ArrowUp size={11} strokeWidth={2} style={{ color: isGood ? ON_TRACK : '#F87171' }} />
                      : <ArrowDown size={11} strokeWidth={2} style={{ color: isGood ? ON_TRACK : '#F87171' }} />}
                    <span
                      className="font-display text-[12px] tabular-nums"
                      style={{ color: isGood ? ON_TRACK : '#F87171' }}
                    >
                      {deltaText(delta, m.unit)}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Check-in History list
// ─────────────────────────────────────────────
function CheckInHistory({ items, onOpen }) {
  return (
    <div className="px-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-display text-[12px] text-white/40 uppercase tracking-[0.2em]">
          Check-in History
        </p>
        <button className="font-display text-[11px] uppercase tracking-wider" style={{ color: GOLD }}>
          View All
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((c, i) => (
          <motion.button
            key={c.id}
            onClick={() => onOpen(c.id)}
            whileTap={{ scale: 0.99 }}
            className="rounded-2xl p-3.5 flex items-center gap-3 text-left"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 + 0.25 }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,167,78,0.08)', border: '1px solid rgba(212,167,78,0.18)' }}
            >
              <CalendarDays size={16} strokeWidth={1.5} style={{ color: GOLD }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-[14px] text-white uppercase tracking-wider leading-tight">
                {c.label}
                <span className="text-white/35 mx-1.5">·</span>
                {c.dateLabel}
              </p>
              {c.reviewedOn && (
                <p className="font-body text-[11px] text-white/35 mt-0.5">
                  Reviewed on {c.reviewedOn}
                </p>
              )}
            </div>
            {c.status === 'reviewed' && (
              <span
                className="font-display text-[10px] uppercase tracking-wider px-2 py-1 rounded-md"
                style={{ background: 'rgba(74,222,128,0.1)', color: ON_TRACK, border: '1px solid rgba(74,222,128,0.25)' }}
              >
                Reviewed
              </span>
            )}
            <ChevronRight size={14} strokeWidth={1.5} className="text-white/25 shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Trends (sparkline + bloodwork)
// ─────────────────────────────────────────────
function TrendsView({ history }) {
  const weights = history.map(h => h.weight);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const W = 360, H = 80;
  const points = weights.map((w, i) => {
    const x = (i / (weights.length - 1)) * W;
    const y = H - ((w - minW) / (maxW - minW)) * H;
    return `${x},${y}`;
  });
  const path = `M${points.join(' L')}`;

  return (
    <div className="px-5">
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      >
        <div className="flex items-baseline justify-between mb-3">
          <p className="font-display text-[11px] text-white/40 uppercase tracking-[0.2em]">
            Weight Trend
          </p>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[20px] text-white tabular-nums leading-none">
              {weights[weights.length - 1]?.toFixed(1)}
            </span>
            <span className="font-body text-[11px] text-white/35">kg</span>
          </div>
        </div>
        <svg width="100%" viewBox={`0 0 ${W} ${H + 8}`} preserveAspectRatio="none" style={{ height: H + 8 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={GOLD_START} />
              <stop offset="100%" stopColor={GOLD_END} />
            </linearGradient>
          </defs>
          <path d={path} fill="none" stroke="url(#weightGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="flex justify-between font-body text-[10px] text-white/25 mt-1">
          <span>2 weeks ago</span>
          <span>Today</span>
        </div>
      </div>

      <p className="font-display text-[12px] text-white/40 uppercase tracking-[0.2em] mb-3">
        Bloodwork
      </p>
      <div className="space-y-2">
        {BLOODWORK.map((b, i) => (
          <motion.div
            key={b.marker}
            className="rounded-2xl p-3.5"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-body text-[13px] text-white/80">{b.marker}</span>
              <span className="font-display text-[13px] text-white tabular-nums">{b.value}</span>
            </div>
            <p className="font-body text-[11px] text-white/40 leading-relaxed">{b.bikiNote}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Timeline (month calendar from existing history)
// ─────────────────────────────────────────────
function TimelineView({ history }) {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekday = new Date(y, m, 1).getDay();
  const monthLabel = today.toLocaleDateString('en', { month: 'long', year: 'numeric' });

  const grid = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push({ day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const h = history.find(x => x.date === iso);
      cells.push({ day: d, adherence: h?.adherence ?? null, isToday: d === today.getDate() });
    }
    return cells;
  }, [y, m, daysInMonth, firstWeekday, history]);

  return (
    <div className="px-5">
      <p className="font-display text-[13px] text-white/55 uppercase tracking-[0.2em] mb-3">
        {monthLabel}
      </p>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center font-display text-[9px] text-white/30 uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {grid.map((c, i) =>
          c.day ? (
            <div
              key={i}
              className="aspect-square rounded-lg flex items-center justify-center"
              style={{
                background: c.isToday
                  ? `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})`
                  : c.adherence !== null
                    ? `rgba(212,167,78,${Math.min(0.3, c.adherence / 250)})`
                    : 'rgba(255,255,255,0.03)',
                border: c.isToday ? 'none' : `1px solid ${CARD_BORDER}`,
              }}
            >
              <span
                className="font-display text-[12px] tabular-nums"
                style={{
                  color: c.isToday
                    ? '#000'
                    : c.adherence !== null
                      ? 'rgba(255,255,255,0.85)'
                      : 'rgba(255,255,255,0.25)',
                }}
              >
                {c.day}
              </span>
            </div>
          ) : (
            <div key={i} />
          )
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
export default function Progress({ onOpenCheckIn }) {
  const { history } = useApp();
  const [tab, setTab] = useState('overview');
  const [angle, setAngle] = useState('front');
  const [range, setRange] = useState('12 Weeks');

  const latest = CHECK_IN_HISTORY[0];
  const olderHistory = CHECK_IN_HISTORY.slice(1, 4);

  const openLatest = () => onOpenCheckIn?.(latest.id);

  return (
    <div className="min-h-screen pb-24" style={{ background: '#000' }}>
      <ProgressHeader />

      <LatestCheckInCard checkIn={latest} onView={openLatest} />

      <NextCheckInCard next={NEXT_CHECKIN} />

      <SubTabs active={tab} onChange={setTab} />

      <AnimatePresence mode="wait">
        {tab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 mb-3 flex items-center justify-between">
              <p className="font-display text-[12px] text-white/40 uppercase tracking-[0.2em]">
                Transformation Overview
              </p>
              <button
                onClick={() => setRange(r => r === '12 Weeks' ? '6 Weeks' : '12 Weeks')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md"
                style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
              >
                <span className="font-display text-[11px] text-white/70 uppercase tracking-wider">
                  {range}
                </span>
                <ChevronDown size={12} strokeWidth={1.5} className="text-white/40" />
              </button>
            </div>

            <PhotoCompare checkIn={latest} angle={angle} onAngleChange={setAngle} />

            <KeyMetrics metrics={latest.metrics} />

            <CheckInHistory items={olderHistory} onOpen={onOpenCheckIn} />
          </motion.div>
        )}

        {tab === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TrendsView history={history} />
          </motion.div>
        )}

        {tab === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TimelineView history={history} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
