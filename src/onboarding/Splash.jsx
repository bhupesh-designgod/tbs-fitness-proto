// ── Splash ──
// Logo fades in out of the dark (opacity + slight scale, 900ms), holds,
// then crossfades out. Hard-capped at 1.8s.

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import TbsLogo from './TbsLogo';

export default function Splash({ onDone }) {
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    // Hard cap — never block past 1.8s.
    const done = setTimeout(onDone, shouldReduce ? 400 : 1800);
    return () => clearTimeout(done);
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
        initial={shouldReduce ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <TbsLogo width={240} />
      </motion.div>
    </motion.div>
  );
}
