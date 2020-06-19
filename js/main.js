/////////////////////////////////////////
// basemaps
var none = L.tileLayer('');
var aerial = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var streets = L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
});

/////////////////////////////////////////
// Counties
var counties = VectorTileLayer('https://www.sharedgeo.org/COVID-19/leaflet/data/boundary/{z}/{x}/{y}.pbf', {
  minDetailZoom: 0,
  maxDetailZoom: 8,
  vectorTileLayerStyles: {
    cb_2017_us_county_500k: {
      weight: 1,
      color: '#808080',
      opacity: 0.2,
      fill: false,
    }
  }
});

///////////////////////////////////////////////////
// Covid layer and Date Controls
  let displayDate;
  let min;
  let max;
  let day;

  function getval( callback ){
     $.getJSON('https://www.sharedgeo.org/COVID-19/leaflet/data/covid-19-cases.json', function(data) {
         // We can't use .return because return is a JavaScript keyword.
         const st = data[Object.keys(data)[0]];
         const maxDate = Object.keys(st.statewide).slice(-1)[0];
         callback(maxDate);
     });
  }

    getval( function ( value ) {
      displayDate = moment(value).format('YYYY-MM-DD');

      $("#date").attr("max", displayDate)
      $("#date").attr("value", displayDate)

      min = moment($("#date").attr("min"));
      max = moment($("#date").attr("max"));
      day = moment(max);
  });


  $("#date").change(function() {
    displayDate = $("#date").val();
    mymap.eachLayer( l => {
      if(l.options.attribution && l.options.attribution.startsWith("COVID"))
        l.redraw();
    } );
  });


$.getJSON('https://www.sharedgeo.org/COVID-19/leaflet/data/covid-19-cases.json')
 .done( data => {

  cases = VectorTileLayer('https://www.sharedgeo.org/COVID-19/leaflet/data/state_county/{z}/{x}/{y}.pbf', {
    minDetailZoom: 0,
    maxDetailZoom: 8,
    attribution: "COVID-19 data is from the New York Times <a href='https://www.nytimes.com/interactive/2020/us/coronavirus-us-cases.html'>Dashboard</a> <a href='https://github.com/nytimes/covid-19-data'>Data Source</a>  <a href='https://creativecommons.org/licenses/by-nc/4.0/'>CC-BY-NC</a>",
    style: function(f, name) {

      const state = f.properties.st_name;
      const county = f.properties.cty_name;
      const population = f.properties.tot_pop;

      let color_index = 0;
      // From https://github.com/d3/d3-scale-chromatic/blob/master/src/colors.js
    colors = function(specifier) {
      var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
      while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
      return colors;
    };

    // From https://github.com/d3/d3-scale-chromatic/blob/master/src/sequential-multi/viridis.js
    var magma_colors = colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf");

    if(data[state] &&
      data[state]["counties"] &&
      data[state]["counties"][county] &&
      data[state]["counties"][county][displayDate]) {
      const cases = 100000.0 * data[state]["counties"][county][displayDate] / population;
      const log_cases = (cases > 1) ? Math.log10(cases) : 0;
      color_index = Math.min(Math.floor(log_cases * 64), 255);
    }
    return ({
      stroke: false,
      fillColor: magma_colors[color_index],
      fill: true,
      fillOpacity: 0.7
     });
    },
    zIndex: 1
  });
   cases.addTo(mymap);
 });


  function showNextDay() {
    if (day < max) {
      day.add(1, 'days');
    } else {
      day = moment(min);
    }
    $("#date").val(day.format('YYYY-MM-DD')).change();
  }

  function showPreviousDay() {
    if (day > min) {
      day.add(-1, 'days');
    } else {
      day = moment(max);
    }
    $("#date").val(day.format('YYYY-MM-DD')).change();
  }

  var timer = null;
  function startAnimation() {
    if (timer == null) {
      timer = setInterval( showNextDay, 2000 );
    }
  }
  function stopAnimation() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

/////////////////////////////////////////
// Political boundaries
var boundaries = L.esri.featureLayer({ url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Political_Boundaries_Area/FeatureServer/0'});
boundaries.setStyle({
  color: '#808080',
  weight: 2,
  fill: false
});

/////////////////////////////////////////
// Airports
$.getJSON('data/airport/airport.geojson')
 .done( data => {
   airports = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["Certified"]) {
         case "Yes":
           var airport_com = L.icon({
           	iconUrl: 'data/airport/airport_com.svg',
           	iconSize: [20, 20],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: airport_com}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{FacilityName}</strong><br>{City}, {State}<br>{LocationID}<br><br><a target="_blank" href="{QuickRef}">Quick reference</a><br><a target="_blank" href="{airportURL}">Detailed airport reference</a></p>', layer.feature.properties);
           });
         case "":
           var airport_non_com = L.icon({
           	iconUrl: 'data/airport/airport_non_com.svg',
           	iconSize: [20, 20],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: airport_non_com}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{FacilityName}</strong><br>{City}, {State}<br>{LocationID}<br><br><a target="_blank" href="{QuickRef}">Quick reference</a><br><a target="_blank" href="{airportURL}">Detailed airport reference</a></p>', layer.feature.properties);
           });
         case "Military":
           var airport_military = L.icon({
             iconUrl: 'data/airport/airport_military.svg',
             iconSize: [20, 20],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: airport_military}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{FacilityName}</strong><br>{City}, {State}<br>{LocationID}<br><br><a target="_blank" href="{airportURL}">Detailed airport reference</a></p>', layer.feature.properties);
           });
       }
  }
})
});


