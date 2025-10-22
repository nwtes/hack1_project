/*
 * geo-data.js
 *
 * Extracted from the original `map.js` (part 2).
 * Responsibilities:
 * - Load local GeoJSON (`assets/custom.geo.json`) and create the Leaflet geoJSON layer
 * - Populate `namesOfCountries` and `listOfCountries` maps used for lookup
 * - Fetch REST Countries data to populate `infoAboutCountries`
 *
 * NOTE: This file is an exact-origin extract and intentionally does not
 * modify any logic. It relies on globals declared in `map-init.js`.
 */
  /**
   * Initialize world borders layer from local GeoJSON and register per-feature
   * event handlers (hover, click). Populates `namesOfCountries` and
   * `listOfCountries` used by the rest of the app.
   */
  // Initiazlizing world borders and array of countries
    fetch('assets/custom.geo.json')
      .then(res => res.json())
      .then(data => {
        geojson = L.geoJSON(data, {
          style: { weight:0, fillOpacity:0 },
          onEachFeature: (feature, layer) => {
            if(!feature.properties.iso_a3) feature.properties.iso_a3 = 'Unknown'
            namesOfCountries.push(feature.properties.iso_a3)
            listOfCountries[feature.properties.name] = layer
            layer._permanent = false
            const onMouseOut = (e) => {
                const layer = e.target
                if(layer._permanent) return
                resetCountry(e)
            };

            const onMouseOn = (e) => {
            if (isGuessing) {
                // during guessing, avoid hover visual noise
                return;
            } else {
                highlightCountry(e);
            }
            };
            layer.on(
            {
                mouseover: onMouseOn,
                mouseout: onMouseOut,
                click: () => clickCountry(feature,layer)
            }
            );
          }
        }).addTo(map);
      });
/**
 * Load manual top pool (optional whitelist of guessable cca3 codes).
 * When present `window.topPool` will be an array of uppercase cca3 strings
 * and `generateRandomQuestion` will prefer this pool.
 */
// Load manual top pool (optional whitelist of guessable cca3 codes)
fetch('assets/top65.json')
  .then(r => r.json())
  .then(arr => {
    // store as a Set for faster lookup
    window.topPool = Array.isArray(arr) ? arr.map(s => String(s).toUpperCase()) : [];
    console.log('Loaded topPool with', window.topPool.length, 'entries');
  })
  .catch(() => {
    window.topPool = [];
    console.log('No topPool found or failed to load');
  });
    // Initializing info about countries
    fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,borders,population,area,languages,currencies,cca3,timezones').then(res => {
        if(!res.ok) throw new Error("Failed to fetch data about countries")
            return res.json()
    })
    .then(data=> {
        console.log(data)
        data.forEach(country => {
            const cca3 = country.cca3;
            infoAboutCountries[cca3] = {
                country: country.name.common || 'Unknown',
                capital: country.capital?.[0] || 'Unknown',
                region: country.region || 'Unknown',
                borders: Array.isArray(country.borders) && country.borders.length > 0
                ? country.borders.join(", ")
                : "noone",
                population: country.population?.toLocaleString() || 'Unknown',
                area: country.area?.toLocaleString() + " km" || 'Unknown',
                languages: country.languages ? Object.values(country.languages).join(", ")
                : 'Unknown',
                cca3: cca3 || 'Unknown',
                currencies: country.currencies
                ? Object.values(country.currencies)
                .map(c => c.name)
                .join(", ") : "Unknown",
                timezones: country.timezones ? Object.values(country.timezones).join(", ")
                : "Unknown"
            }
            console.log(country.cca3 + " borders with " + infoAboutCountries[cca3].borders) 
            //console.log(infoAboutCountries[name])
        })
        
    })  
