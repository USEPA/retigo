// read user file and compute statisical measures

debugFlag = false;

function computeCovarianceElementsHourly(sortedData) {
    if (debugFlag) {console.log("in computeCovarianceElements()");}

    // stats will be computed on an hourly basis from user data
    
    // number of hours in dataset
    var bracket_timerange = oUserdata.timerange;
    bracket_timerange = bracket_timerange.replace(/[T](\d{2})/, "T00"); // set initial hour to 00
    bracket_timerange = bracket_timerange.replace(/([T](\d{2}))(?!.*[T](\d{2}))/, "T23"); // set final hour to 23
    dateStart = create_dateObjectUTC(bracket_timerange.split('/')[0]);
    dateEnd   = create_dateObjectUTC(bracket_timerange.split('/')[1]);
    
    nHours = Math.ceil((dateEnd.getTime() - dateStart.getTime()) / 1000 / 3600) ;
    
    fr1 = remove_comments(sortedData);
    //console.log(sortedData);

    var space_delimiter = new RegExp("\\s+");
    var comma_delimiter = ",";
    
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

    
    // grab number of variables 
    n_variables1 = header1.length - 4;
    
    // grab number of lines 
    n_lines1 = user_countlines(fr1, 1);

    oStatsHourly.nHours           = nHours;
    oStatsHourly.nVars            = n_variables1;
    oStatsHourly.timestamp        = new Array(nHours).fill(0); // seconds since Jan 1 1970
    oStatsHourly.timestring       = new Array(nHours).fill("");// formatted string    
    oStatsHourly.validFlag        = new Array(nHours).fill(true); // allows points to be marked as invalid 
    oStatsHourly.varName          = new Array(n_variables1);
    oStatsHourly.mean             = new Array(n_variables1).fill(0.0); // xbar
    oStatsHourly.count            = new Array(n_variables1).fill(0.0); // count of averaged points
    oStatsHourly.hourAvg          = new Array(n_variables1);
    oStatsHourly.diff             = new Array(n_variables1); // (xi - xbar)
    oStatsHourly.diffSquare       = new Array(n_variables1); // (xi - xbar)^2
    oStatsHourly.cor              = 0.0; // correlation coef of currently selected x and y variables
    oStatsHourly.regression_yint  = 0.0; // regression y-intercept of currently selected x and y variable
    oStatsHourly.regression_slope = 0.0; // regression slope coef of currently selected x and y variable
    oStatsHourly.rmsError         = 0.0; // rms error between y variable and regression line
    oStatsHourly.sdevX            = 0.0; // sdev of currently selected x variable
    oStatsHourly.sdevY            = 0.0; // sdev coef of currently selected y variable
    oStatsHourly.cov              = 0.0; // covariance of currently selected x and y variables
    
    for (n=0; n<n_variables1; n++) {
        oStatsHourly.varName[n]    = "Hourly " + header1[n+4];
        oStatsHourly.hourAvg[n]    = new Array(nHours).fill(missing_value);
        oStatsHourly.diff[n]       = new Array(nHours).fill(0.0);
        oStatsHourly.diffSquare[n] = new Array(nHours).fill(0.0);
    }
    
    fileLines1       = fr1.replace(/\r/g,"").split("\n");
    lastHourNum      = -1;
    thisHourAvg      = new Array(n_variables1).fill(0.0);
    thisHourAvgCount = new Array(n_variables1).fill(0);

    
    // read data and compute hourly averages
    for (lineNum=0; lineNum<fileLines1.length; ++lineNum) {
	thisLine = fileLines1[lineNum].split(my_delimiter1);
        //console.log(thisLine);
        if (thisLine.length > 1 && thisLine.toString().charAt(0) != '#' && thisLine.toString().charAt(0) != 'T') {
            //thisTimestamp = create_dateObjectUTC(thisLine[0]);
            thisTimestamp = create_dateObjectUTC(thisLine[oHeaderColumn1.timestamp]);
            thisHourNum   = Math.floor((thisTimestamp.getTime() - dateStart.getTime()) / 1000 / 3600); // e.g. 1300 - 1400 would be hournum 13
            for (n=0; n<n_variables1; n++) {
                if (thisHourNum != lastHourNum) {
                    thisHourAvgCount[n] = 0;
                    if (n==0) {
                        //oStatsHourly.timestamp[thisHourNum] = thisTimestamp.toISOString();
                        oStatsHourly.timestamp[thisHourNum]   = thisTimestamp.getTime();
                        //console.log(oStatsHourly.timestamp[thisHourNum]);
                        oStatsHourly.timestamp[thisHourNum]  -= (oStatsHourly.timestamp[thisHourNum] % 3600000); // round down to nearest hour
                        oStatsHourly.timestring[thisHourNum]  = thisTimestamp.toISOString();
                    }
                }
                thisVar = Number(thisLine[n+4]);

                if (thisVar != missing_value) {
                    oStatsHourly.hourAvg[n][thisHourNum] = ( (oStatsHourly.hourAvg[n][thisHourNum]*thisHourAvgCount[n]) + thisVar ) / ( thisHourAvgCount[n] + 1);
                    thisHourAvgCount[n] += 1;
                }
            }
            lastHourNum = thisHourNum;
        }
    }

    // compute mean
    for (n=0; n<n_variables1; n++) {
        for (hour=0; hour<nHours; hour++) {
            if (oStatsHourly.hourAvg[n][hour] != missing_value) {
                oStatsHourly.mean[n] = oStatsHourly.mean[n] + oStatsHourly.hourAvg[n][hour];
                oStatsHourly.count[n] += 1;
            }
        }
        oStatsHourly.mean[n] = oStatsHourly.mean[n] / oStatsHourly.count[n];
    }

    // compute (xi-xbar) an (xi-xbar)2
    for (n=0; n<n_variables1; n++) {
        for (hour=0; hour<nHours; hour++) {
            if (oStatsHourly.hourAvg[n][hour] != missing_value) {
                oStatsHourly.diff[n][hour]       = oStatsHourly.hourAvg[n][hour] - oStatsHourly.mean[n];
                oStatsHourly.diffSquare[n][hour] = Math.pow(oStatsHourly.diff[n][hour], 2);
            }
        }
    }

    
    
    //console.log("stats done");
    //for (n=0; n<n_variables1; n++) {
    //    console.log(oStatsHourly.varName[n], "mean:", oStatsHourly.mean[n], "count:", oStatsHourly.count[n]);
    //}
}