//////////////////////////////////////////
// Assisted Living: boarding care homes, housing with services, nursing homes and supervised living facilities

var boardingCareHomesIcon = L.icon({
	iconUrl: 'data/assistedLiving/boardingCareHomes.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -8]
});

$.getJSON('data/assistedLiving/boardingCareHomes.geojson')
 .done( data => {
   boardingCareHomes = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {icon: boardingCareHomesIcon}).bindPopup(function (feature) {
            return L.Util.template('<p><strong>{NAME}</strong><br>\n'+
            'Health Facility ID Number: {HFID}<br><br>\n'+
            '{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br> \n'+
            'County: {COUNTY_NAME}<br><br>\n'+
            'Phone: {TELEPHONE}<br> \n'+
            'Fax: {FAX}<br><br> \n'+
            'License Type: {LIC_TYPE}<br>\n'+
            'Administrator: {ADMINISTRATOR}<br><br>\n'+
            'State Licensed Nursing Home beds:<strong> {NH_BEDS}</strong><br>\n'+
            'State Licensed Boarding Care Home beds:<strong> {BCH_BEDS}</strong><br>\n'+
            'Federal Medicare Skilled Nursing Facility beds: <strong>{SNF_BEDS}</strong><br>\n'+
            'Federal Medicare/Medicaid Dual Skilled Nursing Facility and Nursing Facility beds:<strong> {SNFNF_BEDS}</strong><br>\n'+
            'Federal Medicaid Nursing Facility beds (Nursing Home): <strong>{NF2_BEDS}</strong><br><br>\n'+
            '<a target="_blank" href="https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html"><button>Health Regulation provider Data fields</button></a>\n'+
            '</p>', feature.feature.properties);
          });
  }
})
});

var housingWithServicesIcon = L.icon({
	iconUrl: 'data/assistedLiving/housingWithServices.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -8]
});

$.getJSON('data/assistedLiving/housingWithServices.geojson')
 .done( data => {
   housingWithServices = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {icon: housingWithServicesIcon}).bindPopup(function (feature) {
            return L.Util.template('<p><strong>{NAME}</strong><br>\n'+
            'Health Facility ID Number: {HFID}<br><br>\n'+
            '{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br> \n'+
            'County: {COUNTY_NAME}<br><br>\n'+
            'Phone: {TELEPHONE}<br>\n'+
            'Fax: {FAX}<br><br> \n'+
            'License Type: {LIC_TYPE}<br>\n'+
            'Administrator: {ADMINISTRATOR}<br><br>\n'+
            '<a target="_blank" href="https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html"><button>Health Regulation provider Data fields</button></a>\n'+
            '</p>', feature.feature.properties);
          });
  }
})
});

var nursingHomesIcon = L.icon({
	iconUrl: 'data/assistedLiving/nursingHomes.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -8]
});

$.getJSON('data/assistedLiving/nursingHomes.geojson')
 .done( data => {
   nursingHomes = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {icon: nursingHomesIcon}).bindPopup(function (feature) {
            return L.Util.template('<p><strong>{NAME}</strong><br>\n'+
            'Health Facility ID Number: {HFID}<br><br>\n'+
            '{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br> \n'+
            'County: {COUNTY_NAME}<br><br>\n'+
            'Phone: {TELEPHONE}<br> \n'+
            'Fax: {FAX}<br><br> \n'+
            'License Type: {LIC_TYPE}<br>\n'+
            'Administrator: {ADMINISTRATOR}<br><br>\n'+
            'State licensed Hospital beds: <strong>{HOSP_BEDS}</strong><br>\n'+
            'Infant Bassinets: <strong>{BASS_BEDS}</strong><br>\n'+
            'State Licensed Boarding Care Home beds: <strong>{BCH_BEDS}</strong><br>\n'+
            'Federal Medicare Certified Hospital beds: <strong>{HOSP18_BEDS}</strong><br>\n'+
            'Federal Medicare Critical Access Hospital:<strong> {CAH}</strong><br>\n'+
            'Hospital Swing Bed Provider:<strong> {SWING}</strong><br>\n'+
            'State Licensed Nursing Home beds:<strong> {NH_BEDS}</strong><br>\n'+
            'Federal Medicare Skilled Nursing Facility beds: <strong>{SNF_BEDS}</strong><br>\n'+
            'Federal Medicare/Medicaid Dual Skilled Nursing Facility and Nursing Facility beds: <strong>{SNFNF_BEDS}</strong><br><br>\n'+
            '<a target="_blank" href="https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html"><button>Health Regulation provider Data fields</button></a>\n'+
            '</p>', feature.feature.properties);
          });
  }
})
});

var supervisedLivingFacilitiesIcon = L.icon({
	iconUrl: 'data/assistedLiving/supervisedLivingFacilities.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -8]
});

