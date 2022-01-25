// ===========================================================
//
// Copyright (C) 2021 Stephen Gadd - All Rights Reserved
// Released under CC-BY 4.0 International Licence
// For details see https://github.com/docuracy/Locolligo/blob/main/LICENSE.md
//
// ===========================================================
// DONE:
// UUIDs generated for all traces
// Linking of PAS and Wikidata records within set radius
// Mapping of Peripleo-LD by JSONata translation to geoJSON, with array of linked data and including annotation id. See https://try.jsonata.org/tqEFTp-pX 
// Autodetect known conversion types
// JSONata expression paste module
// Enable URL input 
// Conversion for Recogito LD download
// Fixed JSONata for geoJSON conversion from Peripleo-LD with multiple Places per trace body: https://try.jsonata.org/79tc-dKqM
// Included Wikidata identifiers for tags: https://try.jsonata.org/H1xppiTyx
// CSV to Peripleo-LD JSONata examples at https://try.jsonata.org/AiLGV4yn2; https://try.jsonata.org/5Qs2VD7K6
// CSV to Peripleo-LD JSONata CRS-conversion example at https://try.jsonata.org/XU6jC_uwd
// Included gazetteer in geoJSON links
// Standardised fragment selectors  
// Reformatted linked box selector as box+line+marker 
// Implemented csv download for geoJSON
// Implemented OSGB CRS conversion
// Implemented CRS conversion definitions within mappings.json
// Implemented geo-uncertainty as https://schema.org/geoWithin a https://schema.org/GeoShape (bounding box for OSGB: see https://try.jsonata.org/sB8tuSBCc) or https://schema.org/GeoCircle (e.g. radius 1m for PAS finds)
// Autopopulate Examples from GitHub directory
// Enabled XML to JSON conversion (see https://github.com/NaturalIntelligence/fast-xml-parser)
// Enabled CSV download from Google Sheet URL
// Enabled KML to geoJSON conversion from Google Maps URL: see https://try.jsonata.org/PLgXDO5Jm
// Implemented GeoWithin GeoCircle and JSONata lookup table for approximation of location: see https://try.jsonata.org/rRwdGSt9S
// Reset button to allow new input
// GeoNames for nearby Wikipedia urls, e.g. http://api.geonames.org/findNearbyWikipediaJSON?lat=51.0177369115508&lng=-1.92513942718506&radius=10&username=docuracy&maxRows=500
// GeoNames reverse geocoding for nearby toponyms, e.g. http://api.geonames.org/findNearbyJSON?lat=51.0177369115508&lng=-1.92513942718506&radius=10&username=docuracy&maxRows=500
// Added facility for fetching CITATION.cff and incorporating as CSL-JSON in a dataset
// Convert Recogito LD to LP: https://try.jsonata.org/CjSUFILrv
//
// TO DO:
// SEE ALSO: https://docs.google.com/document/d/1H0KmYf405QS2ECozHpmAFsLz2MbXd_3qLKXBmLFCoJc/edit?usp=sharing
// Require default relation definition on adding dataset to Geodata Library
// Show IIIF fragments in Data Item Explorer overlay
// Manage marker collisions
// Genericise API query function using JSONata and an API-configurations file, to allow simple addition of further API endpoints.
// Implement geoJSON and map shapes (boxes and circles) for geoWithin objects
// Overpass query for Points of Interest from OSM, see https://overpass-turbo.eu/
// Overpass query for Open Historical Map, see https://wiki.openstreetmap.org/wiki/Open_Historical_Map#Using_the_data
// Find places (and photos) by name using Google Places API, e.g. https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=formatted_address,photo%2Cgeometry&locationbias=circle%3A678000%40-5.734863,55.813629&input=British%20Library&inputtype=textquery&key=AIzaSyAk3AdLLz8XoOwLD1NtwFGypLyh77vtw-k
// Request API endpoint and specification for History of English Places (VCH) - and/or get permission to convert dataset to Peripleo-LD (includes links to BHO URLs)?
// OpenPlaques.org has an API (e.g. http://openplaques.org/plaques.csv?box=[55.0473,-1.757],[54.9161,-1.474]), and also a dump which could be converted to Peripleo-LD and used for distance matching. Some linking might be possible through NER on the inscription field.
// Fix superfluous quote marks in csv->Peripleo-LD "when" property. Seems to be a bug in JSONata.
// Populate body Place titles from gazetteer urls; also 'when'?
// Pad descriptions to meet Google minimum length
// Hide everything below input area until it is populated
// Switch display to side-by-side input and output?
// Indicate display truncation of very large datasets: displaying only the first 5,000 lines
// Map fields to controlled vocabulary (Schema.org AND Wikidata?), using populated drop-down lists (with text filtering?)
// Georeferencing/linking of any input or output identifiable as Peripleo-JSON
// Warn of unsaved edits (i.e. prompt download) after set interval and on leaving page
// Check Wikidata SPARQL query, which seems to return some duplicates
// Catch and requeue rejected API requests if due to overload
// Increase API limit (currently sliced down to 25 traces): need to check usage limits
// Offer download of Pelagios Registry description for dataset
// Google Rich Tests [SEEMS TO BREAK WITH >72 TRACES] (within <script type="application/ld+json"></script>): https://search.google.com/test/rich-results/result?id=E7YNkXX8uM3MCPofvDc2eQ
// Check https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2Fdescartes.emew.io%2FLaNC%2F&id=_OBiiM9Efsxpyod913oLcg&alt_id=XIs1hg9P665fjH4fvp6fGA
// ===========================================================

// User variables
//var geoNamesID = 'locolligo';
var geoNamesID = 'docuracy'; // TO DO - REMOVE THIS AND UNCOMMENT LINE ABOVE

// Global variables
var mappings, 
	fields,
	input_formatter, 
	input, 
	output_formatter, 
	output,
	trace_formatter,
	activeDatasetEl,
	activeDataType,
	filteredIndices=[],
	selectedFilter=0,
	markers=[], 
	currentMarkers=[], 
	linkMarkers={},
	linkMarkerPopup,
	radius=5, 
	sparql_heritage_sites, 
	timeout,
	activeAjaxConnections = 0,
	settings = {
		headers: { Accept: 'application/sparql-results+json' }
    };	 

//Download output as file
function download(jsonobject,filename=false){
	$("<a />", {
		"download": filename ? filename : "Peripleo_Data_"+ Math.floor(Date.now()/1000) +".json",
		"href" : "data:application/json," + encodeURIComponent(JSON.stringify(jsonobject))
	}).appendTo("body")
	.click(function() {
		$(this).remove()
	})[0].click()
}

//Download geoJSON converted to CSV
function downloadCSV(jsonobject,filename=false){
	var dataset = [];
	$.each(jsonobject, function(i,object){
		dataset.push({'name': object.properties.name, 'latitude': object.geometry.coordinates[1], 'longitude': object.geometry.coordinates[0]});
	});
	$("<a />", {
		"download": filename ? filename : "geoJSON_Data_"+ Math.floor(Date.now()/1000) +".csv",
		"href" : "data:application/csv;charset=utf-8," + Papa.unparse(dataset)
	}).appendTo("body")
	.click(function() {
		$(this).remove()
	})[0].click()
}

// Standardise Fragment Selectors
function standardiseSVG(selector){
	if (selector.type == "SvgSelector") return selector;
	const pointRadius = 6; // Minimum 0.5 for rendering
	function getPoints([px,py,cx,cy,a,l,h]){ // Calculate tilted box corners
	    var radians = (Math.PI / 180) * a, 
	        cos = Math.cos(radians),
	        sin = Math.sin(radians);
		function rotate(x,y) {
		    var nx = Math.round((cos * (x - cx)) + (sin * (y - cy)) + cx),
		        ny = Math.round((cos * (y - cy)) - (sin * (x - cx)) + cy);
		    return [nx,ny];
		}
		var points = [];
		points.push([cx,cy]);
		points.push(rotate(cx+l,cy));
		points.push(rotate(cx+l,cy-h));
		points.push(rotate(cx,cy-h));
		if(px){ // Find linked box vertice closest to point
			const distances = points.map(point => Math.sqrt((point[0]-px)**2 + (point[1]-py)**2));
			var min = distances.indexOf(Math.min.apply(null,distances));
			var line = '<defs><marker id="markerCircle" markerWidth="'+(4*pointRadius)+'" markerHeight="'+(4*pointRadius)+'" refX="'+(2*pointRadius)+'" refY="'+(2*pointRadius)+'"><circle cx="'+(2*pointRadius)+'" cy="'+(2*pointRadius)+'" r="'+pointRadius+'" /></marker></defs><path d="M'+points[min].join(',')+' '+px+','+py+'" style="marker-end: url(#markerArrow);" />';
		}
		return '<polygon points="'+points.map(pt => pt.join(',')).join(' ')+'" />'+ (px ? line : '');
	}
	// selector examples:
	// xywh=pixel:159,72,10,45 // w & h = 0 for point
	// point:159,72
	// rect:x=137,y=1331,w=332,h=1004
	// tbox:x=1229,y=1570,a=-1.431969101380953,l=737,h=150
	// lbox:rx=1220,ry=620,px=610,py=1194,a=0.27186612134806865,l=1281,h=-329 // Oddly, Recogito outputs rx,ry for the point, and px,py for its linked rectangle
	var parameters = Array.from([...selector.value.matchAll(/[=:,](-?[\d.]+)/g)], m => parseFloat(m[1])); // Extracts numeric elements of all of the above patterns.
	var type = selector.value.split(":")[0];
	if (type=='xywh=pixel') type = (parameters[2]==0 & parameters[3]==0) ? 'point' : 'rect';
	switch (type){
	case "point":
		SVG = '<circle cx="'+parameters[0]+'" cy="'+parameters[1]+'" r="'+pointRadius+'" />';
		break;
	case "rect":
		SVG = '<rect x="'+parameters[0]+'" y="'+parameters[1]+'" width="'+parameters[2]+'" height="'+parameters[3]+'" />';
		break;
	case "tbox":
		parameters = [false,false].concat(parameters);
	case "lbox":
		SVG = getPoints(parameters);
		break;
	default:
		SVG = "ERROR: HANDLE THIS!!!!!!";
		console.log(SVG,selector);
	}
	return {
		"type": "SvgSelector",
		"value": "<svg:svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"#ff0\" fill-opacity=\"0.5\" stroke=\"black\" viewBox=\"0 0 6407 4947\">"+SVG+"</svg:svg>" // Set fill, fill-opacity, and stroke via css, and viewBox dimensions based on target dimensions
	}
}

