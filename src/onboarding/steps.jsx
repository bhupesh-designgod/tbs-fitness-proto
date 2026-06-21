// ── Onboarding screens (v3 — "The File") ──
// Single-select cards auto-advance; numeric/multi screens use a gold Next.
// Biki speaks only on the Door, Goal, Diet, Reveal. Gold is the only accent.

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, Check, Minus, Plus, Utensils, GlassWater, Nut,
  TrendingDown, TrendingUp, Dumbbell, Repeat, Trophy, Equal,
  Sunrise, Sun, Sunset, Moon, Camera, X, Upload, FileText,
  Fingerprint, Clock, Zap, Flame, Droplets, Bone, Activity,
} from 'lucide-react';
import { T } from '../tokens';
import { PHOTOS } from '../data/mockData';

// ─────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────
function BikiLine({ children }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: `1.5px solid ${T.goldBorder}` }}>
        <img src={PHOTOS.bikiPortrait} alt="Biki" className="w-full h-full object-cover" style={{ filter: 'grayscale(20%) contrast(1.05)' }} />
      </div>
      <p className="font-body text-[14px] leading-relaxed pt-1.5" style={{ color: T.textMid }}>{children}</p>
    </div>
  );
}

function Question({ children }) {
  return <h1 className="display-lg text-[#F4F2EC] mb-6">{children}</h1>;
}

function Scaffold({ children, onNext, ctaDisabled, ctaLabel = 'Next' }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4">{children}</div>
      <div className="px-5 pt-3 pb-6" style={{ background: T.bg }}>
        <motion.button whileTap={ctaDisabled ? undefined : T.tap} onClick={onNext} disabled={ctaDisabled} className="btn-primary">
          {ctaLabel}<ArrowRight size={18} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  );
}

