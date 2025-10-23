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
    var showQuizBtn = document.getElementById("quizButton");
    //Card info vars
    var cardCountryName = document.getElementById("countryName");
    var cardCapitalName = document.getElementById("capital");
    var cardPopulation = document.getElementById("population");
    var cardArea = document.getElementById("area");
    var cardCurrencyName = document.getElementById("currency");
    var cardTimezone = document.getElementById("timezone");
    let guessedCountries= [];
    const questionTemplates = [
        "Which country has {capital} as its capital and is part of the {region} region?",
    "The nation that speaks {languages} and uses {currencies} as its currency is known as what?",
    "Which country borders {borders} and lies in the {region} region?",
    "Identify the country whose capital is {capital} and whose primary language is {languages}.",
    "What country operates in the timezone {timezones} and uses {currencies}?",
    "Which nation in the {region} region has a population around {population}?",
    "The country with the capital city {capital} and a population close to {population} is called what?",
    "Which country speaks {languages} and lies in the timezone {timezones}?",
    "Name the nation that has an area of about {area} and is located in {region}.",
    "What country borders {borders} and mainly speaks {languages}?",
    "The country in {region} whose currency is {currencies} is known as what?",
    "Which country has {borders} as neighboring countries and uses {currencies}?",
    "Identify the country located in the {region} region that speaks {languages}.",
    "Which nation has a population of around {population} and uses {currencies}?",
    "The country that speaks {languages} and has {capital} as its capital is which one?",
    "Which country lies in the {region} region and borders {borders}?",
    "What country operates in {timezones} and has a population close to {population}?",
    "The nation with {population} inhabitants and mainly speaking {languages} is called what?",
    "Which country has {capital} as its capital and uses {currencies} as official money?",
    "Which country located in {region} has an area of approximately {area}?"
    ];
    let currentAnswer = null;
    let isGuessing = false;
    let listOfCountries = {};
    let namesOfCountries = [];
    let openedLayer = null;
    let guesses = 0;
    let infoAboutCountries = {};
    let input = document.getElementById('searchbar');
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
