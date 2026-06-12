// ── TBS Mock Data ──
// All data for the prototype. Logging mutates state via AppContext.

// ── Unsplash photo URLs (dark, high-contrast gym/training) ──
export const PHOTOS = {
  pushHero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&auto=format&fit=crop',
  pullHero: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80&auto=format&fit=crop',
  legsHero: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&q=80&auto=format&fit=crop',
  restHero: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80&auto=format&fit=crop',
  bikiPortrait: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80&auto=format&fit=crop',
  sessionComplete: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=800&q=80&auto=format&fit=crop',
};

// ── User profile ──
export const USER_PROFILE = {
  name: 'Arjun',
  avatar: null, // initials fallback
  plan: 'Lean Bulk — 16 weeks',
  goal: 'Gain lean muscle, improve strength',
  units: 'metric',
  weekNumber: 6,
  totalWeeks: 16,
};

// ── Biki coach profile ──
export const BIKI = {
  name: 'Biki Singh',
  title: 'IFBB Pro · Head Coach',
  avatar: PHOTOS.bikiPortrait,
};

// ── Daily targets ──
export const DAILY_TARGETS = {
  calories: 2400,
  protein: 180,
  carbs: 240,
  fat: 70,
  water: 3000, // ml
};

// ── Training split (Push/Pull/Legs/Rest repeating) ──
const SPLIT_CYCLE = ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'legs'];

export const TRAINING_SESSIONS = {
  push: {
    name: 'Push Day',
    muscles: ['Chest', 'Shoulders', 'Triceps'],
    photo: PHOTOS.pushHero,
    exercises: [
      { name: 'Flat Barbell Bench Press', sets: [
        { reps: 10, load: 80, done: false },
        { reps: 8, load: 85, done: false },
        { reps: 8, load: 85, done: false },
        { reps: 6, load: 90, done: false },
      ]},
      { name: 'Incline Dumbbell Press', sets: [
        { reps: 12, load: 30, done: false },
        { reps: 10, load: 32, done: false },
        { reps: 10, load: 32, done: false },
      ]},
      { name: 'Cable Lateral Raise', sets: [
        { reps: 15, load: 7, done: false },
        { reps: 15, load: 7, done: false },
        { reps: 12, load: 8, done: false },
      ]},
      { name: 'Overhead Tricep Extension', sets: [
        { reps: 12, load: 20, done: false },
        { reps: 12, load: 20, done: false },
        { reps: 10, load: 22, done: false },
      ]},
      { name: 'Pec Deck Fly', sets: [
        { reps: 15, load: 50, done: false },
        { reps: 12, load: 55, done: false },
        { reps: 12, load: 55, done: false },
      ]},
    ],
  },
  pull: {
    name: 'Pull Day',
    muscles: ['Back', 'Biceps', 'Rear Delts'],
    photo: PHOTOS.pullHero,
    exercises: [
      { name: 'Barbell Row', sets: [
        { reps: 10, load: 70, done: false },
        { reps: 8, load: 75, done: false },
        { reps: 8, load: 75, done: false },
        { reps: 6, load: 80, done: false },
      ]},
      { name: 'Lat Pulldown', sets: [
        { reps: 12, load: 55, done: false },
        { reps: 10, load: 60, done: false },
        { reps: 10, load: 60, done: false },
      ]},
      { name: 'Face Pull', sets: [
        { reps: 15, load: 15, done: false },
        { reps: 15, load: 15, done: false },
        { reps: 15, load: 15, done: false },
      ]},
      { name: 'Barbell Curl', sets: [
        { reps: 12, load: 25, done: false },
        { reps: 10, load: 27, done: false },
        { reps: 10, load: 27, done: false },
      ]},
      { name: 'Cable Row', sets: [
        { reps: 12, load: 50, done: false },
        { reps: 12, load: 50, done: false },
        { reps: 10, load: 55, done: false },
      ]},
    ],
  },
  legs: {
    name: 'Legs Day',
    muscles: ['Quads', 'Hamstrings', 'Glutes'],
    photo: PHOTOS.legsHero,
    exercises: [
      { name: 'Barbell Squat', sets: [
        { reps: 10, load: 90, done: false },
        { reps: 8, load: 100, done: false },
        { reps: 8, load: 100, done: false },
        { reps: 6, load: 110, done: false },
      ]},
      { name: 'Romanian Deadlift', sets: [
        { reps: 10, load: 80, done: false },
        { reps: 10, load: 80, done: false },
        { reps: 8, load: 85, done: false },
      ]},
      { name: 'Leg Press', sets: [
        { reps: 12, load: 180, done: false },
        { reps: 12, load: 180, done: false },
        { reps: 10, load: 200, done: false },
      ]},
      { name: 'Walking Lunges', sets: [
        { reps: 12, load: 20, done: false },
        { reps: 12, load: 20, done: false },
        { reps: 12, load: 20, done: false },
      ]},
      { name: 'Leg Curl', sets: [
        { reps: 15, load: 40, done: false },
        { reps: 12, load: 45, done: false },
        { reps: 12, load: 45, done: false },
      ]},
    ],
  },
  rest: {
    name: 'Rest Day',
    muscles: [],
    photo: PHOTOS.restHero,
    exercises: [],
    recovery: {
      sleepTarget: '8+ hours',
      mobility: [
        { name: 'Foam Roll — Upper Back', duration: '3 min' },
        { name: 'Hip Flexor Stretch', duration: '2 min each side' },
        { name: 'Shoulder Dislocates', duration: '2 min' },
        { name: 'Cat-Cow Flow', duration: '3 min' },
      ],
    },
  },
};

