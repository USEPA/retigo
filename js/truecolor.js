
// truecolor.js
// Used for loading truecolor imagery from NASA server

var tcHeight = 4096;
var tcWidth  = 4096;

function lon_to_EPSG3857(inputLon) {
    // convert longitude in degrees to Web Mercator (EPSG:3857) X coordinate

    var R       = 6378137.0; // WGS84 ellipsoid semi-major axis in meters
    var deg2rad = Math.PI / 180.0;
    var refLon  = 0.0;

    var x =  R * deg2rad * (inputLon - refLon);
    return x;
}

function lat_to_EPSG3857(inputLat) {
    // convert latitude in degrees to Web Mercator (EPSG:3857) Y coordinate

    var R       = 6378137.0; // WGS84 ellipsoid semi-major axis in meters
    var deg2rad = Math.PI / 180.0;

    var operand = (deg2rad * inputLat / 2.0) + (Math.PI / 4.0);
    var y       =  R * Math.log(Math.tan(operand));
    return y;
}


function getTrueColor(source, date, minLat, minLon, maxLat, maxLon) {

    // source = 'MODISTERRA', "MODISAQUA', or 'VIIRS'
    // date, e.g. 2018-07-04
    // bbox components in lat/lon
    
    // Set Layer
    var layer = '';
    if (source === 'MODISTERRA') {
        layer = "MODIS_Terra_CorrectedReflectance_TrueColor";
    } else if (source === 'MODISAQUA') {
        layer = "MODIS_Aqua_CorrectedReflectance_TrueColor";
    } else if (source === 'VIIRS') {
        layer = "VIIRS_SNPP_CorrectedReflectance_TrueColor";
    }

    // Convert bbox components in lat/lon to web mercator coordinates
    var x0     = lon_to_EPSG3857(minLon);
    var x1     = lon_to_EPSG3857(maxLon);
    var y0     = lat_to_EPSG3857(minLat);
    var y1     = lat_to_EPSG3857(maxLat);
    var extent = x0.toFixed(6) + ',' + y0.toFixed(6) + ',' + x1.toFixed(6) + ',' + y1.toFixed(6);


    // construct url for web mercator image
    var tc_url = "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=" + layer + "&STYLES=&FORMAT=image%2Fpng&TRANSPARENT=true&HEIGHT=" + tcHeight + "&WIDTH=" + tcWidth + "&SRS=EPSG:3857&TIME=" + date + "&bbox=" + extent;
    //xconsole.log(tc_url);

    let tcSatelliteBounds = new google.maps.LatLngBounds(
                                                       new google.maps.LatLng(minLat, minLon), //SW
                                                       new google.maps.LatLng(maxLat, maxLon)  //NE
                                                       );    
    // add new overlay
    viirsTruecolorOverlay = new emvlOverlay(tcSatelliteBounds, tc_url, map, viirsTruecolorOpacity, viirsTruecolorZindex);
    //busyMessageQueueMapRemove(thisMessage);
    //busyHide('map');


}



