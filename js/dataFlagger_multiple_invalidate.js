// dataFlagger.js
//
// RETIGO module for flagging outliers or other invalid sensor data.
//
// Input data


// Modification history:
//
// 2023-04-19: Original version (Matt Freeman)
//               - Created entry points for test routines
//               - Created simple constant test.
// 2023-05-11: updated (Yadong Xu)
//             - Added function to check if all elements in an array are equal
//             - Merged Matt's update
// 2023-05-25~31: updated (Yadong Xu)
//             - Added three more tests - the longMissing test, testOutlierStat,testOutlierSpike
//             - revised the constant and longMissing tests to flag all the consective points
//             - added sub-function getDataOnSensor(), getAve(), getVar()
// 2023-06-05~21: updated (Yadong Xu)
//             - added sub-function getDataOnSensorAfterTimeStamp
//             - revised 'testOutlierSpike' so that we evaluate a spike based on the changes from the previous data point
//               and the following data point, the data point is qualified as a 'spike' if both sides have large differences. 
// 2023-06-29 updated (Matt)
//             - Added support for setting flagParams via the GUI.
//             - Replaced Date() arithmetic with direct comparisons using dataObj.mSec, resulting in performance gains.
// 2023-07-18~31: updated (Yadong Xu)
//             - Added three more tests - testAboveConc, testBelowConc, userInvalidate
//             - Added four flagParams, including flagParams.aboveConc, flagParams.belowConc, 
//               flagParams,invalidateStartTime, flagParams.invalidateEndTime
// 2023-08-01~05: updated (Yadong Xu)
//             - Added logic flow to display an error message if "userInvalidateStartTime" or 
//               "userInvalidateEndTime" is out of time range or in a wrong format
// 2023-08-29~30: updated (Yadong Xu)
//             - fixed a bug when there are missing data right at "userInvalidateStartTime" or "userInvalidateEndTime"
//             - added sub-function checkTimeWithinRange
// 2023-09-26 : cleaned up code and moved console.log() to debug mode
// 2024-08-15 : updated (Matt)
//             - added code for integration into RETIGO
// 2024-08-28 : updated (Yadong Xu)
//             - adjusted "flaggerParameterChanged()" function to be used with "dataFlaggerTester.html"
//             - added "addMoreInvalidateWindow()" function
// 2024-09-06: updated (Yadong Xu)
//             - changed flagParams.invalidateStartTime and flagParams.invalidateEndTime to String arrays
//             - added code "userInvalidate()" function to loop through additional invalidate time windows

//////////////////////////////////////////////////////////////////////
// Define useful parameters here
// 
//////////////////////////////////////////////////////////////////////
var flagParams = {}; // namespace for hardcoded parameters
if (document.URL.endsWith("dataFlaggerTester_multiple_invalidate.html")) {
    flagParams.constantRepeatNum = 8;     // number of repeated values to check for in the constant test
    flagParams.missingRepeatNum  = 8;     // number of consecutive missing values to check for in the longMissing test
    flagParams.missingValue      = -9999; // define what is a missing value
    flagParams.timesSDNum        = 4;     // number of times the standard deviation when define a statistical outlier 'outlierStat'
    flagParams.hoursNumTW        = 12;    // number of hours to calculate the standard deviation when define 'outlierSpike'
    flagParams.timesSDNumTW      = 6;     //number of times the standard deviation within the time window when define 'outlierSpike'
    flagParams.aboveConc         = 75; // threshold concentration value when define 'testAboveConc'
    //flagParams.aboveConc         = 4000; // threshold concentration value when define 'testAboveConc'
    flagParams.belowConc         = 0;  // threshold concentration value when define 'testBelowConc'
    //flagParams.belowConc         = 2000;  // threshold concentration value when define 'testBelowConc'
    flagParams.invalidateStartTime = [""];     //changed to an array,start time when define 'userInvalidated', in this format 2022-01-03T01:00:00-0000
    flagParams.invalidateEndTime = [""];       //changed to an array,time when define 'userInvalidated',in this format 2022-01-03T10:00:00-0000
    //YD added,Sep-2024,check if there are more invalidate time windows added
    var invalidateWins = document.querySelectorAll('[id^="invalidateStart"]');
    if (invalidateWins.length>1)
    {
    //console.log('there are additional invalidate rows:',invalidateWins.length-1)  
    var addedN = invalidateWins.length-1;
        for (addedN=1;addedN<invalidateWins.length;addedN++){
            flagParams.invalidateStartTime.push[""];
            flagParams.invalidateEndTime.push[""];
        }
    }
} else {
    
}

var flaggedIndices = {}; // namespace for flagged data.
flaggedIndices.constant      = new Array();
flaggedIndices.longMissing   = new Array();
flaggedIndices.outlierStat   = new Array();
flaggedIndices.outlierSpike  = new Array();
flaggedIndices.aboveConc     = new Array();
flaggedIndices.belowConc     = new Array();
flaggedIndices.userInvalidated = new Array();

