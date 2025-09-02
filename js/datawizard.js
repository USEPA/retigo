
var color_LightBlue = "#EBF2F7";
var color_DarkBlue  = "#E4E9ED";
var selected_timezone;		  
var selected_format;		  
var orig_gmt_houroffset;        
var orig_gmt_houroffset_string; 
var output_gmt_houroffset;        
var output_gmt_houroffset_string; 

var processing_message = 'Some timestamps could not be processed. Check the formatting and try again.';

var lastTimeZoneDisambiguation = "";

// regex to only accept valid characters
// \s matches all white space including \r\n\t\f
// [ -~] matches all ASCCI chars from space to tilde (see https://catonmat.net/my-favorite-regex)
validChars = new RegExp('[ -~\s]');

// flags to identify problems with each line (flags are kind of like enums)
const wizFileLineFlag = { ok:           0,
                          comment:      1,
                          header:       2,
                          wrongNumCols: 3,
                          invalidLine:  4
                        }

wizMaxLinesToShow = 10; // default

const wizDefaults = {}; // namespace for dataWizard parameters
wizDefaults.fr              = null;
wizDefaults.fileName        = "";
wizDefaults.loaded          = false;
wizDefaults.isValidCSV      = false;
wizDefaults.nLines          = 0;
wizDefaults.fileLines       = null;
wizDefaults.dataArray       = [];
wizDefaults.lineFlag        = []; // array of wizFileLineFlags
wizDefaults.timeFormat      = "iso8601"; // default
wizDefaults.lineTerminator  = "";
wizDefaults.delimiter       = ",";
wizDefaults.nCols           = 0;
wizDefaults.colNames        = []; // parsed header, original column names
wizDefaults.colNamesFixed   = []; // column names after user choices
wizDefaults.rawHeader       = []; // unparsed header
wizDefaults.requiredColumns = [{name:"TIMESTAMP",           position:-1},
                               {name:"EAST_LONGITUDE",      position:-1},
                               {name:"NORTH_LATITUDE",      position:-1},
                               {name:"ID(-)",               position:-1}];
var dwiz1;

var wizLastColClicked = -1;
var timerUserClick;

var wizDataObj;

var wizColClickEnabled = false;

var hostname = window.location.hostname;		      
var imageserver;
var rsigserver;
if (hostname == 'maple.hesc.epa.gov') {
    rsigserver = 'https://maple.hesc.epa.gov/cgi-bin/rsigserver?';	
} else {	      
    rsigserver = 'https://ofmpub.epa.gov/rsig/rsigserver?';
}
imageserver = rsigserver + 'retigo/stable/'; 

var missingDataString = "-9999";

$(document).ready(function(){
    run_timechecks();
});


    
function initWiz() {
    return wizDefaults;
}

function wizStart() {
    
    dwiz1 = null;
    dwiz1 = JSON.parse(JSON.stringify(initWiz())); // clone
    wizResetTable();
    wizLoadFile(document.getElementById("wizard_datafile1"), dwiz1);
    document.getElementById("wizMessageDiv").style.display   = "inline-block";
    document.getElementById("wizDataTableDiv").style.display = "inline-block";

    // status bullets
    document.getElementById("wizHeaderLengthBullet").style.color = "#888888";
    document.getElementById("wizDataColumnsBullet").style.color  = "#888888";
    document.getElementById("wizTimestampBullet").style.color    = "#888888";
    document.getElementById("wizCorrectRowsBullet").style.color  = "#888888";
    document.getElementById("wizExportFile").style.color         = "#888888";
    document.getElementById("wizHeaderLengthCheck").src          = imageserver + "images/checkmark_blank.png";
    document.getElementById("wizColumnNamesCheck").src           = imageserver + "images/checkmark_blank.png";
    document.getElementById("wizTimestampFormatCheck").src       = imageserver + "images/checkmark_blank.png";
    document.getElementById("wizDataRowsCheck").src              = imageserver + "images/checkmark_blank.png";
    document.getElementById("wizExportFileCheck").src            = imageserver + "images/checkmark_blank.png";
    
    document.getElementById("btnCheckHeaderLength").removeAttribute('disabled');
    document.getElementById("btnCheckColumns").setAttribute('disabled', 'true');
    document.getElementById("btnCheckTimestamp").setAttribute('disabled', 'true');
    document.getElementById("btnCheckRows").setAttribute('disabled', 'true');
    document.getElementById("btnExportFile").setAttribute('disabled', 'true');


    
    let targetHeight = document.getElementById("wizStatusArea").clientHeight + "px";
    document.getElementById("wizMessageArea").style.height  = targetHeight;

    //document.getElementById("wizMessageDiv").setAttribute('tabindex', '-1');
    //document.getElementById("wizMessageDiv").focus();
    document.getElementById("wizMessageDiv").scrollIntoView();

    let msg = 'Follow the instructions found in this box to check and/or repair your data file. If the process is successful, you can export a file that can be viewed in RETIGO.<br>To get started click the "Check Header length"  button. This check will make sure your file contains at least five columns, which should include timestamp, latitude, longitude, id, and at least one data column.';
    postMessage("", 'clear');
    postMessage(msg, 'append');
}

function wizDataFileSelected() {
    // make the Importton visible
    document.getElementById("btnImport").style.visibility = "visible";
}

function wizLoadFile(input, loadObject) {
    var input, file, fr;
    var message;
    var optional_flag;
    
    loadObject.fr = 0;
    loadObject.fileName = input.files[0].name;
    
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
            message = "Please select " + input.name  + " file before clicking 'Import'\n";
            document.getElementById("error_textarea").value += message;
	    alert(message);
	    back();
        }
    } else {
	//console.log("reading");
        file = input.files[0];
        loadObject.fr = new FileReader();
        loadObject.fr.onload = function(e) {
	    //console.log(e);
	    //console.log(fr);
            loadObject.loaded = true;
            wizDataObj = loadObject;
            wizGetFileInfo(loadObject);
            //wizCheckHeader(loadObject);
            wizFindBadRows(loadObject);
            wizBuildTable(loadObject, wizMaxLinesToShow);
            enableColumnClicks(false);

            //wizIdentifyColumns(loadObject);
            //wizCheckLongitude(loadObject);
	}
        
        loadObject.fr.readAsText(file);
        
    }
    
    //return fr;
}

function wizGetFileInfo(frObj) {
    // determine basic facts about the supplied file

    // line terminator
    carriage_regexp = new RegExp("\\r+");
    cr_pos = frObj.fr.result.search(carriage_regexp);
    
    if (cr_pos != -1) {
        frObj.lineTerminator = "\r\n";
    } else {
        frObj.lineTerminator = "\n";
    }

    //  number of lines
    frObj.fileLines = (frObj.fr.result).split(frObj.lineTerminator);
    frObj.nLines    = frObj.fileLines.length;

    // get header (first non-comment line)
    //thisLine =  frObj.fileLines[0].split(frObj.delimiter);
    thisLine =  frObj.fileLines[0];
    var counter = 1;
    while (thisLine.toString().charAt(0) == '#') {
      	//thisLine =  frObj.fileLines[counter].split(frObj.delimiter);
      	thisLine =  frObj.fileLines[counter];
      	counter = counter + 1;
    }

    // store raw header
    frObj.rawHeader = thisLine;
    
    // store parsed header
    thisLineParse = thisLine.split(frObj.delimiter);
    for (n=0; n<thisLineParse.length; n++) {
        frObj.colNames.push(thisLineParse[n]);
        frObj.colNamesFixed.push(thisLineParse[n]); // defaults
    }

    // determine number of columns
    frObj.nCols = thisLineParse.length;

    document.getElementById("wizFileinfoName").innerHTML  = frObj.fileName;
    document.getElementById("wizFileinfoLines").innerHTML = frObj.nLines + " (showing first " + wizMaxLinesToShow + " lines)";

    // create regular data array (may be longer than true number of rows because of header and comments)
    let nRows = frObj.nLines - 1; // -1 because of header. 
    frObj.dataArray     = new Array(nRows);
    frObj.dataArrayFlag = new Array(nRows); // to be used later
    let rowCounter = 0;
    let headerFoundFlag = false;
    for (lineInd=0; lineInd<frObj.nLines; lineInd++) {
        thisLine =  frObj.fileLines[lineInd];
        //if (thisLine.toString().charAt(0) != '#' && thisLine.toString().charAt(0) != 'T') {
        if (thisLine.toString().charAt(0) != '#' && headerFoundFlag) {
            frObj.dataArray[rowCounter]     = new Array(frObj.nCols);
            frObj.dataArrayFlag[rowCounter] = true; // all data lines assumed good for now
            thisLineParse = thisLine.split(frObj.delimiter);
            for (colInd=0; colInd<frObj.nCols; colInd++) {
                if (colInd < thisLineParse.length) {
                    frObj.dataArray[rowCounter][colInd] = thisLineParse[colInd];
                }
            }
            rowCounter += 1;
        } else {
            if (thisLine.toString().charAt(0) != '#') {
                headerFoundFlag = true;
            }
        }
    }
}


