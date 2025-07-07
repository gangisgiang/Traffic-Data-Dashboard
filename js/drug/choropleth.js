window.renderChoropleth = function(data, geoData) {
  const margin = SHARED_CONSTANTS.defaultMargin;
  const width = SHARED_CONSTANTS.defaultWidth + 200 - margin.left - margin.right;
  const height = SHARED_CONSTANTS.defaultHeight + 200 - margin.top - margin.bottom;

  const container = d3.select("#choropleth");
  container.html(""); // clear previous

  // Slider (above the map)
  const slider = container.append("div")
    .style("margin", "0 auto 20px auto")
    .style("width", "350px")
    .style("text-align", "center");

  slider.append("label")
    .attr("for", "year-slider")
    .style("margin-right", "10px")
    .text("Year:");

  const years = Array.from(new Set(data.map(d => d.YEAR))).sort();
  let currentYear = years[0];

  // Set color scale domain for the initial year before drawing the legend
  const initialYearData = data.filter(d => d.YEAR === currentYear);
  const initialTotalMap = {};
  initialYearData.forEach(d => {
    initialTotalMap[d.JURISDICTION] = +d.COUNT;
  });
  const initialMaxVal = d3.max(Object.values(initialTotalMap));
  const colorScale = d3.scaleSequential(SHARED_CONSTANTS.colorScales.blueGradient);
  colorScale.domain([0, initialMaxVal]);

  slider.append("input")
    .attr("type", "range")
    .attr("id", "year-slider")
    .attr("min", 0)
    .attr("max", years.length - 1)
    .attr("value", 0)
    .style("width", "200px")
    .on("input", function() {
      const index = +this.value;
      updateMap(years[index]);
      d3.select("#slider-year-label").text(years[index]);
    });

  slider.append("span")
    .attr("id", "slider-year-label")
    .style("margin-left", "10px")
    .text(currentYear);

  // Map from full state name to code - shared-constants.js
  const stateNameToCode = SHARED_CONSTANTS.jurisdictionNameToCode;

  // SVG for the map
  const svg = container.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "0 auto");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const projection = d3.geoMercator().fitSize([width, height], geoData);
  const path = d3.geoPath().projection(projection);

  const updateMap = (year) => {
    currentYear = year;

    const yearData = data.filter(d => d.YEAR === year);
    const totalMap = {};
    yearData.forEach(d => {
      totalMap[d.JURISDICTION] = +d.COUNT;
    });

    const maxVal = d3.max(Object.values(totalMap));
    colorScale.domain([0, maxVal]);

    g.selectAll("path.state")
      .data(geoData.features)
      .join("path")
      .attr("class", "state")
      .attr("d", path)
      .attr("fill", d => {
        const state = d.properties.STATE_NAME;
        const code = stateNameToCode[state] || state;
        const val = totalMap[code];
        return val ? colorScale(val) : "#ccc";
      })
      .attr("stroke", "none")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("stroke", "#000")
          .attr("stroke-width", 1.3)
          .attr("filter", "drop-shadow(0 0 6px #fff)");
        const state = d.properties.STATE_NAME;
        const code = stateNameToCode[state] || state;
        if (window.showDrugTooltipChart) {
          window.showDrugTooltipChart(code, [event.pageX, event.pageY], currentYear);
        }
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke", "none")
          .attr("stroke-width", null)
          .attr("filter", null);
        d3.select("#tooltip-linechart").style("display", "none");
      });

    // Add jurisdiction labels to the map
    g.selectAll("text")
      .data(geoData.features)
      .enter()
      .append("text")
      .attr("x", d => {
        const centroid = path.centroid(d);
        return centroid[0];
      })
      .attr("y", d => {
        const centroid = path.centroid(d);
        return centroid[1];
      })
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "15px")
      .attr("font-family", "Roboto, Arial, sans-serif")
      .attr("font-weight", 400)
      .attr("stroke","#000")
      .attr("fill", "#fff")
      .attr("stroke-width", 2)
      .attr("paint-order", "stroke")
      .text(d => stateNameToCode[d.properties.STATE_NAME] || d.properties.STATE_NAME);
  };

  // Initial draw
  updateMap(currentYear);

  // Legend (color scale) below the map, centered
  const legendWidth = 600;
  const legendHeight = 24;
  const legendSvg = container.append("svg")
    .attr("width", legendWidth + 40)
    .attr("height", 60)
    .style("display", "block")
    .style("margin", "-10px auto 0 auto")
    .style("stroke", "none");

  const legendG = legendSvg.append("g")
    .attr("transform", "translate(20,10)");

  const defs = legendSvg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "legend-gradient");

  linearGradient.selectAll("stop")
    .data(d3.range(0, 1.01, 0.01))
    .join("stop")
    .attr("offset", d => `${d * 100}%`)
    .attr("stop-color", d => colorScale(d * colorScale.domain()[1]));

  legendG.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)");

  const legendScale = d3.scaleLinear()
    .domain([0, 170000])
    .range([0, legendWidth]);    

  const axisG = legendG.append("g")
    .attr("transform", `translate(0,${legendHeight})`)
    .call(d3.axisBottom(legendScale)
      .tickValues([0, 20000, 50000, 100000, 150000])
      .tickFormat(d3.format(","))
      .tickSizeOuter(0)
    );
    
  axisG.select(".domain").remove();
  axisG.selectAll(".tick line").attr("stroke", "#ccc");
  axisG.selectAll(".tick text").attr("fill", "#666");
};