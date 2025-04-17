#
# retigo_utilities.R
#
# Purpose: This file contain various utility function to support RETIGO:
#
#          - export_retigo:  Export data in the RETIGO file format.
#
#          - dms_to_decimal: Convert lat/lon degree, minutes, seconds
#                            to decimal degrees.
#
#          - utm_to_latlon:  Convert Universal Transverse Mercator (UTM)
#                            coordingates to lat/lon decimal degrees.
#                            Note: requires external RGDAL library.  
#
#          - create_ISO8601_fromUnixTime:
#                            Construct an ISO8601 timestamp given seconds
#                            since Jan 1, 1970 GMT (UNIX epoch). 
#
#          - create_ISO8601_fromIgorTime:
#                            Construct an ISO8601 timestamp given seconds
#                            since Jan 1, 1904 GMT (IGOR epoch). 
#
#          - create_ISO8601_fromExcel:
#                            Construct an ISO8601 timestamp given an Excel 
#                            serial time, a date system (1900 or 1904) and
#                            a GMT offset.
#
#          - create_ISO8601_fromMatlab:
#                            Construct an ISO8601 timestamp given a Matlab
#                            serial time and a GMT offset.
#
#          - create_ISO8601_fromComponents:
#                            Construct an ISO8601 timestamp given individual date/time
#                            components (YYYY, MM, DD, hh, mm, ss, gmtOffset)
#
# Author: Matt Freeman freeman.matt@epa.gov
#
###############################################################################

# Know if this file has been sourced
UTIL_RETIGO <- T


export_retigo <- function(fileName, df) {
#
# Purpose: Given a dataframe, export the data into a RETIGO csv file.
#
# Assumptions:
#
#   1) The dataframe contains:
#        - Timestamps in ISO-8601 format.
#        - At least one scalar variable.
#        - Longitude in decimal degrees.
#        - Latitude in decimal degrees.
#        - ID string.
#        - Column names that correspond to the RETIGO header, e.g.:
#           - Timestamp(UTC)
#           - EAST_LONGITUDE(deg)
#           - NORTH_LATITUDE(deg)
#           - ID(-)
#           - Variable_name(units)
#        - No extraneous data.
#
###############################################################################
  
  Npoints = nrow(df)
  Ncols	  = ncol(df)

  # get column indices
  colTime = grep("Timestamp\\(UTC\\)", colnames(df), ignore.case=TRUE)
  colLat  = grep("NORTH_LATITUDE\\(deg\\)", colnames(df), ignore.case=TRUE)
  colLon  = grep("EAST_LONGITUDE\\(deg\\)", colnames(df), ignore.case=TRUE)
  colId   = grep("ID\\(-\\)", colnames(df), ignore.case=TRUE)
  colInds <- 1:Ncols
  colData = colInds[colInds != colTime &
                    colInds != colLat  &
                    colInds != colLon  &
                    colInds != colId]

  # check column names
  msg<-""
  if (length(colTime) == 0) {msg<-paste("Timestamp column not found.\n",
                                      "Looking for Timestamp(UTC)?\n",
                                      "Are the timestamps in ISO-8601 format",
                                      " (e.g. 2012-08-17T07:27:00-04:00)?\n",
                                       sep="")}
  if (length(colLat)  == 0) {msg<-paste("Latitude column not found.\n",
                                     "Looking for NORTH_LATITUDE(deg)\n",
                                     sep="")}           
  if (length(colLon)  == 0) {msg<-paste("Longitude column not found.\n",
                                     "Looking for EAST_LONGITUDE(deg)\n",
                                     sep="")}
  if (length(colId)   == 0) {msg<-paste("ID column not found.\n",
                                     "Looking for ID(-)\n",
                                     sep="")}   
  if (length(colData) == 0) {msg<-paste("Data column(s) not found.\n",
                                     sep="")}                      


  # check timestamps to be sure they are consistent with ISO-8601.
  # note: this is not a definitive test. Only the format is being
  # checked.
  pattern <- '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}-\\d{2}:\\d{2}'
  for (ind in 1:Npoints) {
    if (grepl(pattern, df[ind, colTime]) == FALSE) {
      msg<-paste("Timestamp is invalid: ", df[ind, colTime], sep="")
    }
  }

  if (nchar(msg) != 0) {
    stop(msg)
  } else {
    # all good... write the file
    write.csv(df[, c(colTime, colLon, colLat, colId, colData)], fileName, 
              row.names=FALSE, quote=FALSE)
  }

} # end export_retigo
#------------------------------------------------------------------------------



