function initMySensorObject(thisSensorObject) {

    // initialize a new oMySensor object
    thisSensorObject.allVariables     = new Array(); // holds all variables, directly access with slider pos
    thisSensorObject.closestLonLat    = new Array();
    thisSensorObject.closestTimestamp = new Array();
    thisSensorObject.closestVariable  = new Array();
    thisSensorObject.curMax           = 100.0;       // user max for currently selected variable
    thisSensorObject.curMin           = 0.0;         // user min for currently selected variable
    thisSensorObject.curSelectedIndex = 0;
    thisSensorObject.curVarname       = "";
    thisSensorObject.delimiter        = "";
    thisSensorObject.fileLinesA       = "";
    thisSensorObject.fr               = "";
    thisSensorObject.id               = new Array(); // directly access with slider pos
    thisSensorObject.idList           = new Array();
    thisSensorObject.idName           = new Array(); // name of ID checkboxes
    thisSensorObject.lat              = new Array(); // directly access with slider pos
    thisSensorObject.loaded           = new Array();
    thisSensorObject.loadedFlag       = "";
    thisSensorObject.lon              = new Array(); // directly access with slider pos
    thisSensorObject.max              = 100.0;          // for compatibility with other merged data
    thisSensorObject.maxArray         = new Array(); // user max for each variable
    thisSensorObject.min              = 0.0;          // for compatibility with other merged data
    thisSensorObject.minArray         = new Array(); // user max for each variable
    thisSensorObject.msec             = new Array();
    thisSensorObject.nSites           = 1;
    thisSensorObject.plotFlag         = false;
    thisSensorObject.nTimes           = 0;
    thisSensorObject.name             = "";
    thisSensorObject.oSlider_indices  = new Object();
    thisSensorObject.show1            = new Array(); // for cropping by lat/lon
    thisSensorObject.show2            = new Array(); // for subseting by ID
    thisSensorObject.timestamp        = new Array(); // directly access with slider pos
    thisSensorObject.variable         = new Array(); // holds currently selected variable (for compatibility with Airnow, PurpleAir, etc)
    thisSensorObject.varnames         = new Array();
}




function load_mySensorFile(input) {
    
    loadSensorFile(input);
    
}



function get_MySensor(variable, bbox, timerange, urlString, purpose, moveAqsFunc) {

   
    var closestFlag = false; // signifying that we will NOT populate the part of the airnow
    // object dealing with the closest data to the user's dataset, but
    // rather the "cloud" of airnow points surrounding the user's dataset
    
    var requestedHours = compute_timerange_hours(timerange);
    
    var thisMessage;
    if (purpose.indexOf('map') > -1) {
        thisMessage = variable;
        busyMessageQueueMapAdd(thisMessage);
    }
    
    busyShow(purpose);







}
    
function loadSensorFile(input) {
     var input, file, fr;
     var message;

    var sensorInd = getMySensorInd(input.id);

    
     //console.log("in loadFile");
	fr = 0;

        if (typeof window.FileReader !== 'function') {
            message = "The W3C File API is not yet supported on this browser.\n";
            document.getElementById("error_textarea").value += message;
            alert(message);
            return;
        }

        if (!input) {
	      message = "Couldn't find the " + input.name + " fileinput element.\n";
              document.getElementById("error_textarea").value += message;
	      alert(message);
        } else if (!input.files) {
              message = "This browser doesn't seem to support the `files` property of file inputs.\n";
              document.getElementById("error_textarea").value += message;
	      alert(message);
        } else if (!input.files[0]) {
	      if (optional_flag == false) {
                message = "Please select " + input.name  + " file before clicking 'Submit'\n";
                document.getElementById("error_textarea").value += message;
	        alert(message);
		back();
              }
        } else {
	    //console.log("reading");
              file = input.files[0];
              fr = new FileReader();
              fr.onload = function(e) {
		  //console.log(e);
		  //console.log(fr);
                  //oMySensor.fr = remove_comments(fr);
		  //oMySensor.loadedFlag = true;
                  mySensorArray[sensorInd].fr = remove_comments(fr);
                  mySensorArray[sensorInd].loadedFlag = true;
                  myClosestFlag = false;
                  //data_sorted = sort_by_ID(oMySensor.fr, oMySensor);
                  data_sorted = sort_by_ID(mySensorArray[sensorInd].fr, mySensorArray[sensorInd]);
                  build_mysensor_dataobject(data_sorted, myClosestFlag, sensorInd);
                  document.getElementById("addMySensorLocations" + sensorInd).disabled = false;
                  document.getElementById("addMySensor" + sensorInd).disabled = false;
                  updateMySensorVariableSelector(sensorInd);
                  updateMySensorTooltips();
                  update_scatterplot_menu("mysensor" + sensorInd, false);
                  computeExternalCovarianceElement("mysensor" + sensorInd);
                  update_scatterPlot();
	      }
		 
              fr.readAsText(file);
	      
        }

	return fr;
}


