var edaData = $('#edaData').data().name
function updateOnst(){
	var formData = {
		'_eventTH': document.getElementById("eventTH").value
	};
	$.post({
		url: "/onsetValues", data: formData, success: function(onstValues){
			// for each value draw a line
			for (i of onstValues){
				d3.select('svg')
					.append('line') // add vertical line for onse 
					.attr('x1', margin.left + xScale(edaData[i].time))
					.attr('y1', margin.top)
					.attr('x2', margin.left + xScale(edaData[i].time))
					.attr('y2', height + margin.top)
					.attr("stroke", "grey")
					.attr("stroke-width", 1)
					.style("stroke-dasharray", ("10, 3"))
					.attr('class', 'onsetVLine')
			}
		}});
};

$('#OnsetBtn').click(function(){ // when click onset draw vertical line
	if($('#OnsetBtn').hasClass( "active" )){
		$('#OnsetBtn').removeClass('active');
		if(!($("#OnsetBtn").hasClass("active")||$("#PksBtn").hasClass("active")||$("#EmEvtBtn").hasClass("active"))){
            $(".divSelectSign").addClass('hide');            
            $(".EventsTHGroup").addClass('hide');            
		}
		d3.select('svg').selectAll(".onsetVLine").data([]).exit().remove();
	}			
	else{
		updateOnst();
		$('#OnsetBtn').addClass('active');
        $(".divSelectSign").removeClass('hide');
            $(".EventsTHGroup").removeClass('hide');                    
	}
});

function updatePKS(){
	var formData = {
		'_eventTH': document.getElementById("eventTH").value
	};
	$.post({
		url: "/PksValues", data: formData, success: function(PksValues){
			// for each value draw a line
			if ($("#EDASelector").hasClass("active")){
				for (i of PksValues){
					d3.select('svg')
						.append('line') // add vertical line for onse 
						.attr('x1', margin.left + xScale(edaData[i].time))
						.attr('y1', margin.top)
						.attr('x2', margin.left + xScale(edaData[i].time))
						.attr('y2', height + margin.top)
						.attr("stroke", "#ee5464")
						.attr("stroke-width", 1)
						.style("stroke-dasharray", ("10, 3"))
						.attr('class', 'PksVLine')
				}
			}
			else{
				for (i of PksValues){
					d3.select('svg')
						.append('line') // add vertical line for onse 
						.attr('x1', margin.left + xScale(edaData[i].edrTime))
						.attr('y1', margin.top)
						.attr('x2', margin.left + xScale(edaData[i].edrTime))
						.attr('y2', height + margin.top)
						.attr("stroke", "#ee5464")
						.attr("stroke-width", 1)
						.style("stroke-dasharray", ("10, 3"))
						.attr('class', 'PksVLine')
				}
			}
		}});
};

$('#PksBtn').click(function(){ // when click onset draw vertical line
	if($('#PksBtn').hasClass( "active" )){
		$('#PksBtn').removeClass('active');
		if(!($("#OnsetBtn").hasClass("active")||$("#PksBtn").hasClass("active")||$("#EmEvtBtn").hasClass("active"))){

                    $(".divSelectSign").addClass('hide');
        $(".EventsTHGroup").addClass('hide');

		}							
		d3.select('svg').selectAll(".PksVLine").data([]).exit().remove();
	}			
	else{ // update pks
		updatePKS();
		$('#PksBtn').addClass('active');
        $(".divSelectSign").removeClass('hide');
        $(".EventsTHGroup").removeClass('hide');
   						
	}
})

var slider1 = document.getElementById("eventTH");
var output1 = document.getElementById("eventTHO");
output1.innerHTML = slider1.value;

var slider2 = document.getElementById("tmEvts");
var output2 = document.getElementById("tmEvtsO");
output2.innerHTML = slider2.value;

var slider3 = document.getElementById("windTm");
var output3 = document.getElementById("windTmO");
output3.innerHTML = slider3.value;