flagger_colorGray          = "#CCCCCC";
flagger_colorConstant      = "#FF0000";
flagger_colorLongMissing   = "#00FF00";
flagger_colorOutlierStat   = "#0000FF";
flagger_colorOutlierSpike  = "#FFFF00";
flagger_colorAboveConc     = "#FFA500";
flagger_colorBelowConc     = "#800080";
flagger_colorInvalidated   = "#253f52";

var debugFlag_dataflagger = false;

$(document).ready(function(){
    
    // Initialize GUI parameter values if we are using the tester. If this is called by Retigo
    // the GUI initialization happens in retigo_main.js
    if (document.URL.endsWith("dataFlaggerTester_multiple_invalidate.html")) {
        document.getElementById("constantNum").value            = flagParams.constantRepeatNum;
        document.getElementById("missingNum").value             = flagParams.missingRepeatNum;
        document.getElementById("outlierStatSDfactor").value    = flagParams.timesSDNum;
        document.getElementById("outlierSpikeTimeWindow").value = flagParams.hoursNumTW;
        document.getElementById("outlierSpikeSDfactor").value   = flagParams.timesSDNumTW;
        document.getElementById("aboveConcentration").value     = flagParams.aboveConc;
        document.getElementById("belowConcentration").value     = flagParams.belowConc;
        document.getElementById("invalidateStart").value        = flagParams.invalidateStartTime[0];
        document.getElementById("invalidateEnd").value          = flagParams.invalidateEndTime[0];
        if (invalidateWins.length>1)
        { 
        var addedN = invalidateWins.length-1;
            for (addedN=1;addedN<invalidateWins.length;addedN++){
                document.getElementById("invalidateStart${addedN}").value        = flagParams.invalidateStartTime[addedN];
                document.getElementById("invalidateEnd${addedN}").value          = flagParams.invalidateEndTime[addedN]; 
            }
        }
       

       
    }
});

function dataFlaggerInitParams() {
    // called by Retigo
    flagParams.constantRepeatNum   = settings.flaggerConstantRepeatNum;
    flagParams.missingRepeatNum    = settings.flaggerMissingRepeatNum;
    flagParams.missingValue        = settings.flaggerMissingValue;
    flagParams.timesSDNum          = settings.flaggerOutlierStatSDfactor;
    flagParams.hoursNumTW          = settings.flaggerOutlierSpikeTimeWindow;
    flagParams.timesSDNumTW        = settings.flaggerOutlierSpikeSDfactor;
    flagParams.aboveConc           = settings.flaggerAboveConc;
    flagParams.belowConc           = settings.flaggerBelowConc;
    flagParams.invalidateStartTime = settings.flaggerUserInvalidateStart;
    flagParams.invalidateEndTime   = settings.flaggerUserInvalidateEnd;
}

////////////////////////////////////////
// Main routine for flagging bad data
////////////////////////////////////////
function dataFlagger(inputObj,                   
                     sensorID,                   
                     doConstantNum,              
                     doMissingNum,               
                     doOutlierStatSDfactor,      
                     doOutlierSpikeTimeWindow,   
                     //doOutlierSpikeSDfactor,
                     doAboveConcentration,       
                     doBelowConcentration,
                     doUserInvalidate) {
    // perform a series of tests on the input data object,
    // and return arrays of indicies that +denote flagged data.

    // reset arrays
    flaggedIndices.constant      = [];
    flaggedIndices.longMissing   = [];
    flaggedIndices.outlierStat   = [];
    flaggedIndices.outlierSpike  = [];
    flaggedIndices.aboveConc     = [];
    flaggedIndices.belowConc     = [];
    flaggedIndices.userInvalidated = [];
    
    // call test routines here
    if (doConstantNum)            { testConstant(inputObj,     sensorID); }
    if (doMissingNum)             { testLongMissing(inputObj,  sensorID); }
    if (doOutlierStatSDfactor)    { testOutlierStat(inputObj,  sensorID); }
    if (doOutlierSpikeTimeWindow) { testOutlierSpike(inputObj, sensorID); }
    if (doAboveConcentration)     { testAboveConc(inputObj,    sensorID); }
    if (doBelowConcentration)     { testBelowConc(inputObj,    sensorID); }
    
    //console.log('check if start time string is empty:',flagParams.invalidateStartTime === "")
    if (doUserInvalidate) {
        if (flagParams.invalidateStartTime.length >= 1 && flagParams.invalidateEndTime.length >= 1 && flagParams.invalidateStartTime[0] !== "" && flagParams.invalidateEndTime[0] !== ""){
            userInvalidate(inputObj, sensorID); 
        } else if (flagParams.invalidateStartTime[0] == "" && flagParams.invalidateEndTime[0] == "") {
            document.getElementById("flaggerErrorMessage").style.display = 'none';
        }
    }
    
    return flaggedIndices;
}
// End of main routine


////////////////////////////////////////
// Routines for each test
////////////////////////////////////////

