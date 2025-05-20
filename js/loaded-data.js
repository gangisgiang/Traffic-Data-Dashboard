/**
 * Loads and processes drug test data for the choropleth chart for a specific year
 * @param {string|number} year - The year to filter the data by
 * @returns {Promise<Object>} Object containing the processed data and GeoJSON
 */
async function loadDrugTestChoroplethData(year) {
    // Load the CSV data
    const drugTestData = await d3.csv("data/total-drug-test.csv");
    
    // Load the GeoJSON data
    const geoData = await d3.json("data/aus-states.geojson");
    
    // Filter data by year if provided
    const filteredData = year ? drugTestData.filter(d => d.YEAR == year) : drugTestData;
    
    // Process the drug test data to get total tests per jurisdiction for the selected year
    const processedData = d3.rollup(
        filteredData,
        v => d3.sum(v, d => +d.COUNT), // Sum the COUNT column for each jurisdiction
        d => d.JURISDICTION // Group by JURISDICTION
    );
    
    // Convert the Map to an object for easier access
    const jurisdictionTotals = Object.fromEntries(processedData);
    
    // Match the GeoJSON state names with the jurisdiction names
    const stateNameMapping = {
        "New South Wales": "NSW",
        "Victoria": "VIC",
        "Queensland": "QLD",
        "South Australia": "SA",
        "Western Australia": "WA",
        "Tasmania": "TAS",
        "Northern Territory": "NT",
        "Australian Capital Territory": "ACT"
    };
    
    // Add the total drug tests to each state's properties
    geoData.features.forEach(feature => {
        const stateName = feature.properties.STATE_NAME;
        const jurisdictionCode = stateNameMapping[stateName];
        feature.properties.totalDrugTests = jurisdictionTotals[jurisdictionCode] || 0;
    });
    
    return {
        geoData: geoData,
        jurisdictionTotals: jurisdictionTotals
    };
}

export { loadDrugTestChoroplethData }; 