// ── Meal plan (Indian-friendly foods) ──
export const MEAL_PLAN = [
  {
    id: 'meal-1',
    time: '8:00 AM',
    label: 'Breakfast',
    foods: [
      { name: 'Paneer Bhurji', portion: '150g', protein: 25, carbs: 6, fat: 18, calories: 290 },
      { name: 'Multigrain Roti', portion: '2 pcs', protein: 8, carbs: 40, fat: 4, calories: 230 },
      { name: 'Black Coffee', portion: '1 cup', protein: 0, carbs: 0, fat: 0, calories: 5 },
    ],
    logged: false,
  },
  {
    id: 'meal-2',
    time: '1:00 PM',
    label: 'Lunch',
    foods: [
      { name: 'Chicken Breast', portion: '200g', protein: 46, carbs: 0, fat: 6, calories: 240 },
      { name: 'Basmati Rice', portion: '150g cooked', protein: 4, carbs: 52, fat: 1, calories: 230 },
      { name: 'Dal Tadka', portion: '1 bowl', protein: 12, carbs: 22, fat: 5, calories: 180 },
      { name: 'Cucumber Raita', portion: '100g', protein: 3, carbs: 5, fat: 2, calories: 50 },
    ],
    logged: false,
  },
  {
    id: 'meal-3',
    time: '5:00 PM',
    label: 'Pre-workout',
    foods: [
      { name: 'Whey Protein Shake', portion: '1 scoop', protein: 24, carbs: 4, fat: 2, calories: 130 },
      { name: 'Banana', portion: '1 large', protein: 1, carbs: 31, fat: 0, calories: 120 },
      { name: 'Peanut Butter Toast', portion: '1 slice', protein: 7, carbs: 18, fat: 9, calories: 180 },
    ],
    logged: false,
  },
  {
    id: 'meal-4',
    time: '9:00 PM',
    label: 'Dinner',
    foods: [
      { name: 'Grilled Chicken Tikka', portion: '180g', protein: 40, carbs: 4, fat: 8, calories: 250 },
      { name: 'Curd Rice', portion: '1 bowl', protein: 6, carbs: 38, fat: 5, calories: 220 },
      { name: 'Mixed Salad', portion: '1 bowl', protein: 2, carbs: 8, fat: 1, calories: 45 },
    ],
    logged: false,
  },
];

