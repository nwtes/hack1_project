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
fetch('assets/custom.geo.json')
  .then(res => res.json())
  .then(data => {
    /** Create geojson layer and register feature handlers */
    geojson = L.geoJSON(data, {
      style: { weight: 0, fillOpacity: 0 },
      onEachFeature: (feature, layer) => {
        if (!feature.properties.iso_a3) feature.properties.iso_a3 = 'Unknown';
        namesOfCountries.push(feature.properties.iso_a3);
        listOfCountries[feature.properties.name] = layer;
        listOfFeatures[feature.properties.name] = feature;
        layer._permanent = false;

        const onMouseOut = (e) => {
          const layer = e.target;
          if (layer._permanent) return;
          resetCountry(e);
        };

        const onMouseOn = (e) => {
          if (isGuessing) {
            return;
          } else if (openedLayer) {
            if (openedLayer == e.target) {
              return;
            } else {
              highlightCountry(e);
            }
          } else {
            highlightCountry(e);
          }
        };

        layer.on({ mouseover: onMouseOn, mouseout: onMouseOut, click: () => clickCountry(feature, layer) });
      }
    }).addTo(map);
  })
  .catch(err => { console.error('Failed to load custom.geo.json', err); });
/**
 * Load manual top pool (optional whitelist of guessable cca3 codes).
 * When present `window.topPool` will be an array of uppercase cca3 strings
 * and `generateRandomQuestion` will prefer this pool.
 */
// Load manual top pool (optional whitelist of guessable cca3 codes)
fetch('assets/top65.json')
  .then(r => r.json())
  .then(arr => {
    // store as an uppercase array for predictable matching
    window.topPool = Array.isArray(arr) ? arr.map(s => String(s).toUpperCase()) : [];
  })
  .catch(() => {
    window.topPool = [];
  });
    // Initializing info about countries
  fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,borders,population,area,languages,currencies,cca3,timezones').then(res => {
    if(!res.ok) throw new Error("Failed to fetch data about countries");
      return res.json();
  })
  .then(data=> {
    data.forEach(country => {
            const cca3 = country.cca3;
            infoAboutCountries[cca3] = {
                country: country.name.common || 'Unknown',
                capital: country.capital?.[0] || 'Unknown',
                region: country.region || 'Unknown',
                borders: resolveBordersArray(country.borders),
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
      listOfCca3[cca3] = country.name.common;
        })
       
        
  });
  function resolveBordersArray(borders){
    if(!Array.isArray(borders) || borders.length === 0) return 'noone';
    return borders
    .map(code => {
      if(!code) return null;
      const key = String(code).trim().toUpperCase()
      //console.log(key)
      const name = cca3Resolver(key)
      return name
      
    }).filter(Boolean).join(", ")
  }
  function cca3Resolver(cca3) {
  if (!cca3) return undefined;
  const key = String(cca3).trim().toUpperCase();
  if (typeof listOfCca3 === 'object' && listOfCca3) {
    return listOfCca3[key];
  }
  return undefined;
}
