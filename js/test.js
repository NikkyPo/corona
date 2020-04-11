var displayDate = '2020-04-02';

var mymap = L.map('mapid').setView([40, -90], 4);
var layers = L.control.layers(null, null, { autoZIndex: false });
layers.addTo(mymap);

{
  let l = L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    zIndex: 0
  });
  l.addTo(mymap);
  layers.addOverlay(l, "OpenStreetMap");
}

{
  let l = VectorTileLayer('data/boundary/{z}/{x}/{y}.pbf', {
    minDetailZoom: 0,
    maxDetailZoom: 8,
    vectorTileLayerStyles: {
      cb_2017_us_county_500k: {
        weight: 1,
        color: '#000000',
        opacity: 0.2,
        fill: false
      },
      cb_2015_us_state_500k: {
        weight: 3,
        color: '#000000',
        opacity: 0.2,
        fill: false
      }
    },
    zIndex: 5
  });
  l.addTo(mymap);
  layers.addOverlay(l, "States and Counties");
}


$.getJSON('data/covid-19-cases.json')
 .done( data => {
   let layer = VectorTileLayer('data/state_county/{z}/{x}/{y}.pbf', {
     minDetailZoom: 0,
     maxDetailZoom: 8,
     attribution: "COVID-19 data is from the University of Virginia Biocomplexity Institute's COVID-19 Surveillance <a href='http://nssac.bii.virginia.edu/covid-19/dashboard/'>Dashboard</a> <a href='https://creativecommons.org/licenses/by-nc/4.0/'>CC-BY-NC</a>",
     style: function(f, name) {
       //console.log(f, name);
       const state = f.properties.st_name;
       const county = f.properties.cty_name;
       const population = f.properties.tot_pop;

       let r = 255;
       let g = 255;
       let b = 255;
       if(data[state] &&
        data[state]["counties"] &&
        data[state]["counties"][county] &&
        data[state]["counties"][county][displayDate]) {
         const cases = 100000.0 * data[state]["counties"][county][displayDate] / population;
         const log_cases = (cases > 1) ? Math.log10(cases) : 0;

         if (log_cases <= 2.5) {
           r = 255;
           g = b = 255 - Math.floor(log_cases * 255 / 2.5);
         } else {
           b = Math.floor((log_cases - 2.5) * (255 / 2.5));
           g = 0;
           r = 255 - (b / 2);
         }
         //console.log(county, cases, log_cases, r, g, b);
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
   //layer.addTo(mymap);
   layers.addBaseLayer(layer, "Active Cases per 100,000");

  layer = VectorTileLayer('data/state_county/{z}/{x}/{y}.pbf', {
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
   layer.addTo(mymap);
   layers.addBaseLayer(layer, "Active Cases");

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
