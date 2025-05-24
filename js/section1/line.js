window.showDrugTooltipChart = function(jurisdictionCode, position) {
  const tooltip = d3.select("#tooltip-linechart");
  tooltip.html("") // clear previous content
         .style("display", "block")
         .style("left", `${position[0] + 10}px`)
         .style("top", `${position[1] + 10}px`);

  const totalData = window.sharedData.drugData.filter(d => d.JURISDICTION === jurisdictionCode);
  const positiveData = window.sharedData.positiveData.filter(d => d.JURISDICTION === jurisdictionCode);

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

  const totalSum = d3.sum(combined, d => d.total);
  const margin = { top: 10, right: 10, bottom: 25, left: 35 };
  const width = 230;
  const height = 120;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  tooltip.append("div")
    .style("margin-bottom", "4px")
    .style("color", "white")
    .html(`<strong>${jurisdictionCode}</strong>: ${d3.format(",")(totalSum)} total tests`);

  const svg = tooltip.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([2008, 2023]).range([0, innerWidth]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(combined, d => d.total)])
    .range([innerHeight, 0]);

  // AREA = Positive
  const area = d3.area()
    .x(d => x(d.year))
    .y0(innerHeight)
    .y1(d => y(d.positive))
    .curve(d3.curveMonotoneX);

  // LINE = Total
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.total))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(combined)
    .attr("fill", "#ff7f0e88")
    .attr("d", area);

  svg.append("path")
    .datum(combined)
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .attr("d", line);

  svg.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format("d")))
    .selectAll("text").attr("fill", "white");

  svg.append("g")
    .attr("transform", `translate(${innerWidth},0)`)
    .call(d3.axisRight(y).ticks(4))
    .selectAll("text").attr("fill", "white");

  svg.selectAll(".domain, .tick line").attr("stroke", "white");

  svg.append("text")
    .attr("x", 0)
    .attr("y", innerHeight + 20)
    .text("Year")
    .attr("fill", "white");

  svg.append("text")
    .attr("x", innerWidth)
    .attr("y", -5)
    .attr("text-anchor", "end")
    .text("Number of Tests")
    .attr("fill", "white");
};
