function loadFile(input, optional_flag) {
     var input, file, fr;
     var message;
     var optional_flag;

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
		  if (optional_flag) {
		      file2LoadedFlag = true;
		  } else {
		      file1LoadedFlag = true;
		  }
		  
	      }
		 
              fr.readAsText(file);
	      
        }
        

	

        function update_readCount() {
          //read_count++;
        } 
       
        function receivedText() {
            //showResult(fr, "Text");

            //fr = new FileReader();
            //fr.onload = receivedBinary;
            //fr.readAsBinaryString(file);
        }

        function receivedBinary() {
            //showResult(fr, "Binary");
        }

	//console.log("returning");
	//console.log(fr.length);
	return fr;
}


function check_header(header, frindex){
  // make sure the header is kosher
 
  var status = 0; // default ok

  // check header length
  if (header.length < 5) {
    alert("Header length of " + header.length + " is too short."); 
    print("header = " + header);
    status=1;
  }

  if (frindex == 0) {

      oHeaderColumn1.data = new Array(header.length - 4); // -4 because we are not including timestamp, lat, lon, id

      // determine which column is which
      var thisDataInd = 0;
      for (ind=0; ind<header.length; ind++) {
	  if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("TIMESTAMP") != -1) {
	      oHeaderColumn1.timestamp = ind;
	  } else if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("EAST_LONGITUDE(DEG)") != -1) {
	      oHeaderColumn1.longitude = ind;
	  } else if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("NORTH_LATITUDE") != -1) {
	      oHeaderColumn1.latitude = ind;
	  } else if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("ID(-)") != -1) {
	      oHeaderColumn1.id = ind;
	  } else {
	      oHeaderColumn1.data[frindex, thisDataInd] = ind;
              
              // also detect wind component columns
              if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("WIND_DIRECTION") != -1) {
                  oHeaderColumn1.wind_direction = thisDataInd;
              }
              if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("WIND_MAGNITUDE") != -1) {
                  oHeaderColumn1.wind_magnitude = thisDataInd;
              }

	      thisDataInd += 1;
	  }
      }

      //console.log("mag = ", oHeaderColumn1.wind_magnitude);
      //console.log("dir = ", oHeaderColumn1.wind_direction);


      if (oHeaderColumn1.timestamp == -1) {
	  alert("Not found: timestamp coulumn of the form Timestamp");
	  status=1;
      } else if (oHeaderColumn1.longitude == -1) {
	  alert("Not found: longitude column of the form EAST_LONGITUDE(deg)");
	  status=1;
      } else if (oHeaderColumn1.latitude == -1) {
	  alert("Not found: latitude column of the form NORTH_LATITUDE(deg)");
	  status=1;
      } else if (oHeaderColumn1.id == -1) {
	  alert("Not found: identifier column");
	  status=1;
      }

  } else if (frindex == 1) {
      oHeaderColumn2.data = new Array(header.length - 4); // -4 because we are not including timestamp, lat, lon, id

      // determine which column is which
      var thisDataInd = 0;
      for (ind=0; ind<header.length; ind++) {
	  if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("TIMESTAMP") != -1) {
	      oHeaderColumn2.timestamp = ind;
	  } else if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("EAST_LONGITUDE(DEG)") != -1) {
	      oHeaderColumn2.longitude = ind;
	  } else   if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("NORTH_LATITUDE") != -1) {
	      oHeaderColumn2.latitude = ind;
	  } else if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("ID(-)") != -1) {
	      oHeaderColumn2.id = ind;
	  } else {
	      oHeaderColumn2.data[frindex, thisDataInd] = ind;

              // also detect wind component columns
              if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("WIND_DIRECTION") != -1) {
                  oHeaderColumn2.wind_direction = thisDataInd;
              }
              if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("WIND_MAGNITUDE") != -1) {
                  oHeaderColumn2.wind_magnitude = thisDataInd;
              }
	      thisDataInd += 1;
	  }
      }

      if (oHeaderColumn2.timestamp == -1) {
	  alert("Not found: timestamp coulumn of the form Timestamp");
	  status=1;
      } else if (oHeaderColumn2.longitude == -1) {
	  alert("Not found: longitude column of the form EAST_LONGITUDE(deg)");
	  status=1;
      } else if (oHeaderColumn2.latitude == -1) {
	  alert("Not found: latitude column of the form NORTH_LATITUDE(deg)");
	  status=1;
      } else if (oHeaderColumn2.id == -1) {
	  alert("Not found: identifier column");
	  status=1;
      }
  } else if (frindex >= 2) {
      var sensorInd = frindex - 2; // 0 and 1 are taken. frindex=2, 3, 4,... equates to sensorInd 0, 1, 2, ...
       mySensorHeaderArray[sensorInd].data = new Array(header.length - 4); // -4 because we are not including timestamp, lat, lon, id
      
      // determine which column is which
      var thisDataInd = 0;
      for (ind=0; ind<header.length; ind++) {
	  if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("TIMESTAMP") != -1) {
	      mySensorHeaderArray[sensorInd].timestamp = ind;
	  } else if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("EAST_LONGITUDE(DEG)") != -1) {
	      mySensorHeaderArray[sensorInd].longitude = ind;
	  } else   if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("NORTH_LATITUDE") != -1) {
	      mySensorHeaderArray[sensorInd].latitude = ind;
	  } else if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("ID(-)") != -1) {
	      mySensorHeaderArray[sensorInd].id = ind;
	  } else {
	      mySensorHeaderArray[sensorInd].data[frindex, thisDataInd] = ind;

              // also detect wind component columns
              if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("WIND_DIRECTION") != -1) {
                  mySensorHeaderArray[sensorInd].wind_direction = thisDataInd;
              }
              if (header[ind].toUpperCase().replace(/\s+/g, '').indexOf("WIND_MAGNITUDE") != -1) {
                  mySensorHeaderArray[sensorInd].wind_magnitude = thisDataInd;
              }
	      thisDataInd += 1;
	  }
      }

      if (mySensorHeaderArray[sensorInd].timestamp == -1) {
	  alert("Not found: timestamp coulumn of the form Timestamp");
	  status=1;
      } else if (mySensorHeaderArray[sensorInd].longitude == -1) {
	  alert("Not found: longitude column of the form EAST_LONGITUDE(deg)");
	  status=1;
      } else if (mySensorHeaderArray[sensorInd].latitude == -1) {
	  alert("Not found: latitude column of the form NORTH_LATITUDE(deg)");
	  status=1;
      } else if (mySensorHeaderArray[sensorInd].id == -1) {
	  alert("Not found: identifier column");
	  status=1;
      }
  }

  if (status != 0) {
    document.getElementById("div_fileSelection").style.display="block";
    document.getElementById("div_dataDisplay").style.display="none";
  }

}


function remove_comments(fr) {

  pattern = /##.*?(\n|\r\n)/g;   // toss everything between ## and newline

  if (typeof fr === 'object') {
      fr_strip = fr.result.replace(pattern, "");
  } else {
      fr_strip = fr.replace(pattern, "");
  }

  return fr_strip;
}


// Begin VIPER routines /////////////////////////////////////

