/*
 * map-init.js
 *
 * Extracted from the original `map.js` (part 1).
 * Responsibilities:
 * - Create and configure the Leaflet map instance
 * - Initialize global UI DOM references used by the map and quiz
 * - Add base tile layer
 *
 * NOTE: This file is an exact-origin extract and intentionally does not
 * modify any logic. It uses globals (e.g. `map`) the rest of the split files
 * expect to exist. Keep this file loaded before the other map scripts.
 */
/** Globals declared by this file
 * - map: Leaflet map instance
 * - card, sidecard, showBtn, showSideBtn, closeBtn, closeSideBtn: DOM elements
 * - guessedCountries, questionTemplates, currentAnswer, isGuessing, etc.: app state
 */
// Create map
    const map = L.map('map').setView([20, 0], 2);
    //Card vars
    var card = document.getElementById("infoCard");
    var sidecard = document.getElementById("countryCard");
    var showSideBtn = document.getElementById("showSideButton");
    var showBtn = document.getElementById("showButton");
    var closeBtn = document.getElementById("closeCard");
    var closeSideBtn = document.getElementById("closeSideCard");
    //Card info vars
    var cardCountryName = document.getElementById("countryName")
    var cardCapitalName = document.getElementById("capital")
    var cardPopulation = document.getElementById("population")
    var cardArea = document.getElementById("area")
    var cardCurrencyName = document.getElementById("currency")
    var cardTimezone = document.getElementById("timezone")
    let guessedCountries= []
    const questionTemplates = [
        "Which country has {capital} as its capital and is located in {region}?",
        "The country that uses {currencies} as its currency and speaks {languages} is known as what?",
        "Which nation lies in {subregion} and operates in the timezone {timezones}?",
        "The country with a population of around {population} and an area of {area} is called what?",
        "Which country is in the {region} region and has {languages} as its main language?",
        "Identify the country located in {subregion} that uses {currencies} as its currency.",
        "The nation whose capital is {capital} and timezone is {timezones} is which country?",
        "Which country speaks {languages} and belongs to the {region} region?",
        "The country that has {capital} as its capital and primarily uses {currencies} is what?",
        "A country in {region} with a population close to {population} is known as what?"
    ];
    let currentAnswer = null
    let isGuessing = false
    let listOfCountries = {}
    let namesOfCountries = []
    let openedLayer = null
    let guesses = 0
    let infoAboutCountries = {}
    let input = document.getElementById('searchbar')
    let geojson;
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        maxZoom: 6,
        keepBuffer: 10,
        worldCopyJump: true,
        preferCanvas: true,
        minZoom: 3,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