$.getJSON('data/assistedLiving/supervisedLivingFacilities.geojson')
 .done( data => {
   supervisedLivingFacilities = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {icon: supervisedLivingFacilitiesIcon}).bindPopup(function (feature) {
            return L.Util.template('<p><strong>{NAME}</strong><br>\n'+
            'Health Facility ID Number: {HFID}<br><br>\n'+
            '{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br> \n'+
            'County: {COUNTY_NAME}<br><br>\n'+
            'Phone: {TELEPHONE}<br> \n'+
            'Fax: {FAX}<br><br> \n'+
            'License Type: {LIC_TYPE}<br>\n'+
            'Administrator: {ADMINISTRATOR}<br><br>\n'+
            'Supervised Living Facility Class A beds: <strong>{SLFA_BEDS}</strong><br>\n'+
            'Supervised Living Facility Class B beds:<strong> {SLFB_BEDS}</strong><br>\n'+
            'Other beds:<strong> {OTHER_BEDS}</strong><br>\n'+
            'Psychiatric beds:<strong>  {PSY18_BEDS}</strong><br>\n'+
            'Intermediate Care Facility Mental Retardation beds: <strong>{ICFMR_BEDS}</strong><br><br>\n'+
            '<a target="_blank" href="https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html"><button>Health Regulation provider Data fields</button></a>\n'+
            '</p>', feature.feature.properties);
          });
  }
})
});

////////////////////////////////////
// Bases
var bases = L.esri.featureLayer({
  url: "https://geo.dot.gov/server/rest/services/NTAD/Military_Bases/MapServer/0",
  where: "STATE_TERR NOT LIKE 'Minnesota'",
});
bases.setStyle({
  color: 'green',
  weight: 5,
  fill: true
});
bases.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{SITE_NAME}</strong><br><br>State Territory: {STATE_TERR}<br>Status: {OPER_STAT}<br>Component: {COMPONENT}</p>', layer.feature.properties);
});


////////////////////////////////////
// EOC
var eocIcon = L.icon({
	iconUrl: 'data/EOC.png',
	iconSize: [25, 25],
  popupAnchor: [0, -28]
});
var eoc = L.esri.Cluster.featureLayer({
  url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Local_Emergency_Operations_Centers_EOC/FeatureServer/0',
  where: "STATE = 'MN'",
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var eoc_digit = (count + '').length;
  return L.divIcon({
   html: count,
   className: 'eocCluster eoc-' + eoc_digit,
   iconSize: null
 });
},
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
        icon: eocIcon
      });
  }
    });
eoc.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIP}<br><br>Telephone: {TELEPHONE}</p>', layer.feature.properties);
});

/////////////////////////////////////////
// Federal Guard

// Federal Bases
$.getJSON('data/military/federal_bases.geojson')
 .done( data => {
   federal_bases = new L.geoJSON(data, {
     onEachFeature: function(feature, featureLayer){
       featureLayer.setStyle({
         color: 'green',
         weight: 5,
         fill: true
       });
     }
})
});

$.getJSON('data/military/federal.geojson')
 .done( data => {
   federal = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["TypeLabel"]) {
         case "Army":
           var army_federal = L.icon({
           	iconUrl: 'data/military/army_federal.svg',
           	iconSize: [20, 20],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: army_federal}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
           });
         case "Navy":
           var navy_federal = L.icon({
           	iconUrl: 'data/military/navy_federal.svg',
           	iconSize: [20, 20],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: navy_federal}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
           });
         case "USMC":
           var usmc_federal = L.icon({
             iconUrl: 'data/military/usmc_federal.svg',
             iconSize: [20, 20],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: usmc_federal}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
           });
           case "Air Force":
             var military_airport_national = L.icon({
               iconUrl: 'data/military/military_airport_federal.svg',
               iconSize: [20, 20],
               popupAnchor: [0, -8]
             });
             return L.marker(latlng, {icon: military_airport_national}).bindPopup(function (layer) {
               return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
             });
           case "Coast Guard":
             var coast_federal = L.icon({
               iconUrl: 'data/military/coast_federal.svg',
               iconSize: [20, 20],
               popupAnchor: [0, -8]
             });
             return L.marker(latlng, {icon: coast_federal}).bindPopup(function (layer) {
               return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
             });
             case "USACE":
               var usace_federal = L.icon({
                 iconUrl: 'data/military/usace_federal.svg',
                 iconSize: [20, 20],
                 popupAnchor: [0, -8]
               });
               return L.marker(latlng, {icon: usace_federal}).bindPopup(function (layer) {
                 return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
               });
               case "AFRC":
                 var afrc_federal = L.icon({
                   iconUrl: 'data/military/afrc_federal.svg',
                   iconSize: [20, 20],
                   popupAnchor: [0, -8]
                 });
                 return L.marker(latlng, {icon: afrc_federal}).bindPopup(function (layer) {
                   return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
                 });
       }
  }
})
});

/////////////////////////////////////////////
// fireStations
var fireStationsIcon = L.icon({
	iconUrl: 'data/fireStations.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -8]
});
var fireStations = L.esri.Cluster.featureLayer({
  url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/ArcGIS/rest/services/Fire_Station/FeatureServer/0",
  where: "STATE = 'MN'",
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var digits = (count + '').length;
  return L.divIcon({
   html: count,
   className: 'fsCluster fs-' + digits,
   iconSize: null
 });
},
  pointToLayer: function (geojson, latlng) {
  return L.marker(latlng, {
      icon: fireStationsIcon
    });
  }
   });
fireStations.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIPCODE}</p>', layer.feature.properties);
});

/////////////////////////////////////////
// Foodshelves
var foodshelvesIcon = L.icon({
	iconUrl: 'data/foodshelves/foodshelves.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -8]
});

