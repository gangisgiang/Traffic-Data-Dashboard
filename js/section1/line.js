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
      const posRow = positiveData.find(d => d.YEAR === year) || {};
      return {
        year,
        total: +totalRow.COUNT || 0,
        positive: +posRow.POSITIVE || 0
      };
    });
  
    const margin = { top: 10, right: 10, bottom: 20, left: 30 };
    const width = 200 - margin.left - margin.right;
    const height = 120 - margin.top - margin.bottom;
  
    const svg = tooltip.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleLinear().domain([2008, 2023]).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(combined, d => d.total)]).range([height, 0]);
  
    const area = d3.area()
      .x(d => x(d.year))
      .y0(height)
      .y1(d => y(d.positive))
      .curve(d3.curveMonotoneX);
  
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
      .attr("stroke", "#1f77b4")
      .attr("stroke-width", 2)
      .attr("d", line);
  };
  