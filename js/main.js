var none = L.tileLayer('');
var aerial = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var streets = L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
})

// Layers

var counties = VectorTileLayer('https://www.sharedgeo.org/COVID-19/leaflet/data/boundary/{z}/{x}/{y}.pbf', {
  minDetailZoom: 0,
  maxDetailZoom: 8,
  vectorTileLayerStyles: {
    cb_2017_us_county_500k: {
      weight: 1,
      color: '#000000',
      opacity: 0.2,
      fill: false
    }
  }
});

var cases =  VectorTileLayer('https://www.sharedgeo.org/COVID-19/leaflet/data/county_cases/{z}/{x}/{y}.pbf', {
  minDetailZoom: 0,
  maxDetailZoom: 8,
  style: function(f, name) {
    const cases = f.properties.cases;
    const ln_cases = Math.log(cases);
    console.log(ln_cases);
    const gb = 215 - Math.floor(ln_cases * 255 / 7);
    console.log(gb);
    const rgb = (255 << 16) + (gb << 8) + (gb)
    console.log(rgb);
    return ({
      stroke: false,
      fillColor: '#'+rgb.toString(16),
      fill: true
      });
  }
});
cases.bindPopup(function (layer) {
  return L.Util.template('<p><strong>'+ layer.properties.st_name + '</strong><br></p><p>'+ layer.properties.cty_name +' county <br>'+ layer.properties.cases + ' cases<br> Updated: ' + layer.properties.updated_at +' </p>');
});

var boundaries = L.esri.featureLayer({ url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Political_Boundaries_Area/FeatureServer/0'});
boundaries.setStyle({
  color: 'grey',
  weight: 2,
  fill: false
});

////////////////////////////////////
// Bases
var bases = L.esri.featureLayer({ url: "https://geo.dot.gov/server/rest/services/NTAD/Military_Bases/MapServer/0"});
bases.setStyle({
  color: 'green',
  weight: 5,
  fill: true
});
bases.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{SITE_NAME}</strong><br><br>State Territory: {STATE_TERR}</p>', layer.feature.properties);
});

/////////////////////////////////////////////
// fireStations
var fireStationsIcon = L.icon({
	iconUrl: 'data/fireStations.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var fireStations = L.esri.featureLayer({
  url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/ArcGIS/rest/services/Fire_Station/FeatureServer/0",
  where: "STATE = 'MN'",
  pointToLayer: function (geojson, latlng) {
  return L.marker(latlng, {
      icon: fireStationsIcon
    });
  }
   });
fireStations.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIPCODE}</p>', layer.feature.properties);
});

///////////////////////////////////////////
// Hospitals
var hospitalsIcon = L.icon({
	iconUrl: 'data/hospital.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var hospitals = L.esri.featureLayer({
  url: "https://carto.nationalmap.gov/arcgis/rest/services/structures/MapServer/6",
  where: "STATE = 'MN'",
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
      icon: hospitalsIcon
    });
  }
 });
hospitals.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIPCODE}</p>', layer.feature.properties);
});

//////////////////////////////////////////
// Nursing Homes
var nursingHomesIcon = L.icon({
	iconUrl: 'data/nursingHomes.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var nursingHomes = L.esri.featureLayer({
  url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/ArcGIS/rest/services/NursingHomes/FeatureServer/0',
  where: "STATE = 'MN'",
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
        icon: nursingHomesIcon
      });
  }
 });
nursingHomes.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong><br><br>Type: {TYPE}<br>Population: {POPULATION}<br>Description: {NAICS_DESC}<br><br>{ADDRESS}, {CITY} {ZIPCODE}</p>', layer.feature.properties);
});

//////////////////////////////////////////
// Police
var policeIcon = L.icon({
	iconUrl: 'data/policeStations.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var policeStations = L.esri.featureLayer({
  url: 'https://carto.nationalmap.gov/arcgis/rest/services/structures/MapServer/30',
  where: "STATE = 'MN'",
  pointToLayer: function (geojson, latlng) {
  return L.marker(latlng, {
      icon: policeIcon
    });
  }
   });
policeStations.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIPCODE}</p>', layer.feature.properties);
});

/////////////////////////////////////////
// Prisons
var prisonsIcon = L.icon({
	iconUrl: 'data/prisons.svg',
	iconSize: [35, 35],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var prisons = L.esri.featureLayer({
  url: 'https://carto.nationalmap.gov/arcgis/rest/services/structures/MapServer/11',
  where: "STATE = 'MN'",
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
        icon: prisonsIcon
      });
  }
  });
