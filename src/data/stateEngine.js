// ── Behavior State Engine ──
// Derives ON_TRACK | LAGGING | REST | DEPLETED from logged data
// Recomputed on every log mutation

import { DAILY_TARGETS } from './mockData';

/**
 * Compute remaining macros from targets minus logged
 */
export function computeRemaining(targets, logged) {
  return {
    calories: targets.calories - logged.calories,
    protein: targets.protein - logged.protein,
    carbs: targets.carbs - logged.carbs,
    fat: targets.fat - logged.fat,
    water: targets.water - logged.water,
  };
}

/**
 * Sum macros across an array of meal objects
 */
export function sumMealMacros(meals) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  meals.forEach(meal => {
    if (meal.logged) {
      meal.foods.forEach(food => {
        totals.calories += food.calories;
        totals.protein += food.protein;
        totals.carbs += food.carbs;
        totals.fat += food.fat;
      });
    }
  });
  return totals;
}

/**
 * Derive behavior state from current data
 */
export function deriveState(meals, isRestDay, overrideState = null) {
  if (overrideState) return overrideState;
  if (isRestDay) return 'REST';

  const logged = sumMealMacros(meals);
  const loggedCount = meals.filter(m => m.logged).length;

  // Check if it's late in the day and nothing logged
  const hour = new Date().getHours();
  if (loggedCount === 0 && hour >= 14) return 'DEPLETED';
  if (loggedCount === 0 && hour >= 10) return 'LAGGING';

  const calPercent = logged.calories / DAILY_TARGETS.calories;
  if (calPercent >= 0.4 || loggedCount >= 2) return 'ON_TRACK';
  if (loggedCount >= 1) return 'LAGGING';

  return 'ON_TRACK';
}

/**
 * Calculate adherence percentage for a completed day
 */
export function calcAdherence(logged, targets = DAILY_TARGETS) {
  const calPct = Math.min(logged.calories / targets.calories, 1);
  const protPct = Math.min(logged.protein / targets.protein, 1);
  const carbPct = Math.min(logged.carbs / targets.carbs, 1);
  const fatPct = Math.min(logged.fat / targets.fat, 1);
  return Math.round(((calPct + protPct + carbPct + fatPct) / 4) * 100);
}

/**
 * Rebalance remaining meals when one meal overshoots
 * Proportionally redistributes overshoot across unlogged meals
 */
export function rebalanceMeals(meals, changedMealIndex) {
  const changedMeal = meals[changedMealIndex];
  const unloggedIndices = meals
    .map((m, i) => (!m.logged && i !== changedMealIndex) ? i : -1)
    .filter(i => i !== -1);

  if (unloggedIndices.length === 0) return meals;

  // Calculate what this meal was planned vs what it now is
  const originalMeal = meals[changedMealIndex];
  const newTotals = originalMeal.foods.reduce((acc, f) => ({
    protein: acc.protein + f.protein,
    carbs: acc.carbs + f.carbs,
    fat: acc.fat + f.fat,
    calories: acc.calories + f.calories,
  }), { protein: 0, carbs: 0, fat: 0, calories: 0 });

  // Calculate logged totals
  const loggedTotals = sumMealMacros(meals.filter((m, i) => m.logged && i !== changedMealIndex));
  const remaining = {
    protein: DAILY_TARGETS.protein - loggedTotals.protein - newTotals.protein,
    carbs: DAILY_TARGETS.carbs - loggedTotals.carbs - newTotals.carbs,
    fat: DAILY_TARGETS.fat - loggedTotals.fat - newTotals.fat,
    calories: DAILY_TARGETS.calories - loggedTotals.calories - newTotals.calories,
  };

  // Redistribute remaining across unlogged meals proportionally
  const newMeals = [...meals];
  const unloggedCount = unloggedIndices.length;

  unloggedIndices.forEach(idx => {
    const meal = { ...newMeals[idx] };
    const origMealTotal = meal.foods.reduce((acc, f) => ({
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
      calories: acc.calories + f.calories,
    }), { protein: 0, carbs: 0, fat: 0, calories: 0 });

    // Calculate scale factor for this meal
    const targetPortion = {
      protein: remaining.protein / unloggedCount,
      carbs: remaining.carbs / unloggedCount,
      fat: remaining.fat / unloggedCount,
    };

    // Scale foods proportionally
    const scaleFactor = origMealTotal.protein > 0
      ? Math.max(0.5, Math.min(1.5, targetPortion.protein / (origMealTotal.protein || 1)))
      : 1;

    meal.foods = meal.foods.map(f => ({
      ...f,
      protein: Math.max(0, Math.round(f.protein * scaleFactor)),
      carbs: Math.max(0, Math.round(f.carbs * scaleFactor)),
      fat: Math.max(0, Math.round(f.fat * scaleFactor)),
      calories: Math.max(0, Math.round(f.calories * scaleFactor)),
    }));
    meal.rebalanced = scaleFactor !== 1;
    newMeals[idx] = meal;
  });

  return newMeals;
}

/**
 * Compute week adherence from history
 */
export function weekAdherence(history) {
  const last7 = history.filter(d => d.adherence !== null).slice(-7);
  if (last7.length === 0) return 0;
  return Math.round(last7.reduce((sum, d) => sum + d.adherence, 0) / last7.length);
}
