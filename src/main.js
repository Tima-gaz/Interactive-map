mapboxgl.accessToken = accessToken;

let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    zoom: 3.5,
    center: [87.106481, 57.983614],
    pitch: 30,
    bearing: 0
})

let nav = new mapboxgl.NavigationControl({
    showCompass: true,
    showZoom: true
});

map.addControl(nav,"bottom-right")


function arrangeData(obj) {
  let regionNames = Object.keys(obj);
  let regionCoords = Object.values(obj);
  let array = []

  function GData(regionName, coordArray) {
    this.regionName = regionName;
    this.coordArray = coordArray;
  }
  
  for (let j = 0; j < regionCoords.length; j++) {
    let areas = Object.values(regionCoords[j])
    if(areas.length >= 0) {
      for(let ar of areas) {
        
        for (let area of ar) {
          [area[0], area[1]] =  [area[1], area[0]]
        }
      }
      let areasData = new GData(regionNames[j], areas)
      array.push(areasData)
      
    }
  }

  return array
}

let regs = arrangeData(russia);

let description = document.getElementById('description')

map.on('load', function () {
    // Add a data source containing GeoJSON data.
    let i = 0
    for (let reg of regs) {
      i++
      let textString= `${reg.regionName}
        Население:${regionsData[i-1].Population} 
        Площадь:${regionsData[i-1].Area}
        `
      map.addSource('maine' + i, {
        'type': 'geojson',
        'data': {
        'type': 'Feature',
        'properties': {
            'description': `${textString}`
        },
        'geometry': {
        'type': 'Polygon',
        // These coordinates outline Maine.
        "coordinates": reg.coordArray
        }
        }
        });

        map.addLayer({
          'id': 'maine'+i,
          'type': 'fill',
          'source': 'maine'+i, // reference the data source
          'layout': {},
          'paint': {
          'fill-color': '#0080ff', // blue color fill
          'fill-opacity': 0.1
          }
          });

        let popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
          });
           
          map.on('mouseenter', 'maine' + i, function (e) {
          // Change the cursor style as a UI indicator.
          map.getCanvas().style.cursor = 'pointer';
          let coordinates = e.features[0].geometry.coordinates.slice();
          let description = e.features[0].properties.description;
           
          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }
           
          // Populate the popup and set its coordinates
          // based on the feature found.

          popup.setLngLat(e.lngLat).setHTML(description).addTo(map);
          });
           
          map.on('mouseleave', 'maine' + i, function () {
          map.getCanvas().style.cursor = '';
          popup.remove();
          });
         
        // Add a new layer to visualize the polygon.

        // Add a black outline around the polygon.
        map.addLayer({
        'id': 'outline' + i,
        'type': 'line',
        'source': 'maine' + i,
        'layout': {},
        'paint': {
        'line-color': '#000',
        'line-width': 1.5
        }
        })
    }

});


