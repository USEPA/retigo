function get_Airnow(variable, bbox, timerange, urlString, purpose, moveAqsFunc) {

    //if data is older than 365 days, use AQS instead of airnow
    try {
        msecThreshold = 365 * 24 * 3600 * 1000;
        now = new Date();
        begDatetime = new Date(timerange.split('/')[0]);
        msec_diff = now - begDatetime;
        if (msec_diff > msecThreshold) {
            variable = variable.replace('airnow', 'aqs');            
        }
    } catch (exception) {
        console.log(exception);
    }

    arg_string = construct_wcs_args(variable, bbox, timerange);
   
    debug(arg_string);
    //debug(timerange);

  var closestFlag = false; // signifying that we will NOT populate the part of the airnow
                           // object dealing with the closest data to the user's dataset, but
                           // rather the "cloud" of airnow points surrounding the user's dataset

  var requestedHours = compute_timerange_hours(timerange);
  if (requestedHours < 1000) {
      //document.getElementById('busyMapWaitTime').innerHTML = '<i>Please be patient<br>Fetching data...</i>';
      //document.getElementById('busyTimeseriesWaitTime').innerHTML = '<i>Please be patient<br>Fetching data...</i>';
  } else {
      //document.getElementById('busyMapWaitTime').innerHTML = '<i>Wait time may be several minutes<br>Fetching data...</i>';
      //document.getElementById('busyTimeseriesWaitTime').innerHTML = '<i>Wait time may be several minutes<br>Fetching data...</i>';
  }


  var thisMessage;
  if (purpose.indexOf('map') > -1) {
      thisMessage = variable;
      busyMessageQueueMapAdd(thisMessage);
  }

  busyShow(purpose);
 
  console.log(urlString, arg_string);

  $.ajax({    
          type:'Get',
	//url: 'http://rtpmeta.epa.gov/cgi-bin/rsigserver?',
          url: urlString,
          data: arg_string,
          dataType: 'text',
          timeout: 600000, // milliseconds
          async: true,
          processData: false,
          contentType: 'text/plain',
          success: function(data, textStatus, jqXHR){
	      if (data) {
                  
                  if (requestedHours < 1000) {
                      //document.getElementById('busyMapWaitTime').innerHTML = '<i>Please be patient<br>Processing...</i>';
                      //document.getElementById('busyTimeseriesWaitTime').innerHTML = '<i>Please be patient<br>Processing...</i>';
                  } else {
                      //document.getElementById('busyMapWaitTime').innerHTML = '<i>Wait time may be several minutes<br>Processing...</i>';
                      //document.getElementById('busyTimeseriesWaitTime').innerHTML = '<i>Wait time may be several minutes<br>Processing...</i>';
                  }

                  //console.log(typeof data);
                  
                  if (variable.indexOf('purpleair') >= 0) {
                      siteLimit = 100;
                      dataLimited = limitSites(data, siteLimit);
                  } else {
                      dataLimited = data;
                  }
		  build_airnow_dataobject(dataLimited, variable, closestFlag);
                  
                  if (purpose.indexOf('map') > -1) {
                      busyMessageQueueMapRemove(thisMessage);
                  }
                  busyHide(purpose);
                  if (moveAqsFunc) {
                      if (variable.indexOf('purpleair') >= 0 ) {
                          //console.log("movefunc", moveAqsFunc);
                          // only move purpleair if sensor is defined
                          var F=new Function (moveAqsFunc);
                          return(F());
                      } else {
                          var F=new Function (moveAqsFunc);
                          return(F());
                      }
                  }
	      } else {
		  print(variable + ' not available.');
                  if (purpose.indexOf('map') > -1) {
                      busyMessageQueueMapRemove(thisMessage);
                  }
                  busyHide(purpose);

                  // try aqs if airnow was not available
                  if (variable.indexOf('airnow') >= 0) {
                      var aqsVar = variable.replace('airnow', 'aqs');            
                      //get_Airnow(aqsVar, bbox, timerange, urlString, purpose, moveAqsFunc)
                  }

                  updateAqsTooltips();
	      }
              

          },
          error: function(jqXHR, textStatus, errorThrown){
            debug("jqXHR: " + jqXHR);
            debug("textStatus: " + textStatus);
            debug("errorThrown: " + errorThrown);
            debug(variable + " data could not be retrieved.");
            if (purpose.indexOf('map') > -1) {
                busyMessageQueueMapRemove(thisMessage);
            }
            busyHide(purpose);
          }
         })
}