function initExternalCovarianceElements() {
    // initialize covariance elements for external variables (Airnow, etc)
    // note: can't be computed until data is loaded via Merge tab. 
    if (debugFlag) {console.log("in initExternalCovarianceElements()");}

    
    oStatsHourlyExternal.nHours     = oStatsHourly.nHours;     // aligned with oStatsHourly
    oStatsHourlyExternal.timestamp  = oStatsHourly.timestamp;  // aligned with oStatsHourly timestamp array
    oStatsHourlyExternal.timestring = oStatsHourly.timestring; // aligned with oStatsHourly timestamp array
    oStatsHourlyExternal.validFlag  = new Array(oStatsHourlyExternal.nHours).fill(true); // allows points to be marked as invalid 

    oStatsHourlyExternal.varName    = ["mysensor0",
                                 "mysensor1",
                                 "mysensor2",
                                 "mysensor3",
                                 "mysensor4",
                                 "airnow.ozone",
                                 "airnow.pm25",
                                 "airnow.pm10",
                                 "airnow.co",
                                 "airnow.no2",
                                 "airnow.so2",
                                 "metar.temperature",
                                 "metar.sealevelpress",
                                 "metar.windspeed",
                                 "metar.winddir",
                                 "purpleair.pm25_corrected"];
    //oStatsExternal.IDs        = ["addMySensor0",
    //                             "addMySensor1",
    //                             "addMySensor2",
    //                             "addMySensor3",
    //                             "addMySensor4",
    //                             "addAqsOzone",
    //                             "addAqsPm25",
    //                             "addAqsCO",
    //                             "addAqsNO2",
    //                             "addAqsSO2",
    //                             "addSurfmetTemperature", // really METAR
    //                             "addSurfmetPressure",    // really METAR
    //                             "addSurfmetWindSpeed",   // really METAR
    //                             "addSurfmetWindDir",     // really METAR
    //                             "addPurpleairPM25"];
    oStatsHourlyExternal.menuItems  = ["External Data 1" + mySensorArray[0].curVarname,
                                 "External Data 2" + mySensorArray[1].curVarname,
                                 "External Data 3" + mySensorArray[2].curVarname,
                                 "External Data 4" + mySensorArray[3].curVarname,
                                 "External Data 5" + mySensorArray[4].curVarname,
                                 "AirNow O3", 
                                 "AirNow PM2.5",
                                 "AirNow PM10",
                                 "AirNow CO",
                                 "AirNow NO2",
                                 "AirNow SO2",
                                 "METAR temperature",
                                 "METAR pressure",
                                 "METAR wind speed",
                                 "METAR wind direction",
                                 "Purpleair PM2.5"];
    oStatsHourlyExternal.nVars       = oStatsHourlyExternal.varName.length; 
    oStatsHourlyExternal.mean        = new Array(oStatsHourlyExternal.nVars).fill(0.0); // xbar
    oStatsHourlyExternal.count       = new Array(oStatsHourlyExternal.nVars).fill(0.0); // count of averaged points
    oStatsHourlyExternal.hourAvg     = new Array(oStatsHourlyExternal.nVars);
    oStatsHourlyExternal.diff        = new Array(oStatsHourlyExternal.nVars); // (xi - xbar)
    oStatsHourlyExternal.diffSquare  = new Array(oStatsHourlyExternal.nVars); // (xi - xbar)^2

    for (n=0; n<oStatsHourlyExternal.nVars; n++) {
        oStatsHourlyExternal.hourAvg[n]    = new Array(oStatsHourlyExternal.nHours).fill(missing_value);
        oStatsHourlyExternal.diff[n]       = new Array(oStatsHourlyExternal.nHours).fill(0.0);
        oStatsHourlyExternal.diffSquare[n] = new Array(oStatsHourlyExternal.nHours).fill(0.0);
    }
}


