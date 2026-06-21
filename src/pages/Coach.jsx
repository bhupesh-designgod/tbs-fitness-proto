// ── Coach Screen ──
// Compact header, next-call card, topic-filtered chat thread,
// voice messages, topic-aware input bar.

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Play, Pause, Plus, Mic, Send, ChevronDown,
  BadgeCheck, CalendarDays, Activity, FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  BIKI, NEXT_CALL, PHOTOS, BIKI_MESSAGES, HEALTH_REPORT,
} from '../data/mockData';
import AvatarMark from '../components/ui/AvatarMark';
import { T } from '../tokens';

// ── Aliases from the token sheet — no local values ──
const CARD_BG = T.surface;
const CARD_BORDER = T.hairline;
const GOLD = T.gold;
const GOLD_START = T.goldStart;
const GOLD_END = T.goldEnd;
const ONLINE_GREEN = T.green;

// ── Topic palette ──
const TOPICS = {
  general:  { label: 'General',  color: '#9D9C96' },
  workout:  { label: 'Workout',  color: T.cal },
  diet:     { label: 'Diet',     color: '#F4F2EC' },
  progress: { label: 'Progress', color: T.water },
  other:    { label: 'Other',    color: '#FF3B30' },
};
const TOPIC_KEYS = Object.keys(TOPICS);
// "Other" is a display-only tag for past messages — not selectable when composing.
const INPUT_TOPIC_KEYS = TOPIC_KEYS.filter(k => k !== 'other');

// ── Seed chat ──
const INITIAL_MESSAGES = [
  { id: 1, from: 'coach', topic: 'diet',     type: 'text',  text: "Saw your check-in. Let's bump protein to 180g this week.", time: '10:05 AM' },
  { id: 2, from: 'user',  topic: 'workout',  type: 'text',  text: "Coach, my shoulder felt off during press today. Swap it?", time: '1:15 PM' },
  { id: 3, from: 'coach', topic: 'workout',  type: 'voice', duration: 42, time: '1:30 PM' },
  { id: 4, from: 'user',  topic: 'diet',     type: 'text',  text: "Had mom's dal and roti for lunch, logged it as off-plan.", time: '2:45 PM' },
  { id: 5, from: 'coach', topic: 'other',    type: 'text',  text: "All good. Do lateral raises instead this week, we'll reassess Sunday.", time: '3:00 PM' },
  { id: 6, from: 'coach', topic: 'progress', type: 'voice', duration: 18, time: '4:10 PM' },
];

// ─────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────
function CoachHeader() {
  const [callOpen, setCallOpen] = useState(false);
  return (
    <>
    <div
      className="fixed top-0 left-0 right-0 z-40 mx-auto px-5 pt-4 pb-3 flex items-center gap-3"
      style={{
        maxWidth: 430,
        background: 'rgba(20,20,23,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${T.hairlineStrong}`,
      }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className="w-12 h-12 rounded-full overflow-hidden"
          style={{ border: `1.5px solid ${T.hairlineStrong}` }}
        >
          <img
            src={PHOTOS.bikiPortrait}
            alt={BIKI.name}
            className="w-full h-full object-cover"
            style={{ filter: 'contrast(1.05)' }}
          />
        </div>
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h1 className="display-sm text-[#F4F2EC] uppercase leading-tight truncate">
            {BIKI.name}
          </h1>
          <BadgeCheck size={15} strokeWidth={2} style={{ color: ONLINE_GREEN }} className="shrink-0" />
        </div>
        <p className="font-body text-[11px] text-white/45 leading-tight mt-0.5 truncate">
          IFBB Pro · Head Coach
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ONLINE_GREEN }} />
          <span className="font-body text-[10px] text-white/45 truncate">
            Online
          </span>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={() => setCallOpen(o => !o)}
        aria-label="Scheduled call"
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ border: `1px solid ${callOpen ? T.goldBorder : T.hairlineStrong}` }}
      >
        <CalendarDays size={17} strokeWidth={T.stroke} style={{ color: GOLD }} />
      </button>
    </div>

    {/* Scheduled-call dropdown — fixed under the header, tap-away to dismiss */}
    <AnimatePresence>
      {callOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setCallOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed left-0 right-0 z-40 mx-auto px-4"
            style={{ maxWidth: 430, top: 84 }}
          >
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: T.goldTint, border: `1px solid ${T.goldBorder}` }}
              >
                <CalendarDays size={20} strokeWidth={T.stroke} style={{ color: GOLD }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="kicker kicker-gold mb-0.5">Next call</p>
                <p className="display-xs text-[#F4F2EC] uppercase leading-tight truncate">{NEXT_CALL.date}</p>
                <p className="font-body text-[11px] text-white/40 mt-0.5">{NEXT_CALL.time}</p>
              </div>
              <button
                onClick={() => setCallOpen(false)}
                className="shrink-0 px-3 py-2 rounded-lg font-body text-[11px] font-extrabold uppercase tracking-wider"
                style={{ border: `1px solid ${T.gold}`, color: T.gold }}
              >
                Reschedule
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────
// Day separator
// ─────────────────────────────────────────────
function DaySeparator({ label }) {
  return (
    <div className="flex items-center gap-3 px-5 mb-5">
      <div className="flex-1 h-px" style={{ background: CARD_BORDER }} />
      <span className="font-body text-[10px] font-extrabold text-white/35 uppercase tracking-[0.25em]">
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: CARD_BORDER }} />
    </div>
  );
}

