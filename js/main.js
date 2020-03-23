// Basemap layers
// var base = {
//   'None': L.tileLayer(''),
//   'Aerial':  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
//     attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
//   }),
//   'Streets': L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//   })
// };

var none = L.tileLayer('');
var aerial = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var streets = L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
})

// Layers
var boundaries = L.esri.featureLayer({ url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Political_Boundaries_Area/FeatureServer/0'});
boundaries.setStyle({
  color: 'grey',
  weight: 2,
  fill: false
});

// Hospitals
var hospitalsIcon = L.icon({
	iconUrl: 'data/hospital.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var hospitals = L.esri.featureLayer({
  url: 'https://carto.nationalmap.gov/arcgis/rest/services/structures/MapServer/6',
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
      icon: hospitalsIcon
    });
  }
 });
hospitals.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});

// veterans
var vaIcon = L.icon({
	iconUrl: 'data/va.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var va = L.esri.featureLayer({
  url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Veterans_Health_Administration_Medical_Facilities/FeatureServer/0',
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
        icon: vaIcon
      });
  }
 });
va.bindPopup(function (layer) {
  return L.Util.template("<p><strong>{NAME}</strong><br><embed type='video/webm' src='https://www.sharedgeo.org/COVID-19/img/covid19-conus.webm' width='100%'' height='100%''></p>", layer.feature.properties);
});

// Nursing Homes
var nursingHomesIcon = L.icon({
	iconUrl: 'data/nursingHomes.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var nursingHomes = L.esri.featureLayer({
  url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/ArcGIS/rest/services/NursingHomes/FeatureServer/0',
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
        icon: nursingHomesIcon
      });
  }
 });
nursingHomes.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});

// Prisons
var prisonsIcon = L.icon({
	iconUrl: 'data/prisons.svg',
	iconSize: [15, 15],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var prisons = L.esri.featureLayer({
  url: 'https://carto.nationalmap.gov/arcgis/rest/services/structures/MapServer/11',
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
        icon: prisonsIcon
      });
  }
  });
prisons.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});

// Public Schools
var publicSchoolsIcon = L.icon({
	iconUrl: 'data/publicSchools.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var publicSchools = L.esri.featureLayer({
  url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Public_Schools/FeatureServer/0',
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
        icon: publicSchoolsIcon
      });
  }
    });
publicSchools.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});

// Police
var policeIcon = L.icon({
	iconUrl: 'data/policeStations.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var policeStations = L.esri.featureLayer({
  url: 'https://carto.nationalmap.gov/arcgis/rest/services/structures/MapServer/30/query',
  pointToLayer: function (geojson, latlng) {
  return L.marker(latlng, {
      icon: policeIcon
    });
  }
   });
policeStations.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});

// fireStations
var fireStationsIcon = L.icon({
	iconUrl: 'data/fireStations.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var fireStations = L.esri.featureLayer({
  url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Fire_Stations/FeatureServer/0",
  pointToLayer: function (geojson, latlng) {
  return L.marker(latlng, {
      icon: fireStationsIcon
    });
  }
   });
fireStations.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});

// RedCross
var redCross = L.esri.featureLayer({ url: 'https://hosting.rcview.redcross.org/arcgis/rest/services/Hosted/ARC_Master_Geography_FY19_January/FeatureServer/3' });
redCross.setStyle({
  color: 'red',
  weight: 2,
  fill: false
});
redCross.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{chapter}</strong></p>', layer.feature.properties);
});

// RedCross Facilities
var redCrossFacilitiesIcon = L.icon({
	iconUrl: 'data/redCrossFacilities.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var redCrossFacilities = L.esri.featureLayer({
  url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/American_Red_Cross_Chapter_Facilities/FeatureServer/0/query?outFields=*&where=1%3D1',
  pointToLayer: function (geojson, latlng) {
  return L.marker(latlng, {
      icon: redCrossFacilitiesIcon
    });
  }
 });
redCrossFacilities.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});

// Shelters
var sheltersIcon = L.icon({
	iconUrl: 'data/shelters.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var shelters = L.esri.featureLayer({
  url: "https://gis.fema.gov/arcgis/rest/services/NSS/FEMA_NSS/FeatureServer/5/",
  pointToLayer: function (geojson, latlng) {
  return L.marker(latlng, {
      icon: sheltersIcon
    });
  }
 });
shelters.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{SHELTER_NAME}</strong></p>', layer.feature.properties);
});

// Bases
var bases = L.esri.featureLayer({ url: "https://geo.dot.gov/server/rest/services/NTAD/Military_Bases/MapServer/0"});
bases.setStyle({
  color: 'green',
  weight: 5,
  fill: true
});
bases.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{SITE_NAME}</strong></p>', layer.feature.properties);
});

// Airports
var airportsIcon = L.icon({
	iconUrl: 'data/airport.svg',
	iconSize: [25, 25],
  iconAnchor: [16, 37],
  popupAnchor: [0, -28]
});
var airports = L.esri.featureLayer({
  url: "https://geo.dot.gov/server/rest/services/NTAD/Airports/MapServer/0",
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
  layers: [none]
});