function computeExternalCovarianceElement(thisVarname) {
    //console.log(oStatsHourlyExternal);

    n = oStatsHourlyExternal.varName.indexOf(thisVarname);
    if (n < 0) {
        n = oStatsHourlyExternal.varName.indexOf(thisVarname.replace('aqs', 'airnow'));
    }
    
    if (debugFlag) { console.log("in computeExternalCovarianceElement", thisVarname, n); }

    //console.log("in computeExternalCovarianceElement", thisVarname, n);

    var absFlag; // whether to use absolute value in msec time window
    var msecMatchingCriterion;
    
    if (thisVarname === "mysensor0") {
        externalDataObject    = mySensorArray[0];
        msecMatchingCriterion = 3600 * 1000; // times must match to within this amount (avg at end of hour to match retigo)
        absFlag = false;
    } else if (thisVarname === "mysensor1") {
        externalDataObject    = mySensorArray[1];
        msecMatchingCriterion = 3600 * 1000; // times must match to within this amount (avg at end of hour to match retigo)
        absFlag = false;
    } else if (thisVarname === "mysensor2") {
        externalDataObject    = mySensorArray[2];
        msecMatchingCriterion = 3600 * 1000; // times must match to within this amount (avg at end of hour to match retigo)
        absFlag = false;
    } else if (thisVarname === "mysensor3") {
        externalDataObject    = mySensorArray[3];
        msecMatchingCriterion = 3600 * 1000; // times must match to within this amount (avg at end of hour to match retigo)
        absFlag = false;
    } else if (thisVarname === "mysensor4") {
        externalDataObject    = mySensorArray[4];
        msecMatchingCriterion = 3600 * 1000; // times must match to within this amount (avg at end of hour to match retigo)
        absFlag = false;
    } else if (thisVarname === "airnow.ozone" || thisVarname === "aqs.ozone") {
        externalDataObject    = oAirnowOzone;
        msecMatchingCriterion = 120 * 1000; // times must match to within +/- this amount
        absFlag = true;
    } else if (thisVarname === "airnow.pm25" || thisVarname === "aqs.pm25") {
        externalDataObject    = oAirnowPM25;
        msecMatchingCriterion = 120 * 1000; // times must match to within +/- this amount
        absFlag = true;
    } else if (thisVarname === "airnow.pm10" || thisVarname === "aqs.pm10") {
        externalDataObject    = oAirnowPM10;
        msecMatchingCriterion = 120 * 1000; // times must match to within +/- this amount
        absFlag = true;
    } else if (thisVarname === "airnow.co" || thisVarname === "aqs.co") {
        externalDataObject    = oAirnowCO;
        msecMatchingCriterion = 120 * 1000; // times must match to within +/- this amount
        absFlag = true;
    } else if (thisVarname === "airnow.no2" || thisVarname === "aqs.no2") {
        externalDataObject    = oAirnowNO2;
        msecMatchingCriterion = 120 * 1000; // times must match to within +/- this amount
        absFlag = true;
    } else if (thisVarname === "airnow.so2" || thisVarname === "aqs.so2") {
        externalDataObject    = oAirnowSO2;
        msecMatchingCriterion = 120 * 1000; // times must match to within +/- this amount
        absFlag = true;
    //} else if (thisVarname === "airnow.pm25" || thisVarname === "aqs.pm25") {
    //    externalDataObject    = oAirnowPM25;
    //    msecMatchingCriterion = 120 * 1000; // times must match to within +/- this amount
    //    absFlag = true;
    } else if (thisVarname === "metar.temperature") {
        externalDataObject    = oSurfmetTemperature;
        msecMatchingCriterion = 120 * 1000; // times must match to within +/- this amount
        absFlag = true;
    } else if (thisVarname === "metar.sealevelpress") {
        externalDataObject    = oSurfmetPressure;
        msecMatchingCriterion = 120 * 1000; // times must match to within +/- this amount
        absFlag = true;
    } else if (thisVarname === "metar.windspeed") {
        externalDataObject    = oSurfmetWindSpeed;
        msecMatchingCriterion = 120 * 1000; // times must match to within +/- this amount
        absFlag = true;
    } else if (thisVarname === "metar.winddir") {
        externalDataObject    = oSurfmetWindDirection;
        msecMatchingCriterion = 120 * 1000; // times must match to within +/- this amount
        absFlag = true;
    } else if (thisVarname === "purpleair.pm25_corrected") {
        externalDataObject    = oPurpleairPM25;
        msecMatchingCriterion = 120 * 1000; // times must match to within +/- this amount
        absFlag = true;
    } else {
        console.log("External variable object not located.");
        externalDataObject = null;
    }

    if (debugFlag) { console.log("externalDataObject=", externalDataObject); }

    //console.log(msecMatchingCriterion);
    
    // populate hourAvg array
    for (hInd=0; hInd<oStatsHourlyExternal.timestamp.length; hInd++) {
        timeToMatch = oStatsHourlyExternal.timestamp[hInd];
        oStatsHourlyExternal.hourAvg[n][hInd] = 0.0;
        var count = 0;
        for (ii=0; ii<externalDataObject.closestTimestamp.length; ii++) {
            thisExternalTimestamp = create_dateObjectUTC(externalDataObject.closestTimestamp[ii]);
            if (absFlag) { // for Airnow
                msecDiff = Math.abs(thisExternalTimestamp.getTime() - timeToMatch);
            } else {       // for Mysensor
                //msecDiff = timeToMatch - thisExternalTimestamp.getTime();
                msecDiff = thisExternalTimestamp.getTime() - timeToMatch;
            }
            //console.log(timeToMatch, thisExternalTimestamp.getTime(), msecDiff);
            if (msecDiff < msecMatchingCriterion && msecDiff >= 0 && externalDataObject.closestVariable[ii]) {
                //console.log("match", hInd, ii, thisExternalTimestamp.getTime(), timeToMatch, Math.abs(thisExternalTimestamp.getTime() - timeToMatch) );
                oStatsHourlyExternal.hourAvg[n][hInd] += externalDataObject.closestVariable[ii];
                count += 1;
            }
        }
        if (count > 0) {
            oStatsHourlyExternal.hourAvg[n][hInd] = oStatsHourlyExternal.hourAvg[n][hInd] / count;
        }
        //console.log(count);
    }
    //console.log(oStatsHourlyExternal.hourAvg[n]);
    
    // compute mean
    oStatsHourlyExternal.mean[n]  = 0.0;
    oStatsHourlyExternal.count[n] = 0;
    for (hour=0; hour<oStatsHourlyExternal.nHours; hour++) {
        if (oStatsHourlyExternal.hourAvg[n][hour] != missing_value) {
            oStatsHourlyExternal.mean[n] = oStatsHourlyExternal.mean[n] + oStatsHourlyExternal.hourAvg[n][hour];
            oStatsHourlyExternal.count[n] += 1;
        }
    }
    if (oStatsHourlyExternal.count[n] > 0) {
        oStatsHourlyExternal.mean[n] = oStatsHourlyExternal.mean[n] / oStatsHourlyExternal.count[n];
    }
    
    // compute (xi-xbar) an (xi-xbar)2
    for (hour=0; hour<oStatsHourlyExternal.nHours; hour++) {
        if (oStatsHourlyExternal.hourAvg[n][hour] != missing_value) {
            oStatsHourlyExternal.diff[n][hour]       = oStatsHourlyExternal.hourAvg[n][hour] - oStatsHourlyExternal.mean[n];
            oStatsHourlyExternal.diffSquare[n][hour] = Math.pow(oStatsHourlyExternal.diff[n][hour], 2);
        }
    }
    
    
}