// Convert CRS from OSGB to WGS84
function OSGB_WGS84(input){
	const gridref = OsGridRef.parse(input);
	const wgs84 = gridref.toLatLon();
	// Transform gridref based on input resolution
	digits = input.replace(/\D/g,'').length/2;
	gridref.easting += 10**(6-digits);
	gridref.northing += 10**(6-digits);
	const wgs84a = gridref.toLatLon();
	const geowithin = {'geoWithin':{'box':wgs84._lon.toFixed(6)+','+wgs84._lat.toFixed(6)+' '+wgs84a._lon.toFixed(6)+','+wgs84a._lat.toFixed(6)}};
	return [wgs84._lon.toFixed(6),wgs84._lat.toFixed(6),geowithin];
}

// Perform dataset conversion
function convert(){
	input_formatter.openAtDepth(0); // Close input JSON
	if($('#source').data('data').hasOwnProperty('data')) $.each($('#source').data('data').data,function(j,item){
		$.each(mappings[$('#expression option:selected').val()].CRS_conversions, function(i,conversion){
			input=[];
			$.each(conversion[0],function(k,input_part){
				input.push(eval("item."+input_part));
			});
			const result = eval(conversion[2].replace('%%%','"'+input.join(',')+'"'));
			eval("$('#source').data('data').data[j]."+conversion[1][0]+" = parseFloat(result[0])");
			eval("$('#source').data('data').data[j]."+conversion[1][1]+" = parseFloat(result[1])");
			if(!$('#source').data('data').data[j].hasOwnProperty('geoWithins')) $('#source').data('data').data[j].geoWithins =[];
			$('#source').data('data').data[j].geoWithins.push(result[2]);
		});
	});
	var expression = mappings[$('#expression option:selected').val()].expression;
	var jsonata_expression = jsonata(expression);
	output = jsonata_expression.evaluate($('#source').data('data'));
	// Check selectors
	if(output.hasOwnProperty('traces')){
		$.each(output.traces, function(i, trace){
			if(trace.hasOwnProperty('target.selector')) $.each(trace.target.selector, function(j, selector){
				output.traces[i].target.selector[j] = standardiseSVG(selector);
			});
		})
	}
	output_formatter = new JSONFormatter(output,1,{theme:'dark'});
	renderJSON($('#output'),output_formatter,output);
}

// Calculate Haversine distance between Points
function distance(from,to,places) {
	const earth_radius = 6371; // Result to be returned in kilometres
	function degreesToRadians(degrees){
		var pi = Math.PI;
		return degrees * (pi/180);
	}
	var dLat = degreesToRadians(to[1] - from[1]);
	var dLon = degreesToRadians(to[0] - from[0]);
	var lat1 = degreesToRadians(from[1]);
	var lat2 = degreesToRadians(to[1]);
	var a =
		Math.pow(Math.sin(dLat / 2), 2) +
		Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
	var distance = earth_radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return Math.round((distance + Number.EPSILON) * 10**places) / 10**places;
}

function addLibraryItem(name, label){
	$('#datastore')
	.append('<span class="libraryItem"><input type="radio" id="'+name+'" name="datastore" value="'+name+'">&nbsp;<label for="'+name+'">'+label+'</label><button class="libraryDelete" title="Remove from Library"><span class="ui-icon ui-icon-trash"></span></button></span>')
	.find('.libraryDelete')
	.button()
	.click(function(){
		indexedDB.deleteDatabase($(this).siblings('input').attr('id'));
		$(this).parents('.libraryItem').remove();
		$('#layerSelector input[name="'+name+'"]').parents('.layer').remove();
	});
	$('#layerSelector .layerGroup:nth-of-type(2)').append('<span class="layer"><input type="checkbox" name="'+name+'" value="'+name+'"><label for="'+name+'">'+label+'</label></span>');
}

function library(el){
	$('#datastore').dialog({
		modal: true,
		width: 'auto',
		buttons: {
			"Update Library": function() {
				
				var oldDB = $('input[name="datastore"]:checked').val();
				if(oldDB == 'new') {
					if ($('#newDatastoreName').val() == '') {
						alert('Cannot update without a selected name');
						return;
					}
				}
				else{
					indexedDB.deleteDatabase(oldDB);
					$('#newDatastoreName').val($('input[name="datastore"]:checked').siblings('label').text());
					$('input[name="datastore"]:checked').siblings('.libraryDelete').click();
				}
				var dataset = el.parent('div').data('data');
				var newDB = Date.now();
				var open = indexedDB.open(newDB);
				open.onupgradeneeded = function() {
					var db = open.result;
					var dbname = db.createObjectStore("dataname", { keyPath: "name" });
					var namerequest = dbname.put({'name':$('#newDatastoreName').val()});
					var store = db.createObjectStore('dataset', {autoIncrement: true});
					store.createIndex('coordinates', ['_longitude','_latitude'], {unique: false});
					addLibraryItem(newDB, $('#newDatastoreName').val() );
					if(dataset.hasOwnProperty('traces')){
						$.each(dataset.traces,function(i,trace){
							var foundGeometry = false;
							$.each(trace.body,function(j,body){
								if(body.relation=='georeferencing' && body.hasOwnProperty('geometry') && body.geometry['@type']=='GeoCoordinates'){
									trace._longitude = body.geometry.longitude;
									trace._latitude = body.geometry.latitude;
									foundGeometry = true;
									store.put(trace);
									return;
								}
							});
							if(!foundGeometry){ // This process is a little unreliable as (unlike 'georeferencing' relations) it will take coordinates from linked places that might not be coincident with the target 
								$.each(trace.body,function(j,body){
									if(body.hasOwnProperty('geoWithin') && body.geoWithin.hasOwnProperty('geometry') && body.geoWithin.geometry['@type']=='GeoCoordinates'){
										trace._longitude = body.geoWithin.geometry.longitude;
										trace._latitude = body.geoWithin.geometry.latitude;
										trace.target.geoWithin = body.geoWithin;
										foundGeometry = true;
										store.put(trace);
										return;
									}
								});
							}
						});	
					}
					else{ // geoJSON (including Linked Places format): construct a pseudo-trace with a target that can be indexed and linked in the same way as real trace data
						$.each(dataset.features,function(i,feature){
							function findProperty(options){
								var result = '';
								$.each(options, function(i,option){
									if (feature.hasOwnProperty(option)) {result = feature[option]; return};
									if (feature.properties.hasOwnProperty(option)) {result = feature.properties[option]; return};
									if (option=='toponym' && feature.hasOwnProperty('names')) {result = feature.names[0][option]; return};
								});
								return result;
							}
							var trace = {
								"_longitude": feature.geometry.coordinates[0],
								"_latitude": feature.geometry.coordinates[1]
							}
							trace.target = {
								"title": findProperty(['name','title','toponym','LOCATION']),
								"additionalType": "Place",
								"type": findProperty(['types','X_TYPE']),
								"relation": "linking",
								"id": findProperty(['url','@id']),
								"description": findProperty(['description','descriptions']),
								"when": findProperty(['when'])
							}
							trace.target.geometry = {
								"@type": "GeoCoordinates",
								"longitude": feature.geometry.coordinates[0],
								"latitude": feature.geometry.coordinates[1]
							}
							store.put(trace);
						});	
					}
				}
				open.onsuccess = function(){ // TEST STORAGE
					$('#newDatastoreName').val('');
					console.log('Starting test');
					var db = open.result;
					var tx = db.transaction('dataset');
					var index = tx.objectStore('dataset').index('coordinates');
					select(index, [IDBKeyRange.bound(-.9, 0),IDBKeyRange.bound(50, 52)], function(value){
						console.log(value._longitude,value._latitude);
					}, function(){
						console.log('Index retrieval complete');
					});
				}	
				$('input[name="datastore"]:first').prop('checked', true);
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$('input[name="datastore"]:first').prop('checked', true);
				$( this ).dialog( "close" );
			}
		}
	});
}

// Render JSON display
function renderJSON(target,object,data){
	target
		.data('data',data)
		.html(object.render());
	$('<button class="dataButton clear" title="Clear this dataset">Clear</button>').prependTo(target).button().click(function(){location.reload();});
	var downloadButton = $('<button class="dataButton" title="Download this dataset to local filesystem">Download</button>').prependTo(target); // Create button for downloading JSON dataset
	downloadButton.button().click(function(){download($(this).parent('div').data('data'));});
	if(Array.isArray(data.data) || data.hasOwnProperty('traces')){ // Create button for copying sample JSON to clipboard
		var clipButton = $('<button class="dataButton" title="Copy first three records to clipboard">Clip Sample</button>').prependTo(target);
		clipButton.button().click(function(){clipSample($(this));});
	}
	if(data.hasOwnProperty('features')){ // Create button for downloading geoJSON points as csv
		var csvButton = $('<button class="mapButton" title="Download basic csv">CSV</button>').prependTo(target);
		csvButton.button().click(function(){downloadCSV($(this).parent('div').data('data').features);});
		var mapButton = $('<button class="mapButton" title="Visualise dataset on a map">Map</button>').prependTo(target);
		mapButton.button().click(function(){drawMap($(this));});
		$('<button id="WDLP" class="APIButton" title="Link Wikidata settlements within '+radius+'km, based on best text match (Levenshtein distance algorithm).">WD</button>')
			.prependTo(target)
			.button()
			.click(function(){WDLP($(this));});
	}
	if(data.hasOwnProperty('features') || data.hasOwnProperty('traces')){
		var indexButton = $('<button class="indexButton" title="Add dataset to local geo-library (for later linking).">Library</button>').prependTo(target);
		indexButton.button().click(function(){library($(this));}); 
		$('<button id="LinkButton" title="Link and/or georeference records" style="pointer-events: auto;">Link/Georeference</button>')
			.prependTo(target)
			.button()
			.click(function(){explore($(this));});
	}
	if(data.hasOwnProperty('traces')){
	}
	if(Array.isArray(data.errors) && data.errors.length>0){ // Warn of errors found when parsing uploaded file
		var errors = $('<div class="errors" />').prependTo(target);
		errors.append('<b>'+data.errors.length+' ignored row'+(data.errors.length==1?'':'s')+' with errors:<b/><br/>');
		$.each(data.errors, function(index, value){
			errors.append('Row '+value.row+': '+value.message+'<br/>');
		})
	}
}