create_ISO8601_fromUnixTime <- function(secondsSinceUnixEpoch) {
#
# Purpose: Given seconds since Jan 1, 1970 GMT (UNIX epoch), construct
#          the corresponding ISO-8601 compliant timestamp.
#
# Inputs:  secondsSinceUnixEpoch = (double) seconds
#
# Assumptions: 
#
###############################################################################

  # check input data types
  if (typeof(secondsSinceUnixEpoch) != "double") {
    stop("secondsSinceUnixEpoch should be a double")
  }


  rTime <- as.POSIXct(secondsSinceUnixEpoch, tz='GMT', origin="1970-01-01 GMT")

  timestamp <- format(rTime, format="%Y-%m-%dT%H:%M:%S-00:00")                               
  return(timestamp)

}



create_ISO8601_fromIgorTime <- function(secondsSinceIgorEpoch) {
#
# Purpose: Given seconds since Jan 1, 1904 GMT (IGOR epoch), construct
#          the corresponding ISO-8601 compliant timestamp.
#
# Inputs:  secondsSinceIgorEpoch = (double) seconds
#
# Assumptions: 
#
###############################################################################

  # check input data types
  if (typeof(secondsSinceIgorEpoch) != "double") {
    stop("secondsSinceIgorEpoch should be a double")
  }


  rTime <- as.POSIXct(secondsSinceIgorEpoch, tz='GMT', origin="1904-01-01 GMT")

  timestamp <- format(rTime, format="%Y-%m-%dT%H:%M:%S-00:00")                               
  return(timestamp)

}



create_ISO8601_fromExcel <- function(excelTime, dateSystemYear, hourOffsetFromGMT) {
#
# Purpose: Given Excel serial time, a date system, and a GMT offset, construct the 
#          corresponding ISO-8601 compliant timestamp.
#
# Inputs:  excelTime         = (double) seconds
#          dateSystemYear    = (integer) either 1900 or 1904
#                              see https://support.office.com/en-us/article/date-systems-in-excel-e7fe7167-48a9-4b96-bb53-5612a800b487
#          hourOffsetFromGMT = (integer) hour
#
# Assumptions: 
#
###############################################################################

  # check input data types
  if (typeof(excelTime) != "double") {
    stop("excelTime should be a double")
  }
  if (typeof(dateSystemYear) != "integer") {
    stop("dateSystemYear should be an integer")
  }
  if (typeof(hourOffsetFromGMT) != "integer") {
    stop("hourOffsetFromGMT should be an integer")
  }

  # make sure inputs are in the proper range
  if (dateSystemYear != 1900 && dateSystemYear != 1904) {
      stop("dateSystemYear should either be 1900 (Windows) or 1904 (Older Macs).")
  }
  if (hourOffsetFromGMT < -12 || hourOffsetFromGMT > 14) {
    stop("hourOffsetFromGMT is out of range.")
  }

  # First create a POSIXct time relatve to the UNIX epoch, then 
  # reformat it to an ISO8601 datetime

  seconds_per_hour <- 3600
  seconds_per_day  <- 86400
  excel_offset_seconds = (1970 - dateSystemYear) * 365 * seconds_per_day;

  # There were 17 leap days between the epoch and Jan 1 1970, inclusive. True for both date systems.
  excel_offset_seconds = excel_offset_seconds + (17 * seconds_per_day) 

  # Correct for the fact that the Excel epoch is January 0, 1900
  excel_offset_seconds = excel_offset_seconds + ( 1 * seconds_per_day) 

  if (dateSystemYear == 1900) {
    excel_offset_seconds = excel_offset_seconds + ( 1 * seconds_per_day) # Excel thinks 1900 was a leap year even though it wasn't
    # NOTE: Excel thinks 1900 was a leap year even though it wasn't! See: http://support.microsoft.com/kb/214326
    #       01/00/1900 = 0
    #       01/01/1900 = 1
  } 

  totalSeconds = (excelTime * seconds_per_day) - excel_offset_seconds - (hourOffsetFromGMT * seconds_per_hour)

  rTime <- as.POSIXct(totalSeconds, tz='GMT', origin="1970-01-01 GMT")


  # Reformat the POSIXct time to an ISO8601 datetime
  timestamp <- format(rTime, format="%Y-%m-%dT%H:%M:%S-00:00")                               

  return(timestamp)

}


