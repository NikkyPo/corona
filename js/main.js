// Basemap layers
var base = {
  'None': L.tileLayer(''),
  'Aerial':  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }),
  'Streets': L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  })
};

// Layers
var boundaries = L.esri.featureLayer({ url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Political_Boundaries_Area/FeatureServer/0'});
boundaries.setStyle({
  color: 'grey',
  weight: 2,
  fill: false
});
var hospitals = L.esri.featureLayer({
  url: 'https://carto.nationalmap.gov/arcgis/rest/services/structures/MapServer/6',
  pointToLayer: function (geojson, latlng) {
    return L.circleMarker(latlng, {
      radius: 5,
      stroke: true, //true/false for stroke
      color: '#3388ff', //stroke color
      opacity: 1, //a value between 0 and 1
      weight: 3, //stroke weight
      fillColor: '#3288ff', //HEX or color name
      fillOpacity: .7, //opacity 0-1 of fill
    });
  }
 });
hospitals.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});
var va = L.esri.featureLayer({
  url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Veterans_Health_Administration_Medical_Facilities/FeatureServer/0',
  pointToLayer: function (geojson, latlng) {
    return L.circleMarker(latlng, {
      radius: 5,
      stroke: true, //true/false for stroke
      color: '#f03b20', //stroke color
      opacity: 1, //a value between 0 and 1
      weight: 3, //stroke weight
      fillColor: '#ffeda0', //HEX or color name
      fillOpacity: .7, //opacity 0-1 of fill
    });
  }
 });
va.bindPopup(function (layer) {
  return L.Util.template("<p><strong>{NAME}</strong><br><embed type='video/webm' src='https://www.sharedgeo.org/COVID-19/img/covid19-conus.webm' width='100%'' height='100%''></p>", layer.feature.properties);
});
var nursingHomes = L.esri.featureLayer({
  url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/ArcGIS/rest/services/NursingHomes/FeatureServer/0',
  pointToLayer: function (geojson, latlng) {
    return L.circleMarker(latlng, {
      radius: 5,
      stroke: true, //true/false for stroke
      color: '#2ca25f', //stroke color
      opacity: 1, //a value between 0 and 1
      weight: 3, //stroke weight
      fillColor: '#e5f5f9', //HEX or color name
      fillOpacity: .7, //opacity 0-1 of fill
    });
  }
 });
nursingHomes.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});
var prisons = L.esri.featureLayer({ url: 'https://carto.nationalmap.gov/arcgis/rest/services/structures/MapServer/11' });
prisons.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});
var publicSchools = L.esri.featureLayer({ url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Public_Schools/FeatureServer/0' });
publicSchools.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});
var policeStations = L.esri.featureLayer({ url: 'https://carto.nationalmap.gov/arcgis/rest/services/structures/MapServer/30/query' });
policeStations.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});
var fireStations = L.esri.featureLayer({ url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Fire_Stations/FeatureServer/0" });
fireStations.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});
var redCross = L.esri.featureLayer({ url: 'https://hosting.rcview.redcross.org/arcgis/rest/services/Hosted/ARC_Master_Geography_FY19_January/FeatureServer/3' });
redCross.setStyle({
  color: 'green',
  weight: 3,
  fill: true
});
redCross.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{chapter}</strong></p>', layer.feature.properties);
});
var redCrossFacilities = L.esri.featureLayer({ url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/American_Red_Cross_Chapter_Facilities/FeatureServer/0/query?outFields=*&where=1%3D1' });
redCrossFacilities.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong></p>', layer.feature.properties);
});
var shelters = L.esri.featureLayer({ url: "https://gis.fema.gov/arcgis/rest/services/NSS/FEMA_NSS/FeatureServer/5/" });
shelters.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{SHELTER_NAME}</strong></p>', layer.feature.properties);
});
var bases = L.esri.featureLayer({ url: "https://geo.dot.gov/server/rest/services/NTAD/Military_Bases/MapServer/0" });
bases.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{SITE_NAME}</strong></p>', layer.feature.properties);
});
var airports = L.esri.featureLayer({ url: "https://geo.dot.gov/server/rest/services/NTAD/Airports/MapServer/0" });
airports.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{Fac_Name}</strong></p>', layer.feature.properties);
});