$.getJSON('data/foodshelves/foodshelves.geojson')
 .done( data => {
   foodshelves = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       // Filter out cities with no foodshelves. Foodshelves are scraped from this website: https://www.foodpantries.org/st/minnesota
        if (feature.properties.foodshelves_Url !== null) {
          return L.marker(latlng, {icon: foodshelvesIcon}).bindPopup(function (feature) {
            return L.Util.template("<br><iframe src={foodshelves_Url} style='border: 0px none; height: 400px; width: 310px;'></iframe>", feature.feature.properties);
          });
       }
  }
})
});

///////////////////////////////////////////
// Medical - General Hospitals, Native American, Psychiatric, Veterans Affairs
var hospitalsIcon = L.icon({
	iconUrl: 'data/hospital/hospital.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -8]
});
var hospitals = L.esri.featureLayer({
  url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Hospitals_1/FeatureServer/0",
  where: "STATE = 'MN'",
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
      icon: hospitalsIcon
    });
  }
 });
hospitals.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong><br><br>\n'+
  '{ADDRESS}<br> {CITY}, {STATE} {ZIP}<br>\n'+
  'County: {COUNTY}<br><br>\n'+
  'Type: {TYPE}<br>\n'+
  'Owner: {OWNER}<br>\n'+
  'Status:{STATUS}<br>\n'+
  'NAICS Description: {NAICS_DESC}<br>\n'+
  // 'Source Date:{SOURCEDATE}<br><br>\n'+
  'Validation Method: {VAL_METHOD}<br>\n'+
  // 'Validation Date: {VAL_DATE}<br><br>\n'+
  'Beds: {BEDS}<br>\n'+
  'Trauma: {TRAUMA}<br>\n'+
  'Helipad: {HELIPAD}<br><br>\n'+
  // '<a target="_blank" href="{SOURCE}"><button>Data Source</button></a><br><br>\n'+
  '<a target="_blank" href="{WEBSITE}"><button>Website</button></a><br>\n'+
  '<a target="_blank" href="https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html"><button>Health Regulation provider Data fields</button></a></p>', layer.feature.properties);
});

$.getJSON('data/hospital/naPublicHealthService.geojson')
 .done( data => {
   na = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["Type"]) {
         case "Clinic":
           var naClinic = L.icon({
           	iconUrl: 'data/hospital/naClinic.svg',
           	iconSize: [20, 20],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: naClinic}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{NAME}</strong><br>\n'+
             '{ADDRESS}<br> {CITY}, {STATE} {ZIP}<br><br>\n'+
             'Type: {Type}<br><br>\n'+
             'Phone: {TELEPHONE}<br>\n'+
             'Fax: {FAX}<br><br>\n'+
             'Administrator: {ADMINISTRATOR}<br>\n'+
             'State Licensed Hospital beds: <strong> {HOSP_BEDS}</strong><br>\n'+
             'Infant Bassinets: <strong>{BASS_BEDS}</strong><br><br>\n'+
             '<a target="_blank" href="{Website}"><button>Website</button></a><br>\n'+
             '<a target="_blank" href="https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html"><button>Health Regulation provider Data fields</button></a></p>', layer.feature.properties);
           });
         case "Hospital":
           var naHospital = L.icon({
           	iconUrl: 'data/hospital/naHospital.svg',
           	iconSize: [20, 20],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: naHospital}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{NAME}</strong><br>\n'+
             '{ADDRESS}<br> {CITY}, {STATE} {ZIP}<br><br>\n'+
             'Type: {Type}<br><br>\n'+
             'Phone: {TELEPHONE}<br>\n'+
             'Fax: {FAX}<br><br>\n'+
             'Administrator: {ADMINISTRATOR}<br>\n'+
             'State Licensed Hospital beds: <strong> {HOSP_BEDS}</strong><br>\n'+
             'Infant Bassinets: <strong>{BASS_BEDS}</strong><br><br>\n'+
             '<a target="_blank" href="{Website}"><button>Website</button></a><br>\n'+
             '<a target="_blank" href="https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html"><button>Health Regulation provider Data fields</button></a></p>', layer.feature.properties);
           });
       }
  }
})
});

var psychIcon = L.icon({
	iconUrl: 'data/hospital/psychHospital.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -8]
});
$.getJSON('data/hospital/psychHospital.geojson')
 .done( data => {
   psych = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {icon: psychIcon}).bindPopup(function (feature) {
            return L.Util.template('<p><strong>{NAME}</strong><br><br>\n'+
            '{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br>\n'+
            'County: {COUNTY_NAME}<br><br>\n'+
            'Phone: {TELEPHONE}<br>\n'+
            'Fax: {FAX}<br><br>\n'+
            'License Type: {LIC_TYPE}<br>\n'+
            'Administrator: {ADMINISTRATOR}<br><br>\n'+
            'State Licensed Psychiatric Beds:<strong> {PSY_HOSP_BEDS}</strong><br>\n'+
            'Supervised Living Facility Class B beds:<strong> {SLFB_BEDS}</strong><br>\n'+
            'Other beds:<strong> {OTHER_BEDS}</strong><br>\n'+
            'Federal Medicare Psychiatric beds: <strong>{PSY18_BEDS}</strong><br><br>\n'+
            '<a target="_blank" href="https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html"><button>Health Regulation provider Data fields</button></a></p>', feature.feature.properties);
          });
  }
})
});