// Try to recognise type of uploaded file; perform conversion if found
function identifyType(input){
	if (input.hasOwnProperty('traces')){fields = JSON.stringify(['traces']);}
	else if (input.hasOwnProperty('type') && input.type=='lp'){fields = JSON.stringify(['lp']);}
	else if (input.hasOwnProperty('type') && input.type=='rld'){fields = JSON.stringify(['rld']);}
	else if (input.hasOwnProperty('kml')){fields = JSON.stringify(['kml']);}
	else if (input.hasOwnProperty('meta')){fields = JSON.stringify(input.meta.fields); console.log(input.meta)} // Converted from delimited text
	else if (input.constructor === Array && input[0].hasOwnProperty('@context') && input[0]['@context']=='http://www.w3.org/ns/anno.jsonld'){fields = JSON.stringify(['annotations']);}
	else return;
	$.each(mappings, function(key,value){
		if(JSON.stringify(mappings[key].fields) == fields){
			$('#expression').val(key).selectmenu("refresh");
			convert();
		}
	})
}

// Copy to clipboard
function clipSample(el) {
	var clipdata = el.parent('div').data('data');
	if(clipdata.hasOwnProperty('traces')){
		clipdata.traces = clipdata.traces.slice(0,100);
	} 
	else {
		var wrapper = Object.create({data:false});
		wrapper.data = clipdata.data.slice(0,3);
		clipdata = wrapper;
	}
	var $temp = $("<input>");
	$("body").append($temp);
	$temp.val(JSON.stringify(clipdata)).select();
	document.execCommand("copy");
	$temp.remove();
}

function showMap(onOff,bounds=false){
	if(onOff) {
		$('#map').css({'visibility':'hidden','display':'block'});
		map.resize();
	}
	else{
		$.each(markers, function(i,marker){ marker.remove(); });
		$('#data-explorer').remove();
	}
	if(bounds) {
		map.fitBounds(bounds, {
			padding: 20,
			duration: 0
		});
		var zoom = map.getZoom();
		if (zoom>18) map.setZoom(12);
	}
	$('body').toggleClass('noscroll',onOff);
	$('#map').css('visibility','visible').toggle(onOff);
}

// Draw map for current dataset
function drawMap(el,render=true){
	$('body').loadingModal({text: 'Processing...'});
	var geoJSON;
	if(el.parent('div').data('data').hasOwnProperty('features')){
		geoJSON = el.parent('div').data('data');
	}
	else{
		var PLDtoGJT = mappings.filter(obj => {
			return obj.fields[0] === 'traces'
		})
		const jsonata_expression = jsonata( PLDtoGJT[0].expression ); // Convert Peripleo-LD to geoJSON-T
		geoJSON = jsonata_expression.evaluate(el.parent('div').data('data'));
	}
	const bounds = new mapboxgl.LngLatBounds(geoJSON.features[0].geometry.coordinates,geoJSON.features[0].geometry.coordinates);
	for (const feature of geoJSON.features) {
		bounds.extend(feature.geometry.coordinates);
		const el = document.createElement('div');
		el.className = 'marker';
		if(render){
			var WikidataHTML = '';
			var linkHTML = '';
			$.each(feature.properties.links, function(i,link){
				if(link.identifier.indexOf("wikidata")>-1){
					WikidataHTML += '<a class="popup_link wikidata" href="'+link.identifier+'" title="'+link.description+' ('+link['lpo:type'][1]+')">'+link.name+'</a>';
				}
				if(link.identifier.indexOf("finds.org.uk")>-1){
					if(link.image!==undefined) linkHTML += '<a class="popup_link PAS" href="'+link.identifier+'" title="'+link['lpo:type'][1]+'"><img src="'+link.image+'" /></a>';
				}
			});
			var marker = new mapboxgl.Marker(el)
				.setLngLat(feature.geometry.coordinates)
				.setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
						'<h3><a href="'+feature.properties.url+'">'+feature.properties.name+'</a></h3>'+
						'<p>'+feature.properties.description+'</p>'+
						(WikidataHTML!=='' ? ('<div class="popup_links"><p>Closest 20 Wikidata Cultural Heritage sites within '+radius+'km:</p>'+WikidataHTML+'</div>') : '')+
						(linkHTML!=='' ? ('<div class="popup_links"><p>Up to 20 PAS finds with images in '+radius+'km radius:</p>'+linkHTML+'</div>') : '')				
					))
				.addTo(map);
		}
		else{
			$(el)
			.attr('title','Click to examine this data point')
			.data({'annotation_id':feature.properties.annotation_id})
			.click(function(){
				$('#filter').val(''); // Clear filter
				updateFilter();
				$.each(activeDatasetEl.data('data').traces, function(i,trace){
					if(trace.id == feature.properties.annotation_id){
						selectedFilter=i;
						$('#index').change(); // Trigger updateTrace
						return;
					}
				})
			})
			var marker = new mapboxgl.Marker(el)
			.setLngLat(feature.geometry.coordinates)
			.addTo(map);			
		}
		markers.push(marker);
	}
	if(render) showMap(true,bounds);
	$('body').loadingModal('destroy');
}

function updateLinkMarkers(root=$('#layerSelector')){ // TO DO: Update each newbody to account for activeDataType (features/traces)
	function linkMarker(newbody,type,colour,coordinates,name=false){
		if(!newbody.hasOwnProperty('geoWithin')) newbody.geometry = {
				"@type": "GeoCoordinates",
				"addressCountry": "GB",
				"longitude": coordinates[0],
				"latitude": coordinates[1]
			}
		const el = document.createElement('div');
		$(el)
			.data({'newbody': newbody,'coordinates':coordinates})
			.html(name?name.slice(0,2):type)
			.css({'background-color': colour, 'color': 'white'});
		el.className = 'linkmarker';
		var marker = new mapboxgl.Marker(el)
			.setLngLat(coordinates)
			.addTo(map);
		linkMarkers[type].push(marker);		
	}
	var input = root.find('input');
	if (input.length == 1 && !input.prop('checked')){ // Remove markers for this layer only
		$.each(linkMarkers[input.val()],function(i,marker){marker.remove()});
		root.removeClass('loading');
	}
	const mapCentre = map.getCenter();
	$.each(input.filter(':checked'),function(i,layer){
		// Add markers for these layers		
		var type = $(layer).val();
		var colour = 'rgba('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+',0.45)';
		linkMarkers[type] = [];
		switch(type) {
		case 'GT': // Query GeoNames for Toponyms
			$(layer).closest('.layer').addClass('loading');
			settings.url = 'https://secure.geonames.org/findNearbyJSON?lat='+mapCentre.lat+'&lng='+mapCentre.lng+'&radius='+radius+'&username='+geoNamesID+'&maxRows=50';
			$.ajax(settings).then(function(data){
				$.each(data.geonames, function(i,feature){
					var newbody = {
							"additionalType": "LinkRole",
							"linkRelationship": "Toponym found nearby",
							"lpo:type": ['seeAlso',feature.fclName],
							"id": "https://secure.geonames.org/get?geonameId="+feature.geonameId+"&username="+geoNamesID+"&style=full",
							"title": feature.toponymName,
							"description": '',
							"distance": feature.distance 
					}
					var coordinates = [feature.lng,feature.lat];
					linkMarker(newbody,type,colour,coordinates);
				});
				$(layer).closest('.layer').removeClass('loading');
			});
			break;
		case 'WP': // Query GeoNames for Wikipedia
			$(layer).closest('.layer').addClass('loading');
			settings.url = 'https://secure.geonames.org/findNearbyWikipediaJSON?lat='+mapCentre.lat+'&lng='+mapCentre.lng+'&radius='+radius+'&username='+geoNamesID+'&maxRows=50';
			$.ajax(settings).then(function(data){
				$.each(data.geonames, function(i,feature){
					var newbody = {
							"additionalType": "LinkRole",
							"linkRelationship": "Wikipedia Article linked nearby",
							"lpo:type": ['seeAlso',feature.feature],
							"id": "https://"+feature.wikipediaUrl,
							"title": feature.title,
							"description": feature.summary,
							"distance": feature.distance 
					}
					var coordinates = [feature.lng,feature.lat];
					linkMarker(newbody,type,colour,coordinates);
				});
				$(layer).closest('.layer').removeClass('loading');
			});
			break;
		case 'WS': // Query Wikidata for Settlements
			$(layer).closest('.layer').addClass('loading');
			var sparql = sparql_nearby_settlements;
			settings.url = 'https://query.wikidata.org/sparql';
			settings.data = { query: sparql.replace('%%%lng%%%',mapCentre.lng).replace('%%%lat%%%',mapCentre.lat).replace('%%%radius%%%',radius) }
			$.ajax(settings).then(function(data){
				$.each(data.results.bindings, function(i,feature){
					var newbody = {
						"additionalType": "LinkRole",
						"linkRelationship": "Corresponding Wikidata Item",
						"id": feature.place.value,
						"name": feature.placeLabel.value 
					}
					var coordinates = feature.geo.value.match(/-?\d+\.\d+/g);
					linkMarker(newbody,type,colour,coordinates);
				});
				$(layer).closest('.layer').removeClass('loading');
			});
			break;
		case 'WC': // Query Wikidata for Cultural Heritage Sites
			$(layer).closest('.layer').addClass('loading');
			var sparql = sparql_heritage_sites;
			settings.url = 'https://query.wikidata.org/sparql';
			settings.data = { query: sparql.replace('%%%lng%%%',mapCentre.lng).replace('%%%lat%%%',mapCentre.lat).replace('%%%radius%%%',radius) }
			$.ajax(settings).then(function(data){
				$.each(data.results.bindings, function(i,feature){
					var newbody = {
						"additionalType": "LinkRole",
						"linkRelationship": "Cultural heritage site found nearby",
						"lpo:type": ['seeAlso',feature.classLabel.value],
						"id": feature.site.value,
						"title": feature.siteLabel.value,
						"description": feature.hasOwnProperty('siteDescription') ? feature.siteDescription.value : '',
						"distance": feature.distance.value 
					}
					var coordinates = feature.geo.value.match(/-?\d+\.\d+/g);
					linkMarker(newbody,type,colour,coordinates);
				});
				$(layer).closest('.layer').removeClass('loading');
			});
			break;
		case 'PA':// Query Portable Antiquities Scheme database
			$(layer).closest('.layer').addClass('loading');
			function processPage(page){
				settings.url = 'https://finds.org.uk/database/search/results/lat/'+mapCentre.lat+'/lon/'+mapCentre.lng+'/d/'+radius+'/format/geojson/page/'+page;
				$.ajax(settings).then(function(data){
					$.each(data.features, function(i,feature){
						newbody = {
								"additionalType": "LinkRole",
								"linkRelationship": "Artefact found nearby",
								"lpo:type": ['seeAlso',feature.properties.objecttype],
								"id": feature.properties.url,
								"title": feature.properties.description.slice(0,60)+'...',
								"description": feature.properties.description,
								"image": feature.properties.thumbnail
						}
						if(feature.geometry.coordinates[0]!==null){
							// Note: 'findspot to 1km grid square level and slight obfuscation of findspot by randomised subtraction/addition of 10ths of a degree to the degraded findspot'
							newbody.distance = distance([mapCentre.lng,mapCentre.lat],feature.geometry.coordinates,0); // 0 places = nearest kilometre
							newbody.geoWithin = OSGB_WGS84(feature.properties.fourFigure)[2].geoWithin;
//							var coordinates = feature.geometry.coordinates;
							var coordinates = [feature.geometry.coordinates[0]+((Math.random()-.5)/5),feature.geometry.coordinates[1]+((Math.random()-.5)/5)]; // Obfuscate by up to a tenth of a degree in case not implemented on API
							linkMarker(newbody,type,colour,coordinates);
						}
					});		
					if(page < Math.min( 1+Math.floor((data.meta.totalResults-1)/data.meta.resultsPerPage), 10 )) { // Limit to maximum of 10 pages of results (=200 items)
						processPage(page+1);
					}
					else{
						$(layer).closest('.layer').removeClass('loading');
					}
				});
			}
			processPage(1);
			break;
		case 'other': // ****************** TO DO - generic added geoJSON or shapefiles
			break;
		default: // GeoData Library
			const bounds = map.getBounds();
			var open = indexedDB.open(type);
			open.onsuccess = function(){
				var db = open.result;
				var tx = db.transaction('dataset');
				var index = tx.objectStore('dataset').index('coordinates');
				select(index, [IDBKeyRange.bound(bounds._sw.lng, bounds._ne.lng),IDBKeyRange.bound(bounds._sw.lat, bounds._ne.lat)], function(value){
					var newbody = value.target;
					var coordinates = [value._longitude,value._latitude];
					linkMarker(newbody,type,colour,coordinates,$(layer).siblings('label').text());
				}, function(){
					console.log('Index retrieval complete');
				});
			}
		
			break;
		}	
	});
}

