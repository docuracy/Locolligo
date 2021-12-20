<p align="left" width="100%">
    <img width="25%" src="/images/LaNC-logo.png" />
</p>

# ***Locolligo***: Historical Geodata Curator
(**Latin**: *loco\[s co\]lligo* &#8776; 'I link places')
<p align="right" width="100%">
    <img src="/images/colligo.jpg" />
</p>

*Locolligo* is a single-page, browser-based javascript application \[*in the early stages of development*\] to facilitate the formatting, linking, and geolocation of datasets, with a particular focus on Cultural Heritage. It employs standards developed by the [Pelagios Network](https://pelagios.org/), and will (for example) conform datasets for use in the Network's *Peripleo* map visualisation and [*Recogito*](https://recogito.pelagios.org/) annotation software, and generate metadata for the submission of datasets to the Network's historical geodata Registry. It can be downloaded and run on a standalone PC, tablet, or smartphone, without any dependency on a database or other server infrastructure; basic features will even run without an internet connection.

This software originates as an output of the AHRC-funded [**Locating a National Collection**](https://www.nationalcollection.org.uk/Foundation-Projects#:~:text=Locating%20a%20National%20Collection) (LaNC) project. Based at the British Library in London, the project is part of the AHRC programme [Towards a National Collection: Opening UK Heritage to the World](https://www.nationalcollection.org.uk/). Initial development of *Locolligo* addresses the LaNC project's aim of helping cultural heritage organisations to use geospatial data, and together with development of *Peripleo* is a major step in scoping 'technical recommendations for the development of a national discovery system whereby objects about a topic of interest can be readily discovered from a variety of sources, represented in the context of their historic environment, and referenced in time and landscape'. 

**An active demonstration of the *Locolligo* prototype is at https://docuracy.github.io/Locolligo/**

## See also:
* **Peripleo-LD**: [Development of a LaNC Data Model](https://docs.google.com/document/d/1yhVAqpPnKJ9SWfl-yg2zfMyPMTDNkerI7lCGF-pB7I8/edit?usp=sharing)
* [*Peripleo-Lite*](https://docuracy.github.io/LaNC-peripleo-lite/public/): a proof-of-concept prototype that will be developed by LaNC

## Feature development:
- [x] Convert dataset to JSON
    - [x] CSV / TSV (from upload or URL)
    - [x] Google Sheets (from URL)
    - [ ] XML (from upload or URL)
    - [ ] Google Maps KML (from URL; also convert to geoJSON)
- [x] JSON conversion to Peripleo-LD
    - [x] Recogito LD
    - [x] Uploaded datasets (JSONata configuration required, UI not yet built)
- [x] Peripleo-LD conversion to geoJSON (and basic mapping)
- [x] OSGB to WGS84 CRS conversion
- [x] Standardisation of annotation fragment selectors (see [here](https://github.com/docuracy/LaNC/blob/main/Peripleo_Fragment_Selector_SVG.js))
- [x] Implementation of [schema.org](https://schema.org/) vocabulary to facilitate dataset indexing and discovery
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
- [ ] Georeferencing of un-gazetteered places
- [ ] Pelagios Registry metadata generation
- [ ] Recogito meta-gazetteer generation
- [ ] Facilitate contributions to Wikidata
    - [ ] Prepare dataset for [Import](https://www.wikidata.org/wiki/Wikidata:Data_Import_Guide)
    - [ ] Create single items via API

## Limitations
Dataset size is limited by local device memory. It may be possible to implement chunking to address this issue.

## LaNC Project Partners
Thanks to various project partners and others, who may retain copyright in their respective sample datasets used in this software:

* [Historic Environment Scotland](https://www.historicenvironment.scot/) - Scottish Charity No. SC045925 © Crown copyright and database right 2020.
* [Historic England](http://www.HistoricEngland.org.uk) - contains Ordnance Survey data © Crown copyright and database right 2020.
* [The Portable Antiquities Scheme](https://finds.org.uk/) - linked images Courtesy of the Portable Antiquities Scheme - © The British Museum.
* [The National Trust](https://www.nationaltrust.org.uk/) - Registered Charity in England & Wales No. 205846
* [Viae Regiae](https://viaeregiae.org/) - a volunteer-driven member project of the Pelagios Network

## Other Acknowledgements
Much of the functionality of this software is provided through the use of pre-existing JavaScript libraries, notably:

* **JQuery** simplifies cross-browser implementation of HTML document traversal and manipulation, event handling, animation, and Ajax: https://jquery.com/
* **JSONata** is a query and transformation language for [JavaScript Object Notation](https://en.wikipedia.org/wiki/JSON) (JSON) datasets: https://jsonata.org/
* **Papa Parse** is 'the first (and so far only) multi-threaded CSV parser', for converting between delimited text and JSON: https://www.papaparse.com/
* **JSON Formatter** renders JSON objects in HTML with a collapsible navigation: https://azimi.me/json-formatter-js/
* **UUIDJS** generates RFC-compliant [Universally Unique IDentifiers](https://en.wikipedia.org/wiki/Universally_unique_identifier) (UUIDs) in JavaScript: https://github.com/uuidjs/uuid
* **Movable Type Scripts** convert between latitude/longitude & OS National Grid References: https://www.movable-type.co.uk/scripts/latlong-os-gridref.html
* **Proj4js** transforms point coordinates from one system to another: https://github.com/proj4js/proj4js

## Licence

All original work within this software is offered under the terms of the **CC-BY 4.0 International** licence detailed [here](./LICENSE.md).

## Suggestions / Contact
Please tag [@docuracy](https://twitter.com/docuracy) on Twitter, using the hashtags **#BL_LaNC** and **#Locolligo**
