mapboxgl.accessToken = 'pk.eyJ1Ijoic2thaXNlcmljcHJiIiwiYSI6ImNpa2U3cGN1dDAwMnl1cm0yMW94bWNxbDEifQ.pEG_X7fqCAowSN8Xr6rX8g';

var bound = new mapboxgl.LngLatBounds(
    new mapboxgl.LngLat(-81.457, 36.945),
	new mapboxgl.LngLat(-72.49, 41.17)
);
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/skaisericprb/citvqu6qb002p2jo1ig5hnvtk',
	center: [-77.975, 39.077],
	maxBounds: bound,
	zoom: 7.45,
	attributionControl: {
		position: 'bottom-right'
	},
	minZoom: [7.0],
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
	  type: 'symbol',
	  layout: {
		  'icon-image': 'marker-11',
		  'icon-allow-overlap': false
	  },
	  source: 'data',
	  paint: {}
  });
});
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


map.addControl(new mapboxgl.Geocoder({position: 'top-right'}));
map.addControl(new mapboxgl.Navigation({position: 'top-left'}));