function computeUserCorrelation(xVarIndex, yVarIndex, xVarName, yVarName, xIsExternalFlag, yIsExternalFlag) {
    // correlation between two user variables
    // returns correlation coefficient, regression slope, and regression y-intercept
    // see http://educ.jmu.edu/~drakepp/FIN360/readings/Regression_notes.pdf

    if (debugFlag) { console.log("in computeUserCorrelation()"); }
    
    nHours = oStatsHourly.nHours;
    nHoursExternal = oStatsHourlyExternal.nHours;
    if (nHours != nHoursExternal) {
        console.log("oStatsHourly and oStatsHourlyExternal are incompatible");
    }

    xStatsArray = oStatsHourly; // default
    yStatsArray = oStatsHourly; // default

    //if (xVarIndex >= oStatsHourly.nVars) {
    if (xIsExternalFlag) {
        xStatsArray = oStatsHourlyExternal;
        //xVarIndex = oStatsHourlyExternal.menuItems.indexOf(xVarName);
    }
    //if (yVarIndex >= oStatsHourly.nVars) {
    if (yIsExternalFlag) {
        yStatsArray = oStatsHourlyExternal;
        //yVarIndex = oStatsHourlyExternal.menuItems.indexOf(yVarName);
    }

    if (debugFlag) {
        console.log("---");
        console.log("xStatsArray=", xStatsArray);
        console.log("xVarName=", xVarName);
        console.log("xVarIndex=", xVarIndex);
        console.log("xIsExternalFlag=", xIsExternalFlag);
        console.log("");
        console.log("yStatsArray=", yStatsArray);
        console.log("yVarName=", yVarName);
        console.log("yVarIndex=", yVarIndex);
        console.log("yIsExternalFlag=", yIsExternalFlag);
    }
    
    num      = 0.0;
    sdevX    = 0.0;
    sdevY    = 0.0
    cov      = 0.0
    sumCount = 0;

    cor       = 0.0;
    slope     = 0.0
    intercept = 0.0
    
    for (hour=0; hour<nHours; hour++) {
        //if (xStatsArray.diffSquare[xVarIndex][hour] > 0.0 && yStatsArray.diffSquare[yVarIndex][hour] > 0.0) {
        if (xStatsArray.diffSquare[xVarIndex][hour] > 0.0 && yStatsArray.diffSquare[yVarIndex][hour] > 0.0 && xStatsArray.validFlag[hour] && yStatsArray.validFlag[hour]) {
            sdevX = sdevX + xStatsArray.diffSquare[xVarIndex][hour]; // divided by sumCount below
            sdevY = sdevY + yStatsArray.diffSquare[yVarIndex][hour]; // divided by sumCount below
            cov   = cov + (xStatsArray.diff[xVarIndex][hour] * yStatsArray.diff[yVarIndex][hour]);
            sumCount += 1;
        }
    }
    if (debugFlag) { console.log("SumCount=", sumCount); }
    if (sumCount > 2) {
        sdevX = Math.sqrt( sdevX / (sumCount-1) );
        sdevY = Math.sqrt( sdevY / (sumCount-1) );
        cov   = cov / (sumCount - 1);

        cor       = cov / (sdevX * sdevY);
        slope     = cov / Math.pow(sdevX, 2);
        intercept = yStatsArray.mean[yVarIndex] - (slope * xStatsArray.mean[xVarIndex]);
    }
 
    //console.log("cov:", cov, "meanX:", oStatsHourly.mean[xVarIndex], "meanY:", oStatsHourly.mean[yVarIndex], "sdevX:", sdevX, "sdevY:", sdevY, "sumCount:", sumCount);

    
    // compute RMS error of y-variable vs (regression line or x-variable)
    rmsError = 0.0;
    rmsCount = 0;
    //console.log(xStatsArray);
    //console.log(yStatsArray);
    for (hour=0; hour<nHours; hour++) {
        thisXvalue          = xStatsArray.hourAvg[xVarIndex][hour]; 
        thisYvalue          = yStatsArray.hourAvg[yVarIndex][hour];
        //if (thisXvalue != missing_value && thisYvalue != missing_value) {
        if (thisXvalue != missing_value && thisYvalue != missing_value && xStatsArray.validFlag[hour] && yStatsArray.validFlag[hour]) {
            // using regression line
            //thisRegressionValue = (slope*thisXvalue) + intercept;
            //rmsError += Math.pow(thisYvalue - thisRegressionValue, 2);

            // using x-variable
            rmsError += Math.pow(thisYvalue - thisXvalue, 2);

            rmsCount += 1;
            //console.log(hour, thisXvalue, thisYvalue, thisRegressionValue);
        }
    }

    if (rmsCount > 0) {
        rmsError = Math.sqrt(rmsError / rmsCount);
    }

    //console.log(xStatsArray.hourAvg[xVarIndex]);

    
    oStatsHourly.cor              = cor;
    oStatsHourly.regression_slope = slope;
    oStatsHourly.regression_yint  = intercept;
    oStatsHourly.rmsError         = rmsError;
    oStatsHourly.sdevX            = sdevX;
    oStatsHourly.sdevY            = sdevY;
    oStatsHourly.cov              = cov;
    
    return [cor, slope, intercept, rmsError];
}