function drawEmoEvent(){
	d3.select('svg').selectAll(".EmotEvents").data([]).exit().remove();		
	var formData = {
		"_eventTH": document.getElementById("eventTH").value,
		"_tmEvts": slider2.value
	};

	$.post({
		url:"/EmEvtBtn", data: formData, success: function(st){
			var i;
			for (i = 0; i < st[0].length; i++){
				d3.select('svg')
					.append('rect')
					.attr('x', margin.left + xScale(edaData[parseInt(st[0][i])].time))
					.attr('y', margin.top)
					.attr('width', xScale(edaData[parseInt(st[1][i])].time) - xScale(edaData[parseInt(st[0][i])].time))
					.attr('height', height)
					.attr('stroke', 'black')
					.attr('fill', 'red').attr("opacity", 0.10).attr('class', 'EmotEvents');				}
		}
	});
}

function updHM(data){
	d3.select(".HM").selectAll("rect").remove();
	d3.select("#bottAxis").style("opacity", 0);
	var xMin = d3.min(data, function(d) { return d.time});
	var xMax = d3.max(data, function(d) { return d.time});
	var yMin = d3.min(data, function(d) { return d.value});
	var yMax = d3.max(data, function(d) { return d.value});

	// set the dimensions and margins of the graph
	var margin = {top: 15, right: 450, bottom: 30, left: 100}
		, width = window.innerWidth - margin.left - margin.right // Use the window's width 
		, height = 70 - margin.top - margin.bottom; // Use the window's height

	//// Build X scales and axis:
	var x = d3.scaleBand()
		.range([ 0, width ])
		.padding(0)
		.domain(data.map(function(d) { return d.time; }));

	d3.select("#bottAxis").style("opacity", 1);
	var w = x.domain()[1]/data.length;
	counter = -1
	var sequentialScale = d3.scaleSequential()
		.domain([yMin, yMax])
		.interpolator(d3.interpolateViridis);
	d3.select(".HM").selectAll()
		.data(data, function(d) {
			return d;
		})
		.enter()
		.append("rect")
		.attr("x", function(d) { 
			return x(d.time); })
		.attr("width", x.bandwidth())
		.attr("height", height)
		.style("fill", function(d) { return sequentialScale(d.value);} )
}

function updFVTable(data){	
	if ( $.fn.dataTable.isDataTable( '#featuresDisplay' ) ) {
		$('#featuresDisplay').DataTable().destroy();
		$('#featuresDisplay').empty();  // empty in case the columns change
	}
	var json_featList = [];
	json_featList.push({data: "Index"});				
	for (var l of data.featsLabls){
		json_featList.push({data:l});
	}

	var tableTitle = [];
	var c = 1;
	tableTitle.push({"title": "Index", "targets": 0});
	for (var l of data.featsLabls){
		tableTitle.push({"title": l, "targets": c});
		c += 1;
	}

	$('#featuresDisplay').DataTable(
		{					
			data: data.fv,	
			columns: json_featList,
		"columnDefs": tableTitle,
		scrollY:        "300px",
		scrollX:        true,
		scrollCollapse: true,
		paging:         false,
	})
};	

slider3.oninput = function() { // windows time slider
	output3.innerHTML = this.value;
	if($("#FeatAnalBtn").hasClass( "active" )){
		// get current featsLabls
		$.post({
			url: "/getfeatsLabls",  // remove all selected features
			success: function(input){
				var 	featsList = input;
				console.log(featsList);
				formData = {
					"featLabel": featsList,
					"featFlag": -1, // delete all 
					"window_size": document.getElementById("windTm").value,
					'_eventTH': document.getElementById("eventTH").value,
				}
				$.post({
					url: "/calcHM",  // remove all selected features
					data: formData,
					success: function(input){
						formData = {
							"SELECTALL": 1,
							"FEATSLIST": featsList
						}
						$.post({	url: "/selectFts",  // add all selected features
							data: formData,
							success: function(input){
								formData = {
									"featLabel": featsList,
									"featFlag": -2,
									"window_size": document.getElementById("windTm").value,
									'_eventTH': document.getElementById("eventTH").value,
								}
								$.post({
									url: "/calcHM",
									data: formData,
									success: function(data){
										dataHM = data.hm;
										updHM(dataHM);
										updFVTable(data);
									}});
							}});
					}});

			}
		});


	}
}

