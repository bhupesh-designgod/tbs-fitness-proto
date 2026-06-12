// ── App Context ──
// Central state management for TBS. All mutations persist to localStorage.

import { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  MEAL_PLAN, DAILY_TARGETS, generateHistory,
  getSessionForDay, PLAN_PROGRESS, TRAINING_SESSIONS,
} from '../data/mockData';
import {
  sumMealMacros, computeRemaining, deriveState,
  rebalanceMeals, weekAdherence, calcAdherence,
} from '../data/stateEngine';

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

  const adjustMeal = useCallback((mealIndex, newFoods) => {
    setState(prev => {
      const meals = clone(prev.meals);
      meals[mealIndex].foods = newFoods;
      meals[mealIndex].logged = true;
      const rebalanced = rebalanceMeals(meals, mealIndex);
      return { ...prev, meals: rebalanced };
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

  const logWater = useCallback((ml) => {
    setState(prev => ({
      ...prev,
      hydration: Math.min(prev.hydration + ml, 5000),
    }));
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
    swapMealFood,
    updateMealFoods,
    logWater,
    toggleSet,
    setStateOverride,
    resetData,
  }), [state, computed, logMeal, adjustMeal, swapMealFood, updateMealFoods, logWater, toggleSet, setStateOverride, resetData]);

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
