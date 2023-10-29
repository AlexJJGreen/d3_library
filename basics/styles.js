import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

const debounce = (cbFunc, params, wait) => {
    let timeout;
    return () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            cbFunc(params);
        }, wait);
    };
}

let d3Graph = (svgEl) => {
    // Select SVG Element, calulate width + coerces value 100px - slice to number
    let svg = d3.select(svgEl);
    let svgWidth = svg.node().getBoundingClientRect().width;

    // define margins
    let margins = {
        top: 15,
        right: 15,
        bottom: 25,
        left: 30
    }

    // define aspect ratio
    let aspectRatio = 16 / 9;

    // set element height as aspect ratio
    svg.attr("height", svgWidth / aspectRatio);

    // define chart dimensions
    let chartWidth = svgWidth - margins.left - margins.right;
    let chartHeight = (svgWidth / aspectRatio) - margins.top - margins.bottom;

    // Set up the linear scale
    let xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, chartWidth]);


    // Generate the X axis
    let xAxis = d3.axisBottom(xScale);

    // add the x-axis to the svg
    svg.append("g")
        .attr("transform", `translate(${margins.left},${chartHeight + margins.top})`)
        .call(xAxis);
};

const errorCatch = () => {
    try {
        d3Graph("#svg");
    } catch (e) {
        console.error("Error", e);
    }
}

document.addEventListener("DOMContentLoaded", (e) => {
    // render SVG on dom load, resize on resize with debounce
    d3Graph("#svg");
    window.addEventListener("resize", debounce(d3Graph, "#svg", 250));
});