function removeLinkMarkers(){
	$.each($('#layerSelector input:checked'),function(i,layer){
		$.each(linkMarkers[$(layer).val()], function(i,marker){ marker.remove(); });
	});
}

function updateTrace(dataset){
	var bounds = false;
	$.each(currentMarkers, function(i,marker){ marker.remove(); });
	removeLinkMarkers();
	var index = $('#index').val()-1;
	geoParent = (activeDataType=='features') ? [dataset[index]] : dataset[index].body;
	$.each(geoParent, function(j,body){
		if(body.hasOwnProperty('geometry') && (body.geometry['@type']=='GeoCoordinates' || body.geometry['type']=='Point')){
			var coordinates = (activeDataType=='features') ? body.geometry.coordinates : [body.geometry.longitude,body.geometry.latitude];
			const el = document.createElement('div');
			el.className = 'marker currentmarker';
			var marker = new mapboxgl.Marker(el)
				.setLngLat(coordinates)
				.addTo(map);
			currentMarkers.push(marker);
			if(bounds){
				bounds.extend(coordinates);
			}
			else{
				bounds = new mapboxgl.LngLatBounds(coordinates,coordinates);
			}
		}
	});
	trace_formatter = new JSONFormatter(dataset[index],3,{theme:'light'}); // remove JSONata sequence and keepSingleton artefacts
	$('#trace').html(trace_formatter.render());
	showMap(true, bounds);
	updateLinkMarkers();
}

function updateFilter() {
	if($('#navigation').hasClass('disabled')){
		$('#navigation')
			.removeClass('disabled')
			.find('button,#index').prop('disabled',false);
	}
	var filter = $('#filter').val().toUpperCase();
	if (filter=='') {
		filteredIndices = Array(activeDatasetEl.data('data')[activeDataType].length).fill().map((item, index) => 1+index);
		selectedFilter = $('#index').val()-1;
		$('#filtered').html('');
		$('#navigation').removeClass('filtered');
		return;
	}
	$('#navigation').addClass('filtered');
	filteredIndices=[];
	
	if(activeDataType=='features'){
		$.each(activeDatasetEl.data('data')[activeDataType], function(i,feature){
			var found = false;
			$.each(feature.names,function(j,name){
				found = (found || name.toponym.toUpperCase().indexOf(filter) > -1);
			})
			if (found) filteredIndices.push(i+1);
		});
	}
	else{
		$.each(activeDatasetEl.data('data')[activeDataType], function(i,trace){
			var found = false;
			found = trace.target.title.toUpperCase().indexOf(filter) > -1;
			if (!found) {
				$.each(trace.body,function(j,body){
					if(body.hasOwnProperty('title')) found = (found || body.title.toUpperCase().indexOf(filter) > -1);
				})
			}
			if (found) filteredIndices.push(i+1);
		});
	}
	
	$('#filtered').html('('+filteredIndices.length+')');
	selectedFilter = 0;
	if(filteredIndices.length>0){
		$('#index').val(filteredIndices[selectedFilter]).change();
	}
	else{
		$('#navigation')
			.removeClass('filtered')
			.addClass('disabled') // Hides trace using css
			.find('button,#index').prop('disabled',true);
	}
}

// Build data trace/feature explorer
function explore(el) {
	drawMap(el,false);
	activeDatasetEl = el.parent('div');
	activeDataType = activeDatasetEl.data('data').hasOwnProperty('features') ? 'features' : 'traces';
	$('<div>', { // Add Data Explorer to map
	    id: 'data-explorer',
	    class: 'ui-dialog ui-corner-all ui-widget ui-widget-content ui-front ui-draggable ui-resizable'
	})
		.resizable({ containment: "#map" })
		.draggable({ containment: "#map", scroll: false })
		.prepend($('<div>',{
			id: 'navigation'
		}))
		.append($('<div>',{
			id: 'trace',
			class: '.ui-widget.ui-widget-content'
		}))
		.appendTo('#map');
	$('#navigation')
		.append(new Array(9).join('<button></button>'))
		.find('button')
		.eq(0).button({icon:"ui-icon-seek-first",showlabel:false}).prop('title','First (filtered) item').click(function(){selectedFilter=0;$('#index').change()}).end()
		.eq(1).button({icon:"ui-icon-seek-prev",showlabel:false}).prop('title','Previous (filtered) item').click(function(){selectedFilter=Math.max(0,selectedFilter-1);$('#index').change()}).end()
		.eq(2).button({icon:"ui-icon-seek-next",showlabel:false}).prop('title','Next (filtered) item').click(function(){selectedFilter=Math.min(filteredIndices.length-1,selectedFilter+1);$('#index').change()}).end()
		.eq(3).button({icon:"ui-icon-seek-end",showlabel:false}).prop('title','Last (filtered) item').click(function(){selectedFilter=filteredIndices.length-1;$('#index').change();}).end()
		.eq(1).after($('<input id="index" />')
			.val(1)
			.button()
			.change(function(){$('#index').val(filteredIndices[selectedFilter]); updateTrace(activeDatasetEl.data('data')[activeDataType])})
		).end()
		.eq(2).before('<span>/'+activeDatasetEl.data('data')[activeDataType].length+'</span>').end()
		.eq(3)
			.after('<span id="filtered" />')
			.after(
				$('<input id="filter" placeholder="Filter by Title" type="search" />')
				.on('input',function(){updateFilter();})
				.button()
			)
			.end()
		.eq(4).button({icon:"ui-icon-pin-s",showlabel:false}).prop('title','Drop pin on map').click(function(){alert('Not yet implemented')}).end()
		.eq(5).button({icon:"ui-icon-image",showlabel:false}).prop('title','Fetch IIIF image fragments').click(function(){alert('Not yet implemented')}).end()
		.eq(6).button({icon:"ui-icon-circle-arrow-s",showlabel:false}).prop('title','Download/Save edited dataset').click(function(){download(activeDatasetEl.data('data'));}).end()
		.eq(7).button({icon:"ui-icon-trash",showlabel:false}).prop({'title':'Delete this item','id':'delete'}).click(function(){
			if (confirm('Delete this item?')){
				$.each(markers, function(i,marker){
					if(activeDatasetEl.data('data')[activeDataType][$('#index').val()-1].id == $(marker.getElement()).data('annotation_id')){
						marker.remove();
					}
				});
				$.each(currentMarkers, function(i,marker){ marker.remove(); });
				filteredIndices.splice(selectedFilter,1);
				$.each(filteredIndices, function(i,index){
					if(i>=selectedFilter) filteredIndices[i]-=1;
				});
				$('#filtered').html('('+filteredIndices.length+')');
				activeDatasetEl.data('data')[activeDataType].splice($('#index').val()-1,1);
				$('#index')
					.change()
					.next('span').html('/'+activeDatasetEl.data('data')[activeDataType].length);
			}
		}).end()
		.slice(-4).insertAfter($('#navigation')).wrapAll('<div id="edit"/>');
		;
	updateFilter();
	$('#index').change(); // Trigger updateTrace
}