function testConstant(dataObj, sensorID) {
    // For a given timestep, fail the test if there are no less than N-1 consecutive previous
    // timesteps have the same datavalue(exclude missing values). N is given by flagParams.constantRepeatNum.
    
    let isSiteArrayRegular = ! Array.isArray(dataObj.nSites);

    if (debugFlag_dataflagger) {
        console.log("isArrayRegular = ", isSiteArrayRegular);
    }
    
    // buffer to store the previous N values
    let dataBuffer = new Array();
    let dataBufferIndex = new Array();
    let nTimesteps = dataObj.nTimes;
    let nSites;
    let globalIndex = 0;
    for (ts=0; ts<nTimesteps; ts++) {

        if ( isSiteArrayRegular ) {
            nSites =  dataObj.nSites;
        } else {
            nSites = dataObj.nSites[ts];
        }
       //console.log('nSites:', nSites);

        for (site=0; site<nSites; site++) {
            let thisID       = dataObj.id[globalIndex];
            if (thisID == sensorID) {
                let thisData      = dataObj.variable[globalIndex];
                if (debugFlag_dataflagger) {
                    console.log(sensorID, thisData);
                }

                // push the current data to the data buffer
                // also save the globalIndex for the data inside the data buffer, will be used for flagging
                dataBuffer.push(thisData);
                dataBufferIndex.push(globalIndex);
                
                // apply the test
                if (dataBuffer.length == flagParams.constantRepeatNum && allEqual(dataBuffer) && thisData != flagParams.missingValue) {
                    
                    for (point=0; point<dataBuffer.length; point++){
                        let thisMsec      = dataObj.msec[dataBufferIndex[point]];
                        let thisTimestamp = dataObj.timestamp[dataBufferIndex[point]];
                        (flaggedIndices.constant).push([ts, site, dataBufferIndex[point], thisMsec, thisTimestamp]); 
                    }
                    
                    if (debugFlag_dataflagger) {
                    console.log('the dataBuffer for testConstant:',dataBuffer);
                    console.log('the dataBufferIndex for testConstant:',dataBufferIndex);
                    console.log(flaggedIndices.constant)  
                    }
                }
                
                if (dataBuffer.length == flagParams.constantRepeatNum) {
                    dataBuffer.shift();
                    dataBufferIndex.shift();
                }  
            }
            globalIndex += 1;
        }
    }
    //console.log(sensorID,flaggedIndices.constant);
}



function testLongMissing(dataObj, sensorID) {
    // For a given timestep, fail the test if there are no less than N-1 consecutive previous
    // timesteps are missing values. N is given by flagParams.missingRepeatNum.
    // missing value is given by flagParams.missingValue
    
    let isSiteArrayRegular = ! Array.isArray(dataObj.nSites);

    if (debugFlag_dataflagger) {
        console.log("isArrayRegular = ", isSiteArrayRegular);
    }
    
    // buffer to store the previous N values
    let dataBuffer = new Array();
    let dataBufferIndex = new Array();
    let nTimesteps = dataObj.nTimes;
    let nSites;
    let globalIndex = 0;
    for (ts=0; ts<nTimesteps; ts++) {

        if ( isSiteArrayRegular ) {
            nSites =  dataObj.nSites;
        } else {
            nSites = dataObj.nSites[ts];
        }

        for (site=0; site<nSites; site++) {
            let thisID       = dataObj.id[globalIndex];
            if (thisID == sensorID) {
                let thisData      = dataObj.variable[globalIndex];
                if (debugFlag_dataflagger) {
                    console.log(sensorID, thisData);
                }

                // push the current data to the data buffer
                // also save the global index of the missing data in dataBuffer
                dataBuffer.push(thisData);
                dataBufferIndex.push(globalIndex);
                
                // apply the test
                if (dataBuffer.length == flagParams.missingRepeatNum && allEqual(dataBuffer) && thisData == flagParams.missingValue ) {
                    for (point=0; point<dataBuffer.length; point++){
                    let thisMsec      = dataObj.msec[dataBufferIndex[point]];
                    let thisTimestamp = dataObj.timestamp[dataBufferIndex[point]];
                    (flaggedIndices.longMissing).push([ts, site, dataBufferIndex[point], thisMsec, thisTimestamp]);
                    }
                    if (debugFlag_dataflagger) {
                    console.log('the dataBuffer for testLongMissing:',dataBuffer); 
                    console.log('the dataBufferIndex for testLongMissing:',dataBufferIndex);   
                    console.log(flaggedIndices.longMissing);  
                    }
                }
                
                if (dataBuffer.length == flagParams.missingRepeatNum) {
                    dataBuffer.shift();
                    dataBufferIndex.shift();
                }  
            }
            globalIndex += 1;
        }
    }
    //console.log(sensorID,flaggedIndices.longMissing );
}

