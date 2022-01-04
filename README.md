<p align="center" width="100%">
    <img src="/images/Locolligo.png" />
</p>

# ***Locolligo***: Historical Geodata Curator
(**Latin**: *loco\[s co\]lligo* &#8776; 'I link places')
<p align="right" width="100%">
    <img src="/images/colligo.png" />
</p>

***Locolligo* is a single-page, browser-based javascript application \[*in the early stages of development*\] for the formatting, linking, and geolocation of datasets, with a particular focus on Cultural Heritage.** The greatest barrier to the visualisation, sharing, and linking of datasets that have a locational facet is the variety of ways and formats in which information has been collected, recorded, and stored. *Locolligo* seeks to dissolve that barrier.

>It will facilitate the linking of related records (*subjects* and *objects*) based on definable criteria (*predicates*):
>* between datasets, 
>* to points within existing gazetteers of places-names, and
>* to coordinates picked on modern or historical maps.
>
>The [knowledge graphs](https://en.wikipedia.org/wiki/Knowledge_graph) (collections of [semantic triples](https://en.wikipedia.org/wiki/Semantic_triple) which are the basis of [RDF](https://en.wikipedia.org/wiki/Resource_Description_Framework)) thereby created will enable the automated discovery (within a [knowledge base](https://en.wikipedia.org/wiki/Knowledge_base)) of further links between data records.

*Locolligo* employs standards developed by the [Pelagios Network](https://pelagios.org/), and will (for example) conform datasets for use in the Network's *Peripleo* map visualisation and [*Recogito*](https://recogito.pelagios.org/) annotation software, and generate metadata for the submission of datasets to the Network's historical geodata Registry. It can be downloaded and run on a standalone PC, tablet, or smartphone, without any dependency on a database or other server infrastructure; basic features will even run without an internet connection.

This software originates as an output of the AHRC-funded [**Locating a National Collection**](https://www.nationalcollection.org.uk/Foundation-Projects#:~:text=Locating%20a%20National%20Collection) (LaNC) project. Based at the British Library in London, the project is part of the AHRC programme [Towards a National Collection: Opening UK Heritage to the World](https://www.nationalcollection.org.uk/). Initial development of *Locolligo* addresses the LaNC project's aim of helping cultural heritage organisations to use geospatial data, and together with development of *Peripleo* is a major step in scoping 'technical recommendations for the development of a national discovery system whereby objects about a topic of interest can be readily discovered from a variety of sources, represented in the context of their historic environment, and referenced in time and landscape'. 

**An active demonstration of the *Locolligo* prototype is at https://docuracy.github.io/Locolligo/**
<p align="center" width="100%">
    <img border="black 1px" src="/images/Locolligo-screenshot.png" />
</p>

## See also:
* **Peripleo-LD**: [Development of a LaNC Data Model](https://docs.google.com/document/d/1yhVAqpPnKJ9SWfl-yg2zfMyPMTDNkerI7lCGF-pB7I8/edit?usp=sharing)
* [*Peripleo-Lite*](https://docuracy.github.io/LaNC-peripleo-lite/public/): a proof-of-concept prototype that will be developed by LaNC

## Feature development:
- [x] Convert the following dataset types to JSON:
    - [x] CSV / TSV (from upload or URL)
    - [x] Google Sheets (from URL)
    - [x] XML (from upload or URL)
    - [x] Google Maps KML (from upload or URL; also convert to geoJSON)
- [x] Convert the following JSON types to Peripleo-LD:
    - [x] Recogito LD
    - [x] Uploaded datasets (JSONata configuration required, UI not yet built)
- [x] Convert Peripleo-LD to:
    - [x] [geoJSON](https://geojson.org/) (with basic mapping; *geoWithin* properties not yet supported)
    - [ ] [Turtle](https://en.wikipedia.org/wiki/Turtle_(syntax)) RDF
    - [ ] CSV for batch contribution to Wikidata via [*QuickStatements*](https://quickstatements.toolforge.org/)
- [x] Conform geodata to [WGS84](https://en.wikipedia.org/wiki/World_Geodetic_System) from:
    - [x] [OSGB](https://en.wikipedia.org/wiki/Ordnance_Survey_National_Grid) (Ordnance Survey of Great Britain)
    - [ ] [What3Words](https://what3words.com/about)
- [x] Standardisation of annotation fragment selectors (see [here](https://github.com/docuracy/LaNC/blob/main/Peripleo_Fragment_Selector_SVG.js))
- [x] Implementation of [schema.org](https://schema.org/) vocabulary to facilitate dataset indexing and discovery
- [ ] Location approximation: translation of text values to schema.org *geoRadius* values and *geoWithin* *geoCircle*s
- [ ] UI for configuration of JSONata transformation of unrecognised data models
- [ ] Facilitate editing of dataset metadata
- [ ] Data Linking
    - [x] Archaeological finds within radius: [PAS](https://finds.org.uk/) API
    - [x] Cultural Heritage sites within radius: [Wikidata](https://www.wikidata.org/)
    - [ ] Wikipedia articles: GeoNames API
    - [ ] Historical Plaques: OpenPlaques.org API (or data dump converted to Peripleo-LD)
    - [ ] Curated interlinking of Peripleo-LD datasets
- [ ] Geocoding of place-names
    - [ ] [World Historical Gazetteer](https://whgazetteer.org/)
    - [ ] Wikidata
    - [ ] Geonames
    - [ ] Google
- [ ] Geocoding of un-gazetteered places
    - [ ]  Use georeferenced historical basemaps as citable references
    - [ ]  Create linked Wikidata item with geo-coordinates, using programmatically-submitted [*QuickStatements* batch jobs](https://quickstatements.toolforge.org/#/user) (default CORS policy prevents direct use of API)
- [ ] Pelagios Registry metadata generation
- [ ] Recogito meta-gazetteer generation

## Limitations
Dataset size is limited by local device memory, although a PC with 16GB of memory easily copes with 25,000 records in a 12-field csv input file. It may be possible to implement chunking if necessary for larger files.

## LaNC Project Partners
Thanks to various project partners and others, who may retain copyright in their respective sample datasets used in this software:

* [Historic Environment Scotland](https://www.historicenvironment.scot/) - Scottish Charity No. SC045925 © Crown copyright and database right 2020.
* [Historic England](http://www.HistoricEngland.org.uk) - contains Ordnance Survey data © Crown copyright and database right 2020.
* [The Portable Antiquities Scheme](https://finds.org.uk/) - linked images Courtesy of the Portable Antiquities Scheme - © The British Museum.
* [The National Trust](https://www.nationaltrust.org.uk/) - Registered Charity in England & Wales No. 205846
* [Viae Regiae](https://viaeregiae.org/) - a volunteer-driven member project of the Pelagios Network

## Other Acknowledgements
Much of the functionality of this software is provided through the use of pre-existing JavaScript libraries, notably the following:

* **JQuery** simplifies cross-browser implementation of HTML document traversal and manipulation, event handling, animation, and Ajax: https://jquery.com/
* **JSONata** is a query and transformation language for [JavaScript Object Notation](https://en.wikipedia.org/wiki/JSON) (JSON) datasets: https://jsonata.org/
* **Papa Parse** is 'the first (and so far only) multi-threaded CSV parser', for converting between delimited text and JSON: https://www.papaparse.com/
* **Fast XML Parser** converts XML (and map-specific KML) to JSON: https://github.com/NaturalIntelligence/fast-xml-parser
* **JSON Formatter** renders JSON objects in HTML with a collapsible navigation: https://azimi.me/json-formatter-js/
* **UUIDJS** generates RFC-compliant [Universally Unique IDentifiers](https://en.wikipedia.org/wiki/Universally_unique_identifier) (UUIDs) in JavaScript: https://github.com/uuidjs/uuid
* **Movable Type Scripts** convert between latitude/longitude & OS National Grid References: https://www.movable-type.co.uk/scripts/latlong-os-gridref.html
* **Proj4js** transforms point coordinates from one system to another: https://github.com/proj4js/proj4js

## Licence
All original work within this software is offered under the terms of the **CC-BY 4.0 International** licence detailed [here](./LICENSE.md).

## Suggestions / Contact
Please tag [@docuracy](https://twitter.com/docuracy) on Twitter, using the hashtags **#BL_LaNC** and **#Locolligo**
