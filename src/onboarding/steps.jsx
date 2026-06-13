// ── Onboarding step screens ──
// Each screen receives { answers, update, onNext, onSkipField }.
// Heroes render their own CTA; forms render a full-width gold Next.
// Translated from the light wireframes into the app's dark volt/gold system.

import { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, Check, Plus, X, Minus,
  TrendingDown, Dumbbell, Repeat, HeartPulse, Zap, Brain, Apple,
  Briefcase, Footprints, Flame, Camera, Fingerprint, Sunrise,
} from 'lucide-react';
import { T } from '../tokens';
import { PHOTOS, USER_PROFILE } from '../data/mockData';

const FIRST_NAME = USER_PROFILE.name;

// ─────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────
function PrimaryCTA({ children, onClick, disabled }) {
  return (
    <motion.button
      whileTap={disabled ? undefined : T.tap}
      onClick={onClick}
      disabled={disabled}
      className="btn-primary"
    >
      {children}
      <ArrowRight size={18} strokeWidth={2.5} />
    </motion.button>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="mb-4">
      <label className="kicker block mb-2">{label}</label>
      {children}
      {hint && <p className="font-body text-[11px] mt-1.5" style={{ color: T.textFaint }}>{hint}</p>}
    </div>
  );
}

const inputStyle = {
  background: T.surface,
  border: `1px solid ${T.hairline}`,
  color: T.text,
};

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl px-3.5 py-3 font-body text-[15px] outline-none placeholder:text-white/20"
      style={inputStyle}
    />
  );
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full rounded-xl px-3.5 py-3 font-body text-[14px] outline-none resize-none placeholder:text-white/20"
      style={inputStyle}
    />
  );
}

