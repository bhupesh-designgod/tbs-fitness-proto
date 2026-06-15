// ── Notifications Screen ──
// Coach messages, reminders, reviews, streaks. Grouped Today / Earlier.
// Unread rows carry a volt dot; tapping a row deep-links to its tab.

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MessageCircle, Utensils, Droplets, Dumbbell,
  ClipboardCheck, Flame, CalendarDays, Pill, Sparkles, BellOff,
} from 'lucide-react';
import { T, stagger } from '../tokens';
import { NOTIFICATIONS } from '../data/mockData';

// type → icon + accent
const TYPE_META = {
  coach:      { icon: MessageCircle,  accent: T.gold },
  meal:       { icon: Utensils,       accent: T.meal },
  hydration:  { icon: Droplets,       accent: T.water },
  training:   { icon: Dumbbell,       accent: T.gold },
  review:     { icon: ClipboardCheck, accent: T.gold },
  streak:     { icon: Flame,          accent: T.red },
  call:       { icon: CalendarDays,   accent: T.gold },
  plan:       { icon: Sparkles,       accent: T.gold },
  checkin:    { icon: ClipboardCheck, accent: T.gold },
  supplement: { icon: Pill,           accent: T.textMid },
};

function NotificationRow({ n, onOpen, delay }) {
  const meta = TYPE_META[n.type] || TYPE_META.coach;
  const Icon = meta.icon;
  return (
    <motion.button
      {...stagger(delay, 0.05)}
      whileTap={T.tap}
      onClick={() => onOpen(n)}
      className="w-full flex items-start gap-3 p-3.5 rounded-xl text-left relative"
      style={{
        background: n.read ? T.surface : T.surface2,
        border: `1px solid ${n.read ? T.hairline : T.hairlineStrong}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${meta.accent}1F`, border: `1px solid ${meta.accent}3D` }}
      >
        <Icon size={18} strokeWidth={T.stroke} style={{ color: meta.accent }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-body text-[14px] font-bold leading-tight flex-1" style={{ color: T.text }}>
            {n.title}
          </p>
          <span className="font-body text-[11px] font-semibold tabular-nums shrink-0" style={{ color: T.textFaint }}>
            {n.time}
          </span>
        </div>
        <p className="font-body text-[12px] leading-relaxed mt-1" style={{ color: T.textLow }}>
          {n.body}
        </p>
      </div>

      {/* Unread marker */}
      {!n.read && (
        <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full" style={{ background: T.volt }} />
      )}
    </motion.button>
  );
}

function Group({ label, items, onOpen, baseDelay }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-5">
      <p className="kicker px-1 mb-3">{label}</p>
      <div className="flex flex-col gap-2">
        {items.map((n, i) => (
          <NotificationRow key={n.id} n={n} onOpen={onOpen} delay={baseDelay + i} />
        ))}
      </div>
    </div>
  );
}

export default function Notifications({ onBack, onNavigate }) {
  const [items, setItems] = useState(NOTIFICATIONS);

  const today = useMemo(() => items.filter(n => n.group === 'today'), [items]);
  const earlier = useMemo(() => items.filter(n => n.group === 'earlier'), [items]);
  const unread = items.some(n => !n.read);

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));

  const open = (n) => {
    setItems(prev => prev.map(x => (x.id === n.id ? { ...x, read: true } : x)));
    if (n.target && n.target !== 'home') onNavigate?.(n.target);
    else onBack?.();
  };

  return (
    <div className="min-h-screen pb-10" style={{ background: T.bg }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-5 pt-4 pb-3 flex items-center gap-3"
        style={{ background: T.bg, borderBottom: `1px solid ${T.hairline}` }}
      >
        <button onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 -ml-1">
          <ArrowLeft size={18} strokeWidth={2} style={{ color: T.text }} />
        </button>
        <h1 className="display-sm text-[#F4F2EC] uppercase flex-1">Notifications</h1>
        {unread && (
          <button onClick={markAllRead} className="font-body text-[12px] font-bold shrink-0" style={{ color: T.gold }}>
            Mark all read
          </button>
        )}
      </div>

      <div className="px-5 pt-5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center pt-28">
            <BellOff size={28} strokeWidth={T.stroke} style={{ color: T.textFaint }} />
            <p className="display-xs text-[#F4F2EC] mt-4">All caught up</p>
            <p className="font-body text-[13px] mt-1" style={{ color: T.textLow }}>
              Nothing new. Go put in the work.
            </p>
          </div>
        ) : (
          <>
            <Group label="Today" items={today} onOpen={open} baseDelay={0} />
            <Group label="Earlier" items={earlier} onOpen={open} baseDelay={today.length} />
          </>
        )}
      </div>
    </div>
  );
}
