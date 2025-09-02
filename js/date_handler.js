
function create_dateObjectUTC(dateStringUTC) {
  // create a javascript date object from a date string of the form "2012-07-18T15:51:16.12-00:00"

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  if (dateStringUTC) {

      var dLength = dateStringUTC.length;
      
      // for date string of the form "2012-07-18T15:51:16-0000"
      var YYYY     = dateStringUTC.substr(0,4);
      var MM       = dateStringUTC.substr(5,2);
      var DD       = dateStringUTC.substr(8,2);
      var hh       = dateStringUTC.substr(11,2);
      var mm       = dateStringUTC.substr(14,2);
      var ss       = dateStringUTC.substr(17,2);
      var ms;
      
      if (dLength == 29) {
	  ms = dateStringUTC.substr(20,3);
	  parseloc = 23;
	  ms_multiplier = 1;
      } else if (dLength == 28) {
	  ms = dateStringUTC.substr(20,2);
	  parseloc = 22;
	  ms_multiplier = 10; // only two decimal places were specified
      } else {
	  ms = "00";
	  parseloc = 19;
	  ms_multiplier = 0;
      }
      var tzd_sign = dateStringUTC.substr(parseloc,1);
      var tzd_hh   = dateStringUTC.substr(parseloc+1,2);
      var tzd_mm   = dateStringUTC.substr(parseloc+4,2);
      if (tzd_sign == '+') {
	  tzd_hh = -1 * tzd_hh
	      tzd_mm = -1 * tzd_mm
	      }
      
      //debug(YYYY);
      //debug(months[Number(MM)-1]);
      //debug(DD);
      //debug(hh);
      //debug(mm);
      //debug(ss);
      //debug(tzd_hh);
      //debug(tzd_mm);
      
      //var thisDate = new Date(months[Number(MM)-1] + " " + DD + " "  + YYYY + " " + hh +":" + mm + ":" + ss + " GMT");
      var thisDateUTC = new Date(0);
      thisDateUTC.setUTCFullYear(YYYY);
      thisDateUTC.setUTCMonth(Number(MM)-1);
      thisDateUTC.setUTCDate(DD);
      thisDateUTC.setUTCHours(hh);
      thisDateUTC.setUTCMinutes(mm);
      thisDateUTC.setUTCSeconds(ss);
      thisDateUTC.setUTCMilliseconds(ms*ms_multiplier);

      // correct for timezone offset
      var secs = thisDateUTC.getTime();
      thisDateUTC.setTime( secs + (tzd_hh*60*60*1000) + (tzd_mm*60*1000) );
      
      return thisDateUTC;
  }
}


//function create_datestring(dateObjectUTC) {
//  // create a displayable date string from a date object in UTC (like what is created by create_dateObjectUTC()
// 
//  // This function always returns GMT timezone. 
//  // You may want to use convertUTC_to_timezone() below!!!!
//
//  return dateObjectUTC.toUTCString();
//
//}


function get_date(dateObjectUTC) {
  // used to return just the date (used when exporting C-FERST)

  // convert to msec since Jan 1 1970
  var msec = dateObjectUTC.getTime();
  
  // apply offset
  var this_houroffset = 0 // GMT
  var converted_msec = msec - (this_houroffset * 60 * 60 * 1000);

  var d = new Date();
  d.setTime(converted_msec); 

  var zulu_year  = d.getUTCFullYear().toString();    
  var zulu_month = zeroPad(d.getUTCMonth()+1,2).toString();   
  var zulu_day   = zeroPad(d.getUTCDate(), 2).toString();     
  var datestring = zulu_month + "/" + zulu_day + "/" + zulu_year;
  return datestring;
}

function get_yyyymmdd(dateObjectUTC) {
  // used to return just the date

  // convert to msec since Jan 1 1970
  var msec = dateObjectUTC.getTime();
  
  // apply offset
  var this_houroffset = 0 // GMT
  var converted_msec = msec - (this_houroffset * 60 * 60 * 1000);

  var d = new Date();
  d.setTime(converted_msec); 

  var zulu_year  = d.getUTCFullYear().toString();    
  var zulu_month = zeroPad(d.getUTCMonth()+1,2).toString();   
  var zulu_day   = zeroPad(d.getUTCDate(), 2).toString();     
  var datestring = zulu_year + "-" + zulu_month + "-" + zulu_day;
  return datestring;
}