function testOutlierStat(dataObj, sensorID) {
    // For a given timestep, current reading is an outlier if 
    // it is more than N times of standard deviations from the average 
    // of all the data points on a specific sensor ID
    
    let isSiteArrayRegular = ! Array.isArray(dataObj.nSites);

    if (debugFlag_dataflagger) {
        console.log("isArrayRegular = ", isSiteArrayRegular);
    }
    
    // compare the current reading to the sensor average
    let nTimesteps = dataObj.nTimes;
    let nSites;
    let distance;
    let distanceFromSD;
    let globalIndex = 0;
    let dataOnSensor = getDataOnSensor (dataObj,sensorID);
    let sensorAve = getAve(dataOnSensor);
    let sensorVar = getVar(dataOnSensor);
    let sensorSD = Math.sqrt(sensorVar);
    if (debugFlag_dataflagger) {
        console.log('all data on this sensor:', dataOnSensor);
        console.log('average on this sensor:', sensorAve);
        console.log('variance on this sensor:', sensorVar);
        console.log('SD on this sensor:', sensorSD);
    }

    for (ts=0; ts<nTimesteps; ts++) {

        if ( isSiteArrayRegular ) {
            nSites =  dataObj.nSites;
        } else {
            nSites = dataObj.nSites[ts];
        }

        for (site=0; site<nSites; site++) {
            let thisID       = dataObj.id[globalIndex];
            if (thisID == sensorID) {
                let thisData      = dataObj.variable[globalIndex];
                if (debugFlag_dataflagger) {
                    console.log(sensorID, thisData);
                }

                // get the distance between the current reading to the sensor mean 
                distance = Math.abs(thisData - sensorAve);
                distanceFromSD = distance / sensorSD;
                
                // apply the test
                if (distanceFromSD > flagParams.timesSDNum && thisData != flagParams.missingValue) {
                    let thisMsec      = dataObj.msec[globalIndex];
                    let thisTimestamp = dataObj.timestamp[globalIndex];
                    (flaggedIndices.outlierStat).push([ts, site, globalIndex, thisMsec, thisTimestamp]);
                    if (debugFlag_dataflagger) {
                    console.log(thisTimestamp,thisData,flaggedIndices.outlierStat) 
                    } 
                }
                
            }
            globalIndex += 1;
        }
    }
}

function testOutlierSpike(dataObj, sensorID) {
    // For a given timestep, current reading is an outlier if 
    // it is more than N times of standard deviations (calculated from the defined time window centered at the current reading) from the previous data
    // and also it is more than N times of standard deviations (calculated from the defined time window centered at the current reading) from the following data
    
    let isSiteArrayRegular = ! Array.isArray(dataObj.nSites);

    if (debugFlag_dataflagger) {
        console.log("isArrayRegular = ", isSiteArrayRegular);
    }

    // compare the current reading to the sensor average
    let nTimesteps = dataObj.nTimes;
    let nSites;
    let globalIndex = 0;
    // gather all the valid timeStamps on this sensor ID and loop through each one
    // exclude the first one and the last one
    let timestampsOnSensor = getTimestampsOnSensor (dataObj,sensorID);
    for (centerStep =1; centerStep < timestampsOnSensor.length-1;centerStep++){
        centerTimestamp = timestampsOnSensor[centerStep];
        for (ts=0; ts<nTimesteps; ts++) {

            if ( isSiteArrayRegular ) {
                nSites =  dataObj.nSites;
            } else {
            nSites = dataObj.nSites[ts];
            }

            for (site=0; site<nSites; site++) {
                let thisID        = dataObj.id[globalIndex];
                let thisTimestamp = dataObj.timestamp[globalIndex];
                
                if (thisID == sensorID && thisTimestamp==centerTimestamp) {
                    let thisData      = dataObj.variable[globalIndex];
                    let thisMsec      = dataObj.msec[globalIndex];
                    if (debugFlag_dataflagger) {
                        console.log("now the globalIndex is:",globalIndex);
                        console.log("Timestamp now:",thisTimestamp);
                        console.log(sensorID, thisData);
                    }
                    // get the data points array on the left side of the time window
                    let howManyOnRight = Math.trunc(flagParams.hoursNumTW/2);
                    let dataOnSensorInTWLeft = getDataOnSensorBeforeTimeStamp(dataObj,sensorID,thisMsec,Math.trunc(flagParams.hoursNumTW/2));
                    // check how many data points in the left side time window, if it is less than half of the time window length
                    // extend the right side time window so that the total time window still has the same length
                    if (dataOnSensorInTWLeft.length<Math.trunc(flagParams.hoursNumTW/2)){
                        howManyOnRight = flagParams.hoursNumTW - dataOnSensorInTWLeft.length;
                    }
                    // get the data points array on the right side of the time window
                    let dataOnSensorInTWRight = getDataOnSensorAfterTimeStamp(dataObj,sensorID,thisTimestamp,howManyOnRight);
                    // check how many data points in the right side time window, if it is less than half of the time window length
                    // need to re-collect the data points on the left side so that the total time window still has the same length
                    if (dataOnSensorInTWRight.length<Math.trunc(flagParams.hoursNumTW/2)){
                        let howManyOnLeft = flagParams.hoursNumTW - dataOnSensorInTWRight.length;
                        dataOnSensorInTWLeft = getDataOnSensorBeforeTimeStamp(dataObj,sensorID,thisMsec,howManyOnLeft);
                    }
                    let dataOnSensorInTWTotal = [...dataOnSensorInTWLeft, ...dataOnSensorInTWRight];
                    
                    let thisVarTotal = getVar(dataOnSensorInTWTotal);
                    let previousData = dataOnSensorInTWLeft[dataOnSensorInTWLeft.length-1];
                    let thisChangeLeft = Math.abs(thisData-previousData);
                    let thisTimesSDTWLeft = thisChangeLeft/Math.sqrt(thisVarTotal);
                    let nextData = dataOnSensorInTWRight[0];
                    let thisChangeRight = Math.abs(nextData-thisData);
                    let thisTimesSDTWRight = thisChangeRight/Math.sqrt(thisVarTotal);
                    let spikeDirection = (thisData>previousData)== (thisData>nextData)
                    if (spikeDirection && thisVarTotal>0 && thisTimesSDTWLeft > flagParams.timesSDNumTW && thisData !=flagParams.missingValue && thisTimesSDTWRight > flagParams.timesSDNumTW) {
                        (flaggedIndices.outlierSpike).push([ts, site, globalIndex, thisMsec, thisTimestamp]);

                       if (debugFlag_dataflagger) {
                           console.log('data points on the left:',dataOnSensorInTWLeft);
                           console.log('data points on the right:',dataOnSensorInTWRight);
                           console.log('data points in the total time window:',dataOnSensorInTWTotal);
                           console.log('variance for the total time window:', thisVarTotal);
                           console.log('previous data vlaue is:',previousData);
                           console.log('next data value is:',nextData);
                           console.log('data change on left:',thisChangeLeft);
                           console.log('data change on right:',thisChangeRight);
                           console.log(thisTimestamp,thisData,flaggedIndices.outlierSpike);  
                       } // if (debugFlag_dataflagger) loop end

                    }
                } // if (thisID==sensorID...) loop end
                globalIndex += 1;  
            }  // for (site=0;...) loop end
        }  // for (ts=0;...) loop end
    }  // for (centerStep=1;...) loop end

}  //testOutlierSpike function end

