Promise.all([
  d3.csv("data/total-drug-test.csv", d3.autoType),
  d3.csv("data/positive-drug.csv", d3.autoType),
  d3.json("data/aus-states.geojson")
]).then(([drugData, positiveData, geoData]) => {
  window.sharedData = { drugData, positiveData, geoData };

  if (window.renderChoropleth) {
    window.renderChoropleth(drugData, geoData);
  }
});