$.getJSON('data/hospital/vaFacilities.geojson')
 .done( data => {
   va = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["Type"]) {
         case "Hospital":
           var vaHospital = L.icon({
             iconUrl: 'data/hospital/vaHospital.svg',
             iconSize: [20, 20],
             iconAnchor: [20, 0],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: vaHospital}).bindPopup(function (feature) {
             return L.Util.template('<p><strong>{NAME}</strong><br><br>\n'+
             '{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br>\n'+
             'Phone: {TELEPHONE}<br>\n'+
             'Fax: {FAX}<br><br>\n'+
             'Type: {Type}<br><br>\n'+
             'US National Grid: {USNationalGrid}<br><br>\n'+
             'Federal Medicare Certified Hospital beds:<strong> {HOSP18_BEDS}</strong><br>\n'+
             'State Licensed Psychiatric Beds:<strong> {PSY_HOSP_BEDS}</strong><br>\n'+
             'Federal Medicare Psychiatric beds:<strong> {PSY18_BEDS}</strong><br>\n'+
             'Federal Medicare Skilled Nursing Facility beds:<strong> {SNF_BEDS}</strong><br><br>\n'+
             'Federal Medicaid Nursing Facility beds (Nursing Home):<strong> {NF1_BEDS}</strong><br><br>\n'+
             '<a target="_blank" href={Website}><button>Website</button></a><br>\n'+
             '<a target="_blank" href="https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html"><button>Health Regulation provider Data fields</button></a></p>', feature.feature.properties);
           });
         case "Clinic":
           var vaClinic = L.icon({
           	iconUrl: 'data/hospital/vaClinic.svg',
           	iconSize: [20, 20],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: vaClinic}).bindPopup(function (feature) {
             return L.Util.template('<p><strong>{NAME}</strong><br><br>\n'+
             '{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br>\n'+
             'Phone: {TELEPHONE}<br>\n'+
             'Fax: {FAX}<br><br>\n'+
             'Type: {Type}<br><br>\n'+
             'US National Grid: {USNationalGrid}<br><br>\n'+
             '<a target="_blank" href={Website}><button>Website</button></a><br>\n'+
             '<a target="_blank" href="https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html"><button>Health Regulation provider Data fields</button></a></p>', feature.feature.properties);
           });
       }
  }
})
});

/////////////////////////////////////////
// National Guard

// National Guard Bases
$.getJSON('data/military/national_guard_bases.geojson')
 .done( data => {
   national_guard_bases = new L.geoJSON(data, {
     onEachFeature: function(feature, featureLayer){
       featureLayer.setStyle({
         color: 'green',
         weight: 5,
         fill: true
       });
     }
})
});


$.getJSON('data/military/national_guard.geojson')
 .done( data => {
   national = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["Symbol"]) {
         case "Armory":
           var armory_national = L.icon({
           	iconUrl: 'data/military/armory_national.svg',
           	iconSize: [20, 20],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: armory_national}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target="_blank" href="{Website}"><button>Website</button></a><br><a target="_blank" href="{OtherInfo}"><button>Other Information</button></a></p>', layer.feature.properties);
           });
         case "Military Airport":
           var military_airport_national = L.icon({
           	iconUrl: 'data/military/military_airport_national.svg',
           	iconSize: [20, 20],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: military_airport_national}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target="_blank" href="{Website}"><button>Website</button></a><br><a target="_blank" href="{OtherInfo}"><button>Other Information</button></a></p>', layer.feature.properties);
           });
         case "Helo":
           var helo_national = L.icon({
             iconUrl: 'data/military/helo_national.svg',
             iconSize: [20, 20],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: helo_national}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target="_blank" href="{Website}"><button>Website</button></a><br><a target="_blank" href="{OtherInfo}"><button>Other Information</button></a></p>', layer.feature.properties);
           });
           case "Training":
             var training_national = L.icon({
               iconUrl: 'data/military/training_national.svg',
               iconSize: [20, 20],
               popupAnchor: [0, -8]
             });
             return L.marker(latlng, {icon: training_national}).bindPopup(function (layer) {
               return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target="_blank" href="{Website}"><button>Website</button></a><br><a target="_blank" href="{OtherInfo}"><button>Other Information</button></a></p>', layer.feature.properties);
             });
           case "WMD":
             var wmd_national = L.icon({
               iconUrl: 'data/military/wmd_national.svg',
               iconSize: [20, 20],
               popupAnchor: [0, -8]
             });
             return L.marker(latlng, {icon: wmd_national}).bindPopup(function (layer) {
               return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target="_blank" href="{Website}"><button>Website</button></a><br><a target="_blank" href="{OtherInfo}"><button>Other Information</button></a></p>', layer.feature.properties);
             });
             case "AFRC":
               var afrc_federal = L.icon({
                 iconUrl: 'data/military/afrc_national.svg',
                 iconSize: [20, 20],
                 popupAnchor: [0, -8]
               });
               return L.marker(latlng, {icon: afrc_federal}).bindPopup(function (layer) {
                 return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target="_blank" href="{Website}"><button>Website</button></a><br><a target="_blank" href="{OtherInfo}"><button>Other Information</button></a></p>', layer.feature.properties);
               });
       }
  }
})
});

