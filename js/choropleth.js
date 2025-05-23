// js/choropleth.js
function drawChoropleth(year = "2008") {
    const width = 800;
    const height = 500;
  
    const svg = d3.select("#choropleth")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    const projection = d3.geoMercator()
      .fitSize([width, height], window.ausGeoJSON);
  
    const path = d3.geoPath().projection(projection);
  
    // Filter CSV data by year
    const yearData = window.loadedDrugData.filter(d => d.Year === year);
  
    // Map state to drug test total
    const drugTestMap = {};
    yearData.forEach(d => {
      drugTestMap[d.Jurisdiction] = +d.TotalTests; // assume 'TotalTests' is a column
    });
  
    // Color scale
    const maxValue = d3.max(Object.values(drugTestMap));
    const color = d3.scaleSequential()
      .domain([0, maxValue])
      .interpolator(d3.interpolateBlues);
  
    // Draw map
    svg.selectAll("path")
      .data(window.ausGeoJSON.features)
      .join("path")
      .attr("d", path)
      .attr("fill", d => {
        const name = d.properties.STATE_NAME;
        const value = drugTestMap[name];
        return value ? color(value) : "#ccc";
      })
      .attr("stroke", "#fff");
  }
  