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
      fill: false,
    }
  }
});



// $.getJSON('data/counties.geojson')
//  .done( data => {
//    counties = new L.geoJSON(data, {
//      style: function (feature) {
//        return {
//          weight: 1,
//          opacity: 0.2,
//          color: '#000000',
//          opacity: 0.2,
//          fill: false
//        };
//      },
//      onEachFeature: function (feature, layer) {
//        layer.bindTooltip(function (layer) {
//            return layer.feature.properties.NAME; //merely sets the tooltip text
//         }, {direction: "center", permanent: true, opacity: 1, className: 'county'}  //then add your options
//        )
// }
// }).addTo(mymap);
// });


// Get yesterday's date
const today = new Date()
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)

var displayDate = moment(yesterday).format('YYYY-MM-DD');
$("#date").attr("max", displayDate)
$("#date").attr("value", displayDate)

$.getJSON('https://www.sharedgeo.org/COVID-19/leaflet/data/covid-19-cases.json')
 .done( data => {
  cases = VectorTileLayer('https://www.sharedgeo.org/COVID-19/leaflet/data/state_county/{z}/{x}/{y}.pbf', {
     minDetailZoom: 0,
     maxDetailZoom: 8,
     attribution: "COVID-19 data is from the University of Virginia Biocomplexity Institute's COVID-19 Surveillance <a href='http://nssac.bii.virginia.edu/covid-19/dashboard/'>Dashboard</a> <a href='https://creativecommons.org/licenses/by-nc/4.0/'>CC-BY-NC</a>",
     style: function(f, name) {
       //console.log(f, name);
       const state = f.properties.st_name;
       const county = f.properties.cty_name;

       let r = 255;
       let g = 255;
       let b = 255;
       if(data[state] &&
        data[state]["counties"] &&
        data[state]["counties"][county] &&
        data[state]["counties"][county][displayDate]) {
         const cases = data[state]["counties"][county][displayDate];
         const ln_cases = Math.log(cases);
         if (ln_cases <= 7.0) {
           r = 255;
           g = b = 215 - Math.floor(ln_cases * 255 / 7);
         } else {
           b = Math.floor((ln_cases - 7) * (255 / 5));
           g = 0;
           r = 255 - (b / 2);
         }
       }
       const rgb = (255 << 16) + (g << 8) + (b);

       return ({
         stroke: false,
         fillColor: '#'+rgb.toString(16),
         fill: true,
         fillOpacity: 0.6
       });
     },
    zIndex: 1
   });
   cases.addTo(mymap);
 });

$("#date").change(function() {
  displayDate = $("#date").val();
  mymap.eachLayer( l => {
    if(l.options.attribution && l.options.attribution.startsWith("COVID"))
      l.redraw();
  } );
});


let min = moment($("#date").attr("min"));
let max = moment($("#date").attr("max"));
let day = moment(min);

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


