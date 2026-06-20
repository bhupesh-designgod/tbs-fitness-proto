// ── Plan Nudge ──
// Shared "your day is off-plan" card. Surfaces when logged/adjusted meals push
// the projected day off the plan. Layout + hierarchy follow the coach's
// "fix my day" prompt; colors stay on-token (gold = action, data keeps its hues).
//   mode="home"      → whole card + button route to Nutrition.
//   mode="nutrition" → "Fix Plan" pours the gap into the next meal.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Flame, ChevronRight, Plus } from 'lucide-react';
import { BottomSheet } from './Components';
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
  const { meals, redistributeToMeal, addMeal } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);

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
    setPickerOpen(true);
  };

  const pickMeal = (i) => {
    redistributeToMeal(i);
    setPickerOpen(false);
  };

  const addAsNewMeal = () => {
    addMeal({
      id: `meal-topup-${Date.now()}`,
      time: '',
      label: 'Coach top-up',
      foods: [{
        name: 'Top-up to hit plan',
        portion: 'custom',
        protein: Math.max(0, gap.protein),
        carbs: Math.max(0, gap.carbs),
        fat: Math.max(0, gap.fat),
        calories: Math.max(0, gap.calories),
      }],
      logged: true,
    });
    setPickerOpen(false);
  };

  return (
    <>
    <motion.div
      className="card mx-5 mb-3 p-4 relative overflow-hidden"
      style={{ border: `1px solid ${T.goldBorder}`, cursor: 'pointer' }}
      onClick={mode === 'home' ? () => onNavigate && onNavigate('nutrition') : () => setPickerOpen(true)}
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
         Adjust Meal
        </motion.button>
      </div>
    </motion.div>

    {/* Meal-picker — choose where the surplus / deficit goes */}
    <BottomSheet isOpen={pickerOpen} onClose={() => setPickerOpen(false)}>
      <div className="flex items-center gap-3 mb-1.5">
        <BikiAvatar size={38} />
        <div className="min-w-0">
          <p className="font-body text-[10px] font-extrabold uppercase tracking-wider" style={{ color: T.gold }}>From Biki</p>
          <h2 className="display-sm text-[#F4F2EC] uppercase leading-none mt-0.5">
            {short ? 'Where should it go?' : 'Ease back where?'}
          </h2>
        </div>
      </div>
      <p className="font-body text-[13px] font-medium mb-4 leading-snug" style={{ color: T.textLow }}>
        {short
          ? `You're ${Math.abs(gap.calories).toLocaleString()} kcal short. Add it to a meal, or log it as a new one.`
          : `You're ${Math.abs(gap.calories).toLocaleString()} kcal over. Pick a meal to ease back.`}
      </p>

      <div className="space-y-2.5">
        {upcoming.map(({ m, i }) => {
          const cur = sumFoods(m.foods).calories;
          const next = Math.max(0, Math.round(cur + gap.calories));
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              onClick={() => pickMeal(i)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl"
              style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}
            >
              <div className="text-left min-w-0">
                <p className="font-body text-[14px] font-bold leading-tight" style={{ color: T.text }}>{m.label}</p>
                <p className="font-body text-[12px] tabular-nums mt-0.5" style={{ color: T.textMid }}>
                  {cur} <span style={{ color: T.textFaint }}>→</span> <span className="font-bold" style={{ color: accent }}>{next}</span> kcal
                </p>
              </div>
              <span
                className="flex items-center gap-1 px-3 py-1.5 rounded-full font-body text-[11px] font-extrabold uppercase tracking-wider shrink-0"
                style={{ background: `${accent}1F`, color: accent }}
              >
                {short ? 'Add' : 'Trim'}
                <ChevronRight size={13} strokeWidth={2.5} />
              </span>
            </motion.button>
          );
        })}

        {short && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={addAsNewMeal}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl"
            style={{ border: `1px dashed ${T.hairlineStrong}` }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}>
              <Plus size={16} strokeWidth={2.5} style={{ color: T.gold }} />
            </div>
            <div className="text-left min-w-0">
              <p className="font-body text-[14px] font-bold leading-tight" style={{ color: T.text }}>Log as a new meal</p>
              <p className="font-body text-[12px] mt-0.5" style={{ color: T.textMid }}>
                Add {Math.abs(gap.calories).toLocaleString()} kcal as a separate entry
              </p>
            </div>
          </motion.button>
        )}
      </div>
    </BottomSheet>
    </>
  );
}
