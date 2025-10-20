// Create map
    const map = L.map('map').setView([20, 0], 2);
    let listOfCountries = {}
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
        console.log(feature.properties.name)
        map.fitBounds(layer.getBounds(),{animate: true})
    }
    function capitalize(s){
        const first = s.charAt(0)
        const firstCap = first.toUpperCase()
        const remain = s.slice(1)
        return firstCap + remain
    }