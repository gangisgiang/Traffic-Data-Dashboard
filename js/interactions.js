window.attachChoroplethInteractions = function(selection, path, stateNameToCode, currentYear) {
    selection
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
};

window.createSection1Dropdowns = function(data) {
    // extract options from dataset
    const years = Array.from(new Set(data.map(d => d.YEAR))).sort();
    const ageGroups = Array.from(new Set(data.map(d => d.AGE_GROUP))).sort();
    const locations = Array.from(new Set(data.map(d => d.LOCATION))).sort();
    const jurisdictions = Array.from(new Set(data.map(d => d.JURISDICTION))).sort();
    
    function populateDropdown(id, options) {
        const select = d3.select(`#${id}`);
        select.selectAll("option").remove();
        select.append("option").attr("value", "").text("All");
        select.selectAll("option.option")
        .data(options)
        .join("option")
        .attr("class", "option")
        .attr("value", d => d)
        .text(d => d);
    }
    
    populateDropdown("year-filter", years);
    populateDropdown("age-filter", ageGroups);
    populateDropdown("location-filter", locations);
    populateDropdown("jurisdiction-filter", jurisdictions);
    
    d3.selectAll("#section1-filters select").on("change", () => {
        const filters = {
        year: d3.select("#year-filter").property("value"),
        ageGroup: d3.select("#age-filter").property("value"),
        location: d3.select("#location-filter").property("value"),
        jurisdiction: d3.select("#jurisdiction-filter").property("value"),
        };
    
        if (window.updateSection1Charts) {
        window.updateSection1Charts(filters);
        }
    });
    };
    
    window.updateSection1Charts = function(filters) {
    console.log("Filters changed:", filters);
    // You can filter and re-render your chart here
};