function SelectCard({ icon, title, sub, selected, onSelect, big }) {
  return (
    <motion.button onClick={onSelect}
      animate={selected ? { scale: [1, 0.97, 1] } : { scale: 1 }} transition={{ duration: 0.2 }}
      className={`w-full flex items-center gap-3.5 rounded-xl text-left ${big ? 'p-4' : 'p-3.5'}`}
      style={{ background: selected ? T.goldTint : T.surface, border: `1.5px solid ${selected ? T.gold : T.hairline}` }}>
      {icon && (
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: selected ? T.gold : T.surface2, border: selected ? 'none' : `1px solid ${T.hairline}` }}>
          {icon(selected ? T.bg : T.textMid)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-body text-[15px] font-bold leading-tight" style={{ color: T.text }}>{title}</p>
        {sub && <p className="font-body text-[12px] mt-0.5 leading-snug" style={{ color: T.textLow }}>{sub}</p>}
      </div>
    </motion.button>
  );
}

function UnitToggle({ units, value, onChange }) {
  return (
    <div className="flex rounded-lg p-0.5" style={{ background: T.surface, border: `1px solid ${T.hairline}` }}>
      {units.map(u => {
        const active = u === value;
        return (
          <button key={u} onClick={() => onChange(u)}
            className="px-3 py-1.5 rounded-md font-body text-[12px] font-extrabold uppercase tracking-wider"
            style={{ background: active ? T.gold : 'transparent', color: active ? T.bg : T.textLow }}>{u}</button>
        );
      })}
    </div>
  );
}

// ── Hinge-style scroll wheel picker ──
const ITEM_H = 52;
const VISIBLE_ITEMS = 5;
const PICKER_H = ITEM_H * VISIBLE_ITEMS;

function HingeWheel({ value, onChange, items, format = v => v }) {
  const containerRef = useRef(null);
  const isScrolling = useRef(false);
  const timeoutRef = useRef(null);

  // Scroll to value on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const idx = items.indexOf(value);
    if (idx >= 0) {
      containerRef.current.scrollTop = idx * ITEM_H;
    }
  }, []); // eslint-disable-line

  // When value changes externally (e.g. unit toggle), scroll to it
  useEffect(() => {
    if (!containerRef.current || isScrolling.current) return;
    const idx = items.indexOf(value);
    if (idx >= 0) {
      containerRef.current.scrollTop = idx * ITEM_H;
    }
  }, [value, items]);

  const handleScroll = useCallback(() => {
    isScrolling.current = true;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const idx = Math.round(containerRef.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const v = items[clamped];
      if (v !== value) onChange(v);
      isScrolling.current = false;
    }, 80);
  }, [items, value, onChange]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="relative mx-auto" style={{ height: PICKER_H, maxWidth: 280 }}>
      {/* Selection highlight */}
      <div className="absolute left-0 right-0 pointer-events-none rounded-xl z-[1]"
        style={{
          top: ITEM_H * 2,
          height: ITEM_H,
          border: `1.5px solid ${T.goldBorder}`,
          background: T.goldTint,
        }} />
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 pointer-events-none z-[2]"
        style={{ height: ITEM_H * 2, background: `linear-gradient(${T.bg}, transparent)` }} />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none z-[2]"
        style={{ height: ITEM_H * 2, background: `linear-gradient(transparent, ${T.bg})` }} />
      {/* Scroll container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto no-scrollbar"
        style={{
          paddingTop: ITEM_H * 2,
          paddingBottom: ITEM_H * 2,
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map(v => {
          const active = v === value;
          return (
            <div key={v} className="flex items-center justify-center" style={{ height: ITEM_H, scrollSnapAlign: 'center' }}>
              <span className="font-display tabular-nums transition-all duration-150"
                style={{
                  fontSize: active ? 36 : 24,
                  color: active ? T.text : 'rgba(244,242,236,0.22)',
                  fontWeight: active ? 400 : 400,
                }}>{format(v)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function range(min, max, step = 1) {
  const out = [];
  for (let v = min; v <= max; v += step) out.push(Number(v.toFixed(2)));
  return out;
}

// ── Stepper row ──
function StepperRow({ icon, label, value, min, max, onChange, accentEmpty }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3.5" style={{ background: T.surface, border: `1px solid ${T.hairline}` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}>{icon}</div>
      <span className="font-body text-[14px] font-semibold flex-1" style={{ color: T.text }}>{label}</span>
      <div className="flex items-center gap-3.5">
        <motion.button whileTap={T.tapSmall} onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${T.hairlineStrong}` }}>
          <Minus size={15} strokeWidth={2.5} style={{ color: T.textMid }} />
        </motion.button>
        <span className="font-display text-[22px] tabular-nums w-5 text-center" style={{ color: value === 0 && accentEmpty ? T.textFaint : T.text }}>{value}</span>
        <motion.button whileTap={T.tapSmall} onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${T.hairlineStrong}` }}>
          <Plus size={15} strokeWidth={2.5} style={{ color: T.textMid }} />
        </motion.button>
      </div>
    </div>
  );
}

// ── Multi-add chip input (type → confirm → add another) ──
function ChipAdder({ tags, onAdd, onRemove, placeholder }) {
  const [draft, setDraft] = useState('');
  const commit = () => {
    const v = draft.trim();
    if (v && !tags.includes(v)) onAdd(v);
    setDraft('');
  };
  return (
    <div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full" style={{ background: T.goldTint, border: `1px solid ${T.goldBorder}` }}>
              <span className="font-body text-[13px] font-semibold" style={{ color: T.gold }}>{tag}</span>
              <button onClick={() => onRemove(tag)} className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(246, 180, 28,0.25)' }}>
                <X size={9} strokeWidth={2.5} style={{ color: T.gold }} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 rounded-xl pr-2" style={{ background: T.surface, border: `1px solid ${T.hairline}` }}>
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent font-body text-[15px] outline-none px-3.5 py-3 placeholder:text-white/20" style={{ color: T.text }} />
        <motion.button whileTap={T.tapSmall} onClick={commit} disabled={!draft.trim()} aria-label="Add"
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-30"
          style={{ background: draft.trim() ? T.gold : T.surface2, border: draft.trim() ? 'none' : `1px solid ${T.hairline}` }}>
          <Check size={16} strokeWidth={2.5} style={{ color: draft.trim() ? T.bg : T.textMid }} />
        </motion.button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 1 · The Door (tap CTA with shine animation)
// ═════════════════════════════════════════════
function DoorScreen({ next }) {
  return (
    <div className="relative h-full overflow-hidden" style={{ background: T.bg }}>
      <img src={PHOTOS.bikiPortrait} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'grayscale(100%) contrast(1.08) brightness(0.62)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,11,12,0.55) 0%, rgba(11,11,12,0.35) 40%, rgba(11,11,12,0.96) 100%)' }} />
      <div className="relative h-full flex flex-col p-5">
        <div className="pt-6 flex justify-center">
          <span className="font-display text-[40px] tracking-[0.08em]" style={{ color: T.gold }}>TBS</span>
        </div>
        <div className="flex-1" />
        <p className="font-display text-[32px] leading-[0.98] text-[#F4F2EC] mb-3 max-w-[92%]">
          You're not on a program.<br /><span style={{ color: T.gold }}>You're on my roster.</span>
        </p>
        <p className="font-body text-[14px] leading-relaxed mb-8 max-w-[84%]" style={{ color: T.textSub }}>
          I keep it small so every plan is built for one person. Let's get to work.
        </p>
        <motion.button whileTap={T.tap} onClick={next} className="btn-primary btn-shine-wrap">
          Let's do this<ArrowRight size={18} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 2 · Name
// ═════════════════════════════════════════════
function NameScreen({ answers, update, next }) {
  return (
    <Scaffold onNext={next} ctaDisabled={!answers.name.trim()}>
      <Question>WHAT SHOULD<br />I CALL YOU?</Question>
      <input autoFocus value={answers.name} onChange={e => update({ name: e.target.value })}
        onKeyDown={e => { if (e.key === 'Enter' && answers.name.trim()) next(); }} placeholder="Your name"
        className="w-full bg-transparent font-display text-[40px] outline-none placeholder:text-white/15"
        style={{ color: T.text, borderBottom: `2px solid ${T.hairlineStrong}`, paddingBottom: 8 }} />
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 3 · Age
// ═════════════════════════════════════════════
function AgeScreen({ answers, update, next }) {
  const items = useMemo(() => range(14, 90), []);
  return (
    <Scaffold onNext={next}>
      <Question>HOW OLD<br />ARE YOU?</Question>
      <div className="text-center mb-2">
        <span className="font-display text-[72px] leading-none" style={{ color: T.gold }}>{answers.age}</span>
        <p className="kicker mt-1">Years</p>
      </div>
      <HingeWheel value={answers.age} onChange={v => update({ age: v })} items={items} />
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 4 · Sex (auto)
// ═════════════════════════════════════════════
function SexScreen({ answers, selectNext }) {
  return (
    <div className="px-5 pt-2 h-full flex flex-col">
      <Question>SEX</Question>
      <div className="grid grid-cols-2 gap-3 flex-1 content-start">
        {[['m', 'Male', '♂'], ['f', 'Female', '♀']].map(([v, label, glyph]) => {
          const selected = answers.sex === v;
          return (
            <motion.button key={v} onClick={() => selectNext({ sex: v })} animate={selected ? { scale: [1, 0.97, 1] } : {}} transition={{ duration: 0.2 }}
              className="rounded-xl flex flex-col items-center justify-center gap-3"
              style={{ aspectRatio: '3/4', background: selected ? T.goldTint : T.surface, border: `1.5px solid ${selected ? T.gold : T.hairline}` }}>
              <span className="font-display text-[56px] leading-none" style={{ color: selected ? T.gold : T.textMid }}>{glyph}</span>
              <span className="font-body text-[15px] font-bold" style={{ color: T.text }}>{label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 5 · Height (Hinge-style scroll wheel + ft/cm)
// ═════════════════════════════════════════════
const CM_ITEMS = range(140, 215);
const IN_ITEMS = range(55, 84); // 4'7" .. 7'0"
const inFmt = (inch) => `${Math.floor(inch / 12)}'${inch % 12}"`;
function HeightScreen({ answers, update, next }) {
  const isCm = answers.heightUnit === 'cm';
  const cm = answers.height;
  const inch = Math.round(cm / 2.54);
  return (
    <Scaffold onNext={next}>
      <div className="flex items-start justify-between">
        <Question>HEIGHT</Question>
        <UnitToggle units={['cm', 'ft']} value={answers.heightUnit} onChange={u => update({ heightUnit: u })} />
      </div>
      <div className="text-center mb-2">
        <span className="font-display text-[64px] leading-none" style={{ color: T.gold }}>{isCm ? cm : inFmt(inch)}</span>
        <p className="kicker mt-1">{isCm ? 'Centimetres' : 'Feet / inches'}</p>
      </div>
      {isCm
        ? <HingeWheel value={cm} onChange={v => update({ height: v })} items={CM_ITEMS} />
        : <HingeWheel value={inch} onChange={v => update({ height: Math.round(v * 2.54) })} items={IN_ITEMS} format={inFmt} />}
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 6 · Weight (Hinge-style scroll wheel + kg/lb)
// ═════════════════════════════════════════════
const KG_ITEMS = range(35, 180);
const LB_ITEMS = range(77, 397);
function WeightScreen({ answers, update, next }) {
  const isKg = answers.weightUnit === 'kg';
  const lb = Math.round(answers.weight * 2.20462);
  return (
    <Scaffold onNext={next}>
      <div className="flex items-start justify-between">
        <Question>WEIGHT</Question>
        <UnitToggle units={['kg', 'lb']} value={answers.weightUnit} onChange={u => update({ weightUnit: u })} />
      </div>
      <div className="text-center mb-2">
        <span className="font-display text-[72px] leading-none" style={{ color: T.gold }}>{isKg ? answers.weight : lb}</span>
        <p className="kicker mt-1">{isKg ? 'Kilograms' : 'Pounds'}</p>
      </div>
      {isKg
        ? <HingeWheel value={answers.weight} onChange={v => update({ weight: v })} items={KG_ITEMS} />
        : <HingeWheel value={lb} onChange={v => update({ weight: Math.round(v / 2.20462) })} items={LB_ITEMS} />}
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 7 · Goal (auto, Biki speaks)
// ═════════════════════════════════════════════
const GOALS = [
  { v: 'weight_loss', title: 'Weight loss', sub: 'Drop overall body weight.', icon: c => <TrendingDown size={20} strokeWidth={T.stroke} style={{ color: c }} /> },
  { v: 'weight_gain', title: 'Weight gain', sub: 'Add healthy weight and size.', icon: c => <TrendingUp size={20} strokeWidth={T.stroke} style={{ color: c }} /> },
  { v: 'build', title: 'Build muscle', sub: 'Strength and lean mass.', icon: c => <Dumbbell size={20} strokeWidth={T.stroke} style={{ color: c }} /> },
  { v: 'recomp', title: 'Body recomposition', sub: 'Lose fat, build muscle at once.', icon: c => <Repeat size={20} strokeWidth={T.stroke} style={{ color: c }} /> },
  { v: 'maintain', title: 'General fitness', sub: 'Stay healthy, fit, and consistent.', icon: c => <Equal size={20} strokeWidth={T.stroke} style={{ color: c }} /> },
  { v: 'competition', title: 'Competition prep', sub: 'Stage-ready conditioning.', icon: c => <Trophy size={20} strokeWidth={T.stroke} style={{ color: c }} /> },
];
function GoalScreen({ answers, selectNext }) {
  return (
    <div className="px-5 pt-2 h-full overflow-y-auto">
      <BikiLine>Pick one. We can adjust.</BikiLine>
      <Question>YOUR GOAL</Question>
      <div className="flex flex-col gap-2.5 pb-4">
        {GOALS.map(g => (
          <SelectCard key={g.v} icon={g.icon} title={g.title} sub={g.sub} selected={answers.goal === g.v} onSelect={() => selectNext({ goal: g.v })} />
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 8 · Motivation — halfway checkpoint
// ═════════════════════════════════════════════
function MotivationScreen({ answers, next }) {
  const shouldReduce = useReducedMotion();
  const firstName = (answers.name || '').split(' ')[0] || 'champ';
  return (
    <div className="relative h-full overflow-hidden flex flex-col" style={{ background: T.bg }}>
      {/* Subtle gradient bg */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(246, 180, 28,0.08) 0%, transparent 70%)',
      }} />

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Gold kicker */}
        <motion.p
          initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: T.easeOut }}
          className="kicker kicker-gold mb-6"
        >Keep going!</motion.p>

        {/* Medal with glow pulse */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: T.easeOut }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 rounded-full" style={{
            background: 'radial-gradient(circle, rgba(246, 180, 28,0.3) 0%, transparent 65%)',
            transform: 'scale(1.6)',
            animation: 'pulse-glow 2.5s ease-in-out infinite',
          }} />
          <img src="/medal.png" alt="Gold medal" className="relative w-36 h-36 object-contain" style={{ mixBlendMode: 'screen' }} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={shouldReduce ? {} : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4, ease: T.easeOut }}
          className="display-lg text-[#F4F2EC] mb-4"
        >
          YOU'RE HALFWAY<br />THERE, {firstName.toUpperCase()}.
        </motion.h1>

        {/* Body */}
        <motion.p
          initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: T.easeOut }}
          className="font-body text-[15px] leading-relaxed max-w-[300px]"
          style={{ color: T.textMid }}
        >
          Picture yourself 12 weeks from now — stronger, leaner, in full control of your nutrition.
          That's exactly where this plan takes you.
        </motion.p>
      </div>

      {/* CTA */}
      <motion.div
        initial={shouldReduce ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 px-5 pt-3 pb-6"
      >
        <motion.button whileTap={T.tap} onClick={next} className="btn-primary">
          Continue<ArrowRight size={18} strokeWidth={2.5} />
        </motion.button>
      </motion.div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 9 · Experience + preferred training time (Next)
// ═════════════════════════════════════════════
const EXP = [
  { v: 'beginner', title: 'Beginner', sub: 'Less than 6 months of consistent training, or returning after a long break.' },
  { v: 'intermediate', title: 'Intermediate', sub: '6 months – 2 years of consistent training with some structure.' },
  { v: 'advanced', title: 'Advanced', sub: '2+ years of structured, disciplined training — it\'s part of your lifestyle.' },
];
const TIMES = [
  { v: 'morning', label: 'Morning', icon: Sunrise },
  { v: 'midday', label: 'Midday', icon: Sun },
  { v: 'evening', label: 'Evening', icon: Sunset },
  { v: 'night', label: 'Night', icon: Moon },
];
function ExperienceScreen({ answers, update, next }) {
  return (
    <Scaffold onNext={next} ctaDisabled={!answers.experience}>
      <Question>YOUR LEVEL</Question>
      <div className="flex flex-col gap-2.5 mb-7">
        {EXP.map(e => (
          <SelectCard key={e.v} title={e.title} sub={e.sub} big selected={answers.experience === e.v} onSelect={() => update({ experience: e.v })} />
        ))}
      </div>
      <p className="kicker mb-3">When do you usually train?</p>
      <div className="grid grid-cols-4 gap-2">
        {TIMES.map(t => {
          const on = answers.trainingTime === t.v;
          const Icon = t.icon;
          return (
            <motion.button key={t.v} whileTap={T.tap} onClick={() => update({ trainingTime: t.v })}
              className="rounded-xl flex flex-col items-center justify-center gap-1.5 py-3"
              style={{ background: on ? T.goldTint : T.surface, border: `1.5px solid ${on ? T.gold : T.hairline}` }}>
              <Icon size={18} strokeWidth={T.stroke} style={{ color: on ? T.gold : T.textMid }} />
              <span className="font-body text-[11px] font-bold" style={{ color: on ? T.gold : T.textMid }}>{t.label}</span>
            </motion.button>
          );
        })}
      </div>
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 9 · Daily activity (auto)
// ═════════════════════════════════════════════
const ROUTINES = [
  { v: 'sedentary', title: 'Sedentary', sub: 'Desk job, barely move outside of workouts.' },
  { v: 'lightly_active', title: 'Lightly active', sub: 'On your feet a bit — light walking, errands, casual movement.' },
  { v: 'moderately_active', title: 'Moderately active', sub: 'Moving through the day — retail, teaching, regular walks.' },
  { v: 'very_active', title: 'Very active', sub: 'Always on the go — active job, sports, or outdoor lifestyle.' },
  { v: 'physically_demanding', title: 'Physically demanding', sub: 'Construction, warehouse, farming — your body works all day.' },
];
function RoutineScreen({ answers, selectNext }) {
  return (
    <div className="px-5 pt-2 h-full overflow-y-auto">
      <Question>YOUR DAY</Question>
      <p className="font-body text-[14px] mb-5" style={{ color: T.textLow }}>Outside of training, what does a typical day look like?</p>
      <div className="flex flex-col gap-2.5 pb-4">
        {ROUTINES.map(r => (
          <SelectCard key={r.v} title={r.title} sub={r.sub} selected={answers.routine === r.v} onSelect={() => selectNext({ routine: r.v })} />
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 10 · Diet (auto, Biki speaks)
// ═════════════════════════════════════════════
const DIETS = [
  { v: 'vegetarian', title: 'Vegetarian' },
  { v: 'non-vegetarian', title: 'Non-vegetarian' },
  { v: 'eggetarian', title: 'Eggetarian' },
  { v: 'vegan', title: 'Vegan' },
];
function DietScreen({ answers, selectNext }) {
  return (
    <div className="px-5 pt-2 h-full overflow-y-auto">
      <BikiLine>Now food. Be specific.</BikiLine>
      <Question>DIET STYLE</Question>
      <div className="grid grid-cols-2 gap-3">
        {DIETS.map(d => {
          const selected = answers.diet === d.v;
          return (
            <motion.button key={d.v} onClick={() => selectNext({ diet: d.v })} animate={selected ? { scale: [1, 0.97, 1] } : {}} transition={{ duration: 0.2 }}
              className="rounded-xl flex items-center justify-center text-center px-3"
              style={{ aspectRatio: '1/1', background: selected ? T.goldTint : T.surface, border: `1.5px solid ${selected ? T.gold : T.hairline}` }}>
              <span className="font-body text-[15px] font-bold leading-tight" style={{ color: T.text }}>{d.title}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 11 · Day Builder
// ═════════════════════════════════════════════
function DayBuilder({ answers, update, next }) {
  const strip = [];
  for (let i = 0; i < answers.meals_per_day; i++) strip.push({ k: `m${i}`, icon: <Utensils size={15} strokeWidth={2} style={{ color: T.gold }} /> });
  for (let i = 0; i < answers.shakes_per_day; i++) strip.push({ k: `s${i}`, icon: <GlassWater size={15} strokeWidth={2} style={{ color: T.cobalt }} /> });
  for (let i = 0; i < answers.snacks_per_day; i++) strip.push({ k: `n${i}`, icon: <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.textMid }} /> });

  return (
    <Scaffold onNext={next}>
      <Question>BUILD YOUR DAY</Question>
      <p className="font-body text-[14px] mb-5" style={{ color: T.textLow }}>How a normal day of eating looks for you.</p>
      <div className="rounded-xl p-4 mb-5 min-h-[64px] flex items-center" style={{ background: T.surface, border: `1px solid ${T.hairline}` }}>
        {strip.length === 0 ? (
          <span className="font-body text-[12px]" style={{ color: T.textFaint }}>Adjust below to build your day…</span>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {strip.map(s => (
              <motion.div key={s.k} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={T.spring}
                className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}>{s.icon}</motion.div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        <StepperRow icon={<Utensils size={18} strokeWidth={T.stroke} style={{ color: T.gold }} />} label="Meals" value={answers.meals_per_day} min={1} max={6} onChange={v => update({ meals_per_day: v })} />
        <StepperRow icon={<GlassWater size={18} strokeWidth={T.stroke} style={{ color: T.cobalt }} />} label="Shakes" value={answers.shakes_per_day} min={0} max={4} onChange={v => update({ shakes_per_day: v })} accentEmpty />
        <StepperRow icon={<Nut size={18} strokeWidth={T.stroke} style={{ color: T.textMid }} />} label="Snacks" value={answers.snacks_per_day} min={0} max={4} onChange={v => update({ snacks_per_day: v })} accentEmpty />
      </div>
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 12 · Supplements & anabolics
// ═════════════════════════════════════════════
const ANABOLIC = [
  { v: 'none', label: 'None' },
  { v: 'past', label: 'In the past' },
  { v: 'current', label: 'Currently' },
];
function SupplementsScreen({ answers, update, next }) {
  return (
    <Scaffold onNext={next}>
      <Question>SUPPLEMENTS</Question>
      <p className="font-body text-[14px] mb-5" style={{ color: T.textLow }}>Straight answers help Biki program safely.</p>
      <p className="kicker mb-2.5">What are you taking?</p>
      <div className="mb-7">
        <ChipAdder tags={answers.supplements} placeholder="Type one and confirm…"
          onAdd={t => update({ supplements: [...answers.supplements, t] })}
          onRemove={t => update({ supplements: answers.supplements.filter(x => x !== t) })} />
      </div>
      <p className="kicker mb-2.5">Anabolic use</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {ANABOLIC.map(a => {
          const on = answers.anabolics === a.v;
          return (
            <motion.button key={a.v} whileTap={T.tap} onClick={() => update({ anabolics: a.v })}
              className="py-3 rounded-xl font-body text-[13px] font-bold"
              style={{ background: on ? T.goldTint : T.surface, border: `1.5px solid ${on ? T.gold : T.hairline}`, color: on ? T.gold : T.textMid }}>{a.label}</motion.button>
          );
        })}
      </div>
      {(answers.anabolics === 'past' || answers.anabolics === 'current') && (
        <input value={answers.anabolicsNote} onChange={e => update({ anabolicsNote: e.target.value })}
          placeholder="Optional — what and when. Stays private."
          className="w-full rounded-xl px-3.5 py-3 font-body text-[14px] outline-none placeholder:text-white/20"
          style={{ background: T.surface, border: `1px solid ${T.hairline}`, color: T.text }} />
      )}
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 13 · Allergies / avoids (multi-add)
// ═════════════════════════════════════════════
const ALLERGENS = ['Peanut', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs'];
function AllergiesScreen({ answers, update, next }) {
  const toggle = (a) => {
    const has = answers.allergies.includes(a);
    update({ allergies: has ? answers.allergies.filter(x => x !== a) : [...answers.allergies, a] });
  };
  return (
    <Scaffold onNext={next}>
      <Question>ANYTHING YOU<br />CAN'T EAT?</Question>
      <div className="flex flex-wrap gap-2 mb-6">
        {ALLERGENS.map(a => {
          const on = answers.allergies.includes(a);
          return (
            <motion.button key={a} whileTap={T.tap} onClick={() => toggle(a)} className="px-4 py-2.5 rounded-full font-body text-[14px] font-semibold"
              style={{ background: on ? T.goldTint : T.surface, border: `1px solid ${on ? T.goldBorder : T.hairline}`, color: on ? T.gold : T.textMid }}>{a}</motion.button>
          );
        })}
      </div>
      <p className="kicker mb-2.5">Anything else? Add your own</p>
      <ChipAdder
        tags={answers.allergies.filter(a => !ALLERGENS.includes(a))}
        placeholder="e.g. no red meat"
        onAdd={t => update({ allergies: [...answers.allergies, t] })}
        onRemove={t => update({ allergies: answers.allergies.filter(x => x !== t) })}
      />
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 14 · Starting photos
// ═════════════════════════════════════════════
function PhotoTile({ label, filled, onClick }) {
  return (
    <motion.button whileTap={T.tap} onClick={onClick}
      className="flex-1 aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-2"
      style={{ background: filled ? T.goldTint : T.surface, border: `1px ${filled ? 'solid' : 'dashed'} ${filled ? T.goldBorder : T.hairlineStrong}` }}>
      {filled ? <Check size={22} strokeWidth={2.5} style={{ color: T.gold }} /> : <Camera size={20} strokeWidth={T.stroke} style={{ color: T.textMid }} />}
      <span className="font-body text-[11px] font-bold uppercase tracking-wider" style={{ color: filled ? T.gold : T.textLow }}>{label}</span>
    </motion.button>
  );
}
function PhotosScreen({ answers, update, next, skipField }) {
  const setAngle = (a) => update({ photos: { ...answers.photos, [a]: !answers.photos[a] } });
  return (
    <Scaffold onNext={next}>
      <Question>STARTING<br />PHOTOS</Question>
      <p className="font-body text-[14px] mb-5" style={{ color: T.textLow }}>Front, back, and side. We track changes against these.</p>
      <div className="flex gap-3 mb-5">
        <PhotoTile label="Front" filled={answers.photos.front} onClick={() => setAngle('front')} />
        <PhotoTile label="Back" filled={answers.photos.back} onClick={() => setAngle('back')} />
        <PhotoTile label="Side" filled={answers.photos.side} onClick={() => setAngle('side')} />
      </div>
      <button onClick={skipField} className="w-full flex items-center justify-between rounded-xl px-3.5 py-3" style={{ border: `1px solid ${T.hairline}` }}>
        <span className="font-body text-[12px]" style={{ color: T.textLow }}>Not ready? Add them later from your profile.</span>
        <span className="font-body text-[12px] font-bold shrink-0 ml-3" style={{ color: T.gold }}>Skip for now</span>
      </button>
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 15 · Bloodwork
// ═════════════════════════════════════════════
function BloodworkScreen({ answers, update, next, skipField }) {
  const hasFile = answers.bloodwork;
  return (
    <Scaffold onNext={next}>
      <Question>BLOODWORK</Question>
      <p className="font-body text-[14px] mb-6" style={{ color: T.textLow }}>
        Upload recent bloodwork if you have it. Biki uses this to fine-tune your plan.
      </p>

      {/* Upload area */}
      <motion.button
        whileTap={T.tap}
        onClick={() => update({ bloodwork: !hasFile })}
        className="w-full rounded-xl flex flex-col items-center justify-center gap-3 py-10 mb-5"
        style={{
          background: hasFile ? T.goldTint : T.surface,
          border: `1.5px ${hasFile ? 'solid' : 'dashed'} ${hasFile ? T.goldBorder : T.hairlineStrong}`,
        }}
      >
        {hasFile ? (
          <>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: T.gold }}>
              <FileText size={26} strokeWidth={1.75} style={{ color: T.bg }} />
            </div>
            <span className="font-body text-[14px] font-bold" style={{ color: T.gold }}>Report uploaded</span>
            <span className="font-body text-[12px]" style={{ color: T.textLow }}>Tap to remove</span>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}>
              <Upload size={24} strokeWidth={1.75} style={{ color: T.textMid }} />
            </div>
            <span className="font-body text-[14px] font-semibold" style={{ color: T.text }}>Tap to upload report</span>
            <span className="font-body text-[12px]" style={{ color: T.textLow }}>PDF, photo, or screenshot</span>
          </>
        )}
      </motion.button>

      {/* Kidney function test */}
      <p className="kicker mb-2.5">Recent kidney function test?</p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[{ v: 'yes', label: 'Yes' }, { v: 'no', label: 'No' }, { v: 'unsure', label: 'Not sure' }].map(o => {
          const on = answers.kidneyTest === o.v;
          return (
            <motion.button key={o.v} whileTap={T.tap} onClick={() => update({ kidneyTest: o.v })}
              className="py-3 rounded-xl font-body text-[13px] font-bold"
              style={{ background: on ? T.goldTint : T.surface, border: `1.5px solid ${on ? T.gold : T.hairline}`, color: on ? T.gold : T.textMid }}>
              {o.label}
            </motion.button>
          );
        })}
      </div>

      {/* Add later option */}
      <button
        onClick={() => { update({ bloodworkSkipped: true }); skipField(); }}
        className="w-full flex items-center justify-between rounded-xl px-3.5 py-3"
        style={{ border: `1px solid ${T.hairline}` }}
      >
        <span className="font-body text-[12px]" style={{ color: T.textLow }}>Don't have it handy? No stress.</span>
        <span className="font-body text-[12px] font-bold shrink-0 ml-3" style={{ color: T.gold }}>I'll add it later</span>
      </button>
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// Training availability (reworked "hours per week")
// ═════════════════════════════════════════════
const SESSION_LENGTHS = [
  { v: '30', label: '~30 min', icon: Clock },
  { v: '45', label: '~45 min', icon: Activity },
  { v: '60', label: '~60 min', icon: Zap },
  { v: '90', label: '90+ min', icon: Flame },
];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
function TrainingAvailabilityScreen({ answers, update, next }) {
  const count = answers.preferredDays.length;
  // Days/week is derived from the days the user can actually show up.
  const toggleDay = (d) => {
    const has = answers.preferredDays.includes(d);
    const nextDays = has ? answers.preferredDays.filter(x => x !== d) : [...answers.preferredDays, d];
    update({ preferredDays: nextDays, trainingDays: nextDays.length });
  };
  return (
    <Scaffold onNext={next} ctaDisabled={!answers.sessionLength || count === 0}>
      <Question>WHEN CAN<br />YOU TRAIN?</Question>
      <p className="font-body text-[14px] mb-6" style={{ color: T.textLow }}>
        Be honest about a normal week, not your best one. Biki builds around what's real.
      </p>

      <div className="flex items-baseline justify-between mb-2.5">
        <p className="kicker mb-0">Which days work best?</p>
        <span className="font-body text-[11px] font-bold tabular-nums" style={{ color: count ? T.gold : T.textFaint }}>
          {count} {count === 1 ? 'day' : 'days'} / week
        </span>
      </div>
      <div className="flex justify-between gap-1.5 mb-2.5">
        {WEEKDAYS.map(d => {
          const on = answers.preferredDays.includes(d);
          return (
            <motion.button
              key={d}
              whileTap={{ scale: 0.82 }}
              onClick={() => toggleDay(d)}
              animate={on ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.28, ease: T.easeOut }}
              className="flex-1 aspect-square rounded-full flex items-center justify-center font-body text-[14px] font-extrabold"
              style={{
                background: on ? T.gold : T.surface,
                color: on ? T.goldInk : T.textMid,
                border: `1.5px solid ${on ? T.gold : T.hairline}`,
                boxShadow: on ? `0 4px 14px ${T.goldTint}` : 'none',
              }}
            >
              {d[0]}
            </motion.button>
          );
        })}
      </div>
      <p className="font-body text-[11px] mb-6" style={{ color: T.textFaint }}>
        Tap the days you can realistically show up.
      </p>

      <p className="kicker mb-2.5">Typical session length</p>
      <div className="grid grid-cols-4 gap-2 mb-2">
        {SESSION_LENGTHS.map(s => {
          const on = answers.sessionLength === s.v;
          const Icon = s.icon;
          return (
            <motion.button key={s.v} whileTap={T.tap} onClick={() => update({ sessionLength: s.v })}
              className="rounded-xl flex flex-col items-center justify-center gap-1.5 py-3 font-body text-[12px] font-bold"
              style={{ background: on ? T.goldTint : T.surface, border: `1.5px solid ${on ? T.gold : T.hairline}`, color: on ? T.gold : T.textMid }}>
              <Icon size={18} strokeWidth={T.stroke} style={{ color: on ? T.gold : T.textMid }} />
              {s.label}
            </motion.button>
          );
        })}
      </div>
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// Medical — injuries / conditions
// ═════════════════════════════════════════════
const COMMON_INJURIES = [
  { label: 'Shoulder', icon: Activity },
  { label: 'Lower back', icon: Bone },
  { label: 'Knee', icon: Bone },
  { label: 'Wrist / elbow', icon: Activity },
  { label: 'Neck', icon: Bone },
  { label: 'Hip', icon: Bone },
];
// Toggle a chip label inside a comma-separated string.
function toggleToken(str, token) {
  const parts = str.split(',').map(s => s.trim()).filter(Boolean);
  const has = parts.some(p => p.toLowerCase() === token.toLowerCase());
  const next = has ? parts.filter(p => p.toLowerCase() !== token.toLowerCase()) : [...parts, token];
  return next.join(', ');
}
function MedicalScreen({ answers, update, next }) {
  const injuries = answers.injuries || '';
  const hasToken = (t) => injuries.split(',').some(p => p.trim().toLowerCase() === t.toLowerCase());
  const allGood = injuries.trim() === '' && answers.injuriesNone;
  return (
    <Scaffold onNext={next}>
      <Question>YOUR BODY</Question>
      <p className="font-body text-[14px] mb-5" style={{ color: T.textLow }}>
        Anything Biki should program around? Tap what applies — the more honest, the safer your plan.
      </p>

      <p className="kicker mb-2.5">Any niggles or past injuries?</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {COMMON_INJURIES.map(c => {
          const on = hasToken(c.label);
          const Icon = c.icon;
          return (
            <motion.button key={c.label} whileTap={T.tap}
              onClick={() => update({ injuries: toggleToken(injuries, c.label), injuriesNone: false })}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full font-body text-[13px] font-semibold"
              style={{ background: on ? T.goldTint : T.surface, border: `1px solid ${on ? T.goldBorder : T.hairline}`, color: on ? T.gold : T.textMid }}>
              <Icon size={13} strokeWidth={T.stroke} style={{ color: on ? T.gold : T.textMid }} />
              {c.label}
            </motion.button>
          );
        })}
        <motion.button whileTap={T.tap}
          onClick={() => update({ injuries: '', injuriesNone: !allGood })}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full font-body text-[13px] font-semibold"
          style={{ background: allGood ? T.goldTint : T.surface, border: `1px solid ${allGood ? T.goldBorder : T.hairline}`, color: allGood ? T.gold : T.textMid }}>
          <Check size={13} strokeWidth={2.5} style={{ color: allGood ? T.gold : T.textMid }} />
          All good
        </motion.button>
      </div>
      <textarea value={injuries} onChange={e => update({ injuries: e.target.value, injuriesNone: false })}
        rows={2} placeholder="Add detail — e.g. left shoulder impingement, flares on overhead press"
        className="w-full rounded-xl px-3.5 py-3 mb-6 font-body text-[14px] outline-none resize-none placeholder:text-white/20"
        style={{ background: T.surface, border: `1px solid ${T.hairline}`, color: T.text }} />

      <p className="kicker mb-2.5">Diagnosed conditions or ongoing issues</p>
      <textarea value={answers.conditions} onChange={e => update({ conditions: e.target.value })}
        rows={2} placeholder="e.g. hypertension, PCOS, thyroid — or leave blank"
        className="w-full rounded-xl px-3.5 py-3 font-body text-[14px] outline-none resize-none placeholder:text-white/20"
        style={{ background: T.surface, border: `1px solid ${T.hairline}`, color: T.text }} />
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// Sleep — sleep time, wake time, duration
// ═════════════════════════════════════════════
const SLEEP_DURATIONS = [
  { v: '<5', label: 'Under 5h' },
  { v: '5-6', label: '5–6h' },
  { v: '6-7', label: '6–7h' },
  { v: '7-8', label: '7–8h' },
  { v: '8+', label: '8h+' },
];
function SleepScreen({ answers, update, next }) {
  return (
    <Scaffold onNext={next}>
      <Question>SLEEP</Question>
      <p className="font-body text-[14px] mb-6" style={{ color: T.textLow }}>
        Recovery is built here. Roughly when do you sleep and wake?
      </p>

      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <p className="kicker mb-2">Sleep at</p>
          <input type="time" value={answers.sleepTime} onChange={e => update({ sleepTime: e.target.value })}
            className="w-full rounded-xl px-3.5 py-3 font-body text-[15px] outline-none"
            style={{ background: T.surface, border: `1px solid ${T.hairline}`, color: T.text, colorScheme: 'dark' }} />
        </div>
        <div className="flex-1">
          <p className="kicker mb-2">Wake at</p>
          <input type="time" value={answers.wakeTime} onChange={e => update({ wakeTime: e.target.value })}
            className="w-full rounded-xl px-3.5 py-3 font-body text-[15px] outline-none"
            style={{ background: T.surface, border: `1px solid ${T.hairline}`, color: T.text, colorScheme: 'dark' }} />
        </div>
      </div>

      <p className="kicker mb-2.5">Average sleep</p>
      <div className="grid grid-cols-5 gap-2">
        {SLEEP_DURATIONS.map(s => {
          const on = answers.sleepDuration === s.v;
          return (
            <motion.button key={s.v} whileTap={T.tap} onClick={() => update({ sleepDuration: s.v })}
              className="py-2.5 rounded-xl font-body text-[11px] font-bold"
              style={{ background: on ? T.goldTint : T.surface, border: `1.5px solid ${on ? T.gold : T.hairline}`, color: on ? T.gold : T.textMid }}>
              {s.label}
            </motion.button>
          );
        })}
      </div>
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// Food preferences — favorite foods + water
// ═════════════════════════════════════════════
const WATER = [
  { v: '<1', label: 'Under 1L' }, { v: '1-2', label: '1–2L' },
  { v: '2-3', label: '2–3L' }, { v: '3+', label: '3L+' },
];
function FoodPrefsScreen({ answers, update, next }) {
  return (
    <Scaffold onNext={next}>
      <Question>FUEL &<br />HYDRATION</Question>
      <p className="font-body text-[14px] mb-5" style={{ color: T.textLow }}>
        The food you actually enjoy and how much you drink. Biki builds the plan around these so it sticks.
      </p>
      <p className="kicker mb-2.5 flex items-center gap-1.5">
        <Utensils size={13} strokeWidth={T.stroke} style={{ color: T.gold }} /> Favorite foods
      </p>
      <div className="mb-7">
        <ChipAdder tags={answers.favoriteFoods} placeholder="e.g. paneer, oats, chicken biryani…"
          onAdd={t => update({ favoriteFoods: [...answers.favoriteFoods, t] })}
          onRemove={t => update({ favoriteFoods: answers.favoriteFoods.filter(x => x !== t) })} />
      </div>
      <p className="kicker mb-2.5 flex items-center gap-1.5">
        <Droplets size={13} strokeWidth={T.stroke} style={{ color: T.water }} /> Water per day
      </p>
      <div className="grid grid-cols-4 gap-2">
        {WATER.map(w => {
          const on = answers.water === w.v;
          return (
            <motion.button key={w.v} whileTap={T.tap} onClick={() => update({ water: w.v })}
              className="py-3 rounded-xl font-body text-[12px] font-bold"
              style={{ background: on ? T.goldTint : T.surface, border: `1.5px solid ${on ? T.gold : T.hairline}`, color: on ? T.gold : T.textMid }}>
              {w.label}
            </motion.button>
          );
        })}
      </div>
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// Digestion — rating, acidity, issues
// ═════════════════════════════════════════════
const DIGESTION = [{ v: 'good', label: 'Good' }, { v: 'average', label: 'Average' }, { v: 'poor', label: 'Poor' }];
const ACIDITY = [
  { v: 'never', label: 'Never', sub: 'No symptoms' },
  { v: 'occasionally', label: 'Occasionally', sub: 'A few times a month' },
  { v: 'frequently', label: 'Frequently', sub: 'Most weeks' },
  { v: 'daily', label: 'Daily', sub: 'Almost every day' },
];
const DIGESTIVE_ISSUES = ['Bloating', 'Constipation', 'Gas', 'Stomach pain', 'Loose motions', 'None'];
function DigestionScreen({ answers, update, next }) {
  const toggleIssue = (x) => {
    if (x === 'None') { update({ digestiveIssues: answers.digestiveIssues.includes('None') ? [] : ['None'] }); return; }
    const base = answers.digestiveIssues.filter(i => i !== 'None');
    const has = base.includes(x);
    update({ digestiveIssues: has ? base.filter(i => i !== x) : [...base, x] });
  };
  return (
    <Scaffold onNext={next}>
      <Question>DIGESTION</Question>
      <p className="kicker mb-2.5">How's your digestion?</p>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {DIGESTION.map(d => {
          const on = answers.digestion === d.v;
          return (
            <motion.button key={d.v} whileTap={T.tap} onClick={() => update({ digestion: d.v })}
              className="py-3 rounded-xl font-body text-[13px] font-bold"
              style={{ background: on ? T.goldTint : T.surface, border: `1.5px solid ${on ? T.gold : T.hairline}`, color: on ? T.gold : T.textMid }}>
              {d.label}
            </motion.button>
          );
        })}
      </div>
      <p className="kicker mb-1.5">Acidity or acid reflux</p>
      <p className="font-body text-[12px] mb-2.5 leading-snug" style={{ color: T.textFaint }}>
        Acid reflux is that burning or sour feeling when stomach acid rises into your chest or throat (heartburn). How often does it happen?
      </p>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {ACIDITY.map(a => {
          const on = answers.acidity === a.v;
          return (
            <motion.button key={a.v} whileTap={T.tap} onClick={() => update({ acidity: a.v })}
              className="flex flex-col items-start text-left py-2.5 px-3 rounded-xl"
              style={{ background: on ? T.goldTint : T.surface, border: `1.5px solid ${on ? T.gold : T.hairline}` }}>
              <span className="font-body text-[13px] font-bold" style={{ color: on ? T.gold : T.textMid }}>{a.label}</span>
              <span className="font-body text-[11px] mt-0.5" style={{ color: T.textFaint }}>{a.sub}</span>
            </motion.button>
          );
        })}
      </div>
      <p className="kicker mb-2.5">Any of these? (optional)</p>
      <div className="flex flex-wrap gap-2">
        {DIGESTIVE_ISSUES.map(x => {
          const on = answers.digestiveIssues.includes(x);
          return (
            <motion.button key={x} whileTap={T.tap} onClick={() => toggleIssue(x)}
              className="px-3.5 py-2.5 rounded-full font-body text-[13px] font-semibold"
              style={{ background: on ? T.goldTint : T.surface, border: `1px solid ${on ? T.goldBorder : T.hairline}`, color: on ? T.gold : T.textMid }}>
              {x}
            </motion.button>
          );
        })}
      </div>
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// Notes — anything else
// ═════════════════════════════════════════════
function NotesScreen({ answers, update, next }) {
  return (
    <Scaffold onNext={next} ctaLabel="Finish">
      <Question>ANYTHING<br />ELSE?</Question>
      <p className="font-body text-[14px] mb-5" style={{ color: T.textLow }}>
        Health, food habits, lifestyle, goals — anything you want Biki to know.
      </p>
      <textarea value={answers.notes} onChange={e => update({ notes: e.target.value })}
        rows={5} placeholder="Optional. Write as much or as little as you like."
        className="w-full rounded-xl px-3.5 py-3 font-body text-[14px] outline-none resize-none placeholder:text-white/20"
        style={{ background: T.surface, border: `1px solid ${T.hairline}`, color: T.text }} />
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 16 · The Reveal (file assembly + tap commit)
// ═════════════════════════════════════════════
const GOAL_LABEL = { weight_loss: 'Weight loss', weight_gain: 'Weight gain', build: 'Build muscle', recomp: 'Body recomp', maintain: 'General fitness', competition: 'Competition prep' };
const DIET_LABEL = { vegetarian: 'Vegetarian', 'non-vegetarian': 'Non-vegetarian', eggetarian: 'Eggetarian', vegan: 'Vegan' };
const EXP_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const ROUTINE_LABEL = { sedentary: 'Sedentary', lightly_active: 'Lightly active', moderately_active: 'Moderately active', very_active: 'Very active', physically_demanding: 'Physically demanding' };
const TIME_LABEL = { morning: 'Morning', midday: 'Midday', evening: 'Evening', night: 'Night' };

function RevealScreen({ answers, next }) {
  const shouldReduce = useReducedMotion();
  const rows = [
    ['Name', answers.name || '—'],
    ['Age', `${answers.age}`],
    ['Stats', `${answers.height} cm · ${answers.weight} kg`],
    ['Goal', GOAL_LABEL[answers.goal] || '—'],
    ['Level', EXP_LABEL[answers.experience] || '—'],
    ['Activity', ROUTINE_LABEL[answers.routine] || '—'],
    ['Training', TIME_LABEL[answers.trainingTime] || '—'],
    ['Diet', DIET_LABEL[answers.diet] || '—'],
    ['Day plan', `${answers.meals_per_day} meals · ${answers.shakes_per_day} shakes · ${answers.snacks_per_day} snacks`],
    ...(answers.supplements.length > 0 ? [['Supplements', answers.supplements.join(', ')]] : []),
  ];
  return (
    <div className="h-full flex flex-col px-5 pt-2 pb-6 overflow-y-auto" style={{ background: T.bg }}>
      <p className="kicker kicker-gold mb-2">Your file is ready</p>
      <h1 className="display-lg text-[#F4F2EC] mb-6">THE FILE</h1>
      <div className="card overflow-hidden mb-6">
        {rows.map(([label, value], i) => (
          <motion.div key={label} initial={shouldReduce ? {} : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.3, ease: T.easeOut }}
            className="flex items-center justify-between px-4 py-3.5" style={{ borderTop: i === 0 ? 'none' : `1px solid ${T.hairline}` }}>
            <span className="kicker">{label}</span>
            <span className="font-body text-[14px] font-bold text-right max-w-[55%]" style={{ color: T.text }}>{value}</span>
          </motion.div>
        ))}
      </div>
      <motion.div initial={shouldReduce ? {} : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <BikiLine>I have what I need. Day 1 drops tomorrow at 6am.</BikiLine>
      </motion.div>
      <div className="flex-1" />
      <motion.button whileTap={T.tap} onClick={next} className="btn-primary">
        Lock it in<ArrowRight size={18} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}

// ═════════════════════════════════════════════
// 18 · The Pledge — press-and-hold to commit
// ═════════════════════════════════════════════
const HOLD_MS = 1500;

function PledgeScreen({ next }) {
  const shouldReduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [committed, setCommitted] = useState(false);
  const [flash, setFlash] = useState(false);
  const holding = useRef(false);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const ticks = useRef({ a: false, b: false });

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const buzz = (p) => { try { navigator.vibrate?.(p); } catch { /* unsupported */ } };

  const complete = useCallback(() => {
    holding.current = false;
    cancelAnimationFrame(rafRef.current);
    setProgress(1);
    setCommitted(true);
    buzz([30, 45, 90]);
    setFlash(true);
    setTimeout(() => { setFlash(false); next(); }, 600);
  }, [next]);

  const holdFrame = useCallback((now) => {
    if (!holding.current) return;
    const p = Math.min((now - startRef.current) / HOLD_MS, 1);
    setProgress(p);
    if (!ticks.current.a && p >= 0.33) { ticks.current.a = true; buzz(8); }
    if (!ticks.current.b && p >= 0.66) { ticks.current.b = true; buzz(8); }
    if (p >= 1) { complete(); return; }
    rafRef.current = requestAnimationFrame(holdFrame);
  }, [complete]);

  const start = useCallback(() => {
    if (committed) return;
    holding.current = true;
    ticks.current = { a: false, b: false };
    startRef.current = performance.now();
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(holdFrame);
  }, [committed, holdFrame]);

  const release = useCallback(() => {
    if (!holding.current || committed) return;
    holding.current = false;
    cancelAnimationFrame(rafRef.current);
    buzz(5);
    // Retract
    const from = progress;
    const retractStart = performance.now();
    const retract = (now) => {
      const t = Math.min((now - retractStart) / 200, 1);
      setProgress(from * (1 - t));
      if (t < 1) rafRef.current = requestAnimationFrame(retract);
    };
    rafRef.current = requestAnimationFrame(retract);
  }, [committed, progress]);

  // SVG ring math
  const RING_R = 52;
  const CIRC = 2 * Math.PI * RING_R;

  return (
    <div className="relative h-full overflow-hidden flex flex-col" style={{
      background: 'linear-gradient(180deg, rgba(30,28,24,1) 0%, #0B0B0C 50%)',
    }}>
      {/* Flash overlay */}
      {flash && (
        <motion.div
          className="absolute inset-0 z-30"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ background: T.gold }}
        />
      )}

      <div className="relative flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Headline */}
        <motion.h1
          initial={shouldReduce ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: T.easeOut }}
          className="font-display text-[44px] leading-[0.92] mb-6"
          style={{ color: '#F4F2EC' }}
        >
          I HEREBY<br />PLEDGE
        </motion.h1>

        {/* Pledge body */}
        <motion.p
          initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: T.easeOut }}
          className="font-body text-[16px] leading-[1.65] max-w-[320px]"
          style={{ color: 'rgba(244,242,236,0.72)' }}
        >
          I'm starting this journey for myself.
          I know results take time, consistency, and honesty.
          I commit to logging my meals, sharing my progress,
          and trusting Biki's guidance — even on the hard days.
        </motion.p>
      </div>

      {/* Fingerprint hold area */}
      <motion.div
        initial={shouldReduce ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="flex flex-col items-center pb-12"
      >
        <button
          onPointerDown={start}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          className="relative flex items-center justify-center select-none"
          style={{ width: 120, height: 120, touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
          aria-label="Press and hold to commit"
        >
          {/* Background glow */}
          <div className="absolute inset-0 rounded-full" style={{
            background: `radial-gradient(circle, rgba(246, 180, 28,${0.15 * progress}) 0%, transparent 70%)`,
            transform: `scale(${1.4 + progress * 0.4})`,
            transition: holding.current ? 'none' : 'all 200ms ease-out',
          }} />

          {/* Progress ring */}
          <svg className="absolute inset-0" width="120" height="120">
            {/* Track ring */}
            <circle cx="60" cy="60" r={RING_R}
              fill="none" stroke="rgba(244,242,236,0.08)" strokeWidth="3" />
            {/* Progress ring */}
            <circle cx="60" cy="60" r={RING_R}
              fill="none" stroke={T.gold} strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              transform="rotate(-90 60 60)"
              style={{
                opacity: progress > 0.001 ? 1 : 0,
                transition: holding.current ? 'none' : 'stroke-dashoffset 200ms ease-out',
              }}
            />
          </svg>

          {/* Fingerprint icon */}
          <Fingerprint
            size={38} strokeWidth={1.5}
            style={{
              color: committed ? T.gold : `rgba(244,242,236,${0.35 + progress * 0.65})`,
              transform: `scale(${1 + progress * 0.08})`,
              transition: holding.current ? 'none' : 'all 200ms ease-out',
            }}
          />
        </button>

        <motion.p
          initial={shouldReduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="font-body text-[13px] mt-3"
          style={{ color: T.textLow }}
        >
          {committed ? 'Committed.' : 'Press and hold to commit'}
        </motion.p>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Registry + flow metadata
// ─────────────────────────────────────────────
export const STEPS = [
  { id: 'door', Comp: DoorScreen, kind: 'door' },
  { id: 'name', Comp: NameScreen, kind: 'input' },
  { id: 'age', Comp: AgeScreen, kind: 'input' },
  { id: 'sex', Comp: SexScreen, kind: 'auto' },
  { id: 'height', Comp: HeightScreen, kind: 'input' },
  { id: 'weight', Comp: WeightScreen, kind: 'input' },
  { id: 'goal', Comp: GoalScreen, kind: 'auto' },
  { id: 'motivation', Comp: MotivationScreen, kind: 'input' },
  { id: 'experience', Comp: ExperienceScreen, kind: 'input' },
  { id: 'availability', Comp: TrainingAvailabilityScreen, kind: 'input' },
  { id: 'routine', Comp: RoutineScreen, kind: 'auto' },
  { id: 'diet', Comp: DietScreen, kind: 'auto' },
  { id: 'dayBuilder', Comp: DayBuilder, kind: 'input' },
  { id: 'supplements', Comp: SupplementsScreen, kind: 'input' },
  { id: 'medical', Comp: MedicalScreen, kind: 'input' },
  { id: 'sleep', Comp: SleepScreen, kind: 'input' },
  { id: 'foodPrefs', Comp: FoodPrefsScreen, kind: 'input' },
  { id: 'digestion', Comp: DigestionScreen, kind: 'input' },
  { id: 'allergies', Comp: AllergiesScreen, kind: 'input' },
  { id: 'photos', Comp: PhotosScreen, kind: 'input' },
  { id: 'bloodwork', Comp: BloodworkScreen, kind: 'input' },
  { id: 'notes', Comp: NotesScreen, kind: 'input' },
  { id: 'reveal', Comp: RevealScreen, kind: 'input' },
  { id: 'pledge', Comp: PledgeScreen, kind: 'pledge' },
];
