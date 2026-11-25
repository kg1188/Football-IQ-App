# Football Analytics AI & MegaTrainer — Complete Upgrade Spec & Coding Agent Prompts

> **How to use this file:**
> - **In Cursor / Antigravity:** Reference `@NFL_APP_UPGRADE_PROMPTS.md` in Composer/Agent mode and tell the agent: *"Execute Phase 1 from @NFL_APP_UPGRADE_PROMPTS.md"*, then verify in the browser before running Phase 2 and Phase 3.
> - **Manual / Step-by-Step:** Paste any individual phase prompt block directly into chat to generate the exact file updates one by one.

---

## Project Architecture Reference (Do Not Break)
- **Frontend:** React + Vite (`frontend/src/`)
  - `App.jsx`: Top-level mode switcher (`Mega Trainer` vs. `Spatial Hub (Film Room)`). Passes `trackingData={videoInfo.tracking}` and `fps={videoInfo.fps}` to `<Phase5 />`.
  - `components/MegaTrainer.jsx`: 5-tab coaching suite (`1. Scheme Basics`, `2. Play-by-Play Training`, `3. Position Training`, `4. Shadow-Box & Scheme Lab`, `5. Live 22-Player QB & Coach Sim`).
  - `components/LivePlaySimulator.jsx`: Interactive 22-player SVG field (`viewBox="0 0 100 54"`), loads `LIVE_NFL_PLAYS` + `frontend/src/data/imported_nfl_plays.json` (39+ real NFL Big Data Bowl plays).
  - `components/Phase5.jsx`: 4-tab All-22 Film Intelligence Engine (`Coverage Trainer`, `Pre-Snap Tells`, `Fatigue Tracker`, `Assignment Grading`).
- **Backend:** Python FastAPI (`backend/main.py`, launched from project root via `.\backend\venv\Scripts\python -m uvicorn backend.main:app --reload --port 8000`).
- **Critical JSX Rule:** Never put unescaped `>` or `<` characters inside JSX text nodes (use `&gt;` or words like `over 1.5 yds`).

---

## Phase 1 Prompt: Simulator Declutter, Zone Landmarks, Blind Quiz Mode & Play Filters

Copy and paste this prompt into Cursor / Antigravity:

```text
You are upgrading `frontend/src/components/LivePlaySimulator.jsx` in our React + Vite NFL coaching app. Keep all existing 22-player interpolation, throw grading, keyboard shortcuts, and 39-play JSON loading intact, and add the following five features cleanly:

1. **Declutter Defensive Trails by Default:**
   - Separate the trail visibility state into two independent checkboxes:
     - `Off Routes` (default: `true`) — renders offensive routes and dotted pre-snap motion lines.
     - `Def Paths` (default: `false`) — renders defensive movement trails only when toggled on by the user.

2. **Coverage Zone Landmarks Overlay (`Zones` Toggle, default: `true`):**
   - Add a `Zones` checkbox in the field toolbar.
   - When enabled, render semi-transparent, labeled SVG zone landmark bubbles in the defensive secondary (`y = 4` to `y = 33`) inferred from `play.postSnapCoverage`:
     - **Cover 2 / Tampa 2:** Two deep half rectangles/ellipses (`Deep 1/2` at `x: 25, y: 12` and `x: 75, y: 12`), two flat bubbles (`Cloud Flat` at `x: 10, y: 29` and `x: 90, y: 29`), and three hook/hole zones (`Hook`, `Tampa Hole`, `Hook` around `y: 25`).
     - **Cover 3:** Three deep-third bubbles (`Deep 1/3` at `x: 17, y: 12`, `x: 50, y: 11`, `x: 83, y: 12`), two `Curl/Flat` zones (`x: 12, y: 28` and `x: 88, y: 28`), and two `Hook` zones (`x: 36, y: 26` and `x: 64, y: 26`).
     - **Cover 4 / Quarters:** Four equal deep-quarter bubbles across `y: 12` (`Deep 1/4` at `x: 13, 38, 62, 87`) plus underneath `Flat` / `Hook` zones.
     - **Cover 1 / Cover 0 / Man:** Subtle `"MAN COVERAGE — LOCKED ON RECEIVERS"` watermark banner at `y: 10` instead of zone bubbles.
   - Use soft translucent fills (`rgba(56, 189, 248, 0.10)`) with dashed borders (`rgba(56, 189, 248, 0.35)`) and clean uppercase labels so offensive routes visually slice through the zone windows.

3. **Blind / Pre-Snap Quiz Mode (`Blind Mode` Toggle, default: `false`):**
   - Add a `Blind Mode` toggle button/checkbox in the top control bar.
   - When `Blind Mode` is active AND `phase !== "result"`:
     - Mask the play title's coverage suffix (e.g. show `"NFL Real Tracking: SHOTGUN vs. [HIDDEN SHELL]"`).
     - Mask the status bar coverage badge (`"POST-SNAP: READ THE SAFETIES!"`) and blur/hide `Shell Disguise` and `Coach Notes` until the play finishes (`phase === "result"`).
     - Hide the `Zones` overlay until `phase === "result"`, then automatically reveal the true coverage shell and zones once the pass is resolved.
   - Add a pre-snap quick-guess bar when `Blind Mode` is on during `phase === "presnap"`: buttons for `1-High (MOFC)` vs. `2-High (MOFO)` that give instant feedback when the ball is snapped.

4. **Playbook Filter Pills & Search:**
   - Above the play dropdown, add compact filter pills: `All (39)`, `Cover 2`, `Cover 3`, `Cover 4`, `Man / Cover 1`, `Shotgun`, and `⭐ Starred`.
   - Allow starring/bookmarking plays to `localStorage` (`megatrainer_starred_plays`) so the user can build a custom study call sheet.

5. **Frame-by-Frame Stepping (`ArrowLeft` / `ArrowRight`):**
   - When `isPaused` is `true`, pressing `ArrowLeft` steps `currentTime` backward by `0.10s` and `ArrowRight` steps forward by `0.10s` (updating `phase` automatically across `play.snapTime`) so the user can freeze exact route breaks and safety rotations.

Ensure zero ESLint or JSX syntax errors (never use raw `>` or `<` inside JSX text).
```

