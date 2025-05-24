window.showDrugTooltipChart = function(jurisdictionCode, position) {
  const tooltip = d3.select("#tooltip-linechart");
  tooltip.html("") // clear previous content
         .style("display", "block")
         .style("left", `${position[0] + 10}px`)
         .style("top", `${position[1] + 10}px`);

  const totalData = window.sharedData.drugData.filter(d => d.JURISDICTION === jurisdictionCode);
  const positiveData = window.sharedData.positiveData.filter(d => d.JURISDICTION === jurisdictionCode);

  // Debug: Log the data to see what's happening
  console.log(`Jurisdiction: ${jurisdictionCode}`);
  console.log('Total data sample:', totalData.slice(0, 3));
  console.log('Positive data sample:', positiveData.slice(0, 3));
  console.log('All positive data jurisdictions:', [...new Set(window.sharedData.positiveData.map(d => d.JURISDICTION))]);

  const years = d3.range(2008, 2024);
  const combined = years.map(year => {
    const totalRow = totalData.find(d => d.YEAR === year) || {};
    const posRow = positiveData.find(d => d.YEAR === year) || {};
    return {
      year,
      total: +totalRow.COUNT || 0,
      positive: +posRow.POSITIVE || 0
    };
  });

  // Debug: Log combined data to see positive values
  console.log('Combined data sample:', combined.slice(0, 5));

  const totalSum = d3.sum(combined, d => d.total);
  const positiveSum = d3.sum(combined, d => d.positive);
  const margin = { top: 15, right: 15, bottom: 35, left: 50 };
  const width = 280;
  const height = 150;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Title with jurisdiction and totals
  tooltip.append("div")
    .style("margin-bottom", "8px")
    .style("color", "white")
    .style("font-weight", "bold")
    .style("text-align", "center")
    .html(`${jurisdictionCode}`);

  const svg = tooltip.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([2008, 2023]).range([0, innerWidth]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(combined, d => d.total)])
    .range([innerHeight, 0]);

  // FILLED AREA = Positive drug tests
  const area = d3.area()
    .x(d => x(d.year))
    .y0(innerHeight)
    .y1(d => y(d.positive))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(combined)
    .attr("fill", "#ff7f0e")
    .attr("fill-opacity", 0.6)
    .attr("d", area);

  // LINE = Total drug tests
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.total))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(combined)
    .attr("fill", "none")
    .attr("stroke", "#1f77b4")
    .attr("stroke-width", 2)
    .attr("d", line);

  // X-axis
  svg.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format("d")))
    .selectAll("text")
    .attr("fill", "white")
    .style("font-size", "10px");

  // Y-axis
  svg.append("g")
    .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format(".0s")))
    .selectAll("text")
    .attr("fill", "white")
    .style("font-size", "10px");

  // Style axis lines
  svg.selectAll(".domain, .tick line").attr("stroke", "#ccc").attr("stroke-width", 1);

  // X-axis label
  svg.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 30)
    .attr("text-anchor", "middle")
    .text("Year")
    .attr("fill", "white")
    .style("font-size", "11px");

  // Y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -35)
    .attr("text-anchor", "middle")
    .text("Number of Tests")
    .attr("fill", "white")
    .style("font-size", "11px");

  // Legend
  const legend = tooltip.append("div")
    .style("margin-top", "8px")
    .style("font-size", "10px")
    .style("color", "white");

  legend.append("div")
    .html(`<span style="color: #1f77b4; font-weight: bold;">—</span> Total drug tests: ${d3.format(",")(totalSum)}`);

  legend.append("div")
    .html(`<span style="color: #ff7f0e; font-weight: bold;">▉</span> Positive drug tests: ${d3.format(",")(positiveSum)}`);
};
