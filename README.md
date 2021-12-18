<p align="left" width="100%">
    <img width="25%" src="/images/LaNC-logo.png" />
</p>

# ***Locolligo***: Geodata Curator
A single-page, browser-based javascript application \[*under development*\] to facilitate the formatting, linking, and geolocation of datasets, with a particular focus on Cultural Heritage. It employs standards developed by the [Pelagios Network](https://pelagios.org/), and will (for example) conform datasets for use in the Network's *Peripleo* map visualisation software, and generate metadata for the submission of datasets to the Network's historical geodata Registry.

This software is an output of the AHRC-funded [Locating a National Collection](https://www.nationalcollection.org.uk/Foundation-Projects#:~:text=Locating%20a%20National%20Collection) (LaNC) project, which sits within the AHRC programme: [Towards a National Collection: Opening UK Heritage to the World](https://www.nationalcollection.org.uk/).

* Active demonstration of prototype at https://docuracy.github.io/Locolligo/
* See also: [Development of a LaNC Data Model](https://docs.google.com/document/d/1yhVAqpPnKJ9SWfl-yg2zfMyPMTDNkerI7lCGF-pB7I8/edit?usp=sharing)
* See also: [*Locolligo*: Geodata Curator](https://docs.google.com/document/d/1H0KmYf405QS2ECozHpmAFsLz2MbXd_3qLKXBmLFCoJc/edit?usp=sharing)
* See also [Peripleo-Lite](https://docuracy.github.io/LaNC-peripleo-lite/public/) (a proof-of-concept prototype that will be developed by LaNC)

## Feature development:
- [x] Linking of [PAS](https://finds.org.uk/) and Wikidata records within a set radius
- [x] Mapping of Peripleo-LD by JSONata translation to geoJSON
- [x] Conversion of Recogito LD
- [x] Conversion of CSV to Peripleo-LD
- [x] OSGB to WGS84 CRS conversion
- [x] Standardisation of annotation fragment selectors
- [x] Implementation of schema.org vocabulary to facilitate dataset indexing and discovery
- [ ] Curated interlinking of Peripleo-LD datasets
- [ ] Georeferencing of un-gazetteered places
- [ ] Pelagios Registry metadata generation

## LaNC Project Partners

Thanks to various project partners, who may retain copyright in their respective sample datasets used in this software:

* [Historic Environment Scotland](https://www.historicenvironment.scot/) - Scottish Charity No. SC045925 © Crown copyright and database right 2020.
* [Historic England](http://www.HistoricEngland.org.uk) - contains Ordnance Survey data © Crown copyright and database right 2020.
* [The Portable Antiquities Scheme](https://finds.org.uk/) - linked images Courtesy of the Portable Antiquities Scheme - © The British Museum.
* [The National Trust](https://www.nationaltrust.org.uk/) - Registered Charity in England & Wales No. 205846