function testAboveConc(dataObj, sensorID) {
    // test if the current reading is above a user-defined threshold concentration  
    // if yes, flag the data points
    
    let isSiteArrayRegular = ! Array.isArray(dataObj.nSites);

    if (debugFlag_dataflagger) {
        console.log("isArrayRegular = ", isSiteArrayRegular);
    }
    
    // compare the current reading to the sensor average
    let nTimesteps = dataObj.nTimes;
    let nSites;
    let globalIndex = 0;

    for (ts=0; ts<nTimesteps; ts++) {

        if ( isSiteArrayRegular ) {
            nSites =  dataObj.nSites;
        } else {
            nSites = dataObj.nSites[ts];
        }

        for (site=0; site<nSites; site++) {
            let thisID       = dataObj.id[globalIndex];
            if (thisID == sensorID) {
                let thisData      = dataObj.variable[globalIndex];
                
                if (debugFlag_dataflagger) {
                    console.log("inside testAboveConc now:",flagParams.aboveConc);
                    console.log(sensorID, thisData);
                }
                
                // apply the test
                if (thisData > flagParams.aboveConc && thisData != flagParams.missingValue) {
                    let thisMsec      = dataObj.msec[globalIndex];
                    let thisTimestamp = dataObj.timestamp[globalIndex];
                    (flaggedIndices.aboveConc).push([ts, site, globalIndex, thisMsec, thisTimestamp]);
                    if (debugFlag_dataflagger) {
                    console.log("inside the testAboveConc if loop now:",thisData);
                    console.log(thisTimestamp,thisData,flaggedIndices.aboveConc) 
                    } 
                }
            }
            globalIndex += 1;
        }
    }
}

function testBelowConc(dataObj, sensorID) {
    // test if the current reading is below a user-defined threshold concentration  
    // if yes, flag the data points
    
    let isSiteArrayRegular = ! Array.isArray(dataObj.nSites);

    if (debugFlag_dataflagger) {
        console.log("isArrayRegular = ", isSiteArrayRegular);
    }
    
    // compare the current reading to the sensor average
    let nTimesteps = dataObj.nTimes;
    let nSites;
    let globalIndex = 0;

    for (ts=0; ts<nTimesteps; ts++) {

        if ( isSiteArrayRegular ) {
            nSites =  dataObj.nSites;
        } else {
            nSites = dataObj.nSites[ts];
        }

        for (site=0; site<nSites; site++) {
            let thisID       = dataObj.id[globalIndex];
            if (thisID == sensorID) {
                let thisData      = dataObj.variable[globalIndex];
                
                if (debugFlag_dataflagger) {
                    console.log("inside testBelowConc now:",flagParams.belowConc);
                    console.log(sensorID, thisData);
                }
                
                // apply the test
                if (thisData < flagParams.belowConc && thisData != flagParams.missingValue) {               
                    let thisMsec      = dataObj.msec[globalIndex];
                    let thisTimestamp = dataObj.timestamp[globalIndex];
                    (flaggedIndices.belowConc).push([ts, site, globalIndex, thisMsec, thisTimestamp]);
                    if (debugFlag_dataflagger) {
                    console.log("inside the testBelowConc if loop now:",thisData);
                    console.log(thisTimestamp,thisData,flaggedIndices.belowConc) 
                    } 
                }
            }
            globalIndex += 1;
        }
    }
}