// Add it all together
var mymap = L.map('mapid', {
  center: [45.9, -93.6],
  zoom: 6,
  layers: [base.None]
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
        // $(this).removeClass('selected');
        mymap.removeLayer(boundaries);
    } else {
        mymap.addLayer(boundaries);
        // $(this).addClass('selected');
   }
});
$("#hospitals").click(function(event) {
    if(mymap.hasLayer(hospitals)) {
        // $(this).removeClass('selected');
        mymap.removeLayer(hospitals);
    } else {
        mymap.addLayer(hospitals);
        // $(this).addClass('selected');
   }
});
$("#va").click(function(event) {
    if(mymap.hasLayer(va)) {
        // $(this).removeClass('selected');
        mymap.removeLayer(va);
    } else {
        mymap.addLayer(va);
        // $(this).addClass('selected');
   }
});
$("#nursingHomes").click(function(event) {
    if(mymap.hasLayer(nursingHomes)) {
        // $(this).removeClass('selected');
        mymap.removeLayer(nursingHomes);
    } else {
        mymap.addLayer(nursingHomes);
        // $(this).addClass('selected');
   }
});
$("#prisons").click(function(event) {
    if(mymap.hasLayer(prisons)) {
        // $(this).removeClass('selected');
        mymap.removeLayer(prisons);
    } else {
        mymap.addLayer(prisons);
        // $(this).addClass('selected');
   }
});
$("#publicSchools").click(function(event) {
    if(mymap.hasLayer(publicSchools)) {
        // $(this).removeClass('selected');
        mymap.removeLayer(publicSchools);
    } else {
        mymap.addLayer(publicSchools);
        // $(this).addClass('selected');
   }
});
$("#policeStations").click(function(event) {
    if(mymap.hasLayer(policeStations)) {
        // $(this).removeClass('selected');
        mymap.removeLayer(policeStations);
    } else {
        mymap.addLayer(policeStations);
        // $(this).addClass('selected');
   }
});
$("#fireStations").click(function(event) {
    if(mymap.hasLayer(fireStations)) {
        // $(this).removeClass('selected');
        mymap.removeLayer(fireStations);
    } else {
        mymap.addLayer(fireStations);
        // $(this).addClass('selected');
   }
});
$("#redCross").click(function(event) {
    if(mymap.hasLayer(redCross)) {
        // $(this).removeClass('selected');
        mymap.removeLayer(redCross);
    } else {
        mymap.addLayer(redCross);
        // $(this).addClass('selected');
   }
});
$("#redCrossFacilities").click(function(event) {
    if(mymap.hasLayer(redCrossFacilities)) {
        // $(this).removeClass('selected');
        mymap.removeLayer(redCrossFacilities);
    } else {
        mymap.addLayer(redCrossFacilities);
        // $(this).addClass('selected');
   }
});
$("#shelters").click(function(event) {
    if(mymap.hasLayer(shelters)) {
        // $(this).removeClass('selected');
        mymap.removeLayer(shelters);
    } else {
        mymap.addLayer(shelters);
        // $(this).addClass('selected');
   }
});
$("#bases").click(function(event) {
    if(mymap.hasLayer(bases)) {
        // $(this).removeClass('selected');
        mymap.removeLayer(bases);
    } else {
        mymap.addLayer(bases);
        // $(this).addClass('selected');
   }
});
$("#airports").click(function(event) {
    if(mymap.hasLayer(airports)) {
        // $(this).removeClass('selected');
        mymap.removeLayer(airports);
    } else {
        mymap.addLayer(airports);
        // $(this).addClass('selected');
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
