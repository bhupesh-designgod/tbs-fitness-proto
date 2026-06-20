# TBS Fitness — Context for a fresh chat

Quick-start brief so a new session can be productive immediately. Skim this first.

## What this is
A high-fidelity **mobile app prototype** for **TBS**, a premium 1-on-1 fitness coaching product (coach persona: IFBB Pro **Biki Singh**). Single-user demo, no real backend — all state is mocked + persisted to `localStorage`. Designed to be viewed on a phone at ~375–430px width.

## Stack
- **React 19 + Vite 8 + Tailwind v4** (`@tailwindcss/vite`), **framer-motion**, **lucide-react**.
- No router — `App.jsx` does tab + overlay routing by state.
- Repo: `github.com/bhupesh-designgod/tbs-fitness-proto` (branch `main`).

## Workflow (IMPORTANT — do this every change)
After any code change: **commit → push → deploy**, without asking.
- Deploy is **manual Vercel CLI**: `vercel deploy --prod --yes` (the project is linked in `.vercel/`; it is NOT auto-deployed from GitHub). A git push alone leaves the live app stale.
- Commit messages: terse imperative; end with `Co-Authored-By: Claude <noreply@anthropic.com>`.
- Build check before committing: `npx vite build`.

## Design system — use tokens, no one-offs
- All colors/radii/springs/strokes live in **`src/tokens.js`** (`T.*`) and **`src/index.css`** (`@theme` + `.kicker`, `.card`, `.btn-primary/secondary/ghost`, `display-*` classes).
- **Type:** Bebas Neue = display only (≥20px, uppercase) via `.display-*`. Manrope = everything else. Small labels use `.kicker` (Manrope 800, 11px, uppercase) — **never** Bebas under ~18px.
- **Palette ("track jersey", flat fills, no gradients except logo):**
  - `--bg-0 #0B0B0C` bg, `--bg-1 #151517` cards, ink `#F4F2EC` / `#9D9C96`.
  - **gold `#D4A848`** = the action color: primary CTAs, brand moments, active tab, "today", progress fills.
  - **volt `#D7FF3E`** = live/active states ONLY (in-workout, trained-day icons). Not for CTAs.
  - **red `#FF3B30`** heat (streaks/PRs/alerts), **cobalt `#2B4BFF`** hydration/recovery, **orange `#FF7A00`** meal-adherence rings. All accents sit on black or off-white — no color-on-color.

## Screen map
Tabs (order): **Home · Nutrition · Coach · Train · Reviews** (`Reviews` = clipboard-check icon; Coach is center).
- `src/pages/` — Home (scoreboard/points), Nutrition (Meals+Hydration tabs, meal sheet log/adjust/replace, supplements), Coach (chat, voice notes, topic chips), Train (read-only workout — **logging is out of scope**), Progress (= "Reviews": weekly check-ins + Week Review detail + compare-progress photos), Profile (sections reflect onboarding answers), Notifications, CheckIn, CheckInDetail, MacroDetail.
- `src/components/ui/` — `Components.jsx` (BottomSheet, RingCounter, NumericCounter, TabBar…), `Calendar.jsx` (WeekStrip + MonthSheet; modes: score / nutrition / training).
- `src/data/mockData.js` — all seed data. `src/context/AppContext.jsx` — app state + actions.

## Auth / onboarding / routing (in `App.jsx`)
Gate order: **Auth → Splash → Onboarding (new only) → App**.
- `src/auth/Auth.jsx` — login/signup (email + Apple/Google stubs).
- **Signup** → resets data, runs onboarding + contextual tours. **Login** → returning user, straight home, data preserved.
- **Signup clears `tbs-state`** (fresh data); login does not.
- `src/onboarding/` — `Splash`, `Onboarding.jsx` (controller) + `steps.jsx` (the multi-screen "file" signup flow — **user-owned, actively evolving; don't refactor without asking**), `PressHold`, `TbsLogo`, `useOnboardingMusic.js` (**shelved**).

## Contextual coach tour (the "walkthrough")
Replaced the old large-modal walkthrough. **`src/onboarding/CoachTip.jsx`** = lightweight spotlight + small Biki bubble, **portaled to `document.body`**.
- Spotlight = **four dim/blur panels around the target** (target stays crisp). Anchors via `data-tour="..."` attributes.
- **Home** intro: 2 steps (score → "Up Next" tasks). **Nutrition**: 6 steps (meal plan → first card "Try It" opens sheet → Log/Adjust/Replace → reassurance).
- Shown once per user, gated by `tbs-tour {home, nutrition}` (signup = pending, login = seen).

## localStorage keys
`tbs-auth` {loggedIn,user} · `tbs-onboarding` {done,answers} · `tbs-tour` {home,nutrition} · `tbs-state` (app data: meals, hydration, history, training, waterLog/default).
Profile **Log out** clears auth/onboarding/tour and reloads (re-walkable).

## Known quirks
- **Dev-preview only:** React StrictMode + `AnimatePresence mode="wait"` (the App page-transition) can stall the FIRST tab/overlay transition (blank/dim). Re-trigger (nav away + back) clears it. **Does not happen in production** (no StrictMode). Don't "fix" by chasing it — verify via DOM assertions or a second transition.
- CTA button text renders uppercase via CSS; `textContent` keeps original case (e.g. match `'Next'` not `'NEXT'`).
- Two vite dev servers may run (user's 5173 + a preview-managed one e.g. 5174). The Claude preview's `autoPort` server may report a port vite ignores — check `lsof -iTCP -sTCP:LISTEN -P` and navigate to the real vite port.
- Logo at `public/assets/brand/tbs-logo.svg` is a **placeholder** — swap for the official asset when delivered.

## Verifying in preview
`preview_start` → `preview_resize` mobile (375×812) → seed localStorage via `preview_eval` (set `tbs-auth`/`tbs-onboarding`/`tbs-tour`/`tbs-state`, `location.reload()`) → screenshot. Splash auto-advances ~1.8s.