//////////////////////////////////////////
// Native American Lands
var nativeLand = L.esri.featureLayer({
  url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Native_Lands/FeatureServer/0',
  where: "State_Nm = 'MN'"
});
nativeLand.setStyle({
  color: '#A87000',
  weight: 2,
  fill: '#A87000'
});
nativeLand.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{Loc_Own}</strong></p>', layer.feature.properties);
});

//////////////////////////////////////////
// Police
var policeIcon = L.icon({
	iconUrl: 'data/policeStations.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -28]
});
var policeStations = L.esri.Cluster.featureLayer({
  url: 'https://carto.nationalmap.gov/arcgis/rest/services/structures/MapServer/30',
  where: "STATE = 'MN'",
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var police = (count + '').length;
  return L.divIcon({
   html: count,
   className: 'policeCluster police-' + police,
   iconSize: null
 });
},
  pointToLayer: function (geojson, latlng) {
  return L.marker(latlng, {
      icon: policeIcon
    });
  }
   });
policeStations.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIPCODE}</p>', layer.feature.properties);
});


////////////////////////////////////
// Positive COVID counties
// other url:
var positiveCounties = L.esri.featureLayer({
  url: "https://services2.arcgis.com/V12PKGiMAH7dktkU/arcgis/rest/services/PositiveCountyCount/FeatureServer/0",
  style: function (feature) {
  if (feature.properties.MLMIS_CTY >= 0 && feature.properties.MLMIS_CTY < 6) {
    return { fillColor: 'rgb(230, 238, 207)', fill: true, stroke: false,fillOpacity: 0.6};
  } else if (feature.properties.MLMIS_CTY > 5 && feature.properties.MLMIS_CTY < 51) {
    return { fillColor: 'rgb(123, 204, 196)', fill: true, stroke: false,fillOpacity: 0.6};
  } else if (feature.properties.MLMIS_CTY > 50 && feature.properties.MLMIS_CTY < 501) {
    return { fillColor: 'rgb(67, 162, 202)', fill: true, stroke: false,fillOpacity: 0.6};
  } else {
    return { fillColor: 'rgb(7, 85, 145)', fill: true, stroke: false,fillOpacity: 0.6};
  }
}
});

positiveCounties.on('popupopen', function(evt) {
	// when the popup opens, we get the layer/featuere AND a reference to the popup in the evt variable here.
  queryInfo(evt.layer.feature, evt.popup);
});

positiveCounties.bindPopup(function (layer) {
  // return temporary message while the "queryTrees" function called from the popupopen function runs:
	return L.Util.template('Getting information');
});

var queryInfo = function(feature, popup) {
  L.esri.query({
    url: "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases2_v1/FeatureServer/1",
    where: "Province_State = 'Minnesota'"
  })
  .within(feature)
  .run(function(error, featureCollection) {
    try {
      var deaths = featureCollection.features[0].properties.Deaths
    } catch (error) {
      var deaths = "no data"
      var recovered = "no data"
    }
  	// this function is called when the query is complete. Update the currently open popup.
    popup.setContent(L.Util.template('<p><strong>{NAME_LOWER} County</strong><br></p> Confirmed Cases: {MLMIS_CTY}<br>Deaths: ' + deaths, feature.properties));
  }.bind(this));
}

/////////////////////////////////////////
// Prisons
$.getJSON('data/prison/prisons.geojson')
 .done( data => {
   prisons = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["Type"]) {
         case "Federal":
           var prisons_fed = L.icon({
           	iconUrl: 'data/prison/prisons_fed.svg',
           	iconSize: [20, 20],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: prisons_fed}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{FacilityName}</strong><br>{Street}<br>{City} {Zip}<br><br>Capacity: {Capacity} <br>Male or Female: {MaleFemale} <br>Juvenile: {Juvenile} <br>Minimum: {Minimum} <br>Medium: {Medium} <br>Close: {Close} <br>Maximum: {Maximum} <br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
           });
         case "State":
           var prisons_state = L.icon({
           	iconUrl: 'data/prison/prisons_state.svg',
           	iconSize: [25, 25],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: prisons_state}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{FacilityName}</strong><br>{Street}<br>{City} {Zip}<br><br>Capacity: {Capacity} <br>Male or Female: {MaleFemale} <br>Juvenile: {Juvenile} <br>Minimum: {Minimum} <br>Medium: {Medium} <br>Close: {Close} <br>Maximum: {Maximum} <br><br><a target="_blank" href="{Website}"><button>Website</button></a>', layer.feature.properties);
           });
       }
  }
})
});
//////////////////////////////////////////
// Schools: public and private

var publicSchoolsIcon = L.icon({
	iconUrl: 'data/publicSchools.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -28]
});
var publicSchools = L.esri.Cluster.featureLayer({
  url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Public_Schools/FeatureServer/0',
  where: "STATE = 'MN'",
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var digits = (count + '').length;
  return L.divIcon({
   html: count,
   className: 'pusCluster pus-' + digits,
   iconSize: null
 });
},
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
        icon: publicSchoolsIcon
      });
  }
    });
publicSchools.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIP}<br>Phone: {TELEPHONE}<br><br>Enrollment: {ENROLLMENT}<br>Grades: {ST_GRADE} to {END_GRADE}<br><br>Shelter ID: {SHELTER_ID}</p>', layer.feature.properties);
});