// ─────────────────────────────────────────────
// Coach avatar (small, for chat rows)
// ─────────────────────────────────────────────
function CoachAvatar() {
  return (
    <div className="relative shrink-0">
      <div
        className="w-9 h-9 rounded-full overflow-hidden"
        style={{ border: '1.5px solid rgba(246, 180, 28,0.40)' }}
      >
        <img
          src={PHOTOS.bikiPortrait}
          alt={BIKI.name}
          className="w-full h-full object-cover"
          style={{ filter: 'grayscale(20%) contrast(1.05)' }}
        />
      </div>
      <span
        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full translate-x-[15%] translate-y-[15%]"
        style={{ background: ONLINE_GREEN, border: '2px solid #000' }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Voice bubble — play + animated waveform
// ─────────────────────────────────────────────
function VoiceBubble({ duration }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const shouldReduce = useReducedMotion();

  // Stable pseudo-random waveform bars
  const bars = useMemo(() => {
    const out = [];
    let seed = duration * 9301 + 49297;
    for (let i = 0; i < 28; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      out.push(0.3 + (seed / 233280) * 0.7);
    }
    return out;
  }, [duration]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          const next = p + 100 / (duration * 10);
          if (next >= 100) {
            setPlaying(false);
            return 0;
          }
          return next;
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [playing, duration]);

  const playedIdx = Math.floor((progress / 100) * bars.length);
  const mm = Math.floor(duration / 60);
  const ss = String(duration % 60).padStart(2, '0');

  return (
    <div
      className="rounded-xl p-3 flex items-center gap-3 max-w-[78%]"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setPlaying(p => !p)}
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: T.text }}
      >
        {playing
          ? <Pause size={14} strokeWidth={2.5} color="#0B0B0C" fill="#0B0B0C" />
          : <Play  size={14} strokeWidth={2.5} color="#0B0B0C" fill="#0B0B0C" style={{ marginLeft: 1 }} />}
      </motion.button>

      {/* Waveform */}
      <div className="flex-1 flex items-center gap-[2px] h-7">
        {bars.map((h, i) => {
          const played = i < playedIdx;
          return (
            <motion.span
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: `${h * 100}%`,
                background: played ? GOLD : 'rgba(255,255,255,0.18)',
                minWidth: 2,
              }}
              animate={playing && !shouldReduce ? {
                scaleY: i === playedIdx ? [1, 1.15, 1] : 1,
              } : undefined}
              transition={{ duration: 0.4, repeat: i === playedIdx ? Infinity : 0 }}
            />
          );
        })}
      </div>

      <span className="font-body text-[11px] font-bold tabular-nums text-white/60 shrink-0">
        {mm}:{ss}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Message row
