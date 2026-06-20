// ── Plan Nudge ──
// Shared "your day is off-plan" card. Surfaces when logged/adjusted meals push
// the projected day off the plan. Layout + hierarchy follow the coach's
// "fix my day" prompt; colors stay on-token (gold = action, data keeps its hues).
//   mode="home"      → whole card + button route to Nutrition.
//   mode="nutrition" → "Fix Plan" pours the gap into the next meal.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { T, enter } from '../../tokens';
import { PLAN_TOTALS, PHOTOS } from '../../data/mockData';

const sumFoods = (foods) => foods.reduce(
  (a, f) => ({
    calories: a.calories + (f.calories || 0),
    protein: a.protein + (f.protein || 0),
    carbs: a.carbs + (f.carbs || 0),
    fat: a.fat + (f.fat || 0),
  }),
  { calories: 0, protein: 0, carbs: 0, fat: 0 },
);

// Biki avatar with initial fallback — the "from your coach" cue.
function BikiAvatar({ size = 42 }) {
  const [err, setErr] = useState(false);
  return (
    <div
      className="rounded-full overflow-hidden shrink-0 flex items-center justify-center font-display text-[16px]"
      style={{
        width: size, height: size,
        border: `2px solid ${T.gold}`,
        background: T.surface2, color: T.gold,
        boxShadow: `0 2px 14px ${T.goldTint}`,
      }}
    >
      {err ? 'B' : (
        <img
          src={PHOTOS.bikiPortrait}
          alt="Coach Biki"
          className="w-full h-full object-cover"
          style={{ filter: 'grayscale(20%) contrast(1.05)' }}
          onError={() => setErr(true)}
        />
      )}
    </div>
  );
}

export default function PlanNudge({ mode = 'home', onNavigate, delay = 0.1 }) {
  const { meals, redistributeToMeal } = useApp();

  const projected = meals.reduce((acc, m) => {
    const s = sumFoods(m.foods);
    return {
      calories: acc.calories + s.calories,
      protein: acc.protein + s.protein,
      carbs: acc.carbs + s.carbs,
      fat: acc.fat + s.fat,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const gap = {
    calories: PLAN_TOTALS.calories - projected.calories,
    protein: PLAN_TOTALS.protein - projected.protein,
    carbs: PLAN_TOTALS.carbs - projected.carbs,
    fat: PLAN_TOTALS.fat - projected.fat,
  };

  const loggedCount = meals.filter(m => m.logged).length;
  const upcoming = meals.map((m, i) => ({ m, i })).filter(({ m }) => !m.logged);

  // Only nudge once something's logged off-plan and there's a meal left to fix it.
  if (loggedCount === 0 || upcoming.length === 0 || Math.abs(gap.calories) < 25) {
    return null;
  }

  const short = gap.calories > 0;
  const rec = upcoming[0]; // the next meal to lean on
  const accent = short ? T.cal : T.macroFat;

  const macroBits = [
    { v: gap.protein, label: 'Protein', color: T.macroProtein },
    { v: gap.fat,     label: 'Fat',     color: T.macroFat },
    { v: gap.carbs,   label: 'Carbs',   color: T.macroCarbs },
  ].filter(b => Math.abs(b.v) >= 2);

  const handleFix = (e) => {
    if (e) e.stopPropagation();
    if (mode === 'home') { onNavigate && onNavigate('nutrition'); return; }
    redistributeToMeal(rec.i);
  };

  return (
    <motion.div
      className="card mx-5 mb-3 p-4 relative overflow-hidden"
      style={{ border: `1px solid ${T.goldBorder}`, cursor: mode === 'home' ? 'pointer' : 'default' }}
      onClick={mode === 'home' ? () => onNavigate && onNavigate('nutrition') : undefined}
      {...enter(delay)}
    >
      {/* Faint gold glow — marks this as the action card */}
      <div
        className="absolute -right-12 -top-12 w-44 h-44 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(closest-side, ${T.goldTint}, transparent 70%)` }}
      />

      {/* Status — who's talking + the headline */}
      <div className="flex items-center gap-3 relative">
        <BikiAvatar />
        <div className="flex-1 min-w-0">
          <p className="font-body text-[10px] font-extrabold uppercase tracking-wider" style={{ color: T.gold }}>
            From Biki
          </p>
          <p className="font-body text-[14px] font-bold leading-tight mt-0.5" style={{ color: T.text }}>
            {short ? "You're behind today's target" : "You're over today's plan"}
          </p>
        </div>
      </div>

      {/* The number — the hero */}
      <div className="flex items-baseline gap-1.5 mt-3.5 relative">
        <span className="font-display text-[34px] tabular-nums leading-none" style={{ color: accent }}>
          {Math.abs(gap.calories).toLocaleString()}
        </span>
        <span className="font-body text-[13px] font-bold" style={{ color: accent }}>kcal</span>
        <span className="font-body text-[13px] font-medium" style={{ color: T.textLow }}>
          {short ? 'remaining' : 'over plan'}
        </span>
      </div>

      {/* Macro breakdown of the gap */}
      {macroBits.length > 0 && (
        <div className="flex items-center gap-3 mt-2 relative">
          <span className="font-body text-[11px] font-extrabold uppercase tracking-wider" style={{ color: T.textFaint }}>
            {short ? 'Need' : 'Over'}
          </span>
          {macroBits.map(b => (
            <span key={b.label} className="font-body text-[13px] font-bold tabular-nums" style={{ color: b.color }}>
              {b.v > 0 ? '+' : ''}{b.v}g
              <span className="font-body text-[10px] font-medium ml-1" style={{ color: T.textLow }}>{b.label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="my-3.5 relative" style={{ borderTop: `1px solid ${T.hairline}` }} />

      {/* Recommended next + the fix */}
      <div className="flex items-center justify-between gap-3 relative">
        <div className="min-w-0">
          <p className="font-body text-[10px] font-extrabold uppercase tracking-wider" style={{ color: T.textFaint }}>
            Recommended next
          </p>
          <p className="display-xs text-[#F4F2EC] uppercase mt-1 truncate">
            {short ? 'Increase' : 'Ease back'} {rec.m.label}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Flame size={12} strokeWidth={T.stroke} style={{ color: accent }} />
            <span className="font-body text-[12px] font-bold tabular-nums" style={{ color: accent }}>
              {short ? '+' : '−'}{Math.abs(gap.calories).toLocaleString()} kcal
            </span>
          </div>
        </div>
        <motion.button
          whileTap={T.tap}
          onClick={handleFix}
          className="btn-primary !w-auto shrink-0"
        >
          <Sparkles size={15} strokeWidth={2} />
          Fix Plan
        </motion.button>
      </div>
    </motion.div>
  );
}
