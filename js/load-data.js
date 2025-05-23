Promise.all([
    d3.csv("data/total-drug-test.csv", d3.autoType),
    d3.json("data/aus-states.geojson")
  ]).then(([drugData, geoData]) => {
    window.sharedData = { drugData, geoData };
  
    if (window.renderChoropleth) {
      window.renderChoropleth(drugData, geoData);
    }
  });
  