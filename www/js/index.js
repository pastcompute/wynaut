// State codes from https://raw.githubusercontent.com/edwinsteele/d3-projects/master/data/au-states.geojson
// 0..8  NSW, VIC, QLD, SA, WA, TAS, NT, ACT, other


// TLA translation
var StateCode = {
  1: 'NSW',
  2: 'VIC',
  3: 'QLD',
  4: 'SA',
  5: 'WA',
  6: 'TAS',
  7: 'NT',
  8: 'ACT',
  9: 'OTH'
};

var Screens = {
  INITIAL: 'initial',
};

var Styles = {
  states: {
    weight: 1,
    opacity: 1,
    color: 'yellow',
    fillOpacity: 0.1
  },
  country_AUS: {
    fillColor: 'green',
    weight: 2,
    opacity: 1,
    color: 'yellow',
    fillOpacity: 0.8
  }
};

var data = {
  screen: Screens.INITIAL,
  bbox: {},
  loadedItems: 0,
  statesItem: {},
  stateLayers: {}
};

function goHome() {
  data.screen = Screens.INITIAL;
  var country = 'AUS';
  var bbox = data.bbox[country].geometry.coordinates[0];
  data.map.fitBounds([ [bbox[0][1], bbox[0][0]], [bbox[2][1], bbox[2][0]] ]);
  //if (data.statesItem) data.map.removeLayer(data.statesItem);
  $('#button-home').hide();
  $('.slideshow').hide();
  for (var state in data.stateLayers) {
    var layer = data.stateLayers[state];
    layer.setStyle(Styles.states);
  }
}

function updateOverlay() {
}

(function(){
  var map = data.map = L.map('map', {
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      keyboard: false,
      zoomControl: false,
    });
  var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a  href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
  }).addTo(map);
//  goHome();
  data.screen = Screens.INITIAL;
})();

var featureOnState = {
  click : onStateClick,
};

function onCountry(json) {
  var country = json.features[0].id;
  console.log(country);
  var item = L.geoJson(json, {
    onEachFeature: function (feature, layer) { },
    style : function (feature) { return Styles['country_' + country]; }
  }).addTo(data.map);
  data.bbox[country] = turf.envelope(json);
  console.log(JSON.stringify(data.bbox[country]));
  var bbox = data.bbox[country].geometry.coordinates[0];
  console.log(bbox[0] + ';' + bbox[2]);
  data.map.fitBounds([ [bbox[0][1], bbox[0][0]], [bbox[2][1], bbox[2][0]] ]); // ffs why is the map lat lon backwards from geojson
}

function onStates(json) {
  console.log('states');
  var item = L.geoJson(json, {
    onEachFeature: function (feature, layer) {
      data.stateLayers[feature.properties.STATE_CODE] = layer;
      var x = data.bbox[feature.properties.STATE_CODE] = turf.envelope(feature);
      console.log(JSON.stringify(x));
      layer.on(featureOnState);
    }, // called once for each state
    style : function (feature) { return Styles['states']; }
  });
  data.statesItem = item;
  data.map.addLayer(data.statesItem);
}

_.templateSettings = { interpolate : /\{\{(.+?)\}\}/g };
var IMG_FRAGMENT = _.template("<a href='{{xref}}'><img src='{{url}}' data-title='{{title}}' data-description='{{desc}}'></img></a>");

function populateImage(v, k) {
  //var items = $('#carousel img').length;
  if (data.loadedItems < 4) { console.log(k + ',' + JSON.stringify(v)); }
  
  if (data.loadedItems > 30) { return; } // v.Catalogue
  var html = IMG_FRAGMENT({ xref : v.Image, url: v.Image, title : v.Title, desc: v.Description });
  var img = $(html);
  $('#carousel').append(img);
  data.loadedItems ++;

/*
  $.get(v.Image)
    .done(function() {
      console.log(v.Catalogue);
      console.log(html);
      var img = $(html);
      $('#carousel').append(img);
      data.loadedItems ++;
    })
  .fail(function() { console.log('Image not found - skip');}); 
*/
}

function onPictureData(json) {
  console.log('pdata');
//  for (var x in json) {    console.log(x);  }
  $('#carousel img').remove();
  data.loadedItems = 0;
  _.each(json, populateImage); // limit to reduce load time. TODO: randomise
  console.log('I loaded = ' + data.loadedItems);
}

function onStateClick(e) {
  var state = e.target.feature.properties.STATE_CODE;
  console.log('click:state ' + state);
  //if (data.screen === Screens.INITIAL) {
  data.selectedStateName = e.target.feature.properties.STATE_NAME;
  var bbox = data.bbox[e.target.feature.properties.STATE_CODE].geometry.coordinates[0];
  data.map.fitBounds([ [bbox[0][1], bbox[0][0]], [bbox[2][1], bbox[2][0]] ]); // ffs why is the map lat lon backwards from geojson

  var layer = data.stateLayers[state];
  var colour = "#0000dd";
  var style = {
    weight: 1,
    opacity: 1,
    color: colour,
    fillOpacity: 0.9,
    // FIXME: border
  }
  layer.setStyle(style);
  $('#button-home').show();
  $('.slideshow').show();
}

// Next one is CC0 license
var p1 = new Promise(function(resolve, reject) { d3.json('assets/AUS.geo.json', function(json) { onCountry(json); resolve(); }); });
var p2 = new Promise(function(resolve, reject) { d3.json('assets/states.geojson', function(json) { onStates(json); resolve(); }); });
var p3 = new Promise(function(resolve, reject) { d3.json('assets/pdata.json', function(json) { onPictureData(json); resolve(); }); });
// --allow-file-access-from-files (chrome)
// npm install -g http-server , cd /path/to/project/folder , http-server

$(document).ready(function() {
  console.log(1);
  p1.then(function() {
    console.log(21);
  });
  p2.then(function() {
    console.log(22);
  });
  $('.item-n').removeAttr('hidden');
  $('#button-home').on('click', goHome);
  $('#button-info').on('click', function() { $('#info').removeAttr('hidden').show(); });
  $('#info').on('click', function() { $('#info').hide(); });
  $('#info').hide();
  $('#button-home').hide();
  $('.slideshow').hide();
  $('#button-info').show();
  
  Galleria.loadTheme('galleria/themes/classic/galleria.classic.min.js');
  var ready = false;
  Galleria.configure({
      wait: true,
      showInfo: true,
      imageTimeout: 50,
      dummy: '/assets/dummy.jpg'
  });
  Galleria.run('#carousel');
  Galleria.ready(function(options) {
    this.bind('image', function(e) {
      if (!ready) {
        var img = $('#carousel').data('galleria').getActiveImage();
        console.log(img.src);
      }
      ready = true;
      console.log('Now viewing ' + e.imageTarget.src);
    });
  });
});
