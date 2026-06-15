// ── Design Tokens — "Champagne" palette ──
// Black + off-white carry the screen. ONE saturated brand accent — champagne
// gold (CTAs, achievements, brand). Steel-blue is reserved for hydration only.
// Red survives only as a small functional alert. Everything else is neutral.

export const T = {
  // Base
  bg: '#0B0B0C',
  surface: '#151517',
  surface2: '#1D1D20',
  hairline: 'rgba(255,255,255,0.07)',
  hairlineStrong: 'rgba(244,242,236,0.16)',

  // GOLD — the single brand accent. Active states, progress, achievements.
  // Primary CTAs use the gradient (goldGradCss); accents/rings/text use flat.
  volt: '#E2C277',              // legacy alias → folds into gold
  voltInk: '#0A0A0A',
  voltTint: 'rgba(226,194,119,0.12)',
  voltBorder: 'rgba(226,194,119,0.40)',

  // RED — functional alert only. Notifications + genuine regressions.
  red: '#FF3B30',
  redTint: 'rgba(255,59,48,0.12)',

  // COBALT — neutralized. Sleep / rest / metrics read as calm neutral now.
  cobalt: '#8A8A90',
  cobaltTint: 'rgba(255,255,255,0.06)',
  cobaltBorder: 'rgba(244,242,236,0.16)',

  // GOLD — champagne. Flat for accents, gradient for primary fills.
  gold: '#E2C277',
  goldInk: '#0A0A0A',                                       // near-black on gold
  goldGradCss: 'linear-gradient(135deg, #E0C074 0%, #C8A24E 100%)',
  goldTint: 'rgba(226,194,119,0.12)',
  goldBorder: 'rgba(226,194,119,0.42)',
  goldStart: '#E0C074',
  goldEnd: '#C8A24E',
  goldGrad: '#E2C277',          // flat fallback (solid fills)

  // MEAL — folds into gold (no more orange)
  meal: '#E2C277',
  mealTint: 'rgba(226,194,119,0.12)',

  // Functional — data only
  success: '#E2C277',           // achievement / "done" → gold
  successTint: 'rgba(226,194,119,0.12)',
  successBorder: 'rgba(226,194,119,0.40)',
  danger: '#FF3B30',
  water: '#9FB3C8',             // steel-blue — hydration ONLY
  waterFill: '#8FA9C4',         // steel-blue with more presence (bars/fills)
  waterTint: 'rgba(159,179,200,0.14)',
  waterBorder: 'rgba(159,179,200,0.40)',
  // Macro set — three neutral tints, read as one family (label is the signal)
  macroProtein: '#E8E2D4',
  macroFat: '#B8B0A0',
  macroCarbs: '#8C8579',

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
