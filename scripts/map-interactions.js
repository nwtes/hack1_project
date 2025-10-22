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
    input.addEventListener('keydown' , (e) => {
        if(e.key == 'Enter'){
            text = input.value
            layer = listOfCountries[capitalize(text.toLowerCase())]
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
    function resetCountryBylayer(layer){
        geojson.resetStyle(layer)
    }
    function clickCountry(feature,layer){
        //const layer = e.target
        if(!isGuessing){
            console.log(feature.properties.name)
            map.fitBounds(layer.getBounds(),{animate: true})
            openCountryCard(feature)
        }else{
            
            if(guesses <= 4){
                if(feature.properties.name == currentAnswer){
                    guessedCountries.push(layer)
                    layer._permanent = true
                    layer.setStyle({
                        color: 'green', weight: 1, fillOpacity: 0.2
                    })
                    closeCard()
                    alert("You're correct")
                }else{
                    guesses++
                    guessedCountries.push(layer)
                    layer._permanent = true
                    layer.setStyle({
                        color: 'red', weight: 1, fillOpacity: 0.2
                    })
                }
            }else{
                //handle not guessing in 5 times
                alert('You failed to guess the correct country')
                closeCard()
            }
        }
    }
    function capitalize(s){
        const remain = s.slice(1)
        const first = s.charAt(0)
        const firstCap = first.toUpperCase()
        return firstCap + remain
    }
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
    function openCountryCard(feature){
        //Add correct data here
        sidecard.classList.add("show")
        document.getElementById("countryName").textContent = feature.properties.name
        document.getElementById("capital").textContent = feature.properties.name
        document.getElementById("population").textContent = feature.properties.name 
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
    function closeCard(){
        currentAnswer = null
        isGuessing = false
        card.classList.remove("show");
        showBtn.style.display = "block";
        guessedCountries.forEach((layer) => {
            resetCountryBylayer(layer)
        })
        guessedCountries = []
    }
    // Card listeners
    showBtn.addEventListener("click", () => {
        isGuessing = true  
        card.classList.add("show");
        showBtn.style.display = "none";
        question = generateRandomQuestion()
        document.getElementById("card-text").textContent = question[0]
        currentAnswer = question[1]
    });

    closeBtn.addEventListener("click", () => { 
        closeCard()
    });

    showSideBtn.addEventListener("click", () => {
        //sidecard.classList.add("show")
        showSideButton.style.display("none")
    })
    closeSideBtn.addEventListener("click" , () => {
        sidecard.classList.remove("show");
        showSideBtn.style.display("block")
    })
