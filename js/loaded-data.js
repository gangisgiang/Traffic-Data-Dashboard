// js/load-data.js
Promise.all([
    d3.csv("data/total-drug-test.csv"),
    d3.json("data/aus-states.geojson")
  ]).then(([csvData, geoData]) => {
    window.loadedDrugData = csvData;
    window.ausGeoJSON = geoData;
    drawChoropleth(); // call draw function after data loads
  });
  