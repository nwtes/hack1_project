/*
 * map-interactions.js
 *
 * Extracted from the original `map.js` (part 3).
 * Responsibilities:
 * - Wire input handlers, helpers, highlight/reset, click behavior
 * - Question generation and card UI listeners
 *
 * NOTE: This file is an exact-origin extract and intentionally does not
 * modify any logic. It relies on globals declared in `map-init.js` and
 * `geo-data.js` and must be loaded after them.
 */
input.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        const text = input.value;
        const layer = listOfCountries[capitalize(text.toLowerCase())];
        if (layer == null) {
            console.log('Not found');
        } else {
            map.fitBounds(layer.getBounds(), { animate: true });
        }
        input.value = '';
    }
});
   
    
    /**
     * highlightCountry
     * Highlight a country feature visually on mouseover by adjusting style
     * and bring it to the front so it is visible above neighbouring layers.
     * @param {Object} e - Leaflet event with `target` layer
     */
function highlightCountry(e) {
    const layer = e.target;
    layer.setStyle({ color: '#555', weight: 1, fillOpacity: 0.2 });
    layer.bringToFront();
}
    /**
     * resetCountry
     * Reset a feature's style to its default appearance (used on mouseout)
     * @param {Object} e - Leaflet event with `target` layer
     */
function resetCountry(e) {
    const layer = e.target;
    geojson.resetStyle(layer);
}
    /**
     * resetCountryBylayer
     * Reset the style of the provided layer instance (used when clearing guesses)
     * @param {L.Layer} layer - Leaflet layer to reset
     */
function resetCountryBylayer(layer) {
    if (layer._permanent == true) layer._permanent = false;
    geojson.resetStyle(layer);
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
        //const layer = e.target
        if(!isGuessing){
            //console.log(feature.properties.name)
            map.fitBounds(layer.getBounds(),{animate: true})
            openCountryCard(layer,feature)
        }else{
            
            if(guesses <= 4){
                if (feature.properties.name == currentAnswer) {
                    guessedCountries.push(layer);
                    layer._permanent = true;
                    layer.setStyle({ color: 'green', weight: 1, fillOpacity: 0.2 });
                    closeCard();
                    alert("You're correct");
                } else {
                    guesses++;
                    guessedCountries.push(layer);
                    layer._permanent = true;
                    layer.setStyle({ color: 'red', weight: 1, fillOpacity: 0.2 });
                }
            }else{
                //handle not guessing in 5 times
                alert('You failed to guess the correct country');
                closeCard();
            }
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
     * fillTemplate
     * Replace placeholders like {key} in a template string using values from
     * the provided data object. Missing or null values become "Unknown".
     * @param {string} template - template with {placeholders}
     * @param {Object} data - data object to pull values from
     * @returns {string} filled template
     */
function fillTemplate(template, data) {
        // Safe placeholder replacement:
        // - If `data` is falsy, replace every placeholder with 'Unknown'.
        // - Otherwise, replace each {key} with the string value of data[key]
        //   or 'Unknown' if the property is missing.
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
    closeCard();
    const info = infoAboutCountries[feature.properties.iso_a3];
    if (!info) return;
    //Add correct data here
    if (openedLayer) {
        resetCountryBylayer(openedLayer);
    }
    layer.setStyle({ color: '#16106bff', weight: 1, fillOpacity: 0.2 });
    layer._permanent = true;
    sidecard.classList.add("show");
    openedLayer = layer;
    console.log(info);
    cardCountryName.textContent = info['country'];
    cardCapitalName.textContent = info['capital'];
    cardPopulation.textContent = info['population'];
    cardArea.textContent = info['area'];
    cardCurrencyName.textContent = info['currencies'];
    cardTimezone.textContent = info['timezones'];
}
    /**
     * generateRandomQuestion
     * Create a QA pair by selecting a country (prefer the manual topPool if
     * available) and filling a random question template with that country's
     * metadata.
     * @returns {[string, string]} [questionText, answerText]
     */
function generateRandomQuestion() {
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

    const country_info = infoAboutCountries[countryKey] || { country: countryKey };
    const question = fillTemplate(template, country_info);

    qaPair[0] = question;
    qaPair[1] = country_info.country;
    return qaPair;
}
    /**
     * closeCard
     * Close the question/info card, reset guessing state and clear any
     * temporary highlights applied to guessed countries.
     */
function closeCard() {
    currentAnswer = null;
    isGuessing = false;
    card.classList.remove("show");
    showBtn.style.display = "block";
    if (guessedCountries) {
        guessedCountries.forEach((layer) => {
            resetCountryBylayer(layer);
        });
    }
    guessedCountries = [];
}

function closeSideCard() {
    try {
        console.log('closeSideBtn pressed');
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
    });
}