function userInvalidate(dataObj, sensorID) {
    // For a given timestep, if it is within the time window defined by  
    // userInvalidate Start time and userInvalidate End time 
    // then it is flagged
    
    let isSiteArrayRegular = ! Array.isArray(dataObj.nSites);

    if (debugFlag_dataflagger) {
        console.log("isArrayRegular = ", isSiteArrayRegular);
    }
    
    // compare the current reading to the sensor average
    let nTimesteps = dataObj.nTimes;
    let nSites;
    let globalIndex = 0;
    let errorMessage = document.getElementById("flaggerErrorMessage");
    errorMessage.innerText = "*At least one of the entered time is outside of the time range for the sensorID or in a wrong format. Please check.*";
    let timestampsOnSensor = getTimestampsOnSensor (dataObj,sensorID);
    let goodStartTimeAll = [];
    let goodEndTimeAll = []
    for (N=0;N<flagParams.invalidateStartTime.length;N++){
      //console.log("text input for startTime is:",flagParams.invalidateStartTime[N]);
      //console.log("text input for endTime is:",flagParams.invalidateEndTime[N]);

      if (flagParams.invalidateStartTime[N] !== "" && flagParams.invalidateEndTime[N] !== "") { 
        let goodStartTime = checkTimeWithinRange(flagParams.invalidateStartTime[N],timestampsOnSensor);
    	let goodEndTime = checkTimeWithinRange(flagParams.invalidateEndTime[N],timestampsOnSensor);
    	goodStartTimeAll.push(goodStartTime);
        goodEndTimeAll.push(goodEndTime);
    	    if (debugFlag_dataflagger){
        	console.log("check if it is a goodStartTime:",goodStartTime);
        	console.log("check if it is a goodEndTime:",goodEndTime);
        	console.log("text input for startTime is:",flagParams.invalidateStartTime[N]);
        	console.log("text input for endTime is:",flagParams.invalidateEndTime[N]);
        	console.log("processed date for startTime is:",startTime);
    	     }
       }else if(flagParams.invalidateStartTime[N] == "" && flagParams.invalidateEndTime[N] !== ""){
              errorMessage.innerText = "*One of the entered time is empty. Please check.*";
              document.getElementById("flaggerErrorMessage").style.display = 'block';
              return;
       }else if(flagParams.invalidateStartTime[N] !== "" && flagParams.invalidateEndTime[N] == ""){
              errorMessage.innerText = "*One of the entered time is empty. Please check.*";
              document.getElementById("flaggerErrorMessage").style.display = 'block';
              return;
       }

    }//for loop end
    let allGoodStartTime = goodStartTimeAll.every(Boolean);
    let allGoodEndTime = goodEndTimeAll.every(Boolean);
    //console.log("check allGoodStartTime", allGoodStartTime);

    if(allGoodStartTime && allGoodEndTime){
       document.getElementById("flaggerErrorMessage").style.display = 'none';
    }else{
       document.getElementById("flaggerErrorMessage").style.display = 'block';
        return;
    }
    
    //YD added end
    for (ts=0; ts<nTimesteps; ts++) {

        if ( isSiteArrayRegular ) {
            nSites =  dataObj.nSites;
        } else {
            nSites = dataObj.nSites[ts];
        }

        for (site=0; site<nSites; site++) {
            let thisID       = dataObj.id[globalIndex];
            if (thisID == sensorID) {
                for (N=0;N<flagParams.invalidateStartTime.length;N++){
                    let startTime = new Date(flagParams.invalidateStartTime[N]);
                    let endTime = new Date(flagParams.invalidateEndTime[N]);
                    let thisTimestamp = dataObj.timestamp[globalIndex];
                    let thisTime      = new Date(thisTimestamp)
                    let diffFromStart = thisTime - startTime;
                    let diffFromEnd = thisTime - endTime;         
                    if (debugFlag_dataflagger) {
                    
                     console.log("time difference from start:",diffFromStart);
                     console.log("time difference from end:",diffFromEnd);
                     console.log("this time is:",thisTime);
                     console.log(sensorID, thisTimestamp);
                    }
                
                    // apply the test
                    if (diffFromStart>= 0 && diffFromEnd <= 0) {
                        let thisMsec = dataObj.msec[globalIndex];
                        (flaggedIndices.userInvalidated).push([ts, site, globalIndex, thisMsec, thisTimestamp]);
                        if (debugFlag_dataflagger) {
                        console.log(thisTimestamp,thisData,flaggedIndices.userInvalidated) 
                        } 
                    }
              //YD added end
              }// for flagParams.invalidateStartTime[] loop end
            } // if(thisID==sensorID)loop end  
            globalIndex += 1;
        }
    }
}

