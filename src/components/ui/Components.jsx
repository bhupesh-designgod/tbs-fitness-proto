// ── Shared UI Components ──
// All reusable components for TBS in one file to keep imports clean

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { T } from '../../tokens';

// ── Split CTA ──
export function SplitCTA({ leftLabel, rightLabel, onLeft, onRight }) {
  return (
    <div className="flex gap-3 w-full">
      <motion.button
        whileTap={T.tap}
        onClick={onLeft}
        className="btn-secondary flex-1"
      >
        {leftLabel}
      </motion.button>
      <motion.button
        whileTap={T.tap}
        onClick={onRight}
        className="btn-primary flex-1"
        style={{ width: 'auto' }}
      >
        {rightLabel}
      </motion.button>
    </div>
  );
}

// ── Macro Bar ──
export function MacroBar({ label, current, target, color, size = 'normal' }) {
  const shouldReduce = useReducedMotion();
  const pct = Math.min((current / target) * 100, 100);
  const left = Math.max(target - current, 0);
  const over = current > target ? current - target : 0;

  const colorMap = {
    protein: T.macroProtein,
    fat: T.macroFat,
    carbs: T.macroCarbs,
    calories: T.cal,
    water: T.water,
    white: '#F4F2EC',
  };

  const isSmall = size === 'small';

  return (
    <div className={isSmall ? 'flex-1 min-w-0' : 'w-full'}>
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-body text-[11px] text-white/50 uppercase tracking-wider">{label}</span>
        <span className="font-body tabular-nums text-[12px] font-bold" style={{ color: over > 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)' }}>
          {over > 0 ? `+${over}g over` : `${left}${label === 'Calories' ? '' : 'g'} left`}
        </span>
      </div>
      <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: colorMap[color] || color }}
          initial={shouldReduce ? { width: `${pct}%` } : { width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

// ── Numeric Counter (animated count-up) ──
export function NumericCounter({ value, suffix = '', className = '', duration = 0.8 }) {
  const shouldReduce = useReducedMotion();
  const [display, setDisplay] = useState(shouldReduce ? value : 0);
  const prevRef = useRef(0);

  useEffect(() => {
    if (shouldReduce) {
      setDisplay(value);
      return;
    }
    const start = prevRef.current;
    const end = value;
    prevRef.current = value;
    const diff = end - start;
    if (diff === 0) return;

    const startTime = performance.now();
    const dur = duration * 1000;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / dur, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration, shouldReduce]);

  return (
    <span className={`font-display tabular-nums ${className}`}>
      {display}{suffix}
    </span>
  );
}

// ── Ring Counter (SVG concentric ring) ──
export function RingCounter({ percentage, size = 120, strokeWidth = 5, color = T.text, delay = 0, children }) {
  const shouldReduce = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Animated arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={shouldReduce ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            delay,
            duration: 1,
            type: 'spring',
            stiffness: 60,
            damping: 15,
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Bottom Sheet ──
export function BottomSheet({ isOpen, onClose, children }) {
  const shouldReduce = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto"
            style={{ maxWidth: 430 }}
            initial={shouldReduce ? { opacity: 0 } : { y: '100%' }}
            animate={shouldReduce ? { opacity: 1 } : { y: 0 }}
            exit={shouldReduce ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
          >
            <div className="rounded-t-2xl overflow-hidden" style={{ background: T.surface }}>
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
              </div>
              <div className="px-5 pb-8 max-h-[80vh] overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Hero Photo with Scrim ──
export function HeroPhoto({ src, children, height = 280, heavy = false }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <img
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'grayscale(100%) contrast(1.1) brightness(0.7)' }}
        loading="eager"
      />
      <div className={`absolute inset-0 ${heavy ? 'scrim-heavy' : 'scrim'}`} />
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        {children}
      </div>
    </div>
  );
}

// ── Gold Marquee ──
export function GoldMarquee({ text }) {
  const shouldReduce = useReducedMotion();
  const content = `${text} \u00A0\u00A0\u00A0 ${text} \u00A0\u00A0\u00A0 ${text} \u00A0\u00A0\u00A0 ${text} \u00A0\u00A0\u00A0 `;

  return (
    <div className="w-full overflow-hidden py-4">
      <div className="metallic-divider mb-4" />
      <div className="overflow-hidden">
        <motion.div
          className="whitespace-nowrap text-gold-gradient font-display text-[18px] uppercase tracking-[0.2em]"
          animate={shouldReduce ? {} : { x: [0, '-50%'] }}
          transition={{
            x: { duration: 12, repeat: Infinity, ease: 'linear' },
          }}
        >
          {content}
        </motion.div>
      </div>
      <div className="metallic-divider mt-4" />
    </div>
  );
}

// ── Big Numeral Stepper ──
export function BigNumStepper({ value, onChange, unit = '', min = 0, max = 999, step = 1 }) {
  return (
    <div className="flex items-center gap-4">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-10 h-10 rounded-xl flex items-center justify-center border"
        style={{ borderColor: 'rgba(255,255,255,0.15)' }}
      >
        <span className="text-white/60 text-lg">−</span>
      </motion.button>
      <div className="flex items-baseline gap-1">
        <NumericCounter value={value} className="text-[36px] text-[#F4F2EC]" />
        {unit && <span className="font-body text-[14px] text-white/40">{unit}</span>}
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-10 h-10 rounded-xl flex items-center justify-center border"
        style={{ borderColor: 'rgba(255,255,255,0.15)' }}
      >
        <span className="text-white/60 text-lg">+</span>
      </motion.button>
    </div>
  );
}

// ── Five-Point Selector ──
export function FivePointSelector({ value, onChange, labels = ['1', '2', '3', '4', '5'] }) {
  return (
    <div className="flex gap-2">
      {labels.map((label, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(i + 1)}
          className="flex-1 py-2.5 rounded-xl text-center font-body text-[13px] font-bold transition-all"
          style={{
            background: value === i + 1 ? T.goldGradCss : T.surface,
            color: value === i + 1 ? T.goldInk : 'rgba(255,255,255,0.5)',
            border: `1px solid ${value === i + 1 ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
          }}
        >
          {label}
        </motion.button>
      ))}
    </div>
  );
}

// ── Tab Bar ──
export function TabBar({ activeTab, onTabChange, tabs }) {
  const shouldReduce = useReducedMotion();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 mx-auto" style={{ maxWidth: 430 }}>
      <div
        className="flex items-center justify-around px-2 pt-2 pb-6"
        style={{
          background: 'linear-gradient(to top, #000 60%, transparent)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 px-3 pt-2 pb-1"
              whileTap={{ scale: 0.95 }}
            >
              {/* Active indicator line */}
              {isActive && (
                <motion.div
                  layoutId={shouldReduce ? undefined : 'tab-indicator'}
                  className="absolute -top-0 left-2 right-2 h-[2px] rounded-full bg-gold-gradient"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div style={{ color: isActive ? T.gold : 'rgba(244,242,236,0.38)' }}>
                {tab.icon}
              </div>
              <span
                className="font-body text-[10px] font-bold transition-colors"
                style={{ color: isActive ? T.gold : 'rgba(244,242,236,0.38)' }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
