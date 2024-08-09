//Read the data
var edaData = $('#edaData').data().name
var xMin = d3.min(edaData, function(d) { return d.time});
var xMax = d3.max(edaData, function(d) { return d.time});
var yMin = d3.min(edaData, function(d) { return d.value});
var yMax = d3.max(edaData, function(d) { return d.value});

svgWidth = $("#graph").width();
svgHeight = $("#heatMap").height();

var margin = {top: 0.05*svgHeight, right: 0.25*svgWidth, bottom: 0.15*svgHeight, left: 0.1*svgWidth}
    
width = svgWidth - margin.left - margin.right // Use the window's width 
height = svgHeight - margin.top - margin.bottom; // Use the window's height

// set the dimensions and margins of the graph
var xMin = d3.min(edaData, function(d) { return d.edrTime});
var xMax = d3.max(edaData, function(d) { return d.edrTime});
var yMin = d3.min(edaData, function(d) { return d.edrValue});
var yMax = d3.max(edaData, function(d) { return d.edrValue});

var w = width/edaData.length;

var svg = d3.select("#heatMap")
.append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")").attr("class", "HM");

//// Build X scales and axis:
var x = d3.scaleLinear()
  .range([ 0, width])
  .domain([xMin, xMax])
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
	.attr("id", "bottAxis")
	.style("opacity", 0);	


