// ── Nutrition Screen ──
// Header, Meals/Hydration tabs, week strip, macros overview,
// tap-to-open meal timeline, bottom sheet for log / adjust / change-meal.

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check, X, ChevronRight, Droplets, BookOpen, Plus, MoreHorizontal,
  RefreshCw, Trophy, Flame, GlassWater, Settings2, Undo2, CalendarDays,
} from 'lucide-react';
import { BottomSheet, NumericCounter, RingCounter } from '../components/ui/Components';
import { WeekStrip, MonthSheet } from '../components/ui/Calendar';
import { useApp } from '../context/AppContext';
import { T } from '../tokens';
import { DAILY_TARGETS, MEAL_PLAN, USER_PROFILE } from '../data/mockData';

// ── Aliases from the token sheet — no local values ──
const CARD_BG = T.surface;
const CARD_BORDER = T.hairline;
const GOLD = T.gold;
const GOLD_START = T.goldStart;
const GOLD_END = T.goldEnd;
const STEEL = T.water;
const FAT_GREY = T.macroFat;
const CARB_BRONZE = T.macroCarbs;
const ON_TRACK = T.success;

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
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-body text-[12px] font-extrabold uppercase tracking-wider"
            style={{
              background: isActive ? T.goldGrad : 'transparent',
              color: isActive ? '#0B0B0C' : T.textLow,
            }}
          >
            {tab === 'Meals'
              ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M11 2a2 2 0 0 0-2 2v5H7a2 2 0 0 0-2 2v1c0 2.8 2.2 5 5 5v5h4v-5c2.8 0 5-2.2 5-5v-1a2 2 0 0 0-2-2h-2V4a2 2 0 0 0-2-2h-2z"/>
                </svg>
              )
              : <Droplets size={14} strokeWidth={T.stroke} />}
            {tab}
          </motion.button>
        );
      })}
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
        <p className="kicker">Macros</p>
        {logged.calories > 0 && (
          <span
            className="font-body text-[11px] font-extrabold uppercase tracking-wider"
            style={{ color: isBehind ? GOLD : ON_TRACK }}
          >
            {isBehind ? 'Catch up' : 'On track'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* Big calorie ring — the hero number */}
        <div className="shrink-0">
          <RingCounter percentage={calPct} size={118} strokeWidth={5} delay={0.1}>
            <div className="flex flex-col items-center">
              <NumericCounter
                value={logged.calories}
                className="text-[38px] leading-none text-[#F4F2EC]"
                duration={0.6}
              />
              <span className="font-body text-[10px] font-bold mt-1" style={{ color: T.textFaint }}>
                / {DAILY_TARGETS.calories} KCAL
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
                  <span className="font-body text-[11px] font-extrabold" style={{ color: m.color }}>{m.short}</span>
                  <span className="font-body text-[9px] font-bold uppercase tracking-wider" style={{ color: T.textFaint }}>
                    {m.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5 mb-1.5">
                  <span className="font-display text-[18px] text-[#F4F2EC] tabular-nums leading-none">
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
    <span className="font-body text-[13px] font-bold tabular-nums" style={{ color }}>
      {value}
      <span className="font-body text-[10px] font-bold ml-0.5 opacity-70">{suffix}</span>
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
              background: 'rgba(215,255,62,0.12)',
              border: `1.5px solid ${GOLD}`,
            }}
          >
            <Check size={12} strokeWidth={2.5} style={{ color: GOLD }} />
          </div>
        ) : (
          <div
            className="w-6 h-6 rounded-full"
            style={{ background: T.bg, border: '1.5px dashed rgba(255,255,255,0.18)' }}
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
            border: `1px solid ${isLogged ? 'rgba(215,255,62,0.15)' : CARD_BORDER}`,
            opacity: isLogged ? 1 : 0.85,
          }}
        >
          {/* Header row */}
          <div className={`flex items-start justify-between ${isLogged ? 'mb-3' : ''}`}>
            <div className="min-w-0 flex-1 pr-3">
              <p
                className="display-xs uppercase leading-tight"
                style={{ color: isLogged ? '#F4F2EC' : 'rgba(255,255,255,0.55)' }}
              >
                {meal.label}
              </p>
              <p className="font-body text-[11px] text-white/35 mt-1 truncate">
                {summary}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span
                className="font-body text-[10px] font-extrabold uppercase tracking-wider"
                style={{ color: isLogged ? GOLD : 'rgba(255,255,255,0.28)' }}
              >
                {isLogged ? 'Logged' : 'Not logged'}
              </span>
              <ChevronRight size={14} strokeWidth={T.stroke} className="text-white/25" />
            </div>
          </div>

          {/* Macro row — only when logged */}
          {isLogged && (
            <div className="flex items-baseline gap-3">
              <div className="flex flex-col">
                <span className="font-display text-[18px] text-[#F4F2EC] tabular-nums leading-none">
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
          <h2 className="font-display text-[20px] text-[#F4F2EC] uppercase tracking-wider leading-none">
            {meal.label}
          </h2>
          <p className="font-body text-[11px] text-white/30 mt-1.5 uppercase tracking-wider">
            {meal.time}
          </p>
        </div>
        {meal.logged && (
          <span
            className="font-body text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md"
            style={{ background: 'rgba(212,168,72,0.12)', color: GOLD, border: '1px solid rgba(212,168,72,0.40)' }}
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
                <span className="font-display text-[18px] text-[#F4F2EC] tabular-nums leading-none">{totals.calories}</span>
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
                whileTap={T.tap}
                onClick={handleLogAsIs}
                className="btn-primary mb-2.5"
              >
                <Check size={16} strokeWidth={2.5} /> Log as is
              </motion.button>
            )}

            {/* Secondary actions */}
            <div className="flex gap-2">
              <motion.button whileTap={T.tap} onClick={() => setView('adjust')} className="btn-secondary flex-1">
                Adjust
              </motion.button>
              <motion.button whileTap={T.tap} onClick={() => setView('replace')} className="btn-secondary flex-1">
                <RefreshCw size={13} strokeWidth={T.stroke} /> Replace
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
              <ChevronRight size={12} strokeWidth={T.stroke} className="rotate-180" /> Back
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
                          className="w-full bg-transparent font-body font-bold text-[15px] tabular-nums outline-none px-2.5 py-2 rounded-lg"
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
                <p className="kicker mb-2.5">Add food</p>
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
                      className="bg-transparent font-body font-bold text-[14px] tabular-nums outline-none px-2.5 py-2 rounded-lg placeholder:text-white/15"
                      style={{ color: m.color, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleAddCustom}
                  disabled={!customName.trim()}
                  className="w-full py-2 rounded-lg font-body text-[11px] font-bold text-white/60 disabled:opacity-30 flex items-center justify-center gap-1"
                  style={{ border: `1px solid ${CARD_BORDER}` }}
                >
                  <Plus size={12} strokeWidth={T.stroke} /> Add to meal
                </button>
              </div>
            </div>

            <motion.button
              whileTap={T.tap}
              onClick={handleConfirmAdjust}
              className="btn-primary mt-4"
            >
              Confirm & log
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
              <ChevronRight size={12} strokeWidth={T.stroke} className="rotate-180" /> Back
            </button>

            <p className="kicker mb-1">Replace {meal.label}</p>
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
                        className="bg-transparent font-body font-bold text-[14px] tabular-nums outline-none px-2.5 py-2 rounded-lg placeholder:text-white/15 placeholder:font-body placeholder:text-[11px]"
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
              <Plus size={12} strokeWidth={T.stroke} /> Add another food
            </button>

            {replaceTotalCal > 0 && (
              <p className="font-body text-[11px] text-white/30 text-center mb-4 tabular-nums">
                ~{replaceTotalCal} cal estimated
              </p>
            )}

            <motion.button
              whileTap={T.tap}
              onClick={handleConfirmReplace}
              disabled={replaceValidCount === 0}
              className="btn-primary"
            >
              Replace & log
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
      <h2 className="font-display text-[20px] text-[#F4F2EC] uppercase tracking-wider leading-none mb-5">
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
                  className="bg-transparent font-body font-bold text-[14px] tabular-nums outline-none px-2.5 py-2 rounded-lg placeholder:text-white/15 placeholder:font-body placeholder:text-[11px]"
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
        <Plus size={12} strokeWidth={T.stroke} /> Add another food
      </button>

      {/* Estimated calories */}
      {totalCal > 0 && (
        <p className="font-body text-[11px] text-white/30 text-center mb-4 tabular-nums">
          ~{totalCal} cal estimated
        </p>
      )}

      {/* Actions */}
      <motion.button
        whileTap={T.tap}
        onClick={() => handleSave(true)}
        disabled={!canSave}
        className="btn-primary mb-2.5"
      >
        <Check size={16} strokeWidth={2.5} /> Add & log
      </motion.button>
      <motion.button
        whileTap={T.tap}
        onClick={() => handleSave(false)}
        disabled={!canSave}
        className="btn-secondary w-full"
      >
        Add to plan only
      </motion.button>
    </BottomSheet>
  );
}

// ═════════════════════════════════════════════
// ── Hydration View ── (detailed)
// ═════════════════════════════════════════════
const GLASS_ML = 250;
const STEEL_BRIGHT = T.water;
const STREAK_GREEN = T.red;

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
              <span className="font-display text-[26px] text-[#F4F2EC] leading-none tabular-nums">
                {hydrationL}L
              </span>
              <span className="font-body text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: STEEL_BRIGHT }}>
                of {targetL}L
              </span>
              <span className="font-body text-[9px] font-bold text-white/30 uppercase tracking-wider mt-0.5">
                Daily goal
              </span>
            </div>
          </RingCounter>
        </div>

        <div className="flex-1 min-w-0">
          <p className="kicker mb-1">Today</p>
          <div className="flex items-baseline gap-1 mb-1" style={{ color: STEEL_BRIGHT }}>
            <NumericCounter value={pct} className="text-[56px] leading-none" duration={0.6} />
            <span className="display-sm">%</span>
          </div>
          <p className="kicker mb-3">Of goal</p>

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
            <GlassWater size={14} strokeWidth={T.stroke} style={{ color: STEEL_BRIGHT }} />
            <span className="font-body text-[14px] font-bold text-[#F4F2EC] tabular-nums">
              {glassesCurr} / {glassesTarget}
            </span>
            <span className="font-body text-[9px] font-bold text-white/35 uppercase tracking-wider">Glasses</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DrinkButton({ defaultMl, logWater, setWaterDefault, hasEntries, undoLast }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editMl, setEditMl] = useState(defaultMl);
  const presets = [150, 200, 250, 300, 500, 750];

  useEffect(() => { if (settingsOpen) setEditMl(defaultMl); }, [settingsOpen, defaultMl]);

  const handleDrink = useCallback(() => logWater(defaultMl), [defaultMl, logWater]);
  const handleSavePreset = useCallback((ml) => {
    setWaterDefault(ml);
    setSettingsOpen(false);
  }, [setWaterDefault]);
  const handleLogCustom = useCallback(() => {
    logWater(editMl);
    setSettingsOpen(false);
  }, [logWater, editMl]);

  return (
    <div className="mx-5 mb-5">
      <div className="flex items-stretch gap-2">
        <motion.button
          whileTap={T.tap}
          onClick={handleDrink}
          className="btn-primary flex-1"
          style={{ width: 'auto' }}
        >
          <Droplets size={18} strokeWidth={2} />
          Drink ({defaultMl}ml)
        </motion.button>
        <motion.button
          whileTap={hasEntries ? T.tap : undefined}
          onClick={hasEntries ? undoLast : undefined}
          disabled={!hasEntries}
          aria-label="Undo last drink"
          className="btn-secondary flex-1"
        >
          <Undo2 size={15} strokeWidth={T.stroke} />
          −{defaultMl}ml
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setSettingsOpen(o => !o)}
          aria-label="Customize amount"
          className="shrink-0 w-14 rounded-2xl flex items-center justify-center"
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <Settings2 size={18} strokeWidth={T.stroke} className="text-white/55" />
        </motion.button>
      </div>

      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 p-4 rounded-2xl"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <p className="kicker mb-2.5">Default drink size</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {presets.map(ml => {
                  const active = ml === defaultMl;
                  return (
                    <button
                      key={ml}
                      onClick={() => handleSavePreset(ml)}
                      className="py-2.5 rounded-xl font-body text-[12px] font-bold tabular-nums"
                      style={{
                        background: active ? T.goldTint : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${active ? T.goldBorder : CARD_BORDER}`,
                        color: active ? GOLD : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {ml}ml
                    </button>
                  );
                })}
              </div>

              <p className="kicker mb-2">Log custom amount</p>
              <div className="flex items-center gap-2">
                <input
                  type="number" min={50} max={2000} step={50} value={editMl}
                  onChange={e => setEditMl(Math.max(50, Math.min(2000, Number(e.target.value) || 0)))}
                  className="flex-1 bg-transparent font-display text-[18px] text-[#F4F2EC] tabular-nums outline-none px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${CARD_BORDER}` }}
                />
                <span className="font-body text-[11px] text-white/30">ml</span>
                <motion.button
                  whileTap={T.tapSmall}
                  onClick={handleLogCustom}
                  className="px-4 py-2.5 rounded-xl font-body text-[12px] font-bold text-black"
                  style={{ background: T.goldGrad }}
                >
                  Log
                </motion.button>
              </div>
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
      <p className="kicker mb-4">Weekly overview</p>

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
                backgroundImage: `repeating-linear-gradient(to right, ${GOLD} 0px, ${GOLD} 4px, transparent 4px, transparent 8px)`,
              }}
            />
            <span
              className="font-body text-[9px] font-extrabold uppercase tracking-wider ml-1.5 leading-none"
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
                    <span className="font-body text-[10px] font-bold text-white/75 tabular-nums mb-1 leading-none">
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
                className="font-body text-[9px] font-bold uppercase tracking-wider"
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
        <Droplets size={18} strokeWidth={T.stroke} style={{ color: STEEL_BRIGHT }} className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="font-body text-[9px] font-extrabold text-white/35 uppercase tracking-wider leading-none">Weekly avg</p>
          <p className="font-display text-[18px] text-[#F4F2EC] tabular-nums leading-none mt-1.5">
            {(avgMl / 1000).toFixed(1)}L
          </p>
          <p className="font-body text-[9px] text-white/30 uppercase tracking-wider mt-1">
            {avgPct}% of goal
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2 px-2 border-l border-r" style={{ borderColor: CARD_BORDER }}>
        <Trophy size={18} strokeWidth={T.stroke} style={{ color: T.gold }} className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="font-body text-[9px] font-extrabold text-white/35 uppercase tracking-wider leading-none">Best day</p>
          <p className="font-display text-[18px] tabular-nums leading-none mt-1.5" style={{ color: T.gold }}>
            {bestDay ? `${(bestDay.waterMl / 1000).toFixed(1)}L` : '—'}
          </p>
          <p className="font-body text-[9px] text-white/30 uppercase tracking-wider mt-1">
            {bestDay ? bestDay.dayOfWeek : 'No data'}
          </p>
        </div>
      </div>
      <div className="flex items-start gap-2 px-2">
        <Flame size={18} strokeWidth={T.stroke} style={{ color: STREAK_GREEN }} className="mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="font-body text-[9px] font-extrabold text-white/35 uppercase tracking-wider leading-none">Streak</p>
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
        <p className="kicker">Recent history</p>
        {entries.length > 5 && (
          <button onClick={() => setShowAll(s => !s)} className="btn-ghost !py-0 text-[12px]">
            {showAll ? 'Show less' : 'View all'}
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="py-8 flex flex-col items-center gap-2">
          <GlassWater size={28} strokeWidth={T.stroke} className="text-white/15" />
          <p className="font-body text-[13px] font-medium" style={{ color: T.textLow }}>
            Nothing logged yet. Thirsty?
          </p>
          <p className="font-body text-[12px]" style={{ color: T.textFaint }}>
            Tap Drink to start the count.
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
                style={{ background: T.surface2, border: `1px solid ${T.hairlineStrong}` }}
              >
                <Check size={12} strokeWidth={2.5} style={{ color: T.textMid }} />
              </div>
              <span className="font-body text-[11px] font-semibold text-white/45 w-[60px] shrink-0 tabular-nums">
                {formatTime(entry.t)}
              </span>
              <span className="flex-1 font-body text-[13px] font-medium text-white/80">
                {entry.ml}ml water
              </span>
              <span className="font-body text-[12px] font-bold tabular-nums" style={{ color: T.textMid }}>
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

function HydrationView({
  hydration, logWater, history, waterLog, removeWaterEntry,
  waterDefaultMl, setWaterDefault,
}) {
  const hasEntries = (waterLog?.length || 0) > 0;
  const undoLast = useCallback(() => {
    if (hasEntries) removeWaterEntry(0);
  }, [hasEntries, removeWaterEntry]);

  return (
    <div className="pb-4">
      <HydrationHero hydration={hydration} />
      <DrinkButton
        defaultMl={waterDefaultMl}
        logWater={logWater}
        setWaterDefault={setWaterDefault}
        hasEntries={hasEntries}
        undoLast={undoLast}
      />
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
    meals, logged, hydration, history, waterLog, waterDefaultMl,
    logMeal, adjustMeal, updateMealFoods, addMeal,
    logWater, removeWaterEntry, setWaterDefault,
  } = useApp();

  const shouldReduce = useReducedMotion();
  const [activeTab, setActiveTab] = useState('meals');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);

  const handleMealTap = useCallback(idx => { setSelectedMeal(idx); setSheetOpen(true); }, []);
  const handleClose = useCallback(() => {
    setSheetOpen(false);
    setTimeout(() => setSelectedMeal(null), 300);
  }, []);

  return (
    <div className="min-h-screen pb-28" style={{ background: T.bg }}>
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
          <h1 className="display-md text-[#F4F2EC]">
            NUTRITION
          </h1>
          <p className="font-body text-[13px] font-medium mt-2" style={{ color: T.textLow }}>
            Fuel the work.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.93 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ border: `1px solid ${T.hairlineStrong}` }}
          >
            <BookOpen size={14} strokeWidth={T.stroke} style={{ color: T.textMid }} />
            <span className="font-body text-[12px] font-bold" style={{ color: T.textMid }}>
              Guide
            </span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setMonthOpen(true)}
            aria-label="Month view"
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ border: `1px solid ${T.hairlineStrong}` }}
          >
            <CalendarDays size={16} strokeWidth={T.stroke} style={{ color: T.textMid }} />
          </motion.button>
        </div>
      </motion.div>

      <div className="mb-4">
        <WeekStrip mode="nutrition" />
      </div>

      <TabToggle active={activeTab} onChange={setActiveTab} />

      {activeTab === 'meals' ? (
        <>
          <MacrosOverview logged={logged} />

          {/* Section header */}
          <div className="px-5 mb-3 flex items-center justify-between">
            <p className="kicker">Today's meals</p>
            <MoreHorizontal size={16} strokeWidth={T.stroke} className="text-white/25" />
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
              whileTap={T.tap}
              onClick={() => setAddMealOpen(true)}
              className="btn-primary"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add meal
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
          waterDefaultMl={waterDefaultMl ?? 300}
          setWaterDefault={setWaterDefault}
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

      <MonthSheet isOpen={monthOpen} onClose={() => setMonthOpen(false)} mode="nutrition" />
    </div>
  );
}