function getDataOnSensor(dataObj, sensorID) {
    // get all data into array on a specific sensor ID 
    // also remove those missing data points
    
    let isSiteArrayRegular = ! Array.isArray(dataObj.nSites);
    
    // buffer to store the previous N values
    let dataOnSensor = new Array();
    let nTimesteps = dataObj.nTimes;
    let nSites;
    let globalIndex = 0;
    for (ts=0; ts<nTimesteps; ts++) {

        if ( isSiteArrayRegular ) {
            nSites =  dataObj.nSites;
        } else {
            nSites = dataObj.nSites[ts];
        }

        for (site=0; site<nSites; site++) {
            let thisID       = dataObj.id[globalIndex];
            if (thisID == sensorID) {
                let thisData      = dataObj.variable[globalIndex];
                // gather all data on sensor for this sensorID
                   
                if (thisData != flagParams.missingValue){
                    dataOnSensor.push(thisData) 
                }
            }
            globalIndex += 1;
        }
    }
    if (debugFlag_dataflagger) {
      console.log("finishing up getDataOnSensor function:",sensorID, dataOnSensor);
    }
       return dataOnSensor;
}

function getTimestampsOnSensor(dataObj, sensorID) {
    // get all timestamps into array on a specific sensor ID 
    // also exclude those timestamps with missing data points
    
    let isSiteArrayRegular = ! Array.isArray(dataObj.nSites);
    
    // buffer to store the previous N values
    let timestampsOnSensor = new Array();
    let nTimesteps = dataObj.nTimes;
    let nSites;
    let globalIndex = 0;
    for (ts=0; ts<nTimesteps; ts++) {

        if ( isSiteArrayRegular ) {
            nSites =  dataObj.nSites;
        } else {
            nSites = dataObj.nSites[ts];
        }

        for (site=0; site<nSites; site++) {
            let thisID       = dataObj.id[globalIndex];
            if (thisID == sensorID) {
                let thisData      = dataObj.variable[globalIndex];
                let thisTimestamp = dataObj.timestamp[globalIndex];
                if (debugFlag_dataflagger) {
                    console.log("inside getTimestampsOnSensor function:",sensorID, thisData, thisTimestamp);
                }
                // gather all data on sensor for this sensorID
                   
                if (thisData != flagParams.missingValue){
                    timestampsOnSensor.push(thisTimestamp) 
                }
            }
            globalIndex += 1;
        }
    }
    if (debugFlag_dataflagger) {
      console.log("finishing up getTimestampsOnSensor function:",sensorID, timestampsOnSensor);
    }
       return timestampsOnSensor;
}

function getDataOnSensorBeforeTimeStamp(dataObj, sensorID,specificTimeStampMsec,howManyHours) {
    // get all data into array on a specific sensor ID before a specific timeStamp
    // within a time window defined by 'howManyHours' 
    // also remove those missing data points
    
    let isSiteArrayRegular = ! Array.isArray(dataObj.nSites);
    
    // buffer to store the previous values within the time window
    let dataOnSensorBeforeTimeStamp = new Array();
    let nTimesteps = dataObj.nTimes;
    let nSites;
    let Index = 0;
    for (ts=0; ts<nTimesteps; ts++) {

        if ( isSiteArrayRegular ) {
            nSites =  dataObj.nSites;
        } else {
            nSites = dataObj.nSites[ts];
        }

        for (site=0; site<nSites; site++) {
            let thisID       = dataObj.id[Index];
            let nowTimestamp = dataObj.timestamp[Index];
            let nowMsec      = dataObj.msec[Index];
            //let differenceInHours = getDiffHours(nowTimestamp,specificTimeStamp);
            let differenceInHours = getDiffHours(nowMsec,specificTimeStampMsec);
            if (thisID == sensorID && differenceInHours<=howManyHours && differenceInHours>0) {
                let thisData      = dataObj.variable[Index];
                if (debugFlag_dataflagger) {
                    console.log(sensorID, thisData,nowTimestamp);
                    console.log("differences from the center timestamp:",differenceInHours)
                }
                // push in the data points within the time window
                   
                if (thisData != flagParams.missingValue){
                    dataOnSensorBeforeTimeStamp.push(thisData);
                }
            }    
            Index += 1; 
        }
    }
       return dataOnSensorBeforeTimeStamp;
}

function getDataOnSensorAfterTimeStamp(dataObj, sensorID,specificTimeStamp,howManyHours) {
    // get all data into array on a specific sensor ID after a specific timeStamp
    // within a time window defined by 'howManyHours' 
    // also remove those missing data points
    
    let isSiteArrayRegular = ! Array.isArray(dataObj.nSites);
  
    // buffer to store the previous N values
    let dataOnSensorAfterTimeStamp = new Array();
    let nTimesteps = dataObj.nTimes;
    let nSites;
    let Index = 0;
    for (ts=0; ts<nTimesteps; ts++) {

        if ( isSiteArrayRegular ) {
            nSites =  dataObj.nSites;
        } else {
            nSites = dataObj.nSites[ts];
        }

        for (site=0; site<nSites; site++) {
            let thisID       = dataObj.id[Index];
            let nowTimestamp = dataObj.timestamp[Index];
            // only keep the data points on the right side and within the time window
            if (thisID == sensorID && nowTimestamp>specificTimeStamp && dataOnSensorAfterTimeStamp.length<howManyHours) {
                let thisData      = dataObj.variable[Index];
                if (debugFlag_dataflagger) {
                    console.log(sensorID, thisData);
                }
                   
                if (thisData != flagParams.missingValue){
                    dataOnSensorAfterTimeStamp.push(thisData) 
                }
                
            }
            Index += 1;
        }
    }
       return dataOnSensorAfterTimeStamp;
}


