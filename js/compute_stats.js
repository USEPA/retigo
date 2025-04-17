// read user file and compute statisical measures

debugFlag = false;

function computeCovarianceElements(sortedData) {
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

    oStats.nHours           = nHours;
    oStats.nVars            = n_variables1;
    oStats.timestamp        = new Array(nHours).fill(0); // seconds since Jan 1 1970
    oStats.timestring       = new Array(nHours).fill("");// formatted string    
    oStats.validFlag        = new Array(nHours).fill(true); // allows points to be marked as invalid 
    oStats.varName          = new Array(n_variables1);
    oStats.mean             = new Array(n_variables1).fill(0.0); // xbar
    oStats.count            = new Array(n_variables1).fill(0.0); // count of averaged points
    oStats.hourAvg          = new Array(n_variables1);
    oStats.diff             = new Array(n_variables1); // (xi - xbar)
    oStats.diffSquare       = new Array(n_variables1); // (xi - xbar)^2
    oStats.cor              = 0.0; // correlation coef of currently selected x and y variables
    oStats.regression_yint  = 0.0; // regression y-intercept of currently selected x and y variable
    oStats.regression_slope = 0.0; // regression slope coef of currently selected x and y variable
    oStats.rmsError         = 0.0; // rms error between y variable and regression line
    oStats.sdevX            = 0.0; // sdev of currently selected x variable
    oStats.sdevY            = 0.0; // sdev coef of currently selected y variable
    oStats.cov              = 0.0; // covariance of currently selected x and y variables
    
    for (n=0; n<n_variables1; n++) {
        oStats.varName[n]    = "Hourly " + header1[n+4];
        oStats.hourAvg[n]    = new Array(nHours).fill(missing_value);
        oStats.diff[n]       = new Array(nHours).fill(0.0);
        oStats.diffSquare[n] = new Array(nHours).fill(0.0);
    }
    
    fileLines1       = fr1.replace(/\r/g,"").split("\n");
    lastHourNum      = -1;
    thisHourAvg      = new Array(n_variables1).fill(0.0);
    thisHourAvgCount = new Array(n_variables1).fill(0);

    
    // read data and compute hourly averages
    for (lineNum=0; lineNum<fileLines1.length; ++lineNum) {
	thisLine = fileLines1[lineNum].split(my_delimiter1);
        
        if (thisLine.length > 1 && thisLine.toString().charAt(0) != '#' && thisLine.toString().charAt(0) != 'T') {
            //thisTimestamp = create_dateObjectUTC(thisLine[0]);
            thisTimestamp = create_dateObjectUTC(thisLine[oHeaderColumn1.timestamp]);
            thisHourNum   = Math.floor((thisTimestamp.getTime() - dateStart.getTime()) / 1000 / 3600); // e.g. 1300 - 1400 would be hournum 13
            for (n=0; n<n_variables1; n++) {
                if (thisHourNum != lastHourNum) {
                    thisHourAvgCount[n] = 0;
                    if (n==0) {
                        //oStats.timestamp[thisHourNum] = thisTimestamp.toISOString();
                        oStats.timestamp[thisHourNum]   = thisTimestamp.getTime();
                        oStats.timestamp[thisHourNum]  -= (oStats.timestamp[thisHourNum] % 3600000); // round down to nearest hour
                        oStats.timestring[thisHourNum]  = thisTimestamp.toISOString();
                    }
                }
                thisVar = Number(thisLine[n+4]);

                if (thisVar != missing_value) {
                    oStats.hourAvg[n][thisHourNum] = ( (oStats.hourAvg[n][thisHourNum]*thisHourAvgCount[n]) + thisVar ) / ( thisHourAvgCount[n] + 1);
                    thisHourAvgCount[n] += 1;
                }
            }
            lastHourNum = thisHourNum;
        }
    }

    // compute mean
    for (n=0; n<n_variables1; n++) {
        for (hour=0; hour<nHours; hour++) {
            if (oStats.hourAvg[n][hour] != missing_value) {
                oStats.mean[n] = oStats.mean[n] + oStats.hourAvg[n][hour];
                oStats.count[n] += 1;
            }
        }
        oStats.mean[n] = oStats.mean[n] / oStats.count[n];
    }

    // compute (xi-xbar) an (xi-xbar)2
    for (n=0; n<n_variables1; n++) {
        for (hour=0; hour<nHours; hour++) {
            if (oStats.hourAvg[n][hour] != missing_value) {
                oStats.diff[n][hour]       = oStats.hourAvg[n][hour] - oStats.mean[n];
                oStats.diffSquare[n][hour] = Math.pow(oStats.diff[n][hour], 2);
            }
        }
    }

    
    
    //console.log("stats done");
    //for (n=0; n<n_variables1; n++) {
    //    console.log(oStats.varName[n], "mean:", oStats.mean[n], "count:", oStats.count[n]);
    //}
}