// Actions to take when each check either passes or fails

function checkHeaderLengthAction(status) {

    if (status == "passed") {
        document.getElementById("wizHeaderLengthBullet").style.color = "#000000";
        document.getElementById("wizHeaderLengthCheck").src = imageserver + "images/green_checkmark_small.png";
        document.getElementById("btnCheckHeaderLength").setAttribute('disabled', 'true');
        document.getElementById("btnCheckColumns").removeAttribute('disabled');
        let msg = "<br>The header length test passed. Now click 'Check Column names' to analyze the header for required columns. This check will make sure the column headers use the required RETIGO naming convention.";
        postMessage("", 'clear'); 
        postMessage(msg, 'append'); 


    } else {
        document.getElementById("wizHeaderLengthCheck").src = imageserver + "images/red_x_small.png";
        postMessage("", 'clear');
        let msg = "<br>The header length is invalid. Required columns are:";
        msg += "<br>Timestamp(UTC),EAST_LONGITUDE(deg),NORTH_LATITUDE(deg),ID(-) and one or more columns of data.";
        msg += "Please correct your file and try again.";
        postMessage(msg, 'append'); 
    }
}

function checkColumnsAction(status, msg='') { // msg is optional
    if (status == "passed") {
        document.getElementById("wizColumnNamesCheck").src = imageserver + "images/green_checkmark_small.png";
        document.getElementById("btnCheckColumns").setAttribute('disabled', 'true');
        document.getElementById("btnCheckTimestamp").removeAttribute('disabled');
        let msg = "<br>All of the required columns were found. Next click 'Check Timestamp format' to determine if your timestamps are in the proper ISO8601 format.";
        postMessage("", 'clear'); 
        postMessage(msg, 'append');
        
    } else if (status == 'failed') {
        document.getElementById("wizColumnNamesCheck").src = imageserver + "images/red_x_small.png";
        document.getElementById("btnCheckColumns").removeAttribute('disabled');
        document.getElementById("btnCheckTimestamp").setAttribute('disabled', 'true');
    } else if (status == 'ask') {
        postMessage("", 'clear');
        postMessage(msg, 'append'); 
        openEmvlDialog("wiz-dialog-columnNames");
        //postMessage("", 'clear');
        //postMessage("Run the column names check again", 'append');
    }
}

function checkTimestampAction(status) {
    if (status == "passed") {
        document.getElementById("wizTimestampFormatCheck").src = imageserver + "images/green_checkmark_small.png";
        document.getElementById("btnCheckTimestamp").setAttribute('disabled', 'true');
        document.getElementById("btnCheckRows").removeAttribute('disabled');
        let msg = "<br>Ok.";
        if (wizDataObj.timeFormat != "iso8601") {
            msg += "<br>Your timestamps will automatically be converted from " + wizDataObj.timeFormat.toUpperCase() + " format in the next step.";
        }
        msg += "<br>Click 'Check Data rows' to analyze your file row by row to look for anomalies.";
        postMessage("", 'clear');
        postMessage(msg, 'append'); 
    } else {
        //console.log(myTimestamp, isValidTimestamp);
        postMessage("<br> Timestamp format is invalid.", 'append');
        document.getElementById("wizTimestampFormatCheck").src = imageserver + "images/red_x_small.png";

        openEmvlDialog("wiz-dialog-timeConvert");
        
    }
}

function checkDataRowsAction(status) {
    if (status == "passed") {
        document.getElementById("wizDataRowsCheck").src = imageserver + "images/green_checkmark_small.png";
        document.getElementById("btnCheckRows").setAttribute('disabled', 'true');
        document.getElementById("btnExportFile").removeAttribute('disabled');
        let msg = "<br>All of the data rows have been sucessfully checked. You can export your data in RETIGO format by clicking 'Export fixed file'.";
        postMessage("", 'clear');
        postMessage(msg, 'append'); 
    } else {

    }
}


function wizProcessCheckButton(myID) {

    // HEADER LENGTH
    if (myID == "btnCheckHeaderLength") {
        let status = wizCheckHeaderLength(wizDataObj);

        if (status == true) {
            checkHeaderLengthAction('passed');
        } else {
            checkHeaderLengthAction('failed');            
        }
    }

    // COLUMN NAMES
    else if (myID == "btnCheckColumns") {
        wizIdentifyColumns(wizDataObj);

        let problemFlag = false;
        let msg = "<br>These required column(s) were not initially found, but with your help will be renamed:&nbsp;&nbsp;";
        for (i=0; i<wizDataObj.requiredColumns.length; i++) {
            if ( (wizDataObj.requiredColumns[i].position < 0) || (wizDataObj.requiredColumns[i].position >= wizDataObj.colNames.length) ) {
                problemFlag = true;
                //postMessage("", 'clear');
                //enableColumnClicks(true);
                //let msg = "<br>" + wizDataObj.requiredColumns[i].name + " was not found in header.<br> Please click on the column that contains this field.";
                msg += wizDataObj.requiredColumns[i].name + ",&nbsp&nbsp";
                //postMessage(msg, 'append'); 
            } else {
                // set the column numbers to what was detected 
                if (wizDataObj.requiredColumns[i].name == "TIMESTAMP") {
                    document.getElementById("userColumnTimestamp").value = wizDataObj.requiredColumns[i].position;
                } else if (wizDataObj.requiredColumns[i].name == "EAST_LONGITUDE") {
                    document.getElementById("userColumnLongitude").value = wizDataObj.requiredColumns[i].position;
                } else if (wizDataObj.requiredColumns[i].name == "NORTH_LATITUDE") {
                    document.getElementById("userColumnLatitude").value = wizDataObj.requiredColumns[i].position;
                } else if (wizDataObj.requiredColumns[i].name == "ID(-)") {
                    document.getElementById("userColumnId").value = wizDataObj.requiredColumns[i].position;
                }
            }
        }

        // Remove trailing comma if there is one
        // The / at the beginning and end of the regular expression
        // The , matches the comma
        // The \s means whitespace characters (space, tab, etc) and the * means 0 or more
        // The $ at the end signifies the end of the string
        msg = msg.replace(/,\&nbsp\&nbsp\s*$/, "");

        
        if (problemFlag) {
            // There was a problem with the column name. Get user clarification
            checkColumnsAction('ask', msg=msg);
            
        } else {
            checkColumnsAction('passed');
        }

    // TIMESTAMP    
    } else if (myID == "btnCheckTimestamp") {
        wizCheckTimestampFormat(wizDataObj);


    // DATA ROWS    
    } else if (myID == "btnCheckRows") {
        wizCheckDataRows(wizDataObj);

    // EXPORT FILE    
    } else if (myID == "btnExportFile") {
        wizExportFile(wizDataObj);
        
    // BUTTON DOES NOT HAVE A HANDLER    
    } else {
        console.log("No handler for " + myID);
    }
}


