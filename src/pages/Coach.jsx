// ── Coach Screen ──
// Compact header, next-call card, topic-filtered chat thread,
// voice messages, topic-aware input bar.

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Phone, MoreHorizontal, Video, ArrowLeft,
  Play, Pause, Plus, Mic, Send, ChevronDown,
  BadgeCheck, CalendarDays,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  BIKI, NEXT_CALL, CHECKIN_DUE, PHOTOS, BIKI_MESSAGES,
} from '../data/mockData';

// ── Tokens ──
const CARD_BG = '#131318';
const CARD_BORDER = 'rgba(255,255,255,0.07)';
const GOLD = '#D4A74E';
const GOLD_START = '#B8893C';
const GOLD_END = '#E0C074';
const ONLINE_GREEN = '#4ADE80';

// ── Topic palette ──
const TOPICS = {
  workout:  { label: 'Workout',  color: '#FF8855' },
  diet:     { label: 'Diet',     color: '#4ADE80' },
  progress: { label: 'Progress', color: '#5B9DD9' },
  other:    { label: 'Other',    color: '#B57DD9' },
};
const TOPIC_KEYS = Object.keys(TOPICS);

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
function CoachHeader({ onBack }) {
  return (
    <div className="px-5 pt-4 pb-3 flex items-center gap-3">
      {/* Back (kept for visual parity; tab nav makes it no-op by default) */}
      <button
        onClick={onBack}
        aria-label="Back"
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
      >
        <ArrowLeft size={18} strokeWidth={1.75} className="text-white/80" />
      </button>

      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className="w-12 h-12 rounded-full overflow-hidden"
          style={{ border: `1.5px solid rgba(212,167,78,0.4)` }}
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
          <h1 className="font-display text-[18px] text-white uppercase tracking-wider leading-tight truncate">
            {BIKI.name}
          </h1>
          <BadgeCheck size={15} strokeWidth={2} style={{ color: GOLD }} className="shrink-0" />
        </div>
        <p className="font-body text-[11px] text-white/45 leading-tight mt-0.5 truncate">
          IFBB Pro · Head Coach
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ONLINE_GREEN }} />
          <span className="font-body text-[10px] text-white/45 truncate">
            Online · Replies in a few hours
          </span>
        </div>
      </div>

      {/* Actions */}
      <button aria-label="Call" className="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
        <Phone size={18} strokeWidth={1.5} className="text-white/70" />
      </button>
      <button aria-label="More" className="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
        <MoreHorizontal size={18} strokeWidth={1.5} className="text-white/70" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Next call card
