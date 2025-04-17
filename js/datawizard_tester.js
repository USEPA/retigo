// test certain aspects of the datawizard


// test time conversion

let timeChecks =
    [{name:"unix",             value:"1602386517",          expectedValue:"2020-10-11T03:21:57.00+00:00", timezone:"GMT", startDate:""},
     {name:"igor",             value:"1602386517",          expectedValue:"1954-10-11T03:21:57.00+00:00", timezone:"GMT", startDate:""},
     {name:"excelSerial-1900", value:"43657.023486",        expectedValue:"2019-07-11T06:33:49.19+00:00", timezone:"CST", startDate:""}, // CST
     {name:"excelSerial-1904", value:"33857.023486",        expectedValue:"1996-09-10T04:33:49.19+00:00", timezone:"EDT", startDate:""}, // EDT
     {name:"matlab",           value:"729055.68",           expectedValue:"1996-02-01T00:19:12.00+00:00", timezone:"PST", startDate:""}, // PST
     {name:"hhmmss",           value:"16:20:00",            expectedValue:"2023-04-20T16:20:00.00+00:00", timezone:"GMT", startDate:"4/20/2023"}, // GMT
     {name:"string1a",         value:"8/3/2018-12:43:23",   expectedValue:"2018-08-03T12:43:23.00+00:00", timezone:"GMT", startDate:""}, // GMT
     {name:"string1b",         value:"8/4/2018 12:43:23",   expectedValue:"2018-08-04T12:43:23.00+00:00", timezone:"GMT", startDate:""}, // GMT
     {name:"string1c",         value:"8-5-2018 12:43:23",   expectedValue:"2018-08-05T12:43:23.00+00:00", timezone:"GMT", startDate:""}, // GMT
     {name:"string2a",         value:"2023/11/06-02:23:45", expectedValue:"2023-11-06T02:23:45.00+00:00", timezone:"GMT", startDate:""}, // GMT
     {name:"string2b",         value:"2023/12/06 02:23:45", expectedValue:"2023-12-06T02:23:45.00+00:00", timezone:"GMT", startDate:""}, // GMT
     {name:"string2c",         value:"2023-02-20 02:23:45", expectedValue:"2023-02-20T02:23:45.00+00:00", timezone:"GMT", startDate:""}, // GMT
    ];


function run_timechecks() {
    console.log("Running time checks...");
    for (i=0; i<timeChecks.length; i++) {
        thisCheck = timeChecks[i];

        document.getElementById("wiz-dialog-timeConvert-timezone").value = thisCheck.timezone.toLowerCase();
        conversion = wizConvertTimestamp(thisCheck.value, thisCheck.name);

        console.log("test " + i + ":", "expected:" + thisCheck.expectedValue, "conversion:" + conversion, thisCheck.expectedValue == conversion);

    }
    console.log("Done");


}
              
