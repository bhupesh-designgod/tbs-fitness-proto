// ── Profile Screen ──
// Identity header, plan sections that reflect onboarding answers (tap → detail),
// settings, hidden state preview, reset, logout.

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Target, User, Utensils, CalendarDays, Dumbbell, Ban,
  Ruler, Bell, RotateCcw, Eye, ChevronRight, LogOut, ArrowLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { USER_PROFILE } from '../data/mockData';
import { T } from '../tokens';

const STATES = [null, 'ON_TRACK', 'LAGGING', 'REST', 'DEPLETED'];
const STATE_LABELS = ['Auto', 'On Track', 'Lagging', 'Rest', 'Depleted'];

// ── Onboarding value → label maps (v2 answer shape) ──
const GOALS = {
  cut: { label: 'Cut', desc: 'Strip fat while holding onto muscle.' },
  build: { label: 'Build', desc: 'Add size and raw strength.' },
  recomp: { label: 'Recomp', desc: 'Lose fat and build muscle at once.' },
  maintain: { label: 'General fitness', desc: 'Stay healthy, fit, and consistent.' },
};
const DIET = {
  vegetarian: 'Vegetarian', 'non-vegetarian': 'Non-vegetarian',
  eggetarian: 'Eggetarian', vegan: 'Vegan',
};
const EXP = {
  new: 'New to this', some: 'Some experience', years: 'Years deep',
};
const SEX = { m: 'Male', f: 'Female' };

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
    id: 'diet', label: 'Diet style', icon: Utensils,
    summary: a => (a?.diet ? DIET[a.diet] : 'Not set'),
  },
  {
    id: 'day', label: 'Day plan', icon: CalendarDays,
    summary: a => (a?.meals_per_day ? `${a.meals_per_day} meals · ${a.shakes_per_day ?? 0} shakes` : 'Not set'),
  },
  {
    id: 'experience', label: 'Experience', icon: Dumbbell,
    summary: a => (a?.experience ? EXP[a.experience] : 'Not set'),
  },
  {
    id: 'allergies', label: 'Allergies / avoids', icon: Ban,
    summary: a => (a?.allergies?.length ? `${a.allergies.length} listed` : (a?.avoidsText ? '1 listed' : 'None')),
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
        <DetailRow label="Experience" value={EXP[a.experience] || '—'} />
      </>
    );
  } else if (section === 'about') {
    body = (
      <>
        <DetailRow label="Name" value={dash(a.name)} />
        <DetailRow label="Age" value={dash(a.age)} />
        <DetailRow label="Sex" value={SEX[a.sex] || '—'} />
        <DetailRow label="Height" value={a.height ? `${a.height} ${a.heightUnit === 'ft' ? 'cm' : 'cm'}` : '—'} />
        <DetailRow label="Weight" value={wt(a.weight, a.weightUnit)} />
      </>
    );
  } else if (section === 'diet') {
    body = (
      <>
        <DetailRow label="Diet style" value={DIET[a.diet] || '—'} />
        <DetailRow label="Meals per day" value={dash(a.meals_per_day)} />
      </>
    );
  } else if (section === 'day') {
    body = (
      <>
        <DetailRow label="Meals" value={dash(a.meals_per_day)} />
        <DetailRow label="Shakes" value={a.shakes_per_day ?? '—'} />
        <DetailRow label="Snacks" value={a.snacks_per_day ?? '—'} />
      </>
    );
  } else if (section === 'experience') {
    body = (
      <div className="card p-5">
        <p className="kicker kicker-gold mb-2">Training experience</p>
        <h2 className="display-md text-[#F4F2EC]">{(EXP[a.experience] || 'Not set').toUpperCase()}</h2>
      </div>
    );
  } else if (section === 'allergies') {
    body = (
      <>
        <ChipBlock label="Allergies / avoids" items={a.allergies} empty="None listed." />
        <div className="py-3.5">
          <p className="kicker mb-2">Anything else</p>
          <p className="font-body text-[13px] leading-relaxed" style={{ color: a.avoidsText ? T.textMid : T.textFaint }}>
            {a.avoidsText || 'Nothing added.'}
          </p>
        </div>
      </>
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
