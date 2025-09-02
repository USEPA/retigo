
$(function() {

    $('#time_slider').slider({
        range: false,
	min: 0,
        max: 1000,
        step: 1,
	animate: "normal",
        start: function(event, ui) {
	    setUpdateOptionalFlag(false);
        },
        slide: function(event, ui) {
            //console.log("slide");
	    slider_handler(ui.value, 0);
            setUpdateOptionalFlag(true);
            updateAqsTooltips();
            updateSurfmetTooltips();
            updatePurpleairTooltips();
            updateMySensorTooltips();
	},
	change: function(event, ui) {
            //console.log("change");
	    slider_handler(ui.value, 0);
	    setUpdateOptionalFlag(true);
	},
	stop: function(event, ui) {
            //console.log("stop");
	    setUpdateOptionalFlag(true);
            updateAqsTooltips();
            updateSurfmetTooltips();
            updatePurpleairTooltips();
            updateMySensorTooltips();
	    loadSatelliteMap();
	    loadViirsTruecolorMap();
	},
    });
    

    $('#map_size').slider({
        range: false,
	min: 100,
        max: 1000,
        step: 10,
        slide: function(event, ui) {
            mapsize_handler(ui.value)
	},
	change: function(event, ui) {
            mapsize_handler(ui.value)
	},
    });


    $('#timeseries_size').slider({
        range: false,
	min: 100,
        max: 1000,
        step: 10,
        slide: function(event, ui) {
            timeseriesPlotsize_handler(ui.value)
	},
	change: function(event, ui) {
            timeseriesPlotsize_handler(ui.value)
	},
    });
    
    
});
