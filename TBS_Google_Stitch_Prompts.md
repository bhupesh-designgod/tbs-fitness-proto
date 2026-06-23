# TBS Fitness — Google Stitch Prompt Sheet

A systematic, copy-paste prompt set to recreate the entire **TBS Fitness** app in **Google Stitch** (stitch.withgoogle.com) — from splash / login / sign-up, through the full onboarding flow, to every main screen and detail view.

---

## How to use this sheet

1. Open **Google Stitch** → **New Project** → choose **Mobile**.
2. **First**, paste **Section 0 — Global Design System** into a new screen prompt (or into the project's Theme/Customize panel). This locks the look so every later screen is consistent.
3. Then generate screens **one prompt at a time**, in order. Each prompt below is self-contained and already restates the key theme so screens stay on-brand even if generated separately.
4. After each generation, use Stitch's chat to refine ("make the ring larger", "tighten spacing"), then move to the next prompt.
5. Export to Figma / code when the set looks right.

**Platform for every screen:** iOS mobile, 390 × 844 pt (iPhone 14), dark theme, single-column, thumb-friendly.

---

## Section 0 — Global Design System (paste this first)

```
Design a premium dark-mode iOS fitness app called "TBS Fitness" — a 1-on-1 coaching app by a head coach named Biki Singh. Athletic, disciplined, high-end editorial feel. Use this exact design system for EVERY screen:

PLATFORM: iPhone (390×844pt), dark UI, single column, generous spacing, large tap targets.

COLOR:
- Background #0B0B0C, card surface #151517, raised surface #1D1D20
- Hairline borders: white at 7% opacity; stronger hairline: off-white at 16%
- GOLD #F6B41C is the ONE action accent — used ONLY for buttons, key CTAs, selected states and highlights. Text on gold is near-black ink #241906.
- Data colors (used only for stats/rings, never as buttons): calories #FF7A1A (orange), water #28A9F0 (azure), protein #23A968 (green), fat #E0566E (rose), carbs #9B7BD6 (violet)
- Status: positive #9CE910 (lime), danger #FF3B30 (red)
- Text: primary off-white #F4F2EC, secondary grey #9D9C96, plus low-opacity off-white for captions

TYPOGRAPHY:
- Display & big numbers: "Bebas Neue" — tall, condensed, ALL CAPS, used for screen titles, big stats, hero headlines.
- Everything else: "Manrope" — body, labels, buttons. Small section labels ("kickers") are 11px Manrope ExtraBold, UPPERCASE, +9% letter-spacing, in grey or gold.

STYLE RULES:
- Flat solid fills only — NO gradients anywhere.
- One corner radius: 12px on cards/buttons; pills are fully rounded.
- Cards: #151517 fill + 1px hairline border, 12px radius.
- Primary button: full-width gold pill-ish (12px radius), near-black uppercase Manrope SemiBold label, optional left icon.
- Secondary button: transparent with hairline border, off-white label. Ghost button: gold text only.
- Bottom tab bar with 5 items. A floating circular coach avatar (gold ring) hovers bottom-right on main screens.
```

---

## Section 1 — Entry & Auth

### 1.1 Splash
```
[TBS Fitness design system — dark, gold accent, Bebas/Manrope.]
A minimal launch/splash screen. Pure #0B0B0C background, perfectly centered large "TBS" wordmark in gold (#F6B41C) Bebas Neue, with a thin tagline beneath in grey Manrope: "Coached by Biki Singh". No other UI. Quiet, premium, full-bleed.
```

### 1.2 Login
```
[TBS Fitness design system — dark, gold accent, Bebas/Manrope.]
A Login screen. Top third is a full-width grayscale gym photo with a dark bottom-up gradient scrim; over it a small gold uppercase kicker "TBS FITNESS" and a huge Bebas Neue headline "WELCOME BACK". Below on #0B0B0C: a grey helper line, then two input rows (Email with mail icon, Password with lock icon + show/hide eye), each a #151517 rounded field with hairline border and a leading grey icon. A right-aligned grey "Forgot password?" link. A full-width GOLD primary button "LOG IN" with a right arrow. An "OR" hairline divider. Two monochrome social buttons: "Continue with Apple" and "Continue with Google". Footer centered: "New to TBS? Create account" with "Create account" in gold.
```

### 1.3 Sign up
```
[TBS Fitness design system — dark, gold accent, Bebas/Manrope.]
A Sign-up screen, same layout as Login but headline reads "START TODAY". Helper line: "Create your account. Biki builds the plan — you bring the work." Three input fields: Name (user icon), Email (mail icon), Password (lock icon + eye). Full-width GOLD primary button "CREATE ACCOUNT" with right arrow. "OR" divider, then "Continue with Apple" and "Continue with Google" monochrome buttons. Footer: "Already have an account? Log in" with "Log in" in gold.
```

---

## Section 2 — Onboarding (23 steps)

> Onboarding is a horizontally-sliding flow. Every step (except the first Door and final Pledge) shows persistent chrome: a back arrow top-left, a thin gold progress bar, and a "Skip" link top-right. Titles are big Bebas Neue uppercase. Single-select cards auto-advance; multi-field steps use a gold "Next" button at the bottom.

### 2.1 The Door (intro)
```
[TBS Fitness design system.]
Full-bleed onboarding intro. Background is a grayscale portrait of the coach with a dark gradient. Centered "TBS" in gold Bebas Neue at top. Bottom: a two-line Bebas headline "You're not on a program. You're on my roster." (second line in gold), a short grey paragraph, and a full-width GOLD button "LET'S DO THIS" with right arrow and a subtle shine. No progress chrome.
```

### 2.2 Name
```
[TBS design system. Onboarding step with back arrow, gold progress bar, Skip.]
Title "WHAT SHOULD I CALL YOU?" in Bebas Neue. A single large borderless text input (40px) with a thin underline, placeholder "Your name". Full-width gold "Next" button at bottom.
```

### 2.3 Age
```
[TBS onboarding step, chrome present.]
Title "HOW OLD ARE YOU?". A big gold Bebas number showing the selected age with "YEARS" caption, above an iOS-style vertical scroll wheel picker (years 14–90) with a gold selection band. Gold "Next" button.
```

### 2.4 Sex
```
[TBS onboarding step, chrome present.]
Title "SEX". Two large tappable cards side by side (3:4), each with a big glyph (♂ / ♀) and label (Male / Female). Selecting a card highlights it with gold tint + gold border and auto-advances.
```

### 2.5 Height
```
[TBS onboarding step.]
Title "HEIGHT" with a small cm/ft unit toggle on the right. Big gold Bebas value with caption, above a vertical scroll-wheel picker with a gold selection band. Gold "Next" button.
```

### 2.6 Weight
```
[TBS onboarding step.]
Title "WEIGHT" with a kg/lb unit toggle. Big gold Bebas value with caption, above a vertical scroll-wheel picker. Gold "Next" button.
```

### 2.7 Goal
```
[TBS onboarding step. Coach line at top: small round coach avatar + "Pick one. We can adjust."]
Title "YOUR GOAL". A vertical list of selectable cards, each with a left icon, bold title and grey subtitle: Weight loss, Weight gain, Build muscle, Body recomposition, General fitness, Competition prep. Tapping highlights gold and auto-advances.
```

### 2.8 Motivation (halfway checkpoint)
```
[TBS design system, no progress bar.]
A celebratory checkpoint screen. Centered: gold kicker "KEEP GOING!", a glowing gold medal image, a Bebas headline "YOU'RE HALFWAY THERE, [NAME].", and an encouraging grey paragraph about picturing yourself 12 weeks from now. Full-width gold "Continue" button.
```

### 2.9 Experience & training time
```
[TBS onboarding step.]
Title "YOUR LEVEL". Three big selectable cards: Beginner, Intermediate, Advanced (each with a grey descriptive subtitle). Below, a small kicker "When do you usually train?" and a 4-up icon grid: Morning, Midday, Evening, Night (sunrise/sun/sunset/moon icons). Gold "Next" button.
```

### 2.10 Training availability
```
[TBS onboarding step.]
Title "WHEN CAN YOU TRAIN?" with grey subtitle "Be honest about a normal week, not your best one." A row labeled "Which days work best?" with 7 circular day toggles (M T W T F S S) that fill gold when selected, and a "{n} days / week" counter that derives from the selection. Below, a "Typical session length" 4-up grid of cards each with an icon: ~30 min, ~45 min, ~60 min, 90+ min. Gold "Next" button.
```

### 2.11 Daily activity
```
[TBS onboarding step.]
Title "YOUR DAY", subtitle "Outside of training, what does a typical day look like?". Vertical list of selectable cards: Sedentary, Lightly active, Moderately active, Very active, Physically demanding — each with a grey description. Tap to highlight gold and auto-advance.
```

### 2.12 Diet style
```
[TBS onboarding step. Coach line: avatar + "Now food. Be specific."]
Title "DIET STYLE". A 2×2 grid of square selectable cards: Vegetarian, Non-vegetarian, Eggetarian, Vegan. Tap highlights gold and auto-advances.
```

### 2.13 Build your day
```
[TBS onboarding step.]
Title "BUILD YOUR DAY", subtitle "How a normal day of eating looks for you." A preview strip card showing small icon chips for each meal/shake/snack. Below, three stepper rows (icon + label + minus/number/plus): Meals, Shakes, Snacks. Gold "Next" button.
```

### 2.14 Supplements
```
[TBS onboarding step.]
Title "SUPPLEMENTS", subtitle "Straight answers help Biki program safely." A chip-adder input ("What are you taking?" — type and confirm to add gold chips). Below, kicker "Anabolic use" with a 3-up segmented choice: None / In the past / Currently. If past/current selected, reveal an optional private note field.
```

### 2.15 Your body (medical)
```
[TBS onboarding step.]
Title "YOUR BODY", subtitle "Anything Biki should program around? Tap what applies." A wrap of quick-pick chips with small icons: Shoulder, Lower back, Knee, Wrist / elbow, Neck, Hip, plus an "All good" chip. Below, a free-text area "Add detail…", then a separate field "Diagnosed conditions or ongoing issues". Gold "Next" button.
```

### 2.16 Sleep
```
[TBS onboarding step.]
Title "SLEEP", subtitle "Recovery is built here." Two time pickers side by side: "Sleep at" and "Wake at". Below, kicker "Average sleep" with a 5-up choice grid: Under 5h, 5–6h, 6–7h, 7–8h, 8h+. Gold "Next" button.
```

### 2.17 Fuel & Hydration
```
[TBS onboarding step.]
Title "FUEL & HYDRATION", subtitle about food you enjoy and how much you drink. Section "Favorite foods" (fork icon) with a chip-adder input. Section "Water per day" (droplet icon) with a 4-up choice: Under 1L, 1–2L, 2–3L, 3L+. Section "Allergies or foods to avoid" (× icon, rose) with quick chips (Peanut, Dairy, Gluten, Shellfish, Soy, Eggs) plus a chip-adder "Anything else…". Gold "Next" button.
```

### 2.18 Digestion
```
[TBS onboarding step.]
Title "DIGESTION". Kicker "How's your digestion?" with a 3-up choice: Good / Average / Poor. Kicker "Acidity or acid reflux" with a one-line plain definition of acid reflux, then a 2×2 grid of choices each with a frequency sub-label: Never (No symptoms), Occasionally (A few times a month), Frequently (Most weeks), Daily (Almost every day). Kicker "Any of these? (optional)" with wrap chips: Bloating, Constipation, Gas, Stomach pain, Loose motions, None. Gold "Next" button.
```

### 2.19 Starting photos
```
[TBS onboarding step.]
Title "STARTING PHOTOS", subtitle "Front, back, and side. We track changes against these." Three dashed-outline upload tiles (3:4) labeled Front / Back / Side, each with a camera icon. A subtle "Skip for now — add them later" row at the bottom. Gold "Next" button.
```

### 2.20 Bloodwork
```
[TBS onboarding step.]
Title "BLOODWORK", subtitle about uploading recent bloodwork to fine-tune the plan. A large dashed upload drop-zone with an upload icon and "Tap to upload report / PDF, photo, or screenshot". Below, kicker "Recent kidney function test?" with a 3-up choice: Yes / No / Not sure. A subtle "I'll add it later" row. Gold "Next" button.
```

### 2.21 Anything else (notes)
```
[TBS onboarding step.]
Title "ANYTHING ELSE?", subtitle "Health, food habits, lifestyle, goals — anything you want Biki to know." A large multi-line text area, optional. Bottom button labeled "Finish".
```

### 2.22 The File (reveal)
```
[TBS design system.]
A summary/confirmation screen titled "THE FILE" with a gold kicker "Your file is ready". A single card listing the athlete's profile as label/value rows (Name, Age, Stats, Goal, Level, Activity, Training, Diet, Day plan, Supplements…). Below, a coach line: small avatar + "I have what I need. Day 1 drops tomorrow at 6am." Full-width gold button "LOCK IT IN".
```

### 2.23 The Pledge
```
[TBS design system, no chrome.]
A solemn commitment screen on a subtle dark-to-black vertical gradient. Bebas headline "I HEREBY PLEDGE", then a centered Manrope paragraph: a personal pledge to log meals, share progress, and trust the coach. At the bottom, a circular press-and-hold target with a fingerprint icon ringed by a gold progress ring, and caption "Press and hold to commit".
```

---

## Section 3 — Main App (bottom-tab screens)

> All five carry a bottom tab bar: **Home, Nutrition, Coach, Train, Reviews** (home / fork-knife / chat-bubble / dumbbell / clipboard icons; active item gold). A floating circular **coach avatar** (gold ring, small status dot) sits above the tab bar on the right, sometimes with a speech bubble and a numeric badge.

### 3.1 Home
```
[TBS Fitness design system — dark, gold accent, Bebas/Manrope, bottom tab bar (Home active), floating gold coach avatar bottom-right.]
A Home dashboard. Top: round profile photo + "Good morning," and a big Bebas name "ARJUN.", with a bell (red dot) and calendar icon on the right. A "THIS WEEK / DAY 38 / 84" label and a 7-day strip (Mon–Sun) of circular progress rings with dates; today is the selected/highlighted cell. A macro summary card: a large left ring (its empty track tinted, the calorie number "0" in Bebas + "2400 kcal"), and on the right three macro readouts — Carbs / Proteins / Fats (each "0/240G" style with a colored 3-pip indicator). A full-width gold "VIEW DIET PLAN" button. A compact Water quick-log card: blue droplet icon, "Water · 3/12 · 0.75L", a row of 12 segmented pips (filled gold), a circular gold "+" button, caption "+250 ml per tap". A workout card "TODAY'S WORKOUT / LEGS DAY" with exercises + minutes and a grayscale photo, "View workout ›". A supplement card: pill icon, "NEXT SUPPLEMENT / CREATINE / 5g · Morning · empty stomach", "0/5 taken", and 5 progress pips.
```

### 3.2 Nutrition — Meals tab
```
[TBS design system, bottom tab bar (Nutrition active).]
A Nutrition screen. Big Bebas title "NUTRITION" with subtitle "Fuel the work." and a "Guide" + calendar button. A 7-day strip of dual-ring day cells (today selected). A segmented pill toggle: Meals / Water / Supps (Meals active, gold). A "Macros" card: a large calorie ring on the left (orange ring with a tinted empty track, "0 / 2170 KCAL"), and three macro columns P / F / C with thin colored progress bars and remaining grams. A "Today's meals" vertical timeline: each meal is a row with a time on a dashed rail, a thumbnail photo, meal name, food summary, and a "NOT LOGGED ›" or "LOGGED" status with a check.
```

### 3.3 Nutrition — Meal detail (bottom sheet)
```
[TBS design system — a bottom sheet over a dimmed Nutrition screen.]
A meal detail bottom sheet. Header with meal name (Bebas) + time. A macro summary row (calories + P/F/C chips in their data colors). A list of foods with portion and per-item macros. Actions: "Add food" and "Replace meal" (swap), each opening a sub-list of options. A full-width gold "Log meal" button.
```

### 3.4 Nutrition — Water tab
```
[TBS design system, bottom tab bar (Nutrition active).]
The Water/Hydration view. A large ring or vertical gauge showing today's intake vs a 3.0L goal in azure (#28A9F0). A "glasses" readout. Quick-add buttons (e.g. +250ml) and a "Log custom amount" field. A "Default drink size" setting. A weekly overview row of small bars and a recent history list.
```

### 3.5 Nutrition — Supps tab
```
[TBS design system, bottom tab bar (Nutrition active).]
The Supplements view, "Today's stack". A vertical list of supplement rows, each with name, dose and timing (e.g. Creatine 5g · Morning), and a tap-to-toggle "taken" checkbox that fills gold when done. A header progress line like "3 of 5 taken — consistency compounds."
```

### 3.6 Coach — Actions tab
```
[TBS design system, bottom tab bar (Coach active), NO floating avatar on this screen.]
A coach chat screen. Fixed header: round coach photo, "BIKI SINGH" (Bebas) with a green verified check, "IFBB Pro · Head Coach", a green "Online" dot, and a calendar button. Below, a segmented pill toggle "ACTIONS / CHAT" (Actions active gold, with a small count badge). The Actions tab shows a list of logged interaction cards from the coach (gold-tinted): e.g. "Check-in", "Health report reviewed", "Bloodwork uploaded" — each with a small coach avatar, a "Logged · [day]" label, title and detail. If empty, a centered empty state: coach avatar + "NOTHING YET" + "Check-ins, reports, and nudges from Biki will collect here as you go."
```

### 3.7 Coach — Chat tab
```
[TBS design system, bottom tab bar (Coach active).]
The Chat tab of the coach screen. Same fixed header + "ACTIONS / CHAT" toggle (Chat active). A "TODAY" date separator. A messenger-style thread: coach messages on the left (with avatar, gold "COACH" label + colored topic tag, text in a #151517 bubble) and user messages on the right (light bubble, time + topic tag + gold read ticks). Include a coach voice-note bubble with a play button and a waveform + duration. A fixed bottom input bar: a "Topic" selector pill, a "+" attach button, a rounded "Type your message…" field, and a gold send / mic button.
```

### 3.8 Train
```
[TBS design system, bottom tab bar (Train active), floating coach avatar.]
A workout screen. A 7-day training strip with dumbbell/rest icons and split labels (PUSH/PULL/LEGS/REST), today selected. A large editorial hero photo card "LEGS DAY" (Bebas) over a grayscale gym image, with muscle tags "QUADS · HAMSTRINGS · GLUTES", a short description, a small ring with day count, and a "CALENDAR" button. A stat strip: Exercises / Minutes / Level. Then "TODAY'S WORKOUT" with an "Expand All" control and a numbered, collapsible exercise list — each row: big index number, exercise name, muscle, and "N SETS × N REPS" (NO weights). Expanded, a row shows per-set rep chips ("10 reps", "8 reps"…) and a gold-tinted "BIKI'S NOTE" coaching cue. Include a rest-day variant with a mobility checklist.
```

### 3.9 Reviews
```
[TBS design system, bottom tab bar (Reviews active), floating coach avatar.]
A "REVIEWS" screen (subtitle "Every week, reviewed by Biki."). First card (gold border): coach avatar + "FROM BIKI / Got recent bloodwork or a health report?", description, and a full-width GOLD "Choose a report to upload" button (when files are added they list with a remove ×, then a "Submit N reports for review" gold button, then a "Sent to Biki for review" confirmation). A "LATEST REVIEW" hero card: big Bebas "WEEK 9–10" with a gold "REVIEWED" badge, a coach portrait faded on the right, "Reviewed by Biki · 2 days ago", a quoted summary, and an outlined gold "VIEW FULL REVIEW" button. A "NEXT CHECK-IN" card "DUE TODAY" with calendar icon and a gold "START CHECK-IN" button. A "Compare progress" card with two week pickers and a before/after photo pair plus a weight-delta pill. A "Review history" list: rows with a thumbnail, biweekly label + date (e.g. "WEEK 7–8 · JUN 2"), a "Reviewed" check, a top-result metric with up/down delta, and a "View ›" link. One special row shows a gold "PLAN EXTENDED" badge and label "WEEK 3–4 +1".
```

---

## Section 4 — Detail & Overlay screens

### 4.1 Profile
```
[TBS design system, with a top "← Back".]
A Profile screen. Header: initial/photo avatar + name "ARJUN" + "Week 6 of 16". Section "YOUR PLAN" as tappable rows: Goal, About you, Diet style, Day plan, Experience, Allergies / avoids (each with a value or "Not set"). Section "SETTINGS": Units (Metric), Notifications (On), plus "Preview", "Reset demo data", "Log out". Footer "TBS v0.1 Prototype".
```

### 4.2 Notifications
```
[TBS design system, with "← Back".]
A "Notifications" screen. Grouped lists under "TODAY" and "EARLIER". Each row: a colored type icon (coach / report / reminder), a title and short preview, a timestamp, and an unread dot. Tapping a row deep-links into the app. Empty state: a centered icon + "All caught up".
```

### 4.3 Check-in flow
```
[TBS design system.]
A two-step bi-weekly check-in. Top progress dots: "Photos" then "Weight". Step 1 "PROGRESS PHOTOS": three dashed upload tiles Front / Side / Back (camera icon, "Last week" ghost label), subtitle "Same lighting as last week." Step 2 "WEIGHT": a big number stepper for body weight (kg, required), then a "Measurements" section tagged "Optional" with stepper rows (waist, etc.). Bottom button "Continue" → "Submit check-in". After submit: a centered success state "SENT TO BIKI / He reviews check-ins Sunday evening."
```

### 4.4 Check-in detail
```
[TBS design system, top bar with title + back.]
A reviewed check-in detail. A gold-kicker "Coach summary" card with a multi-paragraph note from Biki. A "Submitted data" grid of metric cards (Weight, Protein adherence, Workout compliance, Steps, Waist, Energy) each with value, unit, and an up/down delta in green/red. A "Check-in photos" gallery (front/back/left/right). A "Plan changes" checklist of next-week adjustments. A "Message Biki" action.
```

### 4.5 Macro detail
```
[TBS design system, with back.]
A macro breakdown detail screen: a big Bebas title, a large progress ring for the chosen macro, and a breakdown of how logged meals contribute to the day's macro totals, with the macro's data color used for emphasis.
```

---

## Section 5 — Shared / global components

### 5.1 Bottom tab bar
```
[TBS design system.]
A fixed bottom navigation bar on #0B0B0C with a top hairline. Five items: Home, Nutrition, Coach, Train, Reviews — line icons (home, fork-knife, chat bubble, dumbbell, clipboard) with tiny labels. The active item is gold with a short gold underline; the rest are grey.
```

### 5.2 Floating coach avatar + prompt bubble
```
[TBS design system — overlay element.]
A floating circular coach avatar (56pt, coach photo inside a 2.5px gold ring, small green status dot, and a numeric gold badge for pending actions) anchored above the bottom-right of the tab bar. To its left, a small speech bubble (#151517, hairline, rounded with a notched corner) showing a gold uppercase kicker and one line, e.g. "CHECKING IN — How's your week going? Quick pulse." Variants of the bubble: quote of the day, bloodwork request, and an off-plan "You're 320 kcal short today."
```

### 5.3 Bottom sheets (pattern)
```
[TBS design system — modal pattern.]
A bottom sheet over a dimmed/blurred screen: rounded top corners, a small grab handle, #151517 surface. Used for: the daily quote (coach portrait background + "I'm committed" gold button), the quick mood/energy check-in (mood choices + a 1–5 energy ring), the bloodwork prompt, and the off-plan meal-adjust picker (list of meals to add/trim the surplus, plus "Log as a new meal").
```

---

## Appendix — Token reference (for Stitch theme / fine-tuning)

**Colors**

| Token | Hex | Use |
|---|---|---|
| Background | `#0B0B0C` | App background |
| Surface | `#151517` | Cards |
| Surface 2 | `#1D1D20` | Raised/inputs |
| Hairline | `rgba(255,255,255,0.07)` | Borders |
| Gold (action) | `#F6B41C` | Buttons, accents, selected |
| Gold ink | `#241906` | Text/icons on gold |
| Calories | `#FF7A1A` | Calorie ring/data |
| Water | `#28A9F0` | Hydration |
| Protein | `#23A968` | Protein |
| Fat | `#E0566E` | Fat |
| Carbs | `#9B7BD6` | Carbs |
| Positive | `#9CE910` | Good deltas / online |
| Danger | `#FF3B30` | Alerts |
| Text primary | `#F4F2EC` | Headlines/body |
| Text mid | `#9D9C96` | Secondary |

**Type**

| Role | Font | Notes |
|---|---|---|
| Display / big numbers | Bebas Neue | Condensed, ALL CAPS, one weight |
| Body / labels / buttons | Manrope | Regular→ExtraBold |
| Kicker (section label) | Manrope ExtraBold | 11px, UPPERCASE, +9% tracking |

**Geometry:** 12px radius on cards/buttons; pills fully rounded; 1px hairline borders; flat solid fills (no gradients); full-width primary buttons; 20pt screen side gutters.

---

*Generated for the TBS Fitness prototype. Paste Section 0 first, then work through Sections 1 → 5 in order for a consistent, complete app in Google Stitch.*
