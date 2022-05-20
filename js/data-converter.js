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
// Fixed JSONata for geoJSON conversion from xLP with multiple Places per trace body: https://try.jsonata.org/79tc-dKqM
// Included Wikidata identifiers for tags: https://try.jsonata.org/H1xppiTyx
// CSV to xLP JSONata examples at https://try.jsonata.org/AiLGV4yn2; https://try.jsonata.org/5Qs2VD7K6
// CSV to xLP JSONata CRS-conversion example at https://try.jsonata.org/XU6jC_uwd
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
// Georeferencing/linking of any input or output identifiable as xLP
// Catch and requeue rejected API requests if due to overload
// Increase API limit: need to check usage limits
// Google Rich Results
//
// TO DO:
// Require default relation definition on adding dataset to Geodata Library
// Show IIIF fragments in Data Item Explorer overlay
// Manage marker collisions
// Genericise API query function using JSONata and an API-configurations file, to allow simple addition of further API endpoints.
// Implement geoJSON and map shapes (boxes and circles) for geoWithin objects
// Overpass query for Points of Interest from OSM, see https://overpass-turbo.eu/
// Overpass query for Open Historical Map, see https://wiki.openstreetmap.org/wiki/Open_Historical_Map#Using_the_data
// Find places (and photos) by name using Google Places API, e.g. https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=formatted_address,photo%2Cgeometry&locationbias=circle%3A678000%40-5.734863,55.813629&input=British%20Library&inputtype=textquery&key=AIzaSyAk3AdLLz8XoOwLD1NtwFGypLyh77vtw-k
// Request API endpoint and specification for History of English Places (VCH) - and/or get permission to convert dataset to Peripleo-LD (includes links to BHO URLs)?
// OpenPlaques.org has an API (e.g. http://openplaques.org/plaques.csv?box=[55.0473,-1.757],[54.9161,-1.474]), but this has CORS issues. There is also a dump which can be converted to xLP and used for distance matching. Some linking might be possible through NER on the inscription field.
// Fix superfluous quote marks in csv->xLP "when" property. Seems to be a bug in JSONata.
// Populate body Place titles from gazetteer urls; also 'when'?
// Pad descriptions to meet Google minimum length
// Hide everything below input area until it is populated
// Switch display to side-by-side input and output?
// Indicate display truncation of very large datasets: displaying only the first 5,000 lines
// Map fields to controlled vocabulary (Schema.org AND Wikidata?), using populated drop-down lists (with text filtering?)
// Warn of unsaved edits (i.e. prompt download) after set interval and on leaving page
// Check Wikidata SPARQL query, which seems to return some duplicates
// Offer download of Pelagios Registry description for dataset
// ===========================================================

// User variables
var geoNamesID = 'locolligo';

// Custom variables
var facet = false;
//var facet = ".relations[1].relationTo";
//var NTCollections;

// Global variables
var testmode=false,
	testslice={'page':1,'length':702},
	mappings, 
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
	facetmarkers=[], 
