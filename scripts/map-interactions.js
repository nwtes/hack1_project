/*
 * map-interactions.js
 *
 * Extracted from the original `map.js` (part 3).
 * Responsibilities:
 * - Wire input handlers, helpers, highlight/reset, click behavior
 * - Question generation and card UI listeners
 *
 * NOTE: This file is an extract and relies on globals declared in
 * `map-init.js` and `geo-data.js`. It must be loaded after them.
 */
try {
    input.addEventListener('keydown', (e) => {
        try {
            if (e.key == 'Enter') {
                const text = input.value;
                const layer = listOfCountries[capitalize(text.toLowerCase())];
                const feature = listOfFeatures[capitalize(text.toLowerCase())];
                if (layer == null || feature == null) {
                    // not found
                } else {
                    map.fitBounds(layer.getBounds(), { animate: true });
                    openCountryCard(layer, feature);
                }
                input.value = '';
            }
        } catch (err) {
            console.error('search input handler error', err);
        }
    });
} catch (err) {
    console.warn('search input not available or failed to bind', err);
}
(function () {
      try {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;
        const body = document.body;
    // initialize from localStorage
        const saved = localStorage.getItem('zxctest.theme');
        if (saved === 'dark') body.classList.add('dark-mode');
        function updateButton() {
          const isDark = body.classList.contains('dark-mode');
          btn.textContent = isDark ? '☀️' : '🌙';
          btn.setAttribute('aria-pressed', String(isDark));
          btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
        }
                btn.addEventListener('click', function () {
          const nowDark = body.classList.toggle('dark-mode');
                    // swap base layers (light/dark) if they exist
                    try { map.removeLayer(nowDark ? lightLayer : darkLayer); } catch(e) {}
                    try { map.addLayer(nowDark ? darkLayer : lightLayer); } catch(e) {}
          try { localStorage.setItem('zxctest.theme', nowDark ? 'dark' : 'light'); } catch (e) {}
          updateButton();
        });
        updateButton();
      } catch (err) {
        console.warn('theme toggler init failed', err);
      }
    }());   
    
    /**
     * highlightCountry
     * Highlight a country feature visually on mouseover by adjusting style
     * and bring it to the front so it is visible above neighbouring layers.
     * @param {Object} e - Leaflet event with `target` layer
     */
function highlightCountry(e) {
    try {
        const isDark = body.classList.contains('dark-mode');
        const layer = e.target;
        if (!layer) return;
        if (typeof layer.setStyle === 'function') layer.setStyle(isDark ? { color: '#a5a3a3ff', weight: 1, fillOpacity: 0.5 } : { color: '#555', weight: 1, fillOpacity: 0.2 });
        if (typeof layer.bringToFront === 'function') layer.bringToFront();
    } catch (err) {
        console.error('highlightCountry error', err);
    }
    
}
    /**
     * resetCountry
     * Reset a feature's style to its default appearance (used on mouseout)
     * @param {Object} e - Leaflet event with `target` layer
     */
function resetCountry(e) {
    try {
        const layer = e.target;
        if (!layer) return;
        if (geojson && typeof geojson.resetStyle === 'function') geojson.resetStyle(layer);
    } catch (err) {
        console.error('resetCountry error', err);
    }
}
    /**
     * resetCountryBylayer
     * Reset the style of the provided layer instance (used when clearing guesses)
     * @param {L.Layer} layer - Leaflet layer to reset
     */
