/////////////////////////////////////////
// basemaps
var none = L.tileLayer("");
var aerial = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
});
var streets = L.tileLayer("https://a.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>"
});

/////////////////////////////////////////
// Counties
var counties = VectorTileLayer("https://www.sharedgeo.org/COVID-19/leaflet/data/boundary/{z}/{x}/{y}.pbf", {
  minDetailZoom: 0,
  maxDetailZoom: 8,
  vectorTileLayerStyles: {
    cb_2017_us_county_500k: {
      weight: 1,
      color: "#6F7C80",
      opacity: 0.2,
      fill: false
    }
  }
});

////////////////////////////////////
// Positive COVID counties
// positiveCounties variable url displays the "Current Cases" count of each county in the pop-up
var positiveCounties = L.esri.featureLayer({
  url: "https://services2.arcgis.com/V12PKGiMAH7dktkU/arcgis/rest/services/PositiveCountyCount/FeatureServer/0",
  style: function (feature) {
  if (feature.properties.MLMIS_CTY >= 0 && feature.properties.MLMIS_CTY <= 1000) {
    return { fillColor: "rgb(230, 238, 207)", fill: true, stroke: false, fillOpacity: 0.6};
  } else if (feature.properties.MLMIS_CTY > 1000 && feature.properties.MLMIS_CTY <= 5000) {
    return { fillColor: "rgb(123, 204, 196)", fill: true, stroke: false, fillOpacity: 0.6};
  } else if (feature.properties.MLMIS_CTY > 5000 && feature.properties.MLMIS_CTY <= 10000) {
    return { fillColor: "rgb(67, 162, 202)", fill: true, stroke: false, fillOpacity: 0.6};
  } else {
    return { fillColor: "rgb(7, 85, 145)", fill: true, stroke: false, fillOpacity: 0.6};
  }
}
});

positiveCounties.bindPopup(function () {
  // return temporary message while the "queryInfo" function called from the popupopen function runs:
  return L.Util.template("Getting information");
});

positiveCounties.on("popupopen", function (evt) {
  // when the popup opens, we get the layer/featuere AND a reference to the popup in the evt variable here.
  queryInfo(evt.layer.feature, evt.popup);
});

positiveCounties.getPopup().on("remove", function () {
  positiveCounties.bindPopup(function () {
    // return temporary message while the "queryInfo" function called from the popupopen function runs:
    return L.Util.template("Getting information");
  });
});

// queryInfo url displays the "deaths" count in the pop-up
var queryInfo = function(feature, popup) {
  L.esri.query({
    url: "https://services1.arcgis.com/0MSEUqKaxRlEPj5g/ArcGIS/rest/services/ncov_cases2_v1/FeatureServer/1",
    where: "Province_State = 'Minnesota'"
  })
  .within(feature)
  .run(function(error, featureCollection) {
    try {
      var deaths = featureCollection.features[0].properties.Deaths;
    } catch (error) {
      var deaths = "no data";
      var recovered = "no data";
    }
  // this function is called when the query is complete. Update the currently open popup.
    popup.setContent(L.Util.template("<p><strong>{NAME_LOWER} County</strong><br></p> Confirmed Cases: {MLMIS_CTY}<br>Deaths: " + deaths, feature.properties));
  }.bind(this));
};

// Make sure layer sits on top
positiveCounties.on("load", function (e) {
  positiveCounties.bringToFront();
});


///////////////////////////////////////////////////
// Covid layer and Date Controls
  let displayDate;
  let min;
  let max;
  let day;

  function getval( callback ){
     $.getJSON("https://www.sharedgeo.org/COVID-19/leaflet/data/covid-19-cases.json", function(data) {
         // We can"t use .return because return is a JavaScript keyword.
         const st = data[Object.keys(data)[0]];
         const maxDate = Object.keys(st.statewide).slice(-1)[0];
         callback(maxDate);
     });
  }

    getval( function ( value ) {
      displayDate = moment(value).format("YYYY-MM-DD");

      $("#date").attr("max", displayDate);
      $("#date").attr("value", displayDate);

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


$.getJSON("https://www.sharedgeo.org/COVID-19/leaflet/data/covid-19-cases.json")
 .done( data => {

  cases = VectorTileLayer("https://www.sharedgeo.org/COVID-19/leaflet/data/state_county/{z}/{x}/{y}.pbf", {
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
      return colors.reverse();
    };

    // From https://github.com/d3/d3-scale-chromatic/blob/master/src/sequential-multi/viridis.js
    var magma_colors = colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf");

    if(data[state] &&
      data[state]["counties"] &&
      data[state]["counties"][county] &&
      data[state]["counties"][county][displayDate]) {
      const cases = 100000.0 * data[state]["counties"][county][displayDate] / population;
      const log_cases = (cases > 1) ? Math.log10(cases) : 0;
      color_index = Math.min(Math.floor(log_cases * 40), 255);
    }
    return ({
      stroke: false,
      fillColor: magma_colors[color_index],
      fill: true,
      fillOpacity: 1
     });
    },
    zIndex: 1
  });
 });


  function showNextDay() {
    if (day < max) {
      day.add(1, "days");
    } else {
      day = moment(min);
    }
    $("#date").val(day.format("YYYY-MM-DD")).change();
  }

  function showPreviousDay() {
    if (day > min) {
      day.add(-1, "days");
    } else {
      day = moment(max);
    }
    $("#date").val(day.format("YYYY-MM-DD")).change();
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
var boundaries = L.esri.featureLayer({ url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Political_Boundaries_Area/FeatureServer/0"});
boundaries.setStyle({
  color: "#808080",
  weight: 2,
  fill: false
});

/////////////////////////////////////////
// Airports
$.getJSON("data/airport/airport.geojson")
 .done( data => {
   airports = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["Certified"]) {
         case "Yes":
           var airport_com = L.icon({
             iconUrl: "data/airport/airport_com.svg",
             iconSize: [22, 22],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: airport_com}).bindPopup(function (layer) {
             return L.Util.template("<p><strong>{FacilityName}</strong><br>{City}, {State}<br>{LocationID}<br><br><a target='_blank' href='{QuickRef}'>Quick reference</a><br><a target='_blank' href='{airportURL}'>Detailed airport reference</a></p>", layer.feature.properties);
           });
         case "":
           var airport_non_com = L.icon({
             iconUrl: "data/airport/airport_non_com.svg",
             iconSize: [22, 22],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: airport_non_com}).bindPopup(function (layer) {
             return L.Util.template("<p><strong>{FacilityName}</strong><br>{City}, {State}<br>{LocationID}<br><br><a target='_blank' href='{QuickRef}>Quick reference</a><br><a target='_blank' href='{airportURL}'>Detailed airport reference</a></p>", layer.feature.properties);
           });
         case "Military":
           var airport_military = L.icon({
             iconUrl: "data/airport/airport_military.svg",
             iconSize: [22, 22],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: airport_military}).bindPopup(function (layer) {
             return L.Util.template("<p><strong>{FacilityName}</strong><br>{City}, {State}<br>{LocationID}<br><br><a target='_blank' href='{airportURL}'>Detailed airport reference</a></p>", layer.feature.properties);
           });
       }
  }
});
});


//////////////////////////////////////////
// Assisted Living: boarding care homes, housing with services, nursing homes and supervised living facilities

