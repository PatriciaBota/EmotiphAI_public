//var edaData = {{edaData|safe}};
var edaData = $('#edaData').data().name
var xMin = d3.min(edaData, function(d) { return d.time});
var xMax = d3.max(edaData, function(d) { return d.time});
var yMin = d3.min(edaData, function(d) { return d.value});
var yMax = d3.max(edaData, function(d) { return d.value});

//  Use the margin convention practice 
svgWidth = $("#graph").width();
svgHeight = $("#graph").height();

var margin = {top: 0.05*svgHeight, right: 0.25*svgWidth, bottom: 0.15*svgHeight, left: 0.1*svgWidth}
    
width = svgWidth - margin.left - margin.right // Use the window's width 
height = svgHeight - margin.top - margin.bottom; // Use the window's height

var xScale = d3.scaleLinear().nice().domain([xMin, xMax]).range([0, width]);
var yScale = d3.scaleLinear().nice().domain([yMin, yMax]).range([height, 0]);

var lineGenerator = d3.line()
	.x(function(d) {
		return xScale(d.time);
	})
	.y(function(d) {
		return yScale(d.value);
	});

var edrLineGen = d3.line()
	.x(function(d) {
		return xScale(d.edrTime);
	})
	.y(function(d) {
		return yScale(d.edrValue);
	});


var line = lineGenerator(edaData);
var edrLine = edrLineGen(edaData);

// Add the SVG to the page and employ #2
var svg = d3.select("#graph").append("svg").attr("class", "svg").attr("id", "graphSVG")
	.attr("width", svgWidth)
	.attr("height", svgHeight)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Call the x axis in a group tag
svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

// Add X axis label:
svg.append("text")
	.attr("text-anchor", "end")
    .attr('y', height + margin.top + 0.1*margin.bottom)
	.attr("x", margin.left + 0.9*width)
    .style('fill', 'black')
	.text("Time(s)");

//  Call the y axis in a group tag
svg.append("g")
	.attr("class", "y axis")
	.call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft
// Y axis label:
svg.append("text")
	.attr("text-anchor", "start")
    .attr('y', -0.7*margin.left)
	.attr("x", -2*margin.top)
	.attr("transform", "rotate(-90)")
    .style('fill', 'black')
	.text("Amplitude")

//  Append the path, bind the data, and call the line generator 
svg.append("path")
	.attr("class", "line") // Assign a class for styling 
	.attr("d", line) // 11. Calls the line generator 
	.style("stroke", "#2a9d8f")

svg.append("path")
	.attr("class", "line") // Assign a class for styling 
	.attr("d", edrLine) // 11. Calls the line generator 
	.style("stroke", "#e9c46a")

// Add legend
svg.append("circle").attr("cx", width+20).attr("cy",yScale(edaData.slice(-1)[0].value)).attr("r", 5).style("fill", "#2a9d8f")
svg.append("text").attr("x", width+30).attr("y", yScale(edaData.slice(-1)[0].value)).text("Electrodermal Activity").style("font-size", "11px").attr("alignment-baseline","end").style('fill', 'black')
svg.append("circle").attr("cx", width+20).attr("cy",yScale(edaData.slice(-1)[0].edrValue)).attr("r", 5).style("fill", "#e9c46a")
svg.append("text").attr("x", width+30).attr("y", yScale(edaData.slice(-1)[0].edrValue)).text("Electrodermal Response").style("font-size", "11px").attr("alignment-baseline","end").style('fill', 'black')


// This allows to find the closest X index of the mouse:
var bisect = d3.bisector(function(d) { return d.time; }).left;

// Create the circle that travels along the curve of chart
var focus = svg
	.append('g')
	.append('circle')
	.style("fill", "none")
	.attr("stroke", "black")
	.attr('r', 8.5)
	.attr('stroke-width', 2)
	.style("opacity", 0)

var edrfocus = svg
	.append('g')
	.append('circle')
	.style("fill", "none")
	.attr("stroke", "black")
	.attr('r', 8.5)
	.attr('stroke-width', 2)
	.style("opacity", 0)

// Create the text that travels along the curve of chart
var focusText = svg
	.append('g')
	.append('text')
	.style("opacity", 0)
	.attr("text-anchor", "left")
	.attr("alignment-baseline", "middle")
	.style("fill", "black")
	.attr("stroke", "black").style("font-size", "15px")

var edrfocusText = svg
	.append('g')
	.append('text')
	.style("opacity", 0)
	.attr("text-anchor", "left")
	.attr("alignment-baseline", "middle")
	.style("fill", "black")
	.attr("stroke", "black").style("font-size", "15px")

// Create a rect on top of the svg area: this rectangle recovers mouse position
svg
	.append('rect')
	.style("fill", "none")
	.style("pointer-events", "all")
	.attr('width', width)
	.attr('height', height)
	.on('mouseover', mouseover)
	.on('mousemove', mousemove)
	.on('mouseout', mouseout);


// What happens when the mouse move -> show the annotations at the right positions.
function mouseover() {
	focus.style("opacity", 1)
	focusText.style("opacity",1)
	edrfocus.style("opacity", 1)
	edrfocusText.style("opacity",1)
}

function mousemove() {
	// recover coordinate we need
	var x0 = xScale.invert(d3.mouse(this)[0]);
	var i = bisect(edaData, x0, 1);
	selectedData = edaData[i];
	focus
		.attr("cx", xScale(selectedData.time))
		.attr("cy", yScale(selectedData.value))
	focusText
		.text("(x: " + selectedData.time + "; y: " + selectedData.value+")")
		.attr("x", xScale(selectedData.time))
		.attr("y", yScale(selectedData.value)-15)
	edrfocus
		.attr("cx", xScale(selectedData.edrTime))
		.attr("cy", yScale(selectedData.edrValue))
	edrfocusText
		.text("(x: " + selectedData.edrTime + "; y: " + selectedData.edrValue+")")
		.attr("x", xScale(selectedData.edrTime))
		.attr("y", yScale(selectedData.edrValue)-15)
}

function mouseout() {
	focus.style("opacity", 0)
	focusText.style("opacity", 0)
	edrfocus.style("opacity", 0)
	edrfocusText.style("opacity", 0)
}

// Function that is triggered when brushing is performed
var myBrush = d3.brushX();
myBrush.extent( [ [0, 0], [0,0] ] );
myBrush.on("end", function() {
	// Get the selection coordinate
	extent = d3.event.selection;   // looks like [ [x1,x2]]
    if (extent != null) {
	xSt = extent[0];
	xEnd = extent[1];
    }
});

d3.select("#graphSVG").attr('class', 'brush')//.call(myBrush);
