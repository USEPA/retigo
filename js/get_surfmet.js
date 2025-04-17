function get_Surfmet(variable, bbox, timerange) {
  //debug(variable);
  //debug(bbox);
  //debug(timerange);
  var arg_string = construct_surfmet_args(variable, bbox, timerange);
  //debug(arg_string);
  $.ajax({    
          type:'Get',
          url: 'http://webapps.datafed.net/ogc_PSWC.wsfl?',
          data: arg_string,
          dataType: 'text',
          timeout: 120000,
          async: false,
          processData: false,
	  contentType: 'text/plain',
          success: function(data, textStatus, jqXHR){
	//debug("success");
	    //build_surfmet_dataobject(data, variable);
          },
          error: function(jqXHR, textStatus, errorThrown){
	//debug("jqXHR: " + jqXHR);
	//debug("textStatus: " + textStatus);
	//debug("errorThrown: " + errorThrown);
            print(variable + " data could not be retrieved.");
          }
         })
}




function build_surfmet_dataobject(data, datatype) {
      space_delimiter = new RegExp("\\s+");
      comma_delimiter = ",";
      //debug("building surfmet object");
      if ( (datatype == 'SURF_MET.T') ) {
        surfmetInfo = surfmet_info(data, space_delimiter);
        header                   = surfmet_extractHeader    (data, space_delimiter, 0)
	oSurfmetOzone.timestamp  = surfmet_createStringArray(data, space_delimiter, 0, 1, 0, 1);// directly access with slider pos
	oSurfmetOzone.lon        = surfmet_createDataArray  (data, space_delimiter, 1, 1, 0, 1);// directly access with slider pos
	oSurfmetOzone.lat        = surfmet_createDataArray  (data, space_delimiter, 2, 1, 0, 1);// directly access with slider pos
	oSurfmetOzone.id         = surfmet_createStringArray(data, space_delimiter, 3, 1, 0, 1);// directly access with slider pos
	oSurfmetOzone.variable   = surfmet_createDataArray  (data, space_delimiter, 4, 1, 0, 1);// directly access with slider pos
        oSurfmetOzone.min        = 0.0;
        oSurfmetOzone.max        = 120.0;
        oSurfmetOzone.nSites     = surfmetInfo[0];
        oSurfmetOzone.nTimes     = surfmetInfo[1];
        oSurfmetOzone.oSlider_indices = surfmet_sliderpos_lookup(oSurfmetOzone);
	appendGoogleLatLng(oSurfmetOzone);
        init_colorbar(25, 25, oSurfmetOzone.min, oSurfmetOzone.max, 'temperature(F), from SURFMET', 'colorbar_canvas2')
      }

      //debug("done building airnow object");

    }


function surfmet_info(data_string, field_separator) {
  // figure out how many unique sites and times are in this data
  	
  var data_string, fileLines, thisTime;
  var n;
  var n_sites  = 0;
  var n_times  = 0;
  var doit = 1;
 
  if (typeof data_string == 'object') {
    fileLines=data_string.result.split("\n");
  } else {
    fileLines=data_string.split("\n");
  }

  thisLine = fileLines[1].split(field_separator);
  lastTime = thisLine[0];

  for (n = 1; n < fileLines.length-1; n++) {
    thisLine = fileLines[n].split(field_separator);
    thisTime = thisLine[0];
 
    //debug(thisTime + "....." + lastTime);
    if (thisTime == lastTime) {
      if (doit == 1) {
        n_sites = n_sites + 1;
      }
    } else {
      doit = 0; 
      n_times = n_times + 1;
    }
    lastTime = thisTime;
  }
  n_times = n_times + 1; // because the first time was not counted

  return_val = [n_sites, n_times];

  return return_val;
}
    
function surfmet_extractHeader(data_string, field_separator, line_number) {
      var data_string, fileLines, thisLine;
      var array = [];
      var n;

      if (typeof data_string == 'object') {
        fileLines=data_string.result.split("\n");
      } else {
        fileLines=data_string.split("\n");
      }
      thisLine = fileLines[line_number].split(field_separator);

      for (n=0; n<thisLine.length; n++) {
        array.push(thisLine[n]);
      }
      return array;
}


function surfmet_createStringArray(data_string, field_separator, field_position, first_line, flag2D, num_to_average) {
        // use first_line to skip header lines
	var data_string, fileLines, thisData;
	var array = [];
        var buffer = 0.0;
        var avg_count = 1;
        var push_count = 0;
        var n;

        if (typeof data_string == 'object') {
          fileLines=data_string.result.split("\n");
        } else {
          fileLines=data_string.split("\n");
        }

        for (n = first_line; n < fileLines.length-1; n++) {
          thisLine = fileLines[n].split(field_separator);
          thisData = thisLine[field_position];
	  //debug(thisData);
          array.push(thisData);
        }

	return array;
}

function surfmet_createDataArray(data_string, field_separator, field_position, first_line, flag2D, num_to_average) {
        // use first_line to skip header lines
	var data_string, fileLines, thisData;
	var array = [];
        var buffer = 0.0;
        var avg_count = 1;
        var push_count = 0;
        var n;

        if (typeof data_string == 'object') {
          fileLines=data_string.result.split("\n");
        } else {
          fileLines=data_string.split("\n");
        }

        // Transue's trick for stepping through an object
        //for (var uniq in fileLines){
        //  if (!confirm(uniq+"+"+data_string[uniq])){return;}
        //}

        for (n = first_line; n < fileLines.length-1; n++) {
          //thisLine = fileLines[n].toString().split(/\s+/);
          thisLine = fileLines[n].toString().split(field_separator);
          thisData = Number(thisLine[field_position]);     

	  if (avg_count < num_to_average) {
            buffer = buffer + thisData;
            avg_count += 1;
          } else {
            buffer = buffer + thisData;
            if (flag2D == 0) {
              array.push(buffer/num_to_average); // returns a string
            } else {
              //array.push([n-Math.floor(num_to_average/2.0), buffer/num_to_average]); //returns a float
              array.push([push_count, buffer/num_to_average]); //returns a float
              push_count += 1;
            }
            // reset the counter
            avg_count = 1;
	    buffer = 0.0;
          }
        }

	return array;
}
