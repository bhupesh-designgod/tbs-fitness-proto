// ── Auth — Login / Sign up ──
// Single screen, two modes. Dark photo banner + Bebas headline, Manrope
// fields, gold primary CTA, monochrome social options. On success the parent
// decides routing: new sign-ups → onboarding, returning logins → home.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { T } from '../tokens';
import { track } from '../lib/analytics';
import { PHOTOS } from '../data/mockData';

const inputWrap = {
  background: T.surface,
  border: `1px solid ${T.hairline}`,
};

function FieldRow({ icon, children }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl px-3.5 mb-3" style={inputWrap}>
      {icon}
      {children}
    </div>
  );
}

function AppleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={T.text} aria-hidden>
      <path d="M16.36 12.78c.02 2.2 1.93 2.93 1.95 2.94-.02.05-.31 1.05-1.02 2.08-.61.89-1.25 1.78-2.26 1.8-.99.02-1.31-.59-2.44-.59-1.13 0-1.48.57-2.42.6-.97.04-1.71-.96-2.33-1.85-1.27-1.83-2.24-5.18-.94-7.44.65-1.12 1.8-1.83 3.06-1.85.95-.02 1.85.64 2.44.64.58 0 1.68-.79 2.83-.68.48.02 1.84.19 2.71 1.46-.07.04-1.62.94-1.6 2.79M14.6 6.3c.52-.63.87-1.5.77-2.37-.75.03-1.66.5-2.2 1.13-.48.55-.9 1.44-.79 2.29.84.06 1.69-.42 2.22-1.05"/>
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 11v3.6h5.1c-.2 1.3-1.6 3.9-5.1 3.9-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6c1.8 0 2.9.7 3.6 1.4l2.5-2.4C16.9 4.3 14.7 3.4 12 3.4 7.3 3.4 3.5 7.2 3.5 12s3.8 8.6 8.5 8.6c4.9 0 8.2-3.4 8.2-8.3 0-.6-.1-1-.1-1.4H12z" fill={T.text}/>
    </svg>
  );
}

function SocialButton({ glyph, label, onClick }) {
  return (
    <motion.button
      whileTap={T.tap}
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl"
      style={{ background: T.surface, border: `1px solid ${T.hairline}` }}
    >
      {glyph}
      <span className="font-body text-[14px] font-semibold" style={{ color: T.text }}>{label}</span>
    </motion.button>
  );
}

export default function Auth({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const isSignup = mode === 'signup';
  const emailOk = /\S+@\S+\.\S+/.test(email);
  const canSubmit = emailOk && password.length >= 4 && (!isSignup || name.trim().length > 0);

  const submit = () => {
    if (!canSubmit) return;
    if (isSignup) {
      track('signed_up', { method: 'email' });
      onSignup({ name: name.trim(), email });
    } else {
      track('logged_in', { method: 'email' });
      onLogin({ email });
    }
  };

  const social = (provider) => {
    // Respect the current mode: signing up via social still runs onboarding.
    if (isSignup) {
      track('signed_up', { method: provider });
      onSignup({ name: '', email: `demo@${provider}.com`, provider });
    } else {
      track('logged_in', { method: provider });
      onLogin({ email: `demo@${provider}.com`, provider });
    }
  };

  const switchMode = () => {
    setMode(m => (m === 'login' ? 'signup' : 'login'));
    setPassword('');
  };

  return (
    <div className="relative mx-auto flex flex-col" style={{ maxWidth: 430, height: '100dvh', background: T.bg }}>
      {/* Photo banner */}
      <div className="relative shrink-0" style={{ height: '34vh' }}>
        <img src={PHOTOS.pushHero} alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(100%) contrast(1.1) brightness(0.5)' }} />
        {/* Standard bottom-up scrim — headline sits on a clean ramp, no hard seam */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.75) 28%, rgba(0,0,0,0) 65%)',
        }} />
        <div className="absolute inset-0 flex flex-col justify-end p-5 pb-4">
          <p className="kicker kicker-gold mb-2">TBS Fitness</p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={mode}
              className="display-xl text-[#F4F2EC]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: T.easeOut }}
            >
              {isSignup ? 'START\nTODAY' : 'WELCOME\nBACK'}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-6 flex flex-col">
        <p className="font-body text-[14px] mb-6" style={{ color: T.textLow }}>
          {isSignup
            ? 'Create your account. Biki builds the plan — you bring the work.'
            : "Log back in and pick up where you left off."}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: isSignup ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isSignup ? -16 : 16 }}
            transition={{ duration: 0.2, ease: T.easeOut }}
          >
            {isSignup && (
              <FieldRow icon={<User size={17} strokeWidth={T.stroke} style={{ color: T.textMid }} />}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                  className="flex-1 min-w-0 bg-transparent font-body text-[15px] py-3 outline-none placeholder:text-white/20"
                  style={{ color: T.text }} />
              </FieldRow>
            )}
            <FieldRow icon={<Mail size={17} strokeWidth={T.stroke} style={{ color: T.textMid }} />}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" inputMode="email"
                className="flex-1 min-w-0 bg-transparent font-body text-[15px] py-3 outline-none placeholder:text-white/20"
                style={{ color: T.text }} />
            </FieldRow>
            <FieldRow icon={<Lock size={17} strokeWidth={T.stroke} style={{ color: T.textMid }} />}>
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
                type={showPw ? 'text' : 'password'}
                className="flex-1 min-w-0 bg-transparent font-body text-[15px] py-3 outline-none placeholder:text-white/20"
                style={{ color: T.text }} />
              <button onClick={() => setShowPw(s => !s)} aria-label="Toggle password" className="shrink-0 p-1">
                {showPw
                  ? <EyeOff size={16} strokeWidth={T.stroke} style={{ color: T.textMid }} />
                  : <Eye size={16} strokeWidth={T.stroke} style={{ color: T.textMid }} />}
              </button>
            </FieldRow>
          </motion.div>
        </AnimatePresence>

        {!isSignup && (
          <button className="self-end font-body text-[13px] font-medium mb-5 mt-1" style={{ color: T.textMid }}>
            Forgot password?
          </button>
        )}

        <motion.button
          whileTap={canSubmit ? T.tap : undefined}
          onClick={submit}
          disabled={!canSubmit}
          className="btn-primary mt-2"
        >
          {isSignup ? 'Create account' : 'Log in'}
          <ArrowRight size={18} strokeWidth={2.5} />
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: T.hairline }} />
          <span className="font-body text-[11px] font-bold uppercase tracking-wider" style={{ color: T.textFaint }}>or</span>
          <div className="flex-1 h-px" style={{ background: T.hairline }} />
        </div>

        {/* Social */}
        <div className="flex flex-col gap-2.5">
          <SocialButton glyph={<AppleGlyph />} label="Continue with Apple" onClick={() => social('apple')} />
          <SocialButton glyph={<GoogleGlyph />} label="Continue with Google" onClick={() => social('google')} />
        </div>

        {/* Footer toggle */}
        <div className="mt-auto pt-6 text-center">
          <span className="font-body text-[13px]" style={{ color: T.textLow }}>
            {isSignup ? 'Already have an account?' : "New to TBS?"}
          </span>
          <button onClick={switchMode} className="font-body text-[13px] font-bold ml-1.5" style={{ color: T.gold }}>
            {isSignup ? 'Log in' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  );
}
