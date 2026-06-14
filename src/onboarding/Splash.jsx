// ── Splash ──
// Logo enters (fade + rise + scale, 600ms), 200ms hold, a one-time gold
// shimmer sweep across the lettering, then crossfade out. Hard-capped at 1.8s.

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { T } from '../tokens';
import TbsLogo from './TbsLogo';

export default function Splash({ onDone }) {
  const shouldReduce = useReducedMotion();
  const [shimmer, setShimmer] = useState(false);

  useEffect(() => {
    // Start shimmer after the enter (600ms) + 200ms hold.
    const s = setTimeout(() => setShimmer(true), shouldReduce ? 0 : 800);
    // Hard cap — never block past 1.8s.
    const done = setTimeout(onDone, shouldReduce ? 400 : 1800);
    return () => { clearTimeout(s); clearTimeout(done); };
  }, [onDone, shouldReduce]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: '#000' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="relative overflow-hidden"
        initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <TbsLogo width={240} />

        {/* Gold shimmer sweep — one-time diagonal streak across the lettering */}
        {shimmer && !shouldReduce && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: '-130%' }}
            animate={{ x: '130%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              background:
                'linear-gradient(105deg, transparent 35%, rgba(255,240,200,0.55) 50%, transparent 65%)',
              mixBlendMode: 'screen',
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