var boardingCareHomesIcon = L.icon({
  iconUrl: "data/assistedLiving/boardingCareHomes.svg",
  iconSize: [22, 22],
  popupAnchor: [0, -8]
});
var boardingCareHomes = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var bch_digit = (count + "").length;
  return L.divIcon({
   html: count,
   className: "bchCluster bch-" + bch_digit,
   iconSize: null
 });
}
});
$.getJSON("data/assistedLiving/boardingCareHomes.geojson")
 .done( data => {
   new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {icon: boardingCareHomesIcon}).bindPopup(function (feature) {
            return L.Util.template("<p><strong>{NAME}</strong><br>\n"+
            "Health Facility ID Number: {HFID}<br><br>\n"+
            "{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br> \n"+
            "County: {COUNTY_NAME}<br><br>\n"+
            "Phone: {TELEPHONE}<br> \n"+
            "Fax: {FAX}<br><br> \n"+
            "License Type: {LIC_TYPE}<br>\n"+
            "Administrator: {ADMINISTRATOR}<br><br>\n"+
            "State Licensed Nursing Home beds:<strong> {NH_BEDS}</strong><br>\n"+
            "State Licensed Boarding Care Home beds:<strong> {BCH_BEDS}</strong><br>\n"+
            "Federal Medicare Skilled Nursing Facility beds: <strong>{SNF_BEDS}</strong><br>\n"+
            "Federal Medicare/Medicaid Dual Skilled Nursing Facility and Nursing Facility beds:<strong> {SNFNF_BEDS}</strong><br>\n"+
            "Federal Medicaid Nursing Facility beds (Nursing Home): <strong>{NF2_BEDS}</strong><br><br>\n"+
            "<a target='_blank' href='https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html'><button>Health Regulation provider Data fields</button></a>\n"+
            "</p>", feature.feature.properties);
          });
  }
}).addTo(boardingCareHomes);
});

var housingWithServicesIcon = L.icon({
  iconUrl: "data/assistedLiving/housingWithServices.svg",
  iconSize: [22, 22],
  popupAnchor: [0, -8]
});
var housingWithServices = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var hws_digit = (count + "").length;
  return L.divIcon({
   html: count,
   className: "hwsCluster hws-" + hws_digit,
   iconSize: null
 });
}
});
$.getJSON("data/assistedLiving/housingWithServices.geojson")
 .done( data => {
   new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {icon: housingWithServicesIcon}).bindPopup(function (feature) {
            return L.Util.template("<p><strong>{NAME}</strong><br>\n"+
            "Health Facility ID Number: {HFID}<br><br>\n"+
            "{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br> \n"+
            "County: {COUNTY_NAME}<br><br>\n"+
            "Phone: {TELEPHONE}<br>\n"+
            "Fax: {FAX}<br><br> \n"+
            "License Type: {LIC_TYPE}<br>\n"+
            "Administrator: {ADMINISTRATOR}<br><br>\n"+
            "<a target='_blank' href='https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html'><button>Health Regulation provider Data fields</button></a>\n"+
            "</p>", feature.feature.properties);
          });
  }
}).addTo(housingWithServices);
});

var nursingHomesIcon = L.icon({
  iconUrl: "data/assistedLiving/nursingHomes.svg",
  iconSize: [22, 22],
  popupAnchor: [0, -8]
});
var nursingHomes = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var nh_digit = (count + "").length;
  return L.divIcon({
   html: count,
   className: "nhCluster nh-" + nh_digit,
   iconSize: null
 });
}
});
$.getJSON("data/assistedLiving/nursingHomes.geojson")
 .done( data => {
   new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {icon: nursingHomesIcon}).bindPopup(function (feature) {
            return L.Util.template("<p><strong>{NAME}</strong><br>\n"+
            "Health Facility ID Number: {HFID}<br><br>\n"+
            "{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br> \n"+
            "County: {COUNTY_NAME}<br><br>\n"+
            "Phone: {TELEPHONE}<br> \n"+
            "Fax: {FAX}<br><br> \n"+
            "License Type: {LIC_TYPE}<br>\n"+
            "Administrator: {ADMINISTRATOR}<br><br>\n"+
            "State licensed Hospital beds: <strong>{HOSP_BEDS}</strong><br>\n"+
            "Infant Bassinets: <strong>{BASS_BEDS}</strong><br>\n"+
            "State Licensed Boarding Care Home beds: <strong>{BCH_BEDS}</strong><br>\n"+
            "Federal Medicare Certified Hospital beds: <strong>{HOSP18_BEDS}</strong><br>\n"+
            "Federal Medicare Critical Access Hospital:<strong> {CAH}</strong><br>\n"+
            "Hospital Swing Bed Provider:<strong> {SWING}</strong><br>\n"+
            "State Licensed Nursing Home beds:<strong> {NH_BEDS}</strong><br>\n"+
            "Federal Medicare Skilled Nursing Facility beds: <strong>{SNF_BEDS}</strong><br>\n"+
            "Federal Medicare/Medicaid Dual Skilled Nursing Facility and Nursing Facility beds: <strong>{SNFNF_BEDS}</strong><br><br>\n"+
            "<a target='_blank' href='https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html'><button>Health Regulation provider Data fields</button></a>\n"+
            "</p>", feature.feature.properties);
          });
  }
}).addTo(nursingHomes);
});


var supervisedLivingFacilitiesIcon = L.icon({
  iconUrl: "data/assistedLiving/supervisedLivingFacilities.svg",
  iconSize: [22, 22],
  popupAnchor: [0, -8]
});
var supervisedLivingFacilities = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
    var count = cluster.getChildCount();
    var sl_digit = (count + "").length;
    return L.divIcon({
      html: count,
      className: "slCluster sl-" + sl_digit,
      iconSize: null
    });
  }
});
$.getJSON("data/assistedLiving/supervisedLivingFacilities.geojson")
 .done( data => {
   new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       return L.marker(latlng, {icon: supervisedLivingFacilitiesIcon}).bindPopup(function (feature) {
         return L.Util.template("<p><strong>{NAME}</strong><br>\n"+
            "Health Facility ID Number: {HFID}<br><br>\n"+
            "{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br> \n"+
            "County: {COUNTY_NAME}<br><br>\n"+
            "Phone: {TELEPHONE}<br> \n"+
            "Fax: {FAX}<br><br> \n"+
            "License Type: {LIC_TYPE}<br>\n"+
            "Administrator: {ADMINISTRATOR}<br><br>\n"+
            "Supervised Living Facility Class A beds: <strong>{SLFA_BEDS}</strong><br>\n"+
            "Supervised Living Facility Class B beds:<strong> {SLFB_BEDS}</strong><br>\n"+
            "Other beds:<strong> {OTHER_BEDS}</strong><br>\n"+
            "Psychiatric beds:<strong>  {PSY18_BEDS}</strong><br>\n"+
            "Intermediate Care Facility Mental Retardation beds: <strong>{ICFMR_BEDS}</strong><br><br>\n"+
            "<a target='_blank' href='https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html'><button>Health Regulation provider Data fields</button></a>\n"+
            "</p>", feature.feature.properties);
          });
  }
}).addTo(supervisedLivingFacilities);
});

