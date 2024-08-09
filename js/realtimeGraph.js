IDS_TO_SHOW = []
SENDING_DEVICES = []
// dic com id device = tempo
groups = {}
$(document).ready(function(){
    var sock = io(HOST_IP + ":" + port, {
	//var sock = io("http://192.168.1.100:8020", {
		path: '/ws/socket.io'
	});

	setInterval(function() {
		if($('#changeButton').html() == 'STOP'){
			sock.emit("fetch data", IDS_TO_SHOW, SENDING_DEVICES);
		}
	}, 100)

	sock.on('draw', function (data) {
		var dt = data["send_data"]
		if ($('#changeButton').html() == 'STOP') {
			for (var i=0; i < dt["id"].length; i++){
				if (!SENDING_DEVICES.includes(dt["id"][i])) {  // first time sending data - create line and others
					SENDING_DEVICES.push(dt["id"][i])
					d3.select("#selectButton")
					.attr("style", "display:flex; width: 100%;")
					.selectAll('myOptions')
					.data([dt["id"][i]])  // Assuming dt["id"][i] is the current data element to add
					.enter()
					.append('option')
					.text(function (d) { return d; })
					.attr("value", function (d) { return d; });
				// Check the condition after configuring the select element
				if (IDS_TO_SHOW.length < IDS_TO_SHOW_TH) {
					IDS_TO_SHOW.push(dt["id"][i])
					create_new_id_data(dt["id"][i])
					// Set the newly added option as selected
					d3.select("#selectButton").selectAll("option")
						.each(function(d) {
							if (d === dt["id"][i]) {
								d3.select(this).property("selected", "selected"); // Use .property for boolean attributes
							}
						});
				}
				} else { // not the first time data appears - data flowing
					if (IDS_TO_SHOW.includes(dt["id"][i])) {
						tick(dt['data'][i], dt["id"][i]);
					}
				}
			}
		}

	});
	// change mode
	$('#changeButton').on('click', function () {
		// change mode: stop -> start
		if ($('#changeButton').html() == 'START') {
			$('#changeButton').html('STOP');
			sock.emit('change mode', { 'mode': 'start' });
			$(".js-example-basic-multiple").select2().val(Object.keys(groups)).trigger("change");

		}
		// change mode: start -> stop
		else {
			$('#changeButton').html('START');
			sock.emit('change mode', { 'mode': 'stop' });
			$('#movieSelct').html('Please select the movie you want to watch');

			$('.legendCircle').each(function (i, d) {
				id = d["id"].substring(1);
				removeLine(id)
			});
			d3.selectAll('.legendCircle').remove()
			d3.selectAll('.legendText').remove()
		}
	});

});

$("#flagTextF").submit(function(e) {
	e.preventDefault(); // Prevent the normal form submit
	$.ajax({
		type: "POST",
		url: 'timeFlagForm',
		data: $('form').serialize(),
		success: function(data) {
            $( "#userInputLst" ).append( "<p>" + data["_time"] + " (s): " + data["dt"] + "</p>" );
			document.getElementById('flagText').value = "";
		}
	});

});

$('.movie').click(function(){ // send clicked post Arousal button value
		    formData = {
			'movieID': $(this).attr('value')
		    };
		    $.post({
			url: "/movieSelector",
			data: formData,
		success: function(data) {
            $("#movieSelct").html(data);
        }                
		    })
		$(this).siblings().removeClass('active');
    $(this).siblings().attr("style", "background-color: #264653")
    
        $(this).addClass('active');
    $(this).attr("style", "background-color: #264653")
		});