function stats_sliderpos_lookup() {
    // for each possible position of the time slider, compute a corresponding index to the oStatsHourly time array,
    // so that we can show the nearest oStatsHourly points in time. Store the results in an array so that
    // they can be accessed on the fly as the slider is moved.
    // compute zulu times for the user data that is accessed by the slider
    //console.log("in stats_sliderpos_lookup()");
    var slider_zulutime;
    var slider_dateObjectUTC;

    var msecPerHour = 60 * 60 * 1000;
    
    var sliderLen = oUserdata.lat[selected_block].length;
    
    oStatsHourly.sliderposlookup = new Array(sliderLen).fill(0);
    
    for (slider_ind=0; slider_ind<sliderLen; slider_ind++) {
        slider_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][slider_ind])
        slider_msec = slider_dateObjectUTC.getTime();

        keep_going = true;
        for (hourInd=0; hourInd<oStatsHourly.nHours; hourInd++) {
            if (keep_going) {
                //difftime = Math.abs(slider_msec - oStatsHourly.timestamp[hourInd]);
                difftime = slider_msec - oStatsHourly.timestamp[hourInd];
                //difftime = oStatsHourly.timestamp[hourInd] - slider_msec; // e.g. oStatsHourly.timestamp[13] would correspond to 1300 gmt
                //if (difftime < msecPerHour) {
                if (difftime < msecPerHour && difftime > 0) {
                    oStatsHourly.sliderposlookup[slider_ind] = hourInd; //  oStats.sliderposlookup[] would yield 13 for times between 1300 - 1400
                    keep_going = false;
                }
            }
        }       
    }

    //console.log(oStats.sliderposlookup);
}
