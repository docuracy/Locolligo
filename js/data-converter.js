// ===========================================================
// DONE:
// UUIDs generated for all traces
// Linking of PAS and Wikidata records within set radius
// Mapping of Peripleo-LD by JSONata translation to geoJSON, with array of linked data. See https://try.jsonata.org/SAJMolM8A 
// Autodetect known conversion types
// JSONata expression paste module
// Enable URL input 
// Conversion for Recogito LD download
// Fixed JSONata for geoJSON conversion from Peripleo-LD with multiple Places per trace body: https://try.jsonata.org/uFtDQQtG1
// Included Wikidata identifiers for tags: https://try.jsonata.org/H1xppiTyx
// CSV to Peripleo-LD JSONata example at https://try.jsonata.org/AiLGV4yn2
// CSV to Peripleo-LD JSONata CRS-conversion example at https://try.jsonata.org/XU6jC_uwd
// Included gazetteer in geoJSON links
// Standardised fragment selectors  
// Reformatted linked box selector as box+line+marker 
// Implemented csv download for geoJSON
// Implemented OSGB CRS conversion
// Implemented CRS conversion definitions within mappings.json
// Implemented geo-uncertainty as https://schema.org/geoWithin a https://schema.org/GeoShape (bounding box for OSGB: see https://try.jsonata.org/sB8tuSBCc) or https://schema.org/GeoCircle (e.g. radius 1m for PAS finds)
// Autopopulate Examples from GitHub directory
//
// TO DO:
// SEE ALSO: https://docs.google.com/document/d/1H0KmYf405QS2ECozHpmAFsLz2MbXd_3qLKXBmLFCoJc/edit?usp=sharing
// Genericise API query function using JSONata and an API-configurations file, to allow simple addition of further API endpoints.
// Enable CSV download from Google Sheet URL
// Implement geoJSON and map shapes (boxes and circles) for geoWithin objects
// GeoNames for nearby Wikipedia urls, e.g. http://api.geonames.org/findNearbyWikipediaJSON?lat=51.0177369115508&lng=-1.92513942718506&radius=10&username=docuracy&maxRows=500
// GeoNames reverse geocoding for nearby toponyms, e.g. http://api.geonames.org/findNearbyJSON?lat=51.0177369115508&lng=-1.92513942718506&radius=10&username=docuracy&maxRows=500
// GeoNames Points of Interest from OSM, e.g. http://api.geonames.org/findNearbyPOIsOSMJSON?lat=51.0177369115508&lng=-1.92513942718506&radius=1&username=docuracy&maxRows=50
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

