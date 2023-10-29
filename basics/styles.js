import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

document.addEventListener("DOMContentLoaded", (e) => {

    // Select SVG Element, calulate width + coerces value 100px - slice to number
    const svg = d3.select("svg");
    let svgWidth = svg.style.width;

    console.log(svgWidth);

    // Set up the linear scale
    let xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, svgWidth]);


    // Generate the X axis
    let xAxis = d3.axisBottom(xScale);

    // add the x-axis to the svg
    svg.append("g")
        .attr("transform", "translate(0,30)")
        .call(xAxis);

});