slider2.oninput = function() {
	output2.innerHTML = this.value;
	if($("#EmEvtBtn").hasClass( "active" )){
		drawEmoEvent();
	}
}

slider1.oninput = function() {  // pks threshold
	output1.innerHTML = this.value;
	if($("#OnsetBtn").hasClass( "active" )){
		d3.select('svg').selectAll(".onsetVLine").data([]).exit().remove();
		updateOnst();
	}
	if($("#PksBtn").hasClass( "active" )){
		d3.select('svg').selectAll(".PksVLine").data([]).exit().remove();
		updatePKS();	}
	if($("#EmEvtBtn").hasClass( "active" )){
		drawEmoEvent();		
	}
};

$(".TimeEvtsTHGroup").addClass('hide');
$(".EventsTHGroup").addClass('hide');
$(".divSelectSign").addClass('hide');

$('#EmEvtBtn').click(function(){ // when click draw emotional events
	if($("#EmEvtBtn").hasClass( "active" )){
		$('#EmEvtBtn').removeClass('active');	
		d3.select('svg').selectAll(".EmotEvents").data([]).exit().remove();
            $(".TimeEvtsTHGroup").addClass('hide');        //
		if(!($("#OnsetBtn").hasClass("active")||$("#PksBtn").hasClass("active")||$("#EmEvtBtn").hasClass("active"))){

            $(".EventsTHGroup").addClass('hide');
            $(".divSelectSign").addClass('hide');

		}

	}
	else{
		$('#EmEvtBtn').addClass('active');	
		drawEmoEvent();

        $(".TimeEvtsTHGroup").removeClass('hide');
        $(".EventsTHGroup").removeClass('hide');
        $(".divSelectSign").removeClass('hide');

	}
});

function updFeatsInpBoxLab(LABEL, featsLabls){
	$('.tempF label').each(function(index, element) {
		$(element).html("<input type='checkbox'>" + LABEL.slice(0, -1) + " " + tempFLabels[index] );	
	});
	$('.tempF input:checkbox').each(function(index, element) {
		$(element).attr("id", LABEL + tempFValue[index]);
		$(element).val(LABEL + tempFValue[index]);
		if (featsLabls.includes(element.value)){
			$(element).prop('checked', true); // unselect checkboxes		
		};
	});


	$('.statF label').each(function(index, element) {
		$(element).html("<input type='checkbox'>" + LABEL.slice(0, -1) + " " + statFLabels[index] );	
	});


	$('.statF input:checkbox').each(function(index, element) {
		$(element).attr("id", LABEL + statFValue[index]);
		$(element).val(LABEL + statFValue[index]);	
		if (featsLabls.includes(element.value)){
			$(element).prop('checked', true); // unselect checkboxes		
		};
	});

	$('.spectF label').each(function(index, element) {
		$(element).html("<input type='checkbox'>" + LABEL.slice(0, -1) + " " + spectFLabels[index]);	
	});

	
	$('.spectF input:checkbox').each(function(index, element) {
		$(element).attr("id", LABEL + spectFValue[index]);
		$(element).val(LABEL + spectFValue[index]);
		if (featsLabls.includes(element.value)){
			$(element).prop('checked', true); // unselect checkboxes		
		};
	});
	
	$('.NonLinearF label').each(function(index, element) {
		$(element).html("<input type='checkbox'>" + LABEL.slice(0, -1) + " " + NonLinearFLabels[index]);	
	});

	$('.NonLinearF input:checkbox').each(function(index, element) {
		$(element).attr("id", LABEL + NonLinearFValue[index]);
		$(element).val(LABEL + NonLinearFValue[index]);	
		if (featsLabls.includes(element.value)){
			$(element).prop('checked', true); // unselect checkboxes		
		};
	});
	

	$('.EDAF label').each(function(index, element) {
		$(element).html("<input type='checkbox'>" + LABEL.slice(0, -1) + " " + EDAFLabels[index]);	
	});


	$('.EDAF input:checkbox').each(function(index, element) {
		$(element).attr("id", LABEL + EDAFValue[index]);
		$(element).val(LABEL + EDAFValue[index]);
		if (featsLabls.includes(element.value)){
			$(element).prop('checked', true); // unselect checkboxes		
		};
	});	
};