// Global variables
var mappings, 
	input_formatter, 
	input, 
	output_formatter, 
	output, 
	markers=[], 
	radius=10, 
	sparql_base, 
	activeAjaxConnections = 0;

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
	$.each($('#source').data('data').data,function(j,item){
		$('#source').data('data').data[j].geoWithins = [];
		$.each(mappings[$('#expression option:selected').val()].CRS_conversions, function(i,conversion){
			input=[];
			$.each(conversion[0],function(k,input_part){
				input.push(eval("item."+input_part));
			});
			const result = eval(conversion[2].replace('%%%','"'+input.join(',')+'"'));
			eval("$('#source').data('data').data[j]."+conversion[1][0]+" = parseFloat(result[0])");
			eval("$('#source').data('data').data[j]."+conversion[1][1]+" = parseFloat(result[1])");
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

// Render JSON display
function renderJSON(target,object,data){
	target
		.data('data',data)
		.html(object.render());
	var downloadButton = $('<button class="dataButton" title="Download this dataset to local filesystem">Download</button>').prependTo(target); // Create button for downloading JSON dataset
	downloadButton.button().click(function(){download($(this).parent('div').data('data'));});
	if(Array.isArray(data.data) || data.hasOwnProperty('traces')){ // Create button for copying sample JSON to clipboard
		var clipButton = $('<button class="dataButton" title="Copy first three records to clipboard">Clip Sample</button>').prependTo(target);
		clipButton.button().click(function(){clipSample($(this));});
	}
	if(data.hasOwnProperty('features')){ // Create button for downloading geoJSON points as csv
		var csvButton = $('<button class="mapButton" title="Download basic csv">CSV</button>').prependTo(target);
		csvButton.button().click(function(){downloadCSV($(this).parent('div').data('data').features);});
	}
	if(data.hasOwnProperty('traces')){ // Create buttons for viewing map and adding data from PAS API
		var clipButton = $('<button class="mapButton" title="Visualise dataset on a map">Map</button>').prependTo(target);
		clipButton.button().click(function(){drawMap($(this));});
		$('<button id="PASButton" class="APIButton" title="Link PAS records within '+radius+'km">PAS</button>').prependTo(target);
		$('<button id="WDButton" class="APIButton" title="Link Wikidata records within '+radius+'km">Wikidata</button>').prependTo(target);
		$('.APIButton').button().click(function(){addAPIdata($(this));});
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
	else if (input.hasOwnProperty('meta')){fields = JSON.stringify(input.meta.fields);}
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

// Show map for current dataset
function drawMap(el){
	$('body').loadingModal({text: 'Processing...'});
	const jsonata_expression = jsonata( mappings[1].expression ); // Convert Peripleo-LD to geoJSON-T
	const geoJSON = jsonata_expression.evaluate(el.parent('div').data('data'));
	const bounds = new mapboxgl.LngLatBounds(geoJSON.features[0].geometry.coordinates,geoJSON.features[0].geometry.coordinates);
	for (const feature of geoJSON.features) {
		console.log(feature.geometry.coordinates);
		bounds.extend(feature.geometry.coordinates);
		const el = document.createElement('div');
		el.className = 'marker';
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
		markers.push(marker);
	}
	map.fitBounds(bounds, {
		padding: 20
	});
	$('#map').dialog('open');
	map.resize();
	$('body').loadingModal('destroy');
}

// Query API
// This function should be genericised using JSONata and an API-configurations file, to allow simple addition of further API endpoints.
function addAPIdata(el){
	var dataset = el.parent('div').data('data');
	dataset.traces = dataset.traces.slice(0,25); // API limits concurrent(?) requests *** TO BE ADDRESSED
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
						beforeSend: function(xhr) {activeAjaxConnections++;},
						error: function(xhr) {
							activeAjaxConnections--;
							checkAjaxConnections();
						},
						headers: { Accept: 'application/sparql-results+json' }
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
	
	// Apply jquery-ui styling
	$('#expression').after('<button onclick="convert();" title="Convert uploaded dataset using chosen type">Convert</button><button onclick="$(\'#modal\').dialog(\'open\')"  title="Paste new JSONata expression to be used for this conversion type">Edit JSONata</button><button onclick="download(mappings,\'mappings.json\');" title="Download all conversion definitions to local filesystem">Download mappings.json</button>');
	$('button,input:file').button();
	$('#datafile_url').addClass('ui-button ui-corner-all ui-widget datafile_url');
	$( "#modal" ).dialog({
		autoOpen: false,
		modal: true,
		width: 600,
		height: "auto"
	});
	$( "#map" ).dialog({
		autoOpen: false,
		modal: true,
		width: 600,
		height: 600,
		resize: function(event, ui) { map.resize(); },
		close: function(event, ui) { $.each(markers, function(i,marker){ marker.remove(); }) }
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
		}).trigger("selectmenuchange");
	});
	
	
	// Populate JSONata expressions drop-down list
	$.get('./templates/mappings.json?'+Date.now(), function(data) { // Do not use any cached file
		mappings = data;
		$.each(data, function(key,value) {
			$('#expression').append('<option value="'+key+'">'+value.description+'</option>');
		});
		$('select#expression').selectmenu().on('selectmenuchange',function () {console.log(mappings[$('#expression option:selected').val()].expression)});
	},'json');
	
	// Load base Wikidata SPARQL query
	$.get('./templates/wikidata_heritage_sites.sparql', function(data) {
		sparql_base = data.replace(/\#.*\r/g,''); // Remove comments, which would break the urlencoded query
	},'text');
	
	// Parse file
	function parse_file(filename,filecontent){
        	const delimited = ['csv','tsv'];
        	if(delimited.includes(filename.split('.').pop())){ // Delimited text input
        		input = Papa.parse(filecontent.replace(/[{}]/g, '_'),{header:true,dynamicTyping:true,skipEmptyLines:true}); // Replace curly braces, which break JSONata when used in column headers
        		$.each(input.data, function(key,value){ // Create uuid for each item/Trace
        			input.data[key].uuid = uuidv4();
        		});
        		input_truncated = input.data.slice(0,5000); // Truncated to avoid browser overload on expansion of large arrays.
        	}
        	else{ // JSON input
        		input = JSON.parse(filecontent);
        		input_truncated = input; // TO DO: Find generic method for truncation, to avoid browser overload on expansion of large arrays.
        	}
        	input_formatter = new JSONFormatter(input_truncated,1,{theme:'dark'});
    		renderJSON($('#source'),input_formatter,input);
        	identifyType(input);		
	}
	
	// Process uploaded file
	$('#file_source').on('change', function () {
		var file = this.files[0];
        var fr = new FileReader();
        fr.onloadstart = function(){
    		$('body').loadingModal({text: 'Processing...'});        	
        }
        fr.onerror = function(){
        	$('body').loadingModal('destroy');       	
        }
        fr.onload = function(){
			parse_file(file.name,fr.result);
        	$('body').loadingModal('destroy');
        }
        fr.readAsText(file);	
	});
	
	// Process fetched file
	$('#fetch').on('click', function () {
    	$('body').loadingModal({text: 'Processing...'});
    	var filetype,
    		url = $('#datafile_url').val();
    	if(url.startsWith('https://docs.google.com/spreadsheets/')){
    		filetype = 'csv';
    		var gid = $('#datafile_url').val().split('gid=').pop();
    		url = url.split('/');
    		url.splice(-1,1,'export?format=csv&gid='+gid);
    		url = url.join('/');
    	}
    	else{
    		var filetype = $('#datafile_url').val().split('\\').pop().split('/').pop();
    	}
    	console.log('Fetch '+url);
		$.get(url, function(data) {
			parse_file(filetype,data);
		},'text').always(function() {
			$('body').loadingModal('destroy');
		});	
	});
	
	$('#JSONata_area').on('paste', function(e) {
		var JSONata = e.originalEvent.clipboardData.getData('text').replace(/(\r\n|\n|\r|\t)/gm, '').replace(/\s\s+/g, ' ');
		$('#JSONata_area').val(JSONata).select();
		document.execCommand("copy");
		mappings[$('#expression option:selected').val()].expression = JSONata;
		$('#modal').dialog('close');
	});   
		
});