---

## Phase 2 Prompt: Tactile "Coach’s Clipboard & Playbook" Theme + Interactive Telestrator + One-Click Launcher

Copy and paste this prompt into Cursor / Antigravity:

```text
Redesign the visual aesthetic across `frontend/src/App.jsx`, `frontend/src/components/MegaTrainer.jsx`, `frontend/src/components/LivePlaySimulator.jsx`, and `frontend/src/components/Phase5.jsx` to replace the dark tech-console aesthetic with an authentic, tactile **Coach's Clipboard & Sideline Playbook Binder** theme, plus add an interactive Telestrator pen and a one-click Windows launcher.

1. **Dual Coach Theme Switcher (`Clipboard Light` vs. `Chalkboard Dark`):**
   - Add a persistent theme toggle in the top header of `App.jsx` (`📋 Clipboard Paper` vs. `🏟️ Sideline Dark`, saved in `localStorage`).
   - **Clipboard Paper (Default):**
     - App backdrop: Warm stadium-concrete / desk neutral (`#E6E1D6`).
     - Cards & panels: Off-white playbook cardstock (`#FAF8F3`) with crisp binder-border lines (`#D3CCB9`), dark ink text (`#1C1917`), and muted slate secondary text (`#57534E`).
     - Playbook tabs styled like physical laminated binder divider tabs with bold condensed athletic typography (`Oswald` / `Barlow Condensed` loaded cleanly via Google Fonts in `frontend/index.html`).
   - **Sideline Dark:**
     - Warm charcoal slate (`#1C1F22`) with matte tactical surfaces (`#262A2F`) and warm bone text (`#F5F2EB`)—no harsh neon cyan/pinks.

2. **Authentic Playbook Field & Classic `X` and `O` Markers (`LivePlaySimulator.jsx` & `Phase5.jsx`):**
   - Style the SVG football field like a matte sideline dry-erase turf board (`#2D5A36`) with chalk-white yard lines, hash marks, subtle yard-line numbers (`10, 20, 30, 40`), and a laminated clipboard frame border.
   - Render **Offense** as classic royal-ink **`O`** markers (`#1D4ED8` ring/fill) and **Defense** as classic crimson-marker **`X`** symbols (bold crisp `X` SVG crosshairs in `#DC2626` inside a subtle halo) so every diagram reads like a real NFL coaching clinic diagram.