////////////////////////////////////
// Bases
var bases = L.esri.featureLayer({
  url: "https://geo.dot.gov/server/rest/services/NTAD/Military_Bases/MapServer/0",
  where: "STATE_TERR NOT LIKE 'Minnesota'",
});
bases.setStyle({
  color: "green",
  weight: 5,
  fill: true
});
bases.bindPopup(function (layer) {
  return L.Util.template("<p><strong>{SITE_NAME}</strong><br><br>State Territory: {STATE_TERR}<br>Status: {OPER_STAT}<br>Component: {COMPONENT}</p>", layer.feature.properties);
});


////////////////////////////////////
// EOC
var eocIcon = L.icon({
  iconUrl: "data/EOC.png",
  iconSize: [22, 22],
  popupAnchor: [0, -28]
});
var eoc = L.esri.Cluster.featureLayer({
  url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Local_Emergency_Operations_Centers_EOC/FeatureServer/0",
  where: "STATE = 'MN'",
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var eoc_digit = (count + "").length;
  return L.divIcon({
   html: count,
   className: "eocCluster eoc-" + eoc_digit,
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
  return L.Util.template("<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIP}<br><br>Telephone: {TELEPHONE}</p>", layer.feature.properties);
});

/////////////////////////////////////////
// Federal Guard

// Federal Bases
$.getJSON("data/military/federal_bases.geojson")
 .done( data => {
   federal_bases = new L.geoJSON(data, {
     onEachFeature: function(feature, featureLayer){
       featureLayer.setStyle({
         color: "green",
         weight: 5,
         fill: true
       });
     }
});
});

var federal = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var fed_digit = (count + "").length;
  return L.divIcon({
   html: count,
   className: "fedCluster fed-" + fed_digit,
   iconSize: null
 });
}
});
$.getJSON("data/military/federal.geojson")
 .done( data => {
   new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["TypeLabel"]) {
         case "Army":
         var army_federal = L.icon({
           iconUrl: "data/military/army_federal.svg",
           iconSize: [22, 22],
           popupAnchor: [0, -8]
         });
         return L.marker(latlng, {icon: army_federal}).bindPopup(function (layer) {
           return L.Util.template("<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target='_blank' href='{Website}'><button>Website</button></a></p>", layer.feature.properties);
           });
         case "Navy":
         var navy_federal = L.icon({
           iconUrl: "data/military/navy_federal.svg",
           iconSize: [22, 22],
           popupAnchor: [0, -8]
         });
           return L.marker(latlng, {icon: navy_federal}).bindPopup(function (layer) {
             return L.Util.template("<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target='_blank' href='{Website}'><button>Website</button></a></p>", layer.feature.properties);
           });
         case "USMC":
           var usmc_federal = L.icon({
             iconUrl: "data/military/usmc_federal.svg",
             iconSize: [22, 22],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: usmc_federal}).bindPopup(function (layer) {
             return L.Util.template("<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target='_blank' href='{Website}'><button>Website</button></a></p>", layer.feature.properties);
           });
           case "Air Force":
             var military_airport_national = L.icon({
               iconUrl: "data/military/military_airport_federal.svg",
               iconSize: [22, 22],
               popupAnchor: [0, -8]
             });
             return L.marker(latlng, {icon: military_airport_national}).bindPopup(function (layer) {
               return L.Util.template("<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target='_blank' href='{Website}'><button>Website</button></a></p>", layer.feature.properties);
             });
           case "Coast Guard":
             var coast_federal = L.icon({
               iconUrl: "data/military/coast_federal.svg",
               iconSize: [22, 22],
               popupAnchor: [0, -8]
             });
             return L.marker(latlng, {icon: coast_federal}).bindPopup(function (layer) {
               return L.Util.template("<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target='_blank' href='{Website}'><button>Website</button></a></p>", layer.feature.properties);
             });
             case "USACE":
               var usace_federal = L.icon({
                 iconUrl: "data/military/usace_federal.svg",
                 iconSize: [22, 22],
                 popupAnchor: [0, -8]
               });
               return L.marker(latlng, {icon: usace_federal}).bindPopup(function (layer) {
                 return L.Util.template("<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target='_blank' href='{Website}'><button>Website</button></a></p>", layer.feature.properties);
               });
               case "AFRC":
                 var afrc_federal = L.icon({
                   iconUrl: "data/military/afrc_federal.svg",
                   iconSize: [22, 22],
                   popupAnchor: [0, -8]
                 });
                 return L.marker(latlng, {icon: afrc_federal}).bindPopup(function (layer) {
                   return L.Util.template("<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br><a target='_blank' href='{Website}'><button>Website</button></a></p>", layer.feature.properties);
                 });
       }
  }
}).addTo(federal);
});

/////////////////////////////////////////////
// fireStations
var fireStationsIcon = L.icon({
  iconUrl: "data/fireStations.svg",
  iconSize: [22, 22],
  popupAnchor: [0, -8]
});
var fireStations = L.esri.Cluster.featureLayer({
  url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/ArcGIS/rest/services/Fire_Station/FeatureServer/0",
  where: "STATE = 'MN'",
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var digits = (count + "").length;
  return L.divIcon({
   html: count,
   className: "fsCluster fs-" + digits,
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
  return L.Util.template("<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIPCODE}</p>", layer.feature.properties);
});

/////////////////////////////////////////
// Foodshelves
var foodshelvesIcon = L.icon({
  iconUrl: "data/foodshelves/foodshelves.svg",
  iconSize: [22, 22],
  popupAnchor: [0, -8]
});
var foodshelves = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var foodshelves_digit = (count + "").length;
  return L.divIcon({
   html: count,
   className: "foodshelvesCluster foodshelves-" + foodshelves_digit,
   iconSize: null
 });
}
});
$.getJSON("data/foodshelves/foodshelves.geojson")
 .done( data => {
   new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       // Filter out cities with no foodshelves. Foodshelves are scraped from this website: https://www.foodpantries.org/st/minnesota
        if (feature.properties.foodshelves_Url !== null) {
          return L.marker(latlng, {icon: foodshelvesIcon}).bindPopup(function (feature) {
            return L.Util.template("<br><iframe src={foodshelves_Url} style='border: 0px none; height: 400px; width: 310px;'></iframe>", feature.feature.properties);
          });
       }
  }
}).addTo(foodshelves);
});

///////////////////////////////////////////
// Medical - General Hospitals, Native American, Psychiatric, Veterans Affairs
var hospitalsIcon = L.icon({
  iconUrl: "data/hospital/hospital.svg",
  iconSize: [22, 22],
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
  return L.Util.template("<p><strong>{NAME}</strong><br><br>\n"+
  "{ADDRESS}<br> {CITY}, {STATE} {ZIP}<br>\n"+
  "County: {COUNTY}<br><br>\n"+
  "Type: {TYPE}<br>\n"+
  "Owner: {OWNER}<br>\n"+
  "Status:{STATUS}<br>\n"+
  "NAICS Description: {NAICS_DESC}<br>\n"+
  "Validation Method: {VAL_METHOD}<br>\n"+
  "Beds: {BEDS}<br>\n"+
  "Trauma: {TRAUMA}<br>\n"+
  "Helipad: {HELIPAD}<br><br>\n"+
  "<a target='_blank' href='{WEBSITE}'><button>Website</button></a><br>\n"+
  "<a target='_blank' href='https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html'><button>Health Regulation provider Data fields</button></a></p>", layer.feature.properties);
});