function geocode(){
	var q=$('#geocode').val();
	$('#geoResults').html('');
	if (q.length < 3) return;
	const bounds = map.getBounds();
	settings.url = 'https://secure.geonames.org/searchJSON?name='+q+'&east='+bounds._ne.lng+'&west='+bounds._sw.lng+'&north='+bounds._ne.lat+'&south='+bounds._sw.lat+'&username='+geoNamesID+'&maxRows=10';
	$.ajax(settings).then(function(data){
		if(data.totalResultsCount==0){
			$('#geoResults').html('<span>No results found</span>');
		}
		else{
			$('#geoResults').html('');
			$.each(data.geonames,function(i,geoname){
				$("<span />", {"html": geoname.name})
				.click(function(){
					map.flyTo({center: [geoname.lng,geoname.lat], zoom: 13});
					$('#geoResults').html('');
					$('#geocode').val('');
				})
				.appendTo("#geoResults");
			})
		}
	});
	
}

//Match Wikidata settlements with text and location
function WDSettlements(el){
	function levenshtein(r,e){if(r===e)return 0;var t=r.length,o=e.length;if(0===t||0===o)return t+o;var a,h,n,c,f,A,d,C,v=0,i=new Array(t);for(a=0;a<t;)i[a]=++a;for(;v+3<o;v+=4){var u=e.charCodeAt(v),l=e.charCodeAt(v+1),g=e.charCodeAt(v+2),s=e.charCodeAt(v+3);for(c=v,n=v+1,f=v+2,A=v+3,d=v+4,a=0;a<t;a++)C=r.charCodeAt(a),(h=i[a])<c||n<c?c=h>n?n+1:h+1:u!==C&&c++,c<n||f<n?n=c>f?f+1:c+1:l!==C&&n++,n<f||A<f?f=n>A?A+1:n+1:g!==C&&f++,f<A||d<A?A=f>d?d+1:f+1:s!==C&&A++,i[a]=d=A,A=f,f=n,n=c,c=h}for(;v<o;){var w=e.charCodeAt(v);for(c=v,f=++v,a=0;a<t;a++)f=(h=i[a])<c||f<c?h>f?f+1:h+1:w!==r.charCodeAt(a)?c+1:c,i[a]=f,c=h;d=f}return d}
	var traces = el.parent('div').data('data').traces,
		sparql = sparql_nearby_settlements,
		traceIndex = 0,
		retryAfter = 0,
		settings = {
			url: 'https://query.wikidata.org/sparql',
			beforeSend: function(jqXHR) {
				// Haven't yet found a way to get the Retry-After headers exposed. Wikidata *does* send them.
//				jqXHR.setRequestHeader('Access-Control-Allow-Headers', 'Access-Control-Expose-Headers');
//				jqXHR.setRequestHeader('Access-Control-Expose-Headers', 'Retry-After');
				jqXHR.i = settings.data.i;
				activeAjaxConnections++;
				if(activeAjaxConnections<5){
					traceIndex++;
					if(traceIndex<traces.length) setTimeout(matchTrace(traceIndex),retryAfter);
				}
			},
			error: function(jqXHR,msg1,msg2) {
				activeAjaxConnections--;
				console.log(jqXHR,msg1,msg2,jqXHR.getAllResponseHeaders());
				if(jqXHR.status===429){
					activeAjaxConnections--;
//					retryAfter = jqXHR.getResponseHeader('Retry-After');
//					retryAfter = retryAfter.replace( /^\D+/g, '');
					retryAfter = 30; // 
					console.log('Over limit attempting #'+jqXHR.i+', waiting '+retryAfter+' seconds.');
					retryAfter = parseInt(retryAfter)*1000; // convert to milliseconds
					clearTimeout(timeout);
					timeout = setTimeout(function(){retryAfter=0},retryAfter);
					setTimeout(matchItem(jqXHR.i),retryAfter);
				}
			},
			headers: { 
				'Accept': 'application/sparql-results+json'
			}
	    };
	el.append('<span> [Wait: <span class="count">0</span>/'+traces.length+']</span>');
	var counter = el.find('span.count');
	function matchTrace(i){
		counter.html(i+1);
		if(items[i].hasOwnProperty('names') && items[i].names[0].hasOwnProperty('citations') && items[i].names[0].citations[0].label=='Wikidata'){ // Used when retrying after failed attempt to populate dataset
			itemIndex++;
			setTimeout(matchItem(itemIndex),retryAfter);
			return;
		}
		var placename = traces[i].target.title.split(',')[0];
		const wgs84 = new LatLon(traces[i].body[0].geometry.latitude, traces[i].body[0].geometry.longitude);
		try {
			const gridref = wgs84.toOsGrid();
			traces[i].body[0].properties.OS_gridref = gridref.toString();
		}
		catch(err) {
			traces[i].body[0].properties.OS_gridref = '(outside geographic scope)';
			console.log('OS_gridref failed for '+i+' ('+placename+')');
		}
		if(traces[i].body.length>1 && traces[i].body[1].linkRelationship=='Corresponding Wikidata Item'){
			traces[i].body[1].linkCertainty = Math.max(0,(10-levenshtein(placename,traces[i].body[1].name.toUpperCase())))/10
			traceIndex++;
			if(traceIndex<traces.length){
				setTimeout(matchTrace(traceIndex),retryAfter);
			}
			return;
		}
		var body = traces[i].body[0];
		settings.data = { i:i, query: sparql.replace('%%%lng%%%',body.geometry.longitude).replace('%%%lat%%%',body.geometry.latitude).replace('%%%radius%%%',radius) }
		$.ajax(settings)
			.done(function(data){
				scores=[];
				$.each(data.results.bindings, function(i,settlement){
					scores.push(levenshtein(placename,settlement.placeLabel.value.toUpperCase()));
				})
				var indexMin = scores.indexOf(Math.min(...scores));
				var newbody = {
					"additionalType": "LinkRole",
					"linkRelationship": "Corresponding Wikidata Item",
					"linkCertainty": Math.max(0,(10-scores[indexMin]))/10, // Convert to range 0 to 1, rejecting any score > 10
					"id": data.results.bindings[indexMin].place.value,
					"name": data.results.bindings[indexMin].placeLabel.value 
				}
				traces[i].body.push(newbody);
				traceIndex++;
				if(traceIndex<traces.length){
					setTimeout(matchTrace(traceIndex),retryAfter);
				}
				else if(0 == activeAjaxConnections){
					dataset_formatter = new JSONFormatter(el.parent('div').data('data'),1,{theme:'dark'});
					renderJSON(el.parent('div'),dataset_formatter,el.parent('div').data('data'));
					console.log('API requests completed.');
				}
			});
	}
	matchTrace(traceIndex);
}