// ── Swap alternatives per meal ──
export const SWAP_OPTIONS = {
  'meal-1': [
    { name: 'Egg White Omelette', portion: '6 whites', protein: 22, carbs: 2, fat: 1, calories: 105 },
    { name: 'Moong Dal Chilla', portion: '3 pcs', protein: 20, carbs: 30, fat: 6, calories: 254 },
    { name: 'Greek Yogurt Bowl', portion: '200g', protein: 20, carbs: 12, fat: 5, calories: 170 },
  ],
  'meal-2': [
    { name: 'Fish Curry', portion: '200g', protein: 40, carbs: 8, fat: 10, calories: 280 },
    { name: 'Soya Chunk Curry', portion: '100g dry', protein: 52, carbs: 20, fat: 1, calories: 340 },
    { name: 'Egg Curry', portion: '4 eggs', protein: 28, carbs: 10, fat: 18, calories: 310 },
  ],
  'meal-3': [
    { name: 'Chana Chaat', portion: '200g', protein: 14, carbs: 40, fat: 6, calories: 260 },
    { name: 'Sprouts Salad', portion: '150g', protein: 12, carbs: 28, fat: 2, calories: 180 },
    { name: 'Protein Bar', portion: '1 bar', protein: 20, carbs: 22, fat: 8, calories: 240 },
  ],
  'meal-4': [
    { name: 'Paneer Tikka', portion: '200g', protein: 30, carbs: 8, fat: 22, calories: 350 },
    { name: 'Keema Matar', portion: '200g', protein: 36, carbs: 12, fat: 14, calories: 320 },
    { name: 'Tofu Stir Fry', portion: '250g', protein: 20, carbs: 15, fat: 10, calories: 230 },
  ],
};

// ── Food search list ──
export const FOOD_DATABASE = [
  { name: 'Paneer Bhurji', per100: { protein: 17, carbs: 4, fat: 12, calories: 193 }},
  { name: 'Chicken Breast', per100: { protein: 23, carbs: 0, fat: 3, calories: 120 }},
  { name: 'Basmati Rice', per100: { protein: 3, carbs: 35, fat: 0.5, calories: 153 }},
  { name: 'Dal Tadka', per100: { protein: 7, carbs: 13, fat: 3, calories: 107 }},
  { name: 'Whey Protein', per100: { protein: 80, carbs: 8, fat: 4, calories: 390 }},
  { name: 'Banana', per100: { protein: 1, carbs: 23, fat: 0.3, calories: 89 }},
  { name: 'Curd / Yogurt', per100: { protein: 4, carbs: 5, fat: 3, calories: 60 }},
  { name: 'Egg (whole)', per100: { protein: 13, carbs: 1, fat: 11, calories: 155 }},
  { name: 'Egg White', per100: { protein: 11, carbs: 0.7, fat: 0.2, calories: 52 }},
  { name: 'Multigrain Roti', per100: { protein: 10, carbs: 50, fat: 5, calories: 290 }},
  { name: 'Peanut Butter', per100: { protein: 25, carbs: 20, fat: 50, calories: 588 }},
  { name: 'Oats', per100: { protein: 13, carbs: 68, fat: 7, calories: 389 }},
  { name: 'Almonds', per100: { protein: 21, carbs: 22, fat: 49, calories: 579 }},
  { name: 'Sweet Potato', per100: { protein: 2, carbs: 20, fat: 0.1, calories: 86 }},
  { name: 'Tofu', per100: { protein: 8, carbs: 2, fat: 5, calories: 76 }},
  { name: 'Fish (Rohu)', per100: { protein: 17, carbs: 0, fat: 2, calories: 97 }},
  { name: 'Soya Chunks', per100: { protein: 52, carbs: 20, fat: 0.5, calories: 340 }},
  { name: 'Cottage Cheese', per100: { protein: 11, carbs: 3, fat: 4, calories: 98 }},
  { name: 'Sprouts (Moong)', per100: { protein: 7, carbs: 6, fat: 0.2, calories: 31 }},
  { name: 'Brown Rice', per100: { protein: 3, carbs: 32, fat: 1, calories: 145 }},
];

// ── Helper to get today's split day ──
export function getTodaySplit(dayIndex = 0) {
  return SPLIT_CYCLE[dayIndex % SPLIT_CYCLE.length];
}

export function getSessionForDay(dayIndex) {
  const split = getTodaySplit(dayIndex);
  return { ...TRAINING_SESSIONS[split], type: split };
}