$.getJSON("data/hospital/naPublicHealthService.geojson")
 .done( data => {
   na = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["Type"]) {
         case "Clinic":
           var naClinic = L.icon({
             iconUrl: "data/hospital/naClinic.svg",
             iconSize: [22, 22],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: naClinic}).bindPopup(function (layer) {
             return L.Util.template("<p><strong>{NAME}</strong><br>\n"+
             "{ADDRESS}<br> {CITY}, {STATE} {ZIP}<br><br>\n"+
             "Type: {Type}<br><br>\n"+
             "Phone: {TELEPHONE}<br>\n"+
             "Fax: {FAX}<br><br>\n"+
             "Administrator: {ADMINISTRATOR}<br>\n"+
             "State Licensed Hospital beds: <strong> {HOSP_BEDS}</strong><br>\n"+
             "Infant Bassinets: <strong>{BASS_BEDS}</strong><br><br>\n"+
             "<a target='_blank' href='{Website}'><button>Website</button></a><br>\n"+
             "<a target='_blank' href='https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html'><button>Health Regulation provider Data fields</button></a></p>", layer.feature.properties);
           });
         case "Hospital":
           var naHospital = L.icon({
             iconUrl: "data/hospital/naHospital.svg",
             iconSize: [22, 22],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: naHospital}).bindPopup(function (layer) {
             return L.Util.template("<p><strong>{NAME}</strong><br>\n"+
             "{ADDRESS}<br> {CITY}, {STATE} {ZIP}<br><br>\n"+
             "Type: {Type}<br><br>\n"+
             "Phone: {TELEPHONE}<br>\n"+
             "Fax: {FAX}<br><br>\n"+
             "Administrator: {ADMINISTRATOR}<br>\n"+
             "State Licensed Hospital beds: <strong> {HOSP_BEDS}</strong><br>\n"+
             "Infant Bassinets: <strong>{BASS_BEDS}</strong><br><br>\n"+
             "<a target='_blank' href='{Website}'><button>Website</button></a><br>\n"+
             "<a target='_blank' href='https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html'><button>Health Regulation provider Data fields</button></a></p>", layer.feature.properties);
           });
       }
  }
});
});

var psychIcon = L.icon({
  iconUrl: "data/hospital/psychHospital.svg",
  iconSize: [22, 22],
  popupAnchor: [0, -8]
});
$.getJSON("data/hospital/psychHospital.geojson")
 .done( data => {
   psych = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {icon: psychIcon}).bindPopup(function (feature) {
            return L.Util.template("<p><strong>{NAME}</strong><br><br>\n"+
            "{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br>\n"+
            "County: {COUNTY_NAME}<br><br>\n"+
            "Phone: {TELEPHONE}<br>\n"+
            "Fax: {FAX}<br><br>\n"+
            "License Type: {LIC_TYPE}<br>\n"+
            "Administrator: {ADMINISTRATOR}<br><br>\n"+
            "State Licensed Psychiatric Beds:<strong> {PSY_HOSP_BEDS}</strong><br>\n"+
            "Supervised Living Facility Class B beds:<strong> {SLFB_BEDS}</strong><br>\n"+
            "Other beds:<strong> {OTHER_BEDS}</strong><br>\n"+
            "Federal Medicare Psychiatric beds: <strong>{PSY18_BEDS}</strong><br><br>\n"+
            "<a target='_blank' href='https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html'><button>Health Regulation provider Data fields</button></a></p>", feature.feature.properties);
          });
    }
  });
});

$.getJSON("data/hospital/vaFacilities.geojson")
 .done( data => {
   va = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["Type"]) {
         case "Hospital":
           var vaHospital = L.icon({
             iconUrl: "data/hospital/vaHospital.svg",
             iconSize: [22, 22],
             iconAnchor: [20, 0],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: vaHospital}).bindPopup(function (feature) {
             return L.Util.template("<p><strong>{NAME}</strong><br><br>\n"+
             "{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br>\n"+
             "Phone: {TELEPHONE}<br>\n"+
             "Fax: {FAX}<br><br>\n"+
             "Type: {Type}<br><br>\n"+
             "US National Grid: {USNationalGrid}<br><br>\n"+
             "Federal Medicare Certified Hospital beds:<strong> {HOSP18_BEDS}</strong><br>\n"+
             "State Licensed Psychiatric Beds:<strong> {PSY_HOSP_BEDS}</strong><br>\n"+
             "Federal Medicare Psychiatric beds:<strong> {PSY18_BEDS}</strong><br>\n"+
             "Federal Medicare Skilled Nursing Facility beds:<strong> {SNF_BEDS}</strong><br><br>\n"+
             "Federal Medicaid Nursing Facility beds (Nursing Home):<strong> {NF1_BEDS}</strong><br><br>\n"+
             "<a target='_blank' href={Website}><button>Website</button></a><br>\n"+
             "<a target='_blank' href='https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html'><button>Health Regulation provider Data fields</button></a></p>", feature.feature.properties);
           });
         case "Clinic":
           var vaClinic = L.icon({
             iconUrl: "data/hospital/vaClinic.svg",
             iconSize: [22, 22],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: vaClinic}).bindPopup(function (feature) {
             return L.Util.template("<p><strong>{NAME}</strong><br><br>\n"+
             "{ADDRESS}<br>{CITY}, {STATE} {ZIP}<br>\n"+
             "Phone: {TELEPHONE}<br>\n"+
             "Fax: {FAX}<br><br>\n"+
             "Type: {Type}<br><br>\n"+
             "US National Grid: {USNationalGrid}<br><br>\n"+
             "<a target='_blank' href={Website}><button>Website</button></a><br>\n"+
             "<a target='_blank' href='https://www.health.state.mn.us/facilities/regulation/directory/directorydatafile.html'><button>Health Regulation provider Data fields</button></a></p>", feature.feature.properties);
           });
       }
    }
  });
});

/////////////////////////////////////////
// National Guard

// National Guard Bases
$.getJSON("data/military/national_guard_bases.geojson")
 .done( data => {
   national_guard_bases = new L.geoJSON(data, {
     onEachFeature: function(feature, featureLayer){
       featureLayer.setStyle({
         color: "green",
         weight: 5,
         fill: true
       });
     }
  });
});