var boundaries = L.esri.featureLayer({ url: 'https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Political_Boundaries_Area/FeatureServer/0'});
boundaries.setStyle({
  color: 'grey',
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

////////////////////////////////////
// Bases
var bases = L.esri.featureLayer({
  url: "https://geo.dot.gov/server/rest/services/NTAD/Military_Bases/MapServer/0",
  where: "SITE_NAME NOT LIKE 'Duluth IAP' AND SITE_NAME NOT LIKE 'NG Duluth NG Armory' AND SITE_NAME NOT LIKE 'NG St Cloud NG Armory' AND SITE_NAME NOT LIKE 'NG St Cloud AASF' AND SITE_NAME NOT LIKE 'NG Rochester NGA and OMS 2' AND SITE_NAME NOT LIKE 'NG Rosemount NG Armory'",
});
bases.setStyle({
  color: 'green',
  weight: 5,
  fill: true
});
bases.bindPopup(function (layer) {
  return L.Util.template('<p><strong>{SITE_NAME}</strong><br><br>State Territory: {STATE_TERR}<br>Status: {OPER_STAT}<br>Component: {COMPONENT}</p>', layer.feature.properties);
});

/////////////////////////////////////////
// Federal Guard
$.getJSON('data/military/federal.geojson')
 .done( data => {
   federal = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["TypeLabel"]) {
         case "Army":
           var army_federal = L.icon({
           	iconUrl: 'data/military/army_federal.svg',
           	iconSize: [25, 25],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: army_federal}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
           });
         case "Navy":
           var navy_federal = L.icon({
           	iconUrl: 'data/military/navy_federal.svg',
           	iconSize: [25, 25],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: navy_federal}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
           });
         case "USMC":
           var usmc_federal = L.icon({
             iconUrl: 'data/military/usmc_federal.svg',
             iconSize: [25, 25],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: usmc_federal}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
           });
           case "Air Force":
             var military_airport_national = L.icon({
               iconUrl: 'data/military/military_airport_national.svg',
               iconSize: [25, 25],
               popupAnchor: [0, -8]
             });
             return L.marker(latlng, {icon: military_airport_national}).bindPopup(function (layer) {
               return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
             });
           case "Coast Guard":
             var coast_federal = L.icon({
               iconUrl: 'data/military/coast_federal.svg',
               iconSize: [25, 25],
               popupAnchor: [0, -8]
             });
             return L.marker(latlng, {icon: coast_federal}).bindPopup(function (layer) {
               return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
             });
             case "USACE":
               var usace_federal = L.icon({
                 iconUrl: 'data/military/usace_federal.svg',
                 iconSize: [25, 25],
                 popupAnchor: [0, -8]
               });
               return L.marker(latlng, {icon: usace_federal}).bindPopup(function (layer) {
                 return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a></p>', layer.feature.properties);
               });
               case "AFRC":
                 var afrc_federal = L.icon({
                   iconUrl: 'data/military/afrc_federal.svg',
                   iconSize: [25, 25],
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
// Hospitals
var hospitalsIcon = L.icon({
	iconUrl: 'data/hospital.svg',
	iconSize: [25, 25],
  popupAnchor: [0, -8]
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



/////////////////////////////////////////
// National Guard
$.getJSON('data/military/national_guard.geojson')
 .done( data => {
   national = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["Symbol"]) {
         case "Armory":
           var armory_national = L.icon({
           	iconUrl: 'data/military/armory_national.svg',
           	iconSize: [25, 25],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: armory_national}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a><br><a target="_blank" href="{OtherInfo}"><button>Other Information</button></a></p>', layer.feature.properties);
           });
         case "Military Airport":
           var military_airport_national = L.icon({
           	iconUrl: 'data/military/military_airport_national.svg',
           	iconSize: [25, 25],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: military_airport_national}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a><br><a target="_blank" href="{OtherInfo}"><button>Other Information</button></a></p>', layer.feature.properties);
           });
         case "Helo":
           var helo_national = L.icon({
             iconUrl: 'data/military/helo_national.svg',
             iconSize: [25, 25],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: helo_national}).bindPopup(function (layer) {
             return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a><br><a target="_blank" href="{OtherInfo}"><button>Other Information</button></a></p>', layer.feature.properties);
           });
           case "Training":
             var training_national = L.icon({
               iconUrl: 'data/military/training_national.svg',
               iconSize: [25, 25],
               popupAnchor: [0, -8]
             });
             return L.marker(latlng, {icon: training_national}).bindPopup(function (layer) {
               return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a><br><a target="_blank" href="{OtherInfo}"><button>Other Information</button></a></p>', layer.feature.properties);
             });
           case "WMD":
             var wmd_national = L.icon({
               iconUrl: 'data/military/wmd_national.svg',
               iconSize: [25, 25],
               popupAnchor: [0, -8]
             });
             return L.marker(latlng, {icon: wmd_national}).bindPopup(function (layer) {
               return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a><br><a target="_blank" href="{OtherInfo}"><button>Other Information</button></a></p>', layer.feature.properties);
             });
             case "AFRC":
               var afrc_federal = L.icon({
                 iconUrl: 'data/military/afrc_federal.svg',
                 iconSize: [25, 25],
                 popupAnchor: [0, -8]
               });
               return L.marker(latlng, {icon: afrc_federal}).bindPopup(function (layer) {
                 return L.Util.template('<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target="_blank" href="{Website}"><button>Website</button></a><br><a target="_blank" href="{OtherInfo}"><button>Other Information</button></a></p>', layer.feature.properties);
               });
       }
  }
})
});


//////////////////////////////////////////
// Nursing Homes
var nursingHomesIcon = L.icon({
	iconUrl: 'data/nursingHomes.svg',
	iconSize: [25, 25],
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
  return L.Util.template('<p><strong>{NAME}</strong><br><br>Type: <br>Population: {POPULATION}<br>Description: {NAICS_DESC}<br><br>{ADDRESS}, {CITY} {ZIP}</p>', layer.feature.properties);
});

//////////////////////////////////////////
// Police
var policeIcon = L.icon({
	iconUrl: 'data/policeStations.svg',
	iconSize: [25, 25],
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
  return L.Util.template('<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIPCODE}<br><br>Phone: </p>', layer.feature.properties);
});

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
           	iconSize: [25, 25],
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
// Public Schools
var publicSchoolsIcon = L.icon({
	iconUrl: 'data/publicSchools.svg',
	iconSize: [25, 25],
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
  return L.Util.template('<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIP}}</p>', layer.feature.properties);
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
  url: "https://services1.arcgis.com/KoDrdxDCTDvfgddz/arcgis/rest/services/TestCollectionLocations/FeatureServer/0",
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


/////////////////////////////////////////
// veterans
var vaIcon = L.icon({
	iconUrl: 'data/va.svg',
	iconSize: [25, 25],
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
  return L.Util.template("<p><strong>{NAME}</strong><br><br>Description: {NAICSDESCR}<br><br>{ADDRESS}, {CITY} {ZIP}</p>", layer.feature.properties);
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
    case "bases":
    toggleLayer(this.checked, bases);
    break;
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
    case "federal":
      toggleLayer(this.checked, federal);
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
    case "bases":
      toggleLayer(this.checked, bases);
    break;
    case "boundaries":
      toggleLayer(this.checked, boundaries);
    break;
    case "national":
      toggleLayer(this.checked, national);
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
    case "testing":
      toggleLayer(this.checked, testing);
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



// var tooltipThreshold = 10;
// mymap.on('zoomend', function() {
//   if (mymap.getZoom() < tooltipThreshold) {
//       $(".leaflet-tooltip").css("display","none")
//   } else {
//       $(".leaflet-tooltip").css("display","block")
//   }
// })
