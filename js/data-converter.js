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
var geoNamesID = 'locolligo';

// Global variables
var mappings, 
	fields,
	input_formatter, 
	input, 
	output_formatter, 
	output,
	activeDatasetEl,
	activeDataType,
	filteredIndices=[],
	selectedFilter=0,
	markers=[], 
//	currentMarkers=[], 
	traceGeoJSON={"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]}},
	linkMarkers={},
	linkMarkerPopup,
	radius=5, 
	sparql_heritage_sites, 
	APIJSON,
	indexing,
	timeout,
	activeAjaxConnections = 0,
	settings = {
		headers: { Accept: 'application/sparql-results+json' }
    };	 

const LibraryMappings = [// TO DO: Move this functionality to IndexedDB
	// Droplist of properties for popup, id, and label when adding to Library
	// Check that deletion from Library also deletes these mappings
	// The "type" is an identifier generated ad hoc when a user adds to their Library
	
	{ // Battlefields (HE)
		"type": "1643552320559",
		"popup": "newbody.properties.Name",
		"lpMappings": [
			{
				"links": {
					"type": "'seeAlso'",
					"id": "newbody.properties.Hyperlink",
					"label": "newbody.properties.Name"
				}
			}
		] 
	},
	{ // Scheduled Monuments (HE)
		"type": "1643552619613",
		"popup": "newbody.properties.Name",
		"lpMappings": [
			{
				"links": {
					"type": "'seeAlso'",
					"id": "newbody.properties.Hyperlink",
					"label": "newbody.properties.Name"
				}
			}
		] 
	},
	{ // World Heritage Sites (HE)
		"type": "1643552662447",
		"popup": "newbody.properties.Name",
		"lpMappings": [
			{
				"links": {
					"type": "'seeAlso'",
					"id": "newbody.properties.Hyperlink",
					"label": "newbody.properties.Name"
				}
			}
		] 
	},
	{ // Listed Buildings (HE)
		"type": "1643552381677",
		"popup": "newbody.properties.Name",
		"lpMappings": [
			{
				"links": {
					"type": "'seeAlso'",
					"id": "newbody.properties.Hyperlink",
					"label": "newbody.properties.Name"
				}
			}
		] 
	},
	{ // Parks & Gardens (HE)
		"type": "1643552574429",
		"popup": "newbody.properties.Name",
		"lpMappings": [
			{
				"links": {
					"type": "'seeAlso'",
					"id": "newbody.properties.Hyperlink",
					"label": "newbody.properties.Name"
				}
			}
		] 
	},
	{ // Visitor Sites (EH)
		"type": "1643556165046",
		"popup": "newbody.properties.title",
		"lpMappings": [
			{
				"links": {
					"type": "'seeAlso'",
					"id": "newbody.properties.url",
					"label": "newbody.properties.title"
				}
			}
		] 
	},
	{ // National Trust Sites
		"type": "1643556041346",
		"popup": "newbody.properties.title",
		"lpMappings": [
			{
				"links": {
					"type": "'seeAlso'",
					"id": "newbody.properties.url",
					"label": "newbody.properties.title"
				}
			}
		] 
	},
	{ // Historic Royal Palaces
		"type": "1643556797139",
		"popup": "newbody.properties.title",
		"lpMappings": [
			{
				"links": {
					"type": "'seeAlso'",
					"id": "newbody.properties.url",
					"label": "newbody.properties.title"
				}
			}
		] 
	},
	{ // Open Plaques
		"type": "1643631473450",
		"popup": "newbody.properties.title",
		"lpMappings": [
			{
				"links": {
					"type": "'seeAlso'",
					"id": "newbody['@id']",
					"label": "newbody.properties.title"
				}
			}
		] 
	},
	{ // State Care Sites (Northern Ireland)
		"type": "1643557447337",
		"popup": "newbody.properties.title",
		"lpMappings": [
			{
				"links": {
					"type": "'seeAlso'",
					"id": "newbody.properties.url",
					"label": "newbody.properties.title"
				}
			}
		] 
	},
	{ // Leland Wales (Viae Regiae)
		"type": "1643553322355",
		"popup": "newbody.name",
		"lpMappings": [
			{
				"links": {
					"type": "'seeAlso'",
					"id": "newbody['@id']",
					"label": "newbody.name"
				}
			},
			{
				"depictions": {
					"@id": "newbody.depictions[0]['@id']",
					"title": "newbody.name",
					"selector": "newbody.depictions[0].selector",
					"type": "newbody.depictions[0].type",
					"license": "'https://creativecommons.org/licenses/by/4.0/'"
				}
			}
		] 
	},
	{ // BL & BM Objects (Victoria Morris)
		"type": "1643543754541",
		"popup": "newbody.properties.title",
		"lpMappings": [
			{
				"links": {
					"type": "'seeAlso'",
					"id": "newbody.properties.resource_url",
					"label": "newbody.properties.title",
					"properties": "newbody.properties"
				}
			}
		] 
	}
]

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

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
	output = JSON.parse(JSON.stringify(jsonata_expression.evaluate($('#source').data('data')))); // Strip JSONata artefacts
	// Check selectors
	if(output.hasOwnProperty('traces')){
		$.each(output.traces, function(i, trace){
			if(trace.hasOwnProperty('target.selector')) $.each(trace.target.selector, function(j, selector){
				output.traces[i].target.selector[j] = standardiseSVG(selector);
			});
		})
	}
	if(!output.hasOwnProperty('indexing')) output.indexing = indexing;
	output_formatter = new JSONFormatter(output,1,{theme:'dark'});
	renderJSON($('#output'),output_formatter,output);
}