// ── Two weeks of history ──
export function generateHistory() {
  const history = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayIndex = 13 - i;
    const split = getTodaySplit(dayIndex);
    const adherence = i === 0 ? 0 : Math.round(60 + Math.random() * 35);
    const weight = 78.5 + (dayIndex * 0.08) + (Math.random() * 0.4 - 0.2);
    
    history.push({
      date: date.toISOString().split('T')[0],
      dayOfMonth: date.getDate(),
      dayOfWeek: date.toLocaleDateString('en', { weekday: 'short' }),
      split,
      adherence: i === 0 ? null : adherence,
      macros: i === 0 ? null : {
        calories: Math.round(2400 * adherence / 100),
        protein: Math.round(180 * adherence / 100),
        carbs: Math.round(240 * adherence / 100),
        fat: Math.round(70 * adherence / 100),
      },
      weight: Math.round(weight * 10) / 10,
      waterMl: i === 0 ? 0 : Math.round(2000 + Math.random() * 1500),
      trained: split !== 'rest' && i !== 0,
    });
  }
  return history;
}

// ── Biki state-aware messages ──
export const BIKI_MESSAGES = {
  ON_TRACK: [
    "Solid day so far. Keep the rhythm going.",
    "Macros are sitting right where they should be.",
    "You are doing exactly what we planned. Stay steady.",
  ],
  LAGGING: [
    "Two meals unlogged since Tuesday. Log lunch and you are moving again.",
    "You have been quiet today. One meal logged gets things back on track.",
    "No rush. Just log what you have eaten and we will see where you stand.",
  ],
  REST: [
    "Recovery is part of the plan. Eat well, hydrate, sleep early.",
    "Rest days build the muscle. Do not skip the mobility work.",
    "Good time to get that sleep target. Your body needs it.",
  ],
  DEPLETED: [
    "Start small. Log one meal. That is it.",
    "We are not counting missed days. Log something now and we move forward.",
    "One action. That is all I am asking for today.",
  ],
};

export const BIKI_CHAT_HISTORY = [
  { from: 'biki', text: "How is the push session feeling this week. Any shoulder tightness.", ts: '10:30 AM' },
  { from: 'user', text: "Shoulders feel good actually. Hit 90kg on bench today.", ts: '11:15 AM' },
  { from: 'biki', text: "Good. We will push to 92.5 next week. Keep the form tight at the bottom.", ts: '11:18 AM' },
  { from: 'biki', text: "Your check-in is due this Sunday. Get front and side photos in the same lighting as last week.", ts: '2:00 PM' },
];

// ── Check-in data ──
export const LAST_CHECK_IN = {
  date: '2025-06-01',
  weight: 78.2,
  measurements: {
    chest: 102,
    waist: 82,
    arms: 38,
    thighs: 58,
  },
  feel: {
    energy: 4,
    hunger: 3,
    sleep: 4,
    stress: 2,
  },
  note: 'Feeling stronger this week. Sleep has been better.',
};

// ── Bloodwork markers ──
export const BLOODWORK = [
  { marker: 'Testosterone', value: '620 ng/dL', trend: 'up', normal: true, bikiNote: 'Healthy range. Training load is sustainable.' },
  { marker: 'Vitamin D', value: '38 ng/mL', trend: 'up', normal: true, bikiNote: 'Improved from last panel. Keep the supplement.' },
  { marker: 'HbA1c', value: '5.2%', trend: 'stable', normal: true, bikiNote: 'No concerns here.' },
  { marker: 'TSH', value: '2.1 mIU/L', trend: 'stable', normal: true, bikiNote: 'Thyroid is fine.' },
  { marker: 'Ferritin', value: '45 ng/mL', trend: 'down', normal: true, bikiNote: 'Slightly lower. We might add iron-rich meals.' },
];

// ── Next call / check-in schedule ──
export const NEXT_CALL = {
  date: 'Sunday, Jun 15',
  time: '7:00 PM IST',
};

export const CHECKIN_DUE = {
  date: 'Sunday, Jun 15',
  status: 'pending',
};

// ── Plan day counter ──
export const PLAN_PROGRESS = {
  currentDay: 38,
  totalDays: 84,
};

