window.mapAgeToAgeGroup = function(age) {
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return "Unknown";
    
    if (ageNum < 18) return "Under 18";
    if (ageNum >= 18 && ageNum <= 24) return "18-24";
    if (ageNum >= 25 && ageNum <= 34) return "25-34";
    if (ageNum >= 35 && ageNum <= 44) return "35-44";
    if (ageNum >= 45 && ageNum <= 54) return "45-54";
    if (ageNum >= 55 && ageNum <= 64) return "55-64";
    if (ageNum >= 65) return "65+";
    
    return "Unknown";
};

window.standardizeAgeGroup = function(ageGroup) {
    if (!ageGroup) return "Unknown";
    
    const ag = ageGroup.toString().toLowerCase().trim();
    
    if (["18-24", "25-34", "35-44", "45-54", "55-64", "65+", "under 18"].includes(ag)) {
        return ag === "under 18" ? "Under 18" : ageGroup;
    }
    
    if (ag.includes("18") && ag.includes("24")) return "18-24";
    if (ag.includes("25") && ag.includes("34")) return "25-34";
    if (ag.includes("35") && ag.includes("44")) return "35-44";
    if (ag.includes("45") && ag.includes("54")) return "45-54";
    if (ag.includes("55") && ag.includes("64")) return "55-64";
    if (ag.includes("65") || ag.includes("over") || ag.includes("+")) return "65+";
    if (ag.includes("under") && ag.includes("18")) return "Under 18";
    
    const ageNum = parseInt(ag);
    if (!isNaN(ageNum)) {
        if (ageNum < 18) return "Under 18";
        if (ageNum >= 18 && ageNum <= 24) return "18-24";
        if (ageNum >= 25 && ageNum <= 34) return "25-34";
        if (ageNum >= 35 && ageNum <= 44) return "35-44";
        if (ageNum >= 45 && ageNum <= 54) return "45-54";
        if (ageNum >= 55 && ageNum <= 64) return "55-64";
        if (ageNum >= 65) return "65+";
    }
    
    return "Unknown";
};

