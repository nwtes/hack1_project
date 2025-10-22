// Create map
    const map = L.map('map').setView([20, 0], 2);
    const card = document.getElementById("infoCard");
    const showBtn = document.getElementById("showButton");
    const closeBtn = document.getElementById("closeCard");
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

    // Initiazlizing world borders and array of countries
    fetch('assets/custom.geo.json')
      .then(res => res.json())
      .then(data => {
        geojson = L.geoJSON(data, {
          style: { weight:0, fillOpacity:0 },
          onEachFeature: (feature, layer) => {
            namesOfCountries.push(feature.properties.name)
            listOfCountries[feature.properties.name] = layer
            layer.on(
                {
                    mouseover: highlightCountry,
                    mouseout: resetCountry,
                    click: () => clickCountry(feature,layer)
                }
            );
          }
        }).addTo(map);
      });
    // Initializing info about countries
    fetch('https://restcountries.com/v3.1/all?fields=name,capital,region,subregion,population,area,languages,currencies,flags,timezones').then(res => {
        if(!res.ok) throw new Error("Failed to fetch data about countries")
            return res.json()
    })
    .then(data=> {
        console.log(data)
        data.forEach(country => {
            const name = country.name?.common;
            infoAboutCountries[name] = {
                country: name || 'Unknown',
                capital: country.capital?.[0] || 'Unknown',
                region: country.region || 'Unknown',
                subregion: country.subregion || 'Unknown',
                population: country.population?.toLocaleString() || 'Unknown',
                area: country.area?.toLocaleString() + " km" || 'Unknown',
                languages: country.languages ? Object.values(country.languages).join(", ")
                : 'Unkonwn',
                currencies: country.currencies
                ? Object.values(country.currencies)
                .map(c => c.name)
                .join(", ") : "Unknown",
                timezones: country.timezones ? Object.values(country.timezones).join(", ")
                : "Unknown"
            }
            //console.log(infoAboutCountries[name])
        })
        
    })  

    input.addEventListener('keydown' , (e) => {
        if(e.key == 'Enter'){
            layer = listOfCountries[capitalize(input.value)]
            if (layer == null){
                console.log('Not found')
            }else{
                map.fitBounds(layer.getBounds(), {animate:true})
            }
            input.value = '';
        }
        }
        
    )  
   
    
    function highlightCountry(e){
        const layer = e.target
        layer.setStyle(
            {
                color: '#555', weight: 1, fillOpacity: 0.2
            }
        )
        layer.bringToFront()
    }
    function resetCountry(e){
        const layer = e.target
        geojson.resetStyle(layer)
    }
    function clickCountry(feature,layer){
        //const layer = e.target
        if(!isGuessing){
            console.log(feature.properties.name)
            map.fitBounds(layer.getBounds(),{animate: true})
        }else{
            if(feature.properties.name == currentAnswer){
                console.log("Player guessed: " + feature.properties.name)
            }else{
                console.log("Wrong answer, correct answer is: " + currentAnswer)
            }
        }
    }
    function capitalize(s){
        const first = s.charAt(0)
        const firstCap = first.toUpperCase()
        const remain = s.slice(1)
        return firstCap + remain
    }
    function fillTemplate(template, data) {
        return template.replace(/{(\w+)}/g, (_, key) => data[key] || "Unknown");
    }

    function generateRandomQuestion(){
        const i_country = Math.floor(Math.random() * namesOfCountries.length);
        const i_question = Math.floor(Math.random() * questionTemplates.length);
        const qaPair = []
        const template = questionTemplates[i_question]
        const country = namesOfCountries[i_country]
        const country_info = infoAboutCountries[country]
        let question = fillTemplate(template,country_info)

        
        qaPair[0] = question
        qaPair[1] = country_info.country
        return qaPair
    }


    showBtn.addEventListener("click", () => {
        isGuessing = true  
        card.classList.add("show");
        showBtn.style.display = "none";
        question = generateRandomQuestion()
        document.getElementById("card-text").textContent = question[0]
        currentAnswer = question[1]
    });

    closeBtn.addEventListener("click", () => {
        currentAnswer = null
        isGuessing = false
        card.classList.remove("show");
        showBtn.style.display = "block";
    });