//Match Linked Places with Wikidata settlements with text and location
function WDLP(el){
	function levenshtein(r,e){if(r===e)return 0;var t=r.length,o=e.length;if(0===t||0===o)return t+o;var a,h,n,c,f,A,d,C,v=0,i=new Array(t);for(a=0;a<t;)i[a]=++a;for(;v+3<o;v+=4){var u=e.charCodeAt(v),l=e.charCodeAt(v+1),g=e.charCodeAt(v+2),s=e.charCodeAt(v+3);for(c=v,n=v+1,f=v+2,A=v+3,d=v+4,a=0;a<t;a++)C=r.charCodeAt(a),(h=i[a])<c||n<c?c=h>n?n+1:h+1:u!==C&&c++,c<n||f<n?n=c>f?f+1:c+1:l!==C&&n++,n<f||A<f?f=n>A?A+1:n+1:g!==C&&f++,f<A||d<A?A=f>d?d+1:f+1:s!==C&&A++,i[a]=d=A,A=f,f=n,n=c,c=h}for(;v<o;){var w=e.charCodeAt(v);for(c=v,f=++v,a=0;a<t;a++)f=(h=i[a])<c||f<c?h>f?f+1:h+1:w!==r.charCodeAt(a)?c+1:c,i[a]=f,c=h;d=f}return d}
	var items = el.parent('div').data('data').features,
		sparql = sparql_nearby_settlements,
		itemIndex = 0,
		retryAfter = 0,
		settings = {
			url: 'https://query.wikidata.org/sparql',
			beforeSend: function(jqXHR) {
				// Haven't yet found a way to get the Retry-After headers exposed. Wikidata *does* send them.
//				jqXHR.setRequestHeader('Access-Control-Allow-Headers', 'Access-Control-Expose-Headers');
//				jqXHR.setRequestHeader('Access-Control-Expose-Headers', 'Retry-After');
				jqXHR.i = settings.data.i;
				activeAjaxConnections++;
				if(activeAjaxConnections<5){
					itemIndex++;
					if(itemIndex<items.length) setTimeout(matchItem(itemIndex),retryAfter);
				}
			},
			error: function(jqXHR,msg1,msg2) {
				activeAjaxConnections--;
				console.log(jqXHR,msg1,msg2,jqXHR.getAllResponseHeaders());
				if(jqXHR.status===429){
//					retryAfter = jqXHR.getResponseHeader('Retry-After');
//					retryAfter = retryAfter.replace( /^\D+/g, '');
					retryAfter = 30; // 
					console.log('Over limit attempting #'+jqXHR.i+', waiting '+retryAfter+' seconds.');
					retryAfter = parseInt(retryAfter)*1000; // convert to milliseconds
					clearTimeout(timeout);
					timeout = setTimeout(function(){retryAfter=0},retryAfter);
					setTimeout(matchItem(jqXHR.i),retryAfter);
				}
			},
			headers: { 
				'Accept': 'application/sparql-results+json'
			}
	    };
//	items = items.slice(0,20); // For testing - comment out for production
	el.append('<span> [Wait: <span class="count">0</span>/'+items.length+']</span>');
	var counter = el.find('span.count');
	function matchItem(i){
		counter.html(i+1);
		if(items[i].hasOwnProperty('names') && items[i].names[0].hasOwnProperty('citations') && items[i].names[0].citations[0].label=='Wikidata'){ // Used when retrying after failed attempt to populate dataset
			itemIndex++;
			setTimeout(matchItem(itemIndex),retryAfter);
			return;
		}
		var placename = items[i].properties.title.split(',')[0];
		settings.data = { i: i, query: sparql.replace('%%%lng%%%',items[i].geometry.coordinates[0]).replace('%%%lat%%%',items[i].geometry.coordinates[1]).replace('%%%radius%%%',radius) }
		$.ajax(settings)
			.done(function(data){
				activeAjaxConnections--;
				scores=[];
				$.each(data.results.bindings, function(i,settlement){
					scores.push(levenshtein(settlement.placeLabel.value.toUpperCase(),placename));
				})
				var indexMin = scores.indexOf(Math.min(...scores));
				var linkCertainty = Math.max(0,(10-scores[indexMin]))/10; // Convert to range 0 to 1, rejecting any score > 10
				
				console.log(i,placename,data.results.bindings[indexMin].placeLabel.value,linkCertainty,activeAjaxConnections);
				
				if(!items[i].hasOwnProperty('names')) items[i].names = [];
				items[i].names.push({'toponym':data.results.bindings[indexMin].placeLabel.value,'citations':[{'label':'Wikidata','@id':data.results.bindings[indexMin].place.value}],'certainty':linkCertainty});
				if(!items[i].hasOwnProperty('links')) items[i].links = [];
				items[i].links.push({'type':linkCertainty==1?'exactMatch':'closeMatch','identifier':data.results.bindings[indexMin].place.value,'certainty':linkCertainty,'distance':parseFloat(data.results.bindings[indexMin].distance.value)});
				if(!items[i].hasOwnProperty('types')) items[i].types = [];
				items[i].types.push({'identifier':'aat:300008375','label':'town'});
				items[i].types.push({'identifier':'https://www.wikidata.org/wiki/Q486972','label':'human settlement'});
				
				itemIndex++;
				if(itemIndex<items.length){
					setTimeout(matchItem(itemIndex),retryAfter);
				}
				else if(0 == activeAjaxConnections){
					dataset_formatter = new JSONFormatter(el.parent('div').data('data'),1,{theme:'dark'});
					renderJSON(el.parent('div'),dataset_formatter,el.parent('div').data('data'));
					console.log('API requests completed.');
				}
			});
	}
	matchItem(itemIndex);
}

//Query API
//This function should be genericised using JSONata and an API-configurations file, to allow simple addition of further API endpoints.
function addAPIdata(el){
	var dataset = el.parent('div').data('data');
	dataset.traces = dataset.traces.slice(0,5); // API limits concurrent(?) requests *** TO BE ADDRESSED
	var count = 0;
	el.append('<span> [Wait: <span class="count">'+count+'</span>/'+dataset.traces.length+']</span>');
	var counter = el.find('span.count');
	function checkAjaxConnections(){
		if (0 == activeAjaxConnections){
			dataset_formatter = new JSONFormatter(dataset,1,{theme:'dark'});
			renderJSON(el.parent('div'),dataset_formatter,dataset);
			console.log('API requests completed.');
		}
	}
	$.each(dataset.traces, function(tracekey,trace){
		$.each(trace.body, function(bodykey,body){
		if(body.additionalType=="Place" && body.hasOwnProperty('geometry') && body.geometry.hasOwnProperty('latitude') && body.geometry.hasOwnProperty('longitude') ){
				var settings = {
						beforeSend: function(xhr) {
							activeAjaxConnections++;
							// TO DO: Wait until less than 5
						},
						error: function(xhr) {
							activeAjaxConnections--;
							checkAjaxConnections();
						},
						headers: { Accept: 'application/sparql-results+json' },
						statusCode: {
							429: function() {
								// TO DO: Cease requests for specified period, and resume with this one. Flag completion of each item? Or implement with a while false loop?
						    }
						}
				    };				
				switch(el.attr('id')){
				case "WDButton": // Query Wikidata for Cultural Heritage Sites based on location
					var sparql = sparql_base;
					settings.data = { query: sparql.replace('%%%lng%%%',body.geometry.longitude).replace('%%%lat%%%',body.geometry.latitude).replace('%%%radius%%%',radius) }
					$.ajax('https://query.wikidata.org/sparql',settings).then(function(data){
						$.each(data.results.bindings, function(i,feature){
							var newbody = {
									"additionalType": "LinkRole",
									"linkRelationship": "Cultural heritage site found nearby",
									"lpo:type": ['seeAlso',feature.classLabel.value],
									"identifier": feature.site.value,
									"name": feature.siteLabel.value,
									"description": feature.hasOwnProperty('siteDescription') ? feature.siteDescription.value : '',
									"distance": feature.distance.value 
							}
							var coordinates = feature.geo.value.match(/-?\d+\.\d+/g);
							newbody.geometry = {
								"@type": "GeoCoordinates",
								"addressCountry": "GB",
								"longitude": coordinates[0],
								"latitude": coordinates[1]
							}
							dataset.traces[tracekey].body.push(newbody);
						});
						count++;
						counter.html(count);
						activeAjaxConnections--;
						checkAjaxConnections();
					});
					break;
				case "WDSettlements": // Query Wikidata for Settlement names based on location
					function levenshtein(r,e){if(r===e)return 0;var t=r.length,o=e.length;if(0===t||0===o)return t+o;var a,h,n,c,f,A,d,C,v=0,i=new Array(t);for(a=0;a<t;)i[a]=++a;for(;v+3<o;v+=4){var u=e.charCodeAt(v),l=e.charCodeAt(v+1),g=e.charCodeAt(v+2),s=e.charCodeAt(v+3);for(c=v,n=v+1,f=v+2,A=v+3,d=v+4,a=0;a<t;a++)C=r.charCodeAt(a),(h=i[a])<c||n<c?c=h>n?n+1:h+1:u!==C&&c++,c<n||f<n?n=c>f?f+1:c+1:l!==C&&n++,n<f||A<f?f=n>A?A+1:n+1:g!==C&&f++,f<A||d<A?A=f>d?d+1:f+1:s!==C&&A++,i[a]=d=A,A=f,f=n,n=c,c=h}for(;v<o;){var w=e.charCodeAt(v);for(c=v,f=++v,a=0;a<t;a++)f=(h=i[a])<c||f<c?h>f?f+1:h+1:w!==r.charCodeAt(a)?c+1:c,i[a]=f,c=h;d=f}return d}
					var sparql = sparql_nearby_settlements;
					settings.data = { query: sparql.replace('%%%lng%%%',body.geometry.longitude).replace('%%%lat%%%',body.geometry.latitude).replace('%%%radius%%%',radius) }
					var placename = body.title.split('.')[1];
					// TO DO: Limit to 5 concurrent requests, and wait after a 429 / Retry-After response
					$.ajax('https://query.wikidata.org/sparql',settings).then(
						function(data,textStatus,jqXHR){
							scores=[];
							$.each(data.results.bindings, function(i,settlement){
								scores.push(levenshtein(placename,settlement.placeLabel.value));
							})
							var indexMin = scores.indexOf(Math.min(...scores));
							var newbody = {
								"additionalType": "LinkRole",
								"linkRelationship": "Corresponding Wikidata Item",
								"id": data.results.bindings[indexMin].place.value,
								"name": data.results.bindings[indexMin].placeLabel.value 
							}
							dataset.traces[tracekey].body.push(newbody);
							count++;
							counter.html(count);
							activeAjaxConnections--;
							checkAjaxConnections();
						}
					);
					break;
				case "PASButton": // Query Portable Antiquities Scheme API for linked data based on location
					// Note that some results lack coordinate data
					function processPage(page){
						settings.url = 'https://finds.org.uk/database/search/results/lat/'+body.geometry.latitude+'/lon/'+body.geometry.longitude+'/d/'+radius+'/format/geojson/page/'+page;
						$.ajax(settings).then(function(data){
							$.each(data.features, function(i,feature){
								newbody = {
										"additionalType": "LinkRole",
										"linkRelationship": "Artefact found nearby",
										"lpo:type": ['seeAlso',feature.properties.objecttype],
										"identifier": feature.properties.url,
										"image": feature.properties.thumbnail
								}
								if(feature.geometry.coordinates[0]!==null){
									// Note: 'findspot to 1km grid square level and slight obfuscation of findspot by randomised subtraction/addition of 10ths of a degree to the degraded findspot'
									newbody.distance = distance([body.geometry.longitude,body.geometry.latitude],feature.geometry.coordinates,0); // 0 places = nearest kilometre
									newbody.geoWithin = OSGB_WGS84(feature.properties.fourFigure)[2].geoWithin;
//									newbody.geometry = { // The API currently returns precise, unobfuscated coordinates, which in the interest of find-site security must not be publicised
//										"@type": "GeoCoordinates",
//										"addressCountry": "GB",
//										"longitude": feature.geometry.coordinates[0],
//										"latitude": feature.geometry.coordinates[1]
//									}
								}
								dataset.traces[tracekey].body.push(newbody);
							});		
							if(page < Math.min( 1+Math.floor((data.meta.totalResults-1)/data.meta.resultsPerPage), 10 )) { // Limit to maximum of 10 pages of results (=200 items)
								processPage(page+1);
							}
							else{
								count++;
								counter.html(count);
							}
							activeAjaxConnections--;
							checkAjaxConnections();
						});
					}
					processPage(1);
					break;
				}
			}
		})
	});	
}

