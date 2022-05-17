<p align="left" width="100%">
    <img src="/images/Locolligo.png" style="width: 30%" />
</p>

# User Guide

## Demonstration of key features
This demonstration is based on the initial configuration set up in the [master repository](https://github.com/docuracy/Locolligo), as outlined [below](./User-Guide.md#configuration). If you want to customise the configuration, you will need to `fork` the repository into your own GitHub account.

### Load Dataset
1. Point your browser to https://docuracy.github.io/Locolligo/.
2. Click on `Choose Input`, then `Try Example`, and select `Hollar-1660.lp.json` from the drop-down list. You can explore this ready-made file (in Linked Places Format) by clicking on the triangular icons to expand and collapse the various 'object' properties.

### Map Dataset
Click on the `Map` button for a basic map showing all of the points in the dataset (not recommended for large datasets).

## Configuration
Much of the configuration is determined by the files listed below, which can easily be edited if you have your own copy of the master repository. More complex configuration can be achieved by editing the main JavaScript file ([data-converter.js](./js/data-converter.js)), which includes many now-disabled sections of code used during development that might be customised and re-deployed.
- [APIs.json](./templates/APIs.json): configuration of external APIs used to gather linked data.
- [indexing.json](./templates/indexing.json): template for schema.org-compliant description of the dataset.
- [libraryMappings.json](./templates/libraryMappings.json): configuration of linkage to locally-stored Geodata Library items.
- [mappings.json](./templates/mappings.json): used during development to define JSONata transformation expressions, now largely redundant.