function resetCountryBylayer(layer) {
    try {
    if (!layer) return;
        if (layer._permanent == true) layer._permanent = false;
        if (geojson && typeof geojson.resetStyle === 'function') geojson.resetStyle(layer);
    } catch (err) {
        console.error('resetCountryBylayer error', err);
    }
}
function extractCca3FromFeature(feature) {
    const props = feature && feature.properties ? feature.properties : {};
    const sentinels = new Set(['-99', -99, null, undefined, '']);
    const candidates = ['iso_a3', 'iso_a3_eh', 'wb_a3', 'un_a3', 'cca3', 'cca_3', 'ISO_A3'];
    for (const key of candidates) {
        let res = props[key];
        if (res === undefined) {
            res = props[key.toLowerCase()] ?? props[key.toUpperCase()];
        }
        if (sentinels.has(res)) continue;
        if (typeof res === 'number') continue;
        if (typeof res === 'string') {
            const str = res.trim();
            if (!str) continue;
            return str.toUpperCase();
        }
    }
    
    return null;
}
    /**
     * clickCountry
     * Called when a country feature is clicked. If the app is in guessing mode
     * this checks the guess and applies correct/incorrect styling; otherwise it
     * opens the country info card and zooms to the feature.
     * @param {Object} feature - GeoJSON feature object
     * @param {L.Layer} layer - Leaflet layer for the feature
     */
function clickCountry(feature, layer) {
    try {
        if (!isGuessing && !isGameStarted) {
            if (layer && typeof layer.getBounds === 'function') map.fitBounds(layer.getBounds(), { animate: true });
            openCountryCard(layer, feature);
        } else if (isGuessing && !isGameStarted) {
            // allow up to 4 wrong guesses (guesses counts wrong attempts)
            if (guesses < 4) {
                const pickedName = feature && feature.properties ? String(feature.properties.name).trim() : '';
                const expected = currentAnswer ? String(currentAnswer).trim() : '';
                if (pickedName && expected && pickedName === expected) {
                    guessedCountries.push(layer);
                    layer._permanent = true;
                    if (typeof layer.setStyle === 'function') layer.setStyle({ color: 'green', weight: 1, fillOpacity: 0.2 });
                    try { if (window.uiAnim && typeof window.uiAnim.markCountryCorrect === 'function') window.uiAnim.markCountryCorrect(layer); } catch (e) { console.warn('uiAnim.markCountryCorrect failed', e); }
                    showInfoModal('Correct', 'You are correct!', [
                        { text: 'Continue', className: 'timer-btn', onClick: () => { try { closeCard(); } catch (e) {} } }
                    ]);
                } else {
                    guesses++;
                    guessedCountries.push(layer);
                    layer._permanent = true;
                    if (typeof layer.setStyle === 'function') layer.setStyle({ color: 'red', weight: 1, fillOpacity: 0.2 });
                }
            } else {
                showInfoModal('No more guesses', 'You failed to guess the correct country', [
                    { text: 'Close', className: 'timer-btn', onClick: () => { try { closeCard(); } catch (e) {} } }
                ]);
            }
        } else if (isGameStarted) {
            if (feature && feature.properties && feature.properties.name === currentAnswer) {
                if (clickResolver) clickResolver(feature.properties.name);
                try { if (window.uiAnim && typeof window.uiAnim.markCountryCorrect === 'function') window.uiAnim.markCountryCorrect(layer); } catch (e) { console.warn('uiAnim.markCountryCorrect failed', e); }
            } else {
                if (clickResolver) clickResolver('FAIL');
                try { if (window.uiAnim && typeof window.uiAnim.markCountryWrong === 'function') window.uiAnim.markCountryWrong(layer); } catch (e) { console.warn('uiAnim.glowBrief failed', e); }
            }
        }
    } catch (err) {
        console.error('clickCountry error', err);
    }
    }
    /**
     * capitalize
     * Capitalize the first character of a string (simple helper used by search)
     * @param {string} s - input string
     * @returns {string} capitalized string
     */
function capitalize(s) {
    if (!s) return;
    const remain = s.slice(1);
    const first = s.charAt(0);
    const firstCap = first.toUpperCase();
    return firstCap + remain;
}

/**
 * showInfoModal
 * Small helper to show a modal styled like the timed-quiz end modal.
 * Buttons is an array of objects: { text, className, onClick }
 */