var privateSchoolsIcon = L.icon({
	iconUrl: 'data/privateSchools.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -28]
});
var privateSchools = L.esri.Cluster.featureLayer({
  url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Private_Schools/FeatureServer/0',
  where: "STATE = 'MN'",
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var digits = (count + '').length;
  return L.divIcon({
   html: count,
   className: 'psCluster ps-' + digits,
   iconSize: null
 });
},
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
        icon: privateSchoolsIcon
      });
  }
    });
privateSchools.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIP}<br>Phone: {TELEPHONE}<br><br>Enrollment: {ENROLLMENT}<br>Grades: {START_GRAD} to {END_GRADE}<br><br>Shelter ID: {SHELTER_ID}</p>', layer.feature.properties);
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
  return L.Util.template('<p><strong>{NAME}</strong><br><br>Description: {NAICSDESCR}<br><br>{ADDRESS}, {CITY} {ZIP}<br><br>Phone: {PHONE}</p>', layer.feature.properties);
});

////////////////////////////////////////////
// Shelters
var sheltersIcon = L.icon({
	iconUrl: 'data/shelters.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -28]
});
var shelters = L.esri.Cluster.featureLayer({
  url: "https://gis.fema.gov/arcgis/rest/services/NSS/FEMA_NSS/FeatureServer/5",
  where: "STATE = 'MN'",
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var shelter_digit = (count + '').length;
  return L.divIcon({
   html: count,
   className: 'shelterCluster shelter-' + shelter_digit,
   iconSize: null
 });
},
  pointToLayer: function (geojson, latlng) {
  return L.marker(latlng, {
      icon: sheltersIcon
    });
  }
 });
shelters.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{SHELTER_NAME} \n'+
  '</strong><br><br>{ADDRESS_1}, {CITY} {ZIP}<br><br>\n'+
  'County: {COUNTY_PARISH}<br>FIPS CODE: {FIPS_CODE}<br>\n'+
  'Evacuation Capacity: {EVACUATION_CAPACITY}<br> \n'+
  'Post Impact Capacity: {POST_IMPACT_CAPACITY}<br> \n'+
  'ADA Compliant: {ADA_COMPLIANT}<br>\n'+
  'Wheelchair Accessible: {WHEELCHAIR_ACCESSIBLE}<br>\n'+
  'Pet Accommodations: {PET_ACCOMMODATIONS_CODE} {PET_ACCOMMODATIONS_DESC}<br>\n'+
  'Generator Onsite: {GENERATOR_ONSITE}<br>\n'+
  'Self sufficient electricity: {SELF_SUFFICIENT_ELECTRICITY}<br>\n'+
  'In 100 year floodplain: {IN_100_YR_FLOODPLAIN}<br\n'+
  'In 500 year floodplain: {IN_500_YR_FLOODPLAIN}<br><br>\n'+
  'Phone: {ORG_MAIN_PHONE}<br>\n'+
  'Hotline Phone: {ORG_HOTLINE_PHONE}<br> \n'+
  'Email: {ORG_EMAIL}<br>\n'+
  'Shelter Status: {SHELTER_STATUS_CODE}<br>\n'+
  'Shelter Open Date: {SHELTER_OPEN_DATE}<br>\n'+
  'Shelter Closed Date: {SHELTER_CLOSED_DATE}<br> \n'+
  'Medical needs population: {MEDICAL_NEEDS_POPULATION}<br> \n'+
  'Other population: {OTHER_POPULATION} {OTHER_POPULATION_DESCRIPTION}<br>\n'+
  'Total population: {TOTAL_POPULATION}<br> \n'+
  'Pet population: {PET_POPULATION}</p>', layer.feature.properties);
});

////////////////////////////////////////////
// Test Locations
var testingIcon = L.icon({
	iconUrl: 'data/testing.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -28]
});
var testing = L.esri.featureLayer({
  url: "https://services1.arcgis.com/KoDrdxDCTDvfgddz/ArcGIS/rest/services/CovidTestLocations_ProductionMap/FeatureServer/0",
  where: "State = 'MN'",
  pointToLayer: function (feature, latlng) {
    switch(feature.properties["DirUtilCol"]) {
      case "By appointment":
        var testing_appt = L.icon({
         iconUrl: 'data/testing/testing_appt.svg',
         iconSize: [20, 20],
          popupAnchor: [0, -8]
        });
        return L.marker(latlng, {icon: testing_appt}).bindPopup(function (layer) {
          return L.Util.template('<h3>{CollectSiteName}</h3><p>{HealthSystem}<br><br>{CollectAddress1}<br>{City}, {Zip}<br><strong>Contact Info: </strong><a href="tel:{Phone}">{Phone}</a><br><br>Directions: {DirUtilCol}<br><strong>Weekday Hours: </strong>{HoursOfOpMF}<br><strong>Weekend Hours: </strong>{HoursOfOpSatSun}<br><br><a target="_blank" href="https://mn.gov/covid19/for-minnesotans/if-sick/testing-locations/"><button>Click for more details</button></a></p>', layer.feature.properties);
        });
      case "Drive-up":
        var testing_driveup = L.icon({
         iconUrl: 'data/testing/testing_driveup.svg',
         iconSize: [20, 20],
          popupAnchor: [0, -8]
        });
        return L.marker(latlng, {icon: testing_driveup}).bindPopup(function (layer) {
          return L.Util.template('<h3>{CollectSiteName}</h3><p>{HealthSystem}<br><br>{CollectAddress1}<br>{City}, {Zip}<br><strong>Contact Info: </strong><a href="tel:{Phone}">{Phone}</a><br><br>Directions: {DirUtilCol}<br><strong>Weekday Hours: </strong>{HoursOfOpMF}<br><strong>Weekend Hours: </strong>{HoursOfOpSatSun}<br><br><a target="_blank" href="https://mn.gov/covid19/for-minnesotans/if-sick/testing-locations/"><button>Click for more details</button></a></p>', layer.feature.properties);
        });
      default:
        var testing_else = L.icon({
          iconUrl: 'data/testing/testing_else.svg',
          iconSize: [20, 20],
          popupAnchor: [0, -8]
        });
        return L.marker(latlng, {icon: testing_else}).bindPopup(function (layer) {
          return L.Util.template('<h3>{CollectSiteName}</h3><p>{HealthSystem}<br><br>{CollectAddress1}<br>{City}, {Zip}<br><strong>Contact Info: </strong><a href="tel:{Phone}">{Phone}</a><br><br>Directions: {DirUtilCol}<br><strong>Weekday Hours: </strong>{HoursOfOpMF}<br><strong>Weekend Hours: </strong>{HoursOfOpSatSun}<br><br><a target="_blank" href="https://mn.gov/covid19/for-minnesotans/if-sick/testing-locations/"><button>Click for more details</button></a></p>', layer.feature.properties);
        });
    }
  }
 });


