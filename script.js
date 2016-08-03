mapboxgl.accessToken = 'pk.eyJ1IjoicmJvdXJhc3NhIiwiYSI6ImNpZ2NwOGM2MTN6Znh0ZW01Z2k5dnViMWsifQ.PDTaSyP-XHhBsvVRHrfx9w';
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/rbourassa/ciqns9rn10009bdmf44n8z2wl',
	center: [-78.55, 39.00],
	maxBounds: [
	  [-90.0, 41.0],
	  [-72.0, 35.0]
	],
	zoom: 6.7,
	attributionControl: {
		position: 'bottom-right'
	}	
});

var url = 'https://spreadsheets.google.com/feeds/list/1E-bTt31rGTDedtxbAh_mUeU7YZm0tClKkRnrwDLa06I/2/public/basic?alt=json';

var steward_template_string = "<% if (steward.name) { %><p><strong>Organization: </strong><%= steward.name %></p><% } %><% if (steward.geo) { %><p><strong>Focus Area: </strong><%= steward.geo %></p><% } %><% if (steward.contact) {%><p><strong>Website: </strong><a href = <%= steward.contact %>>Click Here</a></p><% } %>";
var steward_template = _.template(steward_template_string, {variable: 'steward'});

map.on('load', function() {

  mapboxgl.util.getJSON(url, function(err, data) {
	  document.body.classList.remove('loading');
	  if (err) return console.warn(err);
	  var geojson = {
		  type: 'FeatureCollection',
		  features: []
	  };
	
	  data.feed.entry.forEach(function(d) {
		  var fields = d.content.$t.split(', ');
		  var lng = parseFloat(fields[5].split(': ')[1]);
		  var lat = parseFloat(fields[4].split(': ')[1]);
		  var contact = fields[1].split(': ')[1];
		  var geo = fields[0].split(': ')[1];
		
		  geojson.features.push({
			  type: 'Feature',
			  properties: {
				  name: d.title.$t,
				  contact: contact,
				  geo: geo
			  },
			  geometry: {
				  type: 'Point',
				  coordinates: [lng, lat]
			  }
		  });
	  });


  map.addSource('data', {
	  type: 'geojson',
	  data: geojson
  });
  
  map.addLayer({
	  id: 'point',
	  type: 'circle',
	  source: 'data',
	  paint: {
		  'circle-radius': 6,
		  'circle-color': "#4169DB"
	  }
    });
	
  map.on('click', function(e) {
	  var features = map.queryRenderedFeatures(e.point, {
		  layers: ['point']
	  });
	  
	  if (!features.length) {
		  return;
	  }
	  
	  var feature = features[0];
      var ttip = new mapboxgl.Popup()	  
        .setLngLat(feature.geometry.coordinates)
		.setHTML(steward_template(features[0].properties))
		.addTo(map);	  
  });

  
  map.on('mousemove', function(e) {
	  var features = map.queryRenderedFeatures(e.point, {
		  layers: ['point']
	  });
  	  map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';	  
  });

//  map.on('click', function(e) {
//	  var features = map.queryRenderedFeatures(e.point, {
//		  layers: ['HUC']
//	  });
//	  
//	  if (!features.length) {
//		  return;
//	  }
//	  
//      var feature = features[0];
//      var huctip = new mapboxgl.Popup()
//	      .setLngLat(feature.geometry.coordinates)
//		  .setHTML(features[0].properties.HUC_NAME)
//		  .addTo(map);
//	  });	  
	  
  map.addControl(new mapboxgl.Geocoder({position: 'top-right'}));
  map.addControl(new mapboxgl.Navigation());
  
  });
});  