prisons.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIPCODE}</p>', layer.feature.properties);
});

//////////////////////////////////////////
// Public Schools
var publicSchoolsIcon = L.icon({
	iconUrl: 'data/publicSchools.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var publicSchools = L.esri.featureLayer({
  url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Public_Schools/FeatureServer/0',
  where: "STATE = 'MN'",
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
        icon: publicSchoolsIcon
      });
  }
    });
publicSchools.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIPCODE}}</p>', layer.feature.properties);
});

//////////////////////////////////////////
// RedCross
var redCross = L.esri.featureLayer({
  url: 'https://hosting.rcview.redcross.org/arcgis/rest/services/Hosted/ARC_Master_Geography_FY19_January/FeatureServer/3',
  simplifyFactor: 0.5,
  precision: 5
 });
redCross.setStyle({
  color: 'red',
  weight: 2,
  fillColor: '#ffcccb'
});
redCross.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{chapter}</strong><br><br>Region: {region}<br>Division: {division}</p>', layer.feature.properties);
});

///////////////////////////////////////////
// RedCross Facilities
var redCrossFacilitiesIcon = L.icon({
	iconUrl: 'data/redCrossFacilities.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var redCrossFacilities = L.esri.featureLayer({
  url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/American_Red_Cross_Chapter_Facilities/FeatureServer/0',
  where: "STATE = 'MN'",
  pointToLayer: function (geojson, latlng) {
  return L.marker(latlng, {
      icon: redCrossFacilitiesIcon
    });
  }
 });
redCrossFacilities.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong><br><br>Description: {NAICSDESCR}<br><br>{ADDRESS}, {CITY} {ZIP}</p>', layer.feature.properties);
});

////////////////////////////////////////////
// Shelters
var sheltersIcon = L.icon({
	iconUrl: 'data/shelters.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var shelters = L.esri.featureLayer({
  url: "https://gis.fema.gov/arcgis/rest/services/NSS/FEMA_NSS/FeatureServer/5",
  where: "STATE = 'MN'",
  pointToLayer: function (geojson, latlng) {
  return L.marker(latlng, {
      icon: sheltersIcon
    });
  }
 });
shelters.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{SHELTER_NAME}</strong><br><br>{ADDRESS_1}, {CITY} {ZIP}</p>', layer.feature.properties);
});

/////////////////////////////////////////
// veterans
var vaIcon = L.icon({
	iconUrl: 'data/va.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var va = L.esri.featureLayer({
  url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Veterans_Health_Administration_Medical_Facilities/FeatureServer/0',
  where: "STATE = 'MN'",
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
        icon: vaIcon
      });
  }
 });
va.bindPopup(function (layer) {
  return L.Util.template("<p><strong>{NAME}</strong><br><br>Description: {NAICSDESCR}<br><br>{ADDRESS}, {CITY} {ZIPCODE}</p>", layer.feature.properties);
});





/////////////////////////////////////////
// Airports
var airportsIcon = L.icon({
	iconUrl: 'data/airport.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var airports = L.esri.featureLayer({
  url: "https://geo.dot.gov/server/rest/services/NTAD/Airports/MapServer/0",
  where: "STATE = 'MN'",
  pointToLayer: function (geojson, latlng) {
  return L.marker(latlng, {
      icon: airportsIcon
    });
  }
 });
airports.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{Fac_Name}</strong></p>', layer.feature.properties);
});

// Add it all together
var mymap = L.map('mapid', {
  center: [45.9, -93.6],
  zoom: 6,
  layers: [boundaries, none]
  // layers: [counties, cases, boundaries, none]
});


var sidebar = L.control.sidebar('sidebar').addTo(mymap);
// mymap.on('zoomend', function() {
//     if (mymap.getZoom() < 8){
//             mymap.removeLayer(airports);
//     }
//     else {
//             mymap.addLayer(airports);
//         }
// });
// L.control.layers(base, null).addTo(mymap);

// Basemap logic

