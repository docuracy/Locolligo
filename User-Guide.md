<p align="left" width="100%">
    <img src="/images/Locolligo.png" style="width: 30%" />
</p>

# User Guide

## Key Features
> This guide is based on the initial configuration set up in the [master repository](https://github.com/docuracy/Locolligo), as outlined [below](./User-Guide.md#configuration). If you want to customise the configuration, you will need to 'fork' the repository into your own GitHub account.

### Load Dataset
1. Point your browser to https://docuracy.github.io/Locolligo/.
2. Click on `Choose Input`, then `Try Example`, and select `Hollar-1660.lp.json` from the drop-down list. You can explore this ready-made file (in Linked Places Format) by clicking on the triangular icons to expand and collapse the various 'object' properties.

### Local GeoData Library
Any dataset (once converted to Linked Places Format) can be saved to your browser's internal storage ([IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)), ready to be linked to other datasets.
#### Add to Library
1. Click on `Library`, then 
2. Type a name for your dataset, and then 
3. Click on `Update Library`.
#### Link to Library
Automatically link all features in the currently-loaded dataset to features in a selected GeoData Library dataset, based on configurable combinations of geographical distance and textual similarity.

> Needs to be fixed following breaking changes.
 
> Default configuration might not suit your dataset: for best results copy the software to your own GitHub repository and edit the configuration files.

1. Click on `Library`, then 
2. Select the radio button next to the name of the dataset to which you wish to create links, and then
3. Click on `Link to Library`.
#### Delete from Library
1. Click on `Library`, then 
2. Click on the bin icon next to the name of the dataset you wish to delete.

### Upload CSV & Convert to Linked Places Format (LPF)

### Manually Link & Georeference Dataset
1. Click on `Link/Georeference`.
2. If it already has coordinates, the first feature in your dataset is shown on the map; 

### Automatically Link Dataset via APIs
The API buttons are used to programmatically link all dataset features to remote web resources, based on configurable combinations of geographical distance and textual similarity. API calls are throttled to respect providers' usage limits. The preconfigured APIs are:
- `WD`: [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page) ('a free and open knowledge base that can be read and edited by both humans and machines').
- `GG`: [Geograph](https://m.geograph.org.uk/) ('geographically representative photographs and information for every square kilometre of Great Britain and Ireland').
- `WP`: Wikipedia articles linked by [GeoNames](https://www.geonames.org/export/wikipedia-webservice.html).
- `PAS`: [Portable Antiquities Scheme](https://finds.org.uk/) (archaeological finds in England and Wales).

### Download Dataset
There are two options for 'downloading' your dataset to your local filesystem (although in fact it is already held and processed locally in your device's memory):
1. Click on `Download` to save the file in JSON format.
2. Click on `CSV` to convert your dataset to CSV format (Comma Separated Values, as used by spreadsheet software).
> CSV download needs to be rewritten to capture entire JSON object structure.

### Map Dataset
Click on the `Map` button for a basic map showing all of the points in the dataset (not recommended for large datasets).

### JSON Editing
There is basic support for editing the JSON objects displayed in *Locolligo*: hover over a property's name to reveal a clickable bin for its deletion, or over a property's value to reveal a clickable pencil for editing mode. For more complex editing or additions to the object structure, you should download the dataset and use a dedicated JSON editor: try [Notepad++](https://notepad-plus-plus.org/) with its JSON Viewer plugin. 

## Configuration
Much of the configuration is determined by the files listed below, which can easily be edited if you have your own copy of the master repository. More complex configuration can be achieved by editing the main JavaScript file ([data-converter.js](./js/data-converter.js)), which includes many now-disabled sections of code used during development that might be customised and re-deployed.
- [APIs.json](./templates/APIs.json): configuration of external APIs used to gather linked data.
- [indexing.json](./templates/indexing.json): template for schema.org-compliant description of the dataset.
- [libraryMappings.json](./templates/libraryMappings.json): configuration of linkage to locally-stored [Geodata Library](./User-Guide.md#local-geodata-library) items.
- [mappings.json](./templates/mappings.json): used during development to define JSONata transformation expressions, now largely redundant.
