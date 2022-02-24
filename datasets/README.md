## This directory serves as a static Gazetteer API for any datasets stored here in Linked Places (.lp.json) format.

For example, the persistent identifer URL
* https://w3id.org/locolligo/VCH-Places/9 is redirected to
* https://docuracy.github.io/Locolligo/datasets/#VCH-Places/9 

... where javascript within index.html selects and renders the referenced feature from within the *VCH-Places.lp.json* dataset.

If the dataset includes a `citation` property, it is appended to the feature before display.