$('#EDASelector').click(function(){ 
	if($('#EDASelector').hasClass( "active" )){  // unselect
		$('#EDASelector').removeClass('active');
	}
	else{ // select
		$('#EDASelector').addClass('active');
		$("#EDRSelector").removeClass('active');
		formData = {
			"signalSelec": 0}
		$.post({
            url: "/signSelect", data: formData, success: function(){

		if($("#OnsetBtn").hasClass( "active" )){
			d3.select('svg').selectAll(".onsetVLine").data([]).exit().remove();
			updateOnst();}
		if($("#PksBtn").hasClass( "active" )){
			d3.select('svg').selectAll(".PksVLine").data([]).exit().remove();
			updatePKS();}
		if($("#EmEvtBtn").hasClass( "active" )){
			drawEmoEvent();
		}
            }
    })
	}
});

$('#EDASelectorF').click(function(){ 
	if($('#EDASelectorF').hasClass( "active" )){  // unselect
		$('#EDASelectorF').removeClass('active');
	}
	else{ // select
		$('#EDASelectorF').addClass('active');
		$("#EDRSelectorF").removeClass('active');
	
		formData = {
			"signalSelec": 0}
		$.post({
			url: "/signSelect", data: formData});
		if($("#FeatAnalBtn").hasClass( "active" )){	
			formData = {
				"featLabel":	$(this).val(),
				"featFlag": -3,
				"window_size": document.getElementById("windTm").value,
				'_eventTH': document.getElementById("eventTH").value
			};
			console.log("EDR selector");			
			$.post({
				url: "/calcHM",
				data: formData,
				success: function(data){
					//$("input:checkbox").prop('checked', false); // unselect checkboxes
					if ($('#PKSSelectorF').hasClass('active')) {
						updFeatsInpBoxLab("EDA_PKS_", data.featsLabls);
						if ($("input:checkbox").length == $("input:checkbox").filter(':checked').length + 8){
							$("#selectF").text('Unselect All');
							$("#selectF").addClass('active');	
						}
						else{
							$("#selectF").text('Select All');
							$("#selectF").removeClass('active');
						}

					}
					else {
						updFeatsInpBoxLab("EDA_", data.featsLabls);
						if ($("input:checkbox").length == $("input:checkbox").filter(':checked').length){
							$("#selectF").text('Unselect All');
							$("#selectF").addClass('active');	
						}
						else{
							$("#selectF").text('Select All');
							$("#selectF").removeClass('active');
						}

					}
				}
			});
		}
	}
});


$('#EDRSelector').click(function(){ 
	if($("#EDRSelector").hasClass( "active" )){
		$("#EDRSelector").removeClass('active');
	}
	else{
		$("#EDRSelector").addClass('active');
		$("#EDASelector").removeClass('active');
		formData = {
			"signalSelec": 1}
		$.post({
			url: "/signSelect", data: formData});
		if($("#OnsetBtn").hasClass( "active" )){
			d3.select('svg').selectAll(".onsetVLine").data([]).exit().remove();
			updateOnst();}
		if($("#PksBtn").hasClass( "active" )){
			d3.select('svg').selectAll(".PksVLine").data([]).exit().remove();
			updatePKS();}
		if($("#EmEvtBtn").hasClass( "active" )){
			drawEmoEvent();
		}
	}
});

