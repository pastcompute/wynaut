# Data Loading

## Image information data set - data conversion process

* There are 80000 records in the CSV. Thats 30 megabytes...
* The second generation, if we have time on Sunday, can have an API on a VPS to speed up loading

* But to start with, I've pulled out XXXX records and manually converted to JSON so we can prove the web page design first.
* Manual conversion via http://www.csvjson.com/csv2json

* Filtered as follows:
- images with latitude and longiutide so we can map them. Done using open office
- and also the gallery is not playing nice when they are missing. Some pictures dont work!

Summary:

Original CSV has 81673 images listed
13043 have a geotag
Of those, XXX have a proper image URL
We found an unknown number of those did not load (returned a 404), we didnt have time to find them all



