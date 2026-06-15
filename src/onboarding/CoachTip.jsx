// ── CoachTip ──
// Lightweight contextual coachmark. Spotlights one element (dim + blur the
// rest), anchors a small Coach Biki bubble nearby with one short line and a
// single CTA. Continuously re-measures so the spotlight tracks elements that
// animate in (e.g. the meal sheet rising). Pass targetSelector=null for a
// centered, no-spotlight reassurance tip.

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { T } from '../tokens';
import { PHOTOS } from '../data/mockData';

const PAD = 8;        // spotlight padding around target
const RADIUS = 16;    // spotlight corner radius
const BUBBLE_W = 300;

export default function CoachTip({ stepKey, targetSelector, message, cta, onCta, onSkip }) {
  const [rect, setRect] = useState(null);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const raf = useRef(0);

  // Continuously track the target while this step is active.
  useEffect(() => {
    setRect(targetSelector ? null : undefined); // undefined = intentionally no target
    let active = true;
    const loop = () => {
      if (!active) return;
      if (targetSelector) {
        const el = document.querySelector(targetSelector);
        if (el) {
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }
      }
      setVp({ w: window.innerWidth, h: window.innerHeight });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { active = false; cancelAnimationFrame(raf.current); };
  }, [stepKey, targetSelector]);

  const hole = rect && {
    x: Math.max(0, rect.left - PAD),
    y: Math.max(0, rect.top - PAD),
    w: rect.width + PAD * 2,
    h: rect.height + PAD * 2,
  };

  // Four dim+blur panels AROUND the target — leaves the target itself fully
  // uncovered (crisp). Reliable where backdrop-filter ignores CSS masks.
  const dim = { background: 'rgba(11,11,12,0.6)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' };
  const panels = hole
    ? [
        { left: 0, top: 0, width: vp.w, height: hole.y },                                   // above
        { left: 0, top: hole.y + hole.h, width: vp.w, height: Math.max(0, vp.h - hole.y - hole.h) }, // below
        { left: 0, top: hole.y, width: hole.x, height: hole.h },                            // left
        { left: hole.x + hole.w, top: hole.y, width: Math.max(0, vp.w - hole.x - hole.w), height: hole.h }, // right
      ]
    : [{ left: 0, top: 0, width: vp.w, height: vp.h }];

  // Bubble placement: below the target if it sits high, else above. Centered when no target.
  let bubbleStyle;
  if (hole) {
    const below = hole.y + hole.h / 2 < vp.h * 0.48;
    bubbleStyle = below
      ? { top: Math.min(hole.y + hole.h + 14, vp.h - 220) }
      : { bottom: Math.min(vp.h - hole.y + 14, vp.h - 120) };
  } else {
    bubbleStyle = { top: '50%', transform: 'translate(-50%,-50%)' };
  }

  return createPortal((
    <div className="fixed inset-0 z-[70]" style={{ pointerEvents: 'auto' }}>
      {/* Dim + blur panels around the target (target stays crisp) */}
      {panels.map((p, idx) => (
        <div key={idx} className="absolute" style={{ ...dim, left: p.left, top: p.top, width: p.width, height: p.height }} />
      ))}

      {/* Gold ring around the spotlight */}
      {hole && (
        <div
          className="absolute rounded-xl pointer-events-none"
          style={{
            top: hole.y, left: hole.x, width: hole.w, height: hole.h,
            border: `2px solid ${T.gold}`,
            boxShadow: `0 0 0 1px rgba(11,11,12,0.6), 0 0 22px 2px rgba(226, 194, 119,0.25)`,
          }}
        />
      )}

      {/* Coach bubble — keyed so each step re-animates in sync with the spotlight */}
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: T.easeOut }}
          className="absolute left-1/2 -translate-x-1/2"
          style={{ width: '88%', maxWidth: BUBBLE_W, ...bubbleStyle }}
        >
          <div className="flex items-start gap-2.5">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 mt-0.5" style={{ border: `1.5px solid ${T.goldBorder}` }}>
              <img src={PHOTOS.bikiPortrait} alt="Biki" className="w-full h-full object-cover" style={{ filter: 'grayscale(15%) contrast(1.05)' }} />
            </div>

            {/* Speech card */}
            <div className="flex-1 min-w-0 rounded-xl rounded-tl-sm p-3.5"
              style={{ background: T.surface, border: `1px solid ${T.hairlineStrong}`, boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }}>
              <p className="font-body text-[10px] font-extrabold uppercase tracking-wider mb-1.5" style={{ color: T.gold }}>Coach Biki</p>
              <p className="font-body text-[14px] leading-snug" style={{ color: T.text }}>{message}</p>

              <div className="flex items-center justify-between mt-3">
                <button onClick={onSkip} className="font-body text-[12px] font-medium" style={{ color: T.textLow }}>
                  Skip
                </button>
                <motion.button
                  whileTap={T.tap}
                  onClick={onCta}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full font-display text-[14px] uppercase tracking-wider"
                  style={{ background: T.gold, color: T.bg }}
                >
                  {cta}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
    </div>
  ), document.body);
}
