// ── Onboarding screens (v3 — "The File") ──
// Single-select cards auto-advance; numeric/multi screens use a gold Next.
// Biki speaks only on the Door, Goal, Diet, Reveal. Gold is the only accent.

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, Check, Minus, Plus, Utensils, GlassWater, Nut,
  TrendingDown, TrendingUp, Dumbbell, Repeat, Trophy, Equal,
  Sunrise, Sun, Sunset, Moon, Camera, X, Upload, FileText,
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
      className={`w-full flex items-center gap-3.5 rounded-2xl text-left ${big ? 'p-4' : 'p-3.5'}`}
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
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: T.surface, border: `1px solid ${T.hairline}` }}>
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
              <button onClick={() => onRemove(tag)} className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,168,72,0.25)' }}>
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
        <p className="font-display text-[34px] leading-[0.95] text-[#F4F2EC] mb-8 max-w-[88%]">
          I TAKE 12 CLIENTS.<br />YOU'RE 9.<br /><span style={{ color: T.gold }}>WALK IN.</span>
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
              className="rounded-2xl flex flex-col items-center justify-center gap-3"
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
  { v: 'maintain', title: 'Maintain', sub: 'Hold your shape and sharpen.', icon: c => <Equal size={20} strokeWidth={T.stroke} style={{ color: c }} /> },
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
// 8 · Experience + preferred training time (Next)
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
// 9 · Routine (auto)
// ═════════════════════════════════════════════
const ROUTINES = [
  { v: 'none', title: 'No set routine', sub: 'Training is inconsistent right now.' },
  { v: 'full_body', title: 'Full body', sub: 'Whole body each session.' },
  { v: 'ppl', title: 'Push / Pull / Legs', sub: 'Split across movement patterns.' },
  { v: 'upper_lower', title: 'Upper / Lower', sub: 'Alternating upper and lower days.' },
  { v: 'bro_split', title: 'Body-part split', sub: 'One muscle group per day.' },
];
function RoutineScreen({ answers, selectNext }) {
  return (
    <div className="px-5 pt-2 h-full overflow-y-auto">
      <Question>YOUR ROUTINE</Question>
      <p className="font-body text-[14px] mb-5" style={{ color: T.textLow }}>How do you train right now?</p>
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
              className="rounded-2xl flex items-center justify-center text-center px-3"
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
      <div className="rounded-2xl p-4 mb-5 min-h-[64px] flex items-center" style={{ background: T.surface, border: `1px solid ${T.hairline}` }}>
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
      className="flex-1 aspect-[3/4] rounded-2xl flex flex-col items-center justify-center gap-2"
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
        className="w-full rounded-2xl flex flex-col items-center justify-center gap-3 py-10 mb-5"
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
// 16 · The Reveal (file assembly + tap commit)
// ═════════════════════════════════════════════
const GOAL_LABEL = { weight_loss: 'Weight loss', weight_gain: 'Weight gain', build: 'Build muscle', recomp: 'Body recomp', maintain: 'Maintain', competition: 'Competition prep' };
const DIET_LABEL = { vegetarian: 'Vegetarian', 'non-vegetarian': 'Non-vegetarian', eggetarian: 'Eggetarian', vegan: 'Vegan' };
const EXP_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const ROUTINE_LABEL = { none: 'No set routine', full_body: 'Full body', ppl: 'PPL', upper_lower: 'Upper / Lower', bro_split: 'Body-part split' };
const TIME_LABEL = { morning: 'Morning', midday: 'Midday', evening: 'Evening', night: 'Night' };

function RevealScreen({ answers, next }) {
  const shouldReduce = useReducedMotion();
  const rows = [
    ['Name', answers.name || '—'],
    ['Age', `${answers.age}`],
    ['Stats', `${answers.height} cm · ${answers.weight} kg`],
    ['Goal', GOAL_LABEL[answers.goal] || '—'],
    ['Level', EXP_LABEL[answers.experience] || '—'],
    ['Routine', ROUTINE_LABEL[answers.routine] || '—'],
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
  { id: 'experience', Comp: ExperienceScreen, kind: 'input' },
  { id: 'routine', Comp: RoutineScreen, kind: 'auto' },
  { id: 'diet', Comp: DietScreen, kind: 'auto' },
  { id: 'dayBuilder', Comp: DayBuilder, kind: 'input' },
  { id: 'supplements', Comp: SupplementsScreen, kind: 'input' },
  { id: 'allergies', Comp: AllergiesScreen, kind: 'input' },
  { id: 'photos', Comp: PhotosScreen, kind: 'input' },
  { id: 'bloodwork', Comp: BloodworkScreen, kind: 'input' },
  { id: 'reveal', Comp: RevealScreen, kind: 'reveal' },
];