function build_mysensor_dataobject(data, closestFlag, sensorInd) {

    var space_delimiter = new RegExp("\\s+");

    if ( (typeof mySensorArray[sensorInd].min === 'undefined') || (typeof mySensorArray[sensorInd].max === 'undefined') ) {
	mySensorArray[sensorInd].min        =   0.0;
	mySensorArray[sensorInd].max        = 100.0;
    }
    if (closestFlag) {
        
	// the closest lon/lat will not be in the airnow location, and is therefore not useful
	// only use the closest timestamp and data value
        //header = data.split("\n")[0].split(space_delimiter);
        //dataColumn = -1;
        //for (i=0; i<header.length; i++) {
        //    //console.log(header[i]);
        //    if (header[i].toLowerCase().indexOf("pm25") >=0 ) {
        //        dataColumn = i;
        //    }
        //}
	//oMySensor.closestTimestamp = airnow_createStringArray(data, oMySensor.delimiter, 0, 1, 0, 1);
	//oMySensor.closestVariable  = airnow_createDataArray  (data, oMySensor.delimiter, dataColumn, 1, 0, 1); // variable is in 7th column (regridded)
    } else {
	//mysensorInfo         = mysensor_info           (data, space_delimiter);
	myheader             = user_extractHeader(mySensorArray[sensorInd].fr, mySensorArray[sensorInd].delimiter, 0);
        check_header(myheader, 2 + sensorInd);
        //console.log(myheader);
        
	mySensorArray[sensorInd].name            = 'mysensor' + sensorInd;
        mySensorArray[sensorInd].curSelectedIndex = 0;
        mySensorArray[sensorInd].varnames        = myheader.slice(4).toString().split(mySensorArray[sensorInd].delimiter);
        mySensorArray[sensorInd].curVarname      = mySensorArray[sensorInd].varnames[mySensorArray[sensorInd].curSelectedIndex];
	mySensorArray[sensorInd].timestamp       = airnow_createStringArray(data, space_delimiter, mySensorHeaderArray[sensorInd].timestamp, 1, 0, 1);// directly access with slider pos
	mySensorArray[sensorInd].lon             = airnow_createDataArray  (data, space_delimiter, mySensorHeaderArray[sensorInd].longitude, 1, 0, 1);// directly access with slider pos
	mySensorArray[sensorInd].lat             = airnow_createDataArray  (data, space_delimiter, mySensorHeaderArray[sensorInd].latitude, 1, 0, 1);// directly access with slider pos
	mySensorArray[sensorInd].id              = airnow_createStringArray(data, space_delimiter, mySensorHeaderArray[sensorInd].id, 1, 0, 1);// directly access with slider pos
	mySensorArray[sensorInd].allVariables    = mysensor_createDataArray(data, space_delimiter, 1, 1, 1, 1, sensorInd);// directly access with slider pos
	mySensorArray[sensorInd].variable        = mySensorArray[sensorInd].allVariables[mySensorArray[sensorInd].curSelectedIndex];
        mySensorArray[sensorInd].nSites          = 1;
	mySensorArray[sensorInd].nTimes          = mySensorArray[sensorInd].timestamp.length;
	mySensorArray[sensorInd].msec            = mysensor_compute_msec(mySensorArray[sensorInd]);
        findGlobalMinMax(mySensorArray[sensorInd].allVariables, sensorInd);
        mySensorArray[sensorInd].curMin          = mySensorArray[sensorInd].minArray[mySensorArray[sensorInd].curSelectedIndex];
        mySensorArray[sensorInd].curMax          = mySensorArray[sensorInd].maxArray[mySensorArray[sensorInd].curSelectedIndex];
	mySensorArray[sensorInd].oSlider_indices = mysensor_sliderpos_lookup(mySensorArray[sensorInd]);

        // since mysensor only has one location, just set these here
        mySensorArray[sensorInd].closestTimestamp = mySensorArray[sensorInd].timestamp;
        mySensorArray[sensorInd].closestVariable  = mySensorArray[sensorInd].variable;

        //mySensorArray[sensorInd].allHourAvgs      = mysensor_computeHourAverages();
        //mySensorArray[sensorInd].hourAvg          = mySensorArray[sensorInd].allHourAvgs[mySensorArray[sensorInd].curSelectedIndex];
        //mySensorArray[sensorInd].oStats          = mysensor_computeStats();
        
	// we will find the closest lon/lat here
	mySensorArray[sensorInd].closestLonLat   = findClosestLonLat(mySensorArray[sensorInd]); 
        //console.log(oPurpleairPM25);
	appendMySensorGoogleLatLng(mySensorArray[sensorInd]);
    }   
}