//	currentMarkers=[], 
	traceGeoJSON={"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]}},
	linkMarkers={},
	linkMarkerPopup,
	radius=5, 
	sparql_heritage_sites,
	LibraryMappings,
	libraryList = [],
	APIJSON,
	indexing,
	timeout,
	activeAjaxConnections = 0,
	settings = {
		headers: { Accept: 'application/sparql-results+json' }
    },
    defaultMappingSet = { // Default LPF settings, if not otherwise defined in libraryMappings.json
		"popup": "newbody.properties.title",
		"radius": 25,
		"textMatch": false,
		"maxScore": 4,
		"autoConfirm": false,
		"maxResults": 1,
		"fuse": false,
		"lpMappings": [
			{
				"links": "{\"type\": \"exactMatch\",\"identifier\": newbody['@id'],\"label\":newbody.properties.title}"
			}
		] 
	}

function levenshtein(r,e){if(r===e)return 0;var t=r.length,o=e.length;if(0===t||0===o)return t+o;var a,h,n,c,f,A,d,C,v=0,i=new Array(t);for(a=0;a<t;)i[a]=++a;for(;v+3<o;v+=4){var u=e.charCodeAt(v),l=e.charCodeAt(v+1),g=e.charCodeAt(v+2),s=e.charCodeAt(v+3);for(c=v,n=v+1,f=v+2,A=v+3,d=v+4,a=0;a<t;a++)C=r.charCodeAt(a),(h=i[a])<c||n<c?c=h>n?n+1:h+1:u!==C&&c++,c<n||f<n?n=c>f?f+1:c+1:l!==C&&n++,n<f||A<f?f=n>A?A+1:n+1:g!==C&&f++,f<A||d<A?A=f>d?d+1:f+1:s!==C&&A++,i[a]=d=A,A=f,f=n,n=c,c=h}for(;v<o;){var w=e.charCodeAt(v);for(c=v,f=++v,a=0;a<t;a++)f=(h=i[a])<c||f<c?h>f?f+1:h+1:w!==r.charCodeAt(a)?c+1:c,i[a]=f,c=h;d=f}return d}

// function soundex(string)
const findStartingCode=e=>e[0].toUpperCase(),findLetterCode=e=>{switch(e.toUpperCase()){case"B":case"F":case"P":case"V":return"1";case"C":case"G":case"J":case"K":case"Q":case"S":case"X":case"Z":return"2";case"D":case"T":return"3";case"L":return"4";case"M":case"N":return"5";case"R":return"6";default:return null}},soundex=e=>{if(e){let t=findStartingCode(e),r=findLetterCode(t);for(let a=1;a<e.length;++a){const n=findLetterCode(e[a]);if(n&&n!=r&&4==(t+=n).length)break;r=n}for(let e=t.length;e<4;++e)t+="0";return t}return null};

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
function downloadCSV(jsonobject,filename=false,geoJSON=true){
	var dataset = {'fields':[],'data':[]};
	if(geoJSON){
		jsonobject.features.forEach(function(object){
			var newObject = {};
			var parents=[];
			function getKeys(subObject,isArray=false){
				try{
					Object.entries(subObject).forEach(function([key,value]){
						if(isArray) key = '['+key+']';
						if(Array.isArray(value)){
							parents.push(key);
							getKeys(value,true);
						}
						else if(typeof value==='object'){
							parents.push(key);
							getKeys(value);
						}
						else{
							parents.push(key);
							parentsString = parents.join('.').replaceAll('.[','[');
							if(!dataset.fields.includes(parentsString)) dataset.fields.push(parentsString);
							newObject[parentsString]= value;
							parents.pop();
						}
					});
					parents.pop();
				}
				catch(err){
					console.log('Error getting header keys.',err);
				}
				
			}
			getKeys(object);
			dataset.data.push(newObject);
		});
		dataset.fields.sort();
		Object.entries(jsonobject).forEach(function([key,value]){
			if(key=='features') return;
			dataset.fields.push('$.'+key+'='+JSON.stringify(value));
		});
		dataset.data.unshift( dataset.fields.reduce((a, v) => ({ ...a, [v]: '{'+v+'}'}), {}) );
		var CSVoutput = Papa.unparse(dataset,{
			quotes: true,
			quoteChar: '"',
			escapeChar: '"',
			header: false,
			newline: "\r\n",
			skipEmptyLines: true
		})
		console.log('CSV generated ('+dataset.fields.length+' columns and '+dataset.data.length+' rows).');
	}
	else dataset = jsonobject;
	$("<a />", {
		"download": filename ? filename.split('.')[0]+".lp.csv" : "geoJSON_Data_"+ Math.floor(Date.now()/1000) +".csv",
		"href" : "data:application/csv;charset=utf-8," +encodeURIComponent( CSVoutput )
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
function OSGB_WGS84(input,box=true){
	const gridref = OsGridRef.parse(input);
	const wgs84 = gridref.toLatLon();
	if(!box) return [Number(wgs84._lon.toFixed(6)),Number(wgs84._lat.toFixed(6))];
	// Transform gridref based on input resolution
	digits = input.replace(/\D/g,'').length/2;
	gridref.easting += 10**(6-digits);
	gridref.northing += 10**(6-digits);
	const wgs84a = gridref.toLatLon();
	const geowithin = {'geoWithin':{'box':Number(wgs84._lon.toFixed(6))+','+Number(wgs84._lat.toFixed(6))+' '+Number(wgs84a._lon.toFixed(6))+','+Number(wgs84a._lat.toFixed(6))}};
	return [Number(wgs84._lon.toFixed(6)),Number(wgs84._lat.toFixed(6)),geowithin];
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
	try{
		var expression = mappings[$('#expression option:selected').val()].expression;
	}
	catch{return;}
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
	if(!$('#source').data('data').hasOwnProperty('indexing')){
		output.indexing = indexing;
		console.log('Assigning default indexing data.');
	}
	else if(typeof $('#source').data('data').indexing==='string' && $('#source').data('data').indexing.endsWith('.json')){
		$.ajaxSetup({async:false});
		try{
			$.get('./templates/'+$('#source').data('data').indexing+'?'+Date.now(), function(data) { // Do not use any cached file
				output.indexing = data;
				console.log('Assigning indexing data.',data);
			},'json');
		}
		catch{
			console.log('Error trying to open '+output.indexing);
		}
		$.ajaxSetup({async:true});
	}
	else{
		output.indexing = $('#source').data('data').indexing;
		console.log('Copying source indexing data.');
	}
	output_formatter = new JSONFormatter(output,1,{theme:'dark'});
	renderJSON($('#output'),output_formatter,output);
}

function assign(){
	$('#assign').removeClass('throb');
	var assignmentOptions = [
		['(ignore)'],
		['@id','identifier|uuid|id|@id'],
		['properties.title','title|name|label'],
		['properties.%%%'],
		['geometry.coordinates','coordinates|coords|OSGB'],
		['geometry.coordinates[0]','longitude|long|lng|easting|westing|X'],
		['geometry.coordinates[1]','latitude|lat|northing|southing|Y'],
		['names[0].toponym','toponym'],
		['links[0].type'],
		['links[0].identifier'],
		['depictions[0].@id'],
		['depictions[0].title'],
		['descriptions[0].@id'],
		['descriptions[0].value'],
		['types[0].identifier'],
		['types[0].label'],
		['{custom}']
	];
	
	var assignmentSelector=[];
	assignmentOptions.forEach(function(option,i){
		assignmentSelector.push('<option'+(option.length>1?' title="'+option[1]+'"':'')+' value="'+i+'"'+(i==0?' selected':'')+'>'+option[0]+'</option>');
	});
	assignmentSelector = '<select class="featureProperty" name="assignment_###" id="assignment_###">'+assignmentSelector.join('')+'</select>'
	
	var geocodeSelector=[];
	geocodeSelector.push('<option selected value="">No Geocode Field</option>');
	input.meta.fields.forEach(function(field,i){
		geocodeSelector.push('<option value="'+field+'">'+field+'</option>');
	});
	geocodeSelector = '<select title="If any of your features lack coordinates, select a place-name field." name="geocodeSelector" id="geocodeSelector">'+geocodeSelector.join('')+'</select>'
	
	var ccodeSelector=[];
	ccodeSelector.push('<option value="">No Country Bias</option>');
	$.ajax({
		dataType: "json",
		url: './templates/country-codes.json',
		async: false, 
		success: function(ccodes) {
			ccodes.forEach(function(ccode){
				ccodeSelector.push('<option'+(ccode.Code=='GB'?' selected':'')+' value="'+ccode.Code+'">'+ccode.Name+'</option>');
			});
		}
	});
	ccodeSelector = '<select title="Bias results by selected country." name="ccodeSelector" id="ccodeSelector">'+ccodeSelector.join('')+'</select>'
	
	var CRSOptions = [
		['Select'],
		['WGS84'],
		['OSGB'],
		['Easting/Westing (GB)'],
		['Easting/Westing (NI)']
	];
	var CRSSelector=[];
	CRSOptions.forEach(function(option,i){
		CRSSelector.push('<option value="'+option[0]+'"'+(i==0?' selected disabled="true"':'')+'>'+option[0]+'</option>');
	});
	CRSSelector = '<select name="CRS" id="CRS">'+CRSSelector.join('')+'</select>'
	function checkCRS(){
		var WGS84 = 0;
		function getRange(field){
			return Math.max.apply(Math, input.data.map(function(o) { return Math.abs(o[field]); }))
		}
		input.meta.fields.forEach(function(field,j){
			if ($('#assignment_'+j).val()!==null){
				if(assignmentOptions[$('#assignment_'+j).val()][0]=='geometry.coordinates[0]'){
					if (getRange(field)<=180) WGS84++;
				}
				else if(assignmentOptions[$('#assignment_'+j).val()][0]=='geometry.coordinates[1]'){
					if (getRange(field)<=90) WGS84++;
				}
			}
		});
		if (WGS84==2) $('#CRS').val('WGS84').selectmenu('refresh');
	}
	
	function truncate(text){
		try{
			return ((text.length>50?text.substring(0,50)+'...':text));
		}
		catch{
			return '-';
		}
	}
	
	$('<table id="assignments"><tr><th>Original Header&nbsp;</th><th>LPF Translation&nbsp;<span class="mini">(Sample)</span></th></td></table>')
	.appendTo('body');
	input.meta.fields.forEach(function(field,j){
		$('<tr class="assignment"><td><label for="assignment_'+j+'">'+field+':</td><td>'+assignmentSelector.replaceAll('%%%',field.toLowerCase().replaceAll(' ','_').replaceAll('\'','')).replaceAll('###',j)+'<span class="mini">('+truncate(input.data[0][field])+')</span></td></tr>')
		.appendTo('#assignments');
	});
	$('#assignments')
	.append($('<tr><td>Dataset name:</td><td><input id="_name" placeholder=">10 Characters (optional)" title="Schema.org requires both a name and a description." value="'+input.meta.filename.replace('.csv','').replaceAll('_',' ')+'" /></td></tr>'))
	.append($('<tr><td>Dataset description:</td><td><input id="_description" placeholder=">50 Characters (optional)" title="Schema.org requires both a name and a description." value="" /></td></tr>'))
	.append($('<tr><td>Dataset creator(s):</td><td><textarea id=\'_creators\' placeholder=\'[{\"@type\":\"Organisation\",\"url\":\"https://organisation.org\"},{\"@type\":\"Person\",\"name\":\"J.S. Bach\",\"url\":\"https://orcid.org/****-****-****-****\"},{\"@type\":\"Person\",\"name\":\"Giuseppe Verdi\"}]\' title=\'Enter as JSON - follow the template, with as few or as many Organisations and Persons as necessary, each contained in curly brackets and separated by commas. Enclose the whole collection in square brackets.\' value=\'\'></textarea></td></tr>'))
	.append($('<tr><td>Dataset id:</td><td><input id="_id" placeholder="Automatic if blank." value="'+encodeURI(input.meta.filename.replace('.csv',''))+'" /></td></tr>'))
	.append($('<tr><td>Dataset base URL:</td><td><input id="_baseURL" placeholder="Optional" title="Delete this value if the dataset is not a web resource." value="https://w3id.org/" /></td></tr>'))
	.append($('<tr><td>Dataset CRS:</td><td>'+CRSSelector+'</td></tr>'))
	.append($('<tr><td>Coordinate obfuscation:</td><td><input id="_obfuscation" placeholder="Optional (km)" title="Randomise coordinates +/- the distance entered here. Might be used to conceal exact archaeological findspots." /></td></tr>'))
    .append($('<tr><td>Geocode Place-name:</td><td>'+geocodeSelector+ccodeSelector+'</td></tr>'))
    .dialog({
    	modal: true,
    	title: 'Assign LPF Feature Properties from CSV Columns',
	    zIndex: 10000,
	    autoOpen: true,
	    width: 'auto',
	    resizable: false,
	    open: function( event, ui ) {
	    	async function loadAssignments() { // Load values from IndexedDB storage
		    	if((await window.indexedDB.databases()).map(db => db.name).includes('_assignments')){
		    		var request = indexedDB.open('_assignments');
		    		request.onsuccess = event => {
		    			db = event.target.result;
		    			db.transaction("assignmentStore").objectStore("assignmentStore").get(input.meta.filename).onsuccess = event => {
		    				if(event.target.result !== undefined) {
		    					event.target.result.selections.forEach(function(selection){
									if(selection.id.startsWith('assignment_')){ // Columns of CSV may have been rearranged since previous upload
										var field = event.target.result.fields[selection.id.split('_')[1]];
										var target = 'assignment_'+input.meta.fields.indexOf(field);
									}
									else target = selection.id;
									$('#'+target).val(selection.value).filter('select').selectmenu('refresh');
								});
		    				}
		    			};

		    		}
		    	}
	    	}
	    	loadAssignments();
	    },
	    buttons: [
	    	{
	    		text: 'Convert',
	    		click: function(){
	    			$('body').loadingModal({text: 'Processing...'});

	    			var validation = [];
	    			var validationGeo = [];
	    			var validationGeoConvert = [];
	    			var coordinatesAssigned = true;
	    			var duplicateValues = $('#assignments select').map(function(){return $(this).find('option:selected').text();}).get().filter(function(value, index, self){return value!=="(ignore)" && self.indexOf(value) !== index;}).filter(function(value, index, self){return self.indexOf(value) === index;});
	    			duplicateValues.forEach(function(value){
	    				validation.push('More than one assignment was found for "'+value+'". Only the last assignment will be processed.');
	    			});
	    			var selectionValues = $('#assignments select').map(function(){return $(this).val();}).get().filter(function(value, index, self){return self.indexOf(value) === index;});
	    			var searchIndex = assignmentOptions.map(a => a[0]).indexOf('properties.title').toString();
	    			if(!selectionValues.includes(searchIndex)) validation.push('No title has been assigned, which may be problematic for map visualisation of this dataset.');
	    			var searchIndex = assignmentOptions.map(a => a[0]).indexOf('@id').toString();
	    			console.log(searchIndex,selectionValues,selectionValues.includes(searchIndex));
	    			if(!selectionValues.includes(searchIndex)) validation.push('Feature ids will be generated automatically (no CSV field was assigned for this purpose).');
	    			var searchIndex = assignmentOptions.map(a => a[0]).indexOf('geometry.coordinates').toString();
	    			var searchIndexLng = assignmentOptions.map(a => a[0]).indexOf('geometry.coordinates[0]').toString();
	    			var searchIndexLat = assignmentOptions.map(a => a[0]).indexOf('geometry.coordinates[1]').toString();
	    			if(!selectionValues.includes(searchIndex) && !(selectionValues.includes(searchIndexLng) && selectionValues.includes(searchIndexLat))) {
	    				validation.push('No coordinates have been assigned. Map visualisation will be impossible until these have been added.');
	    				coordinatesAssigned = false;
	    			}
	    			
	    			// Initiate asynchronous IndexedDB storage
	    			input.meta.selections = $('#assignments select, #assignments input, #assignments textarea').map(function(){return {'id':this.id,'value':$(this).val()};}).get();
	    			var db;
	    			var request = indexedDB.open('_assignments');
	    			request.onupgradeneeded = event => {
						console.log('indexedDB upgrade needed.');
	    				db = event.target.result;
	    				var objectStore = db.createObjectStore("assignmentStore", { keyPath: "filename" });
	    			};
    				request.onsuccess = event => {
						console.log('indexedDB opened.');
    					db = event.target.result;
    					var transaction = db.transaction(["assignmentStore"], "readwrite");
    					var assignmentStore = transaction.objectStore("assignmentStore");
    					var storeRequest = assignmentStore.put(input.meta);
    					storeRequest.onsuccess = event => {
    						console.log('Data stored.',event.target.result);
    					};
    					storeRequest.onerror = event => {
    						console.log('Failure with indexedDB storeRequest: ' + event.target.errorCode);
    						validation.push('Failed to store selections in indexedDB. They will not be recalled next time a file with the same name is loaded.');
    					};
    				};
	    			request.onerror = event => {
	    				console.log('Failure with indexedDB: ' + event.target.errorCode);
    				};
    				
	    			$('#output').html('');
	    			output = {'@id':$('#_baseURL').val()+($('#_id').val()==''?input['@id']:$('#_id').val()),'type':'FeatureCollection','@context':'https://w3id.org/locolligo/contexts/linkedplaces.jsonld','features':[],'indexing':indexing};
	    			if($('#_name').val().length<10 || $('#_description').val().length<50){
	    				delete output.indexing['@context'];
	    				validation.push('Dataset name and description did not meet the minimum length requirements for Google indexing via schema.org.');
	    			}
    				output.indexing.identifier = output['@id'];
	    			output.indexing.name = $('#_name').val();
    				output.indexing.description = $('#_description').val();
	    			delete output.indexing.significantLink;
	    			delete output.indexing.relatedLink;
	    			delete output.indexing.spatialCoverage.geoCoveredBy;
	    			var geocodingOK = true;
	    			input.data.forEach(function(item,i){
	    				var feature = {'@id':'','type':'Feature','properties':{'title':''},'geometry':{'type':'Point'}};
	    				
	    				input.meta.fields.forEach(function(field,j){
	    					if ($('#assignment_'+j).val()!==null && $('#assignment_'+j).val()!=='0' && item[field]!==null){	  
		    					try{  
		    						var properties = $( '#assignment_'+j+' option:selected' ).text().replaceAll('[','.').replaceAll(']','').split('.');
		    						root = feature;
		            				properties.forEach(function(property,i){
		            					if(!root.hasOwnProperty(property)){
		            						if(properties.length>i && /(0|[1-9]\d*)/.test(properties[i+1])){ // Array item next
		            							root[property] = [];
		                					}
		                					else root[property] = {};
		            					}
		            					root = root[property];
		            				});
		            				eval('feature'+('.'+$( '#assignment_'+j+' option:selected' ).text()).replaceAll(/(.@[^\.]*)/g,function(match){return '[\''+match.substring(1)+'\']';})+' = item[field]'); // replaceAll required to handle properties starting with '@'						
		    					}
		    					catch(err){
		    						validation.push('Record #'+j+': Failed to assign field "'+field+'" ('+err+').');
		    					}
	    					}
	    				});
    					
	    				if(coordinatesAssigned) {
	    					try{
			    				var wgs84;
			    				switch($('#CRS').val()){
		    					case 'OSGB':
		    						feature.geometry.coordinates = OSGB_WGS84(feature.geometry.coordinates);
		    						break;
		    					case 'Easting/Westing (GB)':
		    						// Projection definition from https://epsg.io/27700 (copy and paste Proj4js Definition)
		            				proj4.defs("EPSG:27700","+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs");
		            				wgs84 = proj4('EPSG:27700','WGS84',feature.geometry.coordinates);
		            				feature.geometry.coordinates = [parseFloat(wgs84[0].toFixed(6)),parseFloat(wgs84[1].toFixed(6))];
		    						break;
		    					case 'Easting/Westing (NI)':
		            				// Projection definition from https://epsg.io/29900 (copy and paste Proj4js Definition)
		            				proj4.defs('EPSG:29900','+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +towgs84=482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15 +units=m +no_defs');
		            				wgs84 = proj4('EPSG:29900','WGS84',feature.geometry.coordinates);
		            				feature.geometry.coordinates = [parseFloat(wgs84[0].toFixed(6)),parseFloat(wgs84[1].toFixed(6))];
		    						break;
		    					}  
	    					}
	    					catch{
	    						validationGeoConvert.push(i);
	    					}  					
	    					
		    				if(firstPoint(feature.geometry)==null) {
		    					feature.geometry=null;
		    					validationGeo.push(i);
		    				}
		    				else if(typeof +$('#_obfuscation').val() == 'number' && +$('#_obfuscation').val()>0) {
		    					feature.geometry.coordinates = scatter(feature.geometry.coordinates,+$('#_obfuscation').val());
		    					feature.geometry.granularity = {'tolerance':{'value':+$('#_obfuscation').val(),'units':'km'}};
		    				}
	    				}
	    				else feature.geometry=null;
	    				
	    				if(geocodingOK && feature.geometry==null && $('#geocodeSelector').val()!==''){
	    					$.ajax({
	    						async: false,
	    						dataType: 'json',
	    						url: 'https://secure.geonames.org/searchJSON?q='+item[$('#geocodeSelector').val()]+($('#ccodeSelector').val()==''?'':'&countryBias='+$('#ccodeSelector').val())+'&fuzzy=0.3&username='+geoNamesID+'&maxRows=1',
	    						success: function(data){
		    						console.log(data);
		    						if(data.totalResultsCount==0){
		    							// TO DO: Find a representative coordinate for country bias if selected
		    							console.log('No geocoding match found for "'+item[$('#geocodeSelector').val()]+'".');
		    							validation.push('No geocoding match found for "'+item[$('#geocodeSelector').val()]+'".');
		    						}
		    						else{
		    							feature.geometry = {'type':'Point','coordinates':[+data.geonames[0].lng,+data.geonames[0].lat],'certainty':'uncertain'};
		    							console.log('Matched "'+item[$('#geocodeSelector').val()]+'" to "'+data.geonames[0].toponymName+'".');
		    							validation.push('Matched "'+item[$('#geocodeSelector').val()]+'" to "'+data.geonames[0].toponymName+'".');
		    						}
		    					},
		    					error: function(xmlhttprequest, textstatus, message) {
		    				        if(textstatus==='timeout') {
		    				            alert('Geocoding API call timed out: cancelling geocoding.');
		    				            geocodingOK = false;
		    				        } else {
		    				            alert('Geocoding API error: '+message);
		    				        }
		    				    }
	    					});
	    				}
	    				
	    				if(feature['@id']=='') feature['@id'] = output['@id']+'/'+item['uuid'];
	    				
	    				output.features.push(feature);
	    			});

	    			try{
		    			var bbox=[];
		    			var validCoordinates = output.features.filter(function(f){return f.geometry!==null});
		    			bbox.push(Math.min.apply(Math,validCoordinates.map(function(f){return Math.abs(f.geometry.coordinates[1]);})));
		    			bbox.push(Math.min.apply(Math,validCoordinates.map(function(f){return Math.abs(f.geometry.coordinates[0]);})));
		    			bbox.push(Math.max.apply(Math,validCoordinates.map(function(f){return Math.abs(f.geometry.coordinates[1]);})));
		    			bbox.push(Math.max.apply(Math,validCoordinates.map(function(f){return Math.abs(f.geometry.coordinates[0]);})));
	    				output.indexing.spatialCoverage.geo = {'@type':'GeoShape','box':bbox.join(' ')};
	    			}
	    			catch(err){
	    				console.log(err);
	    				delete output.indexing.spatialCoverage;
	    				validation.push('It was not possible to calculate a bounding box for this dataset, due '+(coordinatesAssigned?'probably to some invalid':'to the absence of')+' geometry.');
	    			}
	    			
	    			try{
	    				output.indexing.creator = JSON.parse($('#_creators').val());
	    			}
	    			catch{ // Fails with any invalid JSON
	    				validation.push('The JSON supplied for identifying the Dataset Creator(s) is invalid.');
	    				delete output.indexing.creator;
	    			} 
	    			
	    			// Validation Report
	    			
	    			output_formatter = new JSONFormatter(output,1,{theme:'dark'});
	    			renderJSON($('#output'),output_formatter,output);
	    			$(this).dialog("close");
	    			
	    			if(validationGeoConvert.length>0) validation.push('CRS conversion failed for the following items: '+validationGeoConvert.join(',')+'.');
	    			if(validationGeo.length>0) validation.push('Geometry is invalid for the following items: '+validationGeo.join(',')+'.');
	    			$('body').loadingModal('destroy');
	    			$('<div id="validation"><ul><li>'+validation.join('</li><li>')+'</li></ul></div>')
	    			.appendTo('body')
	    			.dialog({
	    		    	modal: true,
	    		    	title: 'Validation Report',
	    			    zIndex: 10000,
	    			    autoOpen: true,
	    			    width: 'auto',
	    			    resizable: false,
	    			    buttons: [
	    			    	{
	    			    		text: 'Close',
	    			    		click: function(){
	    			    			$(this).dialog("close");
	    			    		}
	    			    	}
	    			    ]
	    			});
	    		}
	    	},
	    	{
	    		text: 'Cancel',
	    		click: function(){
	    			$(this).dialog("close");
	    		}
	    	}
	    ],
	    close: function(event, ui) {
	        $(this).remove();
	    }
    });
	$('#assignments input, #assignments textarea').addClass("ui-widget ui-widget-content ui-corner-all ui-button").css({'text-align':'left'});
	$('#assignments select').selectmenu();
	$('#assignments select.featureProperty')
	.each(function(j,property){
		var index = assignmentOptions.findIndex(option => option[0]==input.meta.fields[j] || (option.length>1 && option[1].split('|').includes(input.meta.fields[j])));
		if(index>-1) $(property).val(index).selectmenu("refresh");
	})
	.on('selectmenuchange',function (event,ui) {
		// Configure link & description types from drop-down
		// Notify auto UUID generation if no @id selected.
		// Warn for missing standard LPF fields or when data is non-compliant.
		// Find centroid for non-Point geometry
		if(assignmentOptions[ui.item.value][0]=='{custom}'){
			alert('Sorry, custom property configuration is not yet implemented.');
		}
		else if(['geometry.coordinates','geometry.coordinates[0]','geometry.coordinates[1]'].includes(assignmentOptions[ui.item.value][0])){
			checkCRS();
		}
	});
	checkCRS();
}

function cleanupDataset(data){
	console.log('Cleaning Dataset');	
	
	if(data.hasOwnProperty('features')) data.features.forEach(function(feature,j){
	
		try{
			if(data.indexing.name=='MonasteryQuest'){
				if(!feature.properties.hasOwnProperty('title') && feature.properties.hasOwnProperty('name')){
					feature.properties.title = feature.properties.name;
					delete feature.properties.name;
				}
				delete feature.properties.lat;
				delete feature.properties.long;
				feature.properties.when = {"timespans": [{"start": {"in":feature.properties.Founded},"end": {"in":feature.properties.Dissolved}}],"label":"Period from Foundation to Dissolution"}
				feature['@id']=data.indexing.identifier+'/'+j;
//				if(feature.hasOwnProperty('depictions') && feature.depictions[0]['@id'].startsWith('https://maps.google.com/maps?q=&layer=c&cbll=')){
//					if(!feature.hasOwnProperty('links')) feature.links = [];
//					feature.links.push({"type":"seeAlso","identifier":feature.depictions[0]['@id'],"label":feature.depictions[0].title});
//					delete feature.depictions;
//				}
//				feature.depictions = [{"@id":"https://maps.google.com/maps?q=&layer=c&cbll="+feature.geometry.coordinates[1]+","+feature.geometry.coordinates[0],"title":"Google Street View"}];
				delete feature.depictions;
			}
		}
		catch(err){console.log(err);}
		
		delete feature._longitude;
		delete feature._latitude;
		
//		if(feature.hasOwnProperty('descriptions') && !Array.isArray(feature.descriptions)){
//		feature.descriptions = [feature.descriptions[0]];
//	}
		if(feature.hasOwnProperty('properties') && feature.properties.hasOwnProperty('description')){
			if(!feature.hasOwnProperty('descriptions')) feature.descriptions = [];
			feature.descriptions.push({'value':feature.properties.description});
			delete feature.properties.description;
		}
		if(feature.hasOwnProperty('depictions')){
			feature.depictions.forEach(function(depiction){
				if(depiction.hasOwnProperty('accreditation')){
					depiction.accreditation = depiction.accreditation.replaceAll('�','©');
//					depiction.accreditation = '� '+depiction.accreditation.split(' ').splice(0,1).join(' ');
					console.log('Fixed accreditation: '+depiction.accreditation);
				}
			});
		}
		if(feature.hasOwnProperty('descriptions')){
			if(!Array.isArray(feature.descriptions)){
				feature.descriptions = [feature.descriptions['0']];
			}
			if(feature.descriptions[0]==undefined){
				console.log(j+': undefined',feature.descriptions);
				delete feature.descriptions;
			}
			else{
				feature.descriptions.forEach(function(description){
					if(!description.hasOwnProperty('value') || description.value==null){
						console.log(j+': no .value',description);
					}
				});
			}
		}
		['names','types','links','depictions'].forEach(function(property){ // Remove null and duplicate values from arrays
			if(feature.hasOwnProperty(property)){
				var deletions=[]
				feature[property].forEach(function(link,i){
//					if (link==null) deletions.push(i);
					if (
						link==null || 
						(link.hasOwnProperty('identifier') && (link.identifier == 'wd:Q570116' || link.identifier == '@id')) ||
						(link.hasOwnProperty('@id') && link['@id'] == null)
					) deletions.push(i);
//					if (property=='links' && link.hasOwnProperty('identifier') && feature['@id'].indexOf('/locolligo/ArtUK/')>-1) feature['@id'] = 'http://'+link.identifier;
				});
				deletions.reverse().forEach(function(i){
					console.log('Removing '+j+': '+i+'['+JSON.stringify(feature[property][i])+'] ...');
					feature[property].splice(i,1);
				});
				try{
					feature[property] = feature[property].filter((value, index, self) =>
					  index === self.findIndex((t) => (
					    t.identifier === value.identifier
					  ))
					);
				}
				catch{
					feature[property] = feature[property].filter((value, index, self) =>
					  index === self.findIndex((t) => (
					    t.toponym === value.toponym
					  ))
					);
				}
				if (feature[property].length == 0) delete feature[property];
			}
		});

		if(feature.hasOwnProperty('types')){
			feature.types.forEach(function(type){
				if(type.hasOwnProperty('identifier')) type.identifier = type.identifier.replace(/https?:\/\/www.wikidata.org\/(?:wiki|entity)\//,'wd:');
			});
		}
	});
}

function indexingLinks(data){
	console.log('Creating Indexing Links');
	if(data.hasOwnProperty('indexing')) {
		if(data.hasOwnProperty('features')) data.features.forEach(function(feature){
			if(feature.hasOwnProperty('links')) feature.links.forEach(function(link){
				if(['exactMatch','primaryTopicOf','subjectOf'].includes(link.type)){
					if(!data.indexing.hasOwnProperty('significantLink')) data.indexing.significantLink = [];
					data.indexing.significantLink.push(link.identifier);
				}
				else if(['seeAlso','closeMatch'].includes(link.type)){
					if(!data.indexing.hasOwnProperty('relatedLink')) data.indexing.relatedLink = [];
					data.indexing.relatedLink.push(link.identifier);
				}
			});
		});
	}
	['significantLink','relatedLink'].forEach(function(linkType){ // Unique values only
		if(data.indexing.hasOwnProperty(linkType)) data.indexing[linkType] = data.indexing[linkType].filter(arrayUnique);
	});
}

// Scatter point within c.1km square
function scatter(coordinates,tolerance=1) {
	tolerance = {'lng':tolerance/(111*Math.cos(coordinates[1]*Math.PI/180)),'lat':tolerance/111}; // convert to degrees (approximately spherical)
	return [+(coordinates[0]+tolerance.lng*(Math.random()-.5)).toFixed(6),+(coordinates[1]+tolerance.lat*(Math.random()-.5)).toFixed(6)];
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
	Number.prototype.between = function(a, b) {
		var min = Math.min(a, b),
		max = Math.max(a, b);
		return this >= min && this <= max;
	}
	function checkValidity(coordinates){
		if (!Array.isArray(coordinates) || coordinates.length!==2) return null;
		try{
			if(coordinates[0].between(-180,180) && coordinates[1].between(-90,90)){
				return coordinates;
			}
			else return null;
		}
		catch{
			console.log('Error validating coordinates.',coordinates);
			return null;
		}
	}
	if(geometry == null){
		return null;
	}
	else if(geometry.type == 'Point'){
		return checkValidity(geometry.coordinates);
	}
	else if(geometry.type == 'LineString' || geometry.type == 'MultiPoint'){		
		return checkValidity(geometry.coordinates[0]);
	}
	else if(geometry.type == 'Polygon' || geometry.type == 'MultiPolygon'){		
		return checkValidity(polylabel(geometry.coordinates, 1.0));
	}
	else if(geometry.type == 'GeometryCollection'){
		var subgeometries = [];
		geometry.geometries.forEach(function(geometry){
			subgeometry = firstPoint(geometry);
			if(subgeometry !== null) subgeometries.push( subgeometry );
		});
		return checkValidity(subgeometries[0]);
	}
	else return null;
}

function arrayUnique(value, index, self) {
	return self.indexOf(value) === index;
}

function markTrace(){
	markers.forEach(function(marker,i){
		if(activeDatasetEl.data('data')[activeDataType][filteredIndices[selectedFilter]-1]['@id'] == $(marker.getElement()).data('id')){
			marker.remove();
			markers.splice(i,1);
		}
	});
	if(traceGeoJSON.hasOwnProperty('geometry') && firstPoint(traceGeoJSON.geometry)!==null){
		const el = document.createElement('div');
		$(el)
		.attr('title','Drag this marker to a new location')
		.data({'id':traceGeoJSON['@id']})
		.addClass('marker dataFeature movable');
		var marker = new maplibregl.Marker(el)
		.setLngLat(traceGeoJSON.geometry.coordinates)
		.addTo(map);
		markers.push(marker);
		map.getSource('point').setData(traceGeoJSON);
		map.setLayoutProperty('point', 'visibility', 'visible');
	}
	$('#trace').html($('#trace').data('formatter').render());
}

function recordState(){
	$('#history').data('states').push(JSON.stringify(activeDatasetEl.data("data")[activeDataType][filteredIndices[selectedFilter]-1]));
}

function dropPin(){
	recordState();
	const mapCentre = map.getCenter();
	traceGeoJSON = activeDatasetEl.data('data')[activeDataType][filteredIndices[selectedFilter]-1];
	traceGeoJSON.geometry = {"type":"Point","coordinates":[mapCentre.lng,mapCentre.lat],"certainty":"certain"};
	markTrace();	
	alert('Drag the new marker to the desired location.');
}

function undoEdit(){
	if($('#history').data('states').length>0){
		activeDatasetEl.data('data')[activeDataType][filteredIndices[selectedFilter]-1] = JSON.parse($('#history').data('states').pop());
		traceGeoJSON = activeDatasetEl.data('data')[activeDataType][filteredIndices[selectedFilter]-1];
		$('#trace').data('formatter',new JSONFormatter(traceGeoJSON,3,{theme:'light'}));
		markTrace();
	}
	else alert('Nothing to undo');
}

function addLibraryItem(name, label){
	libraryList[name] = label;
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
//			"Adjust Points": function() { // Used to move uncertain points based on the displacement of nearby certain matches
//				var dataset = $('#source').data('data');
//				$.each(dataset.features,function(i,feature){
//					var coordinates = feature.properties.original_coordinates;
//					if (typeof coordinates === 'string' || coordinates instanceof String) {
//						coordinates = JSON.parse(coordinates);
//						feature.properties.original_coordinates = [+coordinates[1],+coordinates[0]];
//					}
//					var coordinates = feature.properties.tps_coordinates;
//					if (typeof coordinates === 'string' || coordinates instanceof String) {
//						coordinates = JSON.parse(coordinates);
//						feature.properties.tps_coordinates = [+coordinates[1],+coordinates[0]];
//					}
//				});
//				var newDB = 'IV_temp';
//				try{
//					indexedDB.deleteDatabase(newDB);
//				}
//				catch{}
//				var open = indexedDB.open(newDB);
//				open.onupgradeneeded = function() {
//					var db = open.result;
//					var dbname = db.createObjectStore("dataname", { keyPath: "name" });
//					var namerequest = dbname.put({'name':newDB});
//					var store = db.createObjectStore('dataset', {autoIncrement: true});
//					store.createIndex('coordinates', ['_longitude','_latitude'], {unique: false});
//					addLibraryItem(newDB, $('#newDatastoreName').val() );
//					// Create new IV index based on IV properties.tps_coordinates
//					$.each(dataset.features,function(i,feature){
//						try{
//							feature._longitude = feature.properties.tps_coordinates[0];
//							feature._latitude = feature.properties.tps_coordinates[1];
//							store.put(feature);
//						}
//						catch{
//							console.log('Failed to store feature.',feature);
//						}
//					});
//				}
//				open.onsuccess = function(){
//					function adjustFeature(i){
//						if(i>dataset.features.length){
//							console.log('Adjustment complete');
//							indexedDB.deleteDatabase(newDB); // Delete IV index
//							return;
//						}
//						feature = dataset.features[i];
//						if(feature.geometry.certainty=='uncertain'){
//							// Find all features within +/- 25km with geometry.certainty=='certain'
//							var db = open.result;
//							var tx = db.transaction('dataset');
//							var index = tx.objectStore('dataset').index('coordinates');
//							var range = 0.01 * 25; //km
//							var lngDiffs = [];
//							var latDiffs = [];
//							select(index, [IDBKeyRange.bound(feature.geometry.coordinates[0]-range, feature.geometry.coordinates[0]+range),IDBKeyRange.bound(feature.geometry.coordinates[1]-range, feature.geometry.coordinates[1]+range)], function(value){
//								if(value.geometry.certainty=='certain'){// Calculate and store in array the shift in lat & lng
//									lngDiffs.push(value.geometry.coordinates[0]-value._longitude);
//									latDiffs.push(value.geometry.coordinates[1]-value._latitude);
//								}
//							}, function(){
//								var foundCount = lngDiffs.length;
//								if(foundCount>=5){ // Sort by size and discard highest and lowest 20%, and apply average of remaining values
//									const average = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
//									lngDiffs = lngDiffs.sort(function(a,b){return a-b;});
//									lngDiffs = lngDiffs.slice(Math.floor(lngDiffs.length*.2),Math.ceil(lngDiffs.length*.8));
//									lngDiffs = average(lngDiffs);
//									feature.geometry.coordinates[0] = +(feature.geometry.coordinates[0]+lngDiffs).toFixed(6);
//									latDiffs = latDiffs.sort(function(a,b){return a-b;});
//									latDiffs = latDiffs.slice(Math.floor(latDiffs.length*.2),Math.ceil(latDiffs.length*.8));
//									latDiffs = average(latDiffs);
//									feature.geometry.coordinates[1] = +(feature.geometry.coordinates[1]+latDiffs).toFixed(6);
//									console.log(i+': ['+lngDiffs+','+latDiffs+'] (average of '+foundCount+' point differences)');
//								}
//								else console.log(i+': Only '+foundCount+' reference points found.');
//								adjustFeature(i+1);
//							});
//						}
//						else adjustFeature(i+1);
//					}
//					adjustFeature(0);
//				}
//				$( this ).dialog( "close" );
//			},
			"Link to Library": function() {
				var libraryType = $('input[name="datastore"]:checked').val();
				var libraryLabel = $('input[name="datastore"]:checked').next('label').text();
				var library = indexedDB.open(libraryType);
				library.onsuccess = function(){
					var db = library.result;
					var tx = db.transaction('dataset');
					var index = tx.objectStore('dataset').index('coordinates');
					
					var mappingSet = false;
					try{
						var lpMappings = APIJSON.filter(obj => {return obj.type === libraryType})[0].lpMappings;
					}
					catch{
						mappingSet = LibraryMappings.filter(obj => {return obj.name === libraryList[libraryType]})[0];
						if(mappingSet==undefined) mappingSet = defaultMappingSet;
						var lpMappings = mappingSet.lpMappings;
					}
					var radius = (mappingSet!=false && mappingSet.hasOwnProperty('radius')) ? mappingSet.radius : 5;
					var citations = (mappingSet!=false && mappingSet.hasOwnProperty('citations')) ? mappingSet.citations : false;
					var textMatch = (mappingSet!=false && mappingSet.hasOwnProperty('textMatch')) ? mappingSet.textMatch : false;
					var maxScore = (mappingSet!=false && mappingSet.hasOwnProperty('maxScore')) ? mappingSet.maxScore : false;
					var autoConfirm = (mappingSet!=false && mappingSet.hasOwnProperty('autoConfirm')) ? mappingSet.autoConfirm : false;
					var maxResults = (mappingSet!=false && mappingSet.hasOwnProperty('maxResults')) ? mappingSet.maxResults : 5;
					var fuse = (mappingSet!=false && mappingSet.hasOwnProperty('fuse') && mappingSet.fuse!=false) ? true : false;
					
					console.log('Library opened!',lpMappings);
					$(".ui-dialog-content").dialog("close");
					
					var items = el.parent('div').data('data').features;
					
					if(testmode) items = items.slice(testslice.page*testslice.length,(testslice.page+1)*testslice.length);
					if(el.find('span.count').length<1) el.append('<span> [Wait: <span class="count">0</span>/'+items.length+']</span>');
					
					var counter = el.find('span.count');
					var rendered = items.length;
					var textMatched = [0,0,0];
					
					function matchLibrary(count){
						counter.html(count+1);
						item = items[count];
//						if(item.geometry.certainty == 'certain'){
//							textMatched[2]++;
//							matchLibrary(count+1);
//							return;
//						}
						function doMapping(newbody){
							lpMappings.forEach(function(mapping){
								for (const mappingType in mapping) {
									try{
										eval('var clone = '+mapping[mappingType]);
										if(!item.hasOwnProperty(mappingType)) item[mappingType] = [];
										item[mappingType].push(clone);
										console.log('Object mapped.',clone);
									}
									catch(err){
										console.log('Failed to map object.',mapping,err);
									}
								}
							});
						}
						var coordinates = item.geometry.coordinates;
						var range = .01*radius;
						var selections = [];
						console.log('Selecting for '+item.properties.title+' (#'+count+') ['+coordinates+']@'+radius+'km -> ['+[+(coordinates[0]-range).toFixed(3), +(coordinates[0]+range).toFixed(3)]+']['+[+(coordinates[1]-range).toFixed(3), +(coordinates[1]+range).toFixed(3)]+']...');
						select(index, [IDBKeyRange.bound(+(coordinates[0]-range).toFixed(3), +(coordinates[0]+range).toFixed(3)),IDBKeyRange.bound(+(coordinates[1]-range).toFixed(3), +(coordinates[1]+range).toFixed(3))], function(newbody){
							eval('selections.push('+(fuse ? 'newbody' : '[newbody,textMatch ? levenshtein(item.properties.title.toLowerCase(),newbody.properties.title.toLowerCase()) : distance(coordinates,[newbody._longitude,newbody._latitude],6)]')+')');
						}, function(){
							if(fuse){
								const options = {
									isCaseSensitive: false,
									includeScore: true,
									shouldSort: true,
									includeMatches: false,
									findAllMatches: false,
									minMatchCharLength: 3,
									// location: 0,
									threshold: 0.5,
									// distance: 100,
									// useExtendedSearch: false,
									ignoreLocation: true,
									// ignoreFieldNorm: false,
									// fieldNormWeight: 1,
									keys: [
										"properties.title"
									]
								};
								const fuse = new Fuse(selections, options);
								const pattern = item.properties.title.replace('-',' '); // Hyphens impact score badly
								var results = fuse.search(pattern); 
								
								selections = results // Already sorted by score, now weight by geographical distance, soundex, and length:
									.slice(0,10)
									.map(a => [a.item,a.score*(.7*(1+distance(coordinates,[a.item._longitude,a.item._latitude])/radius))*(soundex(item.properties.title)==soundex(a.item.properties.title)?.7:1.4)*(Math.abs(item.properties.title.length-a.item.properties.title.length)<4?.7:1.4)])
									.sort((a, b) => a[1] - b[1])
									.slice(0,maxResults)
									.map(a => [a[0],a[1]*maxScore]);
							}
							else{
								var results = selections;
								selections.sort((a, b) => a[1] - b[1]);
								
								try{
									// Filter out links to LaNC Partner URLs
									var partners = ['nationaltrust.org.uk','english-heritage.org.uk','historicenvironment.scot','communities-ni.gov.uk','cadw.gov.wales','nts.org.uk','hrp.org.uk'];
									selections = selections.filter(obj => {	return !partners.includes(obj[0]['@id'].split('//')[1].split('/')[0].replaceAll('www.',''))	});	
								}
								catch{}						
								
								selections = selections.slice(0,maxResults); // Limit to closest results
							}
							if(maxResults==1 && autoConfirm) item.geometry.certainty = 'uncertain';
							
							selections.forEach(function(selection){
								var newbody = selection[0];
								if(maxResults==1 && autoConfirm){
									if(textMatch){
										if(!item.hasOwnProperty('names')) item.names = [];
										if(maxScore!=false && selection[1]<maxScore){
											doMapping(newbody);
											if(selection[1]>0){
												var newToponym = {'toponym':newbody.properties.title};
												if(citations) newToponym.citations = citations;
												item.names.push(newToponym);
											}
											item.geometry.method = 'automatic_match: c.'+distance(coordinates,[newbody._longitude,newbody._latitude])+'km';
											if(selection[1]<2) {
												item.geometry.coordinates = [newbody._longitude,newbody._latitude];
												item.geometry.certainty = 'certain';
												textMatched[0]++;
											}
											else {
												item.geometry.coordinates = [newbody._longitude,newbody._latitude];
												item.geometry.certainty = 'less-certain';
												textMatched[1]++;
											}
											console.log('...'+newbody.properties.title+' selected ('+item.geometry.certainty+') from '+results.length+' matches.',selection);
										}
									}
									else item.geometry.coordinates = [newbody._longitude,newbody._latitude];
								}
								else doMapping(newbody);
							});
							rendered--; // Cannot simply check count because of asynchronicity.
							if(rendered == 0){
								dataset_formatter = new JSONFormatter(el.closest('div.json-formatter').data('data'),1,{theme:'dark'});
								renderJSON(el.closest('div.json-formatter'),dataset_formatter,el.parent('div').data('data'));
								console.log('Library linking complete.',textMatched);
							}
							else matchLibrary(count+1);
						})
					}
					matchLibrary(0);
					
//					items.forEach(function(item,count){
//						counter.html(count+1);
//						var coordinates = item.geometry.coordinates;
//						var range = .01*(radius/2); // Probably need to customise depending on the library in use.
//						var selections = [];
//						select(index, [IDBKeyRange.bound(+(coordinates[0]-range).toFixed(3), +(coordinates[0]+range).toFixed(3)),IDBKeyRange.bound(+(coordinates[1]-range).toFixed(3), +(coordinates[1]+range).toFixed(3))], function(newbody){
//							selections.push([newbody,distance(coordinates,[newbody._longitude,newbody._latitude],6)]);
//						}, function(){
//							selections.sort((a, b) => a[1] - b[1]);
//							selections = selections.slice(0,5); // Limit to 5 closest results
//							selections.forEach(function(selection){
//								var newbody = selection[0];
//								lpMappings.forEach(function(mapping){
//									for (const mappingType in mapping) {
//										try{
//											eval('var clone = '+mapping[mappingType]);
//											if(!item.hasOwnProperty(mappingType)) item[mappingType] = [];
//											item[mappingType].push(clone);
//										}
//										catch(err){
//											console.log('Failed to map object.',mapping,err);
//										}
//									}
//								});
//							});
//							rendered--; // Cannot simply check count because of asynchronicity.
//							if(rendered == 0){
//								dataset_formatter = new JSONFormatter(el.closest('div.json-formatter').data('data'),1,{theme:'dark'});
//								renderJSON(el.closest('div.json-formatter'),dataset_formatter,el.parent('div').data('data'));
//								console.log('Library linking complete.');
//							}
//						})
//					});
				}
			},
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
				libraryList[newDB] = $('#newDatastoreName').val();
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
//								"identifier": findProperty(['url','@id','Hyperlink','HYPERLINK']),
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
function renderJSON(target,object,data,filename=false){
	target
		.data({'data':data,'formatter':object,'filename':filename})
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
		csvButton.button().click(function(){downloadCSV($(this).parent('div').data('data'),$(this).parent('div').data('filename'));});
//		mapButton deprecated because visualisation was crude and can be achieved with the Link/Georeference button		
//		var mapButton = $('<button class="mapButton" title="Visualise dataset on a map">Map</button>').prependTo(target); 
//		mapButton.button().click(function(){drawMap($(this));});
		$('<button id="WDLP" class="APIButton" title="Link Wikidata settlements within '+radius+'km, based on best text match (Levenshtein distance algorithm).">WD</button>')
		.prependTo(target)
		.button()
		.click(function(){WDLP($(this));});
		$('<button id="GG" class="APIButton" title="Find Geograph images within '+radius+'km, based on text.">GG</button>')
		.prependTo(target)
		.button()
		.click(function(){GGLP($(this));});
		$('<button id="WP" class="APIButton" title="Find Wikipedia articles within '+radius+'km, filtered by text.">WP</button>')
		.prependTo(target)
		.button()
		.click(function(){WPLP($(this));});
		$('<button id="PASLP" class="APIButton" title="Find PAS items within '+radius+'km.">PAS</button>')
		.prependTo(target)
		.button()
		.click(function(){PASLP($(this));});
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
		markers=[];
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
	try{
		
	}
	catch{
		
	}
	var bounds = false;
	for (const feature of geoJSON.features) {
		if(!feature.hasOwnProperty('geometry') || firstPoint(feature.geometry)==null) continue;
		if(!bounds){
			bounds = new maplibregl.LngLatBounds(firstPoint(feature.geometry),firstPoint(feature.geometry));
		}
		else{
			bounds.extend(feature.geometry.coordinates);
		}
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
			var marker = new maplibregl.Marker(el)
				.setLngLat(feature.geometry.coordinates)
				.setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(
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
			var marker = new maplibregl.Marker(el)
			.setLngLat(feature.geometry.coordinates)
			.addTo(map);			
		}
		markers.push(marker);
	}
	if(render) {
		if(!bounds){
			bounds = new maplibregl.LngLatBounds([-180,-85],[180,85]);
		}
		showMap(true,bounds);
	}
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
		var marker = new maplibregl.Marker(el)
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
			var tolerance = result.hasOwnProperty('radius')?result.radius:radius // km beyond bounds
			tolerance = {'lng':tolerance/66,'lat':tolerance/111}; // convert to degrees
			$.ajax({url:eval(result.url),headers:result.headers,data:{query:(result.hasOwnProperty('query') ? eval(result.query) : '')}})
			.then(function(data){
				
				if(result.type=='J'){ // OSM Roads: draw lines and mark intersections
					var nodes = data.elements.filter(obj => {return obj.type === 'node'});
					var ways = data.elements.filter(obj => {return obj.type === 'way'});
					var roads = {'type':'Feature','geometry':{'type':'MultiLineString','coordinates':[]}};
					var waynodes = [];
					var junctions = [];
					data.junctions = [];
					ways.forEach(function(way){
						roads.geometry.coordinates.push([]);
						way.nodes.forEach(function(node){
							var node_properties = nodes.filter(obj => {return obj.id === node})[0];
							roads.geometry.coordinates[roads.geometry.coordinates.length-1].push([node_properties.lon,node_properties.lat]);
						});
						var node = way.nodes.shift();
						if (!junctions.includes(node)){junctions.push(node);}
						var node = way.nodes.pop();
						if (!junctions.includes(node)){junctions.push(node);}
						way.nodes.forEach(function(node){
							if (waynodes.includes(node) && !junctions.includes(node)){
								junctions.push(node);
							}
							else waynodes.push(node);
						});
					});
					junctions.forEach(function(node){
						data.junctions.push(nodes.filter(obj => {return obj.id === node})[0]);
					});
					if(typeof map.getSource('roads')=='undefined'){
						console.log('Adding OSM roads.');
						map.addSource('roads', {'type': 'geojson','data': roads});
						map.addLayer({
							'id': 'road_lines',
							'type': 'line',
							'source': 'roads',
							'layout': {},
							'paint': {
								'line-color': '#0F0',
								'line-opacity': 0.7,
								'line-width': 2
							}
						});
					}
					else {
						map.getSource('roads').setData({
							"type": "FeatureCollection",
							"features": [roads]
						});
					}
				}
				
				$.each(eval('data.'+result.datakey), function(i,feature){
					console.log(i,feature,result.coordinates);
					linkMarker(feature,result.type,colour,eval(result.coordinates),false,eval(result.name));
				});
			});
		}
		catch(err) {// Assume GeoData Library
			console.log('API failed, so GeoData Library assumed.',err);
			var open = indexedDB.open(type);
			open.onsuccess = function(){
				var db = open.result;
				var tx = db.transaction('dataset');
				var index = tx.objectStore('dataset').index('coordinates');
				
				var mappingSet = LibraryMappings.filter(obj => {return obj.name === libraryList[type]})[0];
				if(mappingSet==undefined) mappingSet = defaultMappingSet;
				
				console.log(libraryList,type,mappingSet);
				var popupRule = mappingSet.popup;
				
				if(mappingSet.hasOwnProperty('radius')) radius = mappingSet.radius;
				var fuse = (mappingSet.hasOwnProperty('fuse') && mappingSet.fuse!=false) ? true : false;
				var range = .01*(radius);
				var selections = [];
				select(index, [IDBKeyRange.bound(+(mapCentre.lng-range).toFixed(3), +(mapCentre.lng+range).toFixed(3)),IDBKeyRange.bound(+(mapCentre.lat-range).toFixed(3), +(mapCentre.lat+range).toFixed(3))], function(newbody){
					eval('selections.push('+(fuse ? 'newbody' : '[newbody,distance([mapCentre.lng,mapCentre.lat],[newbody._longitude,newbody._latitude],6)]')+')');
				}, function(){
					if(fuse){
						console.log('Starting fuse search',traceGeoJSON.properties.title,selections);
						const options = {
							isCaseSensitive: false,
							includeScore: true,
							shouldSort: true,
							includeMatches: false,
							findAllMatches: false,
							minMatchCharLength: 3,
							// location: 0,
							threshold: 0.5,
							// distance: 100,
							// useExtendedSearch: false,
							ignoreLocation: true,
							// ignoreFieldNorm: false,
							// fieldNormWeight: 1,
							keys: [
								"properties.title"
							]
						};
						const fuse = new Fuse(selections, options);
						const pattern = traceGeoJSON.properties.title;
						results = fuse.search(pattern);
						console.log(results);
						selections = results.map(a => [a.item]).slice(0,10); // Limit to 250 closest results;
					}
					else{
						selections.sort((a, b) => a[1] - b[1]);
						selections = selections.slice(0,250); // Limit to 250 closest results
					}
					selections.forEach(function(selection){
						var newbody = selection[0];
						var coordinates = [newbody._longitude,newbody._latitude];
						linkMarker(newbody,type,colour,coordinates,$(layer).siblings('label').text(),eval(popupRule));
					});
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

function updateFacetMarkers(){
	if (!facet==false){
		facetmarkers.forEach(function(marker){marker.remove()});
		facetmarkers=[];
		activeDatasetEl.data('data')[activeDataType].forEach(function(feature){
			if(eval('feature'+facet+'==traceGeoJSON'+facet) && feature['@id']!==traceGeoJSON['@id']){
				const el = document.createElement('div');
				$(el)
					.data({
						'id':feature['@id'],
						'coordinates':feature.geometry.coordinates,
						'popup':feature.properties.title+' (click to jump here)'
					})
					.css({'background-color': 'rgba(0,255,0,0.45)', 'color': 'white'});
				el.className = 'linkmarker dataFeature facetmarker';
				var marker = new maplibregl.Marker(el)
					.setLngLat(feature.geometry.coordinates)
					.addTo(map);
				facetmarkers.push(marker);
			}
		});
	}
}

function updateTrace(dataset=activeDatasetEl.data('data')[activeDataType]){
	$('#history').data('states',[]);
	removeLinkMarkers();
	var index = $('#index').val()-1;
	traceGeoJSON = dataset[index];
	map.getSource('point').setData(traceGeoJSON);
	var addBounds=false;
	if(!traceGeoJSON.hasOwnProperty('geometry') || firstPoint(traceGeoJSON.geometry)==null){
		addBounds=true;
		map.setLayoutProperty('point', 'visibility', 'none');
	}
	else{
		bounds = new maplibregl.LngLatBounds(traceGeoJSON.geometry.coordinates,traceGeoJSON.geometry.coordinates);
		map.setLayoutProperty('point', 'visibility', 'visible');
	}
	$('.marker.movable').removeClass('movable').attr('title', 'Click to examine this data point');
	$.each(markers, function(i,marker){
		if(traceGeoJSON['@id'] == $(marker.getElement()).data('id')){
			$(marker.getElement()).addClass('movable').attr('title', 'Drag this marker to a new location');
		}
		if(addBounds) bounds.extend(marker.getLngLat());
	});	
	
	if($('#typeList').length>0 && dataset[index].hasOwnProperty('properties') && dataset[index].properties.hasOwnProperty('type')){
		var labels = dataset[index].properties.type.split('/');
		var unmatched = [];
		labels.forEach(function(label,j){
			var matched = false;
			$.each($('#typeList input'), function(i,type){
				if (label.toLowerCase() == $(type).labels().text()) {
					$(type).prop('checked',true).trigger('change'); // Adds item to types list
					matched = true;
				}
			});
			if(!matched) unmatched.push(label);
		});
		if(unmatched.length>0){
			dataset[index].properties.type = unmatched.join('/');
		}
		else {
			delete dataset[index].properties.type;
		}
	}
	if(dataset[index].hasOwnProperty('types')){
		var typesArray = dataset[index].types;
		$.each($('#typeList input'), function(i,type){
			var exists = typesArray.findIndex(({ identifier }) => identifier === $(type).val());
			$(type).prop('checked', exists>-1);
		});
	}
	else $('#typeList input').prop('checked', false);
	
	$('#trace').data('formatter',new JSONFormatter(dataset[index],3,{theme:'light'}));
	$('#trace').html($('#trace').data('formatter').render()).addClass('json-formatter');
	if(!("bounds" in window)){
		bounds = new maplibregl.LngLatBounds([-180,-85],[180,85]);
	}
	showMap(true, bounds);
	if(!addBounds) updateLinkMarkers();
	updateFacetMarkers();
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
		if ((JSON.stringify(feature).toUpperCase()).indexOf(filter)>-1) filteredIndices.push(i+1);
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
	
	// UPGRADE TO USE PERSISTENT LOCAL STORAGE AND SHOW REDUCED SET OF MAP MARKERS
	// Add dataset to local library with standard name
	// Add and update markers only when map view is either initialised or changed
	// If mapView marker count > 250 show only those closest to centre
	// Update library when dataset is changed
	
	activeDatasetEl = el.parent('div');
	activeDataType = activeDatasetEl.data('data').hasOwnProperty('features') ? 'features' : 'traces';
	
	if(activeDatasetEl.data('data')[activeDataType].length<=5000) drawMap(el,false); // Map becomes unresponsive with large number of markers
	
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
		.append(new Array(10).join('<button></button>'))
		.find('button')
		.eq(0).button({icon:"ui-icon-seek-first",showlabel:false}).prop('title','First (filtered) item').click(function(){selectedFilter=0;$('#index').change()}).end()
		.eq(1).button({icon:"ui-icon-seek-prev",showlabel:false}).prop('title','Previous (filtered) item').click(function(){selectedFilter=Math.max(0,selectedFilter-1);$('#index').change()}).end()
		.eq(2).button({icon:"ui-icon-seek-next",showlabel:false}).prop('title','Next (filtered) item').click(function(){selectedFilter=Math.min(filteredIndices.length-1,selectedFilter+1);$('#index').change()}).end()
		.eq(3).button({icon:"ui-icon-seek-end",showlabel:false}).prop('title','Last (filtered) item').click(function(){selectedFilter=filteredIndices.length-1;$('#index').change();}).end()
		.eq(1).after($('<input id="index" />')
			.val(1)
			.button()
			.keyup(function(){
				$('#filter').val(''); // Clear filter
				updateFilter();
				selectedFilter = $('#index').val()-1;
			})
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
		.eq(4).button({icon:"ui-icon-arrowreturnthick-1-w",showlabel:false}).prop({'title':'Undo last edit','id':'history'}).click(function(){undoEdit();}).data({'states':[]}).end()
		.eq(5).button({icon:"ui-icon-pin-s",showlabel:false}).prop('title','Drop pin on map').click(function(){dropPin();}).end()
		.eq(6).button({icon:"ui-icon-image",showlabel:false}).prop('title','Fetch IIIF image fragments').click(function(){alert('Not yet implemented')}).end()
		.eq(7).button({icon:"ui-icon-circle-arrow-s",showlabel:false}).prop('title','Download/Save edited dataset').click(function(){download(activeDatasetEl.data('data'));}).end()
		.eq(8).button({icon:"ui-icon-trash",showlabel:false}).prop({'title':'Delete this item','id':'delete'}).click(function(){
			if (confirm('Delete this item?')){
				markers.forEach(function(marker,i){
					if(activeDatasetEl.data('data')[activeDataType][filteredIndices[selectedFilter]-1]['@id'] == $(marker.getElement()).data('id')){
						marker.remove();
						markers.splice(i,1);
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
		.slice(-5).insertAfter($('#navigation')).wrapAll('<div id="edit"/>');
		$('#typeLibrary-button').appendTo($('#edit'));
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
	if(el.find('span.count').length<1) el.append('<span> [Wait: <span class="count">0</span>/'+traces.length+']</span>');
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
					"identifier": data.results.bindings[indexMin].place.value,
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
	if(testmode) items = items.slice(testslice.page*testslice.length,(testslice.page+1)*testslice.length);

	if(el.find('span.count').length<1) el.append('<span> [Wait: <span class="count">0</span>/'+items.length+']</span>');
	var counter = el.find('span.count');
	function matchItem(i){
		counter.html(i+1);
		if(items[i].hasOwnProperty('names') && items[i].names[items[i].names.length-1].hasOwnProperty('citations') && items[i].names[items[i].names.length-1].citations[0].label=='Wikidata'){ // Used when retrying after failed attempt to populate dataset
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
//				items[i].types.push({'identifier':'aat:300008375','label':'town'});
//				items[i].types.push({'identifier':'wd:Q486972','label':'human settlement'});
				
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

//Find Geograph images based on text and location
function GGLP(el){
	var items = el.parent('div').data('data').features,
		itemIndex = 0,
		retryAfter = 0,
		settings = {
			beforeSend: function(jqXHR) {
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
					retryAfter = 30; // 
					console.log('Over limit attempting #'+jqXHR.i+', waiting '+retryAfter+' seconds.');
					retryAfter = parseInt(retryAfter)*1000; // convert to milliseconds
					clearTimeout(timeout);
					timeout = setTimeout(function(){retryAfter=0},retryAfter);
					setTimeout(matchItem(jqXHR.i),retryAfter);
				}
			},
			headers: { 
				'Accept': 'application/json'
			}
	    };
	if(testmode) items = items.slice(testslice.page*testslice.length,(testslice.page+1)*testslice.length);

//	$.ajaxSetup({'async':'false'});
//	settings.data = { i: 0 };
//	items.forEach(function(item,j){
//		if (item.hasOwnProperty('depictions')){
//			item.depictions.forEach(function(depiction,i){
//				if(depiction['@id'].indexOf('geograph.org.uk/geophotos')>0){
//					var rx = /\[(.*)\]$/g;
//					var arr = rx.exec(depiction.title);
//					depiction.accreditation = arr[1];
//					depiction.title = depiction.title.replace(' ['+arr[1]+']',''); 
//				}
//			});
////			item.depictions.forEach(function(depiction,i){
////				if(depiction['@id'].startsWith('https://www.geograph.org.uk/')){
////					settings.url = 'https://api.geograph.org.uk/api/photo/'+depiction['@id'].split('/').pop()+'/c743e78c04?output=json';
////					$.ajax(settings)
////						.done(function(data){
////							depiction['@id'] = data.imgserver+data.image;
////							depiction.title = [];
////							if(data.hasOwnProperty('comment')) depiction.title.push(data.comment.replace('/r','').replace('/n',' '));
////							depiction.title.push('[� '+data.realname+']');
////							depiction.title = depiction.title.join(' ');
////							console.log("Done "+j);
////						});
////				}
////			});
//		}
//	});
//	$.ajaxSetup({'async':'true'});
	
	if(el.find('span.count').length<1) el.append('<span> [Wait: <span class="count">0</span>/'+items.length+']</span>');
	var counter = el.find('span.count');
	function matchItem(i){
		counter.html(i+1);
		if(items[i].hasOwnProperty('links') && items[i].links[items[i].links.length-1].hasOwnProperty('identifier') && items[i].links[items[i].links.length-1].identifier.startsWith('https://www.geograph.org.uk/')){ // Used when retrying after failed attempt to populate dataset
			itemIndex++;
			setTimeout(matchItem(itemIndex),retryAfter);
			return;
		}
		settings.data = { i: i };
		settings.url = 'https://api.geograph.org.uk/syndicator.php?key=c743e78c04&format=JSON&location='+items[i].geometry.coordinates[1]+','+items[i].geometry.coordinates[0]+'&distance='+radius+'&perpage=10&text='+encodeURIComponent(items[i].properties.title);
		$.ajax(settings)
			.done(function(data){
				activeAjaxConnections--;
								
				data.items.forEach(function(geograph){
					if(!items[i].hasOwnProperty('links')) items[i].links = [];
					items[i].links.push({'type':'primaryTopicOf','identifier':geograph.link,'label':geograph.title,'types':[{'label':'Geograph','identifier':'wd:Q17301324'},{'label':'photograph','identifier':'wd:Q125191'}]});
					if(!items[i].hasOwnProperty('depictions')) items[i].depictions = [];
					items[i].depictions.push({'@id':geograph.thumb.replace('_120x120',''),'title':geograph.title,'accreditation':'© '+geograph.author,'thumbnail':geograph.thumb,'license':geograph.licence});
				});
				
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

//Find Wikipedia articles based on text and location
function WPLP(el){
	var items = el.parent('div').data('data').features,
		itemIndex = 0,
		retryAfter = 0,
		settings = {
			beforeSend: function(jqXHR) {
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
					retryAfter = 30; // 
					console.log('Over limit attempting #'+jqXHR.i+', waiting '+retryAfter+' seconds.');
					retryAfter = parseInt(retryAfter)*1000; // convert to milliseconds
					clearTimeout(timeout);
					timeout = setTimeout(function(){retryAfter=0},retryAfter);
					setTimeout(matchItem(jqXHR.i),retryAfter);
				}
			},
			headers: { 
				'Accept': 'application/json'
			}
	    };
	if(testmode) items = items.slice(testslice.page*testslice.length,(testslice.page+1)*testslice.length);
	if(el.find('span.count').length<1) el.append('<span> [Wait: <span class="count">0</span>/'+items.length+']</span>');
	var counter = el.find('span.count');
	function matchItem(i){
		counter.html(i+1);
		if(items[i].hasOwnProperty('links') && items[i].links[items[i].links.length-1].hasOwnProperty('identifier') && items[i].links[items[i].links.length-1].identifier.startsWith('https://en.wikipedia.org/')){ // Used when retrying after failed attempt to populate dataset
			itemIndex++;
			setTimeout(matchItem(itemIndex),retryAfter);
			return;
		}
		settings.data = { i: i };
		settings.url = 'https://secure.geonames.org/wikipediaSearchJSON?username='+geoNamesID+'&maxRows=10&countryCode=GB&q='+encodeURIComponent(items[i].properties.title);
		$.ajax(settings)
			.done(function(data){
				activeAjaxConnections--;
				
				// Sort by text similarity and reject >radius
				var sorted = [];
				data.geonames.forEach(function(geoname,j){
					if (distance(items[i].geometry.coordinates,[geoname.lng,geoname.lat]) < radius) sorted.push([levenshtein(geoname.title.toUpperCase(),items[i].properties.title.toUpperCase()),j]);
				});
				sorted.sort((a, b) => a[0] > b[0])
				
				sorted.forEach(function(geoname){
					if(!items[i].hasOwnProperty('links')) items[i].links = [];
					items[i].links.push({'type':'primaryTopicOf','identifier':data.geonames[geoname[1]].wikipediaUrl,'label':data.geonames[geoname[1]].title,'types':[{'label':'Wikipedia article page','identifier':'wd:Q50081413'}]});
					if(!items[i].hasOwnProperty('descriptions')) items[i].descriptions = [];
					items[i].descriptions.push({'@id':'https://'+data.geonames[geoname[1]].wikipediaUrl,'value':data.geonames[geoname[1]].summary,'lang':'en'});
				});
				
				itemIndex++;
				if(itemIndex<items.length){
					setTimeout(matchItem(itemIndex),retryAfter);
				}
				else if(0 == activeAjaxConnections){
					dataset_formatter = new JSONFormatter(el.parent('div').data('data'),1,{theme:'dark'});
					renderJSON(el.parent('div'),dataset_formatter,el.parent('div').data('data'));
					console.log('API requests completed.');
				}
				else console.log('Unexpected end.',activeAjaxConnections);
			});
	}
	matchItem(itemIndex);
}

//Find PAS items based on location
function PASLP(el){
	var items = el.parent('div').data('data').features,
		itemIndex = 0,
		retryAfter = 0,
		settings = {
			beforeSend: function(jqXHR) {
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
					retryAfter = 30; // 
					console.log('Over limit attempting #'+jqXHR.i+', waiting '+retryAfter+' seconds.');
					retryAfter = parseInt(retryAfter)*1000; // convert to milliseconds
					clearTimeout(timeout);
					timeout = setTimeout(function(){retryAfter=0},retryAfter);
					setTimeout(matchItem(jqXHR.i),retryAfter);
				}
			},
			headers: { 
				'Accept': 'application/json'
			}
	    };
	if(testmode) items = items.slice(testslice.page*testslice.length,(testslice.page+1)*testslice.length);
	if(el.find('span.count').length<1) el.append('<span> [Wait: <span class="count">0</span>/'+items.length+']</span>');
	var counter = el.find('span.count');
	function matchItem(i){
		counter.html(i+1);
		if(items[i].hasOwnProperty('links') && items[i].links[items[i].links.length-1].hasOwnProperty('identifier') && items[i].links[items[i].links.length-1].identifier.startsWith('https://finds.org.uk/')){ // Used when retrying after failed attempt to populate dataset
			itemIndex++;
			setTimeout(matchItem(itemIndex),retryAfter);
			return;
		}
		settings.data = { i: i };
		settings.url = 'https://finds.org.uk/database/search/results/lat/'+items[i].geometry.coordinates[1]+'/lon/'+items[i].geometry.coordinates[0]+'/d/'+radius+'/format/geojson/page/1';
		$.ajax(settings)
			.done(function(data){
				activeAjaxConnections--;
				
				data.features.forEach(function(feature){
					if(!items[i].hasOwnProperty('links')) items[i].links = [];
					items[i].links.push({'type':'seeAlso','identifier':feature.properties.url,'label':feature.properties.description,'types':[{'label':'archaeological artifact','identifier':'wd:Q220659'}]});
				});
				
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

//Query API // DEFUNCT - written for LT, not LPF
//This function should be genericised using JSONata and an API-configurations file, to allow simple addition of further API endpoints.
function addAPIdata(el){
	var dataset = el.parent('div').data('data');
	dataset.traces = dataset.traces.slice(0,5); // API limits concurrent(?) requests *** TO BE ADDRESSED
	var count = 0;
	if(el.find('span.count').length<1) el.append('<span> [Wait: <span class="count">'+count+'</span>/'+dataset.traces.length+']</span>');
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
								"identifier": data.results.bindings[indexMin].place.value,
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
	
	map = new maplibregl.Map({
	    container: 'map',
	    style: './js/maplibre-config.json'
	});	
	map.on('load', () => {
		console.log('Map loading...');
		map.addControl(new maplibregl.NavigationControl())
		.on('idle',function(){ map.resize(); })
		.addSource('point', {
			'type': 'geojson',
			'data': traceGeoJSON
		})
		.addLayer({
			'id': 'point',
			'type': 'circle',
			'source': 'point',
			'paint': {
				'circle-radius': 12,
				'circle-color': '#FF0000', // red color
				'circle-opacity': 0.7,
				'circle-stroke-color': '#FFFF00', // yellow outline
				'circle-stroke-width': 2
			}
		})
		.on('mouseenter', 'point', () => {
			map.setPaintProperty('point', 'circle-opacity', 0.4);
			canvas.style.cursor = 'move';
		})
		.on('mouseleave', 'point', () => {
			map.setPaintProperty('point', 'circle-opacity', 0.7);
			canvas.style.cursor = '';
		})
		.on('mousedown', 'point', (e) => {
			recordState();
			e.preventDefault();
			canvas.style.cursor = 'grab';
			map.on('mousemove', onMove);
			map.once('mouseup', onUp);
		})
		.on('touchstart', 'point', (e) => {
			if (e.points.length !== 1) return;
			e.preventDefault();
			map.on('touchmove', onMove);
			map.once('touchend', onUp);
		});
		$('<button>', { // Add close button to map controls
		    class: 'mapboxgl-ctrl-close-map',
		    title: 'Close map'
		})
			.button()
			.click(function(){showMap(false);})
			.prependTo('div.maplibregl-ctrl-top-right div.maplibregl-ctrl-group')
			.append('<span class="mapboxgl-ctrl-icon"></span>');
		$('.maplibregl-ctrl-top-right')
			.prepend($('.logo:first').clone())
			.append($('#geocodeWrapper').addClass('maplibregl-ctrl').on('keyup',function(){geocode();}).button())
			.append($('#layerSelector').addClass('maplibregl-ctrl').button());
		console.log('Map loaded.',map);
	});
	
	// Check browser file upload capability
	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser.');
        return;
    }
	
	// Ensure that map covers other window content
	$(window).resize(function () {
		map.resize();
	}).resize();
	
	$('#layerSelector').on('click','label',function(e){
		var checkbox = $(e.target).prev('input');
		checkbox.prop('checked',!checkbox.prop('checked'));
	});
	$('#layerSelector').on('click','.layer',function(e){
		updateLinkMarkers($(e.target.closest('.layer')))
	});
	linkMarkerPopup = new maplibregl.Popup({
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
		.on('click','.linkmarker:not(.dataFeature)',function(e){
			if(activeDataType=='features'){
				var newbody = $(e.target).data('newbody');
				console.log($(e.target).data());
				
				$('<div></div>').appendTo('body')
				.html('<div><h6 style="margin: 8px 0 0 0">'+activeDatasetEl.data('data').features[filteredIndices[selectedFilter]-1].properties.title+' > '+$(e.target).data('popup')+'</h6></div>')
			    .dialog({
			    	modal: true,
			    	title: 'Link Data Point?',
				    zIndex: 10000,
				    autoOpen: true,
				    width: 'auto',
				    resizable: false,
				    buttons: [
				    	{
				    		text: 'Link and Move',
				    		click: function(){
				    			recordState();
//				    			activeDatasetEl.data('data').features[filteredIndices[selectedFilter]-1].geometry.coordinates = [+$(e.target).data('coordinates')[0],+$(e.target).data('coordinates')[1]];
				    			traceGeoJSON.geometry.coordinates = [+$(e.target).data('coordinates')[0],+$(e.target).data('coordinates')[1]];
				    			traceGeoJSON.geometry.certainty='certain';
				    			map.getSource('point').setData(traceGeoJSON);
				    			$('#trace').html($('#trace').data('formatter').render());
			    				$.each(markers, function(i,marker){
			    					if(traceGeoJSON['@id'] == $(marker.getElement()).data('id')){
			    						marker.setLngLat(traceGeoJSON.geometry.coordinates)
			    					}
			    				});
				    			$('#linkButton').click();
				    		}
				    	},
				    	{
				    		text: 'Link Only',
				    		id: 'linkButton',
				    		click: function(){
				    			recordState();
				    			var selectedItem = activeDatasetEl.data('data').features[filteredIndices[selectedFilter]-1];
				    			
								var mappingSet;
								try{
									var lpMappings = APIJSON.filter(obj => {return obj.type === $(e.target).data('type')})[0].lpMappings;
								}
								catch{
									if(libraryList.hasOwnProperty($(e.target).data('type'))){
										mappingSet = LibraryMappings.filter(obj => {return obj.name === libraryList[$(e.target).data('type')]})[0];
									}
									if(mappingSet==undefined) mappingSet = defaultMappingSet;
									var lpMappings = mappingSet.lpMappings;
								}
								
								lpMappings.forEach(function(mapping){
									
									for (const mappingType in mapping) {
										try{
											eval('var clone = '+mapping[mappingType]);
											if(!selectedItem.hasOwnProperty(mappingType)) selectedItem[mappingType] = [];
											selectedItem[mappingType].push(clone);
										}
										catch(err){
											console.log('Failed to map object.',mapping,err);
										}
									}
								});
								$('#trace').html($('#trace').data('formatter').render());
								$(this).dialog("close");
				    		}
				    	},
				    	{
				    		text: 'Cancel',
				    		click: function(){
				    			$(this).dialog("close");
				    		}
				    	}
				    ],
				    close: function(event, ui) {
				        $(this).remove();
				    }
			    });
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
	
	function checkValidGeometry(){ // Remove marker if invalid
		if($('#trace').length>0 && (!activeDatasetEl.data('data')[activeDataType][filteredIndices[selectedFilter]-1].hasOwnProperty('geometry') || firstPoint(activeDatasetEl.data('data')[activeDataType][filteredIndices[selectedFilter]-1].geometry)==null)) { 
			markers.forEach(function(marker,i){
				if(activeDatasetEl.data('data')[activeDataType][filteredIndices[selectedFilter]-1]['@id'] == $(marker.getElement()).data('id')){
					marker.remove();
					markers.splice(i,1);
					map.setLayoutProperty('point', 'visibility', 'none');
					delete activeDatasetEl.data('data')[activeDataType][filteredIndices[selectedFilter]-1].geometry;
					alert('The geometry for this feature is now invalid. Please use the [Drop Pin] button to select a new point on the map.');
				}
			});
		}
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
		try{
			recordState();
		}
		catch{
			// Edit history not implemented for base properties
		}
		var value = $(e.target).siblings('input').val();
		value = isNumber(value) ? value : '"'+value+'"';
		var keys = $(e.target).parentsUntil('.json-formatter','.json-formatter-row').map(function(){
			return $(this).find('.json-formatter-key:first').text().slice(0,-1);
		}).get().slice(0,-1).reverse();
		eval(($('#trace').length>0?'activeDatasetEl.data("data")[activeDataType][filteredIndices[selectedFilter]-1]':'$(e.target).closest(".json-formatter").data("data")')+'["'+keys.join('"]["')+'"] = '+value);
		checkValidGeometry();
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
		try{
			recordState();
		}
		catch{
			// Edit history not implemented for base properties
		}
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
		checkValidGeometry();
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
		traceGeoJSON.geometry.certainty = 'certain';
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
	
	// Apply jquery-ui styling
	$('#choose_input').selectmenu().on('selectmenuchange',function () {
		$('#choose_input-button').removeClass('throb');
		$('#inputs').removeClass().addClass($('#choose_input option:selected').val());
	});
	$('#conversions').append('<button id="assign" onclick="assign();" title="Assign CSV columns to Linked Places Format properties.">Assign CSV Columns</button>');
// These lines for functionality now deprecated:	
//	$('#expression')
//	.after('<button onclick="convert();" title="Convert uploaded dataset using chosen type">Convert</button>')
//	.after('<button onclick="$(\'#datafields\').text(fields);$(\'#modal\').dialog(\'open\')"  title="Paste new JSONata expression to be used for this conversion type">Edit JSONata</button>')
//	.after('<button onclick="download(mappings,\'mappings.json\');" title="Download all conversion definitions to local filesystem">Download mappings.json</button>')
//	;
	$('button,input:file').button();
	$('#choose_input-button,#assign').addClass('throb');
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
	
	// Populate Types drop-down list
	$.getJSON('https://api.github.com/repos/docuracy/Locolligo/git/trees/main?recursive=1&nocache='+Date.now(),function(data){
		var options = [];
		$.each(data.tree,function(i,pathobj){
			if(pathobj.path.startsWith('types/')){
				options.push('<option value="'+pathobj.url+'">'+pathobj.path.replace('types/','').replace('.csv','')+'</option>');
			}
		});
		$('#typeLibrary')
			.append(options.join(''))
	    	.selectmenu().on('selectmenuchange',function () {
				$('body').loadingModal({text: 'Processing...'});
				$.ajax({
				    url: $('#typeLibrary option:selected').val(),
				    headers: {'accept': 'application/vnd.github.VERSION.raw'},
				    success: function(data){
						var parse = (confirm('Parse ALL dataset titles?'));
				    	types = Papa.parse(data,{header:true,dynamicTyping:true,skipEmptyLines:true}).data;
				    	var typeList = [];
				    	types.forEach(function(type,i){
				    		typeList.push('<input type="checkbox" name="types" id="type_'+i+'" value="'+type.identifier+'"><label for="type_'+i+'">'+type.label+'</label>');
				    		if(parse){
				    			typeTest = type.label.split(' ').shift();
				    			activeDatasetEl.data('data')[activeDataType].forEach(function(feature,j){
				    				if((feature.types.length<=1 || feature.hasOwnProperty('_parse')) && (feature.properties.title+feature.properties.url).toUpperCase().includes(typeTest.toUpperCase())){
				    					feature._parse = true;
				    					feature.types.push({'identifier':type.identifier,'label':type.label});
				    				}
				    			});
				    		}
				    	});
				    	if(parse){
				    		activeDatasetEl.data('data')[activeDataType].forEach(function(feature){
				    			delete feature._parse;
				    		});
				    	}
				    	$('#typeList').remove();
				    	$('#trace').before('<div id="typeList">'+typeList.join('<br>')+'</div>');
				    	updateTrace();
				    },
				    complete: function(){
				    	$('body').loadingModal('destroy');
				    }
				});
		});
		$('body')
		.on('change','#typeList input',function(e){
			recordState();
			if(!activeDatasetEl.data("data")[activeDataType][filteredIndices[selectedFilter]-1].hasOwnProperty('types')) activeDatasetEl.data("data")[activeDataType][filteredIndices[selectedFilter]-1].types = [];
			var typesArray = activeDatasetEl.data("data")[activeDataType][filteredIndices[selectedFilter]-1].types;
			var exists = typesArray.findIndex(({ identifier }) => identifier === $(e.target).val());
			if($(e.target).is(':checked') && exists==-1){
				typesArray.push({'identifier':$(e.target).val(),'label':$(e.target).labels().text()});
			}
			else if(exists>-1){
				typesArray.splice(exists,1);
			}
			if (typesArray.length==0) delete activeDatasetEl.data("data")[activeDataType][filteredIndices[selectedFilter]-1].types;
			$('#trace').html($('#trace').data('formatter').render());
		});
	});
	
	// Fetch default schema.org indexing template
	$.get('./templates/indexing.json?'+Date.now(), function(data) { // Do not use any cached file
		indexing = data;
	},'json');
	
//	// Fetch NT Collections data
//	$.get('./vocabularies/NT-Collections.json?'+Date.now(), function(data) { // Do not use any cached file
//		NTCollections = data.data;
//		console.log('NTCollections',NTCollections);
//	},'json');
	
	// Populate JSONata expressions drop-down list
	$.get('./templates/mappings.json?'+Date.now(), function(data) { // Do not use any cached file
		mappings = data;
		$.each(data, function(key,value) {
			$('#expression').append('<option value="'+key+'">'+value.description+'</option>');
		});
		$('select#expression').selectmenu().on('selectmenuchange',function () {console.log(mappings[$('#expression option:selected').val()].expression)});
	},'json');
	
	// Load LibraryMappings
	$.get('./templates/libraryMappings.json?'+Date.now(), function(data) { // Do not use any cached file
		LibraryMappings = data;
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
		$('#assign').hide();
    	if(delimited.includes(fileExtension)){ // Delimited text input
    		$('#assign').show();
    		if(fileparts.length>1 && ['lp','lt'].includes(fileparts.pop().trim())){ // Convert to Linked Places format (geoJSON-T)
    			
    			if(filename=='VCH-Places.lp.csv'){ //  Load Vocabulary
    				var VCHVocabulary = {'terms':[]};
    				$.ajaxSetup({async:false});
    				$.get('./vocabularies/VCH-terms.json?'+Date.now(), function(data) { // Do not use any cached file
    					data.data.forEach(function(term){
    						VCHVocabulary.terms[term['VCH-term']] = term;
    					});
					},'json');
    				$.ajaxSetup({async:true});
    			}
    			
    			if(filename=='PAS_Warwickshire_v2.lt.csv'){ //  Load Vocabularies
    				var PASMoDVocabulary = {'terms':[]};
    				$.ajaxSetup({async:false});
    				$.get('./vocabularies/PAS-MoDs.json?'+Date.now(), function(data) { // Do not use any cached file
    					data.forEach(function(term){
    						PASMoDVocabulary.terms[term.itemLabel] = term.item;
    					});
					},'json');
    				$.ajaxSetup({async:true});
    				var PASObjVocabulary = {'terms':[]};
    				$.ajaxSetup({async:false});
    				$.get('./vocabularies/PAS-objects.json?'+Date.now(), function(data) { // Do not use any cached file
    					data.forEach(function(term){
    						PASObjVocabulary.terms[term.value] = term;
    					});
					},'json');
    				$.ajaxSetup({async:true});
    			}
    			
    			function transformHeader(header,i){
        			var newHeader = /\{(.*)/.exec(header);
        			return newHeader===null ? null : newHeader[1].slice(0, -1); // Remove closing }
        		}
        		input = Papa.parse(filecontent,{
        			delimiter: ",",
        			header:true,
        			transformHeader:transformHeader,
        			dynamicTyping:true,
        			skipEmptyLines:true
        		});
				
				input.meta.fields.forEach(function(field){ // Deal first with root attributes (a root @id may form the base of item @ids)
					if (field !== null && field.startsWith('$.')){
						keyValue = field.split(/=(.*)/s);
						var key = keyValue.shift().split('.').pop();
						var value = keyValue.shift();
						if (value.startsWith('"') && value.endsWith('"')){
							input[key] = value.replace(/["]+/g, '');
						}
						else{
							try{
								input[key] = JSON.parse(value);
							}
							catch(err){
								console.log('JSON header may be malformed.',value,err);
							}
						}
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
        					if (['"','{','['].includes(keyParts[1].slice(0,1))){ // String or JSON
        						if(!input.hasOwnProperty('citation') && keyParts[0]=='citation'){
        						}
        						else if(keyParts[0]=='citation'){
        							delete feature.citation;
        						}
        						else{
        							if((!keyParts[0].endsWith(']')) && keyParts[1].trim().length > 0) {
            							if (keyParts[1].startsWith('"') && keyParts[1].endsWith('"')){
            								feature[keyParts[0]] = keyParts[1].replace(/["]+/g, '');
            							}
            							else{
            								feature[keyParts[0]] = JSON.parse(keyParts[1]);
            							}
        							}
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
        					if(feature[key]==null || feature[key]==' ' || feature[key]=='' || feature[key]=='""') delete feature[key];
        				}
        			});
        			if(feature.hasOwnProperty('easting_ni') && feature.hasOwnProperty('northing_ni')){
        				// Projection definition from https://epsg.io/29900 (copy and paste Proj4js Definition)
        				proj4.defs('EPSG:29900','+proj=tmerc +lat_0=53.5 +lon_0=-8 +k=1.000035 +x_0=200000 +y_0=250000 +ellps=mod_airy +towgs84=482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15 +units=m +no_defs');
        				const wgs84 = proj4('EPSG:29900','WGS84',[feature.easting_ni,feature.northing_ni]);
//        				console.log(wgs84);
        				feature.geometry = {"type": "Point", "coordinates": [parseFloat(wgs84[0].toFixed(6)),parseFloat(wgs84[1].toFixed(6))], 'certainty': 'certain'};
	    				delete feature.easting_ni;
	    				delete feature.northing_ni;
        			}
        			else if(feature.hasOwnProperty('easting') && feature.hasOwnProperty('northing')){
        				// Projection definition from https://epsg.io/27700 (copy and paste Proj4js Definition)
        				proj4.defs("EPSG:27700","+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs");
        				const wgs84 = proj4('EPSG:27700','WGS84',[feature.easting,feature.northing]);
//        				console.log(wgs84);
        				feature.geometry = {"type": "Point", "coordinates": [parseFloat(wgs84[0].toFixed(6)),parseFloat(wgs84[1].toFixed(6))], 'certainty': 'certain'};
	    				delete feature.easting;
	    				delete feature.northing;
        			}
        			else if(feature.hasOwnProperty('PAS_longitude') && feature.hasOwnProperty('PAS_latitude')){
        				feature.geometry = {"type": "Point", "coordinates": scatter([feature.PAS_longitude,feature.PAS_latitude]), 'granularity': {'tolerance':{'value':0.05,'units':'degrees'}}}; // Obfuscate PAS Coordinates plus/minus 0.5km lat & lng
	    				delete feature.PAS_longitude;
	    				delete feature.PAS_latitude;
        			}
        			else if(feature.hasOwnProperty('longitude') && feature.hasOwnProperty('latitude')){
        				feature.geometry = {"type": "Point", "coordinates": [feature.longitude,feature.latitude], 'certainty': 'certain'};
	    				delete feature.longitude;
	    				delete feature.latitude;
        			}
        			else if(feature.hasOwnProperty('OSGB')){
        				feature.geometry = {"type": "Point", "coordinates": OSGB_WGS84(feature.OSGB,false), 'certainty': 'certain'};
	    				delete feature.OSGB;
        			}
        			else if(feature.hasOwnProperty('OSGB2')){
        				feature.geometry = {"type": "Point", "coordinates": OSGB_WGS84(feature.OSGB2,false), 'certainty': 'certain'};
	    				delete feature.OSGB2;
        			}
        			else feature.geometry = {};
        			if(firstPoint(feature.geometry)==null) feature.geometry = null; // Required by GeoJSON specification (see https://datatracker.ietf.org/doc/html/rfc7946#section-3.2)
        			
        			Object.keys(feature).forEach(function(property) {
        				if(property.startsWith('$.')) return;
        				var properties = property.replaceAll('[','.').replaceAll(']','').split('.');
        				if(properties.length>1 && properties[0]!==''){
            				var root = feature;
            				properties.forEach(function(property,i){
            					if(!root.hasOwnProperty(property) || root[property]==null){
            						if(properties.length>i && /(0|[1-9]\d*)/.test(properties[i+1])){ // Array item next
            							root[property] = [];
                					}
                					else root[property] = {};
            					}
            					root = root[property];
            				});
            				eval('feature.'+property.replaceAll(/(.@[^\.]*)/g,function(match){return '[\''+match.substring(1)+'\']';})+'=feature[property]'); // replaceAll required to handle properties starting with '@'
            				delete feature[property];
        				}   				
        			});
        			
        			if(filename=='IV_tps.lp.csv'){
        				try {
        					delete feature.geometry.certainty;
        				}
        				catch(err) {console.log(err,feature)};
        				feature.properties.ccodes = ['GB'];
        				feature.when = {'label':'Listed in 1680','timespans':[{'start':{'latest':'1680'}},{'end':{'earliest':'1680'}}]};
        				feature.names = [{'toponym':feature.properties.title,'when':feature.when}];
        				feature.relations = [
        					{'relationType':'gvp:broaderPartitive','relationTo':'https://w3id.org/locolligo/historic-counties/'+encodeURIComponent(feature.properties.historic_county),'label':'part of '+feature.properties.historic_county+' (UK)','when':{'timespans':[{'end':{'earliest':'1974'}}]}},
        					{'relationType':'gvp:broaderPartitive','relationTo':'https://w3id.org/locolligo/historic-hundreds/'+encodeURIComponent(feature.properties.hundred),'label':'part of '+feature.properties.hundred+' (UK county subdivision)','when':{'timespans':[{'end':{'earliest':'1974'}}]}}
        				];
        				delete feature.properties.historic_county;
        				delete feature.properties.hundred;
        				if(!feature.hasOwnProperty('types')) feature.types = [];
        				if(feature.properties.hasOwnProperty('glyphs') && feature.properties.glyphs!==''){
	        				var glyphs = feature.properties.glyphs.split('|');
	        				glyphs.forEach(function(glyph){
	        					if(glyph.startsWith('settlement')){
	        						feature.types.push({'label':'human settlement','identifier':'wd:Q486972','sourceLabels':[{'label':glyph}]});
	        					}
	        					else if(glyph.startsWith('seat')){
	        						feature.types.push({'label':'family seat','identifier':'wd:Q168719','sourceLabels':[{'label':glyph}]});
	        					}
	        					else if(glyph.startsWith('market')){
	        						feature.types.push({'label':'market town','identifier':'wd:Q18511725','sourceLabels':[{'label':glyph}]});
	        					}
	        					else if(glyph.startsWith('parish')){
	        						feature.types.push({'label':'parish','identifier':'wd:Q102496','sourceLabels':[{'label':glyph}]});
	        					}
	        					else if(glyph.startsWith('parliament')){
	        						feature.types.push({'label':'electoral district','identifier':'wd:Q192611','sourceLabels':[{'label':glyph}]});
	        					}
	        					else if(glyph.startsWith('society')){
	        						feature.types.push({'label':'college','identifier':'wd:Q189004','sourceLabels':[{'label':glyph}]});
	        					}
	        					else if(glyph.startsWith('seaport')){
	        						feature.types.push({'label':'seaport','identifier':'wd:Q15310171','sourceLabels':[{'label':glyph}]});
	        					}
	        				});
        				}
        				else feature.types.push({'label':'place','identifier':'wd:Q98929991'});
        			}
        			
        			if(filename=='VCH-Places.lp.csv'){
        				
        				if(feature.hasOwnProperty('VCH-Links') && feature['VCH-Links']!==''){
	        				if(!feature.hasOwnProperty('links')) feature.links = [];
	        				var vchlinks = feature['VCH-Links'].split(',');
	        				vchlinks.forEach(function(vchlink){
	        					feature.links.push({'type':'seeAlso','identifier':'http://www.british-history.ac.uk/report.aspx?compid='+vchlink.split(' - ')[1]});
	        				});
        				}
	    				delete feature['VCH-Links'];
	    				
        				if(!feature.hasOwnProperty('names')) feature.names = [];
	    				if(feature.properties.hasOwnProperty('KainOliverName') && feature.properties.KainOliverName !== '') feature.names.push({
	    					'toponym':feature.properties.KainOliverName,
	    					'citations':[{
//	    						'label':'Kain, R.J.P., Oliver, R.R. (2001). Historic Parishes of England and Wales : an Electronic Map of Boundaries before 1850 with a Gazetteer and Metadata. [data collection]. UK Data Service.',
	    						// Label omitted because duplication bloats the dataset. The DOI is sufficient to identify the source.
	    						'@id':'DOI:10.5255/UKDA-SN-4348-1'
	    					}]
	    				});
	    				delete feature.properties.KainOliverName;
	    				feature.names.push({'toponym':feature.properties.title});
	    				if(feature.properties.hasOwnProperty('extranames') && feature.properties.extranames!==''){
	    					var extranames = feature.properties.extranames.split(',');
	        				extranames.forEach(function(extraname){
	        					if(extraname!=='') feature.names.push({'toponym':extraname});
	        				});
		    				delete feature.properties.extranames;
	    				}
	    				
        				if(!feature.hasOwnProperty('types')) feature.types = [];
        				feature.types.push({
        					"identifier":"wd:Q7884789",
        					"label":"toponym",
        					"when":{"timespans":[{"start":{"latest":"1848"}}]}
        				});
        				
        				// do categories permit additional types? Yes, but better to re-extract for multiple types.        		
        				if (typeof VCHtypes == "undefined") {
        					VCHtypes = [];
//        					qualifiers = 'ancient|celebrated|civil|considerable|consolidated|district|ecclesiastical|exclusive|extra-parochial|fashionable|formerly a|formerly an|head of a|head of the|incorporated|independent|inland|manufacturing|metropolitan|newly-enfranchised|newly-erected|parochial|representative|rising|separate|small|suburban|unincorporated';
//        					terms = 'bathing-place|borough|capital of the county|chapelry|chapelry district|church district|cinque-port|city|city and county|consolidated parishes|county of itself|district|district parish|division or township|extra-parochial|hamlet|hundred|isle|jurisdiction|liberty|market-town|naval arsenal|parish|place|port|post-town|precinct|sea-port|suburb|town|township|two ecclesiastical districts|tything|union|union of itself|united parishes|village|ward|watering-place';
        				}
        				
        				if(feature.descriptions[0].hasOwnProperty('value')){
        					var parts = feature.descriptions[0].value.split(/,\s(in |chiefly in|comprising|in the|locally in|partly in|partly within|situated|\d+\smile)/i);
	        				if (parts.length>1 && parts[0].length<1000){
	        					let result;
	        					let VCHtext = parts[0];
	        					let VCHregex = /(?<temporal>(?:(?:ancient|anciently a|formerly a|formerly an|new|newly-enfranchised|newly-erected)\s*)*)(?<qualifiers>(?:(?:celebrated|civil|considerable|consolidated|constituting the|distinct|district|ecclesiastical|exclusive|extra-episcopal|extra-parochial|fashionable|forming a|forming one|forming the|head of a|head of the|incorporated|independent|inland|manufacturing|member of the|metropolitan|municipal|parochial|portion of the|representative|rising|separate|small|suburban|two|unincorporated|which form|which has|within the)\s*)*)(?<term>bathing-place|borough|capital of the county|chapelry|chapelry district|church district|cinque-port|city|city and county|consolidated parishes|county of itself|district|district parish|division|division or township|extra-parochial|hamlet|hundred|hundred of itself|isle|jurisdiction|liberty|liberties|manor|market-town|naval arsenal|parish|place|port|post-town|posting-place|precinct|sea-port|seat of a diocese|suburb|town|township|two ecclesiastical districts|tything|union|union of itself|united parishes|village|ward|watering-place)/gi;
	        					while ((result = VCHregex.exec(VCHtext)) !== null) {
	        						var key = (result.groups.qualifiers.toLowerCase().trim()+' '+result.groups.term.toLowerCase().trim()).trim();
	        						if(!(key in VCHVocabulary.terms)) {
	        							key = result.groups.term.toLowerCase().trim();
//	        							console.log('Switched key');
	        						}
	        						if(key in VCHVocabulary.terms){
		        						const temporalRegex = /formerly|anciently a/;
		        						var past = result.groups.temporal.toLowerCase().match(temporalRegex);
		        						if(past) {
		        							when = {"timespans":[{"start":{"latest":"1840"},"end":{"latest":"1847"}}]};
//		        							console.log(i+' past');
		        						}
		        						else when = {"timespans":[{"start":{"latest":"1848"}}]};
	        							feature.types.push({
	        	        					"identifier":VCHVocabulary.terms[key]['WD-url'],
	        	        					"label":VCHVocabulary.terms[key]['WD-label'],
	        	        					"sourceLabels":[{"label":VCHVocabulary.terms[key]['VCH-term']}],
	        	        					"when":when
	        	        				});
	        						}
	        						else{
//	        							VCHtypes.push(key);
	        							console.log(i,result.groups);
	        						}
		        				}
	        					
	        					VCHregex = /(?<test>([^\s]*\s(?:railway)[\s,][^\s]*))/gi;
	        					while ((result = VCHregex.exec(feature.descriptions[0].value)) !== null) {
	        						var key = result.groups.test.toLowerCase().trim();
//	        						VCHtypes.push(key);
//	        						console.log(key);
	        						feature.types.push({
        	        					"identifier":"wd:Q109258987",
        	        					"label":"railway node",
        	        					"sourceLabels":[{"label":"railway"}],
        	        					"when":{"timespans":[{"start":{"latest":"1848"}}]}
        	        				});
		        				}
	        					
	        					VCHregex = /(?<string>population\sof\s(?:about\s)*(?<number>[,\d]*)\s(?:people|persons))/gi;
	        					while ((result = VCHregex.exec(feature.descriptions[0].value)) !== null) {
	        						var population = parseInt(result.groups.number.replace(',',''),10);
//	        						console.log('Population',result.groups.number,population);
	        						feature.properties.population = population;
		        				}
	        					VCHregex = /(?<string>\s(?:about\s)*(?<number>[,\d]*)\s(?:inhabitants))/gi;
	        					while ((result = VCHregex.exec(feature.descriptions[0].value)) !== null) {
	        						var population = parseInt(result.groups.number.replace(',',''),10);
//	        						console.log('Inhabitants',result.groups.number,population);
	        						feature.properties.population = population;
		        				}
	        					

	        					VCHtypes = [];
	        					VCHregex = /(?<test>[\s>](?<types>(?<type>agricultural|agricultural and garden|blue|blue-cap|blue-coat|bluecoat|boys'|british|catholic|central|charity|charter-house|church|church of england|classical|colleges|collegiate|commercial|dame's|daughters'|day|diocesan|dissenting|endowed|endowment|english|evening|first|foreign|free|free grammar|friends'|girls'|government|grammar|green|green-coat|hospital|infant|infants'|kirk-leatham|lancasterian|latin|lower|marine|mathematical|mechanical|merchant-tailors'|middle|mixed|national|naval|parochial|parochial\)|preparatory|private|proprietary|public|reading|red-boys'|red-sleeve|second|secondary|shire-green|singing|song|spinning|sunday|tailors'|upper|vicar's|weaver-trust|writing)*(?:<\/emph>")?|(?<untyped>[^\s,>]*))[,]*(?:\sschool)[s]*[,.\s])/gi;
	        					while ((result = VCHregex.exec(feature.descriptions[0].value)) !== null) {
//	        						console.log(result);
	        						if('type' in result.groups && result.groups.type!==undefined){
		        						var type = result.groups.type.toLowerCase().trim();
		        						VCHtypes.push(type);
//		        						console.log(type);
	        						}
	        						if('untyped' in result.groups && result.groups.untyped!==undefined){
		        						var untyped = result.groups.untyped.toLowerCase().trim();
		        						if(untyped!=='flemish') VCHtypes.push('unspecified');
//		        						console.log(type);
	        						}
		        				}
	        					VCHtypes = VCHtypes.filter(arrayUnique).sort();
	        					if(VCHtypes.length>0) feature.properties.schools = VCHtypes;
	        					
	        				}
	        				else{
	        					console.log(i,parts.length, parts[0].length);
	        				}
//	        				if(feature.descriptions[0].value.length>900) {
////	        					console.log (i+': reduced from '+feature.descriptions[0].value.length);
//	        					feature.descriptions[0].value = feature.descriptions[0].value.substring(0,895)+'...';
//	        				}
        				}
        				else{
        					console.log("Deleted",i,feature.descriptions[0]);
        					delete feature.descriptions[0];
        				}
        				
        			}
        			
        			if(filename=='PAS_Warwickshire_v2.lt.csv'){
        				if(feature.relations[1].hasOwnProperty('label')){
        					if(feature.relations[1].label.toLowerCase() in PASMoDVocabulary.terms){
        						feature.relations[1].relationTo = PASMoDVocabulary.terms[feature.relations[1].label.toLowerCase()];
            				}
        					else console.log('PAS MoD not found: '+feature.relations[1].label);
        				}
        				try{
        					var PAS_type = PASObjVocabulary.terms[feature.properties.type.replace(' ','+')];
            				feature.types = [{'label':PAS_type.itemLabel,'identifier':PAS_type.item,'sourceLabels':[{'label':feature.properties.type,'lang':'en'}]}];
            				delete feature.properties.type;
        				}
        				catch{
            				feature.types = [{'label':'Not linked to vocabulary','identifier':'wd:Q83564242','sourceLabels':[{'label':feature.properties.type,'lang':'en'}]}];
        				}
        			}
        			
        			// TO DO: add .relations.broaderPartitive items based on feature.geometry.accuracy, using GeoNames API to identify settlements, counties, or countries based on Point location.
        			// - also allow for numeric accuracy values, adding a geoWithin GeoCircle with geoRadius
        			// - also allow for grid values, adding a geoWithin bounding box
        			if(feature.hasOwnProperty('when') && feature.when.hasOwnProperty('timespans') && filename!='IV_tps.lp.csv'){ // Check .when format validity, and convert feature.when.timespans object to array
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
        			if(feature.hasOwnProperty('relations') && !Array.isArray(feature.relations)){ // Convert relations object to array; assume it is a historic county and add appropriate {when} and {ccodes} attributes
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
				
				var emptyRows=[];
				input.data.forEach(function(feature,i){if(Object.values(feature).every(x => x === null || x === '')) emptyRows.push(i);});
				console.log('Deleting empty rows',emptyRows);
				emptyRows.reverse().forEach(function(i){input.data.splice(i,1);});
				
    			input['@id'] = 'https://w3id.org/locolligo/'+uuidv4(); // Create PID for dataset
        		input.meta.filename = filename;
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
    		if(filename.startsWith('MonasteryQuest')){
    			input.features.forEach(function(feature,i){
    				
    				feature.properties.when.timespans[0].start.in = feature.properties.Founded;
    				
    				if(feature.hasOwnProperty('types')){
        				var deletions=[];
        				feature.types.forEach(function(type,i){
        					if(type.hasOwnProperty('identifier') && ['aat:300008375','wd:Q486972'].includes(type.identifier)) deletions.push(i);
        				});
        				deletions.reverse().forEach(function(i){
        					feature.types.splice(i,1);
        				});
        			}
    				else feature.types = [];
    				
    				var founded = String(feature.properties.Founded).replaceAll('~','').replaceAll(',','').split('.')[0].split('-')[0].split('/')[0];
    				if(founded>=1500){
    					feature.types.push({'identifier':'wd:Q7017','label':'16th-century'});
    				}
    				else if(founded>=1400){
    					feature.types.push({'identifier':'wd:Q7018','label':'15th-century'});
    				}
    				else if(founded>=1300){
    					feature.types.push({'identifier':'wd:Q7034','label':'14th-century'});
    				}
    				else if(founded>=1200){
    					feature.types.push({'identifier':'wd:Q7049','label':'13th-century'});
    				}
    				else if(founded>=1100 || feature.properties.Founded.includes('Temp Henry')){
    					feature.types.push({'identifier':'wd:Q7061','label':'12th-century'});
    				}
    				else if(founded>=1000){
    					feature.types.push({'identifier':'wd:Q7063','label':'11th-century'});
    				}
    				else if(founded>=900){
    					feature.types.push({'identifier':'wd:Q8052','label':'10th-century'});
    				}
    				else if(founded>=800){
    					feature.types.push({'identifier':'wd:Q8083','label':'9th-century'});
    				}
    				else if(founded>=700){
    					feature.types.push({'identifier':'wd:Q8086','label':'8th-century'});
    				}
    				else if(founded>=600){
    					feature.types.push({'identifier':'wd:Q8089','label':'7th-century'});
    				}
    				else if(founded>=500){
    					feature.types.push({'identifier':'wd:Q8090','label':'6th-century'});
    				}
    				else {
    					feature.types.push({'identifier':'wd:Q12069528','label':'Foundation undated'});
    					console.log('Foundation not categorised: '+feature.properties.title+' (#'+i+') '+feature.properties.Founded);
    				}

    				if(feature.properties.Type.includes('Cathedral')){
    					feature.types.push({'identifier':'wd:Q2977','label':'Cathedral'});
    				}
    				if(feature.properties.Type.includes('Priory')){
    					feature.types.push({'identifier':'wd:Q2750108','label':'Priory'});
    				}
    				else if(feature.properties.Type.includes('Abbey')){
    					feature.types.push({'identifier':'wd:Q160742','label':'Abbey'});
    				}

//    				if(feature.properties.Order.includes('Double House')){
//    					feature.types.push({'identifier':'wd:Q6021560','label':'nunnery'});
//    					feature.types.push({'identifier':'wd:Q44613','label':'monastery'});
//    				}
//    				else if(feature.properties.Order.includes('(Women)')){
//    					feature.types.push({'identifier':'wd:Q6021560','label':'nunnery'});
//    				}
//    				else feature.types.push({'identifier':'wd:Q44613','label':'monastery'});
//
//    				if(feature.properties.Order.includes('Augustinian')){
//    					feature.types.push({'identifier':'wd:Q214528','label':'Augustinian'});
//    				}
//    				else if(feature.properties.Order.includes('Benedictine')){
//    					feature.types.push({'identifier':'wd:Q131132','label':'Benedictine'});
//    				}
//    				else if(feature.properties.Order.includes('Cistercian')){
//    					feature.types.push({'identifier':'wd:Q166861','label':'Cistercian'});
//    				}
//    				else if(feature.properties.Order.includes('Premonstratensian')){
//    					feature.types.push({'identifier':'wd:Q339332','label':'Premonstratensian'});
//    				}
//    				else if(feature.properties.Order.includes('Cluniac')){
//    					feature.types.push({'identifier':'wd:Q1529391','label':'Cluniac'});
//    				}
//    				else if(feature.properties.Order.includes('Knights Hospitaller')){
//    					feature.types.push({'identifier':'wd:Q187549','label':'Knights Hospitaller'});
//    				}
//    				else if(feature.properties.Order=='Carthusian'){
//    					feature.types.push({'identifier':'wd:Q220979','label':'Carthusian'});
//    				}
//    				else if(feature.properties.Order.includes('Gilbertine')){
//    					feature.types.push({'identifier':'wd:Q770486','label':'Gilbertine'});
//    				}
//    				else if(feature.properties.Order=='Knights Hospitaller (Formerly Templar)'){
//    					feature.types.push({'identifier':'wd:Q41300','label':'Templar'});
//    				}
//    				else if(feature.properties.Order=='Trinitarian'){
//    					feature.types.push({'identifier':'wd:Q917518','label':'Trinitarian'});
//    				}
//    				else if(feature.properties.Order=='Tironensian'){
//    					feature.types.push({'identifier':'wd:Q33645010','label':'Tironensian'});
//    				}
//    				else if(feature.properties.Order=='Bonhommes'){
//    					feature.types.push({'identifier':'wd:Q4975709','label':'Bonhommes'});
//    				}
//    				else if(feature.properties.Order=='Bethlemite'){
//    					feature.types.push({'identifier':'wd:Q2588888','label':'Bethlemite'});
//    				}
//    				else if(feature.properties.Order=='Bridgettine Double House'){
//    					feature.types.push({'identifier':'wd:Q952578','label':'Bridgettine'});
//    				}
//    				else console.log('Not categorised: '+feature.properties.Order);
//    				delete feature.properties.Order;
    				
    			});
    		}
    		
    		cleanupDataset(input);
//    		indexingLinks(input);
    		
    		input_truncated = input; // TO DO: Find generic method for truncation, to avoid browser overload on expansion of large arrays; could easily be fixed for geoJSON.
    	}
    	
    	// Create null geometry for geojson where none yet exists
    	if(input.hasOwnProperty('features')){
    		var certainty={};
    		input.features.forEach(function(feature){
    			if(!feature.hasOwnProperty('geometry') || firstPoint(feature.geometry)==null){
//    				feature.geometry = {"type":"Point","coordinates":[null,null],"certainty":"uncertain"};
    				feature.geometry = null; // Required by GeoJSON specification.    				
    			}
    			else{
    				if(feature.geometry.hasOwnProperty('certainty')){
    					if(!certainty.hasOwnProperty(feature.geometry.certainty)) certainty[feature.geometry.certainty] = 0;
    					certainty[feature.geometry.certainty]++
    				}
    			}
    		});
    		console.log(certainty);
    	}    
		
		if(filename.startsWith("ArtUK")){
			function getArtUK(i){
//				if(i==3) return;
				if(i==input.features.length) return;
				var feature = input.features[i];
				if(feature.properties.hasOwnProperty('title')){
					getArtUK(i+1);
					return;
				}
				try {
					$.ajax({
						  url: 'https://descartes.emew.io/LaNC/artuk.php?url=https://artuk.org/visit/venues/'+feature.uuid,
						  dataType: 'json',
						  type: 'POST',
						  async:false,
						  success: function (data) {
				                console.log(i+'/'+input.features.length,data);
								feature.properties.title = data.title;
		    					feature.descriptions = [{'value':data.description}];
		    					feature.links = [{'type':'subjectOf','identifier':data.url}];
		    					feature.depictions = [{'@id':data.img}];
				            },
				            error: function (xhr, status, error) {
				                console.log(xhr);
				                console.log(status);
				                console.log(error);
				            },
				            complete: function(jqXHR, textStatus) {
				            	
				            }
					}).done(function(){getArtUK(i+1);});
				}
				catch {
					getArtUK(i+1);
				}
			}
			getArtUK(0);
		}	
		
//		if(filename.startsWith("VisitPlus")){
//	//		NTCollections
//			input.features.forEach(function(feature){
//				if(feature.relations[0].relationTo=='www.nationaltrust.org.uk'){
//					var collection = NTCollections.filter(obj => {return obj['Website'] === feature.properties.url})[0];
//					console.log(collection);
//					if(collection!==undefined){
//						var url = collection['Collections Trust Place Page '] || collection['Collection Search Page'] || false;
//						if (url!==false){
//							if(!feature.hasOwnProperty('links')) feature.links = [];
//							feature.links.push({'type':'seeAlso','identifier':url,'label':'National Trust Collection: '+collection.NT_Name});
//							console.log(url);
//						}
//					}
//				}
//			});
//		}	
		
		if(filename.startsWith("Mapping-Museums")){
			function moveDescription(i){
//				if(i==3) return;
				if(i==input.features.length) return;
				var feature = input.features[i];
				
				if(!feature.hasOwnProperty('descriptions')){
					feature.descriptions = [{'value':feature.properties.description}];
					delete feature.properties.description;
				}
				moveDescription(i+1);
			}
			moveDescription(0);
		}	
    	
    	// DELETE AFTER SINGLE USE - Populate Hollar types
//    	input.features.forEach(function(feature){
//    		feature.types = [{
//    			"identifier":"wd:Q486972",
//    			"label":"human settlement",
//    			"when":{"timespans":[{"start":{"latest":"1660"},"end":{"earliest":"2021"}}]}
//    		}];
//    		if(feature.name.toLowerCase().indexOf('church')>-1){
//    			feature.types[0].identifier = 'wd:Q16970';
//    			feature.types[0].label = 'church building';
//    		}
//    		else if(feature.name.toLowerCase().indexOf('bridge')>-1 && !feature.name.toLowerCase().indexOf('uxbridge')>-1){
//    			feature.types[0].identifier = 'wd:Q12280';
//    			feature.types[0].label = 'bridge';
//    		}
//    		else if(feature.name.toLowerCase().indexOf('castle')>-1){
//    			feature.types[0].identifier = 'wd:Q23413';
//    			feature.types[0].label = 'castle';
//    		}
//    		else if(feature.name.toLowerCase().indexOf('colliery')>-1){
//    			feature.types[0].identifier = 'wd:Q959309';
//    			feature.types[0].label = 'coal mine';
//    		}
//    		else if(feature.name.toLowerCase().indexOf('hall')>-1 || feature.name.toLowerCase().indexOf('woodstock')>-1 || feature.name.toLowerCase().indexOf('lodge')>-1 || feature.name.toLowerCase().indexOf('theobalds')>-1 || feature.name.toLowerCase().indexOf('hampton court')>-1){
//    			feature.types[0].identifier = 'wd:Q4919932';
//    			feature.types[0].label = 'stately home';
//    		}
//    		else if(feature.name.toLowerCase().indexOf('arrows')>-1 || feature.name.toLowerCase().indexOf('newgate')>-1 || feature.name.toLowerCase().indexOf('gravestones')>-1 || feature.name.toLowerCase().indexOf('high cross')>-1){
//    			feature.types[0].identifier = 'wd:Q4989906';
//    			feature.types[0].label = 'monument';
//    		}
//    		else if(feature.name.toLowerCase().indexOf('spa')>-1){
//    			feature.types[0].identifier = 'wd:Q1341387';
//    			feature.types[0].label = 'spa';
//    		}
//    		else if(feature.name.toLowerCase().indexOf('st. robert')>-1){
//    			feature.types[0].identifier = 'wd:Q513550';
//    			feature.types[0].label = 'hermitage';
//    		}
//    		feature.properties.title = feature.name;
//    		delete feature.name;
//		});
    	
    	if (typeof VCHtypes != "undefined") {
    		VCHtypes = VCHtypes.filter(arrayUnique).sort();
    		download(VCHtypes,"VCHtypes.json",false);
    	}
    	
    	$('#source_block').appendTo('#darkroom');
    	$('#conversions').insertBefore('.arrow');
    	input_formatter = new JSONFormatter(input_truncated,1,{theme:'dark'});
		renderJSON($('#source'),input_formatter,input,filename);
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
//					console.log('Removing '+database.name);
//					indexedDB.deleteDatabase(database.name);
				}
			};
		});
	});
	
	
});