function readLine(reader, data) {
   if (reader.index < 0) {
      reader.data = null;
      return reader.data;
   }
   var newIndex = data.indexOf('\n', reader.index);
   if (newIndex > 0) {
      reader.data = data.substring(reader.index, newIndex);
      if (newIndex + 1 < data.length) //skip newline
         reader.index = newIndex + 1;
      else {//Either at the last line or data is incomplete, return null if data is incomplete, let caller try again later
         if (reader.loadingData == true)
            return null;
         reader.index = -1;
      }
   } else {
      reader.data = data.substring(index);
      reader.index = -1;
   }
   reader.fields = reader.data.split(/[\",]+/);
   return reader.fields;
}

function detectVIPER( data ) {
   var reader = { index : 0, data : ''  };
   readLine(reader, data);
   return reader.data != null && reader.data.indexOf('ReducedReadingID') != -1;
}

function convertVIPER(fr) {
   var data = fr.result;
   var reader = { index : 0, data : ''  };
   var contents = readLine(reader, data);
   
   for (var i = 0; i < contents.length; ++i) {

      switch (contents[i]) {
         case "InitialReadingID":
            IDX_READING_ID=i;
            break;
         case "Received_UTC":
            IDX_TSTMP=i
            break;
         case 'Instrument':
            IDX_INSTRUMENT=i
            break;
         case 'SensorName':
            IDX_SENSORNAME=i
            break;
         case 'SensorReading':
            IDX_SENSORREADING=i
            break;
         case 'SensorUnits':
            IDX_SENSORUNITS=i
            break;
         case 'Latitude':
            IDX_LAT=i
            break;
         case 'Longitude':
            IDX_LON=i
            break;
         case 'LINCLatitude':
            IDX_LINCLAT=i
            break;
         case 'LINCLongitude':
            IDX_LINCLON=i
            break;
      }
   }

   //Build ID
   contents = readLine(reader, data);
   RETIGO_ID=contents[IDX_INSTRUMENT] + '-' + contents[IDX_TSTMP];
   RETIGO_ID=RETIGO_ID.replace(/ /g, '.');

   //Get list of variables
   var currentId = contents[IDX_READING_ID];
   var READINGID = currentId;

   var numVars = 0;
   var variables = new Array();

   while (currentId == READINGID) {
      variables.push(contents[IDX_SENSORNAME] + '(' + contents[IDX_SENSORUNITS] + ')' );
      ++numVars;
      contents = readLine(reader, data);
      currentId=contents[IDX_READING_ID];
   }

   //build header
   var header = "Timestamp(UTC),EAST_LONGITUDE(deg),NORTH_LATITUDE(deg),ID(-)";
   for (i in variables)
      header += "," + variables[i];

   var retigoData = header;  
   
   //begin converting data
   reader.index = 0;
   readLine(reader, data);
   contents = readLine(reader, data);
   var line;
   while (contents != null || reader.loadingData == true) {
      timestamp = contents[IDX_TSTMP];
      tsDate = new Date(timestamp);
      timestamp = tsDate.getUTCFullYear() + '-' + pad(tsDate.getUTCMonth() + 1) + "-" + pad(tsDate.getUTCDate()) + 'T' + tsDate.getUTCHours() + ':' + tsDate.getUTCMinutes() + ':' + tsDate.getUTCSeconds() + '.' + Math.round(tsDate.getUTCMilliseconds() / 10) + '+00:00';
      lon = contents[IDX_LON];
      lat = contents[IDX_LAT];
      line = timestamp + ',' + lon + ',' + lat + ',' + RETIGO_ID + ',' + contents[IDX_SENSORREADING];
      for (i = 1; i < numVars; ++i) {
         contents = readLine(reader, data);
         if (contents == null && reader.loadingData) { //Data is still coming, wait for it
            --i;
            continue;
         }
         line += "," + contents[IDX_SENSORREADING];
      }
      retigoData += "\n" + line;
      contents = readLine(reader, data);
    }
    return retigoData;
}

function pad(num) {
   return ('0' + num).slice(-2);
}

// End VIPER routines /////////////////////////////////////



function sort_by_ID(frIn, dataObj) {

    // frindex meanings
    // main data,   frindex = 0
    // merged data, frindex = 1
    // mysensor,    frindex = 2
    
    //console.log("in sort_by_ID");
  busyShow('map');
  fr = 0;
  
  //console.log(frIn);

  if (frIn == 0 || typeof frIn == 'undefined') {return 0;}

    if (frIn != 0 && dataObj.name.indexOf("mysensor") == -1) {
    if (detectVIPER(frIn.result)) {
       frIn = convertVIPER(frIn);
    }
  }

  if (frIn != 0) { fr = remove_comments(frIn); }
  var space_delimiter = new RegExp("\\s+");
  var comma_delimiter = ",";
  var my_delimiter1;
  var my_delimiter2;
  // preprocessing for fr
  // detect the delimiter for fr1 (either space or comma)
  comma_pos = fr.search(comma_delimiter);
  if (comma_pos == -1) {
    my_delimiter1 = space_delimiter;
    temp_delimiter1 = " ";
    print("Detected space delimited file.");
  } else {
    my_delimiter1 = comma_delimiter;
    temp_delimiter1 = ",";
    print("Detected comma delimited file.");
    // we are comma delimited, so remove all whitespace
    fr = fr.replace(/ /g, "");
  }

  fileLinesA = fr.replace(/\r/g,"").split("\n");
  //if (oUserdata.fileLinesA.length == 0) {
  //      //oUserdata.fileLinesA = [...fileLinesA]; // deep copy
  //      oUserdata.fileLinesA = fileLinesA.slice(); // deep copy
  //      oUserdata.delimiter  = my_delimiter1;
  //}
  if (dataObj.fileLinesA.length == 0) {
        //oUserdata.fileLinesA = [...fileLinesA]; // deep copy
        dataObj.fileLinesA = fileLinesA.slice(); // deep copy
        dataObj.delimiter  = my_delimiter1;
  }
    
  var header = fileLinesA[0];
  header = header.replace(/,/g, " ");

  //console.log("analysing columns");
  // map timestamp and id columns to column names, for use in sorting below
  var foundTime = false;
  var foundID   = false;
  for (lineInd=0; lineInd<fileLinesA.length-1; lineInd++) {
      thisLine = fileLinesA[lineInd].split(my_delimiter1);
      for (ind=0; ind<thisLine.length; ind++) {
	  if (thisLine[ind].toUpperCase().replace(/\s+/g, '').indexOf("TIMESTAMP") != -1) {
	      nameColTime = "name" + ind;
	      foundTime = true;
	  } else if (thisLine[ind].toUpperCase().replace(/\s+/g, '').indexOf("ID(-)") != -1) {
	      nameColID = "name" + ind;
	      foundID = true
	  }
	  if (foundTime && foundID) {
	      break;
	  }
      }
      if (foundTime && foundID) {
	  break;
      }
  }

  // remove header so it doesn't mess up parsing
  fileLinesA.splice(0,1);



  //sortObj = '[';
  sortArray = [];
  sortArray.push('[');


  //console.log(fileLinesA);
  //console.log("creating sortObj");
  for (lineInd=0; lineInd<fileLinesA.length; lineInd++) {
      thisLine = fileLinesA[lineInd].split(my_delimiter1);
      if (thisLine.length > 1) {
          dataArray = [];
          //dataStr = '{';
          dataArray.push('{');
          
          for (ind=0; ind<thisLine.length; ind++) {
	      //dataStr += '"name' + ind + '":"' + thisLine[ind] + '"';
	      dataArray.push('"name');
	      dataArray.push(ind);
	      dataArray.push('":"');
	      dataArray.push(thisLine[ind]);
	      dataArray.push('"');
	      if (ind < thisLine.length-1) {
	          //dataStr += ',';
	          dataArray.push(',');
	      }
          }
          //dataStr += '}';
          dataArray.push('}');
          dataStr= dataArray.join("");
          //console.log(dataStr);
          //sortObj = sortObj.concat(dataStr);
          sortArray.push(dataStr);
          
          //if (lineInd < fileLinesA.length-2) {
	      //sortObj += ',';
	      //sortObj = sortObj.concat(',');
	      sortArray.push(',');
          //}
      }
  }
  //sortObj += ']';
  // remove final comma and close array
    sortArray.pop();
  sortArray.push(']');
  sortObj = sortArray.join(" ");
  //console.log('parsing JSON');
  try {
    sortObj = JSON.parse(sortObj);
  } catch (err) {
    debug("Error parsing RETIGO file.");
    debug(err.message);
    throw err;
  }
  //console.log(sortObj);

  
  //console.log("actual sort");
  // sort by ID, then by time
  fileLines = sortObj.sort(
    function(a, b) {
	//aID   = a["name3"];
	//bID   = b["name3"];
	//aTime = a["name0"];
	//bTime = b["name0"];
	aID   = a[nameColID];
	bID   = b[nameColID];
	aTime = a[nameColTime];
	bTime = b[nameColTime];


	//debug(aID + " " + bID + ' ' + aTime + ' ' + bTime);
	if(aID === bID) { 
	    // if IDs are same, sort by time
	    if (aTime > bTime) {
		return 1;
	    } else if (aTime < bTime) {
		return -1;
	    } else {
		// the characters are equal.
		return 0;
	    }
	} else {
	    // otherwise sort by ID
	    if (aID > bID) {
		return 1;
	    } else if (aID < bID) {
		return -1;
	    } else {
		// the characters are equal.
		return 0;
	    }
	}
	

    }
  );
  //console.log("creating blob");
  myKeys = Object.keys(fileLines[0]);
  return_blob =  header + "\n";
  var output_delimiter = " ";
  //if (my_delimiter1 === space_delimiter) {
  //    output_delimiter = " ";
  //} else {
  //    output_delimiter = ",";
  //}
  
  for (ind=0; ind<fileLines.length; ind++) {
      thisLine = '';
      for (objInd=0; objInd<myKeys.length; objInd++ ) {
	  thisLine += fileLines[ind][myKeys[objInd]];
	  if (objInd < myKeys.length-1) {
	      thisLine += output_delimiter;
	  }
      }
      return_blob = return_blob + thisLine + "\n";
  }

  busyHide('map');
  //console.log("done sorting");
  //console.log(return_blob);
  return return_blob;
}



function merge_filestreams(fr1c, fr2c, mising_value, fill_value) {
  // merge regular users data and wind data
  var space_delimiter = new RegExp("\\s+");
  var comma_delimiter = ",";
  var my_delimiter1;
  var my_delimiter2;

  busyShow('map');

  //console.log("in merge_filestreams");
  //console.log(fr1c);
  //console.log(fr2c);

  //var return_array = new Array();
  fr1 = 0;
  fr2 = 0;
  if (fr1c != 0 && fr1c != null) { fr1 = remove_comments(fr1c); }
  if (fr2c != 0 && fr2c != null) { fr2 = remove_comments(fr2c); }
  //fr1 = fr1c;
  //fr2 = fr2c;
  //debug(fr1);

  // preprocessing for fr1
  // detect the delimiter for fr1 (either space or comma)
  //comma_pos = fr1.result.search(comma_delimiter);
  comma_pos = fr1.search(comma_delimiter);
  if (comma_pos == -1) {
    my_delimiter1 = space_delimiter;
    temp_delimiter1 = " ";
    //print("Detected space delimited file.");
  } else {
    my_delimiter1 = comma_delimiter;
    temp_delimiter1 = ",";
    //print("Detected comma delimited file.");
  }
  // grab headers
  header1 = user_extractHeader(fr1, my_delimiter1, 0);
  //debug(fr1);
  check_header(header1, 0);
  //console.log(oHeaderColumn1.data);

  // grab number of variables 
  n_variables1 = header1.length - 4;
  
  // grab number of lines 
  n_lines1 = user_countlines(fr1, 1);
  // figure out number of points to skip for each filestream
  // the skip number is a modulus (i.e. skip=1 means don't skip any)

  // be careful changing. This is tied to slider
  var max_samples = 1000; 

  num_to_skip1 = Math.floor(n_lines1 / max_samples);
  if (num_to_skip1 < 1) {
    num_to_skip1 = 1;
  }
  //debug("skip1: " + num_to_skip1);
  //console.log("skip1: " + num_to_skip1);

  // preprocessing for fr2
  if (fr2 != 0) {
    // detect the delimiter for fr2 (either space or comma)
    comma_pos = fr2.search(comma_delimiter);
    if (comma_pos == -1) {
      my_delimiter2 = space_delimiter;
      temp_delimiter2 = " ";
      //print("Detected space delimited file.");
    } else {
      my_delimiter2 = comma_delimiter;
      temp_delimiter2 = ",";
      //print("Detected comma delimited file.");
    }
    // grab headers
    header2 = user_extractHeader(fr2, my_delimiter2, 0);
    check_header(header2, 1);
    
    // grab number of variables 
    n_variables2 = header2.length - 4;
    
    // grab number of lines 
    n_lines2 = user_countlines(fr2, 1);
    // figure out number of points to skip for each filestream
    // the skip number is a modulus (i.e. skip=1 means don't skip any)
    num_to_skip2 = Math.floor(n_lines2 / max_samples);
    if (num_to_skip2 < 1) {
      num_to_skip2 = 1;
    }
    //debug("skip2: " + num_to_skip2);
    //console.log("skip2: " + num_to_skip2);
  }

  //console.log(oHeaderColumn1);
  //console.log(oHeaderColumn2);

  // write new header to temporary array, in standard order (time, lon, lat, id, data)
  // mandatory data
  temp_header = header1[oHeaderColumn1.timestamp] + " " +  
                header1[oHeaderColumn1.longitude] + " " +  
                header1[oHeaderColumn1.latitude]  + " " +  
                header1[oHeaderColumn1.id];
  // data from fr1
  for (n=0; n<n_variables1+4; n++){
      if (n != oHeaderColumn1.timestamp && 
	  n != oHeaderColumn1.longitude && 
	  n != oHeaderColumn1.latitude  && 
	  n != oHeaderColumn1.id) { 
	  temp_header = temp_header + " " + header1[n];
      }
  }
  // data from fr2
  if (fr2 != 0) {
    for (n=0; n<n_variables2+4; n++){
	if (n != oHeaderColumn2.timestamp && 
	    n != oHeaderColumn2.longitude && 
	    n != oHeaderColumn2.latitude  && 
	    n != oHeaderColumn2.id) { 
	    temp_header = temp_header + " " + header2[n];
	}
    }
  }
  temp_header = temp_header + "\n";
  //return_array.push(temp_header);
 
  temp_lineBlock = ""; // used for keeping block data (full res, but in blocks of 1000)
  temp_line      = ""; // used for keeping averaged data

  // loop through fr1 and write data to temp array
  //fileLines1 = fr1.result.split("\n");
  fileLines1 = fr1.replace(/\r/g,"").split("\n");

  //debug(fileLines1);  
  var avg_array = new Array(n_variables1+4);
  var avg_n     = new Array(n_variables1+4);
  
  var warningText = "";
    
  for (avgblock=1; avgblock<parseInt(n_lines1/num_to_skip1); avgblock++){ // different from "block data"
    // zero out arrays pertaining to the averaging
    zerofill(avg_array);
    zerofill(avg_n);
    avg_count = 1;
    all_missing_flag = true; // default

    for (rel_ind=1; rel_ind<=num_to_skip1; rel_ind++) {	

	line = (avgblock-1)*num_to_skip1 + rel_ind;  
	//debug(line);
	thisLine = fileLines1[line].split(my_delimiter1);
	if (rel_ind == 1) {
	    var firstID = thisLine[oHeaderColumn1.id];
	}

	// make sure this is not a comment or the header or a bogus line or mixed IDs
	if ( (thisLine.toString().charAt(0) != '#')                && 
	     (thisLine.toString().charAt(0) != 'T')                && 
	     //(thisLine.length > 4)                                 &&
	     (thisLine.length == header1.length)                   &&
	     (thisLine[oHeaderColumn1.id] === firstID)            ) {

            //console.log(thisLine);
            var lastGoodLine = thisLine;


            // detect and replace bogus lat/lons
            //console.log(thisLine[oHeaderColumn1.longitude]);
            if ( (Number(thisLine[oHeaderColumn1.longitude]) < -180.0) ||
                 (Number(thisLine[oHeaderColumn1.longitude]) >  180.0) ||
                 (Number(thisLine[oHeaderColumn1.latitude])  <  -90.0) ||
                 (Number(thisLine[oHeaderColumn1.latitude])  >   90.0) ||
                 (Number(thisLine[oHeaderColumn1.latitude]) == 0 && Number(thisLine[oHeaderColumn1.longitude]) == 0) ) {

                thisLine[oHeaderColumn1.latitude] = -9999;
                thisLine[oHeaderColumn1.longitude] = -9999;
            }

	    // add ID to global list if it is not already there
	    thisID = thisLine[oHeaderColumn1.id];
	    if (oUserdata.idList.indexOf(thisID) == -1) {
		oUserdata.idList.push(thisID);
	    }
	    
	    // write to "block" data object for later use
	    temp_lineBlock = temp_lineBlock + thisLine[oHeaderColumn1.timestamp] + " ";
	    temp_lineBlock = temp_lineBlock + thisLine[oHeaderColumn1.longitude] + " ";
	    temp_lineBlock = temp_lineBlock + thisLine[oHeaderColumn1.latitude] + " ";
	    temp_lineBlock = temp_lineBlock + thisLine[oHeaderColumn1.id] + " ";
	    for (ii=0; ii<n_variables1; ii++) {
		temp_lineBlock = temp_lineBlock + thisLine[oHeaderColumn1.data[ii]] + " ";
	    }
	    //for (ii=0; ii<thisLine.length; ii++) {
	    //temp_lineBlock = temp_lineBlock + thisLine[ii] + " ";
	    //}


	    // also write "fill data" for each non-madatory fr2 variable
	    if (fr2 != 0) {
		for (n=0; n<n_variables2; n++) {
		    temp_lineBlock = temp_lineBlock + fill_value + " ";
		}
	    }
	    temp_lineBlock = temp_lineBlock + "\n";
	    
    
            // compute running average of data (excluding timestamp, lat, lon, and ID)
	    for (varInd=4; varInd<n_variables1+4; varInd++) {

                // scalar averaging on non-wind variables
                if ( varInd != oHeaderColumn1.wind_magnitude+4 && varInd != oHeaderColumn1.wind_direction+4 ) {
                    //console.log(varInd);
                    // find index of next data variable
                    var origVarInd = oHeaderColumn1.data[varInd-4]; // index of data in original header
                    //print(varInd + " " +  origVarInd);
                    if ( (thisLine[origVarInd] != missing_value) ) {
                        avg_array[varInd] = ( (avg_array[varInd]*avg_n[varInd]) + parseFloat(thisLine[origVarInd]) ) / (avg_n[varInd]+1);
                        avg_n[varInd] += 1;
                    }
                }
	    }

            // vector averaging of wind variables
            if ( oHeaderColumn1.wind_magnitude > 0 && oHeaderColumn1.wind_direction > 0 ) {
                var origWindMagnitudeInd = oHeaderColumn1.data[oHeaderColumn1.wind_magnitude]; // index of data in original header
                var origWindDirectionInd = oHeaderColumn1.data[oHeaderColumn1.wind_direction]; // index of data in original header

                var thisMag = Number(thisLine[origWindMagnitudeInd]);
                var thisDir = Number(thisLine[origWindDirectionInd]);
                //console.log(thisMag, thisDir);
                if (thisMag != missing_value && thisDir != missing_value) {
                    // compute vector components
                    var thisX = thisMag * Math.cos(thisDir * Math.PI/180.);
                    var thisY = thisMag * Math.sin(thisDir * Math.PI/180.);

                    // existing averaged quantities
                    var avgMag = avg_array[origWindMagnitudeInd];
                    var avgDir = avg_array[origWindDirectionInd];
                    // existing components
                    var avgX =  avgMag * Math.cos(avgDir * Math.PI/180.);
                    var avgY =  avgMag * Math.sin(avgDir * Math.PI/180.);

                    // new components
                    avgX = ( (avgX*avg_n[origWindMagnitudeInd]) + thisX ) / (avg_n[origWindMagnitudeInd]+1);
                    avgY = ( (avgY*avg_n[origWindMagnitudeInd]) + thisY ) / (avg_n[origWindMagnitudeInd]+1);

                    // new magnitude and direction
                    var newMag = Math.sqrt(Math.pow(avgX,2) + Math.pow(avgY,2));
                    var newDir = 360. + (Math.atan2(avgY, avgX) * 180./(Math.PI));
                    if (newDir > 360.) {
                        newDir = newDir - 360.
                    }

                    //console.log(thisMag, thisDir, thisX, thisY);

                    // update the main array
                    avg_array[origWindMagnitudeInd] = newMag;
                    avg_array[origWindDirectionInd] = newDir;
                    avg_n[origWindMagnitudeInd] += 1;
                    avg_n[origWindDirectionInd] += 1;

                }
            }

	} else {
            if (thisLine.length != header1.length) {
                warningText = "Warning: Some data rows are are incomplete.\nPlease examine and correct your data file.";
                console.log(thisLine);
                console.log(header1);
                console.log(thisLine.length, header1.length, thisLine.length == header1.length);
            }
        }
	// if there wasn't any data, reset the data to missing 
	for (varInd=4; varInd<n_variables1+4; varInd++) {
	    if (avg_n[varInd] == 0) {
		avg_array[varInd] = missing_value;
	    }
	}
    }
    
    //console.log(avg_array);

    // take the time, lat, lon, and ID to be the end of the "averaging block"
    //avg_array[0] = thisLine[oHeaderColumn1.timestamp]; // timestamp
    //avg_array[1] = thisLine[oHeaderColumn1.longitude]; // lon
    //avg_array[2] = thisLine[oHeaderColumn1.latitude]; // lat
    //avg_array[3] = thisLine[oHeaderColumn1.id]; // ID
    avg_array[0] = lastGoodLine[oHeaderColumn1.timestamp]; // timestamp
    avg_array[1] = lastGoodLine[oHeaderColumn1.longitude]; // lon
    avg_array[2] = lastGoodLine[oHeaderColumn1.latitude]; // lat
    avg_array[3] = lastGoodLine[oHeaderColumn1.id]; // ID

    // write data lines to temp line
    for (n=0; n<n_variables1+4; n++) {
      //temp_lineAvg = temp_lineAvg + thisLine[n] + " ";
      temp_line = temp_line + avg_array[n] + " ";
    }
    // also write "fill data" for each non-madatory fr2 variable
    if (fr2 != 0) {
      for (n=0; n<n_variables2; n++) {
	temp_line = temp_line + fill_value + " ";
      }
    }
    
    temp_line = temp_line + "\n"; 



  } // end for
  if ( warningText.length > 0 ) {
      alert(warningText);
  }


  
  // loop through fr2 and write data to temp array
  if (fr2 != 0) {

    fileLines2 = fr2.replace(/\r/g,"").split("\n");
    fileLines2 = fileLines2.sort();
    var avg_array = new Array(n_variables2+4);
    var avg_n     = new Array(n_variables2+4);

    for (avgblock=1; avgblock<n_lines2/num_to_skip2; avgblock++){ // different from "block data"
      // zero out arrays pertaining to the averaging
      zerofill(avg_array);
      zerofill(avg_n);
      avg_count = 1;

      for (rel_ind=1; rel_ind<=num_to_skip2; rel_ind++) {

        line = (avgblock-1)*num_to_skip2 + rel_ind;  
        //debug(line);
        thisLine = fileLines2[line].split(my_delimiter2);
        //debug(thisLine);

        // make sure this is not a comment or the header
        if ( (thisLine.toString().charAt(0) != '#') && (thisLine.toString().charAt(0) != 'T') ) {

          // add ID to global list if it is not already there
          thisID = thisLine[oHeaderColumn2.id];
          if (oUserdata.idList.indexOf(thisID) == -1) {
            oUserdata.idList.push(thisID);
          }

          // write to "block" data object for later use
          // also write "fill data" for each non-madatory fr1 variable
          if (fr1 != 0) {
	      temp_lineBlock = temp_lineBlock + thisLine[oHeaderColumn2.timestamp] + " ";
	      temp_lineBlock = temp_lineBlock + thisLine[oHeaderColumn2.longitude] + " ";
	      temp_lineBlock = temp_lineBlock + thisLine[oHeaderColumn2.latitude] + " ";
	      temp_lineBlock = temp_lineBlock + thisLine[oHeaderColumn2.id] + " ";
	      //for (n=0; n<4; n++) {
	      //  temp_lineBlock = temp_lineBlock + thisLine[n] + " ";
	      //}
	      for (n=4; n<n_variables1+4; n++) {
		  temp_lineBlock = temp_lineBlock + fill_value + " ";
	      }
          }
	  
          //for (ii=4; ii<n_variables2+4; ii++) {
	  //temp_lineBlock = temp_lineBlock + thisLine[ii] + " ";
          //}
	  for (ii=0; ii<n_variables2; ii++) {
	      temp_lineBlock = temp_lineBlock + thisLine[oHeaderColumn2.data[ii]] + " ";
	  }
          temp_lineBlock = temp_lineBlock + "\n";
 

	  // compute running average of data (excluding timestamp, lat, lon, and ID)
	  //for (varInd=4; varInd<n_variables2+4; varInd++) {
	  //if ( (thisLine[varInd] != missing_value) ) {
	  //  avg_array[varInd] = ( (avg_array[varInd]*avg_n[varInd]) + parseFloat(thisLine[varInd]) ) / (avg_n[varInd]+1);
	  //  avg_n[varInd] += 1;
	  //}
	  //}
	  for (varInd=4; varInd<n_variables2+4; varInd++) {
	      // find index of next data variable
	      var origVarInd = oHeaderColumn2.data[varInd-4]; // index of data in original header
	      if ( (thisLine[origVarInd] != missing_value) ) {
		  avg_array[varInd] = ( (avg_array[varInd]*avg_n[varInd]) + parseFloat(thisLine[origVarInd]) ) / (avg_n[varInd]+1);
		  avg_n[varInd] += 1;
	      }
	  }
        }
      }

      // take the time, lat, lon, and ID to be the beginning of the "averaging block"
      avg_array[0] = thisLine[oHeaderColumn2.timestamp]; // timestamp
      avg_array[1] = thisLine[oHeaderColumn2.longitude]; // lon
      avg_array[2] = thisLine[oHeaderColumn2.latitude]; // lat
      avg_array[3] = thisLine[oHeaderColumn2.id]; // ID


      // write data lines to temp line
      for (n=0; n<4; n++) {
        //temp_lineAvg = temp_lineAvg + thisLine[n] + " ";
        temp_line = temp_line + avg_array[n] + " ";
      }
      // also write "missing data" for each non-madatory fr1 variable
      if (fr1 != 0) {
        for (n=4; n<n_variables1+4; n++) {
	  temp_line = temp_line + fill_value + " ";
        }
      }
      // write rest of averaged data
      for (n=4; n<n_variables2+4; n++) {
        //temp_lineAvg = temp_lineAvg + thisLine[n] + " ";
        temp_line = temp_line + avg_array[n] + " ";
      }
    
      temp_line = temp_line + "\n"; 

    } // end for
  }
 

  ////oFR_merged.data = return_array;
  oFR_merged.data      = temp_header + temp_line;
  oFR_mergedBlock.data = temp_header + temp_lineBlock;

  busyHide('map');

  //console.log(oFR_merged);

  //debug(oFR_mergedBlock.data);
  //return return_array;
}


function process_userfile(oFR, filename, missing_value, fill_value, blocktype, indStart, indEnd, gui_flag, process_id_flag) {
 
    //debug(indStart + '===' + indEnd);
    // make sure 'avg' data is loaded before processing block data
    if (blocktype == 'blocktype_blk') {
        while (oUserdata.loaded[blocktype_avg] == false){
            // do nothing 
            //debug("waiting");
        }
        //debug("continuing");
    }
    
    busyShow('map');
    done = false;
    var oFR;
    var fr;
    var filename;
    var max_variables = 15;    // maximum number of non-mandatory variables we can handle     
    var max_ids       = 15;    // maximum number of unique IDs we can handle     
    
    var space_delimiter = new RegExp("\\s+");
    var comma_delimiter = ",";
    var my_delimiter;
    
    var minlat,maxlat,minlon,maxlon;
    var bbox = "";
    var zulu_timerange = "";
    var n_variables;
    var n_lines;
    var n;
    
    var fileLines;
    var fileLinesAll;
    
    var comma_pos;
    
    var blocktpye; // 0=avg, 1=block
    var indStart;  // optional argument if blocktype=1 defines start of block. Ignored for blocktype=0
    var indEnd;    // optional argument if blocktype=1 defines end of block. Ignored for blocktype=0
    
    if (typeof data_string == 'object') {
        //debug("ir object");
	fr = oFR.data;
    } else {
	//debug("ir other");
	fr = oFR.data;
    }
    //debug("process_userfile:");
    //debug(fr);
    //debug("------------------");
    // detect the delimiter (either space or comma)
    comma_pos = fr.search(comma_delimiter);
    if (comma_pos == -1) {
        my_delimiter = space_delimiter;
        //debug("Detected space delimited file.");
    } else {
        my_delimiter = comma_delimiter;
        //debug("Detected comma delimited file.");
    }	
    
    oUserdata.header     = user_extractHeader(fr, my_delimiter, 0);
    
    n_variables = oUserdata.header.length - 4;
    //console.log("n_variables = ", n_variables);
    if (n_variables > max_variables) {
        n_variables = max_variables;
        print("Limiting the number of non-mandatory variables to " + max_variables);
    }
    
    n_lines = user_countlines(fr, 1);
    
    if (typeof fr == 'object') {
	fileLinesAll=fr.result.split("\n");
    } else {
	fileLinesAll=fr.split("\n");
    }
    fileLinesAll = fileLinesAll.sort();
    //debug(fileLinesAll);
    //debug(indStart);
    //debug(indEnd);
    // if we have block data, pull out the relevant block
    if (blocktype == 1) {
        // be careful changing. this is tied to slider.
        blocksize = 1000;
        n_blocks = Math.ceil((fileLinesAll.length)/blocksize);
	//debug('nblocks ' + n_blocks);
        // set up timeblocks in GUI if desired
        if (gui_flag) {
            process_timeblocks(fileLinesAll, n_blocks, blocksize, my_delimiter);
        }
        
        // subset the data
        fileLines = fileLinesAll.slice(indStart, indEnd);
        if (n_lines > blocksize) {
            n_lines = indEnd - indStart;
        }
        
    } else {
	fileLines = fileLinesAll;
    }
    
    // arrays indexed as follows:
    // e.g. return_object.variable[blocktype][time_index] note: blocktype=0(avg) or 1(blocked)      
    // get mandatory information for the data file
    //debug("blocktype = " + blocktype);
    oUserdata.timestamp[blocktype]  = user_createStringArray(fileLines, my_delimiter, 0, 1, n_lines, 0);// directly access with slider pos
    oUserdata.lon[blocktype]        = user_createDataArray  (fileLines, my_delimiter, 1, 1, n_lines, 0);// directly access with slider pos
    oUserdata.lat[blocktype]        = user_createDataArray  (fileLines, my_delimiter, 2, 1, n_lines, 0);// directly access with slider pos
    oUserdata.id[blocktype]         = user_createStringArray(fileLines, my_delimiter, 3, 1, n_lines, 0);// directly access with slider pos
    oUserdata.filename              = filename;

    oUserdata.msec[blocktype] = new Array();
    for (myInd=0; myInd<oUserdata.timestamp[blocktype].length; myInd++) {
        let this_dateObjectUTC    = create_dateObjectUTC(oUserdata.timestamp[blocktype][myInd]);
        let this_msec             = this_dateObjectUTC.getTime();
        oUserdata.msec[blocktype].push(this_msec);
    }

    
    // arrays indexed as follows:
    // e.g. return_object.variable[blocktype][variable_index][time_index] note: blocktype=0(avg) or 1(blocked)
    // initialize arrays
    oUserdata.variable[blocktype]       = new Array();
    oUserdata.varname[blocktype]        = new Array();
    oUserdata.min[blocktype]            = new Array();
    oUserdata.max[blocktype]            = new Array();
    oUserdata.mymin[blocktype]          = new Array();
    oUserdata.mymax[blocktype]          = new Array();
    oUserdata.show1[blocktype]          = new Array();
    oUserdata.show2[blocktype]          = new Array();
    
    // turn off all variable selector buttons by default
    for (n=0; n<max_variables; n++){
        document.getElementById(make_id_string("radio", n)).style.display="none";
        document.getElementById(make_id_string("var", n)).style.display="none";
    }
    if (blocktype == 0) {
        secvar = document.getElementById("timeseries_secondVar");
        for (n=secvar.length-1;n>=0; n--) {
            secvar.remove(n);
        }
        var this_option = document.createElement("option");
        this_option.text = "None";
        secvar.add(this_option);
    }
    //if (blocktype == 0) {
    //  secvar = document.getElementById("scatter_secondVar");
    //  for (n=secvar.length-1;n>=0; n--) {
    //    secvar.remove(n);
    //  }
    //  // comment out below code - don't want 'None'  
    //  //var this_option = document.createElement("option");
    //  //this_option.text = "None";
    //  //secvar.add(this_option);
    //}
    if (blocktype == 0) {
        xaxisvar = document.getElementById("scatter_xaxisVar");
        for (n=xaxisvar.length-1;n>=0; n--) {
            xaxisvar.remove(n);
        }
    }
    if (blocktype == 0) {
        yaxisvar = document.getElementById("scatter_yaxisVar");
        for (n=yaxisvar.length-1;n>=0; n--) {
            yaxisvar.remove(n);
        }
    }
    
    //debug("nlines = " + n_lines);
    // get up to the defined maximum number of  variables from the data file
    
    var windMagFlag  = false;
    var windDirFlag  = false;
    var windMagIndex = 0;
    for (n=0; n<n_variables; n++){
        // initialize separate array for each variable
        oUserdata.variable[blocktype][n] = new Array(n_lines);
        oUserdata.varname[blocktype][n]  = new Array(n_lines);
        oUserdata.show1[blocktype][n]    = new Array(n_lines);
        oUserdata.show2[blocktype][n]    = new Array(n_lines);
        
        oUserdata.variable[blocktype][n] = user_createDataArray(fileLines, my_delimiter, n+4, 1, n_lines, 0);// directly access with slider pos
        oUserdata.varname[blocktype][n]  = oUserdata.header[n+4].toString();
        
        //console.log(n, oUserdata.varname[blocktype][n]);
        // show radio buttons and set variable names
        //if (oUserdata.varname[blocktype][n] != "wind_direction(deg)") {
        //      //button_label = oUserdata.varname[blocktype][n];
        //    button_label = "wind_vector(m/s)";
        //  } else {
        //    button_label = oUserdata.varname[blocktype][n];
        //  }
        button_label = oUserdata.varname[blocktype][n];
        
        if (oUserdata.varname[blocktype][n].indexOf("wind_magnitude") >= 0) { 
            windMagFlag = true; 
            windMagIndex = n;
        }
        if (oUserdata.varname[blocktype][n] == "wind_direction(deg)") { 
            windDirFlag = true;
        }
        
        document.getElementById(make_id_string("radio", n)).style.display="";
        document.getElementById(make_id_string("var", n)).style.display="";
        document.getElementById(make_id_string("var", n)).innerHTML = "&nbsp;" + button_label;
        if (blocktype == 0) {
            this_option_timeseries      = document.createElement("option");
            //this_option_scatter   = document.createElement("option");
            this_option_scatter_xaxis   = document.createElement("option");
            this_option_scatter_yaxis   = document.createElement("option");
	    this_option_timeseries.text = button_label;
	    //this_option_scatter.text    = button_label;
	    this_option_scatter_xaxis.text    = "Hourly " + button_label;
	    this_option_scatter_yaxis.text    = "Hourly " + button_label;
            document.getElementById("timeseries_secondVar").add(this_option_timeseries);
            //document.getElementById("scatter_secondVar").add(this_option_scatter);
            document.getElementById("scatter_xaxisVar").add(this_option_scatter_xaxis);
            document.getElementById("scatter_yaxisVar").add(this_option_scatter_yaxis);
        }
        //}
        
        
        
        // also store global min and maxes in this object
        //return_object.min[n] = Math.floor(Math.min.apply(Math, oUserdata.variable[n]));
        oUserdata.max[blocktype][n] = Math.ceil (Math.max.apply(Math, oUserdata.variable[blocktype][n]));
        oUserdata.min[blocktype][n] = oUserdata.max[blocktype][n]; //default
        for (myind=0; myind<n_lines; myind++) {
            oUserdata.show1[blocktype][n][myind] = true;
            oUserdata.show2[blocktype][n][myind] = true;
            if ( (oUserdata.variable[blocktype][n][myind] != missing_value) && (oUserdata.variable[blocktype][n][myind] != fill_value) && (oUserdata.variable[blocktype][n][myind] < oUserdata.min[blocktype][n]) ) {
                oUserdata.min[blocktype][n] = Math.floor(oUserdata.variable[blocktype][n][myind]);
            }
        }
        
        // set user defined min/max to the global values
	oUserdata.mymin[blocktype][n] =  oUserdata.min[blocktype][n];
	oUserdata.mymax[blocktype][n] =  oUserdata.max[blocktype][n];
        document.getElementById("my_min").value = oUserdata.mymin[blocktype][0];
        document.getElementById("my_max").value = oUserdata.mymax[blocktype][0];
        
    } 
    
    // add wind vector if the components were present
    if (windMagFlag && windDirFlag) {
        n = n_variables;
        oUserdata.variable[blocktype][n] = new Array(n_lines);
        oUserdata.varname[blocktype][n]  = new Array(n_lines);
        oUserdata.show1[blocktype][n]    = new Array(n_lines);
        oUserdata.show2[blocktype][n]    = new Array(n_lines);
        
        oUserdata.variable[blocktype][n] = oUserdata.variable[blocktype][windMagIndex]; 
        oUserdata.varname[blocktype][n]  = oUserdata.varname[blocktype][windMagIndex].replace("magnitude", "vector");
        oUserdata.show1[blocktype][n]    = oUserdata.show1[blocktype][windMagIndex]; 
        oUserdata.show2[blocktype][n]    = oUserdata.show2[blocktype][windMagIndex]; 
        oUserdata.min[blocktype][n]      = oUserdata.min[blocktype][windMagIndex]; 
        oUserdata.max[blocktype][n]      = oUserdata.max[blocktype][windMagIndex]; 
        oUserdata.mymin[blocktype][n]    = oUserdata.mymin[blocktype][windMagIndex]; 
        oUserdata.mymax[blocktype][n]    = oUserdata.mymax[blocktype][windMagIndex]; 
        
        button_label = oUserdata.varname[blocktype][n];
        document.getElementById(make_id_string("radio", n)).style.display="";
        document.getElementById(make_id_string("var", n)).style.display="";
        document.getElementById(make_id_string("var", n)).innerHTML = "&nbsp;" + button_label;
    }
    
    
    done = true;
    
    if (process_id_flag) {
        process_IDs(oUserdata.idList);
    }
    
    
    
    
    // reset certain values to default
    if (blocktype == 0) {
        document.getElementById('analysis_Xmin').value = 0;
        document.getElementById('analysis_Xmax').value = 0;
        document.getElementById('timeseries_Xmin').value = "";
        document.getElementById('timeseries_Xmax').value = "";          
        document.getElementById('analysisPlotOptionButton').checked = false;
        //document.getElementById('timeseriesPlotOptionButton').checked = false;
        document.getElementById('timeseriesPlotOptionButton').checked = true;
        document.getElementById('windrosePlotOptionButton').checked = false;
        document.getElementById('scatterPlotOptionButton').checked = false;
        delete_analysisMarker();
        bbox = findMapExtents(oUserdata.lat, oUserdata.lon);
        zulu_timerange = findZuluTimerange(oUserdata.timestamp);    
        oUserdata.bbox = bbox;
        oUserdata.timerange = zulu_timerange;
    }
    
    //debug("done!");     
    
    oUserdata.loaded[blocktype] = true; 
    //return return_object;
    
    
    // set default radio button
    if (setDefaultRadio) {
        // we only want to do this when a file is first loaded
        setDefaultRadio = false;
        if (oUserdata.varname[blocktype][0] != "wind_direction(deg)") {
            document.getElementById("radio0").checked = true;
        } else {
            document.getElementById("radio1").checked = true;
        }
    }
    
    busyHide('map');
    
    
}


    function user_extractHeader(data_string, field_separator, line_number) {
      var data_string, fileLines, thisLine;
      var array = [];
      var n;
 
      // see if there are carriage returns (Windows)
      carriage_regexp = new RegExp("\\r+");
      if (typeof data_string == 'object') { 
        cr_pos = data_string.result.search(carriage_regexp);
      } else {
        cr_pos = data_string.search(carriage_regexp);
      }

      if (cr_pos != -1) {
        newline = "\r\n";
      } else {
        newline = "\n";
      }

      if (typeof data_string == 'object') {
        fileLines=data_string.result.split(newline);
      } else {
        fileLines=data_string.split(newline);
      }
      // get the first non-comment line
      thisLine = fileLines[line_number].split(field_separator);
      var counter = 1;
      while (thisLine.toString().charAt(0) == '#') {
      	thisLine = fileLines[line_number+counter].split(field_separator);
      	counter = counter + 1;
      }
      for (n=0; n<thisLine.length; n++) {
        array.push(thisLine[n]);
      }
      return array;
    }


    function user_countlines(data_string, first_line) {
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
      
      //fileLines = fileLines.sort();
      return fileLines.length - first_line;

    }


function process_IDs(id_listBlocked) {
  
  var unique_id_list = [];
  var this_unique_id;
  var this_label;
  var this_checkbox;
  var this_button;

  var br           = document.createElement("br");
  var id_div       = document.getElementById("id_selector");
  var id_label_div = document.getElementById("id_selector_label");

  // clear any previously appended items
  while (id_div.hasChildNodes()) {
    id_div.removeChild(id_div.lastChild);
  }

  oUserdata.idName = [];
  // dynamically append new items
  for (thisblock=0; thisblock<id_listBlocked.length; thisblock++) {
    id_list = id_listBlocked[thisblock];

    //for (var i = 0; i < id_list.length; i++) {
    //if ((jQuery.inArray(id_list[i], unique_id_list)) == -1) {
    //this_unique_id = id_list[i];
        //unique_id_list.push(this_unique_id);

    this_unique_id = id_list;
        this_label= document.createElement("label");
        this_label.appendChild(document.createTextNode(this_unique_id));
        this_label.className   = "controls controlsLabel";
	
        this_checkbox         = document.createElement("input");
        this_checkbox.type    = "checkbox";
        this_checkbox.name    = "id_checkboxes";
        this_checkbox.className   = "controls controlsLabel";
        this_checkbox.id      = this_unique_id;
        this_checkbox.value   = this_unique_id;
        this_checkbox.checked = true;
        this_checkbox.onclick = new Function("subset_by_id_wrapper()");

	oUserdata.idName.push(this_unique_id);
        //this_checkbox.appendChild(this_label);  

        id_div.appendChild(this_checkbox);
        id_div.appendChild(this_label);
        id_div.appendChild(document.createElement("br"));
	//}
	//}
  }
}


function process_timeblocks(flines, nblk, blksize, delimiter) {
  var br             = document.createElement("br");
  var id_mydiv       = document.getElementById("tb_selector");
  var id_mylabel_div = document.getElementById("tb_selector_label");
    

  // clear any previously appended items
  while (id_mydiv.hasChildNodes()) {
    id_mydiv.removeChild(id_mydiv.lastChild);
  }

  // init
  oTimeblock.indStart       = new Array();
  oTimeblock.indEnd         = new Array();
  oTimeblock.timestampStart = new Array();
  oTimeblock.timestampEnd   = new Array();
  oTimeblock.name           = new Array();
 
  while (flines == null) {
    // do nothing
  }

  var idcount = 0;
 
  for (thisblock=0; thisblock<nblk; thisblock++) {
    // nominal starting and ending positions
    iS = thisblock*blksize;
    iE = thisblock*blksize + blksize;
    // check to see if these land on a comment line. if so, bump the indices to the next non-comment line
    offset = 0;
    keep_going = 1;
    while (keep_going == 1) {
      if ( (iS+offset) < flines.length ) {
	if (flines[iS+offset].toString().charAt(0) == '#') {
	  offset += 1;
	} else {
	  keep_going = 0;
        }
      } else {
	keep_going = 0;
      }
    }

    iS = iS + offset;
    if (iS == 0) {
      iS = 1;
    }


    offset = 0;
    keep_going = 1;
    while (keep_going == 1) {
      if ( (iE+offset) < flines.length ) {
	if (flines[iE+offset].toString().charAt(0) == '#') {
	  offset += 1;
	} else {
	  keep_going = 0;
        }
      } else {
	keep_going = 0;
      }
    }

    iE = iE + offset;
    if (iE >= flines.length) {
      iE = flines.length-1;
    }


    if ( (iE - iS) > 2) {

    timestampStart = create_dateObjectUTC(flines[iS].split(delimiter)[0]);
    timestampEnd   = create_dateObjectUTC(flines[iE].split(delimiter)[0]);
    timestampStartConverted = convertUTC_to_timezone(timestampStart, selected_timezone, "ISO8601-roundToMinute", "null");
    timestampEndConverted   = convertUTC_to_timezone(timestampEnd,   selected_timezone, "ISO8601-roundToMinute", "null");

    tS = timestampStartConverted.substr(0,19);
    tE = timestampEndConverted.substr(0,19);

    oTimeblock.indStart.push(iS);
    oTimeblock.indEnd.push(iE); // slice operation that uses this will not process the last element (hence no -1)
    oTimeblock.timestampStart.push(timestampStart);
    oTimeblock.timestampEnd.push(timestampEnd);
    //debug(iS + " ... " + iE);
    this_label= document.createElement("label");
    this_label.id      = "timeblockLabel_" + zeroPad(idcount, 3);
    this_label.className   = "controls controlsLabel";
    this_textNode      = document.createTextNode(tS);
    this_textNode.id   = "timeblockTextnode_" + zeroPad(idcount, 3);
    this_label.appendChild(this_textNode);

    this_radio         = document.createElement("input");
    this_radio.type    = "radio";
    this_radio.name    = "timeblock_buttons";
    this_radio.value   = tS;
    this_radio.id      = "timeblockRadio_" + zeroPad(idcount, 3);

    if (thisblock == 0) {
      this_radio.checked = true;
    }
    this_radio.onclick = new Function("process_timeblock_button(" + idcount + ")");

    id_mydiv.appendChild(this_radio);
    id_mydiv.appendChild(this_label);
    id_mydiv.appendChild(document.createElement("br"));

    idcount += 1;
}
  }


  if (document.getElementById("Blocks").checked == true) { 
      disabled_state = false;
  } else {
      disabled_state = true;
  }
  butgroup = document.getElementsByName("timeblock_buttons");
  for (but=0; but<butgroup.length; but++) {
    butgroup[but].disabled=disabled_state;
  }

}




function user_createStringArray(fileLines, field_separator, field_position, first_line, nlines, flag2D) {
        // use first_line to skip header lines
	var data_string, fileLines, thisData;
	var array = [];
        var buffer = 0.0;
        var avg_count = 1;
        var push_count = 0;
        var n;
      
	if (fileLines != null) {
	    for (n = first_line; n < nlines-1; n++) {
		thisLine = fileLines[n].split(field_separator);
		if (thisLine.toString().charAt(0) != '#') {
		    thisData = thisLine[field_position];
		    array.push(thisData);
		}
	    }
	} 
	return array;
    }

function user_createDataArray(fileLines, field_separator, field_position, first_line, nlines, flag2D) {
        // use first_line to skip header lines
	var data_string, fileLines, thisData;
	var array = [];
        var buffer = 0.0;
        var avg_count = 1;
        var push_count = 0;
        var n;
        

        for (n = first_line; n < nlines-1; n++) {
          thisLine = fileLines[n].toString().split(field_separator);
          if (thisLine.toString().charAt(0) != '#') {
            thisData = Number(thisLine[field_position]);
	  
            if (flag2D == 0) {
              array.push(thisData); // returns a string
            } else {
              array.push([push_count, thisData]); //returns a float
              push_count += 1;
            }
           
          }
        }
     
	return array;
    }