//function mysensor_computeStats() {
//    // compute stats array similar to that for the user data
//    myStats = {}
//    myStats.varName = new Array(myStats.nVars);
//    myStats.nHours  = oStats.nhours;
//    myStats.nVars   = oMySensor.varnames.length;
//    myStats.count   = new Array(myStats.nVars).fill(0.0);;
//    myStats.hourAvg = new Array(myStats.nVars);
//
//    for (n=0; n<myStats.nVars; n++) {
//        oStats.varName[n]    = "Hourly " + oMysensor.varnames[n];
//        oStats.hourAvg[n]    = new Array(nHours).fill(missing_value);
//    }
//    
//    var nVars = oMySensor.allVariables.length;
//    hourAvgArray = new Array(nVars).fill(missing_value);
//
//    for (n=0; n<nVars; n++) {
//        thisAvg   = 0.0;
//        thisCount = 0;
//        for (tInd=0; tInd<oMySensor.allVariables[n].length; tInd++) {
//            thisMsec = oMySensor.msec[tInd]
//      }
//  }
//}

function mysensor_createDataArray(data_string, field_separator, field_position, first_line, flag2D, num_to_average, sensorInd) {
    // use first_line to skip header lines
    var data_string, fileLines, thisData;
    var allVarsArray = [];
    var buffer = 0.0;
    var avg_count = 1;
    var push_count = 0;
    var n;
    
    if (typeof data_string == 'object') {
        fileLines=data_string.result.split("\n");
    } else {
        fileLines=data_string.split("\n");
    }

    //console.log(mySensorArray);
    nVars = mySensorArray[sensorInd].varnames.length;
    allVarsArray = new Array(nVars);
    for (ind=0; ind<nVars; ind++) {
        allVarsArray[ind] = [];
    }
    
    for (n = first_line; n < fileLines.length-1; n++) {
        //thisLine = fileLines[n].toString().split(/\s+/);
        thisLine = fileLines[n].toString().split(field_separator);
        
        //thisData = Number(thisLine[field_position]);     
        
        
	//if (avg_count < num_to_average) {
        //    buffer = buffer + thisData;
        //    avg_count += 1;
        //} else {
        //    buffer = buffer + thisData;
        //    if (flag2D == 0) {
        //        thisDataArray.push(buffer/num_to_average); // returns a string
        //    } else {
        //        //array.push([n-Math.floor(num_to_average/2.0), buffer/num_to_average]); //returns a float
        //        thisDataArray.push([push_count, buffer/num_to_average]); //returns a float
        //        push_count += 1;
        //    }
        //    // reset the counter
        //    avg_count = 1;
	//    buffer = 0.0;
        //}

        //if (n < 10) { console.log(thisLine); }

        var counter = 0;
        for (lineInd=0; lineInd<thisLine.length; lineInd++) {
            if (lineInd != mySensorHeaderArray[sensorInd].timestamp &&
                lineInd != mySensorHeaderArray[sensorInd].longitude &&
                lineInd != mySensorHeaderArray[sensorInd].latitude &&
                lineInd != mySensorHeaderArray[sensorInd].id) {
                
                thisData = Number(thisLine[lineInd]);
                allVarsArray[counter].push(thisData);
                counter += 1;
            }
                
        }
    }
    
    return allVarsArray;
}


function updateMySensorVariableSelector(sensorInd) {
    //console.log(sensorInd);
    var menu = document.getElementById("mySensorSelector" + sensorInd);

    // remove existing options
    while (menu.options.length > 0) {
        menu.remove(0);
    }

    // add new options
    //for (varnum=0; varnum<oMySensor.varnames.length; varnum++) {
    for (varnum=0; varnum<mySensorArray[sensorInd].varnames.length; varnum++) {
        var myoption = document.createElement('option');
        myoption.text  = mySensorArray[sensorInd].varnames[varnum];
        myoption.value = mySensorArray[sensorInd].varnames[varnum];
        menu.add(myoption);
    }

    // unhide map and timeseries checkboxen
    document.getElementById("divAddMySensor"          + sensorInd).hidden = false;
    document.getElementById("divAddMySensorLocations" + sensorInd).hidden = false;

    // unhide the load widget for another "my sensor"
    nextSensorInd = sensorInd + 1;
    if (nextSensorInd <= 4) {
        document.getElementById("divLoadMySensor" + nextSensorInd).hidden = false;
    }
    
}

