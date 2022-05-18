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

5. Click on `Assign CSV Columns`. A form should appear listing the column headers in your original table together with the `properties` to which they will be mapped in the conversion process. Any column header not set in Step 1 above will by default be ignored (but such columns can be configured using *Locolligo*'s advanced features).

6. Check the `Dataset CRS` dropbox toward the bottom of the form: `WGS84` is the most commonly-used global coordinate reference standard (decimal degrees east/west of Greenwich and north/south of the equator).

7. Click on `Convert`.

8. You will see a Validation Report: you can safely ignore warnings about Feature IDs, Google indexing, and Dataset Creator(s). Click on `Close`.

9. The converted dataset is shown in the maroon-coloured box at the bottom of the screen. Click on the `Download` button within this box, and save the file.

10. If you want to visualise your file using *Peripleo* in your own GitHub repository, and are following the process outlined [here](https://github.com/britishlibrary/peripleo)), you should now:
    - Go to the `docs` folder in your repository.
    - Click on `Add file` and `Upload files`.
    - Drag or choose the file containing your converted dataset and `Commit changes`.
    - Edit the `peripleo.config.json` file in your `docs` folder so that the "data" property points to your dataset file. For example:

``` json
"data": [
    {
      "name": "Places Where Stuff Happened",
      "format": "LINKED_PLACES",
      "src": "./places-where-stuff-happened.json",
      "attribution": "Stuff data © Your Mum"
    }
]
```
---
# Next Steps
- Read the [Advanced User Guide](./User-Guide-Advanced.md)
