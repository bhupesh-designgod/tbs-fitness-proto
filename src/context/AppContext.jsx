// ── App Context ──
// Central state management for TBS. All mutations persist to localStorage.

import { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  MEAL_PLAN, DAILY_TARGETS, PLAN_TOTALS, generateHistory,
  getSessionForDay, PLAN_PROGRESS, TRAINING_SESSIONS,
} from '../data/mockData';
import {
  sumMealMacros, computeRemaining, deriveState,
  weekAdherence, calcAdherence,
} from '../data/stateEngine';

// Sum the macros of one meal's foods
const sumFoods = (foods) => foods.reduce(
  (a, f) => ({
    calories: a.calories + (f.calories || 0),
    protein: a.protein + (f.protein || 0),
    carbs: a.carbs + (f.carbs || 0),
    fat: a.fat + (f.fat || 0),
  }),
  { calories: 0, protein: 0, carbs: 0, fat: 0 }
);

const AppContext = createContext(null);

// Deep clone helper
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// ── Initial state factory ──
function createInitialState() {
  const history = generateHistory();
  const todayIndex = history.length - 1;
  const splitType = history[todayIndex].split;
  const session = { ...TRAINING_SESSIONS[splitType], type: splitType };
  
  // Deep clone exercises with done:false
  if (session.exercises) {
    session.exercises = session.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(s => ({ ...s, done: false })),
    }));
  }

  return {
    meals: clone(MEAL_PLAN),
    hydration: 0,
    waterLog: [], // [{ ml, t: ISOString }]
    waterDefaultMl: 300, // user-configurable default for the Drink button
    history,
    training: session,
    trainingSetsCompleted: 0,
    sessionComplete: false,
    dayIndex: todayIndex,
    stateOverride: null,
  };
}