function getMySensorInd(myID) {
    console.log(myID);
    
    var sensorInd = 0;
    if (myID === "mySensorFile0" || myID === "mySensorSelector0" || myID === "addMySensorLocations0") { sensorInd = 0; } else 
    if (myID === "mySensorFile1" || myID === "mySensorSelector1" || myID === "addMySensorLocations1") { sensorInd = 1; } else 
    if (myID === "mySensorFile2" || myID === "mySensorSelector2" || myID === "addMySensorLocations2") { sensorInd = 2; } else 
    if (myID === "mySensorFile3" || myID === "mySensorSelector3" || myID === "addMySensorLocations3") { sensorInd = 3; } else 
    if (myID === "mySensorFile4" || myID === "mySensorSelector4" || myID === "addMySensorLocations4") { sensorInd = 4; } else
    { console.log("getMySensorInd:", myID, "not found"); }
    
    return sensorInd;
}

function mySensorVariableChanged(myID) {

    var sensorInd = getMySensorInd(myID);
    
    var menu = document.getElementById(myID);
    //oMySensor.currentVarname   = menu.value;
    //oMySensor.curSelectedIndex = menu.selectedIndex;
    //oMySensor.curVarname       = oMySensor.varnames[oMySensor.curSelectedIndex];
    //oMySensor.variable         = oMySensor.allVariables[oMySensor.curSelectedIndex];
    //oMySensor.curMin           = oMySensor.minArray[oMySensor.curSelectedIndex];
    //oMySensor.curMax           = oMySensor.maxArray[oMySensor.curSelectedIndex];
    //oMySensor.min              = oMySensor.curMin; // for compatibility with other merged data
    //oMySensor.max              = oMySensor.curMax; // for compatibility with other merged data

    //mySensorArray[sensorInd].currentVarname   = menu.value;
    mySensorArray[sensorInd].curSelectedIndex = menu.selectedIndex;
    mySensorArray[sensorInd].curVarname       = mySensorArray[sensorInd].varnames[mySensorArray[sensorInd].curSelectedIndex];
    mySensorArray[sensorInd].variable         = mySensorArray[sensorInd].allVariables[mySensorArray[sensorInd].curSelectedIndex];
    mySensorArray[sensorInd].curMin           = mySensorArray[sensorInd].minArray[mySensorArray[sensorInd].curSelectedIndex];
    mySensorArray[sensorInd].curMax           = mySensorArray[sensorInd].maxArray[mySensorArray[sensorInd].curSelectedIndex];
    mySensorArray[sensorInd].min              = mySensorArray[sensorInd].curMin; // for compatibility with other merged data
    mySensorArray[sensorInd].max              = mySensorArray[sensorInd].curMax; // for compatibility with other merged data

    mySensorArray[sensorInd].closestVariable  = mySensorArray[sensorInd].variable;
    
    document.getElementById("merge_min_MySensor" + sensorInd).value = mySensorArray[sensorInd].curMin;
    document.getElementById("merge_max_MySensor" + sensorInd).value = mySensorArray[sensorInd].curMax;
    
    allAppendFlagMySensors[sensorInd] = false;
    appendMySensorGoogleLatLng(mySensorArray[sensorInd]);

    computeExternalCovarianceElement("mysensor" + sensorInd);
    updateMySensorTooltips();
    update_timeseriesPlot();
    update_scatterPlot();

}

function findGlobalMinMax(myDataArray, sensorInd) {

    var minArray = [];
    var maxArray = [];

    // loop through each variable to find maxes
    for (i=0; i<myDataArray.length; i++) {
        mymax = Math.ceil(Math.max.apply(Math, myDataArray[i]));
        mySensorArray[sensorInd].maxArray.push(mymax);
    }

    // loop through each variable to find mins
    for (i=0; i<myDataArray.length; i++) {
        thisMin = mySensorArray[sensorInd].maxArray[i];
        thisDataArray = myDataArray[i];
        //console.log(thisDataArray);
        for (j=0; j<thisDataArray.length; j++) {
            thisData = thisDataArray[j];
            if ( (thisData < thisMin) && (thisData != missing_value) && (thisData != fill_value) ) {
                thisMin = thisData;
            }
        }
        mySensorArray[sensorInd].minArray.push(thisMin);        
    }
}





function mysensor_info(data_string, field_separator, siteLimit) {
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