// Add it all together
var mymap = L.map('mapid', {
  preferCanvas: true,
  center: [45.9, -95.9],
  zoom: 6,
  layers: [counties, boundaries, none]
  // layers: [counties, cases, boundaries, none]
});


var sidebar = L.control.sidebar('sidebar').addTo(mymap);

// Layer logic

$("input[type='checkbox']").change(function() {
  var layerClicked = $(this).attr("id")
  switch (layerClicked) {
    case "airports":
      toggleLayer(this.checked, airports)
    break;
    case "bases":
    toggleLayer(this.checked, bases);
    break;
    case "boardingCareHomes":
    toggleLayer(this.checked, boardingCareHomes);
    break;
    case "boundaries":
      toggleLayer(this.checked, boundaries);
    break;
    case "cases":
      toggleLayer(this.checked, cases)
    break;
    case "counties":
      toggleLayer(this.checked, counties)
    break;
    case "EOC":
      toggleLayer(this.checked, eoc);
    break;
    case "federal":
      toggleLayer(this.checked, federal);
      toggleLayer(this.checked, federal_bases);
    break;
    case "foodshelves":
      toggleLayer(this.checked, foodshelves);
    break;
    case "fireStations":
      toggleLayer(this.checked, fireStations);
    break;
    case "hospitals":
      toggleLayer(this.checked, hospitals);
    break;
    case "housingWithServices":
      toggleLayer(this.checked, housingWithServices);
    break;
    case "national":
      toggleLayer(this.checked, national);
      toggleLayer(this.checked, national_guard_bases);
    break;
    case "nativeLand":
      toggleLayer(this.checked, nativeLand);
    break;
    case "na":
      toggleLayer(this.checked, na);
    break;
    case "nursingHomes":
      toggleLayer(this.checked, nursingHomes);
    break;
    case "policeStations":
      toggleLayer(this.checked, policeStations);
    break;
    case "positiveCounties":
      toggleLayer(this.checked, positiveCounties);
    break;
    case "prisons":
      toggleLayer(this.checked, prisons);
    break;
    case "psych":
      toggleLayer(this.checked, psych);
    break;
    case "privateSchools":
      toggleLayer(this.checked, privateSchools);
    break;
    case "publicSchools":
      toggleLayer(this.checked, publicSchools);
    break;
    case "redCrossFacilities":
      toggleLayer(this.checked, redCrossFacilities);
    break;
    case "redCross":
      toggleLayer(this.checked, redCross);
    break;
    case "shelters":
      toggleLayer(this.checked, shelters);
    break;
    case "supervisedLivingFacilities":
      toggleLayer(this.checked, supervisedLivingFacilities);
    break;
    case "testing":
      toggleLayer(this.checked, testing);
    break;
    case "va":
      toggleLayer(this.checked, va);
    break;
  }
});

let clusters;
function toggleLayer(checked, layer) {
  	if (checked) {
    // clusters = L.markerClusterGroup({disableClusteringAtZoom: 12});
    // clusters.addLayer(layer);
  	// mymap.addLayer(clusters);
    mymap.addLayer(layer);
    // layer.bringToFront();
  } else {
    mymap.removeLayer(layer);


  }
}


// Radio buttons for basemaps
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

// Ensures mn cases and us covid cases are not on at the same time
var us = $('input[name="use_us"]');
var mn = $('input[name="use_mn"]');

us.change(function(){
  mn.prop('checked',false);
  mymap.removeLayer(positiveCounties);
});
mn.change(function(){
  us.prop('checked',false);
  mymap.removeLayer(cases);
});

// var tooltipThreshold = 10;
// mymap.on('zoomend', function() {
//   if (mymap.getZoom() < tooltipThreshold) {
//       $(".leaflet-tooltip").css("display","none")
//   } else {
//       $(".leaflet-tooltip").css("display","block")
//   }
// })
