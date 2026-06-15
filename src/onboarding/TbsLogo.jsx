// ── TBS Logo (inline) ──
// Inlined so the lettering uses the page-loaded Bebas Neue and the gold
// gradient renders crisply. Mirrors public/assets/brand/tbs-logo.svg.
// NOTE: placeholder mark — swap for the official asset when delivered.

export default function TbsLogo({ width = 240, className = '', style }) {
  const h = width * (180 / 340);
  return (
    <svg
      width={width}
      height={h}
      viewBox="0 0 340 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="TBS — Train by Biki Singh"
    >
      <defs>
        <linearGradient id="tbsGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F6B41C" />
          <stop offset="48%" stopColor="#F6B41C" />
          <stop offset="100%" stopColor="#F6B41C" />
        </linearGradient>
      </defs>

      <text
        x="170" y="104" textAnchor="middle"
        fontFamily="'Bebas Neue', sans-serif"
        fontSize="112" letterSpacing="6" fill="url(#tbsGold)"
      >
        TBS
      </text>

      {/* Barbell ligature */}
      <g fill="url(#tbsGold)">
        <rect x="40" y="72" width="260" height="6" rx="3" />
        <rect x="44" y="58" width="9" height="34" rx="2" />
        <rect x="56" y="64" width="7" height="22" rx="2" />
        <rect x="287" y="58" width="9" height="34" rx="2" />
        <rect x="277" y="64" width="7" height="22" rx="2" />
      </g>

      <text
        x="170" y="150" textAnchor="middle"
        fontFamily="'Manrope', sans-serif"
        fontSize="14" fontWeight="700" letterSpacing="5" fill="#9D9C96"
      >
        TRAIN BY BIKI SINGH
      </text>
    </svg>
  );
}