// value + unit switch (kg/lbs, cm/ft)
function UnitInput({ value, onChange, unit, units, onUnit, placeholder }) {
  return (
    <div className="flex items-stretch gap-2">
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 rounded-xl px-3.5 py-3 font-display text-[18px] tabular-nums outline-none placeholder:text-white/20"
        style={inputStyle}
      />
      <div
        className="flex shrink-0 rounded-xl p-1"
        style={{ background: T.surface, border: `1px solid ${T.hairline}` }}
      >
        {units.map(u => {
          const active = u === unit;
          return (
            <button
              key={u}
              onClick={() => onUnit(u)}
              className="px-3 rounded-lg font-body text-[12px] font-extrabold uppercase tracking-wider"
              style={{ background: active ? T.gold : 'transparent', color: active ? T.bg : T.textLow }}
            >
              {u}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// segmented two/three option toggle
function SegToggle({ options, value, onChange }) {
  return (
    <div className="flex rounded-xl p-1 gap-1" style={{ background: T.surface, border: `1px solid ${T.hairline}` }}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <motion.button
            key={opt.value}
            whileTap={T.tap}
            onClick={() => onChange(opt.value)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-body text-[13px] font-bold"
            style={{
              background: active ? T.gold : 'transparent',
              color: active ? T.bg : T.textMid,
            }}
          >
            {opt.icon}
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

function Stepper({ value, min = 1, max = 6, onChange, label, sub }) {
  return (
    <div
      className="flex items-center justify-between rounded-xl px-4 py-3"
      style={{ background: T.surface, border: `1px solid ${T.hairline}` }}
    >
      <div>
        <p className="font-body text-[13px] font-semibold" style={{ color: T.text }}>{label}</p>
        {sub && <p className="font-body text-[11px]" style={{ color: T.textFaint }}>{sub}</p>}
      </div>
      <div className="flex items-center gap-4">
        <motion.button whileTap={T.tapSmall} onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${T.hairlineStrong}` }}>
          <Minus size={16} strokeWidth={2.5} style={{ color: T.textMid }} />
        </motion.button>
        <span className="font-display text-[24px] tabular-nums w-6 text-center" style={{ color: T.text }}>{value}</span>
        <motion.button whileTap={T.tapSmall} onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${T.hairlineStrong}` }}>
          <Plus size={16} strokeWidth={2.5} style={{ color: T.textMid }} />
        </motion.button>
      </div>
    </div>
  );
}

// tag input with removable chips
function ChipInput({ tags, onAdd, onRemove, placeholder }) {
  const [draft, setDraft] = useState('');
  const commit = () => {
    const v = draft.trim();
    if (v) { onAdd(v); setDraft(''); }
  };
  return (
    <div className="rounded-xl p-2.5" style={{ background: T.surface, border: `1px solid ${T.hairline}` }}>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full"
              style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}>
              <span className="font-body text-[12px] font-semibold" style={{ color: T.text }}>{tag}</span>
              <button onClick={() => onRemove(tag)} className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(244,242,236,0.1)' }}>
                <X size={9} strokeWidth={2.5} style={{ color: T.textMid }} />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
        onBlur={commit}
        placeholder={placeholder}
        className="w-full bg-transparent font-body text-[14px] outline-none placeholder:text-white/20 px-1.5 py-1"
        style={{ color: T.text }}
      />
    </div>
  );
}

// multi-select pill chips (conditions, supplements presets)
function ChipToggle({ label, active, onClick }) {
  return (
    <motion.button
      whileTap={T.tap}
      onClick={onClick}
      className="px-3.5 py-2 rounded-full font-body text-[13px] font-semibold"
      style={{
        background: active ? T.goldTint : T.surface,
        border: `1px solid ${active ? T.goldBorder : T.hairline}`,
        color: active ? T.gold : T.textMid,
      }}
    >
      {label}
    </motion.button>
  );
}

// single-select option row (goal, work type)
function OptionRow({ icon, title, desc, selected, onClick }) {
  return (
    <motion.button
      whileTap={T.tap}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left"
      style={{
        background: selected ? T.goldTint : T.surface,
        border: `1px solid ${selected ? T.goldBorder : T.hairline}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: selected ? T.gold : T.surface2, border: selected ? 'none' : `1px solid ${T.hairline}` }}
      >
        {icon(selected ? T.bg : T.textMid)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-[14px] font-bold leading-tight" style={{ color: T.text }}>{title}</p>
        {desc && <p className="font-body text-[12px] mt-0.5" style={{ color: T.textLow }}>{desc}</p>}
      </div>
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
        style={{ background: selected ? T.gold : 'transparent', border: selected ? 'none' : `1.5px solid ${T.hairlineStrong}` }}
      >
        {selected && <Check size={12} strokeWidth={3} style={{ color: T.bg }} />}
      </div>
    </motion.button>
  );
}

// Form scaffold: greeting kicker, big headline, sub, scroll body, sticky CTA
function FormScaffold({ greeting, title, sub, children, onNext, ctaLabel = 'Next', ctaDisabled }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <p className="kicker mb-1" style={{ color: T.textMid }}>{greeting}</p>
        <h1 className="display-lg text-[#F4F2EC] mb-1.5">{title}</h1>
        {sub && <p className="font-body text-[14px] leading-relaxed mb-6" style={{ color: T.textLow }}>{sub}</p>}
        {children}
      </div>
      <div className="px-5 pt-3 pb-5" style={{ background: T.bg, borderTop: `1px solid ${T.hairline}` }}>
        <PrimaryCTA onClick={onNext} disabled={ctaDisabled}>{ctaLabel}</PrimaryCTA>
      </div>
    </div>
  );
}

// Hero scaffold: full-bleed photo + scrim, bottom-anchored copy + CTA
function HeroScaffold({ photo, kicker, title, body, cta, children }) {
  return (
    <div className="relative h-full overflow-hidden" style={{ background: T.bg }}>
      {photo && (
        <>
          <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'grayscale(100%) contrast(1.1) brightness(0.55)' }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, rgba(11,11,12,0.4) 0%, rgba(11,11,12,0.5) 45%, rgba(11,11,12,0.96) 100%)',
          }} />
        </>
      )}
      <div className="relative h-full flex flex-col justify-end p-5 pb-10">
        {kicker && <p className="kicker kicker-gold mb-3">{kicker}</p>}
        {title && <h1 className="display-xl text-[#F4F2EC] mb-3 max-w-[90%]">{title}</h1>}
        {body && <p className="font-body text-[14px] leading-relaxed mb-7 max-w-[88%]" style={{ color: T.textMid }}>{body}</p>}
        {children}
        {cta}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 0 · Splash
// ─────────────────────────────────────────────
function SplashScreen() {
  const shouldReduce = useReducedMotion();
  return (
    <div className="h-full flex items-center justify-center" style={{ background: T.bg }}>
      <motion.h1
        className="font-display text-[88px] leading-none tracking-[0.04em]"
        style={{ color: T.text }}
        initial={shouldReduce ? {} : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: T.easeOut }}
      >
        TBS
      </motion.h1>
    </div>
  );
}

// ─────────────────────────────────────────────
// 1 · Welcome
// ─────────────────────────────────────────────
function WelcomeScreen({ onNext }) {
  return (
    <HeroScaffold
      photo={PHOTOS.pushHero}
      kicker="TBS Fitness"
      title="WELCOME TO THE WORK"
      body={`Let's build your plan. A few quick questions so Biki can program the right thing for you — nothing wasted.`}
      cta={<motion.button whileTap={T.tap} onClick={onNext} className="btn-primary">Let's begin<ArrowRight size={18} strokeWidth={2.5} /></motion.button>}
    />
  );
}

// ─────────────────────────────────────────────
// 2 · Goal
// ─────────────────────────────────────────────
const GOALS = [
  { value: 'fat_loss', title: 'Fat loss', desc: 'Drop body fat and lean out safely.', icon: c => <TrendingDown size={18} strokeWidth={T.stroke} style={{ color: c }} /> },
  { value: 'muscle_gain', title: 'Muscle gain', desc: 'Build size, strength, and raw power.', icon: c => <Dumbbell size={18} strokeWidth={T.stroke} style={{ color: c }} /> },
  { value: 'recomp', title: 'Body recomposition', desc: 'Lose fat and build muscle at once.', icon: c => <Repeat size={18} strokeWidth={T.stroke} style={{ color: c }} /> },
  { value: 'health', title: 'General health', desc: 'Move better, live longer, feel great.', icon: c => <HeartPulse size={18} strokeWidth={T.stroke} style={{ color: c }} /> },
  { value: 'athletic', title: 'Athletic performance', desc: 'Train for a specific sport or event.', icon: c => <Zap size={18} strokeWidth={T.stroke} style={{ color: c }} /> },
  { value: 'mental', title: 'Mental wellness', desc: 'Build calm, focus, and resilience.', icon: c => <Brain size={18} strokeWidth={T.stroke} style={{ color: c }} /> },
  { value: 'habits', title: 'Nutritional habits', desc: 'Fix the basics and stay consistent.', icon: c => <Apple size={18} strokeWidth={T.stroke} style={{ color: c }} /> },
];

function GoalScreen({ answers, update, onNext }) {
  return (
    <FormScaffold
      greeting={`Welcome ${FIRST_NAME}`}
      title="WHAT'S YOUR GOAL?"
      sub="Pick the one that fits best. You can shift later."
      onNext={onNext}
      ctaDisabled={!answers.goal}
    >
      <div className="flex flex-col gap-2">
        {GOALS.map(g => (
          <OptionRow key={g.value} icon={g.icon} title={g.title} desc={g.desc}
            selected={answers.goal === g.value} onClick={() => update({ goal: g.value })} />
        ))}
      </div>
    </FormScaffold>
  );
}

// ─────────────────────────────────────────────
// 3 · About you
// ─────────────────────────────────────────────
function AboutScreen({ answers, update, onNext }) {
  return (
    <FormScaffold
      greeting={`Welcome ${FIRST_NAME}`}
      title="TELL US ABOUT YOU"
      sub="This sets your nutrition targets. Be honest — it only helps you."
      onNext={onNext}
    >
      <Field label="Age">
        <TextInput type="number" value={answers.age} onChange={v => update({ age: v })} placeholder="e.g. 28" />
      </Field>
      <Field label="Weight">
        <UnitInput value={answers.weight} onChange={v => update({ weight: v })} placeholder="0.0"
          unit={answers.weightUnit} units={['kg', 'lbs']} onUnit={u => update({ weightUnit: u })} />
      </Field>
      <Field label="Gender">
        <SegToggle value={answers.gender} onChange={v => update({ gender: v })}
          options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
      </Field>
      <Field label="Height">
        <UnitInput value={answers.height} onChange={v => update({ height: v })} placeholder="0"
          unit={answers.heightUnit} units={['cm', 'ft']} onUnit={u => update({ heightUnit: u })} />
      </Field>
      <Field label="Target weight" hint="Where you want to land.">
        <UnitInput value={answers.targetWeight} onChange={v => update({ targetWeight: v })} placeholder="e.g. 75"
          unit={answers.weightUnit} units={['kg', 'lbs']} onUnit={u => update({ weightUnit: u })} />
      </Field>
      <Field label="Anything else">
        <TextArea value={answers.note} onChange={v => update({ note: v })}
          placeholder="Milestones, timelines, or limitations…" />
      </Field>
    </FormScaffold>
  );
}

// ─────────────────────────────────────────────
// 4 · Keep moving (interstitial)
// ─────────────────────────────────────────────
function KeepMovingScreen({ onNext }) {
  return (
    <HeroScaffold
      photo={PHOTOS.legsHero}
      kicker="Keep moving"
      title="THE PLAN ONLY WORKS IF YOU DO"
      body="Half the questions are done. The rest dial in your food, training, and recovery. Two minutes, tops."
      cta={<motion.button whileTap={T.tap} onClick={onNext} className="btn-primary">Keep going<ArrowRight size={18} strokeWidth={2.5} /></motion.button>}
    />
  );
}

// ─────────────────────────────────────────────
// 5 · Diet preferences
// ─────────────────────────────────────────────
function DietScreen({ answers, update, onNext }) {
  return (
    <FormScaffold
      greeting={`Welcome ${FIRST_NAME}`}
      title="DIET PREFERENCES"
      sub="So your meal plans fit what you actually eat."
      onNext={onNext}
    >
      <Field label="Diet type">
        <SegToggle value={answers.dietType} onChange={v => update({ dietType: v })}
          options={[
            { value: 'veg', label: 'Vegetarian' },
            { value: 'nonveg', label: 'Non-Vegetarian' },
          ]} />
      </Field>
      <Field label="Meals per day">
        <Stepper value={answers.mealsPerDay} min={1} max={6} onChange={v => update({ mealsPerDay: v })}
          label="Target range 1–6" sub="Including snacks" />
      </Field>
      <Field label="Foods you enjoy">
        <ChipInput tags={answers.foodsEnjoy} placeholder="Type a food and press enter…"
          onAdd={t => update({ foodsEnjoy: [...answers.foodsEnjoy, t] })}
          onRemove={t => update({ foodsEnjoy: answers.foodsEnjoy.filter(x => x !== t) })} />
      </Field>
      <Field label="Foods to avoid / allergies">
        <ChipInput tags={answers.allergies} placeholder="e.g. peanuts"
          onAdd={t => update({ allergies: [...answers.allergies, t] })}
          onRemove={t => update({ allergies: answers.allergies.filter(x => x !== t) })} />
      </Field>
    </FormScaffold>
  );
}

// ─────────────────────────────────────────────
// 6 · Supplements
// ─────────────────────────────────────────────
function SupplementsScreen({ answers, update, onNext }) {
  return (
    <FormScaffold
      greeting={`Welcome ${FIRST_NAME}`}
      title="SUPPLEMENTS & MORE"
      sub="Straight answers here help Biki program safely."
      onNext={onNext}
    >
      <Field label="What supplements are you taking?">
        <ChipInput tags={answers.supplements} placeholder="Type one and press enter…"
          onAdd={t => update({ supplements: [...answers.supplements, t] })}
          onRemove={t => update({ supplements: answers.supplements.filter(x => x !== t) })} />
      </Field>
      <Field label="Ever taken anabolic steroids?" hint="Stays between you and your coach. No judgment.">
        <TextArea value={answers.steroidsNote} onChange={v => update({ steroidsNote: v })}
          placeholder="If yes, share what and when — it shapes a safer plan." />
      </Field>
    </FormScaffold>
  );
}

// ─────────────────────────────────────────────
// 7 · Daily routine
// ─────────────────────────────────────────────
const WORK_TYPES = [
  { value: 'desk', title: 'Desk job', desc: 'Mostly sitting, office work.', icon: c => <Briefcase size={18} strokeWidth={T.stroke} style={{ color: c }} /> },
  { value: 'moderate', title: 'Moderately active', desc: 'Teachers, retail, on your feet.', icon: c => <Footprints size={18} strokeWidth={T.stroke} style={{ color: c }} /> },
  { value: 'active', title: 'Very active', desc: 'Physical labor, constant movement.', icon: c => <Flame size={18} strokeWidth={T.stroke} style={{ color: c }} /> },
];

function TimeField({ label, icon, value, onChange }) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="kicker">{label}</span>
      </div>
      <input type="time" value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl px-3.5 py-3 font-display text-[18px] tabular-nums outline-none"
        style={inputStyle} />
    </div>
  );
}

function RoutineScreen({ answers, update, onNext }) {
  return (
    <FormScaffold
      greeting="Almost there"
      title="YOUR DAILY ROUTINE"
      sub="So we time your meals and training around your day."
      onNext={onNext}
    >
      <Field label="Type of work">
        <div className="flex flex-col gap-2">
          {WORK_TYPES.map(w => (
            <OptionRow key={w.value} icon={w.icon} title={w.title} desc={w.desc}
              selected={answers.workType === w.value} onClick={() => update({ workType: w.value })} />
          ))}
        </div>
      </Field>
      <div className="flex gap-3 mt-2">
        <TimeField label="Wake up" icon={<Sunrise size={12} strokeWidth={T.stroke} style={{ color: T.textMid }} />}
          value={answers.wakeTime} onChange={v => update({ wakeTime: v })} />
        <TimeField label="Training" icon={<Dumbbell size={12} strokeWidth={T.stroke} style={{ color: T.textMid }} />}
          value={answers.trainTime} onChange={v => update({ trainTime: v })} />
      </div>
    </FormScaffold>
  );
}

// ─────────────────────────────────────────────
// 8 · Health information
// ─────────────────────────────────────────────
const CONDITIONS = ['BP', 'Diabetes', 'PCOD', 'Thyroid', 'Knee injury', 'Back injury', 'Heart condition', 'None'];

function HealthScreen({ answers, update, onNext }) {
  const toggle = (c) => {
    const has = answers.conditions.includes(c);
    let next;
    if (c === 'None') next = has ? [] : ['None'];
    else {
      next = has ? answers.conditions.filter(x => x !== c) : [...answers.conditions.filter(x => x !== 'None'), c];
    }
    update({ conditions: next });
  };
  return (
    <FormScaffold
      greeting="Almost there"
      title="HEALTH INFO"
      sub="So we design a plan that's safe for your body."
      onNext={onNext}
    >
      <Field label="Any existing medical conditions?">
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map(c => (
            <ChipToggle key={c} label={c} active={answers.conditions.includes(c)} onClick={() => toggle(c)} />
          ))}
        </div>
      </Field>
      <Field label="Done a blood test recently?">
        <SegToggle value={answers.bloodTest} onChange={v => update({ bloodTest: v })}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'soon', label: 'Will do' },
          ]} />
      </Field>
      {answers.bloodTest === 'no' && (
        <div className="rounded-xl p-3.5 mt-1" style={{ background: T.cobaltTint, border: `1px solid ${T.cobaltBorder}` }}>
          <p className="font-body text-[12px] leading-relaxed" style={{ color: T.textMid }}>
            A recent blood report tailors a safer, sharper plan. Worth getting one soon.
          </p>
        </div>
      )}
    </FormScaffold>
  );
}

// ─────────────────────────────────────────────
// 9 · Starting photos
// ─────────────────────────────────────────────
function PhotoTile({ label, filled, onClick }) {
  return (
    <motion.button
      whileTap={T.tap}
      onClick={onClick}
      className="flex-1 aspect-[3/4] rounded-2xl flex flex-col items-center justify-center gap-2"
      style={{
        background: filled ? T.goldTint : T.surface,
        border: `1px ${filled ? 'solid' : 'dashed'} ${filled ? T.goldBorder : T.hairlineStrong}`,
      }}
    >
      {filled
        ? <Check size={22} strokeWidth={2.5} style={{ color: T.gold }} />
        : <Camera size={20} strokeWidth={T.stroke} style={{ color: T.textMid }} />}
      <span className="font-body text-[11px] font-bold uppercase tracking-wider" style={{ color: filled ? T.gold : T.textLow }}>{label}</span>
    </motion.button>
  );
}

function PhotosScreen({ answers, update, onNext, onSkipField }) {
  const setAngle = (a) => update({ photos: { ...answers.photos, [a]: !answers.photos[a] } });
  return (
    <FormScaffold
      greeting="Almost there"
      title="YOUR STARTING PHOTOS"
      sub="We use these to track your transformation over time."
      onNext={onNext}
    >
      <p className="kicker mb-2">Upload 3 angles</p>
      <div className="flex gap-3 mb-5">
        <PhotoTile label="Front" filled={answers.photos.front} onClick={() => setAngle('front')} />
        <PhotoTile label="Side" filled={answers.photos.side} onClick={() => setAngle('side')} />
        <PhotoTile label="Back" filled={answers.photos.back} onClick={() => setAngle('back')} />
      </div>

      <div className="rounded-xl p-3.5 mb-4" style={{ background: T.surface, border: `1px solid ${T.hairline}` }}>
        <p className="kicker mb-2">Tips for good photos</p>
        {['Good natural lighting if possible.', 'Minimal, form-fitting clothing.', 'Plain, light-colored wall behind you.'].map(t => (
          <div key={t} className="flex items-center gap-2 mb-1.5 last:mb-0">
            <Check size={13} strokeWidth={2.5} style={{ color: T.gold }} className="shrink-0" />
            <span className="font-body text-[12px]" style={{ color: T.textMid }}>{t}</span>
          </div>
        ))}
      </div>

      <button onClick={onSkipField} className="w-full flex items-center justify-between rounded-xl px-3.5 py-3"
        style={{ border: `1px solid ${T.hairline}` }}>
        <span className="font-body text-[12px]" style={{ color: T.textLow }}>Not ready? Add them later from your profile.</span>
        <span className="font-body text-[12px] font-bold shrink-0 ml-3" style={{ color: T.gold }}>Skip for now</span>
      </button>
    </FormScaffold>
  );
}

// ─────────────────────────────────────────────
// 10 · That's all
// ─────────────────────────────────────────────
function AllDoneScreen({ onNext }) {
  return (
    <HeroScaffold
      photo={PHOTOS.sessionComplete}
      kicker="That's all we needed"
      title="BIKI TAKES IT FROM HERE"
      body="Your answers are in. Biki reviews everything and your plan lands within 48 hours. One last thing first."
      cta={<motion.button whileTap={T.tap} onClick={onNext} className="btn-primary">Next<ArrowRight size={18} strokeWidth={2.5} /></motion.button>}
    />
  );
}

// ─────────────────────────────────────────────
// 11 · Pledge (press & hold to commit, with haptics)
// ─────────────────────────────────────────────
function PledgeScreen({ onCommit }) {
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const committed = useRef(false);
  const HOLD_S = 1.3;

  const size = 132;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  const buzz = (pattern) => { try { navigator.vibrate?.(pattern); } catch { /* unsupported */ } };

  const start = () => {
    if (done) return;
    setHolding(true);
    buzz(12); // light tick on engage
  };
  const cancel = () => { if (!done) setHolding(false); };

  const handleComplete = () => {
    if (holding && !committed.current) {
      committed.current = true;
      setDone(true);
      buzz([30, 50, 90]); // success — strong triple pulse
      setTimeout(onCommit, 420);
    }
  };

  return (
    <div className="relative h-full flex flex-col items-center justify-center px-6 text-center"
      style={{ background: T.bg }}>
      <p className="kicker kicker-gold mb-5">I hereby pledge</p>
      <p className="font-body text-[17px] leading-relaxed mb-12 max-w-[300px]" style={{ color: T.text }}>
        I'm starting this for myself. Results take time, consistency, and honesty. I'll log my meals,
        share my progress, and trust Biki's guidance — even on the hard days.
      </p>

      <button
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        className="relative flex items-center justify-center select-none"
        style={{ width: size, height: size, touchAction: 'none' }}
        aria-label="Press and hold to commit"
      >
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.hairlineStrong} strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={done ? T.volt : T.gold} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: holding || done ? 0 : circ }}
            transition={{ duration: holding && !done ? HOLD_S : 0.3, ease: 'linear' }}
            onAnimationComplete={handleComplete}
          />
        </svg>
        <motion.div animate={{ scale: holding ? 0.9 : 1 }} transition={T.spring}>
          <Fingerprint size={48} strokeWidth={1.5} style={{ color: done ? T.volt : T.gold }} />
        </motion.div>
      </button>

      <p className="font-body text-[12px] font-semibold uppercase tracking-wider mt-6" style={{ color: done ? T.volt : T.textMid }}>
        {done ? "You're in" : 'Press and hold to commit'}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────
export const STEP_COMPONENTS = {
  splash: SplashScreen,
  welcome: WelcomeScreen,
  goal: GoalScreen,
  about: AboutScreen,
  keepMoving: KeepMovingScreen,
  diet: DietScreen,
  supplements: SupplementsScreen,
  routine: RoutineScreen,
  health: HealthScreen,
  photos: PhotosScreen,
  allDone: AllDoneScreen,
  pledge: PledgeScreen,
};
