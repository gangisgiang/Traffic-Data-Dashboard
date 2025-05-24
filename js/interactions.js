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
  