window.renderComboChart = function(drugConsequenceData, seatbeltData, positiveData, seatbeltConsequenceData) {
    const margin = SHARED_CONSTANTS.defaultMargin;
    const width = SHARED_CONSTANTS.defaultWidth - margin.left - margin.right - 350;
    const height = SHARED_CONSTANTS.defaultHeight - margin.top - margin.bottom - 250;
    const container = d3.select("#combo-chart");
    container.html("");
    const totalSvgWidth = width + margin.left + margin.right + 370;
    const chartAreaWidth = width + margin.left + margin.right;
    const centeredLeft = (totalSvgWidth - chartAreaWidth) / 2 + margin.left;
    const svg = container.append("svg")
        .attr("width", totalSvgWidth)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${centeredLeft},${margin.top})`);

    window.updateComboChart = function(filters = {}) {
        svg.selectAll("*").remove();
        console.log("Violation type:", filters.violationType);
        console.log("Seatbelt consequence data sample:", seatbeltConsequenceData.slice(0, 5));
        console.log("Drug consequence data sample:", drugConsequenceData.slice(0, 5));

        let finesData;
        if (filters.violationType === "seatbelt") {
            finesData = seatbeltData.filter(d => d.JURISDICTION === "SA");
        } else {
            finesData = positiveData.filter(d => d.JURISDICTION === "SA");
        }

        let crashData = filters.violationType === "seatbelt" ? seatbeltConsequenceData : drugConsequenceData;
        console.log("Selected crash data sample:", crashData.slice(0, 5));

        if (filters.year && filters.year !== "") {
            finesData = finesData.filter(d => d.YEAR == filters.year);
            crashData = crashData.filter(d => d.YEAR == filters.year || d.Year == filters.year);
        }

        if (filters.ageGroup && filters.ageGroup !== "") {
            console.log("=== COMBO CHART AGE FILTERING DEBUG ===");
            console.log("Filter age group:", filters.ageGroup);
            console.log("Violation type:", filters.violationType);
            console.log("Initial fines data size:", finesData.length);
            console.log("Initial crash data size:", crashData.length);
            console.log("Sample fines data age groups:", 
                finesData.slice(0, 10).map(d => d.AGE_GROUP)
            );
            
            const finesBeforeFilter = finesData.length;
            
            if (finesData.length > 0 && finesData[0].AGE_GROUP === undefined) {
                console.error("ERROR: AGE_GROUP field missing in fines data!");
                console.log("Fines data columns:", Object.keys(finesData[0]));
            }
            
            finesData = finesData.filter(d => {
                const match = d.AGE_GROUP === filters.ageGroup;
                if (match) {
                    console.log("Fines match found:", d.AGE_GROUP, "===", filters.ageGroup);
                }
                return match;
            });
            console.log(`Fines data: ${finesBeforeFilter} -> ${finesData.length} after age filter`);
            
            if (finesData.length === 0) {
                console.warn("WARNING: No fines data after age filtering!");
                console.log("Available age groups in original fines data:", 
                    [...new Set(seatbeltData.concat(positiveData).map(d => d.AGE_GROUP))].filter(Boolean)
                );
            }
            
            if (filters.violationType === "seatbelt") {
                const crashBeforeFilter = crashData.length;
                
                if (crashData.length > 0) {
                    console.log("Crash data columns:", Object.keys(crashData[0]));
                    console.log("Sample crash data age groups:", 
                        crashData.slice(0, 10).map(d => ({
                            original: d.AGE_GROUP,
                            mapped: window.mapToDropdownAgeGroup ? window.mapToDropdownAgeGroup(d.AGE_GROUP) : "MAPPING FUNCTION MISSING"
                        }))
                    );
                }
                
                if (!window.mapToDropdownAgeGroup) {
                    console.error("ERROR: window.mapToDropdownAgeGroup function is missing!");
                    crashData = crashData.filter(d => d.AGE_GROUP === filters.ageGroup);
                } else {
                    crashData = crashData.filter(d => {
                        const mappedAge = window.mapToDropdownAgeGroup(d.AGE_GROUP);
                        const match = mappedAge === filters.ageGroup;
                        if (match) {
                            console.log(`Seatbelt crash match: ${d.AGE_GROUP} -> ${mappedAge} matches ${filters.ageGroup}`);
                        }
                        return match;
                    });
                }
                console.log(`Seatbelt crash data: ${crashBeforeFilter} -> ${crashData.length} after age filter`);
            } else {
                const crashBeforeFilter = crashData.length;
                console.log("Drug crash data columns:", crashData.length > 0 ? Object.keys(crashData[0]) : "No data");
                
                const hasAgeField = crashData.length > 0 && (
                    crashData[0].AGE_GROUP !== undefined ||
                    crashData[0].Age !== undefined ||
                    crashData[0].age !== undefined ||
                    crashData[0].AGE !== undefined
                );
                
                if (hasAgeField) {
                    console.log("Drug crash data HAS age info, attempting to filter");
                    if (!window.mapToDropdownAgeGroup) {
                        console.error("ERROR: window.mapToDropdownAgeGroup function is missing!");
                        crashData = [];
                    } else {
                        crashData = crashData.filter(d => {
                            const ageValue = d.AGE_GROUP || d.Age || d.age || d.AGE;
                            const mappedAge = window.mapToDropdownAgeGroup(ageValue);
                            return mappedAge === filters.ageGroup;
                        });
                    }
                    console.log(`Drug crash data: ${crashBeforeFilter} -> ${crashData.length} after age filter`);
                } else {
                    console.log("Drug crash data has NO age info, clearing data for age filter");
                    crashData = [];
                }
            }
            
            console.log("Final fines data size:", finesData.length);
            console.log("Final crash data size:", crashData.length);
            
            if (finesData.length === 0 && crashData.length === 0) {
                console.warn("WARNING: Both fines and crash data are empty after filtering!");
            }
            
            console.log("=== END COMBO CHART AGE FILTERING DEBUG ===");
        }
        
        if (filters.region && filters.region !== "") {
            finesData = finesData.filter(d => d.LOCATION === filters.region);
            crashData = crashData.filter(d => {
                return d['Stats Area'] === filters.region || 
                       d.LOCATION === filters.region || 
                       d.Region === filters.region ||
                       !filters.region;
            });
        }

        console.log("Filtered crash data sample:", crashData.slice(0, 5));
        console.log("Total crash data length:", crashData.length);
        console.log("Crash data columns:", crashData.length > 0 ? Object.keys(crashData[0]) : "No data");

        const finesByYear = d3.rollup(
            finesData,
            v => {
                if (filters.violationType === "seatbelt") {
                    return d3.sum(v, d => +d.FINES || 0);
                } else {
                    return d3.sum(v, d => +d.COUNT || 0);
                }
            },
            d => +d.YEAR
        );

        const crashesByYear = d3.rollup(
            crashData,
            v => v.length,
            d => +(d.YEAR || d.Year)
        );

        console.log("Crashes by year:", Object.fromEntries(crashesByYear));
        console.log("Fines by year:", Object.fromEntries(finesByYear));

        const allYears = d3.range(2019, 2024);
        
        const combinedData = allYears.map(year => ({
            year,
            fines: finesByYear.get(year) || 0,
            crashes: crashesByYear.get(year) || 0
        }));

        console.log("Combined data:", combinedData);

        const totalCrashes = d3.sum(combinedData, d => d.crashes);
        console.log("Total crashes across all years:", totalCrashes);

        if (combinedData.length === 0 || totalCrashes === 0) {
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "#666")
                .text(totalCrashes === 0 ? "No crash data available for current filters" : "No data available for current filters");
            return;
        }

        const x = d3.scaleBand()
            .domain(allYears.map(String))
            .range([0, width])
            .padding(allYears.length === 1 ? 0.8 : 0.6);
        
        const maxFines = d3.max(combinedData, d => d.fines) || 0;
        const maxCrashes = d3.max(combinedData, d => d.crashes) || 0;
        
        console.log("Max fines:", maxFines, "Max crashes:", maxCrashes);
        
        let adjustedMaxFines = maxFines;
        if (adjustedMaxFines === 0) adjustedMaxFines = 1;
        
        let adjustedMaxCrashes = maxCrashes;
        if (adjustedMaxCrashes === 0) adjustedMaxCrashes = 1;
        
        const yLeft = d3.scaleLinear()
            .domain([0, adjustedMaxFines])
            .nice()
            .range([height, 0]);
        
        const yRight = d3.scaleLinear()
            .domain([0, adjustedMaxCrashes])
            .nice()
            .range([height, 0]);

        const tickFormat = d => {
            if (d === 0) return "0";
            if (d >= 1000) return (d / 1000) + "k";
            return d.toString();
        };

        svg.append("rect")
            .attr("class", "combo-bg-reset")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "transparent")
            .on("click", function() {
                selectedYear = null;
                svg.selectAll(".combo-bar")
                    .transition().duration(200)
                    .attr("fill", "rgb(5, 40, 91)")
                    .attr("opacity", 1);
                svg.selectAll(".combo-circle")
                    .transition().duration(200)
                    .attr("fill", "#42bcf5")
                    .attr("opacity", 1);
                if (window.onComboChartDeselection) window.onComboChartDeselection(filters);
            });

        let selectedYear = null;

        const bars = svg.selectAll(".combo-bar")
            .data(combinedData)
            .join("rect")
            .attr("class", "combo-bar")
            .attr("x", d => x(String(d.year)))
            .attr("y", height)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", "rgb(5, 40, 91)")
            .style("cursor", "pointer");

        bars.transition()
            .duration(800)
            .attr("y", d => yLeft(d.fines))
            .attr("height", d => height - yLeft(d.fines));

        bars
            .on("click", (event, d) => handleElementClick(event, d, svg, selectedYear, filters))
            .on("mouseover", (event, d) => handleElementHover(event, d, d3.select(this), selectedYear, filters))
            .on("mouseout", (event, d) => handleElementMouseout(event, d, d3.select(this), selectedYear));

        const line = d3.line()
            .x(d => x(String(d.year)) + x.bandwidth() / 2)
            .y(d => yRight(d.crashes))
            .curve(d3.curveMonotoneX);

        if (maxCrashes > 0) {
            const path = svg.append("path")
                .datum(combinedData.filter(d => d.crashes > 0))
                .attr("fill", "none")
                .attr("stroke", "#42bcf5")
                .attr("stroke-width", 3)
                .attr("d", line);
        }

        const circles = svg.selectAll(".combo-circle")
            .data(combinedData)
            .join("circle")
            .attr("class", "combo-circle")
            .attr("cx", d => x(String(d.year)) + x.bandwidth() / 2)
            .attr("cy", d => yRight(d.crashes))
            .attr("r", d => d.crashes > 0 ? 4 : 2)
            .attr("fill", d => d.crashes > 0 ? "#42bcf5" : "#ccc")
            .attr("stroke", d => d.crashes > 0 ? "none" : "#999")
            .attr("stroke-width", d => d.crashes > 0 ? 0 : 1)
            .style("cursor", "pointer");

        circles
            .on("click", (event, d) => handleElementClick(event, d, svg, selectedYear, filters))
            .on("mouseover", (event, d) => {
                const element = d3.select(this);
                const currentFill = element.attr("fill");
                if (currentFill !== "#8db9d9" && d.year !== selectedYear) {
                    element.transition().duration(200)
                        .attr("r", 6)
                        .attr("fill", "#6cc8f5");
                }
                window.showComboTooltip(event, d, filters.violationType);
            })
            .on("mouseout", (event, d) => {
                const element = d3.select(this);
                const correctFill = d.year === selectedYear ? "#42bcf5" : 
                                  selectedYear !== null ? "#8db9d9" : "#42bcf5";
                const correctOpacity = d.year === selectedYear || selectedYear === null ? 1 : 0.6;
                element.transition().duration(200)
                    .attr("r", 4)
                    .attr("fill", correctFill)
                    .attr("opacity", correctOpacity);
                window.hideTooltip();
            });

        svg.append("g")
            .call(d3.axisLeft(yLeft)
                .ticks(6)
                .tickFormat(tickFormat)
            )
            .selectAll("text")
            .style("font-size", "14px");

        svg.append("g")
            .attr("transform", `translate(${width},0)`)
            .call(d3.axisRight(yRight)
                .ticks(6)
                .tickFormat(tickFormat)
            )
            .selectAll("text")
            .style("font-size", "14px");

        const xAxis = svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d => {
                return Array.from(x.domain()).includes(d) ? d : "";
            }));
        
        xAxis.selectAll("text")
            .style("font-size", "14px")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 60)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Year");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -45)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "rgb(5, 40, 91)")
            .text(filters.violationType === "seatbelt" ? "Seatbelt Fines (SA)" : "Drug Violations (SA)");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", width + 60)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "#42bcf5")
            .text("Total Crash Incidents");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "#666")
            .text(`Filters: ${getFilterText(filters)}`);

        const legend = svg.append("g")
            .attr("transform", `translate(${width + 80}, 20)`);

        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "rgb(5, 40, 91)");

        legend.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .style("font-size", "12px")
            .text(filters.violationType === "seatbelt" ? "Seatbelt Fines (SA)" : "Drug Violations (SA)");

        legend.append("line")
            .attr("x1", 0)
            .attr("y1", 41)
            .attr("x2", 15)
            .attr("y2", 41)
            .attr("stroke", "#42bcf5")
            .attr("stroke-width", 3);

        legend.append("text")
            .attr("x", 20)
            .attr("y", 45)
            .style("font-size", "12px")
            .text("Total Crash Incidents");
    };

    window.onComboChartSelection = function(selectedYear, currentFilters) {
        const newFilters = {...currentFilters};
        newFilters.year = selectedYear.toString();
        
        if (window.updateDonutChart) {
            window.updateDonutChart(newFilters);
        }
    };

    window.onComboChartDeselection = function(currentFilters) {
        const clearedFilters = {...currentFilters};
        delete clearedFilters.year;
        
        if (window.updateDonutChart) {
            window.updateDonutChart(clearedFilters);
        }
    };

    window.updateComboChart({ violationType: "drug" });
};

function updateChartVisualState(svg, selectedYear, clickedYear) {
    svg.selectAll(".combo-bar")
        .transition().duration(200)
        .attr("fill", barData => barData.year === clickedYear ? "rgb(5, 40, 91)" : "rgb(100, 120, 150)")
        .attr("opacity", barData => barData.year === clickedYear ? 1 : 0.6);
        
    svg.selectAll(".combo-circle")
        .transition().duration(200)
        .attr("fill", circleData => circleData.year === clickedYear ? "#42bcf5" : "#8db9d9")
        .attr("opacity", circleData => circleData.year === clickedYear ? 1 : 0.6);
}

function getFilterText(filters) {
    const activeFilters = [];
    if (filters.year && filters.year !== "") activeFilters.push(`Year: ${filters.year}`);
    if (filters.ageGroup && filters.ageGroup !== "") activeFilters.push(`Age: ${filters.ageGroup}`);
    if (filters.region && filters.region !== "") activeFilters.push(`Region: ${filters.region}`);
    
    return activeFilters.length > 0 ? activeFilters.join(" | ") : "All Data";
}

function handleElementClick(event, d, svg, selectedYear, filters) {
    event.stopPropagation();
    const clickedYear = d.year;
    selectedYear = clickedYear;
    
    updateChartVisualState(svg, selectedYear, clickedYear);
    
    if (window.onComboChartSelection) {
        window.onComboChartSelection(clickedYear, filters);
    }
}

function handleElementHover(event, d, element, selectedYear, filters) {
    if (selectedYear !== null && d.year !== selectedYear) return;
    
    const currentFill = element.attr("fill");
    if (currentFill !== "rgb(0, 60, 136)") {
        element.transition().duration(200)
            .attr("fill", "rgb(0, 60, 136)");
    }
    
    window.showComboTooltip(event, d, filters.violationType);
}

function handleElementMouseout(event, d, element, selectedYear) {
    if (selectedYear !== null && d.year !== selectedYear) return;
    
    const correctFill = selectedYear === d.year ? "rgb(5, 40, 91)" : "rgb(5, 40, 91)";
    
    if (element.attr("fill") !== correctFill) {
        element.transition().duration(200)
            .attr("fill", correctFill);
    }
    
    window.hideTooltip();
}