// ── Check-in history (most recent first) ──
// Dates are absolute to keep the demo stable; the Progress screen
// shows the next check-in only when it falls within 3 days of today.
export const CHECK_IN_HISTORY = [
  {
    id: 'wk-12',
    week: 12,
    label: 'Week 12',
    date: '2026-06-09',
    dateLabel: 'Jun 9',
    reviewedOn: 'Jun 10',
    reviewedAgo: '2 days ago',
    status: 'reviewed',
    submittedAt: 'Jun 9, 10:20 AM',
    thumbnail: PHOTOS.pushHero,
    photos: {
      front: PHOTOS.pushHero,
      side:  PHOTOS.pullHero,
      back:  PHOTOS.legsHero,
    },
    photosBaseline: {
      front: PHOTOS.restHero,
      side:  PHOTOS.sessionComplete,
      back:  PHOTOS.bikiPortrait,
    },
    baselineLabel: 'Week 1',
    baselineDateLabel: 'Mar 24',
    // 12-week deltas (used by Progress overview vs baseline)
    metrics: {
      weight:  { label: 'Weight',              value: 78.4, prev: 82.0, unit: 'kg', goodDir: 'down' },
      protein: { label: 'Protein Adherence',   value: 92,   prev: 72,   unit: '%',  goodDir: 'up'   },
      workout: { label: 'Workout Compliance',  value: 85,   prev: 78,   unit: '%',  goodDir: 'up'   },
      waist:   { label: 'Waist',               value: 86,   prev: 92,   unit: 'cm', goodDir: 'down' },
    },
    // Week-over-week submitted data (used by Detail screen grid)
    submittedData: {
      weight:  { label: 'Weight',             value: 78.4,  unit: 'kg', delta: -0.7,  goodDir: 'down' },
      protein: { label: 'Protein Adherence',  value: 92,    unit: '%',  delta:  10,   goodDir: 'up'   },
      workout: { label: 'Workout Compliance', value: 85,    unit: '%',  delta:  5,    goodDir: 'up'   },
      steps:   { label: 'Steps (Avg)',        value: 10280, unit: '',   delta:  1240, goodDir: 'up'   },
      waist:   { label: 'Waist',              value: 86,    unit: 'cm', delta: -2,    goodDir: 'down' },
      energy:  { label: 'Energy Level',       value: '8/10', noDelta: true },
    },
    // Short summary on the Latest Review hero card
    summary:
      'Excellent adherence this week. Weight is trending exactly as planned. Keep going.',
    // Multi-paragraph coach summary on the Detail screen
    coachSummary:
      "Great consistency this week, Arjun. Weight is dropping at the right pace and protein adherence is on point.\n\nLet's add one refeed meal this week to support performance.",
    // List-row preview metric
    preview: { label: 'Weight', value: '78.4 kg', delta: '0.7 kg', deltaDir: 'down', deltaTone: 'good' },
    planChanges: [
      'Add one refeed meal on Saturday',
      'Increase carbs by 25g on training days',
      'Keep cardio and steps the same',
      'Continue current workout split',
    ],
  },
  {
    id: 'wk-11', week: 11, label: 'Week 11',
    date: '2026-06-02', dateLabel: 'Jun 2', reviewedOn: 'Jun 3', status: 'reviewed',
    thumbnail: PHOTOS.pullHero,
    preview: { label: 'Protein', value: '92%', delta: '10%', deltaDir: 'up', deltaTone: 'good' },
  },
  {
    id: 'wk-10', week: 10, label: 'Week 10',
    date: '2026-05-26', dateLabel: 'May 26', reviewedOn: 'May 27', status: 'reviewed',
    thumbnail: PHOTOS.legsHero,
    preview: { label: 'Waist', value: '86 cm', delta: '2 cm', deltaDir: 'down', deltaTone: 'good' },
  },
  {
    id: 'wk-9', week: 9, label: 'Week 9',
    date: '2026-05-19', dateLabel: 'May 19', reviewedOn: 'May 20', status: 'reviewed',
    thumbnail: PHOTOS.restHero,
    preview: { label: 'Steps', value: '10,280 avg', delta: '1,240', deltaDir: 'up', deltaTone: 'good' },
  },
  {
    id: 'wk-8', week: 8, label: 'Week 8',
    date: '2026-05-12', dateLabel: 'May 12', reviewedOn: 'May 13', status: 'reviewed',
    thumbnail: PHOTOS.sessionComplete,
    preview: { label: 'Weight', value: '79.1 kg', delta: '1.1 kg', deltaDir: 'down', deltaTone: 'good' },
  },
];

// ── Next check-in (used by Progress screen) ──
// Falls within 3 days of seed date 2026-06-13 to demo the reminder card.
export const NEXT_CHECKIN = {
  week: 13,
  date: '2026-06-16',
  dateLabel: 'Jun 16',
};