function wizCheckDataRows(dWizObj) {

    let colTime = dWizObj.requiredColumns.find(x => x.name === 'TIMESTAMP').position;
    let colLat  = dWizObj.requiredColumns.find(x => x.name === 'NORTH_LATITUDE').position;
    let colLon  = dWizObj.requiredColumns.find(x => x.name === 'EAST_LONGITUDE').position;
    let colId   = dWizObj.requiredColumns.find(x => x.name === 'ID(-)').position;
    
    
    for (i=0; i<dWizObj.dataArray.length; i++) {
        if (dWizObj.dataArray[i] !== undefined && dWizObj.dataArray[i].length == dWizObj.nCols) {
            thisTimestampRaw = dWizObj.dataArray[i][colTime];
            thisLat          = Number(dWizObj.dataArray[i][colLat]);
            thisLon          = Number(dWizObj.dataArray[i][colLon]);
            thisId           = dWizObj.dataArray[i][colId];

            if (dWizObj.timeFormat != "iso8601") {
                thisTimestamp = wizConvertTimestamp(thisTimestampRaw, dWizObj.timeFormat);
            } else {
                thisTimestamp = thisTimestampRaw;
            }
            
            let isValidTimestamp = isIsoDate(thisTimestamp);
            let isValidLat       = isValidLatitude(thisLat);
            let isValidLon       = isValidLongitude(thisLon);
            let isValidId        = isValidString(thisId);


            if (isValidTimestamp && dWizObj.timeFormat != "iso8601") {
                dWizObj.dataArray[i][colTime] = thisTimestamp;
            }

            
            if (!isValidTimestamp) {
                //console.log("Timestamp invalid in row " + i + ": " + thisTimestamp);
                dWizObj.dataArrayFlag[i] = false;
            }
            if (!isValidLon) {
                //console.log("Longitude invalid in row " + i + ": "+ thisLon);
                //console.log(thisLon, !isNaN(thisLon), thisLon >= -180.0, thisLon <= 180.0);
                dWizObj.dataArrayFlag[i] = false;
            }
            if (!isValidLat) {
                //console.log("Latitude invalid in row " + i + ": " + thisLat);
                //console.log(thisLat, !isNaN(thisLat), thisLat >= -90.0, thisLat <= 90.0);
                dWizObj.dataArrayFlag[i] = false;
            }
            if (!isValidId) {
                console.log("ID invalid in row " + i + ": " + thisId);
                dWizObj.dataArrayFlag[i] = false;
            }
            
            
            for (col=0; col<dWizObj.nCols; col++) {
                if (col != colTime && col != colLat && col != colLon && col != colId) {
                    thisDataString = dWizObj.dataArray[i][col];
                    if (thisDataString !== "") {
                        thisData            =  Number(thisDataString); // Number("") returns 0. Weak!
                        let isValidDataFlag = isValidData(thisData);
                        if (!isValidDataFlag) {
                            //console.log("Data row/column " + i + "," + col + " contains invalid data: " + thisDataString);
                            dWizObj.dataArray[i][col] = missingDataString;
                        }
                    } else {
                        //console.log("yo Data row/column " + i + "," + col + " contains invalid data: " + thisDataString);
                        dWizObj.dataArray[i][col] = missingDataString;
                    }
                }  
            }   
        }   
    }

    if (dWizObj.dataArrayFlag.indexOf(true) >= 0) {
        checkDataRowsAction('passed');
        wizUpdateTableCells(dWizObj);
    } else {
        checkDataRowsAction('failed');
    }
}



function wizCheckTimestampFormat(dWizObj) {
    postMessage("", 'clear');
    let msg = "<br>Checking first timestamp: ";
    postMessage(msg, 'append'); 
    tPos = dWizObj.requiredColumns.find(x => x.name === 'TIMESTAMP').position;
    if (tPos >= 0) {
        myTimestamp = dWizObj.dataArray[0][tPos];
        postMessage(myTimestamp, 'append'); 
        let isValidTimestamp = isIsoDate(myTimestamp);

        if (isValidTimestamp) {
            checkTimestampAction('passed');
            wizUpdateTableCells(dWizObj);
        } else {
            checkTimestampAction('failed');           
        }
    }
}


    
function wizCheckHeaderLength(dwizObj) {

    // first look for a proper header
    if (dwizObj.colNames.length < 5) {
        alert("Only " + dwizObj.colNames.length + " columns were found. A RETIGO file must contain at least 5 columns (timestamp, latitude, longitude, id, and one or more data columns).");
        return false;
    } else {
        return true;
    }
    
}



function wizFindBadRows(dwizObj) {

    for (i=0; i<dwizObj.fileLines.length; i++) {
        thisLine      = dwizObj.fileLines[i];
        thisLineParse = thisLine.split(dwizObj.delimiter);
        
        // detect comment
        if (thisLine.charAt(0) == '#') {
            dwizObj.lineFlag[i] = wizFileLineFlag.comment;

        // detect header line
        } else if (thisLine === dwizObj.rawHeader) {
            dwizObj.lineFlag[i] = wizFileLineFlag.header;
            
        // detect wrong number of columns
        } else if (thisLineParse.length != dwizObj.nCols) {
            dwizObj.lineFlag[i] = wizFileLineFlag.wrongNumCols;
            
        // detect bogus characters
        } else if (! validChars.test(thisLine)) {
            dwizObj.lineFlag[i] = wizFileLineFlag.invalidLine;

        // we made it this far. Line must be ok
        } else {
            dwizObj.lineFlag[i] = wizFileLineFlag.ok;
        }
        
    }
}