$( document ).ready(function() {
	
	// Check browser file upload capability
	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser.');
        return;
    }
	
	// Ensure that map covers other window content
	$(window).resize(function () {
		map.resize();
	}).resize();
	$('<button>', { // Add close button to map controls
	    class: 'mapboxgl-ctrl-close-map',
	    title: 'Close map'
	})
		.button()
		.click(function(){showMap(false);})
		.prependTo('div.mapboxgl-ctrl-top-right div.mapboxgl-ctrl-group')
		.append('<span class="mapboxgl-ctrl-icon"></span>');
	$('.mapboxgl-ctrl-top-right')
		.prepend($('.logo:first').clone())
		.append($('#geocodeWrapper').addClass('mapboxgl-ctrl').on('keyup',function(){geocode();}).button())
		.append($('#layerSelector').addClass('mapboxgl-ctrl').button());
	$('#layerSelector').on('click','label',function(e){
		var checkbox = $(e.target).prev('input');
		checkbox.prop('checked',!checkbox.prop('checked'));
	});
	$('#layerSelector').on('click','.layer',function(e){
		updateLinkMarkers($(e.target.closest('.layer')))
	});
	linkMarkerPopup = new mapboxgl.Popup({
		closeButton: false,
		closeOnClick: false
	});
	$('#map')
		.on('mouseenter','.linkmarker',function(e){
			var text = $(e.target).data('newbody').hasOwnProperty('title') ? $(e.target).data('newbody').title : $(e.target).data('newbody').name;
			linkMarkerPopup.setLngLat($(e.target).data('coordinates')).setHTML(text).addTo(map);
		})
		.on('mouseleave','.linkmarker',function(e){
			linkMarkerPopup.remove();
		})
		.on('click','.linkmarker',function(e){
			if(activeDataType=='features'){
				if(confirm('Add to current feature?')){
					activeDatasetEl.data('data').features[filteredIndices[selectedFilter]-1].links.push($(e.target).data('newbody'));
					$('#trace').html(trace_formatter.render());
				}
			}
			else{
				if(confirm('Add to current trace bodies?')){
					activeDatasetEl.data('data').traces[filteredIndices[selectedFilter]-1].body.push($(e.target).data('newbody'));
					$('#trace').html(trace_formatter.render());
				}
			}
		});
	
	// Apply jquery-ui styling
	$('#choose_input').selectmenu().on('selectmenuchange',function () {
		$('#choose_input-button').removeClass('throb');
		$('#inputs').removeClass().addClass($('#choose_input option:selected').val());
	});
	$('#choose_input-button').addClass('throb');
	$('#expression').after('<button onclick="convert();" title="Convert uploaded dataset using chosen type">Convert</button><button onclick="$(\'#datafields\').text(fields);$(\'#modal\').dialog(\'open\')"  title="Paste new JSONata expression to be used for this conversion type">Edit JSONata</button><button onclick="download(mappings,\'mappings.json\');" title="Download all conversion definitions to local filesystem">Download mappings.json</button>');
	$('button,input:file').button();
	$('#datafile_url').addClass('ui-button ui-corner-all ui-widget datafile_url');
	$( "#modal" ).dialog({
		autoOpen: false,
		modal: true,
		width: 600,
		height: "auto"
	});
	
	// Populate Examples drop-down list
	$.getJSON('https://api.github.com/repos/docuracy/Locolligo/git/trees/main?recursive=1&nocache='+Date.now(),function(data){
		var options = [];
		$.each(data.tree,function(i,pathobj){
			if(pathobj.path.startsWith('examples/')){
				options.push('<option value="'+pathobj.url+'">'+pathobj.path.replace('examples/','')+'</option>');
			}
		});
		$('#examples')
			.append(options.join(''))
	    	.selectmenu().on('selectmenuchange',function () {
				$('body').loadingModal({text: 'Processing...'});
				$.ajax({
				    url: $('#examples option:selected').val(),
				    headers: {'accept': 'application/vnd.github.VERSION.raw'},
				    success: function(data){
				    	parse_file($('#examples option:selected').html().split('/').pop(),data);
				    },
				    complete: function(){
				    	$('body').loadingModal('destroy');
				    }
				});
		});
	});
	
	// Populate JSONata expressions drop-down list
	$.get('./templates/mappings.json?'+Date.now(), function(data) { // Do not use any cached file
		mappings = data;
		$.each(data, function(key,value) {
			$('#expression').append('<option value="'+key+'">'+value.description+'</option>');
		});
		$('select#expression').selectmenu().on('selectmenuchange',function () {console.log(mappings[$('#expression option:selected').val()].expression)});
	},'json');
	
	// Populate link layer options
	$.get('./templates/APIs.json?'+Date.now(), function(data) { // Do not use any cached file
		$.each(data, function(key,value) {
			$('#layerSelector .layerGroup:nth-of-type(1)').append('<span class="layer" title="'+(value.label.startsWith('*')?'Not yet implemented':value.title)+'"><input '+(value.label.startsWith('*')?'disabled ':'')+'type="checkbox" name="'+value.type+'" value="'+value.type+'"><label for="'+value.type+'">'+value.label+'</label></span>');
		});
	},'json');
	$('#layerSelector span.fence').attr('title','Click here to refresh any selected layers, based on current map centre').click(function(){removeLinkMarkers();updateLinkMarkers();});

	// Load Heritage Sites Wikidata SPARQL query
	$.get('./templates/wikidata_heritage_sites.sparql', function(data) {
		sparql_heritage_sites = data.replace(/\#.*\r/g,''); // Remove comments, which would break the urlencoded query
	},'text');

	// Load Settlements Wikidata SPARQL query
	$.get('./templates/wikidata_nearby_settlements.sparql', function(data) {
		sparql_nearby_settlements = data.replace(/\#.*\r/g,''); // Remove comments, which would break the urlencoded query
	},'text');
	
	// Parse file
	function parse_file(filename,filecontent){
    	const delimited = ['csv','tsv'];
    	const xml = ['xml','kml'];
		console.log(filename,fileparts);
		var fileparts = filename.split(/[#?]/)[0].split('.');
		console.log(filename,fileparts);
    	const fileExtension = fileparts.pop().trim();
    	if(delimited.includes(fileExtension)){ // Delimited text input
    		if(fileparts.length>1 && fileparts.pop().trim()=='lp'){ // Convert to Linked Places format (geoJSON-T)
    			function transformHeader(header,i){
        			var newHeader = /\{(.*?)\}/.exec(header);
        			return newHeader===null ? null : newHeader[1];
        		}
        		input = Papa.parse(filecontent,{header:true,transformHeader:transformHeader,dynamicTyping:true,skipEmptyLines:true});
        		
				input.meta.fields.forEach(function(field){ // Deal first with root attributes (a root @id may form the base of item @ids)
					if (field !== null && field.startsWith('$.')){
						keyValue = field.split('=');
						input[keyValue.shift().split('.').pop()] = keyValue.shift().replace(/["]+/g, '');
					}
				});
				if(input.hasOwnProperty('citation') && typeof input.citation === 'string'){
	    			const {Cite} = require('citation-js');
	    			const citation = new Cite(input.citation);
	    			input.citation = citation.get()[0];
	    			input.citation.type = 'dataset'; // Incorrectly identifies as 'book'
	    			if(input.citation.hasOwnProperty('author') && Array.isArray(input.citation.author)){
	    				input.citation.author.forEach(function(author){
	    					if(author.hasOwnProperty('_orcid')){
	    						author.orcid = author._orcid;
	    						delete author._orcid;        			    						
	    					}
	    				});
	    			}
	    			delete input.citation._cff_mainReference;
	    			delete input.citation._graph;
	    			delete input.citation.id;					
				}
				if(!input.hasOwnProperty('@id')){
					input['@id'] = 'https://w3id.org/locolligo/'+uuidv4();
				}
				
        		input.data.forEach(function(feature,i){
        			delete feature.null;
        			feature.properties = {};
        			Object.keys(feature).forEach(function(key) {
        				var keyParts = key.split('=');
        				if (keyParts.length>1 && !keyParts[0].startsWith('$.')){
        					if (key.indexOf('="')>-1){ // Fill with string value
        						if(!input.hasOwnProperty('citation') && keyParts[0]=='citation'){
        						}
        						else if(keyParts[0]=='citation'){
        							delete feature.citation;
        						}
        						else{
        							if(keyParts[1].trim().length > 0) feature[keyParts[0]] = keyParts[1].replace(/["]+/g, '');
        						}
        					}
        					else switch(keyParts[1]){ // Transformation required
        						case "OSGB":
	        						try {
	        							const wgs84 = new LatLon(feature.latitude, feature.longitude);
	        							const gridref = wgs84.toOsGrid();
	        							feature[keyParts[0]] = gridref.toString();
	        						}
	        						catch(err) {
	        							feature[keyParts[0]] = '(transformation to OSGB not possible)';
	        						}
	        						break;
        					}
        					delete feature[key];
        				}
        				else{
        					if(feature[key]==null || feature[key]==' ') delete feature[key];
        				}
        			});
        			if(feature.hasOwnProperty('easting_ni') && feature.hasOwnProperty('northing_ni')){
        				// Projection definition from https://epsg.io/29900 (copy and paste Proj4js Definition)
        				proj4.defs('EPSG:29900','+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +towgs84=482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15 +units=m +no_defs');
        				const wgs84 = proj4('EPSG:29900','WGS84',[feature.easting_ni,feature.northing_ni]);
        				console.log(wgs84);
        				feature.geometry = {"type": "Point", "coordinates": [wgs84[0].toFixed(6),wgs84[1].toFixed(6)], 'certainty': 'certain'};
	    				delete feature.easting_ni;
	    				delete feature.northing_ni;
        			}
        			else if(feature.hasOwnProperty('longitude') && feature.hasOwnProperty('latitude')){
        				feature.geometry = {"type": "Point", "coordinates": [feature.longitude,feature.latitude], 'certainty': 'certain'};
	    				delete feature.longitude;
	    				delete feature.latitude;
        			}
        			else feature.geometry = {};
        			Object.keys(feature).forEach(function(property) {
        				var properties = property.split('.');
        				if(properties.length>1){
            				var root = feature;
            				properties.forEach(function(property){
            					if(!root.hasOwnProperty(property)) root[property] = {};
            					root = root[property];
            				});
            				eval('feature.'+property.replaceAll(/(.@[^\.]*)/g,function(match){return '[\''+match.substring(1)+'\']';})+'=feature[property]'); // replaceAll required to handle properties starting with '@'
            				delete feature[property];
        				}
        			});
        			// TO DO: add .relations.broaderPartitive items based on feature.geometry.accuracy, using GeoNames API to identify settlements, counties, or countries based on Point location.
        			// - also allow for numeric accuracy values, adding a geoWithin GeoCircle with geoRadius
        			// - also allow for grid values, adding a geoWithin bounding box
        			if(feature.hasOwnProperty('when') && feature.when.hasOwnProperty('timespans')){ // Check .when format validity, and convert feature.when.timespans object to array
        				for (startEnd in feature.when.timespans){
        					var date = feature.when.timespans[startEnd]['in'];
	        				try {
	        					if (typeof date === 'string') {
	        						var newDate = new Date(date.replace(/(\d{1,2})[-\/](\d{1,2})[-\/]/,/"$2-$1-"/)); //  Assume dd-mm-yyyy format given, and convert to mm-dd-yyyy
	        						feature.when.timespans[startEnd]['in'] = newDate.toISOString();
	        						var label = newDate.getUTCDate() + " " + "JanFebMarAprMayJunJulAugSepOctNovDec".substring(newDate.getMonth()*3).slice(0,3) + " " + newDate.getFullYear();
	        						feature.when.label = feature.when.hasOwnProperty('label') ? feature.when.hasOwnProperty('label')+'; '+ label : label;
	        					}
	        					else{
	        						feature.when.timespans[startEnd]['in'] = String(date).padStart(4,'0');
	        					}
	        				}
	        				catch(err){
	        					feature.when.label = feature.when.hasOwnProperty('label') ? feature.when.hasOwnProperty('label')+'; '+ date : date;
	        					feature.when.timespans[startEnd]['in'] = null;
	        				}
        				}
        				feature.when.timespans = [feature.when.timespans];
        			}
        			if(feature.hasOwnProperty('relations')){ // Convert relations object to array; assume it is a historic county and add appropriate {when} and {ccodes} attributes
        				feature.relations.when = {"timespans":[{"start":{"latest":"1540"},"end":{"earliest":"1974"}}]};
        				feature.relations = [feature.relations];
        				feature.properties.ccodes = ["GB"];
        			}
        			if(!feature.hasOwnProperty('@id')){
        				if(!feature.properties.hasOwnProperty('uri') && !feature.hasOwnProperty('uuid')) feature.uuid = uuidv4();
            			input.data[i] = {'@id': input['@id']+'/'+ (feature.properties.hasOwnProperty('uri') ? feature.properties.uri : feature.uuid), ...feature}; // Insert at front of feature object
        			}
        		});
        		input.type="lp";
        		input_truncated = input; // (Not truncated)
    		}
    		else{ // Regular delimited text
    			input = Papa.parse(filecontent.replace(/[{}]/g, '_'),{header:true,dynamicTyping:true,skipEmptyLines:true}); // Replace curly braces, which break JSONata when used in column headers
    			input['@id'] = 'https://w3id.org/locolligo/'+uuidv4(); // Create PID for dataset
    			$.each(input.data, function(key,value){ // Create uuid for each item/Trace
    				if(!input.data[key].hasOwnProperty('uuid')) input.data[key].uuid = uuidv4();
        			if(!input.data[key].hasOwnProperty('@id')) input.data[key]['@id'] = input['@id']+'/'+input.data[key].uuid;
        		});
        		input_truncated = input; //.data.slice(0,5000); // Truncated to avoid browser overload on expansion of large arrays.
    		}
    	}
    	else if(xml.includes(fileExtension)){
    		const parser = new fxparser.XMLParser();
    		input = parser.parse(filecontent);
    		input_truncated = input; // TO DO: Find generic method for truncation, to avoid browser overload on expansion of large arrays.
    	}
    	else if(typeof filecontent != 'string'){ // Might be object returned from shapefile conversion
    		input = filecontent;
    		input_truncated = input; // TO DO: Find generic method for truncation, to avoid browser overload on expansion of large arrays.
    	}
    	else if(fileExtension == 'jsonld'){ // Assume output from Recogito; wrap with object for dataset identification purposes.
    		input = {
    			'citation':{},
    			'@id':'https://w3id.org/locolligo/'+uuidv4(), // Create PID for dataset
    			'data':JSON.parse(filecontent),
    			'type':'rld'
    		};
			input_truncated = input; // TO DO: Find generic method for truncation, to avoid browser overload on expansion of large arrays; could easily be fixed for geoJSON.
    	}
    	else{ // Assume generic JSON input
    		input = JSON.parse(filecontent);
    		input_truncated = input; // TO DO: Find generic method for truncation, to avoid browser overload on expansion of large arrays; could easily be fixed for geoJSON.
    	}
    	$('#source_block').appendTo('#darkroom');
    	$('#conversions').insertBefore('.arrow');
    	input_formatter = new JSONFormatter(input_truncated,1,{theme:'dark'});
		renderJSON($('#source'),input_formatter,input);
    	identifyType(input);		
	}
	
	// Process uploaded file
	$('#file_source').on('change', function () {
		var file = this.files[0];
		if(file.name.split(/[#?]/)[0].split('.').pop().trim() == 'zip'){ // Assume zipped shapefile - see shp2geojson-preview-v2.js
    		$('body').loadingModal({text: 'Processing...'});
			loadshp({url: file, encoding: 'utf-8'}, function(geojson) {
				console.log(geojson);
				parse_file(file.name,geojson);
	        	$('body').loadingModal('destroy');
			});
		}
		else{
	        var fr = new FileReader();
	        fr.onloadstart = function(){
	    		$('body').loadingModal({text: 'Processing...'});        	
	        }
	        fr.onerror = function(){
	        	$('body').loadingModal('destroy');       	
	        }
	        fr.onloadend = function(){
	        	if(file.name.split(/[#?]/)[0].split('.').pop().trim() == 'zip'){
	        	}
	        	else{
					parse_file(file.name,fr.result);
		        	$('body').loadingModal('destroy');
	        	}
	        }
	        fr.readAsText(file);			
		}
	});
	
//	// Process uploaded file
//	$('#file_source').on('change', function () {
//		var file = this.files[0];
//		if(file.name.split(/[#?]/)[0].split('.').pop().trim() == 'zip'){ // Assume zipped shapefile - see shp2geojson-preview-v2.js
//    		$('body').loadingModal({text: 'Processing...'});
//			loadshp({url: file}, function(geojson) {
//				parse_file(file.name,geojson);
//	        	$('body').loadingModal('destroy');
//			});
//		}
//		else{
//	        var fr = new FileReader();
//	        fr.onloadstart = function(){
//	    		$('body').loadingModal({text: 'Processing...'});        	
//	        }
//	        fr.onerror = function(){
//	        	$('body').loadingModal('destroy');       	
//	        }
//	        fr.onload = function(){
//				parse_file(file.name,fr.result);
//	        	$('body').loadingModal('destroy');
//	        }
//	        fr.readAsText(file);			
//		}	
//	});
	
	// Process fetched file
	$('#fetch').on('click', function () {
    	$('body').loadingModal({text: 'Processing...'});
    	var filetype,
    		url = $('#datafile_url').val();
    	if(url.startsWith('https://docs.google.com/spreadsheets/')){
    		filetype = 'csv';
    		var gid = $('#datafile_url').val().split('gid=');
    		gid = gid.length>1 ? '&gid='+gid.pop() : '';
    		url = url.split('/');
    		url.splice(-1,1,'export?format=csv'+gid);
    		url = url.join('/');
    	}
    	else if(url.startsWith('https://www.google.co.uk/maps/d/') || url.startsWith('https://www.google.com/maps/d/')){
    		filetype = 'xml';
    		url = url.replace('/viewer?mid=','/kml?forcekml=1&mid=');
    	}
    	else{
    		var filetype = $('#datafile_url').val().split('\\').pop().split('/').pop();
    	}
		$.get(url, function(data) {
			parse_file(filetype,data);
		}, 'text').always(function() {
			$('body').loadingModal('destroy');
		});	
	});
	
	$('#JSONata_area').on('paste', function(e) {
		var JSONata = e.originalEvent.clipboardData.getData('text').replace(/(\r\n|\n|\r|\t)/gm, '').replace(/\s\s+/g, ' ');
		$('#JSONata_area').val(JSONata).select();
		document.execCommand("copy");
		mappings[$('#expression option:selected').val()].expression = JSONata;
		mappings[$('#expression option:selected').val()].fields = fields;
		$('#modal').dialog('close');
	});   
	
	// Prepare dataset library catalogue
	const db_promise = indexedDB.databases()
	db_promise.then(databases => {
		console.log(databases)
		$.each(databases,function(i,database){
			var open = indexedDB.open(database.name);
			open.onsuccess = function(){
				var db = open.result;
				var tx = db.transaction("dataname");
				var objectStore = tx.objectStore("dataname");
				var request = objectStore.getAll();
				request.onsuccess = function(event) {
					addLibraryItem(database.name, request.result[0].name);
				}
			};
		});
	});
	
	
});
