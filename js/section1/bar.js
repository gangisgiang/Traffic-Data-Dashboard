window.renderPositiveDrugBarChart = function(data) {
    const margin = SHARED_CONSTANTS.defaultMargin;
    const width = SHARED_CONSTANTS.defaultWidth - margin.left - margin.right;
    const height = SHARED_CONSTANTS.defaultHeight - margin.top - margin.bottom;
  
    const container = d3.select("#positive-drug-bar-chart");
    container.html(""); // clear previous
  
    // Debug: Check what data we're getting
    console.log('Positive drug data first 5 rows:', data.slice(0, 5));
    console.log('Total rows:', data.length);
    console.log('Sample row structure:', data[0]);
    
    // Check for non-zero COUNT values
    const nonZeroRows = data.filter(d => +d.COUNT > 0);
    console.log('Rows with COUNT > 0:', nonZeroRows.length);
    console.log('Sample non-zero row:', nonZeroRows[0]);
  
    // Step 1: Aggregate total positives per jurisdiction using COUNT field
    const totalsByJurisdiction = d3.rollup(
      data,
      v => d3.sum(v, d => +d.COUNT || 0),
      d => d.JURISDICTION
    );
  
    console.log('Aggregated totals by jurisdiction:', Array.from(totalsByJurisdiction));
  
    const jurisdictions = Array.from(totalsByJurisdiction.keys());
    const values = Array.from(totalsByJurisdiction.values());
    const maxValue = d3.max(values);
  
    console.log('Jurisdictions:', jurisdictions);
    console.log('Values:', values);
    console.log('Max value:', maxValue);
  
    // Set minimum scale if all values are zero
    const finalMaxValue = maxValue > 0 ? maxValue : 1000;
  
    const svg = container.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Step 2: Create scales
    const x = d3.scaleBand()
      .domain(jurisdictions)
      .range([0, width])
      .padding(0.2);
  
    const y = d3.scaleLinear()
      .domain([0, finalMaxValue])
      .nice()
      .range([height, 0]);
  
    // Step 3: Draw bars
    svg.selectAll("rect")
      .data(Array.from(totalsByJurisdiction))
      .join("rect")
      .attr("x", d => x(d[0]))
      .attr("y", d => y(d[1]))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d[1]))
      .attr("fill", "#ff7f0e");
  
    // Step 4: Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "12px");
  
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(",d")))
      .selectAll("text")
      .style("font-size", "12px");
  
    // Step 5: Axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .text("Jurisdiction");
  
    svg.append("text")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .text("Total Positive Drug Tests");
  };
  