var national = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
    var count = cluster.getChildCount();
    var national_digit = (count + "").length;
    return L.divIcon({
      html: count,
      className: "nationalCluster national-" + national_digit,
      iconSize: null
    });
  }
});
$.getJSON("data/military/national_guard.geojson")
 .done( data => {
   new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["Symbol"]) {
         case "Armory":
           var armory_national = L.icon({
             iconUrl: "data/military/armory_national.svg",
             iconSize: [22, 22],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: armory_national}).bindPopup(function (layer) {
             return L.Util.template("<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target='_blank' href='{Website}'><button>Website</button></a><br><a target='_blank' href='{OtherInfo}'><button>Other Information</button></a></p>", layer.feature.properties);
           });
         case "Military Airport":
           var military_airport_national = L.icon({
             iconUrl: "data/military/military_airport_national.svg",
             iconSize: [22, 22],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: military_airport_national}).bindPopup(function (layer) {
             return L.Util.template("<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target='_blank' href='{Website}'><button>Website</button></a><br><a target='_blank' href='{OtherInfo}'><button>Other Information</button></a></p>", layer.feature.properties);
           });
         case "Helo":
           var helo_national = L.icon({
             iconUrl: "data/military/helo_national.svg",
             iconSize: [22, 22],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: helo_national}).bindPopup(function (layer) {
             return L.Util.template("<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target='_blank' href='{Website}'><button>Website</button></a><br><a target='_blank' href='{OtherInfo}'><button>Other Information</button></a></p>", layer.feature.properties);
           });
           case "Training":
             var training_national = L.icon({
               iconUrl: "data/military/training_national.svg",
               iconSize: [22, 22],
               popupAnchor: [0, -8]
             });
             return L.marker(latlng, {icon: training_national}).bindPopup(function (layer) {
               return L.Util.template("<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target='_blank' href='{Website}'><button>Website</button></a><br><a target='_blank' href='{OtherInfo}'><button>Other Information</button></a></p>", layer.feature.properties);
             });
           case "WMD":
             var wmd_national = L.icon({
               iconUrl: "data/military/wmd_national.svg",
               iconSize: [22, 22],
               popupAnchor: [0, -8]
             });
             return L.marker(latlng, {icon: wmd_national}).bindPopup(function (layer) {
               return L.Util.template("<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target='_blank' href='{Website}'><button>Website</button></a><br><a target='_blank' href='{OtherInfo}'><button>Other Information</button></a></p>", layer.feature.properties);
             });
             case "AFRC":
               var afrc_federal = L.icon({
                 iconUrl: "data/military/afrc_national.svg",
                 iconSize: [22, 22],
                 popupAnchor: [0, -8]
               });
               return L.marker(latlng, {icon: afrc_federal}).bindPopup(function (layer) {
                 return L.Util.template("<p><strong>{Name}</strong><br>{Street}<br>{City} {Zip}<br><br>Phone: {Phone}<br><br>Principal Unit: {PrincipalUnitsNotes}<br><br><a target='_blank' href='{Website}'><button>Website</button></a><br><a target='_blank' href='{OtherInfo}'><button>Other Information</button></a></p>", layer.feature.properties);
               });
         }
    }
  }).addTo(national);
});

//////////////////////////////////////////
// Native American Lands
var nativeLand = L.esri.featureLayer({
  url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Native_Lands/FeatureServer/0",
  where: "State_Nm = 'MN'"
});
nativeLand.setStyle({
  color: "#A87000",
  weight: 2,
  fill: "#A87000"
});
nativeLand.bindPopup(function (layer) {
  return L.Util.template("<p><strong>{Loc_Own}</strong></p>", layer.feature.properties);
});

