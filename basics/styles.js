import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

let dataset;

// call func only once after multiple resize triggers
const debounce = (cbFunc, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            cbFunc(...args);
        }, wait);
    };
}

let d3Graph = (svgEl, data) => {
    // Select SVG Element, calulate width + coerces value 100px - slice to number
    let svg = d3.select(svgEl);
    let svgWidth = svg.node().getBoundingClientRect().width;
    // define aspect ratio
    let aspectRatio = 16 / 9;

    // set element height as aspect ratio
    svg.attr("height", svgWidth / aspectRatio);

    // define margins
    let margins = {
        top: 15,
        right: 30,
        bottom: 25,
        left: 30
    }

    // define chart dimensions
    let chartWidth = svgWidth - margins.left - margins.right;
    let chartHeight = (svgWidth / aspectRatio) - margins.top - margins.bottom;

    // Set up the linear scale
    let xScale = d3.scaleUtc()
        .domain([data[0].Date, data[data.length - 1].Date])
        .range([0, chartWidth]);

    const maxIndex = d3.max(data, d => +d.Index);
    console.log(Math.ceil(maxIndex / 100) * 100);

    let yScale = d3.scaleLinear()
        .domain([(Math.ceil((maxIndex / 100)) * 100), 0])
        .range([0, chartHeight]);

    // Generate the X axis
    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale);

    // generate data nodes
    const line = d3.line()
        .x(d => xScale(d.Date))
        .y(d => yScale(d.Index));

    // addend to svg
    svg.append("path")
        .datum(data)  // Binds your data to the line
        .attr("fill", "none")  // Typically, you don't want to fill under a line chart
        .attr("stroke", "steelblue")  // The color of the line
        .attr("stroke-width", 1)  // The width of the line
        .attr("transform", `translate(${margins.right},${margins.top})`)
        .attr("d", line);  // Generates the d attribute using your line generator

    // add the x-axis to the svg
    svg.append("g")
        .attr("transform", `translate(${margins.left},${chartHeight + margins.top})`)
        .call(xAxis);
    // add y axis
    svg.append("g")
        .attr("transform", `translate(${margins.right},${margins.top})`)
        .call(yAxis);

};

const fetchGraphData = (dataPath) => {
    return d3.csv(dataPath)
        .then(data => {
            data.forEach(d => {
                d.Date = d3.timeParse("%d/%m/%Y")(d.Date);
                d.Index = +d.Index;
            });
            dataset = data;
            d3Graph("#svg", dataset);
        })
        .catch(err => {
            console.error("Error loading or parsing CSV:", err)
        });
}

document.addEventListener("DOMContentLoaded", (e) => {
    // render SVG on dom load, resize on resize with debounce
    fetchGraphData("us_policy_uncertainty_data.csv");
    window.addEventListener("resize", debounce((e) => {
        // remove current render
        d3.select("#svg").selectAll("*").remove();
        // rerender
        d3Graph("#svg", dataset);
    }, 200));
});