$('#EDRSelectorF').click(function(){ 
	if($('#EDRSelectorF').hasClass( "active" )){  // unselect
		$('#EDRSelectorF').removeClass('active');
	}
	else{ // select
		$('#EDRSelectorF').addClass('active');
		$("#EDASelectorF").removeClass('active');
		formData = {
			"signalSelec": 1};
		$.post({
			url: "/signSelect", data: formData});
		if($("#FeatAnalBtn").hasClass( "active" )){
			console.log("EDR selector");
			formData = {
				"featLabel":	$(this).val(),
				"featFlag": -3, // continue as before
				"window_size": document.getElementById("windTm").value,
				'_eventTH': document.getElementById("eventTH").value
			};
			$.post({
				url: "/calcHM",
				data: formData,
				success: function(data){
					//$("input:checkbox").prop('checked', false); // unselect checkboxes
					if ($('#PKSSelectorF').hasClass('active')) {
						updFeatsInpBoxLab("EDR_PKS_", data.featsLabls);
						if ($("input:checkbox").length == $("input:checkbox").filter(':checked').length + 8){
							$("#selectF").text('Unselect All');
							$("#selectF").addClass('active');	
						}
						else{
							$("#selectF").text('Select All');
							$("#selectF").removeClass('active');
						}

					}
					else {
						updFeatsInpBoxLab("EDR_", data.featsLabls);
						if ($("input:checkbox").length == $("input:checkbox").filter(':checked').length){
							$("#selectF").text('Unselect All');
							$("#selectF").addClass('active');	
						}
						else{
							$("#selectF").text('Select All');
							$("#selectF").removeClass('active');
						}

					}
				}
			});
		}
	}
});


$('#PKSSelectorF').click(function(){
	if($('#PKSSelectorF').hasClass( "active" )){  // unselect
		$('#PKSSelectorF').removeClass('active');
		formData = {
			"rPKSFLAG":	0
		};
		$.post({
			url: "/rPKSFLAG",
			data: formData,
			success: function(data){
				//$("input:checkbox").prop('checked', false); // unselect checkboxes
				updFeatsInpBoxLab(data.SIGLAB, data.featsLabls);
				$("#EDACHBtn").show();
				if ($("input:checkbox").length == $("input:checkbox").filter(':checked').length){
					$("#selectF").text('Unselect All');
					$("#selectF").addClass('active');	
				}
				else{
					$("#selectF").text('Select All');
					$("#selectF").removeClass('active');
				}
			}
		});
	}
	else{ // select
		$('#PKSSelectorF').addClass('active');
		formData = {
			"rPKSFLAG":	1
		};
		$.post({
			url: "/rPKSFLAG",
			data: formData,
			success: function(data){
				//$("input:checkbox").prop('checked', false); // unselect checkboxes
				updFeatsInpBoxLab(data.SIGLAB + "PKS_", data.featsLabls);
				$(".EDAF").removeClass('show');	
				$("#EDACHBtn").hide();
				if ($("input:checkbox").length == $("input:checkbox").filter(':checked').length+8){
					$("#selectF").text('Unselect All');
					$("#selectF").addClass('active');	
				}
				else{
					$("#selectF").text('Select All');
					$("#selectF").removeClass('active');
				}
			}
		});
	}
});

$("#annText").addClass('hide');  // hide            

$("#ManuAnnBtn").click(function(){ 
	if($("#ManuAnnBtn").hasClass( "active" )){ // deactivate manual annotation of events
		$("#ManuAnnBtn").removeClass('active');
        $("#annText").addClass('hide');              
		$("#ManuAnnBtn").text('Manual Annotation Disabled');
		/* Removing brush from DOM */
		myBrush.extent( [ [0, 0], [0,0] ] );      // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
		//	d3.select("#graphSVG").call(myBrush);
		//	d3.select("#graphSVG").call(myBrush.move, null);
		d3.select("#graphSVG").call(myBrush.move, [[margin.left], [margin.left]]);
		d3.select("#graphSVG").call(myBrush);
	}
	else{ // activate manual annotation of events
		$("#ManuAnnBtn").addClass('active');
        $("#annText").removeClass('hide');        
		$("#ManuAnnBtn").text('Manual Annotation Enabled');

		// Add brushing
		myBrush.extent( [ [margin.left, margin.top], [width+margin.left, height+margin.top] ] ); 
        d3.select("#graphSVG").call(myBrush);
	}
});

$('#annText').keydown(function(event) {
	// enter has keyCode = 13, change it if you want to use another button
	if (event.keyCode == 13) {
		event.preventDefault();
		formData = {
			"stT": xSt-margin.left,  
			"endT": xEnd-margin.left,
			"text": document.getElementById('annText').value
		}
		$.post({
			url: "/ManualAnn", data: formData, success: function(){
				document.getElementById('annText').value = "";
				d3.select("#graphSVG").call(myBrush.move, [[margin.left], [margin.left]]);
			}
		});
	}
});


