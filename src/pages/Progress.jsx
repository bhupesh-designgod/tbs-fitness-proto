// ── Reviews Screen ──
// Latest weekly review, conditional next-check-in card (≤3 days),
// review-history list. (Internal tab id remains "progress".)

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Bell, ChevronRight, ArrowRight, ArrowUp, ArrowDown,
  CalendarDays, Quote, ChevronDown, User as UserIcon,
} from 'lucide-react';
import { CHECK_IN_HISTORY, NEXT_CHECKIN, PHOTOS } from '../data/mockData';
import { T } from '../tokens';
import { BottomSheet } from '../components/ui/Components';

// ── Aliases from the token sheet — no local values ──
const CARD_BG = T.surface;
const CARD_BORDER = T.hairline;
const GOLD = T.gold;
const GOLD_START = T.goldStart;
const GOLD_END = T.goldEnd;
const ON_TRACK = T.success;
const POSITIVE = T.positive;
const RED = T.danger;

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
        <h1 className="display-md text-[#F4F2EC]">
          REVIEWS
        </h1>
        <p className="font-body text-[12px] mt-2" style={{ color: T.textSub }}>
          Every week, reviewed by Biki.
        </p>
      </div>
      <button
        aria-label="Notifications"
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <Bell size={18} strokeWidth={T.stroke} className="text-white/55" />
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
      className="mx-5 mb-4 rounded-xl p-5 relative overflow-hidden"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
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
        <p className="kicker kicker-gold">Latest review</p>

        <div className="flex items-center gap-2.5 mt-1.5">
          <h2 className="display-lg text-[#F4F2EC] uppercase">
            {checkIn.label.toUpperCase()}
          </h2>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(246, 180, 28,0.12)', border: '1px solid rgba(246, 180, 28,0.40)' }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex items-center justify-center"
              style={{ background: ON_TRACK }}
            >
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                <path d="M1 3.5L2.5 5L6 1.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-body text-[10px] font-extrabold uppercase tracking-wider" style={{ color: ON_TRACK }}>
              Reviewed
            </span>
          </span>
        </div>

        {/* Reviewer chip */}
        <div className="flex items-center gap-2 mt-3">
          <div
            className="w-7 h-7 rounded-full overflow-hidden shrink-0"
            style={{ border: '1px solid rgba(246, 180, 28,0.40)' }}
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
            <Quote size={14} strokeWidth={T.stroke} style={{ color: GOLD }} className="shrink-0 mt-0.5" />
            <p className="font-body text-[12px] text-white/75 leading-snug">
              {checkIn.summary}
            </p>
          </div>
        )}

        <motion.button
          whileTap={T.tap}
          onClick={onView}
          className="mt-5 w-full flex items-center justify-center gap-2 py-[13px] rounded-xl font-body font-semibold text-[14px] uppercase"
          style={{ border: `1.5px solid ${T.gold}`, color: T.gold, letterSpacing: '0.04em', background: 'transparent' }}
        >
          View full review
          <ArrowRight size={16} strokeWidth={2.25} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Next check-in card (only ≤3 days)