function showInfoModal(title, message, buttons = []) {
    try {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        const h = document.createElement('h2');
        h.textContent = title;
        const p = document.createElement('p');
        p.textContent = message;
        const actions = document.createElement('div');
        actions.className = 'modal-actions';

        buttons.forEach(b => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = b.className || 'timer-btn';
            btn.textContent = b.text || 'OK';
            btn.addEventListener('click', () => {
                try { if (typeof b.onClick === 'function') b.onClick(); } catch (e) { console.warn(e); }
                try { overlay.remove(); } catch (e) {}
            });
            actions.appendChild(btn);
        });

        modal.appendChild(h);
        modal.appendChild(p);
        modal.appendChild(actions);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        return overlay;
    } catch (err) {
        console.warn('showInfoModal failed', err);
        return null;
    }
}
    /**
     * fillTemplate
     * Replace placeholders like {key} in a template string using values from
     * the provided data object. Missing or null values become "Unknown".
     * @param {string} template - template with {placeholders}
     * @param {Object} data - data object to pull values from
     * @returns {string} filled template
     */
function fillTemplate(template, data) {
    if (!data) {
        return template.replace(/{(\w+)}/g, () => "Unknown");
    }
    return template.replace(/{(\w+)}/g, (_, key) => {
        const v = data[key];
        if (v === undefined || v === null) return "Unknown";
        // If value is an object/array, stringify it sensibly
        if (typeof v === 'object') {
            try { return JSON.stringify(v); } catch (e) { return String(v); }
        }
        return String(v);
    });
}
    /**
     * openCountryCard
     * Populate and display the side card with basic information for the
     * selected GeoJSON feature.
     * @param {Object} feature - GeoJSON feature with properties used for display
     */
function openCountryCard(layer, feature) {
    try {
        let isDark = body.classList.contains('dark-mode');
        closeCard();
        const code = extractCca3FromFeature(feature)
        const info = code ? infoAboutCountries[code] : 'Undefined'
        if (!info) return;
        // populate side card with country info
        if (openedLayer) {
            resetCountryBylayer(openedLayer);
        }
        if (typeof layer.setStyle === 'function') layer.setStyle(isDark ? { color: '#10a3ddff', weight: 1, fillOpacity: 0.2 } : { color: '#16106bff', weight: 1, fillOpacity: 0.2 });
        layer._permanent = true;
        if (sidecard && typeof sidecard.classList === 'object') sidecard.classList.add('show');
        openedLayer = layer;
        if (cardCountryName) cardCountryName.textContent = info['country'];
        if (cardCapitalName) cardCapitalName.textContent = info['capital'];
        if (cardPopulation) cardPopulation.textContent = info['population'];
        if (cardArea) cardArea.textContent = info['area'];
        if (cardCurrencyName) cardCurrencyName.textContent = info['currencies'];
        if (cardTimezone) cardTimezone.textContent = info['timezones'];
    } catch (err) {
        console.error('openCountryCard error', err);
    }
}

    /**
     * generateRandomQuestion
     * Create a QA pair by selecting a country (prefer the manual topPool if
     * available) and filling a random question template with that country's
     * metadata.
     * @returns {[string, string]} [questionText, answerText]
     */
