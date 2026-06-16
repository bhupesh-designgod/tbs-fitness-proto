// ── Design Tokens — "Gold + vivid data" palette ──
// Black + off-white carry the screen. GOLD (#F6B41C) is for ACTIONS ONLY —
// it never encodes a ring, stat, or data value. Data has its own vivid, solid
// set: crimson (calories), azure (hydration), jade/persimmon/amethyst (P/F/C).
// Every fill is a flat solid — no gradients anywhere in the UI.

export const T = {
  // Base
  bg: '#0B0B0C',
  surface: '#151517',
  surface2: '#1D1D20',
  hairline: 'rgba(255,255,255,0.07)',
  hairlineStrong: 'rgba(244,242,236,0.16)',

  // VOLT — legacy alias → folds into gold (actions only)
  volt: '#F6B41C',
  voltInk: '#241906',
  voltTint: 'rgba(246,180,28,0.12)',
  voltBorder: 'rgba(246,180,28,0.40)',

  // RED — functional alert only. Notifications + genuine regressions.
  red: '#FF3B30',
  redTint: 'rgba(255,59,48,0.12)',

  // COBALT — neutralized. Sleep / rest / metrics read as calm neutral now.
  cobalt: '#8A8A90',
  cobaltTint: 'rgba(255,255,255,0.06)',
  cobaltBorder: 'rgba(244,242,236,0.16)',

  // GOLD — the action accent. Solid flat fill only, near-black ink on top.
  gold: '#F6B41C',
  goldInk: '#241906',                                       // near-black on gold
  goldGradCss: '#F6B41C',       // (solid — gradients removed app-wide)
  goldTint: 'rgba(246,180,28,0.14)',
  goldBorder: 'rgba(246,180,28,0.42)',
  goldStart: '#F6B41C',
  goldEnd: '#F6B41C',
  goldGrad: '#F6B41C',          // flat solid

  // MEAL / calorie family → persimmon (data)
  meal: '#EF6240',
  mealTint: 'rgba(239,98,64,0.14)',

  // Functional
  success: '#F6B41C',           // achievement / confirmation → gold (action result)
  successTint: 'rgba(246,180,28,0.14)',
  successBorder: 'rgba(246,180,28,0.40)',
  positive: '#9CE910',          // good data delta (e.g. weight down) — volt green
  green: '#9CE910',             // live/online status — volt green
  danger: '#FF3B30',

  // ── DATA palette — vivid solids, each on a neutral track. Never gold. ──
  cal: '#EF6240',               // calories → persimmon
  calTint: 'rgba(239,98,64,0.14)',
  water: '#28A9F0',             // hydration → azure
  waterFill: '#28A9F0',
  waterTint: 'rgba(40,169,240,0.14)',
  waterBorder: 'rgba(40,169,240,0.40)',
  macroProtein: '#23A968',      // jade
  macroFat: '#DC2F4E',          // crimson
  macroCarbs: '#A24FC9',        // amethyst

  // Text — warm off-white ink
  text: '#F4F2EC',
  textMid: '#9D9C96',
  textLow: 'rgba(244,242,236,0.45)',
  textSub: 'rgba(244,242,236,0.65)',   // raised subtitle under screen titles
  textFaint: 'rgba(244,242,236,0.26)',

  // Geometry — one radius
  rCard: 12,
  rInner: 12,
  rPill: 999,
  stroke: 1.75,

  // Motion
  spring: { type: 'spring', stiffness: 420, damping: 28 },
  springSoft: { type: 'spring', stiffness: 260, damping: 26 },
  easeOut: [0.16, 1, 0.3, 1],
  tap: { scale: 0.97 },
  tapSmall: { scale: 0.92 },
};

// Entrance presets — snappy, never lazy
export const enter = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.22, ease: T.easeOut },
});

export const stagger = (i, base = 0) => enter(base + i * 0.04);