function flaggerParameterChanged(thisID) {

   if (! document.URL.endsWith("dataFlaggerTester_multiple_invalidate.html")) {
    let thisID   = thisID.id;
   }

    var invalidateWins = document.querySelectorAll('[id^="invalidateStart"]');

    if (debugFlag_dataflagger) {
    console.log('check number of invalidate time window rows:',invalidateWins.length) 
    }
  
    if (thisID == "constantNum") {
        let newValue = Number(document.getElementById(thisID).value);
        flagParams.constantRepeatNum = newValue;
    } else if (thisID == "missingNum") {
        let newValue = Number(document.getElementById(thisID).value);
        flagParams.missingRepeatNum = newValue;
    } else if (thisID == "outlierStatSDfactor") {
        let newValue = Number(document.getElementById(thisID).value);
        flagParams.timesSDNum = newValue;
    } else if (thisID == "outlierSpikeTimeWindow") {
        let newValue = Number(document.getElementById(thisID).value);
        flagParams.hoursNumTW = newValue;
    } else if (thisID == "outlierSpikeSDfactor") {
        let newValue = Number(document.getElementById(thisID).value);
        flagParams.timesSDNumTW = newValue;
    } else if (thisID == "aboveConcentration"){
        let newValue = Number(document.getElementById(thisID).value);
        flagParams.aboveConc = newValue;
    } else if (thisID == "belowConcentration"){
        let newValue = Number(document.getElementById(thisID).value);
        flagParams.belowConc = newValue;
    } else if (thisID == "invalidateStart"){
        let newText = document.getElementById(thisID).value;
        flagParams.invalidateStartTime[0] = newText; 
    } else if (thisID == "invalidateEnd"){
        let newText = document.getElementById(thisID).value;
        flagParams.invalidateEndTime[0] = newText; 
    } else if (thisID.startsWith('invalidateStart') && invalidateWins.length>1){
        let addedN = invalidateWins.length-1;
       	for (addedN=1;addedN<invalidateWins.length;addedN++){
           if (thisID ==("invalidateStart"+addedN)){
               let newText = document.getElementById(thisID).value;
               flagParams.invalidateStartTime[addedN] = newText;  
           }
        }
    } else if (thisID.startsWith('invalidateEnd') && invalidateWins.length>1){
        let addedN = invalidateWins.length-1;
       	for (addedN=1;addedN<invalidateWins.length;addedN++){
           if (thisID ==("invalidateEnd"+addedN)){
               let newText = document.getElementById(thisID).value;
               flagParams.invalidateEndTime[addedN] = newText;  
           }
        }

    } else {
        alert("parameterChanged() handler not implemented for " + thisID);
    }

    //console.log(flagParams);
    if (! document.URL.endsWith("dataFlaggerTester_multiple_invalidate.html")) {
        updatePlots();
        updateSettings(thisID);
    }
}

//Yadong added
////////////////////////////////////////
// more sub-functions used for each test
////////////////////////////////////////

// sub-function to test if all elements in an array are equal
const allEqual = (input) =>{
    const base = input[0];
    return input.every(element => element===base);
}

// sub-function to calculate the average of an array
const getAve = (arr) =>{
    let sum = 0;
    for (i=0; i<arr.length; i++){
        sum += arr[i];
    }
    return sum/arr.length;
}

// sub-function to calculate the variance of an array
const getVar = (arr) =>{
    let sum = 0;
    for (i=0; i<arr.length; i++){
        sum += arr[i];
    }
    const ave= sum/arr.length;
    let variance = 0;
    arr.forEach(element => {
        variance += ((element-ave)*(element-ave)); 
    });
    return variance/arr.length;
}

// sub-function to calculate the differences in hours between two timestamps
const getDiffHours = (timestampMsec1,timestampMsec2) =>{
    const difference = timestampMsec2 - timestampMsec1;
    const hoursDiff = Math.floor(difference/1000/60/60);
    return hoursDiff;
}

// sub-function to check if a timestamp string is within the range of all the timestamps on a sensor

const checkTimeWithinRange = (specifictimestamp,timestampsOnSensor) =>{
    const includeTime = timestampsOnSensor.includes(specifictimestamp);
    if (includeTime){
    return true;
    }else{
         const sortedTimestamps = timestampsOnSensor.sort();
         //console.log("check the sorted timestamps:", sortedTimestamps);
         //console.log("inside checkTimeWithinRange now,check specifictimestamp string:", specifictimestamp);
         const thistime = new Date(specifictimestamp)
         const firsttime = new Date(sortedTimestamps[0])
         const lasttime = new Date(sortedTimestamps[sortedTimestamps.length-1])
         if (thistime >= firsttime && thistime <= lasttime){
          return true;
         }else{
          return false;
         }
    } 
    
}

