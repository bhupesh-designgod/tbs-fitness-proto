// ── Design Tokens — "Track Jersey" palette ──
// Black + off-white carry 85% of every screen. Volt is the engine (10%).
// Red / cobalt / gold split the last 5%. Flat fills only — no gradients.

export const T = {
  // Base
  bg: '#0B0B0C',
  surface: '#151517',
  surface2: '#1D1D20',
  hairline: 'rgba(244,242,236,0.08)',
  hairlineStrong: 'rgba(244,242,236,0.16)',

  // VOLT — the hero. Active states, live progress, primary CTAs.
  // Always flat, always full saturation, black text on top.
  volt: '#D7FF3E',
  voltInk: '#0B0B0C',
  voltTint: 'rgba(215,255,62,0.10)',
  voltBorder: 'rgba(215,255,62,0.35)',

  // RED — heat. PRs, max effort, alerts. Small and sharp only.
  red: '#FF3B30',
  redTint: 'rgba(255,59,48,0.12)',

  // COBALT — recovery, hydration, rest. Small doses.
  cobalt: '#2B4BFF',
  cobaltTint: 'rgba(43,75,255,0.14)',
  cobaltBorder: 'rgba(43,75,255,0.40)',

  // GOLD — the action color. Primary CTAs, brand moments, achievements.
  gold: '#D4A848',
  goldTint: 'rgba(212,168,72,0.12)',
  goldBorder: 'rgba(212,168,72,0.40)',
  goldStart: '#D4A848',
  goldEnd: '#D4A848',
  goldGrad: '#D4A848',

  // ORANGE — meal adherence rings only
  meal: '#FF7A00',
  mealTint: 'rgba(255,122,0,0.14)',

  // Functional — data only
  success: '#D7FF3E',           // "done" is volt — the app lights up
  successTint: 'rgba(215,255,62,0.12)',
  successBorder: 'rgba(215,255,62,0.35)',
  danger: '#FF3B30',
  water: '#2B4BFF',
  waterTint: 'rgba(43,75,255,0.14)',
  waterBorder: 'rgba(43,75,255,0.40)',
  macroFat: '#9D9C96',
  macroCarbs: '#2B4BFF',

  // Text — warm off-white ink
  text: '#F4F2EC',
  textMid: '#9D9C96',
  textLow: 'rgba(244,242,236,0.45)',
  textFaint: 'rgba(244,242,236,0.26)',

  // Geometry
  rCard: 20,
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
