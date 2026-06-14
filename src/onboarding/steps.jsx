// ── Onboarding screens (v2 — "The File") ──
// 12 screens. Single-select cards auto-advance; numeric screens use a gold
// Next CTA. Biki speaks only on screens 1, 7, 9, 12. Gold is the only accent.

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, Check, Minus, Plus, Utensils, Beef, Repeat, Activity,
  GlassWater, Nut, X,
} from 'lucide-react';
import { T } from '../tokens';
import { PHOTOS } from '../data/mockData';
import PressHold from './PressHold';

// ─────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────
function BikiLine({ children }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: `1.5px solid ${T.goldBorder}` }}>
        <img src={PHOTOS.bikiPortrait} alt="Biki" className="w-full h-full object-cover" style={{ filter: 'grayscale(20%) contrast(1.05)' }} />
      </div>
      <p className="font-body text-[14px] leading-relaxed pt-1.5" style={{ color: T.textMid }}>
        {children}
      </p>
    </div>
  );
}

function Question({ children }) {
  return <h1 className="display-lg text-[#F4F2EC] mb-6">{children}</h1>;
}

// Numeric/standard screen scaffold with a bottom gold Next CTA
function Scaffold({ children, onNext, ctaDisabled, ctaLabel = 'Next' }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4">{children}</div>
      <div className="px-5 pt-3 pb-6" style={{ background: T.bg }}>
        <motion.button
          whileTap={ctaDisabled ? undefined : T.tap}
          onClick={onNext}
          disabled={ctaDisabled}
          className="btn-primary"
        >
          {ctaLabel}
          <ArrowRight size={18} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  );
}

