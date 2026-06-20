// ── FloatingCoach — the one coach presence, on every screen except chat ──
// Messenger-style chat head. Cadence is faked for the prototype: it cycles
// through every scenario (report → check-in → thought) every 30s so all states
// are demoable on any day. Confirming a scenario (commit / submit / view)
// slides the avatar away after ~6s; a swipe brings it back. Real coach state
// (Muskaan answers, report-seen) is still written so chat can log it.

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, X, Quote, Check, ChevronRight, Activity, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { track } from '../../lib/analytics';
import { coachTeaser } from '../../lib/coachState';
import { T } from '../../tokens';
import { COACH_QUOTES, HEALTH_REPORT, PHOTOS } from '../../data/mockData';
import { BottomSheet } from './Components';
import AvatarMark from './AvatarMark';
import MuskaanCheckIn from './MuskaanCheckIn';

// ── Daily-quote modal — coach portrait bg, the line, a commitment ──
function CoachQuoteModal({ quote, committed, onCommit, onClose, onMessage }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-[400px] rounded-3xl overflow-hidden"
        style={{ border: `1px solid ${T.hairlineStrong}` }}
        initial={shouldReduce ? {} : { opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={PHOTOS.bikiPortrait} alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(30%) contrast(1.05) brightness(0.5)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(11,11,12,0.97) 6%, rgba(11,11,12,0.72) 46%, rgba(11,11,12,0.30) 100%)' }} />

        <motion.button whileTap={T.tapSmall} onClick={onClose} aria-label="Close"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${T.hairlineStrong}` }}>
          <X size={16} strokeWidth={2} style={{ color: T.text }} />
        </motion.button>

        <div className="relative pt-32 px-6 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Quote size={16} strokeWidth={2} style={{ color: T.gold }} />
            <p className="font-body text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: T.gold }}>Today's mindset</p>
          </div>
          <p className="font-body text-[20px] font-semibold leading-[1.4] text-[#F4F2EC] mb-5">{quote.text}</p>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0" style={{ border: `1.5px solid ${T.gold}` }}>
              <img src={PHOTOS.bikiPortrait} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="leading-tight">
              <p className="font-body text-[12px] font-bold" style={{ color: T.text }}>Biki Singh</p>
              <p className="font-body text-[10px] font-medium uppercase tracking-wider" style={{ color: T.textLow }}>IFBB Pro · Head Coach</p>
            </div>
          </div>
          {committed ? (
            <div className="btn-primary" style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.gold }}>
              <Check size={16} strokeWidth={2.5} /> Committed for today
            </div>
          ) : (
            <motion.button whileTap={T.tap} onClick={onCommit} className="btn-primary btn-shine-wrap">
              <Sparkles size={15} strokeWidth={2} /> I'm committed
            </motion.button>
          )}
          <button onClick={onMessage} className="btn-ghost mt-3.5 mx-auto" style={{ color: T.textMid }}>
            Message Biki <ChevronRight size={13} strokeWidth={T.stroke} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Prototype cycle order — shows every scenario regardless of the day.
const SCENARIOS = ['report', 'muskaan', 'thought'];
const CYCLE_MS = 30000;   // next scenario appears after 30s
const DOCK_MS = 6000;     // slide away ~6s after a confirmation

export default function FloatingCoach({ onNavigate, hidden = false }) {
  const { submitMuskaan, markReportSeen } = useApp();

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const mode = SCENARIOS[scenarioIdx % SCENARIOS.length];

  const [docked, setDocked] = useState(false);
  const [bubbleShown, setBubbleShown] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [muskaanOpen, setMuskaanOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const anyOpen = quoteOpen || muskaanOpen || reportOpen;

  const [commit, setCommit] = useLocalStorage('tbs-commit', { date: null });
  const todayKey = new Date().toDateString();
  const committed = commit.date === todayKey;

  const quote = useMemo(() => {
    const now = new Date();
    const doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86_400_000);
    return COACH_QUOTES[doy % COACH_QUOTES.length];
  }, []);

  const teaser = coachTeaser(mode, { thoughtShort: quote.short });
  const dockTimer = useRef();

  // First reveal.
  useEffect(() => {
    const t = setTimeout(() => setBubbleShown(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Advance to the next scenario every 30s (prototype demo cadence).
  useEffect(() => {
    const t = setTimeout(() => {
      setQuoteOpen(false); setMuskaanOpen(false); setReportOpen(false);
      setScenarioIdx(i => i + 1);
      setDocked(false);
    }, CYCLE_MS);
    return () => clearTimeout(t);
  }, [scenarioIdx]);

  useEffect(() => () => clearTimeout(dockTimer.current), []);

  const scheduleDock = useCallback(() => {
    clearTimeout(dockTimer.current);
    dockTimer.current = setTimeout(() => setDocked(true), DOCK_MS);
  }, []);

  const openCoach = useCallback(() => {
    if (docked) { setDocked(false); return; } // swipe/tap recalls it
    if (mode === 'muskaan') { setMuskaanOpen(true); track('coach_open', { mode: 'muskaan' }); }
    else if (mode === 'report') { setReportOpen(true); track('coach_open', { mode: 'report' }); }
    else { setQuoteOpen(true); track('coach_open', { mode: 'thought' }); }
  }, [docked, mode]);

  const handleCommit = useCallback(() => {
    setCommit({ date: todayKey });
    track('coach_quote_committed');
    setTimeout(() => setQuoteOpen(false), 900);
    scheduleDock();
  }, [setCommit, todayKey, scheduleDock]);

  if (hidden) return null;

  const badge = mode === 'muskaan'
    ? <Activity size={10} strokeWidth={2.5} style={{ color: T.goldInk }} />
    : mode === 'report'
      ? <FileText size={10} strokeWidth={2.5} style={{ color: T.goldInk }} />
      : <Sparkles size={10} strokeWidth={2.5} style={{ color: T.goldInk }} />;

  return (
    <>
      {/* Chat head — draggable; docks to the right edge, swipe to recall */}
      <motion.div
        className="fixed z-40 flex items-end gap-2"
        style={{ bottom: 90, right: 20 }}
        drag="x"
        dragConstraints={{ left: 0, right: 72 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          if (info.offset.x > 28) setDocked(true);
          else if (info.offset.x < -28) setDocked(false);
        }}
        animate={{ x: docked ? 66 : 0, opacity: docked ? 0.55 : 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        {/* Bubble — what the coach is surfacing */}
        <AnimatePresence>
          {bubbleShown && !anyOpen && !docked && (
            <motion.button
              key={`bubble-${mode}`}
              onClick={openCoach}
              initial={{ opacity: 0, x: 12, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="relative mb-1 max-w-[200px] text-left rounded-2xl rounded-br-md px-3.5 py-2.5"
              style={{ background: T.surface, border: `1px solid ${T.hairlineStrong}`, boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }}
            >
              <p className="font-body text-[9px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: T.gold }}>
                {mode === 'thought' && committed ? 'Locked in' : teaser.kicker}
              </p>
              <p className="font-body text-[12px] font-semibold leading-snug" style={{ color: T.text }}>
                {mode === 'thought' && committed ? "That's the standard. Keep it." : teaser.text}
              </p>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Avatar */}
        <motion.button
          whileTap={T.tapSmall}
          onClick={openCoach}
          aria-label="Coach Biki"
          className="relative shrink-0"
        >
          <AvatarMark size={56} pulse={!docked} status badge={badge} />
        </motion.button>
      </motion.div>

      {/* Surfaces — one at a time */}
      <AnimatePresence>
        {quoteOpen && (
          <CoachQuoteModal
            quote={quote}
            committed={committed}
            onCommit={handleCommit}
            onClose={() => setQuoteOpen(false)}
            onMessage={() => { setQuoteOpen(false); onNavigate && onNavigate('coach'); }}
          />
        )}
      </AnimatePresence>

      <MuskaanCheckIn
        isOpen={muskaanOpen}
        onClose={() => setMuskaanOpen(false)}
        onSubmit={(r) => { submitMuskaan(r); track('muskaan_submit', r); scheduleDock(); }}
        variant={new Date().getDay() === 0 ? 'close' : 'mid'}
      />

      <BottomSheet isOpen={reportOpen} onClose={() => setReportOpen(false)}>
        <div className="flex items-center gap-3 mb-4">
          <AvatarMark size={42} ring />
          <div className="min-w-0">
            <p className="font-body text-[10px] font-extrabold uppercase tracking-wider" style={{ color: T.gold }}>New report</p>
            <h2 className="display-sm text-[#F4F2EC] uppercase leading-none mt-0.5">{HEALTH_REPORT.title}</h2>
          </div>
        </div>
        <p className="font-body text-[14px] leading-relaxed mb-1.5" style={{ color: T.text }}>{HEALTH_REPORT.change}</p>
        <p className="font-body text-[11px] font-medium uppercase tracking-wider mb-5" style={{ color: T.textFaint }}>
          Reviewed {HEALTH_REPORT.dateLabel}
        </p>
        <motion.button
          whileTap={T.tap}
          onClick={() => { markReportSeen(); setReportOpen(false); scheduleDock(); onNavigate && onNavigate('progress'); }}
          className="btn-primary"
        >
          View full report <ChevronRight size={15} strokeWidth={2} />
        </motion.button>
      </BottomSheet>
    </>
  );
}
