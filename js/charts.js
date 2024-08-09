function resizeWind() {
    svgWidth = $(".graphContainer").width();
    svgHeight = $(".graphContainer").height();

    margin = {top: 0.1*svgHeight, right: 0.1*svgWidth, bottom: 0.1*svgHeight, left: 0.1*svgWidth}    
    width = svgWidth - margin.left - margin.right // Use the window's width 
    height = svgHeight - margin.top - margin.bottom; // Use the window's height

    d3.select('.chart').attr("width", svgWidth).attr("height", svgHeight);
    x.range([0, width])
    y.range([height, 0])
    
    // update axes
    d3.select('g.x.axis').attr('transform', 'translate(' +  margin.left + ',' + (height+margin.top) + ')');
    d3.select('g.y.axis').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    d3.selectAll('.legendCircle').attr('r',  0.008 * width).attr("cx", margin.left + 0.02 * width).attr("cy", function(d, i){ return margin.top + (i*0.04*height);});
    d3.selectAll('.legendText').attr("x", margin.left + 0.04 * width).attr("y", function(d, i){ return margin.top + (i*0.06*height);}); 

    d3.select(".xAxisLabel").attr("x", width).attr("y", height + margin.top + margin.bottom)
    d3.select(".yAxisLabel").attr("y", 0.2*margin.left).attr("x",-5*margin.top)
}

color = d3.scale.category20();
window.addEventListener('resize', resizeWind);
svgWidth = $(".graphContainer").width();
svgHeight = $(".graphContainer").height();

margin = {top: 0.1*svgHeight, right: 0.1*svgWidth, bottom: 0.1*svgHeight, left: 0.1*svgWidth}    
svgWidth = $(".graphContainer").width();
svgHeight = $(".graphContainer").height();

width = svgWidth - margin.left - margin.right // Use the window's width 
height = svgHeight - margin.top - margin.bottom; // Use the window's height

limit = Math.floor(width / 4); // Limit the number of data points based on the chart width
duration = limit - 10; // Adjust the duration based on your data rate (0.2 seconds)

x = d3.time.scale()
    .domain([new Date(Date.now() - duration), new Date(Date.now())])
	.range([0, width])

y = d3.scale.linear()
	.domain([0, 4096])
	.range([height, 0])

line = d3.svg.line()
	.x(function(d, i) {
        // Calculate the timestamp for this data point
        let timeOffset = duration * (limit - i - 1);
        return x(new Date(Date.now() - timeOffset));
	})
	.y(function(d, i) {
		return y(d)
	})

svg = d3.select('#chart').append('svg')  
    .attr('class', 'chart')
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)

axis = svg.append('g') // x axis group
	.attr('class', 'x axis')
	.call(x.axis = d3.svg.axis().scale(x).orient('bottom'))
	.attr('transform', 'translate(' +  margin.left + ',' + (height+margin.top) + ')')

// Add X axis label:
svg.append("text").attr('class', "xAxisLabel")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + margin.bottom)
    .text("Time");

vaxis = svg.append('g') // y axis group
	.attr('class', 'y axis')
	.call(y.axis = d3.svg.axis().scale(y).orient('left'))
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Y axis label:
svg.append("text").attr('class', "yAxisLabel")    
    .attr("y", 0.3*margin.left)
    .attr("x",-10*margin.top)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Amplitude")

paths = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

function updDt(){
    ymin = 3000;//d3.max(groups[Object.keys(groups)[0]].data);
    ymax = 0;//d3.min(groups[Object.keys(groups)[0]].data);

    for (group in groups){
     if(d3.min(groups[group].data)< ymin){
           ymin = d3.min(groups[group].data)
       }
       if(d3.max(groups[group].data)> ymax){
           ymax = d3.max(groups[group].data)
       }
    };
    now = Date.now(); 
    x.domain([new Date(now - duration * limit), new Date(now)]);
    y.domain([ymin - 20, ymax + 20])

	vaxis.call(y.axis)
    axis.call(x.axis)

}
function tick(data, name) {
	var group = groups[name]
    group.data = group.data.concat(data);
    group.data.splice(0, data.length);
    group.path.attr('d', line(group.data))
    updDt(group)
}

function addLine(selectedGroup) {
    if (!(selectedGroup in groups)) {
        create_new_id_data(selectedGroup)
    }
}
function removeLine(selectedGroup) { 
    if (selectedGroup in groups) {
        groups[selectedGroup].path.remove()
        delete groups[selectedGroup];
    }
}

function create_new_id_data(id) {
    if (!(id in groups)) {
        groups[id] = {
            value: 0,
            color: color(Math.random()),
            data: d3.range(limit).map(function () {
                return 0;
            })
        };

        var group = groups[id]
        group.path = paths.append('path').attr('id', id)
            .data([group.data])
            .attr('class', id + ' group')
            .style('stroke', group.color)

        var svg = d3.select(".chart")
        svg.append('circle').attr('class', 'legendCircle').style("fill", groups[id].color).attr('id', "C" + id)
        svg.append('text').attr('class', 'legendText').text(id).attr("alignment-baseline", "middle").attr('id', "T" + id)

        d3.selectAll(".legendCircle").attr('r', 0.008 * width).attr("cx", margin.left + 0.02 * width).attr("cy", function (d, i) { return margin.top + (i * 0.06 * height); });
        d3.selectAll('.legendText').attr("x", margin.left + 0.04 * width).attr("y", function (d, i) { return margin.top + (i * 0.06 * height); });
    }
}



   $('.js-example-basic-multiple').on("select2:unselect", function(d) {
       selectedOption = d.params.data.id
        var index = IDS_TO_SHOW.indexOf(selectedOption);
        if (index > -1) {
            IDS_TO_SHOW.splice(index, 1);
        }
        removeLine(selectedOption)
        d3.select('#C' + selectedOption).remove();
        d3.select('#T' + selectedOption).remove();
    })

   $('.js-example-basic-multiple').on("select2:select", function(d) {
       selectedOption = d.params.data.id
        addLine(selectedOption)
        IDS_TO_SHOW.push(selectedOption)
    })

    $("#selectAllDv").on("click", function () {
        $(".js-example-basic-multiple").select2().val(null).trigger("change");
        IDS_TO_SHOW = [...SENDING_DEVICES]
        for (let g of SENDING_DEVICES) {
            addLine(g)
        }
        $(".js-example-basic-multiple").select2().val(Object.keys(groups)).trigger("change");
    });

    $("#UNselectAllDv").on("click", function () {
        for (let id of IDS_TO_SHOW){
            removeLine(id)
        };
        IDS_TO_SHOW = []
        $(".js-example-basic-multiple").select2().val(null).trigger("change");
        d3.selectAll('.legendCircle').remove()
        d3.selectAll('.legendText').remove() 
    });
resizeWind()