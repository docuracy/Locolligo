<p align="left" width="100%">
    <img src="/images/Locolligo.png" style="width: 30%" />
</p>

# Basic User Guide
> This User Guide will take you through the steps required to generate a location-based dataset that you can see mapped in *Peripleo*. **It assumes that you already have data in tabular format**, perhaps in a Google Sheet or an Excel file. The linking of features to other web-resources is explained in the [Advanced User Guide](./User-Guide-Advanced.md)

1. **Set Table Headers** (*This step is not essential, but it will make things easier later in the process.*)
    - **Labels**: Each of the records in your table will need to have a label for use in the mapping software: the text in the top row of the column that contains the labels should be `title`, `name`, or `label`.
    - **Location**: Ideally, you should provide the location of each of the records in your table (but don't worry if you don't have this information, as it can be added using *Locolligo*'s advanced features). You can provide the location in one of several ways:
        1. Coordinates in two separate columns (headed `longitude`, `long`, `lng`,`easting`, `westing`, or `X` and `latitude`, `lat`, `northing`, `southing`, or `Y`).
        2. Coordinates in a single column headed `coordinates` or `coords`. In this case, the coordinates must be ordered as **longitude then latitude** (*not vice-versa*), separated by a comma and enclosed in square brackets (for example `[-96.840728,32.776078]`).
        3. If your location information is in one of the GB Ordnance Survey formats, in a column headed `OSGB`.
    - **ID**: *If* each of your records has unique identifier, give their column the heading `uuid`, `id`, or `@id`.

2. Save or Export your table as CSV (Comma Separated Values).

3. Point your browser to https://docuracy.github.io/Locolligo/ (*right-click this link to avoid losing your place in this Guide*).

4. Click on `Choose Input`, then `Upload`, and follow your device's usual steps for locating and uploading the file you saved in Step 2 above.



## Download Dataset
There are two options for 'downloading' your dataset to your local filesystem (although in fact it is already held and processed locally in your device's memory):
1. Click on `Download` to save the file in JSON format.
2. Click on `CSV` to convert your dataset to CSV format (Comma Separated Values, as used by spreadsheet software).

> **CSV download needs to be rewritten to capture entire JSON object structure, together with annotation headings.**

> **Documentation yet to be completed.**
