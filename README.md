## Minnesota Situational Awareness Viewer

- Published map: https://mgacepc.org/mnsav/
- Github pages map: https://nikkypo.github.io/corona/

### About
This repository contains the code for the Minnesota Situational Awareness Viewer. The initial build of this mapping project was donated by SharedGeo. https://sharedgeo.org/

### Purpose
Initially, the idea was to develop a mapping application in response to COVID. However, it soon became apparent that there was a great need to provide the Minnesota public with a “one-stop-shop” for publicly available information.

This app is one part of an effort to rework and produce a new front side website which reflects nearly 20 years of work by the (Emergency Preparedness Committee) EPC volunteers. The intent is to integrate this viewer into that new website. On the published website you can access other situational awareness maps related to COVID, Weather, fires etc.

### Design
First release was August 2020. Use this as a starting point for a viewer which will be in continuous development going forward.

The map is built on top of a Leaflet mapping library and other Leaflet plugins. About half of the data is created from GeoJSON and the other half is being pulled in via the REST api from various sources. A lot of research went into gathering, updating, and most importantly building public data sources that you can see in the map. See more about the metadata here: https://mgacepc.org/mnsav/mnsav-metadata/

### Future
- Continue to improve usability
- Continue to add and review data as necessary
- Find and destroy bugs
