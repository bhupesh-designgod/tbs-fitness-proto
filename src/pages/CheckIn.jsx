// ── Check-In Screen ──
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Camera, ChevronRight } from 'lucide-react';
import { BigNumStepper, FivePointSelector } from '../components/ui/Components';
import { LAST_CHECK_IN } from '../data/mockData';
import { T } from '../tokens';

const STEPS = ['Photos', 'Measurements', 'How you feel'];

export default function CheckIn({ onDone }) {
  const shouldReduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [measurements, setMeasurements] = useState({ ...LAST_CHECK_IN.measurements });
  const [weight, setWeight] = useState(LAST_CHECK_IN.weight * 10); // stored as 10x for decimal
  const [feel, setFeel] = useState({ energy: 0, hunger: 0, sleep: 0, stress: 0 });
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  const next = () => {
    if (step < 2) setStep(step + 1);
    else {
      setDone(true);
      setTimeout(() => onDone?.(), 3000);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center mb-4">
          <ChevronRight size={20} strokeWidth={T.stroke} className="text-black" />
        </div>
        <p className="display-md text-white">SENT TO BIKI</p>
        <p className="font-body text-[14px] font-medium text-white/50 mt-3 max-w-[260px]">
          He reviews check-ins Sunday evening. You'll hear back by Monday.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="px-5 pb-24">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-3 py-6">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                background: i <= step ? 'linear-gradient(135deg, #B8893C, #E0C074)' : 'rgba(255,255,255,0.15)',
              }}
            />
            <span className="font-body text-[11px] font-bold" style={{ color: i <= step ? T.gold : 'rgba(255,255,255,0.3)' }}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className="w-6 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            )}
          </div>
        ))}
      </div>

      <motion.div
        key={step}
        initial={shouldReduce ? {} : { opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Step 0: Photos */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="display-md text-white">PROGRESS PHOTOS</h2>
            <p className="font-body text-[14px] text-white/50">Front, side, and back. Same lighting as last week.</p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {['Front', 'Side', 'Back'].map((label) => (
                <label key={label} className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" />
                  <div
                    className="aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-2"
                    style={{ background: T.surface, border: '1px dashed rgba(255,255,255,0.16)' }}
                  >
                    <Camera size={20} strokeWidth={T.stroke} className="text-white/30" />
                    <span className="font-body text-[11px] text-white/30">{label}</span>
                    {/* Ghost of prior week */}
                    <span className="font-body text-[9px] text-white/15">Last week</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Measurements */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="display-md text-white">MEASUREMENTS</h2>
            <div className="space-y-5">
              <div>
                <p className="kicker mb-2">Weight</p>
                <BigNumStepper
                  value={weight / 10}
                  onChange={(v) => setWeight(Math.round(v * 10))}
                  unit="kg"
                  min={40}
                  max={200}
                  step={0.1}
                />
              </div>
              {Object.entries(measurements).map(([key, val]) => (
                <div key={key}>
                  <p className="kicker mb-2">{key}</p>
                  <BigNumStepper
                    value={val}
                    onChange={(v) => setMeasurements(prev => ({ ...prev, [key]: v }))}
                    unit="cm"
                    min={20}
                    max={200}
                    step={0.5}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Feel */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="display-md text-white">HOW DO YOU FEEL</h2>
            {['energy', 'hunger', 'sleep', 'stress'].map((metric) => (
              <div key={metric}>
                <p className="kicker mb-2">{metric}</p>
                <FivePointSelector
                  value={feel[metric]}
                  onChange={(v) => setFeel(prev => ({ ...prev, [metric]: v }))}
                  labels={metric === 'stress' ? ['Low', '', 'Mid', '', 'High'] : ['Low', '', 'Good', '', 'Great']}
                />
              </div>
            ))}
            <div>
              <p className="kicker mb-2">Note to Biki</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything to share this week..."
                rows={3}
                className="w-full rounded-xl px-4 py-3 font-body text-[14px] text-white placeholder:text-white/25 outline-none resize-none"
                style={{ background: T.surface, border: `1px solid ${T.hairlineStrong}` }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Next button */}
      <div className="mt-8">
        <motion.button
          whileTap={T.tap}
          onClick={next}
          className="btn-primary"
        >
          {step < 2 ? 'Continue' : 'Submit check-in'}
        </motion.button>
      </div>
    </div>
  );
}