3. **Interactive Sideline Telestrator Toolbar (`LivePlaySimulator.jsx`):**
   - Add a compact **Telestrator Marker Bar** right next to the Zoom controls on the simulator field:
     - `Pointer` (normal throw-clicking mode)
     - `Yellow Chalk Pen` (`#FACC15`)
     - `Red Marker Pen` (`#EF4444`)
     - `White Chalk Pen` (`#FFFFFF`)
     - `Clear Ink (C)` button (also triggered by pressing `C` when not typing in an input).
   - When a pen color is active, clicking and dragging on the SVG field draws smooth freehand SVG `<polyline>` telestrator strokes in SVG coordinate space (so they scale cleanly with `All-22`, `1.3x Tight`, and `2.2x Trenches` zoom!). Auto-clear or keep strokes until `Clear Ink` is clicked.

4. **One-Click Windows Launch Script (`start_app.bat` in project root):**
   - Create `start_app.bat` in the root `football-spatial-hub/` folder that:
     - Starts the FastAPI backend in a named terminal window (`.\backend\venv\Scripts\python -m uvicorn backend.main:app --reload --port 8000`).
     - Starts the Vite frontend in a second terminal window (`npm --prefix frontend run dev`).
     - Waits 3 seconds and opens `http://localhost:5173` in the default browser.
```

---

## Phase 3 Prompt: Football IQ Learning Suite (Glossary Drawer, Conflict Defender Decoder & 4-Down Drive Mode)

Copy and paste this prompt into Cursor / Antigravity:

```text
Add three high-impact football learning features to help a user learn and master offensive/defensive concepts while using the simulator:

1. **Slide-Out "Playbook Glossary & Cheat Sheet" Drawer (`frontend/src/components/FootballGlossaryDrawer.jsx`):**
   - Add a `📖 Playbook Reference` button in the top header of `App.jsx` that opens a non-destructive slide-over drawer over any screen.
   - Include 3 interactive visual tabs inside the drawer:
     - **Route Tree (0–9):** Clean SVG route tree diagram showing routes `0` (Hitch) through `9` (Go/Fade) with exact yard depths (`5y`, `10y`, `12y`, `15y`, `18y`) and what coverage each route attacks.
     - **Coverage Shells & Beaters:** Visual breakdown of `Cover 0, 1, 2, 3, 4, 6` showing pre-snap safety alignment (`MOFO` vs `MOFC`), how to spot the post-snap rotation, and the #1 passing concept that beats each shell (e.g., *Smash vs. Cover 2*, *Flood / Curl-Flat vs. Cover 3*, *Mills / Post-Dig vs. Cover 4*).
     - **Personnel & Fronts:** Plain-English guide to `11, 12, 21, 22 Personnel` and `4-3 Over` vs. `3-4 Odd` vs. `Nickel 4-2-5` defensive fronts.

2. **"Why Did It Work?" Conflict Defender Highlighter (`LivePlaySimulator.jsx`):**
   - When a pass play completes (`phase === "result"`), automatically identify the **Conflict / Key Defender** (the non-DL defender closest to the throwing window or torn between two routes).
   - Highlight that specific defender on the field with a pulsing gold target ring and display a plain-English **Film Room Takeaway** inside the outcome card explaining:
     - Who the key read defender was (`e.g., LB #58`),
     - Which way his hips/leverage moved post-snap, and
     - Why that opened (or closed) the throwing window.

3. **4-Down Situational Drive Challenge Mode (`Drive Mode` Toggle in `LivePlaySimulator.jsx`):**
   - Add a `🏈 Drive Challenge` toggle next to `Blind Mode`.
   - Tracks `Down & Distance` (`1st & 10`), `Ball On` (`Own 25` -> `Opponent End Zone`), and `Drive Play Log`.
   - Yards gained/lost from each simulated pass play advance the line of scrimmage, award first downs every 10 yards, score a Touchdown at the 100-yard line, or end the drive on a turnover / turnover on downs after 4th down.
```

---

## Quick Verification Checklist After Running Any Phase
- [ ] Run `npm --prefix frontend run build` (or check Vite terminal) to confirm 0 JSX/ESLint errors.
- [ ] Verify `All-22`, `1.3x Tight`, and `2.2x Trenches` zoom buttons scale both players and telestrator/zone overlays accurately.
- [ ] Verify `Spacebar` plays/pauses, `1–4` keys throw to progressions, and `← / →` arrow keys step `0.1s` frames when paused.
```

If you don't end up using external agent credits, just say **"Start Phase 1"** here and I will walk you straight through the first upgrade step-by-step.