// Scatter point within c.1km square
function scatter(coordinates,radius) {
	return [(coordinates[0]+.01*(Math.random()-.5)).toFixed(3),(coordinates[1]+.01*(Math.random()-.5)).toFixed(3)];
}

// Calculate Haversine distance between Points
function distance(from,to,places=0) {
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

function firstPoint(geometry){
	if(geometry.type == 'Point'){
		return geometry.coordinates;
	}
	else if(geometry.type == 'LineString' || geometry.type == 'MultiPoint'){		
		return geometry.coordinates[0];
	}
	else if(geometry.type == 'Polygon' || geometry.type == 'MultiPolygon'){		
		return polylabel(geometry.coordinates, 1.0);
	}
	else if(geometry.type == 'GeometryCollection'){
		var subgeometries = [];
		geometry.geometries.forEach(function(geometry){
			subgeometry = firstPoint(geometry);
			if(subgeometry !== null) subgeometries.push( subgeometry );
		});
		return subgeometries[0];
	}
	else return null;
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
					else{ // geoJSON (including Linked Places format)
						$.each(dataset.features,function(i,feature){
//							function findProperty(options){
//								var result = '';
//								$.each(options, function(i,option){
//									if (feature.hasOwnProperty(option)) {result = feature[option]; return};
//									if (feature.properties.hasOwnProperty(option)) {result = feature.properties[option]; delete trace.properties[option]; return};
//									if (option=='toponym' && feature.hasOwnProperty('names')) {result = feature.names[0][option]; return};
//								});
//								return result;
//							}
//							var trace = {
//								"_longitude": feature.geometry.coordinates[0],
//								"_latitude": feature.geometry.coordinates[1],
//								"newbody": JSON.parse(JSON.stringify(feature)) // Clone
//							}
//							trace.target = {
//								"title": findProperty(['name','title','toponym','LOCATION','Name','NAME']),
//								"additionalType": "Place",
//								"type": findProperty(['types','X_TYPE']),
//								"relation": "linking",
//								"id": findProperty(['url','@id','Hyperlink','HYPERLINK']),
//								"description": findProperty(['description','descriptions']),
//								"when": findProperty(['when'])
//							}
//							trace.target.geometry = {
//								"@type": "GeoCoordinates",
//								"longitude": feature.geometry.coordinates[0],
//								"latitude": feature.geometry.coordinates[1]
//							}
							
//							if(i>100)return;
							
							try{
								feature._longitude = feature.geometry.coordinates[0];
								feature._latitude = feature.geometry.coordinates[1];
								store.put(feature);
							}
							catch{
								console.log('Failed to store feature.',feature);
							}
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
		.data({'data':data,'formatter':object})
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
			.data({'id':feature['@id']})
			.addClass('dataFeature');
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
	function linkMarker(newbody,type,colour,coordinates,name=false,popup=false){
		if(!newbody.hasOwnProperty('geoWithin')) newbody.geometry = {
				"@type": "GeoCoordinates",
				"addressCountry": "GB",
				"longitude": coordinates[0],
				"latitude": coordinates[1]
			}
		if(!popup) popup = newbody.title;
		const el = document.createElement('div');
		$(el)
			.data({
				'newbody': newbody,
				'type': type,
				'coordinates':coordinates,
				'popup':popup.length>200 ? popup.slice(0,200)+'...' : popup
			})
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
	var bounds = map.getBounds();
	$.each(input.filter(':checked'),function(i,layer){
		// Add markers for these layers		
		var type = $(layer).val();
		var colour = 'rgba('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+',0.45)';
		linkMarkers[type] = [];
		
		try {
			$(layer).closest('.layer').addClass('loading');
			var result = APIJSON.filter(obj => {return obj.type === type})[0];
			$.ajax({url:eval(result.url),headers:result.headers,data:{query:(result.hasOwnProperty('query') ? eval(result.query) : '')}}).then(function(data){
				$.each(eval('data.'+result.datakey), function(i,feature){
					console.log(i,feature,result.coordinates);
					linkMarker(feature,result.type,colour,eval(result.coordinates),false,eval(result.name));
				});
			});
		}
		catch(err) {// Assume GeoData Library
			var open = indexedDB.open(type);
			open.onsuccess = function(){
				var db = open.result;
				var tx = db.transaction('dataset');
				var index = tx.objectStore('dataset').index('coordinates');
				try{
					var popupRule = LibraryMappings.filter(obj => {return obj.type === type})[0].popup;
				}
				catch{
					var popupRule = "'Popup not yet configured for this dataset (type='+type+')'";
				}
				select(index, [IDBKeyRange.bound(bounds._sw.lng, bounds._ne.lng),IDBKeyRange.bound(bounds._sw.lat, bounds._ne.lat)], function(newbody){
					var coordinates = [newbody._longitude,newbody._latitude];
					linkMarker(newbody,type,colour,coordinates,$(layer).siblings('label').text(),eval(popupRule));
				}, function(){
					console.log('Index retrieval complete');
				});
			}
		}
		finally {
			$(layer).closest('.layer').removeClass('loading');
		}
		
	});
}

function removeLinkMarkers(){
	$.each($('#layerSelector input:checked'),function(i,layer){
		$.each(linkMarkers[$(layer).val()], function(i,marker){ marker.remove(); });
	});
}

function updateTrace(dataset=activeDatasetEl.data('data')[activeDataType]){
	removeLinkMarkers();
	var index = $('#index').val()-1;
	traceGeoJSON = dataset[index];
	map.getSource('point').setData(traceGeoJSON);
	bounds = new mapboxgl.LngLatBounds(traceGeoJSON.geometry.coordinates,traceGeoJSON.geometry.coordinates);
	$('.marker.movable').removeClass('movable');
	$.each(markers, function(i,marker){
		if(traceGeoJSON['@id'] == $(marker.getElement()).data('id')){
			$(marker.getElement()).addClass('movable');
		}
	});	
	$('#trace').data('formatter',new JSONFormatter(dataset[index],3,{theme:'light'}));
	$('#trace').html($('#trace').data('formatter').render()).addClass('json-formatter');
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

	$.each(activeDatasetEl.data('data')[activeDataType], function(i,feature){
		if ((JSON.stringify(feature)).indexOf(filter)>-1) filteredIndices.push(i+1);
	});
	
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
			.change(function(){$('#index').val(filteredIndices[selectedFilter]); updateTrace()})
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
					if(activeDatasetEl.data('data')[activeDataType][$('#index').val()-1].id == $(marker.getElement()).data('id')){
						marker.remove();
					}
				});
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
//			var text = $(e.target).data('newbody').hasOwnProperty('title') ? $(e.target).data('newbody').title : $(e.target).data('newbody').name;
//			linkMarkerPopup.setLngLat($(e.target).data('coordinates')).setHTML(text).addTo(map);
			linkMarkerPopup.setLngLat($(e.target).data('coordinates')).setHTML($(e.target).data('popup')).addTo(map);
		})
		.on('mouseleave','.linkmarker',function(e){
			linkMarkerPopup.remove();
		})
		.on('click','.linkmarker',function(e){
			if(activeDataType=='features'){
				var newbody = $(e.target).data('newbody');
				console.log($(e.target).data());
				if(confirm('Add to current feature?')){
					var selectedItem = activeDatasetEl.data('data').features[filteredIndices[selectedFilter]-1];
					try{
						var lpMappings = APIJSON.filter(obj => {return obj.type === $(e.target).data('type')})[0].lpMappings;
					}
					catch{
						var lpMappings = LibraryMappings.filter(obj => {return obj.type === $(e.target).data('type')})[0].lpMappings;
					}
					lpMappings.forEach(function(mapping){
						for (const mappingType in mapping) {
							try{
								var clone = {};
								for (const property in mapping[mappingType]) {
									clone[property] = eval(mapping[mappingType][property]);	
								}
								if(!selectedItem.hasOwnProperty(mappingType)) selectedItem[mappingType] = [];
								selectedItem[mappingType].push(clone);
							}
							catch{
								console.log('Failed to map object.',mapping);
							}
						}
					});
					$('#trace').html($('#trace').data('formatter').render());
				}
			}
			else{
				if(confirm('Add to current trace bodies?')){
					activeDatasetEl.data('data').traces[filteredIndices[selectedFilter]-1].body.push($(e.target).data('newbody'));
					$('#trace').html($('#trace').data('formatter').render());
				}
			}
		});
	
	function reformat(e){
		var formatter = $(e.target).closest('.json-formatter');
		var tempButtons = formatter.children('button').appendTo('#darkroom');
		formatter.html(formatter.data('formatter').render()).prepend(tempButtons);
	}
	
	$('body') // Object value editor
	.on('mouseenter','.json-formatter-number,.json-formatter-string',function(e){
		if(!$(e.target).prev().hasClass('json-formatter-bracket') && $('.editing').length<1) $(e.target).prepend('<span title="Edit this element." class="editlink ui-icon-pencil"></span>'); // Prevent edit button on array indices
	})
	.on('mouseleave','.json-formatter-number,.json-formatter-string',function(e){
		$('.editlink.ui-icon-pencil').remove();
	})
	.on('click','.editlink.ui-icon-pencil',function(e){
		var input = $('<input class="editing" />')
			.val($(e.target).parent().text().replace(/^["'](.+(?=["']$))["']$/, '$1')) // Strip delimiter quotes from strings
			.data('classes',$(e.target).parent().attr("class").split(/\s+/));
		e.preventDefault(); // Disable url-opening on url links
        $(e.target).parent().replaceWith(input);
        input
        .after('<span title="Abandon changes." class="editlink ui-icon-circle-close"></span>')
        .after('<span title="Confirm changes." class="editlink ui-icon-circle-check"></span>');
	})
	.on('click','.editlink.ui-icon-circle-close',function(e){
		reformat(e);
	})
	.on('click','.editlink.ui-icon-circle-check',function(e){
		var value = $(e.target).siblings('input').val();
		value = isNumber(value) ? value : '"'+value+'"';
		var keys = $(e.target).parentsUntil('.json-formatter','.json-formatter-row').map(function(){
			return $(this).find('.json-formatter-key:first').text().slice(0,-1);
		}).get().slice(0,-1).reverse();
		eval(($('#trace').length>0?'activeDatasetEl.data("data")[activeDataType][filteredIndices[selectedFilter]-1]':'$(e.target).closest(".json-formatter").data("data")')+'["'+keys.join('"]["')+'"] = '+value);
		reformat(e);
	});
	
	$('body') // Delete JSON object
	.on('mouseenter','.json-formatter-key',function(e){
		if($('.editlink.ui-icon-trash').length<1) $(e.target).prepend('<span title="Delete this element." class="editlink ui-icon-trash"></span>');
	})
	.on('mouseleave','.json-formatter-key',function(e){
		$('.editlink.ui-icon-trash').remove();
	})
	.on('click','.editlink.ui-icon-trash',function(e){
		function joinkeys(keys){
			return keys.length>0?'["'+keys.join('"]["')+'"]':'';
		}
		var keys = $(e.target).parentsUntil('.json-formatter','.json-formatter-row').map(function(){
			return $(this).find('.json-formatter-key:first').text().slice(0,-1);
		}).get().slice(0,-1).reverse();
		if($(e.target).closest('.json-formatter-row').parent('.json-formatter-array').length>0){
			var index = keys.pop();
			var parentKey = keys.pop();
			eval('var arrayParent = '+($('#trace').length>0?'activeDatasetEl.data("data")[activeDataType][filteredIndices[selectedFilter]-1]':'$(e.target).closest(".json-formatter").data("data")')+joinkeys(keys));
			if(arrayParent[parentKey].length==1){
				delete arrayParent[parentKey];
			}
			else{
				arrayParent[parentKey].splice(index,1);
			}
		}
		else{
			eval('delete '+($('#trace').length>0?'activeDatasetEl.data("data")[activeDataType][filteredIndices[selectedFilter]-1]':'$(e.target).closest(".json-formatter").data("data")')+joinkeys(keys));
		}
		reformat(e);
	});
	
	$('body') // Zoom to feature
	.on('click','.dataFeature',function(e){
		$('#filter').val(''); // Clear filter
		updateFilter();
		$.each(activeDatasetEl.data('data')[activeDataType], function(i,dataItem){
			if(dataItem['@id'] == $(e.target).data('id')){
				selectedFilter=i;
				$('#index').change(); // Trigger updateTrace
				return;
			}
		})
	});
	
	// Prepare for repositioning of features (see https://docs.mapbox.com/mapbox-gl-js/example/drag-a-point/)
	const canvas = map.getCanvasContainer();
	function onMove(e){
		const coords = e.lngLat;
		canvas.style.cursor = 'grabbing';
		traceGeoJSON.geometry.coordinates = [coords.lng, coords.lat];
		map.getSource('point').setData(traceGeoJSON);
	}
	function onUp(e){
		canvas.style.cursor = '';
		map.off('mousemove', onMove);
		map.off('touchmove', onMove);
		$('#trace').html($('#trace').data('formatter').render());
		$.each(markers, function(i,marker){
			if(traceGeoJSON['@id'] == $(marker.getElement()).data('id')){
				marker.setLngLat(traceGeoJSON.geometry.coordinates)
			}
		});
	}
	map.on('load', () => {
		map.addSource('point', {
			'type': 'geojson',
			'data': traceGeoJSON
		});
		map.addLayer({
			'id': 'point',
			'type': 'circle',
			'source': 'point',
			'paint': {
				'circle-radius': 12,
				'circle-color': '#FF0000', // red color
				'circle-opacity': 0.7
			}
		});
		map.on('mouseenter', 'point', () => {
			map.setPaintProperty('point', 'circle-opacity', 0.4);
			canvas.style.cursor = 'move';
		});
		map.on('mouseleave', 'point', () => {
			map.setPaintProperty('point', 'circle-opacity', 0.7);
			canvas.style.cursor = '';
		});
		map.on('mousedown', 'point', (e) => {
			e.preventDefault();
			canvas.style.cursor = 'grab';
			map.on('mousemove', onMove);
			map.once('mouseup', onUp);
		});
		map.on('touchstart', 'point', (e) => {
			if (e.points.length !== 1) return;
			e.preventDefault();
			map.on('touchmove', onMove);
			map.once('touchend', onUp);
		});
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
	
	// Fetch default schema.org indexing template
	$.get('./templates/indexing.json?'+Date.now(), function(data) { // Do not use any cached file
		indexing = data;
	},'json');
	
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
		APIJSON = data;
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
        			else if(feature.hasOwnProperty('PAS_longitude') && feature.hasOwnProperty('PAS_latitude')){
        				feature.geometry = {"type": "Point", "coordinates": scatter([feature.PAS_longitude,feature.PAS_latitude]), 'certainty': '0.7km'}; // Obfuscate PAS Coordinates plus/minus 0.5km lat & lng
	    				delete feature.PAS_longitude;
	    				delete feature.PAS_latitude;
	    				if(feature.hasOwnProperty('properties.thumbnail')) feature['properties.thumbnail'] = 'https://finds.org.uk/images/thumbnails/'+feature['properties.thumbnail']+'.jpg';
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
    		// Replace polygons with poles of inaccessibility (not to be confused with centroids). Could be added as part of a GeometryCollection, but this would break other functionality which relies on Point data only.
    		if(filecontent.hasOwnProperty('features')){
    			filecontent.features.forEach(function(feature){
    				if(feature.geometry.type=='Polygon'){
    					feature.properties._polygon = feature.geometry;
    					feature.geometry = {
							'type': 'Point',
							'coordinates': polylabel(feature.geometry.coordinates, 1.0),
							'description': 'Pole of inaccessibility, generated from polygon'
    					}
    				}
    			});
    		}
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
    	
    	// Create geometry for geojson where none yet exists
    	if(input.hasOwnProperty('features')){
    		input.features.forEach(function(feature){
    			if(!feature.hasOwnProperty('geometry') || firstPoint(feature.geometry)==null){
    				feature.geometry = {"type":"Point","coordinates":[null,null],"certainty":"uncertain"};
    			}
    		});
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
			loadshp({url: file, encoding: 'iso-8859-1'}, function(geojson) {
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
		$.each(databases,function(i,database){
			var open = indexedDB.open(database.name);
			open.onsuccess = function(){
				try{
					var db = open.result;
					var tx = db.transaction("dataname");
					var objectStore = tx.objectStore("dataname");
					var request = objectStore.getAll();
					request.onsuccess = function(event) {
						addLibraryItem(database.name, request.result[0].name);
						console.log('Found '+database.name);
					}
				}
				catch{
					console.log('Removing '+database.name);
					indexedDB.deleteDatabase(database.name);
				}
			};
		});
	});
	
	
});
