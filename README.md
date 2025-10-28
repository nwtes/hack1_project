# Learn-the-World — Interactive World Quiz

Learn-the-World is a single-page interactive geography application that helps people learn world countries, capitals and borders through exploration and a timed quiz mode. The app uses a fast Leaflet map, local GeoJSON for map geometry, and public country metadata to present concise country cards and a brisk timed "bullet quiz" experience.

Why this matters — user value
- Learn geography quickly with visual association: click a country on the map to reveal capital, population, area, timezones and currencies.
- Practice recall under pressure with a timed quiz: short rounds and immediate score/timer feedback help build fast memory retrieval.
- Ready for demos and teaching: deterministic demo pool and accessible UI (aria-live, reduced-motion support) make it suitable for classroom or presentation use.

Core features
- Interactive Leaflet world map (local GeoJSON) with hover highlight and click-to-open country card.
- Side card with country details: capital, population, area, currencies, languages and timezones.
- Timed "bullet quiz" mode with score tracking, time deltas (+4 / -4), and visual feedback.
- Search by name or code and quick zoom-to-country functionality.
- Deterministic demo pool (`assets/top65.json`) for reproducible presentations.

Screenshots

Below are placeholder screenshots. Replace the files in `assets/` with real images (suggested names listed) to make this README visual for presentations.

- `assets/screenshot-map.png` — Map view with country hover and search bar

	Description / user value: Shows the full interactive world map with hover highlighting and the search bar centered at the top. Useful for showing immediate exploration value — users can visually locate countries and see adjacency relationships.

- `assets/screenshot-card.png` — Side card opened for a selected country

	Description / user value: Displays the country info side card (capital, population, area, currencies). Demonstrates the teachable moment: learning facts while seeing the country on the map.

- `assets/screenshot-quiz.png` — Bullet quiz running with timer and score

	Description / user value: Shows the timed quiz state with the timer, timer-delta badge, and score UI. Conveys the quick-paced practice mode that drives repeated recall.

Deployment / Run locally (Windows / PowerShell)

1. Open a PowerShell terminal in the project root (where `index.html` lives).

2. Start a lightweight static server. Example using Python 3 (works on most developer machines):

```powershell
python -m http.server 5500
# open http://127.0.0.1:5500/ in your browser
```

3. Alternative: use VS Code Live Server or Node's `http-server` (`npm i -g http-server`) and run `http-server -p 5500`.

Notes:
- Run the server from the project root so relative asset fetches succeed.
- The app fetches external metadata from the REST Countries API — offline usage will still render the map, but some enriched details may be missing.

Architecture (high level)
- `index.html` — page shell and script ordering (Leaflet must load first).
- `styles/main.css` — UI layout, theme and animation keyframes.
- `assets/custom.geo.json` — GeoJSON used to render country shapes.
- `assets/top65.json` — curated, optional quiz pool for deterministic demos.
- `scripts/`:
	- `map-init.js` — initializes the Leaflet map and UI references.
	- `geo-data.js` — loads GeoJSON, enriches country metadata using REST Countries, and builds lookup maps.
	- `map-interactions.js` — search, highlight, click handlers, and the side-card UI.
	- `bullet-quiz.js` — quick timed quiz loop, timer management and score handling.

Data sources and attribution
- Map rendering and interaction: Leaflet (https://leafletjs.com) — BSD-2-Clause license.
- Country metadata: REST Countries API v3 (https://restcountries.com) — public data used under the provider's terms.
- GeoJSON data: included locally in `assets/custom.geo.json` (verify source and license if replacing with external data).

Accessibility and settings
- The UI honors the user's `prefers-reduced-motion` media setting. Animations are subtle and can be toggled in a future settings panel.
- Score and timer elements use `aria-live` regions to announce changes for screen readers.

Troubleshooting (concise, user-facing)
- If countries show "Unknown" for certain fields: ensure the REST Countries fetch completed (check network console) — the map geometry is local but enrichment is fetched remotely.
- If the quiz doesn't start: confirm `index.html` is served over HTTP (some browsers block fetches from `file://`). Use the local server commands above.


How to contribute
- Fork the repository, create a feature branch, and open a PR. Keep changes focused and include screenshots for UI changes.

License
- This repository is released under the MIT License (adjust as needed). Third-party libraries (Leaflet, REST Countries) retain their own terms; attribute them in derivative works.

----

