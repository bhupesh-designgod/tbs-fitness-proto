// ── Coach state — cadence + feedback loop ──
// Pure logic so any surface (dashboard, nutrition, training) can read it.
// The floating coach renders ONE thing at a time, chosen by priority:
//   1. a new, unseen health report
//   2. else a Muskaan check-in on Wednesday / Sunday (if not done today)
//   3. else the daily thought
// The latest Muskaan answer must change the experience, or people stop
// answering honestly — that lives in deriveCoachState below.

export const MOOD_OPTIONS = ['low', 'okay', 'good', 'great'];

// Muskaan is locked to Wednesday (mid-week pulse) and Sunday (week close).
export function isMuskaanDay(date = new Date()) {
  const d = date.getDay(); // 0 Sun … 3 Wed
  return d === 0 || d === 3;
}

export function isSameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

// Which single piece of content the floating coach shows, by priority.
export function getCoachMode({ now = new Date(), reportUnseen = false, muskaanDoneToday = false } = {}) {
  if (reportUnseen) return 'report';
  if (isMuskaanDay(now) && !muskaanDoneToday) return 'muskaan';
  return 'thought';
}

// The feedback loop. The latest check-in changes tone and the next workout.
//   tone 'forgiving' — softer microcopy for 3 days after a 'low' mood.
//   softenWorkout    — energy <= 2: lean on recovery + the decay/restore
//                      allowance instead of penalizing.
//   allowPush        — energy >= 4 and mood good/great: coach may push harder.
export function deriveCoachState(coach = {}, now = new Date()) {
  const muskaan = coach.muskaan || [];
  const last = muskaan[0] || null;

  const mode = getCoachMode({
    now,
    reportUnseen: !coach.reportSeen,
    muskaanDoneToday: last ? isSameDay(last.date, now) : false,
  });

  let tone = 'steady';
  let softenWorkout = false;
  let allowPush = false;

  if (last) {
    const daysSince = Math.floor((now - new Date(last.date)) / 86_400_000);
    if (last.energy <= 2) softenWorkout = true;
    if (last.mood === 'low' && daysSince <= 3) tone = 'forgiving';
    if (last.energy >= 4 && (last.mood === 'good' || last.mood === 'great')) allowPush = true;
  }

  return { mode, tone, softenWorkout, allowPush, last };
}

// Biki's one-line reply after a check-in, reflecting what they picked.
// Forgiveness, not punishment. No em dashes.
export function muskaanResponse({ mood, energy }) {
  if (energy <= 2) return "Noted. We'll keep today light and let you recover. No guilt in that.";
  if (mood === 'low') return "Thanks for being honest. Easy does it this week, I've got you.";
  if (energy >= 4 && (mood === 'good' || mood === 'great')) return "Love this energy. Let's make today count.";
  return "Good to know where you're at. Steady wins this.";
}

// Short bubble teaser per mode (what the floating coach "says").
export function coachTeaser(mode, { thoughtShort } = {}) {
  if (mode === 'report') return { kicker: 'New report', text: "Your report's in. Tap to see what moved." };
  if (mode === 'muskaan') return { kicker: 'Check-in', text: 'Quick pulse on the week?' };
  return { kicker: 'Biki says', text: thoughtShort || 'A word before you start.' };
}