// used for getting the closest airnow info (one site only)
function get_airnow_closest(var_string, bbox, timerange, urlString, purpose) {
    //debug(urlString);

    // if data is older than 365 days, use AQS instead of airnow
    try {
        msecThreshold = 365 * 24 * 3600 * 1000;
        now = new Date();
        begDatetime = new Date(timerange.split('/')[0]);
        msec_diff = now - begDatetime;
        if (msec_diff > msecThreshold) {
            var_string = var_string.replace('airnow', 'aqs');            
        }
    } catch (exception) {
        console.log(exception);
    }

    
  arg_string = construct_wcs_args(var_string, bbox, timerange);
  bbox_parse = bbox.split(",");
  minlon = parseFloat(bbox_parse[0]); 
  minlat = parseFloat(bbox_parse[1]); 
  maxlon = parseFloat(bbox_parse[2]); 
  maxlat = parseFloat(bbox_parse[3]); 

  //centerLon = minlon + (maxlon - minlon)/2.0;
  //centerLat = minlat + (maxlat - minlat)/2.0;

  //cellsize = 5.0; // degrees    
  cellsize_lon = maxlon - minlon; // degrees
  cellsize_lat = maxlat - minlat; // degrees

  //corner_lon = centerLon - cellsize_lon/2.0;  
  //corner_lat = centerLat - cellsize_lat/2.0;
  corner_lon = minlon;
  corner_lat = minlat;
    
  regrid_string = '&REGRID=nearest&LONLAT=1&ELLIPSOID=6370000,6370000&GRID=1,1,' + corner_lon + ',' + corner_lat + ',' + cellsize_lon + ',' + cellsize_lat + "&LEVELS=1,5,5000,0,10000,9.81,287.04,50,290,100000";
    

    
  //debug (arg_string + regrid_string);
  
  var closestFlag = true; // signifying that we will populate the part of the airnow
                          // object dealing with the closest data to the user's dataset
  //console.log(arg_string + regrid_string);

    console.log(urlString, arg_string);
    busyShow(purpose);
    
    $.ajax({    
        type:'Get',
	url: urlString,
	data: arg_string + regrid_string,
        dataType: 'text',
        timeout: 600000, // milliseconds
        async: true,
        processData: false,
        contentType: 'text/plain',
        success: function(data, textStatus, jqXHR){
            if (data) {
	        debug(data);
                //console.log(data, var_string);
                
	        build_airnow_dataobject(data, var_string, closestFlag);
                scatterplotMenuDisabledFlag = true; // default
                if (data) {
                    scatterplotMenuDisabledFlag = false;
                }
                update_scatterplot_menu(var_string, scatterplotMenuDisabledFlag);
                computeExternalCovarianceElement(var_string);
                update_scatterPlot();
                busyHide(purpose);

            } else {
                print(var_string + ' not available.');
                busyHide(purpose);

                // try aqs if airnow was not available
                if (var_string.indexOf('airnow') >= 0) {
                    var aqsVar = var_string.replace('airnow', 'aqs');;
                    //get_airnow_closest(aqsVar, bbox, timerange, urlString, purpose)
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            //debug("jqXHR: " + jqXHR);
            //debug("textStatus: " + textStatus);
            //debug("errorThrown: " + errorThrown);
            console.log("get_airnow_closest: " + var_string + " data could not be retrieved.");
            console.log("textStatus: " + textStatus);
            console.log("errorThrown: " + errorThrown);
            busyHide(purpose);
        }
    })
}

// used for getting a specific purpleair sensor
function get_purpleair_sensor(var_string, sensorID, bbox, timerange, urlString, purpose) {
  debug(urlString);
  arg_string = construct_wcs_args(var_string, bbox, timerange);
  bbox_parse = bbox.split(",");
  minlon = parseFloat(bbox_parse[0]); 
  minlat = parseFloat(bbox_parse[1]); 
  maxlon = parseFloat(bbox_parse[2]); 
  maxlat = parseFloat(bbox_parse[3]); 

  centerLon = minlon + (maxlon - minlon)/2.0;
  centerLat = minlat + (maxlat - minlat)/2.0;

  cellsize = 5.0; // degrees

  corner_lon = centerLon - cellsize/2.0;  
  corner_lat = centerLat - cellsize/2.0;
    
  sensor_string = '&SENSOR=' + sensorID;

    
  //debug (arg_string + regrid_string);
  
  var closestFlag = true; // signifying that we will populate the part of the airnow
                          // object dealing with the closest data to the user's dataset
  //console.log(arg_string + regrid_string);

  busyShow(purpose);

  $.ajax({    
      type:'Get',
      url: urlString,
      data: arg_string + sensor_string,
      dataType: 'text',
      cache: 'false',
      timeout: 600000, // milliseconds
      tryCount: 0,
      retryLimit: 1,
      async: true,
      processData: false,
      contentType: 'text/plain',
      success: function(data, textStatus, jqXHR){
	  //console.log(data);	
	  build_airnow_dataobject(data, var_string, closestFlag);
          scatterplotMenuDisabledFlag = true; // default
          if (data) {
              scatterplotMenuDisabledFlag = false;
          }
          update_scatterplot_menu(var_string, scatterplotMenuDisabledFlag);
          computeExternalCovarianceElement(var_string);
          update_scatterPlot();
          busyHide(purpose);
      },
      error: function(jqXHR, textStatus, errorThrown){
          if (this.tryCount < this.retryLimit) {
              this.tryCount += 1;
              console.log("get_purpleair_closest: " + var_string + " failed, trying again...");
              $.ajax(this);
              return;
          } else {
              oPurpleairPM25.closestTimestamp = [];
              oPurpleairPM25.closestVariable = [];
              update_timeseriesPlot();
              debug("jqXHR: " + jqXHR);
              debug("textStatus: " + textStatus);
              debug("errorThrown: " + errorThrown);
              console.log("jqXHR: " + jqXHR);
              console.log("jqXHR.responseText: " + jqXHR.responseText);
              console.log("get_airnow_closest: " + var_string + " data could not be retrieved.");
              console.log("textStatus: " + textStatus);
              console.log("errorThrown: " + errorThrown);
              busyHide(purpose);
          }
      }
  })
}


// used for getting the closest surfmet info
function get_met_closest(var_string, bbox, timerange, urlString, purpose) {
  //debug(urlString);
  arg_string = construct_wcs_args(var_string, bbox, timerange);
  bbox_parse = bbox.split(",");
  minlon = parseFloat(bbox_parse[0]); 
  minlat = parseFloat(bbox_parse[1]); 
  maxlon = parseFloat(bbox_parse[2]); 
  maxlat = parseFloat(bbox_parse[3]); 

  centerLon = minlon + (maxlon - minlon)/2;
  centerLat = minlat + (maxlat - minlat)/2;

  cellsize = 5; // degrees

  corner_lon = centerLon - cellsize/2;  
  corner_lat = centerLat - cellsize/2;  
  regrid_string = '&REGRID=nearest&LONLAT=1&ELLIPSOID=6370000,6370000&GRID=1,1,' + corner_lon + ',' + corner_lat + ',' + cellsize + ',' + cellsize;;

  //debug (arg_string + regrid_string);

  busyShow(purpose);

  $.ajax({    
          type:'Get',
	//url: 'http://rtpmeta.epa.gov/cgi-bin/rsigserver?',
	  url: urlString,
	  data: arg_string + regrid_string,
          dataType: 'text',
          timeout: 600000, // milliseconds
          async: true,
          processData: false,
          contentType: 'text/plain',
          success: function(data, textStatus, jqXHR){
              //debug(data);	
              build_met_infoobject(data, var_string);
              busyHide(purpose);
          },
          error: function(jqXHR, textStatus, errorThrown){
            //debug("jqXHR: " + jqXHR);
            //debug("textStatus: " + textStatus);
            //debug("errorThrown: " + errorThrown);
            debug(variable + " data could not be retrieved.");
            busyHide(purpose);
          }
         })
}




function limitSites(data, limit) {

    space_delimiter = new RegExp("\\s+");
    if (typeof data == 'object') {
        fileLines=data.result.split("\n");
    } else {
        fileLines=data.split("\n");
    }

    // thise positions are for purpleair
    positionData = 5;
    positionID = 4;

    idList = [];
    newdata = [];

    // header
    newdata.push(fileLines[0]);
    
    for (n = 1; n < fileLines.length-1; n++) {
        //thisLine = fileLines[n].toString().split(/\s+/);
        thisLine = fileLines[n].toString().split(space_delimiter);
        thisData = Number(thisLine[positionData]);     
        thisID   = Number(thisLine[positionID]);
        if (idList.length <= limit && idList.indexOf(thisID) < 0 ) {
            // add ID to list
            idList.push(thisID);
        }
        if (idList.indexOf(thisID) >= 0) {
            newdata.push(thisLine.join(" "));
        }
    }

    return newdata.join("\n");
}



function compute_timerange_hours(timerange) {
    // compute total number of hours in given ISO-8601 time range
    var timerange_parse = timerange.split('/');
    var start8601 = timerange_parse[0];
    var end8601   = timerange_parse[1];

    // init dates
    var startDate = new Date();
    var endDate   = new Date();

    // set start date
    startDate.setUTCFullYear(start8601.substr(0,4));
    startDate.setUTCMonth(Number(start8601.substr(5,2))-1); // javascript date is zero based
    startDate.setUTCDate(start8601.substr(8,2));
    startDate.setUTCHours(start8601.substr(11,2));

    // set end date
    endDate.setUTCFullYear(end8601.substr(0,4));
    endDate.setUTCMonth(Number(end8601.substr(5,2))-1); // javascript date is zero based
    endDate.setUTCDate(end8601.substr(8,2));
    endDate.setUTCHours(end8601.substr(11,2));

    //console.log(startDate, endDate);
    
    var millisecondsPerHour = 3600000.;
    var deltaHours = (endDate.getTime() - startDate.getTime()) / millisecondsPerHour ;

    return deltaHours;

}



function build_met_infoobject(data, datatype) {
    
      space_delimiter = new RegExp("\\s+");
      field_separator = ",";

      if (typeof data == 'object') {
        fileLines=data.result.split("\n");
      } else {
        fileLines=data.split("\n");
      }
      //console.log(datatype, fileLines.length);
      if (fileLines.length >= 3) {

        thisLine = fileLines[1].split(space_delimiter);
	this_timestamp = thisLine[0];
	this_lon       = thisLine[1];
	this_lat       = thisLine[2];
        this_data      = thisLine[5];

        oMetInfo.timestamp = this_timestamp.replace('-0000', '');
	oMetInfo.lat       = this_lat;
        oMetInfo.lon       = this_lon;
	//debug(datatype);
        //if (datatype == 'surfmet.temperature') {
        //  oMetInfo.temperature = this_data;
        //} else if (datatype == 'surfmet.wind_speed') {
        //  oMetInfo.windspeed = this_data;
        //} else if (datatype == 'surfmet.wind_direction') {
        //  oMetInfo.winddir = this_data;
        //} else if (datatype == 'surfmet.pressure') {
        //  oMetInfo.pressure = this_data;
        //}
	if (datatype == 'metar.temperature') {
          oMetInfo.temperature = this_data;
        } else if (datatype == 'metar.windspeed') {
          oMetInfo.windspeed = this_data;
        } else if (datatype == 'metar.winddir') {
          oMetInfo.winddir = this_data;
        } else if (datatype == 'metar.sealevelpress') {
          oMetInfo.pressure = this_data;
        }


      }
 
      timestring  = "";
      latstring   = "";
      lonstring   = "";
      tstring     = "";
      wmag_string = "";
      wdir_string = "";
      pres_string = "";
      if (oMetInfo.timestamp != null) {
        timestring = "&nbsp;" + oMetInfo.timestamp   + " GMT &nbsp;<br>";
      }
      if (oMetInfo.lat != null) {
        latstring = "&nbsp;Lat = "    + parseFloat(oMetInfo.lat)   + " &deg; &nbsp;<br>";
      }
      if (oMetInfo.lon != null) {
        lonstring = "&nbsp;Lon = "    + parseFloat(oMetInfo.lon)   + " &deg; &nbsp;<br>";
      }
      if (oMetInfo.temperature != null) {
        tstring = "&nbsp;T = "    + parseFloat(oMetInfo.temperature).toFixed(2)   + " &deg;C &nbsp;<br>";
      }
      if (oMetInfo.windspeed != null) {
        wmag_string = "&nbsp;Wmag = " + parseFloat(oMetInfo.windspeed).toFixed(2)     + " m/s &nbsp;<br>"; 
      }
      if (oMetInfo.winddir != null) {
        wdir_string = "&nbsp;Wdir = " + parseFloat(oMetInfo.winddir).toFixed(2)     + " deg &nbsp;<br>"; 
      }
      if (oMetInfo.pressure != null) {
        pres_string = "&nbsp;Pres = " + parseFloat(oMetInfo.pressure).toFixed(2)     + " hPa &nbsp;<br>"; 
      }

      oMetInfo.show = true;
      oMetInfo.infostring_short = "&nbsp;Nearest weather station &nbsp;&nbsp;&nbsp;&#x25BE;&nbsp;<br>";
      oMetInfo.infostring_long  = oMetInfo.infostring_short + timestring + latstring + lonstring + tstring + wmag_string + wdir_string + pres_string;

      document.getElementById("metInfo").innerHTML = oMetInfo.infostring_long;

}


function build_airnow_dataobject(data, datatype, closestFlag) {

      space_delimiter = new RegExp("\\s+");
      comma_delimiter = ",";
      //debug("building airnow object");
    if ( (datatype == 'airnow.ozone') || (datatype == 'airnow2.ozone') || (datatype == 'aqs.ozone') ) {
	  //console.log(oAirnowOzone);
	  if ( (typeof oAirnowOzone.min === 'undefined') || (typeof oAirnowOzone.max === 'undefined') ) {
	      oAirnowOzone.min        = 0.0;
	      oAirnowOzone.max        = 120.0;
	  }
	  if (closestFlag) {
	      // the closest lon/lat will not be in the airnow location, and is therefore not useful
	      // only use the closest timestamp and data value
	      oAirnowOzone.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);	     
	      oAirnowOzone.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);
	      

	  } else {
	      airnowInfo = airnow_info(data, space_delimiter);
	      header                  = airnow_extractHeader    (data, space_delimiter, 0);
	      oAirnowOzone.name       = 'airnow_ozone';
	      oAirnowOzone.timestamp  = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);// directly access with slider pos
	      oAirnowOzone.lon        = airnow_createDataArray  (data, space_delimiter, 1, 1, 0, 1);// directly access with slider pos
	      oAirnowOzone.lat        = airnow_createDataArray  (data, space_delimiter, 2, 1, 0, 1);// directly access with slider pos
	      oAirnowOzone.id         = airnow_createStringArray(data, space_delimiter, 3, 1, 0, 1);// directly access with slider pos
	      oAirnowOzone.variable   = airnow_createDataArray  (data, space_delimiter, 4, 1, 0, 1);// directly access with slider pos
	      oAirnowOzone.nSites     = airnowInfo[0];
	      oAirnowOzone.nTimes     = airnowInfo[1];
	      oAirnowOzone.oSlider_indices = airnow_sliderpos_lookup(oAirnowOzone);	
	      oAirnowOzone.msec       = airnow_compute_msec(oAirnowOzone);

	      // we will find the closest lon/lat here
	      oAirnowOzone.closestLonLat    = findClosestLonLat(oAirnowOzone); 
              //oAirnowOzone.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);	     
              //oAirnowOzone.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);
	      

	      appendAqsGoogleLatLng(oAirnowOzone);

	      //init_colorbar(25, 25, oAirnowOzone.min, oAirnowOzone.max, 'ozone(ppb), from AIRNow', 'colorbar_canvas2')
	  }
      }

      if ( (datatype == 'airnow.pm25') || (datatype == 'airnow2.pm25') || (datatype == 'aqs.pm25') ) {
	  if ( (typeof oAirnowPM25.min === 'undefined') || (typeof oAirnowPM25.max === 'undefined') ) {
	      oAirnowPM25.min        = 0.0;
	      oAirnowPM25.max        = 60.0;
	  }
	  if (closestFlag) {
	      // the closest lon/lat will not be in the airnow location, and is therefore not useful
	      // only use the closest timestamp and data value
	      oAirnowPM25.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);
	      oAirnowPM25.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);
	  } else {
	      airnowInfo = airnow_info(data, space_delimiter);
	      header                 = airnow_extractHeader    (data, space_delimiter, 0);
	      oAirnowPM25.name       = 'airnow_pm25';
	      oAirnowPM25.timestamp  = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);// directly access with slider pos
	      oAirnowPM25.lon        = airnow_createDataArray  (data, space_delimiter, 1, 1, 0, 1);// directly access with slider pos
	      oAirnowPM25.lat        = airnow_createDataArray  (data, space_delimiter, 2, 1, 0, 1);// directly access with slider pos
	      oAirnowPM25.id         = airnow_createStringArray(data, space_delimiter, 3, 1, 0, 1);// directly access with slider pos
	      oAirnowPM25.variable   = airnow_createDataArray  (data, space_delimiter, 4, 1, 0, 1);// directly access with slider pos	      
	      oAirnowPM25.nSites     = airnowInfo[0];
	      oAirnowPM25.nTimes     = airnowInfo[1];
	      oAirnowPM25.oSlider_indices = airnow_sliderpos_lookup(oAirnowPM25);
	      oAirnowPM25.msec       = airnow_compute_msec(oAirnowPM25);
	      // we will find the closest lon/lat here
	      oAirnowPM25.closestLonLat   = findClosestLonLat(oAirnowPM25); 
              //oAirnowPM25.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);	     
              //oAirnowPM25.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);

	      appendAqsGoogleLatLng(oAirnowPM25);
	      //init_colorbar(25, 25, oAirnowPM25.min, oAirnowPM25.max, 'PM 2.5(ug/m3), from AIRNow', 'colorbar_canvas2')
	  }
      }

    if ( (datatype == 'airnow.pm10') || (datatype == 'airnow2.pm10') || (datatype == 'aqs.pm10') ) {
	  if ( (typeof oAirnowPM10.min === 'undefined') || (typeof oAirnowPM10.max === 'undefined') ) {
	      oAirnowPM10.min        = 0.0;
	      oAirnowPM10.max        = 60.0;
	  }
	  if (closestFlag) {
	      // the closest lon/lat will not be in the airnow location, and is therefore not useful
	      // only use the closest timestamp and data value
	      oAirnowPM10.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);
	      oAirnowPM10.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);
	  } else {
	      airnowInfo = airnow_info(data, space_delimiter);
	      header                 = airnow_extractHeader    (data, space_delimiter, 0);
	      oAirnowPM10.name       = 'airnow_pm10';
	      oAirnowPM10.timestamp  = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);// directly access with slider pos
	      oAirnowPM10.lon        = airnow_createDataArray  (data, space_delimiter, 1, 1, 0, 1);// directly access with slider pos
	      oAirnowPM10.lat        = airnow_createDataArray  (data, space_delimiter, 2, 1, 0, 1);// directly access with slider pos
	      oAirnowPM10.id         = airnow_createStringArray(data, space_delimiter, 3, 1, 0, 1);// directly access with slider pos
	      oAirnowPM10.variable   = airnow_createDataArray  (data, space_delimiter, 4, 1, 0, 1);// directly access with slider pos	      
	      oAirnowPM10.nSites     = airnowInfo[0];
	      oAirnowPM10.nTimes     = airnowInfo[1];
	      oAirnowPM10.oSlider_indices = airnow_sliderpos_lookup(oAirnowPM10);
	      oAirnowPM10.msec       = airnow_compute_msec(oAirnowPM10);
	      // we will find the closest lon/lat here
	      oAirnowPM10.closestLonLat   = findClosestLonLat(oAirnowPM10); 
              //oAirnowPM10.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);	     
              //oAirnowPM10.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);

	      appendAqsGoogleLatLng(oAirnowPM10);
	      //init_colorbar(25, 25, oAirnowPM10.min, oAirnowPM10.max, 'PM 10(ug/m3), from AIRNow', 'colorbar_canvas2')
	  }
      }

      if ( (datatype == 'airnow.co') || (datatype == 'airnow2.co') || (datatype == 'aqs.co') ) {
	  if ( (typeof oAirnowCO.min === 'undefined') || (typeof oAirnowCO.max === 'undefined') ) {
	      oAirnowCO.min        = 0.0;
	      oAirnowCO.max        = 1.0;
	  }
	  if (closestFlag) {
	      // the closest lon/lat will not be in the airnow location, and is therefore not useful
	      // only use the closest timestamp and data value
	      oAirnowCO.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);
	      oAirnowCO.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);
	  } else {
	      airnowInfo = airnow_info(data, space_delimiter);
	      header                 = airnow_extractHeader    (data, space_delimiter, 0);
	      oAirnowCO.name       = 'airnow_co';
	      oAirnowCO.timestamp  = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);// directly access with slider pos
	      oAirnowCO.lon        = airnow_createDataArray  (data, space_delimiter, 1, 1, 0, 1);// directly access with slider pos
	      oAirnowCO.lat        = airnow_createDataArray  (data, space_delimiter, 2, 1, 0, 1);// directly access with slider pos
	      oAirnowCO.id         = airnow_createStringArray(data, space_delimiter, 3, 1, 0, 1);// directly access with slider pos
	      oAirnowCO.variable   = airnow_createDataArray  (data, space_delimiter, 4, 1, 0, 1);// directly access with slider pos
	      oAirnowCO.nSites     = airnowInfo[0];
	      oAirnowCO.nTimes     = airnowInfo[1];
	      oAirnowCO.oSlider_indices = airnow_sliderpos_lookup(oAirnowCO);
	      oAirnowCO.msec       = airnow_compute_msec(oAirnowCO);
	      // we will find the closest lon/lat here
	      oAirnowCO.closestLonLat   = findClosestLonLat(oAirnowCO); 

	      appendAqsGoogleLatLng(oAirnowCO);
	  }
      }

      if ( (datatype == 'airnow.no2') || (datatype == 'airnow2.no2') || (datatype == 'aqs.no2') ) {
	  if ( (typeof oAirnowNO2.min === 'undefined') || (typeof oAirnowNO2.max === 'undefined') ) {
	      oAirnowNO2.min        = 0.0;
	      oAirnowNO2.max        = 60.0;
	  }
	  if (closestFlag) {
	      // the closest lon/lat will not be in the airnow location, and is therefore not useful
	      // only use the closest timestamp and data value
	      oAirnowNO2.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);
	      oAirnowNO2.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);
	  } else {
	      airnowInfo = airnow_info(data, space_delimiter);
	      header                 = airnow_extractHeader    (data, space_delimiter, 0);
	      oAirnowNO2.name       = 'airnow_no2';
	      oAirnowNO2.timestamp  = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);// directly access with slider pos
	      oAirnowNO2.lon        = airnow_createDataArray  (data, space_delimiter, 1, 1, 0, 1);// directly access with slider pos
	      oAirnowNO2.lat        = airnow_createDataArray  (data, space_delimiter, 2, 1, 0, 1);// directly access with slider pos
	      oAirnowNO2.id         = airnow_createStringArray(data, space_delimiter, 3, 1, 0, 1);// directly access with slider pos
	      oAirnowNO2.variable   = airnow_createDataArray  (data, space_delimiter, 4, 1, 0, 1);// directly access with slider pos
	      oAirnowNO2.nSites     = airnowInfo[0];
	      oAirnowNO2.nTimes     = airnowInfo[1];
	      oAirnowNO2.oSlider_indices = airnow_sliderpos_lookup(oAirnowNO2);
	      oAirnowNO2.msec       = airnow_compute_msec(oAirnowNO2);
	      // we will find the closest lon/lat here
	      oAirnowNO2.closestLonLat   = findClosestLonLat(oAirnowNO2); 

	      appendAqsGoogleLatLng(oAirnowNO2);
	  }
      }

      if ( (datatype == 'airnow.so2') || (datatype == 'airnow2.so2') || (datatype == 'aqs.so2') ) {
	  if ( (typeof oAirnowSO2.min === 'undefined') || (typeof oAirnowSO2.max === 'undefined') ) {
	      oAirnowSO2.min        = 0.0;
	      oAirnowSO2.max        = 20.0;
	  }
	  if (closestFlag) {
	      // the closest lon/lat will not be in the airnow location, and is therefore not useful
	      // only use the closest timestamp and data value
	      oAirnowSO2.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);
	      oAirnowSO2.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);
	  } else {
	      airnowInfo = airnow_info(data, space_delimiter);
	      header                 = airnow_extractHeader    (data, space_delimiter, 0);
	      oAirnowSO2.name       = 'airnow_so2';
	      oAirnowSO2.timestamp  = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);// directly access with slider pos
	      oAirnowSO2.lon        = airnow_createDataArray  (data, space_delimiter, 1, 1, 0, 1);// directly access with slider pos
	      oAirnowSO2.lat        = airnow_createDataArray  (data, space_delimiter, 2, 1, 0, 1);// directly access with slider pos
	      oAirnowSO2.id         = airnow_createStringArray(data, space_delimiter, 3, 1, 0, 1);// directly access with slider pos
	      oAirnowSO2.variable   = airnow_createDataArray  (data, space_delimiter, 4, 1, 0, 1);// directly access with slider pos
	      oAirnowSO2.nSites     = airnowInfo[0];
	      oAirnowSO2.nTimes     = airnowInfo[1];
	      oAirnowSO2.oSlider_indices = airnow_sliderpos_lookup(oAirnowSO2);
	      oAirnowSO2.msec       = airnow_compute_msec(oAirnowSO2);
	      // we will find the closest lon/lat here
	      oAirnowSO2.closestLonLat   = findClosestLonLat(oAirnowSO2); 

	      appendAqsGoogleLatLng(oAirnowSO2);
	  }
      }



      //if ( (datatype == 'surfmet.temperature') ) {
      if ( (datatype == 'metar.temperature') ) {
	 if ( (typeof oSurfmetTemperature.min === 'undefined') || (typeof oSurfmetTemperature.max === 'undefined') ) {
	     oSurfmetTemperature.min        = -10;
	     oSurfmetTemperature.max        = 40.0;
	 }
	  if (closestFlag) {
	     // the closest lon/lat will not be in the airnow location, and is therefore not useful
	     // only use the closest timestamp and data value
	     oSurfmetTemperature.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);
	     oSurfmetTemperature.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);
	 } else {
	     surfmetInfo             = airnow_info(data, space_delimiter);
	     header                  = airnow_extractHeader    (data, space_delimiter, 0);
	     oSurfmetTemperature.name       = 'surfmet_temperature';
	     oSurfmetTemperature.timestamp  = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);// directly access with slider pos
	     oSurfmetTemperature.lon        = airnow_createDataArray  (data, space_delimiter, 1, 1, 0, 1);// directly access with slider pos
	     oSurfmetTemperature.lat        = airnow_createDataArray  (data, space_delimiter, 2, 1, 0, 1);// directly access with slider pos
	     oSurfmetTemperature.id         = airnow_createStringArray(data, space_delimiter, 3, 1, 0, 1);// directly access with slider pos
	     oSurfmetTemperature.variable   = airnow_createDataArray  (data, space_delimiter, 4, 1, 0, 1);// directly access with slider pos
	     oSurfmetTemperature.nSites     = surfmetInfo[0];
	     oSurfmetTemperature.nTimes     = surfmetInfo[1];
	     oSurfmetTemperature.oSlider_indices = airnow_sliderpos_lookup(oSurfmetTemperature);
	     oSurfmetTemperature.msec       = airnow_compute_msec(oSurfmetTemperature);


	     // we will find the closest lon/lat here
	     oSurfmetTemperature.closestLonLat   = findClosestLonLat(oSurfmetTemperature); 

	     appendSurfmetGoogleLatLng(oSurfmetTemperature);
	     //init_colorbar(25, 25, oSurfmetTemperature.min, oSurfmetTemperature.max, 'Temperature[F], from SURF_MET', 'colorbar_canvas2')
	 }
     }

     //if ( (datatype == 'surfmet.pressure') ) {
     if ( (datatype == 'metar.sealevelpress') ) {
	 if ( (typeof oSurfmetPressure.min === 'undefined') || (typeof oSurfmetPressure.max === 'undefined') ) {
	     oSurfmetPressure.min        = 900.0;
	     oSurfmetPressure.max        = 1200.0;
	 }
	 if (closestFlag) {
	     // the closest lon/lat will not be in the airnow location, and is therefore not useful
	     // only use the closest timestamp and data value
	     oSurfmetPressure.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);
	     oSurfmetPressure.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);
	 } else {
	     surfmetInfo             = airnow_info(data, space_delimiter);
	     header                  = airnow_extractHeader    (data, space_delimiter, 0);
	     oSurfmetPressure.name       = 'surfmet_pressure';
	     oSurfmetPressure.timestamp  = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);// directly access with slider pos
	     oSurfmetPressure.lon        = airnow_createDataArray  (data, space_delimiter, 1, 1, 0, 1);// directly access with slider pos
	     oSurfmetPressure.lat        = airnow_createDataArray  (data, space_delimiter, 2, 1, 0, 1);// directly access with slider pos
	     oSurfmetPressure.id         = airnow_createStringArray(data, space_delimiter, 3, 1, 0, 1);// directly access with slider pos
	     oSurfmetPressure.variable   = airnow_createDataArray  (data, space_delimiter, 4, 1, 0, 1);// directly access with slider pos
	     oSurfmetPressure.nSites    = surfmetInfo[0];
	     oSurfmetPressure.nTimes    = surfmetInfo[1];
	     oSurfmetPressure.oSlider_indices = airnow_sliderpos_lookup(oSurfmetPressure);
	     oSurfmetPressure.msec       = airnow_compute_msec(oSurfmetPressure);

	     // we will find the closest lon/lat here
	     oSurfmetPressure.closestLonLat   = findClosestLonLat(oSurfmetPressure); 

	     appendSurfmetGoogleLatLng(oSurfmetPressure);
	 }
     }

     //if ( (datatype == 'surfmet.wind_speed') ) {
     if ( (datatype == 'metar.windspeed') ) {
	 if ( (typeof oSurfmetWindSpeed.min === 'undefined') || (typeof oSurfmetWindSpeed.max === 'undefined') ) {
	     oSurfmetWindSpeed.min        = 0.0;
	     oSurfmetWindSpeed.max        = 20.0;
	 }
	  if (closestFlag) {
	     // the closest lon/lat will not be in the airnow location, and is therefore not useful
	     // only use the closest timestamp and data value
	     oSurfmetWindSpeed.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);
	     oSurfmetWindSpeed.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);
	 } else {
	     surfmetInfo             = airnow_info(data, space_delimiter);
	     header                  = airnow_extractHeader    (data, space_delimiter, 0);
	     oSurfmetWindSpeed.name       = 'surfmet_windspeed';
	     oSurfmetWindSpeed.timestamp  = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);// directly access with slider pos
	     oSurfmetWindSpeed.lon        = airnow_createDataArray  (data, space_delimiter, 1, 1, 0, 1);// directly access with slider pos
	     oSurfmetWindSpeed.lat        = airnow_createDataArray  (data, space_delimiter, 2, 1, 0, 1);// directly access with slider pos
	     oSurfmetWindSpeed.id         = airnow_createStringArray(data, space_delimiter, 3, 1, 0, 1);// directly access with slider pos
	     oSurfmetWindSpeed.variable   = airnow_createDataArray  (data, space_delimiter, 4, 1, 0, 1);// directly access with slider pos
	     oSurfmetWindSpeed.nSites    = surfmetInfo[0];
	     oSurfmetWindSpeed.nTimes    = surfmetInfo[1];
	     oSurfmetWindSpeed.oSlider_indices = airnow_sliderpos_lookup(oSurfmetWindSpeed);
	     oSurfmetWindSpeed.msec       = airnow_compute_msec(oSurfmetWindSpeed);

	     // we will find the closest lon/lat here
	     oSurfmetWindSpeed.closestLonLat   = findClosestLonLat(oSurfmetWindSpeed); 

	     appendSurfmetGoogleLatLng(oSurfmetWindSpeed);
	 }
     }

     //if ( (datatype == 'surfmet.wind_direction') ) {
     if ( (datatype == 'metar.winddir') ) {
	 //oSurfmetWindDirection.min        = -180.0;
	 //oSurfmetWindDirection.max        = 180.0;
         oSurfmetWindDirection.min        = 0.0;
	 oSurfmetWindDirection.max        = 360.0;
	 if (closestFlag) {
	     // the closest lon/lat will not be in the airnow location, and is therefore not useful
	     // only use the closest timestamp and data value
	     oSurfmetWindDirection.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);
	     oSurfmetWindDirection.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);
	 } else {
	     surfmetInfo             = airnow_info(data, space_delimiter);
	     header                  = airnow_extractHeader    (data, space_delimiter, 0);
	     oSurfmetWindDirection.name       = 'surfmet_winddirection';
	     oSurfmetWindDirection.timestamp  = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);// directly access with slider pos
	     oSurfmetWindDirection.lon        = airnow_createDataArray  (data, space_delimiter, 1, 1, 0, 1);// directly access with slider pos
	     oSurfmetWindDirection.lat        = airnow_createDataArray  (data, space_delimiter, 2, 1, 0, 1);// directly access with slider pos
	     oSurfmetWindDirection.id         = airnow_createStringArray(data, space_delimiter, 3, 1, 0, 1);// directly access with slider pos
	     oSurfmetWindDirection.variable   = airnow_createDataArray  (data, space_delimiter, 4, 1, 0, 1);// directly access with slider pos
	     oSurfmetWindDirection.nSites    = surfmetInfo[0];
	     oSurfmetWindDirection.nTimes    = surfmetInfo[1];
	     oSurfmetWindDirection.oSlider_indices = airnow_sliderpos_lookup(oSurfmetWindDirection);
	     oSurfmetWindDirection.msec       = airnow_compute_msec(oSurfmetWindDirection);

	     // we will find the closest lon/lat here
	     oSurfmetWindDirection.closestLonLat   = findClosestLonLat(oSurfmetWindDirection); 

	     appendSurfmetGoogleLatLng(oSurfmetWindDirection);
	 }
     }

    if ( (datatype == 'purpleair.pm25_corrected') ) {
        
	 if ( (typeof oPurpleairPM25.min === 'undefined') || (typeof oPurpleairPM25.max === 'undefined') ) {
	     oPurpleairPM25.min        =  0.0;
	     oPurpleairPM25.max        = 50.0;
	 }
	 if (closestFlag) {
             
	     // the closest lon/lat will not be in the airnow location, and is therefore not useful
	     // only use the closest timestamp and data value
             header = data.split("\n")[0].split(space_delimiter);
             dataColumn = -1;
             for (i=0; i<header.length; i++) {
                 //console.log(header[i]);
                 if (header[i].toLowerCase().indexOf("pm25") >=0 ) {
                     dataColumn = i;
                 }
             }
	     oPurpleairPM25.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);
	     oPurpleairPM25.closestVariable  = airnow_createDataArray  (data, space_delimiter, dataColumn, 1, 0, 1); // variable is in 7th column (regridded)
	 } else {
	     purpleairInfo             = purpleair_info(data, space_delimiter);
	     header                    = airnow_extractHeader    (data, space_delimiter, 0);
	     oPurpleairPM25.name       = 'purpleair_pm25corrected';
	     oPurpleairPM25.timestamp  = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);// directly access with slider pos
	     oPurpleairPM25.lon        = airnow_createDataArray  (data, space_delimiter, 1, 1, 0, 1);// directly access with slider pos
	     oPurpleairPM25.lat        = airnow_createDataArray  (data, space_delimiter, 2, 1, 0, 1);// directly access with slider pos
	     oPurpleairPM25.id         = airnow_createStringArray(data, space_delimiter, 4, 1, 0, 1);// directly access with slider pos
	     oPurpleairPM25.count      = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);// directly access with slider pos
	     oPurpleairPM25.variable   = airnow_createDataArray  (data, space_delimiter, 6, 1, 0, 1);// directly access with slider pos
	     oPurpleairPM25.nSites     = purpleairInfo[0];
	     oPurpleairPM25.nTimes     = purpleairInfo[1];
	     oPurpleairPM25.msec       = purpleair_compute_msec(oPurpleairPM25);
	     oPurpleairPM25.oSlider_indices = purpleair_sliderpos_lookup(oPurpleairPM25);
             
	     // we will find the closest lon/lat here
	     oPurpleairPM25.closestLonLat   = findClosestLonLat(oPurpleairPM25); 
             //console.log(oPurpleairPM25);
	     appendPurpleairGoogleLatLng(oPurpleairPM25);
	 }
     }
    
     if ( (datatype == 'hms.fire_power') ) {
	 oHmsFire.min        = 0.0;
	 oHmsFire.max        = 500.0;
	 if (closestFlag) {
	     // the closest lon/lat will not be in the airnow location, and is therefore not useful
	     // only use the closest timestamp and data value
	     oHmsFire.closestTimestamp = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);
	     oHmsFire.closestVariable  = airnow_createDataArray  (data, space_delimiter, 5, 1, 0, 1);
	 } else {
	     hmsInfo                  = airnow_info(data, space_delimiter);
	     header                   = airnow_extractHeader    (data, space_delimiter, 0);
	     oHmsFire.name            = 'hms_firepower';
	     oHmsFire.timestamp       = airnow_createStringArray(data, space_delimiter, 0, 1, 0, 1);// directly access with slider pos
	     oHmsFire.lon             = airnow_createDataArray  (data, space_delimiter, 1, 1, 0, 1);// directly access with slider pos
	     oHmsFire.lat             = airnow_createDataArray  (data, space_delimiter, 2, 1, 0, 1);// directly access with slider pos
	     //oHmsFire.id              = airnow_createStringArray(data, space_delimiter, 3, 1, 0, 1);// directly access with slider pos
             oHmsFire.id              = Array(oHmsFire.timestamp.length).fill('NOAA HMS Fire Detection');
	     oHmsFire.variable        = airnow_createDataArray  (data, space_delimiter, 3, 1, 0, 1);// directly access with slider pos
	     oHmsFire.nSites          = 1; // hardcode to 1, since array is ragged
	     oHmsFire.nTimes          = hmsInfo[1];
	     oHmsFire.msec            = hms_compute_msec(oHmsFire); // msec for each datapoint
             oHmsFire.msecUnique      = unique(oHmsFire.msec);      // msec for each bin of like times (indexed by 0:nTimes-1)
	     oHmsFire.daysUnique      = hms_compute_daysUnique(oHmsFire); // YYYYMMDD for each msecUnique
             oHmsFire.nDays           = oHmsFire.daysUnique.length;
	     oHmsFire.oSlider_indices = hmsFireFastmarker_sliderpos_lookup(oHmsFire);
	     

             //console.log("oHmsFire:", oHmsFire);

	     // we will find the closest lon/lat here
	     oHmsFire.closestLonLat   = findClosestLonLat(oHmsFire); 
	     appendHmsGoogleLatLng(oHmsFire);

	 }
     }



      //debug("done building airnow object");
     update_timeseriesPlot();
    }

