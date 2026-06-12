// ── Nutrition Screen ──
// Header, Meals/Hydration tabs, week strip, macros overview,
// tap-to-open meal timeline, bottom sheet for log / adjust / change-meal.

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check, X, ChevronRight, Droplets, BookOpen, Plus, MoreHorizontal,
  ArrowLeftRight,
} from 'lucide-react';
import { BottomSheet, NumericCounter, RingCounter } from '../components/ui/Components';
import { useApp } from '../context/AppContext';
import {
  DAILY_TARGETS, MEAL_PLAN, USER_PROFILE, SWAP_OPTIONS,
} from '../data/mockData';

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
// Log as is / Adjust / Change meal
// ═════════════════════════════════════════════
function MealSheet({ meal, mealIndex, isOpen, onClose, logged, logMeal, adjustMeal, updateMealFoods }) {
  const [view, setView] = useState('main');
  const [editFoods, setEditFoods] = useState([]);
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

  const handleSwapWhole = useCallback((alt) => {
    // Replace entire meal with the swap option
    updateMealFoods(mealIndex, [{ ...alt }]);
    onClose();
  }, [updateMealFoods, mealIndex, onClose]);

  if (!meal) return null;
  const totals = sumFoods(meal.foods);
  const swapOptions = SWAP_OPTIONS[meal.id] || [];

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
                onClick={() => setView('change')}
                className="flex-1 py-3 rounded-xl font-display text-[12px] uppercase tracking-wider text-white/60 flex items-center justify-center gap-1.5"
                style={{ border: `1px solid ${CARD_BORDER}` }}
              >
                <ArrowLeftRight size={13} strokeWidth={1.5} /> Change Meal
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

        {/* ── Change meal view ── */}
        {view === 'change' && (
          <motion.div key="change" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <button
              onClick={() => setView('main')}
              className="font-body text-[12px] text-white/35 mb-3 flex items-center gap-1 uppercase tracking-wider"
            >
              <ChevronRight size={12} strokeWidth={1.5} className="rotate-180" /> Back
            </button>

            <p className="font-display text-[12px] text-white/25 uppercase tracking-[0.2em] mb-3">
              Swap with
            </p>

            {swapOptions.length === 0 && (
              <p className="font-body text-[12px] text-white/35 py-6 text-center">
                No swap options available.
              </p>
            )}

            <div className="space-y-2">
              {swapOptions.map((alt, ai) => (
                <motion.button
                  key={ai}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSwapWhole(alt)}
                  className="w-full text-left p-3.5 rounded-xl flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${CARD_BORDER}` }}
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-display text-[14px] text-white uppercase tracking-wider leading-tight">
                      {alt.name}
                    </p>
                    <p className="font-body text-[11px] text-white/30 mt-0.5">{alt.portion}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="font-display text-[14px] text-white tabular-nums leading-none">
                      {alt.calories} <span className="font-body text-[9px] text-white/30 uppercase">cal</span>
                    </span>
                    <div className="flex gap-1.5 text-[10px] tabular-nums">
                      <span style={{ color: GOLD }}>{alt.protein}p</span>
                      <span style={{ color: FAT_GREY }}>{alt.fat}f</span>
                      <span style={{ color: CARB_BRONZE }}>{alt.carbs}c</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
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
      <motion.div
        className="flex flex-col items-center py-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <RingCounter percentage={pct} size={160} strokeWidth={6} color={STEEL} delay={0.1}>
          <div className="flex flex-col items-center">
            <NumericCounter value={hydration} className="text-[36px] text-white" duration={0.7} />
            <span className="font-body text-[12px] text-white/30 mt-1">
              / {DAILY_TARGETS.water} ml
            </span>
          </div>
        </RingCounter>
      </motion.div>

      <div className="flex gap-2 justify-center mb-6">
        {[250, 500, 750].map(ml => (
          <motion.button
            key={ml}
            whileTap={{ scale: 0.93 }}
            onClick={() => logWater(ml)}
            className="px-5 py-3 rounded-xl font-display text-[13px] tabular-nums uppercase tracking-wider"
            style={{ background: 'rgba(91,124,153,0.12)', border: '1px solid rgba(91,124,153,0.2)', color: STEEL }}
          >
            +{ml}ml
          </motion.button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setCustomOpen(!customOpen)}
        className="w-full py-3 rounded-xl font-display text-[12px] uppercase tracking-wider text-white/45 mb-4"
        style={{ border: `1px solid ${CARD_BORDER}` }}
      >
        Custom Amount
      </motion.button>

      <AnimatePresence>
        {customOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <input
                type="number" min={50} max={2000} step={50} value={customMl}
                onChange={e => setCustomMl(Math.max(50, Math.min(2000, Number(e.target.value))))}
                className="flex-1 bg-transparent font-display text-[18px] text-white tabular-nums outline-none px-3 py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
              <span className="font-body text-[11px] text-white/30">ml</span>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => { logWater(customMl); setCustomOpen(false); }}
                className="px-4 py-2.5 rounded-lg font-display text-[12px] uppercase tracking-wider text-black"
                style={{ background: `linear-gradient(135deg, ${STEEL}, #7A9CB5)` }}
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

// ═════════════════════════════════════════════
// ── MAIN NUTRITION SCREEN ──
// ═════════════════════════════════════════════
export default function Nutrition({ onMacroDetail }) {
  const {
    meals, logged, hydration,
    logMeal, adjustMeal, updateMealFoods, logWater,
  } = useApp();

  const shouldReduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState('meals');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleMealTap = useCallback(idx => { setSelectedMeal(idx); setSheetOpen(true); }, []);
  const handleClose = useCallback(() => {
    setSheetOpen(false);
    setTimeout(() => setSelectedMeal(null), 300);
  }, []);

  const handleAddMeal = useCallback(() => {
    // Jump into the first unlogged meal's sheet, or last meal if all logged
    const idx = meals.findIndex(m => !m.logged);
    setSelectedMeal(idx >= 0 ? idx : meals.length - 1);
    setSheetOpen(true);
  }, [meals]);

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
              onClick={handleAddMeal}
              className="w-full py-4 rounded-2xl font-display text-[14px] uppercase tracking-wider text-black flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${GOLD_START}, ${GOLD_END})` }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Meal
            </motion.button>
          </motion.div>
        </>
      ) : (
        <HydrationView hydration={hydration} logWater={logWater} />
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
    </div>
  );
}
