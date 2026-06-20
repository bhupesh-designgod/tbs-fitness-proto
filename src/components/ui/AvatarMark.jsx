// ── AvatarMark — the one Biki mark used across every coach surface ──
// Gold ring on black, portrait asset inside (falls back to initial).
// Optional pulse glow, online status dot, and a small corner badge.

import { useState } from 'react';
import { PHOTOS } from '../../data/mockData';
import { T } from '../../tokens';

export default function AvatarMark({
  size = 56,
  ring = true,
  pulse = false,
  status = false,
  badge = null,
  className = '',
}) {
  const [err, setErr] = useState(false);
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      {pulse && (
        <div
          className="absolute -inset-1 rounded-full"
          style={{
            background: `radial-gradient(circle, ${T.goldTint} 0%, transparent 70%)`,
            animation: 'pulse-glow 2.5s ease-in-out infinite',
          }}
        />
      )}
      <div
        className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center"
        style={{
          border: ring ? `2.5px solid ${T.gold}` : 'none',
          boxShadow: ring ? '0 4px 20px rgba(246,180,28,0.25)' : 'none',
          background: T.surface2,
        }}
      >
        {err ? (
          <span className="font-display text-[18px]" style={{ color: T.gold }}>B</span>
        ) : (
          <img
            src={PHOTOS.bikiPortrait}
            alt="Coach Biki"
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(30%) contrast(1.1)' }}
            onError={() => setErr(true)}
          />
        )}
      </div>
      {status && (
        <div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full"
          style={{ background: T.green, border: `2.5px solid ${T.bg}` }}
        />
      )}
      {badge && (
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: T.gold }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}