// ─────────────────────────────────────────────
function NextCallCard() {
  return (
    <motion.div
      className="mx-5 mb-4 rounded-2xl p-4 flex items-center gap-4"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(212,167,78,0.1)', border: `1px solid rgba(212,167,78,0.25)` }}
      >
        <CalendarDays size={20} strokeWidth={1.5} style={{ color: GOLD }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-[10px] uppercase tracking-[0.2em] mb-0.5" style={{ color: GOLD }}>
          Next Call
        </p>
        <p className="font-display text-[15px] text-white uppercase tracking-wider leading-tight truncate">
          {NEXT_CALL.date}
        </p>
        <p className="font-body text-[11px] text-white/40 mt-0.5">{NEXT_CALL.time}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg"
        style={{ border: `1px solid rgba(212,167,78,0.35)` }}
      >
        <Video size={14} strokeWidth={1.5} style={{ color: GOLD }} />
        <span className="font-display text-[11px] uppercase tracking-wider" style={{ color: GOLD }}>
          Join Call
        </span>
      </motion.button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Topic filters
// ─────────────────────────────────────────────
function TopicFilters({ active, onChange }) {
  const items = [{ key: 'all', label: 'All', color: null }, ...TOPIC_KEYS.map(k => ({ key: k, ...TOPICS[k] }))];

  return (
    <div className="flex gap-2 px-5 mb-5 overflow-x-auto no-scrollbar">
      {items.map(item => {
        const isActive = active === item.key;
        return (
          <motion.button
            key={item.key}
            onClick={() => onChange(item.key)}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full shrink-0"
            style={{
              background: isActive
                ? (item.key === 'all'
                    ? `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})`
                    : `${item.color}1F`)
                : 'transparent',
              border: `1px solid ${
                isActive
                  ? (item.key === 'all' ? 'transparent' : `${item.color}55`)
                  : CARD_BORDER
              }`,
            }}
          >
            {item.color && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
            )}
            <span
              className="font-display text-[12px] uppercase tracking-wider"
              style={{
                color: isActive
                  ? (item.key === 'all' ? '#000' : item.color)
                  : 'rgba(255,255,255,0.55)',
              }}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Day separator
// ─────────────────────────────────────────────
function DaySeparator({ label }) {
  return (
    <div className="flex items-center gap-3 px-5 mb-5">
      <div className="flex-1 h-px" style={{ background: CARD_BORDER }} />
      <span className="font-display text-[10px] text-white/35 uppercase tracking-[0.25em]">
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
        style={{ border: '1.5px solid rgba(212,167,78,0.3)' }}
      >
        <img
          src={PHOTOS.bikiPortrait}
          alt={BIKI.name}
          className="w-full h-full object-cover"
          style={{ filter: 'grayscale(20%) contrast(1.05)' }}
        />
      </div>
      <span
        className="absolute -bottom-0 -right-0 w-2.5 h-2.5 rounded-full"
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
      className="rounded-2xl p-3 flex items-center gap-3 max-w-[78%]"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setPlaying(p => !p)}
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` }}
      >
        {playing
          ? <Pause size={14} strokeWidth={2.5} color="#000" fill="#000" />
          : <Play  size={14} strokeWidth={2.5} color="#000" fill="#000" style={{ marginLeft: 1 }} />}
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

      <span className="font-display text-[11px] tabular-nums text-white/60 shrink-0">
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
              className="rounded-2xl rounded-tl-md p-3.5"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <p className="flex items-center gap-1.5 mb-1.5">
                <span className="font-display text-[10px] uppercase tracking-wider" style={{ color: GOLD }}>
                  Coach
                </span>
                <span className="w-1 h-1 rounded-full" style={{ background: topic.color }} />
                <span className="font-display text-[10px] uppercase tracking-wider" style={{ color: topic.color }}>
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
                <span className="font-display text-[10px] uppercase tracking-wider" style={{ color: topic.color }}>
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
        className="rounded-2xl rounded-tr-md p-3.5 max-w-[78%]"
        style={{ background: '#F4F2EC' }}
      >
        <p className="font-body text-[14px] text-black/85 leading-relaxed">
          {msg.text}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-1.5 pr-1">
        <span className="font-body text-[10px] text-white/35 tabular-nums">{msg.time}</span>
        <span className="w-1 h-1 rounded-full" style={{ background: topic.color }} />
        <span className="font-display text-[10px] uppercase tracking-wider" style={{ color: topic.color }}>
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
    <div className="fixed bottom-[72px] left-0 right-0 z-20 px-4 pb-3 mx-auto" style={{ maxWidth: 430 }}>
      {/* Topic picker pop-up */}
      <AnimatePresence>
        {topicOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-2 mx-1 rounded-2xl p-2 flex flex-col gap-1"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
          >
            {TOPIC_KEYS.map(k => {
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
                    className="font-display text-[13px] uppercase tracking-wider flex-1"
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

      <div className="flex items-center gap-2">
        <button
          aria-label="Attach"
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <Plus size={18} strokeWidth={1.5} className="text-white/70" />
        </button>

        <div
          className="flex-1 flex items-stretch rounded-full overflow-hidden"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          {/* Topic chip */}
          <button
            onClick={() => setTopicOpen(o => !o)}
            className="flex items-center gap-1.5 pl-3 pr-2 my-1 mr-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="flex flex-col items-start leading-none">
              <span className="font-body text-[8px] text-white/35 uppercase tracking-wider">Topic</span>
              <span
                className="font-display text-[11px] uppercase tracking-wider"
                style={{ color: topicMeta.color }}
              >
                {topicMeta.label}
              </span>
            </div>
            <motion.span animate={{ rotate: topicOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={12} strokeWidth={1.5} className="text-white/40" />
            </motion.span>
          </button>

          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSend()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent font-body text-[14px] text-white placeholder:text-white/25 outline-none px-2"
          />
        </div>

        {value.trim() ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onSend}
            aria-label="Send"
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` }}
          >
            <Send size={16} strokeWidth={2} color="#000" />
          </motion.button>
        ) : (
          <button
            aria-label="Voice message"
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          >
            <Mic size={18} strokeWidth={1.5} className="text-white/70" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
export default function Coach({ onCheckIn, onBack }) {
  const { behaviorState } = useApp();
  const shouldReduce = useReducedMotion();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [activeTopic, setActiveTopic] = useState('all');
  const [inputTopic, setInputTopic] = useState('workout');

  const filtered = useMemo(() => {
    if (activeTopic === 'all') return messages;
    return messages.filter(m => m.topic === activeTopic);
  }, [messages, activeTopic]);

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
    <div className="min-h-screen pb-44" style={{ background: '#000' }}>
      <CoachHeader onBack={onBack} />
      <NextCallCard />
      <TopicFilters active={activeTopic} onChange={setActiveTopic} />

      {/* Check-in chip — quiet reminder, only when pending */}
      {CHECKIN_DUE.status === 'pending' && (
        <motion.button
          onClick={onCheckIn}
          whileTap={{ scale: 0.98 }}
          className="mx-5 mb-5 w-[calc(100%-2.5rem)] flex items-center justify-between px-4 py-2.5 rounded-xl"
          style={{ background: 'rgba(212,167,78,0.08)', border: '1px solid rgba(212,167,78,0.25)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
            <span className="font-display text-[11px] uppercase tracking-wider" style={{ color: GOLD }}>
              Weekly Check-in Due
            </span>
          </div>
          <span className="font-body text-[11px]" style={{ color: GOLD }}>
            Start →
          </span>
        </motion.button>
      )}

      <DaySeparator label="Today" />

      {/* Messages */}
      <div className="flex flex-col">
        {filtered.map((msg, i) => (
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
              className="rounded-2xl rounded-tl-md px-4 py-3 flex gap-1.5 items-center"
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

        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="font-body text-[13px] text-white/35">
              No messages in this topic yet.
            </p>
          </div>
        )}
      </div>

      <InputBar
        value={input}
        onChange={setInput}
        onSend={handleSend}
        topic={inputTopic}
        onTopicChange={setInputTopic}
      />
    </div>
  );
}
