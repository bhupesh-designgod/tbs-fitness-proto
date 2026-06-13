// ── Design Tokens ──
// Single source of truth for every color, radius, spring, and stroke
// used in JS (framer-motion props, SVG attrs, inline styles).
// CSS-side equivalents live in index.css. Never hardcode these per-file.

export const T = {
  // Surfaces
  bg: '#000000',
  surface: '#101014',          // card background
  surface2: '#17171C',         // raised / inner elements
  hairline: 'rgba(255,255,255,0.08)',
  hairlineStrong: 'rgba(255,255,255,0.16)',

  // Accent — gold. Use ONLY for: hero numbers, primary CTAs,
  // active states, progress fills. Nothing passive.
  gold: '#D4A74E',
  goldStart: '#B8893C',
  goldEnd: '#E0C074',
  goldGrad: 'linear-gradient(135deg, #B8893C, #E0C074)',
  goldTint: 'rgba(212,167,78,0.10)',
  goldBorder: 'rgba(212,167,78,0.30)',

  // Functional colors — data only, never decoration
  success: '#4ADE80',
  successTint: 'rgba(74,222,128,0.12)',
  successBorder: 'rgba(74,222,128,0.30)',
  danger: '#F87171',
  water: '#7BA7C9',
  waterTint: 'rgba(123,167,201,0.14)',
  waterBorder: 'rgba(123,167,201,0.35)',

  // Text — AA-checked on #000/#101014
  text: '#FFFFFF',
  textMid: 'rgba(255,255,255,0.66)',
  textLow: 'rgba(255,255,255,0.45)',
  textFaint: 'rgba(255,255,255,0.28)',

  // Geometry
  rCard: 20,
  rInner: 12,
  rPill: 999,
  stroke: 1.75, // icon stroke width — everywhere

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
