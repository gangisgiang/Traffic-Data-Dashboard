window.showDrugTooltipChart = function(jurisdictionCode, position) {
  const tooltip = d3.select("#tooltip-linechart");
  tooltip.html("").style("display", "block")
         .style("left", `${position[0] + 10}px`)
         .style("top", `${position[1] + 10}px`);

  const totalData = window.sharedData.drugData.filter(d => d.JURISDICTION === jurisdictionCode);
  const positiveData = window.sharedData.positiveData.filter(d => d.JURISDICTION === jurisdictionCode);

  const years = d3.range(2008, 2024);
  const combined = years.map(year => {
    const totalRow = totalData.find(d => d.YEAR === year) || {};
    // Aggregate positive data by summing all COUNT values for this year/jurisdiction
    const positiveCount = positiveData
      .filter(d => d.YEAR === year)
      .reduce((sum, d) => sum + (+d.COUNT || 0), 0);
    
    return {
      year,
      total: +totalRow.COUNT || 0,
      positive: positiveCount
    };
  });

  // Add title
  tooltip.append("div")
    .style("text-align", "center")
    .style("font-weight", "bold")
    .style("margin-bottom", "15px")
    .style("color", "#fff")
    .style("font-size", "14px")
    .text(`${jurisdictionCode} - Drug Tests (2008-2023)`);

  const margin = { top: 25, right: 25, bottom: 50, left: 40 };
  const width = 310 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  const svg = tooltip.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", "-10px")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([2008, 2023]).range([0, width]);
  const maxValue = d3.max(combined, d => d.total);
  const y = d3.scaleLinear().domain([0, maxValue]).range([height, 0]);

  // Add axes with fewer ticks
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickValues([2008, 2015, 2023]).tickFormat(d3.format("d")))
    .selectAll("text")
    .style("fill", "#fff")
    .style("font-size", "11px");
  
  svg.append("g")
    .call(d3.axisLeft(y).tickValues([0, Math.round(maxValue/4), Math.round(maxValue/2), Math.round(maxValue*3/4), maxValue]).tickFormat(d => d >= 1000 ? d3.format(".0s")(d) : d))
    .selectAll("text")
    .style("fill", "#fff")
    .style("font-size", "11px");
   
  // Style axis lines
  svg.selectAll(".domain, .tick line")
    .style("stroke", "#fff")
    .style("stroke-width", 1);

  const area = d3.area()
    .x(d => x(d.year))
    .y0(height)
    .y1(d => y(d.positive))
    .curve(d3.curveMonotoneX);

  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.total))
    .curve(d3.curveMonotoneX);

  // Add filled area for positive tests
  svg.append("path")
    .datum(combined)
    .attr("fill", "#ff7f0e")
    .attr("fill-opacity", 0.6)
    .attr("d", area);

  // Add line for total tests
  svg.append("path")
    .datum(combined)
    .attr("fill", "none")
    .attr("stroke", "#1f77b4")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Add legend
  const legend = tooltip.append("div")
    .style("margin-top", "15px")
    .style("font-size", "12px")
    .style("color", "#fff");
  
  const legendItems = legend.append("div")
    .style("display", "flex")
    .style("justify-content", "space-around");
  
  legendItems.append("div")
    .html("── Total drug tests")
    .style("color", "#1f77b4");
  
  legendItems.append("div")
    .html("▬ Positive drug tests")
    .style("color", "#ff7f0e");
};
