// ===========================================================
// DONE:
// UUIDs generated for all traces
// Linking of PAS and Wikidatarecords within set radius
// Mapping of Peripleo-JSON by JSONata translation to geoJSON, with array of linked data
// Autodetect known conversion types
// JSONata expression paste module
// Enable URL input 
//
// TO DO:
// SEE ALSO: https://docs.google.com/document/d/1H0KmYf405QS2ECozHpmAFsLz2MbXd_3qLKXBmLFCoJc/edit?usp=sharing
// Add links from Wikidata?
// Pad descriptions to meet Google minimum length
// Publish on GitHub pages
// Hide everything below input area until it is populated
// Switch display to side-by-side input and output?
// Indicate display truncation of very large datasets: displaying only the first 5,000 lines
// Map fields to controlled vocabulary (Schema.org AND Wikidata?), using populated drop-down lists (with text filtering?)
// Conversion for common Recogito download formats
// Implement CRS conversion
// Georeferencing/linking of any input or output identifiable as Peripleo-JSON
// Warn of unsaved edits (i.e. prompt download)
// Check Wikidata SPARQL query, which seems to return some duplicates
// Catch and requeue rejected API requests if due to overload
// Genericise API function
// ===========================================================

// https://try.jsonata.org/7guqjvnqA

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

// Download output as file
function download(jsonobject,filename=false){
	$("<a />", {
		"download": filename ? filename : "Peripleo_Data_"+ Math.floor(Date.now()/1000) +".json",
		"href" : "data:application/json," + encodeURIComponent(JSON.stringify(jsonobject))
	}).appendTo("body")
	.click(function() {
		$(this).remove()
	})[0].click()
}

// Perform conversion
function convert(){
	input_formatter.openAtDepth(0); // Close input JSON
	var expression = mappings[$('#expression option:selected').val()].expression;
	var jsonata_expression = jsonata(expression);
	output = jsonata_expression.evaluate($('#source').data('data'));
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
		clipdata.traces = clipdata.traces.slice(0,3);
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
	const jsonata_expression = jsonata(mappings[0].expression);
	const geoJSON = jsonata_expression.evaluate(el.parent('div').data('data'));
	const bounds = new mapboxgl.LngLatBounds(geoJSON.features[0].geometry.coordinates,geoJSON.features[0].geometry.coordinates);
	for (const feature of geoJSON.features) {
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
									newbody.geometry = {
										"@type": "GeoCoordinates",
										"addressCountry": "GB",
										"longitude": feature.geometry.coordinates[0],
										"latitude": feature.geometry.coordinates[1]
									}
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
    $('#examples').append('<option value="./examples/100 Sites with PAS.json">100 Sites with PAS.json</option>')
    	.append('<option value="./examples/100_Sites.csv">100_Sites.csv</option>')
    	.append('<option value="./examples/25 Sites with PAS & Wikidata.json">25 Sites with PAS & Wikidata.json</option>')
    	.append('<option value="./examples/Peripleo-JSON.jsonld">Peripleo-JSON.jsonld</option>')
    	.append('<option value="./examples/Peripleo_Data_1638897122.json">Peripleo_Data_1638897122.json</option>')
    	.append('<option value="./examples/Visitor_Sites.csv">Visitor_Sites.csv</option>')
    	.selectmenu().on('selectmenuchange',function () {
			$('body').loadingModal({text: 'Processing...'});
			$.get($('#examples option:selected').val(), function(data) {
				parse_file($('#examples option:selected').val().split('\\').pop().split('/').pop(),data);
			},'text').always(function() {
				$('body').loadingModal('destroy');
			});	
	}).trigger("selectmenuchange");
	
	// Populate JSONata expressions drop-down list
	$.get('./templates/mappings.json', function(data) {
		mappings = data;
		$.each(data, function(key,value) {
			$('#expression').append('<option value="'+key+'">'+value.description+'</option>');
		});
		$('select#expression').selectmenu();
	},'json');
	
	// Load base Wikidata SPARQL query
	$.get('./templates/wikidata_heritage_sites.sparql', function(data) {
		sparql_base = data.replace(/\#.*\r/g,''); // Remove comments, which would break the urlencoded query
	},'text');
	
	// Parse file
	function parse_file(filename,filecontent){
        	const delimited = ['csv','tsv'];
        	if(delimited.includes(filename.split('.').pop())){ // Delimited text input
        		input = Papa.parse(filecontent.replace(/[{}]/g, '_'),{header:true,dynamicTyping:true}); // Replace curly braces, which break JSONata when used in column headers
        		$.each(input.data, function(key,value){ // Create uuid for each Trace
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
		$.get($('#datafile_url').val(), function(data) {
			parse_file($('#datafile_url').val().split('\\').pop().split('/').pop(),data);
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