function generateRandomQuestion() {
    try {
        const i_question = Math.floor(Math.random() * questionTemplates.length);
        const qaPair = [];
        const template = questionTemplates[i_question];

    // Prefer the manual topPool whitelist when present
    let pickedCca3 = null;
    if (window.topPool && Array.isArray(window.topPool) && window.topPool.length > 0) {
        const pick = window.topPool[Math.floor(Math.random() * window.topPool.length)];
        // Attempt to find a matching entry in namesOfCountries or infoAboutCountries
        // namesOfCountries contains geojson iso_a3; infoAboutCountries keyed by cca3
        if (infoAboutCountries && infoAboutCountries[pick]) {
            pickedCca3 = pick;
        } else if (namesOfCountries.includes(pick)) {
            pickedCca3 = pick;
        } else {
            // Fallback: try to find a cca3 in infoAboutCountries whose key matches case-insensitively
            const maybe = Object.keys(infoAboutCountries || {}).find(k => k.toUpperCase() === String(pick).toUpperCase());
            if (maybe) pickedCca3 = maybe;
        }
    }

    // Fallback
    let countryKey;
    if (pickedCca3) {
        countryKey = pickedCca3;
    } else {
        const i_country = Math.floor(Math.random() * namesOfCountries.length);
        countryKey = namesOfCountries[i_country];
    }

        const country_info = (infoAboutCountries && infoAboutCountries[countryKey]) || { country: countryKey };
        const question = fillTemplate(template, country_info);

        qaPair[0] = question;
        qaPair[1] = country_info.country;
        return qaPair;
    } catch (err) {
        console.error('generateRandomQuestion error', err);
        return ['(question unavailable)', null];
    }
}
    /**
     * closeCard
     * Close the question/info card, reset guessing state and clear any
     * temporary highlights applied to guessed countries.
     */
function closeCard() {
    try {
        currentAnswer = null;
        isGuessing = false;
        if (isGameStarted) {
            endGame();
        }
        if (card && card.classList) card.classList.remove('show');
        if (showBtn) showBtn.style.display = 'block';
        if (guessedCountries) {
            guessedCountries.forEach((layer) => {
                resetCountryBylayer(layer);
            });
        }
        guessedCountries = [];
    } catch (err) {
        console.error('closeCard error', err);
    }
}

function closeSideCard() {
    try {
        if (sidecard) sidecard.classList.remove('show');
        if (openedLayer) {
            try { resetCountryBylayer(openedLayer); } catch (e) { console.warn('resetCountryBylayer error', e); }
        }
        if (showSideBtn) showSideBtn.style.display = 'block';
        openedLayer = null;
    } catch (err) { console.error('closeSideBtn handler error', err); }
}


if (typeof showBtn === 'undefined' || !showBtn) showBtn = document.getElementById('showButton') || document.getElementById('showBtn');
if (typeof closeBtn === 'undefined' || !closeBtn) closeBtn = document.getElementById('closeCard') || document.getElementById('closeBtn');
if (typeof showSideBtn === 'undefined' || !showSideBtn) showSideBtn = document.getElementById('showSideButton') || document.getElementById('showSideBtn') || document.querySelector('.show-side-btn');
if (typeof closeSideBtn === 'undefined' || !closeSideBtn) closeSideBtn = document.getElementById('closeSideCard');

if (showBtn) showBtn.type = 'button';
if (closeBtn) closeBtn.type = 'button';
if (showSideBtn) showSideBtn.type = 'button';
if (closeSideBtn) closeSideBtn.type = 'button';
if (showQuizBtn) showQuizBtn.type = 'button';

if (showBtn) {
    showBtn.addEventListener('click', () => {
        try {
            closeSideCard();
            isGuessing = true;
            if (card) card.classList.add('show');
            showBtn.style.display = 'none';
            const question = generateRandomQuestion();
            document.getElementById('card-text').textContent = question[0] || '';
            currentAnswer = question[1] || null;
        } catch (err) {
            console.error('showBtn handler error', err);
        }
    });
} else {
    console.warn('show button not found');
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        try { closeCard(); } catch (err) { console.error('closeBtn handler error', err); }
    });
}

if (showSideBtn) {
    showSideBtn.addEventListener('click', () => {
        try {
            if (sidecard) sidecard.classList.add('show');
            showSideBtn.style.display = 'none';
        } catch (err) { console.error('showSideBtn handler error', err); }
    });
}

if (closeSideBtn) {
    closeSideBtn.addEventListener('click', () => {
        closeSideCard();
    });
} else {
    console.warn('close side button not found');
}
if (showQuizBtn) {
    showQuizBtn.addEventListener('click', () => {
        // placeholder for quiz button handler
        startGame();
    });
}