$("input[type='checkbox']").change(function() {
  var layerClicked = $(this).attr("id")
  switch (layerClicked) {
    case "counties":
      toggleLayer(this.checked, counties)
    break;
    case "cases":
      toggleLayer(this.checked, cases)
    break;
    case "airports":
      toggleLayer(this.checked, airports)
    break;
    case "redCrossFacilities":
      toggleLayer(this.checked, redCrossFacilities);
    break;
    case "redCross":
      toggleLayer(this.checked, redCross);
    break;
    case "fireStations":
      toggleLayer(this.checked, fireStations);
    break;
    case "hospitals":
      toggleLayer(this.checked, hospitals);
    break;
    case "bases":
      toggleLayer(this.checked, bases);
    break;
    case "boundaries":
      toggleLayer(this.checked, boundaries);
    break;
    case "nursingHomes":
      toggleLayer(this.checked, nursingHomes);
    break;
    case "policeStations":
      toggleLayer(this.checked, policeStations);
    break;
    case "prisons":
      toggleLayer(this.checked, prisons);
    break;
    case "publicSchools":
      toggleLayer(this.checked, publicSchools);
    break;
    case "shelters":
      toggleLayer(this.checked, shelters);
    break;
    case "va":
      toggleLayer(this.checked, va);
    break;
  }
});

function toggleLayer(checked, layer) {
	if (checked) {
  	mymap.addLayer(layer);
    layer.bringToFront();
  } else {
  	mymap.removeLayer(layer);
  }
}



$("input[type='radio']").change(function() {
  var radioClicked = $(this).attr("id")
  switch (radioClicked) {
    case "none":
      mymap.removeLayer(streets);
      mymap.removeLayer(aerial);
      mymap.addLayer(none);
      none.bringToBack();
    break;
    case "aerial":
      mymap.removeLayer(streets);
      mymap.removeLayer(none);
      mymap.addLayer(aerial);
      aerial.bringToBack();
    break;
    case "streets":
      mymap.removeLayer(none);
      mymap.removeLayer(aerial);
      mymap.addLayer(streets);
      streets.bringToBack();
    break;
  }
});
// mymap.on('zoomend', function() {
//   var zoomlevel = mymap.getZoom();
//   if (zoomlevel > 7){
//     console.log("zoomed too far out")
//     if (mymap.hasLayer(airports)) mymap.removeLayer(airports);
//     document.querySelector("input[id=airports]").checked = false;
//     if (mymap.hasLayer(fireStations)) mymap.removeLayer(fireStations);
//     if (mymap.hasLayer(hospitals)) mymap.removeLayer(hospitals);
//   }
//   else {
//     if (document.querySelector("input[id=airports]").checked && !mymap.hasLayer(airports)) mymap.addLayer(airports);
//     if (document.querySelector("input[id=fireStations]").checked && !mymap.hasLayer(fireStations)) mymap.addLayer(fireStations);
//     if (document.querySelector("input[id=hospitals]").checked && !mymap.hasLayer(hospitals)) mymap.addLayer(hospitals);
//   }
// });

// var displayDate = '2020-03-24';
// $.getJSON('https://www.sharedgeo.org/COVID-19/leaflet/data/covid-19-cases.json')
//  .done( data => {
//   VectorTileLayer('https://www.sharedgeo.org/COVID-19/leaflet/data/state_county/{z}/{x}/{y}.pbf', {
//     minDetailZoom: 0,
//     maxDetailZoom: 8,
//     style: function(f, name) {
//       const state = f.properties.st_name;
//       const county = f.properties.cty_name;
//
//       let r = 255;
//       let g = 255;
//       let b = 255;
//       if(data[state] &&
//          data[state]["counties"] &&
//          data[state]["counties"][county] &&
//          data[state]["counties"][county][displayDate]) {
//         const cases = data[state]["counties"][county][displayDate];
//         const ln_cases = Math.log(cases);
//         if (ln_cases <= 7.0) {
//           r = 255;
//           g = b = 215 - Math.floor(ln_cases * 255 / 7);
//         } else {
//           const b = (ln_cases - 7) * (255 / 5);
//           const g = 0;
//           const r = 255 - (b / 2);
//         }
//       }
//       const rgb = (255 << 16) + (g << 8) + (b);
//
//       return ({
//         stroke: false,
//         fillColor: '#'+rgb.toString(16),
//         fill: true
//       });
//     }
//   });
// });

// mymap.on('zoomend', function () {
// var zoomlevel = mymap.getZoom();
//     if (zoomlevel < 10){
//         if (mymap.hasLayer(airports)) {
//             mymap.removeLayer(airports);
//         } else {
//             console.log("no point layer active");
//         }
//     }
//     if (zoomlevel >= 10){
//         if (mymap.hasLayer(airports)){
//             console.log("layer already added");
//         } else {
//             mymap.addLayer(airports);
//         }
//     }
// console.log("Current Zoom Level =" + zoomlevel)
// });

  // query?outFields=*&where=UPPER(STATE)%20like%20'%25MN%25'