function initExternalCovarianceElements() {
    // initialize covariance elements for external variables (Airnow, etc)
    // note: can't be computed until data is loaded via Merge tab. 
    if (debugFlag) {console.log("in initExternalCovarianceElements()");}

    
    oStatsExternal.nHours     = oStats.nHours;     // aligned with oStats
    oStatsExternal.timestamp  = oStats.timestamp;  // aligned with oStats timestamp array
    oStatsExternal.timestring = oStats.timestring; // aligned with oStats timestamp array
    oStatsExternal.validFlag  = new Array(oStatsExternal.nHours).fill(true); // allows points to be marked as invalid 

    oStatsExternal.varName    = ["mysensor0",
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
    oStatsExternal.menuItems  = ["External Data 1" + mySensorArray[0].curVarname,
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
    oStatsExternal.nVars       = oStatsExternal.varName.length; 
    oStatsExternal.mean        = new Array(oStatsExternal.nVars).fill(0.0); // xbar
    oStatsExternal.count       = new Array(oStatsExternal.nVars).fill(0.0); // count of averaged points
    oStatsExternal.hourAvg     = new Array(oStatsExternal.nVars);
    oStatsExternal.diff        = new Array(oStatsExternal.nVars); // (xi - xbar)
    oStatsExternal.diffSquare  = new Array(oStatsExternal.nVars); // (xi - xbar)^2

    for (n=0; n<oStatsExternal.nVars; n++) {
        oStatsExternal.hourAvg[n]    = new Array(oStatsExternal.nHours).fill(missing_value);
        oStatsExternal.diff[n]       = new Array(oStatsExternal.nHours).fill(0.0);
        oStatsExternal.diffSquare[n] = new Array(oStatsExternal.nHours).fill(0.0);
    }
}


function computeExternalCovarianceElement(thisVarname) {
    //console.log(oStatsExternal);

    n = oStatsExternal.varName.indexOf(thisVarname);
    if (n < 0) {
        n = oStatsExternal.varName.indexOf(thisVarname.replace('aqs', 'airnow'));
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
    for (hInd=0; hInd<oStatsExternal.timestamp.length; hInd++) {
        timeToMatch = oStatsExternal.timestamp[hInd];
        oStatsExternal.hourAvg[n][hInd] = 0.0;
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
                oStatsExternal.hourAvg[n][hInd] += externalDataObject.closestVariable[ii];
                count += 1;
            }
        }
        if (count > 0) {
            oStatsExternal.hourAvg[n][hInd] = oStatsExternal.hourAvg[n][hInd] / count;
        }
        //console.log(count);
    }
    //console.log(oStatsExternal.hourAvg[n]);
    
    // compute mean
    oStatsExternal.mean[n]  = 0.0;
    oStatsExternal.count[n] = 0;
    for (hour=0; hour<oStatsExternal.nHours; hour++) {
        if (oStatsExternal.hourAvg[n][hour] != missing_value) {
            oStatsExternal.mean[n] = oStatsExternal.mean[n] + oStatsExternal.hourAvg[n][hour];
            oStatsExternal.count[n] += 1;
        }
    }
    if (oStatsExternal.count[n] > 0) {
        oStatsExternal.mean[n] = oStatsExternal.mean[n] / oStatsExternal.count[n];
    }
    
    // compute (xi-xbar) an (xi-xbar)2
    for (hour=0; hour<oStatsExternal.nHours; hour++) {
        if (oStatsExternal.hourAvg[n][hour] != missing_value) {
            oStatsExternal.diff[n][hour]       = oStatsExternal.hourAvg[n][hour] - oStatsExternal.mean[n];
            oStatsExternal.diffSquare[n][hour] = Math.pow(oStatsExternal.diff[n][hour], 2);
        }
    }
    
    
}




function computeUserCorrelation(xVarIndex, yVarIndex, xVarName, yVarName, xIsExternalFlag, yIsExternalFlag) {
    // correlation between two user variables
    // returns correlation coefficient, regression slope, and regression y-intercept
    // see http://educ.jmu.edu/~drakepp/FIN360/readings/Regression_notes.pdf

    if (debugFlag) { console.log("in computeUserCorrelation()"); }
    
    nHours = oStats.nHours;
    nHoursExternal = oStatsExternal.nHours;
    if (nHours != nHoursExternal) {
        console.log("oStats and oStatsExternal are incompatible");
    }

    xStatsArray = oStats; // default
    yStatsArray = oStats; // default

    //if (xVarIndex >= oStats.nVars) {
    if (xIsExternalFlag) {
        xStatsArray = oStatsExternal;
        //xVarIndex = oStatsExternal.menuItems.indexOf(xVarName);
    }
    //if (yVarIndex >= oStats.nVars) {
    if (yIsExternalFlag) {
        yStatsArray = oStatsExternal;
        //yVarIndex = oStatsExternal.menuItems.indexOf(yVarName);
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
 
    //console.log("cov:", cov, "meanX:", oStats.mean[xVarIndex], "meanY:", oStats.mean[yVarIndex], "sdevX:", sdevX, "sdevY:", sdevY, "sumCount:", sumCount);

    
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

    
    oStats.cor              = cor;
    oStats.regression_slope = slope;
    oStats.regression_yint  = intercept;
    oStats.rmsError         = rmsError;
    oStats.sdevX            = sdevX;
    oStats.sdevY            = sdevY;
    oStats.cov              = cov;
    
    return [cor, slope, intercept, rmsError];
}


function stats_sliderpos_lookup() {
    // for each possible position of the time slider, compute a corresponding index to the oStats time array,
    // so that we can show the nearest oStats points in time. Store the results in an array so that
    // they can be accessed on the fly as the slider is moved.
    // compute zulu times for the user data that is accessed by the slider
    //console.log("in stats_sliderpos_lookup()");
    var slider_zulutime;
    var slider_dateObjectUTC;

    var msecPerHour = 60 * 60 * 1000;
    
    var sliderLen = oUserdata.lat[selected_block].length;
    
    oStats.sliderposlookup = new Array(sliderLen).fill(0);
    
    for (slider_ind=0; slider_ind<sliderLen; slider_ind++) {
        slider_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][slider_ind])
        slider_msec = slider_dateObjectUTC.getTime();

        keep_going = true;
        for (hourInd=0; hourInd<oStats.nHours; hourInd++) {
            if (keep_going) {
                //difftime = Math.abs(slider_msec - oStats.timestamp[hourInd]);
                difftime = slider_msec - oStats.timestamp[hourInd];
                //difftime = oStats.timestamp[hourInd] - slider_msec; // e.g. oStats.timestamp[13] would correspond to 1300 gmt
                //if (difftime < msecPerHour) {
                if (difftime < msecPerHour && difftime > 0) {
                    oStats.sliderposlookup[slider_ind] = hourInd; //  oStats.sliderposlookup[] would yield 13 for times between 1300 - 1400
                    keep_going = false;
                }
            }
        }       
    }

    //console.log(oStats.sliderposlookup);
}