$('.checkbox').change(function () {  // when (un)selecting checkbox features
	if (!$($(this).children().children()).is(':checked')) {  // removing check
		featFlag = 0;
	}
	else{  // add check
		featFlag = 1;	
	}
	formData = {
		"featLabel":	$(this).children().children().val(),
		"featFlag": featFlag,
		"window_size": document.getElementById("windTm").value,
		'_eventTH': document.getElementById("eventTH").value
	};
	$.post({
		url: "/calcHM",
		data: formData,
		success: function(data){
			dataHM = data.hm;
			if (dataHM.length == 0){
				d3.select(".HM").selectAll("rect").remove();
				d3.select("#bottAxis").style("opacity", 0);
				if ( $.fn.dataTable.isDataTable('#featuresDisplay') ) {
					$('#featuresDisplay').DataTable().destroy();
					$('#featuresDisplay').empty();  // empty in case the columns change
				}
			}
			else{
				updHM(dataHM);
				updFVTable(data);
			}
		}
	});
});

// hide everything at first ( button disabled)
$(".WindSizeTHGroup").addClass('hide');				
$(".EventsTHGroup").addClass('hide');
$(".divSelectSignF").addClass('hide');
$(".featuresCB").css({"display":"none"});
$(".tempF").addClass('hide');				
$(".statF").addClass('hide');				                        //	
$(".spectF").addClass('hide');				                        //	
$(".EDAF").addClass('hide');				                        //	

$("#FeatAnalBtn").click(function(){ 
	if($("#FeatAnalBtn").hasClass( "active" )){
		$("#FeatAnalBtn").text('Feature Analysis Disabled');
		$("#FeatAnalBtn").removeClass('active');
		$(".featuresCB").css({"display":"none"});
		$(".WindSizeTHGroup").addClass('hide');				
		if(!$("#FeatAnalBtn").hasClass("active")){
            $(".EventsTHGroup").addClass('hide');
			$(".divSelectSignF").addClass('hide');

		}

		d3.select(".HM").selectAll("rect").remove();
		d3.select("#bottAxis").style("opacity", 0);
		$("input:checkbox").prop('checked', false);
		formData = {
			"featLabel":	$(this).val(),
			"featFlag": -1,
			"window_size": document.getElementById("windTm").value,
			"_eventTH": document.getElementById("eventTH").value
		}

		$.post({
			url: "/calcHM",
			data: formData
		});
	}
	else{
		$("#FeatAnalBtn").text('Feature Analysis Enabled');
		$("#FeatAnalBtn").addClass('active');
        $(".divSelectSignF").removeClass('hide');
		$(".EventsTHGroup").removeClass('hide');
		$(".WindSizeTHGroup").removeClass('hide');	
		$(".featuresCB").css({"display":"flex", "flex-direction": "column"});        
	}
});
$("#TmpFBtn").click(function(){ 
	if($("#TmpFBtn").hasClass( "active" )){
		$(".tempF").addClass('hide');				
		$("#TmpFBtn").removeClass('active');		
	}
	else{
		$(".tempF").removeClass('hide');				        
		$("#TmpFBtn").addClass('active');		
	}
});

$("#StatFBtn").click(function(){ 
	if($("#StatFBtn").hasClass( "active" )){
		$(".statF").addClass('hide');				                        //	
		$("#StatFBtn").removeClass('active');		
	}
	else{
		$("#StatFBtn").addClass('active');	
		$(".statF").removeClass('hide');				                
	}
});

$("#SpectFBtn").click(function(){ 
	if($(this).hasClass( "active" )){
		$(".spectF").addClass('hide');				                        //	
		$(this).removeClass('active');		
	}
	else{
		$(".spectF").removeClass('hide');				                        //	
        $(this).addClass('active');		
	}
});
$("#EDACHBtn").click(function(){ 
	if($("#EDACHBtn").hasClass( "active" )){
		$(".EDAF").addClass('hide');				                        //	                
		$("#EDACHBtn").removeClass('active');
	}
	else{
		$(".EDAF").removeClass('hide');				                        //	        
		$("#EDACHBtn").addClass('active');
	}
});

