/**
 * Creates a choropleth chart showing total drug tests by jurisdiction
 * @param {string} containerId - The ID of the container element
 * @param {Object} data - The data object containing geoData and jurisdictionTotals
 */
async function createDrugTestChoropleth(containerId, data) {
    // Only clear the SVG, not the whole container
    d3.select(`#${containerId}`).selectAll('svg').remove();
    const { geoData, jurisdictionTotals } = data;
    
    // 7 milestones for color and legend
    const milestones = [0, 5000, 15000, 50000, 100000, 120000, 150000];
    const colorScale = d3.scaleThreshold()
        .domain(milestones.slice(1))
        .range(d3.schemeBlues[7]);

    // Set up the dimensions and margins
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 1200 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    // Create the SVG container
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create a projection for Australia
    const projection = d3.geoMercator()
        .fitSize([width, height], geoData);
    
    // Create the path generator
    const path = d3.geoPath().projection(projection);
    
    // Add the states (filled polygons, thin stroke matching fill color)
    svg.selectAll("path.state")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("d", path)
        .attr("fill", d => colorScale(d.properties.totalDrugTests))
        .attr("stroke", d => colorScale(d.properties.totalDrugTests))
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
            // Remove any existing hover path
            svg.selectAll("path.state-hover").remove();
            // Draw a new path for the hovered state with a black stroke on top
            svg.append("path")
                .datum(d)
                .attr("class", "state-hover")
                .attr("d", path)
                .attr("fill", "none")
                .attr("stroke", "#000")
                .attr("stroke-width", 2)
                .attr("pointer-events", "none");
            // Show tooltip
            tooltip
                .style("opacity", 1)
                .html(`
                    <strong>${d.properties.STATE_NAME}</strong><br/>
                    Total Drug Tests: ${d.properties.totalDrugTests.toLocaleString()}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            // Remove the hover path
            svg.selectAll("path.state-hover").remove();
            // Hide tooltip
            tooltip.style("opacity", 0);
        });

    // Draw a single border path for all states on top
    svg.append("path")
        .datum(topojson.mesh(geoData, geoData.features, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-width", 2)
        .attr("d", path);
    
    // Create a tooltip div
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("pointer-events", "none");
}

// Render the legend only once
function renderChoroplethLegend() {
    console.log("Rendering legend", document.getElementById('choropleth-legend'));
    d3.select('#choropleth-legend').selectAll('*').remove();
    const legendWidth = 600;
    const legendHeight = 40;
    const legendRectWidth = legendWidth / milestones.length;
    const legendLabels = milestones;

    const legendSvg = d3.select('#choropleth-legend')
        .append('svg')
        .attr('width', legendWidth)
        .attr('height', legendHeight + 20);

    const legendGroup = legendSvg.append('g')
        .attr('class', 'legend-horizontal')
        .attr('transform', `translate(0, 20)`);

    // Draw color rectangles horizontally
    legendGroup.selectAll('rect')
        .data(colorScale.range())
        .enter()
        .append('rect')
        .attr('x', (d, i) => i * legendRectWidth)
        .attr('y', 0)
        .attr('width', legendRectWidth)
        .attr('height', 20)
        .attr('fill', d => d);

    // Place milestone labels to the right of each color cell
    legendGroup.selectAll('text')
        .data(legendLabels)
        .enter()
        .append('text')
        .attr('x', (d, i) => i * legendRectWidth + (i === 0 ? 0 : legendRectWidth))
        .attr('y', 35)
        .attr('text-anchor', (d, i) => i === 0 ? 'start' : 'end')
        .attr('font-size', 12)
        .attr('font-family', 'serif')
        .attr('font-weight', 'bold')
        .text(d => d3.format(',')(d));
}

export { createDrugTestChoropleth, renderChoroplethLegend }; 