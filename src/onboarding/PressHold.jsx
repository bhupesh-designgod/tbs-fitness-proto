// ── Press-and-hold to commit ──
// 1200ms hold. Gold ring draws 0→360 (rAF, frame-accurate so release can
// interrupt cleanly), button scales 1→1.04, soft gold glow expands with
// progress, haptic ticks at 33/66%, success haptic + gold flash at 100%.
// Release early → ring retracts over 200ms.

import { useRef, useState, useEffect, useCallback } from 'react';
import { T } from '../tokens';

const HOLD_MS = 1200;
const RETRACT_MS = 200;
const RADIUS = 16; // matches rounded-xl-ish corners

function buzz(pattern) { try { navigator.vibrate?.(pattern); } catch { /* unsupported */ } }

export default function PressHold({ label, onComplete }) {
  const [progress, setProgress] = useState(0); // 0..1 (drives ring/scale/glow)
  const [flash, setFlash] = useState(false);
  const [committed, setCommitted] = useState(false);

  const holding = useRef(false);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const progRef = useRef(0);
  const ticks = useRef({ a: false, b: false });

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const setP = (p) => { progRef.current = p; setProgress(p); };

  const complete = useCallback(() => {
    holding.current = false;
    cancelAnimationFrame(rafRef.current);
    setP(1);
    setCommitted(true);
    buzz([30, 45, 90]); // success
    setFlash(true);
    setTimeout(() => { setFlash(false); onComplete(); }, 80);
  }, [onComplete]);

  const holdFrame = useCallback((now) => {
    if (!holding.current) return;
    const p = Math.min((now - startRef.current) / HOLD_MS, 1);
    setP(p);
    if (!ticks.current.a && p >= 0.33) { ticks.current.a = true; buzz(8); }
    if (!ticks.current.b && p >= 0.66) { ticks.current.b = true; buzz(8); }
    if (p >= 1) { complete(); return; }
    rafRef.current = requestAnimationFrame(holdFrame);
  }, [complete]);

  const retractFrame = useCallback((from, startTs) => (now) => {
    const t = Math.min((now - startTs) / RETRACT_MS, 1);
    const p = from * (1 - t);
    setP(p);
    if (t < 1 && !holding.current) rafRef.current = requestAnimationFrame(retractFrame(from, startTs));
  }, []);

  const start = useCallback(() => {
    if (committed) return;
    holding.current = true;
    ticks.current = { a: false, b: false };
    startRef.current = performance.now();
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(holdFrame);
  }, [committed, holdFrame]);

  const release = useCallback(() => {
    if (!holding.current || committed) return;
    holding.current = false;
    cancelAnimationFrame(rafRef.current);
    buzz(5); // soft
    const from = progRef.current;
    const startTs = performance.now();
    rafRef.current = requestAnimationFrame(retractFrame(from, startTs));
  }, [committed, retractFrame]);

  const scale = 1 + 0.04 * progress;
  const glow = progress > 0
    ? `0 0 ${20 * progress}px ${6 * progress}px rgba(226, 194, 119,${0.28 * progress})`
    : 'none';

  return (
    <button
      onPointerDown={start}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      aria-label={label}
      className="relative w-full select-none"
      style={{ height: 60, touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
    >
      <div
        className="absolute inset-0 rounded-xl flex items-center justify-center"
        style={{
          background: flash ? '#F4E2A8' : T.gold,
          transform: `scale(${scale})`,
          boxShadow: glow,
          transition: holding.current ? 'none' : 'transform 80ms ease-out',
        }}
      >
        <span
          className="font-display text-[20px] uppercase tracking-[0.06em]"
          style={{ color: T.bg }}
        >
          {label}
        </span>
      </div>

      {/* Progress ring around the perimeter */}
      <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" style={{ transform: `scale(${scale})` }}>
        <rect
          x="1.5" y="1.5" width="calc(100% - 3px)" height="calc(100% - 3px)"
          rx={RADIUS} ry={RADIUS}
          fill="none"
          stroke={T.gold}
          strokeWidth="3"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - progress}
          style={{ opacity: progress > 0.001 ? 1 : 0 }}
          transform="rotate(-90)"
          transformOrigin="center"
        />
      </svg>
    </button>
  );
}