function get_time(dateObjectUTC) {
  // used to return just the time (used when exporting C-FERST)

  // convert to msec since Jan 1 1970
  var msec = dateObjectUTC.getTime();
  
  // apply offset
  var this_houroffset = 0 // GMT
  var converted_msec = msec - (this_houroffset * 60 * 60 * 1000);

  var d = new Date();
  d.setTime(converted_msec); 

  var zulu_hh = zeroPad(d.getUTCHours(), 2).toString();    
  var zulu_mm = zeroPad(d.getUTCMinutes(), 2).toString();
  var zulu_ss = zeroPad(d.getUTCSeconds(), 2).toString();
  var z_ms    = d.getUTCMilliseconds();
  // we want to represent seconds to two decimal places, so we will drop the ones place
  z_ms = Math.floor(z_ms/10.0); // use floor so that 999 becomes 99 instead of 100
  zulu_ms = zeroPad(z_ms, 2).toString();
  var timestring = zulu_hh + ":" + zulu_mm + ":" + zulu_ss + '.' + zulu_ms;
  return timestring;
}





function convertUTC_to_timezone(dateObjectUTC, desired_timezone, output_type, minmax_flag, hour_shift) {
  // Take a date object in UTC and convert it to a known US timezone. Return a date string in one of several formats:
  //   output_type = "pretty"        -> string of form Wed, 18 Jul 2012 15:44:00 GMT
  //   output_type = "UTC-zulu"      -> string of form 2012-07-18T15:44:00-00:00Z"
  //   output_type = "ISO8601"       -> string of form 2012-07-18T15:44:00-00:00-00:00"
  //   output_type = "milliseconds"  -> string of milliseconds since midnight Jan 1, 1970.
  //
  //   hour_shift is used to shift airnow timestamps to be aligned with retigo. E.g, airnow timestamps
  //   are referenced from the beginning of the averaging period, whereas retigo's averages are
  //   referenced to the end of the averaging period. 

  if (hour_shift === undefined) {
      hour_shift = 0;
  }

  var timezone_name       = ["GMT", "EST", "CST", "MST", "PST", "EDT", "CDT", "MDT", "PDT"]; 
  var timezone_houroffset = [   0,     5,     6,     7,     8,     4,     5,     6,     7];

  var monthname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var dayname = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; 

  var matching_index = where(timezone_name, desired_timezone);
  
  var this_timezone   = timezone_name[matching_index];
  var this_houroffset = timezone_houroffset[matching_index] + hour_shift;

  // convert to msec since Jan 1 1970
  var msec = dateObjectUTC.getTime();
  
  // apply offset
  var converted_msec = msec - (this_houroffset * 60 * 60 * 1000);

  var d = new Date();
  d.setTime(converted_msec); 

  // represent date as string (will have GMT timezone due to javascript's toUTCString method)
  var datestring_bogus_timezone = d.toUTCString();

  switch (output_type) {
  case "pretty":  
    // strip off the GMT timezone and put in decimal seconds plus the correct timezone
    //var datestring = datestring_bogus_timezone.replace(' GMT', this_timezone);

    var zulu_year  = d.getUTCFullYear().toString();    
    var zulu_month = zeroPad(d.getUTCMonth()+1,2).toString();   
    var zulu_day   = zeroPad(d.getUTCDate(), 2).toString();     
    var zulu_hh    = zeroPad(d.getUTCHours(), 2).toString();  
    var zulu_mm    = zeroPad(d.getUTCMinutes(), 2).toString();
    var zulu_ss    = zeroPad(d.getUTCSeconds(), 2).toString();
    var z_ms       = d.getUTCMilliseconds();
    // we want to represent seconds to two decimal places, so we will drop the ones place
    z_ms = Math.floor(z_ms/10.0); // use floor so that 999 becomes 99 instead of 100
    zulu_ms = zeroPad(z_ms, 2).toString();
    var datestring = dayname[d.getUTCDay()] + ', ' 
      + zulu_day + ' ' 
      + monthname[d.getUTCMonth()] + ' ' 
      + zulu_year + ' ' 
      + zulu_hh + ':' 
      + zulu_mm + ':' 
      + zulu_ss + '.' + zulu_ms + ' ' + this_timezone;

    break;
    case "pretty2":  
    // strip off the GMT timezone and put in decimal seconds plus the correct timezone
    //var datestring = datestring_bogus_timezone.replace(' GMT', this_timezone);

    var zulu_year  = d.getUTCFullYear().toString();    
    var zulu_month = zeroPad(d.getUTCMonth()+1,2).toString();   
    var zulu_day   = zeroPad(d.getUTCDate(), 2).toString();     
    var zulu_hh    = zeroPad(d.getUTCHours(), 2).toString();  
    var zulu_mm    = zeroPad(d.getUTCMinutes(), 2).toString();
    var zulu_ss    = zeroPad(d.getUTCSeconds(), 2).toString();
    var z_ms       = d.getUTCMilliseconds();
    // we want to represent seconds to two decimal places, so we will drop the ones place
    z_ms = Math.floor(z_ms/10.0); // use floor so that 999 becomes 99 instead of 100
    zulu_ms = zeroPad(z_ms, 2).toString();
    var datestring = (d.getUTCMonth()+1) + '/' 
      + zulu_day + '/' 
      + zulu_year + ' ' 
      + zulu_hh + ':' 
      + zulu_mm + ':' 
      + zulu_ss + '.' + zulu_ms + ' ' + this_timezone;

    break;
  case "UTC-zulu":
    var zulu_year  = d.getUTCFullYear().toString();    
    var zulu_month = zeroPad(d.getUTCMonth()+1,2).toString();   
    var zulu_day   = zeroPad(d.getUTCDate(), 2).toString();     
    var zulu_hh    = zeroPad(d.getUTCHours(), 2).toString();    
    if (minmax_flag == "min")  { zulu_mm = "00"; }
    if (minmax_flag == "max")  { zulu_mm = "59"; }
    if (minmax_flag == "null") { zulu_mm = zeroPad(d.getUTCMinutes(), 2).toString(); }
    var datestring = zulu_year + "-" + zulu_month + "-" + zulu_day + "T" + zulu_hh + ":" + zulu_mm + ":00Z";
    break;
  case "ISO8601-roundToMinute":
    var zulu_year  = d.getUTCFullYear().toString();    
    var zulu_month = zeroPad(d.getUTCMonth()+1,2).toString();   
    var zulu_day   = zeroPad(d.getUTCDate(), 2).toString();     
    var zulu_hh    = zeroPad(d.getUTCHours(), 2).toString();    
    if (minmax_flag == "min")  { zulu_mm = "00"; }
    if (minmax_flag == "max")  { zulu_mm = "59"; }
    if (minmax_flag == "null") { zulu_mm = zeroPad(d.getUTCMinutes(), 2).toString(); }
    var datestring = zulu_year + "-" + zulu_month + "-" + zulu_day + "T" + zulu_hh + ":" + zulu_mm + ":00-0000";
    break;
  case "ISO8601":
    var zulu_year  = d.getUTCFullYear().toString();    
    var zulu_month = zeroPad(d.getUTCMonth()+1,2).toString();   
    var zulu_day   = zeroPad(d.getUTCDate(), 2).toString();     
    var zulu_hh    = zeroPad(d.getUTCHours(), 2).toString();    
    //if (minmax_flag == "min")  { zulu_mm = "00"; }
    //if (minmax_flag == "max")  { zulu_mm = "59"; }
    //if (minmax_flag == "null") { zulu_mm = zeroPad(d.getUTCMinutes(), 2).toString(); }
    var zulu_mm    = zeroPad(d.getUTCMinutes(), 2).toString();
    var zulu_ss    = zeroPad(d.getUTCSeconds(), 2).toString();
    var datestring = zulu_year + "-" + zulu_month + "-" + zulu_day + "T" + zulu_hh + ":" + zulu_mm + ":" + zulu_ss + "-0000";
    break;  
  case "milliseconds":
    var datestring = converted_msec.toString();
    break;

  }
  return datestring;

}