function wizResetTable() {
    var parent = document.getElementById("wizDataTable");
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function wizBuildTable(dwizObj, numRowsToShow) {
    var my_table = document.createElement('table');
    my_table.id = "wizDataTable";

    var my_colNum = document.createElement('tr');
    my_colNum.setAttribute("id", "columnNumbers");
    
    var my_header = document.createElement('tr');
    my_header.setAttribute("id", "header");

    // column numbers and header
    for (i=0; i<dwizObj.nCols; i++) {
        let thisElement = document.createElement('th');
        thisElement.setAttribute("id", "Col" + i);
        my_colNum.appendChild( thisElement );
        my_colNum.cells[i].appendChild( document.createTextNode("Col " + i) );
        my_colNum.cells[i].addEventListener("click", (function(){ onColClicked(this); }));

        //header
        my_header.appendChild( document.createElement('td') );
        my_header.cells[i].appendChild( document.createTextNode(dwizObj.colNames[i]) );
        my_header.cells[i].setAttribute("id", "wizTableHeader" + i);
    }
    my_table.appendChild(my_colNum);
    my_table.appendChild(my_header);
    
    // first few rows of data
    var lineCount = 0;
    var rownum = 0;
    for (i=0; i<dwizObj.fileLines.length; i++) {
        //console.log(i, lineCount, wizMaxLinesToShow, dwizObj.lineFlag[i]); 
        if (lineCount < wizMaxLinesToShow) {
            thisLineParse = dwizObj.fileLines[i].split(dwizObj.delimiter);
            //if (dwizObj.lineFlag[i] == wizFileLineFlag.ok) {
            if (dwizObj.lineFlag[i] != wizFileLineFlag.header && dwizObj.lineFlag[i] != wizFileLineFlag.comment) {
                var my_row = document.createElement('tr');
                my_row.setAttribute("id", "wizTableRow_" + rownum);
                
                if (thisLineParse.length >= dwizObj.nCols) {
                    for (j=0; j<dwizObj.nCols; j++) {
                        my_row.appendChild( document.createElement('td') );
                        my_row.cells[j].appendChild( document.createTextNode(thisLineParse[j]) );
                        my_row.cells[j].setAttribute("id", "wizTableCell_" + rownum + "_" + j); // wizTableCell_row_cell
                    }
                    my_table.appendChild(my_row);
                }
                rownum    += 1;
                lineCount += 1;
            } 
        }
    }

    // ellipsis
    //var last_row = document.createElement('tr');
    //for (j=0; j<dwizObj.nCols; j++) {
    //    last_row.appendChild( document.createElement('td') );
    //    last_row.cells[j].appendChild( document.createTextNode("[...]") );
    //}
    //my_table.appendChild(last_row);

    
    document.getElementById("wizDataTable").appendChild(my_table);
    document.getElementById("wizCanvas").style.height = "100%";
}


function wizUpdateTableCells(dwizObj) {
    
    var lineCount = 0;
    var rownum = 0;
    for (rownum=0; rownum<wizMaxLinesToShow; rownum++) {
        for (j=0; j<dwizObj.nCols; j++) {
            document.getElementById("wizTableCell_" + rownum + "_" + j).innerHTML = dwizObj.dataArray[rownum][j];
        }
    }           
}


function createColumnId(dWizObj) {
    // Create a new column of IDs
    dWizObj.nCols += 1;
    dWizObj.colNames.push("ID(-)");
    dWizObj.colNamesFixed.push("ID(-)");
    dWizObj.requiredColumns.find(x => x.name === 'ID(-)').position =  dWizObj.nCols - 1;

    for (i=0; i<dWizObj.dataArray.length; i++) {
        dWizObj.dataArray[i].push("myData");
    }
    
}


function tableAddColumn(dwizObj, columnName) {
    var lineCount = 0;
    var rownum = 0;

    colToAdd = dwizObj.colNamesFixed.indexOf(columnName);
    
    if (colToAdd >= 0) {

        // column name
        myElement = document.getElementById("columnNumbers");
        var th = document.createElement('th');
        th.setAttribute("id", "Col" + colToAdd);
        th.innerHTML = "Col" + colToAdd;
        myElement.append(th);


        // header entry
        myElement = document.getElementById("header");
        var td2 = document.createElement('td');
        td2.setAttribute("id", "wizTableHeader" + colToAdd);
        td2.innerHTML = columnName;
        myElement.append(td2);
        
        
        // table rows
        for (rownum=0; rownum<wizMaxLinesToShow; rownum++) {
            myrow = document.getElementById("wizTableRow_" + rownum);
            var td = document.createElement('td');
            td.setAttribute("id", "wizTableCell_" + rownum + "_" + colToAdd);
            myrow.append(td);
        }
    }
}

function enableColumnClicks(flag) {

    wizColClickEnabled = flag;
    
}


function wizIdentifyColumns(dwizObj) {

    for (colInd=0; colInd<dwizObj.nCols; colInd++) {
        thisColName = dwizObj.colNames[colInd].toUpperCase();        //console.log(thisColName);

        // check for empty column name
        if (thisColName === "") {
            console.log("found empty column name");
            dwizObj.colNamesFixed[colInd] = "unknown";
            document.getElementById("wizTableHeader" + colInd.toString()).innerHTML = "unknown";
        }
        

        
        for (requiredColInd=0; requiredColInd<dwizObj.requiredColumns.length; requiredColInd++) {
            myRequiredColName = dwizObj.requiredColumns[requiredColInd].name;
            //console.log("  " + myRequiredColName);
            if (thisColName.indexOf(myRequiredColName) == 0) {
                //console.log("  match");
                dwizObj.requiredColumns[requiredColInd].position = colInd;
            }
        }
    }

}

function onColClicked(evt) {

    if (wizColClickEnabled) {
        wizLastColClicked = evt.cellIndex;
        
        thisContent   = evt.textContent;
        thisCellIndex = evt.cellIndex;

        document.getElementById("wiz-dialog-no").checked = true;
        
        wizPrompt("You chose column " + thisCellIndex + ". Is this correct (y/n)?");
        //console.log("choice = ", mychoice);
        //                     
        //if (mychoice == 'y') {
        //    enableColumnClicks(false);
        //} else {
        //    // do nothing
        //}
    }
}



function wizExportFile(dWizObj) {

    //fname = document.getElementById("user_datafile1").value.replace(/^.*\\/, "").split('.');
    fname = dWizObj.fileName.replace(/^.*\\/, "").split('.');
    fname = fname[0] + "_FIXED.csv";

    postMessage("", 'clear');
    postMessage("<br>Exporting " + fname + ".<br>Check your Downloads folder.", 'append');

    exportArray = [];


    let colTimestamp = -1;
    let colLatitude  = -1;
    let colLongitude = -1;
    let colId        = -1;
    let colWindMag   = -1;
    let colWindDir   = -1;

    colOtherData = [];
    for (col=0; col<dWizObj.colNamesFixed.length; col++) {
        if (dWizObj.colNamesFixed[col].toUpperCase().indexOf("TIMESTAMP")      >= 0) { colTimestamp = col;     } else
        if (dWizObj.colNamesFixed[col].toUpperCase().indexOf("LATITUDE")       >= 0) { colLatitude  = col;     } else
        if (dWizObj.colNamesFixed[col].toUpperCase().indexOf("LONGITUDE")      >= 0) { colLongitude = col;     } else
        if (dWizObj.colNamesFixed[col].toUpperCase().indexOf("ID")             >= 0) { colId        = col;     } else
        if (dWizObj.colNamesFixed[col].toUpperCase().indexOf("WIND_MAGNITUDE") >= 0) { colWindMag   = col;     } else
        if (dWizObj.colNamesFixed[col].toUpperCase().indexOf("WIND_DIRECTION") >= 0) { colWindDir   = col;     } else
                                                                                     { colOtherData.push(col); }
    }
    //console.log(colTimestamp, colLatitude, colLongitude, colId, colWindMag, colWindDir);
    //console.log(colOtherData);

    if (colTimestamp < 0  ||
        colLatitude  < 0  ||
        colLongitude < 0  ||
        colId        < 0) {
        console.log("There was a problem with the column names. Export aborted");
        return;
    }
        
    // write columns in specific order: required, other, wind
    let colOrder = [colTimestamp, colLongitude, colLatitude, colId]; // to start with
    let headerString = dWizObj.colNamesFixed[colTimestamp] + ',' +
            dWizObj.colNamesFixed[colLongitude]            + ',' +
            dWizObj.colNamesFixed[colLatitude]             + ',' +
            dWizObj.colNamesFixed[colId]                   + ',';

    for (col=0; col<dWizObj.colNamesFixed.length; col++) {
        if ( (col != colTimestamp) &&
             (col != colLongitude) &&
             (col != colLatitude)  &&
             (col != colId)        &&
             (col != colWindMag)   &&
             (col != colWindDir) ) {
            headerString += dWizObj.colNamesFixed[col] + ',';
            colOrder.push(col);
        }
    }
    if (colWindMag > 0) {
        headerString += dWizObj.colNamesFixed[colWindMag] + ',';
        colOrder.push(colWindMag);
    }
    if (colWindDir > 0) {
        headerString += dWizObj.colNamesFixed[colWindDir] + ',';
        colOrder.push(colWindDir);
    }
    headerString = headerString.replace(/.$/, '\n'); // replace trailing comma with newline
    exportArray.push(headerString);

    //console.log(colOrder);
    //console.log(headerString);
    
    for (i=0; i<dWizObj.dataArray.length; i++) {
        if (dWizObj.dataArrayFlag[i] == true && dWizObj.dataArray[i] !== undefined && dWizObj.dataArray[i].length == dWizObj.nCols) {
            let lineString = "";
            //for (col=0; col<dWizObj.colNamesFixed.length; col++) {
            for (ind=0; ind<colOrder.length; ind++) {
                col = colOrder[ind];
                lineString +=  dWizObj.dataArray[i][col] += ",";
            }
            lineString = lineString.replace(/.$/, '\n'); // replace trailing comma with newline
            exportArray.push(lineString);
        }
    }
    
    try {
	var blob = new Blob(exportArray,{type: "text/plain;charset=utf-8"});
	saveAs(blob, fname);
        
    } catch (e) {
	print("File export is not supported by this browser.");
    }
    
}


function wizPrompt(msg) {

    document.getElementById("wizDialogQuestion").innerHTML = msg;
    openEmvlDialog("wiz-dialog");
    
}

function timeConvertSelectorChanged() {
    let timeformat = document.getElementById("wiz-dialog-timeConvert-options").value;

    if (timeformat == 'unix' || timeformat == 'igor') {
        //document.getElementById("wiz-dialog-timeConvert-timezone").disabled = true;
        document.getElementById("wiz-dialog-timeConvert-timezone").style.visibility = "hidden";
        document.getElementById("wiz-dialog-timeConvert-timezone-label").innerHTML = "Timezone: N/A";
    } else {
        //document.getElementById("wiz-dialog-timeConvert-timezone").disabled = false;
        document.getElementById("wiz-dialog-timeConvert-timezone").style.visibility = "visible";
        document.getElementById("wiz-dialog-timeConvert-timezone-label").innerHTML = "Timezone:";
    }


    if (timeformat == 'hhmmss') {
        //document.getElementById("wiz-dialog-timeConvert-startdate").disabled = false;
        document.getElementById("wiz-dialog-timeConvert-startdate").style.visibility = "visible";
        document.getElementById("wiz-dialog-timeConvert-startdate-label").innerHTML = "Starting date:";
    } else {
        //document.getElementById("wiz-dialog-timeConvert-startdate").disabled = true;
        document.getElementById("wiz-dialog-timeConvert-startdate").style.visibility = "hidden";
        document.getElementById("wiz-dialog-timeConvert-startdate-label").innerHTML = "Starting date: N/A";
    }

    
}

function wizFinalizeTimeConvert(status) {
    if (status == 'cancel') {
        //console.log("wizFinalizeTimeConvert cancel");
        DestroyCalendar();

    } else {
        //console.log("wizFinalizeTimeConvert ok");
        wizDataObj.timeFormat = document.getElementById("wiz-dialog-timeConvert-options").value;
        if (wizDataObj.timeFormat != "none") {
            //postMessage("<br>Proceeding with time format: " + wizDataObj.timeFormat, 'append');
            //document.getElementById("wizTimestampFormatCheck").src = imageserver + "images/green_checkmark_small.png";
            //document.getElementById("btnCheckTimestamp").setAttribute('disabled', 'true');
            //document.getElementById("btnCheckRows").removeAttribute('disabled');
            checkTimestampAction('passed');
        } else {
            postMessage("<br>Unknown time format cannot be processed. Please see this list of <a href='https://ofmpub.epa.gov/rsig/rsigserver?retigo/stable/supported_timestamps.html' target='_blank'>supported time formats</a>.", 'append');
        }
    }
}

function wizFinalizeColumnSelections(status) {


    if (status == 'cancel') {
        //console.log("here2 cancel");
        document.getElementById("wizColumnNamesCheck").src = imageserver + "images/red_x_small.png";
        document.getElementById("btnCheckColumns").removeAttribute('disabled');
        document.getElementById("btnCheckTimestamp").setAttribute('disabled', 'true');
    } else {
        //console.log("here2 ok");

        //let yesClicked = document.getElementById("wiz-dialog-yes").checked;
        //console.log(wizLastColClicked, yesCLicked);
        let userColumnTimestamp = document.getElementById("userColumnTimestamp").value;
        let userColumnLatitude  = document.getElementById("userColumnLatitude").value;
        let userColumnLongitude = document.getElementById("userColumnLongitude").value;
        let userColumnId        = document.getElementById("userColumnId").value;
        
        let colValues = [userColumnTimestamp, userColumnLatitude, userColumnLongitude, userColumnId];
        //console.log(colValues, colValues.length, unique(colValues).length, colValues.indexOf(""));
        
        if ( (colValues.length != unique(colValues).length) || (colValues.indexOf("") != -1) ) {
            postMessage("<br>Your column specifications are invalid because two or more column numbers are the same. Please try again.", 'append');
            checkColumnsAction('failed');

            
        } else {

            allGood = true; // default
            if (userColumnTimestamp != "" && userColumnTimestamp < wizDataObj.nCols) {
                if (userColumnTimestamp >= 0) {
                    wizDataObj.colNamesFixed[userColumnTimestamp] = "Timestamp(UTC)";
                    wizDataObj.requiredColumns.find(x => x.name === 'TIMESTAMP').position = userColumnTimestamp;
                    document.getElementById("wizTableHeader" + userColumnTimestamp).innerHTML = wizDataObj.colNamesFixed[userColumnTimestamp];
                } else {
                    allGood = false;
                    wizDataObj.requiredColumns.find(x => x.name === 'TIMESTAMP').position = userColumnTimestamp;
                    postMessage("<br>Your data file must have a TIMESTAMP column to proceed.", 'append');
                }
                
            }
            if (userColumnLatitude != "" && userColumnLatitude < wizDataObj.nCols) {
                if (userColumnLatitude >= 0) {
                    wizDataObj.colNamesFixed[userColumnLatitude] = "NORTH_LATITUDE(deg)";
                    wizDataObj.requiredColumns.find(x => x.name === 'NORTH_LATITUDE').position = userColumnLatitude;
                    document.getElementById("wizTableHeader" + userColumnLatitude).innerHTML = wizDataObj.colNamesFixed[userColumnLatitude];
                } else {
                    allGood = false;
                    wizDataObj.requiredColumns.find(x => x.name === 'NORTH_LATITUDE').position = userColumnLatitude;
                    postMessage("<br>Your data file must have a LATITUDE column to proceed.", 'append');
                }
            }
            if (userColumnLongitude != "" && userColumnLongitude < wizDataObj.nCols) {
                if (userColumnLongitude >= 0) {
                    wizDataObj.colNamesFixed[userColumnLongitude] = "EAST_LONGITUDE(deg)";
                    wizDataObj.requiredColumns.find(x => x.name === 'EAST_LONGITUDE').position = userColumnLongitude;
                    document.getElementById("wizTableHeader" + userColumnLongitude).innerHTML = wizDataObj.colNamesFixed[userColumnLongitude];
                } else {
                    allGood = false;
                    wizDataObj.requiredColumns.find(x => x.name === 'EAST_LONGITUDE').position = userColumnLongitude;
                    postMessage("<br>Your data file must have a LONGITUDE column to proceed.", 'append');
                }
            }
            if (userColumnId != "" && userColumnId < wizDataObj.nCols) {
                if (userColumnId >= 0) {
                    wizDataObj.colNamesFixed[userColumnId] = "ID(-)";
                    wizDataObj.requiredColumns.find(x => x.name === 'ID(-)').position = userColumnId;
                    document.getElementById("wizTableHeader" + userColumnId).innerHTML = wizDataObj.colNamesFixed[userColumnId];
                } else {
                    allGood = false;
                    wizDataObj.requiredColumns.find(x => x.name === 'ID(-)').position = userColumnId;
                    postMessage("<br>Creating an ID column. Check the column names again to be sure the columns are correct.", 'append');
                    createColumnId(wizDataObj);
                    tableAddColumn(wizDataObj, 'ID(-)');
                    wizUpdateTableCells(wizDataObj);
                }
            }

            if (allGood) {
                checkColumnsAction('passed');
            } else {
                checkColumnsAction('failed')
            }
        }

    }
    //console.log(userColumnTimestamp, userColumnLatitude, userColumnLongitude, userColumnId);
}


function wizCheckLongitude(dwizObj) {
    wizLastColClicked = -1;
    for (requiredColInd=0; requiredColInd<dwizObj.requiredColumns.length; requiredColInd++) {
        myRequiredColName  = dwizObj.requiredColumns[requiredColInd].name;
        myRequiredPosition = dwizObj.requiredColumns[requiredColInd].position;
        if (myRequiredColName == "EAST_LONGITUDE(DEG)" && myRequiredPosition == -1) {
            //alert("Click on the column that contains longitudes");
            console.log("I'm not sure which column contains longitudes. Please click on the correct column number");

            timerUserClick = setInterval("wizGetClickedCol();", 100);

        }
    }
}

function wizGetClickedCol() {
    if (wizLastColClicked != -1) {
        console.log("I got column", wizLastColClicked, dwiz1.colNames[wizLastColClicked]);
        clearInterval(timerUserClick);
    }
}


function wizRedrawTable() {
    var myTable = document.getElementById("aha");
    
}


function wizSetTableMaxLines() {
    wizMaxLinesToShow = document.getElementById("wizTableMaxLines").value;
    wizRedrawTable();
}


function postMessage(msg, action) {

    if (action == 'append') {
        document.getElementById("wizMessageArea").innerHTML += msg;
    } else if (action == 'clear') {
        document.getElementById("wizMessageArea").innerHTML = "";
    }
}
    

function initialize() {
    //clear_input();
    clear_output();
    clear_debug();
    getTimestampFormat();
    getTimezone('orig_timezoneList');
    getTimezone('output_timezoneList');
    document.getElementById('controls').style.backgroundColor = color_DarkBlue;
}

function clear_input() {
    $("#input_timestamps").val('');
}

function clear_output() {
    $("#converted_timestamps").val('');
}

function clear_debug() {
    $("#error_textarea").val('');
}


function isValidLatitude(value) {
    
    if ( !isNaN(value) && value >= -90.0 && value <= 90.0) {
        return true;
    } else {
        return false;
    }
}

function isValidLongitude(value) {
    
    if ( !isNaN(value) && value >= -180.0 && value <= 180.0) {
        return true;
    } else {
        return false;
    }
}

function isValidData(value) {
    
    if ( !isNaN(value) ) {
        return true;
    } else {
        return false;
    }
}

function isValidString(s) {
    
    if ( (typeof s === 'string' || s instanceof String) && s.length>0 ) {
        return true;
    } else {
        return false;
    }
}

    
function isIsoDate(str) {
    // https://stackoverflow.com/questions/52869695/check-if-a-date-string-is-in-iso-and-utc-format
    //if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
    const d = new Date(str); 
    if ( d instanceof Date && !isNaN(d.getTime()) ) {
        d2 = create_dateObjectUTC(str);
        if (d.getTime() === d2.getTime()) {
            return true;
        }
    }
    return false;
}



function check_date(MM, DD, YYYY) {
    var return_val = false; // default
    
    // first check that arguments are numbers
    if (isNumber(MM) && isNumber(DD) && isNumber(YYYY)) {
        // now check ranges (note: month is zero based)
        if ((MM >= 0) && (MM <= 11)        &&
            (DD >= 1) && (DD <= 31)        &&
            (YYYY >= 0) && (YYYY <=2100) ) {
            return_val = true;
        }
    }
    return return_val;
}


function wizConvertTimestamp(timestampRaw, formatString) {
    
    //let timezone_name       = ["GMT", "EST", "CST", "MST", "PST", "EDT", "CDT", "MDT", "PDT"]; 
    //let timezone_houroffset = [   0,    -5,    -6,    -7,    -8,    -4,    -5,    -6,    -7];

    // added atlantic, which includes puerto rico (AST/ADT), alaskan (AKST/AKDT), and hawaii/allutian (HST/HDT) 
    let timezone_name       = ["GMT", "AST", "EST", "CST", "MST", "PST", "AKST", "HST", "ADT", "EDT", "CDT", "MDT", "PDT", "AKDT", "HDT"]; 
    let timezone_houroffset = [   0,    -4,    -5,    -6,    -7,    -8,     -9,   -10,    -3,    -4,    -5,    -6,    -7,     -8,    -9];
    
    let my_timezone = document.getElementById("wiz-dialog-timeConvert-timezone").value.toUpperCase();

    let matching_index = where(timezone_name, my_timezone);
    let gmt_hour_offset = timezone_houroffset[matching_index];
    
    
    let startDate = document.getElementById("wiz-dialog-timeConvert-startdate").value;

    if (startDate != "") {
        startDateParse = startDate.split("/");
        myMM   = startDateParse[0]; 
        myDD   = startDateParse[1];
        myYYYY = startDateParse[2];
    } else {
        if (run_timechecks instanceof Function) {
            // startdate is coming from timeChecks array in datawizard_tester.js
            startDateParse = timeChecks.find(x => x.name === formatString).expectedValue.split('-');
            myYYYY = startDateParse[0];
            myMM   = startDateParse[1];            
            myDD = (startDateParse[2].split('T'))[0];
        }
    }
    
    if (formatString == "unix") {
        converted_timestamp = convert_unix(timestampRaw);        

    } else if (formatString == "igor") {
        converted_timestamp = convert_IGOR(timestampRaw);

    } else if (formatString == "excelSerial-1900") {
        converted_timestamp = convert_Excel_1900(timestampRaw, gmt_hour_offset);

    } else if (formatString == "excelSerial-1904") {
        converted_timestamp = convert_Excel_1904(timestampRaw, gmt_hour_offset);

    } else if (formatString == "matlab") {
        converted_timestamp = convert_Matlab(timestampRaw, gmt_hour_offset);

    } else if (formatString == "hhmmss") {
        converted_timestamp = convert_hhmmss(timestampRaw, gmt_hour_offset, myMM, myDD, myYYYY);

    } else if (formatString == "string1a") {
        let reverseFlag       = false;
        let delimiterDate     = "/";
        let delimiterDateTime = "-";
        converted_timestamp = convert_datetime(timestampRaw, gmt_hour_offset, reverseFlag, delimiterDate, delimiterDateTime);

    } else if (formatString == "string1b") {
        let reverseFlag       = false;
        let delimiterDate     = "/";
        let delimiterDateTime = " ";
        converted_timestamp = convert_datetime(timestampRaw, gmt_hour_offset, reverseFlag, delimiterDate, delimiterDateTime);
        
    } else if (formatString == "string1c") {
        let reverseFlag       = false;
        let delimiterDate     = "-";
        let delimiterDateTime = " ";
        converted_timestamp = convert_datetime(timestampRaw, gmt_hour_offset, reverseFlag, delimiterDate, delimiterDateTime);
             
    } else if (formatString == "string2a") {
        let reverseFlag       = true;
        let delimiterDate     = "/";
        let delimiterDateTime = "-";
        converted_timestamp = convert_datetime(timestampRaw, gmt_hour_offset, reverseFlag, delimiterDate, delimiterDateTime);

    } else if (formatString == "string2b") {
        let reverseFlag       = true;
        let delimiterDate     = "/";
        let delimiterDateTime = " ";
        converted_timestamp = convert_datetime(timestampRaw, gmt_hour_offset, reverseFlag, delimiterDate, delimiterDateTime);

    } else if (formatString == "string2c") {
        let reverseFlag       = true;
        let delimiterDate     = "-";
        let delimiterDateTime = " ";
        converted_timestamp = convert_datetime(timestampRaw, gmt_hour_offset, reverseFlag, delimiterDate, delimiterDateTime);
            
    } else if (formatString == "string3") {        
        converted_timestamp = convert_Almost8601(timestampRaw);

    } else {
        // should never get here
        console.log("format " + formatString + " not handled.");
        converted_timestamp = "";
    }

    return converted_timestamp;
}



function check_time(hh, mm, ss, ms) {
    var return_val = false; // default
    
    //debug(hh + ', ' + mm + ', ' + ss + ', ' + ms);
    
    // first check that arguments are numbers
    if (isNumber(hh) && isNumber(mm) && isNumber(ss) && isNumber(ms)) {
        // now check ranges
        if ((hh >= 0) && (hh <= 23) &&
            (mm >= 0) && (mm <= 59) &&
            (ss >= 0) && (ss <= 59) &&
            (ms >= 0) && (ms <= 999)) {
            return_val = true;
        }
    }
    return return_val;
}

function generate_timestamp(thisDate){
    // take a Date object and generate a UTC/ISO 8601 timestamp
    var year         = thisDate.getUTCFullYear();
    var month        = thisDate.getUTCMonth() + 1;  // correct for zero-based month
    var day          = thisDate.getUTCDate();       // day of month
    var hour         = thisDate.getUTCHours();
    var minutes      = thisDate.getUTCMinutes();
    var seconds      = thisDate.getUTCSeconds();
    var milliseconds = thisDate.getUTCMilliseconds();
    
    // we want to represent seconds to two decimal places, so we will drop the ones place
    milliseconds = Math.floor(milliseconds/10.0); // use floor so that 999 becomes 99 instead of 100
    
    var YYYY = zeroPad(year, 4);
    var MM   = zeroPad(month, 2);
    var DD   = zeroPad(day, 2);
    var hh   = zeroPad(hour, 2);
    var mm   = zeroPad(minutes, 2);
    var ss   = zeroPad(seconds, 2);
    var ms   = zeroPad(milliseconds, 2);
    
    var this_utc8601_timestamp = YYYY + '-' + MM + '-' + DD + 'T' + hh + ':' + mm + ':' + ss + '.' + ms + "+00:00";
    return this_utc8601_timestamp; 
}

function convert_unix(stringInput) {
    var thisDate = new Date();
    var this_milliseconds;
    var this_converted_timestamp;		      
    
    try {    
        this_milliseconds = parseFloat(stringInput) * 1000.;
        //console.log(this_milliseconds);
        thisDate.setTime(this_milliseconds); // set time in milliseconds since 01/01/1970
        //console.log(thisDate);
        this_converted_timestamp = generate_timestamp(thisDate);
        //console.log(this_converted_timestamp);
        return this_converted_timestamp;
    } catch (e) {
        console.log("error converting timestamp:", e);
        return "";
    }
}

function convert_IGOR(stringInput) {
    var thisDate = new Date();
    var this_milliseconds;
    var this_converted_timestamp;		  
    var IGOR_offset;

    // subtract time so that we have "seconds since 01/01/1970" 
    IGOR_offset_seconds = (1970 - 1904) * 365 * 24 * 3600.;
    IGOR_offset_seconds = IGOR_offset_seconds + (17 * 24 * 3600.) // there were 17 leap days between 1904 and 1970, inclusive

    try {
        this_milliseconds = (parseFloat(stringInput) - IGOR_offset_seconds) * 1000.;
        thisDate.setTime(this_milliseconds); // set time in milliseconds since 01/01/1970
            
        this_converted_timestamp = generate_timestamp(thisDate);
        return this_converted_timestamp;

    } catch (e) {
        console.log("error converting timestamp:", e);
        return "";
    }
}


function convert_Excel_1900(stringInput, gmt_hour_offset) {
    var thisDate = new Date();
    var this_milliseconds;
    var integer_part;
    var decimal_part;
    
    var correction_1900; // used to account for the fact that days from 1/1/1900 to 2/29/1900 are off by 1.
    var seconds_per_day = 86400;
    
    // subtract time so that we have "seconds since 01/01/1970" 
    var Excel_offset_seconds = (1970 - 1900) * 365 * seconds_per_day;
    Excel_offset_seconds = Excel_offset_seconds + (17 * seconds_per_day) // There were 17 leap days between 1900 and 1970, inclusive
    Excel_offset_seconds = Excel_offset_seconds + ( 1 * seconds_per_day) // Excel thinks 1900 was a leap year even though it wasn't
    Excel_offset_seconds = Excel_offset_seconds + ( 1 * seconds_per_day) // Correct for the fact that the Excel epoch is January 0, 1900
    // NOTE: Excel thinks 1900 was a leap year even though it wasn't! See: http://support.microsoft.com/kb/214326
    //       01/00/1900 = 0
    //       01/01/1900 = 1

    try {
        integer_part = Math.floor(Number(stringInput));         // days (1 = Jan 1, 1900)
        decimal_part = parseFloat(stringInput) - integer_part;  // fraction of a day
        
        if (integer_part <= 60) {
            correction_1900 = 1;
        } else {
            correction_1900 = 0;
        }
        
        this_milliseconds =   integer_part          * (seconds_per_day * 1000)
                            + decimal_part          * (seconds_per_day * 1000)
                            + correction_1900       * (seconds_per_day * 1000)
                            - (Excel_offset_seconds *                    1000)
                            - (gmt_hour_offset * 3600 * 1000.);
        
        thisDate.setTime(this_milliseconds); // set time in milliseconds since 01/01/1970
        this_converted_timestamp = generate_timestamp(thisDate);
        return this_converted_timestamp;
    } catch (e) {
        console.log("error converting timestamp:", e);
        return "";
    }
}


function convert_Excel_1904(stringInput, gmt_hour_offset) {
    var thisDate = new Date();
    var this_milliseconds;
    var integer_part;
    var decimal_part;
    
    var seconds_per_day = 86400;
    
    // subtract time so that we have "seconds since 01/01/1970" 
    var Excel_offset_seconds = (1970 - 1904) * 365 * seconds_per_day;
    Excel_offset_seconds = Excel_offset_seconds + (17 * seconds_per_day) // There were 17 leap days between 1904 and 1970, inclusive
    Excel_offset_seconds = Excel_offset_seconds + ( 1 * seconds_per_day) // Correct for the fact that the Excel epoch is January 0, 1900

    
    try {
        integer_part = Math.floor(Number(stringInput));         // days (1 = Jan 1, 1904)
        decimal_part = parseFloat(stringInput) - integer_part;  // fraction of a day

        this_milliseconds =   integer_part          * (seconds_per_day * 1000)
            + decimal_part          * (seconds_per_day * 1000)
            - (Excel_offset_seconds *                    1000)
            - (gmt_hour_offset * 3600 * 1000.);
            
        thisDate.setTime(this_milliseconds); // set time in milliseconds since 01/01/1970
        this_converted_timestamp = generate_timestamp(thisDate);
        return this_converted_timestamp;
    } catch (e) {
        console.log("error converting timestamp:", e);
        return "";
    }    
}


function convert_Matlab(stringInput, gmt_hour_offset) {
    var thisDate = new Date();
    var this_milliseconds;
     
    var seconds_per_day = 86400;
    
    // subtract time so that we have "seconds since 00/00/0000" 
    var Matlab_offset_seconds = (1970 - 0000) * 365 * seconds_per_day;
    Matlab_offset_seconds = Matlab_offset_seconds + (478 * seconds_per_day) // there were 478 leap days between 0000 and 1970, inclusive
    Matlab_offset_seconds = Matlab_offset_seconds + (  1 * seconds_per_day) // Matlab's epoch is 00/00/0000, which is one day less than what really exists


    try {
        this_milliseconds =   (parseFloat(stringInput)) * (seconds_per_day * 1000)
            - (Matlab_offset_seconds * 1000)
            - (gmt_hour_offset * 3600 * 1000.);

        
        thisDate.setTime(this_milliseconds); // set time in milliseconds since 01/01/1970
        this_converted_timestamp = generate_timestamp(thisDate);
        return this_converted_timestamp;
    } catch (e) {
        console.log("error converting timestamp:", e);
        return "";
    }
}


function convert_hhmmss(stringInput, gmt_hour_offset, mm, dd, yyyy) {


    //console.log(stringInput, gmt_hour_offset, mm, dd, yyyy);
    
    var thisDate = new Date();
    var this_milliseconds;
    var this_converted_timestamp;		  
    var parse;
    var this_MM;
    var this_DD;
    var this_YYYY;
    var this_hh;
    var this_mm;
    var this_ss;
    var this_ms;
    var this_milliseconds;

    this_MM   = Number(mm) - 1; //correct for zero based month
    this_DD   = Number(dd);
    this_YYYY = Number(yyyy);

    if (!check_date(this_MM, this_DD, this_YYYY)) {
        //alert("Please specify starting date");
        console.log("Starting date is invalid:", this_MM, this_DD, this_YYYY);
        return;
    }

    try {
        parse = stringInput.split(":");
        this_hh = parse[0];
        this_mm = parse[1];
        this_ss = Math.floor(parse[2]);
        this_ms = (parse[2] % 1) * 1000;
        
        //debug(this_ss + " " + this_ms);
        if (check_time(this_hh, this_mm, this_ss, this_ms)) {

            // set base date in UTC
            thisDate.setUTCFullYear(this_YYYY);
            thisDate.setUTCMonth(this_MM);
            thisDate.setUTCDate(this_DD);
            thisDate.setUTCHours(this_hh);
            thisDate.setUTCMinutes(this_mm);
            thisDate.setUTCSeconds(this_ss);
            thisDate.setUTCMilliseconds(this_ms);

            // apply timezone offset
            this_milliseconds = thisDate.getUTCMilliseconds();
            this_milliseconds = this_milliseconds - ( gmt_hour_offset * 3600. * 1000 );
            thisDate.setUTCMilliseconds(this_milliseconds);

            this_converted_timestamp = generate_timestamp(thisDate);
            return this_converted_timestamp;
        } else {
            console.log("time not valid:", this_hh, this_mm, this_ss, this_ms);
            return "";
        }
    } catch (e) {
        console.log("error converting timestamp:", e);
        return "";
    }
}

function convert_datetime(stringInput, gmt_hour_offset, reverseFlag, delimiterDate, delimiterDateTime) {

    // reverseFlag indiates date ordering, e.g.:
    // reverseFlag=false: MM/DD/YYYY-hh:mm:ss
    // reverseFlag=true:  YYYY/MM/DD-hh:mm:ss
    
    var thisDate = new Date();
    var this_milliseconds;
    var this_converted_timestamp;		  
    
    var parse;
    var this_MM;
    var this_DD;
    var this_YYYY;
    var this_hh;
    var this_mm;
    var this_ss;
    var this_ms;
    var this_milliseconds;
    
    var this_date;
    var this_time;
    
    try {
        //parse = stringInput.split("-");
        parse = stringInput.split(delimiterDateTime); // separator between date and time
        this_date = parse[0];
        this_time = parse[1];
        
        parse = this_date.split(delimiterDate); // separator for month, day, year
        if (reverseFlag) {
            this_YYYY = parse[0];
            this_MM   = parse[1] - 1; //correct for zero based month
            this_DD   = parse[2];
        } else {
            this_MM   = parse[0] - 1; //correct for zero based month
            this_DD   = parse[1];
            this_YYYY = parse[2];
        }
        
        parse = this_time.split(":");
        this_hh = parse[0];
        this_mm = parse[1];
        this_ss = Math.floor(parse[2]);
	this_ms = (parse[2] % 1) * 1000;
        
        if (check_date(this_MM, this_DD, this_YYYY) && check_time(this_hh, this_mm, this_ss, this_ms)) { 
            
            // set base date in UTC
            thisDate.setUTCFullYear(this_YYYY);
            thisDate.setUTCMonth(this_MM);
            thisDate.setUTCDate(this_DD);
            thisDate.setUTCHours(this_hh);
            thisDate.setUTCMinutes(this_mm);
            thisDate.setUTCSeconds(this_ss);
            thisDate.setUTCMilliseconds(this_ms);
            
            // apply timezone offset
            this_milliseconds = thisDate.getUTCMilliseconds();
            this_milliseconds = this_milliseconds - ( gmt_hour_offset * 3600. * 1000 );
            thisDate.setUTCMilliseconds(this_milliseconds);
            
            this_converted_timestamp = generate_timestamp(thisDate);
            return this_converted_timestamp;
        } else {
            console.log("date/time not valid:", this_MM, this_DD, this_YYYY, this_hh, this_mm, this_ss, this_ms);
            return "";
        }
    } catch (e) {
        console.log("error converting timestamp:", e);
        return "";
    }
}


function convert_Almost8601(stringInput) {
    var thisDate = new Date();
    var this_milliseconds;
    var this_converted_timestamp;		  
    
    var parse;
    var this_MM;
    var this_DD;
    var this_YYYY;
    var this_hh;
    var this_mm;
    var this_ss;
    var this_ms;
    
    var this_date;
    var this_time;
    var this_tz;

    let matchingIndex = 0; // default

    lastTimeZoneDisambiguation = "";

        
    try {
        parse = stringInput.split(" ");
        this_date = parse[0];
        this_time = parse[1];
        this_tz   = parse[2];
        
        parse = this_date.split("-");
        this_YYYY = parse[0];
        this_MM   = parse[1] - 1; //correct for zero based month
        this_DD   = parse[2];
        
        parse = this_time.split(":");
        this_hh = parse[0];
        this_mm = parse[1];
        this_ss = Math.floor(parse[2]);
        this_ms = (parse[2] % 1) * 1000;        


        // HACK: need to add tz lookup
        tz_hour_offset = 0;
        
        
        if (check_date(this_MM, this_DD, this_YYYY) && check_time(this_hh, this_mm, this_ss, this_ms)) { 
            
            
            // set base date in UTC
            thisDate.setUTCFullYear(this_YYYY);
            thisDate.setUTCMonth(this_MM);
            thisDate.setUTCDate(this_DD);
            thisDate.setUTCHours(this_hh);
            thisDate.setUTCMinutes(this_mm);
            thisDate.setUTCSeconds(this_ss);
            thisDate.setUTCMilliseconds(this_ms);
            
            this_milliseconds = thisDate.getUTCMilliseconds();
            this_milliseconds = this_milliseconds - ( tz_hour_offset * 3600. * 1000 );
            thisDate.setUTCMilliseconds(this_milliseconds);
                
            this_converted_timestamp = generate_timestamp(thisDate);
            return this_converted_timestamp;
        } else {
            console.log("date/time not valid:", e);
            return "";
        }
    } catch (e) {
        console.log("error converting timestamp:", e);
        return "";
    }
}



function createRadioButtons(filteredTimezones) {

    var container = document.getElementById("tzDialog");

    // Clear previous contents of the container
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }

    var p = document.createElement("p");
    p.innerHTML = "This time zone abbreviation is not unique. Please select the one that applies to the data you are trying to convert.";
    container.appendChild(p);

    for (ind=0; ind<filteredTimezones.length; ind++) {
        // Create an <input> element, set its type and name attributes
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "tzOptions";
        if (ind == 0) {
            input.checked = true;
        }
        container.appendChild(input);
        container.appendChild(document.createTextNode(" " + filteredTimezones[ind].name));
        // Append a line break 
        container.appendChild(document.createElement("br"));
    }

}


function getRadio(elementName) { 
    var radios = document.getElementsByName(elementName);

    for (var ind=0; ind< radios.length; ind++) {
        if (radios[ind].checked) {
            

            // only one radio can be logically checked, don't check the rest
            break;
        }
    }

    return ind;
}



function back() {
    document.getElementById("div_fileSelection").style.display="block";
    document.getElementById("div_dataDisplay").style.display="none";
    location.reload();
}

function wait(milliSeconds) {
    var startTime = new Date().getTime();
    while ( (new Date().getTime() < startTime + milliSeconds) );
}


function debug(stuff) {
    document.getElementById("error_textarea").value += "\n" + stuff;
}
  
    
function zeroPad(num,count) {
    var numZeropad = num + '';
    while(numZeropad.length < count) {
        numZeropad = "0" + numZeropad;
    }
    return numZeropad;
}

