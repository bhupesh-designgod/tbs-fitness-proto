// ── Progress Screen ──
import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Upload, ChevronRight } from 'lucide-react';
import { CalendarCell, PillChip, NumericCounter } from '../components/ui/Components';
import { useApp } from '../context/AppContext';
import { BLOODWORK, LAST_CHECK_IN } from '../data/mockData';

export default function Progress() {
  const { history } = useApp();
  const shouldReduce = useReducedMotion();
  const [selectedDay, setSelectedDay] = useState('today');

  // Build calendar grid (current month)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

  const calendarDays = useMemo(() => {
    const days = [];
    // Empty cells for alignment
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, adherence: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const histDay = history.find(h => h.date === dateStr);
      days.push({
        day: d,
        adherence: histDay?.adherence ?? null,
        isToday: d === today.getDate(),
      });
    }
    return days;
  }, [history, year, month, daysInMonth, firstDayOfWeek]);

  // Weight sparkline data
  const weights = history.map(h => h.weight);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const sparklineWidth = 360;
  const sparklineHeight = 60;

  const sparklinePath = useMemo(() => {
    if (weights.length < 2) return '';
    const points = weights.map((w, i) => {
      const x = (i / (weights.length - 1)) * sparklineWidth;
      const y = sparklineHeight - ((w - minW) / (maxW - minW)) * sparklineHeight;
      return `${x},${y}`;
    });
    return `M${points.join(' L')}`;
  }, [weights, minW, maxW]);

  const trendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp size={14} strokeWidth={1.5} className="text-white/50" />;
    if (trend === 'down') return <TrendingDown size={14} strokeWidth={1.5} className="text-white/50" />;
    return <Minus size={14} strokeWidth={1.5} className="text-white/25" />;
  };

  return (
    <div className="px-5 pb-24">
      {/* Title */}
      <motion.h1
        className="font-display text-[28px] font-extrabold text-white pt-2 pb-4"
        initial={shouldReduce ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Progress
      </motion.h1>

      {/* Month calendar */}
      <motion.div
        initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <p className="font-display text-[15px] font-bold text-white/70 mb-3">
          {today.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
        </p>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center font-body text-[10px] text-white/25 py-1">{d}</div>
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((cd, i) => (
            cd.day ? (
              <CalendarCell
                key={i}
                day={cd.day}
                isToday={cd.isToday}
                adherence={cd.adherence}
                delay={i}
              />
            ) : (
              <div key={i} />
            )
          ))}
        </div>
      </motion.div>

      {/* Quick-jump chips */}
      <div className="flex gap-2 mb-6">
        <PillChip active={selectedDay === 'today'} onClick={() => setSelectedDay('today')}>Today</PillChip>
        <PillChip active={selectedDay === 'yesterday'} onClick={() => setSelectedDay('yesterday')}>Yesterday</PillChip>
      </div>

      <div className="metallic-divider mb-6" />

      {/* Weight sparkline */}
      <motion.div
        initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex justify-between items-baseline mb-3">
          <p className="font-body text-[11px] text-white/40 uppercase tracking-wider">Weight</p>
          <div className="flex items-baseline gap-1">
            <NumericCounter value={weights[weights.length - 1] * 10} className="text-[22px] font-bold text-white" duration={0.6} />
            <span className="font-body text-[12px] text-white/30">kg</span>
          </div>
        </div>
        <div className="w-full overflow-hidden" style={{ height: sparklineHeight + 10 }}>
          <svg width="100%" viewBox={`0 0 ${sparklineWidth} ${sparklineHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#B8893C" />
                <stop offset="100%" stopColor="#E0C074" />
              </linearGradient>
            </defs>
            <motion.path
              d={sparklinePath}
              fill="none"
              stroke="url(#sparkGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={shouldReduce ? {} : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
        </div>
        <div className="flex justify-between font-body text-[10px] text-white/20 mt-1">
          <span>2 weeks ago</span>
          <span>Today</span>
        </div>
      </motion.div>

      <div className="metallic-divider mb-6" />

      {/* Check-in photo timeline */}
      <motion.div
        initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <p className="font-body text-[11px] text-white/40 uppercase tracking-wider mb-3">Check-in photos</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {['Week 5', 'Week 4', 'Week 3'].map((week, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[100px] aspect-[3/4] rounded-xl flex items-center justify-center"
              style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="font-body text-[11px] text-white/20">{week}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="metallic-divider mb-6" />

      {/* Bloodwork section */}
      <motion.div
        initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-4">
          <p className="font-body text-[11px] text-white/40 uppercase tracking-wider">Bloodwork</p>
          <label className="cursor-pointer">
            <input type="file" className="hidden" />
            <span className="flex items-center gap-1 font-body text-[12px] text-white/30">
              <Upload size={12} strokeWidth={1.5} /> Upload
            </span>
          </label>
        </div>

        <div className="space-y-2">
          {BLOODWORK.map((marker, i) => (
            <motion.div
              key={marker.marker}
              initial={shouldReduce ? {} : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="rounded-xl p-3.5"
              style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-body text-[14px] text-white/80">{marker.marker}</span>
                <div className="flex items-center gap-2">
                  <span className="font-display tabular-nums text-[14px] font-bold text-white">{marker.value}</span>
                  {trendIcon(marker.trend)}
                </div>
              </div>
              <p className="font-body text-[12px] text-white/35 leading-relaxed">{marker.bikiNote}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