// ─────────────────────────────────────────────
function NextCheckInCard({ next, onStart }) {
  const [detailOpen, setDetailOpen] = useState(false);
  // Proto: the weekly check-in is always surfaced as due today, regardless of date.
  const days = 0;
  const todayLabel = new Date().toLocaleDateString('en', { month: 'short', day: 'numeric' });
  if (days < 0 || days > 3) return null;

  const dueDayName = DAY_NAMES[new Date(next.date + 'T00:00:00Z').getUTCDay()];
  const headline = (days === 0
    ? `Due today, ${todayLabel}`
    : `Due ${dueDayName}, ${next.dateLabel}`).toUpperCase();
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
      className="mx-5 mb-5 rounded-xl p-5"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(246, 180, 28,0.12)', border: '1px solid rgba(246, 180, 28,0.40)' }}
        >
          <CalendarDays size={20} strokeWidth={T.stroke} style={{ color: GOLD }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="kicker kicker-gold">Next check-in</p>
          <p className="display-xs text-[#F4F2EC] uppercase mt-1 leading-tight truncate">
            {headline}
          </p>
          <p className="font-body text-[11px] text-white/40 mt-1">{sub}</p>
        </div>
        {days === 0 ? (
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
              <circle
                cx={size/2} cy={size/2} r={r} fill="none"
                stroke={GOLD} strokeWidth={stroke} strokeLinecap="butt"
                strokeDasharray={c} strokeDashoffset={off}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-[20px] text-[#F4F2EC] tabular-nums leading-none">
                {days}
              </span>
              <span className="font-body text-[8px] font-extrabold text-white/45 uppercase tracking-wider">
                days
              </span>
            </div>
          </div>
        ) : (
          <motion.button
            whileTap={T.tapSmall}
            onClick={() => setDetailOpen(true)}
            aria-label="What you'll submit"
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ border: `1px solid ${CARD_BORDER}` }}
          >
            <ChevronDown size={16} strokeWidth={T.stroke} style={{ color: T.textLow }} />
          </motion.button>
        )}
      </div>

      {days === 0 && (
        <motion.button
          whileTap={T.tap}
          onClick={onStart}
          className="btn-primary mt-4"
        >
          Start check-in
          <ArrowRight size={16} strokeWidth={2} />
        </motion.button>
      )}

      <BottomSheet isOpen={detailOpen} onClose={() => setDetailOpen(false)}>
        <p className="kicker kicker-gold mb-1">Next check-in</p>
        <h2 className="display-sm text-[#F4F2EC] uppercase mb-4">What you'll submit</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
          {['Progress photos', 'Body weight', 'Waist & measures', 'Energy & adherence'].map(item => (
            <span key={item} className="flex items-center gap-2 font-body text-[12px]" style={{ color: T.textLow }}>
              <span className="w-1 h-1 rounded-full shrink-0" style={{ background: T.gold }} />
              {item}
            </span>
          ))}
        </div>
        <p className="font-body text-[12px] pb-2" style={{ color: T.textFaint }}>
          Opens {dueDayName}. We'll remind you — nothing to do until then.
        </p>
      </BottomSheet>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Compare Progress — two independent week pickers
// ─────────────────────────────────────────────
const ANGLES = ['front', 'back', 'left', 'right'];

function WeekPicker({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find(o => o.id === value);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      >
        <span className="font-body text-[13px] font-bold text-[#F4F2EC] truncate">
          {current?.label || '—'}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={14} strokeWidth={T.stroke} className="text-white/45" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-30"
            style={{
              background: '#1A1A1F',
              border: `1px solid ${CARD_BORDER}`,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              maxHeight: 220,
              overflowY: 'auto',
            }}
          >
            {options.map(opt => {
              const isActive = opt.id === value;
              return (
                <button
                  key={opt.id}
                  onClick={() => { onChange(opt.id); setOpen(false); }}
                  className="w-full text-left px-3.5 py-2.5 flex items-center justify-between"
                  style={{ background: isActive ? 'rgba(246, 180, 28,0.12)' : 'transparent' }}
                >
                  <span
                    className="font-body text-[12px] font-bold"
                    style={{ color: isActive ? GOLD : 'rgba(255,255,255,0.75)' }}
                  >
                    {opt.label}
                  </span>
                  <span className="font-body text-[11px] text-white/35">
                    {opt.dateLabel}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompareAngleToggle({ active, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-1.5 my-3">
      {ANGLES.map(a => {
        const isActive = active === a;
        return (
          <motion.button
            key={a}
            onClick={() => onChange(a)}
            whileTap={{ scale: 0.96 }}
            className="py-1.5 rounded-md text-center flex items-center justify-center"
            style={{
              background: isActive ? GOLD : 'transparent',
              border: `1px solid ${isActive ? GOLD : CARD_BORDER}`,
            }}
          >
            <span
              className="font-body text-[11px] font-bold uppercase tracking-wider leading-none"
              style={{ color: isActive ? T.goldInk : 'rgba(255,255,255,0.45)' }}
            >
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function PhotoCard({ entry, angle, accent }) {
  const photo = entry?.photos?.[angle] || entry?.thumbnail;
  const weight = entry?.weight;
  return (
    <div
      className="relative aspect-[2/3] overflow-hidden"
      style={{ background: T.bg }}
    >
      {photo ? (
        <img
          src={photo}
          alt={entry.label}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'contrast(1.05) saturate(0.95) brightness(0.92)' }}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <UserIcon size={36} strokeWidth={1} className="text-white/15" />
        </div>
      )}
      {/* Bottom-left gradient for legibility */}
      <div
        className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
      />
      {typeof weight === 'number' && (
        <span
          className="absolute bottom-2 left-2 font-body text-[13px] font-extrabold tabular-nums"
          style={{ color: accent || '#F4F2EC' }}
        >
          {weight.toFixed(1)} kg
        </span>
      )}
    </div>
  );
}

function DeltaPill({ delta }) {
  if (delta == null || isNaN(delta)) return null;
  const isDown = delta < 0;
  const isZero = delta === 0;
  const abs = Math.abs(delta).toFixed(1);
  const tone = isZero ? 'rgba(255,255,255,0.7)' : isDown ? POSITIVE : RED;

  return (
    <div
      className="whitespace-nowrap flex items-center gap-1 px-2 py-1 rounded-full"
      style={{
        background: isZero ? 'rgba(255,255,255,0.08)' : `${tone}1A`,
        border: `1px solid ${tone}`,
      }}
    >
      {!isZero && (isDown
        ? <ArrowDown size={13} strokeWidth={3} style={{ color: tone }} />
        : <ArrowUp   size={13} strokeWidth={3} style={{ color: tone }} />)}
      <span className="font-body text-[13px] font-extrabold tabular-nums" style={{ color: tone }}>
        {abs} kg
      </span>
    </div>
  );
}

function CompareProgress({ entries, leftId, rightId, onLeftChange, onRightChange, angle, onAngleChange }) {
  const left = entries.find(e => e.id === leftId);
  const right = entries.find(e => e.id === rightId);
  const delta = (right?.weight != null && left?.weight != null)
    ? right.weight - left.weight
    : null;

  return (
    <div className="mx-5 mb-5">
      <p className="kicker mb-3">Compare progress</p>

      <div
        className="rounded-xl p-4"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      >
        {/* Two pickers */}
        <div className="flex items-stretch gap-2">
          <WeekPicker value={leftId}  options={entries} onChange={onLeftChange} />
          <WeekPicker value={rightId} options={entries} onChange={onRightChange} />
        </div>

        {/* Angle toggle */}
        <CompareAngleToggle active={angle} onChange={onAngleChange} />

        {/* Flush 2:3 before/after pair — single framed unit, no gap */}
        <div
          className="relative grid grid-cols-2 rounded-xl overflow-hidden"
          style={{ border: `1px solid ${CARD_BORDER}` }}
        >
          <PhotoCard entry={left}  angle={angle} accent="#FFFFFF" />
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.14)' }}>
            <PhotoCard entry={right} angle={angle} accent={GOLD} />
          </div>
          <div className="absolute bottom-2.5 right-3 z-10">
            <DeltaPill delta={delta} />
          </div>
        </div>
      </div>
    </div>
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
      className="w-full rounded-xl p-3 flex items-center gap-3 text-left"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.04 + 0.25 }}
    >
      {/* Thumbnail */}
      <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0" style={{ background: T.bg }}>
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
        <p className="display-xs text-[#F4F2EC] uppercase leading-tight">
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
            <span className="font-body text-[10px] font-bold" style={{ color: ON_TRACK }}>
              Reviewed
            </span>
          </div>
        )}

        {p && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="font-body text-[9px] font-extrabold uppercase tracking-[0.12em]" style={{ color: T.textFaint }}>
              Top result
            </span>
            <span className="font-body text-[12px] text-white/60">
              {p.label} <span className="text-white/85 tabular-nums">{p.value}</span>
            </span>
            <div className="flex items-center gap-0.5">
              {p.deltaDir === 'up'
                ? <ArrowUp size={10} strokeWidth={2.5} style={{ color: p.deltaTone === 'good' ? POSITIVE : RED }} />
                : <ArrowDown size={10} strokeWidth={2.5} style={{ color: p.deltaTone === 'good' ? POSITIVE : RED }} />}
              <span
                className="font-body text-[11px] font-extrabold tabular-nums"
                style={{ color: p.deltaTone === 'good' ? POSITIVE : RED }}
              >
                {p.delta}
              </span>
            </div>
          </div>
        )}
      </div>

      <span className="shrink-0 font-body text-[13px] font-semibold" style={{ color: GOLD }}>
        View
      </span>
      <ChevronRight size={15} strokeWidth={T.stroke} style={{ color: GOLD }} className="shrink-0 -ml-0.5" />
    </motion.button>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
export default function Progress({ onOpenCheckIn, onStartCheckIn }) {
  // Latest reviewed check-in (acts as "current" in comparisons)
  const latest = CHECK_IN_HISTORY[0];
  // All entries with photos — oldest first. The latest week reads "Current".
  const compareEntries = CHECK_IN_HISTORY
    .filter(c => c.photos)
    .map(c => (c.id === CHECK_IN_HISTORY[0].id ? { ...c, label: 'Current' } : c))
    .sort((a, b) => a.week - b.week);
  // History list excludes the baseline marker (Week 1) to keep recent weeks focused
  const historyList = CHECK_IN_HISTORY.filter(c => c.week !== 1);

  // Default: left = Week 1 (baseline), right = latest
  const [leftCompareId, setLeftCompareId] = useState(compareEntries[0]?.id);
  const [rightCompareId, setRightCompareId] = useState(latest.id);
  const [angle, setAngle] = useState('front');

  const openLatest = () => onOpenCheckIn?.(latest.id);
  const startCheckIn = () => onStartCheckIn?.();

  return (
    <div className="min-h-screen pb-24" style={{ background: T.bg }}>
      <ReviewsHeader />

      <LatestReviewCard checkIn={latest} onView={openLatest} />

      <NextCheckInCard next={NEXT_CHECKIN} onStart={startCheckIn} />

      {compareEntries.length >= 2 && (
        <CompareProgress
          entries={compareEntries}
          leftId={leftCompareId}
          rightId={rightCompareId}
          onLeftChange={setLeftCompareId}
          onRightChange={setRightCompareId}
          angle={angle}
          onAngleChange={setAngle}
        />
      )}

      <div className="px-5 mb-3 flex items-center justify-between">
        <p className="kicker">Review history</p>
        <button className="btn-ghost !py-0 text-[12px]">View all</button>
      </div>

      <div className="px-5 flex flex-col gap-2.5">
        {historyList.map((item, i) => (
          <HistoryRow key={item.id} item={item} delay={i} onOpen={onOpenCheckIn} />
        ))}
      </div>
    </div>
  );
}
