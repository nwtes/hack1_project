# Learn-the-World — Interactive Map Quiz

A compact single-page web app that turns a Leaflet world map into a clickable geography quiz. The app is intended for quick learning sessions, classroom demos, or embedding into a static site. It focuses on low friction: a simple question card, immediate map feedback (green/red borders), and a timed "bullet-quiz" mode.

---

## Live demo / screenshots

### 1) Landing — Map-first UI (light / dark)
![landing](screenshots/landing.png) ![landing - dark](screenshots/landing-dark.png)

- What you see: Full-screen Leaflet map with centered search and unobtrusive top controls (score & timer).  
- User value: Provides immediate geographic context and a low-friction entry point — users can search or start guessing without leaving the map.  
- Notes: Light and dark basemaps are shown to demonstrate theming and alternate tile layers; the UI keeps controls visible without covering map content.

### 2) Question card — Prompt & quick actions (light / dark)
![question card](screenshots/question-card.png) ![question card - dark](screenshots/question-card-dark.png)

- What you see: The question card slides up from the bottom with a large prompt and action affordances.  
- User value: Focuses attention on the current question while keeping the map visible for quick, spatial answers (click-to-guess).  
- Notes: The card is keyboard-accessible and designed to be compact so multiple rounds can be completed quickly.

### 3) Timed (bullet) quiz — Score & pacing UI (light / dark)
![timed quiz](screenshots/timed-quiz.png) ![timed quiz - dark](screenshots/timed-quiz-dark.png)

- What you see: Timed round in progress with timer display, a small transient delta (±4 seconds) and the floating score indicator.  
- User value: Adds urgency and spaced repetition — the timer/delta and scoring mechanics encourage quick recall and repeat practice.  
- Notes: The dark theme intentionally adopts subtler button treatments to reduce glare while preserving clear positive/negative feedback (green/red borders).




---

## Purpose & user value

- Teach world geography with immediate visual feedback — users click map features instead of typing long names.
- Low-friction UX for repeated practice: quick questions, a persistent score, and an optional timed mode for more challenge.
- Lightweight and easily deployed as static files — works well in classrooms, workshops, or as a demo on GitHub Pages.

## Key features

- Clickable Leaflet world map with GeoJSON country layers.
- Search bar for direct lookup and zoom-to-country.
- Question generator (uses a curated `top65.json` pool and REST Countries fallback when available).
- Immediate visual feedback: borders turn green (correct) or red (wrong).
- Timed "bullet-quiz" mode with score and brief timer deltas.
- Simple dark-mode toggle using CSS variables.

## UX design & process (concise)

1. Goals:
   - Fast feedback loop (click → result).  
   - Minimal text entry; map-first interaction.  
   - Accessible, with keyboard bindings for search and an unobtrusive UI.

2. Wireframes & mockups:
   - Wireframe A: Full-screen map with floating controls (search, timer, score).  
   - Wireframe B: Question card slides up from bottom; large central prompt and actionable buttons.  
   - Mockup: Visual styling with calming blue accent, rounded cards, and high-contrast borders for correct/wrong states.

3. Iterations & reasoning for changes:
   - Split the original monolithic script into modular files (`map-init.js`, `geo-data.js`, `map-interactions.js`, `bullet-quiz.js`, `uiAnims.js`) to improve maintainability and isolate responsibilities.
   - Replaced transient animations with deterministic border color toggles (green/red). Rationale: SVG/Leaflet animations were brittle across browsers and reduced accessibility; color toggles are robust and immediately visible.
   - Added CSS variables and a theme toggle to support dark mode with minimal duplication.
   - Defensive programming: wrapped risky DOM/animation calls with try/catch to prevent visual helper errors from breaking core logic.



## How it works (technical summary)

- `index.html` — loads Leaflet, app scripts and styles. Script order matters: Leaflet → geo-data → map-init → uiAnims → map-interactions → bullet-quiz.
- `scripts/geo-data.js` — loads local GeoJSON (`assets/custom.geo.json`) and optionally enriches country metadata via REST Countries API. It builds lookup tables used by the quiz generator.
- `scripts/map-init.js` — initializes the Leaflet map and global references.
- `scripts/map-interactions.js` — contains click/hover handlers, card open/close logic, and question generation wiring.
- `scripts/bullet-quiz.js` — timer/score logic for the timed mode.
- `scripts/uiAnims.js` — lightweight helper exposing `markCountryCorrect` / `markCountryWrong`.

## Data and attribution

- Map rendering and interaction: [Leaflet](https://leafletjs.com/) (BSD-2-Clause).  
  - Leaflet CSS/JS is loaded from unpkg in `index.html`.
- Country metadata: REST Countries v3 (used as an optional enrichment source).  
- Curated question pool: `assets/top65.json` (included in repo).  
- Portions of code were adapted from small Leaflet examples and public patterns for GeoJSON layer handling — these are standard usage patterns and are attributed to Leaflet documentation and examples.

## Map Data & Attribution

This project uses map tiles from the following sources:

- **Carto Light Basemap**  
  Tiles © [Carto](https://carto.com/) — Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)

- **Stadia Alidade Smooth Dark Basemap**  
  Tiles © [Stadia Maps](https://stadiamaps.com/) — Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)

## How to run (development)

Requirements: a modern browser and a static file server. You can use the built-in Python server or a simple PowerShell command.

From the project root (PowerShell):

```powershell
# option 1: Python 3 simple server
python -m http.server 8000

# option 2: use PowerShell (serves current directory)
# (requires .NET / PowerShell features available in Windows)
npx http-server -p 8000  # if you have npm and http-server installed
```

Open http://localhost:8000 in your browser.

Notes: If REST Countries is blocked or unavailable, the app falls back to `assets/top65.json` for question generation.

## How to run tests / verify behavior

- Open the console and check for errors during load: ensure Leaflet is loaded before other scripts.  
- Verify clicking a country turns its border green for correct / red for incorrect.  
- Toggle dark mode with the bottom-left button and confirm colors swap.

## File map (important files)

- `index.html` — main single-page shell.  
- `styles/main.css` — app styles and theme variables.  
- `scripts/map-init.js` — map initialization.  
- `scripts/geo-data.js` — GeoJSON loading and country metadata.  
- `scripts/map-interactions.js` — user interaction handlers and quiz wiring.  
- `scripts/bullet-quiz.js` — timed quiz logic.  
- `scripts/uiAnims.js` — minimal visual helper for result coloring.  
- `assets/top65.json` — curated question pool.  
- `assets/custom.geo.json` — GeoJSON file containing country geometry.

## Accessibility & UX considerations

- Reduced-motion preference respected: transient animations were removed and the app uses color/state changes as primary feedback.  
- Buttons include `aria-pressed` and role attributes in the score/timer regions; more ARIA labeling can be added for full screen-reader support.



