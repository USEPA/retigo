// compute statistical measures from data already loaded into oUserdata


function computeCovarianceElementsNative() {
    //console.log("here");
    n_variables1 = oUserdata.varname[selected_block].length;
    nTimes       = oUserdata.msec[selected_block].length;
    
    oStatsNative.nVars            = n_variables1;
    oStatsNative.nTimes           = nTimes;
    oStatsNative.timestamp        = new Array(nTimes).fill(0); // seconds since Jan 1 1970
    oStatsNative.timestring       = new Array(nTimes).fill("");// formatted string    
    oStatsNative.validFlag        = new Array(nTimes).fill(true); // allows points to be marked as invalid 
    oStatsNative.varName          = new Array(n_variables1);
    oStatsNative.mean             = new Array(n_variables1).fill(0.0); // xbar
    oStatsNative.count            = new Array(n_variables1).fill(0.0); // count of averaged points
    oStatsNative.data             = new Array(n_variables1);
    oStatsNative.diff             = new Array(n_variables1); // (xi - xbar)
    oStatsNative.diffSquare       = new Array(n_variables1); // (xi - xbar)^2
    oStatsNative.cor              = 0.0; // correlation coef of currently selected x and y variables
    oStatsNative.regression_yint  = 0.0; // regression y-intercept of currently selected x and y variable
    oStatsNative.regression_slope = 0.0; // regression slope coef of currently selected x and y variable
    oStatsNative.rmsError         = 0.0; // rms error between y variable and regression line
    oStatsNative.sdevX            = 0.0; // sdev of currently selected x variable
    oStatsNative.sdevY            = 0.0; // sdev coef of currently selected y variable
    oStatsNative.cov              = 0.0; // covariance of currently selected x and y variables

    // data flagger stuff
    exclude = document.getElementById("excludeFlaggerOption").checked;
    
    // init variables and compute mean
    for (n=0; n<n_variables1; n++) {

        oStatsNative.varName[n]    = header1[n+4];
        oStatsNative.data[n]       = new Array(nTimes).fill(missing_value);
        oStatsNative.diff[n]       = new Array(nTimes).fill(0.0);
        oStatsNative.diffSquare[n] = new Array(nTimes).fill(0.0);
        
        //thisVarname = oUserdata.varname[selected_block][n];

        thisMean = 0.0;
        thisCount = 0;
        for (tInd=0; tInd<nTimes; tInd++) {
            thisMsec       = oUserdata.msec[selected_block][tInd]
            thisTimestring = oUserdata.timestamp[selected_block][tInd]
            if (n == 0) {
                oStatsNative.timestamp[tInd]  = thisMsec;
                oStatsNative.timestring[tInd] = thisTimestring;
            }
            thisData = oUserdata.variable[selected_block][n][tInd];


            //console.log(n, tInd, thisTimestamp, thisData);
            
            oStatsNative.data[n][tInd] = thisData;
            if (thisData != missing_value) {
                if ( (! exclude) || (exclude && (! isMsecFlagged(thisMsec)))) {
                    thisMean += thisData;
                    thisCount += 1;
                } else {
                    //console.log("aha", thisMsec);
                }
            }
        }
        oStatsNative.mean[n] = thisMean / thisCount;
    }


    // compute (xi-xbar) an (xi-xbar)2
    for (n=0; n<n_variables1; n++) {
        for (tInd=0; tInd<nTimes; tInd++) {
            thisData = oUserdata.variable[selected_block][n][tInd];
            thisMsec       = oUserdata.msec[selected_block][tInd]
            if (thisData != missing_value) {
                if ( (! exclude) || (exclude && (! isMsecFlagged(thisMsec)))) {
                    oStatsNative.diff[n][tInd]       = thisData - oStatsNative.mean[n];
                    oStatsNative.diffSquare[n][tInd] = Math.pow(oStatsNative.diff[n][tInd], 2);
                }
            }
        }
    }
    
}


