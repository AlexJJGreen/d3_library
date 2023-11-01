import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"

// call func only once after multiple resize triggers

let getData = async (dataURL, dateFormat) => {
    try {
        let data = await d3.csv(dataURL);
        data.forEach(d => {
            d.Date = d3.timeParse(dateFormat)(d.Date);
            d.Index = +d.Index;
        });
        return data;
    } catch (err) {
        console.error("Error loading or parsing CSV:", err);
    };
}

class timeSeriesLinear {
    constructor(container, data) {
        this.container = d3.select(container);
        this.data = data;

        //  Tooltip
        this.tooltip = null;

        this.container.on("mousemove", (event) => this.mousemove(event));

        // resize
        window.addEventListener("resize", this.debounce((e) => {
            this.container.selectAll("*").remove();
            this.initSVG();
            this.renderSVG();
            this.renderTooltip();
        }, 200));
    }

    debounce(cbFunc, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                cbFunc(...args);
            }, wait);
        };
    }

    initSVG() {
        // define svg dimensions
        this.containerWidth = this.container.node().getBoundingClientRect().width;
        this.aspectRatio = (16 / 9);
        this.container.attr("height", (this.containerWidth / this.aspectRatio));

        // define margins
        this.margins = {
            top: 15,
            right: 30,
            bottom: 25,
            left: 30
        }

        // define chart dimensions
        this.chartWidth = this.containerWidth - this.margins.left - this.margins.right;
        this.chartHeight = (this.containerWidth / this.aspectRatio) - this.margins.top - this.margins.bottom;

        // define linear scales
        this.xScale = d3.scaleUtc()
            .domain([this.data[0].Date, this.data[this.data.length - 1].Date])
            .range([0, this.chartWidth]);

        this.maxIndex = d3.max(this.data, d => +d.Index);

        this.yScale = d3.scaleLinear()
            .domain([(Math.ceil((this.maxIndex / 100)) * 100), 0])
            .range([0, this.chartHeight]);

        // Generate Axes
        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);

        /*
        this.yAxisLabel = this.yAxis
            .append("text")
            .attr("class", "y-axis-label")
            .attr("x", -dimensions.boundedHeight / 2)
            .attr("y", -dimensions.margin.left + 110)
            .html("Internet Usage (GB)");
            */

        // Generate Data Nodes
        this.line = d3.line()
            .x(d => this.xScale(d.Date))
            .y(d => this.yScale(d.Index));
    }

    renderSVG() {
        // addend to svg
        this.container.append("path")
            .datum(this.data)  // Binds your data to the line
            .attr("fill", "none")  // Typically, you don't want to fill under a line chart
            .attr("stroke", "steelblue")
            .attr("stroke-width", 3)
            .attr("transform", `translate(${this.margins.right},${this.margins.top})`)
            .attr("d", this.line);  // Generates the d attribute using your line generator

        // add the x-axis to the svg
        this.container.append("g")
            .attr("stroke-width", 3)
            .attr("transform", `translate(${this.margins.left},${this.chartHeight + this.margins.top})`)
            .call(this.xAxis);
        // add y axis
        this.container.append("g")
            .attr("stroke-width", 3)
            .attr("transform", `translate(${this.margins.right},${this.margins.top})`)
            .call(this.yAxis);
    }

    renderTooltip() {
        this.tooltip = this.container.append("g")
            .attr("class", "tooltip")
            .style("display", "none");
        // build div
        this.tooltip.append("rect")
            .attr("width", 100)
            .attr("height", 50)
            .attr("fill", "white")
            .style("opacity", 0.8);
        // style and position text
        this.tooltipDate = this.tooltip.append("text")
            .attr("x", 5)
            .attr("y", 20)
            .style("font-size", "10px");

        this.tooltipValue = this.tooltip.append("text")
            .attr("x", 5)
            .attr("y", 40)
            .style("font-size", "10px");
    }

    mousemove = (event) => {
        [this.x, this.y] = d3.pointer(event, this.container.node());
        this.xDate = this.xScale.invert(this.x);  // Convert mouse x-coordinate to date
        this.i = d3.bisector(datum => datum.date).left(this.data, this.xDate);  // Find index of closest date
        this.d = this.data[this.i];

        this.tooltipDate.text(`Date: ${this.d.Date}`);
        this.tooltipValue.text(`Value: ${this.d.Index}`);

        // Position the tooltip with a slight offset (for better visibility)
        this.tooltip.attr("transform", `translate(${this.x + 10}, ${this.y - 25})`);

        this.container.append("rect")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", () => {
                console.log("mouseover");
                this.tooltip.style("display", null);
            })
            .on("mouseout", () => this.tooltip.style("display", "none"))
            .on("mousemove", this.mousemove);
    }

}


document.addEventListener("DOMContentLoaded", (e) => {
    let data = getData("us_policy_uncertainty_data.csv", "%d/%m/%Y")
        .then(data => {
            let graph = new timeSeriesLinear("#svg", data);
            graph.initSVG();
            graph.renderSVG();
            graph.renderTooltip();
        })
        .catch(error => { console.error("Error fetching data", error) });


    //document.getElementById("#svg").addEventListener("mouseover", mousemove(e));

});