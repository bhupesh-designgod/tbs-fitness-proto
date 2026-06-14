// ── Profile Screen ──
// Identity header, plan sections that reflect onboarding answers (tap → detail),
// settings, hidden state preview, reset, logout.

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Target, User, Utensils, Pill, Clock, HeartPulse, Camera,
  Ruler, Bell, RotateCcw, Eye, ChevronRight, LogOut, ArrowLeft, Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { USER_PROFILE } from '../data/mockData';
import { T } from '../tokens';

const STATES = [null, 'ON_TRACK', 'LAGGING', 'REST', 'DEPLETED'];
const STATE_LABELS = ['Auto', 'On Track', 'Lagging', 'Rest', 'Depleted'];

// ── Onboarding value → label maps ──
const GOALS = {
  fat_loss: { label: 'Fat loss', desc: 'Drop body fat and lean out safely.' },
  muscle_gain: { label: 'Muscle gain', desc: 'Build size, strength, and raw power.' },
  recomp: { label: 'Body recomposition', desc: 'Lose fat and build muscle at once.' },
  health: { label: 'General health', desc: 'Move better, live longer, feel great.' },
  athletic: { label: 'Athletic performance', desc: 'Train for a specific sport or event.' },
  mental: { label: 'Mental wellness', desc: 'Build calm, focus, and resilience.' },
  habits: { label: 'Nutritional habits', desc: 'Fix the basics and stay consistent.' },
};
const DIET = { veg: 'Vegetarian', nonveg: 'Non-Vegetarian' };
const WORK = { desk: 'Desk job', moderate: 'Moderately active', active: 'Very active' };
const BLOOD = { yes: 'Done recently', no: 'Not done', soon: 'Will get it done' };
const GENDER = { male: 'Male', female: 'Female' };

const dash = (v) => (v === undefined || v === null || v === '' ? '—' : v);
const wt = (v, u) => (v ? `${v} ${u || 'kg'}` : '—');

// ── Section registry: summary for the list + detail renderer ──
const SECTIONS = [
  {
    id: 'goal', label: 'Goal', icon: Target,
    summary: a => (a?.goal ? GOALS[a.goal]?.label : 'Not set'),
  },
  {
    id: 'about', label: 'About you', icon: User,
    summary: a => (a?.age || a?.weight ? `${dash(a.age)} · ${wt(a.weight, a.weightUnit)}` : 'Not set'),
  },
  {
    id: 'diet', label: 'Diet preferences', icon: Utensils,
    summary: a => (a?.dietType ? `${DIET[a.dietType]} · ${a.mealsPerDay || '–'} meals` : 'Not set'),
  },
  {
    id: 'supplements', label: 'Supplements', icon: Pill,
    summary: a => (a?.supplements?.length ? `${a.supplements.length} tracked` : 'None'),
  },
  {
    id: 'routine', label: 'Daily routine', icon: Clock,
    summary: a => (a?.workType ? WORK[a.workType] : 'Not set'),
  },
  {
    id: 'health', label: 'Health info', icon: HeartPulse,
    summary: a => (a?.conditions?.length ? `${a.conditions.length} noted` : 'None'),
  },
  {
    id: 'photos', label: 'Starting photos', icon: Camera,
    summary: a => {
      const n = a?.photos ? Object.values(a.photos).filter(Boolean).length : 0;
      return `${n}/3 uploaded`;
    },
  },
];

// ─────────────────────────────────────────────
// Detail building blocks
// ─────────────────────────────────────────────
function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3.5" style={{ borderBottom: `1px solid ${T.hairline}` }}>
      <span className="font-body text-[13px]" style={{ color: T.textLow }}>{label}</span>
      <span className="font-body text-[14px] font-semibold text-right" style={{ color: T.text }}>{value}</span>
    </div>
  );
}

function ChipBlock({ label, items, empty }) {
  return (
    <div className="py-3.5" style={{ borderBottom: `1px solid ${T.hairline}` }}>
      <p className="kicker mb-2.5">{label}</p>
      {items && items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map(t => (
            <span key={t} className="px-3 py-1.5 rounded-full font-body text-[13px] font-semibold"
              style={{ background: T.surface2, border: `1px solid ${T.hairline}`, color: T.text }}>
              {t}
            </span>
          ))}
        </div>
      ) : (
        <p className="font-body text-[13px]" style={{ color: T.textFaint }}>{empty}</p>
      )}
    </div>
  );
}

