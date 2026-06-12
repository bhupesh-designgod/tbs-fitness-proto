// ── Nutrition Screen ──
// Tabs (Nutrition/Hydration), Macros Overview, meal timeline,
// bottom sheet for logging/adjusting/adding custom foods.

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check, Search, X, ChevronRight, Droplets,
  Settings, CalendarDays, BookOpen, Plus,
} from 'lucide-react';
import {
  PillChip, BottomSheet, NumericCounter, RingCounter,
} from '../components/ui/Components';
import { useApp } from '../context/AppContext';
import { DAILY_TARGETS, MEAL_PLAN, FOOD_DATABASE, USER_PROFILE } from '../data/mockData';

// ── Helpers ──
function sumFoods(foods) {
  return foods.reduce(
    (acc, f) => ({
      protein: acc.protein + (f.protein || 0),
      carbs: acc.carbs + (f.carbs || 0),
      fat: acc.fat + (f.fat || 0),
      calories: acc.calories + (f.calories || 0),
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  );
}

function foodSummary(foods) {
  if (!foods || foods.length === 0) return '';
  if (foods.length === 1) return foods[0].name;
  return `${foods[0].name} & ${foods[1].name}${foods.length > 2 ? ` +${foods.length - 2}` : ''}`;
}

const DAY_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// ═════════════════════════════════════════════
// ── Tab Toggle ──
// ═════════════════════════════════════════════
function TabToggle({ active, onChange }) {
  return (
    <div className="mx-5 mb-4 flex rounded-full p-1"
      style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.08)' }}>
      {['Nutrition', 'Hydration'].map(tab => {
        const isActive = active === tab.toLowerCase();
        return (
          <motion.button key={tab} onClick={() => onChange(tab.toLowerCase())}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-body text-[13px] font-medium"
            style={{
              background: isActive ? 'linear-gradient(135deg, #B8893C, #E0C074)' : 'transparent',
              color: isActive ? '#000' : 'rgba(255,255,255,0.4)',
            }}
            whileTap={{ scale: 0.97 }}>
            {tab === 'Nutrition'
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 2a2 2 0 0 0-2 2v5H7a2 2 0 0 0-2 2v1c0 2.8 2.2 5 5 5v5h4v-5c2.8 0 5-2.2 5-5v-1a2 2 0 0 0-2-2h-2V4a2 2 0 0 0-2-2h-2z"/></svg>
              : <Droplets size={14} strokeWidth={1.5} />}
            {tab}
          </motion.button>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════
// ── Week Strip ──
// ═════════════════════════════════════════════
function WeekStrip() {
  const shouldReduce = useReducedMotion();
  const today = new Date();
  const weekDays = useMemo(() => {
    const start = new Date(today);
    start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return { label: DAY_ABBR[d.getDay()], date: d.getDate(), isToday: d.toDateString() === today.toDateString() };
    });
  }, []);

  return (
    <div className="px-5 mb-4">
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, i) => (
          <motion.div key={i} className="flex flex-col items-center gap-1"
            initial={shouldReduce ? {} : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}>
            <span className="font-body text-[9px] text-white/25 uppercase tracking-wider">{day.label}</span>
            <div className="w-full aspect-square rounded-[14px] flex items-center justify-center"
              style={{
                background: day.isToday ? 'linear-gradient(135deg, #B8893C, #E0C074)' : 'transparent',
                border: day.isToday ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}>
              <span className="font-display text-[15px] font-bold tabular-nums"
                style={{ color: day.isToday ? '#000' : 'rgba(255,255,255,0.6)' }}>{day.date}</span>
            </div>
            {day.isToday && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#D4A74E' }} />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// ── Macros Overview Card ──
// ═════════════════════════════════════════════
function MacrosOverview({ logged, remaining, onAutoAdjust, hasDeviation }) {
  const shouldReduce = useReducedMotion();
  const calPct = Math.min(Math.round((logged.calories / DAILY_TARGETS.calories) * 100), 100);
  const macros = [
    { key: 'protein', label: 'Protein', short: 'P', curr: logged.protein, target: DAILY_TARGETS.protein, color: '#D4A74E' },
    { key: 'fat', label: 'Fat', short: 'F', curr: logged.fat, target: DAILY_TARGETS.fat, color: '#C8C8C6' },
    { key: 'carbs', label: 'Carbs', short: 'C', curr: logged.carbs, target: DAILY_TARGETS.carbs, color: '#9A7B4F' },
  ];
  const isBehind = remaining.calories > 0 || remaining.protein > 0;

  return (
    <motion.div className="mx-5 mb-4 rounded-2xl p-4"
      style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.08)' }}
      initial={shouldReduce ? {} : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-[15px] font-bold text-white">Macros Overview</h2>
        {logged.calories > 0 && (
          <span className="font-body text-[11px] font-medium" style={{ color: isBehind ? '#D4A74E' : '#5B7C5A' }}>
            {isBehind ? 'Behind target' : 'On track'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <RingCounter percentage={calPct} size={90} strokeWidth={4} delay={0.1}>
            <div className="flex flex-col items-center">
              <NumericCounter value={logged.calories} className="text-[22px] font-extrabold text-white" duration={0.5} />
              <span className="font-body text-[9px] text-white/30">/ {DAILY_TARGETS.calories}</span>
              <span className="font-body text-[8px] text-white/20">kcal</span>
            </div>
          </RingCounter>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-3">
          {macros.map(m => {
            const pct = Math.min((m.curr / m.target) * 100, 100);
            const delta = m.curr - m.target;
            return (
              <div key={m.key}>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-display text-[11px] font-bold" style={{ color: m.color }}>{m.short}</span>
                  <span className="font-body text-[10px] text-white/35">{m.label}</span>
                </div>
                <div className="flex items-baseline gap-0.5 mb-1.5">
                  <span className="font-display text-[18px] font-bold text-white tabular-nums">{m.curr}</span>
                  <span className="font-body text-[11px] text-white/25">/ {m.target}g</span>
                </div>
                <div className="w-full h-[3px] rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-full rounded-full" style={{ background: m.color }}
                    initial={{ width: '0%' }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
                </div>
                <span className="font-body text-[10px] tabular-nums"
                  style={{ color: delta < 0 ? 'rgba(255,180,80,0.7)' : 'rgba(255,255,255,0.25)' }}>
                  {delta < 0 ? `${delta}g` : delta === 0 ? 'On target' : `+${delta}g`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-adjust advisory — only when user ate more or less than planned */}
      {hasDeviation && logged.calories > 0 && (
        <motion.div className="mt-4 rounded-xl p-3 flex items-center justify-between gap-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          initial={shouldReduce ? {} : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <p className="font-body text-[12px] text-white/40 leading-relaxed flex-1">
            Behind on macros. Adjust your next meal to stay on track.
          </p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={onAutoAdjust}
            className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg font-body text-[11px] font-medium text-black"
            style={{ background: 'linear-gradient(135deg, #B8893C, #E0C074)' }}>
            Adjust next meal <ChevronRight size={12} strokeWidth={1.5} />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ═════════════════════════════════════════════
// ── Macro Pill ──
// ═════════════════════════════════════════════
function MacroPill({ label, value, color }) {
  return (
    <span className="font-body text-[11px] tabular-nums" style={{ color }}>
      {label} <span className="font-display font-bold">{value}</span>
    </span>
  );
}

// ═════════════════════════════════════════════
// ── Meal Timeline Card ──
// ═════════════════════════════════════════════
function MealTimelineCard({ meal, mealIndex, onTap, onLog, totalSoFar, delay = 0 }) {
  const shouldReduce = useReducedMotion();
  const totals = sumFoods(meal.foods);
  const isLogged = meal.logged;
  const summary = foodSummary(meal.foods);

  const remaining = {
    calories: DAILY_TARGETS.calories - totalSoFar.calories,
    protein: DAILY_TARGETS.protein - totalSoFar.protein,
    fat: DAILY_TARGETS.fat - totalSoFar.fat,
    carbs: DAILY_TARGETS.carbs - totalSoFar.carbs,
  };

  return (
    <motion.div className="relative"
      initial={shouldReduce ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.06 + 0.2, duration: 0.3 }}>

      {/* Status dot */}
      <div className="absolute left-0 top-5 z-10">
        {isLogged ? (
          <div className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(91,124,90,0.2)', border: '1.5px solid rgba(91,124,90,0.5)' }}>
            <Check size={12} strokeWidth={2.5} style={{ color: '#5B7C5A' }} />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full"
            style={{ background: '#0A0A0A', border: '1.5px dashed rgba(255,255,255,0.15)' }} />
        )}
      </div>

      {/* Time label */}
      <div className="absolute left-0 top-12 text-center w-6">
        <span className="font-body text-[8px] text-white/20 leading-none">{meal.time?.replace(':00', '')}</span>
      </div>

      {/* Card */}
      <div className="ml-9">
        {isLogged ? (
          /* ── LOGGED STATE ── */
          <div className="rounded-2xl p-4"
            style={{ background: '#0E0E0E', border: '1px solid rgba(91,124,90,0.15)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(91,124,90,0.1)', border: '1px solid rgba(91,124,90,0.15)' }}>
                  <Check size={14} strokeWidth={1.5} style={{ color: '#5B7C5A' }} />
                </div>
                <div>
                  <p className="font-display text-[14px] font-bold text-white/70">{meal.label}</p>
                  <p className="font-body text-[11px] text-white/25">{summary}</p>
                </div>
              </div>
              <span className="font-body text-[10px] font-medium" style={{ color: '#5B7C5A' }}>Logged</span>
            </div>
            <div className="flex gap-4 mt-2 pl-[42px]">
              <MacroPill label="Cal" value={totals.calories} color="rgba(255,255,255,0.4)" />
              <MacroPill label="P" value={`${totals.protein}g`} color="#D4A74E" />
              <MacroPill label="F" value={`${totals.fat}g`} color="#C8C8C6" />
              <MacroPill label="C" value={`${totals.carbs}g`} color="#9A7B4F" />
            </div>

            {/* Behind target feedback */}
            {remaining.calories > 100 && (
              <div className="mt-3 pt-2.5 flex gap-3 pl-[42px]"
                style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="font-body text-[10px] tabular-nums" style={{ color: 'rgba(255,180,80,0.6)' }}>
                  {totalSoFar.calories - DAILY_TARGETS.calories} Cal
                </span>
                <span className="font-body text-[10px] tabular-nums" style={{ color: 'rgba(255,180,80,0.6)' }}>
                  {totalSoFar.protein - DAILY_TARGETS.protein}g Protein
                </span>
                <span className="font-body text-[9px] text-white/15">Total so far</span>
              </div>
            )}
          </div>
        ) : (
          /* ── UNLOGGED STATE — compact ── */
          <div className="rounded-2xl p-4"
            style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M11 2a2 2 0 0 0-2 2v5H7a2 2 0 0 0-2 2v1c0 2.8 2.2 5 5 5v5h4v-5c2.8 0 5-2.2 5-5v-1a2 2 0 0 0-2-2h-2V4a2 2 0 0 0-2-2h-2z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-display text-[15px] font-bold text-white">{meal.label}</p>
                  <p className="font-body text-[11px] text-white/25">{summary}</p>
                </div>
              </div>
              <span className="font-body text-[10px] text-white/20 uppercase tracking-wider">Not logged</span>
            </div>

            {/* Food list — names and portions only */}
            <div className="space-y-1.5 mb-3 pl-[42px]">
              {meal.foods.map((food, fi) => (
                <div key={fi} className="flex justify-between items-baseline">
                  <span className="font-body text-[13px] text-white/45">{food.name}</span>
                  <span className="font-body text-[11px] text-white/20 tabular-nums">{food.portion}</span>
                </div>
              ))}
            </div>

            {/* Log + Adjust buttons */}
            <div className="flex gap-2 pl-[42px]">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => onLog(mealIndex)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-body text-[13px] font-medium text-black"
                style={{ background: 'linear-gradient(135deg, #B8893C, #E0C074)' }}>
                <Check size={14} strokeWidth={2} /> Log
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => onTap(mealIndex)}
                className="py-2.5 px-4 rounded-xl font-body text-[12px] text-white/35"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                Adjust
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════
// ── Snack Card ──
// ═════════════════════════════════════════════
function SnackCard({ onAdd }) {
  return (
    <motion.div className="ml-9 rounded-2xl p-4 flex items-center justify-between"
      style={{ background: '#0A0A0A', border: '1px dashed rgba(255,255,255,0.08)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Plus size={14} strokeWidth={1.5} className="text-white/20" />
        </div>
        <div>
          <p className="font-display text-[14px] font-bold text-white/40">Snack</p>
          <p className="font-body text-[11px] text-white/15">Not planned yet</p>
        </div>
      </div>
      <motion.button whileTap={{ scale: 0.95 }} onClick={onAdd}
        className="px-3 py-2 rounded-lg font-body text-[11px] font-medium"
        style={{ background: 'rgba(212,167,78,0.1)', border: '1px solid rgba(212,167,78,0.2)', color: '#D4A74E' }}>
        Add Snack
      </motion.button>
    </motion.div>
  );
}

// ═════════════════════════════════════════════
// ── Meal Bottom Sheet ──
// ═════════════════════════════════════════════
function MealSheet({ meal, mealIndex, isOpen, onClose, logged, logMeal, adjustMeal }) {
  const [view, setView] = useState('main');
  const [editFoods, setEditFoods] = useState([]);
  // Custom food state
  const [customName, setCustomName] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  useEffect(() => {
    if (meal && isOpen) {
      setEditFoods(meal.foods.map(f => ({ ...f })));
      setView('main');
      setCustomName('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
    }
  }, [meal, isOpen]);

  const handleFieldChange = useCallback((fi, field, value) => {
    setEditFoods(prev => {
      const next = [...prev];
      next[fi] = { ...next[fi], [field]: Math.max(0, Number(value) || 0) };
      next[fi].calories = Math.round(next[fi].protein * 4 + next[fi].carbs * 4 + next[fi].fat * 9);
      return next;
    });
  }, []);

  const handleLogAsIs = useCallback(() => { logMeal(mealIndex); onClose(); }, [logMeal, mealIndex, onClose]);
  const handleConfirmAdjust = useCallback(() => { adjustMeal(mealIndex, editFoods); onClose(); }, [adjustMeal, mealIndex, editFoods, onClose]);

  // Add custom food to the edit list
  const handleAddCustom = useCallback(() => {
    if (!customName.trim()) return;
    const p = Number(customProtein) || 0;
    const c = Number(customCarbs) || 0;
    const f = Number(customFat) || 0;
    const cal = Math.round(p * 4 + c * 4 + f * 9);
    setEditFoods(prev => [...prev, {
      name: customName.trim(),
      portion: 'custom',
      protein: p, carbs: c, fat: f, calories: cal,
    }]);
    setCustomName('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
  }, [customName, customProtein, customCarbs, customFat]);

  // Remove a food item
  const handleRemoveFood = useCallback((fi) => {
    setEditFoods(prev => prev.filter((_, i) => i !== fi));
  }, []);

  if (!meal) return null;
  const editTotals = sumFoods(editFoods);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-[20px] font-bold text-white">{meal.label}</h2>
        <span className="font-body text-[12px] text-white/25">{meal.time}</span>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Main view ── */}
        {view === 'main' && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-2 mb-5">
              {meal.foods.map((food, fi) => (
                <div key={fi} className="flex justify-between items-center py-2.5 px-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div>
                    <span className="font-body text-[13px] text-white/75 block">{food.name}</span>
                    <span className="font-body text-[11px] text-white/20">{food.portion}</span>
                  </div>
                  <div className="flex gap-2 text-[11px] tabular-nums">
                    <span style={{ color: '#D4A74E' }}>{food.protein}p</span>
                    <span style={{ color: '#C8C8C6' }}>{food.carbs}c</span>
                    <span style={{ color: '#9A7B4F' }}>{food.fat}f</span>
                  </div>
                </div>
              ))}
            </div>

            {!meal.logged && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogAsIs}
                className="w-full py-3.5 rounded-xl font-body text-[15px] font-medium text-black mb-3"
                style={{ background: 'linear-gradient(135deg, #B8893C, #E0C074)' }}>
                <div className="flex items-center justify-center gap-2">
                  <Check size={16} strokeWidth={2} /> Log as is
                </div>
              </motion.button>
            )}

            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setView('adjust')}
                className="flex-1 py-3 rounded-xl font-body text-[13px] font-medium text-white/50 flex items-center justify-center gap-1.5"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                Adjust
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setView('add')}
                className="flex-1 py-3 rounded-xl font-body text-[13px] font-medium text-white/50 flex items-center justify-center gap-1.5"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <Plus size={13} strokeWidth={1.5} /> Add food
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Adjust view ── */}
        {view === 'adjust' && (
          <motion.div key="adjust" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <button onClick={() => setView('main')} className="font-body text-[12px] text-white/30 mb-3 flex items-center gap-1">
              <ChevronRight size={12} strokeWidth={1.5} className="rotate-180" /> Back
            </button>

            <div className="space-y-3">
              {editFoods.map((food, fi) => (
                <div key={fi} className="rounded-xl p-3.5 relative"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {/* Remove button */}
                  <button onClick={() => handleRemoveFood(fi)}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <X size={10} strokeWidth={2} className="text-white/30" />
                  </button>

                  <p className="font-body text-[13px] text-white/60 mb-2.5 pr-6">{food.name}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'protein', label: 'Protein (g)', color: '#D4A74E' },
                      { key: 'carbs', label: 'Carbs (g)', color: '#9A7B4F' },
                      { key: 'fat', label: 'Fat (g)', color: '#C8C8C6' },
                    ].map(m => (
                      <div key={m.key}>
                        <label className="font-body text-[9px] text-white/20 uppercase tracking-wider block mb-1">{m.label}</label>
                        <input type="number" min={0} value={food[m.key]}
                          onChange={e => handleFieldChange(fi, m.key, e.target.value)}
                          className="w-full bg-transparent font-display text-[15px] font-bold tabular-nums outline-none px-2.5 py-2 rounded-lg"
                          style={{ color: m.color, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1.5 text-right">
                    <span className="font-body text-[10px] text-white/20 tabular-nums">{food.calories} cal</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add custom food inline */}
            <button onClick={() => setView('add')}
              className="w-full mt-3 py-2.5 rounded-xl font-body text-[12px] text-white/25 flex items-center justify-center gap-1.5"
              style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
              <Plus size={12} strokeWidth={1.5} /> Add another food
            </button>

            {/* Delta preview */}
            <DeltaPreview editTotals={editTotals} logged={logged} />

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirmAdjust}
              className="w-full py-3.5 rounded-xl font-body text-[15px] font-medium text-black mt-4"
              style={{ background: 'linear-gradient(135deg, #B8893C, #E0C074)' }}>
              Confirm & log
            </motion.button>
          </motion.div>
        )}

        {/* ── Add custom food view ── */}
        {view === 'add' && (
          <motion.div key="add" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <button onClick={() => setView(editFoods.length > 0 ? 'adjust' : 'main')}
              className="font-body text-[12px] text-white/30 mb-4 flex items-center gap-1">
              <ChevronRight size={12} strokeWidth={1.5} className="rotate-180" /> Back
            </button>

            <p className="font-display text-[15px] font-bold text-white mb-4">Add custom food</p>

            {/* Food name */}
            <div className="mb-3">
              <label className="font-body text-[10px] text-white/25 uppercase tracking-wider block mb-1.5">Food name</label>
              <input type="text" value={customName} onChange={e => setCustomName(e.target.value)}
                placeholder="e.g. Chicken Breast"
                className="w-full bg-transparent font-body text-[15px] text-white/80 placeholder:text-white/15 outline-none px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>

            {/* Macro inputs */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { value: customProtein, set: setCustomProtein, label: 'Protein (g)', color: '#D4A74E' },
                { value: customCarbs, set: setCustomCarbs, label: 'Carbs (g)', color: '#9A7B4F' },
                { value: customFat, set: setCustomFat, label: 'Fat (g)', color: '#C8C8C6' },
              ].map(m => (
                <div key={m.label}>
                  <label className="font-body text-[9px] text-white/20 uppercase tracking-wider block mb-1">{m.label}</label>
                  <input type="number" min={0} value={m.value} onChange={e => m.set(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent font-display text-[16px] font-bold tabular-nums outline-none px-2.5 py-2.5 rounded-lg placeholder:text-white/10"
                    style={{ color: m.color, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
                </div>
              ))}
            </div>

            {/* Auto cal preview */}
            {(customProtein || customCarbs || customFat) && (
              <p className="font-body text-[11px] text-white/25 text-center mb-4 tabular-nums">
                {Math.round((Number(customProtein) || 0) * 4 + (Number(customCarbs) || 0) * 4 + (Number(customFat) || 0) * 9)} cal estimated
              </p>
            )}

            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => { handleAddCustom(); setView('adjust'); }}
              disabled={!customName.trim()}
              className="w-full py-3.5 rounded-xl font-body text-[15px] font-medium text-black disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #B8893C, #E0C074)' }}>
              <div className="flex items-center justify-center gap-2">
                <Plus size={16} strokeWidth={2} /> Add to meal
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}

// ── Delta Preview ──
function DeltaPreview({ editTotals, logged }) {
  return (
    <div className="rounded-xl p-3 mt-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="font-body text-[9px] text-white/20 uppercase tracking-wider block mb-2">After logging</span>
      <div className="grid grid-cols-4 gap-2">
        {[
          { key: 'protein', label: 'Protein', color: '#D4A74E', unit: 'g' },
          { key: 'carbs', label: 'Carbs', color: '#9A7B4F', unit: 'g' },
          { key: 'fat', label: 'Fat', color: '#C8C8C6', unit: 'g' },
          { key: 'calories', label: 'Cal', color: 'rgba(255,255,255,0.5)', unit: '' },
        ].map(d => {
          const rem = DAILY_TARGETS[d.key] - (logged[d.key] + editTotals[d.key]);
          const isOver = rem < 0;
          return (
            <div key={d.key} className="text-center">
              <NumericCounter value={Math.abs(Math.round(rem))} className="text-[14px] font-bold" duration={0.3} />
              <span className="font-body text-[9px] block mt-0.5"
                style={{ color: isOver ? 'rgba(255,255,255,0.25)' : d.color }}>
                {isOver ? `over` : `${d.label} left`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// ── Hydration View ──
// ═════════════════════════════════════════════
function HydrationView({ hydration, logWater }) {
  const pct = Math.min((hydration / DAILY_TARGETS.water) * 100, 100);
  const [customOpen, setCustomOpen] = useState(false);
  const [customMl, setCustomMl] = useState(350);

  return (
    <div className="px-5">
      <motion.div className="flex flex-col items-center py-8"
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <RingCounter percentage={pct} size={160} strokeWidth={6} color="#5B7C99" delay={0.1}>
          <div className="flex flex-col items-center">
            <NumericCounter value={hydration} className="text-[36px] font-extrabold text-white" duration={0.7} />
            <span className="font-body text-[12px] text-white/30">/ {DAILY_TARGETS.water} ml</span>
          </div>
        </RingCounter>
      </motion.div>

      <div className="flex gap-2 justify-center mb-6">
        {[250, 500, 750].map(ml => (
          <motion.button key={ml} whileTap={{ scale: 0.93 }} onClick={() => logWater(ml)}
            className="px-5 py-3 rounded-xl font-display text-[14px] font-bold tabular-nums"
            style={{ background: 'rgba(91,124,153,0.12)', border: '1px solid rgba(91,124,153,0.2)', color: '#5B7C99' }}>
            +{ml}ml
          </motion.button>
        ))}
      </div>

      <motion.button whileTap={{ scale: 0.97 }} onClick={() => setCustomOpen(!customOpen)}
        className="w-full py-3 rounded-xl font-body text-[13px] text-white/40 mb-4"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        Custom amount
      </motion.button>

      <AnimatePresence>
        {customOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.06)' }}>
              <input type="number" min={50} max={2000} step={50} value={customMl}
                onChange={e => setCustomMl(Math.max(50, Math.min(2000, Number(e.target.value))))}
                className="flex-1 bg-transparent font-display text-[18px] font-bold text-white tabular-nums outline-none px-3 py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} />
              <span className="font-body text-[11px] text-white/25">ml</span>
              <motion.button whileTap={{ scale: 0.93 }}
                onClick={() => { logWater(customMl); setCustomOpen(false); }}
                className="px-4 py-2.5 rounded-lg font-body text-[13px] font-medium text-black"
                style={{ background: 'linear-gradient(135deg, #5B7C99, #7A9CB5)' }}>
                Add
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═════════════════════════════════════════════
// ── Score Footer ──
// ═════════════════════════════════════════════
function ScoreFooter({ meals, hydration }) {
  const score = useMemo(() => {
    let pts = 0;
    meals.forEach(m => { if (m.logged) pts += 5; });
    if (hydration >= DAILY_TARGETS.water * 0.5) pts += 5;
    if (hydration >= DAILY_TARGETS.water) pts += 5;
    return { earned: pts, total: 30 };
  }, [meals, hydration]);
  const pct = Math.round((score.earned / score.total) * 100);

  return (
    <motion.div className="mx-5 mt-4 rounded-2xl p-4 flex items-center gap-3"
      style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.08)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'rgba(212,167,78,0.1)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4A74E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="font-display text-[14px] font-bold text-white">Today's Score</p>
        <p className="font-body text-[11px] text-white/30 mt-0.5">
          {score.earned >= score.total ? 'All goals hit!' : 'Keep it up!'}
        </p>
      </div>
      <RingCounter percentage={pct} size={44} strokeWidth={2.5} delay={0.3}>
        <span className="font-display text-[13px] font-bold text-white tabular-nums">{score.earned}</span>
      </RingCounter>
      <ChevronRight size={16} strokeWidth={1.5} className="text-white/12 shrink-0" />
    </motion.div>
  );
}

// ═════════════════════════════════════════════
// ── Food Search ──
// ═════════════════════════════════════════════
function FoodSearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const results = useMemo(() => {
    if (query.length < 2) return [];
    return FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  }, [query]);

  return (
    <div className="px-5 mt-5 mb-2 relative">
      <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
        style={{
          background: '#0E0E0E',
          border: focused ? '1px solid rgba(212,167,78,0.25)' : '1px solid rgba(255,255,255,0.06)',
        }}>
        <Search size={16} strokeWidth={1.5} className="text-white/20 shrink-0" />
        <input type="text" placeholder="Search food database" value={query}
          onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          className="bg-transparent w-full font-body text-[13px] text-white/60 placeholder:text-white/15 outline-none" />
        {query && <button onClick={() => setQuery('')}><X size={14} strokeWidth={1.5} className="text-white/20" /></button>}
      </div>
      <AnimatePresence>
        {focused && results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute left-5 right-5 top-full mt-1 rounded-xl overflow-hidden z-20"
            style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
            {results.map((food, fi) => (
              <button key={fi}
                className="w-full text-left px-4 py-2.5 flex justify-between items-center hover:bg-white/5"
                style={{ borderBottom: fi < results.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
                onMouseDown={e => e.preventDefault()}>
                <span className="font-body text-[13px] text-white/60">{food.name}</span>
                <div className="flex gap-2 text-[10px] tabular-nums">
                  <span style={{ color: '#D4A74E' }}>{food.per100.protein}p</span>
                  <span style={{ color: '#C8C8C6' }}>{food.per100.carbs}c</span>
                  <span style={{ color: '#9A7B4F' }}>{food.per100.fat}f</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═════════════════════════════════════════════
// ── MAIN NUTRITION SCREEN ──
// ═════════════════════════════════════════════
const TIMELINE = [
  { time: '8 AM', mealIndex: 0 },
  { time: '1 PM', mealIndex: 1 },
  { time: '5 PM', mealIndex: 2 },
  { time: '9 PM', mealIndex: 3 },
];

export default function Nutrition({ onMacroDetail }) {
  const {
    meals, logged, remaining, hydration, history,
    logMeal, adjustMeal, swapMealFood, updateMealFoods, logWater,
  } = useApp();

  const shouldReduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState('nutrition');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const today = new Date();

  const handleMealTap = useCallback(idx => { setSelectedMeal(idx); setSheetOpen(true); }, []);
  const handleClose = useCallback(() => { setSheetOpen(false); setTimeout(() => setSelectedMeal(null), 300); }, []);

  // Running total for "total so far" feedback
  const runningTotals = useMemo(() => {
    const totals = [];
    let running = { protein: 0, carbs: 0, fat: 0, calories: 0 };
    meals.forEach(meal => {
      if (meal.logged) {
        const t = sumFoods(meal.foods);
        running = { protein: running.protein + t.protein, carbs: running.carbs + t.carbs, fat: running.fat + t.fat, calories: running.calories + t.calories };
      }
      totals.push({ ...running });
    });
    return totals;
  }, [meals]);

  const firstUnloggedIdx = meals.findIndex(m => !m.logged);

  // Check if any logged meal deviates from the original recommended plan
  const hasDeviation = useMemo(() => {
    return meals.some((meal, i) => {
      if (!meal.logged) return false;
      const actual = sumFoods(meal.foods);
      const planned = sumFoods(MEAL_PLAN[i]?.foods || []);
      return (
        actual.protein !== planned.protein ||
        actual.carbs !== planned.carbs ||
        actual.fat !== planned.fat
      );
    });
  }, [meals]);

  // Auto-adjust: scale up next unlogged meal proportionally to fill remaining gap
  const handleAutoAdjust = useCallback(() => {
    if (firstUnloggedIdx < 0) return;
    const meal = meals[firstUnloggedIdx];
    const mealTotals = sumFoods(meal.foods);
    const totalLogged = runningTotals[firstUnloggedIdx];

    // How much is needed overall
    const needed = {
      protein: Math.max(0, DAILY_TARGETS.protein - totalLogged.protein),
      carbs: Math.max(0, DAILY_TARGETS.carbs - totalLogged.carbs),
      fat: Math.max(0, DAILY_TARGETS.fat - totalLogged.fat),
      calories: Math.max(0, DAILY_TARGETS.calories - totalLogged.calories),
    };

    // Scale factor: try to cover the calorie gap
    const calScale = mealTotals.calories > 0 ? needed.calories / mealTotals.calories : 1;
    const scale = Math.max(1, Math.min(calScale, 2.5)); // Clamp 1x–2.5x

    const adjustedFoods = meal.foods.map(f => ({
      ...f,
      protein: Math.round(f.protein * scale),
      carbs: Math.round(f.carbs * scale),
      fat: Math.round(f.fat * scale),
      calories: Math.round(f.calories * scale),
      portion: `${f.portion} (${scale.toFixed(1)}x)`,
    }));

    updateMealFoods(firstUnloggedIdx, adjustedFoods);
  }, [firstUnloggedIdx, meals, runningTotals, updateMealFoods]);

  return (
    <div className="min-h-screen pb-24" style={{ background: '#000' }}>
      {/* Header */}
      <motion.div className="px-5 pt-3 pb-2 flex items-center justify-between"
        initial={shouldReduce ? {} : { opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-[12px] font-bold"
            style={{ background: 'linear-gradient(135deg, rgba(184,137,60,0.15), rgba(224,192,116,0.08))', border: '1px solid rgba(212,167,78,0.2)', color: '#D4A74E' }}>
            {USER_PROFILE.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-display text-[20px] font-extrabold text-white tracking-tight">Nutrition</h1>
            <p className="font-body text-[11px] text-white/30">
              {today.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <Settings size={16} strokeWidth={1.5} className="text-white/35" />
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <CalendarDays size={16} strokeWidth={1.5} className="text-white/35" />
          </div>
        </div>
      </motion.div>

      <TabToggle active={activeTab} onChange={setActiveTab} />

      {activeTab === 'nutrition' ? (
        <>
          <WeekStrip />

          <MacrosOverview logged={logged} remaining={remaining} onAutoAdjust={handleAutoAdjust} hasDeviation={hasDeviation} />

          <div className="px-5 mb-3 flex items-center justify-between">
            <h2 className="font-display text-[15px] font-bold text-white">Today's Meals</h2>
            <button className="flex items-center gap-1.5 font-body text-[11px] text-white/30">
              <BookOpen size={13} strokeWidth={1.5} /> Guide
            </button>
          </div>

          {/* Meal Timeline */}
          <div className="relative px-5 mt-2">
            <div className="absolute left-[17px] top-3 bottom-3 w-px"
              style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 4px, transparent 4px, transparent 10px)' }} />
            <div className="space-y-3">
              {meals.map((meal, i) => (
                <MealTimelineCard key={i} meal={meal} mealIndex={i}
                  onTap={handleMealTap} onLog={logMeal}
                  totalSoFar={runningTotals[i]} delay={i} />
              ))}
              <div className="relative">
                <div className="absolute left-0 top-5 z-10">
                  <div className="w-6 h-6 rounded-full" style={{ background: '#0A0A0A', border: '1.5px dashed rgba(255,255,255,0.08)' }} />
                </div>
                <SnackCard onAdd={() => {}} />
              </div>
            </div>
          </div>

          <FoodSearchBar />
          <ScoreFooter meals={meals} hydration={hydration} />
        </>
      ) : (
        <HydrationView hydration={hydration} logWater={logWater} />
      )}

      <MealSheet meal={selectedMeal !== null ? meals[selectedMeal] : null} mealIndex={selectedMeal}
        isOpen={sheetOpen} onClose={handleClose} logged={logged} logMeal={logMeal} adjustMeal={adjustMeal} />
    </div>
  );
}