export function AppProvider({ children }) {
  const [state, setState] = useLocalStorage('tbs-state', createInitialState());

  // ── Computed values ──
  const computed = useMemo(() => {
    const logged = sumMealMacros(state.meals);
    const remaining = computeRemaining(DAILY_TARGETS, {
      ...logged,
      water: state.hydration,
    });
    const isRestDay = state.training.type === 'rest';
    const behaviorState = deriveState(state.meals, isRestDay, state.stateOverride);
    const weekAdh = weekAdherence(state.history);
    const todayAdh = calcAdherence(logged);
    const loggedMeals = state.meals.filter(m => m.logged).length;
    const totalSets = state.training.exercises
      ? state.training.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
      : 0;
    const doneSets = state.training.exercises
      ? state.training.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.done).length, 0)
      : 0;

    return {
      logged,
      remaining,
      isRestDay,
      behaviorState,
      weekAdherence: weekAdh,
      todayAdherence: todayAdh,
      loggedMeals,
      totalSets,
      doneSets,
    };
  }, [state]);

  // ── Actions ──
  const logMeal = useCallback((mealIndex) => {
    setState(prev => {
      const meals = clone(prev.meals);
      meals[mealIndex].logged = true;
      return { ...prev, meals };
    });
  }, [setState]);

  // Log a meal with edited/replaced foods — logs exactly what was eaten.
  // We no longer silently rescale the other meals; the user redistributes any
  // shortfall to a meal of their choice via redistributeToMeal.
  const adjustMeal = useCallback((mealIndex, newFoods) => {
    setState(prev => {
      const meals = clone(prev.meals);
      meals[mealIndex].foods = newFoods;
      meals[mealIndex].logged = true;
      meals[mealIndex].rebalanced = false;
      return { ...prev, meals };
    });
  }, [setState]);

  // Absorb the day's off-plan difference into one chosen upcoming meal by
  // scaling its quantities so the projected day total lands back on the plan.
  const redistributeToMeal = useCallback((targetIndex) => {
    setState(prev => {
      const meals = clone(prev.meals);
      const target = meals[targetIndex];
      if (!target || target.logged) return prev;

      // Projected day total if every meal is eaten as currently set.
      const projected = meals.reduce((acc, m) => {
        const s = sumFoods(m.foods);
        return {
          calories: acc.calories + s.calories,
          protein: acc.protein + s.protein,
          carbs: acc.carbs + s.carbs,
          fat: acc.fat + s.fat,
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

      const gapCal = PLAN_TOTALS.calories - projected.calories;
      const targetTotal = sumFoods(target.foods);
      if (targetTotal.calories <= 0) return prev;

      // One quantity factor moves all macros together (a real portion change).
      const factor = Math.max(0.1, (targetTotal.calories + gapCal) / targetTotal.calories);
      target.foods = target.foods.map(f => ({
        ...f,
        protein: Math.max(0, Math.round((f.protein || 0) * factor)),
        carbs: Math.max(0, Math.round((f.carbs || 0) * factor)),
        fat: Math.max(0, Math.round((f.fat || 0) * factor)),
        calories: Math.max(0, Math.round((f.calories || 0) * factor)),
      }));
      target.rebalanced = true;
      meals[targetIndex] = target;
      return { ...prev, meals };
    });
  }, [setState]);

  const swapMealFood = useCallback((mealIndex, foodIndex, newFood) => {
    setState(prev => {
      const meals = clone(prev.meals);
      meals[mealIndex].foods[foodIndex] = newFood;
      return { ...prev, meals };
    });
  }, [setState]);

  // Update foods without logging (for auto-adjust)
  const updateMealFoods = useCallback((mealIndex, newFoods) => {
    setState(prev => {
      const meals = clone(prev.meals);
      meals[mealIndex].foods = newFoods;
      return { ...prev, meals };
    });
  }, [setState]);

  // Append a brand-new meal to today's plan
  const addMeal = useCallback((meal) => {
    setState(prev => ({
      ...prev,
      meals: [...clone(prev.meals), meal],
    }));
  }, [setState]);

  const logWater = useCallback((ml) => {
    setState(prev => ({
      ...prev,
      hydration: Math.min(prev.hydration + ml, 5000),
      waterLog: [
        { ml, t: new Date().toISOString() },
        ...(prev.waterLog || []),
      ].slice(0, 50),
    }));
  }, [setState]);

  const setWaterDefault = useCallback((ml) => {
    setState(prev => ({
      ...prev,
      waterDefaultMl: Math.max(50, Math.min(2000, Number(ml) || 300)),
    }));
  }, [setState]);

  const removeWaterEntry = useCallback((index) => {
    setState(prev => {
      const log = prev.waterLog || [];
      const entry = log[index];
      if (!entry) return prev;
      return {
        ...prev,
        hydration: Math.max(0, prev.hydration - entry.ml),
        waterLog: log.filter((_, i) => i !== index),
      };
    });
  }, [setState]);

  const toggleSet = useCallback((exerciseIndex, setIndex) => {
    setState(prev => {
      const training = clone(prev.training);
      if (!training.exercises) return prev;
      training.exercises[exerciseIndex].sets[setIndex].done =
        !training.exercises[exerciseIndex].sets[setIndex].done;
      
      const totalSets = training.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
      const doneSets = training.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.done).length, 0);
      const sessionComplete = doneSets === totalSets;

      return { ...prev, training, sessionComplete };
    });
  }, [setState]);

  const setStateOverride = useCallback((state) => {
    setState(prev => ({ ...prev, stateOverride: state }));
  }, [setState]);

  const resetData = useCallback(() => {
    setState(createInitialState());
  }, [setState]);

  const value = useMemo(() => ({
    ...state,
    ...computed,
    logMeal,
    adjustMeal,
    redistributeToMeal,
    swapMealFood,
    updateMealFoods,
    addMeal,
    logWater,
    setWaterDefault,
    removeWaterEntry,
    toggleSet,
    setStateOverride,
    resetData,
  }), [state, computed, logMeal, adjustMeal, redistributeToMeal, swapMealFood, updateMealFoods, addMeal, logWater, setWaterDefault, removeWaterEntry, toggleSet, setStateOverride, resetData]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