function computeUserCorrelationNative(xVarIndex, yVarIndex, xVarName, yVarName) {

    nTimes = oStatsNative.nTimes;

    xStatsArray = oStatsNative; // default
    yStatsArray = oStatsNative; // default

    num      = 0.0;
    sdevX    = 0.0;
    sdevY    = 0.0
    cov      = 0.0
    sumCount = 0;

    cor       = 0.0;
    slope     = 0.0
    intercept = 0.0

     for (tInd=0; tInd<nTimes; tInd++) {
         if (xStatsArray.diffSquare[xVarIndex][tInd] > 0.0 && yStatsArray.diffSquare[yVarIndex][tInd] > 0.0 && xStatsArray.validFlag[tInd] && yStatsArray.validFlag[tInd]) {
             sdevX = sdevX + xStatsArray.diffSquare[xVarIndex][tInd]; // divided by sumCount below
             sdevY = sdevY + yStatsArray.diffSquare[yVarIndex][tInd]; // divided by sumCount below
             cov   = cov + (xStatsArray.diff[xVarIndex][tInd] * yStatsArray.diff[yVarIndex][tInd]);
             sumCount += 1;
         }
     }

    if (sumCount > 2) {
        sdevX = Math.sqrt( sdevX / (sumCount-1) );
        sdevY = Math.sqrt( sdevY / (sumCount-1) );
        cov   = cov / (sumCount - 1);

        cor       = cov / (sdevX * sdevY);
        slope     = cov / Math.pow(sdevX, 2);
        intercept = yStatsArray.mean[yVarIndex] - (slope * xStatsArray.mean[xVarIndex]);
    }
    //console.log("cov:", cov, "meanX:", oStatsNative.mean[xVarIndex], "meanY:", oStatsNative.mean[yVarIndex], "sdevX:", sdevX, "sdevY:", sdevY, "sumCount:", sumCount);

    
    // compute RMS error of y-variable vs (regression line or x-variable)
    rmsError = 0.0;
    rmsCount = 0;
    //console.log(xStatsArray);
    //console.log(yStatsArray);
    for (tInd=0; tInd<nTimes; tInd++) {
        thisXvalue          = xStatsArray.data[xVarIndex][tInd]; 
        thisYvalue          = yStatsArray.data[yVarIndex][tInd];
        //if (thisXvalue != missing_value && thisYvalue != missing_value) {
        if (thisXvalue != missing_value && thisYvalue != missing_value && xStatsArray.validFlag[tInd] && yStatsArray.validFlag[tInd]) {
            if ( (! exclude) || (exclude && (! isMsecFlagged(thisMsec)))) {

                // using regression line
                //thisRegressionValue = (slope*thisXvalue) + intercept;
                //rmsError += Math.pow(thisYvalue - thisRegressionValue, 2);
                
                // using x-variable
                rmsError += Math.pow(thisYvalue - thisXvalue, 2);
                
                rmsCount += 1;
                //console.log(hour, thisXvalue, thisYvalue, thisRegressionValue);
            }
        }
    }

    if (rmsCount > 0) {
        rmsError = Math.sqrt(rmsError / rmsCount);
    }

    oStatsNative.cor              = cor;
    oStatsNative.regression_slope = slope;
    oStatsNative.regression_yint  = intercept;
    oStatsNative.rmsError         = rmsError;
    oStatsNative.sdevX            = sdevX;
    oStatsNative.sdevY            = sdevY;
    oStatsNative.cov              = cov;
    
    return [cor, slope, intercept, rmsError];
}


function statsNative_sliderpos_lookup() {
    // for each possible position of the time slider, compute a corresponding index to the oStatsNative time array,
    // so that we can show the nearest oStatsHourly points in time. Store the results in an array so that
    // they can be accessed on the fly as the slider is moved.
    // compute zulu times for the user data that is accessed by the slider
    //console.log("in stats_sliderpos_lookup()");
    var slider_zulutime;
    var slider_dateObjectUTC;

    var msecPerHour = 60 * 60 * 1000;
    
    var sliderLen = oUserdata.lat[selected_block].length;
    
    oStatsNative.sliderposlookup = new Array(sliderLen).fill(0);
    
    for (slider_ind=0; slider_ind<sliderLen; slider_ind++) {
        slider_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][slider_ind])
        slider_msec = slider_dateObjectUTC.getTime();

        keep_going = true;
        for (tInd=0; tInd<oStatsNative.nTimes; tInd++) {
            if (keep_going) {
                //difftime = Math.abs(slider_msec - oStatsHourly.timestamp[hourInd]);
                difftime = slider_msec - oStatsNative.timestamp[tInd];
                //if (difftime < msecPerHour) {
                if (difftime == 0) {
                    oStatsNative.sliderposlookup[slider_ind] = tInd;
                    keep_going = false;
                }
            }
        }       
    }

    //console.log(oStatsNative.sliderposlookup);
}