function SectionDetail({ section, answers, onBack }) {
  const a = answers || {};
  const meta = SECTIONS.find(s => s.id === section);

  let body;
  if (section === 'goal') {
    const g = GOALS[a.goal];
    body = (
      <>
        {g ? (
          <div className="card p-5 mb-4">
            <p className="kicker kicker-gold mb-2">Primary goal</p>
            <h2 className="display-md text-[#F4F2EC] mb-1.5">{g.label.toUpperCase()}</h2>
            <p className="font-body text-[13px] leading-relaxed" style={{ color: T.textMid }}>{g.desc}</p>
          </div>
        ) : (
          <p className="font-body text-[14px] mb-4" style={{ color: T.textFaint }}>No goal set during onboarding.</p>
        )}
        <DetailRow label="Current weight" value={wt(a.weight, a.weightUnit)} />
        <DetailRow label="Target weight" value={wt(a.targetWeight, a.weightUnit)} />
        {a.note && <ChipBlock label="Notes for Biki" items={[a.note]} empty="—" />}
      </>
    );
  } else if (section === 'about') {
    body = (
      <>
        <DetailRow label="Age" value={dash(a.age)} />
        <DetailRow label="Gender" value={GENDER[a.gender] || '—'} />
        <DetailRow label="Height" value={a.height ? `${a.height} ${a.heightUnit || 'cm'}` : '—'} />
        <DetailRow label="Current weight" value={wt(a.weight, a.weightUnit)} />
        <DetailRow label="Target weight" value={wt(a.targetWeight, a.weightUnit)} />
      </>
    );
  } else if (section === 'diet') {
    body = (
      <>
        <DetailRow label="Diet type" value={DIET[a.dietType] || '—'} />
        <DetailRow label="Meals per day" value={dash(a.mealsPerDay)} />
        <ChipBlock label="Foods you enjoy" items={a.foodsEnjoy} empty="None added." />
        <ChipBlock label="Foods to avoid / allergies" items={a.allergies} empty="None added." />
      </>
    );
  } else if (section === 'supplements') {
    body = (
      <>
        <ChipBlock label="Currently taking" items={a.supplements} empty="No supplements tracked." />
        <div className="py-3.5">
          <p className="kicker mb-2">Anabolic use</p>
          <p className="font-body text-[13px] leading-relaxed" style={{ color: a.steroidsNote ? T.textMid : T.textFaint }}>
            {a.steroidsNote || 'Nothing disclosed.'}
          </p>
        </div>
      </>
    );
  } else if (section === 'routine') {
    body = (
      <>
        <DetailRow label="Type of work" value={WORK[a.workType] || '—'} />
        <DetailRow label="Wake up time" value={dash(a.wakeTime)} />
        <DetailRow label="Training time" value={dash(a.trainTime)} />
      </>
    );
  } else if (section === 'health') {
    body = (
      <>
        <ChipBlock label="Medical conditions" items={a.conditions} empty="None reported." />
        <DetailRow label="Recent blood test" value={BLOOD[a.bloodTest] || '—'} />
      </>
    );
  } else if (section === 'photos') {
    const angles = [['front', 'Front'], ['side', 'Side'], ['back', 'Back']];
    body = (
      <div className="flex gap-3">
        {angles.map(([key, label]) => {
          const filled = a.photos?.[key];
          return (
            <div key={key} className="flex-1 aspect-[3/4] rounded-2xl flex flex-col items-center justify-center gap-2"
              style={{
                background: filled ? T.goldTint : T.surface,
                border: `1px ${filled ? 'solid' : 'dashed'} ${filled ? T.goldBorder : T.hairlineStrong}`,
              }}>
              {filled
                ? <Check size={22} strokeWidth={2.5} style={{ color: T.gold }} />
                : <Camera size={20} strokeWidth={T.stroke} style={{ color: T.textMid }} />}
              <span className="font-body text-[11px] font-bold uppercase tracking-wider"
                style={{ color: filled ? T.gold : T.textLow }}>{label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="px-5 pb-24">
      <div className="flex items-center gap-3 pt-2 pb-5">
        <button onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-full flex items-center justify-center -ml-1">
          <ArrowLeft size={18} strokeWidth={2} style={{ color: T.text }} />
        </button>
        <h1 className="display-sm text-[#F4F2EC] uppercase">{meta?.label}</h1>
      </div>
      <p className="kicker mb-4">From your onboarding</p>
      {body}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
export default function Profile() {
  const { stateOverride, setStateOverride, resetData } = useApp();
  const [onboarding] = useLocalStorage('tbs-onboarding', { done: false, answers: null });
  const answers = onboarding?.answers || null;

  const shouldReduce = useReducedMotion();
  const [showStateToggle, setShowStateToggle] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [section, setSection] = useState(null);

  const handleHiddenTap = () => {
    const count = tapCount + 1;
    setTapCount(count);
    if (count >= 3) { setShowStateToggle(true); setTapCount(0); }
  };

  const settings = [
    { label: 'Units', value: USER_PROFILE.units === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lb, in)', icon: Ruler },
    { label: 'Notifications', value: 'On', icon: Bell },
  ];

  if (section) {
    return (
      <div className="min-h-screen" style={{ background: T.bg }}>
        <motion.div
          key={section}
          initial={shouldReduce ? {} : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: T.easeOut }}
        >
          <SectionDetail section={section} answers={answers} onBack={() => setSection(null)} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg }}>
      <motion.div
        key="list"
        initial={shouldReduce ? {} : { opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: T.easeOut }}
        className="px-5 pb-24"
      >
            {/* Header */}
            <div className="flex items-center gap-4 pt-2 pb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-display text-[24px]" style={{ background: T.gold }}>
                <span className="text-black">{USER_PROFILE.name[0]}</span>
              </div>
              <div>
                <h1 className="display-md text-[#F4F2EC] uppercase">{USER_PROFILE.name}</h1>
                <p className="font-body text-[13px] font-medium text-white/45">Week {USER_PROFILE.weekNumber} of {USER_PROFILE.totalWeeks}</p>
              </div>
            </div>

            {/* Your plan — reflects onboarding */}
            <p className="kicker mb-3">Your plan</p>
            <div className="card overflow-hidden mb-6">
              {SECTIONS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.button
                    key={s.id}
                    onClick={() => setSection(s.id)}
                    whileTap={T.tap}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    style={{ borderTop: i === 0 ? 'none' : `1px solid ${T.hairline}` }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}>
                      <Icon size={16} strokeWidth={T.stroke} style={{ color: T.textMid }} />
                    </div>
                    <span className="font-body text-[14px] font-semibold flex-1" style={{ color: T.text }}>{s.label}</span>
                    <span className="font-body text-[12px] shrink-0" style={{ color: T.textLow }}>{s.summary(answers)}</span>
                    <ChevronRight size={15} strokeWidth={T.stroke} style={{ color: T.textFaint }} />
                  </motion.button>
                );
              })}
            </div>

            {/* Settings */}
            <p className="kicker mb-3">Settings</p>
            <div className="card overflow-hidden mb-8">
              {settings.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="w-full flex items-center gap-3 px-4 py-3.5"
                    style={{ borderTop: i === 0 ? 'none' : `1px solid ${T.hairline}` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}>
                      <Icon size={16} strokeWidth={T.stroke} style={{ color: T.textMid }} />
                    </div>
                    <span className="font-body text-[14px] font-semibold flex-1" style={{ color: T.text }}>{s.label}</span>
                    <span className="font-body text-[12px] shrink-0" style={{ color: T.textLow }}>{s.value}</span>
                  </div>
                );
              })}
            </div>

            {/* Hidden state preview toggle */}
            <button onClick={handleHiddenTap} className="font-body text-[11px] text-white/15 select-none">
              <Eye size={12} strokeWidth={T.stroke} className="inline mr-1 opacity-30" />
              Preview
            </button>
            {showStateToggle && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.hairlineStrong}` }}>
                <p className="kicker mb-3">State preview</p>
                <div className="flex flex-wrap gap-2">
                  {STATES.map((state, i) => (
                    <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => setStateOverride(state)}
                      className="px-3 py-1.5 rounded-full font-body text-[12px]"
                      style={{
                        background: stateOverride === state ? T.goldGrad : T.surface2,
                        color: stateOverride === state ? '#0B0B0C' : 'rgba(255,255,255,0.5)',
                        border: `1px solid ${stateOverride === state ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                      }}>
                      {STATE_LABELS[i]}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reset + logout */}
            <motion.button whileTap={{ scale: 0.97 }} onClick={resetData} className="btn-secondary w-full mt-8">
              <RotateCcw size={14} strokeWidth={T.stroke} />
              Reset demo data
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                try {
                  localStorage.removeItem('tbs-auth');
                  localStorage.removeItem('tbs-onboarding');
                  localStorage.removeItem('tbs-walkthrough');
                } catch { /* ignore */ }
                window.location.reload();
              }}
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl font-body text-[13px] font-semibold"
              style={{ color: T.danger, border: `1px solid ${T.hairline}` }}
            >
              <LogOut size={14} strokeWidth={T.stroke} />
              Log out
            </motion.button>

            <p className="text-center font-body text-[11px] text-white/15 mt-6">TBS v0.1 Prototype</p>
      </motion.div>
    </div>
  );
}
