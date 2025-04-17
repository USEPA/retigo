
	var repo_ofr;
	var color_LightBlue = "#EBF2F7";
	var color_DarkBlue  = "#E4E9ED";
	
	// List of files on RETIGO server
	var repo_fileList; 
	
	var first_lat; // used as the lat for the ESDR feed
	var first_lon; // used as the lon for the ESDR feed
	var edsr_flag = 0;
	
	var placeName; // used to indicate place in file name sent to RETIGO server
	var baseTime;  // used to indicate time in file name sent to RETIGO server
	
	var repo_hostname = window.location.hostname;		      
        var repo_rsigserver;
	if (repo_hostname == 'maple.hesc.epa.gov') {
	    // maple currently does not support https
	    repo_rsigserver = 'https://maple.hesc.epa.gov/cgi-bin/rsigserver?';	
	    //repo_rsigserver = 'https://ofmpub.epa.gov/rsig/rsigserver?';
	} else {	      
	    repo_rsigserver = 'https://ofmpub.epa.gov/rsig/rsigserver?';
	}

// put everything in a namespace
var repo = {

    // Reverse geocoder
    // Given a Lat/Lng, return the name of the nearest city or locality
    codeLatLng: function(myLat, myLng) {
	var townName = "";
	var stateName = ""; 
 
	// default placeName
	placeName = "Lat:" + myLat + "_Lon:" + myLng;

	var latlng   = new google.maps.LatLng(myLat, myLng);
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'latLng': latlng}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
		    if (results[1]) {
			var townFound = 0;
			var arrAddress = results[0].address_components;
			//  iterate through address_component array
			$.each(arrAddress, function (i, address_component) {
				if (address_component.types[0] == "locality") { // locality type
				    townName = address_component.long_name.toString();
				    townFound = 1;
				} else 
				    if (address_component.types[0] == "administrative_area_level_2") { // locality type
					if (townFound == 0) { 
					    townName = address_component.long_name.toString();
					    // don't set townFound in case the locality comes later
					}
				    }
				if (address_component.types[0] == "administrative_area_level_1") { // state
				    stateName = address_component.long_name.toString();
				}

				if (townName.length > 0 && stateName.length > 0) {
				    placeName = stateName.replace(/\s/g, '') + "_" + townName.replace(/\s/g, '');
				} else {
				    // do nothing... use default placeName
				}

			    });
		    }
		} else {
		    alert("Geocoder failed due to: " + status);
		}
	    });

    },

    // set_fileList: function(data) {
    // 	repo_fileList = data.trim();
    // 	//repo.debug(repo_fileList);

    // 	fLines=repo_fileList.split('\n');
    // 	for (ind=0; ind<fLines.length; ind++) {
    // 	    thisLine = fLines[ind];
    // 	    var menu = document.getElementById("downloadFileMenu");
    // 	    var thisOption = document.createElement("option");
    // 	    thisOption.text = thisLine;
    // 	    menu.options.add(thisOption, 1);
    // 	}
    // },

    // get_fileList: function() {
    // 	$.ajax({
    // 		url: repo_rsigserver + "retigo/stable/esdr/repository/FileList.txt",
    // 		dataType: "text",
    // 		success: function(data, textStatus, jqXHR) {
    // 		    //alert(data);
    // 		    repo.set_fileList(data);
    // 		    repo.debug("got filelist");
    // 		},
    // 		error: function (jqXHR, textStatus, errorThrown) {
    // 		    repo.debug("RETIGO file list not found");
    // 		    repo.debug("status: " + textStatus);
    // 		    repo.debug("error: " + errorThrown);
    // 		} 
    // 	    });

    // },

    repo_initialize: function() {
	repo.clear_debug();


	// remove all items from download menu
	//    var menu = document.getElementById("downloadFileMenu");
	//    while (menu.length > 1) {
	//      menu.options.remove(1);
	//    }
	//
	//    // get file list
	//    fileList = get_fileList();

    },

    scrollDebug: function() {
	// DO NOT call debug() here because it will set up an infinite loop!
	setTimeout("$('#repo_textarea').scrollTop($('#repo_textarea')[0].scrollHeight);", 50);
    },

    clear_debug: function() {
	$("#repo_textarea").val('');
	repo.scrollDebug();
    },

    back: function() {
	document.getElementById("div_fileSelection").style.display="block";
	document.getElementById("div_dataDisplay").style.display="none";
	location.reload();
    },

    wait: function(milliSeconds) {
	var startTime = new Date().getTime();
	while ( (new Date().getTime() < startTime + milliSeconds) );
    },


    debug: function(stuff) {
	document.getElementById("repo_textarea").value += "\n" + stuff;
	repo.scrollDebug();
    },
  
    formClear1: function() {
	document.getElementById("uploadFile").value = "";
    },

    formClear2: function() {
	document.getElementById("downloadFileMenu").value = "Choose File";
    },

    convertISO8601_to_unix: function(timestring) {
	this_dateObj = create_dateObjectUTC(timestring);
	return this_dateObj.valueOf() / 1000;
    },

    loadFile: function() {
	var filename = document.getElementById("uploadFile");
	if (filename == null) {
	    repo.debug("No file was selected."); 
	    return;
	}
	//repo.debug("uploading " + filename.value);

	var fr = 0;

	if (typeof window.FileReader !== 'function') {
	    message = "The W3C File API is not yet supported on this browser.\n";
	    document.getElementById("repo_textarea").value += message;
	    alert(message);
	    return;
	}

	if (!filename) {
	    message = "Couldn't find the " + filename + " fileinput element.\n";
	    document.getElementById("repo_textarea").value += message;
	    alert(message);
	    return;
	} else if (!filename.files) {
	    message = "This browser doesn't seem to support the `files` property of file inputs.\n";
	    document.getElementById("repo_textarea").value += message;
	    alert(message);
	    return;
	} else if (!filename.files[0]) {
	    if (optional_flag == false) {
		message = "Please select " + filename  + " file before clicking 'Send file to repository'\n";
		document.getElementById("repo_textarea").value += message;
		alert(message);
		return;
	    }
	} else {
	    file = filename.files[0];
	    fr = new FileReader();
	    fr.readAsText(file);
	}

	return fr;

    },

    notify_retigo_server: function(apiKey) {
	var newFilePrefix = baseTime + "_" + placeName + "_" + apiKey.slice(0,5);

	// required metadata
	//var firstName        = document.getElementById("firstName").value;
	//var lastName         = document.getElementById("lastName").value;
	var organization     = document.getElementById("Organization").value;
	var emailAddress     = document.getElementById("emailAddress").value;
	//var phoneNumber      = document.getElementById("phoneNumber").value;
	var reason           = document.getElementById("Reason").value;

	// optional metadata
	var firstName        = document.getElementById("firstName").value;
	var lastName         = document.getElementById("lastName").value;
	var phoneNumber      = document.getElementById("phoneNumber").value;
	var projectCode      = document.getElementById("projectCode").value;
	var keywords         = document.getElementById("keywords").value;


	var originalFilename = document.getElementById("uploadFile").value;
	// remove path from original filename
	if (originalFilename.indexOf('/') != -1) {
	    originalFilename = originalFilename.split('/').slice(-1);
	}
	if (originalFilename.indexOf('\\') != -1) {
	    originalFilename = originalFilename.split('\\').slice(-1);
	}

	// handle optional keywords
	if (projectCode == "") { projectCode = "NONE"; }
	if (keywords == "")    { keywords    = "NONE"; }
	if (firstName == "")   { firstName   = "NONE"; }
	if (lastName == "")    { lastName    = "NONE"; }
	if (phoneNumber == "") { phoneNumber = "NONE"; }

	var quality    = repo.get_selected_radio(document.getElementsByName("radioQuality")).split(".");
	var instrument = repo.get_selected_radio(document.getElementsByName("radioInstrument")).split(".");
	var dataTypes  = repo.get_selected_dataTypes(document.getElementsByName("dataType"));

	$.ajax({
		url: repo_rsigserver + "SERVICE=retigo&REQUEST=upload" + 
		    "&KEY="        + apiKey + 
		    "&FILE="       + newFilePrefix + 
		    "&PROJECT="    + projectCode + 
		    "&KEYWORDS="   + keywords +
		    "&FIRSTNAME="  + firstName +
		    "&LASTNAME="   + lastName +
		    "&ORG="        + organization +
		    "&EMAIL="      + emailAddress +
		    "&PHONE="      + phoneNumber +
		    "&REASON="     + reason +
		    "&QUALITY="    + quality[1] +
		    "&INSTRUMENT=" + instrument[1] +
		    "&DATATYPE="   + dataTypes +
		    "&ORIGFILE="   + originalFilename,
		    dataType: "text",
		    success: function(data, textStatus, jqXHR) {
		    repo.debug("File uploaded as: " + newFilePrefix + ".csv");
		    //repo.debug("Note: duplicate uploads (based on file checksum) will be purged from the repository.");
		    get_fileList();
		    setMenuTitle();
		},
		    error: function (jqXHR, textStatus, errorThrown) {
		    repo.debug("Upload not successful.");
		    repo.debug("status: " + textStatus);
		    repo.debug("error: " + errorThrown);
		} 
	    });

    },

    feedUploadAjax: function(apiKey, data_to_upload) {
	// upload data to an ESDR feed, using an AJAX call (no EDSR object needed)

	var esdrServer = "https://esdr.cmucreatelab.org/api/v1/feeds/";

	$.ajax({
		url: esdrServer + apiKey,
		    type: 'PUT',
		    contentType: 'application/json',
		    data: JSON.stringify(data_to_upload),
		    success: function(data, textStatus, jqXHR) {
		    repo.debug("ESDR upload succeeded");
		    repo.notify_retigo_server(apiKey);
		},
		    error: function (jqXHR, textStatus, errorThrown) {
		    repo.debug("Error in uploading data.");
		    repo.debug("status: " + textStatus);
		    repo.debug("error: " + errorThrown);
		} 
	    });


    },


    asc2hex: function(pStr) {
	tempstr = '';
	if (pStr) {
	    for (a = 0; a < pStr.length; a = a + 1) {
		tempstr = tempstr + pStr.charCodeAt(a).toString(16);
	    }
	}
	return tempstr;
    },


    upload_data_to_esdr: function(data_to_upload, channelSpec) {

  
	var arg_string = "SERVICE=retigo&REQUEST=feedcreate&FEEDCREATE=" + "'" + export_columnNames + "'";

	repo.codeLatLng( parseFloat(first_lat), parseFloat(first_lon) ); // sets placename

	$.ajax({
		url: repo_rsigserver + arg_string,
		    dataType: "text",
		    success: function(data, textStatus, jqXHR) {
		      var my_apiKey = data.substr(0,64);
		      repo.feedUploadAjax(my_apiKey, data_to_upload);
		},
		    error: function (jqXHR, textStatus, errorThrown) {
		      repo.debug("Error in sending data feed.");
		      repo.debug("status: " + textStatus);
		      repo.debug("error: " + errorThrown);
		} 
	    });

    },


    process_csv: function(repo_ofr) {

	var nCols;
	export_data_array         = new Array(); // main data array
	export_channelSpec_array1 = new Array(); // array for comments
	export_channelSpec_array2 = new Array(); // array for channel metadata
  
	export_comments    = new Array();
	export_columnNames = new Array();


	fname_data = 'test_data.json';
	fname_channelSpec = 'test_channelSpec.json';

	// detect the delimiter (either space or comma)
	var space_delimiter = new RegExp("\\s+");
	var comma_delimiter = ",";
	var my_delimiter;
	var comma_pos = repo_ofr.search(comma_delimiter);
	if (comma_pos == -1) {
	    my_delimiter = space_delimiter;
	    //repo.debug("Detected space delimited file.");
	} else {
	    my_delimiter = comma_delimiter;
	    //repo.debug("Detected comma delimited file.");
	    // we are comma delimited, so remove all whitespace
	    repo_ofr = repo_ofr.replace(/ /g, "");
	}	
        
	// see if there are carriage returns (Windows)
	carriage_regexp = new RegExp("\\r+");
	if (typeof repo_ofr == 'object') { 
	    cr_pos = repo_ofr.result.search(carriage_regexp);
	} else {
	    cr_pos = repo_ofr.search(carriage_regexp);
	}
	if (cr_pos != -1) {
	    newline = "\r\n";
	} else {
	    newline = "\n";
	}

	if (typeof data_string == 'object') {
	    fileLines=repo_ofr.result.split(newline);
	} else {
	    fileLines=repo_ofr.split(newline);
	}

	// write preliminary info
	export_data_array.push('{\n');
	export_data_array.push('"channel_names" : [');

	export_channelSpec_array1.push('{\n');
	export_channelSpec_array1.push('"comments" : [\n');
	export_channelSpec_array2.push('"channels" : {\n');


	var minLineLength = 5; // 5 entries minimum: (timestamp, lat, lon, id, data)

	// read data line by line
	for (ind=0; ind<fileLines.length; ind++) {
	    thisLine = fileLines[ind].split(my_delimiter);

	    // detect short line
	    if (thisLine.toString().trim().length == 0 ) { 
		// do nothing
      
		// detect comment
	    } else if (thisLine.toString().charAt(0) == '#') {
		export_channelSpec_array1.push('"' + thisLine + '"');
		export_channelSpec_array1.push(',\n');

		// detect header
	    } else if (thisLine.toString().indexOf("Timestamp") != -1) {
		nCols = thisLine.length;
                
		// figure out required columns
		for (thisCol=0; thisCol<nCols; thisCol++) {
		    if (thisLine[thisCol].toString().toUpperCase().indexOf("TIMESTAMP") != -1) {
			var TimestampColumn = thisCol; 
		    }
		    if (thisLine[thisCol].toString().toUpperCase().indexOf("ID(-)") != -1) {
			var IDColumn = thisCol; 
		    }
		    if (thisLine[thisCol].toString().toUpperCase().indexOf("EAST_LONGITUDE(DEG)") != -1) {
			var LonColumn = thisCol; 
		    }
		    if (thisLine[thisCol].toString().toUpperCase().indexOf("NORTH_LATITUDE(DEG)") != -1) {
			var LatColumn = thisCol; 
		    }
		}

		// generate output column indices (with timestamp first)
		var esdrCols = new Array(nCols);
		esdrCols[0] = TimestampColumn;
		esdrCols[1] = LonColumn;
		esdrCols[2] = LatColumn;
		esdrCols[3] = IDColumn;

		var esdrind = 4;
		for (thisCol=0; thisCol<nCols; thisCol++) {
		    if (thisCol != TimestampColumn &&
			thisCol != LonColumn       &&
			thisCol != LatColumn       &&
			thisCol != IDColumn) {
			esdrCols[esdrind] = thisCol;
			esdrind += 1;
		    }
		}

		// timestring needs to be first column in ESDR data
		export_data_array.push('"Timestring",');
		export_columnNames.push(asc2hex("Timestamp"));
		var counter = 1;
		for (thisCol=0; thisCol<nCols; thisCol++) {
		    var esdrCol = esdrCols[thisCol];
		    //console.log( esdrCol + " " + thisLine[esdrCol]);
		    if (esdrCol != TimestampColumn) {
			export_data_array.push('"Column' + counter + '"');
			export_channelSpec_array2.push('"Column' + counter + '": {');
			export_channelSpec_array2.push('"prettyName" : "' + thisLine[esdrCol] + '"}');
			export_columnNames.push(asc2hex(thisLine[esdrCol]));
			if (thisCol<nCols-1) { 
			    export_data_array.push(',');  
			    export_channelSpec_array2.push(',\n');
			}
			counter += 1;
		    }
		}

		export_data_array.push('],\n');
		export_data_array.push('"data" : [\n');
		export_channelSpec_array2.push('}\n');

		// process data
	    } else {
		export_data_array.push('[');
		for (thisCol=0; thisCol<nCols; thisCol++) {
		    //for (esdrCol=0; esdrCol<nCols; esdrCol++) {
		    var esdrCol = esdrCols[thisCol];
		    //if (thisLine[esdrCol].toString().toUpperCase().indexOf("TIMESTAMP") != -1) {
		    if (esdrCol == TimestampColumn) {
			dataExport = repo.convertISO8601_to_unix(thisLine[esdrCol]);
			export_data_array.push(dataExport + ',');         // export timestamp for ESDR
			dataExport = '"' + thisLine[esdrCol] + '"'; // also export timestamp string 
			//} else if (thisCol == 3) { // ID
		    } else if (esdrCol == IDColumn) { // ID
			dataExport = '"' + thisLine[esdrCol] + '"';
		    } else {
			dataExport = thisLine[esdrCol];
		    }
		    export_data_array.push(dataExport);
		    if (esdrCol<nCols-1) { export_data_array.push(','); }

		    // get first lat/lon for ESDR feed
		    if (esdr_flag == 0) {
			baseTime  = thisLine[TimestampColumn].split("T")[0];
			first_lon = thisLine[LonColumn];
			first_lat = thisLine[LatColumn];
			esdr_flag = 1;
		    }

		}
		if (ind<fileLines.length-1) {
		    export_data_array.push('],\n');
		} else {
		    export_data_array.push(']\n');
		}
	    }
      
	}
    
	// if last character of data array is a comma, get rid of it
	if (export_data_array.slice(-1) == '],\n') {
	    export_data_array.pop();
	    export_data_array.push(']\n');
	}

	export_data_array.push(']\n}');
	if (export_channelSpec_array1.slice(-1) == ",\n") {
	    export_channelSpec_array1.pop(); // pop will delete last comma
	}
	export_channelSpec_array1.push('],\n');
	export_channelSpec_array2.push('}\n');
	//console.log(export_channelSpec_array1);
	//console.log(export_channelSpec_array2);

	try {
	    var channelSpec = JSON.parse(export_channelSpec_array1.join('').concat(export_channelSpec_array2.join('')));
	} catch (err) {
	    repo.debug("Error parsing ESDR channelSpec array.");
	    repo.debug("Check the original RETIGO file.");
	    repo.debug(err.message);
	    throw err;
	}

	try {
	    //console.log(export_data_array.join(''));
	    //console.log(channelSpec);

	    repo.upload_data_to_esdr(JSON.parse(export_data_array.join('')), channelSpec);
	} catch (err) {
	    repo.debug("Error parsing ESDR data array.");
	    repo.debug("Check the original RETIGO file.");
	    repo.debug(err.message);
	    throw err;
	}

    },

    verifyFirstname: function() {
	var returnVal = false; // default
    
	testString = document.getElementById("firstName").value;
	if (testString.length > 0) {
	    returnVal = true;
	}

	return returnVal;
    },

    verifyLastname: function() {
	var returnVal = false; // default
    
	testString = document.getElementById("lastName").value;
	if (testString.length > 0) {
	    returnVal = true;
	}

	return returnVal;
    },

    verifyOrganization: function() {
	var returnVal = false; // default
    
	testString = document.getElementById("Organization").value;
	if (testString.length > 0) {
	    returnVal = true;
	}

	return returnVal;
    },

    verifyEmail: function() {
	var returnVal = false; // default
    
	testString = document.getElementById("emailAddress").value;
	if (testString.length > 0 && testString.indexOf("@") != -1) {
	    returnVal = true;
	}

	return returnVal;
    },

    verifyPhone: function() {
	var returnVal = false; // default
    
	testString = document.getElementById("phoneNumber").value;
	if (testString.length >= 10) {
	    returnVal = true;
	}

	return returnVal;
    },

    verifyReason: function() {
	var returnVal = false; // default
    
	testString = document.getElementById("Reason").value;
	if (testString.length >= 4) {
	    returnVal = true;
	}

	return returnVal;
    },


    get_selected_radio: function(radioObj) {
	// figure out which radiobutton is selected and return its index
	var return_value = "null";
	for (n=0; n<radioObj.length; n++){
	    if (radioObj[n].checked == true) {
		return_value = radioObj[n].id;
	    }
	}
	return return_value; 
    },

    get_selected_dataTypes: function(checkObjs) {
	// figure out which radiobutton is selected and return its index
	var return_value = "";
	for (n=0; n<checkObjs.length; n++){
	    if (checkObjs[n].checked == true) {
		return_value += checkObjs[n].id + ',';
	    }
	}
	// remove trailing comma if necessary
	return_value = return_value.slice(0,return_value.length-1);

	if (return_value == "") {
	    return_value = "Null";
	}		

	return return_value; 
    },


    upload: function() {
	var filename = document.getElementById("uploadFile").value;

	numFailed = 0;
	
	repo.clear_debug();
	//if (verifyFirstname() == false) {
	//  repo.debug("First name is required.");
	//  numFailed += 1;
	//}

	//if (verifyLastname() == false) {
	//  repo.debug("Last name is required.");
	//  numFailed += 1;
	//}

	if (repo.verifyOrganization() == false) {
	    repo.debug("Organization name is required. If no organization, please use 'self'.");
	    numFailed += 1;
	}

	if (repo.verifyEmail() == false) {
	    repo.debug("Email address is required.");
	    numFailed += 1;
	}

	//if (verifyPhone() == false) {
	//  repo.debug("Ten digit phone number is required.");
	//  numFailed += 1;
	//}

	if (repo.verifyReason() == false) {
	    repo.debug("Reason for uploading data is required.");
	    numFailed += 1;
	}

	if (numFailed == 0) {
	    if (filename == "") {
		repo.debug("No file was chosen.");
	    } else {
		repo.debug("Uploading file...");
		repo_ofr = repo.loadFile();

		esdr_flag = 0;
		setTimeout("repo.process_csv(repo_ofr.result);", 1500);
	    }
	} else {
	    repo.debug("-----------------------------------------");
	    repo.debug("");
	}
    },



    download: function() {
	var menu = document.getElementById("downloadFileMenu");
	var filename = menu.options[menu.selectedIndex].innerHTML;

	if (filename != "Choose File") {
	    $.ajax({
		    url: repo_rsigserver + "SERVICE=retigo&REQUEST=download&KEY=NULL&FILE=" + filename,
			dataType: "text",
			success: function(data, textStatus, jqXHR) {
			//alert(data);
			repo.debug(data);
		    },
			error: function (jqXHR, textStatus, errorThrown) {
			repo.debug("RETIGO file list not found");
			repo.debug("status: " + textStatus);
			repo.debug("error: " + errorThrown);
		    } 
		});

	}
    },

    acceptTerms: function() {
	document.getElementById('repositoryForm').style.display='block';
	document.getElementById('acceptCheckmark').style.display='inline';
	document.getElementById('acceptTermsButton').style.display='inline';
	window.location.hash='repositoryForm'; 	
    }

};
