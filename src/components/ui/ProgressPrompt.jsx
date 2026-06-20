// ── ProgressPrompt — the coach in the Progress space ──
// Two jobs: prompt for the next transformation photo on cadence, and announce
// a new health report with one line on what changed, then hand off to the full
// report view.
//
// This layer only prompts and frames. It does NOT capture or store images —
// it hands off to the existing media flow.
// TODO(backend): transformation images need explicit user consent and secure
// storage. Confirm the capture + storage flow before wiring real uploads.

import { motion } from 'framer-motion';
import { Camera, ChevronRight, FileText } from 'lucide-react';
import AvatarMark from './AvatarMark';
import { T } from '../../tokens';
import { HEALTH_REPORT } from '../../data/mockData';

export default function ProgressPrompt({ onAddPhoto, onViewReport, photoDue = true, reportNew = true }) {
  if (!photoDue && !reportNew) return null;

  return (
    <div className="px-5 mb-5 space-y-3">
      {reportNew && (
        <motion.div
          className="rounded-xl p-4"
          style={{ background: T.surface, border: `1px solid ${T.goldBorder}` }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <div className="flex items-center gap-3 mb-2.5">
            <AvatarMark size={38} ring />
            <div className="min-w-0">
              <p className="kicker kicker-gold">New from Biki</p>
              <p className="font-body text-[14px] font-bold leading-tight" style={{ color: T.text }}>
                {HEALTH_REPORT.title} is in
              </p>
            </div>
          </div>
          <p className="font-body text-[13px] leading-snug mb-3" style={{ color: T.textLow }}>
            {HEALTH_REPORT.change}
          </p>
          <motion.button whileTap={T.tap} onClick={onViewReport} className="btn-secondary w-full">
            <FileText size={14} strokeWidth={T.stroke} /> View full report
          </motion.button>
        </motion.div>
      )}

      {photoDue && (
        <motion.div
          className="rounded-xl p-4 flex items-center gap-3.5"
          style={{ background: T.surface, border: `1px solid ${T.hairline}` }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: T.surface2, border: `1px solid ${T.hairline}` }}
          >
            <Camera size={20} strokeWidth={T.stroke} style={{ color: T.gold }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-[14px] font-bold leading-tight" style={{ color: T.text }}>This week's photo</p>
            <p className="font-body text-[12px] mt-0.5" style={{ color: T.textLow }}>Same light, same angle. Takes ten seconds.</p>
          </div>
          <motion.button
            whileTap={T.tapSmall}
            onClick={onAddPhoto}
            aria-label="Add this week's photo"
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: T.goldGradCss }}
          >
            <ChevronRight size={16} strokeWidth={2.5} style={{ color: T.goldInk }} />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