$("#NONLINBtn").click(function(){ 
	if($(this).hasClass("active")){
	//	$(".NonLinearF").removeClass('show');
		$(".NonLinearF").addClass('hide');				                        //	                        
		$(this).removeClass('active');		
	}
	else{
	//	$(".NonLinearF").addClass('show');
		$(".NonLinearF").removeClass('hide');				                        //	                                
		$(this).addClass('active');		
	}
});

$("#selectF").click(function(){ 
	if($("#selectF").hasClass( "active" )){ // unselect all features
		$("#selectF").removeClass('active');	
		$("#selectF").text('Select All');
		$("input:checkbox").prop('checked', false);

		var featsList = new Array();
		$('input:checkbox').each(function(i, obj) {
			if($('#PKSSelectorF').hasClass( "active" )){ // if EDA/EDA_peaks is on 
				if (!(EDAFValue.includes(String(obj.value).slice(8,)))){
					featsList.push(String(obj.value))
				}
			}
			else{
				featsList.push(String(obj.value))
			}
		});
		formData = {
			"SELECTALL": 0,
			"FEATSLIST": featsList
		}
		$.post({
			url: "/selectFts",
			data: formData,
			success: function(input){
				if(input=="0"){ // reset all
					d3.select(".HM").selectAll("rect").remove();
					d3.select("#bottAxis").style("opacity", 0);
					if ( $.fn.dataTable.isDataTable('#featuresDisplay') ) {
						$('#featuresDisplay').DataTable().destroy();
						$('#featuresDisplay').empty();  // empty in case the columns change
					}
				}
				else{
				formData = {
					"featLabel": featsList,
					"featFlag": -2,
					"window_size": document.getElementById("windTm").value,
					'_eventTH': document.getElementById("eventTH").value
				}
				$.post({
					url: "/calcHM",
					data: formData,
					success: function(data){
						dataHM = data.hm;
						if (dataHM.length == 0){
							d3.select(".HM").selectAll("rect").remove();
							d3.select("#bottAxis").style("opacity", 0);
							if ( $.fn.dataTable.isDataTable('#featuresDisplay') ) {
								$('#featuresDisplay').DataTable().destroy();
								$('#featuresDisplay').empty();  // empty in case the columns change
							}
						}
						else{
							updHM(dataHM);
							updFVTable(data);
						}
					}
				});
			}}
		});
	}
	else{ // select all features
		$("#selectF").addClass('active');
		$("#selectF").text('Unselect All');

		$("input:checkbox").prop('checked', true);

		var featsList = new Array();
		$('input:checkbox').each(function(i, obj) {
			if($('#PKSSelectorF').hasClass( "active" )){ 
				if (!(EDAFValue.includes(String(obj.value).slice(8,)))){
					featsList.push(String(obj.value))
				}
			}
			else{
				featsList.push(String(obj.value))
			}
		});
		formData = {
			"SELECTALL": 1,
			"FEATSLIST": featsList
		}
		$.post({
			url: "/selectFts",
			data: formData,
			success: function(input){
				console.log("in", input)
				formData = {
					"featLabel": featsList,
					"featFlag": -2,
					"window_size": document.getElementById("windTm").value,
					'_eventTH': document.getElementById("eventTH").value
				};
				$.post({
					url: "/calcHM",
					data: formData,
					success: function(data){
						updHM(data.hm);
						updFVTable(data);
					}
				});
			}
		});
	}
})

$("#ExportFts").click(function(){ 
	$.post({
		url: "/exportFts",
		success: function() {alert("Features exported to csv file!");}
		});
})

$("#ExportFtsbyEvts").click(function(){
	formData = {
		"_eventTH": document.getElementById("eventTH").value,
		"_tmEvts": document.getElementById("tmEvts").value,
		"windSize": document.getElementById("windTm").value
	};
	$.post({
		url: "/ExportFtsbyEvts",
		data: formData,
		success: function() {alert("Features exported to csv file!");}
		});
});