//////////////////////////////////////////
// Police
var policeIcon = L.icon({
  iconUrl: "data/policeStations.svg",
  iconSize: [22, 22],
  popupAnchor: [0, -8]
});
var policeStations = L.esri.Cluster.featureLayer({
  url: "https://carto.nationalmap.gov/arcgis/rest/services/structures/MapServer/30",
  where: "STATE = 'MN'",
  iconCreateFunction: function (cluster) {
  var count = cluster.getChildCount();
  var police = (count + "").length;
  return L.divIcon({
   html: count,
   className: "policeCluster police-" + police,
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
  return L.Util.template("<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIPCODE}</p>", layer.feature.properties);
});


/////////////////////////////////////////
// Prisons
$.getJSON("data/prison/prisons.geojson")
 .done( data => {
   prisons = new L.geoJSON(data, {
     pointToLayer: function (feature, latlng) {
       switch(feature.properties["Type"]) {
         case "Federal":
           var prisons_fed = L.icon({
             iconUrl: "data/prison/prisons_fed.svg",
             iconSize: [22, 22],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: prisons_fed}).bindPopup(function (layer) {
             return L.Util.template("<p><strong>{FacilityName}</strong><br>{Street}<br>{City} {Zip}<br><br>Capacity: {Capacity} <br>Male or Female: {MaleFemale} <br>Juvenile: {Juvenile} <br>Minimum: {Minimum} <br>Medium: {Medium} <br>Close: {Close} <br>Maximum: {Maximum} <br><br><a target='_blank' href='{Website}'><button>Website</button></a></p>", layer.feature.properties);
           });
         case "State":
           var prisons_state = L.icon({
             iconUrl: "data/prison/prisons_state.svg",
             iconSize: [22, 22],
             popupAnchor: [0, -8]
           });
           return L.marker(latlng, {icon: prisons_state}).bindPopup(function (layer) {
             return L.Util.template("<p><strong>{FacilityName}</strong><br>{Street}<br>{City} {Zip}<br><br>Capacity: {Capacity} <br>Male or Female: {MaleFemale} <br>Juvenile: {Juvenile} <br>Minimum: {Minimum} <br>Medium: {Medium} <br>Close: {Close} <br>Maximum: {Maximum} <br><br><a target='_blank' href='{Website}'><button>Website</button></a>", layer.feature.properties);
           });
       }
  }
});
});
//////////////////////////////////////////
// Schools: public and private

var publicSchoolsIcon = L.icon({
  iconUrl: "data/publicSchools.svg",
  iconSize: [22, 22],
  popupAnchor: [0, -28]
});
var publicSchools = L.esri.Cluster.featureLayer({
  url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Public_Schools/FeatureServer/0",
  where: "STATE = 'MN'",
  iconCreateFunction: function (cluster) {
    var count = cluster.getChildCount();
    var digits = (count + "").length;
    return L.divIcon({
      html: count,
      className: "pusCluster pus-" + digits,
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
  return L.Util.template("<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIP}<br>Phone: {TELEPHONE}<br><br>Enrollment: {ENROLLMENT}<br>Grades: {ST_GRADE} to {END_GRADE}<br><br>Shelter ID: {SHELTER_ID}</p>", layer.feature.properties);
});

var privateSchoolsIcon = L.icon({
  iconUrl: "data/privateSchools.svg",
  iconSize: [22, 22],
  popupAnchor: [0, -28]
});
var privateSchools = L.esri.Cluster.featureLayer({
  url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Private_Schools/FeatureServer/0",
  where: "STATE = 'MN'",
  iconCreateFunction: function (cluster) {
    var count = cluster.getChildCount();
    var digits = (count + "").length;
    return L.divIcon({
      html: count,
      className: "psCluster ps-" + digits,
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
  return L.Util.template("<p><strong>{NAME}</strong><br><br>{ADDRESS}, {CITY} {ZIP}<br>Phone: {TELEPHONE}<br><br>Enrollment: {ENROLLMENT}<br>Grades: {START_GRAD} to {END_GRADE}<br><br>Shelter ID: {SHELTER_ID}</p>", layer.feature.properties);
});

// Layer is not working as of: 8/12/2020
//////////////////////////////////////////
// RedCross
// var redCross = L.esri.featureLayer({
//   url: "https://hosting.rcview.redcross.org/arcgis/rest/services/Hosted/ARC_Master_Geography_FY19_January/FeatureServer/3",
//   simplifyFactor: 0.5,
//   precision: 5
//  });
// redCross.setStyle({
//   color: "red",
//   weight: 2,
//   fillColor: "#ffcccb"
// });
// redCross.bindPopup(function (layer) {
//   return L.Util.template("<p><strong>{chapter}</strong><br><br>Region: {region}<br>Division: {division}</p>", layer.feature.properties);
// });

///////////////////////////////////////////
// RedCross Facilities
var redCrossFacilitiesIcon = L.icon({
  iconUrl: "data/redCrossFacilities.svg",
  iconSize: [22, 22],
  popupAnchor: [0, -28]
});
var redCrossFacilities = L.esri.featureLayer({
  url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/American_Red_Cross_Chapter_Facilities/FeatureServer/0",
  where: "STATE = 'MN'",
  pointToLayer: function (geojson, latlng) {
    return L.marker(latlng, {
      icon: redCrossFacilitiesIcon
    });
  }
});

redCrossFacilities.bindPopup(function (layer) {
  return L.Util.template("<p><strong>{NAME}</strong><br><br>Description: {NAICSDESCR}<br><br>{ADDRESS}, {CITY} {ZIP}<br><br>Phone: {PHONE}</p>", layer.feature.properties);
});

////////////////////////////////////////////
// Shelters
var sheltersIcon = L.icon({
  iconUrl: "data/shelters.svg",
  iconSize: [22, 22],
  popupAnchor: [0, -28]
});
var shelters = L.esri.Cluster.featureLayer({
  url: "https://gis.fema.gov/arcgis/rest/services/NSS/FEMA_NSS/FeatureServer/5",
  where: "STATE = 'MN'",
  iconCreateFunction: function (cluster) {
    var count = cluster.getChildCount();
    var shelter_digit = (count + "").length;
    return L.divIcon({
      html: count,
      className: "shelterCluster shelter-" + shelter_digit,
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
  return L.Util.template("<p><strong>{SHELTER_NAME} \n"+
  "</strong><br><br>{ADDRESS_1}, {CITY} {ZIP}<br><br>\n"+
  "County: {COUNTY_PARISH}<br>FIPS CODE: {FIPS_CODE}<br>\n"+
  "Evacuation Capacity: {EVACUATION_CAPACITY}<br> \n"+
  "Post Impact Capacity: {POST_IMPACT_CAPACITY}<br> \n"+
  "ADA Compliant: {ADA_COMPLIANT}<br>\n"+
  "Wheelchair Accessible: {WHEELCHAIR_ACCESSIBLE}<br>\n"+
  "Pet Accommodations: {PET_ACCOMMODATIONS_CODE} {PET_ACCOMMODATIONS_DESC}<br>\n"+
  "Generator Onsite: {GENERATOR_ONSITE}<br>\n"+
  "Self sufficient electricity: {SELF_SUFFICIENT_ELECTRICITY}<br>\n"+
  "In 100 year floodplain: {IN_100_YR_FLOODPLAIN}<br\n"+
  "In 500 year floodplain: {IN_500_YR_FLOODPLAIN}<br><br>\n"+
  "Phone: {ORG_MAIN_PHONE}<br>\n"+
  "Hotline Phone: {ORG_HOTLINE_PHONE}<br> \n"+
  "Email: {ORG_EMAIL}<br>\n"+
  "Shelter Status: {SHELTER_STATUS_CODE}<br>\n"+
  "Shelter Open Date: {SHELTER_OPEN_DATE}<br>\n"+
  "Shelter Closed Date: {SHELTER_CLOSED_DATE}<br> \n"+
  "Medical needs population: {MEDICAL_NEEDS_POPULATION}<br> \n"+
  "Other population: {OTHER_POPULATION} {OTHER_POPULATION_DESCRIPTION}<br>\n"+
  "Total population: {TOTAL_POPULATION}<br> \n"+
  "Pet population: {PET_POPULATION}</p>", layer.feature.properties);
});

////////////////////////////////////////////
// Test Locations: No Cost

function template(feature) {
  var l = feature.properties;

  var template =
  "<br>"
  if (!l.MondayStart && !l.MondayEnd && !l.TuesdayStart && !l.TuesdayEnd && !l.WednesdayStart && !l.WednesdayEnd && !l.ThursdayStart && !l.ThursdayEnd
      && !l.FridayStart && !l.FridayEnd && !l.SaturdayStart && !l.SaturdayEnd && !l.SundayStart && !l.SundayEnd ) {
    template +=
        "<br/>Contact for hours of operation"
  } else {
    template += "<br/><strong>Hours of operation:</strong>";
    if (l.MondayStart === l.TuesdayStart && l.MondayStart === l.WednesdayStart && l.MondayStart === l.ThursdayStart && l.MondayStart === l.FridayStart &&
        l.MondayEnd === l.TuesdayEnd && l.MondayEnd === l.WednesdayEnd && l.MondayEnd === l.ThursdayEnd && l.MondayEnd === l.FridayEnd) {
      if(!l.MondayStart && !l.MondayEnd) {
        template +=
            "<br/><strong>Weekdays: </strong> Closed"
      } else {
        template +=
            "<br/><strong>Weekdays: </strong> { MondayStart } - { MondayEnd }"
      }
    } else {
      if(!l.MondayStart && !l.MondayEnd) {
        template +=
            "<br/><strong>Mondays: </strong> Closed";
      } else {
        template +=
            "<br/><strong>Mondays: </strong> { MondayStart } - { MondayEnd }"
      }
      if(!l.TuesdayStart && !l.TuesdayEnd) {
        template +=
            "<br/><strong>Tuesdays: </strong> Closed";
      } else {
        template +=
            "<br/><strong>Tuesdays: </strong> { TuesdayStart } - { TuesdayEnd }"
      }
      if(!l.WednesdayStart && !l.WednesdayEnd) {
        template +=
            "<br/><strong>Wednesdays: </strong> Closed";
      } else {
        template +=
            "<br/><strong>Wednesdays: </strong> { WednesdayStart } - { WednesdayEnd }";
      }
      if(!l.ThursdayStart && !l.ThursdayEnd) {
        template +=
            "<br/><strong>Thursdays: </strong> Closed";
      } else {
        template +=
            "<br/><strong>Thursdays: </strong> { ThursdayStart } - { ThursdayEnd }";
      }
      if(!l.FridayStart && !l.FridayEnd) {
        template +=
            "<br/><strong>Fridays: </strong> Closed";
      } else {
        template +=
            "<br/><strong>Fridays: </strong> { FridayStart } - { FridayEnd }";
      }
    }
    if (l.SaturdayStart === l.SundayStart && l.SaturdayEnd === l.SundayEnd) {
      if (!l.SundayStart && !l.SaturdayEnd) {
        template +=
            "<br/><strong>Weekends: </strong> Closed";
      } else {
        template +=
            "<br/><strong>Weekends: </strong> { SaturdayStart } - { SaturdayEnd }";
      }
    } else {
      if(!l.SaturdayStart && !l.SaturdayEnd) {
        template +=
            "<br/><strong>Saturdays: </strong> Closed";
      } else {
        template +=
            "<br/><strong>Saturdays: </strong> { SaturdayStart } - { SaturdayEnd }";
      }
      if(!l.SundayStart && !l.SundayEnd) {
        template +=
            "<br/><strong>Sundays: </strong> Closed";
      } else {
        template +=
            "<br/><strong>Sundays: </strong> { SundayStart } - { SundayEnd }"
      }
    }
  }
  if (l.TestingRequirements) {
    template += "<br/><br><strong>Requirements: </strong>"
    if (l.TestingRequirements.trim().includes("|")) {
      $.each(l.TestingRequirements.trim().split("|"), function (idx, result) {
        if (result.trim().toLowerCase() != "other" && result.trim().length > 0) {
          template += "<br>  " +result.trim();
        }
      });

    } else {
      template +=
          "{ TestingRequirements }";
    }
  }
  return template
}

var testingFree = L.esri.Cluster.featureLayer({
  url: "https://services.arcgis.com/9OIuDHbyhmH91RfZ/arcgis/rest/services/CovidTestLocations_view_prd/FeatureServer/0",
  where: "(ProviderName = 'No-Cost Community Sites') AND (State = 'MN')",
  iconCreateFunction: function (cluster) {
    var count = cluster.getChildCount();
    var testing_digit = (count + "").length;
    return L.divIcon({
      html: count,
      className: "testingCluster testing-" + testing_digit,
      iconSize: null
    });
  },
  pointToLayer: function (feature, latlng) {
    var t = template(feature)

    var testing_free = L.icon({
      iconUrl: "data/testing/testing_appt.svg",
      iconSize: [22, 22],
      popupAnchor: [0, -8]
    });
    return L.marker(latlng, {icon: testing_free}).bindPopup(function (layer) {
      return L.Util.template("<h3>{SiteName}</h3><p><strong>Provider: </strong>{ProviderName}<br><br>{AddrLine1}<br>{City}, {Zip}<br><strong>Contact Info: </strong><a href='tel:{Phone}'>{Phone}</a>"+ t +"<br><br><a target='_blank' href='https://mn.gov/covid19/get-tested/testing-locations/index.jsp'><button>Click for more details</button></a></p>", layer.feature.properties);
    });
  }
});

// Test Locations: All Other
var testingOther = L.esri.Cluster.featureLayer({
  url: "https://services.arcgis.com/9OIuDHbyhmH91RfZ/arcgis/rest/services/CovidTestLocations_view_prd/FeatureServer/0",
  where: "(NOT ProviderName = 'No-Cost Community Testing Sites') AND (State = 'MN')",
  iconCreateFunction: function (cluster) {
    var count = cluster.getChildCount();
    var testing_digit = (count + "").length;
    return L.divIcon({
      html: count,
      className: "testingClusterOther testing-" + testing_digit,
      iconSize: null
    });
  },
  pointToLayer: function (feature, latlng) {
    var t = template(feature)

    var testing_else = L.icon({
      iconUrl: "data/testing/testing_else.svg",
      iconSize: [22, 22],
      popupAnchor: [0, -8]
    });
    return L.marker(latlng, {icon: testing_else}).bindPopup(function (layer) {
      return L.Util.template("<h3>{SiteName}</h3><p><strong>Provider: </strong>{ProviderName}<br><br>{AddrLine1}<br>{City}, {Zip}<br><strong>Contact Info: </strong><a href='tel:{Phone}'>{Phone}</a>"+ t +"<br><br><a target='_blank' href='https://mn.gov/covid19/get-tested/testing-locations/index.jsp'><button>Click for more details</button></a></p>", layer.feature.properties);
    });
  }
});

/////////////////////////////////////////
// USNG Responder Maps

// Accepts [lon,lat]
// Returns [[lon_deg,lon_min,lon_dir],[lat_deg,lat_min,lat_dir]]
function dd2ddm(xy) {
  var coords = [];

  for (i=0; i<xy.length; i++) {
    var arr = [1,0,1];
    var spl = xy[i].toString().split(".");
    arr[0] = Math.abs(xy[i].toString().split(".")[0]);
    arr[1] = spl.length == 2 ? Math.abs(parseFloat("."+xy[i].toString().split(".")[1])*60.0) : 0;
    arr[2] = xy[i] >= 0 ? 1 : -1;

    coords[i] = arr;
  }
  return coords;
}

// USNG none selected
var usngNone = L.tileLayer("");

// 10K Overview map - Aerial
var usngAerial = L.esri.featureLayer({ url: "https://services2.arcgis.com/CfhoRi2v351nuUH7/ArcGIS/rest/services/MGACEPC_aerial_10Kmapindex/FeatureServer/0"});
usngAerial.setStyle({
  color: "#808080",
  weight: 1,
  fill: false
});
usngAerial.bindPopup(function (layer) {
  let input = [layer.feature.properties.Lat ,layer.feature.properties.Lon];
  let dms = dd2ddm(input);

  var lat_dir = dms[0][2] < 0 ? "S" : "N";
  var long_dir = dms[1][2] < 0 ? "W" : "E";

  let lat = "Latitude: " + dms[0][0] + " " + Math.round(dms[0][1]*100)/100 + " " + lat_dir;
  let long = "Longitude: " + dms[1][0] + " " + Math.round(dms[1][1]*100)/100 + " " + long_dir;

  return L.Util.template("<p><strong>{Name}</strong><br><br> \n"+
  "National Grid (100k) : {NG100K}<br><br>\n"+
  lat + "<br>" + long + "<br><br>\n"+
  "<a target='_blank' href='{URL}'><button>Download 10K Aerial</button></a></p>", layer.feature.properties);
});

// 10K Overview map - Maps
var usngMap = L.esri.featureLayer({ url: "https://services2.arcgis.com/CfhoRi2v351nuUH7/ArcGIS/rest/services/MGACEPC_street_10Kmapindex/FeatureServer/0"});
usngMap.setStyle({
  color: "#808080",
  weight: 1,
  fill: false
});
usngMap.bindPopup(function (layer) {
  let input = [layer.feature.properties.Lat ,layer.feature.properties.Lon];
  let dms = dd2ddm(input);

  var lat_dir = dms[0][2] < 0 ? "S" : "N";
  var long_dir = dms[1][2] < 0 ? "W" : "E";

  let lat = "Latitude: " + dms[0][0] + " " + Math.round(dms[0][1]*100)/100 + " " + lat_dir;
  let long = "Longitude: " + dms[1][0] + " " + Math.round(dms[1][1]*100)/100 + " " + long_dir;

  return L.Util.template("<p><strong>{Name}</strong><br><br> \n"+
  "National Grid (100k) : {NG100K}<br><br>\n"+
  lat + "<br>" + long + "<br><br>\n"+
  "<a target='_blank' href='{URL}'><button>Download 10K Map</button></a></p>", layer.feature.properties);
});

// Vaccine By County
var vaccineCounty = L.esri.featureLayer({
  url: "https://services2.arcgis.com/V12PKGiMAH7dktkU/arcgis/rest/services/Join_Features_to_VaccineByCounty/FeatureServer/0/",
  style: function (feature) {
  if (feature.properties.RegPrvdrs >= 0 && feature.properties.RegPrvdrs <= 5) {
    return { fillColor: "#F6E5CF", fill: true, stroke: false,fillOpacity: 0.6};
  } else if (feature.properties.RegPrvdrs > 5 && feature.properties.RegPrvdrs <= 20) {
    return { fillColor: "#E6B7C4", fill: true, stroke: false,fillOpacity: 0.6};
  } else if (feature.properties.RegPrvdrs > 20 && feature.properties.RegPrvdrs <= 50) {
    return { fillColor: "#CC71B4", fill: true, stroke: false,fillOpacity: 0.6};
  } else {
    return { fillColor: "#8C3C88", fill: true, stroke: false,fillOpacity: 0.6};
  }
}
});
vaccineCounty.bindPopup(function (layer) {
  // return temporary message while the "queryInfo" function called from the popupopen function runs:
  return L.Util.template("<p><strong>{NAME_LOWER} County</strong><br><br> \n"+
  "Number of Providers: {RegPrvdrs}<br><br>\n"+
  "</p>", layer.feature.properties);
});

// Vaccine locations
// Free
var vaccineLocationsFree = L.esri.Cluster.featureLayer({
  url: "https://services.arcgis.com/9OIuDHbyhmH91RfZ/ArcGIS/rest/services/CovidVacLocations_view_prod/FeatureServer/0",
  where: "(ProviderName = 'No-Cost Community Sites') AND (State = 'MN')",
  pointToLayer: function (feature, latlng) {
    var t = template(feature)

    var vaccine = L.icon({
      iconUrl: "data/testing/vaccineFree.svg",
      iconSize: [20, 20],
      popupAnchor: [0, -8]
    });
    return L.marker(latlng, {icon: vaccine}).bindPopup(function (layer) {
      return L.Util.template("<h3>{SiteName}</h3><p><strong>Provider: </strong>{ProviderName}<br><br>{City}, {Zip}<br><br><strong>Contact Info: </strong><a href='tel:{Phone}'>{Phone}</a>"+ t +"<br><br><a target='_blank' href='https://mn.gov/covid19/vaccine/find-vaccine/locations/index.jsp'><button>Click for more details</button></a></p>", layer.feature.properties);
    });
  }
});

// Vaccine locations: other
var vaccineLocations = L.esri.Cluster.featureLayer({
  url: "https://services.arcgis.com/9OIuDHbyhmH91RfZ/ArcGIS/rest/services/CovidVacLocations_view_prod/FeatureServer/0",
  where: "(NOT ProviderName = 'No-Cost Community Sites') AND (State = 'MN')",
  iconCreateFunction: function (cluster) {
    var count = cluster.getChildCount();
    var vaccine_digit = (count + "").length;
    return L.divIcon({
      html: count,
      className: "vaccineCluster vaccine-" + vaccine_digit,
      iconSize: null
    });
  },
  pointToLayer: function (feature, latlng) {
    var t = template(feature)

    var vaccine = L.icon({
      iconUrl: "data/testing/vaccine.svg",
      iconSize: [20, 20],
      popupAnchor: [0, -8]
    });
    return L.marker(latlng, {icon: vaccine}).bindPopup(function (layer) {
      return L.Util.template("<h3>{SiteName}</h3><p><strong>Provider: </strong>{ProviderName}<br><br>{City}, {Zip}<br><br><strong>Contact Info: </strong><a href='tel:{Phone}'>{Phone}</a>"+ t +"<br><br><a target='_blank' href='https://mn.gov/covid19/vaccine/find-vaccine/locations/index.jsp'><button>Click for more details</button></a></p>", layer.feature.properties);
    });
  }
});

////////////////////////////////////
// Add it all together
var mymap = L.map("mapid", {
  preferCanvas: true,
  center: [45.9, -95.9],
  zoom: 6,
  layers: [positiveCounties, counties, boundaries, none]
});

L.control.sidebar("sidebar").addTo(mymap);

// Layer logic
$("input[type='checkbox']").change(function() {
  var layerClicked = $(this).attr("id");
  switch (layerClicked) {
    case "airports":
      toggleLayer(this.checked, airports);
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
      toggleLayer(this.checked, cases);
    break;
    case "counties":
      toggleLayer(this.checked, counties);
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
    // case "redCross":
    //   toggleLayer(this.checked, redCross);
    // break;
    case "shelters":
      toggleLayer(this.checked, shelters);
    break;
    case "supervisedLivingFacilities":
      toggleLayer(this.checked, supervisedLivingFacilities);
    break;
    case "testingFree":
      toggleLayer(this.checked, testingFree);
    break;
    case "testingOther":
      toggleLayer(this.checked, testingOther);
    break;
    case "va":
      toggleLayer(this.checked, va);
    break;
    case "vaccineCounty":
      toggleLayer(this.checked, vaccineCounty)
    break;
    case "vaccineLocations":
      toggleLayer(this.checked, vaccineLocations)
    break;
    case "vaccineLocationsFree":
      toggleLayer(this.checked, vaccineLocationsFree)
    break;
  }
});

function toggleLayer(checked, layer) {
  if (checked) {
    mymap.addLayer(layer);
  } else {
    mymap.removeLayer(layer);
  }
}

// Radio button variables
let us = $("input[name='use_us']");
let mn = $("input[name='use_mn']");
let co = $("input[name='county']");
let st = $("input[name='states']");
let vc = $("input[name='vaccineCounty']");

// Radio buttons for basemaps
$("input[type='radio'][name='radiobtn-basemap']").change(function() {
  var radioClicked = $(this).attr("id");
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

// Radio buttons for USNG maps
$("input[type=radio][name=radiobtn-usng]").change(function() {
  var radioClicked = $(this).attr("id");
  switch (radioClicked) {
    case "usng-none":
      mymap.removeLayer(usngMap);
      mymap.removeLayer(usngAerial);
      mymap.addLayer(usngNone);
      usngNone.bringToBack();
    break;
    case "usng-aerial":
    // Turns COVID layers off but makes sure County and State boundaries are on
      mymap.removeLayer(usngMap);
      mymap.removeLayer(usngNone);
      mn.prop("checked",false);
      mymap.removeLayer(positiveCounties);
      us.prop("checked",false);
      mymap.removeLayer(vaccineCounty);
      vc.prop("checked", false);
      mymap.removeLayer(cases);

      document.getElementById("streets").checked = true;
      mymap.addLayer(streets);
      streets.bringToBack();

      st.prop("checked",true);
      mymap.addLayer(boundaries);
      co.prop("checked",true);
      mymap.addLayer(counties);
      mymap.addLayer(usngAerial);
      usngAerial.bringToBack();
    break;
    case "usng-map":
    // Turns COVID layers off but makes sure County and State boundaries are on
      mymap.removeLayer(usngAerial);
      mymap.removeLayer(usngNone);
      mn.prop("checked",false);
      mymap.removeLayer(positiveCounties);
      us.prop("checked",false);
      mymap.removeLayer(vaccineCounty);
      vc.prop("checked", false);
      mymap.removeLayer(cases);

      document.getElementById("streets").checked = true;
      mymap.addLayer(streets);
      streets.bringToBack();

      st.prop("checked",true);
      mymap.addLayer(boundaries);
      co.prop("checked",true);
      mymap.addLayer(counties);
      mymap.addLayer(usngMap);
      usngMap.bringToBack();
    break;
  }
});

// Ensures mn cases and us covid cases are not on at the same time
us.change(function(){
  mn.prop("checked",false);
  vc.prop("checked",false);
  mymap.removeLayer(positiveCounties);
  mymap.removeLayer(vaccineCounty);
});
mn.change(function(){
  us.prop("checked",false);
  vc.prop("checked",false);
  mymap.removeLayer(cases);
  mymap.removeLayer(vaccineCounty);
});
vc.change(function(){
  us.prop("checked",false);
  mn.prop("checked",false);
  mymap.removeLayer(positiveCounties);
  mymap.removeLayer(cases);
});