function findClosestLonLat(dataObj) {

    var nElements = dataObj.lat.length;
    var minDist = 1000000;
    var minLon  = dataObj.lon[0];     // default
    var minLat  = dataObj.lat[0];     // default
    var returnval = [minLon, minLat]; // default

    baseLon = oUserdata.lon[0][0];
    baseLat = oUserdata.lat[0][0];

    for (thisInd=0; thisInd<nElements-1; thisInd++) {
	thisLon = dataObj.lon[thisInd];
	thisLat = dataObj.lat[thisInd];
	thisDist = getDistanceFromLatLonInKm(baseLat, baseLon, thisLat, thisLon);
	if (thisDist < minDist) {
	    minDist = thisDist;
	    minLon = thisLon;
	    minLat = thisLat;
	}
    }
    
    returnval = [minLon, minLat];

    return returnval;

}


function purpleair_info(data_string, field_separator, siteLimit) {
    // figure out how many unique sites and times are in this data
    // Purpleair may have a different number of sites at each time.
  	
    var data_string, fileLines, thisTime;
    var n;
    var n_sites  = 0;
    var n_times  = 0;
    var siteArray = new Array();
    //console.log(data_string);
    if (typeof data_string == 'object') {
        fileLines=data_string.result.split("\n");
    } else {
        fileLines=data_string.split("\n");
    }
    
    thisLine = fileLines[1].split(field_separator);
    lastTime = thisLine[0].substring(0,13); // only want time up to the hour

    for (n = 1; n < fileLines.length-1; n++) { // skip header (n=1)
        //console.log(n_sites, n_times);  
        thisLine = fileLines[n].split(field_separator);
        thisTime = thisLine[0].substring(0,13); // only want time up to the hour
        
        //debug(thisTime + "....." + lastTime);
        if (thisTime == lastTime) {
            n_sites = n_sites + 1;
        } else {
            n_times = n_times + 1;
            siteArray.push(n_sites);
            n_sites = 1; // reset for next time
            //console.log(thisTime);
        }
        lastTime = thisTime;
    }
    
    siteArray.push(n_sites);
    n_times = n_times + 1; // because the first time was not counted  
    return_val = [siteArray, n_times];
    
    return return_val;
}


function airnow_info(data_string, field_separator) {
  // figure out how many unique sites and times are in this data
  	
  var data_string, fileLines, thisTime;
  var n;
  var n_sites  = 0;
  var n_times  = 0;
  var doit = 1;
  //console.log(data_string);
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
    
function airnow_extractHeader(data_string, field_separator, line_number) {
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


function airnow_createStringArray(data_string, field_separator, field_position, first_line, flag2D, num_to_average) {
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

function airnow_createDataArray(data_string, field_separator, field_position, first_line, flag2D, num_to_average) {
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

            //if (n < 10) { console.log(thisLine[field_position], thisData); }
            //if (n < 10) { console.log(thisLine); }
            
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
