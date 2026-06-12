// ── Nutrition Screen ──
// Header, Meals/Hydration tabs, week strip, macros overview,
// tap-to-open meal timeline, bottom sheet for log / adjust / change-meal.

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check, X, ChevronRight, Droplets, BookOpen, Plus, MoreHorizontal,
  RefreshCw, Trophy, Flame, GlassWater, CalendarDays,
} from 'lucide-react';
import { BottomSheet, NumericCounter, RingCounter } from '../components/ui/Components';
import { useApp } from '../context/AppContext';
import { DAILY_TARGETS, MEAL_PLAN, USER_PROFILE } from '../data/mockData';

// ── Tokens shared with Home ──
const CARD_BG = '#131318';
const CARD_BORDER = 'rgba(255,255,255,0.07)';
const GOLD = '#D4A74E';
const GOLD_START = '#B8893C';
const GOLD_END = '#E0C074';
const STEEL = '#5B7C99';
const FAT_GREY = '#C8C8C6';
const CARB_BRONZE = '#9A7B4F';
const ON_TRACK = '#5B7C5A';

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
// ── Tab Toggle (Meals / Hydration) ──
// ═════════════════════════════════════════════
function TabToggle({ active, onChange }) {
  return (
    <div
      className="mx-5 mb-4 flex rounded-full p-1"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      {['Meals', 'Hydration'].map(tab => {
        const key = tab.toLowerCase();
        const isActive = active === key;
        return (
          <motion.button
            key={tab}
            onClick={() => onChange(key)}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-display text-[12px] uppercase tracking-wider"
            style={{
              background: isActive ? `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` : 'transparent',
              color: isActive ? '#000' : 'rgba(255,255,255,0.45)',
            }}
          >
            {tab === 'Meals'
              ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M11 2a2 2 0 0 0-2 2v5H7a2 2 0 0 0-2 2v1c0 2.8 2.2 5 5 5v5h4v-5c2.8 0 5-2.2 5-5v-1a2 2 0 0 0-2-2h-2V4a2 2 0 0 0-2-2h-2z"/>
                </svg>
              )
              : <Droplets size={14} strokeWidth={1.5} />}
            {tab}
          </motion.button>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════
// ── Week Strip (matches Home palette) ──
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
      return {
        label: DAY_ABBR[d.getDay()],
        date: d.getDate(),
        isToday: d.toDateString() === today.toDateString(),
      };
    });
  }, []);

  return (
    <div className="px-5 mb-4">
      <p className="font-display text-[13px] text-white/25 uppercase tracking-[0.2em] mb-3">
        This Week
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-1.5"
            initial={shouldReduce ? {} : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
          >
            <span className="font-body text-[9px] text-white/30 uppercase font-semibold tracking-wider">
              {day.label}
            </span>
            <div
              className="w-[40px] h-[40px] rounded-full flex items-center justify-center"
              style={{
                background: day.isToday
                  ? `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})`
                  : CARD_BG,
                border: day.isToday ? 'none' : `1px solid ${CARD_BORDER}`,
              }}
            >
              <span
                className="font-display text-[16px] leading-none"
                style={{ color: day.isToday ? '#000' : 'rgba(255,255,255,0.7)' }}
              >
                {day.date}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// ── Macros Overview Card ──
// ═════════════════════════════════════════════
function MacrosOverview({ logged }) {
  const shouldReduce = useReducedMotion();
  const calPct = Math.min(Math.round((logged.calories / DAILY_TARGETS.calories) * 100), 100);
  const macros = [
    { key: 'protein', label: 'Protein', short: 'P', curr: logged.protein, target: DAILY_TARGETS.protein, color: GOLD },
    { key: 'fat',     label: 'Fat',     short: 'F', curr: logged.fat,     target: DAILY_TARGETS.fat,     color: FAT_GREY },
    { key: 'carbs',   label: 'Carbs',   short: 'C', curr: logged.carbs,   target: DAILY_TARGETS.carbs,   color: CARB_BRONZE },
  ];
  const isBehind = logged.calories < DAILY_TARGETS.calories;

  return (
    <motion.div
      className="mx-5 mb-5 rounded-2xl p-5"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="font-display text-[12px] text-white/25 uppercase tracking-[0.2em]">
          Macros Overview
        </p>
        {logged.calories > 0 && (
          <span
            className="font-display text-[10px] uppercase tracking-wider"
            style={{ color: isBehind ? GOLD : ON_TRACK }}
          >
            {isBehind ? 'Behind Target' : 'On Track'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* Big calorie ring */}
        <div className="shrink-0">
          <RingCounter percentage={calPct} size={104} strokeWidth={5} delay={0.1}>
            <div className="flex flex-col items-center">
              <NumericCounter
                value={logged.calories}
                className="text-[26px] leading-none text-white"
                duration={0.6}
              />
              <span className="font-body text-[10px] text-white/30 mt-0.5">
                / {DAILY_TARGETS.calories}
              </span>
              <span className="font-body text-[9px] text-white/25 uppercase tracking-wider">
                kcal
              </span>
            </div>
          </RingCounter>
        </div>

        {/* Macro columns */}
        <div className="flex-1 grid grid-cols-3 gap-3">
          {macros.map(m => {
            const pct = Math.min((m.curr / m.target) * 100, 100);
            const delta = m.curr - m.target;
            return (
              <div key={m.key}>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-display text-[12px]" style={{ color: m.color }}>{m.short}</span>
                  <span className="font-display text-[9px] text-white/35 uppercase tracking-wider">
                    {m.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5 mb-1.5">
                  <span className="font-display text-[18px] text-white tabular-nums leading-none">
                    {m.curr}
                  </span>
                  <span className="font-body text-[10px] text-white/25">/{m.target}g</span>
                </div>
                <div className="w-full h-[3px] rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: m.color }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span
                  className="font-body text-[10px] tabular-nums"
                  style={{ color: delta < 0 ? GOLD : 'rgba(255,255,255,0.3)' }}
                >
                  {delta < 0 ? `${delta}g` : delta === 0 ? 'On target' : `+${delta}g`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════
// ── Macro Pill (in meal cards) ──
// ═════════════════════════════════════════════
function MacroChip({ value, suffix, color }) {
  return (
    <span className="font-display text-[13px] tabular-nums" style={{ color }}>
      {value}
      <span className="font-body text-[10px] ml-0.5" style={{ color }}>{suffix}</span>
    </span>
  );
}

// ═════════════════════════════════════════════
// ── Meal Timeline Card ── (tap to open sheet)
// ═════════════════════════════════════════════
function MealTimelineCard({ meal, mealIndex, onTap, delay = 0 }) {
  const shouldReduce = useReducedMotion();
  const totals = sumFoods(meal.foods);
  const isLogged = meal.logged;
  const summary = foodSummary(meal.foods);
  // Short time label like "8 AM"
  const shortTime = (meal.time || '')
    .replace(':00', '')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <motion.button
      onClick={() => onTap(mealIndex)}
      whileTap={{ scale: 0.985 }}
      className="relative block w-full text-left"
      initial={shouldReduce ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.06 + 0.2, duration: 0.3 }}
    >
      {/* Status dot */}
      <div className="absolute left-0 top-5 z-10">
        {isLogged ? (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(212,167,78,0.12)',
              border: `1.5px solid ${GOLD}`,
            }}
          >
            <Check size={12} strokeWidth={2.5} style={{ color: GOLD }} />
          </div>
        ) : (
          <div
            className="w-6 h-6 rounded-full"
            style={{ background: '#0A0A0A', border: '1.5px dashed rgba(255,255,255,0.18)' }}
          />
        )}
      </div>

      {/* Time label */}
      <div className="absolute left-0 top-12 text-center w-6">
        <span className="font-body text-[9px] text-white/30 leading-none uppercase tracking-wider">
          {shortTime}
        </span>
      </div>

      {/* Card */}
      <div className="ml-9">
        <div
          className="rounded-2xl p-4"
          style={{
            background: CARD_BG,
            border: `1px solid ${isLogged ? 'rgba(212,167,78,0.15)' : CARD_BORDER}`,
            opacity: isLogged ? 1 : 0.85,
          }}
        >
          {/* Header row */}
          <div className={`flex items-start justify-between ${isLogged ? 'mb-3' : ''}`}>
            <div className="min-w-0 flex-1 pr-3">
              <p
                className="font-display text-[16px] uppercase tracking-wider leading-tight"
                style={{ color: isLogged ? '#fff' : 'rgba(255,255,255,0.55)' }}
              >
                {meal.label}
              </p>
              <p className="font-body text-[11px] text-white/35 mt-1 truncate">
                {summary}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span
                className="font-display text-[10px] uppercase tracking-wider"
                style={{ color: isLogged ? GOLD : 'rgba(255,255,255,0.25)' }}
              >
                {isLogged ? 'Logged' : 'Not Logged'}
              </span>
              <ChevronRight size={14} strokeWidth={1.5} className="text-white/25" />
            </div>
          </div>

          {/* Macro row — only when logged */}
          {isLogged && (
            <div className="flex items-baseline gap-3">
              <div className="flex flex-col">
                <span className="font-display text-[18px] text-white tabular-nums leading-none">
                  {totals.calories}
                </span>
                <span className="font-body text-[9px] text-white/30 uppercase tracking-wider mt-0.5">
                  Cal
                </span>
              </div>
              <span className="text-white/10 font-body text-[14px]">|</span>
              <MacroChip value={totals.protein} suffix="P" color={GOLD} />
              <span className="text-white/10 font-body text-[14px]">|</span>
              <MacroChip value={totals.fat} suffix="F" color={FAT_GREY} />
              <span className="text-white/10 font-body text-[14px]">|</span>
              <MacroChip value={totals.carbs} suffix="C" color={CARB_BRONZE} />
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// ═════════════════════════════════════════════
// ── Meal Bottom Sheet ──
// Log as is / Adjust / Replace
// ═════════════════════════════════════════════
function MealSheet({ meal, mealIndex, isOpen, onClose, logged, logMeal, adjustMeal, updateMealFoods }) {
  const [view, setView] = useState('main');
  const [editFoods, setEditFoods] = useState([]);
  // Inline add-food state for the Adjust view
  const [customName, setCustomName] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  // Replace view — blank foods built from scratch
  const [replaceFoods, setReplaceFoods] = useState([{ ...BLANK_FOOD }]);

  useEffect(() => {
    if (meal && isOpen) {
      setEditFoods(meal.foods.map(f => ({ ...f })));
      setView('main');
      setCustomName('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
      setReplaceFoods([{ ...BLANK_FOOD }]);
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
    setCustomName(''); setCustomProtein(''); setCustomCarbs(''); setCustomFat('');
  }, [customName, customProtein, customCarbs, customFat]);

  const handleRemoveFood = useCallback((fi) => {
    setEditFoods(prev => prev.filter((_, i) => i !== fi));
  }, []);

  // ── Replace view handlers ──
  const handleReplaceChange = useCallback((fi, field, value) => {
    setReplaceFoods(prev => {
      const next = [...prev];
      next[fi] = { ...next[fi], [field]: value };
      return next;
    });
  }, []);

  const handleReplaceAddRow = useCallback(() => {
    setReplaceFoods(prev => [...prev, { ...BLANK_FOOD }]);
  }, []);

  const handleReplaceRemoveRow = useCallback((fi) => {
    setReplaceFoods(prev => (prev.length > 1 ? prev.filter((_, i) => i !== fi) : prev));
  }, []);

  const handleConfirmReplace = useCallback(() => {
    const valid = replaceFoods.filter(f => f.name.trim());
    if (valid.length === 0) return;
    const built = valid.map(f => {
      const p = Number(f.protein) || 0;
      const c = Number(f.carbs) || 0;
      const fat = Number(f.fat) || 0;
      return {
        name: f.name.trim(),
        portion: 'custom',
        protein: p,
        carbs: c,
        fat,
        calories: Math.round(p * 4 + c * 4 + fat * 9),
      };
    });
    adjustMeal(mealIndex, built); // replaces + logs
    onClose();
  }, [replaceFoods, adjustMeal, mealIndex, onClose]);

  if (!meal) return null;
  const totals = sumFoods(meal.foods);
  const replaceValidCount = replaceFoods.filter(f => f.name.trim()).length;
  const replaceTotalCal = replaceFoods.reduce((sum, f) => {
    if (!f.name.trim()) return sum;
    const p = Number(f.protein) || 0;
    const c = Number(f.carbs) || 0;
    const fat = Number(f.fat) || 0;
    return sum + Math.round(p * 4 + c * 4 + fat * 9);
  }, 0);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-[20px] text-white uppercase tracking-wider leading-none">
            {meal.label}
          </h2>
          <p className="font-body text-[11px] text-white/30 mt-1.5 uppercase tracking-wider">
            {meal.time}
          </p>
        </div>
        {meal.logged && (
          <span
            className="font-display text-[10px] uppercase tracking-wider px-2 py-1 rounded-md"
            style={{ background: 'rgba(212,167,78,0.1)', color: GOLD, border: '1px solid rgba(212,167,78,0.25)' }}
          >
            Logged
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Main view ── */}
        {view === 'main' && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Totals strip */}
            <div
              className="rounded-xl p-3 mb-4 flex items-baseline justify-around"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${CARD_BORDER}` }}
            >
              <div className="flex flex-col items-center">
                <span className="font-display text-[18px] text-white tabular-nums leading-none">{totals.calories}</span>
                <span className="font-body text-[9px] text-white/30 uppercase tracking-wider mt-1">Cal</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-display text-[18px] tabular-nums leading-none" style={{ color: GOLD }}>{totals.protein}g</span>
                <span className="font-body text-[9px] text-white/30 uppercase tracking-wider mt-1">Protein</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-display text-[18px] tabular-nums leading-none" style={{ color: FAT_GREY }}>{totals.fat}g</span>
                <span className="font-body text-[9px] text-white/30 uppercase tracking-wider mt-1">Fat</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-display text-[18px] tabular-nums leading-none" style={{ color: CARB_BRONZE }}>{totals.carbs}g</span>
                <span className="font-body text-[9px] text-white/30 uppercase tracking-wider mt-1">Carbs</span>
              </div>
            </div>

            {/* Food list */}
            <div className="space-y-2 mb-5">
              {meal.foods.map((food, fi) => (
                <div
                  key={fi}
                  className="flex justify-between items-center py-2.5 px-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="min-w-0 pr-3">
                    <span className="font-body text-[13px] text-white/75 block truncate">{food.name}</span>
                    <span className="font-body text-[11px] text-white/25">{food.portion}</span>
                  </div>
                  <div className="flex gap-2 text-[11px] tabular-nums shrink-0">
                    <span style={{ color: GOLD }}>{food.protein}p</span>
                    <span style={{ color: FAT_GREY }}>{food.fat}f</span>
                    <span style={{ color: CARB_BRONZE }}>{food.carbs}c</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Primary action */}
            {!meal.logged && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleLogAsIs}
                className="w-full py-3.5 rounded-xl font-display text-[14px] uppercase tracking-wider text-black mb-2.5"
                style={{ background: `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Check size={16} strokeWidth={2.5} /> Log as is
                </div>
              </motion.button>
            )}

            {/* Secondary actions */}
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setView('adjust')}
                className="flex-1 py-3 rounded-xl font-display text-[12px] uppercase tracking-wider text-white/60 flex items-center justify-center gap-1.5"
                style={{ border: `1px solid ${CARD_BORDER}` }}
              >
                Adjust
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setView('replace')}
                className="flex-1 py-3 rounded-xl font-display text-[12px] uppercase tracking-wider text-white/60 flex items-center justify-center gap-1.5"
                style={{ border: `1px solid ${CARD_BORDER}` }}
              >
                <RefreshCw size={13} strokeWidth={1.5} /> Replace
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Adjust view ── */}
        {view === 'adjust' && (
          <motion.div key="adjust" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <button
              onClick={() => setView('main')}
              className="font-body text-[12px] text-white/35 mb-3 flex items-center gap-1 uppercase tracking-wider"
            >
              <ChevronRight size={12} strokeWidth={1.5} className="rotate-180" /> Back
            </button>

            <div className="space-y-3">
              {editFoods.map((food, fi) => (
                <div
                  key={fi}
                  className="rounded-xl p-3.5 relative"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${CARD_BORDER}` }}
                >
                  <button
                    onClick={() => handleRemoveFood(fi)}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <X size={10} strokeWidth={2} className="text-white/40" />
                  </button>

                  <p className="font-body text-[13px] text-white/70 mb-2.5 pr-6">{food.name}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'protein', label: 'Protein (g)', color: GOLD },
                      { key: 'carbs',   label: 'Carbs (g)',   color: CARB_BRONZE },
                      { key: 'fat',     label: 'Fat (g)',     color: FAT_GREY },
                    ].map(m => (
                      <div key={m.key}>
                        <label className="font-body text-[9px] text-white/25 uppercase tracking-wider block mb-1">
                          {m.label}
                        </label>
                        <input
                          type="number" min={0} value={food[m.key]}
                          onChange={e => handleFieldChange(fi, m.key, e.target.value)}
                          className="w-full bg-transparent font-display text-[15px] tabular-nums outline-none px-2.5 py-2 rounded-lg"
                          style={{ color: m.color, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1.5 text-right">
                    <span className="font-body text-[10px] text-white/25 tabular-nums">{food.calories} cal</span>
                  </div>
                </div>
              ))}

              {/* Inline add custom */}
              <div
                className="rounded-xl p-3.5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}
              >
                <p className="font-display text-[11px] text-white/35 uppercase tracking-wider mb-2.5">Add Food</p>
                <input
                  type="text" value={customName} onChange={e => setCustomName(e.target.value)}
                  placeholder="Name (e.g. Chicken Breast)"
                  className="w-full bg-transparent font-body text-[13px] text-white/80 placeholder:text-white/15 outline-none px-3 py-2 rounded-lg mb-2"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[
                    { value: customProtein, set: setCustomProtein, label: 'P', color: GOLD },
                    { value: customCarbs,   set: setCustomCarbs,   label: 'C', color: CARB_BRONZE },
                    { value: customFat,     set: setCustomFat,     label: 'F', color: FAT_GREY },
                  ].map(m => (
                    <input
                      key={m.label}
                      type="number" min={0} value={m.value} onChange={e => m.set(e.target.value)}
                      placeholder={`${m.label} g`}
                      className="bg-transparent font-display text-[14px] tabular-nums outline-none px-2.5 py-2 rounded-lg placeholder:text-white/15"
                      style={{ color: m.color, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleAddCustom}
                  disabled={!customName.trim()}
                  className="w-full py-2 rounded-lg font-display text-[11px] uppercase tracking-wider text-white/60 disabled:opacity-30 flex items-center justify-center gap-1"
                  style={{ border: `1px solid ${CARD_BORDER}` }}
                >
                  <Plus size={12} strokeWidth={1.5} /> Add to meal
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirmAdjust}
              className="w-full py-3.5 rounded-xl font-display text-[14px] uppercase tracking-wider text-black mt-4"
              style={{ background: `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` }}
            >
              Confirm & Log
            </motion.button>
          </motion.div>
        )}

        {/* ── Replace view ── blank inputs, rebuild this meal */}
        {view === 'replace' && (
          <motion.div key="replace" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <button
              onClick={() => setView('main')}
              className="font-body text-[12px] text-white/35 mb-3 flex items-center gap-1 uppercase tracking-wider"
            >
              <ChevronRight size={12} strokeWidth={1.5} className="rotate-180" /> Back
            </button>

            <p className="font-display text-[12px] text-white/25 uppercase tracking-[0.2em] mb-1">
              Replace {meal.label}
            </p>
            <p className="font-body text-[11px] text-white/30 mb-4">
              Build this meal from scratch.
            </p>

            <div className="space-y-2.5 mb-3">
              {replaceFoods.map((food, fi) => (
                <div
                  key={fi}
                  className="rounded-xl p-3 relative"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${CARD_BORDER}` }}
                >
                  {replaceFoods.length > 1 && (
                    <button
                      onClick={() => handleReplaceRemoveRow(fi)}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <X size={10} strokeWidth={2} className="text-white/40" />
                    </button>
                  )}

                  <input
                    type="text" value={food.name}
                    onChange={e => handleReplaceChange(fi, 'name', e.target.value)}
                    placeholder="Food name, e.g. Grilled Salmon"
                    className="w-full bg-transparent font-body text-[13px] text-white/85 placeholder:text-white/15 outline-none px-2.5 py-2 rounded-lg mb-2"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'protein', placeholder: 'Protein g', color: GOLD },
                      { key: 'carbs',   placeholder: 'Carbs g',   color: CARB_BRONZE },
                      { key: 'fat',     placeholder: 'Fat g',     color: FAT_GREY },
                    ].map(m => (
                      <input
                        key={m.key}
                        type="number" min={0} value={food[m.key]}
                        onChange={e => handleReplaceChange(fi, m.key, e.target.value)}
                        placeholder={m.placeholder}
                        className="bg-transparent font-display text-[14px] tabular-nums outline-none px-2.5 py-2 rounded-lg placeholder:text-white/15 placeholder:font-body placeholder:text-[11px]"
                        style={{ color: m.color, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleReplaceAddRow}
              className="w-full py-2.5 rounded-xl font-body text-[12px] text-white/30 flex items-center justify-center gap-1.5 mb-4"
              style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
            >
              <Plus size={12} strokeWidth={1.5} /> Add another food
            </button>

            {replaceTotalCal > 0 && (
              <p className="font-body text-[11px] text-white/30 text-center mb-4 tabular-nums">
                ~{replaceTotalCal} cal estimated
              </p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirmReplace}
              disabled={replaceValidCount === 0}
              className="w-full py-3.5 rounded-xl font-display text-[14px] uppercase tracking-wider text-black disabled:opacity-30"
              style={{ background: `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` }}
            >
              Replace & Log
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}

// ═════════════════════════════════════════════
// ── Add Meal Sheet ── (blank form, placeholders)
// ═════════════════════════════════════════════
const BLANK_FOOD = { name: '', protein: '', carbs: '', fat: '' };

function AddMealSheet({ isOpen, onClose, addMeal }) {
  const [mealName, setMealName] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [foods, setFoods] = useState([{ ...BLANK_FOOD }]);

  useEffect(() => {
    if (isOpen) {
      setMealName('');
      setMealTime('');
      setFoods([{ ...BLANK_FOOD }]);
    }
  }, [isOpen]);

  const handleFoodChange = useCallback((fi, field, value) => {
    setFoods(prev => {
      const next = [...prev];
      next[fi] = { ...next[fi], [field]: value };
      return next;
    });
  }, []);

  const handleAddRow = useCallback(() => {
    setFoods(prev => [...prev, { ...BLANK_FOOD }]);
  }, []);

  const handleRemoveRow = useCallback((fi) => {
    setFoods(prev => (prev.length > 1 ? prev.filter((_, i) => i !== fi) : prev));
  }, []);

  // Foods that have at least a name
  const validFoods = foods.filter(f => f.name.trim());
  const canSave = mealName.trim() && validFoods.length > 0;

  const totalCal = validFoods.reduce((sum, f) => {
    const p = Number(f.protein) || 0;
    const c = Number(f.carbs) || 0;
    const fat = Number(f.fat) || 0;
    return sum + Math.round(p * 4 + c * 4 + fat * 9);
  }, 0);

  const buildMeal = useCallback((logged) => ({
    id: `meal-custom-${Date.now()}`,
    time: mealTime.trim(),
    label: mealName.trim(),
    foods: validFoods.map(f => {
      const p = Number(f.protein) || 0;
      const c = Number(f.carbs) || 0;
      const fat = Number(f.fat) || 0;
      return {
        name: f.name.trim(),
        portion: 'custom',
        protein: p,
        carbs: c,
        fat,
        calories: Math.round(p * 4 + c * 4 + fat * 9),
      };
    }),
    logged,
  }), [mealName, mealTime, validFoods]);

  const handleSave = useCallback((logged) => {
    if (!canSave) return;
    addMeal(buildMeal(logged));
    onClose();
  }, [canSave, addMeal, buildMeal, onClose]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h2 className="font-display text-[20px] text-white uppercase tracking-wider leading-none mb-5">
        Add Meal
      </h2>

      {/* Meal name + time */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="font-body text-[9px] text-white/25 uppercase tracking-wider block mb-1.5">
            Meal Name
          </label>
          <input
            type="text" value={mealName} onChange={e => setMealName(e.target.value)}
            placeholder="e.g. Evening Snack"
            className="w-full bg-transparent font-body text-[14px] text-white/85 placeholder:text-white/15 outline-none px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div className="w-[110px]">
          <label className="font-body text-[9px] text-white/25 uppercase tracking-wider block mb-1.5">
            Time
          </label>
          <input
            type="text" value={mealTime} onChange={e => setMealTime(e.target.value)}
            placeholder="4:00 PM"
            className="w-full bg-transparent font-body text-[14px] text-white/85 placeholder:text-white/15 outline-none px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
      </div>

      {/* Food rows */}
      <label className="font-body text-[9px] text-white/25 uppercase tracking-wider block mb-1.5">
        Foods
      </label>
      <div className="space-y-2.5 mb-3">
        {foods.map((food, fi) => (
          <div
            key={fi}
            className="rounded-xl p-3 relative"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${CARD_BORDER}` }}
          >
            {foods.length > 1 && (
              <button
                onClick={() => handleRemoveRow(fi)}
                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <X size={10} strokeWidth={2} className="text-white/40" />
              </button>
            )}

            <input
              type="text" value={food.name}
              onChange={e => handleFoodChange(fi, 'name', e.target.value)}
              placeholder="Food name, e.g. Greek Yogurt"
              className="w-full bg-transparent font-body text-[13px] text-white/85 placeholder:text-white/15 outline-none px-2.5 py-2 rounded-lg mb-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            />
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'protein', placeholder: 'Protein g', color: GOLD },
                { key: 'carbs',   placeholder: 'Carbs g',   color: CARB_BRONZE },
                { key: 'fat',     placeholder: 'Fat g',     color: FAT_GREY },
              ].map(m => (
                <input
                  key={m.key}
                  type="number" min={0} value={food[m.key]}
                  onChange={e => handleFoodChange(fi, m.key, e.target.value)}
                  placeholder={m.placeholder}
                  className="bg-transparent font-display text-[14px] tabular-nums outline-none px-2.5 py-2 rounded-lg placeholder:text-white/15 placeholder:font-body placeholder:text-[11px]"
                  style={{ color: m.color, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add another food */}
      <button
        onClick={handleAddRow}
        className="w-full py-2.5 rounded-xl font-body text-[12px] text-white/30 flex items-center justify-center gap-1.5 mb-4"
        style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
      >
        <Plus size={12} strokeWidth={1.5} /> Add another food
      </button>

      {/* Estimated calories */}
      {totalCal > 0 && (
        <p className="font-body text-[11px] text-white/30 text-center mb-4 tabular-nums">
          ~{totalCal} cal estimated
        </p>
      )}

      {/* Actions */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => handleSave(true)}
        disabled={!canSave}
        className="w-full py-3.5 rounded-xl font-display text-[14px] uppercase tracking-wider text-black mb-2.5 disabled:opacity-30"
        style={{ background: `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` }}
      >
        <div className="flex items-center justify-center gap-2">
          <Check size={16} strokeWidth={2.5} /> Add & Log
        </div>
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => handleSave(false)}
        disabled={!canSave}
        className="w-full py-3 rounded-xl font-display text-[12px] uppercase tracking-wider text-white/60 disabled:opacity-30"
        style={{ border: `1px solid ${CARD_BORDER}` }}
      >
        Add to Plan Only
      </motion.button>
    </BottomSheet>
  );
}

// ═════════════════════════════════════════════
// ── Hydration View ── (detailed)
// ═════════════════════════════════════════════
const GLASS_ML = 250;
const STEEL_BRIGHT = '#7BA7C9';
const STREAK_GREEN = '#4ADE80';

// Format ISO timestamp → "9:30 PM"
function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
}

function HydrationHero({ hydration }) {
  const shouldReduce = useReducedMotion();
  const target = DAILY_TARGETS.water;
  const pct = Math.min(Math.round((hydration / target) * 100), 100);
  const glassesCurr = Math.floor(hydration / GLASS_ML);
  const glassesTarget = Math.ceil(target / GLASS_ML);
  const hydrationL = (hydration / 1000).toFixed(1);
  const targetL = (target / 1000).toFixed(1);

  return (
    <motion.div
      className="mx-5 mb-4 rounded-2xl p-5 relative overflow-hidden"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Subtle water-tint glow */}
      <div
        className="absolute -right-10 -top-10 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, rgba(91,124,153,0.18), transparent 70%)' }}
      />

      <div className="flex items-center gap-5 relative">
        <div className="shrink-0">
          <RingCounter percentage={pct} size={110} strokeWidth={5} color={STEEL_BRIGHT} delay={0.1}>
            <div className="flex flex-col items-center">
              <span className="font-display text-[24px] text-white leading-none tabular-nums">
                {hydrationL}L
              </span>
              <span className="font-display text-[10px] uppercase tracking-wider mt-1" style={{ color: STEEL_BRIGHT }}>
                of {targetL}L
              </span>
              <span className="font-body text-[9px] text-white/30 uppercase tracking-wider mt-0.5">
                Daily Goal
              </span>
            </div>
          </RingCounter>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display text-[10px] text-white/35 uppercase tracking-[0.2em] mb-1">Today</p>
          <div className="flex items-baseline gap-1 mb-1" style={{ color: STEEL_BRIGHT }}>
            <NumericCounter value={pct} className="text-[40px] leading-none" duration={0.6} />
            <span className="font-display text-[20px]">%</span>
          </div>
          <p className="font-display text-[10px] text-white/35 uppercase tracking-wider mb-3">Of Goal</p>

          {/* Progress bar */}
          <div className="w-full h-[4px] rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: STEEL_BRIGHT }}
              initial={{ width: '0%' }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div className="flex items-center gap-2">
            <GlassWater size={14} strokeWidth={1.5} style={{ color: STEEL_BRIGHT }} />
            <span className="font-display text-[14px] text-white tabular-nums">
              {glassesCurr} / {glassesTarget}
            </span>
            <span className="font-display text-[9px] text-white/35 uppercase tracking-wider">Glasses</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GlassRow({ hydration, logWater }) {
  const target = DAILY_TARGETS.water;
  const glassesTarget = Math.ceil(target / GLASS_ML);
  const glassesCurr = Math.floor(hydration / GLASS_ML);

  return (
    <div
      className="mx-5 mb-4 rounded-2xl p-4"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
    >
      <p className="font-display text-[11px] text-white/40 uppercase tracking-[0.2em] mb-3">
        Log Water
      </p>
      <div className="flex justify-between gap-1.5 mb-3 overflow-x-auto no-scrollbar">
        {Array.from({ length: glassesTarget }).map((_, i) => {
          const filled = i < glassesCurr;
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => !filled && logWater(GLASS_ML)}
              className="flex flex-col items-center gap-1 shrink-0"
              style={{ flex: '0 0 auto', width: 36 }}
            >
              <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
                <path
                  d="M3 4 L25 4 L22 28 Q22 30 20 30 L8 30 Q6 30 6 28 Z"
                  fill={filled ? STEEL_BRIGHT : 'transparent'}
                  fillOpacity={filled ? 0.85 : 0}
                  stroke={filled ? STEEL_BRIGHT : 'rgba(212,167,78,0.45)'}
                  strokeWidth="1.5"
                  strokeDasharray={filled ? '0' : '3 2'}
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-body text-[9px] text-white/35 tabular-nums">{GLASS_ML}ml</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function CustomAmountButton({ logWater }) {
  const [open, setOpen] = useState(false);
  const [ml, setMl] = useState(350);

  return (
    <div className="mx-5 mb-5">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(o => !o)}
        className="w-full py-3.5 rounded-2xl font-display text-[13px] uppercase tracking-wider flex items-center justify-center gap-2"
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, color: GOLD }}
      >
        <Droplets size={14} strokeWidth={1.5} />
        + Add Custom Amount
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2"
          >
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <input
                type="number" min={50} max={2000} step={50} value={ml}
                onChange={e => setMl(Math.max(50, Math.min(2000, Number(e.target.value))))}
                className="flex-1 bg-transparent font-display text-[18px] text-white tabular-nums outline-none px-3 py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
              <span className="font-body text-[11px] text-white/30">ml</span>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => { logWater(ml); setOpen(false); }}
                className="px-4 py-2.5 rounded-lg font-display text-[12px] uppercase tracking-wider text-black"
                style={{ background: `linear-gradient(135deg, ${STEEL}, ${STEEL_BRIGHT})` }}
              >
                Add
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WeeklyOverview({ history, hydration }) {
  const target = DAILY_TARGETS.water;
  // Build current week (Mon→Sun) using history.waterMl for past days, hydration for today
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const isToday = d.toDateString() === today.toDateString();
    const isFuture = d > today && !isToday;
    let ml = 0;
    if (isToday) ml = hydration;
    else {
      const h = history.find(x => x.date === iso);
      ml = h?.waterMl || 0;
    }
    return {
      label: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i],
      ml,
      isToday,
      isFuture,
    };
  });

  const maxMl = Math.max(target, ...days.map(d => d.ml));
  const yLabels = [maxMl, maxMl * 0.75, maxMl * 0.5, maxMl * 0.25, 0];
  const chartH = 140;

  return (
    <motion.div
      className="mx-5 mb-4 rounded-2xl p-4"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <p className="font-display text-[11px] text-white/40 uppercase tracking-[0.2em] mb-4">
        Weekly Overview
      </p>

      <div className="flex" style={{ height: chartH + 32 }}>
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between pr-2 shrink-0" style={{ height: chartH }}>
          {yLabels.map((v, i) => (
            <span key={i} className="font-body text-[9px] text-white/25 tabular-nums leading-none">
              {(v / 1000).toFixed(1)}L
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative">
          {/* Goal dashed line */}
          <div
            className="absolute left-0 right-0 flex items-center"
            style={{
              top: `${chartH - (target / maxMl) * chartH}px`,
              height: 1,
            }}
          >
            <div
              className="flex-1"
              style={{
                height: 1,
                backgroundImage: `repeating-linear-gradient(to right, ${GOLD}88 0px, ${GOLD}88 4px, transparent 4px, transparent 8px)`,
              }}
            />
            <span
              className="font-display text-[9px] uppercase tracking-wider ml-1.5 leading-none"
              style={{ color: GOLD }}
            >
              Goal
            </span>
          </div>

          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-around" style={{ height: chartH }}>
            {days.map((day, i) => {
              const h = day.ml > 0 ? Math.max(2, (day.ml / maxMl) * chartH) : 4;
              const barColor = day.isToday ? GOLD : STEEL_BRIGHT;
              return (
                <div key={i} className="flex flex-col items-center" style={{ width: `${100 / 7}%` }}>
                  {day.ml > 0 && (
                    <span className="font-display text-[10px] text-white/75 tabular-nums mb-1 leading-none">
                      {(day.ml / 1000).toFixed(1)}L
                    </span>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: h }}
                    transition={{ duration: 0.5, delay: i * 0.05 + 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      width: '60%',
                      maxWidth: 28,
                      background: day.isFuture ? 'transparent' : barColor,
                      border: day.isFuture ? `1.5px dashed ${GOLD}55` : 'none',
                      borderRadius: '4px 4px 0 0',
                      opacity: day.ml === 0 && !day.isFuture ? 0.2 : 1,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div
            className="absolute left-0 right-0 flex justify-around"
            style={{ top: chartH + 8 }}
          >
            {days.map((day, i) => (
              <span
                key={i}
                className="font-display text-[9px] uppercase tracking-wider"
                style={{
                  width: `${100 / 7}%`,
                  textAlign: 'center',
                  color: day.isToday ? GOLD : 'rgba(255,255,255,0.4)',
                }}
              >
                {day.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HydrationStats({ history, hydration }) {
  // Past 7 days (excluding today)
  const past = history.slice(-8, -1); // last 7 entries before today
  const validDays = past.filter(d => typeof d.waterMl === 'number' && d.waterMl > 0);

  const avgMl = validDays.length
    ? Math.round(validDays.reduce((s, d) => s + d.waterMl, 0) / validDays.length)
    : 0;
  const avgPct = Math.round((avgMl / DAILY_TARGETS.water) * 100);

  const bestDay = validDays.reduce(
    (best, d) => (d.waterMl > (best?.waterMl || 0) ? d : best),
    null
  );

  // Streak — consecutive days (from yesterday backwards) hitting ≥ target
  let streak = 0;
  for (let i = past.length - 1; i >= 0; i--) {
    if (past[i].waterMl >= DAILY_TARGETS.water) streak++;
    else break;
  }
  // Include today if already hit target
  if (hydration >= DAILY_TARGETS.water) streak++;

  return (
    <motion.div
      className="mx-5 mb-4 rounded-2xl p-3 grid grid-cols-3"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="flex items-start gap-2 px-2">
        <Droplets size={18} strokeWidth={1.5} style={{ color: STEEL_BRIGHT }} className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="font-display text-[9px] text-white/35 uppercase tracking-wider leading-none">Weekly Avg</p>
          <p className="font-display text-[18px] text-white tabular-nums leading-none mt-1.5">
            {(avgMl / 1000).toFixed(1)}L
          </p>
          <p className="font-body text-[9px] text-white/30 uppercase tracking-wider mt-1">
            {avgPct}% of goal
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2 px-2 border-l border-r" style={{ borderColor: CARD_BORDER }}>
        <Trophy size={18} strokeWidth={1.5} style={{ color: GOLD }} className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="font-display text-[9px] text-white/35 uppercase tracking-wider leading-none">Best Day</p>
          <p className="font-display text-[18px] text-white tabular-nums leading-none mt-1.5" style={{ color: GOLD }}>
            {bestDay ? `${(bestDay.waterMl / 1000).toFixed(1)}L` : '—'}
          </p>
          <p className="font-body text-[9px] text-white/30 uppercase tracking-wider mt-1">
            {bestDay ? bestDay.dayOfWeek : 'No data'}
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2 px-2">
        <Flame size={18} strokeWidth={1.5} style={{ color: STREAK_GREEN }} className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="font-display text-[9px] text-white/35 uppercase tracking-wider leading-none">Streak</p>
          <p className="font-display text-[18px] tabular-nums leading-none mt-1.5" style={{ color: STREAK_GREEN }}>
            {streak} {streak === 1 ? 'day' : 'days'}
          </p>
          <p className="font-body text-[9px] text-white/30 uppercase tracking-wider mt-1">
            {streak > 0 ? 'Keep going' : 'Start today'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function RecentHistory({ waterLog, removeWaterEntry }) {
  const [showAll, setShowAll] = useState(false);
  const entries = waterLog || [];
  const visible = showAll ? entries : entries.slice(0, 5);

  return (
    <motion.div
      className="mx-5 mb-4 rounded-2xl p-4"
      style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-display text-[11px] text-white/40 uppercase tracking-[0.2em]">
          Recent History
        </p>
        {entries.length > 5 && (
          <button
            onClick={() => setShowAll(s => !s)}
            className="font-display text-[10px] uppercase tracking-wider"
            style={{ color: GOLD }}
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="py-8 flex flex-col items-center gap-2">
          <GlassWater size={28} strokeWidth={1.25} className="text-white/15" />
          <p className="font-body text-[12px] text-white/30">
            No water logged yet today.
          </p>
          <p className="font-body text-[11px] text-white/20">
            Tap a glass above to start.
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {visible.map((entry, i) => (
            <motion.div
              key={`${entry.t}-${i}`}
              className="flex items-center gap-3 py-3"
              style={{ borderTop: i === 0 ? 'none' : `1px solid ${CARD_BORDER}` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(212,167,78,0.12)', border: `1.5px solid ${GOLD}` }}
              >
                <Check size={12} strokeWidth={2.5} style={{ color: GOLD }} />
              </div>
              <span className="font-display text-[11px] text-white/45 uppercase tracking-wider w-[60px] shrink-0 tabular-nums">
                {formatTime(entry.t)}
              </span>
              <span className="flex-1 font-body text-[13px] text-white/80">
                {entry.ml}ml Water
              </span>
              <span className="font-display text-[12px] tabular-nums" style={{ color: GOLD }}>
                +{entry.ml}ml
              </span>
              <button
                onClick={() => removeWaterEntry(entries.indexOf(entry))}
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <X size={11} strokeWidth={2} className="text-white/30" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function HydrationView({ hydration, logWater, history, waterLog, removeWaterEntry }) {
  return (
    <div className="pb-4">
      <HydrationHero hydration={hydration} />
      <GlassRow hydration={hydration} logWater={logWater} />
      <CustomAmountButton logWater={logWater} />
      <WeeklyOverview history={history} hydration={hydration} />
      <HydrationStats history={history} hydration={hydration} />
      <RecentHistory waterLog={waterLog} removeWaterEntry={removeWaterEntry} />
    </div>
  );
}

// ═════════════════════════════════════════════
// ── MAIN NUTRITION SCREEN ──
// ═════════════════════════════════════════════
export default function Nutrition({ onMacroDetail }) {
  const {
    meals, logged, hydration, history, waterLog,
    logMeal, adjustMeal, updateMealFoods, addMeal, logWater, removeWaterEntry,
  } = useApp();

  const shouldReduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState('meals');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addMealOpen, setAddMealOpen] = useState(false);

  const handleMealTap = useCallback(idx => { setSelectedMeal(idx); setSheetOpen(true); }, []);
  const handleClose = useCallback(() => {
    setSheetOpen(false);
    setTimeout(() => setSelectedMeal(null), 300);
  }, []);

  return (
    <div className="min-h-screen pb-28" style={{ background: '#000' }}>
      {/* ═══════════════════════════════════════════
          HEADER — matches Home typography
          ═══════════════════════════════════════════ */}
      <motion.div
        className="flex items-center justify-between px-5 pt-5 pb-4"
        initial={shouldReduce ? {} : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1
            className="font-display text-[32px] text-white leading-none tracking-wider"
          >
            NUTRITION
          </h1>
          <p className="font-body text-[12px] text-white/40 mt-2">
            Track your macros. Fuel your progress.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.93 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
          style={{ border: `1px solid rgba(212,167,78,0.25)` }}
        >
          <BookOpen size={14} strokeWidth={1.5} style={{ color: GOLD }} />
          <span className="font-display text-[11px] uppercase tracking-wider" style={{ color: GOLD }}>
            Guide
          </span>
        </motion.button>
      </motion.div>

      <TabToggle active={activeTab} onChange={setActiveTab} />

      {activeTab === 'meals' ? (
        <>
          <WeekStrip />

          <MacrosOverview logged={logged} />

          {/* Section header */}
          <div className="px-5 mb-3 flex items-center justify-between">
            <p className="font-display text-[13px] text-white/25 uppercase tracking-[0.2em]">
              Today's Meals
            </p>
            <MoreHorizontal size={16} strokeWidth={1.5} className="text-white/25" />
          </div>

          {/* Meal Timeline */}
          <div className="relative px-5 mt-2">
            <div
              className="absolute left-[37px] top-3 bottom-3 w-px"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 4px, transparent 4px, transparent 10px)',
              }}
            />
            <div className="space-y-3">
              {meals.map((meal, i) => (
                <MealTimelineCard
                  key={i}
                  meal={meal}
                  mealIndex={i}
                  onTap={handleMealTap}
                  delay={i}
                />
              ))}
            </div>
          </div>

          {/* Add Meal CTA */}
          <motion.div
            className="px-5 mt-5"
            initial={shouldReduce ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setAddMealOpen(true)}
              className="w-full py-4 rounded-2xl font-display text-[14px] uppercase tracking-wider text-black flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Meal
            </motion.button>
          </motion.div>
        </>
      ) : (
        <HydrationView
          hydration={hydration}
          logWater={logWater}
          history={history}
          waterLog={waterLog || []}
          removeWaterEntry={removeWaterEntry}
        />
      )}

      <MealSheet
        meal={selectedMeal !== null ? meals[selectedMeal] : null}
        mealIndex={selectedMeal}
        isOpen={sheetOpen}
        onClose={handleClose}
        logged={logged}
        logMeal={logMeal}
        adjustMeal={adjustMeal}
        updateMealFoods={updateMealFoods}
      />

      <AddMealSheet
        isOpen={addMealOpen}
        onClose={() => setAddMealOpen(false)}
        addMeal={addMeal}
      />
    </div>
  );
}