// Single-select card (auto-advances). Plays a brief gold-outline + scale dip.
function SelectCard({ icon, title, sub, selected, onSelect, big }) {
  return (
    <motion.button
      onClick={onSelect}
      animate={selected ? { scale: [1, 0.97, 1] } : { scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`w-full flex items-center gap-3.5 rounded-2xl text-left ${big ? 'p-5' : 'p-4'}`}
      style={{
        background: selected ? T.goldTint : T.surface,
        border: `1.5px solid ${selected ? T.gold : T.hairline}`,
      }}
    >
      {icon && (
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: selected ? T.gold : T.surface2, border: selected ? 'none' : `1px solid ${T.hairline}` }}>
          {icon(selected ? T.bg : T.textMid)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`font-body font-bold leading-tight ${big ? 'text-[16px]' : 'text-[15px]'}`} style={{ color: T.text }}>{title}</p>
        {sub && <p className="font-body text-[12px] mt-0.5" style={{ color: T.textLow }}>{sub}</p>}
      </div>
    </motion.button>
  );
}

// Unit toggle (top-right)
function UnitToggle({ units, value, onChange }) {
  return (
    <div className="flex rounded-lg p-0.5" style={{ background: T.surface, border: `1px solid ${T.hairline}` }}>
      {units.map(u => {
        const active = u === value;
        return (
          <button key={u} onClick={() => onChange(u)}
            className="px-3 py-1.5 rounded-md font-body text-[12px] font-extrabold uppercase tracking-wider"
            style={{ background: active ? T.gold : 'transparent', color: active ? T.bg : T.textLow }}>
            {u}
          </button>
        );
      })}
    </div>
  );
}

// ── Wheel picker (scroll-snap) ──
const ITEM = 46;
function Wheel({ value, onChange, min, max, step = 1, format = v => v }) {
  const items = useMemo(() => {
    const out = [];
    for (let v = min; v <= max; v += step) out.push(Number(v.toFixed(2)));
    return out;
  }, [min, max, step]);
  const ref = useRef(null);
  const raf = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    const idx = items.indexOf(value);
    ref.current.scrollTop = (idx < 0 ? 0 : idx) * ITEM;
  }, []); // eslint-disable-line

  const onScroll = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const idx = Math.round(ref.current.scrollTop / ITEM);
      const v = items[Math.max(0, Math.min(items.length - 1, idx))];
      if (v !== value) onChange(v);
    });
  };

  return (
    <div className="relative mx-auto" style={{ height: ITEM * 5, width: 220 }}>
      {/* center band */}
      <div className="absolute left-0 right-0 pointer-events-none rounded-xl"
        style={{ top: ITEM * 2, height: ITEM, border: `1px solid ${T.goldBorder}`, background: T.goldTint }} />
      {/* fades */}
      <div className="absolute inset-x-0 top-0 pointer-events-none z-10" style={{ height: ITEM * 2, background: `linear-gradient(${T.bg}, transparent)` }} />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10" style={{ height: ITEM * 2, background: `linear-gradient(transparent, ${T.bg})` }} />
      <div ref={ref} onScroll={onScroll}
        className="h-full overflow-y-auto no-scrollbar snap-y snap-mandatory"
        style={{ paddingTop: ITEM * 2, paddingBottom: ITEM * 2 }}>
        {items.map(v => {
          const active = v === value;
          return (
            <div key={v} className="snap-center flex items-center justify-center" style={{ height: ITEM }}>
              <span className="font-display tabular-nums"
                style={{ fontSize: active ? 30 : 24, color: active ? T.text : 'rgba(244,242,236,0.3)' }}>
                {format(v)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stepper row (Day Builder) ──
function StepperRow({ icon, label, value, min, max, onChange, accentEmpty }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: T.surface, border: `1px solid ${T.hairline}` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}>
        {icon}
      </div>
      <span className="font-body text-[14px] font-semibold flex-1" style={{ color: T.text }}>{label}</span>
      <div className="flex items-center gap-3.5">
        <motion.button whileTap={T.tapSmall} onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${T.hairlineStrong}` }}>
          <Minus size={15} strokeWidth={2.5} style={{ color: T.textMid }} />
        </motion.button>
        <span className="font-display text-[22px] tabular-nums w-5 text-center" style={{ color: value === 0 && accentEmpty ? T.textFaint : T.text }}>{value}</span>
        <motion.button whileTap={T.tapSmall} onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${T.hairlineStrong}` }}>
          <Plus size={15} strokeWidth={2.5} style={{ color: T.textMid }} />
        </motion.button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 1 · The Door
// ═════════════════════════════════════════════
function DoorScreen({ next }) {
  return (
    <div className="relative h-full overflow-hidden" style={{ background: T.bg }}>
      <img src={PHOTOS.bikiPortrait} alt="" className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'grayscale(100%) contrast(1.08) brightness(0.62)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,11,12,0.55) 0%, rgba(11,11,12,0.35) 40%, rgba(11,11,12,0.96) 100%)' }} />

      <div className="relative h-full flex flex-col p-5">
        <div className="pt-6 flex justify-center">
          <TbsWordmark />
        </div>

        <div className="flex-1" />

        <p className="font-display text-[34px] leading-[0.95] text-[#F4F2EC] mb-8 max-w-[88%]">
          I TAKE 12 CLIENTS.<br />YOU'RE 9.<br /><span style={{ color: T.gold }}>WALK IN.</span>
        </p>

        <PressHold label="Hold to walk in" onComplete={next} />
        <p className="text-center font-body text-[11px] mt-3" style={{ color: T.textFaint }}>Press and hold</p>
      </div>
    </div>
  );
}

// tiny inline wordmark for the door top (no tagline)
function TbsWordmark() {
  return (
    <span className="font-display text-[40px] tracking-[0.08em]" style={{ color: T.gold }}>TBS</span>
  );
}

// ═════════════════════════════════════════════
// 2 · Name
// ═════════════════════════════════════════════
function NameScreen({ answers, update, next }) {
  return (
    <Scaffold onNext={next} ctaDisabled={!answers.name.trim()}>
      <Question>WHAT SHOULD<br />I CALL YOU?</Question>
      <input
        autoFocus
        value={answers.name}
        onChange={e => update({ name: e.target.value })}
        onKeyDown={e => { if (e.key === 'Enter' && answers.name.trim()) next(); }}
        placeholder="Your name"
        className="w-full bg-transparent font-display text-[40px] outline-none placeholder:text-white/15"
        style={{ color: T.text, borderBottom: `2px solid ${T.hairlineStrong}`, paddingBottom: 8 }}
      />
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 3 · Age
// ═════════════════════════════════════════════
function AgeScreen({ answers, update, next }) {
  return (
    <Scaffold onNext={next}>
      <Question>HOW OLD<br />ARE YOU?</Question>
      <div className="text-center mb-2">
        <span className="font-display text-[72px] leading-none" style={{ color: T.gold }}>{answers.age}</span>
        <p className="kicker mt-1">Years</p>
      </div>
      <Wheel value={answers.age} onChange={v => update({ age: v })} min={14} max={90} />
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 4 · Sex (auto-advance)
// ═════════════════════════════════════════════
function SexScreen({ answers, selectNext }) {
  return (
    <div className="px-5 pt-2 h-full flex flex-col">
      <Question>SEX</Question>
      <div className="grid grid-cols-2 gap-3 flex-1 content-start">
        {[['m', 'Male'], ['f', 'Female']].map(([v, label]) => {
          const selected = answers.sex === v;
          return (
            <motion.button key={v}
              onClick={() => selectNext({ sex: v })}
              animate={selected ? { scale: [1, 0.97, 1] } : {}}
              transition={{ duration: 0.2 }}
              className="rounded-2xl flex flex-col items-center justify-center gap-3"
              style={{ aspectRatio: '3/4', background: selected ? T.goldTint : T.surface, border: `1.5px solid ${selected ? T.gold : T.hairline}` }}>
              <span className="font-display text-[56px] leading-none" style={{ color: selected ? T.gold : T.textMid }}>
                {v === 'm' ? '♂' : '♀'}
              </span>
              <span className="font-body text-[15px] font-bold" style={{ color: T.text }}>{label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 5 · Height (vertical slider + silhouette)
// ═════════════════════════════════════════════
function HeightScreen({ answers, update, next }) {
  const isCm = answers.heightUnit === 'cm';
  // store canonical cm; display converts
  const cm = answers.height;
  const min = 140, max = 210;
  const pct = (cm - min) / (max - min); // 0..1
  const trackRef = useRef(null);

  const setFromClientY = (clientY) => {
    const r = trackRef.current.getBoundingClientRect();
    const p = 1 - Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    update({ height: Math.round(min + p * (max - min)) });
  };
  const onDown = (e) => { e.currentTarget.setPointerCapture(e.pointerId); setFromClientY(e.clientY); };
  const onMove = (e) => { if (e.buttons || e.pressure > 0) setFromClientY(e.clientY); };

  const display = isCm ? `${cm}` : (() => { const t = cm / 30.48; const ft = Math.floor(t); const inch = Math.round((t - ft) * 12); return `${ft}'${inch}"`; })();

  return (
    <div className="px-5 pt-2 h-full flex flex-col">
      <div className="flex items-start justify-between">
        <Question>HEIGHT</Question>
        <UnitToggle units={['cm', 'ft']} value={answers.heightUnit} onChange={u => update({ heightUnit: u })} />
      </div>

      <div className="flex-1 flex items-center justify-center gap-10">
        {/* Silhouette that scales with height */}
        <div className="flex items-end justify-center" style={{ height: 280 }}>
          <motion.div animate={{ scaleY: 0.7 + pct * 0.55 }} style={{ transformOrigin: 'bottom' }}>
            <Silhouette />
          </motion.div>
        </div>

        {/* Vertical slider */}
        <div className="flex flex-col items-center gap-3">
          <span className="font-display text-[44px] leading-none" style={{ color: T.gold }}>{display}</span>
          <div ref={trackRef} onPointerDown={onDown} onPointerMove={onMove}
            className="relative rounded-full cursor-pointer" style={{ width: 8, height: 240, background: T.surface2, touchAction: 'none' }}>
            <div className="absolute bottom-0 left-0 right-0 rounded-full" style={{ height: `${pct * 100}%`, background: T.gold }} />
            <div className="absolute left-1/2 -translate-x-1/2 rounded-full" style={{ bottom: `calc(${pct * 100}% - 11px)`, width: 22, height: 22, background: T.gold, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }} />
          </div>
          <span className="kicker">{isCm ? 'cm' : 'ft / in'}</span>
        </div>
      </div>

      <div className="pb-6">
        <motion.button whileTap={T.tap} onClick={next} className="btn-primary">
          Next <ArrowRight size={18} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  );
}

function Silhouette() {
  return (
    <svg width="70" height="200" viewBox="0 0 70 200" fill={T.textMid}>
      <circle cx="35" cy="22" r="16" />
      <rect x="19" y="44" width="32" height="86" rx="14" />
      <rect x="10" y="50" width="12" height="64" rx="6" />
      <rect x="48" y="50" width="12" height="64" rx="6" />
      <rect x="22" y="124" width="12" height="74" rx="6" />
      <rect x="36" y="124" width="12" height="74" rx="6" />
    </svg>
  );
}

// ═════════════════════════════════════════════
// 6 · Weight (wheel)
// ═════════════════════════════════════════════
function WeightScreen({ answers, update, next }) {
  const isKg = answers.weightUnit === 'kg';
  const display = isKg ? answers.weight : Math.round(answers.weight * 2.20462);
  return (
    <Scaffold onNext={next}>
      <div className="flex items-start justify-between">
        <Question>WEIGHT</Question>
        <UnitToggle units={['kg', 'lb']} value={answers.weightUnit} onChange={u => update({ weightUnit: u })} />
      </div>
      <div className="text-center mb-2">
        <span className="font-display text-[72px] leading-none" style={{ color: T.gold }}>{display}</span>
        <p className="kicker mt-1">{isKg ? 'Kilograms' : 'Pounds'}</p>
      </div>
      {isKg
        ? <Wheel value={answers.weight} onChange={v => update({ weight: v })} min={35} max={180} />
        : <Wheel value={Math.round(answers.weight * 2.20462)} onChange={v => update({ weight: Math.round(v / 2.20462) })} min={77} max={397} />}
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 7 · Goal (auto-advance, Biki speaks)
// ═════════════════════════════════════════════
const GOALS = [
  { v: 'cut', title: 'Cut', sub: 'Strip fat, keep muscle.', icon: c => <Activity size={20} strokeWidth={T.stroke} style={{ color: c }} /> },
  { v: 'build', title: 'Build', sub: 'Add size and strength.', icon: c => <Beef size={20} strokeWidth={T.stroke} style={{ color: c }} /> },
  { v: 'recomp', title: 'Recomp', sub: 'Lose fat, build muscle.', icon: c => <Repeat size={20} strokeWidth={T.stroke} style={{ color: c }} /> },
  { v: 'maintain', title: 'Maintain', sub: 'Hold and sharpen.', icon: c => <Check size={20} strokeWidth={T.stroke} style={{ color: c }} /> },
];
function GoalScreen({ answers, selectNext }) {
  return (
    <div className="px-5 pt-2 h-full overflow-y-auto">
      <BikiLine>Pick one. We can adjust.</BikiLine>
      <Question>YOUR GOAL</Question>
      <div className="flex flex-col gap-2.5">
        {GOALS.map(g => (
          <SelectCard key={g.v} icon={g.icon} title={g.title} sub={g.sub}
            selected={answers.goal === g.v} onSelect={() => selectNext({ goal: g.v })} />
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 8 · Experience (auto-advance)
// ═════════════════════════════════════════════
const EXP = [
  { v: 'new', title: 'New to this', sub: 'Starting fresh.' },
  { v: 'some', title: 'Some experience', sub: 'Know my way around.' },
  { v: 'years', title: 'Years deep', sub: 'Training is a habit.' },
];
function ExperienceScreen({ answers, selectNext }) {
  return (
    <div className="px-5 pt-2 h-full flex flex-col">
      <Question>EXPERIENCE</Question>
      <div className="flex flex-col gap-2.5">
        {EXP.map(e => (
          <SelectCard key={e.v} title={e.title} sub={e.sub} big
            selected={answers.experience === e.v} onSelect={() => selectNext({ experience: e.v })} />
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 9 · Diet (auto-advance, Biki speaks)
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
            <motion.button key={d.v}
              onClick={() => selectNext({ diet: d.v })}
              animate={selected ? { scale: [1, 0.97, 1] } : {}}
              transition={{ duration: 0.2 }}
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
// 10 · Day Builder
// ═════════════════════════════════════════════
function DayBuilder({ answers, update, next }) {
  // build the "Your Day" strip icons
  const strip = [];
  for (let i = 0; i < answers.meals_per_day; i++) strip.push({ k: `m${i}`, icon: <Utensils size={15} strokeWidth={2} style={{ color: T.gold }} /> });
  for (let i = 0; i < answers.shakes_per_day; i++) strip.push({ k: `s${i}`, icon: <GlassWater size={15} strokeWidth={2} style={{ color: T.cobalt }} /> });
  for (let i = 0; i < answers.snacks_per_day; i++) strip.push({ k: `n${i}`, icon: <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.textMid }} /> });

  return (
    <Scaffold onNext={next}>
      <Question>BUILD YOUR DAY</Question>
      <p className="font-body text-[14px] mb-5" style={{ color: T.textLow }}>How a normal day of eating looks for you.</p>

      {/* Your Day strip */}
      <div className="rounded-2xl p-4 mb-5 min-h-[64px] flex items-center" style={{ background: T.surface, border: `1px solid ${T.hairline}` }}>
        {strip.length === 0 ? (
          <span className="font-body text-[12px]" style={{ color: T.textFaint }}>Adjust below to build your day…</span>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {strip.map(s => (
              <motion.div key={s.k} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={T.spring}
                className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}>
                {s.icon}
              </motion.div>
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
// 11 · Allergies / avoids
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
            <motion.button key={a} whileTap={T.tap} onClick={() => toggle(a)}
              className="px-4 py-2.5 rounded-full font-body text-[14px] font-semibold"
              style={{ background: on ? T.goldTint : T.surface, border: `1px solid ${on ? T.goldBorder : T.hairline}`, color: on ? T.gold : T.textMid }}>
              {a}
            </motion.button>
          );
        })}
      </div>
      <p className="kicker mb-2">Anything else?</p>
      <input value={answers.avoidsText} onChange={e => update({ avoidsText: e.target.value })}
        placeholder="e.g. no red meat"
        className="w-full rounded-xl px-3.5 py-3 font-body text-[15px] outline-none placeholder:text-white/20"
        style={{ background: T.surface, border: `1px solid ${T.hairline}`, color: T.text }} />
    </Scaffold>
  );
}

// ═════════════════════════════════════════════
// 12 · The Reveal (file assembly + commit)
// ═════════════════════════════════════════════
const GOAL_LABEL = { cut: 'Cut', build: 'Build', recomp: 'Recomp', maintain: 'Maintain' };
const DIET_LABEL = { vegetarian: 'Vegetarian', 'non-vegetarian': 'Non-vegetarian', eggetarian: 'Eggetarian', vegan: 'Vegan' };

function RevealScreen({ answers, next }) {
  const shouldReduce = useReducedMotion();
  const wKg = answers.weight;
  const rows = [
    ['Name', answers.name || '—'],
    ['Age', `${answers.age}`],
    ['Stats', `${answers.height} cm · ${wKg} kg`],
    ['Goal', GOAL_LABEL[answers.goal] || '—'],
    ['Diet', DIET_LABEL[answers.diet] || '—'],
    ['Day plan', `${answers.meals_per_day} meals · ${answers.shakes_per_day} shakes · ${answers.snacks_per_day} snacks`],
  ];

  return (
    <div className="h-full flex flex-col px-5 pt-2 pb-6 overflow-y-auto" style={{ background: T.bg }}>
      <p className="kicker kicker-gold mb-2">Your file is ready</p>
      <h1 className="display-lg text-[#F4F2EC] mb-6">THE FILE</h1>

      {/* Assembled file card */}
      <div className="card overflow-hidden mb-6">
        {rows.map(([label, value], i) => (
          <motion.div key={label}
            initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.3, ease: T.easeOut }}
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderTop: i === 0 ? 'none' : `1px solid ${T.hairline}` }}>
            <span className="kicker">{label}</span>
            <span className="font-body text-[14px] font-bold text-right" style={{ color: T.text }}>{value}</span>
          </motion.div>
        ))}
      </div>

      <motion.div initial={shouldReduce ? {} : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <BikiLine>I have what I need. Day 1 drops tomorrow at 6am.</BikiLine>
      </motion.div>

      <div className="flex-1" />
      <PressHold label="Hold to commit" onComplete={next} />
      <p className="text-center font-body text-[11px] mt-3" style={{ color: T.textFaint }}>Press and hold</p>
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
  { id: 'experience', Comp: ExperienceScreen, kind: 'auto' },
  { id: 'diet', Comp: DietScreen, kind: 'auto' },
  { id: 'dayBuilder', Comp: DayBuilder, kind: 'input' },
  { id: 'allergies', Comp: AllergiesScreen, kind: 'input', skipField: true },
  { id: 'reveal', Comp: RevealScreen, kind: 'reveal' },
];