create_ISO8601_fromMatlab <- function(matlabTime, hourOffsetFromGMT) {
#
# Purpose: Given Matlab serial time and a GMT offset, construct the 
#          corresponding ISO-8601 compliant timestamp.
#
# Inputs:  matlabTime        = (double) seconds
#          hourOffsetFromGMT = (integer) hour
#
# Assumptions: 
#
###############################################################################

  # check input data types
  if (typeof(matlabTime) != "double") {
    stop("matlabTime should be a double")
  }
  if (typeof(hourOffsetFromGMT) != "integer") {
    stop("hourOffsetFromGMT should be an integer")
  }

  # make sure inputs are in the proper range
  if (hourOffsetFromGMT < -12 || hourOffsetFromGMT > 14) {
    stop("hourOffsetFromGMT is out of range.")
  }

  # First create a POSIXct time relatve to the UNIX epoch, then 
  # reformat it to an ISO8601 datetime

  seconds_per_hour <- 3600
  seconds_per_day  <- 86400
  matlab_offset_seconds = (1970 - 0000) * 365 * seconds_per_day

  # There were 478 leap days between 0000 and 1970, inclusive
  matlab_offset_seconds = matlab_offset_seconds + (478 * seconds_per_day)

  # Matlab's epoch is 00/00/0000, which is one day less than what really exists
  matlab_offset_seconds = matlab_offset_seconds + (  1 * seconds_per_day) 

  totalSeconds = (matlabTime * seconds_per_day) - matlab_offset_seconds - (hourOffsetFromGMT * seconds_per_hour)

  rTime <- as.POSIXct(totalSeconds, tz='GMT', origin="1970-01-01 GMT")


  # Reformat the POSIXct time to an ISO8601 datetime
  timestamp <- format(rTime, format="%Y-%m-%dT%H:%M:%S-00:00")                               

  return(timestamp)

}