// ─────────────────────────────────────────────
function MessageRow({ msg, delay }) {
  const shouldReduce = useReducedMotion();
  const topic = TOPICS[msg.topic] || TOPICS.other;
  const isCoach = msg.from === 'coach';

  if (isCoach) {
    return (
      <motion.div
        className="px-5 mb-5 flex gap-3"
        initial={shouldReduce ? {} : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.04 }}
      >
        <CoachAvatar />
        <div className="flex flex-col items-start max-w-[78%]">
          {msg.type === 'voice' ? (
            <VoiceBubble duration={msg.duration} />
          ) : (
            <div
              className="rounded-xl rounded-tl-md p-3.5"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <p className="flex items-center gap-1.5 mb-1.5">
                <span className="font-body text-[10px] font-extrabold uppercase tracking-wider" style={{ color: GOLD }}>
                  Coach
                </span>
                <span className="w-1 h-1 rounded-full" style={{ background: topic.color }} />
                <span className="font-body text-[10px] font-extrabold uppercase tracking-wider" style={{ color: topic.color }}>
                  {topic.label}
                </span>
              </p>
              <p className="font-body text-[14px] text-white/85 leading-relaxed">
                {msg.text}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1.5 pl-1">
            <span className="font-body text-[10px] text-white/35 tabular-nums">{msg.time}</span>
            {msg.type === 'voice' && (
              <>
                <span className="w-1 h-1 rounded-full" style={{ background: topic.color }} />
                <span className="font-body text-[10px] font-extrabold uppercase tracking-wider" style={{ color: topic.color }}>
                  {topic.label}
                </span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // User
  return (
    <motion.div
      className="px-5 mb-5 flex flex-col items-end"
      initial={shouldReduce ? {} : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.04 }}
    >
      <div
        className="rounded-xl rounded-tr-md p-3.5 max-w-[78%]"
        style={{ background: '#F4F2EC' }}
      >
        <p className="font-body text-[14px] text-black/85 leading-relaxed">
          {msg.text}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-1.5 pr-1">
        <span className="font-body text-[10px] text-white/35 tabular-nums">{msg.time}</span>
        <span className="w-1 h-1 rounded-full" style={{ background: topic.color }} />
        <span className="font-body text-[10px] font-extrabold uppercase tracking-wider" style={{ color: topic.color }}>
          {topic.label}
        </span>
        {/* Read double-check */}
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="shrink-0">
          <path d="M1 5l3 3L9 2"  stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 5l3 3L13 2" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Input bar
// ─────────────────────────────────────────────
function InputBar({ value, onChange, onSend, topic, onTopicChange }) {
  const [topicOpen, setTopicOpen] = useState(false);
  const topicMeta = TOPICS[topic];

  return (
    <div className="fixed bottom-[72px] left-0 right-0 z-20 px-4 pb-3 mx-auto flex flex-col" style={{ maxWidth: 430 }}>
      {/* Topic picker pop-up */}
      <AnimatePresence>
        {topicOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-2 mx-1 rounded-xl p-2 flex flex-col gap-1"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
          >
            {INPUT_TOPIC_KEYS.map(k => {
              const t = TOPICS[k];
              const active = k === topic;
              return (
                <button
                  key={k}
                  onClick={() => { onTopicChange(k); setTopicOpen(false); }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left"
                  style={{ background: active ? `${t.color}14` : 'transparent' }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  <span
                    className="font-body text-[13px] font-bold flex-1"
                    style={{ color: active ? t.color : 'rgba(255,255,255,0.7)' }}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topic selector — its own compact row, keeps the field full-width */}
      <button
        onClick={() => setTopicOpen(o => !o)}
        className="flex items-center gap-1.5 mb-2 ml-1 px-2.5 py-1 rounded-full self-start"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      >
        <span className="w-2 h-2 rounded-full" style={{ background: topicMeta.color }} />
        <span className="font-body text-[10px] font-extrabold uppercase tracking-wider text-white/45">
          Topic
        </span>
        <span
          className="font-body text-[11px] font-extrabold uppercase tracking-wider"
          style={{ color: topicMeta.color }}
        >
          {topicMeta.label}
        </span>
        <motion.span animate={{ rotate: topicOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={12} strokeWidth={T.stroke} className="text-white/40" />
        </motion.span>
      </button>

      <div className="flex items-center gap-2">
        <button
          aria-label="Attach"
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <Plus size={18} strokeWidth={T.stroke} className="text-white/70" />
        </button>

        <div
          className="flex-1 flex items-center rounded-full"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSend()}
            placeholder="Type your message..."
            className="flex-1 min-w-0 bg-transparent font-body text-[14px] text-[#F4F2EC] placeholder:text-white/25 outline-none px-4 py-3"
          />
        </div>

        {value.trim() ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onSend}
            aria-label="Send"
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: T.volt }}
          >
            <Send size={16} strokeWidth={2} color="#000" />
          </motion.button>
        ) : (
          <button
            aria-label="Voice message"
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            <Mic size={18} strokeWidth={T.stroke} className="text-white/70" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
// ── Coach record — info logged through the avatar, distinct from chat bubbles ──
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
function CoachRecord({ record, delay = 0 }) {
  const Icon = record.kind === 'report' ? FileText : Activity;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay * 0.05 }}
      className="flex items-center gap-3 rounded-xl px-3.5 py-3"
      style={{ background: T.goldTint, border: `1px solid ${T.goldBorder}` }}
    >
      <AvatarMark size={34} ring />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Icon size={11} strokeWidth={2.5} style={{ color: GOLD }} />
          <p className="font-body text-[9px] font-extrabold uppercase tracking-wider" style={{ color: GOLD }}>
            Logged · {record.when}
          </p>
        </div>
        <p className="font-body text-[13px] font-bold leading-tight mt-0.5" style={{ color: T.text }}>{record.title}</p>
        <p className="font-body text-[11px] mt-0.5" style={{ color: T.textLow }}>{record.detail}</p>
      </div>
    </motion.div>
  );
}

export default function Coach({ onCheckIn }) {
  const { behaviorState, coach } = useApp();

  const records = useMemo(() => {
    const out = [];
    (coach?.muskaan || []).forEach((m, i) => {
      out.push({
        id: `mk-${i}`,
        kind: 'muskaan',
        title: 'Check-in',
        detail: `Mood ${cap(m.mood)} · Energy ${m.energy}/5`,
        when: new Date(m.date).toLocaleDateString('en', { weekday: 'short' }),
      });
    });
    if (coach?.reportSeen) {
      out.push({ id: 'rpt', kind: 'report', title: 'Health report reviewed', detail: HEALTH_REPORT.title, when: HEALTH_REPORT.dateLabel });
    }
    if (coach?.bloodworkLogged) {
      out.push({
        id: 'bw', kind: 'report', title: 'Bloodwork uploaded',
        detail: 'Sent to Biki for review',
        when: new Date(coach.bloodworkLogged).toLocaleDateString('en', { weekday: 'short' }),
      });
    }
    return out;
  }, [coach]);
  const shouldReduce = useReducedMotion();
  const [tab, setTab] = useState('actions');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [inputTopic, setInputTopic] = useState('general');

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
    const nextId = (messages[messages.length - 1]?.id || 0) + 1;
    setMessages(prev => [...prev, {
      id: nextId,
      from: 'user',
      topic: inputTopic,
      type: 'text',
      text,
      time,
    }]);
    setInput('');

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const replies = BIKI_MESSAGES[behaviorState] || BIKI_MESSAGES.ON_TRACK;
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const replyTime = new Date().toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
      setMessages(prev => [...prev, {
        id: nextId + 1,
        from: 'coach',
        topic: inputTopic,
        type: 'text',
        text: reply,
        time: replyTime,
      }]);
    }, 1600);
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, paddingBottom: tab === 'chat' ? 176 : 96 }}>
      <CoachHeader />

      {/* Spacer offsets the fixed header so content starts below it */}
      <div aria-hidden style={{ height: 84 }} />

      {/* Tabs — Actions (avatar interactions) vs Chat */}
      <div className="px-5 mb-4">
        <div className="flex rounded-full p-1" style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          {[
            { id: 'actions', label: 'Actions', count: records.length },
            { id: 'chat', label: 'Chat' },
          ].map(t => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full font-body text-[13px] font-extrabold uppercase tracking-wider"
                style={{ background: on ? GOLD : 'transparent', color: on ? T.goldInk : T.textLow }}
              >
                {t.label}
                {t.count > 0 && (
                  <span
                    className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full font-body text-[10px] font-extrabold tabular-nums"
                    style={{ background: on ? 'rgba(0,0,0,0.25)' : T.goldTint, color: on ? T.goldInk : GOLD }}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Actions tab — what the avatar captured ── */}
      {tab === 'actions' && (
        records.length > 0 ? (
          <div className="px-5 space-y-2">
            {records.map((r, i) => <CoachRecord key={r.id} record={r} delay={i} />)}
          </div>
        ) : (
          <div className="px-5 pt-10 flex flex-col items-center text-center">
            <AvatarMark size={56} ring />
            <p className="display-xs text-[#F4F2EC] uppercase mt-4">Nothing yet</p>
            <p className="font-body text-[13px] mt-1.5 max-w-[260px]" style={{ color: T.textLow }}>
              Check-ins, reports, and nudges from Biki will collect here as you go.
            </p>
          </div>
        )
      )}

      {/* ── Chat tab ── */}
      {tab === 'chat' && (
        <>
          <DaySeparator label="Today" />
          <div className="flex flex-col">
            {messages.map((msg, i) => (
              <MessageRow key={msg.id} msg={msg} delay={i} />
            ))}

            {typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-5 mb-5 flex gap-3"
              >
                <CoachAvatar />
                <div
                  className="rounded-xl rounded-tl-md px-4 py-3 flex gap-1.5 items-center"
                  style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
                >
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: GOLD }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <InputBar
            value={input}
            onChange={setInput}
            onSend={handleSend}
            topic={inputTopic}
            onTopicChange={setInputTopic}
          />
        </>
      )}
    </div>
  );
}
