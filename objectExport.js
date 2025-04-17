
function objectExport(myObj, filename) {
    // Export an object to a file.
    //
    // Note that this function must be
    // called manually. There is no direct hook
    // in the main retigo code.

    try {

        let myJSON = JSON.stringify(myObj);
        
        
        var blob = new Blob([myJSON], {type:"text/plain;charset=utf-8"});        
        saveAs(blob, filename);

        console.log("wrote", filename);
        return true;
        
    } catch (e) {
        print("File export is not supported by this browser.");
        return false;
    }

}

function hack_airnow(myobj) {

    // Called manually to create data for testing
    // with the dataflagger module.


    // Hack 1:
    // A dataset with various number of consecutive constant valid values on some sensorIDs
    // Such as: 7 constant values on Sensor A; 8 constant values on Sensor B; 9 constant values on Sensor C

    // Hack 2:
    // A dataset with various number of long sequential missing values (-9999) on some sensorIDs

    // Hack 3:
    // An hourly dataset with longer time range (more than a couple days)
        
    // Hack4:
    // A dataset with a few spikes on a specific sensorID 
    // Such as : A spike is defined as a data value that is 10 times higher than both
    // data values at its left neighbor and its right neighbor.  

    
    hacks = [{sensorNum:0, tStart:23, tConsecutive:7,  hackType:"constant"},
             {sensorNum:1, tStart:52, tConsecutive:8,  hackType:"constant"},
             {sensorNum:2, tStart:32, tConsecutive:9,  hackType:"constant"},
             {sensorNum:3, tStart:44, tConsecutive:10, hackType:"missing"},
             {sensorNum:4, tStart:12, tConsecutive:8,  hackType:"missing"},
             {sensorNum:5, tStart:61, tConsecutive:1,  hackType:"spike"}
            ];

    //hacks = [{sensorNum:0, tStart:103, tConsecutive:7,  hackType:"constant"},
    //         {sensorNum:1, tStart:252, tConsecutive:8,  hackType:"constant"},
    //         {sensorNum:2, tStart:132, tConsecutive:9,  hackType:"constant"},
    //         {sensorNum:3, tStart:44,  tConsecutive:10, hackType:"missing"},
    //         {sensorNum:4, tStart:220, tConsecutive:8,  hackType:"missing"},
    //         {sensorNum:5, tStart:115, tConsecutive:1,  hackType:"spike"}
    //        ];

    for (hackInd=0; hackInd<hacks.length; hackInd++) {
    
        //tStart = 23;
        //tConsecutive = 7;
        //sensorNum = 0;
        let sensorNum    = hacks[hackInd].sensorNum;
        let tStart       = hacks[hackInd].tStart;
        let tConsecutive = hacks[hackInd].tConsecutive;
        let hackType     = hacks[hackInd].hackType;

        for (t=0; t<myobj.nTimes; t++) {
            for (n=0; n<myobj.nSites; n++) {
                if (n == sensorNum && t>=tStart && t<tStart+tConsecutive ) {
                    console.log("id=", myobj.id[t*myobj.nSites + n]);
                    if (hackType == "constant") {
                        hackValue = myobj.variable[tStart*myobj.nSites + n];
                    } else if (hackType == "missing") {
                        hackValue = -9999;
                    } else if (hackType == "spike") {
                        hackValue = 10 * myobj.variable[tStart*myobj.nSites + n];
                    }
                    myobj.variable[t*myobj.nSites + n] = hackValue;
                }
            }
        }
    }
}