create_ISO8601_fromComponents <- function(YYYY, MM, DD, hh, mm, ss, gmtOffset) {
#
# Purpose: Given individual date and time components, construct
#          the corresponding ISO-8601 compliant timestamp.
#
# Inputs:  YYYY       = (integer) 4 digit year
#          MM         = (integer) month (1 = Jan)
#          DD         = (integer) day
#          hh         = (integer) hour (0 - 23)
#          mm         = (integer) minute (0 - 59)
#          ss         = (integer) seconds (0 - 59)
#          gmtOffset  = (double) Timezone offset from GMT in fractional hours (EDT = -4.0)
#
# Assumptions: 
#
###############################################################################

  # define valid data ranges
  range <- list("min_YYYY" = 0,
                "max_YYYY" = 3000,            
                "min_MM"   = 1,
                "max_MM"   = 12,
                "min_DD"   = 1,
                "max_DD"   = 31, # global max
                "min_hh"   = 0,
                "max_hh"   = 23,
                "min_mm"   = 0,
                "max_mm"   = 59,
                "min_ss"   = 0,
                "max_ss"   = 59)


  # check input data types
  if (typeof(YYYY) != "integer") {
    stop("YYYY should be a 4 digit integer")
  }
  if (typeof(MM) != "integer") {
    stop("MM should be an integer")
  }
  if (typeof(DD) != "integer") {
    stop("DD should be an integer")
  }    
  if (typeof(hh) != "integer") {
    stop("hh should be an integer")
  }
  if (typeof(mm) != "integer") {
    stop("mm should be an integer")
  }
  if (typeof(ss) != "integer") {
    stop("ss should be an integer")
  }
  if (typeof(gmtOffset) != "double") {
    stop("gmt_offset should be a double")
  }


  # make sure inputs are in the proper range
  if (YYYY < range$min_YYYY | YYYY > range$max_YYYY ) {
    stop("YYYY is out of range")
  }
  else if (MM < range$min_MM | MM > range$max_MM ) {
    stop("MM is out of range")
  }
  else if (DD < range$min_DD | DD > range$max_DD ) {
    stop("DD is out of range")
  }
  else if (hh < range$min_hh | hh > range$max_hh ) {
    stop("hh is out of range")
  }
  else if (mm < range$min_mm | mm > range$max_mm ) {
    stop("mm is out of range")
  }
  else if (ss < range$min_ss | ss > range$max_ss ) {
    stop("ss is out of range")
  }


  if (gmtOffset > 0) {
    offset_sign = "+"
  } else {
    offset_sign = "-"
  }

  gmtOffsetHours   <- trunc(gmtOffset)
  gmtOffsetMinutes <- (gmtOffset - gmtOffsetHours) * 60.0


  timestamp <- sprintf("%04d-%02d-%02dT%02d:%02d:%02d%s%02d:%02d", 
                          YYYY, 
                          MM, 
                          DD, 
                          hh, 
                          mm, 
                          ss, 
                          offset_sign, 
                          abs(gmtOffsetHours),
                          abs(gmtOffsetMinutes))

  return(timestamp)

} # end create_ISO8601
#------------------------------------------------------------------------------





dms_to_decimal <- function(degrees, minutes, seconds) {
#
# Purpose: Given a latitude or longitude coordinate in 
#          degrees, minutes, seconds (DMS), return the coordinate 
#          in decimal degrees.
#
# Assumptions: - The input DMS coordinate is valid.
#
###############################################################################

  return(degrees + minutes/60.0 + seconds/3600.0)

} # end dms_to_decimal
#------------------------------------------------------------------------------





utm_to_latlon <- function(easting, northing, zone, datum) {
#
# Purpose: Given Universal Transverse Mercator (UTM) coordinates, return the 
#          latitude and longitude in decimal degrees. This function requires the 
#          rgdal package:
#          https://cran.r-project.org/web/packages/rgdal/index.html
#
# Assumptions: The input UTM coordinates are valid.
#
###############################################################################

  rgdalLoaded = require("rgdal", quietly = FALSE)
  
  if (rgdalLoaded == TRUE) {
    utmcoord<-SpatialPoints(cbind(easting, northing), 
                            proj4string=CRS(paste("+proj=utm +datum=",datum," +zone=",zone,sep="")))
    lonlatobj<-spTransform(utmcoord,CRS(paste("+proj=longlat +datum=",datum, sep="")))

    # strip out the lon/lat values and return a simple vector
    lonlat <- vector("numeric", 2)
    lonlat[1] <- lonlatobj@coords[1]
    lonlat[2] <- lonlatobj@coords[2]
    return(lonlat)
  } else {
    msg<-paste("\n\nLibrary package RGDAL not loaded.\n",
               "utm_to_latlon() failed\n", sep="")
    warning(msg)
  }

} # end utm_to_latlon
#------------------------------------------------------------------------------