// var overlayMaps = {
//   "Boundaries": boundaries,
//   "Hospitals/Medical Centers": mrdsLayer,
//   "Veterans Health Administration Medical Facilities": va,
//   "Nursing Homes": nursingHomes,
//   "Prisons": prisons,
//   "Public Schools (Minnesota)": publicSchools,
//   "Police Stations": policeStations,
//   "Fire Stations (Minnesota)": fireStations,
//   "American Red Cross Chapter Regions": redCross,
//   "American Red Cross Chapter Facilities": redCrossFacilities,
//   "Minnesota Shelter System Facilities": shelters,
//   "Military Bases": bases,
//   "Minnesota Airports": airports
// }

$("#boundaries").click(function(event) {
    if(mymap.hasLayer(boundaries)) {
        mymap.removeLayer(boundaries);
    } else {
        mymap.addLayer(boundaries);
   }
});
$("#hospitals").click(function(event) {
    if(mymap.hasLayer(hospitals)) {
        mymap.removeLayer(hospitals);
    } else {
        mymap.addLayer(hospitals);
   }
});
$("#va").click(function(event) {
    if(mymap.hasLayer(va)) {
        mymap.removeLayer(va);
    } else {
        mymap.addLayer(va);
   }
});
$("#nursingHomes").click(function(event) {
    if(mymap.hasLayer(nursingHomes)) {
        mymap.removeLayer(nursingHomes);
    } else {
        mymap.addLayer(nursingHomes);
   }
});
$("#prisons").click(function(event) {
    if(mymap.hasLayer(prisons)) {
        mymap.removeLayer(prisons);
    } else {
        mymap.addLayer(prisons);
   }
});
$("#publicSchools").click(function(event) {
    if(mymap.hasLayer(publicSchools)) {
        mymap.removeLayer(publicSchools);
    } else {
        mymap.addLayer(publicSchools);
   }
});
$("#policeStations").click(function(event) {
    if(mymap.hasLayer(policeStations)) {
        mymap.removeLayer(policeStations);
    } else {
        mymap.addLayer(policeStations);
   }
});
$("#fireStations").click(function(event) {
    if(mymap.hasLayer(fireStations)) {
        mymap.removeLayer(fireStations);
    } else {
        mymap.addLayer(fireStations);
   }
});
$("#redCross").click(function(event) {
    if(mymap.hasLayer(redCross)) {
        mymap.removeLayer(redCross);
    } else {
        mymap.addLayer(redCross);
   }
});
$("#redCrossFacilities").click(function(event) {
    if(mymap.hasLayer(redCrossFacilities)) {
        mymap.removeLayer(redCrossFacilities);
    } else {
        mymap.addLayer(redCrossFacilities);
   }
});
$("#shelters").click(function(event) {
    if(mymap.hasLayer(shelters)) {
        mymap.removeLayer(shelters);
    } else {
        mymap.addLayer(shelters);
   }
});
$("#bases").click(function(event) {
    if(mymap.hasLayer(bases)) {
        mymap.removeLayer(bases);
    } else {
        mymap.addLayer(bases);
   }
});
$("#airports").click(function(event) {
    if(mymap.hasLayer(airports)) {
        mymap.removeLayer(airports);
    } else {
        mymap.addLayer(airports);
   }
});

// Basemap logic
$("#none").click(function(event) {
    if(mymap.hasLayer(none)) {
      console.log("has layer")
    } else {
      mymap.removeLayer(streets);
      mymap.removeLayer(aerial);
      mymap.addLayer(none);
   }
});

$("#aerial").click(function(event) {
    if(mymap.hasLayer(aerial)) {
      console.log("has layer")
    } else {
      mymap.removeLayer(streets);
      mymap.removeLayer(none);
      mymap.addLayer(aerial);

   }
});

$("#streets").click(function(event) {
    if(mymap.hasLayer(streets)) {
      console.log("has layer")
    } else {
      mymap.removeLayer(none);
      mymap.removeLayer(aerial);
      mymap.addLayer(streets);
   }
});

mymap.addLayer(boundaries)
var sidebar = L.control.sidebar('sidebar').addTo(mymap);
// L.control.layers(base, null).addTo(mymap);

// $("input[type='checkbox']").click(function(event) {
//     event.preventDefault();
//     console.log(event.target.id)
//     if(mymap.hasLayer(mrdsLayer)) {
//         // $(this).removeClass('selected');
//         mymap.removeLayer(mrdsLayer);
//     } else {
//         mymap.addLayer(mrdsLayer);
//         // $(this).addClass('selected');
//    }
// });
// mymap.on('zoomend', function() {
// var zoomlevel = mymap.getZoom();
//     if (zoomlevel  <10){
//         if (mymap.hasLayer(hospitals)) {
//             mymap.removeLayer(hospitals);
//         } else {
//             console.log("no point layer active");
//         }
//     }
//     if (zoomlevel >= 10){
//         if (mymap.hasLayer(hospitals)){
//             console.log("layer already added");
//         } else {
//             mymap.addLayer(hospitals);
//         }
//     }
// console.log("Current Zoom Level =" + zoomlevel)
// });




  // query?outFields=*&where=UPPER(STATE)%20like%20'%25MN%25'
