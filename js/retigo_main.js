
$(document).ready(function(){
    initialize();
    
    // add listeners 
    document.getElementById('my_min').addEventListener("focusout", validate_number);
    document.getElementById('my_max').addEventListener("focusout", validate_number);
    
    // make sure page is scrolled to top
    window.scrollTo(0, 0);
    
    document.getElementById("extendBlocks").addEventListener("keypress", function (evt) {
       
	// prevent all typing
	evt.preventDefault();
	
    });

    dataFlaggerInitParams();
    restoreSettings();

    // set defaults for merged variables
    document.getElementById("merge_min_AirnowO3").value           = oAirnowOzone.min;
    document.getElementById("merge_max_AirnowO3").value           = oAirnowOzone.max;
    document.getElementById("merge_min_AirnowPM25").value         = oAirnowPM25.min;
    document.getElementById("merge_max_AirnowPM25").value         = oAirnowPM25.max;
    document.getElementById("merge_min_AirnowPM10").value         = oAirnowPM10.min;
    document.getElementById("merge_max_AirnowPM10").value         = oAirnowPM10.max;
    document.getElementById("merge_min_AirnowCO").value           = oAirnowCO.min;
    document.getElementById("merge_max_AirnowCO").value           = oAirnowCO.max;
    document.getElementById("merge_min_AirnowNO2").value          = oAirnowNO2.min;
    document.getElementById("merge_max_AirnowNO2").value          = oAirnowNO2.max;
    document.getElementById("merge_min_AirnowSO2").value          = oAirnowSO2.min;
    document.getElementById("merge_max_AirnowSO2").value          = oAirnowSO2.max;
    document.getElementById("merge_min_SurfmetTemperature").value = oSurfmetTemperature.min;
    document.getElementById("merge_max_SurfmetTemperature").value = oSurfmetTemperature.max;
    document.getElementById("merge_min_SurfmetPressure").value    = oSurfmetPressure.min;
    document.getElementById("merge_max_SurfmetPressure").value    = oSurfmetPressure.max;
    document.getElementById("merge_min_SurfmetWindSpeed").value   = oSurfmetWindSpeed.min;
    document.getElementById("merge_max_SurfmetWindSpeed").value   = oSurfmetWindSpeed.max;
    document.getElementById("merge_min_SurfmetWindDirection").value   = oSurfmetWindDirection.min;
    document.getElementById("merge_max_SurfmetWindDirection").value   = oSurfmetWindDirection.max;
    document.getElementById("merge_min_PurpleairPM25").value      = oPurpleairPM25.min;
    document.getElementById("merge_max_PurpleairPM25").value      = oPurpleairPM25.max;
    //document.getElementById("merge_min_MySensor").value           = oMySensor.curMin;
    //document.getElementById("merge_max_MySensor").value           = oMySensor.curMax;
    document.getElementById("merge_min_MySensor0").value           = mySensorArray[0].curMin;
    document.getElementById("merge_max_MySensor0").value           = mySensorArray[0].curMax;
    document.getElementById("merge_min_MySensor1").value           = mySensorArray[1].curMin;
    document.getElementById("merge_max_MySensor1").value           = mySensorArray[1].curMax;
    document.getElementById("merge_min_MySensor2").value           = mySensorArray[2].curMin;
    document.getElementById("merge_max_MySensor2").value           = mySensorArray[2].curMax;
    document.getElementById("merge_min_MySensor3").value           = mySensorArray[3].curMin;
    document.getElementById("merge_max_MySensor3").value           = mySensorArray[3].curMax;
    document.getElementById("merge_min_MySensor4").value           = mySensorArray[4].curMin;
    document.getElementById("merge_max_MySensor4").value           = mySensorArray[4].curMax;


    // data flagger stuff
    document.getElementById("plot1_colorbar1").style.backgroundColor = flagger_colorConstant;
    document.getElementById("plot1_colorbar2").style.backgroundColor = flagger_colorLongMissing;
    document.getElementById("plot1_colorbar3").style.backgroundColor = flagger_colorOutlierStat;
    document.getElementById("plot1_colorbar4").style.backgroundColor = flagger_colorOutlierSpike;
    document.getElementById("plot1_colorbar5").style.backgroundColor = flagger_colorAboveConc;
    document.getElementById("plot1_colorbar6").style.backgroundColor = flagger_colorBelowConc;
    document.getElementById("plot1_colorbar7").style.backgroundColor = flagger_colorInvalidated;

    
    //kml_airnowicon_imgarray    = new Array();
    kml_purpleairicon_imgarray = new Array();
    //kml_mysensoricon_imgarray  = new Array();
    kml_miscicon_imgarray      = new Array();
    //createKmlAirnowiconImages();
    createKmlPurpleairiconImages();
    //createKmlMysensoriconImages();
    createKmlMisciconImages();
});



  var debugOn = false;

  var hostname = window.location.hostname;		      
  var imageserver;
  var rsigserver;
  if (hostname == 'maple.hesc.epa.gov') {
    rsigserver = 'https://maple.hesc.epa.gov/cgi-bin/rsigserver?';	
  } else {	      
    rsigserver = 'https://ofmpub.epa.gov/rsig/rsigserver?';
  }

  imageserver = rsigserver + 'retigo/stable/';  
	

  var setDefaultRadio = true; // for setting the default variable when the file is first read

  var kmlLayer = "";
  var kml_export_array;           // for exported kml content
  var kml_canvas_array;           // for referring to active colorbars in kml export process
  var kml_colorbar_imgarray;      // for holding rendered colorbar images
  var kml_usericon_imgarray;      // for holding rendered user data icon images
  //var kml_airnowicon_imgarray;    // for holding rendered airnow icon images
  var kml_purpleairicon_imgarray; // for holding rendered purpleair icon images
  //var kml_mysensoricon_imgarray;  // for holding rendered mysensor icon images
  var kml_miscicon_imgarray;      // for holding rendered misc icon images with no colormap (hms, metar)
  var kml_fname = "";
  var kml_hasElevations = false;
  var finalizeKML_timer;
  var kmlExportMessage = "Exporting KML/KMZ";

  var lastpos = 0;
  var nearestpos = 0;
  var lastAqsUpdatepos = -1;
  var missing_value = -9999; // user data that is missing
  var fill_value    = -8888; // fill value for when files are merged
  var selected_timezone = 'GMT'; // default

  //file readers	
  var fr_file1 = null;
  var fr_file2 = null;
  var file1LoadedFlag = false;
  var file2LoadedFlag = false;
  var checkFileLoad;
var mergedFilestream = {result:""}; // mimics fr_file*, but for concatenated filestreams

  //
  var projectList = "";
  var keywordList = "";

  //user data
  var sortedData1;
  var oUserdata = new Object();
  // init arrays (first index is for blocks 0=avg data, 1=blocked data)
  oUserdata.timestamp  = new Array();
  oUserdata.msec       = new Array();
  oUserdata.lon        = new Array();
  oUserdata.lat        = new Array();
  oUserdata.id         = new Array();
  oUserdata.variable   = new Array();
  oUserdata.varname    = new Array();
  oUserdata.min        = new Array(); // min for dataset
  oUserdata.max        = new Array(); // max for dataset
  oUserdata.mymin      = new Array(); // min set by user
  oUserdata.mymax      = new Array(); // max set by user
  oUserdata.show1      = new Array(); // for cropping by lat/lon 
  oUserdata.show2      = new Array(); // for subseting by ID
  oUserdata.loaded     = new Array();
  oUserdata.idList     = new Array(); // list of all IDs in dataset
  oUserdata.idName     = new Array(); // name of ID checkboxes
  oUserdata.fileLinesA = "";
  oUserdata.delimiter  = "";
  oUserdata.name       = "userdata";
  oUserdata.flagger    = ""; 
  oUserdata.flaggedIndices = "";               // returned info from the dataflagger module
  oUserdata.flagged_constant_msec        = []; // same info as above, but optimized for excluding data from plots 
  oUserdata.flagged_longMissing_msec     = []; 
  oUserdata.flagged_outlierStat_msec     = []; 
  oUserdata.flagged_outlierSpike_msec    = []; 
  oUserdata.flagged_aboveConc_msec       = []; 
  oUserdata.flagged_belowConc_msec       = []; 
  oUserdata.flagged_userInvalidated_msec = []; 


  var oStatsHourly         = new Object(); // statistical info for user variables
  var oStatsHourlyExternal = new Object(); // statistical info for external variables (Airnow, etc)
  var oStatsNative         = new Object(); // statistical info at native time resolution for user variables


  var selected_block = 0; // default
  var lastCheckedTimeBlock = 0;  // default
  var forceTimeblockRadio  = false; // force checkboxes to act as radio buttons under certain conditions
  var oTimeblock = new Object();
  oTimeblock.indStart      = []; // index for beginning of nth timeblock 
  oTimeblock.indEnd        = []; // index for end of nth timeblock
  oTimeblock.timstampStart = []; // timestamp corresponding to indStart
  oTimeblock.timstampEnd   = []; // timestamp corresponding to indEnd

  var oHeaderColumn1 = new Object(); 
  oHeaderColumn1.timestamp = -1; // for fr1  
  oHeaderColumn1.longitude = -1; // for fr1  
  oHeaderColumn1.latitude  = -1; // for fr1  
  oHeaderColumn1.id        = -1; // for fr1  
  oHeaderColumn1.wind_magnitude = -1; // for fr1  
  oHeaderColumn1.wind_direction = -1; // for fr1  
  oHeaderColumn1.data      = []; // for fr1
  var oHeaderColumn2 = new Object(); 
  oHeaderColumn2.timestamp = -1; // for fr2  
  oHeaderColumn2.longitude = -1; // for fr2  
  oHeaderColumn2.latitude  = -1; // for fr2  
  oHeaderColumn2.id        = -1; // for fr2  
  oHeaderColumn2.wind_magnitude = -1; // for fr2  
  oHeaderColumn2.wind_direction = -1; // for fr2  
  oHeaderColumn2.data      = []; // for fr2

  mySensorHeaderArray = new Array(5);
  //var oHeaderMySensor = new Object(); 
  //oHeaderMySensor.timestamp = -1;
  //oHeaderMySensor.longitude = -1;
  //oHeaderMySensor.latitude  = -1;
  //oHeaderMySensor.id        = -1;
  //oHeaderMySensor.wind_magnitude = -1;
  //oHeaderMySensor.wind_direction = -1;
  //oHeaderMySensor.data      = [];
  for (i=0; i<mySensorHeaderArray.length; i++) {
      thisMySensorHeader                = new Object();
      thisMySensorHeader.timestamp      = -1;
      thisMySensorHeader.longitude      = -1;
      thisMySensorHeader.latitude       = -1;
      thisMySensorHeader.id             = -1;
      thisMySensorHeader.wind_magnitude = -1;
      thisMySensorHeader.wind_direction = -1;
      thisMySensorHeaderdata            = []; 
      mySensorHeaderArray[i]            = thisMySensorHeader; 
  }
  //oHeaderMySensor = mySensorHeaderArray[0]; // HACK... keep things happy for now

  var repository_fileList;

  // define blocktypes
  var blocktype_avg = 0;
  var blocktype_blk = 1;

  var oFR_merged = new Object();
  oFR_merged.data = "";
  oFR_merged.nlines = []; // number of lines from each file (not including header)
  oFR_merged.nvars  = []; // number of variables from each file
  //var merge_temparray = new Array();

  var oFR_mergedBlock = new Object();
  oFR_mergedBlock.data = "";
  oFR_mergedBlock.nlines = []; // number of lines from each file (not including header)
  oFR_mergedBlock.nvars  = []; // number of variables from each file
  //var merge_temparray = new Array();
	  

  // AIRNow
  oAirnowOzone = new Object();
  oAirnowOzone.min = 0.0;  // default
  oAirnowOzone.max = 120.0; // default
  oAirnowOzone.imgArray = new Array();
  oAirnowOzone.nImgsLoaded = 0;
  oAirnowOzone.handle = "airnow_ozone";

  oAirnowPM25 = new Object();
  oAirnowPM25.min = 0.0;  // default
  oAirnowPM25.max = 60.0; // default
  oAirnowPM25.imgArray = new Array();
  oAirnowPM25.nImgsLoaded = 0;
  oAirnowPM25.handle = "airnow_pm25";
  oAirnowPM25.selectedSiteID = "";

  oAirnowPM10 = new Object();
  oAirnowPM10.min = 0.0;  // default
  oAirnowPM10.max = 60.0; // default
  oAirnowPM10.imgArray = new Array();
  oAirnowPM10.nImgsLoaded = 0;
  oAirnowPM10.handle = "airnow_pm10";
  oAirnowPM10.selectedSiteID = "";

  oAirnowCO = new Object();
  oAirnowCO.min = 0.0;  // default
  oAirnowCO.max = 1.0;  // default
  oAirnowCO.imgArray = new Array();
  oAirnowCO.nImgsLoaded = 0;
  oAirnowCO.handle = "airnow_co";
  oAirnowCO.selectedSiteID = "";

  oAirnowNO2 = new Object();
  oAirnowNO2.min = 0.0;   // default
  oAirnowNO2.max = 60.0;  // default
  oAirnowNO2.imgArray = new Array();
  oAirnowNO2.nImgsLoaded = 0;
  oAirnowNO2.handle = "airnow_no2";
  oAirnowNO2.selectedSiteID = "";

  oAirnowSO2 = new Object();
  oAirnowSO2.min = 0.0;   // default
  oAirnowSO2.max = 20.0;  // default
  oAirnowSO2.imgArray = new Array();
  oAirnowSO2.nImgsLoaded = 0;
  oAirnowSO2.handle = "airnow_so2";
  oAirnowSO2.selectedSiteID = "";

  // SURFMET 
  oSurfmetTemperature   = new Object();
  oSurfmetTemperature.min = -10.0; // default
  oSurfmetTemperature.max = 40.0;  // default
  oSurfmetTemperature.selectedSiteID = "";

  oSurfmetPressure      = new Object();
  oSurfmetPressure.min = 900.0;  // default
  oSurfmetPressure.max = 1200.0; // default
  oSurfmetPressure.selectedSiteID = "";

  oSurfmetWindSpeed     = new Object();
  oSurfmetWindSpeed.min = 0.0;  // default
  oSurfmetWindSpeed.max = 20.0; // default
  oSurfmetWindSpeed.selectedSiteID = "";

  oSurfmetWindDirection = new Object();
  oSurfmetWindDirection.min = 0.0;  // default
  oSurfmetWindDirection.max = 360.0; // default
  oSurfmetWindDirection.selectedSiteID = "";

  // Met info
  oMetInfo = new Object();

  // MySensor
  //oMySensor               = new Object();
  ////oMySensor.name        = "mysensor"
  ////oMySensor.fr          = null;
  ////oMySensor.loadedFlag  = false;
  ////oMySensor.min         = 0.0;   // default
  ////oMySensor.max         = 100.0; // default
  //oMySensor.timestamp     = new Array();
  //oMySensor.lon           = new Array();
  //oMySensor.lat           = new Array();
  //oMySensor.id            = new Array();
  //oMySensor.allVariables  = new Array(); // holds all variables
  //oMySensor.variable      = new Array(); // holds currently selected variable (for compatibility with Airnow, PurpleAir, etc)
  //oMySensor.varnames      = new Array();
  //oMySensor.curMin        = 0.0;         // user min for currently selected variable
  //oMySensor.curMax        = 100.0;       // user max for currently selected variable
  //oMySensor.minArray      = new Array(); // user min for each variable
  //oMySensor.maxArray      = new Array(); // user max for each variable
  ////oMySensor.mymin      = new Array(); // min set by user
  ////oMySensor.mymax      = new Array(); // max set by user
  //oMySensor.show1         = new Array(); // for cropping by lat/lon 
  //oMySensor.show2         = new Array(); // for subseting by ID
  //oMySensor.loaded        = new Array();
  //oMySensor.idList        = new Array(); // list of all IDs in dataset
  //oMySensor.idName        = new Array(); // name of ID checkboxes
  //oMySensor.fileLinesA    = "";
  //oMySensor.delimiter     = "";
  //oMySensor.name          = "mysensor";
  //oMySensor.curSelectedindex = 0;
  //oMySensor.curVarname    = "";
  //oMySensor.min           =  oMySensor.curMin; // for compatibility with other merged data
  //oMySensor.max           =  oMySensor.curMax; // for compatibility with other merged data
mySensorArray = new Array(5);
for (i=0; i<mySensorArray.length; i++) {
    thisMySensor = new Object();
    thisMySensor.imgArray = new Array();
    thisMySensor.nImgsLoaded = 0;
    initMySensorObject(thisMySensor);
    mySensorArray[i] = thisMySensor;
    mySensorArray[i].name = "mysensor" + i;
}
//oMySensor = mySensorArray[0]; // HACK... keep things happy for now

  // PurpleAir
  isPAkeyValid   = false;
  oPurpleairPM25 = new Object();
  oPurpleairPM25.min = 0.0;   // default
  oPurpleairPM25.max = 120.0; // default
  oPurpleairPM25.selectedSiteID = "";

  // VIIRS AOD
  viirsAOD_uniqueID      = ""; 
  satelliteOverlay       = new Object();
  lastViirsAODDate       = "";
  viirsMinVal            = 0.1;
  viirsMaxVal            = 0.5
  viirsDateList          = new Array(); // list of VIIRS data which has been loaded for this session
  viirsAodOpacity        = 0.7;
  viirsAodZindex         = 10;

  // VIIRS truecolor
  viirsTruecolor_uniqueID   = ""; 
  viirsTruecolorOverlay     = new Object();
  lastViirsTruecolorDate    = "";
  viirsTruecolorDateList    = new Array(); // list of VIIRS truecolor imagery which has been loaded for this session
  viirsTruecolorLoadedFlag  = false;
  viirsTruecolorOpacity     = 0.7;
  viirsTruecolorZindex      = 0;

  // Tropomi NO2
  tropomiNO2_uniqueID    = ""; 
  tropomiOverlay         = new Object();
  lastTropomiNO2Date     = "";
  tropomiNO2MinVal       = 0.0;
  tropomiNO2MaxVal       = 10000000000000000 // 1e16
  tropomiNO2DateList     = new Array(); // list of TROPOMI NO2 data which has been loaded for this session
  tropomiNO2LoadedFlag   = false;
  tropomiNO2Opacity      = 0.7;
  tropomiNO2Zindex       = 10;

  // Tempo NO2
  tempoNO2_uniqueID    = ""; 
  tempoOverlay         = new Object();
  lastTempoNO2Date     = "";
  tempoNO2MinVal       = 0.0;
  tempoNO2MaxVal       = 10000000000000000 // 1e16
  tempoNO2DateList     = new Array(); // list of TEMPO NO2 data which has been loaded for this session
  tempoNO2LoadedFlag   = false;
  tempoNO2Opacity      = 0.7;
  tempoNO2Zindex       = 10;

  // HMS
  oHmsFire   = new Object();


  // parameters
  var graph_height = 300; // make sure these match the plot divs below
  var graph_width  = 600; // make sure these match the plot divs below

  // colorbar
  var jg;
  var color_table;
  var cbStartX = 15;
  var cbStartY = 20;
  var nextColorbarVerticalPos = 85; // for keeping track of colorbar placement
  var viirsColorTable = new Array();
  var tropomiNO2ColorTable = new Array();
  var tempoNO2ColorTable = new Array();
  const color_table_stdgamma2 = ['#000000', '#000043', '#000087', '#0000D0', '#1C00EA', '#51009E', '#540057', '#950011', '#DE0000', '#FF2500', '#FF6D1C', '#FFA347', '#FFA300', '#A3A300', '#E5E623', '#FFFF50', '#FFFF7A', '#FFFFA7', '#FFFFD1', '#FFFFFF'];
  const color_table_bluered = ['#000083', '#0000B3', '#0000E7', '#001BFF', '#004FFF', '#0087FF', '#00BBFF', '#00EFFF', '#23FFDB', '#57FFA7', '#8FFF6F', '#C3FF3B', '#FBFF03', '#FFCF00', '#FF9B00', '#FF6300', '#FF2F00', '#F60000', '#BD0000', '#830000'];
  const color_table_bluemono = ['#99ccff', '#8cc3fc', '#80b9f8', '#73b0f4', '#68a6f1', '#5c9ded', '#5093e8', '#4589e4', '#3a80e0', '#2f76db', '#236cd6', '#1763d0', '#0859cb', '#004fc5', '#0044be', '#003ab7', '#002fb0', '#0023a9', '#0015a1', '#000099'];
  const color_table_viridis = ['#450d54', '#481568', '#482677', '#453781', '#3f4788', '#39558c', '#32648e', '#2d708e', '#277d8e', '#238a8d', '#1f968b', '#20a386', '#29af7f', '#3cbc75', '#56c667', '#74d055', '#94d840', '#b8de29', '#dce317', '#fde725'];
  const color_table_colorsafe = ['#000000', '#150088', '#2d00d8', '#461fd6', '#5732d4', '#6542d2', '#7052d0', '#7a60ce', '#937ac5', '#a795bb', '#BFBE6B', '#c9c866', '#d2d360', '#dcdd59', '#e5e852', '#eff249', '#f8fd3e', '#fffd89', '#fffec5', '#ffffff'];

  const color_table_stdgamma2_inverted = [...color_table_stdgamma2].reverse(); // deep copy
  const color_table_viridis_inverted   = [...color_table_viridis].reverse();   // deep copy
  const color_table_colorsafe_inverted = [...color_table_colorsafe].reverse(); // deep copy

  var color_table   = color_table_bluered;    // default
  var N_colors      = 20;                     // default
  var concSymbolDir = 'conc_symbols_bluered'; // default
  var concSymbolSet = 'bluered';              // default

  // general colors
  var color_LightBlue    = "#EBF2F7";
  var color_red          = "#925a17";
  var color_gray         = "#7F7F7F";
  var color_polyline     = color_red;

  // colors for 2D plots
  var plotColorLightblue   = "#66B2FF";
  var plotColorDarkblue    = "#0066CD";
  var plotColorRed         = "#CC0000";
  var plotColorGreen       = "#66CC00";
  var plotColorOrange      = "#FF8000";
  var plotColorBlack       = "#000000";
  var plotColorMaroon      = "#990000";
  var plotColorGray90      = "#E5E5E5";
  var plotColorGray80      = "#CCCCCC";
  var plotColorGray70      = "#B3B3B3";
  var plotColorGray60      = "#999999";
  var plotColorGray50      = "#7F7F7F";
  var plotColorGray40      = "#666666";
  var plotColorGray30      = "#4D4D4D";
  var plotColorGray20      = "#333333";
  var plotColorGray10      = "#1A1A1A";

var plotColorGray        = "#DDDDDD";

  // colors for merged data
  var aqsOzoneColormap  = 'bluered';  // default
  var aqsPM25Colormap   = 'bluered';  // default
  var aqsPM10Colormap   = 'bluered';  // default
  var aqsCOColormap     = 'bluered';  // default
  var aqsNO2Colormap    = 'bluered';  // default
  var aqsSO2Colormap    = 'bluered';  // default
  var purpleairColormap = 'bluered';  // default
  var mysensorColormap  = ['bluered', 'bluered', 'bluered', 'bluered', 'bluered'];  // default
  

  // default settings in the settings tab
  var settings = {}
  settings.fontSize                = 12;
  settings.plotPrimaryColor        = plotColorLightblue;
  settings.plotPrimaryColorIndex   = 0; // ensure index corresponds to color above
  settings.plotSecondaryColor      = plotColorMaroon;
  settings.plotSecondaryColorIndex = 3; // ensure index corresponds to color above
  settings.plotPrimaryOpacity      = 100;
  settings.plotSecondaryOpacity    = 100;
  settings.plotPrimaryStyle        = "Points";
  settings.plotPrimaryStyleIndex   = 0; // ensure index corresponds to style above
  settings.plotSecondaryStyle      = "Points";
  settings.plotSecondaryStyleIndex = 0; // ensure index corresponds to style above
  settings.plotFilledSymbolFlag    = false;
  settings.plotLogAxisFlag         = false;
  settings.plotDataColorsFlag      = false;
  settings.flaggerConstantRepeatNum      = 8;
  settings.flaggerMissingRepeatNum       = 8;
  settings.flaggerMissingValue           = -9999;
  settings.flaggerOutlierStatSDfactor    = 4;
  settings.flaggerOutlierSpikeTimeWindow = 12;
  settings.flaggerOutlierSpikeSDfactor   = 6;
  settings.flaggerAboveConc              = 100;
  settings.flaggerBelowConc              = 0;
  settings.flaggerUserInvalidateStart    = "";
  settings.flaggerUserInvalidateEnd      = "";

  var updateOptionalFlag = true;

  // marker array	
  var allLatLng          = [];
  var idLatLng           = []; // array which will hold separate arrays of lat/lng point for each ID present in all files
  var connectLatLng      = []; // special array used for connecting line to avoid discontinuous regions being connected
  var singleMarker       = [];
  var fastMarker         = [];
  // for AQS PM25 markers
  var AqsPM25FastMarker      = [];
  var AqsPM25Layer           = [];
  var AqsPm25LabelFastMarker = [];
  var AqsPM25LabelLayer      = [];
  var AqsPM25Tooltip         = [];
  var AqsPM25LastClosestTimeIndex = 0;

  // for AQS PM10 markers
  var AqsPM10FastMarker      = [];
  var AqsPM10Layer           = [];
  var AqsPm10LabelFastMarker = [];
  var AqsPM10LabelLayer      = [];
  var AqsPM10Tooltip         = [];
  var AqsPM10LastClosestTimeIndex = 0;

  // for AQS Ozone markers
  var AqsOzoneFastMarker      = [];
  var AqsOzoneLayer           = [];
  var AqsOzoneLabelFastMarker = [];
  var AqsOzoneLabelLayer      = [];
  var AqsOzoneTooltip         = [];
  var AqsOzoneLastClosestTimeIndex = 0;
  // for AQS CO markers
  var AqsCOFastMarker      = [];
  var AqsCOLayer           = [];
  var AqsCOLabelFastMarker = [];
  var AqsCOLabelLayer      = [];
  var AqsCOTooltip         = [];
  var AqsCOLastClosestTimeIndex = 0;
  // for AQS NO2 markers
  var AqsNO2FastMarker      = [];
  var AqsNO2Layer           = [];
  var AqsNO2LabelFastMarker = [];
  var AqsNO2LabelLayer      = [];
  var AqsNO2Tooltip         = [];
  var AqsNO2LastClosestTimeIndex = 0;
  // for AQS SO2 markers
  var AqsSO2FastMarker      = [];
  var AqsSO2Layer           = [];
  var AqsSO2LabelFastMarker = [];
  var AqsSO2LabelLayer      = [];
  var AqsSO2Tooltip         = [];
  var AqsSO2LastClosestTimeIndex = 0;
  // for all AQS markers 
  var AQSbbox            = "";
  // for Surfmet Temperature markers
  var SurfmetTemperatureFastMarker      = [];
  var SurfmetTemperatureLayer           = [];
  var SurfmetTemperatureLabelFastMarker = [];
  var SurfmetTemperatureLabelLayer      = [];
  var SurfmetTemperatureTooltip         = [];
  var SurfmetTemperatureLastClosestTimeIndex = 0;
  // for Surfmet Pressure markers
  var SurfmetPressureFastMarker      = [];
  var SurfmetPressureLayer           = [];
  var SurfmetPressureLabelFastMarker = [];
  var SurfmetPressureLabelLayer      = [];
  var SurfmetPressureTooltip         = [];
  var SurfmetPressureLastClosestTimeIndex = 0;
  // for Surfmet WindSpeed markers
  var SurfmetWindSpeedFastMarker      = [];
  var SurfmetWindSpeedLayer           = [];
  var SurfmetWindSpeedLabelFastMarker = [];
  var SurfmetWindSpeedLabelLayer      = [];
  var SurfmetWindSpeedTooltip         = [];
  var SurfmetWindSpeedLastClosestTimeIndex = 0;
  // for Surfmet WindDirection markers
  var SurfmetWindDirectionFastMarker      = [];
  var SurfmetWindDirectionLayer           = [];
  var SurfmetWindDirectionLabelFastMarker = [];
  var SurfmetWindDirectionLabelLayer      = [];
  var SurfmetWindDirectionTooltip         = [];
  var SurfmetWindDirectionLastClosestTimeIndex = 0;
  // for all Surfmet markers 
  var SurfmetShowLabelFlag   = true;
  var Surfmetbbox            = "";
  // for Purpleair PM25 markers
  var PurpleairPM25FastMarker      = [];
  var PurpleairPM25Layer           = [];
  var PurpleairPM25LabelFastMarker = [];
  var PurpleairPM25LabelLayer      = [];
  var PurpleairPM25Tooltip         = [];
  var PurpleairPM25LastClosestTimeIndex = 0;
  // for all Purpleair markers 
  var PurpleairShowLabelFlag   = true;
  var Purpleairbbox            = "";

// for MySensor markers
var allMySensorFastMarkers            = new Array(5);
var allMySensorLayers                 = new Array(5);
var allMySensorLabelFastMarkers       = new Array(5);
var allMySensorLabelLayers            = new Array(5);
var allMySensorTooltips               = new Array(5);
var allMySensorLastClosestTimeIndexes = new Array(5);
var allMySensorShowLabelFlags         = new Array(5);
var allMySensorbboxes                 = new Array(5);
for (i=0; i<allMySensorFastMarkers.length; i++) {
    allMySensorFastMarkers[i]            = [];
    allMySensorLayers[i]                 = [];
    allMySensorLabelFastMarkers[i]       = [];
    allMySensorLabelLayers[i]            = [];
    allMySensorTooltips[i]               = [];
    allMySensorLastClosestTimeIndexes[i] = 0
    allMySensorShowLabelFlags[i]         = true;
    allMySensorbboxes[i]                 = "";
}
  //var MySensorFastMarker      = [];
  //var MySensorLayer           = [];
  //var MySensorLabelFastMarker = [];
  //var MySensorLabelLayer      = [];
  //var MySensorTooltip         = [];
  //var MySensorLastClosestTimeIndex = 0;
  // for all MySensor markers 
  //var MySensorShowLabelFlag   = true;
  //var MySensorbbox            = "";

  // for HMS Firepower markers
  var HmsFireFastMarker      = []; // since HMS is "ragged", these are 2D arrays, unlike Airnow and Surfmet
  var HmsFireLayer           = [];
  var HmsFireLabelFastMarker = [];
  var HmsFireLabelLayer      = [];
  var HmsFireTooltip         = [];

  var markerLayer        = [];
  var markerLayerSetMapFlag = false; // whether or not the markerLayer has been added to the map
  var onmouseover_string;
  var onmouseout_string;	
  var recompute_allLatLng = true;
  var appendFlagSurfmetTemperature   = false;
  var appendFlagSurfmetPressure      = false;
  var appendFlagSurfmetWindSpeed     = false;
  var appendFlagSurfmetWindDirection = false;
  var appendFlagPurpleairPM25        = false;
  var allAppendFlagMySensors         = [false, false, false, false, false];
  var appendFlagAqsPm25   = false;
  var appendFlagAqsPm10   = false;
  var appendFlagAqsOzone  = false;
  var appendFlagAqsCO     = false;
  var appendFlagAqsNO2    = false;
  var appendFlagAqsSO2    = false;
  var appendFlagHmsFire   = false;

  var plotFlagAqsPm25   = false;
  var plotFlagAqsPm10   = false;
  var plotFlagAqsOzone  = false;
  var plotFlagAqsCO     = false;
  var plotFlagAqsNO2    = false;
  var plotFlagAqsSO2    = false;

  var plotFlagSurfmetTemperature   = false;
  var plotFlagSurfmetPressure      = false;
  var plotFlagSurfmetWindSpeed     = false;
  var plotFlagSurfmetWindDirection = false;
 
  var plotFlagPurpleairPM25 = false;
  //var plotFlagMySensor      = false; // now mySensorArry[*].plotFlag

  // connecting line
  var connectingLine = []; // one for each contiguoud area
  var connectingLine_flag = true;
  var connectingLineMaxRegions = 100;
  var connectingLineDistThreshold= 1500.0; // meters. if points are spaced farther apart they are considered discontinous

  //today's date
  today_yyyy = new Date().getFullYear(); // needed for current fire perimeters

  var firePerimeterLoadMessage = "Getting fire perimeters...";


  // interpolate
  var interpolate_flag = true;

  flag_computeGoogleLatLngDone = false;

  // map extents
  var map_center;
  var myLatLngSW = new google.maps.LatLng(24, -126);
  var myLatLngNE = new google.maps.LatLng(50, -66);
  var myLatLngCenter = null;
  var myLatLngBounds = new google.maps.LatLngBounds(myLatLngSW, myLatLngNE);
  //var minLat;
  //var minLon;

  var posMarker1;
  var posHalo1;
  var posMarker2;
  var posHalo2;
  var highlightMarker;
  var myMarker;
  var thisSymbolString;
  var thisConcSymbol;
  var thisZindex;

  var pos_mouseDown;
  var pos_mouseMove;
  var mousedown_flag;

  var myOptions = {
      gestureHandling: "cooperative",
      zoom: 4,
      center: myLatLngBounds.getCenter(),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDoubleClickZoom: true,
      disableDefaultUI: true,
      zoomControl: true,
      keyboardShortcuts: false,
      navigationControl: true, 
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
      },
      streetViewControl: true,
      scaleControl: true,
      scrollwheel: false
  }

  var map;
  var aqsHighlightMarker;
  var analysisLine;
  var analysisMarker;
  var analysisPlot;
  var analysisPlotOptions;
  var analysisExportArray = new Array();
  var timeseriesPlot;
  var timeseriesPlotOptions;
  var timeseriesPlotMsecStart = 0;
  var timeseriesPlotMsecEnd   = 0;
  var min_Time; // used in processing axis selection events
  var max_Time; // used in processing axis selection events
  var analysisXmin = 0;    // default
  var analysisXmax = 1000; // default
  var boxplotBinSize       = 50; // meters. default
  var boxplotPointMean     = new Array();
  var boxplotPointStddev   = new Array();
  var boxplotPointAvgNum   = new Array();
  var boxplotLineMean      = new Array();
  var boxplotLineStddev    = new Array();
  var boxplotLineAvgNum    = new Array();
  var isWindroseActice     = false; // default
  var windroseHighlightPos = 0; // default 
  var windroseSortIndex    = 0; // default 

  var scatterPlot;
  var scatterPlotOptions;
  var scatterExportArray = new Array();
  var scatterplot_externalMenuItems;
  var scatterplot_externalIDs;
  var scatterplot_baseMenuLength = 0;

  var clear_analysisMarker_flag = true; // default
  var clear_analysisLine_flag   = true; // default

  var timeseries_height = 150;

  var map_height_percent = 0.87;
  var map_width_percent  = 0.87;
  var map_height  = Math.floor($(window).height() * map_height_percent) - 200;
  var map_width   = Math.floor(($(window).width()  - $('#var_selector').width()) * map_width_percent) - 140;

  var half_width  = map_width / 2;
  var third_width = map_width / 3;
  var highlightMarker;
  var slider;

  // play, pause, step
  var playTimer;
  var isPlaying = false;

  // toolbox stuff
  var listener_crop_mouseUp;
  var listener_crop_mouseDown;
  var listener_crop_mouseMove;
  var listener_crop_mouseMove2;
  var listener_line_mouseUp;
  var listener_line_mouseDown;
  var listener_line_mouseMove;
  var listener_line_mouseMove2;
  var listener_marker;
  var line_started = false;
  var crop_started = false;

  // busy indicator
  var numBusyMap = 0;
  var numBusyTimeseries = 0;
  var busyMessageQueueMap = new Array();
  $.ajaxSetup({
      beforeSend:function(){
          // show gif here, eg:
          //$("#busy_gif").show();
	  //$("#busy_gif").css('visibility', 'visible');
	      //busyShow();

      },
      complete:function(){
          // hide gif here, eg:
          //$("#busy_gif").hide();
	      //$("#busy_gif").css('visibility', 'hidden');
	      //busyHide();
	      
      }
  });


function isOverflownVertical(element) {
    // detect if a dom element has overflowed vertically
    return element.scrollHeight > element.clientHeight;
}


function busyMessageQueueMapAdd(message) {
    busyMessageQueueMap.push(message);
}

function busyMessageQueueMapRemove(message) {
    let ind = busyMessageQueueMap.indexOf(message);
    if (ind >= 0) {
        busyMessageQueueMap.splice(ind, 1);
    }
}


function busyShow(purpose) {
    if (purpose) {
        //console.log('showing ', purpose);
        if (purpose.indexOf('map') > -1) {
            numBusyMap += 1;
            var msg = '<i>Fetching data...</i>';
            for (ind=0; ind<busyMessageQueueMap.length; ind++) {
                msg += '<br>- ' + busyMessageQueueMap[ind];
            }
            document.getElementById('busyMapWaitTime').innerHTML = msg;

            $("#busyMap").css('visibility', 'visible');
            $("#busyMap").children().css('visibility', 'visible');
        } else if (purpose.indexOf('timeseries') > -1) {
            numBusyTimeseries += 1;
            $("#busyTimeseries").css('visibility', 'visible');
            $("#busyTimeseries").children().css('visibility', 'visible');
        }
    } else {
        //console.log('blank');
        $("#busy_gif").css('visibility', 'visible');
        $("#busy_gif").children().css('visibility', 'visible');
    }
}

function busyHide(purpose) {

    if (purpose) {
        
        if (purpose.indexOf('map') > -1) {
            numBusyMap -= 1;
        } else if (purpose.indexOf('timeseries') > -1) {
            numBusyTimeseries -= 1;
        }



        if (purpose.indexOf('map') > -1 && numBusyMap == 0) {
            $("#busyMap").css('visibility', 'hidden');
            $("#busyMap").children().css('visibility', 'hidden');
        } else if (purpose.indexOf('timeseries') > -1 && numBusyTimeseries == 0) {
            $("#busyTimeseries").css('visibility', 'hidden');
            $("#busyTimeseries").children().css('visibility', 'hidden');
        }
        
        if (purpose.indexOf('map') > -1 && numBusyMap > 0) {
            var msg = '<i>Fetching data...</i>';
            for (ind=0; ind<busyMessageQueueMap.length; ind++) {
                msg += '<br>- ' + busyMessageQueueMap[ind];
            }
            document.getElementById('busyMapWaitTime').innerHTML = msg;
        }
    
    } else {  
        $("#busy_gif").css('visibility', 'hidden');
        $("#busy_gif").children().css('visibility', 'hidden');
    }
    
}


  function reset_verbiage_for_initialize() {
     $("#title_RetigoDataEntry").show();
     $("#title_Retigo").hide();
     $("#retigo_paragraph2").show();
     $("#retigo_paragraph2_sideimage").show();

     // hide analysis, timeseries, scatterplot, and windrose canvases
     $("#analysis_canvas").hide();
     $("#timeseries_canvas").hide();
     $("#timeseries_divider").hide();
     $("#windrose_canvas").hide();
     $("#windrose_canvas_button").hide();
     $("#scatter_canvas").hide();

  }

  function reset_verbiage_for_formEvaluate() {
      $("#retigo_paragraph").hide();
      $("#retigo_paragraph2").hide();
      $("#retigo_paragraph2_sideimage").hide();
      $("#title_RetigoDataEntry").hide();
      $("#title_Retigo").show();
  }


function changeMergedDataColormap(thisSelector) {
    
    if (thisSelector.id === "colormap_AqsO3") {
        aqsOzoneColormap = thisSelector[thisSelector.selectedIndex].id;
        createKmlAirnowiconImages(oAirnowOzone, aqsOzoneColormap);
    } else if (thisSelector.id === "colormap_AqsPM25") {
        aqsPM25Colormap = thisSelector[thisSelector.selectedIndex].id;
        createKmlAirnowiconImages(oAirnowPM25, aqsPM25Colormap);
    } else if (thisSelector.id === "colormap_AqsPM10") {
        aqsPM10Colormap = thisSelector[thisSelector.selectedIndex].id;
        createKmlAirnowiconImages(oAirnowPM10, aqsPM10Colormap);
    } else if (thisSelector.id === "colormap_AqsCO") {
        aqsCOColormap = thisSelector[thisSelector.selectedIndex].id;
        createKmlAirnowiconImages(oAirnowCO, aqsCOColormap);
    } else if (thisSelector.id === "colormap_AqsNO2") {
        aqsNO2Colormap = thisSelector[thisSelector.selectedIndex].id;
        createKmlAirnowiconImages(oAirnowNO2, aqsNO2Colormap);
    } else if (thisSelector.id === "colormap_AqsSO2") {
        aqsSO2Colormap = thisSelector[thisSelector.selectedIndex].id;
        createKmlAirnowiconImages(oAirnowSO2, aqsSO2Colormap);
    } else if (thisSelector.id === "colormap_Purpleair") {
        purpleairColormap = thisSelector[thisSelector.selectedIndex].id;
    } else if (thisSelector.id === "colormap_MySensor0") {
        mysensorColormap[0] = thisSelector[thisSelector.selectedIndex].id;
        createKmlMysensoriconImages(mySensorArray[0], mysensorColormap[0]);
    }else if (thisSelector.id === "colormap_MySensor1") {
        mysensorColormap[1] = thisSelector[thisSelector.selectedIndex].id;
        createKmlMysensoriconImages(mySensorArray[1], mysensorColormap[1]);
    }else if (thisSelector.id === "colormap_MySensor2") {
        mysensorColormap[2] = thisSelector[thisSelector.selectedIndex].id;
        createKmlMysensoriconImages(mySensorArray[2], mysensorColormap[2]);
    }else if (thisSelector.id === "colormap_MySensor3") {
        mysensorColormap[3] = thisSelector[thisSelector.selectedIndex].id;
        createKmlMysensoriconImages(mySensorArray[3], mysensorColormap[3]);
    }else if (thisSelector.id === "colormap_MySensor4") {
        mysensorColormap[4] = thisSelector[thisSelector.selectedIndex].id;
        createKmlMysensoriconImages(mySensorArray[4], mysensorColormap[4]);
    }
    
    updatePurpleairTooltips();
    updateMySensorTooltips();
    updateAqsTooltips();
    //updateSurfmetTooltips(); // not needed... glyphs do not change color

    // force map to update via a window resize event
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent('resize', true, false);
    window.dispatchEvent(evt);
}

  function changeColormap() {
      var colormap_select = document.getElementById("colormap_list");
      var this_colormap = colormap_select.value;
      
      if (this_colormap == document.getElementById("cm_bluered").value ){
          color_table = color_table_bluered;
          n_colors = 20;
          concSymbolDir = 'conc_symbols_bluered';
          concSymbolSet = 'bluered'; // matches symbol_conc.css
      } else if (this_colormap == document.getElementById("cm_stdgamma").value) {
          color_table = color_table_stdgamma2;
          n_colors = 20;
          concSymbolDir = 'conc_symbols_stdgamma2';
          concSymbolSet = 'stdgamma2'; // matches symbol_conc.css
      } else if (this_colormap == document.getElementById("cm_stdgamma_inverted").value) {
          color_table = color_table_stdgamma2_inverted;
          n_colors = 20;
          concSymbolDir = 'conc_symbols_stdgamma2_inverted';
          concSymbolSet = 'stdgamma2_inverted'; // matches symbol_conc.css
      } else if (this_colormap == document.getElementById("cm_bluemono").value) {
          color_table = color_table_bluemono;
          n_colors = 20;
          concSymbolDir = 'conc_symbols_bluemono';
          concSymbolSet = 'bluemono'; // matches symbol_conc.css
      } else if (this_colormap == document.getElementById("cm_viridis").value) {
          color_table = color_table_viridis;
          n_colors = 20;
          concSymbolDir = 'conc_symbols_viridis';
          concSymbolSet = 'viridis'; // matches symbol_conc.css
      } else if (this_colormap == document.getElementById("cm_viridis_inverted").value) {
          color_table = color_table_viridis_inverted;
          n_colors = 20;
          concSymbolDir = 'conc_symbols_viridis_inverted';
          concSymbolSet = 'viridis_inverted'; // matches symbol_conc.css
      } else if (this_colormap == document.getElementById("cm_colorsafe").value) {
          color_table = color_table_colorsafe;
          n_colors = 20;
          concSymbolDir = 'conc_symbols_colorsafe';
          concSymbolSet = 'colorsafe'; // matches symbol_conc.css
      } else if (this_colormap == document.getElementById("cm_colorsafe_inverted").value) {
          color_table = color_table_colorsafe_inverted;
          n_colors = 20;
          concSymbolDir = 'conc_symbols_colorsafe_inverted';
          concSymbolSet = 'colorsafe_inverted'; // matches symbol_conc.css
      } else {
          alert("Colormap not found");
      }
      
      // reset map colorbar
      init_colorbar(cbStartX, cbStartY, oUserdata.mymin[0][get_selected_varselector_index()], oUserdata.mymax[0][get_selected_varselector_index()], "MyData range: " + oUserdata.varname[0][get_selected_varselector_index()], 'colorbar_canvas', color_table,0);
      // reset windrose colorbar
      init_colorbar(cbStartX, cbStartY, oUserdata.mymin[0][get_selected_varselector_index()], oUserdata.mymax[0][get_selected_varselector_index()], "MyData range: " + oUserdata.varname[0][get_selected_varselector_index()], 'colorbar_canvas_windrose', color_table,0);


      // delete old markers
      markerind = markerLayer.length;
      markerLayerSetMapFlag = false;
      while (markerind--) {
          markerLayer[markerind].setMap(null);
      }
      // create new markers and update plots
      setTimeout("computeGoogleLatLng(oUserdata, false);", 0);
      update_timeseriesPlot();
      update_analysisPlot();
      update_windrosePlot();
      update_scatterPlot();
      updatePurpleairTooltips();
      updateMySensorTooltips();
      updateAqsTooltips();
      updateSurfmetTooltips();
    }

function colorNameLookup(colorName) {
    // given a color name, return a hex value
    
    var returnColor = color_LightBlue; // default

    if (colorName == "Lt. Blue") {
        returnColor = plotColorLightblue;
    } else if (colorName == "Dk. Blue") {
        returnColor = plotColorDarkblue;
    } else if (colorName == "Red") {
        returnColor = plotColorRed;
    } else if (colorName == "Maroon") {
        returnColor = plotColorMaroon;
    } else if (colorName == "Green") {
        returnColor = plotColorGreen;
    } else if (colorName == "Orange") {
        returnColor = plotColorOrange;
    } else if (colorName == "Black") {
        returnColor = plotColorBlack;
    } else if (colorName == "Gray90") {
        returnColor = plotColorGray90;
    } else if (colorName == "Gray80") {
        returnColor = plotColorGray80;
    } else if (colorName == "Gray70") {
        returnColor = plotColorGray70;
    } else if (colorName == "Gray60") {
        returnColor = plotColorGray60;
    } else if (colorName == "Gray50") {
        returnColor = plotColorGray50;
    } else if (colorName == "Gray40") {
        returnColor = plotColorGray40;
    } else if (colorName == "Gray30") {
        returnColor = plotColorGray30;
    } else if (colorName == "Gray20") {
        returnColor = plotColorGray20;
    } else if (colorName == "Gray10") {
        returnColor = plotColorGray10;
    } else if (colorName == "Data value") {
        returnColor = plotColorGray;
        
    } else {
        console.log("colorNameLookup() failed for", colorName);
    }

    return returnColor;
    
}

function getColormapValuesByName(colormapName) {
    
    if (colormapName == 'bluered') {
        return color_table_bluered;
    }
    else if (colormapName == 'stdgamma2') {
        return color_table_stdgamma2;
    }
    else if (colormapName == 'bluemono') {
        return color_table_bluemono;
    }
    else if (colormapName == 'viridis') {
        return color_table_viridis;
    }
    else if (colormapName == 'colorsafe') {
        return color_table_colorsafe;
    }
    else if (colormapName == 'stdgamma2_inverted') {
        return color_table_stdgamma2_inverted;
    }
    else if (colormapName == 'viridis_inverted') {
        return color_table_viridis_inverted;
    }
    else if (colormapName == 'colorsafe_inverted') {
        return color_table_colorsafe_inverted;
    }
}


function hexOpacityLookup(opacity) {
    // covert opacity  [0-100] to hex
    hexStr = Math.round(opacity / 100 * 255).toString(16);
    return hexStr;
}



function updateSettings(menu) {
    
    // colors
    if (menu.id.indexOf("primaryColormap") >= 0) {
        colorName                      = document.getElementById(menu.id).value;
        selectedIndex                  = menu.selectedIndex;
        settings.plotPrimaryColor      = colorNameLookup(colorName);
        settings.plotPrimaryColorIndex = Number(selectedIndex);
        if (colorName == "Data value") {
            settings.plotDataColorsFlag   = true;
        } else {
            settings.plotDataColorsFlag   = false;
        }
    } else if (menu.id.indexOf("secondaryColormap") >= 0) {
        colorName                        = document.getElementById(menu.id).value;
        selectedIndex                    = menu.selectedIndex;
        settings.plotSecondaryColor      = colorNameLookup(colorName);
        settings.plotSecondaryColorIndex = Number(selectedIndex);

    // opacity    
    } else if (menu.id.indexOf("plotPrimaryOpacity") >= 0) {
        opacity = document.getElementById(menu.id).value;
        settings.plotPrimaryOpacity = Number(opacity);
    } else if (menu.id.indexOf("plotSecondaryOpacity") >= 0) {
        opacity = document.getElementById(menu.id).value;
        settings.plotSecondaryOpacity = Number(opacity);

    // filled symbols
    } else if (menu.id.indexOf("plot_symbolfill") >= 0) {
        settings.plotFilledSymbolFlag = Boolean(document.getElementById(menu.id).checked);

    // log axis
    } else if (menu.id.indexOf("plot_logoption") >= 0) {
        settings.plotLogAxisFlag = Boolean(document.getElementById(menu.id).checked);

    // plot symbols axis
    }  else if (menu.id.indexOf("primaryStyle") >= 0) {
        styleName = document.getElementById(menu.id).value;
        settings.plotPrimaryStyle      = styleName; 
        settings.plotPrimaryStyleIndex = Number(menu.selectedIndex); 
    } else if (menu.id.indexOf("secondaryStyle") >= 0) {
        styleName = document.getElementById(menu.id).value;
        settings.plotSecondaryStyle = styleName;
        settings.plotSecondaryStyleIndex = Number(menu.selectedIndex);

    // font size
    } else if (menu.id.indexOf("fontSize") >= 0) {
        let myFontSize = document.getElementById(menu.id).value;
        settings.fontSize = myFontSize;
        $(".controls").css("font-size", myFontSize + "px");

        let baseControlsSize = 210;
        let increment = 9;
        let controlsSize = baseControlsSize;
        if (myFontSize <= 8 ) {
            controlsSize = baseControlsSize;
        } else {
            controlsSize = baseControlsSize + ((myFontSize - 8) * increment);
        }

        timeDisplaySize = document.getElementById("displayed_data_value").clientWidth;
        if (controlsSize < timeDisplaySize) {
            //controlsSize = timeDisplaySize;
        }
        
        controlsSizeString = controlsSize + "px";
        document.getElementById("MyDataDiv").style.width    = controlsSizeString;
        document.getElementById("MergeDataDiv").style.width = controlsSizeString;
        document.getElementById("SettingsDiv").style.width  = controlsSizeString;

        document.getElementById("mySensorSelector0").style.width  = controlsSize - 10 + "px";
        document.getElementById("mySensorSelector1").style.width  = controlsSize - 10 + "px";
        document.getElementById("mySensorSelector2").style.width  = controlsSize - 10 + "px";
        document.getElementById("mySensorSelector3").style.width  = controlsSize - 10 + "px";
        document.getElementById("mySensorSelector4").style.width  = controlsSize - 10 + "px";

        // for time slider width
        //document.getElementById("table_td2").style.paddingRight =  controlsSizeString;
        document.getElementById("timebox").style.width =  controlsSizeString;
        
        // force map to update via a window resize event
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent('resize', true, false);
        window.dispatchEvent(evt);

    // data flagger    
    } else if (menu.id.indexOf("constantNum") >= 0) {
        settings.flaggerConstantRepeatNum = document.getElementById(menu.id).value;
    } else if (menu.id.indexOf("missingNum") >= 0) {
        settings.flaggerMissingRepeatNum = document.getElementById(menu.id).value;
    } else if (menu.id.indexOf("outlierStatSDfactor") >= 0) {
        settings.flaggerOutlierStatSDfactor = document.getElementById(menu.id).value;
    } else if (menu.id.indexOf("outlierSpikeTimeWindow") >= 0) {
        settings.flaggerOutlierSpikeTimeWindow = document.getElementById(menu.id).value;
    } else if (menu.id.indexOf("outlierSpikeSDfactor") >= 0) {
        settings.flaggerOutlierSpikeSDfactor = document.getElementById(menu.id).value;
    } else if (menu.id.indexOf("aboveConcentration") >= 0) {
        settings.flaggerAboveConc = document.getElementById(menu.id).value;
    } else if (menu.id.indexOf("belowConcentration") >= 0) {
        settings.flaggerBelowConc = document.getElementById(menu.id).value;
    } else if (menu.id.indexOf("invalidateStart") >= 0) {
        settings.flaggerUserInvalidateStart = document.getElementById(menu.id).value;
    } else if (menu.id.indexOf("invalidateEnd") >= 0) {
        settings.flaggerUserInvalidateEnd = document.getElementById(menu.id).value;
        
    // somthing aint right    
    } else {
        console.log("Unknown setting");
    }

    saveSettings();
    update_analysisPlot();
    update_timeseriesPlot();
    update_scatterPlot();
}



  function validate_filterInput(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    var keystring = String.fromCharCode( key );

    // characters to allow
    var regex = /[A-Za-z0-9]|[\t]|\.|\,|\-|\_|[\b]/; 

    if (regex.test(keystring)) {
      // do nothing

    } else {
      //debug("regex not matched");
      theEvent.preventDefault();     
    }
    
    setTimeout("applyFileFilter();", 5);
  }


  function applyFileFilter() {
    // build filter string
    var filter = [];

    var dataTypes  = document.getElementsByName("dataType");

    for (n=0; n<dataTypes.length; n++){
      if (dataTypes[n].checked == true) {
          filter.push( dataTypes[n].id.toLowerCase().replace("load_",""));
      }
    }
    
    if (filter.length == 0) {
      filter = null;
    }
    set_fileList(repository_fileList, filter);
  }


  function set_fileList(data, filter) {
    // first clear the menu
    var menu = document.getElementById("downloadFileMenu");

    for (var i=menu.length-1; i>=0; i--){
      menu.options.remove(i);
    }

    fileList = data.trim();

    fLines=fileList.split('\n');
    for (ind=0; ind<fLines.length; ind++) {
      thisLine = fLines[ind];
      parse = thisLine.split(" ");
      var thisFile = "null";
      var thisProject = "null";
      var thisKeywords = "null";
      var thisOrigFile = "null";
      var thisQuality  = "null";
      var thisInstrument = "null";
      var thisDatatype   = "null";
      if (parse.length > 0) { thisFile       = parse[0]; }
      if (parse.length > 1) { thisProject    = parse[1]; }
      if (parse.length > 2) { thisKeywords   = parse[2]; }
      if (parse.length > 3) { thisOrigFile   = parse[3]; }
      if (parse.length > 4) { thisQuality    = parse[4]; }
      if (parse.length > 5) { thisInstrument = parse[5]; }
      if (parse.length > 6) { thisDatatype   = parse[6]; }
      //var menu = document.getElementById("downloadFileMenu");
      var thisOption = document.createElement("option");
      thisOption.text = thisFile;
      thisOption.title = "PROJECT: " + thisProject + 
                         "\nKEYWORDS: " + thisKeywords + 
                         "\nORIG_NAME: " + thisOrigFile +
                         "\nQUALITY: " + thisQuality +
                         "\nINSTRUMENT: " + thisInstrument +
                         "\nDATATYPE: " + thisDatatype;


      var found=false;
      // add based on project
      if (found == false) {
	var filterProject = document.getElementById('filterProjectCode').value.toLowerCase();
	if (filterProject.length > 0) {
	  if (thisProject.indexOf(filterProject) >= 0) {
	    menu.options.add(thisOption, 0);
	    found = true;
	  }
	}
      }

      // add based on keyword
      if (found == false) {
	var filterKeyword = document.getElementById('filterKeywords').value.toLowerCase();
	if (filterKeyword.length > 0) {
	  if (thisKeywords.indexOf(filterKeyword) >= 0) {
	    menu.options.add(thisOption, 0);
	    found = true;
	  }
	}
      }

      // add based on selected data type
      if (filter == 'all' && found == false) {
	menu.options.add(thisOption, 0);
      } else {
	if (filter) {
	  for (filterInd=0; filterInd<filter.length; filterInd++) {
	    if (thisDatatype.indexOf(filter[filterInd]) >= 0 && found == false) {
	      menu.options.add(thisOption, 0);
	      found = true;
	    }
	  }
	}
      }
    }

    setTimeout("setMenuTitle();", 5);

  }

function setMyData() {
      //console.log("in setMyData()");
      document.getElementById('MergeDataDiv').style.visibility="hidden";
      $('MergeTab').removeClass('active');
      $('MergeTabLink').removeClass('active');

      document.getElementById('settingsBtn').innerHTML = '<img src="images/settings.png" width="20" style="pointer-events:none;">';
      document.getElementById('SettingsDiv').style.visibility="hidden";
      $('SettingsTab').removeClass('active');
      $('settingsBtn').removeClass('active');
      
      document.getElementById('MyDataDiv').style.visibility="visible";
      $('MyDataTab').addClass('active');
      $('MyDataTabLink').addClass('active');
  }

  function setMerge() {
      //console.log("in setMerge()");
      document.getElementById('MyDataDiv').style.visibility="hidden";
      $('MyDataTab').removeClass('active');
      $('MyDataTabLink').removeClass('active');

      document.getElementById('settingsBtn').innerHTML = '<img src="images/settings.png" width="20" style="pointer-events:none;">';
      document.getElementById('SettingsDiv').style.visibility="hidden";
      $('SettingsTab').removeClass('active');
      $('settingsBtn').removeClass('active');

      document.getElementById('MergeDataDiv').style.visibility="visible";
      $('MergeTab').addClass('active');
      $('MergeTabLink').addClass('active');
  }

  function setSettings() {
      //console.log("in setSettings()");
      document.getElementById('MyDataDiv').style.visibility="hidden";
      $('MyDataTab').removeClass('active');
      $('MyDataTabLink').removeClass('active');

      document.getElementById('MergeDataDiv').style.visibility="hidden";
      $('MergeTab').removeClass('active');
      $('MergeTabLink').removeClass('active');

      document.getElementById('settingsBtn').innerHTML = '<img src="images/settings_selected.png" width="20" style="pointer-events:none;">';
      document.getElementById('SettingsDiv').style.visibility="visible";
      $('SettingsTab').addClass('active');      
      $('settingsBtn').addClass('active');      
  }

function saveSettings() {
    // save to local storage
    //console.log("saving settings");
    keys   = Object.keys(settings);
    values = Object.values(settings);
    for (var i=0; i<keys.length; i++) {
        //console.log(keys[i], values[i], typeof values[i]);
        localStorage.setItem(keys[i], values[i]);
    }
}

function restoreSettings() {
    // restore from local storage
    console.log("restoring settings");
    keys   = Object.keys(settings);
    values = Object.values(settings);
    for (var i=0; i<keys.length; i++) {
        thisItem     = localStorage.getItem(keys[i]);

        // localstorage saves everything as strings. Convert to proper type.
        thisItemType = typeof settings[keys[i]];
        if (thisItem !== null) {
            if (thisItemType == 'number') {
                settings[keys[i]] = Number(thisItem);
            } else if (thisItemType == 'boolean') {
                settings[keys[i]] = (thisItem === 'true');
            } else {
                settings[keys[i]] = thisItem;
            }
        }
    }

    //console.log(settings);
    document.getElementById('fontSize').value                       = settings.fontSize;
    document.getElementById("plot_symbolfill").checked              = settings.plotFilledSymbolFlag;
    document.getElementById("plot_logoption").checked               = settings.plotLogAxisFlag;
    
    document.getElementById("primaryColormap_list").selectedIndex   = settings.plotPrimaryColorIndex;
    document.getElementById("plotPrimaryOpacity").value             = settings.plotPrimaryOpacity;
    document.getElementById("primaryStyle_list").selectedIndex      = settings.plotPrimaryStyleIndex;

    document.getElementById("secondaryColormap_list").selectedIndex = settings.plotSecondaryColorIndex;
    document.getElementById("plotSecondaryOpacity").value           = settings.plotSecondaryOpacity;
    document.getElementById("secondaryStyle_list").selectedIndex    = settings.plotSecondaryStyleIndex;

    document.getElementById("constantNum").value                    = settings.flaggerConstantRepeatNum;
    document.getElementById("missingNum").value                     = settings.flaggerMissingRepeatNum;
    document.getElementById("outlierStatSDfactor").value            = settings.flaggerOutlierStatSDfactor;
    document.getElementById("outlierSpikeTimeWindow").value         = settings.flaggerOutlierSpikeTimeWindow;
    document.getElementById("outlierSpikeSDfactor").value           = settings.flaggerOutlierSpikeSDfactor;
    document.getElementById("aboveConcentration").value             = settings.flaggerAboveConc;
    document.getElementById("belowConcentration").value             = settings.flaggerBelowConc;
    document.getElementById("invalidateStart").value                = settings.flaggerUserInvalidateStart;
    document.getElementById("invalidateEnd").value                  = settings.flaggerUserInvalidateEnd;

    dataFlaggerInitParams();
}


  function setMenuTitle() {
    var menu = document.getElementById("downloadFileMenu");
    //console.log(menu.selectedIndex);
    if (menu.selectedIndex >= 0) {
      menu.title=menu.options[menu.selectedIndex].title;
    } else {
      menu.title="No file matches filter criteria";
    }
  }


  function get_fileList() {
   var sortMenu   = document.getElementById("downloadFileMenuSort");
   if (sortMenu != null) {
     var sortOption = sortMenu.options[sortMenu.selectedIndex].innerHTML;
     if (sortOption == "Sort by Date") {
       // sorted by date, then state
       sortedFileList = "FileList_ds.txt";
     } else {
       // sorted by state, then date
       sortedFileList = "FileList_sd.txt";
     }
   } else {
     // default: sorted by date, then state
     sortedFileList = "FileList_ds.txt";
   }


   $.ajax({
     url: rsigserver + "retigo/stable/repository/" + sortedFileList,
     dataType: "text",
     success: function(data, textStatus, jqXHR) {
       //alert(data);
       repository_fileList = data;
       set_fileList(data, 'all');
     },
     error: function (jqXHR, textStatus, errorThrown) {
      print("RETIGO file list not found");
      print("status: " + textStatus);
      print("error: " + errorThrown);
     } 
   });
  }

  function get_projectList() {
   $.ajax({
     url: rsigserver + "retigo/stable/repository/ProjectList.txt",
     dataType: "text",
     success: function(data, textStatus, jqXHR) {
       //alert(data);
       set_projectList(data);
     },
     error: function (jqXHR, textStatus, errorThrown) {
      print("RETIGO file list not found");
      print("status: " + textStatus);
      print("error: " + errorThrown);
     } 
   });
  }

  function get_keywordList() {
   $.ajax({
     url: rsigserver + "retigo/stable/repository/KeywordList.txt",
     dataType: "text",
     success: function(data, textStatus, jqXHR) {
       //alert(data);
       set_keywordList(data);
     },
     error: function (jqXHR, textStatus, errorThrown) {
      print("RETIGO file list not found");
      print("status: " + textStatus);
      print("error: " + errorThrown);
     } 
   });
  }



function process_scatterOptionRadio(element) {
    //console.log(element.id);
    
    if (element.id == "scatterchoiceHourly") {
        document.getElementById('scatterAxisMenusHourly').style.display="inline-block";
        document.getElementById('scatterAxisMenusNative').style.display="none";
    } else {
        document.getElementById('scatterAxisMenusHourly').style.display="none";
        document.getElementById('scatterAxisMenusNative').style.display="inline-block";
    }
    
    update_scatterPlot();
}



function update_scatterplot_menu(targetVarname, disabledFlag) {
    //console.log(targetVarname);
    
    // possible scatterplot menu items
    scatterplot_externalMenuItems = oStatsHourlyExternal.menuItems; // (e.g. "Airnow NO2", etc)
    
    // corresponding IDs (e.g. addAqsNO2)
    //scatterplot_externalIDs = oStatsHourlyExternal.IDs;
    
    // corresponding varnames (e.g. airnow.no2)
    scatterplot_varnames = oStatsHourlyExternal.varName;
    
    // index that matches the specified varName
    idIndex = scatterplot_varnames.indexOf(targetVarname);
    
    for (menuInd=0; menuInd<scatterplot_externalMenuItems.length; menuInd++) {
        thisMenuItem = scatterplot_externalMenuItems[menuInd];
        thisVarName  = scatterplot_varnames[menuInd];
        //console.log(thisVarName, targetVarname, thisVarName === targetVarname, thisVarName === targetVarname.replace('aqs', 'airnow'));
        if (thisVarName === targetVarname || thisVarName === targetVarname.replace('aqs', 'airnow')) {
            document.getElementById("scatter_xaxisVar").options[scatterplot_baseMenuLength + menuInd].disabled = disabledFlag;
            document.getElementById("scatter_yaxisVar").options[scatterplot_baseMenuLength + menuInd].disabled = disabledFlag;
        }

    }
    
}


function initScatterplotExternalMenuItems() {

    scatterplot_baseMenuLength = document.getElementById("scatter_xaxisVar").options.length;
    
    // possible scatterplot menu items
    scatterplot_externalMenuItems = oStatsHourlyExternal.menuItems; // (e.g. "Airnow NO2", etc)
    
    // corresponding IDs (e.g. addAqsNO2)
    //scatterplot_externalIDs = oStatsHourlyExternal.IDs;

    // corresponding varnames (e.g. airnow.no2)
    scatterplot_varnames = oStatsHourlyExternal.varName;

    for (menuInd=0; menuInd<scatterplot_externalMenuItems.length; menuInd++) {
        //console.log("adding", scatterplot_externalMenuItems[menuInd]);
        this_option_scatter_xaxis   = document.createElement("option");
        this_option_scatter_yaxis   = document.createElement("option");
        
        this_option_scatter_xaxis.value    = scatterplot_externalMenuItems[menuInd];
        this_option_scatter_yaxis.value    = scatterplot_externalMenuItems[menuInd];
        
        //this_option_scatter_xaxis.text    = scatterplot_externalIDs[idIndex];
        //this_option_scatter_yaxis.text    = scatterplot_externalIDs[idIndex];
        this_option_scatter_xaxis.text    = scatterplot_externalMenuItems[menuInd];
        this_option_scatter_yaxis.text    = scatterplot_externalMenuItems[menuInd];

        this_option_scatter_xaxis.disabled = true; 
        this_option_scatter_yaxis.disabled = true; 
        
        document.getElementById("scatter_xaxisVar").add(this_option_scatter_xaxis);
        document.getElementById("scatter_yaxisVar").add(this_option_scatter_yaxis);
    }

    //document.getElementById("timeseriesHourlyOption").disabled = false;

  }

let geoJsonData;
let geoJsonFilteredFeatures;
function addGeoJsonToMap(geoJsonData) {


    if (Array.isArray(geoJsonFilteredFeatures) == false) {
        // bbox for fire perimeters will be this big
        let latRange = 4.0; //degrees
        let lonRange = 4.0; //degrees
        
        let latCenter = myLatLngCenter.lat();
        let lonCenter = myLatLngCenter.lng();
        let minLon = lonCenter - lonRange/2;
        let maxLon = lonCenter + lonRange/2;
        let minLat = latCenter - latRange/2;
        let maxLat = latCenter + latRange/2;
        if (minLon < -180) {minLon = -180;}
        if (maxLon >  180) {maxLon =  180;}
        if (minLat <  -90) {minLat =  -90;}
        if (maxLat >   90) {maxLat =   90;}
        
        const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(minLat, minLon), //SW
            new google.maps.LatLng(maxLat, maxLon)  //NE
        );
        
        geoJsonFilteredFeatures = geoJsonData.features.filter(function(feature) {
            if (feature.geometry.type == "Polygon") {
                const coordinates = feature.geometry.coordinates[0];
                for (let i = 0; i < coordinates.length; i++) {
                    if (!bounds.contains(new google.maps.LatLng(coordinates[i][1], coordinates[i][0]))) {
                        return false;
                    }
                }
                return true;

            } else if (feature.geometry.type == "MultiPolygon") {
                const coordinates = feature.geometry.coordinates[0][0];
                for (let i = 0; i < coordinates.length; i++) {
                    if (!bounds.contains(new google.maps.LatLng(coordinates[i][1], coordinates[i][0]))) {
                        return false;
                    }
                }
                return true;
            }
        });
                
    }

    
    map.data.addGeoJson({
        type: 'FeatureCollection',
        features: geoJsonFilteredFeatures,
    });

    //map.data.addGeoJson(geoJsonData);

    // colors for fire perimeters
    let fillColor;
    let strokeColor;
    let mapid = map.getMapTypeId();
    if ( (mapid == "satellite") || (mapid == "hybrid") ) {
        fillColor = '#666666';
        strokeColor = '#FFFFFF';
    } else {
        fillColor = '#111111';
        strokeColor = '#000000';
    }
    map.data.setStyle(function(feature) {
    return {
        fillColor: fillColor,
        strokeColor: strokeColor,
        strokeWeight: 1
    };
});
}

function removeGeoJsonFromMap() {
    map.data.forEach(function(feature) {
        map.data.remove(feature);
    });
}


var kmzLayer;
function load_kmlFile(myFileName) {

    const fileInput = document.getElementById('kmlFile0');
    //const fileInput = myFileName;

    console.log(myFileName.value);
    console.log(fileInput);
    kmzLayer = new google.maps.KmlLayer({
        ///url: 'https://ftp.wildfire.gov/public/incident_specific_data/pacific_nw/2023_Incidents_Oregon/2023_Lookout_ORWIF230327/IR/20230921/20230921_Lookout_IR.kmz',
        //url: 'data:text/plain;charset=utf-8,' + encodeURIComponent(kmlData),
        url: myFileName.value,
        options: {
            preserveViewport: true,
            screenOverlays: false,
            screenXY: new google.maps.Point(0, 0),
            overlayXY: new google.maps.Point(100, 100) // Adjust the values as needed
        }
    });
    kmzLayer.setMap(map);
}



// initialize the map
  function initialize() {
      //console.log("in initialize()");
      // enable expanded filter setting content
      $('.expander').simpleexpand();
      
      // add listener for file selection radio buttons
      document.getElementById('divFileSelection').addEventListener('change', function(e) {
	      if (e.target.id == "btnLocalFile") {
		  $("#user_datafile1").show();
		  $("#user_datafile2").show();
		  $("#downloadFileMenu").hide();
		  $("#downloadFileMenuSort").hide();
		  $("#filterSettingsButton").hide();
		  //document.getElementById("user_datafile2").disabled = false;
		  //document.getElementById("formClear2Btn").disabled = false;
		  $('.content').hide();
	      }
	      if (e.target.id == "btnRepositoryFile") {
		  $("#user_datafile1").hide();
		  $("#user_datafile2").hide();
		  $("#downloadFileMenu").show();
		  $("#downloadFileMenuSort").show();
		  $("#filterSettingsButton").show();
		  //document.getElementById("user_datafile2").disabled = true;
		  //document.getElementById("formClear2Btn").disabled = true;
	      }
	      
	  }, false);
      
      // add listener for filter radio buttons
      document.getElementById('content').addEventListener('change', function(e) {
	      if (e.target.id == "filterAll") {
		  $("#filterSettings").children().attr("disabled", true);
		  $("#filterProjectCode").attr("disabled", true);
		  $("#filterKeywords").attr("disabled", true);
		  set_fileList(repository_fileList, 'all');
	      }
	      if (e.target.id == "filterCustom") {
		  $("#filterSettings").children().attr("disabled", false);
		  $("#filterProjectCode").attr("disabled", false);
		  $("#filterKeywords").attr("disabled", false);
		  applyFileFilter();
	      }
	      
	  }, false);
      
      // get repository file list
      fileList = get_fileList();

      pak = getCookie("pak");
      if (pak.length > 0) {
          document.getElementById("paKeyInput").value = atob(pak);
          validatePAkey();
      }
      
      // reset to local file
      document.getElementById("btnLocalFile").checked = true;
      $("#downloadFileMenu").hide();
      $("#downloadFileMenuSort").hide();
      $("#filterSettingsButton").hide();
      reset_verbiage_for_initialize();
      document.getElementById('map_canvas').style.height = map_height.toString() + "px";
      document.getElementById('map_canvas').style.width = map_width.toString() + "px";	
      //document.getElementById('var_selector').style.height = map_height.toString() + "px";
      
      map = null;
      map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
     
      
      // This is an attempt to show fire perimeters. Can't because Google API is limited to
      // 10MB file and 1000 total features (per API spec). 
      //kmlsrc = rsigserver + 'download/WFIGS_-_Current_Wildland_Fire_Locations.kml';
      //console.log(kmlsrc);
      //var kmlLayerTest = new google.maps.KmlLayer(kmlsrc, {
      //    suppressInfoWindows: true,
      //    preserveViewport: true,
      //    map: map
      //});
      //kmlLayerTest.addListener('click', function(event) {
      //    var content = event.featureData.infoWindowHtml;
      //    var testimonial = document.getElementById('capture');
      //    testimonial.innerHTML = content;
      //});
      
      
      //map.fitBounds(myLatLngBounds);
      google.maps.event.addDomListener(map, 'idle', function() {
	      calculateCenter();
              document.getElementById("my_min").blur();
              document.getElementById("my_max").blur();
	  });
      
      google.maps.event.addDomListener(window, 'resize', function() {       
	      set_mapsize();
	      $('#map_size').slider("option", "value", map_height);
      });

      google.maps.event.addDomListener(window, 'resize', function() {       
	      set_timeseriesSize();
	      $('#timeseries_size').slider("option", "value", timeseries_height);
      });
      
      google.maps.event.addListener( map, "maptypeid_changed", function() { 
	  mapid = map.getMapTypeId();
	      if ( (mapid == "satellite") || (mapid == "hybrid") ) {
		  cropRegion.setOptions({fillColor:"#FFFF00", strokeColor:"#FFFFFF", strokeWeight:2});

                  // styling for geoJsonData (e.g. fire perimeters)
                  map.data.setStyle(function(feature) {
                      return {
                          fillColor: '#FFCCCC',
                          strokeColor: '#FFFFFF',
                          strokeWeight: 1
                      };
                  });            
	      } else {
		  cropRegion.setOptions({fillColor:"#F0F000", strokeColor:"#000000", strokeWeight:1});

                  // styling for geoJsonData (e.g. fire perimeters)
                  map.data.setStyle(function(feature) {
                      return {
                          fillColor: '#111111',
                          strokeColor: '#000000',
                          strokeWeight: 1
                      };
	          });
              }
	  });
      
      //console.log(map);


      // set up marker, polyline, and crop region for analysis
      analysisLine = new google.maps.Polyline({strokeColor:color_polyline, draggable:true, editable:true, zIndex:1000000, icons: [{
		      icon: {
			  path: 'M 0,-2 0,2',
			  strokeColor: 'green',
			  strokeOpacity: 1.0			  
		      },
		      repeat: '24px'
		  }]});
      google.maps.event.addListener(analysisLine, "rightclick", function(event_rightclick) {
	      delete_analysisLine();
	  });
      google.maps.event.addListener(analysisLine, "drag", function() {
	      update_analysisPlot();
	  });
      google.maps.event.addListener(analysisLine, "mouseup", function() {
	      setTimeout("update_analysisPlot();", 50);
	  });
      analysisLine.setMap(map);
      
      analysisMarker = new google.maps.Marker({icon: imageserver + "images/misc_symbols/stickpin.png", draggable: true});
      listener_markerPosition = google.maps.event.addListener(analysisMarker, "position_changed", function() {update_analysisPlot();});
      google.maps.event.addListener(analysisMarker, "rightclick", function(event_rightclick) {
	      delete_analysisMarker();
	  });
      analysisMarker.setMap(map);
      
      aqsHighlightMarker = new google.maps.Marker({icon: {url:imageserver + "images/aqs_highlight2.png", origin:new google.maps.Point(0,0), anchor: new google.maps.Point(37, 47)}, draggable: false, zIndex:1, opacity:0.5});
      aqsHighlightMarker.setMap(map);

      surfmetHighlightMarker = new google.maps.Marker({icon: {url:imageserver + "images/surfmet_highlight2.png", origin:new google.maps.Point(0,0), anchor: new google.maps.Point(38, 38)}, draggable: false, zIndex:1, opacity:0.5});
      surfmetHighlightMarker.setMap(map);

      purpleairHighlightMarker = new google.maps.Marker({icon: {url:imageserver + "images/purpleair_highlight2.png", origin:new google.maps.Point(0,0), anchor: new google.maps.Point(25, 25), scaledSize: new google.maps.Size(50,50)}, draggable: false, zIndex:1, opacity:0.6});
      purpleairHighlightMarker.setMap(map);

      mysensorHighlightMarker = new google.maps.Marker({icon: {url:imageserver + "images/mysensor_highlight2.png", origin:new google.maps.Point(0,0), anchor: new google.maps.Point(38, 35), scaledSize: new google.maps.Size(80,80)}, draggable: false, zIndex:1, opacity:0.5});
      mysensorHighlightMarker.setMap(map);
      
      cropRegion = new google.maps.Rectangle({
	      fillColor:"#F0F000",
	      fillOpacity:0.1,
	      strokeWeight:1,
	      editable:false,  // must be false if mouseup events not detected
	      clickable:false, // must be false if mouseup events not detected
	      zIndex:100,
	      bounds:map.getBounds(),
	  });
      
      cropRegion.setMap(map);
      google.maps.event.addListener(cropRegion, "rightclick", function(event_rightclick) {
	      delete_cropRegion();
	  });
      
      posMarker1 = new google.maps.Marker({
	      position: myLatLngSW,
	      map:map,
	      icon: imageserver + 'images/google-pin.png'
      });

      posMarker2 = new google.maps.Marker({
	  position: myLatLngSW,
	  map:map,
	  icon: imageserver + 'images/google-pin.png'
      });
      
      posHalo1 = new google.maps.Marker({
	  position: myLatLngSW,
	  map:map,
	  icon: {
	      url: imageserver + 'images/halo2.png',
	      anchor: new google.maps.Point(25, 25)
	  },
	  zIndex:-1000,
	  opacity:0.7,
      });

      posHalo2 = new google.maps.Marker({
	  position: myLatLngSW,
	  map:map,
	  icon: {
	      url: imageserver + 'images/halo2.png',
	      anchor: new google.maps.Point(25, 25)
	  },
	  zIndex:-1000,
	  opacity:0.7,
      });

      highlightMarker = new google.maps.Marker({
	      position: myLatLngSW,
	      map:map,
	      icon: imageserver + 'images/conc_symbols/conc_fill.gif',
	      zIndex:0
	  });
      
      
      // binding for interactive x-axis selection for analysis plot
      var aCanvas = $("#analysis_canvas2");
      aCanvas.bind("plotselected", function(event, ranges) {
	      //debug("You selected " + ranges.xaxis.from + " to " + ranges.xaxis.to);
	      document.getElementById("analysis_Xmin").value = ranges.xaxis.from;
	      document.getElementById("analysis_Xmax").value = ranges.xaxis.to;
	      document.getElementById('analysis_Xaxisoption').checked = true;
	      update_analysisPlot();
	  });
      aCanvas.bind("plotunselected", function (event) {
	      debug("plotunselected");
	  });
      
      // binding for interactive x-axis selection for timeseries plot    
      var tCanvas = $("#timeseries_canvas2");
      tCanvas.bind("plotselected", function(event, ranges) {
	      //debug("You selected " + ranges.xaxis.from + " to " + ranges.xaxis.to);
	      
	      var rangeTo   = Number(ranges.xaxis.to);
	      var rangeFrom = Number(ranges.xaxis.from);
	      
	      var this_interval = rangeTo - rangeFrom;
	      //debug("interval: " + this_interval);
	      
	      // make sure interval is not too small 
	      var min_interval = 10000; // milliseconds
	      if (this_interval < min_interval) {
		  rangeTo = rangeFrom + min_interval;
	      }          
	      document.getElementById("timeseries_Xmin").value = (rangeFrom - min_Time) / (max_Time - min_Time) * 100;
	      document.getElementById("timeseries_Xmax").value = (rangeTo - min_Time) / (max_Time - min_Time) * 100;
	      document.getElementById('timeseries_Xaxisoption').checked = true;
	      
	      update_timeseriesPlot();
	      update_scatterPlot(); // the timeseries selection will be reflected in the scatterplot
          computeGoogleLatLng(oUserdata, false);
	  });
      tCanvas.bind("plotunselected", function (event) {
	  debug("plotunselected");
      });
      
    setTimeout('document.getElementById("div_dataDisplay").style.display="none";', 500);
    //document.getElementById('display_choice').style.backgroundColor       = color_LightBlue;
    document.getElementById('id_selector').style.backgroundColor          = color_LightBlue;
    document.getElementById('id_selector_label').style.backgroundColor    = color_LightBlue;
    document.getElementById('tb_selector').style.backgroundColor          = color_LightBlue;
    document.getElementById('tb_selector_label').style.backgroundColor    = color_LightBlue;
    document.getElementById('var_selector').style.backgroundColor         = color_LightBlue;
    document.getElementById('data_range_label').style.backgroundColor     = color_LightBlue;
    document.getElementById('var_selector_label').style.backgroundColor   = color_LightBlue;
    
    // hide everything
    hideAllLayers(highlightMarker);
    hideAllLayers(markerLayer);

    loadViperData();

  }


  var center;
  function calculateCenter() {
    center = map.getCenter(); 
  }


function clear_1darray(myarray) {
    for (mInd=0; mInd<myarray.length; mInd++) {
        if (typeof myarray[mInd] !== 'undefined') { 
            while(myarray.length > 0) {
                myarray.pop();
            }
        }
    }
}

function clear_2darray(myarray) {
      for (mInd=0; mInd<myarray.length; mInd++) {
          console.log("clearing", mInd);
          if (typeof myarray[mInd] !== 'undefined') { 
              while(myarray[mInd].length > 0) {
                  console.log("popping", mInd);
                  myarray[mInd].pop();
              }
          }
      }
  }


  function toggleWeather() {
      if (addWeather.checked) {
	  //get_met_closest('surfmet.temperature', oUserdata.bbox, oUserdata.timerange, rsigserver);
	  //get_met_closest('surfmet.wind_speed', oUserdata.bbox, oUserdata.timerange, rsigserver);
	  //get_met_closest('surfmet.wind_direction', oUserdata.bbox, oUserdata.timerange, rsigserver);
	  //get_met_closest('surfmet.pressure', oUserdata.bbox, oUserdata.timerange, rsigserver);
	  get_met_closest('metar.temperature', oUserdata.bbox, oUserdata.timerange, rsigserver, 'map');
	  get_met_closest('metar.windspeed', oUserdata.bbox, oUserdata.timerange, rsigserver, 'map');
	  get_met_closest('metar.winddir', oUserdata.bbox, oUserdata.timerange, rsigserver, 'map');
	  get_met_closest('metar.sealevelpress', oUserdata.bbox, oUserdata.timerange, rsigserver, 'map');
      } else {
	  //oMetInfo = null;
	  document.getElementById("metInfo").innerHTML = "";
      }
  }

  function toggleAqsLocations(myid) {

      //console.log(myid);
      
      // determine which option was selected
      var isOzone = false;
      var isPM25  = false;
      var isPM10  = false;
      var isCO    = false;
      var isNO2   = false;
      var isSO2   = false;
      if (myid.indexOf('addAqsOzoneLocations') > -1) {
	  isOzone = true;
          createKmlAirnowiconImages(oAirnowOzone, aqsOzoneColormap);
      } else
      if (myid.indexOf('addAqsPM25Locations') > -1) {
	  isPM25 = true;
          createKmlAirnowiconImages(oAirnowPM25, aqsPM25Colormap);
      } else
      if (myid.indexOf('addAqsPM10Locations') > -1) {
	  isPM10 = true;
          createKmlAirnowiconImages(oAirnowPM10, aqsPM10Colormap);
      } else
      if (myid.indexOf('addAqsCOLocations') > -1) {
	  isCO = true;
          createKmlAirnowiconImages(oAirnowCO, aqsCOColormap);
      } else
      if (myid.indexOf('addAqsNO2Locations') > -1) {
	  isNO2 = true;
          createKmlAirnowiconImages(oAirnowNO2, aqsNO2Colormap);
      } else
      if (myid.indexOf('addAqsSO2Locations') > -1) {
	  isSO2 = true;
          createKmlAirnowiconImages(oAirnowSO2, aqsSO2Colormap);
      }

      // determine which boxen are checked
      var isOzoneChecked = false;
      var isPM25Checked  = false;
      var isPM10Checked  = false;
      var isCOChecked    = false;
      var isNO2Checked   = false;
      var isSO2Checked   = false;
      var nChecked       = 0;
      if (document.getElementById("addAqsOzoneLocations").checked) {
          isOzoneChecked = true;
          $("#colorbar_canvas_airnowO3").show();
          nChecked += 1;
      } else {
          $("#colorbar_canvas_airnowO3").hide();
      }
      
      if (document.getElementById("addAqsPM25Locations").checked) {
          isPM25Checked = true;
          $("#colorbar_canvas_airnowPM25").show();
          nChecked += 1;
      } else {
          $("#colorbar_canvas_airnowPM25").hide();
      }

      if (document.getElementById("addAqsPM10Locations").checked) {
          isPM10Checked = true;
          $("#colorbar_canvas_airnowPM10").show();
          nChecked += 1;
      } else {
          $("#colorbar_canvas_airnowPM10").hide();
      }
      
      if (document.getElementById("addAqsCOLocations").checked) {
          isCOChecked = true;
          $("#colorbar_canvas_airnowCO").show();
          nChecked += 1;
      } else {
          $("#colorbar_canvas_airnowCO").hide();
      }
      
      if (document.getElementById("addAqsNO2Locations").checked) {
          isNO2Checked = true;
          $("#colorbar_canvas_airnowNO2").show();
          nChecked += 1;
      } else {
          $("#colorbar_canvas_airnowNO2").hide();
      }
      
      if (document.getElementById("addAqsSO2Locations").checked) {
          isSO2Checked = true;
          $("#colorbar_canvas_airnowSO2").show();
          nChecked += 1;
      } else {
          $("#colorbar_canvas_airnowSO2").hide();
      }


      //console.log(oUserdata.bbox);

      // if we don't already have airnow loaded, get it
      if (appendFlagAqsPm25 == false && isPM25Checked && isPM25) {
          if (nChecked == 1) {
              //moveFunc = "moveAqsHighlightMarker(oAirnowPM25.closestLonLat[1], oAirnowPM25.closestLonLat[0]);";
              moveFunc = "pickAQS(oAirnowPM25.closestLonLat[1], oAirnowPM25.closestLonLat[0], '', '');";
          } else {
              moveFunc = "";
          }
          if (busyMessageQueueMap.indexOf('airnow.pm25') == -1) {
              get_Airnow('airnow.pm25', oUserdata.bbox, oUserdata.timerange, rsigserver, 'map', moveFunc);
          }
	  //if (oAirnowPM25.closestLonLat) {
	  //    setTimeout("moveAqsHighlightMarker(oAirnowPM25.closestLonLat[1], oAirnowPM25.closestLonLat[0]);", 0);
	  //}
      }

      if (appendFlagAqsPm10 == false && isPM10Checked && isPM10) {
          if (nChecked == 1) {
              //moveFunc = "moveAqsHighlightMarker(oAirnowPM25.closestLonLat[1], oAirnowPM25.closestLonLat[0]);";
              moveFunc = "pickAQS(oAirnowPM10.closestLonLat[1], oAirnowPM10.closestLonLat[0]. '', '');";
          } else {
              moveFunc = "";
          }
          if (busyMessageQueueMap.indexOf('airnow.pm10') == -1) {
              get_Airnow('airnow.pm10', oUserdata.bbox, oUserdata.timerange, rsigserver, 'map', moveFunc);
          }
	  //if (oAirnowPM10.closestLonLat) {
	  //    setTimeout("moveAqsHighlightMarker(oAirnowPM10.closestLonLat[1], oAirnowPM10.closestLonLat[0]);", 0);
	  //}
      } 

      if (appendFlagAqsOzone == false && isOzoneChecked && isOzone) {
          if (nChecked == 1) {
              //moveFunc = "moveAqsHighlightMarker(oAirnowOzone.closestLonLat[1], oAirnowOzone.closestLonLat[0]);";
              moveFunc = "pickAQS(oAirnowOzone.closestLonLat[1], oAirnowOzone.closestLonLat[0], '', '');";
          } else {
              moveFunc = "";
          }
          if (busyMessageQueueMap.indexOf('airnow.ozone') == -1) {
              get_Airnow('airnow.ozone', oUserdata.bbox, oUserdata.timerange, rsigserver, 'map', moveFunc);
          }
	  //if (oAirnowOzone.closestLonLat) {
	  //    setTimeout("moveAqsHighlightMarker(oAirnowOzone.closestLonLat[1], oAirnowOzone.closestLonLat[0]);", 0);
	  //}
      }

      if (appendFlagAqsCO == false && isCOChecked && isCO) {
          if (nChecked == 1) {
              //moveFunc = "moveAqsHighlightMarker(oAirnowCO.closestLonLat[1], oAirnowCO.closestLonLat[0]);";
              moveFunc = "pickAQS(oAirnowCO.closestLonLat[1], oAirnowCO.closestLonLat[0], '', '');";
          } else {
              moveFunc = "";
          }
          if (busyMessageQueueMap.indexOf('airnow.co') == -1) {
              get_Airnow('airnow.co', oUserdata.bbox, oUserdata.timerange, rsigserver, 'map', moveFunc);
          }
	  //if (oAirnowCO.closestLonLat) {
	  //    setTimeout("moveAqsHighlightMarker(oAirnowCO.closestLonLat[1], oAirnowCO.closestLonLat[0]);", 0);
	  //} 
      }

      if (appendFlagAqsNO2 == false && isNO2Checked && isNO2) {
          if (nChecked == 1) {
              //moveFunc = "moveAqsHighlightMarker(oAirnowNO2.closestLonLat[1], oAirnowNO2.closestLonLat[0]);";
              moveFunc = "pickAQS(oAirnowNO2.closestLonLat[1], oAirnowNO2.closestLonLat[0], '', '');";
          } else {
              moveFunc = "";
          }
          if (busyMessageQueueMap.indexOf('airnow.no2') == -1) {
              get_Airnow('airnow.no2', oUserdata.bbox, oUserdata.timerange, rsigserver, 'map', moveFunc);
          }
	  //if (oAirnowNO2.closestLonLat) {
	  //    setTimeout("moveAqsHighlightMarker(oAirnowNO2.closestLonLat[1], oAirnowNO2.closestLonLat[0]);", 0);
	  //} 
      }

      if (appendFlagAqsSO2 == false && isSO2Checked && isSO2) {
          if (nChecked == 1) {
              //moveFunc = "moveAqsHighlightMarker(oAirnowSO2.closestLonLat[1], oAirnowSO2.closestLonLat[0]);";
              moveFunc = "pickAQS(oAirnowSO2.closestLonLat[1], oAirnowSO2.closestLonLat[0], '');";
          } else {
              moveFunc = "";
          }
          if (busyMessageQueueMap.indexOf('airnow.so2') == -1) {
              get_Airnow('airnow.so2', oUserdata.bbox, oUserdata.timerange, rsigserver, 'map', moveFunc);
          }
	  //if (oAirnowSO2.closestLonLat) {
	  //    setTimeout("moveAqsHighlightMarker(oAirnowSO2.closestLonLat[1], oAirnowSO2.closestLonLat[0]);", 0);
	  //} 
      }

      if (isOzoneChecked || isPM25Checked || isPM10Checked || isCOChecked || isNO2Checked || isSO2Checked) {
	  //showLayer(AqsLayer);
	  aqsHighlightMarker.setVisible(true);
	  //toggleAQSLabelsOn();
	  
      } else {
	  aqsHighlightMarker.setVisible(false);
	  //toggleAQSLabelsOff();
      }
      

      if (!isPM25Checked && isPM25 && AqsPM25Layer) {
	  //console.log('hiding AqsPM25Layer');
	  hideAllLayers(AqsPM25Layer);
      }

      if (!isPM10Checked && isPM10 && AqsPM10Layer) {
	  //console.log('hiding AqsPM10Layer');
	  hideAllLayers(AqsPM10Layer);
      }
    
      if (!isOzoneChecked && isOzone && AqsOzoneLayer) {
	  //console.log('hiding AqsOzoneLayer');
	  hideAllLayers(AqsOzoneLayer);
      }

      if (!isCOChecked && isCO && AqsCOLayer) {
	  //console.log('hiding AqsCOLayer');
	  hideAllLayers(AqsCOLayer);
      }

      if (!isNO2Checked && isNO2 && AqsNO2Layer) {
	  //console.log('hiding AqsNO2Layer');
	  hideAllLayers(AqsNO2Layer);
      }

      if (!isSO2Checked && isSO2 && AqsSO2Layer) {
	  //console.log('hiding AqsSO2Layer');
	  hideAllLayers(AqsSO2Layer);
      }

      setTimeout("update_optional(lastpos);", 0);
      arrangeColorbars();
  }


  function toggleAQSLabelsOff() {
      update_optional(lastpos);
      //hideAllLayers(AqsPM25LabelLayer);    
      //hideAllLayers(AqsOzoneLabelLayer);
  }


  function toggleAQSLabelsOn() {
      update_optional(lastpos);
      //showAllLayers(AqsPM25LabelLayer);    
      //showAllLayers(AqsOzoneLabelLayer);
  }


  function toggleSurfmetLabelsOff() {
      SurfmetShowLabelFlag = false;
      //update_optional(lastpos);
      //hideAllLayers(SurfmetTemperatureLabelLayer);    
      //hideAllLayers(SurfmetPressureLabelLayer);
      //hideAllLayers(SurfmetWindSpeedLabelLayer);
      //hideAllLayers(SurfmetWindDirectionLabelLayer);
  }


  function toggleSurfmetLabelsOn() {
      SurfmetShowLabelFlag = true;
      //update_optional(lastpos);
  }

  function toggleSurfmetLocations() {
      // if we don't already have surfmet loaded, get it
      if (appendFlagSurfmetTemperature == false) {
          //moveFunc = "moveSurfmetHighlightMarker(oSurfmetTemperature.closestLonLat[1], oSurfmetTemperature.closestLonLat[0]);";
          moveFunc = "pickSurfmet(oSurfmetTemperature.closestLonLat[1], oSurfmetTemperature.closestLonLat[0]);";
          if (busyMessageQueueMap.indexOf('metar.temperature') == -1) {
              get_Airnow('metar.temperature',    oUserdata.bbox, oUserdata.timerange, rsigserver, 'map', moveFunc);
          }
	  //setTimeout("moveSurfmetHighlightMarker(oSurfmetTemperature.closestLonLat[1], oSurfmetTemperature.closestLonLat[0]);", 5000);
      }
      if (appendFlagSurfmetPressure == false && busyMessageQueueMap.indexOf('metar.sealevelpress') == -1) {
	  get_Airnow('metar.sealevelpress',       oUserdata.bbox, oUserdata.timerange, rsigserver, 'map', "");
      }
      if (appendFlagSurfmetWindSpeed == false && busyMessageQueueMap.indexOf('metar.windspeed') == -1) {
	  get_Airnow('metar.windspeed',     oUserdata.bbox, oUserdata.timerange, rsigserver, 'map', "");
      }
      if (appendFlagSurfmetWindDirection == false && busyMessageQueueMap.indexOf('metar.winddir') == -1) {
	  get_Airnow('metar.winddir', oUserdata.bbox, oUserdata.timerange, rsigserver, 'map', "");
      }


      if (addSurfmetLocations.checked) {
	  surfmetHighlightMarker.setVisible(true);
	  toggleSurfmetLabelsOn();
      } else {
	  hideAllLayers(SurfmetTemperatureLayer);    
	  hideAllLayers(SurfmetPressureLayer);    
	  hideAllLayers(SurfmetWindSpeedLayer);    
	  hideAllLayers(SurfmetWindDirectionLayer);    
	  surfmetHighlightMarker.setVisible(false);
	  toggleSurfmetLabelsOff();   
      }

      setTimeout("update_optional(lastpos)", 0);
  }

  function togglePurpleairLabelsOn() {
      PurpleairShowLabelFlag = true;
      //update_optional(lastpos);
  }


  function togglePurpleairLabelsOff() {
      PurpleairShowLabelFlag = false;
  }

function togglePurpleairLocations() {
    
      // if we don't already have purpleair loaded, get it
      if (addPurpleairLocations.checked && appendFlagPurpleairPM25 == false) {
          moveFunc = "pickPurpleair(oPurpleairPM25.closestLonLat[1], oPurpleairPM25.closestLonLat[0]);";
          if (busyMessageQueueMap.indexOf('purpleair.pm25_corrected') == -1) {
              //get_Airnow('purpleair.pm25_corrected',  oUserdata.bbox, oUserdata.timerange, rsigserver, 'map', moveFunc);
              if (Purpleairbbox == "") {
	          //Purpleairbbox = oUserdata.bbox;
                  getPurpleairBbox();
              }
              
              get_Airnow('purpleair.pm25_corrected',  Purpleairbbox, oUserdata.timerange, rsigserver, 'map', moveFunc);

          }
      }

      if (addPurpleairLocations.checked) {
	  purpleairHighlightMarker.setVisible(true);
	  togglePurpleairLabelsOn();
          $("#colorbar_canvas_purpleair").show();
      } else {
	  hideAllLayers(PurpleairPM25Layer);      
	  purpleairHighlightMarker.setVisible(false);
	  togglePurpleairLabelsOff();
          $("#colorbar_canvas_purpleair").hide();
      }

      setTimeout("update_optional(lastpos)", 0);
      arrangeColorbars();
  }


  function toggleMySensorLabelsOn() {
      MySensorShowLabelFlag = true;
      //update_optional(lastpos);
  }


  function toggleMySensorLabelsOff() {
      MySensorShowLabelFlag = false;
  }

function toggleMySensorLocations(myID) {

    var sensorInd = getMySensorInd(myID);
    thisCheckbox = document.getElementById("addMySensorLocations" + sensorInd);

    createKmlMysensoriconImages(mySensorArray[sensorInd], mysensorColormap[sensorInd]);

    
    // if we don't already have MySensor loaded, get it
    //if (thisCheckbox.checked && allAppendFlagMySensors[sensorInd] == false) {
    //    moveFunc = "pickMySensor(oMySensor.closestLonLat[1], oMySensor.closestLonLat[0]);";
    //    if (busyMessageQueueMap.indexOf('mysensor') == -1) {
    //        if (allMySensorbboxes[sensorInd] == "") {
    //            getMySensorBbox();
    //        }
    //        
    //        //get_Airnow('mysensor',  MySensorbbox, oUserdata.timerange, rsigserver, 'map', moveFunc);
    //        
    //    }
    //}
    
    if (thisCheckbox.checked) {
	mysensorHighlightMarker.setVisible(true);
	toggleMySensorLabelsOn();
        $("#colorbar_canvas_mysensor" + sensorInd).show();
    } else {
	hideAllLayers(allMySensorLayers[sensorInd]);      
	mysensorHighlightMarker.setVisible(false);
	toggleMySensorLabelsOff();
        $("#colorbar_canvas_mysensor" + sensorInd).hide();
    }
    
    updateMySensorTooltips();
    setTimeout("update_optional(lastpos)", 0);
    arrangeColorbars();
}

  function toggleHmsLabelsOn() {
      HmsShowLabelFlag = true;
  }

  function toggleHmsLabelsOff() {
      HmsShowLabelFlag = false;
  }

  function toggleHmsFireLocations() {
      // if we don't already have HMS loaded, get it
      
      if (appendFlagHmsFire == false && busyMessageQueueMap.indexOf('hms.fire_power') == -1) {
	  get_Airnow('hms.fire_power', oUserdata.bbox, oUserdata.timerange, rsigserver, 'map', "");
      }


      if (addHmsFireLocations.checked) {
	  toggleHmsLabelsOn();
      } else {
	  hideAllLayers(HmsFireLayer);    
	  toggleHmsLabelsOff();   
      }

      setTimeout("update_optional(lastpos)", 0);
  }

function toggleFirePerimeters() {

    let thisDate = create_dateObjectUTC(oUserdata.timestamp[selected_block][0]);
    let thisYear = Number(thisDate.getUTCFullYear());

    if (! document.getElementById("addFirePerimeters").checked) {
        removeGeoJsonFromMap();

    } else if (typeof geoJsonData !== 'undefined') {
        // geoJsonData is already loaded. Now add it to the map
        addGeoJsonToMap(geoJsonData);
        
    } else {
       // first load the geoJsonData, then add it to the map
        let geojson_url;
        if (thisYear == today_yyyy) {
            busyShow('map');
            geojson_url = "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters_YearToDate/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson";
        } else if (thisYear <= 2022 && thisYear >= 2020) {
            busyShow('map');
            geojson_url = "fire_perimeters/InterAgencyFirePerimeterHistory_All_Years_View_epsg3857_simplify100_epsg4326_extract" + thisYear.toString() + ".geojson";
        } else if (thisYear == 2019) {
            busyShow('map');
            geojson_url = "fire_perimeters/Historic_GeoMAC_Perimeters_2019_-3339961634056411187_simplify100_epsg4326.geojson";
        } else if (thisYear <= 2018) {
            busyShow('map');
            geojson_url = "fire_perimeters/Historic_Geomac_Perimeters_Combined_2000_2018_6787151615263611623_epsg4326_simplify100_extract" + thisYear.toString() + ".geojson";
        }

        busyMessageQueueMapAdd(firePerimeterLoadMessage);
        $.ajax({
            //url: 'fire_perimeters/Historic_Geomac_Perimeters_2018_-108808624027135419_epsg4326_simplify100.geojson',
            url: geojson_url,
            dataType: 'json',
            success: function(data) {
                geoJsonData = data;
                // Call a function to add the GeoJSON data to the map
                addGeoJsonToMap(geoJsonData);                
                busyMessageQueueMapRemove(firePerimeterLoadMessage);
                busyHide('map');
            }
        });
    }

}



 function toggleViirsTruecolorMap() {
      // if we don't already have VIIRS Truecolor loaded, get it
      // NOTE: we only load the current day's worth of data in order to minimize
      // network traffic. 
     
      if (addViirsTruecolorMap.checked) {
          loadViirsTruecolorMap();
      } else {
          if (viirsTruecolorOverlay != null && typeof viirsTruecolorOverlay.setMap !== "undefined") {
              viirsTruecolorOverlay.setMap(null);
              viirsTruecolorOverlay = null;
          }
      }
  }

  function loadViirsTruecolorMap() {
      // get rid of the current overlay
      if (viirsTruecolorOverlay != null && typeof viirsTruecolorOverlay.setMap !== "undefined") {
          viirsTruecolorOverlay.setMap(null);
          viirsTruecolorOverlay = null;
      }

      let thisDateObj = create_dateObjectUTC(oUserdata.timestamp[selected_block][lastpos]);
      let thisDateGMT = get_yyyymmdd(thisDateObj);
      let thisMessage  = document.getElementById('addViirsTruecolorMapLabel').innerHTML + ' ' + thisDateGMT;
      let thisSliderPercent = $("#time_slider").slider( "option", "value" ) / $("#time_slider").slider( "option", "max" ) * 100.0;


      //console.log(thisDateGMT, lastViirsTruecolorDate);
      // Request the current day's VIIRS truecolor map
      if (addViirsTruecolorMap.checked && thisDateGMT != lastViirsTruecolorDate && busyMessageQueueMap.indexOf(thisMessage) == -1) {

          let lastViirsTruecolorDate = thisDateGMT;
          let addSliderElementFlag = false; // default
          if (!viirsTruecolorDateList.includes(lastViirsTruecolorDate)) {
              viirsTruecolorDateList.push(lastViirsTruecolorDate);
              addSliderElementFlag = true;
          }

          let thisTimerange = thisDateGMT + "T00:00:00Z/" + thisDateGMT + "T23:59:59Z";

          // bbox for VIIRS Truecolor will be this big

          let myMinLat = Math.min(...oUserdata.lat[0]);
          let myMaxLat = Math.max(...oUserdata.lat[0]);
          let myMinLon = Math.min(...oUserdata.lon[0]);
          let myMaxLon = Math.max(...oUserdata.lon[0]);

          // default bbox range
          let latRange = 1.5; //degrees
          let lonRange = 1.5; //degrees

          if ( (!isNaN(myMinLat) && myMinLat > -90  && myMinLat < 90)                         &&
               (!isNaN(myMaxLat) && myMaxLat > -90  && myMaxLat < 90  && myMaxLat > myMinLat) &&
               (!isNaN(myMinLon) && myMinLon > -180 && myMinLon < 180)                        &&
               (!isNaN(myMaxLon) && myMaxLon > -180 && myMaxLon < 180 && myMaxLon > myMinLon) ) {
              
              latRange = 1.5* (myMaxLat - myMinLat);
              lonRange = 1.5* (myMaxLon - myMinLon);   
          }

          // ensure bbox is not degenerate
          if (latRange < 1.5) {
              latRange = 1.5;
          }
          if (lonRange < 1.5) {
              lonRange = 1.5;
          }
          
          let latCenter = myLatLngCenter.lat();
          let lonCenter = myLatLngCenter.lng();
          let minLon = lonCenter - lonRange/2;
          let maxLon = lonCenter + lonRange/2;
          let minLat = latCenter - latRange/2;
          let maxLat = latCenter + latRange/2;
          if (minLon < -180) {minLon = -180;}
          if (maxLon >  180) {maxLon =  180;}
          if (minLat <  -90) {minLat =  -90;}
          if (maxLat >   90) {maxLat =   90;}
	  
          getTrueColor('VIIRS', thisDateGMT, minLat, minLon, maxLat, maxLon, viirsTruecolorZindex);


      }
  }


  function toggleViirsAODMap() {
      // if we don't already have VIIRS AOD loaded, get it
      // NOTE: we only load the current day's worth of data in order to minimize
      // load on the server. 

      // uncheck other satellite layers
      addTropomiNO2Map.checked = false;
      addTempoNO2Map.checked = false;
      
      if (addViirsAodMap.checked) {
          loadSatelliteMapBySource("viirsAOD");
      } else {
          if (satelliteOverlay != null && typeof satelliteOverlay.setMap !== "undefined") {
              satelliteOverlay.setMap(null);
              satelliteOverlay = null;
          }
          $("#colorbar_satellite_canvas").hide();
      }
      arrangeColorbars();
  }

  function toggleTropomiNO2Map() {
      // if we don't already have TROPOMI NO2 loaded, get it
      // NOTE: we only load the current day's worth of data in order to minimize
      // load on the server. 

      // uncheck other satellite layers
      addViirsAodMap.checked = false;
      addTempoNO2Map.checked = false;
      
      if (addTropomiNO2Map.checked) {
          loadSatelliteMapBySource("tropomiNO2");
      } else {
          if (satelliteOverlay != null && typeof satelliteOverlay.setMap !== "undefined") {
              satelliteOverlay.setMap(null);
              satelliteOverlay = null;
          }
          $("#colorbar_satellite_canvas").hide();
      }
      arrangeColorbars();
  }

  function toggleTempoNO2Map() {
      // if we don't already have TEMPO NO2 loaded, get it
      // NOTE: we only load the current day's worth of data in order to minimize
      // load on the server. 

      // uncheck other satellite layers
      addTropomiNO2Map.checked = false;
      addViirsAodMap.checked = false;
      
      if (addTempoNO2Map.checked) {
          loadSatelliteMapBySource("tempoNO2");
      } else {
          if (satelliteOverlay != null && typeof satelliteOverlay.setMap !== "undefined") {
              satelliteOverlay.setMap(null);
              satelliteOverlay = null;
          }
          $("#colorbar_satellite_canvas").hide();
      }
      arrangeColorbars();
  }

  function loadViirsAODMap() {
      loadSatelliteMapBySource('viirsAOD');
  }

  function loadSatelliteMap() {
      if (addViirsAodMap.checked) {
          loadSatelliteMapBySource('viirsAOD');
      }

      if (addTropomiNO2Map.checked) {
          loadSatelliteMapBySource('tropomiNO2');
      }

      if (addTempoNO2Map.checked) {
          loadSatelliteMapBySource('tempoNO2');
      }
  }


  function loadSatelliteMapBySource(source) {

      // get rid of the current overlay
      if (satelliteOverlay != null && typeof satelliteOverlay.setMap !== "undefined") {
          satelliteOverlay.setMap(null);
          satelliteOverlay = null;
      }

      let thisDateObj = create_dateObjectUTC(oUserdata.timestamp[selected_block][lastpos]);
      let thisDateGMT = get_yyyymmdd(thisDateObj);
      let thisHHMMSS  = get_time(thisDateObj);
      let thisHH      = thisHHMMSS.split(":")[0];
      let thisMessage = "";
      let thisTimerange = "";
      let thisSliderPercent = $("#time_slider").slider( "option", "value" ) / $("#time_slider").slider( "option", "max" ) * 100.0;
      let satelliteUniqueIDPrefix = "";
      
      //console.log(thisDateGMT, lastViirsAODDate);

      // set certain variables based on the desired source
      if (source == "viirsAOD") {
          satelliteLayer           = "viirsnoaa.jrraod.AOD550";
          isGuiChecked             = addViirsAodMap.checked;
          annotationCharacter      = "V";
          annotationOffset         = "0.05em";
          //satelliteUniqueID        = viirsAOD_uniqueID;
          satelliteUniqueID        = viirsAOD_uniqueID + '_' + thisDateGMT;
          satelliteUniqueIDPrefix  = viirsAOD_uniqueID;
          lastAcquiredDate         = lastViirsAODDate;
          satelliteMinVal          = viirsMinVal;
          satelliteMaxVal          = viirsMaxVal;
          //satelliteShowWarningFlag = viirsShowWarningFlag;
          satelliteOpacity         = viirsAodOpacity;
          satelliteZindex          = viirsAodZindex;
          thisMessage              = document.getElementById('addViirsAodMapLabel').innerHTML + ' ' + thisDateGMT;
          thisTimerange            = thisDateGMT + "T00:00:00Z/" + thisDateGMT + "T23:59:59Z";

      } else if (source == "tropomiNO2") {
          //satelliteLayer           = "tropomi.rpro.no2.nitrogendioxide_tropospheric_column";
          satelliteLayer           = "tropomi.offl.no2.nitrogendioxide_tropospheric_column";
          isGuiChecked             = addTropomiNO2Map.checked;
          annotationCharacter      = "T";
          annotationOffset         = "-0.8em";
          //satelliteUniqueID        = tropomiNO2_uniqueID;
          satelliteUniqueID        = tropomiNO2_uniqueID + '_' + thisDateGMT;
          satelliteUniqueIDPrefix  = tropomiNO2_uniqueID;
          lastAcquiredDate         = lastTropomiNO2Date;
          satelliteMinVal          = tropomiNO2MinVal;
          satelliteMaxVal          = tropomiNO2MaxVal;
          //satelliteShowWarningFlag = tropomiNO2ShowWarningFlag;
          satelliteOpacity         = tropomiNO2Opacity;
          satelliteZindex          = tropomiNO2Zindex;
          thisMessage              = document.getElementById('addTropomiNO2MapLabel').innerHTML + ' ' + thisDateGMT;
          thisTimerange            = thisDateGMT + "T00:00:00Z/" + thisDateGMT + "T23:59:59Z";

      } else if (source == "tempoNO2") {
          satelliteLayer           = "tempo.l2.no2.vertical_column_troposphere";
          isGuiChecked             = addTempoNO2Map.checked;
          annotationCharacter      = "M";
          annotationOffset         = "-0.8em";
          //satelliteUniqueID        = tempoNO2_uniqueID;
          satelliteUniqueID        = tempoNO2_uniqueID + '_' + thisDateGMT + "_" + thisHH + "00";
          satelliteUniqueIDPrefix  = tempoNO2_uniqueID;
          lastAcquiredDate         = lastTempoNO2Date;
          satelliteMinVal          = tempoNO2MinVal;
          satelliteMaxVal          = tempoNO2MaxVal;
          //satelliteShowWarningFlag = tropomiNO2ShowWarningFlag;
          satelliteOpacity         = tempoNO2Opacity;
          satelliteZindex          = tempoNO2Zindex;
          thisMessage              = document.getElementById('addTempoNO2MapLabel').innerHTML + ' ' + thisDateGMT;
          thisTimerange            = thisDateGMT + "T" + thisHH + ":00:00Z/" + thisDateGMT + "T" + thisHH + ":59:59Z";
      }

      //console.log(source, thisTimerange);
      
      // Request the current day's satellite map (or hour for tempo)
      if (isGuiChecked && satelliteUniqueID != "" && thisDateGMT != lastAcquiredDate && busyMessageQueueMap.indexOf(thisMessage) == -1) {


          let lastViirsAODDate;
          let lastTropomiNO2Date;
          let lastTempoNO2Date;
          let addSliderElementFlag = false; // default
          
          if (source == "viirsAOD") {
              lastViirsAODDate = thisDateGMT;
              addSliderElementFlag = false; // default
              if (!viirsDateList.includes(lastViirsAODDate)) {
                  viirsDateList.push(lastViirsAODDate);
                  addSliderElementFlag = true;
              }
          } else if (source == "tropomiNO2") {
              lastTropomiNO2Date = thisDateGMT;
              addSliderElementFlag = false; // default
              if (!tropomiNO2DateList.includes(lastTropomiNO2Date)) {
                  tropomiNO2DateList.push(lastTropomiNO2Date);
                  addSliderElementFlag = true;
              }
          } else if (source == "tempoNO2") {
              lastTempoNO2Date = thisDateGMT + "T" + thisHH;
              addSliderElementFlag = false; // default
              if (!tempoNO2DateList.includes(lastTempoNO2Date)) {
                  tempoNO2DateList.push(lastTempoNO2Date);
                  addSliderElementFlag = true;
              }
          }


          // bbox for VIIRS AOD will be this big
          //let latRange = 2.5; //degrees
          //let lonRange = 2.5; //degrees
          //let latRange = 1.5; //degrees
          //let lonRange = 1.5; //degrees

          let myMinLat = Math.min(...oUserdata.lat[0]);
          let myMaxLat = Math.max(...oUserdata.lat[0]);
          let myMinLon = Math.min(...oUserdata.lon[0]);
          let myMaxLon = Math.max(...oUserdata.lon[0]);

          // defaults bbox range
          let latRange = 1.5; //degrees
          let lonRange = 1.5; //degrees

          if ( (!isNaN(myMinLat) && myMinLat > -90  && myMinLat < 90)                         &&
               (!isNaN(myMaxLat) && myMaxLat > -90  && myMaxLat < 90  && myMaxLat > myMinLat) &&
               (!isNaN(myMinLon) && myMinLon > -180 && myMinLon < 180)                        &&
               (!isNaN(myMaxLon) && myMaxLon > -180 && myMaxLon < 180 && myMaxLon > myMinLon) ) {
              
              latRange = 1.5* (myMaxLat - myMinLat);
              lonRange = 1.5* (myMaxLon - myMinLon);   
          }

          // ensure bbox is not degenerate
          if (latRange < 1.5) {
              latRange = 1.5;
          }
          if (lonRange < 1.5) {
              lonRange = 1.5;
          }
          
          let latCenter = myLatLngCenter.lat();
          let lonCenter = myLatLngCenter.lng();
          let minLon = lonCenter - lonRange/2;
          let maxLon = lonCenter + lonRange/2;
          let minLat = latCenter - latRange/2;
          let maxLat = latCenter + latRange/2;
          if (minLon < -180) {minLon = -180;}
          if (maxLon >  180) {maxLon =  180;}
          if (minLat <  -90) {minLat =  -90;}
          if (maxLat >   90) {maxLat =   90;}

          let satelliteBBOX = minLon.toString() + ',' + minLat.toString() + ',' +  maxLon.toString() + ',' + maxLat.toString();
	  
          let satelliteBounds = new google.maps.LatLngBounds(
                                                             new google.maps.LatLng(minLat, minLon), //SW
                                                             new google.maps.LatLng(maxLat, maxLon)  //NE
          );

          let satelliteURL = rsigserver                                + 
              'SERVICE=retigowms'                                      + 
              '&VERSION=1.3.0'                                         + 
              '&REQUEST=GetMap'                                        + 
              '&LAYERS=' + satelliteLayer                              + 
              '&STYLES=nomaplines'                                     + 
              '&CRS=epsg:3857'                                         + 
              '&BBOX=' + satelliteBBOX                                 + 
              '&WIDTH=2048'                                            + 
              '&HEIGHT=2048'                                           + 
              '&FORMAT=image/png'                                      + 
              '&TIME=' + thisTimerange                                 + 
              '&MINVAL=' + satelliteMinVal                             + 
              '&MAXVAL=' + satelliteMaxVal                             +
              '&QAFLAG=medium'                                         +
              //'&ID=' + satelliteUniqueID + '_' + thisDateGMT;
              '&ID=' + satelliteUniqueID;

          //let colorbarURL = rsigserver                                 + 
          //    'SERVICE=retigowms'                                      + 
          //    '&VERSION=1.3.0'                                         + 
          //    '&REQUEST=GetLegend'                                     +
          //    '&ID=' + satelliteUniqueID;
          
          let colorbarInfoURL = rsigserver                             + 
              'SERVICE=retigowms'                                      + 
              '&VERSION=1.3.0'                                         + 
              '&REQUEST=GetLegendInfo'                                 +
              '&ID=' + satelliteUniqueIDPrefix;


          if (satelliteShowWarningFlag) {
              //var answer = confirm('Due to the complexity of VIIRS data, it may take several minutes to finish loading. Please be patient.');
              //viirsShowWarningFlag = answer;
              //document.getElementById("dialog-confirm-viirs").
              openEmvlDialog("dialog-confirm-viirs");
          }

          busyMessageQueueMapAdd(thisMessage);
          busyShow('map');
          $.ajax({
                  url: satelliteURL + "&JSONPFLAG=0",
                      dataType: "html",
                      async: true,
                      timeout: 300000, // milliseconds
                      tryCount: 0,
                      retryLimit: 6, // to get around some browsers (Firefox) disconnecting after a hardcoded timeout (e.g. 30 seconds)
                      cache: false,
                      success: function(data, textStatus, jqXHR) {
                      
                      if (data.length > 0) {

                          if (addSliderElementFlag) {
                              // Create a new element and position it on the time slider
                              var el = $('<a title="' + source + ' data loaded for ' +  thisDateGMT + '" style="position:absolute;margin:0;padding:0;top:-0.5em;margin-left:-0.25em;z-index:5">' + '|' + '</a>').css('left', (thisSliderPercent) + '%');
                              // Add the element inside #slider
                              $("#time_slider").append(el);

                              var el2 = $('<a title="' + source + ' data loaded for ' +  thisDateGMT + '" style="font-size:50%;position:absolute;margin:0;padding:0;top:1.7em;margin-left:' + annotationOffset + ';z-index:5">' + annotationCharacter + '</a>').css('left', (thisSliderPercent) + '%');
                              // Add the element inside #slider
                              $("#time_slider").append(el2);
                              
                          }
                      } else {
                          print("There was no " + source + " data for " + thisTimerange);
                      }

                      let curDateObj = create_dateObjectUTC(oUserdata.timestamp[selected_block][lastpos]);
                      let curDateGMT = get_yyyymmdd(curDateObj);
                      
                      
                      if (isGuiChecked && curDateGMT === thisDateGMT) {
                          // get rid of the current overlay
                          if (satelliteOverlay != null && typeof satelliteOverlay.setMap !== "undefined") {
                              satelliteOverlay.setMap(null);
                              satelliteOverlay = null;
                          }
                          // add new overlay
                          satelliteOverlay = new emvlOverlay(satelliteBounds, satelliteURL, map, satelliteOpacity, satelliteZindex);
                      }                      

                      busyMessageQueueMapRemove(thisMessage);
                      busyHide('map');
                      
                      // get and display prerendered colormap from the server
                      //console.log(colorbarURL);
                      //document.getElementById('colorbar_satellite_canvas').innerHTML = '<img style="width:100%;height:90%" src="' + colorbarURL + '"/>';
                      
                      // get colormap hex bins from the server, and render the colormap 
                          //console.log(colorbarInfoURL);


                      // clear the colorbar
	              //document.getElementById('colorbar_satellite_canvas').innerHTML = "";
                      childDivs = document.getElementById('colorbar_satellite_canvas').getElementsByTagName('div');
                      for( i=childDivs.length-1; i>=0; i-- ) {
                        childDivs[i].remove();
                      }
                          
                      $.ajax({
                              url: colorbarInfoURL,
                                  dataType: "text",
                                  timeout: 300000, // milliseconds
                                  cache: false,
                                  success: function(data, textStatus, jqXHR) {
                                      let dataParse = data.split('\n');
                                      if (source == "viirsAOD") {
                                          viirsColorTable = new Array();
                                          for (cInd=0; cInd<dataParse.length; cInd++) {
                                              if (dataParse[cInd] != '') {
                                                  viirsColorTable.push(dataParse[cInd]);
                                              } 
                                          }
                                          if (isGuiChecked && viirsColorTable.length > 0) {
                                              init_colorbar(cbStartX, cbStartY, viirsMinVal, viirsMaxVal, 'VIIRS AOD (-)', 'colorbar_satellite_canvas', viirsColorTable,0);
                                              $("#colorbar_satellite_canvas").show();
                                          }

                                      } else if (source == "tropomiNO2") {
                                          for (cInd=0; cInd<dataParse.length; cInd++) {
                                              if (dataParse[cInd] != '') {
                                                  tropomiNO2ColorTable.push(dataParse[cInd]);
                                              } 
                                          }
                                          if (isGuiChecked && tropomiNO2ColorTable.length > 0) {
                                              init_colorbar(cbStartX, cbStartY, tropomiNO2MinVal, tropomiNO2MaxVal, 'TROPOMI NO2 (#/cm2)', 'colorbar_satellite_canvas', tropomiNO2ColorTable,1);
                                              $("#colorbar_satellite_canvas").show();
                                          }
                                      } else if (source == "tempoNO2") {
                                          for (cInd=0; cInd<dataParse.length; cInd++) {
                                              if (dataParse[cInd] != '') {
                                                  tempoNO2ColorTable.push(dataParse[cInd]);
                                              } 
                                          }
                                          if (isGuiChecked && tempoNO2ColorTable.length > 0) {
                                              init_colorbar(cbStartX, cbStartY, tempoNO2MinVal, tempoNO2MaxVal, 'TEMPO NO2 (#/cm2)', 'colorbar_satellite_canvas', tempoNO2ColorTable,1);
                                              $("#colorbar_satellite_canvas").show();
                                          }
                                      }
                                      
                                      arrangeColorbars();
                                      
                                  },
                          error: function (jqXHR, textStatus, errorThrown) {
                              print(source + " colorbarinfo not loaded.");
                              print("status: " + textStatus);
                              print("error: " + errorThrown);
                              
                          } 
                      });
                          
                      
                          // show the colorbar canvas
                          if (source == "viirsAOD" && isGuiChecked && viirsColorTable.length > 0) {
                              $("#colorbar_satellite_canvas").show();
                              arrangeColorbars();
                          } else if (source == "tropomiNO2" && isGuiChecked && tropomiNO2ColorTable.length > 0) {
                              $("#colorbar_satellite_canvas").show();
                              arrangeColorbars();
                          } else if (source == "tempoNO2" && isGuiChecked && tempoNO2ColorTable.length > 0) {
                              $("#colorbar_satellite_canvas").show();
                              arrangeColorbars();
                          }
                      
                  },
                      error: function (jqXHR, textStatus, errorThrown) {
                      this.tryCount += 1;
                      if (this.tryCount <= this.retryLimit) {
                          // retry
                          console.log("There was a problem loading " + source + ". Retrying...");
                          $.ajax(this);
                          return;
                      } else {
                          print(source + " image not loaded.");
                          print("status: " + textStatus);
                          print("error: " + errorThrown);
                          console.log(jqXHR);
                          busyMessageQueueMapRemove(thisMessage);
                          busyHide('map');
                      }
                  }
                      });
          
          
          
      }
      //console.log(viirsDateList);
  }




  function updateViirsOpacity() {
      viirsAodOpacity = parseFloat(document.getElementById("viirsAodOpacityControl").value) / 100.0;
      
      if (satelliteOverlay != null && typeof satelliteOverlay.setMap !== "undefined") {
          satelliteOverlay.setOpacity(viirsAodOpacity);
      }
  }


 function updateViirsTruecolorOpacity() {
      viirsTruecolorOpacity = parseFloat(document.getElementById("viirsTruecolorOpacityControl").value) / 100.0;
      
      if (viirsTruecolorOverlay != null && typeof viirsTruecolorOverlay.setMap !== "undefined") {
          viirsTruecolorOverlay.setOpacity(viirsTruecolorOpacity);
      }
 }

  function updateTropomiNO2Opacity() {
      tropomiNO2Opacity = parseFloat(document.getElementById("tropomiNO2OpacityControl").value) / 100.0;
      
      if (satelliteOverlay != null && typeof satelliteOverlay.setMap !== "undefined") {
          satelliteOverlay.setOpacity(tropomiNO2Opacity);
      }
  }

  function updateTempoNO2Opacity() {
      tempoNO2Opacity = parseFloat(document.getElementById("tempoNO2OpacityControl").value) / 100.0;
      
      if (satelliteOverlay != null && typeof satelliteOverlay.setMap !== "undefined") {
          satelliteOverlay.setOpacity(tempoNO2Opacity);
      }
  }


  function getSatelliteUniqueID() {
      // get a unique ID for Satellite data requests
      // This is done only once when a new RETIGO file is loaded. 

      viirsAOD_uniqueID   = ""; // default
      tropomiNO2_uniqueID = ""; // default
      tempoNO2_uniqueID = ""; // default
      $.ajax({
              //url: "https://ofmpub.epa.gov/rsig/rsigserver?SERVICE=retigowms&VERSION=1.3.0&REQUEST=GetId",
              url: rsigserver + "SERVICE=retigowms&VERSION=1.3.0&REQUEST=GetId",
                  dataType: "text",
                  success: function(data, textStatus, jqXHR) {
                  //alert(data);
                      viirsAOD_uniqueID = 'viirsaod-' + data; // all lowercase, no underscores
                      tropomiNO2_uniqueID = 'tropomino2-' + data; // all lowercase, no underscores
                      tempoNO2_uniqueID = 'tempono2-' + data; // all lowercase, no underscores
              },
                  error: function (jqXHR, textStatus, errorThrown) {
                  print("Unique ID for satellite data not issued.");
                  print("status: " + textStatus);
                  print("error: " + errorThrown);
              } 
          });

  }


  function uncheckAllPlotOptions() {
      document.getElementById("addAqsOzone").checked = false;
      document.getElementById("addAqsPm25").checked = false;
      document.getElementById("addAqsPm10").checked = false;
      document.getElementById("addAqsCO").checked = false;
      document.getElementById("addAqsNO2").checked = false;
      document.getElementById("addAqsSO2").checked = false;
      document.getElementById("addSurfmetTemperature").checked = false;
      document.getElementById("addSurfmetPressure").checked = false;
      document.getElementById("addSurfmetWindSpeed").checked = false;
      document.getElementById("addSurfmetWindDirection").checked = false;
      document.getElementById("addPurpleairPM25").checked = false;
      document.getElementById("addMySensor0").checked = false;
      document.getElementById("addMySensor1").checked = false;
      document.getElementById("addMySensor2").checked = false;
      document.getElementById("addMySensor3").checked = false;
      document.getElementById("addMySensor4").checked = false;

      plotFlagAqsOzone = false;
      plotFlagAqsPm25 = false;
      plotFlagAqsPm10 = false;
      plotFlagAqsCO = false;
      plotFlagAqsNO2 = false;
      plotFlagAqsSO2 = false;
      plotFlagSurfmetTemperature = false;
      plotFlagSurfmetPressure = false;
      plotFlagSurfmetWindSpeed = false;
      plotFlagSurfmetWindDirection = false;
      plotFlagPurpleairPM25 = false;
      //plotFlagMySensor = false;
      mySensorArray[0].plotFlag = false;
      mySensorArray[1].plotFlag = false;
      mySensorArray[2].plotFlag = false;
      mySensorArray[3].plotFlag = false;
      mySensorArray[4].plotFlag = false;

      
      //document.getElementById("merge_min").value = "";
      //document.getElementById("merge_max").value = "";
  }


  function toggleAqs(id) {

      var checkState = document.getElementById(id).checked;
      uncheckAllPlotOptions();
      document.getElementById(id).checked = checkState;
    
      if (AQSbbox == "") {
	  AQSbbox = oUserdata.bbox;
      }

      // turn off 2nd variable option
      if ( addAqsPm25.checked || addAqsPm10.checked || addAqsOzone.checked || addAqsCO.checked || addAqsNO2.checked || addAqsSO2.checked )  {
	  document.getElementById("timeseries_secondVar").disabled = true;
      } else {
	  document.getElementById("timeseries_secondVar").disabled = false;
      }


      var bracket_timerange = oUserdata.timerange;
      bracket_timerange = bracket_timerange.replace(/[T](\d{2})/, "T00"); // set initial hour to 00
      bracket_timerange = bracket_timerange.replace(/([T](\d{2}))(?!.*[T](\d{2}))/, "T23"); // set final hour to 23
      //console.log(bracket_timerange);

      plotFlagAqsPm25  = false;
      plotFlagAqsPm10  = false;
      plotFlagAqsOzone = false;
      plotFlagAqsCO    = false;
      plotFlagAqsNO2   = false;
      plotFlagAqsSO2   = false;

      if (addAqsPm25.checked) {
          if (oAirnowPM25.closestTimestamp === undefined) {
              get_airnow_closest('airnow.pm25', AQSbbox, bracket_timerange, rsigserver, 'timeseries');
          }
	  plotFlagAqsPm25 = true;
      } else if (addAqsPm10.checked) {
          if (oAirnowPM10.closestTimestamp === undefined) {
              get_airnow_closest('airnow.pm10', AQSbbox, bracket_timerange, rsigserver, 'timeseries');
          }
	  plotFlagAqsPm10 = true;
      } else if (addAqsOzone.checked) {
          if (oAirnowOzone.closestTimestamp === undefined) {
              get_airnow_closest('airnow.ozone', AQSbbox, bracket_timerange, rsigserver, 'timeseries');
          }
	  plotFlagAqsOzone = true;
      } else if (addAqsCO.checked) {
          if (oAirnowCO.closestTimestamp === undefined) {
              get_airnow_closest('airnow.co', AQSbbox, bracket_timerange, rsigserver, 'timeseries');
          }
	  plotFlagAqsCO = true;
      } else if (addAqsNO2.checked) {
          if (oAirnowNO2.closestTimestamp === undefined) {
              get_airnow_closest('airnow.no2', AQSbbox, bracket_timerange, rsigserver, 'timeseries');
          }
	  plotFlagAqsNO2 = true;
      } else if (addAqsSO2.checked) {
          if (oAirnowSO2.closestTimestamp === undefined) {
              get_airnow_closest('airnow.so2', AQSbbox, bracket_timerange, rsigserver, 'timeseries');
          }
	  plotFlagAqsSO2 = true;
      }

      update_timeseriesPlot();
      //setTimeout("update_scatterplot_menu('" + id + "');", 0);

  }



  function toggleSurfmetTemperature() {
      // first uncheck other surfmet variables, making it behave like a radio button 
      // that can also have every option unchecked
      var checkState = document.getElementById("addSurfmetTemperature").checked;
      uncheckAllPlotOptions();
      document.getElementById("addSurfmetTemperature").checked = checkState;

      if (Surfmetbbox == "") {
	  Surfmetbbox = oUserdata.bbox;
      }

      // turn off 2nd variable option
      if ( addSurfmetTemperature.checked || addSurfmetPressure.checked || addSurfmetWindSpeed.checked || addSurfmetWindDirection.checked)  {
	  document.getElementById("timeseries_secondVar").disabled = true;
      } else {
	  document.getElementById("timeseries_secondVar").disabled = false;
      }

      if (addSurfmetTemperature.checked) {
	  // bracket oUserData.timerange
	  var bracket_timerange = oUserdata.timerange;
	  bracket_timerange = bracket_timerange.replace(/[T](\d{2})/, "T00"); // set initial hour to 00
	  bracket_timerange = bracket_timerange.replace(/([T](\d{2}))(?!.*[T](\d{2}))/, "T23"); // set final hour to 23
	  //console.log(bracket_timerange);
          if (oSurfmetTemperature.closestTimestamp === undefined) {
              get_airnow_closest('metar.temperature', Surfmetbbox, bracket_timerange, rsigserver, 'timeseries');
          }
	  plotFlagSurfmetTemperature = true;
      } else {
	  plotFlagSurfmetTemperature = false;
	  
      }
      update_timeseriesPlot();
  }

  function toggleSurfmetPressure() {
      // first uncheck other surfmet variables, making it behave like a radio button 
      // that can also have every option unchecked
      var checkState = document.getElementById("addSurfmetPressure").checked;
      uncheckAllPlotOptions();
      document.getElementById("addSurfmetPressure").checked = checkState;

      if (Surfmetbbox == "") {
	  Surfmetbbox = oUserdata.bbox;
      }

      // turn off 2nd variable option
      if ( addSurfmetTemperature.checked || addSurfmetPressure.checked || addSurfmetWindSpeed.checked || addSurfmetWindDirection.checked)  {
	  document.getElementById("timeseries_secondVar").disabled = true;
      } else {
	  document.getElementById("timeseries_secondVar").disabled = false;
      }

      if (addSurfmetPressure.checked) {
	  // bracket oUserData.timerange
	  var bracket_timerange = oUserdata.timerange;
	  bracket_timerange = bracket_timerange.replace(/[T](\d{2})/, "T00"); // set initial hour to 00
	  bracket_timerange = bracket_timerange.replace(/([T](\d{2}))(?!.*[T](\d{2}))/, "T23"); // set final hour to 23
	  //console.log(bracket_timerange);
          if (oSurfmetPressure.closestTimestamp === undefined) {
              get_airnow_closest('metar.sealevelpress', Surfmetbbox, bracket_timerange, rsigserver, 'timeseries');
          }
	  plotFlagSurfmetPressure = true;
      } else {
	  plotFlagSurfmetPressure = false;
	  
      }
      update_timeseriesPlot();
  }
  function toggleSurfmetWindSpeed() {
      // first uncheck other surfmet variables, making it behave like a radio button 
      // that can also have every option unchecked
      var checkState = document.getElementById("addSurfmetWindSpeed").checked;
      uncheckAllPlotOptions();
      document.getElementById("addSurfmetWindSpeed").checked = checkState;

      if (Surfmetbbox == "") {
	  Surfmetbbox = oUserdata.bbox;
      }

      // turn off 2nd variable option
      if ( addSurfmetTemperature.checked || addSurfmetPressure.checked || addSurfmetWindSpeed.checked)  {
	  document.getElementById("timeseries_secondVar").disabled = true;
      } else {
	  document.getElementById("timeseries_secondVar").disabled = false;
      }

      if (addSurfmetWindSpeed.checked) {
	  // bracket oUserData.timerange
	  var bracket_timerange = oUserdata.timerange;
	  bracket_timerange = bracket_timerange.replace(/[T](\d{2})/, "T00"); // set initial hour to 00
	  bracket_timerange = bracket_timerange.replace(/([T](\d{2}))(?!.*[T](\d{2}))/, "T23"); // set final hour to 23
	  //console.log(bracket_timerange);
          if (oSurfmetWindSpeed.closestTimestamp === undefined) {
              get_airnow_closest('metar.windspeed', Surfmetbbox, bracket_timerange, rsigserver, 'timeseries');
          }
	  plotFlagSurfmetWindSpeed = true;
      } else {
	  plotFlagSurfmetWindSpeed = false;
	  
      }
      update_timeseriesPlot();
  }

  function toggleSurfmetWindDirection() {
      // first uncheck other surfmet variables, making it behave like a radio button 
      // that can also have every option unchecked
      var checkState = document.getElementById("addSurfmetWindDirection").checked;
      uncheckAllPlotOptions();
      document.getElementById("addSurfmetWindDirection").checked = checkState;

      if (Surfmetbbox == "") {
	  Surfmetbbox = oUserdata.bbox;
      }
      // turn off 2nd variable option
      if ( addSurfmetTemperature.checked || addSurfmetPressure.checked || addSurfmetWindSpeed.checked || addSurfmetWindDirection.checked)  {
	  document.getElementById("timeseries_secondVar").disabled = true;
      } else {
	  document.getElementById("timeseries_secondVar").disabled = false;
      }

      if (addSurfmetWindDirection.checked) {
	  // bracket oUserData.timerange
	  var bracket_timerange = oUserdata.timerange;
	  bracket_timerange = bracket_timerange.replace(/[T](\d{2})/, "T00"); // set initial hour to 00
	  bracket_timerange = bracket_timerange.replace(/([T](\d{2}))(?!.*[T](\d{2}))/, "T23"); // set final hour to 23
	  //console.log(bracket_timerange);
          if (oSurfmetWindDirection.closestTimestamp === undefined) {
              get_airnow_closest('metar.winddir', Surfmetbbox, bracket_timerange, rsigserver, 'timeseries');
          }
	  plotFlagSurfmetWindDirection = true;
      } else {
	  plotFlagSurfmetWindDirection = false;
	  
      }
      update_timeseriesPlot();
  }


  function getPurpleairBbox() {
      // bbox for purpleair will be this big

      let myMinLat = Math.min(...oUserdata.lat[0]);
      let myMaxLat = Math.max(...oUserdata.lat[0]);
      let myMinLon = Math.min(...oUserdata.lon[0]);
      let myMaxLon = Math.max(...oUserdata.lon[0]);

      // default bbox range
      let latRange = 0.85; //degrees
      let lonRange = 0.85; //degrees

      if ( (!isNaN(myMinLat) && myMinLat > -90  && myMinLat < 90)                         &&
           (!isNaN(myMaxLat) && myMaxLat > -90  && myMaxLat < 90  && myMaxLat > myMinLat) &&
           (!isNaN(myMinLon) && myMinLon > -180 && myMinLon < 180)                        &&
           (!isNaN(myMaxLon) && myMaxLon > -180 && myMaxLon < 180 && myMaxLon > myMinLon) ) {

          latRange = 1.5* (myMaxLat - myMinLat);
          lonRange = 1.5* (myMaxLon - myMinLon);

          
      }
      
      let latCenter = myLatLngCenter.lat();
      let lonCenter = myLatLngCenter.lng();
      let minLon = lonCenter - lonRange/2.0;
      let maxLon = lonCenter + lonRange/2.0;
      let minLat = latCenter - latRange/2.0;
      let maxLat = latCenter + latRange/2.0;
      if (minLon < -180) {minLon = -180;}
      if (maxLon >  180) {maxLon =  180;}
      if (minLat <  -90) {minLat =  -90;}
      if (maxLat >   90) {maxLat =   90;}
      
      //Purpleairbbox = oUserdata.bbox;
      Purpleairbbox =  minLon.toString() + ',' + minLat.toString() + ',' +  maxLon.toString() + ',' + maxLat.toString();
  }

  function togglePurpleairPM25() {
      // first uncheck other variables, making it behave like a radio button 
      // that can also have every option unchecked
      var checkState = document.getElementById("addPurpleairPM25").checked;
      uncheckAllPlotOptions();
      document.getElementById("addPurpleairPM25").checked = checkState;

      if (Purpleairbbox == "") {
	  //Purpleairbbox = oUserdata.bbox;
          getPurpleairBbox();
      }

      // turn off 2nd variable option
      //if ( addSurfmetTemperature.checked || addSurfmetPressure.checked || addSurfmetWindSpeed.checked)  {
      //  document.getElementById("timeseries_secondVar").disabled = true;
      //} else {
      //	  document.getElementById("timeseries_secondVar").disabled = false;
      //}

      if (addPurpleairPM25.checked) {
	  // bracket oUserData.timerange
	  var bracket_timerange = oUserdata.timerange;
	  bracket_timerange = bracket_timerange.replace(/[T](\d{2})/, "T00"); // set initial hour to 00
	  bracket_timerange = bracket_timerange.replace(/([T](\d{2}))(?!.*[T](\d{2}))/, "T23"); // set final hour to 23
	  //console.log(bracket_timerange);

          if (oPurpleairPM25.closestTimestamp === undefined || oPurpleairPM25.closestTimestamp.length == 0) {
              get_airnow_closest('purpleair.pm25_corrected', Purpleairbbox, bracket_timerange, rsigserver, 'timeseries');
          }

          //console.log(oPurpleairPM25.closestTimestamp, oPurpleairPM25.closestTimestamp.length);
	  plotFlagPurpleairPM25 = true;
      } else {
	  plotFlagPurpleairPM25 = false;
	  
      }
      update_timeseriesPlot();
      
  }

function getMySensorBbox() {
    // bbox for purpleair will be this big
    //let latRange = 0.85; //degrees
    //let lonRange = 0.85; //degrees
    //
    //let latCenter = myLatLngCenter.lat();
    //let lonCenter = myLatLngCenter.lng();
    //let minLon = lonCenter - lonRange/2.0;
    //let maxLon = lonCenter + lonRange/2.0;
    //let minLat = latCenter - latRange/2.0;
    //let maxLat = latCenter + latRange/2.0;
    let minLon = -180.0;
    let maxLon = 180.0;
    let minLat = -90.0;
    let maxLat = 90.0;
    if (minLon < -180) {minLon = -180;}
    if (maxLon >  180) {maxLon =  180;}
    if (minLat <  -90) {minLat =  -90;}
    if (maxLat >   90) {maxLat =   90;}
    
      //MySensorbbox = oUserdata.bbox;
    MySensorbbox =  minLon.toString() + ',' + minLat.toString() + ',' +  maxLon.toString() + ',' + maxLat.toString();
}







function toggleMySensor(myID) {
    // first uncheck other variables, making it behave like a radio button 
    // that can also have every option unchecked
    
    var checkState = document.getElementById(myID).checked;

    uncheckAllPlotOptions();
    
    document.getElementById(myID).checked = checkState;
    sensorInd = myID.slice(-1);

    if (document.getElementById(myID).checked) {
	// bracket oUserData.timerange
	//var bracket_timerange = oUserdata.timerange;
	//bracket_timerange = bracket_timerange.replace(/[T](\d{2})/, "T00"); // set initial hour to 00
	//bracket_timerange = bracket_timerange.replace(/([T](\d{2}))(?!.*[T](\d{2}))/, "T23"); // set final hour to 23
	////console.log(bracket_timerange);
        //
        //if (oPurpleairPM25.closestTimestamp === undefined || oPurpleairPM25.closestTimestamp.length == 0) {
        //    get_airnow_closest('purpleair.pm25_corrected', Purpleairbbox, bracket_timerange, rsigserver, 'timeseries');
        //}
	//plotFlagMySensor = true;
	mySensorArray[sensorInd].plotFlag = true;
    } else {
	//plotFlagMySensor = false;
	mySensorArray[sensorInd].plotFlag = false;
    }
    update_timeseriesPlot();
}

function resetGUI() {
    setDefaultRadio = true;

    // reset merge options
    //document.getElementById("addModisAod").checked = false;
    document.getElementById("addAqsOzoneLocations").checked = false;
    document.getElementById("addAqsPM25Locations").checked = false;
    document.getElementById("addAqsPM10Locations").checked = false;
    document.getElementById("addAqsCOLocations").checked = false;
    document.getElementById("addAqsNO2Locations").checked = false;
    document.getElementById("addAqsSO2Locations").checked = false;
    document.getElementById("addSurfmetLocations").checked = false;
    document.getElementById("addFirePerimeters").checked = false;
    document.getElementById("addHmsFireLocations").checked = false;
    document.getElementById("addPurpleairLocations").checked = false;
    document.getElementById("addMySensorLocations0").checked = false;
    document.getElementById("addMySensorLocations1").checked = false;
    document.getElementById("addMySensorLocations2").checked = false;
    document.getElementById("addMySensorLocations3").checked = false;
    document.getElementById("addMySensorLocations4").checked = false;
    document.getElementById("addViirsAodMap").checked = false;
    document.getElementById("addViirsTruecolorMap").checked = false;
    document.getElementById("addTropomiNO2Map").checked = false;
    document.getElementById("addTempoNO2Map").checked = false;
    //document.getElementById("addWeather").checked = false;
    document.getElementById("addAqsPm25").checked = false;
    document.getElementById("addAqsPm10").checked = false;
    document.getElementById("addAqsOzone").checked = false;
    document.getElementById("addAqsCO").checked = false;
    document.getElementById("addAqsNO2").checked = false;
    document.getElementById("addAqsSO2").checked = false;
    document.getElementById("addPurpleairPM25").checked = false;
    document.getElementById("addMySensor0").checked = false;
    document.getElementById("addMySensor1").checked = false;
    document.getElementById("addMySensor2").checked = false;
    document.getElementById("addMySensor3").checked = false;
    document.getElementById("addMySensor4").checked = false;
    
    // reset satellite layer opacities
    document.getElementById("viirsAodOpacityControl").value = 70;
    document.getElementById("viirsTruecolorOpacityControl").value = 70;
    document.getElementById("tropomiNO2OpacityControl").value = 70;
    document.getElementById("tempoNO2OpacityControl").value = 70;

    // set avg/block mode to 'avg'
    document.getElementById("Average").checked = true;
    document.getElementById("var0").checked = true;
    //process_timestyle();
    
    // pick "zeroth" variable in list
    document.getElementById("radio0").checked = true;

    // kml export
    document.getElementById("kml-export-no").checked = true;

    
    // reset settings options
    //document.getElementById("plot_symbolfill").checked = false;
    //settings.plotFilledSymbolFlag = false;
    //document.getElementById("color_primaryLightblue").selected = true;
    //settings.plotPrimaryColor = colorNameLookup("Lt. Blue")
    //document.getElementById("color_secondaryMaroon").selected = true;
    //settings.plotSecondaryColor = colorNameLookup("Maroon")
    //document.getElementById("plotPrimaryOpacity").value = 100;
    //document.getElementById("plotSecondaryOpacity").value = 100;

    
    //document.getElementById("timeseriesHourlyOption").disabled = true;
    
    clear_2darray(fastMarker);
    clear_2darray(AqsPM25FastMarker);
    clear_2darray(AqsPM10FastMarker);
    clear_2darray(AqsOzoneFastMarker);
    clear_2darray(AqsCOFastMarker);
    clear_2darray(AqsNO2FastMarker);
    clear_2darray(AqsSO2FastMarker);
    clear_2darray(SurfmetTemperatureFastMarker);
    clear_2darray(SurfmetPressureFastMarker);
    clear_2darray(SurfmetWindSpeedFastMarker);
    clear_2darray(SurfmetWindDirectionFastMarker);
    clear_2darray(PurpleairPM25FastMarker);
    clear_1darray(allMySensorFastMarkers[0]);
    clear_1darray(allMySensorFastMarkers[1]);
    clear_1darray(allMySensorFastMarkers[2]);
    clear_1darray(allMySensorFastMarkers[3]);
    clear_1darray(allMySensorFastMarkers[4]);
    clear_2darray(HmsFireFastMarker);
    clear_2darray(markerLayer);
    clear_2darray(AqsPM25Layer);
    clear_2darray(AqsPM10Layer);
    clear_2darray(AqsOzoneLayer);
    clear_2darray(AqsCOLayer);
    clear_2darray(AqsNO2Layer);
    clear_2darray(AqsSO2Layer);
    clear_2darray(SurfmetTemperatureLayer);
    clear_2darray(SurfmetPressureLayer);
    clear_2darray(SurfmetWindSpeedLayer);
    clear_2darray(SurfmetWindDirectionLayer);
    clear_2darray(PurpleairPM25Layer);
    clear_1darray(allMySensorLayers[0]);
    clear_1darray(allMySensorLayers[1]);
    clear_1darray(allMySensorLayers[2]);
    clear_1darray(allMySensorLayers[3]);
    clear_1darray(allMySensorLayers[4]);
    clear_2darray(HmsFireLayer);
    clear_2darray(singleMarker);
    clear_2darray(allLatLng);
    clear_2darray(idLatLng);
    clear_2darray(connectLatLng);
    
    viirsDateList = [];
    viirsTruecolorDateList = [];
    tropomiNO2DateList = [];
    tempoNO2DateList = [];
    
}

  function back() {

    formClear1();
    resetGUI();
    
    document.getElementById("div_dataDisplay").style.display="none";
    //document.getElementById("div_fileSelection").style.display="block";
    document.getElementById("div_fileSelection").style.display="none";
    
    location.reload(false);
    //debug("fixin' to initialize");
    //reset_verbiage_for_initialize()
    //setTimeout("initialize();", 2000);
    //setTimeout("set_initial_display();", 2000);
    
    // set time slider to zero position
    //setTimeout("$('#time_slider').slider('option', 'value', 0);", 100);
    
    
  }

  function wait(milliSeconds) {
    var startTime = new Date().getTime();
    while ( (new Date().getTime() < startTime + milliSeconds) );
  }

  function formClear1() {
    document.getElementById("user_datafile1").value = "";
    document.getElementById("user_datafile2").value = "";
  }

  function formClear2() {
    document.getElementById("user_datafile2").value = "";
  }

function init_colorbar(x, y, min, max, title, canvas_string, color_table, useExpFormat) {
    
      try {

	  // clear the colorbar
	  //document.getElementById(canvas_string).innerHTML = "";
          childDivs = document.getElementById(canvas_string).getElementsByTagName('div');
          for( i=childDivs.length-1; i>=0; i-- ) {
              childDivs[i].remove();
          }
	  
	  // make colorbar(s) (NOTE: rgb_to_html.pro can help here)
	  jg = new jsGraphics(canvas_string);
	  
	  //color_table = color_table_bluered;
	  
	  //make_colorbar(x, y, 10, ($(window).width()/30) - 5, 20, 2, color_table, min, max, title, jg);

          //var element_width = ($('#' + canvas_string).width()/20);
          var element_width = ($('#' + canvas_string).width()/N_colors);
          var skip = 2; //default
          if (element_width < 25) {
              skip = 4;
          }
          if (element_width < 20) {
              skip = 5;
          }
          if (element_width < 10) {
              skip = 10;
          }
	  //make_colorbar(x, y, 10, element_width, 20, skip, color_table, min, max, title, jg, useExpFormat);
	  make_colorbar(x, y, 10, element_width, N_colors, skip, color_table, min, max, title, jg, useExpFormat);
      } catch (err) { 
	  console.log("ERROR in init_colorbar");
	  console.log(err);  
      }    
  }


  function formEvaluate() {

      reset_verbiage_for_formEvaluate();
      resetGUI();

      getSatelliteUniqueID();

      select('hand_b');
      // make sure page is scrolled to top
      window.scrollTo(0, 0);   
      
      //$("#busy_gif").show();
      busyShow('map'); // hide will be queued to fire later in sortAndProcessData
      
      //setTimeout("initGoogleLatLng()", 100);
      
      document.getElementById("error_textarea").value = "";

      file1LoadedFlag = false; // default

      if (document.getElementById("btnLocalFile").checked || viperLoaded) {

	  document.getElementById("div_fileSelection").style.display="none";
	  document.getElementById("div_dataDisplay").style.display="block";

	  if (viperLoaded) {
	      file1LoadedFlag = true;
	      viperLoaded = false;
	  } else {
	      // load local file
	      fr_file1 = loadFile(document.getElementById("user_datafile1"), false); // not optional
	      fr_file2 = loadFile(document.getElementById("user_datafile2"), true);  // optional
	  }

      } else {
	  // load data from repository
	  var menu = document.getElementById("downloadFileMenu");
	  var filename = menu.options[menu.selectedIndex].innerHTML;
	  
	  if (filename != "Choose File") {
	      $.ajax({
		      url: rsigserver + "SERVICE=retigo&REQUEST=download&KEY=NULL&FILE=" + filename,
			  dataType: "text",
			  success: function(data, textStatus, jqXHR) {
			  document.getElementById("div_fileSelection").style.display="none";
			  document.getElementById("div_dataDisplay").style.display="block";
			  //alert(data);
			  //debug(data);
			  fr_file1 = new Object();
			  fr_file1.result = data;
			  file1LoadedFlag = true;
			  
		      },
			  error: function (jqXHR, textStatus, errorThrown) {
			  print("RETIGO file list not found");
			  print("status: " + textStatus);
			  print("error: " + errorThrown);
		      } 
		  });
	      
	  }
      }

      // timer to check to see if the file is loaded
      checkFileLoad = setInterval(function(){ checkLoadStatus(); }, 1000);



      //let satelliteBounds = new google.maps.LatLngBounds(
      //                                                   new google.maps.LatLng(20.5, -90.0), //SW
      //                                                   new google.maps.LatLng(52.5, -75.0)  //NE
      //                                                   );
      //let satelliteURL = 'https://ofmpub.epa.gov/rsig/rsigserver?SERVICE=retigowms&VERSION=1.3.0&REQUEST=GetMap&LAYERS=viirsnasa.optical_depth_land_and_ocean&STYLES=maplines&CRS=epsg:3857&BBOX=-90,20.5,-75,52.5&WIDTH=1024&HEIGHT=1024&FORMAT=image/png&TIME=2016-10-04T00:00:00Z/2016-10-04T23:59:59Z&MINVAL=0.0&MAXVAL=0.2&ID=4898_1573241784';
      //let satelliteOverlay = new google.maps.GroundOverlay(satelliteURL, satelliteBounds);
      //satelliteOverlay.setOpacity(0.75);
      //satelliteOverlay.setMap(map);
      //console.log(satelliteOverlay);

  }


  function checkLoadStatus() {
      
      //console.log("checking...", file1LoadedFlag, file2LoadedFlag);
     
      if ( file1LoadedFlag) {
          if (document.getElementById("user_datafile2").value == "") {
	      clearInterval(checkFileLoad);
	      initGoogleLatLng();
	      mergedFlag = false;
	      sortAndProcessData(mergedFlag);
          } else if (file2LoadedFlag) {
	      clearInterval(checkFileLoad);
              mergeFileStreams();
	      initGoogleLatLng();
	      mergedFlag = true;
	      sortAndProcessData(mergedFlag);

          }
	 
      }
  }


  function mergeFileStreams() {
      // merge data from two user files into one filestream

      //console.log(fr_file1.result.length, fr_file2.result.length);
      
      let fr1 = remove_comments(fr_file1);
      let fr2 = remove_comments(fr_file2);
      
      //fr1_parse = fr1.split('\r?\n/');
      //fr2_parse = fr2.split('\r?\n/');
      fr1_parse = fr1.split('\n');
      fr2_parse = fr2.split('\n');
      
                  
      // get headers
      fr1_header = fr1_parse[0];
      fr2_header = fr2_parse[0];

      let mergedResult = [];

      if (fr1_header === fr2_header) {
          //console.log("1", fr1_header);
          //console.log("2", fr2_header);

          let idLoc = fr2_header.toUpperCase().split(",").indexOf("ID(-)");

          for (i=0; i<fr1_parse.length; i++) {
              //let thisLineParse = fr1_parse[i].split(",");
              mergedResult[i] = fr1_parse[i];
          }
          

          
          for (i=1; i<fr2_parse.length; i++) {
              //console.log(fr2_parse[i]);
              let thisLineParse = fr2_parse[i].split(",");
              if (thisLineParse.length > 4) {
                  
                  thisLineParse[idLoc] = "opt_" + thisLineParse[idLoc];
                  //console.log(thisLineParse);
                  
                  //fr1_parse[fr1_parse.length] = thisLineParse.join(",");
                  fr1_parse.push(thisLineParse.join(","));

                  //mergedResult[fr1_parse.length + i -1] = thisLineParse.join(",");
                  mergedResult[mergedResult.length] = thisLineParse.join(",");
              }
          }
          //fr_file1.result = fr1_parse.join("\n");
          mergedFilestream.result = mergedResult.join("\n");
          mergedFilestream.result = mergedFilestream.result.substring(0, mergedFilestream.result.length-1);
          
          
          //console.log(fr1_parse);
          //console.log(fr_file1);
          //console.log(fr1_parse.length, fr_file1.result.length);

          //console.log(mergedResult.length);
          //console.log(mergedFilestream);
                      
      } else {
          openEmvlDialog("dialog-merge-filestreams");
          fr_file2 = null;
          mergedFilestream.result = fr_file1.result;
      }

  }

  function sortAndProcessData(mergedFlag) {
      //console.log("in sortAndProcessData()");
      //console.log(fr_file1.length);

      //if (document.getElementById("btnLocalFile").checked) {
      if (1) {
	  
	  // queue up processes using setTimeout
	  
	  //busyWorker = new Worker("busy_worker.js");
	  //busyWorker.postMessage('');
	  //setTimeout('document.getElementById("busyDiv").style.display = "block"', 0);
	  setTimeout('document.getElementById("loader").style.display = "inline-block"', 0);


	  //console.log("sorting 1");
          if (mergedFlag) {
	      setTimeout("sortedData1=sort_by_ID(mergedFilestream, oUserdata)", 0);
          } else {
	      setTimeout("sortedData1=sort_by_ID(fr_file1, oUserdata)", 0);
          }
	  //console.log("sorting 2");
	  //sortedData2=sort_by_ID(fr_file2, 1);
	  sortedData2 = null;
          
	  // merge filestreams
	  //console.log("merging");
	  setTimeout("merge_filestreams(sortedData1, sortedData2, missing_value, fill_value)",0);
	  
	  // get user data
	  //console.log("processing");
	  setTimeout("process_userfile(oFR_merged, document.getElementById('user_datafile1').value, missing_value, fill_value, blocktype_avg, 0, 0, false, true)",0);
	  setTimeout("process_userfile(oFR_mergedBlock, document.getElementById('user_datafile1').value, missing_value, fill_value, blocktype_blk, 1, 1000, true, true)",0);
	  //setTimeout('$("#busy_gif").hide()',0);
	  setTimeout('busyHide("map")',0);
	  //setTimeout('document.getElementById("busyDiv").style.display = "none"', 0);
	  //setTimeout('document.getElementById("loader").style.display = "none"', 0);

      } else {
	  // load data from repository
	  var menu = document.getElementById("downloadFileMenu");
	  var filename = menu.options[menu.selectedIndex].innerHTML;
	  
	  if (filename != "Choose File") {
	      $.ajax({
		      url: rsigserver + "SERVICE=retigo&REQUEST=download&KEY=NULL&FILE=" + filename,
			  dataType: "text",
			  success: function(data, textStatus, jqXHR) {
			  document.getElementById("div_fileSelection").style.display="none";
			  document.getElementById("div_dataDisplay").style.display="block";
			  //alert(data);
			  //debug(data);
			  var fr_file1 = new Object();
			  fr_file1.result = data;
			  
			  //sortedData1=sort_by_ID(fr_file1);
			      sortedData1=sort_by_ID(fr_file1, oUserdata);
			  merge_filestreams(sortedData1, 0, missing_value, fill_value); 
			  process_userfile(oFR_merged, document.getElementById('user_datafile1').value, missing_value, fill_value, blocktype_avg, 0, 0, false, true);
			  process_userfile(oFR_mergedBlock, document.getElementById('user_datafile1').value, missing_value, fill_value, blocktype_blk, 1, 1000, true, true);
			  
		      },
			  error: function (jqXHR, textStatus, errorThrown) {
			  print("RETIGO file list not found");
			  print("status: " + textStatus);
			  print("error: " + errorThrown);
		      } 
		  });
	      
	  }
      }
      
      
      //setTimeout("computeGoogleLatLng(oUserdata, true)", 3000);
      //setTimeout("init_colorbar(25, 25, oUserdata.min[0][get_selected_varselector_index()], oUserdata.max[0][get_selected_varselector_index()], oUserdata.varname[0][get_selected_varselector_index()], 'colorbar_canvas')", 3000);

      setTimeout("computeGoogleLatLng(oUserdata, true)",0);
      // map colorbar
      setTimeout("init_colorbar(cbStartX, cbStartY, oUserdata.min[0][get_selected_varselector_index()], oUserdata.max[0][get_selected_varselector_index()], oUserdata.varname[0][get_selected_varselector_index()], 'colorbar_canvas', color_table,0)",0);
      // windrose colorbar
      setTimeout("init_colorbar(cbStartX, cbStartY, oUserdata.min[0][get_selected_varselector_index()], oUserdata.max[0][get_selected_varselector_index()], oUserdata.varname[0][get_selected_varselector_index()], 'colorbar_canvas_windrose', color_table,0)",0);

      setTimeout("computeCovarianceElementsHourly(sortedData1);", 0);
      setTimeout("computeCovarianceElementsNative();", 0);
      setTimeout("initExternalCovarianceElements();", 0);
      setTimeout("initScatterplotExternalMenuItems();", 0);
      setTimeout("stats_sliderpos_lookup();", 0);
      setTimeout("statsNative_sliderpos_lookup();", 0);
      setTimeout("updateSettings(document.getElementById('fontSize'));");

      
      //      // get optional airnow ozone data
      //if (document.getElementById('Airnow_ozone').checked == true) {
      //  setTimeout("get_Airnow('airnow2.ozone', oUserdata.bbox, oUserdata.timerange, rsigserver)", 5000);
      //}	
      //
      //// get optional airnow pm data
      //if (document.getElementById('Airnow_pm25').checked == true) {
      //  setTimeout("get_Airnow('airnow2.pm25', oUserdata.bbox, oUserdata.timerange, rsigserver)", 5000);
      //}	
      //
      //// get optional surfmet temperature data
      //if (document.getElementById('Surfmet_temperature').checked == true) {
      //  setTimeout("get_Airnow('surfmet.temperature', oUserdata.bbox, oUserdata.timerange, rsigserver)", 5000);
      // }
      //
      //// get closest met info
      //if (document.getElementById('showWeather').checked == true) {
      //  setTimeout("get_met_closest('surfmet.temperature', oUserdata.bbox, oUserdata.timerange, rsigserver)", 5000);
      //  setTimeout("get_met_closest('surfmet.wind_speed', oUserdata.bbox, oUserdata.timerange, rsigserver)", 5000);
      //  setTimeout("get_met_closest('surfmet.wind_direction', oUserdata.bbox, oUserdata.timerange, rsigserver)", 5000);
      //  setTimeout("get_met_closest('surfmet.pressure', oUserdata.bbox, oUserdata.timerange, rsigserver)", 5000);
      //  $("#metInfo").show();
      //}	else {
      //  $("#metInfo").hide();
      //}
      //
      //// get optional KML layer
      //document.getElementById('kmlPlotOptionButton').disabled = true;
      //var kml_file = document.getElementById("user_kmlfile").value;
      //
      //if (kml_file != "") {
      //  kmlLayer = new google.maps.KmlLayer({
      //    url: kml_file, 
      //    preserveViewport: true
      //  });
      //  google.maps.event.addListener(kmlLayer, "status_changed", function() {
      //    print("kml layer status: " + kmlLayer.getStatus());
      //  });
      //}
      
      
      
      
      
      if (kmlLayer != "") {
	  kmlLayer.setMap(map);
	  document.getElementById('kmlPlotOptionButton').checked  = true;
	  document.getElementById('kmlPlotOptionButton').disabled = false;
      }
      
      // display data
      //setTimeout("set_initial_display()", 5000);
      setTimeout("set_initial_display()",0);
      
      // hide analysis, timeseries, scatterplot, and windrose canvases
      $("#analysis_canvas").hide();
      $("#timeseries_canvas").hide();
      $("#timeseries_divider").hide();
      $("#windrose_canvas").hide();
      $("#windrose_canvas_button").hide();
      $("#scatter_canvas").hide();

      // Resize the map twice. For some unknown reason the width of table_td1 changes, which throws off the slider sizing.
      setTimeout("set_mapsize();", 500);
      setTimeout("set_mapsize();", 1000);
      
  }



    // PRINTING FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////////////
    //
    

    function debug(stuff) {
	if (debugOn) {
	    var textarea = document.getElementById("error_textarea");
	    textarea.value += "\n" + stuff;
	    textarea.scrollTop = textarea.scrollHeight;
	}
    }

    function print(stuff) {
      // similar to debug, but for permanent stuff
      var textarea = document.getElementById("error_textarea");
      textarea.value += "\n" + stuff;
      textarea.scrollTop = textarea.scrollHeight;
    }


function export_analysis() {
    update_analysisPlot();
    // export the distance from point and/or line to a text file 
    fname = document.getElementById("user_datafile1").value.replace(/^.*\\/, "").split('.');
    fname = fname[0] + "_ANALYSIS.txt";
    
    print("exporting " + fname);
    
    try {
	var blob = new Blob(analysisExportArray,{type: "text/plain;charset=utf-8"});
	saveAs(blob, fname);
        
    } catch (e) {
	print("File export is not supported by this browser.");
    }
    
}

    function export_scatter() {
        // export the distance from point and/or line to a text file 
        fname = document.getElementById("user_datafile1").value.replace(/^.*\\/, "").split('.');
        fname = fname[0] + "_SCATTERPLOT.txt";
        
        print("exporting " + fname);
        
        export_array = new Array();

        // for data flagger
        flagger  = document.getElementById("excludeFlaggerOption").checked;
        noExport = document.getElementById("chkFlaggerDoNotExport").checked;
        code_constant     = 'C';
        code_missing      = 'M';
        code_outlierStat  = 'T';
        code_outlierSpike = 'P';
        code_above        = 'A';
        code_below        = 'B';
        code_user         = 'U';

        if (flagger && (! noExport) ) {
            export_array.push(['# Data flagger codes: constant=' + code_constant + ', missing=' + code_missing + ', outlierStat=' + code_outlierStat + ', outlierSpike=' + code_outlierSpike + ', aboveValue=' + code_above + ', belowValue=' + code_below + ',  userInvalidated=' + code_user + '\n']);
            export_array.push(['# Data flagger constant repeat num=' + settings.flaggerConstantRepeatNum + '\n']);
            export_array.push(['# Data flagger missing repeat num=' + settings.flaggerMissingRepeatNum + '\n']);
            export_array.push(['# Data flagger missing value=' + settings.flaggerMissingValue + '\n']);
            export_array.push(['# Data flagger outlier stat sd factor value=' + settings.flaggerOutlierStatSDfactor + '\n']);
            export_array.push(['# Data flagger outlier spike time window value=' + settings.flaggerOutlierSpikeTimeWindow + '\n']);
            export_array.push(['# Data flagger outlier spike sd factor value=' + settings.flaggerOutlierSpikeSDfactor + '\n']);
            export_array.push(['# Data flagger above concentration value=' + settings.flaggerAboveConc + '\n']);
            export_array.push(['# Data flagger below concentration value=' + settings.flaggerBelowConc + '\n']);
            export_array.push(['# Data flagger user invalidate start =' + settings.flaggerUserInvalidateStart + '\n']);
            export_array.push(['# Data flagger user invalidate end =' + settings.flaggerUserInvalidateEnd + '\n']);
        }

        
        isHourly = false; // default
        if (document.getElementById('scatterchoiceHourly').checked) {
            isHourly = true;
        }
        
        //xVarIndex = document.getElementById("scatter_xaxisVar").selectedIndex;
        //yVarIndex = document.getElementById("scatter_yaxisVar").selectedIndex;
        xVarIndexHourly = document.getElementById("scatter_xaxisVar").selectedIndex;
        yVarIndexHourly = document.getElementById("scatter_yaxisVar").selectedIndex;
        xVarIndexNative = document.getElementById("scatterNative_xaxisVar").selectedIndex;
        yVarIndexNative = document.getElementById("scatterNative_yaxisVar").selectedIndex;

        if (isHourly) {
            corArray = oStatsHourly;
            if (xVarIndexHourly >= oStatsHourly.nVars) {
                xIsExternalFlag = true;
                xStatsArray = oStatsHourlyExternal;
                xVarIndexPush = oStatsHourlyExternal.menuItems.indexOf(xVarName); //variable index in the statsExternal array
            }
            if (yVarIndexHourly >= oStatsHourly.nVars) {
                yIsExternalFlag = true;
                yStatsArray = oStatsHourlyExternal;
                yVarIndexPush = oStatsHourlyExternal.menuItems.indexOf(yVarName); //variable index in the statsExternal array
            }
        } else {
            corArray = oStatsNative;
            xStatsArray   = oStatsNative;
            yStatsArray   = oStatsNative;
            xVarIndexPush = xVarIndexNative;
            yVarIndexPush = yVarIndexNative;
        }
        
        // linear regression info
        //export_array.push('X-variable: '            + xStatsArray.varName[xVarIndexPush] + '\n');
        //export_array.push('Y-variable: '            + yStatsArray.varName[yVarIndexPush] + '\n');
        export_array.push('X-variable: '            + xStatsArray.varName[xVarIndexPush] + '\n');
        export_array.push('Y-variable: '            + yStatsArray.varName[yVarIndexPush] + '\n');
        export_array.push('correlation_coef: '      + corArray.cor + '\n');
        export_array.push('regression_yintercept: ' + corArray.regression_yint + '\n');
        export_array.push('regression_slope: '      + corArray.regression_slope + '\n');
        export_array.push('rms_error: '             + corArray.rmsError + '\n');
        
        // build header for data
        export_array.push('data:' + '\n');
        //export_array.push('Timestamp(UTC),' + xStatsArray.varName[xVarIndexPush] + ',' + yStatsArray.varName[yVarIndexPush] + ',' + 'isValidPoint\n');
        export_array.push('Timestamp(UTC),' + xStatsArray.varName[xVarIndexPush] + ',' + yStatsArray.varName[yVarIndexPush]);

        if (flagger && (! noExport)) {
            export_array.push([',' + 'DataFlaggerCodes']);
        }

         export_array.push('\n');
        
        // data
        if (isHourly) {
            for (hour=0; hour<oStatsHourly.nHours; hour++) {
                if (oStatsHourly.timestamp[hour] != "") {
                    export_array.push(oStatsHourly.timestring[hour] + ',' + xStatsArray.hourAvg[xVarIndexPush][hour] + ',' + yStatsArray.hourAvg[yVarIndexPush][hour] + ',' + oStatsHourly.validFlag[hour]   + '\n');
                }
            }
        } else {
            for (tInd=0; tInd<oUserdata.msec[selected_block].length; tInd++) {
                thisMsec = oUserdata.msec[selected_block][tInd];
                if (oStatsNative.timestamp[tInd] != "") {
                    if ( (!flagger) || (flagger && (!isMsecFlagged(thisMsec))) || (flagger && isMsecFlagged(thisMsec) && (!noExport)) ) {
                        //export_array.push(oStatsNative.timestring[tInd] + ',' + xStatsArray.data[xVarIndexPush][tInd] + ',' + yStatsArray.data[yVarIndexPush][tInd] + ',' + oStatsNative.validFlag[tInd]   + '\n');
                        export_array.push(oStatsNative.timestring[tInd] + ',' + xStatsArray.data[xVarIndexPush][tInd] + ',' + yStatsArray.data[yVarIndexPush][tInd]);

                        // write data flagger codes to export array
                        if (flagger && (! noExport)) {
                            
                            codeString = ""; //default passed
                            dataMsec = oStatsNative.timestamp[tInd];
                            if (oUserdata.flagged_constant_msec.indexOf(dataMsec) > 0)        { codeString += code_constant }
                            if (oUserdata.flagged_longMissing_msec.indexOf(dataMsec) > 0)     { codeString += code_missing }
                            if (oUserdata.flagged_outlierStat_msec.indexOf(dataMsec) > 0)     { codeString += code_outlierStat }
                            if (oUserdata.flagged_outlierSpike_msec.indexOf(dataMsec) > 0)    { codeString += code_outlierSpike }
                            if (oUserdata.flagged_aboveConc_msec.indexOf(dataMsec) > 0)       { codeString += code_above }
                            if (oUserdata.flagged_belowConc_msec.indexOf(dataMsec) > 0)       { codeString += code_below }
                            if (oUserdata.flagged_userInvalidated_msec.indexOf(dataMsec) > 0) { codeString += code_user }
                            export_array.push(',' + codeString);
                            //console.log(oStatsNative.timestring[tInd], codeString);
                        }

                        export_array.push('\n');
                    }
                }
            }
        }
        
        
        try {
	    var blob = new Blob(export_array,{type: "text/plain;charset=utf-8"});
	    saveAs(blob, fname);
            
        } catch (e) {
	    print("File export is not supported by this browser.");
        }
        
    }

function export_scatter_correction() {

    var xVarIndex = document.getElementById("scatter_xaxisVar").selectedIndex;
    var yVarIndex = document.getElementById("scatter_yaxisVar").selectedIndex;
    var xVarName  = document.getElementById("scatter_xaxisVar").value;
    var yVarName  = document.getElementById("scatter_yaxisVar").value;
    
    // figure out if the y-axis variable corresponds to one of the user's variables
    if (yVarIndex < oStatsHourly.nVars) {
        // the y-axis variable corresponds to a user variable
        yRawVarName = yVarName.substring(7); // remove "Hourly " that was prepended in compute_stats
        //var filename  = yRawVarName + "_corrected.csv";
        var filename  = "retigo_corrected_data.csv";

        dialogText = "Your " + yRawVarName + " data will have the linear regression correction applied, and exported to the file " + filename + ". Do you want to proceed?";

    } else {
        // the y-axis variable is an external variable
        dialogText = "The selected y-axis variable is not in your original input data file. File export is invalid."; // make sure this text contains the word "invalid".
    }

    
    
    document.getElementById("dialog-scatterplot-correction").innerHTML = dialogText;
    
    openEmvlDialog("dialog-scatterplot-correction");

}

function process_scatterplot_correction() {

    var xVarIndex = document.getElementById("scatter_xaxisVar").selectedIndex;
    var yVarIndex = document.getElementById("scatter_yaxisVar").selectedIndex;
    var xVarName  = document.getElementById("scatter_xaxisVar").value;
    var yVarName  = document.getElementById("scatter_yaxisVar").value.toUpperCase().replace("HOURLY ", "");

    isHourly = false; // default
    if (document.getElementById('scatterchoiceHourly').checked) {
        isHourly = true;
    }
    
    var export_array = new Array();

    if (isHourly) {
        // for data flagger
        flagger  = document.getElementById("excludeFlaggerOption").checked;
        noExport = document.getElementById("chkFlaggerDoNotExport").checked;
        code_constant     = 'C';
        code_missing      = 'M';
        code_outlierStat  = 'T';
        code_outlierSpike = 'P';
        code_above        = 'A';
        code_below        = 'B';
        code_user         = 'U';
        
        if (flagger && (! noExport) ) {
//            export_array.push(['# Data flagger codes: constant=' + code_constant + ', missing=' + code_missing + ', outlierStat=' + code_outlierStat + ', outlierSpike=' + code_outlierSpike + ', aboveValue=' + code_above + ', belowValue=' + code_below + ',  userInvalidated=' + code_user + '\n']);
//            export_array.push(['# Data flagger constant repeat num=' + settings.flaggerConstantRepeatNum + '\n']);
//            export_array.push(['# Data flagger missing repeat num=' + settings.flaggerMissingRepeatNum + '\n']);
//            export_array.push(['# Data flagger missing value=' + settings.flaggerMissingValue + '\n']);
//            export_array.push(['# Data flagger outlier stat sd factor value=' + settings.flaggerOutlierStatSDfactor + '\n']);
//            export_array.push(['# Data flagger outlier spike time window value=' + settings.flaggerOutlierSpikeTimeWindow + '\n']);
//            export_array.push(['# Data flagger outlier spike sd factor value=' + settings.flaggerOutlierSpikeSDfactor + '\n']);
//            export_array.push(['# Data flagger above concentration value=' + settings.flaggerAboveConc + '\n']);
//            export_array.push(['# Data flagger below concentration value=' + settings.flaggerBelowConc + '\n']);
//            export_array.push(['# Data flagger user invalidate start =' + settings.flaggerUserInvalidateStart + '\n']);
//            export_array.push(['# Data flagger user invalidate end =' + settings.flaggerUserInvalidateEnd + '\n']);
        }
    }

    
    var origFilename = "";
    if (document.getElementById("btnLocalFile").checked || viperLoaded) {
        origFilename = document.getElementById("user_datafile1").value;
    } else {
        menu = document.getElementById("downloadFileMenu");
	origFilename = menu.options[menu.selectedIndex].innerHTML; 
    }

    export_array.push("## Original file: " + origFilename + '\n');
    export_array.push("## Correction applied based on:\n");
    export_array.push('##   X-variable: '            + xVarName                           + '\n');
    export_array.push('##   Y-variable: '            + yVarName                           + '\n');
    export_array.push("##   correlation_coef: "      + oStatsHourly.cor                         + '\n');
    export_array.push('##   regression_yintercept: ' + oStatsHourly.regression_yint             + '\n');
    export_array.push('##   regression_slope: '      + oStatsHourly.regression_slope            + '\n');
    export_array.push('##   rms_error: '             + oStatsHourly.rmsError                    + '\n');
    
    header = "";
    for (ind=0; ind<oUserdata.fileLinesA.length; ind++) {
        if (oUserdata.fileLinesA[ind].toString().charAt(0) != '#' && oUserdata.fileLinesA[ind].toString().charAt(0) != "") {
            thisLine = oUserdata.fileLinesA[ind];
            thisLineParse = thisLine.split(oUserdata.delimiter);
            
            // grab and parse header, and write the pertinent part to the export array
            if (header.length == 0) {
                header = thisLine.toUpperCase(); // first non comment line
                headerParse  = header.split(oUserdata.delimiter);
                // write header to export array
                export_array.push(headerParse[oHeaderColumn1.timestamp] + ',' +
                                  headerParse[oHeaderColumn1.longitude] + ',' +
                                  headerParse[oHeaderColumn1.latitude]  + ',' +
                                  headerParse[oHeaderColumn1.id]        + ',' +
                                  headerParse[headerParse.indexOf(yVarName)] + '\n');
            }


            // write corrected data to the export array
            origData = thisLineParse[headerParse.indexOf(yVarName)];
            if (origData != missing_value) {
                correctedData = (origData - oStatsHourly.regression_yint) / oStatsHourly.regression_slope;
            } else {
                correctedData = missing_value;
            }
            if (oUserdata.fileLinesA[ind].toString().toUpperCase().charAt(0) != 'T') {
                export_array.push(thisLineParse[oHeaderColumn1.timestamp] + ',' +
                                  thisLineParse[oHeaderColumn1.longitude] + ',' +
                                  thisLineParse[oHeaderColumn1.latitude]  + ',' +
                                  thisLineParse[oHeaderColumn1.id]        + ',' +
                                  correctedData                           + '\n');
            }
        }
    }

    fname = 'retigo_corrected_data.csv';
    try {
	var blob = new Blob(export_array,{type: "text/plain;charset=utf-8"});
	saveAs(blob, fname);
        
    } catch (e) {
	print("File export is not supported by this browser.");
    }
    
}

function export_cferst() {    
    fname = document.getElementById("user_datafile1").value.replace(/^.*\\/, "").split('.');
    fname = fname[0] + "_GIS.csv";
    
    print("exporting " + fname);
    
    nvars = oUserdata.varname[selected_block].length; 
    export_array = new Array();
    
    // for data flagger
    flagger  = document.getElementById("excludeFlaggerOption").checked;
    noExport = document.getElementById("chkFlaggerDoNotExport").checked;
    code_constant     = 'C';
    code_missing      = 'M';
    code_outlierStat  = 'T';
    code_outlierSpike = 'P';
    code_above        = 'A';
    code_below        = 'B';
    code_user         = 'U';
    
    if (flagger && (! noExport) ) {
        export_array.push(['# Data flagger codes: constant=' + code_constant + ', missing=' + code_missing + ', outlierStat=' + code_outlierStat + ', outlierSpike=' + code_outlierSpike + ', aboveValue=' + code_above + ', belowValue=' + code_below + ',  userInvalidated=' + code_user + '\n']);
        export_array.push(['# Data flagger constant repeat num=' + settings.flaggerConstantRepeatNum + '\n']);
        export_array.push(['# Data flagger missing repeat num=' + settings.flaggerMissingRepeatNum + '\n']);
        export_array.push(['# Data flagger missing value=' + settings.flaggerMissingValue + '\n']);
        export_array.push(['# Data flagger outlier stat sd factor value=' + settings.flaggerOutlierStatSDfactor + '\n']);
        export_array.push(['# Data flagger outlier spike time window value=' + settings.flaggerOutlierSpikeTimeWindow + '\n']);
        export_array.push(['# Data flagger outlier spike sd factor value=' + settings.flaggerOutlierSpikeSDfactor + '\n']);
        export_array.push(['# Data flagger above concentration value=' + settings.flaggerAboveConc + '\n']);
        export_array.push(['# Data flagger below concentration value=' + settings.flaggerBelowConc + '\n']);
        export_array.push(['# Data flagger user invalidate start =' + settings.flaggerUserInvalidateStart + '\n']);
        export_array.push(['# Data flagger user invalidate end =' + settings.flaggerUserInvalidateEnd + '\n']);
    }

    
    // build header
    export_array.push(['Date,Time(GMT),Latitude,Longitude,']);
    for (vInd=0; vInd<nvars; vInd++){
        export_array.push(oUserdata.varname[selected_block][vInd]);
        if (vInd < nvars-1) {
            export_array.push(',');
        }
    }
    if (flagger && (! noExport)) {
        export_array.push([',' + 'DataFlaggerCodes']);
    }
    
    export_array.push('\n');
    
    // write data
    var max_eInd = Math.min(oUserdata.lon[selected_block].length, 1000);
    for (eInd=0; eInd<max_eInd; eInd++) { // loop over all datapoints
        this_dateObj = create_dateObjectUTC(oUserdata.timestamp[selected_block][eInd]);
        this_day     = get_date(this_dateObj);
        this_timegmt = get_time(this_dateObj);
        thisMsec     = oUserdata.msec[selected_block][eInd];
        if ( (!flagger) || (flagger && (!isMsecFlagged(thisMsec))) || (flagger && isMsecFlagged(thisMsec) && (!noExport)) ) {
            export_array.push([this_day + ',' + this_timegmt + ',' + oUserdata.lat[selected_block][eInd].toFixed(6) + ',' + oUserdata.lon[selected_block][eInd].toFixed(6) + ',']);
        
            // loop over variables
            for (vInd=0; vInd<nvars; vInd++){
                export_array.push(oUserdata.variable[selected_block][vInd][eInd].toFixed(6));
                if (vInd < nvars-1) {
                    export_array.push(',');
                }
            }
        

            // write data flagger codes to export array
            if (flagger && (! noExport)) {
                
                codeString = ""; //default passed
                dataMsec = oUserdata.msec[selected_block][eInd];
                if (oUserdata.flagged_constant_msec.indexOf(dataMsec) > 0)        { codeString += code_constant }
                if (oUserdata.flagged_longMissing_msec.indexOf(dataMsec) > 0)     { codeString += code_missing }
                if (oUserdata.flagged_outlierStat_msec.indexOf(dataMsec) > 0)     { codeString += code_outlierStat }
                if (oUserdata.flagged_outlierSpike_msec.indexOf(dataMsec) > 0)    { codeString += code_outlierSpike }
                if (oUserdata.flagged_aboveConc_msec.indexOf(dataMsec) > 0)       { codeString += code_above }
                if (oUserdata.flagged_belowConc_msec.indexOf(dataMsec) > 0)       { codeString += code_below }
                if (oUserdata.flagged_userInvalidated_msec.indexOf(dataMsec) > 0) { codeString += code_user }
                export_array.push(',' + codeString);
            }	
        
            export_array.push('\n');
        }
    }
    
    try {
	var blob = new Blob(export_array,{type: "text/plain;charset=utf-8"});
	saveAs(blob, fname);
    } catch (e) {
	print("File export is not supported by this browser.");
    }   
}

function createKmlColorbarImages(canvasIndex) {
    
//    html2canvas(document.getElementById(kml_canvas_array[canvasIndex]), {
//	onrendered: function(canvas) {
//	    myImg = canvas.toDataURL("image/png", [0.0, 1.0]).split(',')[1];
//            kml_colorbar_imgarray[canvasIndex] = myImg;
//	    if (canvasIndex == kml_canvas_array.length-1) {
//                // finalize kml
//                finalizeKML_timer = setInterval(finalizeKML, 1000);
//                //finalizeKML();
//                
//            } else {
//                // get the next colorbar image
//                if (canvasIndex < kml_canvas_array.length-1) {
//                    createKmlColorbarImages(canvasIndex+1);
//                }
//            }
//	}
//    });

    try {
        html2canvas(document.getElementById(kml_canvas_array[canvasIndex])).then(canvas => {
            myImg = canvas.toDataURL("image/png", [0.0, 1.0]).split(',')[1];
            kml_colorbar_imgarray[canvasIndex] = myImg;
	    if (canvasIndex == kml_canvas_array.length-1) {
                // finalize kml
                finalizeKML_timer = setInterval(finalizeKML, 1000);
                //finalizeKML();
                
            } else {
                // get the next colorbar image
                if (canvasIndex < kml_canvas_array.length-1) {
                    createKmlColorbarImages(canvasIndex+1);
                }
            }
        });
    } catch (e) {
        console.log(e);
	alert("Sorry, html2canvas is not\nsupported on this browser");
    }

    
}

function createKmlUsericonImages() {

    // data colors
    for (ii=0; ii<N_colors; ii++) {
        myImg = new Image();
        //myImg.src = "https://ofmpub.epa.gov/rsig/rsigserver?retigo/stable/images/" + concSymbolDir + "/conc_" + zeroPad(ii, 2) + ".gif"; 
        myImg.src = imageserver + "images/" + concSymbolDir + "/conc_" + zeroPad(ii, 2) + ".gif"; 
        kml_usericon_imgarray[ii] = myImg;
    }

    // fill
    myImg = new Image();
    //myImg.src = "https://ofmpub.epa.gov/rsig/rsigserver?retigo/stable/images/" + concSymbolDir + "/conc_fill.gif"; 
    myImg.src = imageserver + "images/" + concSymbolDir + "/conc_fill.gif"; 
    kml_usericon_imgarray[N_colors] = myImg;

    // missing
    myImg = new Image();
    //myImg.src = "https://ofmpub.epa.gov/rsig/rsigserver?retigo/stable/images/" + concSymbolDir + "/conc_missing.gif"; 
    myImg.src = imageserver + "images/" + concSymbolDir + "/conc_missing.gif"; 
    kml_usericon_imgarray[N_colors+1] = myImg;
    
}


function createKmlAirnowiconImages(airnowObject, myColormap) {

    airnowObject.imgArray = new Array();
    thisType = "";
    if (airnowObject.handle == "airnow_ozone") {
        thisType = "ozone_balloon_" + myColormap.replace("_inverted", "");
    } else if (airnowObject.handle == "airnow_pm25") {
        thisType = "pm25_balloon_" + myColormap.replace("_inverted", "");
    } else if (airnowObject.handle == "airnow_pm10") {
        thisType = "pm10_balloon_" + myColormap.replace("_inverted", "");
    } else if (airnowObject.handle == "airnow_co") {
        thisType = "co_balloon_" + myColormap.replace("_inverted", "");
    } else if (airnowObject.handle == "airnow_no2") {
        thisType = "no2_balloon_" + myColormap.replace("_inverted", "");
    } else if (airnowObject.handle == "airnow_so2") {
        thisType = "so2_balloon_" + myColormap.replace("_inverted", "");
    }

    thisPrefixParse = thisType.split('_');
    thisPrefix      = thisPrefixParse[0] + "_" + thisPrefixParse[1] + "_";
    airnowObject.nImgsLoaded = 0;
    for (ii=0; ii<N_colors; ii++) {
        myImg = new Image();
        //myImg.src = "https://ofmpub.epa.gov/rsig/rsigserver?retigo/stable/images/airnow_balloons/" + thisType + "/" + thisPrefix + zeroPad(ii, 2) + ".png";
        myImg.src = imageserver + "images/airnow_balloons/" + thisType + "/" + thisPrefix + zeroPad(ii, 2) + ".png";
        myImg.alt = myColormap;
        myImg.onload = function() { airnowObject.nImgsLoaded += 1; }
        airnowObject.imgArray[ii] = myImg;
    }
    myImg = new Image();
    //myImg.src = "https://ofmpub.epa.gov/rsig/rsigserver?retigo/stable/images/airnow_balloons/" + thisType + "/" + thisPrefix + "missing.png"; 
    myImg.src = imageserver + "images/airnow_balloons/" + thisType + "/" + thisPrefix + "missing.png"; 
    myImg.alt = thisColormap;
    myImg.onload = function() { airnowObject.nImgsLoaded += 1; }
    airnowObject.imgArray[ii] = myImg;

}

function createKmlPurpleairiconImages() {

    typeList = ["purpleair_pm25_bluemono",
                "purpleair_pm25_bluered",
                "purpleair_pm25_colorsafe",
                "purpleair_pm25_stdgamma2",
                "purpleair_pm25_viridis"];

    for (typeInd=0; typeInd<typeList.length; typeInd++) {
        kml_purpleairicon_imgarray[typeInd] = new Array();
        thisType        = typeList[typeInd];
        thisPrefixParse = thisType.split('_');
        thisPrefix      = thisPrefixParse[0] + "_" + thisPrefixParse[1] + "_";
        thisColormap    = thisPrefixParse[2];
        for (ii=0; ii<N_colors; ii++) {
            myImg = new Image();
            //myImg.src = "https://ofmpub.epa.gov/rsig/rsigserver?retigo/stable/images/" + thisType + "/purpleair_square_" + zeroPad(ii, 2) + ".png";
            myImg.src = imageserver + "images/" + thisType + "/purpleair_square_" + zeroPad(ii, 2) + ".png";
            myImg.alt = thisColormap;
            kml_purpleairicon_imgarray[typeInd][ii] = myImg;
        }
        myImg = new Image();
        //myImg.src = "https://ofmpub.epa.gov/rsig/rsigserver?retigo/stable/images/" + thisType + "/purpleair_square_missing.png"; 
        myImg.src = imageserver + "images/" + thisType + "/purpleair_square_missing.png"; 
        myImg.alt = thisColormap;
        kml_purpleairicon_imgarray[typeInd][ii] = myImg;
    }
}

function createKmlMysensoriconImages(mysensorObject, myColormap) {

    mysensorObject.imgArray = new Array();
    thisType = "";
    if (mysensorObject.name == "mysensor0") {
        thisType = "mysensor_balloon1_" + myColormap.replace("_inverted", "");
    } else if (mysensorObject.name == "mysensor1") {
        thisType = "mysensor_balloon2_" + myColormap.replace("_inverted", "");
    } else if (mysensorObject.name == "mysensor2") {
        thisType = "mysensor_balloon3_" + myColormap.replace("_inverted", "");
    } else if (mysensorObject.name == "mysensor3") {
        thisType = "mysensor_balloon4_" + myColormap.replace("_inverted", "");
    } else if (mysensorObject.name == "mysensor4") {
        thisType = "mysensor_balloon5_" + myColormap.replace("_inverted", "");
    }

    thisPrefixParse = thisType.split('_');
    thisPrefix      = thisPrefixParse[0] + "_" + thisPrefixParse[1] + "_";

    mysensorObject.nImgsLoaded = 0;
    for (ii=0; ii<N_colors; ii++) {
        myImg = new Image();
        //myImg.src = "https://ofmpub.epa.gov/rsig/rsigserver?retigo/stable/images/mysensor_balloons/" + thisType + "/" + thisPrefix + zeroPad(ii, 2) + ".png";
        myImg.src = imageserver + "images/mysensor_balloons/" + thisType + "/" + thisPrefix + zeroPad(ii, 2) + ".png";
        myImg.alt = thisColormap;
        myImg.onload = function() { mysensorObject.nImgsLoaded += 1; }
        mysensorObject.imgArray[ii] = myImg;
    }
    myImg = new Image();
    //myImg.src = "https://ofmpub.epa.gov/rsig/rsigserver?retigo/stable/images/mysensor_balloons/" + thisType + "/" + thisPrefix + "missing.png"; 
    myImg.src = imageserver + "images/mysensor_balloons/" + thisType + "/" + thisPrefix + "missing.png"; 
    myImg.alt = thisColormap;
    myImg.onload = function() { mysensorObject.nImgsLoaded += 1; }
    mysensorObject.imgArray[ii] = myImg;
    
}

function createKmlMisciconImages() {
    // these misc images do not have a colormap applied
    
    typeList = ["fire_icon",
                "metar3_temperature",
                "metar3_pressure",
                "metar3_windspeed",
                "metar3_winddirection"];

    for (typeInd=0; typeInd<typeList.length; typeInd++) {
        thisType        = typeList[typeInd];
        myImg = new Image();
        //myImg.src = "https://ofmpub.epa.gov/rsig/rsigserver?retigo/stable/images/" + thisType + ".png";
        myImg.src = imageserver + "images/" + thisType + ".png";
        kml_miscicon_imgarray[typeInd] = myImg;
    }
}


function finalizeKML() {
    // The export array has been created and all of the
    // colorbar images have been created. Now finalize the
    // KML and write the file
    //console.log("in finalizeKML", finalizeKML_timer);
    
    var keep_going = true;
    if ( (document.getElementById("addAqsOzoneLocations").checked  && oAirnowOzone.oSlider_indices)     && oAirnowOzone.nImgsLoaded     != N_colors+1 ) { keep_going = false; }
    if ( (document.getElementById("addAqsPM25Locations").checked   && oAirnowPM25.oSlider_indices)      && oAirnowPM25.nImgsLoaded      != N_colors+1 ) { keep_going = false; }
    if ( (document.getElementById("addAqsPM10Locations").checked   && oAirnowPM10.oSlider_indices)      && oAirnowPM10.nImgsLoaded      != N_colors+1 ) { keep_going = false; }
    if ( (document.getElementById("addAqsCOLocations").checked     && oAirnowCO.oSlider_indices)        && oAirnowCO.nImgsLoaded        != N_colors+1 ) { keep_going = false; }
    if ( (document.getElementById("addAqsNO2Locations").checked    && oAirnowNO2.oSlider_indices)       && oAirnowNO2.nImgsLoaded       != N_colors+1 ) { keep_going = false; }
    if ( (document.getElementById("addAqsSO2Locations").checked    && oAirnowSO2.oSlider_indices)       && oAirnowSO2.nImgsLoaded       != N_colors+1 ) { keep_going = false; }
    if ( (document.getElementById("addMySensorLocations0").checked && mySensorArray[0].oSlider_indices) && mySensorArray[0].nImgsLoaded != N_colors+1 ) { keep_going = false; }
    if ( (document.getElementById("addMySensorLocations1").checked && mySensorArray[1].oSlider_indices) && mySensorArray[1].nImgsLoaded != N_colors+1 ) { keep_going = false; }
    if ( (document.getElementById("addMySensorLocations2").checked && mySensorArray[2].oSlider_indices) && mySensorArray[2].nImgsLoaded != N_colors+1 ) { keep_going = false; }
    if ( (document.getElementById("addMySensorLocations3").checked && mySensorArray[3].oSlider_indices) && mySensorArray[3].nImgsLoaded != N_colors+1 ) { keep_going = false; }
    if ( (document.getElementById("addMySensorLocations4").checked && mySensorArray[4].oSlider_indices) && mySensorArray[4].nImgsLoaded != N_colors+1 ) { keep_going = false; }
    if (keep_going == false) {
        console.log("Waiting on icon images to load");
        return;
    } else {
        clearInterval(finalizeKML_timer);
    }

    try {
        var export_blob = new Blob(kml_export_array, {type: "text/plain;charset=utf-8"});
        var zip = new JSZip();
        zip.file(kml_fname, export_blob);

        // colorbars
        for (imgInd=0; imgInd<kml_canvas_array.length; imgInd++) {
            colorbarFileName = kml_canvas_array[imgInd] + ".png";
            thisImg = kml_colorbar_imgarray[imgInd];
            var img = zip.folder("colorbars");
            img.file(colorbarFileName, thisImg, {base64: true});
        }

        // user icons
        //console.log(N_colors, kml_usericon_imgarray.length);
        for (imgInd=0; imgInd<kml_usericon_imgarray.length; imgInd++) {
            //usericonFileName = kml_usericon_array[imgInd] + ".png";

            usericonFileName = "";
            if (imgInd < N_colors) {
                usericonFileName = "conc_" + zeroPad(imgInd, 2) + ".png";
            } else if (imgInd == N_colors) {
                usericonFileName = "conc_fill.png";
            } else {
                usericonFileName = "conc_missing.png";
            }

            var c = document.createElement('canvas');
            var imgg = kml_usericon_imgarray[imgInd];
            c.height = imgg.naturalHeight;
            c.width = imgg.naturalWidth;
            var ctx = c.getContext('2d');
            ctx.drawImage(imgg, 0, 0, c.width, c.height);
            var base64String = c.toDataURL();
            //console.log(usericonFileName, base64String);
            
            thisImg = base64String.split(',')[1];
            var img = zip.folder("usericons");
            img.file(usericonFileName, thisImg, {base64: true});
        }

        // airnow icons
        //typeList = [["co_balloon_bluemono",     "colorbar_canvas_airnowCO"],
        //            ["co_balloon_bluered",      "colorbar_canvas_airnowCO"],
        //            ["co_balloon_colorsafe",    "colorbar_canvas_airnowCO"],
        //            ["co_balloon_stdgamma2",    "colorbar_canvas_airnowCO"],
        //            ["co_balloon_viridis",      "colorbar_canvas_airnowCO"],
        //            ["no2_balloon_bluemono",    "colorbar_canvas_airnowNO2"],
        //            ["no2_balloon_bluered",     "colorbar_canvas_airnowNO2"],
        //            ["no2_balloon_colorsafe",   "colorbar_canvas_airnowNO2"],
        //            ["no2_balloon_stdgamma2",   "colorbar_canvas_airnowNO2"],
        //            ["no2_balloon_viridis",     "colorbar_canvas_airnowNO2"],
        //            ["ozone_balloon_bluemono",  "colorbar_canvas_airnowO3"],
        //            ["ozone_balloon_bluered",   "colorbar_canvas_airnowO3"],
        //            ["ozone_balloon_colorsafe", "colorbar_canvas_airnowO3"],
        //            ["ozone_balloon_stdgamma2", "colorbar_canvas_airnowO3"],
        //            ["ozone_balloon_viridis",   "colorbar_canvas_airnowO3"],
        //            ["pm25_balloon_bluemono",   "colorbar_canvas_airnowPM25"],
        //            ["pm25_balloon_bluered",    "colorbar_canvas_airnowPM25"],
        //            ["pm25_balloon_colorsafe",  "colorbar_canvas_airnowPM25"],
        //            ["pm25_balloon_stdgamma2",  "colorbar_canvas_airnowPM25"],
        //            ["pm25_balloon_viridis",    "colorbar_canvas_airnowPM25"],
        //            ["so2_balloon_bluemono",    "colorbar_canvas_airnowSO2"],
        //            ["so2_balloon_bluered",     "colorbar_canvas_airnowSO2"],
        //            ["so2_balloon_colorsafe",   "colorbar_canvas_airnowSO2"],
        //            ["so2_balloon_stdgamma2",   "colorbar_canvas_airnowSO2"],
        //            ["so2_balloon_viridis",     "colorbar_canvas_airnowSO2"]];

        typeList = [];
        if (document.getElementById("addAqsOzoneLocations").checked && oAirnowOzone.oSlider_indices) {
            thisColormap = document.getElementById("colormap_AqsO3").selectedOptions[0].id;
            typeList.push(["ozone_balloon_" + thisColormap.replace("_inverted", ""), "colorbar_canvas_airnowO3"]);
        }
        if (document.getElementById("addAqsPM25Locations").checked && oAirnowPM25.oSlider_indices) {
            thisColormap = document.getElementById("colormap_AqsPM25").selectedOptions[0].id;
            typeList.push(["pm25_balloon_" + thisColormap.replace("_inverted", ""), "colorbar_canvas_airnowPM25"]);
        }
        if (document.getElementById("addAqsPM10Locations").checked && oAirnowPM10.oSlider_indices) {
            thisColormap = document.getElementById("colormap_AqsPM10").selectedOptions[0].id;
            typeList.push(["pm10_balloon_" + thisColormap.replace("_inverted", ""), "colorbar_canvas_airnowPM10"]);
        }
        if (document.getElementById("addAqsCOLocations").checked && oAirnowCO.oSlider_indices) {
            thisColormap = document.getElementById("colormap_AqsCO").selectedOptions[0].id;
            typeList.push(["co_balloon_" + thisColormap.replace("_inverted", ""), "colorbar_canvas_airnowCO"]);
        }
        if (document.getElementById("addAqsNO2Locations").checked && oAirnowNO2.oSlider_indices) {
            thisColormap = document.getElementById("colormap_AqsNO2").selectedOptions[0].id;
            typeList.push(["no2_balloon_" + thisColormap.replace("_inverted", ""), "colorbar_canvas_airnowNO2"]);
        }
        if (document.getElementById("addAqsSO2Locations").checked && oAirnowSO2.oSlider_indices) {
            thisColormap = document.getElementById("colormap_AqsSO2").selectedOptions[0].id;
            typeList.push(["so2_balloon_" + thisColormap.replace("_inverted", ""), "colorbar_canvas_airnowSO2"]);
        }
                
        for (typeInd=0; typeInd<typeList.length; typeInd++) {
            if (kml_canvas_array.indexOf(typeList[typeInd][1]) >= 0) {
                thisType        = typeList[typeInd][0];
                thisPrefixParse = thisType.split('_');
                thisPrefix      = thisPrefixParse[0] + "_" + thisPrefixParse[1] + "_";
                thisColormap    = thisPrefixParse[2];
                thisColorbarCanvas =  typeList[typeInd][1];
                
                for (ii=0; ii<N_colors+1; ii++) {
                    airnowiconFileName = "";
                    if (ii < N_colors) {
                        airnowiconFileName = thisPrefix + zeroPad(ii, 2) + ".png";
                    } else if (ii == N_colors) {
                        airnowiconFileName = thisPrefix + "missing.png";
                    }
                    
                    var c = document.createElement('canvas');
                    //var imgg = kml_airnowicon_imgarray[typeInd][ii];

                    var imgg;
                    if (thisColorbarCanvas.indexOf("airnowO3") > 0) {
                        imgg = oAirnowOzone.imgArray[ii];
                    } else if (thisColorbarCanvas.indexOf("airnowPM25") > 0) {
                        imgg = oAirnowPM25.imgArray[ii];
                    } else if (thisColorbarCanvas.indexOf("airnowPM10") > 0) {
                        imgg = oAirnowPM10.imgArray[ii];
                    } else if (thisColorbarCanvas.indexOf("airnowCO") > 0) {
                        imgg = oAirnowCO.imgArray[ii];
                    } else if (thisColorbarCanvas.indexOf("airnowNO2") > 0) {
                        imgg = oAirnowNO2.imgArray[ii];
                    } else if (thisColorbarCanvas.indexOf("airnowSO2") > 0) {
                        imgg = oAirnowSO2.imgArray[ii];
                    }
                               
                    c.height = imgg.naturalHeight;
                    c.width = imgg.naturalWidth;
                    var ctx = c.getContext('2d');
                    ctx.drawImage(imgg, 0, 0, c.width, c.height);
                    var base64String = c.toDataURL();
                    //console.log(airnowiconFileName, base64String);
                    
                    thisImg = base64String.split(',')[1];
                    var img = zip.folder("airnow_balloons/" + thisType);
                    img.file(airnowiconFileName, thisImg, {base64: true});
                }
            }
        }

        // purpleair icons
        typeList = [["purpleair_pm25_bluemono",     "colorbar_canvas_purpleair"],
                    ["purpleair_pm25_bluered",      "colorbar_canvas_purpleair"],
                    ["purpleair_pm25_colorsafe",    "colorbar_canvas_purpleair"],
                    ["purpleair_pm25_stdgamma2",    "colorbar_canvas_purpleair"],
                    ["purpleair_pm25_viridis",      "colorbar_canvas_purpleair"]];
        
        for (typeInd=0; typeInd<typeList.length; typeInd++) {
            if (kml_canvas_array.indexOf(typeList[typeInd][1]) >= 0) {
                thisType        = typeList[typeInd][0];
                thisPrefixParse = thisType.split('_');
                //thisPrefix      = thisPrefixParse[0] + "_" + thisPrefixParse[1] + "_";
                thisPrefix      = thisPrefixParse[0] + "_square_";
                thisColormap    = thisPrefixParse[2];
                for (ii=0; ii<N_colors+1; ii++) {
                    purpleairiconFileName = "";
                    if (ii < N_colors) {
                        purpleairiconFileName = thisPrefix + zeroPad(ii, 2) + ".png";
                    } else if (ii == N_colors) {
                        purpleairiconFileName = thisPrefix + "missing.png";
                    }
                    
                    var c = document.createElement('canvas');
                    var imgg = kml_purpleairicon_imgarray[typeInd][ii];
                    c.height = imgg.naturalHeight;
                    c.width = imgg.naturalWidth;
                    var ctx = c.getContext('2d');
                    ctx.drawImage(imgg, 0, 0, c.width, c.height);
                    var base64String = c.toDataURL();
                    //console.log(airnowiconFileName, base64String);
                    
                    thisImg = base64String.split(',')[1];
                    var img = zip.folder("purpleair/" + thisType);
                    img.file(purpleairiconFileName, thisImg, {base64: true});
                }
            }
        }

        // mysensor icons
        //typeList = [["mysensor_balloon1_bluemono",   "colorbar_canvas_mysensor0"],
        //            ["mysensor_balloon1_bluered",    "colorbar_canvas_mysensor0"],
        //            ["mysensor_balloon1_colorsafe",  "colorbar_canvas_mysensor0"],
        //            ["mysensor_balloon1_stdgamma2",  "colorbar_canvas_mysensor0"],
        //            ["mysensor_balloon1_viridis",    "colorbar_canvas_mysensor0"],
        //            ["mysensor_balloon2_bluemono",   "colorbar_canvas_mysensor1"],
        //            ["mysensor_balloon2_bluered",    "colorbar_canvas_mysensor1"],
        //            ["mysensor_balloon2_colorsafe",  "colorbar_canvas_mysensor1"],
        //            ["mysensor_balloon2_stdgamma2",  "colorbar_canvas_mysensor1"],
        //            ["mysensor_balloon2_viridis",    "colorbar_canvas_mysensor1"],
        //            ["mysensor_balloon3_bluemono",   "colorbar_canvas_mysensor2"],
        //            ["mysensor_balloon3_bluered",    "colorbar_canvas_mysensor2"],
        //            ["mysensor_balloon3_colorsafe",  "colorbar_canvas_mysensor2"],
        //            ["mysensor_balloon3_stdgamma2",  "colorbar_canvas_mysensor2"],
        //            ["mysensor_balloon3_viridis",    "colorbar_canvas_mysensor2"],
        //            ["mysensor_balloon4_bluemono",   "colorbar_canvas_mysensor3"],
        //            ["mysensor_balloon4_bluered",    "colorbar_canvas_mysensor3"],
        //            ["mysensor_balloon4_colorsafe",  "colorbar_canvas_mysensor3"],
        //            ["mysensor_balloon4_stdgamma2",  "colorbar_canvas_mysensor3"],
        //            ["mysensor_balloon4_viridis",    "colorbar_canvas_mysensor3"],
        //            ["mysensor_balloon5_bluemono",   "colorbar_canvas_mysensor4"],
        //            ["mysensor_balloon5_bluered",    "colorbar_canvas_mysensor4"],
        //            ["mysensor_balloon5_colorsafe",  "colorbar_canvas_mysensor4"],
        //            ["mysensor_balloon5_stdgamma2",  "colorbar_canvas_mysensor4"],
        //            ["mysensor_balloon5_viridis",    "colorbar_canvas_mysensor4"]];

        typeList = [];
        if (document.getElementById("addMySensorLocations0").checked && mySensorArray[0].oSlider_indices) {
            thisColormap = document.getElementById("colormap_MySensor0").selectedOptions[0].id;
            typeList.push(["mysensor_balloon1_" + thisColormap.replace("_inverted", ""), "colorbar_canvas_mysensor0"]);
        }
        if (document.getElementById("addMySensorLocations1").checked && mySensorArray[1].oSlider_indices) {
            thisColormap = document.getElementById("colormap_MySensor1").selectedOptions[0].id;
            typeList.push(["mysensor_balloon2_" + thisColormap.replace("_inverted", ""), "colorbar_canvas_mysensor1"]);
        }
        if (document.getElementById("addMySensorLocations2").checked && mySensorArray[2].oSlider_indices) {
            thisColormap = document.getElementById("colormap_MySensor2").selectedOptions[0].id;
            typeList.push(["mysensor_balloon3_" + thisColormap.replace("_inverted", ""), "colorbar_canvas_mysensor2"]);
        }
        if (document.getElementById("addMySensorLocations3").checked && mySensorArray[3].oSlider_indices) {
            thisColormap = document.getElementById("colormap_MySensor3").selectedOptions[0].id;
            typeList.push(["mysensor_balloon4_" + thisColormap.replace("_inverted", ""), "colorbar_canvas_mysensor3"]);
        }
        if (document.getElementById("addMySensorLocations4").checked && mySensorArray[4].oSlider_indices) {
            thisColormap = document.getElementById("colormap_MySensor4").selectedOptions[0].id;
            typeList.push(["mysensor_balloon5_" + thisColormap.replace("_inverted", ""), "colorbar_canvas_mysensor4"]);
        }

        for (typeInd=0; typeInd<typeList.length; typeInd++) {
            if (kml_canvas_array.indexOf(typeList[typeInd][1]) >= 0) {
                thisType        = typeList[typeInd][0];
                thisPrefixParse = thisType.split('_');
                thisPrefix      = thisPrefixParse[0] + "_" + thisPrefixParse[1] + "_";
                thisColormap    = thisPrefixParse[2];
                thisColorbarCanvas =  typeList[typeInd][1];

                for (ii=0; ii<N_colors+1; ii++) {
                    mysensoriconFileName = "";
                    if (ii < N_colors) {
                        mysensoriconFileName = thisPrefix + zeroPad(ii, 2) + ".png";
                    } else if (ii == N_colors) {
                        mysensoriconFileName = thisPrefix + "missing.png";
                    }
                    
                    var c = document.createElement('canvas');
                    //var imgg = kml_mysensoricon_imgarray[typeInd][ii];
                    var imgg;
                    if (thisColorbarCanvas.indexOf("mysensor0") > 0) {
                        imgg = mySensorArray[0].imgArray[ii];
                    } else if (thisColorbarCanvas.indexOf("mysensor1") > 0) {
                        imgg = mySensorArray[1].imgArray[ii];
                    } else if (thisColorbarCanvas.indexOf("mysensor2") > 0) {
                        imgg = mySensorArray[2].imgArray[ii];
                    } else if (thisColorbarCanvas.indexOf("mysensor3") > 0) {
                        imgg = mySensorArray[3].imgArray[ii];
                    } else if (thisColorbarCanvas.indexOf("mysensor4") > 0) {
                        imgg = mySensorArray[4].imgArray[ii];
                    }
                    
                    c.height = imgg.naturalHeight;
                    c.width = imgg.naturalWidth;
                    var ctx = c.getContext('2d');
                    ctx.drawImage(imgg, 0, 0, c.width, c.height);
                    var base64String = c.toDataURL();
                    
                    thisImg = base64String.split(',')[1];
                    var img = zip.folder("mysensor_balloons/" + thisType);
                    img.file(mysensoriconFileName, thisImg, {base64: true});
                }
            }
        }


        // misc icons with no colormaps
        typeList = ["fire_icon",
                    "metar3_temperature",
                    "metar3_pressure",
                    "metar3_windspeed",
                    "metar3_winddirection"];
        
        for (typeInd=0; typeInd<typeList.length; typeInd++) {
            thisType = typeList[typeInd];
            let misciconFileName = thisType + ".png";
            var c = document.createElement('canvas');
            var imgg = kml_miscicon_imgarray[typeInd];
            c.height = imgg.naturalHeight;
            c.width = imgg.naturalWidth;
            var ctx = c.getContext('2d');
            ctx.drawImage(imgg, 0, 0, c.width, c.height);
            var base64String = c.toDataURL();
            
            thisImg = base64String.split(',')[1];
            var img = zip.folder("misc");
            img.file(misciconFileName, thisImg, {base64: true});
        }

                    
        zip.generateAsync({type:"blob"})
            .then(function(content) {
                // see FileSaver.js
                saveAs(content, kml_fname.replace('kml', 'kmz'));
            });
    } catch (exception) {
        console.log(exception);
        print("KML file could not be written");
    }

     busyMessageQueueMapRemove(kmlExportMessage);
     busyHide('map');
}

function launch_export_kml_dialog() {

    // clear previous variable menu
    children = document.getElementById('dialog-export-kml').getElementsByTagName('select');
    for( i=children.length-1; i>=0; i-- ) {
        children[i].remove();
    }
    
    var msl_select            = document.createElement("select");
    var groundlevel_select    = document.createElement("select");
    var colorbarsize_select   = document.createElement("select");
    var myoption_msl          = document.createElement("option");
    var myoption_groundlevel  = document.createElement("option");
    var myoption_colorbarsize = document.createElement("option");

    msl_select.id          = "kml-export-varselector_msl";
    groundlevel_select.id  = "kml-export-varselector_groundlevel";
    colorbarsize_select.id = "kml-export-varselector_colorbarsize";

    colorbarSizes=["small", "medium", "large"];
    for (i=0; i<colorbarSizes.length; i++) {
        myoption_colorbarsize = document.createElement("option");
        myoption_colorbarsize.value = colorbarSizes[i];
        myoption_colorbarsize.text  = colorbarSizes[i];
        colorbarsize_select.appendChild(myoption_colorbarsize);
    }
    
    myVarNames = ["None", ...oUserdata.varname[0]];
    for (i=0; i<myVarNames.length; i++) {
        myoption_msl       = document.createElement("option");
        myoption_msl.value = myVarNames[i];
        myoption_msl.text  = myVarNames[i];
        msl_select.appendChild(myoption_msl);
        
        myoption_groundlevel       = document.createElement("option");
        myoption_groundlevel.value = myVarNames[i];
        myoption_groundlevel.text  = myVarNames[i];
        groundlevel_select.appendChild(myoption_groundlevel);
    }
    
    document.getElementById("dialog-export-kml-msl-selectordiv").appendChild(msl_select);
    document.getElementById("dialog-export-kml-groundlevel-selectordiv").appendChild(groundlevel_select);
    document.getElementById("dialog-export-kml-colorbarsize-selectordiv").appendChild(colorbarsize_select);
    
    openEmvlDialog("dialog-export-kml");
}

function process_kml_export_radio_aboveground(element) {
    if (element.id === "kml-export-yes") {
        document.getElementById("dialog-export-kml-msl-selectordiv").style.display = "block";
        document.getElementById("dialog-export-kml-groundlevel-selectordiv").style.display = "block";
        kml_hasElevations = true;        
    } else {
        document.getElementById("dialog-export-kml-msl-selectordiv").style.display = "none";
        document.getElementById("dialog-export-kml-groundlevel-selectordiv").style.display = "none";
        kml_hasElevations = false;
    }
    //console.log(kml_hasElevations);
}

function export_kml(mslVarname, groundlevelVarname, colorbarsize) {

    busyMessageQueueMapAdd(kmlExportMessage);
    busyShow('map');
    
    kml_fname = document.getElementById("user_datafile1").value.replace(/^.*\\/, "").split('.');
    if (kml_fname[0].length > 0) {
        kml_fname = kml_fname[0] + ".kml";
    } else {
        kml_fname = "retigo.kml";
    }
    print("exporting " + kml_fname);

    // user data
    nvars = oUserdata.varname[selected_block].length; 
    kml_export_array      = new Array();
    kml_canvas_array      = new Array(); // IDs of colorbar canvases
    kml_colorbar_imgarray = new Array();
    //kml_usericon_imgarray = new Array();
    
    // user data colorbar
    kml_canvas_array.push("colorbar_canvas");

    // determine merged data to export
    selected_merged = new Array();
    if (document.getElementById("addAqsOzoneLocations").checked && oAirnowOzone.oSlider_indices) {
        selected_merged.push("airnowOzone");
        kml_canvas_array.push("colorbar_canvas_airnowO3");
    }
    if (document.getElementById("addAqsPM25Locations").checked && oAirnowPM25.oSlider_indices) {
        selected_merged.push("airnowPM25");
        kml_canvas_array.push("colorbar_canvas_airnowPM25");
    }
    if (document.getElementById("addAqsPM10Locations").checked && oAirnowPM10.oSlider_indices) {
        selected_merged.push("airnowPM10");
        kml_canvas_array.push("colorbar_canvas_airnowPM10");
    }
    if (document.getElementById("addAqsCOLocations").checked && oAirnowCO.oSlider_indices) {
        selected_merged.push("airnowCO");
        kml_canvas_array.push("colorbar_canvas_airnowCO");
    }
    if (document.getElementById("addAqsNO2Locations").checked && oAirnowNO2.oSlider_indices) {
        selected_merged.push("airnowNO2");
        kml_canvas_array.push("colorbar_canvas_airnowNO2");
    }
    if (document.getElementById("addAqsSO2Locations").checked && oAirnowSO2.oSlider_indices) {
        selected_merged.push("airnowSO2");
        kml_canvas_array.push("colorbar_canvas_airnowSO2");
    }
    if (document.getElementById("addPurpleairLocations").checked && oPurpleairPM25.oSlider_indices) {
        selected_merged.push("purpleairPM25");
        kml_canvas_array.push("colorbar_canvas_purpleair");
    }
    if (document.getElementById("addMySensorLocations0").checked && mySensorArray[0].oSlider_indices) {
        selected_merged.push("Ext. data 1");
        kml_canvas_array.push("colorbar_canvas_mysensor0");
    }
    if (document.getElementById("addMySensorLocations1").checked && mySensorArray[0].oSlider_indices) {
        selected_merged.push("Ext. data 2");
        kml_canvas_array.push("colorbar_canvas_mysensor1");
    }
    if (document.getElementById("addMySensorLocations2").checked && mySensorArray[0].oSlider_indices) {
        selected_merged.push("Ext. data 3");
        kml_canvas_array.push("colorbar_canvas_mysensor2");
    }
    if (document.getElementById("addMySensorLocations3").checked && mySensorArray[0].oSlider_indices) {
        selected_merged.push("Ext. data 4");
        kml_canvas_array.push("colorbar_canvas_mysensor3");
    }
    if (document.getElementById("addMySensorLocations4").checked && mySensorArray[0].oSlider_indices) {
        selected_merged.push("Ext. data 5");
        kml_canvas_array.push("colorbar_canvas_mysensor4");
    }
    if (document.getElementById("addHmsFireLocations").checked && mySensorArray[0].oSlider_indices) {
        selected_merged.push("hms");
    }
    if (document.getElementById("addSurfmetLocations").checked && mySensorArray[0].oSlider_indices) {
        selected_merged.push("metar_temperature");
        selected_merged.push("metar_pressure");
        selected_merged.push("metar_windspeed");
        selected_merged.push("metar_winddirection");
    }

    

    //kmlImageServer = "https://ofmpub.epa.gov/rsig/rsigserver?"; 
    
    // kml header
    kml_export_array.push('<?xml version="1.0" encoding="UTF-8"?>\n');
    kml_export_array.push('<kml xmlns="http://www.opengis.net/kml/2.2">\n');
    kml_export_array.push('  <Document>\n');


    // colorbars
    colorbarYpos = 75;
    let colorbarsizePixels = 0;
    if (colorbarsize == "small") {
        colorbarsizePixels = 700;
    } else if (colorbarsize == "medium") {
        colorbarsizePixels = 1100;
    } else if (colorbarsize == "large") {
        colorbarsizePixels = 1500;
    }
    
    for (cbInd=0; cbInd<kml_canvas_array.length; cbInd++) {
        colorbarWidth  = document.getElementById(kml_canvas_array[cbInd]).clientWidth;
        colorbarHeight = document.getElementById(kml_canvas_array[cbInd]).clientHeight;
        renderedColorbarHeight = Math.round(colorbarHeight / colorbarWidth * colorbarsizePixels);
        colorbar_xstart = colorbarsizePixels + 5;
        
        colorbarFileName = "colorbars/" + kml_canvas_array[cbInd] + ".png";
        kml_export_array.push('    <ScreenOverlay id="' + kml_canvas_array[cbInd] + '">\n');
        kml_export_array.push('      <name>Colorbar ' + kml_canvas_array[cbInd] + '</name>\n');
        kml_export_array.push('      <Icon>\n');
        kml_export_array.push('        <href>' + colorbarFileName + '</href>\n');
        kml_export_array.push('      </Icon>\n');
        kml_export_array.push('      <overlayXY x="1" y="1" xunits="fraction" yunits="fraction"/>\n');
        kml_export_array.push('      <screenXY x="' + colorbar_xstart + '" y="' + colorbarYpos + '" xunits="pixels" yunits="insetPixels"/>\n');
        kml_export_array.push('      <size x="' + colorbarsizePixels + '" y="' + renderedColorbarHeight + '" xunits="pixels" yunits="pixels"/>\n');
        //kml_export_array.push('      <size x="700" y="45" xunits="pixels" yunits="pixels"/>\n');
        //kml_export_array.push('      <size x="1400" y="200" xunits="pixels" yunits="pixels"/>\n');
        kml_export_array.push('    </ScreenOverlay>\n');
        colorbarYpos = colorbarYpos + renderedColorbarHeight;
    }
    
    // create style icons (always use public server here)
    //urlBase = kmlImageServer + "retigo/stable/images/" + concSymbolDir + "/";
    urlBase = "usericons/";
    iconScale = 0.75;
    kml_export_array.push('<!--Begin styles for user data-->\n');
    for (cInd=0; cInd<N_colors; cInd++) {
        cIndZeropad = zeroPad(cInd,2);
        kml_export_array.push('    <Style id="conc_' + cIndZeropad + '">\n');
        kml_export_array.push('      <IconStyle>\n');
        kml_export_array.push('      <scale>' + iconScale + '</scale>\n');
        kml_export_array.push('        <Icon>\n');
        kml_export_array.push('         <href>' + urlBase + 'conc_' + cIndZeropad + '.png</href>\n');
        kml_export_array.push('        </Icon>\n');
        kml_export_array.push('      </IconStyle>\n');
        kml_export_array.push('      <BalloonStyle>\n');
        kml_export_array.push('        <text>\n');
        kml_export_array.push('          <![CDATA[\n');
        kml_export_array.push('            <div style="width:450px;">\n');
        kml_export_array.push('                <center><h3>$[variableName]</h3></center><table><tr><td>Time:</td><td>$[timestamp]</td><tr><td>Data value:</td><td>$[userDataValue]</td></tr><tr><td>$[flaggerString]</td></tr></table>\n');
        kml_export_array.push('            <\div>\n');        
        kml_export_array.push('          ]]>\n');
        kml_export_array.push('        </text>\n');
        kml_export_array.push('      </BalloonStyle>\n');
        kml_export_array.push('    </Style>\n');
    }
    kml_export_array.push('    <Style id="conc_missing">\n');
    kml_export_array.push('      <IconStyle>\n');
    kml_export_array.push('      <scale>' + iconScale + '</scale>\n');
    kml_export_array.push('        <Icon>\n');
    kml_export_array.push('         <href>' + urlBase + 'conc_missing.png</href>\n');
    kml_export_array.push('        </Icon>\n');
    kml_export_array.push('      </IconStyle>\n');
    kml_export_array.push('      <BalloonStyle>\n');
    kml_export_array.push('        <text>\n');
    kml_export_array.push('          <![CDATA[\n');
    kml_export_array.push('            <div style="width:450px;">\n');
    kml_export_array.push('                <center><h3>$[variableName]</h3></center><table><tr><td>Time:</td><td>$[timestamp]</td><tr><td>Data value:</td><td>$[userDataValue]</td></tr></table>\n');
    kml_export_array.push('            <\div>\n');        
    kml_export_array.push('          ]]>\n');
    kml_export_array.push('        </text>\n');
    kml_export_array.push('      </BalloonStyle>\n');
    kml_export_array.push('    </Style>\n');
    kml_export_array.push('<!--End styles for user data-->\n');
    kml_export_array.push('<!--........................-->\n');

    // styles for merged data
    if (selected_merged.length > 0) {
        for (saInd=0; saInd<selected_merged.length; saInd++) {
            if (selected_merged[saInd] === "airnowOzone") {
                balloonString   = "ozone_balloon";
                missingString   = "ozone_balloon_missing";
                dirString       = "ozone_balloon";
                mergedSymbolSet = aqsOzoneColormap;
                //iconDir         = "retigo/stable/images/airnow_balloons/";
                iconDir         = "airnow_balloons/";
                hotspotX        =  0.0;
                hotspotY        = -0.5;
                hasColormap     = true;
            }
            if (selected_merged[saInd] === "airnowPM25") {
                balloonString   = "pm25_balloon";
                missingString   = "pm25_balloon_missing";
                dirString       = "pm25_balloon";
                mergedSymbolSet = aqsPM25Colormap;
                //iconDir         = "retigo/stable/images/airnow_balloons/";
                iconDir         = "airnow_balloons/";
                hotspotX        =  1.0;
                hotspotY        = -0.5;
                hasColormap     = true;
            }
            if (selected_merged[saInd] === "airnowPM10") {
                balloonString   = "pm10_balloon";
                missingString   = "pm10_balloon_missing";
                dirString       = "pm10_balloon";
                mergedSymbolSet = aqsPM10Colormap;
                //iconDir         = "retigo/stable/images/airnow_balloons/";
                iconDir         = "airnow_balloons/";
                //hotspotX        =  1.0;
                //hotspotY        = -0.5;
                hotspotX        =  0.5;
                hotspotY        = -1.5;
                hasColormap     = true;
            }
            if (selected_merged[saInd] === "airnowCO") {
                balloonString   = "co_balloon";
                missingString   = "co_balloon_missing";
                dirString       = "co_balloon";
                mergedSymbolSet = aqsCOColormap;
                //iconDir         = "retigo/stable/images/airnow_balloons/";
                iconDir         = "airnow_balloons/";
                hotspotX        = -1.0;
                hotspotY        = -0.5;
                hasColormap     = true;
            }
            if (selected_merged[saInd] === "airnowNO2") {
                balloonString   = "no2_balloon";
                missingString   = "no2_balloon_missing";
                dirString       = "no2_balloon";
                mergedSymbolSet = aqsNO2Colormap;
                //iconDir         = "retigo/stable/images/airnow_balloons/";
                iconDir         = "airnow_balloons/";
                hotspotX        =  0.5;
                hotspotY        =  0.5;
                hasColormap     = true;
            }
            if (selected_merged[saInd] === "airnowSO2") {
                balloonString   = "so2_balloon";
                missingString   = "so2_balloon_missing";
                dirString       = "so2_balloon";
                mergedSymbolSet = aqsSO2Colormap;
                //iconDir         = "retigo/stable/images/airnow_balloons/";
                iconDir         = "airnow_balloons/";
                hotspotX        = -0.5
                hotspotY        =  0.5;
                hasColormap     = true;
            }
            if (selected_merged[saInd] === "purpleairPM25") {
                balloonString   = "purpleair_square";
                missingString   = "purpleair_square_missing";
                dirString       = "purpleair_pm25";
                mergedSymbolSet = purpleairColormap;
                //iconDir         = "retigo/stable/images/";
                iconDir         = "purpleair/";
                hotspotX        = 0.0;
                hotspotY        = 0.0;
                hasColormap     = true;
            }
            if (selected_merged[saInd] === "Ext. data 1") { // this uses zero-based indexing
                balloonString   = "mysensor_balloon1";
                missingString   = "mysensor_balloon1_missing";
                dirString       = "mysensor_balloon1";    // this uses one-based indexing
                mergedSymbolSet = mysensorColormap[0];
                //iconDir         = "retigo/stable/images/mysensor_balloons/";
                iconDir         = "mysensor_balloons/";
                hotspotX        = 0.0;
                hotspotY        = 0.0;
                hasColormap     = true;
            }
            if (selected_merged[saInd] === "Ext. data 2") { // this uses zero-based indexing
                balloonString   = "mysensor_balloon2";
                missingString   = "mysensor_balloon2_missing";
                dirString       = "mysensor_balloon2";    // this uses one-based indexing
                mergedSymbolSet = mysensorColormap[1];
                //iconDir         = "retigo/stable/images/mysensor_balloons/";
                iconDir         = "mysensor_balloons/";
                hotspotX        = 0.0;
                hotspotY        = 0.0;
                hasColormap     = true;
            }
            if (selected_merged[saInd] === "Ext. data 3") { // this uses zero-based indexing
                balloonString   = "mysensor_balloon3";
                missingString   = "mysensor_balloon3_missing";
                dirString       = "mysensor_balloon3";    // this uses one-based indexing
                mergedSymbolSet = mysensorColormap[2];
                //iconDir         = "retigo/stable/images/mysensor_balloons/";
                iconDir         = "mysensor_balloons/";
                hotspotX        = 0.0;
                hotspotY        = 0.0;
                hasColormap     = true;
            }
            if (selected_merged[saInd] === "Ext. data 4") { // this uses zero-based indexing
                balloonString   = "mysensor_balloon4";
                missingString   = "mysensor_balloon4_missing";
                dirString       = "mysensor_balloon4";    // this uses one-based indexing
                mergedSymbolSet = mysensorColormap[3];
                //iconDir         = "retigo/stable/images/mysensor_balloons/";
                iconDir         = "mysensor_balloons/";
                hotspotX        = 0.0;
                hotspotY        = 0.0;
                hasColormap     = true;
            }
            if (selected_merged[saInd] === "Ext. data 5") { // this uses zero-based indexing
                balloonString   = "mysensor_balloon5";
                missingString   = "mysensor_balloon5_missing";
                dirString       = "mysensor_balloon5";    // this uses one-based indexing
                mergedSymbolSet = mysensorColormap[4];
                //iconDir         = "retigo/stable/images/mysensor_balloons/";
                iconDir         = "mysensor_balloons/";
                hotspotX        = 0.0;
                hotspotY        = 0.0;
                hasColormap     = true;
            }
            
            // non-colormap entries have different metadata than the ones above
            if (selected_merged[saInd] === "hms") {
                iconDir         = "misc/";
                iconFile        = "fire_icon.png";
                styleName       = "hms_fire";
                hotspotX        = 0.5;
                hotspotY        = 0.5;
                hasColormap     = false;
            }
            if (selected_merged[saInd] === "metar_temperature") {
                iconDir         = "misc/";
                iconFile        = "metar3_temperature.png";
                styleName       = "metar_temperature";
                hotspotX        = 0.5;
                hotspotY        = -0.5;
                hasColormap     = false;
            }
            if (selected_merged[saInd] === "metar_pressure") {
                iconDir         = "misc/";
                iconFile        = "metar3_pressure.png";
                styleName       = "metar_pressure";
                hotspotX        = -0.5;
                hotspotY        = -0.5;
                hasColormap     = false;
            }
            if (selected_merged[saInd] === "metar_windspeed") {
                iconDir         = "misc/";
                iconFile        = "metar3_windspeed.png";
                styleName       = "metar_windspeed";
                hotspotX        = 0.5;
                hotspotY        = 0.5;
                hasColormap     = false;
            }
            if (selected_merged[saInd] === "metar_winddirection") {
                iconDir         = "misc/";
                iconFile        = "metar3_winddirection.png";
                styleName       = "metar_winddirection";
                hotspotX        = -0.5;
                hotspotY        = 0.5;
                hasColormap     = false;
            }
            
            kml_export_array.push('<!--Begin styles for merged data-->\n');
            if (hasColormap) {
                //urlBaseMerged = kmlImageServer + iconDir + dirString + "_" + mergedSymbolSet.replace("_inverted", "") + "/";
                urlBaseMerged = iconDir + dirString + "_" + mergedSymbolSet.replace("_inverted", "") + "/";
                for (cInd=0; cInd<N_colors; cInd++) {
                    cIndZeropad = zeroPad(cInd,2);
                    cIndZeropad_inverted = zeroPad(N_colors-cInd-1, 2);
                    kml_export_array.push('    <Style id="' + balloonString + '_' + cIndZeropad + '">\n');
                    kml_export_array.push('      <IconStyle>\n');
                    kml_export_array.push('      <scale>' + iconScale + '</scale>\n');
                    kml_export_array.push('      <hotSpot x="' + hotspotX + '" y="' + hotspotY + '" xunits="fraction" yunits="fraction"></hotSpot>\n');
                    kml_export_array.push('        <Icon>\n');
                    if (mergedSymbolSet.indexOf ("inverted") == -1) {
                        kml_export_array.push('         <href>' + urlBaseMerged + balloonString + '_' + cIndZeropad + '.png</href>\n');
                    } else {
                        kml_export_array.push('         <href>' + urlBaseMerged + balloonString + '_' + cIndZeropad_inverted + '.png</href>\n');
                    }
                    kml_export_array.push('        </Icon>\n');
                    kml_export_array.push('      </IconStyle>\n');
                    kml_export_array.push('      <BalloonStyle>\n');
                    kml_export_array.push('        <text>\n');
                    kml_export_array.push('          <![CDATA[\n');
                    kml_export_array.push('            <div style="width:450px;">\n');
                    kml_export_array.push('                <center><h3>$[variableName]</h3></center><table><tr><td>Time:</td><td>$[timeRange]</td><tr><td>Data value:</td><td>$[dataValue]</td></tr></table>\n');
                    kml_export_array.push('            <\div>\n');
                    kml_export_array.push('          ]]>\n');
                    kml_export_array.push('        </text>\n');
                    kml_export_array.push('      </BalloonStyle>\n');
                    kml_export_array.push('    </Style>\n');
                }
                kml_export_array.push('    <Style id="' + missingString + '">\n');
                kml_export_array.push('      <IconStyle>\n');
                kml_export_array.push('      <hotSpot x="' + hotspotX + '" y="' + hotspotY + '" xunits="fraction" yunits="fraction"></hotSpot>\n');
                kml_export_array.push('      <scale>' + iconScale + '</scale>\n');
                kml_export_array.push('        <Icon>\n');
                kml_export_array.push('         <href>' + urlBaseMerged + balloonString + '_missing.png</href>\n');
                kml_export_array.push('        </Icon>\n');
                kml_export_array.push('      </IconStyle>\n');
                kml_export_array.push('      <BalloonStyle>\n');
                kml_export_array.push('        <text>\n');
                kml_export_array.push('          <![CDATA[\n');
                kml_export_array.push('            <div style="width:450px;">\n');
                kml_export_array.push('                <center><h3>$[variableName]</h3></center><table><tr><td>Time:</td><td>$[timeRange]</td><tr><td>Data value:</td><td>$[dataValue]</td></tr></table>\n');
                kml_export_array.push('            <\div>\n');
                kml_export_array.push('          ]]>\n');
                kml_export_array.push('        </text>\n');
                kml_export_array.push('      </BalloonStyle>\n');
                kml_export_array.push('    </Style>\n');
                kml_export_array.push('<!--End styles for merged data-->\n');
                kml_export_array.push('<!--........................-->\n');
                
            } else { // for merged sources with no colormap
                kml_export_array.push('    <Style id="' + styleName + '">\n');
                kml_export_array.push('      <IconStyle>\n');
                kml_export_array.push('      <hotSpot x="' + hotspotX + '" y="' + hotspotY + '" xunits="fraction" yunits="fraction"></hotSpot>\n');
                kml_export_array.push('      <scale>' + iconScale + '</scale>\n');
                kml_export_array.push('        <Icon>\n');
                kml_export_array.push('         <href>' + iconDir + iconFile + '</href>\n');
                kml_export_array.push('        </Icon>\n');
                kml_export_array.push('      </IconStyle>\n');
                kml_export_array.push('      <BalloonStyle>\n');
                kml_export_array.push('        <text>\n');
                kml_export_array.push('          <![CDATA[\n');
                kml_export_array.push('            <div style="width:450px;">\n');
                kml_export_array.push('                <center><h3>$[variableName]</h3></center><table><tr><td>Time:</td><td>$[timeRange]</td><tr><td>Data value:</td><td>$[dataValue]</td></tr></table>\n');
                kml_export_array.push('            <\div>\n');
                kml_export_array.push('          ]]>\n');
                kml_export_array.push('        </text>\n');
                kml_export_array.push('      </BalloonStyle>\n');
                kml_export_array.push('    </Style>\n');
            }
        }
    }

    // determine if user data contains elevations
    elevationsIndex_msl         = -1; //default
    elevationsIndex_groundlevel = -1; //default
    for (vInd=0; vInd<oUserdata.varname[selected_block].length; vInd++) {
        if (mslVarname !== "" && mslVarname !== "None" && oUserdata.varname[selected_block][vInd] === mslVarname) {
            elevationsIndex_msl = vInd;
            break;
        }
    }
    for (vInd=0; vInd<oUserdata.varname[selected_block].length; vInd++) {
        if (groundlevelVarname !== "" && groundlevelVarname !== "None" && oUserdata.varname[selected_block][vInd] === groundlevelVarname) {
            elevationsIndex_groundlevel = vInd;
            break;
        }
    }

    flagger  = document.getElementById("excludeFlaggerOption").checked;
    noExport = document.getElementById("chkFlaggerDoNotExport").checked;
    
    // loop over user data
    kml_export_array.push('<!--Begin user data-->\n');
    kml_export_array.push('  <Folder>\n');
    kml_export_array.push('    <name>RETIGO user data</name>\n');
    //var max_eInd = Math.min(oUserdata.lon[selected_block].length, 1000);
    var max_eInd = oUserdata.lon[selected_block].length;
    for (eInd=0; eInd<max_eInd; eInd++) { // loop over all datapoints
        thisMsec = oUserdata.msec[selected_block][eInd];
        console.log(eInd, flagger, noExport, isMsecFlagged(thisMsec), (!flagger) || (flagger && (!isMsecFlagged(thisMsec)) && (!noExport)) );
        
        if ( (!flagger) || (flagger && (!isMsecFlagged(thisMsec))) || (flagger && isMsecFlagged(thisMsec) && (!noExport)) ) {
            this_dateObj = create_dateObjectUTC(oUserdata.timestamp[selected_block][eInd]);
            this_data    = oUserdata.variable[selected_block][get_selected_varselector_index()][eInd];
            this_datamin = oUserdata.mymin[0][get_selected_varselector_index()];
            this_datamax = oUserdata.mymax[0][get_selected_varselector_index()];
            this_lat     = oUserdata.lat[selected_block][eInd].toFixed(6);
            this_lon     = oUserdata.lon[selected_block][eInd].toFixed(6);
            this_varname = oUserdata.varname[selected_block][get_selected_varselector_index()];

            thisFlaggerString = "";
            if (flagger && isMsecFlagged(thisMsec)) {
                thisFlaggerString += "Flagged for:";
                if ( (oUserdata.flagged_constant_msec.indexOf(thisMsec)        > 0)) { thisFlaggerString += "<div>  - Constant</div>";      } 
                if ( (oUserdata.flagged_longMissing_msec.indexOf(thisMsec)     > 0)) { thisFlaggerString += "<div>  - Missing</div>";       }
                if ( (oUserdata.flagged_outlierStat_msec.indexOf(thisMsec)     > 0)) { thisFlaggerString += "<div>  - Outlier Stat</div>";  }
                if ( (oUserdata.flagged_outlierSpike_msec.indexOf(thisMsec)    > 0)) { thisFlaggerString += "<div>  - Outlier Spike</div>"; }
                if ( (oUserdata.flagged_aboveConc_msec.indexOf(thisMsec)       > 0)) { thisFlaggerString += "<div>  - Above Conc.</div>";   }
                if ( (oUserdata.flagged_belowConc_msec.indexOf(thisMsec)       > 0)) { thisFlaggerString += "<div>  - Below Conc.</div>";   }
                if ( (oUserdata.flagged_userInvalidated_msec.indexOf(thisMsec) > 0)) { thisFlaggerString += "<div>  - User Invalid.</div>"; }
                // remove trailing comma
                //thisFlaggerString = thisFlaggerString.substring(0, thisFlaggerString.length - 1);
            }
            if (thisFlaggerString != "") {
                console.log(thisFlaggerString);
            }
            this_altitude = 0.0;
            if (elevationsIndex_msl >= 0) {
                this_altitude = oUserdata.variable[selected_block][elevationsIndex_msl][eInd];
            } else if (elevationsIndex_groundlevel >= 0) {
                this_altitude = oUserdata.variable[selected_block][elevationsIndex_groundlevel][eInd];
            }
            
            if (eInd > 0) {
                timeBegin = oUserdata.timestamp[selected_block][eInd-1];
            } else {
                timeBegin = oUserdata.timestamp[selected_block][eInd];
            }
            timeEnd   = oUserdata.timestamp[selected_block][eInd];
            
            if ( this_lat >= -90.0 && this_lat <= 90.0 && this_lon >= -180.0 && this_lon <= 180.0) {
                
                if ( (this_data == fill_value) || this_lat < -90.0 || this_lat > 90.0 || this_lon < -180.0 || this_lon > 180.0) {
                    display_index = "missing";
                    thisZindex = -10; 
                } else if ( (this_data == missing_value)) {
                    display_index = "missing";
                    thisZindex = -100; 
                } else {	
                    display_index = Math.round((this_data-this_datamin)/(this_datamax-this_datamin) * (N_colors-1));
                    thisZindex = -10; 
                }
                if (display_index < 0) {
                    display_index = 0;
                }
                if (display_index > N_colors-1) {
                    display_index = N_colors-1;
                }
            }
            
            thisConcSymbolSingle = "conc_" + zeroPad(display_index,2);
            //thisConcSymbolUrl    = kmlImageServer + "retigo/stable/images/" + concSymbolDir + "/" + thisConcSymbolSingle+".gif"
            thisConcSymbolUrl    = concSymbolDir + "/" + thisConcSymbolSingle + ".gif"
            kml_export_array.push('    <Placemark>\n');
            //kml_export_array.push('      <TimeStamp>\n');
            //kml_export_array.push('        <when>' + oUserdata.timestamp[selected_block][eInd] + '</when>\n');
            //kml_export_array.push('      </TimeStamp>\n');
            kml_export_array.push('      <TimeSpan>\n');
            kml_export_array.push('        <begin>' + timeBegin + '</begin>\n');
            kml_export_array.push('        <end>' + timeEnd + '</end>\n');
            kml_export_array.push('      </TimeSpan>\n');
            kml_export_array.push('      <styleUrl>#' + thisConcSymbolSingle + '</styleUrl>\n');
            kml_export_array.push('      <ExtendedData>\n');
            kml_export_array.push('        <Data name="variableName">\n');
            kml_export_array.push('          <value>' + this_varname + '</value>\n');
            kml_export_array.push('        </Data>\n');
            kml_export_array.push('        <Data name="timestamp">\n');
            kml_export_array.push('          <value>' + this_dateObj + '</value>\n');
            kml_export_array.push('        </Data>\n');
            kml_export_array.push('        <Data name="userDataValue">\n');
            kml_export_array.push('          <value>' + this_data + '</value>\n');
            kml_export_array.push('        </Data>\n');
            if (thisFlaggerString != "") {
                // data ewas flagged
                kml_export_array.push('        <Data name="flaggerString">\n');
                kml_export_array.push('          <value>' + thisFlaggerString + '</value>\n');
                kml_export_array.push('        </Data>\n');
            } else {
                // data was not flagged, but we still need a string to keep the style happy
                kml_export_array.push('        <Data name="flaggerString">\n');
                kml_export_array.push('          <value>' + "" + '</value>\n');
                kml_export_array.push('        </Data>\n');
            }
            kml_export_array.push('      </ExtendedData>\n'); 
            kml_export_array.push('      <Point>\n');
            if (elevationsIndex_msl >= 0) {
                kml_export_array.push('        <altitudeMode>absolute</altitudeMode>\n');
            } else if (elevationsIndex_groundlevel >= 0) {
                kml_export_array.push('        <altitudeMode>relativeToGround</altitudeMode>\n');
            } else {
                kml_export_array.push('        <altitudeMode>clampToGround</altitudeMode>\n');
            }
            
            kml_export_array.push('        <coordinates>' + this_lon + ',' + this_lat + ',' + this_altitude + '</coordinates>\n');
            kml_export_array.push('      </Point>\n');
            kml_export_array.push('    </Placemark>\n');
        }
    }
    kml_export_array.push('  </Folder>\n');
    kml_export_array.push('<!--End user data-->\n');
    kml_export_array.push('<!--.............-->\n');


    // merged data
    this_enddate = new Date();
    msecPerHour = 60 * 60 * 1000;
    kml_export_array.push('<!-- Begin merged data -->\n');
    for (saInd=0; saInd<selected_merged.length; saInd++) {
        kml_export_array.push('  <Folder>\n');
        kml_export_array.push('    <name>' + selected_merged[saInd] + '</name>\n');        
        if (selected_merged[saInd] === "airnowOzone") {
            mergedObj       = oAirnowOzone;
            balloonString   = "ozone_balloon";
            missingString   = "ozone_missing";
            hasColormap     = true;
        }
        if (selected_merged[saInd] === "airnowPM25") {
            mergedObj       = oAirnowPM25;
            balloonString   = "pm25_balloon";
            missingString   = "pm25_missing";
            hasColormap     = true;
        }
        if (selected_merged[saInd] === "airnowPM10") {
            mergedObj       = oAirnowPM10;
            balloonString   = "pm10_balloon";
            missingString   = "pm10_missing";
            hasColormap     = true;
        }
        if (selected_merged[saInd] === "airnowCO") {
            mergedObj       = oAirnowCO;
            balloonString   = "co_balloon";
            missingString   = "co_missing";
            hasColormap     = true;
        }
        if (selected_merged[saInd] === "airnowNO2") {
            mergedObj       = oAirnowNO2;
            balloonString   = "no2_balloon";
            missingString   = "no2_missing";
            hasColormap     = true;
        }
        if (selected_merged[saInd] === "airnowSO2") {
            mergedObj       = oAirnowSO2;
            balloonString   = "so2_balloon";
            missingString   = "so2_missing";
            hasColormap     = true;
        }
        if (selected_merged[saInd] === "purpleairPM25") {
            mergedObj       = oPurpleairPM25;
            balloonString   = "purpleair_square";
            missingString   = "purpleair_square_missing";
            hasColormap     = true;
        }
        if (selected_merged[saInd] === "Ext. data 1") {
            mergedObj       = mySensorArray[0];
            balloonString   = "mysensor_balloon1";
            missingString   = "mysensor_balloon1_missing";
            hasColormap     = true;
        }
        if (selected_merged[saInd] === "Ext. data 2") {
            mergedObj       = mySensorArray[1];
            balloonString   = "mysensor_balloon2";
            missingString   = "mysensor_balloon2_missing";
            hasColormap     = true;
        }
        if (selected_merged[saInd] === "Ext. data 3") {
            mergedObj       = mySensorArray[2];
            balloonString   = "mysensor_balloon3";
            missingString   = "mysensor_balloon3_missing";
            hasColormap     = true;
        }
        if (selected_merged[saInd] === "Ext. data 4") {
            mergedObj       = mySensorArray[3];
            balloonString   = "mysensor_balloon4";
            missingString   = "mysensor_balloon4_missing";
            hasColormap     = true;
        }
        if (selected_merged[saInd] === "Ext. data 5") {
            mergedObj       = mySensorArray[4];
            balloonString   = "mysensor_balloon5";
            missingString   = "mysensor_balloon5_missing";
            hasColormap     = true;
        }

        // non-colormap entities have different metadata than the ones above
        if (selected_merged[saInd] === "hms") {
            mergedObj       = oHmsFire;
            styleName       = "hms_fire";
            hasColormap     = false;
        }
        if (selected_merged[saInd] === "metar_temperature") {
            mergedObj       = oSurfmetTemperature;
            styleName       = "metar_temperature";
            hasColormap     = false;
        }
        if (selected_merged[saInd] === "metar_pressure") {
            mergedObj       = oSurfmetPressure;
            styleName       = "metar_pressure";
            hasColormap     = false;
        }
        if (selected_merged[saInd] === "metar_windspeed") {
            mergedObj       = oSurfmetWindSpeed;
            styleName       = "metar_windspeed";
            hasColormap     = false;
        }
        if (selected_merged[saInd] === "metar_winddirection") {
            mergedObj       = oSurfmetWindDirection;
            styleName       = "metar_winddirection";
            hasColormap     = false;
        }
        
        for (aInd=0; aInd<mergedObj.timestamp.length; aInd++) { // loop over all datapoints
            this_begdate = mergedObj.timestamp[aInd].replace("-0000", "Z");
            this_msec    = mergedObj.msec[aInd];
            this_data    = mergedObj.variable[aInd];
            this_datamin = mergedObj.min;
            this_datamax = mergedObj.max;
            this_lat     = mergedObj.lat[aInd].toFixed(6);
            this_lon     = mergedObj.lon[aInd].toFixed(6);
            this_varname = mergedObj.name.replace("surfmet", "metar");
            if (this_varname == "mysensor0") { this_varname = "Ext. data 1"; }
            if (this_varname == "mysensor1") { this_varname = "Ext. data 2"; }
            if (this_varname == "mysensor2") { this_varname = "Ext. data 3"; }
            if (this_varname == "mysensor3") { this_varname = "Ext. data 4"; }
            if (this_varname == "mysensor4") { this_varname = "Ext. data 5"; }
            
            this_enddate.setTime(this_msec + msecPerHour);

            kml_export_array.push('    <Placemark>\n');
            kml_export_array.push('      <TimeSpan>\n');
            kml_export_array.push('        <begin>' + this_begdate + '</begin>\n');
            kml_export_array.push('        <end>' + this_enddate.toISOString() + '</end>\n');
            kml_export_array.push('      </TimeSpan>\n');
            
            if (hasColormap) {
                display_index = 0;
	        display_index = Math.round((this_data-this_datamin)/(this_datamax-this_datamin) * N_colors);
                if (display_index < 0)         { console.log(this_data); display_index = "missing"; }
                if (display_index >= N_colors) { display_index = N_colors -1; }
                if (isNaN(display_index))      { console.log(this_data); display_index = "missing"; }
                if (this_data == "NA")         { console.log(this_data); display_index = "missing"; }
                thisMergedSymbolSingle = balloonString + "_" + zeroPad(display_index,2)
                kml_export_array.push('      <styleUrl>#' + thisMergedSymbolSingle + '</styleUrl>\n');
                
            } else {
                kml_export_array.push('      <styleUrl>#' + styleName + '</styleUrl>\n');
            }
            
            kml_export_array.push('      <ExtendedData>\n');
            kml_export_array.push('        <Data name="variableName">\n');
            kml_export_array.push('          <value>' + this_varname + '</value>\n');
            kml_export_array.push('        </Data>\n');
            kml_export_array.push('        <Data name="timeRange">\n');
            kml_export_array.push('          <value>' + this_begdate +' to ' + this_enddate.toISOString() + '</value>\n');
            kml_export_array.push('        </Data>\n');
            kml_export_array.push('        <Data name="dataValue">\n');
            kml_export_array.push('          <value>' + this_data + '</value>\n');
            kml_export_array.push('        </Data>\n');
            kml_export_array.push('      </ExtendedData>\n'); 
            kml_export_array.push('      <Point>\n');
            kml_export_array.push('        <coordinates>' + this_lon + ',' + this_lat + ',0</coordinates>\n');
            kml_export_array.push('      </Point>\n');
            kml_export_array.push('    </Placemark>\n');
        }
        kml_export_array.push('  </Folder>\n');
    }
    kml_export_array.push('<!--End merged data-->\n');
    kml_export_array.push('<!--...............-->\n');

    // finish up kml
    kml_export_array.push('  </Document>\n');
    kml_export_array.push('</kml>\n');

    // this will initiate a cascade of asynchronous calls
    // to generate images for all selected colorbars, and then
    // write the KML file
    createKmlColorbarImages(0);
    
}



function saveCanvas(canvasID, defaultImageName) {
    
    var mycanvas = document.getElementById(canvasID);
    //var imageName = defaultImageName;

    var imageName = prompt("Enter file name:", defaultImageName);
    if (imageName == null || imageName == "") {
	alert("Invalid file name");
        return
    } else {
        // continue
    }



    //try {
//	html2canvas(mycanvas, {
//            background:'#FFFFFF',
//	    onrendered: function(canvas) {
//		var img = canvas.toDataURL()
//		//window.open(img);
//		
//		canvas.toBlob(function(blob) {
//		    saveAs(blob, imageName);
//		});
//	    }
//	});
//    } catch (e) {
//	console.log(e);
//	alert("Sorry, html2canvas is not\nsupported on this browser");
//
//	mycanvas.toBlob(function(blob) {
//		saveAs(blob, imageName);
//	    });
//    }

    try {
        html2canvas(mycanvas).then(canvas => {
            canvas.toBlob(function(blob) {
                window.saveAs(blob, imageName);
            });
        });
    } catch (e) {
        console.log(e);
	alert("Sorry, html2canvas is not\nsupported on this browser");
    }
}

    //
    // END PRINTING FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////////


    


    
    // END ARRAY CREATION /////////////////////////////////////////////////////////////////////////////////////////////


    // CONVERSION FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////////////
    //
    
    function make_id_string(prefix, index) {
      return prefix + index.toString();
    }

    function get_block() {
      // selected block is global variable
 
      if (document.getElementById("Blocks").checked == true) {
        selected_block = 1;
      } else {
        selected_block = 0;
      }
      
    }


    function get_selected_varselector_index() {
      // figure out which radiobutton is selected and return its index
      var return_index = -1;
      for (n=0; n<document.getElementsByName("radiobutton_vars").length; n++){
        if (document.getElementById(make_id_string("radio", n)).checked == true) {
          return_index = n;
        }
      }
      return return_index; 
    }


    function enableExtendedBlocks() {
	if (document.getElementById("multipleTimeblockOption").checked && !document.getElementById("displaychoiceSingle").checked) {
	    document.getElementById("displaychoiceSingle").checked=true;

	    document.getElementById("displaychoiceAll").disabled=true;
	    document.getElementById("displaychoiceSingle").disabled=true;

	    alert("Switching map to single point mode");
	} else {
	    document.getElementById("displaychoiceAll").disabled=false;
	    document.getElementById("displaychoiceSingle").disabled=false;
	}

	updateExtendedBlocks();

	
	
    }

    function updateExtendedBlocks() {
	
	setTimeout("process_timeblock_button(lastCheckedTimeBlock);",0);
        setTimeout("updateAqsTooltips();", 0);
        setTimeout("updateSurfmetTooltips();", 0);
        setTimeout("updatePurpleairTooltips();", 0);
        setTimeout("updateMySensorTooltips();", 0);
        setTimeout("updateHmsTooltips();", 0);
    }

function process_timeblock_button(buttonNum) {
    //console.log("in process_timeblock_button()");
      // figure out which radiobutton is selected and return its index
      var return_index = -1;
      var indS; // start
      var indE; // end

      lastCheckedTimeBlock = buttonNum;

      var foundFirstCheckedBlock = false; // default
      for (n=0; n<document.getElementsByName("timeblock_buttons").length; n++){
        if (document.getElementById("timeblockRadio_" + zeroPad(n, 3)).checked == true) {  
	    //$("#busy_gif").show();
	    busyShow('timeseries'); // hide will be queued at the end
	  if (!foundFirstCheckedBlock) {
	      indS = oTimeblock.indStart[n];
	  }
	  if (document.getElementById("multipleTimeblockOption").checked) {
	      var nExtended = n + Number(document.getElementById("extendBlocks").value);
	      if (nExtended > document.getElementsByName("timeblock_buttons").length-1) {
		  nExtended = document.getElementsByName("timeblock_buttons").length-1
		      }
	      indE = oTimeblock.indEnd[nExtended];
	  } else {
	      indE = oTimeblock.indEnd[n];
	  }
	  foundFirstCheckedBlock = true;
	}
      }

      if (!foundFirstCheckedBlock) {
	  indS = oTimeblock.indStart[lastCheckedTimeBlock];
	  indE = oTimeblock.indEnd[lastCheckedTimeBlock];
	  document.getElementById("timeblockRadio_" + zeroPad(lastCheckedTimeBlock, 3)).checked = true;
      }

      
      //console.log(indS, indE);

      // update timeslider to prevent overrunning arrays
      var maxlength = indE - indS;
      $('#time_slider').slider("option", "max", maxlength);
      if (lastpos > maxlength) {
	  lastpos = maxlength;
      }
     
      
      process_userfile(oFR_mergedBlock, document.getElementById('user_datafile1').value, missing_value, fill_value, blocktype_blk, indS, indE, false, false);
      
      
      // delete old markers
      markerind = markerLayer.length;
      markerLayerSetMapFlag = false;
      while (markerind--) {
	  markerLayer[markerind].setMap(null);
      }
      initGoogleLatLng();
      //setTimeout("computeGoogleLatLng(oUserdata, true)", 100);
      computeGoogleLatLng(oUserdata, true);
      setTimeout("process_radio('')", 150);
      
      // set time slider to zero position
      setTimeout("$('#time_slider').slider('option', 'value', 0);", 300);
      lastpos = 0;

    // recalculate airnow slider position indices
    if (!(oAirnowOzone.name === undefined) && !(oAirnowOzone.oSlider_indices === undefined)) {
	oAirnowOzone.oSlider_indices = airnow_sliderpos_lookup(oAirnowOzone);
    }
    if (!(oAirnowPM25 === undefined) && !(oAirnowPM25.oSlider_indices === undefined)) {
	oAirnowPM25.oSlider_indices = airnow_sliderpos_lookup(oAirnowPM25);
    }
    if (!(oAirnowPM10 === undefined) && !(oAirnowPM10.oSlider_indices === undefined)) {
	oAirnowPM10.oSlider_indices = airnow_sliderpos_lookup(oAirnowPM10);
    }
    if (!(oAirnowCO === undefined) && !(oAirnowCO.oSlider_indices === undefined)) {
	oAirnowCO.oSlider_indices = airnow_sliderpos_lookup(oAirnowCO);
    }
    if (!(oAirnowNO2 === undefined) && !(oAirnowNO2.oSlider_indices === undefined)) {
	oAirnowNO2.oSlider_indices = airnow_sliderpos_lookup(oAirnowNO2);
    }
    if (!(oAirnowSO2 === undefined) && !(oAirnowSO2.oSlider_indices === undefined)) {
	oAirnowSO2.oSlider_indices = airnow_sliderpos_lookup(oAirnowSO2);
    }
    if (!(oSurfmetTemperature === undefined) && !(oSurfmetTemperature.oSlider_indices === undefined)) {
	oSurfmetTemperature.oSlider_indices = airnow_sliderpos_lookup(oSurfmetTemperature);
    }
    if (!(oSurfmetPressure === undefined) && !(oSurfmetPressure.oSlider_indices === undefined)) {
	oSurfmetPressure.oSlider_indices = airnow_sliderpos_lookup(oSurfmetPressure);
    }
    if (!(oSurfmetWindSpeed === undefined) && !(oSurfmetWindSpeed.oSlider_indices === undefined)) {
	oSurfmetWindSpeed.oSlider_indices = airnow_sliderpos_lookup(oSurfmetWindSpeed);
    }
    if (!(oSurfmetWindDirection === undefined) && !(oSurfmetWindDirection.oSlider_indices === undefined)) {
	oSurfmetWindDirection.oSlider_indices = airnow_sliderpos_lookup(oSurfmetWindDirection);
    }
    if (!(oPurpleairPM25 === undefined) && !(oPurpleairPM25.oSlider_indices === undefined)) {
	oPurpleairPM25.oSlider_indices = purpleair_sliderpos_lookup(oPurpleairPM25);
    }
    if (!(oHmsFire === undefined) && !(oHmsFire.oSlider_indices === undefined)) {
	oHmsFire.oSlider_indices = hmsFireFastmarker_sliderpos_lookup(oHmsFire);
    }
    for (sensorInd=0; sensorInd<mySensorArray.length; sensorInd++) {
        if (!(mySensorArray[sensorInd] === undefined) && !(mySensorArray[sensorInd].oSlider_indices === undefined)) {
	    mySensorArray[sensorInd].oSlider_indices = mysensor_sliderpos_lookup(mySensorArray[sensorInd]);
        }
    }
    

      while (flag_computeGoogleLatLngDone == false) {
	  // do nothing
      }
      
      cropData(false);
      
      // UGLY - redo above steps for cropping to be applied
      // delete existing markers
      markerind = markerLayer.length;
      markerLayerSetMapFlag = false;
      while (markerind--) {
	  markerLayer[markerind].setMap(null);
      }
      initGoogleLatLng();
      setTimeout("computeGoogleLatLng(oUserdata, true);", 50);
      
      subset_by_id();

    computeCovarianceElementsNative();
    statsNative_sliderpos_lookup();
    
      //console.log(lastpos);
      update_optional(lastpos);
      setTimeout("busyHide('timeseries')", 0);
      setTimeout("updateAqsTooltips();", 0);
      setTimeout("updateSurfmetTooltips();", 0);
      setTimeout("updatePurpleairTooltips();", 0);
      setTimeout("updateMySensorTooltips();", 0);
      setTimeout("updateHmsTooltips();", 0);
    }


    function construct_wcs_args(coverage, bbox, timerange) {
    
      var arg_string = 'SERVICE=wcs' + 
                       '&VERSION=1.0.0' + 
                       '&REQUEST=GetCoverage' + 
                       '&COVERAGE=' + coverage +
                       '&BBOX=' + bbox +
                       '&TIME=' + timerange +
                       '&FORMAT=ascii';

        if (coverage.indexOf('purpleair') >= 0) {
            // api key
            var pakey = document.getElementById("paKeyInput").value;
            arg_string += '&KEY=' + pakey + '&AGGREGATE=hourly';

            // outdoor sensors only
            arg_string += '&OUT_IN_FLAG=0';
        }
        
      return arg_string;
    }	

    function construct_surfmet_args(coverage,  bbox, timerange) {
    
     var arg_string = 'SERVICE=wcs' + 
                    '&VERSION=1.0.0' + 
                    '&CRS=EPSG:4326' +
                    '&REQUEST=GetCoverage' + 
                    '&COVERAGE=' + coverage +
                    '&BBOX=' + bbox + ',0,0' +
                    '&TIME=' + timerange +
                    '&WIDTH=-1' +
                    '&HEIGHT=-1' +
                    '&DEPTH=-1' +
                    '&FORMAT=csv'; 
      return arg_string;
    }	  
  

//    function findTimerange(timestamps) {
//      // assume timestamps are in time order  
//       
//      var min_timestamp = timestamps[0];
//      var max_timestamp = timestamps[timestamps.length-1];
//	  
//      timerange = min_timestamp + "/" +  max_timestamp;	  
//
//      return timerange;
//    }


    function findZuluTimerange(timestampsBlocked) {
      // assume timestamps are in time order  

      for (thisblock=0; thisblock<timestampsBlocked.length; thisblock++) {
        var timestamps = timestampsBlocked[thisblock];
        if (thisblock == 0) {
          var min_timestamp = timestamps[0];
        }
        if (thisblock == timestampsBlocked.length-1) {
          var max_timestamp = timestamps[timestamps.length-1];
        }
      }

      var min_dateObjectUTC = create_dateObjectUTC(min_timestamp);
      var max_dateObjectUTC = create_dateObjectUTC(max_timestamp);

      var min_zulu = convertUTC_to_timezone(min_dateObjectUTC, "GMT", "UTC-zulu", "min");
      var max_zulu = convertUTC_to_timezone(max_dateObjectUTC, "GMT", "UTC-zulu", "max");
      timerange = min_zulu + "/" + max_zulu;

      return timerange;
    }

    function findMapExtents(mylatBlocked, mylonBlocked) {
      minLon = 180.0;
      maxLon = -180.0;
      minLat =   90.0;
      maxLat =  -90.0;
      //for (thisblock=0; thisblock<mylatBlocked.length; thisblock++) {
      for (thisblock=0; thisblock<1; thisblock++) {
        mylat = mylatBlocked[thisblock];
        mylon = mylonBlocked[thisblock];
        for (n = 0; n < mylat.length-1; n++) {
          this_lat = mylat[n];
          this_lon = mylon[n];
	  if ( (this_lat != missing_value) && (this_lon != missing_value) ) {
	    if (this_lat < minLat) { minLat = this_lat; }
	    if (this_lat > maxLat) { maxLat = this_lat; }
	    if (this_lon < minLon) { minLon = this_lon; }
	    if (this_lon > maxLon) { maxLon = this_lon; }
          }
        }
      }


      // fit the map bounds to the user data
      myLatLngSW       = new google.maps.LatLng(minLat, minLon);
      myLatLngNE       = new google.maps.LatLng(maxLat, maxLon);
      myLatLngCenter   = new google.maps.LatLng(minLat + (maxLat-minLat)/2.0, minLon + (maxLon-minLon)/2.0);
      myLatLngBounds   = new google.maps.LatLngBounds(myLatLngSW, myLatLngNE);
      map.fitBounds(myLatLngBounds);
      // make sure we do not zoom in too far, as could happen for stationary data
      var minZoomLevel = 15;
      if (map.getZoom() > minZoomLevel) {
          setTimeout("map.setZoom(" + minZoomLevel + ");",0);
          setTimeout("myLatLngBounds = map.getBounds();",0);
      } 



      // set the bbox to at least minRange degrees and no more than maxRange degrees
      let minRange  = 2.5; // degrees
      let maxRange  = 10.0;// degrees
      let lonRange  = Math.abs(maxLon - minLon);
      let latRange  = Math.abs(maxLat - minLat);
      let lonCenter = minLon + lonRange/2.0;
      let latCenter = minLat + latRange/2.0;

      myRange = Math.max(lonRange, latRange);
      myRange = Math.max(myRange, minRange); // range will be at least minRange degrees 
      myRange = Math.min(myRange, maxRange); // range will be no more than maxRange degrees 

      if (myRange >= maxRange) {
          alert("\tThe spatial extent of myData is large.\n\tAny data added with the Merge feature\n\twill be limited to " + maxRange + " degrees about\n\tthe center of myData.\t");
      }

      minLon = lonCenter - myRange/2;
      maxLon = lonCenter + myRange/2;
      minLat = latCenter - myRange/2;
      maxLat = latCenter + myRange/2;
      if (minLon < -180) {minLon = -180;}
      if (maxLon >  180) {maxLon =  180;}
      if (minLat <  -90) {minLat =  -90;}
      if (maxLat >   90) {maxLat =   90;}

      bbox = minLon.toString() + ',' + minLat.toString() + ',' +  maxLon.toString() + ',' + maxLat.toString();

      return bbox;	  

    }	

    function initGoogleLatLng() {
      allLatLng = [];
      allLatLng = new Array();
      connectLatLng = [];
      connectLatLng = new Array();

      fastMarker = [];
      fastMarker    = new Array();

      markerLayer = [];
      markerLayer   = new Array();

      singleMarker = [];
      singleMarker  = new Array();

      recompute_allLatLng = true;
   }	


function computeGoogleLatLng(dataObject, connectingLine_flag) {
    busyShow('map');
    
    // delete existing marker layers
    markerind = markerLayer.length;
    markerLayerSetMapFlag = false;
    while (markerind--) {
        if (markerLayer[markerind] != null) {
            markerLayer[markerind].setMap(null);
        }
        markerLayer[markerind] = null;
    }
    
    
    
    flag_computeGoogleLatLngDone = false;
    flag_resetDistThreshold = false;
    
    //hideAllLayers(highlightMarker);
    //hideAllLayers(markerLayer);


    // flagged indices (msec) from the data flagger
    //flagged_constant_msec        = [];
    //flagged_longMissing_msec     = [];
    //flagged_outlierStat_msec     = [];
    //flagged_outlierSpike_msec    = [];
    //flagged_aboveConc_msec       = [];
    //flagged_belowConc_msec       = [];
    //flagged_userInvalidated_msec = [];
    //if (document.getElementById("excludeFlaggerOption").checked) {
    //    if (oUserdata.flaggedIndices.constant != undefined) {
    //        flagged_constant_msec        = oUserdata.flaggedIndices.constant.map(d => d[3]);
    //    }
    //    if (oUserdata.flaggedIndices.longMissing != undefined) {
    //        flagged_longMissing_msec     = oUserdata.flaggedIndices.longMissing.map(d => d[3]);
    //    }
    //    if (oUserdata.flaggedIndices.outlierStat != undefined) {
    //        flagged_outlierStat_msec     = oUserdata.flaggedIndices.outlierStat.map(d => d[3]);
    //    }
    //    if (oUserdata.flaggedIndices.outlierSpike != undefined) {
    //        flagged_outlierSpike_msec    = oUserdata.flaggedIndices.outlierSpike.map(d => d[3]);
    //    }
    //    if (oUserdata.flaggedIndices.aboveConc != undefined) {
    //        flagged_aboveConc_msec       = oUserdata.flaggedIndices.aboveConc.map(d => d[3]);
    //    }
    //    if (oUserdata.flaggedIndices.belowConc != undefined) {
    //        flagged_belowConc_msec       = oUserdata.flaggedIndices.belowConc.map(d => d[3]);
    //    }
    //    if (oUserdata.flaggedIndices.userInvalidated != undefined) {
    //        flagged_userInvalidated_msec = oUserdata.flaggedIndices.userInvalidated.map(d => d[3]);
    //    }
    //}


    
    var this_LatLng;
    
    var n_variables = dataObject.variable[selected_block].length;
    var n_points    = dataObject.lat[selected_block].length;
    var symbol_type;
    var latLngMissingFlag;
    
    fastMarker    = new Array(n_variables);
    markerLayer   = new Array(n_variables);
    singleMarker  = new Array(n_variables);
    
    uniqueIDs = unique(dataObject.id[selected_block]);
    numIDs = uniqueIDs.length;
    for (thisID=0; thisID<numIDs; thisID++) {
        idLatLng[thisID] = [];
    }
    
    for (thisRegion=0; thisRegion<connectingLineMaxRegions; thisRegion++) {
        connectLatLng[thisRegion] = [];
    }

    exclude = document.getElementById("excludeFlaggerOption").checked;

    for (varind=0; varind<n_variables; varind++) {
        fastMarker[varind] = new Array();
        markerLayer[varind] = new Array();
        singleMarker[varind] = new Array();
        
        thisRegion = 0;    

        for (n = 0; n <= n_points-1; n++) {

            //flaggerPassed = false; // default
            //if ((flagged_constant_msec.indexOf(oUserdata.msec[selected_block][n]) < 0)          &&
            //    (flagged_longMissing_msec.indexOf(oUserdata.msec[selected_block][n]) < 0)       &&
            //    (flagged_outlierStat_msec.indexOf(oUserdata.msec[selected_block][n]) < 0)       &&
            //    (flagged_outlierSpike_msec.indexOf(oUserdata.msec[selected_block][n]) < 0)      &&
            //    (flagged_aboveConc_msec.indexOf(oUserdata.msec[selected_block][n]) < 0)         &&
            //    (flagged_belowConc_msec.indexOf(oUserdata.msec[selected_block][n]) < 0)         &&
            //    (flagged_userInvalidated_msec.indexOf(oUserdata.msec[selected_block][n]) < 0) ) {
            //    
            //    flaggerPassed = true;
            //}
            flaggerPassed = !(isMsecFlagged(oUserdata.msec[selected_block][n]));
            
	    if ( (dataObject.lat[selected_block][n] != missing_value) && (dataObject.lon[selected_block][n] != missing_value) ) {
                if (! document.getElementById("timeseries_Xaxisoption").checked) {
	            this_LatLng = new google.maps.LatLng(dataObject.lat[selected_block][n], dataObject.lon[selected_block][n]);
	            latLngMissingFlag = false;
                } else if (dataObject.msec[selected_block][n] > timeseriesPlotMsecStart && dataObject.msec[selected_block][n] < timeseriesPlotMsecEnd) {
                    this_LatLng = new google.maps.LatLng(dataObject.lat[selected_block][n], dataObject.lon[selected_block][n]);
	            latLngMissingFlag = false;
                } else {
                    this_LatLng = myLatLngCenter;
	            latLngMissingFlag = true;
                }
	    } else {
	        this_LatLng = myLatLngCenter;
	        latLngMissingFlag = true;
	    }
	    if ( ((connectingLine_flag == true) || (recompute_allLatLng == true)) && (varind == 0)) {
       
	        allLatLng.push(this_LatLng);
                
	        // array of position used by position marker, connectingLine, etc
	        for (thisID=0; thisID<numIDs; thisID++) {
	            if (dataObject.id[selected_block][n] === uniqueIDs[thisID]) {
                        idLatLng[thisID].push(this_LatLng);
                    }
                }
                
                // connecting line positions
                if (n == 0) {
  	            //debug("computing connectLatLng " + n_points);
                    last_LatLng = this_LatLng;
                }
                this_dist = google.maps.geometry.spherical.computeDistanceBetween(this_LatLng, last_LatLng);
                //console.log(n,this_dist);
                if (this_dist > connectingLineDistThreshold) {
                    thisRegion += 1;
                }
                // if we have exceeded the number of allowed regions, pile everything into the last region
                //if (thisRegion >= connectingLineMaxRegions) {
                //  thisRegion = connectingLineMaxRegions-1;
                //  flag_resetDistThreshold = true;
                //}
                
                if (thisRegion < connectingLineMaxRegions) {
                    connectLatLng[thisRegion].push(this_LatLng);
                    last_LatLng = this_LatLng;
                }
            }
            //console.log("region = ", thisRegion);
            
	    this_data1 = dataObject.variable[selected_block][varind][n];
            // use global min/max (keyed from "avergage" block)
            //this_min   = dataObject.mymin[selected_block][varind];
            //this_max   = dataObject.mymax[selected_block][varind];
            this_min   = oUserdata.mymin[0][varind];
            this_max   = oUserdata.mymax[0][varind];
            
            
            //if ( (dataObject.varname[selected_block][varind] != 'wind_magnitude(m/s)') && (dataObject.varname[selected_block][varind] != 'wind_direction(deg)') ) {  
            if ( (dataObject.varname[selected_block][varind].indexOf('wind_vector') == -1) ) {  
	        if ( (this_data1 == fill_value) || latLngMissingFlag ) {
                    display_index = "fill";
                    thisZindex = -10; 
                } else if ( (this_data1 == missing_value)) {
                    display_index = "missing";
                    thisZindex = -100; 
                } else {	
                    display_index = Math.round((this_data1-this_min)/(this_max-this_min) * (N_colors-1));
                    thisZindex = -10; 
                }
                // in case this_data1-this_min < 0
                if (display_index < 0) {
                    display_index = 0;
                }
                if (display_index > N_colors-1) {
                    display_index = N_colors-1;
                }
                
                thisConcSymbol       = "conc_" + concSymbolSet + "_" + zeroPad(display_index,2);
                thisConcSymbolSingle = "conc_" + zeroPad(display_index,2);
	        //thisZindex = zeroPad(display_index,2); 
                //thisZindex = -10; 
                
                thisSymbolString = ["<div class='"+thisConcSymbol+ "'></div>"];
                singleMarker[varind].push(new google.maps.MarkerImage(imageserver + "images/" + concSymbolDir + "/" + thisConcSymbolSingle+".gif", new google.maps.Size(15, 15), null, new google.maps.Point(7, 7)));
                
                myMarker = new com.redfin.FastMarker(0, this_LatLng, thisSymbolString, null, thisZindex, -7, -7);
                
                
	    } else {
                
                
	        if (this_data1 == fill_value) {
                    thisWindSymbol = "arrow_fill";
                } else if ( (this_data1 == missing_value)) {
                    thisWindSymbol = "arrow_missing";
                } else {	
      	            this_mag = Math.round((this_data1-this_min)/(this_max-this_min) * (N_colors-1));
	            this_dir = Math.round(dataObject.variable[selected_block][oHeaderColumn1.wind_direction][n]);  
                    thisWindSymbol       = "arrow_"+concSymbolSet + "_" + zeroPad(this_mag,2)+"_"+zeroPad(this_dir,3);
                    thisWindSymbolSingle = "arrow_"+ zeroPad(this_mag,2)+"_"+zeroPad(this_dir,3);
                    
                    
                }
                
                
	        display_index = 100;
                thisZindex = zeroPad(display_index,2);
	        thisSymbolString = ["<div class='"+thisWindSymbol+ "'></div>"]
	        singleMarker[varind].push(new google.maps.MarkerImage(imageserver + "images/svg_arrows/conc_and_angle_" + concSymbolSet + "/"+thisWindSymbolSingle+".png", new google.maps.Size(44, 44), null, new google.maps.Point(21, 21)));
                
	        fastMarkerZIndex = 10;		  
                myMarker = new com.redfin.FastMarker(0, this_LatLng, thisSymbolString, null, fastMarkerZIndex, -5, -21);
                
                
            }
            if ( (dataObject.show1[selected_block][varind][n]) && (dataObject.show2[selected_block][varind][n])) {
                if ( (! exclude) || (exclude && flaggerPassed)) {
                    fastMarker[varind].push(myMarker);
                }
            }       
        }
        
        
        // place connectingLine on map
        numRegions = connectLatLng.length;
        if ( (connectingLine_flag == true) && (varind == 0) ) {
            //debug("creating connectingLine");
            
	    for (thisRegion=0; thisRegion<numRegions; thisRegion++) {
                if (connectLatLng[thisRegion].length > 0) {
                    //debug("connectLatLng region, size: " + thisRegion + ' ' + connectLatLng[thisRegion].length);
                    
                    // remove existing lines
                    if (connectingLine[thisRegion]) {
                        connectingLine[thisRegion].setMap(null);
                    }
	            connectingLine[thisRegion] = new google.maps.Polyline({
	                path: connectLatLng[thisRegion],
	                strokeColor: "#FF0000", // red
	                strokeOpacity: 0.65,
	                strokeWeight: 2,
	                zIndex:-1
	            });
                    
	            connectingLine[thisRegion].setMap(map);
	            connectingLine[thisRegion].setVisible(false);
                }
            }
        }

        
        markerLayer[varind] = new com.redfin.FastMarkerOverlay(map, fastMarker[varind]);
	if (varind != get_selected_varselector_index() || !document.getElementById('displaychoiceAll').checked) {
	    markerLayer[varind].setMap(null);
	    markerLayerSetMapFlag = false;
	} else {
	    markerLayer[varind].setMap(map);
	    markerLayerSetMapFlag = true;
        }
        
        //slider.setMax(oUserdata.lat.length-1);
        $('#time_slider').slider("option", "max", oUserdata.lat[selected_block].length-1);
    }
    
    recompute_allLatLng = false;
    setTimeout("process_radio('');", 1000);
    
    //if (flag_resetDistThreshold) {
    //  connectingLineDistThreshold = connectingLineDistThreshold * 1.2;
    //}
    

    kml_usericon_imgarray = new Array();
    createKmlUsericonImages();
    
    flag_computeGoogleLatLngDone = true;
    busyHide('map');
}




  // function appendGoogleLatLng(dataObject) {
  //     var this_LatLng;
  //     var this_data1;
  //     var thisSite, thisTime;
  //     var n = 0;

  //     var n_sites = dataObject.nSites;
  //     var n_times = dataObject.nTimes;

  //     if (dataObject.name.indexOf('airnow') != -1) {
  // 	  clear_2darray(AqsFastMarker);
  // 	  clear_2darray(AqsLayer);
  // 	  AqsFastMarker = new Array(n_times);
  // 	  AqsLayer      = new Array(n_times);
  //     } else if (dataObject.name.indexOf('surfmet') != -1) {
  // 	  clear_2darray(SurfmetFastMarker);
  // 	  clear_2darray(SurfmetLayer);
  // 	  SurfmetFastMarker = new Array(n_times);
  // 	  SurfmetLayer      = new Array(n_times);
  //     }      

  //     for (thisTime = 0; thisTime<n_times; thisTime++) {
  // 	  if (dataObject.name.indexOf('airnow') != -1) {    
  // 	      AqsFastMarker[thisTime] = new Array();
  // 	      AqsLayer[thisTime]      = new Array();
  // 	  } else if (dataObject.name.indexOf('surfmet') != -1) {
  // 	      SurfmetFastMarker[thisTime] = new Array();
  // 	      SurfmetLayer[thisTime]      = new Array();
  // 	  }

  // 	  for (thisSite = 0; thisSite<n_sites; thisSite++) {
  // 	      this_LatLng = new google.maps.LatLng(dataObject.lat[n], dataObject.lon[n]);
	      
  // 	      this_data1 = dataObject.variable[n];
  // 	      display_index = Math.round((this_data1-dataObject.min)/(dataObject.max-dataObject.min) * N_colors);
	      
  // 	      //onmouseover_string = "onmouseover=\"tooltip.show('co2 = 375.062258<br><br> time = 2:12:52 PM GMT<br> (lat, lon) = (40.221833, -104.825048)');\""
  // 	      //onmouseout_string = "onmouseout=\"tooltip.hide();\""

  // 	      if (dataObject.name.indexOf('airnow') != -1) {
  // 		  thisConcSymbol = "aqs_symbol";
  // 		  xoffset = -20;
  // 		  yoffset = -40;
  // 	      } else if (dataObject.name.indexOf('surfmet') != -1) {
  // 		  thisConcSymbol = "surfmet_symbol";
  // 		  xoffset = -20;
  // 		  yoffset = -40;
  // 	      } else {
  // 		  thisConcSymbol = "conc_"+zeroPad(display_index,2);
  // 		  xoffset = -7;
  // 		  yoffset = -7;
  // 	      }
  // 	      thisZindex = zeroPad(display_index,2); 
	      
  // 	      thisSymbolString = ["<div class='"+thisConcSymbol+ "'", onmouseover_string, onmouseout_string+ ">&nbsp;</div>"];
	      
  // 	      myMarker = new com.redfin.FastMarker(0, this_LatLng, thisSymbolString, null, thisZindex, xoffset, yoffset);

  // 	      if (dataObject.name.indexOf('airnow') != -1) {    
  // 		  AqsFastMarker[thisTime].push(myMarker);
  // 	      } else if (dataObject.name.indexOf('surfmet') != -1) {
  // 		  SurfmetFastMarker[thisTime].push(myMarker);
  // 	      }
  // 	      n = n + 1; 
  // 	  }

  // 	  if (dataObject.name.indexOf('airnow') != -1) {    
  // 	      AqsLayer[thisTime] = new com.redfin.FastMarkerOverlay(map, AqsFastMarker[thisTime]);
  // 	  }  else if (dataObject.name.indexOf('surfmet') != -1) {
  // 	      SurfmetLayer[thisTime] = new com.redfin.FastMarkerOverlay(map, SurfmetFastMarker[thisTime]);
  // 	  }


  //     }

  // }


  function appendSurfmetGoogleLatLng(dataObject) {
      //busyShow();

      var this_LatLng;
      var this_data1;
      var thisSite, thisTime;
      var thisTimestamp;
      var n = 0;

      var n_sites = dataObject.nSites;
      var n_times = dataObject.nTimes;

      var thisVarPrefix;
      var thisMarginTopOffset = "0px"; // default
      var xTextOffset = 40;
      var yTextOffset;
      //console.log(dataObject.name);
      if (dataObject.name == 'surfmet_temperature') {
	  thisVarPrefix = 'Temperature: ';
	  thisMarginTopOffset = "0px";
	  thisUnit = '&nbsp;C';
	  yTextOffset = 0;
	  zOffset = -1;
	  thisXoffset = -9.5;
	  thisYoffset = -9.5;
          thisConcSymbol = "metar_temperature_symbol";
      
      } else if (dataObject.name == 'surfmet_pressure') {
	  thisVarPrefix = 'Pressure: ';
	  thisMarginTopOffset = "0px";
	  thisUnit = '&nbsp;hPa';
	  yTextOffset = 20;
	  zOffset = -1;
	  thisXoffset =  9.5;
	  thisYoffset = -9.5;
          thisConcSymbol = "metar_pressure_symbol";
      
      } else if (dataObject.name == 'surfmet_windspeed') {
	  thisVarPrefix = 'Wind speed: ';
	  thisMarginTopOffset = "0px";
	  thisUnit = '&nbsp;m/s';
	  yTextOffset = 40;
	  zOffset = -1;
	  thisXoffset = -9.5;
	  thisYoffset =  9.5;
          thisConcSymbol = "metar_windspeed_symbol";
      
      } else if (dataObject.name == 'surfmet_winddirection') {
	  thisVarPrefix = 'Wind dir: ';
	  thisMarginTopOffset = "0px";
	  thisUnit = '&nbsp;deg';
	  yTextOffset = 50;
	  zOffset = -1;
	  thisXoffset = 9.5;
	  thisYoffset = 9.5;
          thisConcSymbol = "metar_winddirection_symbol";
      }


      if (appendFlagSurfmetTemperature == false) {
	  clear_2darray(SurfmetTemperatureFastMarker);
	  clear_2darray(SurfmetTemperatureLayer);
	  //SurfmetTemperatureFastMarker = new Array(n_times);
	  //SurfmetTemperatureLayer      = new Array(n_times);
	  //SurfmetTemperatureLabelFastMarker = new Array(n_times);
	  //SurfmetTemperatureLabelLayer      = new Array(n_times);
	  SurfmetTemperatureTooltip      = new Array(n_times);

      }
      if (appendFlagSurfmetPressure == false) {
	  clear_2darray(SurfmetPressureFastMarker);
	  clear_2darray(SurfmetPressureLayer);
	  //SurfmetPressureFastMarker = new Array(n_times);
	  //SurfmetPressureLayer      = new Array(n_times);
	  //SurfmetPressureLabelFastMarker = new Array(n_times);
	  //SurfmetPressureLabelLayer      = new Array(n_times);
	  SurfmetPressureTooltip      = new Array(n_times);
      }
      if (appendFlagSurfmetWindSpeed == false) {
	  clear_2darray(SurfmetWindSpeedFastMarker);
	  clear_2darray(SurfmetWindSpeedLayer);
	  //SurfmetWindSpeedFastMarker = new Array(n_times);
	  //SurfmetWindSpeedLayer      = new Array(n_times);
	  //SurfmetWindSpeedLabelFastMarker = new Array(n_times);
	  //SurfmetWindSpeedLabelLayer      = new Array(n_times);
	  SurfmetWindSpeedTooltip      = new Array(n_times);
      }
      if (appendFlagSurfmetWindDirection == false) {
	  clear_2darray(SurfmetWindDirectionFastMarker);
	  clear_2darray(SurfmetWindDirectionLayer);
	  //SurfmetWindDirectionFastMarker = new Array(n_times);
	  //SurfmetWindDirectionLayer      = new Array(n_times);
	  //SurfmetWindDirectionLabelFastMarker = new Array(n_times);
	  //SurfmetWindDirectionLabelLayer      = new Array(n_times);
	  SurfmetWindDirectionTooltip      = new Array(n_times);
      }

	  
      if (1) {

          if (appendFlagSurfmetTemperature == false) {
              SurfmetTemperatureFastMarker = new Array();
              SurfmetTemperatureLayer      = new Array();
              SurfmetTemperatureLabelFastMarker = new Array();
              SurfmetTemperatureLabelLayer      = new Array();
          }
          if (appendFlagSurfmetPressure == false) {
              SurfmetPressureFastMarker = new Array();
              SurfmetPressureLayer      = new Array();
              SurfmetPressureLabelFastMarker = new Array();
              SurfmetPressureLabelLayer      = new Array();
          }
          if (appendFlagSurfmetWindSpeed == false) {
              SurfmetWindSpeedFastMarker = new Array();
              SurfmetWindSpeedLayer      = new Array();
              SurfmetWindSpeedLabelFastMarker = new Array();
              SurfmetWindSpeedLabelLayer      = new Array();
          }
          if (appendFlagSurfmetWindDirection == false) {
              SurfmetWindDirectionFastMarker = new Array();
              SurfmetWindDirectionLayer      = new Array();
              SurfmetWindDirectionLabelFastMarker = new Array();
              SurfmetWindDirectionLabelLayer      = new Array();
          }

          //console.log(dataObject);
	  for (thisTime = 0; thisTime<n_times; thisTime++) {
	      
              if (appendFlagSurfmetTemperature == false) {
		  SurfmetTemperatureTooltip[thisTime] = new Array();
	      }
	      if (appendFlagSurfmetPressure == false) {
                  SurfmetPressureTooltip[thisTime] = new Array();
	      }
	      if (appendFlagSurfmetWindSpeed == false) {
                  SurfmetWindSpeedTooltip[thisTime] = new Array();
	      }
	      if (appendFlagSurfmetWindDirection == false) {
                  SurfmetWindDirectionTooltip[thisTime] = new Array();
	      }	      


	      for (thisSite = 0; thisSite<n_sites; thisSite++) {
                  if (n < dataObject.msec.length) {
		      this_LatLng = new google.maps.LatLng(dataObject.lat[n], dataObject.lon[n]);
		      thisLat = dataObject.lat[n];
		      thisLon = dataObject.lon[n];
                      
		      //thisTimestamp = dataObject.timestamp[n];
                      //console.log(dataObject.timestamp.length, n_sites, thisSite, n, dataObject.timestamp[n]);
                      thisTimestamp = convertUTC_to_timezone(create_dateObjectUTC(dataObject.timestamp[n]), 'GMT', "ISO8601-roundToMinute", "null", 0.25);
                      nextTimestamp = convertUTC_to_timezone(create_dateObjectUTC(dataObject.timestamp[n]), 'GMT', "ISO8601-roundToMinute", "null", -0.75);
                      
		      this_data1 = dataObject.variable[n];
		      display_index = Math.round((this_data1-dataObject.min)/(dataObject.max-dataObject.min) * N_colors);
		      
		      xoffset = thisXoffset;
		      yoffset = thisYoffset;
		      thisZindex = 100; 
		      
		      thisTitle        = "'" + thisVarPrefix + this_data1.toFixed(1).toString() + thisUnit + "\nStation ID: " + dataObject.id[n] + "\nAveraging interval:\n  " + thisTimestamp + " GMT to\n  " + nextTimestamp + " GMT\n" +"'";
                      
		      thisSymbolString = "<div class=\"" + thisConcSymbol  + "\" " + " title=" + thisTitle + " onclick=\"pickSurfmet(" + thisLat + "," + thisLon + ")\" style=\"margin-top:0px;\"></div>";
		      thisTextString   = "<div onclick=\"toggleSurfmetLabelsOff()\" style=\"padding-top:2px;background-color:#FFFFFF;height:20px;width:110px;\">&nbsp;&nbsp;" + thisVarPrefix + this_data1.toFixed(1).toString() + thisUnit + "</div>";
		      
                      
                      
		      myMarker = new FastMarkerMJF(0, this_LatLng, thisSymbolString, null, thisZindex, xoffset, yoffset);
		      //myText   = new FastMarkerMJF('SurfmetText', this_LatLng, thisTextString,   null, thisZindex+zOffset, xoffset+xTextOffset, yoffset-yTextOffset);
		  
		      if (dataObject.name == 'surfmet_temperature') {
		          if (thisTime == 0) {
                              //SurfmetTemperatureLabelFastMarker[thisTime].push(myText);
                              SurfmetTemperatureFastMarker.push(myMarker);
                          }
                          SurfmetTemperatureTooltip[thisTime].push(thisTitle);
                          
		      }
		      if (dataObject.name == 'surfmet_pressure') {
		          if (thisTime == 0) {
                              //SurfmetPressureLabelFastMarker[thisTime].push(myText);
                              SurfmetPressureFastMarker.push(myMarker);
                          }
                          SurfmetPressureTooltip[thisTime].push(thisTitle);
                          
		      }
		      if (dataObject.name == 'surfmet_windspeed') {
                          if (thisTime == 0) {
                              //SurfmetWindSpeedLabelFastMarker[thisTime].push(myText);
                              SurfmetWindSpeedFastMarker.push(myMarker);
                          }
                          SurfmetWindSpeedTooltip[thisTime].push(thisTitle);
		      }
		      if (dataObject.name == 'surfmet_winddirection') {
                          if (thisTime == 0) {
                              //SurfmetWindDirectionLabelFastMarker[thisTime].push(myText);
                              SurfmetWindDirectionFastMarker.push(myMarker);
                          }
                          SurfmetWindDirectionTooltip[thisTime].push(thisTitle);
		      }
		  }
                  
		  n = n + 1; 
	      }
	      
          }
      }

      if (dataObject.name == 'surfmet_temperature') {
          // markers will be added to the map later
          SurfmetTemperatureLayer = new FastMarkerOverlayMJF(null, SurfmetTemperatureFastMarker);
          SurfmetTemperatureLayer.hide();
          //SurfmetTemperatureLabelLayer[thisTime] = new FastMarkerOverlayMJF(map, SurfmetTemperatureLabelFastMarker[thisTime]);
      }
      if (dataObject.name == 'surfmet_pressure') {
          // markers will be added to the map later
          SurfmetPressureLayer = new FastMarkerOverlayMJF(null, SurfmetPressureFastMarker);
          //SurfmetPressureLabelLayer[thisTime] = new FastMarkerOverlayMJF(map, SurfmetPressureLabelFastMarker[thisTime]);
          SurfmetPressureLayer.hide();
      }
      if (dataObject.name == 'surfmet_windspeed') {
          // markers will be added to the map later
          SurfmetWindSpeedLayer = new FastMarkerOverlayMJF(null, SurfmetWindSpeedFastMarker);
          //SurfmetWindSpeedLabelLayer[thisTime] = new FastMarkerOverlayMJF(map, SurfmetWindSpeedLabelFastMarker[thisTime]);
          SurfmetWindSpeedLayer.hide();
      }
      if (dataObject.name == 'surfmet_winddirection') {
          // markers will be added to the map later
          SurfmetWindDirectionLayer = new FastMarkerOverlayMJF(null, SurfmetWindDirectionFastMarker);
          //SurfmetWindDirectionLabelLayer[thisTime] = new FastMarkerOverlayMJF(map, SurfmetWindDirectionLabelFastMarker[thisTime]);
          SurfmetWindDirectionLayer.hide();
      }
      
       
      if (dataObject.name.indexOf('surfmet_temperature') != -1) {
	  appendFlagSurfmetTemperature = true;
      }
      if (dataObject.name.indexOf('surfmet_pressure') != -1) {
	  appendFlagSurfmetPressure = true;
      }
      if (dataObject.name.indexOf('surfmet_windspeed') != -1) {
	  appendFlagSurfmetWindSpeed = true;
      }
      if (dataObject.name.indexOf('surfmet_winddirection') != -1) {
	  appendFlagSurfmetWindDirection = true;
      }

      //busyHide(); // hide will occur when map is idle, due to idle listener already set

      setTimeout("update_optional(lastpos);", 0);    
      setTimeout("updateSurfmetTooltips();",0);

  }




  function appendPurpleairGoogleLatLng(dataObject) {
      //busyShow();

      var this_LatLng;
      var this_data1;
      var thisSite, thisTime;
      var thisTimestamp;
      var n = 0;
      var thisTimeIndex = 0;
      
      var n_times   = dataObject.nTimes;
      var siteArray = dataObject.nSites;

      var thisVarPrefix;
      var thisMarginTopOffset = "0px"; // default
      var xTextOffset = 40;
      var yTextOffset;
      //console.log(dataObject.name);
      if (dataObject.name == 'purpleair_pm25corrected') {
	  thisVarPrefix = 'PM2.5 corrected: ';
	  thisMarginTopOffset = "0px";
	  thisUnit = ' &nbsp;ug/m3'; // leading space is important for later parsing
	  yTextOffset = 0;
	  zOffset = -1;
	  thisXoffset = -9.5;
	  thisYoffset = -9.5;
          //thisConcSymbol = "purpleair_pm25_symbol";
      }
      
      if (appendFlagPurpleairPM25 == false) {
	  clear_2darray(PurpleairPM25FastMarker);
	  clear_2darray(PurpleairPM25Layer);
	  PurpleairPM25Tooltip      = new Array(n_times);
          for (ind=0; ind < n_times; ind++) {
              PurpleairPM25Tooltip[ind]   = new Array();
          }          
      }
      
      //console.log(n_sites,n_times,data);
      
      if (1) {
          
          if (appendFlagPurpleairPM25 == false) {
              PurpleairPM25FastMarker      = new Array();
              PurpleairPM25Layer           = new Array();
              PurpleairPM25LabelFastMarker = new Array();
              PurpleairPM25LabelLayer      = new Array();
          }
          
          siteList = new Array();
          timeList = new Array();
          lastTime = '';

          for (thisTime = 0; thisTime<n_times; thisTime++) {
              n_sites = siteArray[thisTime];
              for (thisSite = 0; thisSite<n_sites; thisSite++) {
                  if (n < dataObject.msec.length) {
                      this_LatLng  = new google.maps.LatLng(dataObject.lat[n], dataObject.lon[n]);
	              thisLat      = dataObject.lat[n];
	              thisLon      = dataObject.lon[n];
                      thisSensorID = dataObject.id[n]; 
                      //console.log(n, dataObject.timestamp[n]);
	              //thisTimestamp = dataObject.timestamp[n];
                      thisTimeString = dataObject.timestamp[n].substring(0,13); // only want time up to the hour
                      thisTimeString += ':00:00-0000';
                      thisTimestamp = convertUTC_to_timezone(create_dateObjectUTC(thisTimeString), 'GMT', "ISO8601-roundToMinute", "null", 0.0);
                      nextTimestamp = convertUTC_to_timezone(create_dateObjectUTC(thisTimeString), 'GMT', "ISO8601-roundToMinute", "null", -1.0);
                      
                      this_data1 = dataObject.variable[n];
                      if ( (this_data1 == fill_value) || thisLat < -90.0 || thisLat > 90.0 || thisLon < -180.0 || thisLon > 180.0) {
                          display_index = "missing";
                      } else if (this_data1 == missing_value) {
                          display_index = "missing";
                      } else { 
	                  display_index = Math.round((this_data1-dataObject.min)/(dataObject.max-dataObject.min) * N_colors);
                      }
                      if (display_index < 0) {
                          display_index = 0;
                      }
                      if (display_index > N_colors-1) {
                          display_index = N_colors-1;
                      }
                      
	              xoffset = thisXoffset;
	              yoffset = thisYoffset;
	              thisZindex = 100; 
                      
                      thisConcSymbol       = "purpleair_square_" + concSymbolSet + "_" + zeroPad(display_index,2);
                      
                      
                      
                      thisTitle        = "'" + thisVarPrefix + this_data1.toFixed(1).toString() + thisUnit + "\nStation ID: " + dataObject.id[n] + "\nAveraging interval:\n  " + thisTimestamp + " GMT to\n  " + nextTimestamp + " GMT\n" +"'";
                      
	              thisSymbolString = "<div class=\"" + thisConcSymbol  + "\" " + " title=" + thisTitle + " onclick=\"pickPurpleair(" + thisLat + "," + thisLon + "," + thisSensorID + ")\" style=\"margin-top:0px;\"></div>";
	              thisTextString   = "<div onclick=\"togglePurpleairLabelsOff()\" style=\"padding-top:2px;background-color:#FFFFFF;height:20px;width:110px;\">&nbsp;&nbsp;" + thisVarPrefix + this_data1.toFixed(1).toString() + thisUnit + "</div>";
	              
	              myMarker = new FastMarkerMJF(0, this_LatLng, thisSymbolString, null, thisZindex, xoffset, yoffset);
                      
                      
                      //if (!siteList.includes(thisSite) && thisTime == 0) {
                      if (!siteList.includes(thisSite)) {
                          PurpleairPM25FastMarker.push(myMarker);
                      }
                      
                      if ( (thisTime == lastTime) || n == 0) {
                          // do nothing
                      } else {
                          thisTimeIndex += 1;
                      }
                      //PurpleairPM25Tooltip[thisTimeIndex].push(thisTitle);
                      PurpleairPM25Tooltip[thisTime].push(thisTitle);
                      
                      lastTime = thisTime;
                  }
                  n = n + 1;
              }
          }
      }

      if (dataObject.name == 'purpleair_pm25corrected') {
          // markers will be added to the map later
          PurpleairPM25Layer = new FastMarkerOverlayMJF(null, PurpleairPM25FastMarker);
          PurpleairPM25Layer.hide();
      }
       
      if (dataObject.name.indexOf('purpleair_pm25corrected') != -1) {
	  appendFlagPurpleairPM25 = true;
      }

      //busyHide(); // hide will occur when map is idle, due to idle listener already set

      //console.log("ntimes:", PurpleairPM25Tooltip.length);
      //for (i=0; i<PurpleairPM25Tooltip.length; i++){
      //    console.log(i, PurpleairPM25Tooltip[i].length);
      //}

      setTimeout("update_optional(lastpos);", 0);    
      setTimeout("updatePurpleairTooltips();",0);

  }



  function appendMySensorGoogleLatLng(dataObject) {
      //busyShow();

      //console.log(dataObject);
      var sensorInd = Number(dataObject.name.slice(-1));
      
      var this_LatLng;
      var this_data1;
      var thisSite, thisTime;
      var thisTimestamp;
      var n = 0;
      
      var n_times = dataObject.nTimes;
      var n_sites = dataObject.nSites;

      var thisVarPrefix;
      var thisMarginTopOffset = "0px"; // default
      var xTextOffset = 40;
      var yTextOffset;
      //console.log(dataObject.name);
      if (dataObject.name.indexOf('mysensor') == 0) {
	  //thisVarPrefix = 'MySensor ' + dataObject.curVarname + ': ';
	  thisVarPrefix = 'Ext. Data ' + (sensorInd+1) + ' ' + dataObject.curVarname + ': '; // sensorInd+1 because label is 1-based
	  thisMarginTopOffset = "0px";
	  //thisUnit = ' &nbsp;ug/m3'; // leading space is important for later parsing
	  thisUnit = ' &nbsp;'; // leading space is important for later parsing
	  yTextOffset = 0;
	  zOffset = -1;
	  thisXoffset = -9.5;
	  thisYoffset = -9.5;
      }
      
      if (allAppendFlagMySensors[sensorInd] == false) {
          //console.log("clearing mysensor" + sensorInd + " markers");
	  clear_1darray(allMySensorFastMarkers[sensorInd]);
	  clear_1darray(allMySensorLayers[sensorInd]);
	  allMySensorTooltips[sensorInd] = new Array(n_times);         
      }
      
      //console.log(n_sites,n_times,data);
      
      if (1) {
          
          if (allAppendFlagMySensors[sensorInd] == false) {
              allMySensorFastMarkers[sensorInd]      = new Array();
              allMySensorLayers[sensorInd]           = new Array();
              allMySensorLabelFastMarkers[sensorInd] = new Array();
              allMySensorLabelLayers[sensorInd]      = new Array();
          }
          
          for (thisTime = 0; thisTime<n_times; thisTime++) {

              if (allAppendFlagMySensors[sensorInd] == false) {
                  allMySensorTooltips[sensorInd][thisTime]     = new Array();
              }

              for (thisSite = 0; thisSite<n_sites; thisSite++) {
                  if (n < dataObject.msec.length) {
                      //console.log(thisTime, thisSite);
                      this_LatLng  = new google.maps.LatLng(dataObject.lat[n], dataObject.lon[n]);
	              thisLat      = dataObject.lat[n];
	              thisLon      = dataObject.lon[n];
                      thisSensorID = dataObject.id[n]; 
                      //console.log(n, dataObject.timestamp[n]);
	              //thisTimestamp = dataObject.timestamp[n];
                      //thisTimeString = dataObject.timestamp[n].substring(0,13); // only want time up to the hour
                      //thisTimeString += ':00:00-0000';
                      thisTimeString = dataObject.timestamp[n];
                      thisTimestamp = convertUTC_to_timezone(create_dateObjectUTC(thisTimeString), 'GMT', "ISO8601", "null", 0.0);
                      nextTimestamp = convertUTC_to_timezone(create_dateObjectUTC(thisTimeString), 'GMT', "ISO8601", "null", -1.0);
                      
                      this_data1 = dataObject.variable[n];
                      if ( (this_data1 == fill_value) || thisLat < -90.0 || thisLat > 90.0 || thisLon < -180.0 || thisLon > 180.0) {
                          display_index = "missing";
                      } else if (this_data1 == missing_value) {
                          display_index = "missing";
                      } else { 
	                  display_index = Math.round((this_data1-dataObject.min)/(dataObject.max-dataObject.min) * N_colors);
                      }
                      if (display_index < 0) {
                          display_index = 0;
                      }
                      if (display_index > N_colors-1) {
                          display_index = N_colors-1;
                      }
                      
	              xoffset = thisXoffset;
	              yoffset = thisYoffset;
	              thisZindex = 100; 
                      
                      //thisConcSymbol       = "mysensor_balloon_" + concSymbolSet + "_" + zeroPad(display_index,2);
                      thisConcSymbol       = "mysensor_balloon" + (sensorInd+1) + "_" + concSymbolSet + "_" + zeroPad(display_index,2);
                      
                      //console.log(this_data1, thisConcSymbol);
                      
                      
                      thisTitle        = "'" + thisVarPrefix + this_data1.toFixed(1).toString() + thisUnit + "\nStation ID: " + dataObject.id[n] + "\nMeasurement time:\n  " + thisTimestamp + " GMT \n " + "'";
                      
                      thisSymbolString = "<div class=\"" + thisConcSymbol  + "\" " + " title=" + thisTitle + " onclick=\"pickMySensor(" + thisLat + "," + thisLon + "," + thisSensorID + ")\" style=\"margin-top:0px;\"></div>";
	              //thisSymbolString = "<div class=\"" + thisConcSymbol  + "\" " + " title=" + thisTitle + " style=\"margin-top:0px;\"></div>";
	              thisTextString   = "<div onclick=\"toggleMySensorLabelsOff()\" style=\"padding-top:2px;background-color:#FFFFFF;height:20px;width:110px;\">&nbsp;&nbsp;" + thisVarPrefix + this_data1.toFixed(1).toString() + thisUnit + "</div>";
	              
	              myMarker = new FastMarkerMJF(0, this_LatLng, thisSymbolString, null, thisZindex, xoffset, yoffset);
                      
                      
                      //if (!siteList.includes(thisSite) && thisTime == 0) {
                      //if (!siteList.includes(thisSite)) {
                      //    MySensorFastMarker.push(myMarker);
                      //}
                      if (thisTime == 0) {
                          //console.log(sensorInd);
                          //console.log(allMySensorFastMarkers);
                          allMySensorFastMarkers[sensorInd].push(myMarker);
                      }
                      allMySensorTooltips[sensorInd][thisTime].push(thisTitle);
                      
                      
                      //if ( (thisTime == lastTime) || n == 0) {
                      //    // do nothing
                      //} else {
                      //    thisTimeIndex += 1;
                      //}
                      //MySensorTooltip[thisTime].push(thisTitle);
                      
                      //lastTime = thisTime;
                  }
                  n = n + 1;
              }
          }
      }

      if (dataObject.name.indexOf('mysensor') == 0) {
          // markers will be added to the map later
          allMySensorLayers[sensorInd] = new FastMarkerOverlayMJF(null, allMySensorFastMarkers[sensorInd]);
          allMySensorLayers[sensorInd].hide();
      }
       
      if (dataObject.name.indexOf('mysensor') != -1) {
	  allAppendFlagMySensors[sensorInd] = true;
      }

      //busyHide(); // hide will occur when map is idle, due to idle listener already set

      setTimeout("update_optional(lastpos);", 0);    
      setTimeout("updateMySensorTooltips();",0);

  }








/////
  function appendHmsGoogleLatLng(dataObject) {
      //busyShow();

      var this_LatLng;
      var this_data1;
      var thisSite, thisTime;
      var thisTimestamp;
      var n = 0;

      var n_sites = dataObject.nSites;
      var n_times = dataObject.nTimes;

      var thisVarPrefix;
      var thisMarginTopOffset = "0px"; // default
      var xTextOffset = 40;
      var yTextOffset;
      //console.log(dataObject.name);
      if (dataObject.name == 'hms_firepower') {
	  thisVarPrefix = 'Fire power: ';
	  thisMarginTopOffset = "0px";
	  thisUnit = '&nbsp;MW';
	  yTextOffset = 0;
	  zOffset = -1;
	  thisXoffset = -9.5;
	  thisYoffset = -9.5;
          thisConcSymbol = "hms_firepower_symbol";
      }

      if (appendFlagHmsFire == false) {
	  clear_2darray(HmsFireFastMarker);
	  clear_2darray(HmsFireLayer);
	  HmsFireTooltip      = new Array(n_times);
          HmsFireFastMarker   = new Array(n_times);
      }
      
	  
      if (1) {

          if (appendFlagHmsFire == false) {
              HmsFireLayer      = new Array();
              HmsFireLabelFastMarker = new Array();
              HmsFireLabelLayer      = new Array();
          }

          // HMS is a "ragged array" with a different number of fire locations at each time.
          // E.g.:
          //Timestamp(UTC)  LONGITUDE(deg)  LATITUDE(deg)   fire_power(MW)
          //2019-10-03T09:47:00-0000        -105.97500        38.40700          1.3220
          //2019-10-03T09:47:00-0000        -105.97500        38.40700          1.3220
          //2019-10-03T09:47:00-0000        -105.97600        38.47200          1.3020
          //2019-10-03T09:47:00-0000        -105.97600        38.47200          1.3020
          //2019-10-03T18:05:00-0000        -106.01900        38.43000         17.4940
          //2019-10-03T18:05:00-0000        -106.02100        38.42100         28.6080
          //2019-10-03T19:24:00-0000        -105.97600        38.40100          5.2450
          //2019-10-03T19:24:00-0000        -105.97700        38.40500          5.2450
          //2019-10-03T19:24:00-0000        -105.98200        38.39900         11.6730
          // etc

          var nSamples = dataObject.timestamp.length;
 
          // loop through all fire samples and group them if they occur in the same day
          thisDayInd = 0; 
          thisDate = create_dateObjectUTC(dataObject.timestamp[0]);
          previousYYYYMMDD = thisDate.getUTCFullYear() + zeroPad(thisDate.getUTCMonth()+1,2) + zeroPad(thisDate.getUTCDate(),2);
          HmsFireFastMarker[0] = new Array();
          HmsFireTooltip[0]    = new Array();
          for (thisSampleInd=0; thisSampleInd<nSamples; thisSampleInd++) {
              //if (appendFlagHmsFire == false) {
              //    HmsFireFastMarker[thisTimeInd] = new Array();
              //    HmsFireTooltip[thisTimeInd]    = new Array();
	      //}
              
              
              thisLat = dataObject.lat[thisSampleInd];
              thisLon = dataObject.lon[thisSampleInd];
              this_LatLng = new google.maps.LatLng(thisLat, thisLon);

              //thisTimestamp = convertUTC_to_timezone(create_dateObjectUTC(dataObject.timestamp[thisSampleInd]), 'GMT', "ISO8601", "null", 0.25);
              //nextTimestamp = convertUTC_to_timezone(create_dateObjectUTC(dataObject.timestamp[thisSampleInd]), 'GMT', "ISO8601", "null", -0.75);
              thisTimestamp = convertUTC_to_timezone(create_dateObjectUTC(dataObject.timestamp[thisSampleInd]), 'GMT', "ISO8601-roundToMinute", "null", 0.0);
              
              this_data1 = dataObject.variable[thisSampleInd];
              display_index = Math.round((this_data1-dataObject.min)/(dataObject.max-dataObject.min) * N_colors);
              
              xoffset = thisXoffset;
              yoffset = thisYoffset;
              thisZindex = 100; 
              
              thisTitle        = "'" + dataObject.id[thisSampleInd] + "\n" + thisVarPrefix + this_data1.toFixed(1).toString() + thisUnit + "\nTime:\n  " + thisTimestamp + " GMT\n" +"'";
              
              thisSymbolString = "<div class=\"" + thisConcSymbol  + "\" " + " title=" + thisTitle + " style=\"margin-top:0px;\"></div>";
              thisTextString   = "<div style=\"padding-top:2px;background-color:#FFFFFF;height:20px;width:110px;\">&nbsp;&nbsp;" + thisVarPrefix + this_data1.toFixed(1).toString() + thisUnit + "</div>";
              
              myMarker = new FastMarkerMJF(0, this_LatLng, thisSymbolString, null, thisZindex, xoffset, yoffset);

              
              // figure out YYYYMMDD of thisSample
              thisDate = create_dateObjectUTC(dataObject.timestamp[thisSampleInd]);
              thisYYYYMMDD = thisDate.getUTCFullYear() + zeroPad(thisDate.getUTCMonth()+1,2) + zeroPad(thisDate.getUTCDate(),2);
              //console.log(thisYYYYMMDD );

              // put markers and tooltips into their appropriate bins
              if (thisYYYYMMDD === previousYYYYMMDD) {
                  if (dataObject.name == 'hms_firepower') {
                      HmsFireFastMarker[thisDayInd].push(myMarker);
                      HmsFireTooltip[thisDayInd].push(thisTitle);
                  }
              } else {
                  previousYYYYMMDD = thisYYYYMMDD;
                  thisDayInd += 1;
                  HmsFireFastMarker[thisDayInd] = new Array();
                  HmsFireTooltip[thisDayInd]    = new Array();
                  HmsFireFastMarker[thisDayInd].push(myMarker);
                  HmsFireTooltip[thisDayInd].push(thisTitle);
              }
          }
      }

      //console.log("appendHmsGoogleLatLng HmsFireFastMarker:", HmsFireFastMarker);
      //count = 0;
      //for (aha=0; aha<HmsFireFastMarker.length; aha++) {
      //    count += HmsFireFastMarker[aha].length;
      //}
      //console.log(count);

      if (dataObject.name == 'hms_firepower') {
          // markers will be added to the map later
          HmsFireLayer = new FastMarkerOverlayMJF(null, HmsFireFastMarker[0]);
          HmsFireLayer.hide();
      }
      
       
      if (dataObject.name.indexOf('hms_firepower') != -1) {
	  appendFlagHmsFire = true;
      }

      //busyHide(); // hide will occur when map is idle, due to idle listener already set

      setTimeout("update_optional(lastpos);", 0);    
      setTimeout("updateHmsTooltips();",0);

  }
//////







function moveAqsHighlightMarker(lat, lon) {
    //console.log(lat);
    //console.log(lon);
    var thisLatLng = new google.maps.LatLng(lat, lon);
    aqsHighlightMarker.setPosition(thisLatLng);
}

function moveSurfmetHighlightMarker(lat, lon) {
    //console.log('in moveSurfmetHighlightMarker');
    //console.log(lat);
    //console.log(lon);
    var thisLatLng = new google.maps.LatLng(lat, lon);
    surfmetHighlightMarker.setPosition(thisLatLng);
}

function movePurpleairHighlightMarker(lat, lon) {
    var thisLatLng = new google.maps.LatLng(lat, lon);
    purpleairHighlightMarker.setPosition(thisLatLng);
}

function moveMySensorHighlightMarker(lat, lon) {
    var thisLatLng = new google.maps.LatLng(lat, lon);
    mysensorHighlightMarker.setPosition(thisLatLng);
}

function pickAQS(lat, lon, id, handle) {
    console.log("in pickAQS");
    //console.log(lat);
    //console.log(lon);
    console.log('id =', id);
    console.log('handle =', handle);
    
    var bbox_width  = 0.011; //degrees
    var bbox_height = 0.011; //degrees
    var bracket_timerange = oUserdata.timerange;
    bracket_timerange = bracket_timerange.replace(/[T](\d{2})/, "T00"); // set initial hour to 00
    bracket_timerange = bracket_timerange.replace(/([T](\d{2}))(?!.*[T](\d{2}))/, "T23"); // set final hour to 23
    AQSbbox =  (lon - (bbox_width/2)).toString() + ',' +
	       (lat - (bbox_height/2)).toString() + ',' +
	       (lon + (bbox_width/2)).toString() + ',' +
	       (lat + (bbox_height/2)).toString();
    //console.log(my_bbox);

    if (handle == 'airnow_pm25') {
        oAirnowPM25.selectedSiteID = id;
    } else if (handle == 'airnow_pm10') {
        oAirnowPM10.selectedSiteID = id;
    } else if (handle == 'airnow_ozone') {
        oAirnowOzone.selectedSiteID = id;
    } else if (handle == 'airnow_co') {
        oAirnowCO.selectedSiteID = id;
    } else if (handle == 'airnow_no2') {
        oAirnowNO2.selectedSiteID = id;
    } else if (handle == 'airnow_so2') {
        oAirnowSO2.selectedSiteID = id;
    }
    
    get_airnow_closest('airnow.pm25',  AQSbbox, bracket_timerange, rsigserver, 'map');
    get_airnow_closest('airnow.pm10',  AQSbbox, bracket_timerange, rsigserver, 'map');
    get_airnow_closest('airnow.ozone', AQSbbox, bracket_timerange, rsigserver, 'map');
    get_airnow_closest('airnow.co',    AQSbbox, bracket_timerange, rsigserver, 'map');
    get_airnow_closest('airnow.so2',   AQSbbox, bracket_timerange, rsigserver, 'map');
    get_airnow_closest('airnow.no2',   AQSbbox, bracket_timerange, rsigserver, 'map');
	
    moveAqsHighlightMarker(lat, lon);
    
    //showAllLayers(AqsPM25LabelLayer);
    //showAllLayers(AqsOzoneLabelLayer);
    update_optional(lastpos);

}

// function updateAqsTooltip() {
//     //AqsOzoneLayer[0].setMap(null);

//     console.log('in ', AqsOzoneLayer._markers[0]._htmlTextArray);

//     var nMarkers = AqsOzoneLayer._markers.length;
//     //for (mInd=0; mInd<nMarkers; ++mInd) {
//     //    AqsOzoneLayer._markers[mInd]._htmlTextArray = AqsOzoneLayer._markers[mInd]._htmlTextArray.replace("Station", "aha");
//     //}

//     if (lastAqsUpdatepos != lastpos) {
//         AqsOzoneLayer.setMap(null);
//         AqsOzoneLayer.setMap(map);
//         lastAqsUpdatepos = lastpos;
//     }

//     console.log('out ', AqsOzoneLayer._markers[0]._htmlTextArray);
//     console.log(AqsOzoneLayer._markers[0]._htmlTextArray.indexOf("Station"));
// }



//function updateAqsTooltips() {
//    //console.log("in updateAqsTooltips");
//    if (!(AqsOzoneLayer._markers === undefined)) {
//        var nMarkers = AqsOzoneLayer._markers.length;
//        
//        var closest_timeindex = oAirnowOzone.oSlider_indices.time[lastpos];
//        for (mInd=0; mInd<nMarkers; ++mInd) {
//            var thisDivParse = AqsOzoneLayer._markers[mInd]._htmlTextArray.split("=");
//            var oldTitle = thisDivParse[2].replace('onclick','');
//            var newTitle = AqsOzoneTooltip[closest_timeindex][mInd];
//            AqsOzoneLayer._markers[mInd]._htmlTextArray = AqsOzoneLayer._markers[mInd]._htmlTextArray.replace(oldTitle, newTitle);
//        }
//    } else {
//        console.log("AqsOzoneLayer._markers undefined");
//    }
//}


function updateAqsTooltips() {
    if (!(AqsOzoneLayer._markers === undefined)) {
        updateTooltipsByLayer(AqsOzoneLayer, oAirnowOzone, AqsOzoneTooltip, aqsOzoneColormap);
        if (document.getElementById("addAqsOzoneLocations").checked) {
            $("#colorbar_canvas_airnowO3").show();
            init_colorbar(cbStartX, cbStartY, oAirnowOzone.min, oAirnowOzone.max, 'Airnow O3', 'colorbar_canvas_airnowO3',  getColormapValuesByName(aqsOzoneColormap), 0);
        } else {
            $("#colorbar_canvas_airnowO3").hide();
        }
    } else {
        $("#colorbar_canvas_airnowO3").hide();
    }
    
    if (!(AqsPM25Layer._markers === undefined)) {
        updateTooltipsByLayer(AqsPM25Layer,  oAirnowPM25,  AqsPM25Tooltip, aqsPM25Colormap);
        if (document.getElementById("addAqsPM25Locations").checked) {
            $("#colorbar_canvas_airnowPM25").show();
            init_colorbar(cbStartX, cbStartY, oAirnowPM25.min, oAirnowPM25.max, 'Airnow PM25', 'colorbar_canvas_airnowPM25',  getColormapValuesByName(aqsPM25Colormap), 0);
        } else {
            $("#colorbar_canvas_airnowPM25").hide();
        }
    } else {
        $("#colorbar_canvas_airnowPM25").hide();
    }

    if (!(AqsPM10Layer._markers === undefined)) {
        updateTooltipsByLayer(AqsPM10Layer,  oAirnowPM10,  AqsPM10Tooltip, aqsPM10Colormap);
        if (document.getElementById("addAqsPM10Locations").checked) {
            $("#colorbar_canvas_airnowPM10").show();
            init_colorbar(cbStartX, cbStartY, oAirnowPM10.min, oAirnowPM10.max, 'Airnow PM10', 'colorbar_canvas_airnowPM10',  getColormapValuesByName(aqsPM10Colormap), 0);
        } else {
            $("#colorbar_canvas_airnowPM10").hide();
        }
    } else {
        $("#colorbar_canvas_airnowPM10").hide();
    }
    
    if (!(AqsCOLayer._markers === undefined)) {
        updateTooltipsByLayer(AqsCOLayer,    oAirnowCO,    AqsCOTooltip, aqsCOColormap);
        if (document.getElementById("addAqsCOLocations").checked) {
            $("#colorbar_canvas_airnowCO").show();
            init_colorbar(cbStartX, cbStartY, oAirnowCO.min, oAirnowCO.max, 'Airnow CO', 'colorbar_canvas_airnowCO',  getColormapValuesByName(aqsCOColormap), 0);
        } else {
            $("#colorbar_canvas_airnowCO").hide();
        }
    } else {
        $("#colorbar_canvas_airnowCO").hide();
    }
    
    if (!(AqsNO2Layer._markers === undefined)) {
        updateTooltipsByLayer(AqsNO2Layer,   oAirnowNO2,   AqsNO2Tooltip, aqsNO2Colormap);
        if (document.getElementById("addAqsNO2Locations").checked) {
            $("#colorbar_canvas_airnowNO2").show();
            init_colorbar(cbStartX, cbStartY, oAirnowNO2.min, oAirnowNO2.max, 'Airnow NO2', 'colorbar_canvas_airnowNO2',  getColormapValuesByName(aqsNO2Colormap), 0);
        } else {
            $("#colorbar_canvas_airnowNO2").hide();
        }
    } else {
        $("#colorbar_canvas_airnowNO2").hide();
    }
    
    if (!(AqsSO2Layer._markers === undefined)) {
        updateTooltipsByLayer(AqsSO2Layer,   oAirnowSO2,   AqsSO2Tooltip, aqsSO2Colormap);
        if (document.getElementById("addAqsSO2Locations").checked) {
            $("#colorbar_canvas_airnowSO2").show();
            init_colorbar(cbStartX, cbStartY, oAirnowSO2.min, oAirnowSO2.max, 'Airnow SO2', 'colorbar_canvas_airnowSO2',  getColormapValuesByName(aqsSO2Colormap), 0);
        } else {
            $("#colorbar_canvas_airnowSO2").hide();
        }
    } else {
        $("#colorbar_canvas_airnowSO2").hide();
    }
}

function updateSurfmetTooltips() {
    if (!(SurfmetTemperatureLayer._markers === undefined)) {
        updateTooltipsByLayer(SurfmetTemperatureLayer, oSurfmetTemperature, SurfmetTemperatureTooltip, null);
    }
    if (!(SurfmetPressureLayer._markers === undefined)) {
        updateTooltipsByLayer(SurfmetPressureLayer, oSurfmetPressure, SurfmetPressureTooltip, null);
    }
    if (!(SurfmetWindSpeedLayer._markers === undefined)) {
        updateTooltipsByLayer(SurfmetWindSpeedLayer, oSurfmetWindSpeed, SurfmetWindSpeedTooltip, null);
    }
    if (!(SurfmetWindDirectionLayer._markers === undefined)) {
        updateTooltipsByLayer(SurfmetWindDirectionLayer, oSurfmetWindDirection, SurfmetWindDirectionTooltip, null);
    }
}

function updatePurpleairTooltips() {
    if (!(PurpleairPM25Layer._markers === undefined)) {
        //console.log(PurpleairPM25Layer);
        //console.log(oPurpleairPM25);
        //console.log(PurpleairPM25Tooltip);
        updateTooltipsByLayer(PurpleairPM25Layer, oPurpleairPM25, PurpleairPM25Tooltip, purpleairColormap);
        if (document.getElementById("addPurpleairLocations").checked) {
            $("#colorbar_canvas_purpleair").show();
            init_colorbar(cbStartX, cbStartY, oPurpleairPM25.min, oPurpleairPM25.max, 'Purpleair PM2.5 corrected', 'colorbar_canvas_purpleair',  getColormapValuesByName(purpleairColormap), 0);
        } else {
            $("#colorbar_canvas_purpleair").hide();
        }
    } else {
        $("#colorbar_canvas_purpleair").hide();
    }
}

function updateMySensorTooltips() {

    for (sensorInd=0; sensorInd<allMySensorLayers.length; sensorInd++) {
        thisCanvas = "colorbar_canvas_mysensor" + sensorInd;

        if (!(allMySensorLayers[sensorInd]._markers === undefined)) {    
            //console.log(MySensorLayer);
            //console.log(oMySensor);
            //console.log(MySensorTooltip);
            updateTooltipsByLayer(allMySensorLayers[sensorInd], mySensorArray[sensorInd], allMySensorTooltips[sensorInd], mysensorColormap[sensorInd]);
            if (document.getElementById("addMySensorLocations" + sensorInd).checked) {
                $("#" + thisCanvas).show();
                //console.log("here", oMySensor.min, oMySensor.max, mysensorColormap);
                var titleString = 'External data ' + (sensorInd+1) + " " + mySensorArray[sensorInd].curVarname; // sensorInd+1 because labels are one-based
                init_colorbar(cbStartX, cbStartY, mySensorArray[sensorInd].min, mySensorArray[sensorInd].max, titleString, thisCanvas, getColormapValuesByName(mysensorColormap[sensorInd]), 0);
            } else {
                $("#" + thisCanvas).hide();
            }
        } else {
            $("#" + thisCanvas).hide();
        }
    }
}

function updateHmsTooltips() {
    if (!(HmsFireLayer._markers === undefined)) {
        updateTooltipsByLayer(HmsFireLayer, oHmsFire, HmsFireTooltip, null);
    }
}

function updateTooltipsByLayer(myLayer, myDataObject, myTooltipArray, myColormap) {
    //console.log("in updateTooltipsByLayer", myDataObject);
    //console.log(myDataObject.oSlider_indices.time[lastpos]);
    if (!(myLayer._markers === undefined) && !(myDataObject.oSlider_indices === undefined) && (myDataObject.oSlider_indices.time[lastpos] >= 0) ) {
        var nMarkers = myLayer._markers.length;
        if (nMarkers > 0) {
            //console.log(myDataObject);
            var closest_timeindex = myDataObject.oSlider_indices.time[lastpos];

            var stationIDs = new Array();
            for (tInd=0; tInd < myTooltipArray[closest_timeindex].length; tInd++) {
                stationIDs.push(myTooltipArray[closest_timeindex][tInd].split('\n')[1]);
            }

            var glyphParse = myLayer._markers[0]._htmlTextArray.split("class=")[1].split("_");
            isInverted = false; // if original colormap is inverted
            for (gInd=0; gInd<glyphParse.length; gInd++) {
                //console.log(glyphParse[gInd], glyphParse[gInd].indexOf("inverted"));
                if (glyphParse[gInd].indexOf("inverted") != -1) {
                    isInverted = true;
                }
            }
            
            //console.log("nMarkers=", nMarkers);
            for (mInd=0; mInd<nMarkers; ++mInd) {
                var thisDivParse = myLayer._markers[mInd]._htmlTextArray.split("=");
                var oldTitle = thisDivParse[2].replace('onclick','');
                var oldTitleStationID = oldTitle.split('\n')[1];
                //console.log(closest_timeindex, mInd);

                //console.log(thisDivParse);
                isMissing = false; // if original data is missing
                for (gInd=0; gInd<thisDivParse.length; gInd++) {
                    //console.log(glyphParse[gInd], glyphParse[gInd].indexOf("inverted"));
                    if (thisDivParse[gInd].indexOf("missing") != -1) {
                        isMissing = true;
                    }
                }
                
                var newTitle;
                if (myDataObject.name.indexOf("purpleair") == -1) {
                    // for non purpleair data
                    newTitle = myTooltipArray[closest_timeindex][mInd];
                } else {                    
                    // for purpleair data
                    var matchLoc = stationIDs.indexOf(oldTitleStationID);
                    if (matchLoc >= 0) {
                        newTitle = myTooltipArray[closest_timeindex][matchLoc];
                    } else {
                        parse = oldTitle.split("\n");
                        firstline = parse[0].split(":");
                        newTitle = firstline[0] + ": NA";
                        for (i=1; i<parse.length; i++) {
                            newTitle += "\n" + parse[i];
                        }
                    }
                }

                //console.log(myLayer._markers.length);
                //if (mInd == 20) {console.log("before", isInverted, myLayer._markers[mInd]);}
                // replace tooltip
                myLayer._markers[mInd]._htmlTextArray = myLayer._markers[mInd]._htmlTextArray.replace(oldTitle, newTitle);

                //console.log(newTitle);
                newTitleParse = newTitle.split(" ");
                var parseLoc = 1; // default
                if (myDataObject.name.indexOf("purpleair") != -1) {
                    parseLoc = 2;
                } else if (myDataObject.name.indexOf("mysensor") != -1) {
                    parseLoc = 4;
                }
                                
                newData = Number(newTitleParse[parseLoc]);
                
                //console.log(newData);
                // replace glyph
                layerMin = myDataObject.min;
                layerMax = myDataObject.max;
                thisData = newData;
                display_index = Math.round((thisData-layerMin)/(layerMax-layerMin) * N_colors);
                if (display_index < 0)           { display_index = "missing"; }
                if (display_index >= N_colors-1) { display_index = N_colors-1; }
                if (isNaN(display_index))        { display_index = "missing"; }
                //console.log(mInd, thisData, display_index);
                // replace all symbols in palette
                //console.log(glyphParse[2], concSymbolSet);
                for (cInd=0; cInd<N_colors; cInd++) {
                    //oldGlyph = concSymbolSet + "_" + zeroPad(cInd,2);
                    if (isInverted) {
                        if (isMissing) {
                            oldGlyph = glyphParse[2] + "_inverted_missing";
                        } else {
                            oldGlyph = glyphParse[2] + "_inverted_" + zeroPad(cInd,2);
                        }
                    } else {
                        if (isMissing) {
                            oldGlyph = glyphParse[2] + "_missing";
                        } else {
                            oldGlyph = glyphParse[2] + "_" + zeroPad(cInd,2);
                        }
                    }
                    if (myColormap !== null) {
                        newGlyph = myColormap + "_" + zeroPad(display_index,2);
                    }else {
                        newGlyph = concSymbolSet + "_" + zeroPad(display_index,2);
                    }
                    //console.log(oldGlyph, newGlyph);
                    if (myLayer._markers[mInd]._htmlTextArray.indexOf(oldGlyph) > 0) {
                        myLayer._markers[mInd]._htmlTextArray = myLayer._markers[mInd]._htmlTextArray.replace(oldGlyph, newGlyph);
                    }
                }
                //if (mInd == 20) {console.log("after", oldGlyph, newGlyph, myLayer._markers[mInd]);}        
            }
        }
    } else {
        console.log(myDataObject.name, "layer or markers undefined");
        //console.log(myLayer._markers);
        //console.log(myDataObject.oSlider_indices);
        //console.log(myDataObject.oSlider_indices.time[lastpos]);
    }

    arrangeColorbars();
}

function pickSurfmet(lat, lon) {
    //console.log(lat);
    //console.log(lon);
    var bbox_width  = 0.011; //degrees
    var bbox_height = 0.011; //degrees
    var bracket_timerange = oUserdata.timerange;
    bracket_timerange = bracket_timerange.replace(/[T](\d{2})/, "T00"); // set initial hour to 00
    bracket_timerange = bracket_timerange.replace(/([T](\d{2}))(?!.*[T](\d{2}))/, "T23"); // set final hour to 23
    Surfmetbbox =  (lon - (bbox_width/2)).toString() + ',' +
	           (lat - (bbox_height/2)).toString() + ',' +
	           (lon + (bbox_width/2)).toString() + ',' +
	           (lat + (bbox_height/2)).toString();
    //console.log(my_bbox);
    //get_airnow_closest('surfmet.temperature',    Surfmetbbox, bracket_timerange, rsigserver);
    //get_airnow_closest('surfmet.pressure',       Surfmetbbox, bracket_timerange, rsigserver);
    //get_airnow_closest('surfmet.wind_speed',     Surfmetbbox, bracket_timerange, rsigserver);
    //get_airnow_closest('surfmet.wind_direction', Surfmetbbox, bracket_timerange, rsigserver);
    get_airnow_closest('metar.temperature',    Surfmetbbox, bracket_timerange, rsigserver, 'map');
    get_airnow_closest('metar.sealevelpress',  Surfmetbbox, bracket_timerange, rsigserver, 'map');
    get_airnow_closest('metar.windspeed',      Surfmetbbox, bracket_timerange, rsigserver, 'map');
    get_airnow_closest('metar.winddir',        Surfmetbbox, bracket_timerange, rsigserver, 'map');
    moveSurfmetHighlightMarker(lat, lon);
    
    SurfmetShowLabelFlag = true;
    //showAllLayers(AqsPM25LabelLayer);
    //showAllLayers(AqsOzoneLabelLayer);
    update_optional(lastpos);

}

function pickPurpleair(lat, lon, sensorID) {
    //console.log(lat);
    //console.log(lon);
    var bbox_width  = 0.011; //degrees
    var bbox_height = 0.011; //degrees
    var bracket_timerange = oUserdata.timerange;
    bracket_timerange = bracket_timerange.replace(/[T](\d{2})/, "T00"); // set initial hour to 00
    bracket_timerange = bracket_timerange.replace(/([T](\d{2}))(?!.*[T](\d{2}))/, "T23"); // set final hour to 23
    PurpleairPickbbox =  (lon - (bbox_width/2)).toString() + ',' +
	                 (lat - (bbox_height/2)).toString() + ',' +
	                 (lon + (bbox_width/2)).toString() + ',' +
	                 (lat + (bbox_height/2)).toString();
    //console.log(my_bbox);
    
    if ( !(sensorID === undefined) ) {
        get_purpleair_sensor('purpleair.pm25_corrected', sensorID, PurpleairPickbbox, bracket_timerange, rsigserver, 'map');
    }
    movePurpleairHighlightMarker(lat, lon);
    
    PurpleairShowLabelFlag = true;
    update_optional(lastpos);

}

function pickMySensor(lat, lon, sensorID) {

    alert('pick for mysensor not implemented');
    
    //console.log(lat);
    //console.log(lon);
    var bbox_width  = 0.011; //degrees
    var bbox_height = 0.011; //degrees
    var bracket_timerange = oUserdata.timerange;
    bracket_timerange = bracket_timerange.replace(/[T](\d{2})/, "T00"); // set initial hour to 00
    bracket_timerange = bracket_timerange.replace(/([T](\d{2}))(?!.*[T](\d{2}))/, "T23"); // set final hour to 23
    MySensorPickbbox =  (lon - (bbox_width/2)).toString() + ',' +
	                 (lat - (bbox_height/2)).toString() + ',' +
	                 (lon + (bbox_width/2)).toString() + ',' +
	                 (lat + (bbox_height/2)).toString();
    //console.log(my_bbox);
    
    if ( !(sensorID === undefined) ) {
        //get_mysensor_sensor('mysensor', sensorID, MySensorPickbbox, bracket_timerange, rsigserver, 'map');
    }
    moveMySensorHighlightMarker(lat, lon);
    
    MySensorShowLabelFlag = true;
    update_optional(lastpos);

}


  function appendAqsGoogleLatLng(dataObject) {

      var this_LatLng;
      var this_data1;
      var thisSite, thisTime;
      var n = 0;

      var n_sites = dataObject.nSites;
      var n_times = dataObject.nTimes;
      //console.log(n_sites);
      //console.log(n_times);
      var thisVarPrefix;
      var thisMarginTopOffset = "0px"; // default
      var xTextOffset = 40;
      var yTextOffset;
      var thisTimestamp;
      
      if (dataObject.name == 'airnow_pm25') {
	  //thisVarPrefix = 'PM<sub>2.5</sub>: ';
	  thisVarPrefix = 'PM2.5: ';
	  thisMarginTopOffset = "0px";
	  //thisUnit = '&nbsp;&#956;g/m<sup>3</sup>';
	  thisUnit = ' ug/m3';
	  yTextOffset = 0;
	  zOffset = -1;
      } else if (dataObject.name == 'airnow_pm10') {
	  //thisVarPrefix = 'PM<sub>2.5</sub>: ';
	  thisVarPrefix = 'PM10: ';
	  thisMarginTopOffset = "0px";
	  //thisUnit = '&nbsp;&#956;g/m<sup>3</sup>';
	  thisUnit = ' ug/m3';
	  yTextOffset = 0;
	  zOffset = -1;
      } else if (dataObject.name == 'airnow_ozone') {
	  thisVarPrefix = 'Ozone: ';
	  thisMarginTopOffset = "20px";
	  //thisUnit = '&nbsp;ppb';
	  thisUnit = ' ppb';
	  yTextOffset = 20;
	  zOffset = -2;
      } else if (dataObject.name == 'airnow_co') {
	  thisVarPrefix = 'CO: ';
	  thisMarginTopOffset = "20px";
	  //thisUnit = '&nbsp;ppb';
	  thisUnit = ' ppb';
	  yTextOffset = 20;
	  zOffset = -2;
      } else if (dataObject.name == 'airnow_no2') {
	  thisVarPrefix = 'NO2: ';
	  thisMarginTopOffset = "20px";
	  //thisUnit = '&nbsp;ppb';
	  thisUnit = ' ppb';
	  yTextOffset = 20;
	  zOffset = -2;
      } else if (dataObject.name == 'airnow_so2') {
	  thisVarPrefix = 'SO2: ';
	  thisMarginTopOffset = "20px";
	  //thisUnit = '&nbsp;ppb';
	  thisUnit = ' ppb';
	  yTextOffset = 20;
	  zOffset = -2;
      }



      if (appendFlagAqsPm25 == false) {
	  clear_2darray(AqsPM25FastMarker);
	  clear_2darray(AqsPM25Layer);
	  //AqsPM25FastMarker = new Array(n_times);
	  //AqsPM25Layer      = new Array(n_times);
          //AqsPM25LabelFastMarker = new Array(n_times);
	  //AqsPM25LabelLayer      = new Array(n_times);
	  AqsPM25Tooltip      = new Array(n_times);

      }

      if (appendFlagAqsPm10 == false) {
	  clear_2darray(AqsPM10FastMarker);
	  clear_2darray(AqsPM10Layer);
	  AqsPM10Tooltip      = new Array(n_times);
      } 

      if (appendFlagAqsOzone == false) {
	  clear_2darray(AqsOzoneFastMarker);
	  clear_2darray(AqsOzoneLayer);
	  //AqsOzoneFastMarker = new Array(n_times);
	  //AqsOzoneLayer      = new Array(n_times);
          //AqsOzoneLabelFastMarker = new Array(n_times);
	  //AqsOzoneLabelLayer      = new Array(n_times);
	  AqsOzoneTooltip      = new Array(n_times);
      } 

      if (appendFlagAqsCO == false) {
	  clear_2darray(AqsCOFastMarker);
	  clear_2darray(AqsCOLayer);
	  //AqsCOFastMarker = new Array(n_times);
	  //AqsCOLayer      = new Array(n_times);
          //AqsCOLabelFastMarker = new Array(n_times);
	  //AqsCOLabelLayer      = new Array(n_times);
	  AqsCOTooltip      = new Array(n_times);
      } 

      if (appendFlagAqsNO2 == false) {
	  clear_2darray(AqsNO2FastMarker);
	  clear_2darray(AqsNO2Layer);
	  //AqsNO2FastMarker = new Array(n_times);
	  //AqsNO2Layer      = new Array(n_times);
          //AqsNO2LabelFastMarker = new Array(n_times);
	  //AqsNO2LabelLayer      = new Array(n_times);
	  AqsNO2Tooltip      = new Array(n_times);
      } 
      
      if (appendFlagAqsSO2 == false) {
	  clear_2darray(AqsSO2FastMarker);
	  clear_2darray(AqsSO2Layer);
	  //AqsSO2FastMarker = new Array(n_times);
	  //AqsSO2Layer      = new Array(n_times);
          //AqsSO2LabelFastMarker = new Array(n_times);
	  //AqsSO2LabelLayer      = new Array(n_times);
	  AqsSO2Tooltip      = new Array(n_times);
      } 
      
      if (1) {

          if (appendFlagAqsPm25 == false) {
              AqsPM25FastMarker      = new Array();
              AqsPM25Layer           = new Array();
              AqsPM25LabelFastMarker = new Array();
              AqsPM25LabelLayer      = new Array();
          }
          if (appendFlagAqsPm10 == false) {
              AqsPM10FastMarker      = new Array();
              AqsPM10Layer           = new Array();
              AqsPM10LabelFastMarker = new Array();
              AqsPM10LabelLayer      = new Array();
          }
          if (appendFlagAqsOzone == false) {
              AqsOzoneFastMarker      = new Array();
              AqsOzoneLayer           = new Array();
              AqsOzoneLabelFastMarker = new Array();
              AqsOzoneLabelLayer      = new Array();
          }
          if (appendFlagAqsCO == false) {
              AqsCOFastMarker      = new Array();
              AqsCOLayer           = new Array();
              AqsCOLabelFastMarker = new Array();
              AqsCOLabelLayer      = new Array();
          }
          if (appendFlagAqsNO2 == false) {
              AqsNO2FastMarker      = new Array();
              AqsNO2Layer           = new Array();
              AqsNO2LabelFastMarker = new Array();
              AqsNO2LabelLayer      = new Array();
          }
          if (appendFlagAqsSO2 == false) {
              AqsSO2FastMarker      = new Array();
              AqsSO2Layer           = new Array();
              AqsSO2LabelFastMarker = new Array();
              AqsSO2LabelLayer      = new Array();
          }

          var display_index;
          for (thisTime = 0; thisTime<n_times; thisTime++) {

	      //console.log(dataObject.timestamp);
              
              if (appendFlagAqsPm25 == false) {
                  AqsPM25Tooltip[thisTime]     = new Array();
              }
              if (appendFlagAqsPm10 == false) {
                  AqsPM10Tooltip[thisTime]     = new Array();
              }
	      if (appendFlagAqsOzone == false) {
                  AqsOzoneTooltip[thisTime]    = new Array();
              }
	      if (appendFlagAqsCO == false) {
                  AqsCOTooltip[thisTime]       = new Array();
              }
	      if (appendFlagAqsNO2 == false) {
                  AqsNO2Tooltip[thisTime]      = new Array();
              }
	      if (appendFlagAqsSO2 == false) {
                  AqsSO2Tooltip[thisTime]      = new Array();
              }
              
	      for (thisSite = 0; thisSite<n_sites; thisSite++) {
                  //console.log(thisTime, thisSite);

                  if ( n < dataObject.timestamp.length) {
                  
		      this_LatLng = new google.maps.LatLng(dataObject.lat[n], dataObject.lon[n]);
		      thisLat    = dataObject.lat[n];
		      thisLon    = dataObject.lon[n];
                      thisID     = dataObject.id[n];
                      thisHandle = dataObject.handle;
                      
		      thisTimestamp = dataObject.timestamp[n];
                      console.log(n, dataObject.timestamp[n]);
                      nextTimestamp = convertUTC_to_timezone(create_dateObjectUTC(dataObject.timestamp[n]), 'GMT', "ISO8601-roundToMinute", "null", -1);
                      
		      this_data1 = dataObject.variable[n];
                      display_index = 0;
		      display_index = Math.round((this_data1-dataObject.min)/(dataObject.max-dataObject.min) * N_colors);
                      if (display_index < 0)         { display_index = "missing"; }
                      if (display_index >= N_colors) { display_index = N_colors -1; }
                      if (isNaN(display_index))      { display_index = "missing"; }
                      
		      if (dataObject.name == 'airnow_ozone') {
		          //thisConcSymbol = "ozone_flag";
                          thisConcSymbol = "ozone_balloon_" + concSymbolSet + "_" + zeroPad(display_index,2);
		          //xoffset = -42;
		          //yoffset = -40;
		          xoffset = 0;
		          yoffset = -28;
		      } else if (dataObject.name == 'airnow_pm25') {
		          //thisConcSymbol = "pm25_flag";
		          thisConcSymbol = "pm25_balloon_" + concSymbolSet + "_" + zeroPad(display_index,2);
                          //xoffset = 2;
		          //yoffset = -40;
		          xoffset = -28;
		          yoffset = -28;
                      } else if (dataObject.name == 'airnow_pm10') {
		          //thisConcSymbol = "pm25_flag";
		          thisConcSymbol = "pm10_balloon_" + concSymbolSet + "_" + zeroPad(display_index,2);
                          //xoffset = 2;
		          //yoffset = -40;
		          xoffset = -14;
		          yoffset = -56;
		      } else if (dataObject.name == 'airnow_co') {
		          //thisConcSymbol = "co_flag";
		          thisConcSymbol = "co_balloon_" + concSymbolSet + "_" + zeroPad(display_index,2);
                          //xoffset = 2;
		          //yoffset = -40;
		          xoffset = 28;
		          yoffset = -28;
		      } else if (dataObject.name == 'airnow_no2') {
		          //thisConcSymbol = "no2_flag";
		          thisConcSymbol = "no2_balloon_" + concSymbolSet + "_" + zeroPad(display_index,2);
                          //xoffset = 2;
		          //yoffset = -40;
		          xoffset = -14;
		          yoffset = 0;
		      } else if (dataObject.name == 'airnow_so2') {
		          //thisConcSymbol = "so2_flag";
		          thisConcSymbol = "so2_balloon_" + concSymbolSet + "_" + zeroPad(display_index,2);
                          //xoffset = 2;
		          //yoffset = -40;
		          xoffset = 14;
		          yoffset = 0;
		      } else {
		          thisConcSymbol = "aqs_symbol_muted";
		          xoffset = -20;
		          yoffset = -40;
		      }
		      //xoffset = -20;
		      //yoffset = -40;
		      //thisZindex = zeroPad(display_index,2); 
		      thisZindex = 100; 
                      
		      //thisSymbolString = ["<div class='"+thisConcSymbol+ "'", onmouseover_string, onmouseout_string+ ">&nbsp;</div>"];
		      //thisSymbolString = "<div class=\"" + thisConcSymbol + "\" " + onmouseover_string + " style=\"margin-top:-10px\"></div>";
		      //thisSymbolString = "<div class=\"" + thisConcSymbol  + "\" " + " style=height:100%;margin-top:0px" + ";\"><div style=height:100px;position:relative;bottom:" + thisMarginTopOffset + "\">" + thisVarPrefix + this_data1.toString() + "</div></div>";
                      
		      thisTitle        = "'" + thisVarPrefix + this_data1.toFixed(1).toString() + thisUnit + "\nStation ID: " + dataObject.id[n] + "\nAveraging interval:\n  " + thisTimestamp + " GMT to\n  " + nextTimestamp + " GMT\n" +    "'";
                      
		      thisSymbolString = "<div class=\"" + thisConcSymbol  + "\" " + " title=" + thisTitle + " onclick=\"pickAQS(" + thisLat + "," + thisLon + ",\'" + thisID + "\', \'" + thisHandle + "\')\" style=\"margin-top:0px;\"></div>";
		      
		      var thisDataInfoString;
		      if (this_data1 != missing_value && this_data1 != fill_value) {
		          thisDataInfoString = thisVarPrefix + this_data1.toFixed(1).toString() + thisUnit;
		      } else {
		          // missing data
		          thisDataInfoString = thisVarPrefix + " N/A";
		      }
                      
		      //thisTextString   = "<div onclick=\"toggleAQSLabelsOff()\" style=\"padding-top:2px;background-color:#FFFFFF;box-shadow:2px 2px 5px #888888;height:20px;width:110px;\">&nbsp;&nbsp;" + thisDataInfoString + "</div>";
                      
                      
		      //console.log(thisSymbolString);
		      //console.log(thisTextString);
                      
		      myMarker = new FastMarkerMJF(0, this_LatLng, thisSymbolString, null, thisZindex, xoffset, yoffset);
		      //myText   = new FastMarkerMJF('AqsText', this_LatLng, thisTextString,   null, thisZindex+zOffset, xoffset+xTextOffset, yoffset-yTextOffset);
                      
		      if (dataObject.name == 'airnow_pm25') {
                          if (thisTime == 0) {
                              AqsPM25FastMarker.push(myMarker);
                          }
                          AqsPM25Tooltip[thisTime].push(thisTitle);
		      }
                      
                      if (dataObject.name == 'airnow_pm10') {
                          if (thisTime == 0) {
                              AqsPM10FastMarker.push(myMarker);
                          }
                          AqsPM10Tooltip[thisTime].push(thisTitle);
		      }
                      
		      if (dataObject.name == 'airnow_ozone') {
                          if (thisTime == 0) {
                              AqsOzoneFastMarker.push(myMarker);
                          }
                          AqsOzoneTooltip[thisTime].push(thisTitle);
		      }
                      
		      if (dataObject.name == 'airnow_co') {
                          if (thisTime == 0) {
                              AqsCOFastMarker.push(myMarker);
                          }
                          AqsCOTooltip[thisTime].push(thisTitle);
		      }
                      
		      if (dataObject.name == 'airnow_no2') {
                          if (thisTime == 0) {
                              AqsNO2FastMarker.push(myMarker);
                          }
                          AqsNO2Tooltip[thisTime].push(thisTitle);
		      }
                      
		      if (dataObject.name == 'airnow_so2') {
                          if (thisTime == 0) {
                              AqsSO2FastMarker.push(myMarker);
                          }
                          AqsSO2Tooltip[thisTime].push(thisTitle);
		      }
                      
		      n = n + 1; 
	          }
	      }
	      //AqsPM25FastMarker[thisTime].setMap(null);
	      //AqsOzoneFastMarker[thisTime].setMap(null);
              
	  }
      }

      
      if (dataObject.name == 'airnow_pm25') {
          // markers will be added to the map later
          AqsPM25Layer = new FastMarkerOverlayMJF(null, AqsPM25FastMarker);
          AqsPM25Layer.hide();          
      }
      if (dataObject.name == 'airnow_pm10') {
          // markers will be added to the map later
          AqsPM10Layer = new FastMarkerOverlayMJF(null, AqsPM10FastMarker);
          AqsPM10Layer.hide();          
      }
      if (dataObject.name == 'airnow_ozone') {
          // markers will be added to the map later
          AqsOzoneLayer = new FastMarkerOverlayMJF(null, AqsOzoneFastMarker);
          AqsOzoneLayer.hide();          
      }
      if (dataObject.name == 'airnow_co') {
          // markers will be added to the map later
          AqsCOLayer = new FastMarkerOverlayMJF(null, AqsCOFastMarker);
          AqsCOLayer.hide();          
      }
      if (dataObject.name == 'airnow_no2') {
          // markers will be added to the map later
          AqsNO2Layer = new FastMarkerOverlayMJF(null, AqsNO2FastMarker);
          AqsNO2Layer.hide();          
      }
      if (dataObject.name == 'airnow_so2') {
          // markers will be added to the map later
          AqsSO2Layer = new FastMarkerOverlayMJF(null, AqsSO2FastMarker);
          AqsSO2Layer.hide();          
      }

      //console.log(thisSymbolString);
      if (dataObject.name.indexOf('airnow_pm25') != -1) {
	  appendFlagAqsPm25 = true;
      }

      if (dataObject.name.indexOf('airnow_pm10') != -1) {
	  appendFlagAqsPm10 = true;
      }

      if (dataObject.name.indexOf('airnow_ozone') != -1) {
	  appendFlagAqsOzone = true;
      }

      if (dataObject.name.indexOf('airnow_co') != -1) {
	  appendFlagAqsCO = true;
      }

      if (dataObject.name.indexOf('airnow_no2') != -1) {
	  appendFlagAqsNO2 = true;
      }

      if (dataObject.name.indexOf('airnow_so2') != -1) {
	  appendFlagAqsSO2 = true;
      }

      setTimeout("update_optional(lastpos);", 0);    
      setTimeout("updateAqsTooltips();",0);

  }


  function airnow_compute_msec(oAirnow) {
      var n = 0;
      var n_sites  = oAirnow.nSites;
      var n_times  = oAirnow.nTimes;
      
      airnow_msec = new Array();

      var nSamples = oAirnow.timestamp.length;

      for (thisTime = 0; thisTime<n_times; thisTime++) {
	  for (thisSite = 0; thisSite<n_sites; thisSite++) {
              if (n < nSamples) {
                  airnow_dateObjectUTC = create_dateObjectUTC(oAirnow.timestamp[n]);
                  airnow_msec[n] = airnow_dateObjectUTC.getTime();
                  n = n + 1;
              }
	  }
      }

      return airnow_msec;
  }

  function purpleair_compute_msec(oPurpleair) {

      var nTimes         = oPurpleair.nTimes;
      var nSamples       = oPurpleair.timestamp.length;
      var purpleair_msec = new Array(nTimes);

      var n = 0;
      for (thisTime = 0; thisTime<nTimes; thisTime++) {
          var nSites = oPurpleair.nSites[thisTime];
	  for (thisSite = 0; thisSite<nSites; thisSite++) {
              if (n < nSamples) {
                  purpleair_dateObjectUTC = create_dateObjectUTC(oPurpleair.timestamp[n]);
                  purpleair_msec[n] = purpleair_dateObjectUTC.getTime();
                  n = n + 1;
              }
	  }
      }
      return purpleair_msec;
  }

  function mysensor_compute_msec(sensorObj) {

      var nTimes         = sensorObj.nTimes;
      var nSamples       = sensorObj.timestamp.length;
      var mysensor_msec  = new Array(nTimes);

      var n = 0;
      for (thisTime = 0; thisTime<nTimes; thisTime++) {
          //var nSites = oMySensor.nSites[thisTime];
	  //for (thisSite = 0; thisSite<nSites; thisSite++) {
          //    if (n < nSamples) {
          //        mysensor_dateObjectUTC = create_dateObjectUTC(oMySensor.timestamp[n]);
          //        mysensor_msec[n] = mysensor_dateObjectUTC.getTime();
          //        n = n + 1;
          //    }
	  //}

          mysensor_dateObjectUTC = create_dateObjectUTC(sensorObj.timestamp[thisTime]);
          mysensor_msec[thisTime] = mysensor_dateObjectUTC.getTime();
      }
      return mysensor_msec;
  }


  function hms_compute_msec(oHMS) {
      var n = 0;
      var n_times  = oHMS.nTimes;
      
      hms_msec = new Array();
      
      var nSamples = oHMS.timestamp.length;
      
      for (thisSample = 0; thisSample<nSamples; thisSample++) {
          hms_dateObjectUTC = create_dateObjectUTC(oHMS.timestamp[thisSample]);
          hms_msec[n] = hms_dateObjectUTC.getTime();
          n = n + 1;
      }

      return hms_msec;
  }

  function hms_compute_daysUnique(oHMS) {

      var n = 0;
      var nTimes = oHMS.nTimes;

      hms_YYYYMMDD = new Array();
      
      for (thisTime = 0; thisTime<nTimes; thisTime++) {
          this_msec = oHMS.msecUnique[thisTime];
          thisDateObjUTC = new Date();
          thisDateObjUTC.setTime(this_msec);
          thisYYYYMMDD = thisDateObjUTC.getUTCFullYear() + zeroPad(thisDateObjUTC.getUTCMonth()+1,2) + zeroPad(thisDateObjUTC.getUTCDate(),2);
 
          if (thisTime == 0 || (thisYYYYMMDD !== previousYYYYMMDD) ) {
              hms_YYYYMMDD[n] = thisYYYYMMDD;
              previousYYYYMMDD = thisYYYYMMDD;
              n = n + 1;
          }
      }

      return hms_YYYYMMDD;
  }



  function airnow_sliderpos_lookup(oAirnow) {
    // for each possible position of the time slider, compute a corresponding index to the airnow array,
    // so that we can show the nearest airnow points in time. Store the results in an array so that
    // they can be accessed on the fly as the slider is moved.

    //console.log("in airnow_sliderpos_lookup()");

    if (!oAirnow.msec) {
	//console.log("msec not defined for airnow object:");
	//console.log(oAirnow);
	return;
    }

    var n;
    closest_n    = 0;
    closest_time = 0;
    var n_sites  = oAirnow.nSites;
    var n_times  = oAirnow.nTimes;

    // compute zulu times for the user data that is accessed by the slider
    var slider_zulutime;
    var oAirnow_nearest_index = new Object();
    oAirnow_nearest_index.n    = new Array();
    oAirnow_nearest_index.time = new Array();;
    var slider_dateObjectUTC;

    for (slider_ind=0; slider_ind<oUserdata.lat[selected_block].length; slider_ind++) {
      slider_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][slider_ind])
      slider_msec = slider_dateObjectUTC.getTime();

      // find nearest index into airnow data
      delta_msec = 1000000000;
      n = 0;
      for (thisTime = 0; thisTime<n_times; thisTime++) {
	  for (thisSite = 0; thisSite<n_sites; thisSite++) {
	      //airnow_dateObjectUTC = create_dateObjectUTC(oAirnow.timestamp[n]);
	      //airnow_msec = airnow_dateObjectUTC.getTime();
	      airnow_msec = oAirnow.msec[n];
	      this_delta_msec = slider_msec - airnow_msec;
	      
	      if ( (this_delta_msec < delta_msec) && (this_delta_msec > 0) ) {
		  delta_msec = this_delta_msec;
		  closest_n = n;
		  closest_time = thisTime;
	      }
	      
	      n = n + 1;
	  }
      }
        
      oAirnow_nearest_index.n[slider_ind]    = closest_n;
      oAirnow_nearest_index.time[slider_ind] = closest_time;
      //oAirnow_nearest_index.n.push(closest_n);
      //oAirnow_nearest_index.time.push(closest_time);
    }

    //console.log("done");
    
    return oAirnow_nearest_index;

  }


function purpleair_sliderpos_lookup(oPurpleair) {
    // for each possible position of the time slider, compute a corresponding index to the purpleair array,
    // so that we can show the nearest purpleair points in time. Store the results in an array so that
    // they can be accessed on the fly as the slider is moved.
    
    //console.log("in purpleair_sliderpos_lookup()");
    
    if (!oPurpleair.msec) {
	//console.log("msec not defined for purpleair object:");
	//console.log(oPurpleair);
	return;
    }
    
    var n;
    closest_n    = 0;
    closest_time = 0;
    var n_times  = oPurpleair.nTimes;
    
    // compute zulu times for the user data that is accessed by the slider
    var slider_zulutime;
    var oPurpleair_nearest_index = new Object();
    oPurpleair_nearest_index.n    = new Array();
    oPurpleair_nearest_index.time = new Array();;
    var slider_dateObjectUTC;
    
    for (slider_ind=0; slider_ind<oUserdata.lat[selected_block].length; slider_ind++) {
        slider_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][slider_ind])
        slider_msec = slider_dateObjectUTC.getTime();
        
        // find nearest index into purpleair data
        delta_msec = 1000000000;
        n = 0;
        for (thisTime = 0; thisTime<n_times; thisTime++) {
            n_sites = oPurpleair.nSites[thisTime];
	    for (thisSite = 0; thisSite<n_sites; thisSite++) {
	        //purpleair_dateObjectUTC = create_dateObjectUTC(oPurpleair.timestamp[n]);
	        //purpleair_msec = purpleair_dateObjectUTC.getTime();
	        purpleair_msec = oPurpleair.msec[n];
	        this_delta_msec = slider_msec - purpleair_msec;
	        
	        if ( (this_delta_msec < delta_msec) && (this_delta_msec > 0) ) {
		    delta_msec = this_delta_msec;
		    closest_n = n;
		    closest_time = thisTime;
	        }
	        
	        n = n + 1;
	    }
        }

        if (delta_msec > 3600000) {
            console.log("closest time out of range: closest_time");
        }
        
        oPurpleair_nearest_index.n[slider_ind]    = closest_n;
        oPurpleair_nearest_index.time[slider_ind] = closest_time;
        //oPurpleair_nearest_index.n.push(closest_n);
        //oPurpleair_nearest_index.time.push(closest_time);
    }
    
    //console.log("done");
    
    return oPurpleair_nearest_index;
    
}


function mysensor_sliderpos_lookup(sensorObj) {
    // for each possible position of the time slider, compute a corresponding index to the mysensor array,
    // so that we can show the nearest mysensor points in time. Store the results in an array so that
    // they can be accessed on the fly as the slider is moved.
    
    //console.log("in mysensor_sliderpos_lookup()");

    //console.log(sensorObj);
    
    if (!sensorObj.msec || sensorObj.msec.length == 0) {
	//console.log("msec not defined for mysensor object:");
	//console.log(oMySensor);
	return;
    }
    
    var n;
    closest_n    = 0;
    closest_time = 0;
    var n_times  = sensorObj.nTimes;
    
    // compute zulu times for the user data that is accessed by the slider
    var slider_zulutime;
    var sensorObj_nearest_index = new Object();
    sensorObj_nearest_index.n    = new Array();
    sensorObj_nearest_index.time = new Array();;
    var slider_dateObjectUTC;

    nSliderPositions = oUserdata.lat[selected_block].length;
    for (slider_ind=0; slider_ind<nSliderPositions; slider_ind++) {
        slider_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][slider_ind])
        slider_msec = slider_dateObjectUTC.getTime();
        
        // find nearest index into mysensor data
        //delta_msec = 1000000000;
        delta_msec = 365 * 24 * 3600 * 1000;
        
        for (thisTime = 0; thisTime<n_times; thisTime++) {
            mysensor_msec   = sensorObj.msec[thisTime];
            this_delta_msec = slider_msec - mysensor_msec;
            if ( (this_delta_msec < delta_msec) && (this_delta_msec > 0) ) {
		delta_msec = this_delta_msec;
		closest_time = thisTime;
            }
        }
        //console.log(slider_ind, delta_msec, closest_time);
        
        if (delta_msec > 3600000) {
            console.log("closest time out of range:", closest_time, delta_msec);
        }
        
        sensorObj_nearest_index.n[slider_ind]    = 0;
        sensorObj_nearest_index.time[slider_ind] = closest_time;
        
    }
    
    //console.log("done");
    
    return sensorObj_nearest_index;
    
}



function hmsFireFastmarker_sliderpos_lookup(oHMS) {
    // for each possible position of the time slider, compute a corresponding index to the HMSFireFastmaker array (aka day index),
    // so that we can show the appropriate HMS paints. Store the results in an array so that
    // they can be accessed on the fly as the slider is moved.
    // THIS IS FUNDAMENTALLY DIFFERENT FROM airnow_sliderpos_lookup. 
    
    //console.log("in hms_sliderpos_lookup()");
    
    var n;
    var nDays  = oHMS.nDays;
    //console.log("nDays", nDays);


    var msecPerHour = 60 * 60 * 1000;
    
    // compute zulu times for the user data that is accessed by the slider
    var oHMS_nearest_index = new Object();
    var slider_zulutime;
    oHMS_nearest_index.time = new Array();
    var slider_dateObjectUTC;
    if (!(oHMS === undefined) && nDays > 0) {
        
        

        for (slider_ind=0; slider_ind<oUserdata.lat[selected_block].length; slider_ind++) {
            slider_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][slider_ind]);
            slider_msec = slider_dateObjectUTC.getTime();

            // get beginning and ending times in msec
            //begDate = slider_dateObjectUTC;
            // begDate.setHours(0);
            // begDate.setMinutes(0);
            // begDate.setMilliseconds(0);
            // begMsec = begDate.getTime();
            // endDate = slider_dateObjectUTC;
            // endDate.setHours(23);
            // endDate.setMinutes(59);
            // endDate.setMilliseconds(59999);
            // endMsec = endDate.getTime();
            //console.log(begMsec, endMsec);
            sliderDate = slider_dateObjectUTC;
            sliderYYYYMMDD = sliderDate.getUTCFullYear() + zeroPad(sliderDate.getUTCMonth()+1,2) + zeroPad(sliderDate.getUTCDate(),2);

            //if (slider_ind==0) console.log(sliderYYYYMMDD);

            // find corresponding index into hmsFireFastMarker data
            closest_time_index = -1; // default
            
            //for (thisTimeIndex = 0; thisTimeIndex<n_times; thisTimeIndex++) {
            for (thisDayIndex = 0; thisDayIndex<nDays; thisDayIndex++) {
                //hms_msec = oHMS.msecUnique[thisTimeIndex];
                hms_day  = oHMS.daysUnique[thisDayIndex];

                //console.log(slider_msec, hms_msec, msecPerHour);
                //if ( (hms_msec > begMsec) && (hms_msec < endMsec) ) {
                if ( hms_day === sliderYYYYMMDD ) {
                    closest_time_index = thisDayIndex;
                } 
            }
            
            oHMS_nearest_index.time[slider_ind] = closest_time_index;
            
        }
        
        //console.log("done");
    }
    
    return oHMS_nearest_index;
    
}



  function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6378.137; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2)               +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI/180); 
  }


    // END CONVERIONS FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////////

    

  // Toolbox functions ///////////////////////////////////////////////////////////////////////////

  function select(buttonId) {
    // unselect everything
    document.getElementById("home_b").className="unselected";
    document.getElementById("hand_b").className="unselected";
    document.getElementById("line_b").className="unselected";
    document.getElementById("marker_b").className="unselected";
    document.getElementById("crop_b").className="unselected";

    // select the desired button
    document.getElementById(buttonId).className="selected";
  }

  function handKeypress(event) {
    // keycode 37: left arrow
    // keycode 38: up arrow
    // keycode 39: right arrow
    // keycode 40: down arrow
    // keycode 107 OR charcode 43: numpad + 
    // keycode 109 OR charcode 45: numpad -

    pan = 30;
    if (event.keyCode == 37) {
      map.panBy(pan, 0);
    } else

    if (event.keyCode == 38) {
      map.panBy(0, pan);
      event.preventDefault(); // prevent arrow from scrolling main window
    } else

    if (event.keyCode == 39) {
      map.panBy(-pan, 0);
    } else

    if (event.keyCode == 40) {
      map.panBy(0, -pan);
      event.preventDefault(); // prevent arrow from scrolling main window
    } else

    if (event.keyCode == 107 || event.charCode == 43) {
      map.setZoom(map.getZoom()+1)
    } else

    if (event.keyCode == 109 || event.charCode == 45) {
      map.setZoom(map.getZoom()-1)
    }
  }

  function activateTimeSliderHandle() {
    // only activate handle if we are still on the same tab after the delay
    if (document.activeElement.tabIndex == document.getElementById('time_slider').tabIndex){
      $('#time_slider .ui-slider-handle').focus();
    }
  }

  function activateTimeSlider(event) {    
    // tab sometimes gets stuck in Firefox. Activate after a delay
    setTimeout("activateTimeSliderHandle();", 500);
  }

  function activateMapSliderHandle() {
    // only activate handle if we are still on the same tab after the delay
    if (document.activeElement.tabIndex == document.getElementById('map_size').tabIndex){
      $('#map_size .ui-slider-handle').focus();
    }
  }

  function activateMapSlider(event) {    
    setTimeout("activateMapSliderHandle();", 500);
  }


function activateTSPlotsizeSliderHandle() {
    // only activate handle if we are still on the same tab after the delay
    if (document.activeElement.tabIndex == document.getElementById('timeseries_size').tabIndex){
      $('#timeseries_size .ui-slider-handle').focus();
    }
  }

  function activateTSPlotsizeSlider(event) {    
    setTimeout("activateTSPlotsizeSliderHandle();", 500);
  }


  function setHomeKeypress(event) {
    // 13 = enter key
    if (event.keyCode == 13) { 
      setHome();
    }
  }

  function setHome() {
    // make sure line editing is stopped
    //stopEditingLine();
    finalizeAnalysisLine();
    finalizeRegion();

    select("home_b");
    map.setCenter(myLatLngCenter);
    map.fitBounds(myLatLngBounds);
    setTimeout("select('hand_b')", 500);
    //select('hand_b');
  }

  function cropData(flag_reset) {
    // set the visibility flag for oUserdata

    var cropind;
    var crop_bounds = cropRegion.getBounds();     
    var n_variables = oUserdata.variable[selected_block].length;

    if (crop_bounds) {
      for (thisvar=0; thisvar<n_variables; thisvar++) {
        for (cropind=0; cropind<oUserdata.lat[selected_block].length; cropind++) {
          if (allLatLng[cropind]) {
            if (crop_bounds.contains(allLatLng[cropind]) || (flag_reset == true) ) {
              oUserdata.show1[selected_block][thisvar][cropind] = true;
            } else {
              oUserdata.show1[selected_block][thisvar][cropind] = false;
            }
          }
        }
      }
    }
  }



  function delete_analysisMarker() {
      debug("delete analysisMarker");

      stopEditingMarker();
      analysisMarker.setMap(null);
      clear_analysisMarker();
      //update_analysisPlot();
  }

  function delete_analysisLine() {
      debug("delete analysisLine");
      stopEditingLine();
      if (line_started == false) {
	  analysisLine.setMap(null);
	  clear_analysisLine();
      } else {
	  // do nothing
      }
  }

  function delete_cropRegion() {
      debug("delete cropRegion");
    cropRegion.setMap(null);
    cropRegion.bounds = myLatLngBounds;		

    markerind = markerLayer.length;
    markerLayerSetMapFlag = false;
    while (markerind--) {
      markerLayer[markerind].setMap(null);
    }
    cropData(true);
    setTimeout("computeGoogleLatLng(oUserdata, false);", 50);
    update_timeseriesPlot();
    update_analysisPlot();
    update_windrosePlot();
    update_scatterPlot();
  }


function grabMode() {
    stopEditingLine();
    finalizeRegion();
}


function changeTimeSlider(delta) {
    // delta =  1 will increment
    // delta = -1 will decrement
    
    // Get current slider value
    var value = $('#time_slider').slider( "option", "value" );

    // compute new value for slider
    newValue = value + delta;
    // wrap if needed
    if (newValue > $('#time_slider').slider("option", "max")) {
        newValue = 0;
    }
    if (newValue < $('#time_slider').slider("option", "min")) {
        newValue = $('#time_slider').slider("option", "max");
    }

    // Set new slider value
    $('#time_slider').slider( "option", "value", newValue );
    updatePurpleairTooltips();
    updateMySensorTooltips();
    updateAqsTooltips();
}


function playPauseClicked() {
    // toggle state of play flag
    isPlaying = !isPlaying;

    if (isPlaying) {
        // icon should be set to pause
        document.getElementById("playPauseButtonImage").src = "images/pause.png";
        playTimer = setInterval(function(){ changeTimeSlider(1); }, 200);
        
    } else {
        // icon should be set to play
        document.getElementById("playPauseButtonImage").src = "images/play.png";

        // kill playTimer
        clearInterval(playTimer);
    }

}



// CROP FUNCTIONS ////////////////////////////////////////////////////
  function startCrop(event) {
      debug("start crop");
    // make sure line editing is stopped
    //stopEditingLine();
    finalizeAnalysisLine();
    stopEditingMarker();

    map.setOptions({gestureHandling:"none"});
    select("crop_b");

    //debug(crop_started);

    if (crop_started == false) {
      crop_started = true;

      // COMMENTED OUT FOR NOW - SHOULD WORK OK
      //startRegion(cropRegion, function(){});
      startRegion();

    } else {
      stopRegion();
    }
  }


function finalizeRegion() {
    debug("finalize region");
    select("hand_b");
    if (crop_started == true) {
	crop_started = false;
	mousedown_flag = false;
	map.setOptions({draggable:true});
	cropRegion.setOptions({clickable:true}); // true so we can detect rightclick to delete region
	google.maps.event.removeListener(listener_crop_mouseMove);
	google.maps.event.removeListener(listener_crop_mouseMove2);
	google.maps.event.removeListener(listener_crop_mouseUp);
	
	
	markerind = markerLayer.length;
	markerLayerSetMapFlag = false;
	while (markerind--) {
	    markerLayer[markerind].setMap(null);
	}
	
	cropData(false);
	setTimeout("computeGoogleLatLng(oUserdata, false);", 50);
	update_timeseriesPlot();
	update_analysisPlot();
	update_windrosePlot();
	update_scatterPlot();
    }
}

  function stopRegion() {
      debug("stop region");
      if (crop_started == true) {
	  crop_started = false;

	  select("hand_b");
	  if (listener_crop_mouseUp != null) {
	      google.maps.event.removeListener(listener_crop_mouseUp);
	      listener_crop_mouseUp = null;
	  }
	  if (listener_crop_mouseDown != null) { 
	      google.maps.event.removeListener(listener_crop_mouseDown);
	      listener_crop_mouseDown = null;
	  }
	  if (listener_crop_mouseMove != null) {
	      google.maps.event.removeListener(listener_crop_mouseMove);
	      listener_crop_mouseMove = null;
	  }
      }
  }

 function startRegion() {
      debug("start region");

  // define crop region
  var pos_mouseDown;
  var pos_mouseMove;				      

  // process mouse down
  listener_crop_mouseDown = google.maps.event.addListenerOnce(map, "mousedown", function(event_mousedown) {
    if (event_mousedown) {
	//debug("crop_down");
      map.setOptions({draggable:false});
      cropRegion.setOptions({clickable:false});
      mousedown_flag = true;
      google.maps.event.removeListener(listener_crop_mouseDown);
      pos_mouseDown = event_mousedown.latLng;	
    } 
  });

  // process mouse up (add listener to cropRegion instead of map, otherwise the event won't fire)
  listener_crop_mouseUp = google.maps.event.addListenerOnce(map, "mouseup", function(event_mouseup) {
    if (event_mouseup && mousedown_flag) {
	//debug("crop_up");
      map.setOptions({gestureHandling:"cooperative"});
      select("hand_b");
      mousedown_flag = false;
      map.setOptions({draggable:true});
      cropRegion.setOptions({clickable:true}); // true so we can detect rightclick to delete region
      google.maps.event.removeListener(listener_crop_mouseMove);
      google.maps.event.removeListener(listener_crop_mouseMove2);
      google.maps.event.removeListener(listener_crop_mouseUp);
      crop_started = false;


      markerind = markerLayer.length;
      markerLayerSetMapFlag = false;
      while (markerind--) {
          markerLayer[markerind].setMap(null);      }

      cropData(false);
      setTimeout("computeGoogleLatLng(oUserdata, false);", 50);
      update_timeseriesPlot();
      update_analysisPlot();
      update_windrosePlot();
      update_scatterPlot();

    }
  });

  // process mouse move
  listener_crop_mouseMove = google.maps.event.addListener(map, "mousemove", function(event_mousemove) {
	  //debug("crop_move");

    if (event_mousemove && mousedown_flag) {    
      cropRegion.setMap(map);

      pos_mouseMove = event_mousemove.latLng;
      // region needs to be defined using SW corner and NE corner so the the "contains" method will work correctly
      if (pos_mouseDown) {
	p1_lat = pos_mouseDown.lat();			      
	p1_lng = pos_mouseDown.lng();			      
	p2_lat = pos_mouseMove.lat();			      
	p2_lng = pos_mouseMove.lng();			      
	sw = new google.maps.LatLng(Math.min(p1_lat, p2_lat), Math.min(p1_lng, p2_lng));
	ne = new google.maps.LatLng(Math.max(p1_lat, p2_lat), Math.max(p1_lng, p2_lng));
	cropRegion.setBounds(new google.maps.LatLngBounds(sw, ne));
      } else {
	
      }		
    }
  });
  // also add a listener to cropRegion in case we make the region smaller
  listener_crop_mouseMove2 = google.maps.event.addListenerOnce(cropRegion, "mousemove", function(event_mousemove) {
	  //debug("crop_move2");
    if (event_mousemove && mousedown_flag) {    
      pos_mouseMove = event_mousemove.latLng;
      if (pos_mouseDown) {
	// region needs to be defined using SW corner and NE corner so the the "contains" method will work correctly
	p1_lat = pos_mouseDown.lat();			      
	p1_lng = pos_mouseDown.lng();			      
	p2_lat = pos_mouseMove.lat();			      
	p2_lng = pos_mouseMove.lng();			      
	sw = new google.maps.LatLng(Math.min(p1_lat, p2_lat), Math.min(p1_lng, p2_lng));
	ne = new google.maps.LatLng(Math.max(p1_lat, p2_lat), Math.max(p1_lng, p2_lng));
	cropRegion.setBounds(new google.maps.LatLngBounds(sw, ne));
      }	else {
	
      }	
    }
  });
  
}

// END CROP FUNCTIONS ////////////////////////////////////////////////////



// MARKER FUNCTIONS //////////////////////////////////////////////////////

  function placeMarker() {
      debug("placeMarker");
      placemarkerClicked = true;

    // make sure line editing is stopped
    //stopEditingLine();
    finalizeAnalysisLine();
    finalizeRegion();


    select("marker_b");
    listener_marker = google.maps.event.addListenerOnce(map, 'click', function(event) {
      if (event) {
	  debug("in listener_marker");
        select("hand_b");
        google.maps.event.removeListener(listener_marker);
        analysisMarker.setMap(map);
        analysisMarker.setPosition(event.latLng);
        clear_analysisMarker_flag = false;
        update_analysisPlot();
      }
    });
  }

function stopEditingMarker() {
    debug("stop editing marker");

    select("hand_b");
    if (listener_marker) {
	debug("removing listener_marker");
      google.maps.event.removeListener(listener_marker);
      //listener_marker = null;
    }

    //clear_analysisMarker_flag = false;
    map.setOptions({draggable:true});
    //update_analysisPlot();

  }

// END MARKER FUNCTIONS ////////////////////////////////////////////


// LINE FUNCTIONS //////////////////////////////////////////////////

  function startLine() {
      debug("startLine");
      finalizeRegion();

      map.setOptions({gestureHandling:"none"});      
      select("line_b");
      clear_analysisLine_flag = false;
      if (line_started == false) {
          line_started = true;
          startDrawing(analysisLine, function(){});
      } else {
          stopEditingLine();
      }
  }

  function stopEditingLine() {
      debug("stop editing line");
    line_started = false;
    mousedown_flag = false;

    map.setOptions({gestureHandling:"cooperative"});
    select("hand_b");
    if (listener_line_mouseUp != null) {
      google.maps.event.removeListener(listener_line_mouseUp);
      listener_line_mouseUp = null;
    }
    if (listener_line_mouseDown != null) { 
      google.maps.event.removeListener(listener_line_mouseDown);
      listener_line_mouseDown = null;
    }
    if (listener_line_mouseMove != null) {
      google.maps.event.removeListener(listener_line_mouseMove);
      listener_line_mouseMove = null;
    }

    map.setOptions({draggable:true});
    update_analysisPlot();

  }


  function startDrawing(analysisLine) {
      debug("start drawing line");
  // process mouse down
  listener_line_mouseDown = google.maps.event.addListenerOnce(map, "mousedown", function(event_mousedown) {
    if (event_mousedown) {
	//debug("down");
      analysisLine.setMap(map);
      map.setOptions({draggable:false});
      mousedown_flag = true;
      google.maps.event.removeListener(listener_line_mouseDown);
      pos_mouseDown = event_mousedown.latLng;			
    } 
  });

  // process mouse up (add listener to analysisLine instead of map, otherwise the event won't fire)
  listener_line_mouseUp = google.maps.event.addListenerOnce(analysisLine, "mouseup", function(event_mouseup) {
    if (event_mouseup) {
	//debug("up");
	
	//select("hand_b");
	//mousedown_flag = false;
	//map.setOptions({draggable:true});
	//google.maps.event.removeListener(listener_mouseMove);
	//google.maps.event.removeListener(listener_mouseUp);
	//line_started = false;
	finalizeAnalysisLine();

    }
  });


  // process mouse move
  listener_line_mouseMove = google.maps.event.addListener(map, "mousemove", function(event_mousemove) {
    if (event_mousemove && mousedown_flag) {    
	//debug("move");
	pos_mouseMove = event_mousemove.latLng;		
	analysisLine.setPath([pos_mouseDown, pos_mouseMove]);
    }
  });


}

function finalizeAnalysisLine() {
    debug("finalizeAnalysisLine");
    map.setOptions({gestureHandling:"cooperative"});
    select("hand_b");
    mousedown_flag = false;
    map.setOptions({draggable:true});
    if (listener_line_mouseMove) {
	google.maps.event.removeListener(listener_line_mouseMove);
    }
    if (listener_line_mouseUp) {
	google.maps.event.removeListener(listener_line_mouseUp);
    }
    line_started = false;
    update_analysisPlot();
}

// END LINE FUNCTIONS /////////////////////////////////////////////////////


  // End Toolbox Functions//////////////////////////////////////////////////////////////////////////////////////////////





  // UPDATE FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////////////
  //


  function id_select_all() {
    var checkbox_list = document.getElementsByName("id_checkboxes");
    for (var listInd=0; listInd<checkbox_list.length; listInd++){ 
      checkbox_list[listInd].checked = true;
    }
    subset_by_id_wrapper();
  }

  function id_select_none() {
    var checkbox_list = document.getElementsByName("id_checkboxes");
    for (var listInd=0; listInd<checkbox_list.length; listInd++){ 
      checkbox_list[listInd].checked = false;
    }
    subset_by_id_wrapper();
  }

  function subset_by_id_wrapper(){
    markerind = markerLayer.length;
    markerLayerSetMapFlag = false;
    while (markerind--) {
      markerLayer[markerind].setMap(null);
    }

    subset_by_id();
    setTimeout("computeGoogleLatLng(oUserdata, false);", 0);
    update_timeseriesPlot();
    update_analysisPlot();
    update_windrosePlot();
    update_scatterPlot();
      
  }

  function subset_by_id() {

    // get selected IDs to show
    var checked_ids = [];
    var checkbox_list = document.getElementsByName("id_checkboxes");
    for (var listInd=0; listInd<checkbox_list.length; listInd++){ 
      this_id_checked = checkbox_list[listInd].checked; 
      if (this_id_checked) {			  
        checked_ids.push(checkbox_list[listInd].value); 			  
      }
    }


    // set the visibility flag for oUserdata
    var dataInd;       
    var n_variables = oUserdata.variable[selected_block].length;

    for (thisvar=0; thisvar<n_variables; thisvar++) {
      for (dataInd=0; dataInd<oUserdata.lat[selected_block].length; dataInd++) {
        if ( jQuery.inArray(oUserdata.id[selected_block][dataInd], checked_ids) == -1) {
          oUserdata.show2[selected_block][thisvar][dataInd] = false;
        } else {
          oUserdata.show2[selected_block][thisvar][dataInd] = true;
        }
      }
    }
  }


  function set_initial_display() {
      //console.log("setting initial display");
    update_timeAnnot(0);
    update_map(0);
    update_displayed_data_value(0, 0);
    $('#map_size').slider('option', 'value', map_height);
    $('#timeseries_size').slider('option', 'value', timeseries_height);
    setTabIndices();
    //if (oUserdata.varname[selected_block].indexOf('wind_magnitude(m/s)') == -1 || oUserdata.varname[selected_block].indexOf('wind_direction(deg)') == -1 ) {
    //  document.getElementById('windrosePlotOptionButton').disabled = true;
    //} else {
    //  document.getElementById('windrosePlotOptionButton').disabled = false;
    //}
    

    // loop through variables and turn on the windrose option if wind vectors are present
    document.getElementById('windrosePlotOptionButton').disabled = true; // default
    for (ind=0; ind<oUserdata.varname[selected_block].length; ind++) {
        if (oUserdata.varname[selected_block][ind].indexOf('wind_vector') >= 0) {
            document.getElementById('windrosePlotOptionButton').disabled = false;
        }
    }

    // turn off fire perimeters if we don't have a matching year
    document.getElementById('addFirePerimeters').disabled = true; // default
    let thisDate = create_dateObjectUTC(oUserdata.timestamp[selected_block][0]);
    let thisYear = Number(thisDate.getUTCFullYear());
    if ( (thisYear == today_yyyy) || (thisYear >= 2014 && thisYear <= 2021) ) {
        document.getElementById('addFirePerimeters').disabled = false; // default
    }
          
    // force a window resize to ensure all content is visible
    //window.dispatchEvent(new Event('resize')); // Doesn't work in IE
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent('resize', true, false);
    window.dispatchEvent(evt);

    map.setCenter(myLatLngCenter);
    map.fitBounds(myLatLngBounds);
    
    setTimeout("process_radio('')", 5000);
    
    

  }


  function calculateCenter() {
      map_center = map.getCenter(); 
  }

  function hideAllLayers(layer_array) {
      var n;
      for (n=0; n<layer_array.length; n++) { 
	  //console.log('hiding ', n); 
          try {
              layer_array[n].hide();
          } catch (err) {
              // console.log(err);
          }
      }
  }

  function showAllLayers(layer_array) {
    var n;
    for (n=0; n<layer_array.length; n++) { 
        //console.log('showing ', n); 

      if (layer_array[n]) layer_array[n].unhide();

    }
  }
  
  function hideLayer(layer) {
    if (layer) layer.hide();
  }

  function showLayer(layer) {
    if (layer) layer.unhide();

  }




  function update_timeAnnot(pos) {
    var this_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][pos]);
    var this_datestringDesiredTimezone = convertUTC_to_timezone(this_dateObjectUTC, selected_timezone, "pretty2", "null");
    //document.getElementById("timebox").innerHTML = "Time: " + this_datestringDesiredTimezone;
    document.getElementById("timebox").innerHTML = this_datestringDesiredTimezone;

  }

  function select_display() {
    set_mapsize();
    update_analysisPlot();
    update_timeseriesPlot();
    update_windrosePlot();
    update_scatterPlot();
    //update_kml();
  }


function toggleExpandCollapse(myelement) {
    expander = document.getElementById(myelement.id + "_expander");
    //console.log(myelement.id, expander);
    if (myelement.dataset.collapsed == "true") {
        myelement.dataset.collapsed = "false";
        expander.src = "images/expanded.png"
    } else {
        myelement.dataset.collapsed = "true";
        expander.src = "images/collapsed.png"
    }
    arrangeColorbars();
}

function arrangeColorbars() {

    heightExpanded  = 45; // pixels
    heightCollapsed = 18; // pixels
    
    
    thisYpos            = 72; // pixels
    yIncrementExpanded  = 47; // pixels
    yIncrementCollapsed = 20; // pixels

    if (document.getElementById("addViirsAodMap").checked || document.getElementById("addTropomiNO2Map").checked || document.getElementById("addTempoNO2Map").checked) {
        if (satelliteOverlay != null) {
            document.getElementById("colorbar_satellite_canvas").style["bottom"] = thisYpos + "px";
            if (document.getElementById("colorbar_satellite_canvas").dataset.collapsed == "true") {
                document.getElementById("colorbar_satellite_canvas").style["height"] = heightCollapsed + "px";
                thisYpos += yIncrementCollapsed;
            } else {
                document.getElementById("colorbar_satellite_canvas").style["height"] = heightExpanded + "px";
                thisYpos += yIncrementExpanded;
            }
        }
    }

    if (document.getElementById("addPurpleairLocations").checked && oPurpleairPM25.oSlider_indices) {
        document.getElementById("colorbar_canvas_purpleair").style["bottom"] = thisYpos       + "px";
        if (document.getElementById("colorbar_canvas_purpleair").dataset.collapsed == "true") {
            document.getElementById("colorbar_canvas_purpleair").style["height"] = heightCollapsed + "px";
            thisYpos += yIncrementCollapsed;
        } else {
            document.getElementById("colorbar_canvas_purpleair").style["height"] = heightExpanded + "px";
            thisYpos += yIncrementExpanded;
        }
    }

    if (document.getElementById("addMySensorLocations0").checked && mySensorArray[0].oSlider_indices) {
        document.getElementById("colorbar_canvas_mysensor0").style["bottom"] = thisYpos       + "px";
        if (document.getElementById("colorbar_canvas_mysensor0").dataset.collapsed == "true") {
            document.getElementById("colorbar_canvas_mysensor0").style["height"] = heightCollapsed + "px";
            thisYpos += yIncrementCollapsed;
        } else {
            document.getElementById("colorbar_canvas_mysensor0").style["height"] = heightExpanded + "px";
            thisYpos += yIncrementExpanded;
        }
    }

    if (document.getElementById("addMySensorLocations1").checked && mySensorArray[1].oSlider_indices) {
        document.getElementById("colorbar_canvas_mysensor1").style["bottom"] = thisYpos       + "px";
        if (document.getElementById("colorbar_canvas_mysensor1").dataset.collapsed == "true") {
            document.getElementById("colorbar_canvas_mysensor1").style["height"] = heightCollapsed + "px";
            thisYpos += yIncrementCollapsed;
        } else {
            document.getElementById("colorbar_canvas_mysensor1").style["height"] = heightExpanded + "px";
            thisYpos += yIncrementExpanded;
        }
    }

    if (document.getElementById("addMySensorLocations2").checked && mySensorArray[2].oSlider_indices) {
        document.getElementById("colorbar_canvas_mysensor2").style["bottom"] = thisYpos       + "px";
        if (document.getElementById("colorbar_canvas_mysensor2").dataset.collapsed == "true") {
            document.getElementById("colorbar_canvas_mysensor2").style["height"] = heightCollapsed + "px";
            thisYpos += yIncrementCollapsed;
        } else {
            document.getElementById("colorbar_canvas_mysensor2").style["height"] = heightExpanded + "px";
            thisYpos += yIncrementExpanded;
        }
    }

    if (document.getElementById("addMySensorLocations3").checked && mySensorArray[3].oSlider_indices) {
        document.getElementById("colorbar_canvas_mysensor3").style["bottom"] = thisYpos       + "px";
        if (document.getElementById("colorbar_canvas_mysensor3").dataset.collapsed == "true") {
            document.getElementById("colorbar_canvas_mysensor3").style["height"] = heightCollapsed + "px";
            thisYpos += yIncrementCollapsed;
        } else {
            document.getElementById("colorbar_canvas_mysensor3").style["height"] = heightExpanded + "px";
            thisYpos += yIncrementExpanded;
        }
    }

    if (document.getElementById("addMySensorLocations4").checked && mySensorArray[4].oSlider_indices) {
        document.getElementById("colorbar_canvas_mysensor4").style["bottom"] = thisYpos       + "px";
        if (document.getElementById("colorbar_canvas_mysensor4").dataset.collapsed == "true") {
            document.getElementById("colorbar_canvas_mysensor4").style["height"] = heightCollapsed + "px";
            thisYpos += yIncrementCollapsed;
        } else {
            document.getElementById("colorbar_canvas_mysensor4").style["height"] = heightExpanded + "px";
            thisYpos += yIncrementExpanded;
        }
    }
    
    if (document.getElementById("addAqsOzoneLocations").checked && oAirnowOzone.oSlider_indices) {
        document.getElementById("colorbar_canvas_airnowO3").style["bottom"] = thisYpos       + "px";
        if (document.getElementById("colorbar_canvas_airnowO3").dataset.collapsed == "true") {
            document.getElementById("colorbar_canvas_airnowO3").style["height"] = heightCollapsed + "px";
            thisYpos += yIncrementCollapsed;
        } else {
            document.getElementById("colorbar_canvas_airnowO3").style["height"] = heightExpanded + "px";
            thisYpos += yIncrementExpanded;
        }
    }

    if (document.getElementById("addAqsPM25Locations").checked && oAirnowPM25.oSlider_indices) {
        document.getElementById("colorbar_canvas_airnowPM25").style["bottom"] = thisYpos       + "px";
        if (document.getElementById("colorbar_canvas_airnowPM25").dataset.collapsed == "true") {
            document.getElementById("colorbar_canvas_airnowPM25").style["height"] = heightCollapsed + "px";
            thisYpos += yIncrementCollapsed;
        } else {
            document.getElementById("colorbar_canvas_airnowPM25").style["height"] = heightExpanded + "px";
            thisYpos += yIncrementExpanded;
        }
    }

    if (document.getElementById("addAqsPM10Locations").checked && oAirnowPM10.oSlider_indices) {
        document.getElementById("colorbar_canvas_airnowPM10").style["bottom"] = thisYpos       + "px";
        if (document.getElementById("colorbar_canvas_airnowPM10").dataset.collapsed == "true") {
            document.getElementById("colorbar_canvas_airnowPM10").style["height"] = heightCollapsed + "px";
            thisYpos += yIncrementCollapsed;
        } else {
            document.getElementById("colorbar_canvas_airnowPM10").style["height"] = heightExpanded + "px";
            thisYpos += yIncrementExpanded;
        }
    }

    if (document.getElementById("addAqsCOLocations").checked && oAirnowCO.oSlider_indices) {
        document.getElementById("colorbar_canvas_airnowCO").style["bottom"] = thisYpos       + "px";
        if (document.getElementById("colorbar_canvas_airnowCO").dataset.collapsed == "true") {
            document.getElementById("colorbar_canvas_airnowCO").style["height"] = heightCollapsed + "px";
            thisYpos += yIncrementCollapsed;
        } else {
            document.getElementById("colorbar_canvas_airnowCO").style["height"] = heightExpanded + "px";
            thisYpos += yIncrementExpanded;
        }
    }

    if (document.getElementById("addAqsNO2Locations").checked && oAirnowNO2.oSlider_indices) {
        document.getElementById("colorbar_canvas_airnowNO2").style["bottom"] = thisYpos       + "px";
        if (document.getElementById("colorbar_canvas_airnowNO2").dataset.collapsed == "true") {
            document.getElementById("colorbar_canvas_airnowNO2").style["height"] = heightCollapsed + "px";
            thisYpos += yIncrementCollapsed;
        } else {
            document.getElementById("colorbar_canvas_airnowNO2").style["height"] = heightExpanded + "px";
            thisYpos += yIncrementExpanded;
        }
    }

    if (document.getElementById("addAqsSO2Locations").checked && oAirnowSO2.oSlider_indices) {
        document.getElementById("colorbar_canvas_airnowSO2").style["bottom"] = thisYpos       + "px";
        if (document.getElementById("colorbar_canvas_airnowSO2").dataset.collapsed == "true") {
            document.getElementById("colorbar_canvas_airnowSO2").style["height"] = heightCollapsed + "px";
            thisYpos += yIncrementCollapsed;
        } else {
            document.getElementById("colorbar_canvas_airnowSO2").style["height"] = heightExpanded + "px";
            thisYpos += yIncrementExpanded;
        }
    }
    
}



  function show_checked_canvases() {
    var nChecked = 0; // default							     

    // MAP CANVAS
    if (document.getElementById('mapOptionButton').checked) { 
      nChecked += 1; 
      $("#map_canvas").show(); 
      $("#colorbar_canvas").show(); 
    } else { 
      $("#map_canvas").hide();  
      $("#colorbar_canvas").hide(); 
      document.getElementById('map_canvas').style.width = "0px";
    }
 
    // ANALYSIS CANVAS
    if (document.getElementById('analysisPlotOptionButton').checked) { 
      nChecked += 1; 
      $("#analysis_canvas").show();  
    } else { 
      $("#analysis_canvas").hide();
      document.getElementById('analysis_canvas').style.width = "0px";
    }

    // TIMESERIES CANVAS
    if (document.getElementById('timeseriesPlotOptionButton').checked){ 
      nChecked += 1; 
      $("#timeseries_canvas").show();
      $("#timeseries_divider").show();
    } else { 
      $("#timeseries_canvas").hide(); 
      $("#timeseries_divider").hide(); 
      document.getElementById('timeseries_canvas').style.width = "0px";
      document.getElementById('timeseries_divider').style.width = "0px";
    }

    // SCATTER CANVAS
    if (document.getElementById('scatterPlotOptionButton').checked) { 
      nChecked += 1; 
      $("#scatter_canvas").show();  
    } else { 
      $("#scatter_canvas").hide();
      document.getElementById('scatter_canvas').style.width = "0px";
    }
      
    // WINDROSE CANVAS
    if (document.getElementById('windrosePlotOptionButton').checked) { 
      nChecked += 1; 
      $("#windrose_canvas").show();  
      $("#windrose_canvas_button").show();
      $("#colorbar_canvas_windrose").show();   
    } else { 
      $("#windrose_canvas").hide(); 
      $("#windrose_canvas_button").hide();  
      $("#colorbar_canvas_windrose").hide();   
      document.getElementById('windrose_canvas').style.width = "0px";
    }

    // BLANK CANVAS 
    if (nChecked == 0 || (nChecked == 1 && document.getElementById('timeseriesPlotOptionButton').checked) ) {              
      $("#blank_canvas").show();     
    } else { 
      $("#blank_canvas").hide();
      document.getElementById('blank_canvas').style.width = "0px";
    }

  }

function set_timeseriesSize() {
    //console.log("in setTimeseriesSize()");

    new_height = timeseries_height; 
    document.getElementById("timeseries_canvas").style.height = (new_height*0.25).toString() + "px";
    timeseriesPlotsize_handler(new_height);
}

function set_mapsize() {
    //console.log("in set_mapsize");
    calculateCenter();
    map.setCenter(map_center);
 
    //map_height  = Math.floor($(window).height() * map_height_percent)-200;
    //map_width   = Math.floor( ( $('#div_dataDisplay').width() - $('#var_selector').width() )) - 30;
    map_width   = Math.floor( ( $(window).width() - $('#var_selector').width() )) - 60;
    half_width  = map_width / 2;
    third_width = map_width / 2;

    half_map_width    = map_width / 2;
    third_map_width   = map_width / 3;
    quarter_map_width = map_width / 4;

    //console.log(map_width);

    // set canvas heights
    analysisCanvasOffset = 10; // vertical shortening to account for controls
    scatterCanvasOffset  = 10;  // vertical shortening to account for controls
    windroseCanvasOffset = 25;
      if (document.getElementById('timeseriesPlotOptionButton').checked) {
          if (get_mapMode() == 'timeseries_only') {
              topRowHeight    = 0.0;
              bottomRowHeight = map_height;
          } else {
              topRowHeight    = map_height*0.65;
              bottomRowHeight = map_height*0.35;
          }
    } else {
        topRowHeight    = map_height;
        bottomRowHeight = 0.0;
    }
    document.getElementById("map_canvas").style.height        = (topRowHeight).toString() + "px";
    document.getElementById("analysis_canvas").style.height   = (topRowHeight-analysisCanvasOffset).toString() + "px";
    //document.getElementById("timeseries_canvas").style.height = (bottomRowHeight*0.25).toString() + "px";
    document.getElementById("scatter_canvas").style.height    = (topRowHeight-scatterCanvasOffset).toString() + "px";
    document.getElementById("windrose_canvas").style.height   = (topRowHeight-windroseCanvasOffset).toString() + "px";
    document.getElementById("blank_canvas").style.height      = (topRowHeight).toString() + "px";

    // set canvas widths using widths calculated above (based on window size)
    var sliderWidth;
    var sliderWidthString;
    var sliderWidthOffset = document.getElementById("table_td1").offsetWidth;
    var mode = get_mapMode();
    if (mode == 'quadruple') {
        widthString = quarter_map_width.toString() + "px";
        sliderWidth=  (quarter_map_width - sliderWidthOffset).toString(); 
    } else if (mode == 'triple') {
      widthString = third_map_width.toString() + "px";
      sliderWidth =  (third_map_width - sliderWidthOffset).toString(); 
    } else if (mode == 'double') {
        widthString = half_map_width.toString() + "px";
        sliderWidth =  (half_map_width - sliderWidthOffset).toString(); 
    } else if (mode == 'timeseries_only') {
        widthString = map_width.toString() + "px";
        sliderWidth =  (map_width - sliderWidthOffset).toString(); 
    } else {
        widthString = map_width.toString() + "px";
        sliderWidth =  (map_width - sliderWidthOffset).toString(); 
    }

    sliderWidth = (map_width - sliderWidthOffset);
    sliderWidthString = sliderWidth + "px";
    //console.log(widthString, sliderWidthOffset, sliderWidthString);
    
    document.getElementById('map_canvas').style.width         = widthString;
    document.getElementById('analysis_canvas').style.width    = widthString;
      //document.getElementById('timeseries_canvas').style.width = widthString;
    document.getElementById('timeseries_canvas').style.width  =  map_width.toString() + "px"
    document.getElementById('timeseries_divider').style.width =  map_width.toString() + "px"
    document.getElementById('scatter_canvas').style.width     = widthString;
    document.getElementById('windrose_canvas').style.width    = widthString;
    document.getElementById('blank_canvas').style.width       = widthString;
    document.getElementById('error_textarea').style.width     = map_width.toString() + "px";

    //controlsSize   = document.getElementById("MyDataDiv").offsetWidth;
    //console.log("c", controlsSize);
    //document.getElementById('time_slider').style.width =  sliderWidthString;
    document.getElementById('time_slider').style.width = (map_width - sliderWidthOffset).toString() + "px";
    //document.getElementById('table_td2').style.width = sliderWidthString;+

    textSize       = document.getElementById("displayed_data_value").offsetWidth; // remember that offsetWidth includes pading
    oldTextPadding = parseFloat(document.getElementById("displayed_data_value").style.paddingLeft);
    if (isNaN(oldTextPadding)) {
        oldTextPadding = 0;
    }
    newTextPadding = Math.floor(sliderWidth/2 - (textSize-oldTextPadding)/2);
    //console.log("pad", newTextPadding, sliderWidth, textSize); 
    document.getElementById("displayed_data_value").style.paddingLeft = newTextPadding.toString() + "px"

    controlsDivSize     = document.getElementById("MyDataDiv").offsetWidth;
    buttonDivSize       = document.getElementById("animationButtons").offsetWidth;
    oldButtonDivPadding = parseFloat(document.getElementById("animationButtons").style.paddingRight);
    if (isNaN(oldButtonDivPadding)) {
        oldButtonDivPadding = 0;
    }
    newButtonDivPadding = controlsDivSize - buttonDivSize -  oldButtonDivPadding;
    document.getElementById("animationButtons").style.paddingRight = newButtonDivPadding.toString() + "px"

    show_checked_canvases();
    
    mapsize_handler(map_height);

    this_center = map.getCenter();
    google.maps.event.trigger(map, 'center_changed');
    map.setCenter(this_center);

  }

  function deselectAllTimeblocksBut(numButtom) {
      for (n=0; n<document.getElementsByName("timeblock_buttons").length; n++){
	  document.getElementById("timeblockRadio_" + zeroPad(n, 3)).checked = false;  
      }
      
      document.getElementById("timeblockRadio_" + zeroPad(numButtom, 3)).checked = true;
      
  }

  function update_map(pos) { 
//highlight_divs();

      if (document.getElementById('showGooglePin').checked) {
	  posMarker1.setVisible(true);
	  posHalo1.setVisible(true);
          posMarker2.setVisible(true);
	  posHalo2.setVisible(true);
      } else {
	  posMarker1.setVisible(false);
	  posHalo1.setVisible(false);
          posMarker2.setVisible(false);
	  posHalo2.setVisible(false);
      }

      if (document.getElementById('showMapColorbars').checked) {
          //document.getElementById('colorbar_canvii').style.display = "inline-block";
          document.getElementById('colorbar_canvii').style.visibility="visible";
      } else {
          //document.getElementById('colorbar_canvii').style.display = "none";
          document.getElementById('colorbar_canvii').style.visibility="hidden";
      }
                
      if (document.getElementById('displaychoiceAll').checked) {
	  //document.getElementById('multipleTimeblockOption').checked  = false;
	  //document.getElementById('multipleTimeblockOption').disabled = true;
	  //forceTimeblockRadio = true;
	  //deselectAllTimeblocksBut(lastCheckedTimeBlock);
      } else {
	  //document.getElementById('multipleTimeblockOption').disabled = false;
      }

    var nearest_pos;

    // set the marker positions
    if ((oUserdata.variable[selected_block][get_selected_varselector_index()][pos] != fill_value)) {
        if (oUserdata.id[selected_block][pos] == oUserdata.idList[0]) {
            posMarker1.setPosition(allLatLng[pos]);
            posHalo1.setPosition(allLatLng[pos]);
        } else if (oUserdata.id[selected_block][pos] == oUserdata.idList[1]) {
            posMarker2.setPosition(allLatLng[pos]);
            posHalo2.setPosition(allLatLng[pos]);
        }
    }

    // map the highlight marker
    // get selected IDs to show
    var checked_ids = [];
    var checkbox_list = document.getElementsByName("id_checkboxes");
    for (var listInd=0; listInd<checkbox_list.length; listInd++){ 
      this_id_checked = checkbox_list[listInd].checked; 
      if (this_id_checked) {			  
        checked_ids.push(checkbox_list[listInd].value); 			  
      }
    }

    var thisIDInd = jQuery.inArray(oUserdata.id[selected_block][pos], checked_ids);
    try {
        if (thisIDInd >= 0 && singleMarker.length > 0 ) {
            if ( (singleMarker[get_selected_varselector_index()][pos].url.indexOf("missing") != -1) ||
                 (singleMarker[get_selected_varselector_index()][pos].url.indexOf("fill")    != -1) ) {
                // we have missing data. Display the closest non-missing data to avoid "flashing" as the slider is moved.
                nearest_pos = get_nearest_singleMarker(pos);
                nearestpos = nearest_pos;
                highlightMarker.setIcon(singleMarker[get_selected_varselector_index()][nearest_pos]);
                highlightMarker.setPosition(allLatLng[nearest_pos]);
            } else {
                highlightMarker.setIcon(singleMarker[get_selected_varselector_index()][pos]);
                highlightMarker.setPosition(allLatLng[pos]);
                nearestpos = pos;

            }
        }
    } catch (err) {
        // pretend the data was missing
        console.log(err);
        console.log(singleMarker);
        try {
            nearest_pos = get_nearest_singleMarker(pos);
            nearestpos = nearest_pos;
            highlightMarker.setIcon(singleMarker[get_selected_varselector_index()][nearest_pos]);
            highlightMarker.setPosition(allLatLng[nearest_pos]);
        } catch (err2) {
            // do nothing
        }
        
    }

    // hide or unhide the marker based on dataFlagger results
    //console.log(nearestpos);
    //console.log(oUserdata.msec[selected_block][nearestpos],  isMsecFlagged(oUserdata.msec[selected_block][nearestpos]));
    if (document.getElementById("excludeFlaggerOption").checked && isMsecFlagged(oUserdata.msec[selected_block][nearestpos])) {
        highlightMarker.setVisible(false);
    } else {
        highlightMarker.setVisible(true);
    }

      
    // hide everything
    hideAllLayers(highlightMarker);
    hideAllLayers(markerLayer);
    for (RegionInd=0; RegionInd<connectingLine.length; RegionInd++) {
      connectingLine[RegionInd].setVisible(false);
    }
    //connectingLine.setVisible(false);

    // selectively turn on all markers or single marker
    //console.log(document.getElementById('displaychoiceAll').checked);
    if (document.getElementById('displaychoiceAll').checked == true) {
      //hideAllLayers(highlightMarker);
	if (markerLayerSetMapFlag == false) {
	    markerLayerSetMapFlag = true;
            try {
                markerLayer[get_selected_varselector_index()].setMap(map);
            } catch (err) {
            }
	}
	showLayer(markerLayer[get_selected_varselector_index()]);
    } else {
	//hideAllLayers(markerLayer);
	showLayer(highlightMarker[get_selected_varselector_index()]);
    }

    // selectively turn on connectingLine
    if (document.getElementById('connectingLineOptionButton').checked == true) {
      var checkbox_list = document.getElementsByName("id_checkboxes");
      for (RegionInd=0; RegionInd<connectingLine.length; RegionInd++) {
        //if (checkbox_list[IDind].checked) {
         connectingLine[RegionInd].setVisible(true);
        //}
      }
    }

    //$("#busy_gif").hide();
    //busyHide();

    // change color of crop region depending on map type
    mapid = map.getMapTypeId();
    if ( (mapid == "satellite") || (mapid == "hybrid") ) {
      cropRegion.setOptions({fillColor:"#FFFFFF", strokeColor:"#FFFFFF"});
    } else {
      cropRegion.setOptions({fillColor:"#F0F000", strokeColor:"#000000"});
    }
  } 

  function update_optional(pos) {

    // figure out which optional data is closest to the selected time

    if (! oAirnowOzone.oSlider_indices ) {
	oAirnowOzone.oSlider_indices = airnow_sliderpos_lookup(oAirnowOzone);
    }

    if (! oAirnowPM25.oSlider_indices) {
	oAirnowPM25.oSlider_indices = airnow_sliderpos_lookup(oAirnowPM25);
    }

    if (! oAirnowPM10.oSlider_indices) {
	oAirnowPM10.oSlider_indices = airnow_sliderpos_lookup(oAirnowPM10);
    }

    if (! oAirnowCO.oSlider_indices) {
	oAirnowCO.oSlider_indices = airnow_sliderpos_lookup(oAirnowCO);
    }

    if (! oAirnowNO2.oSlider_indices) {
	oAirnowNO2.oSlider_indices = airnow_sliderpos_lookup(oAirnowNO2);
    }

    if (! oAirnowSO2.oSlider_indices) {
	oAirnowSO2.oSlider_indices = airnow_sliderpos_lookup(oAirnowSO2);
    }

    if (! oSurfmetTemperature.oSlider_indices) {
	oSurfmetTemperature.oSlider_indices = airnow_sliderpos_lookup(oSurfmetTemperature);
    }

    if (! oSurfmetPressure.oSlider_indices) {
	oSurfmetPressure.oSlider_indices = airnow_sliderpos_lookup(oSurfmetPressure);
    }

    if (! oSurfmetWindSpeed.oSlider_indices) {
	oSurfmetWindSpeed.oSlider_indices = airnow_sliderpos_lookup(oSurfmetWindSpeed);
    }

    if (! oSurfmetWindDirection.oSlider_indices) {
	oSurfmetWindDirection.oSlider_indices = airnow_sliderpos_lookup(oSurfmetWindDirection);
    }

    if (! oPurpleairPM25.oSlider_indices) {
	oPurpleairPM25.oSlider_indices = purpleair_sliderpos_lookup(oPurpleairPM25);
    }
    
    if (! oHmsFire.oSlider_indices) {
	oHmsFire.oSlider_indices = hmsFireFastmarker_sliderpos_lookup(oHmsFire);
    }

      for (i=0; i<mySensorArray.length; i++) {
          if (! mySensorArray[i].oSlider_indices) {
	      mySensorArray[i].oSlider_indices = mysensor_sliderpos_lookup(mySensorArray[i]);
          }
      }

      
    //console.log(updateOptionalFlag);
    if (updateOptionalFlag) {
    //if (1) {
	if (document.getElementById('addAqsOzoneLocations').checked && oAirnowOzone.oSlider_indices) {
	    var closest_index     = oAirnowOzone.oSlider_indices.n[pos];
	    var closest_timeindex = oAirnowOzone.oSlider_indices.time[pos];

	    if (closest_timeindex != AqsOzoneLastClosestTimeIndex) {
		AqsOzoneLastClosestTimeIndex = closest_timeindex;
	    }

            AqsOzoneLayer.setMap(map);
	    hideAllLayers(AqsOzoneLayer);
	    showLayer(AqsOzoneLayer);
	} else { 
            if ( !(AqsOzoneLayer === undefined) ) {
                try {
                    AqsOzoneLayer.setMap(null);
                } catch (err) {
                    // do nothing
                }
            }
        }
	
	if (document.getElementById('addAqsPM25Locations').checked && oAirnowPM25.oSlider_indices) {
	    var closest_index     = oAirnowPM25.oSlider_indices.n[pos];
	    var closest_timeindex = oAirnowPM25.oSlider_indices.time[pos];
	    
	    if (closest_timeindex != AqsPM25LastClosestTimeIndex) {
		AqsPM25LastClosestTimeIndex = closest_timeindex;
	    }
	    AqsPM25Layer.setMap(map);
	    hideAllLayers(AqsPM25Layer);
	    showLayer(AqsPM25Layer);
	} else { 
            if ( !(AqsPM25Layer === undefined) ) {
                try {
                    AqsPM25Layer.setMap(null);
                } catch (err) {
                    // do nothing
                }
            }
        }

        if (document.getElementById('addAqsPM10Locations').checked && oAirnowPM10.oSlider_indices) {
	    var closest_index     = oAirnowPM10.oSlider_indices.n[pos];
	    var closest_timeindex = oAirnowPM10.oSlider_indices.time[pos];
	    
	    if (closest_timeindex != AqsPM10LastClosestTimeIndex) {
		AqsPM10LastClosestTimeIndex = closest_timeindex;
	    }
	    AqsPM10Layer.setMap(map);
	    hideAllLayers(AqsPM10Layer);
	    showLayer(AqsPM10Layer);
	} else { 
            if ( !(AqsPM10Layer === undefined) ) {
                try {
                    AqsPM10Layer.setMap(null);
                } catch (err) {
                    // do nothing
                }
            }
        }
	
	if (document.getElementById('addAqsCOLocations').checked && oAirnowCO.oSlider_indices) {
	    var closest_index     = oAirnowCO.oSlider_indices.n[pos];
	    var closest_timeindex = oAirnowCO.oSlider_indices.time[pos];
	    if (closest_timeindex != AqsCOLastClosestTimeIndex) {
		AqsCOLastClosestTimeIndex = closest_timeindex;
	    }
            AqsCOLayer.setMap(map);
	    hideAllLayers(AqsCOLayer);
	    showLayer(AqsCOLayer);
	   
	} else { 
            if ( !(AqsCOLayer === undefined) ) {
                try {
                    AqsCOLayer.setMap(null);
                } catch (err) {
                    // do nothing
                }
            }
        }
	
	if (document.getElementById('addAqsNO2Locations').checked && oAirnowNO2.oSlider_indices) {
	    var closest_index     = oAirnowNO2.oSlider_indices.n[pos];
	    var closest_timeindex = oAirnowNO2.oSlider_indices.time[pos];
	    
	    if (closest_timeindex != AqsNO2LastClosestTimeIndex) {
		AqsNO2LastClosestTimeIndex = closest_timeindex;
	    }
            AqsNO2Layer.setMap(map);
	    hideAllLayers(AqsNO2Layer);
	    showLayer(AqsNO2Layer);
	    
	} else { 
            if ( !(AqsNO2Layer === undefined) ) {
                try {
                    AqsNO2Layer.setMap(null);
                } catch (err) {
                    // do nothing
                }
            }
        }
	
	if (document.getElementById('addAqsSO2Locations').checked && oAirnowSO2.oSlider_indices) {
	    var closest_index     = oAirnowSO2.oSlider_indices.n[pos];
	    var closest_timeindex = oAirnowSO2.oSlider_indices.time[pos];
	    
	    if (closest_timeindex != AqsSO2LastClosestTimeIndex) {
		AqsSO2LastClosestTimeIndex = closest_timeindex;
	    }
            AqsSO2Layer.setMap(map);
	    hideAllLayers(AqsSO2Layer);
	    showLayer(AqsSO2Layer);
	    
	} else { 
            if ( !(AqsSO2Layer === undefined) ) {
                try {
                    AqsSO2Layer.setMap(null);
                } catch (err) {
                    // do nothing
                }
            }
        }
	
	if (document.getElementById('addSurfmetLocations').checked && oSurfmetTemperature.oSlider_indices) {
	    var closest_index = oSurfmetTemperature.oSlider_indices.n[pos];
	    var closest_timeindex = oSurfmetTemperature.oSlider_indices.time[pos];
	    
	    if (closest_timeindex != SurfmetTemperatureLastClosestTimeIndex) {
		SurfmetTemperatureLastClosestTimeIndex = closest_timeindex;
	    }
            SurfmetTemperatureLayer.setMap(map);
	    hideAllLayers(SurfmetTemperatureLayer);
	    showLayer(SurfmetTemperatureLayer);
	    
	} else { 
            if ( !(SurfmetTemperatureLayer === undefined) ) {
                try {
                    SurfmetTemperatureLayer.setMap(null);
                } catch (err) {
                    // do nothing
                }
            }
	}
	
	if (document.getElementById('addSurfmetLocations').checked && oSurfmetPressure.oSlider_indices) {
	    var closest_index = oSurfmetPressure.oSlider_indices.n[pos];
	    var closest_timeindex = oSurfmetPressure.oSlider_indices.time[pos];
	    
	    if (closest_timeindex != SurfmetPressureLastClosestTimeIndex) {
		SurfmetPressureLastClosestTimeIndex = closest_timeindex;
	    }
	    SurfmetPressureLayer.setMap(map);
	    hideAllLayers(SurfmetPressureLayer);
	    showLayer(SurfmetPressureLayer);
	    
	} else { 
            if ( !(SurfmetPressureLayer === undefined) ) {
                try {
                    SurfmetPressureLayer.setMap(null);
                } catch (err) {
                    // do nothing
                }
            }
	}
	
	if (document.getElementById('addSurfmetLocations').checked && oSurfmetWindSpeed.oSlider_indices) {
	    var closest_index = oSurfmetWindSpeed.oSlider_indices.n[pos];
	    var closest_timeindex = oSurfmetWindSpeed.oSlider_indices.time[pos];
	    
	    if (closest_timeindex != SurfmetWindSpeedLastClosestTimeIndex) {
		SurfmetWindSpeedLastClosestTimeIndex = closest_timeindex;
	    }
	    SurfmetWindSpeedLayer.setMap(map);
	    hideAllLayers(SurfmetWindSpeedLayer);
	    showLayer(SurfmetWindSpeedLayer);
	    
	} else { 
            if ( !(SurfmetWindSpeedLayer === undefined) ) {
                try {
                    SurfmetWindSpeedLayer.setMap(null);
                } catch (err) {
                    // do nothing
                }
            }
	}
	
	if (document.getElementById('addSurfmetLocations').checked && oSurfmetWindDirection.oSlider_indices) {
	    var closest_index = oSurfmetWindDirection.oSlider_indices.n[pos];
	    var closest_timeindex = oSurfmetWindDirection.oSlider_indices.time[pos];
	    
	    if (closest_timeindex != SurfmetWindDirectionLastClosestTimeIndex) {
		SurfmetWindDirectionLastClosestTimeIndex = closest_timeindex;
	    }
	    SurfmetWindDirectionLayer.setMap(map);
	    hideAllLayers(SurfmetWindDirectionLayer);
	    showLayer(SurfmetWindDirectionLayer);
	    
	} else { 
            if ( !(SurfmetWindDirectionLayer === undefined) ) {
                try {
                    SurfmetWindDirectionLayer.setMap(null);
                } catch (err) {
                    // do nothing
                }
            }
	}

        
        if (document.getElementById('addPurpleairLocations').checked && oPurpleairPM25.oSlider_indices) {
	    var closest_index = oPurpleairPM25.oSlider_indices.n[pos];
	    var closest_timeindex = oPurpleairPM25.oSlider_indices.time[pos];
	    
	    if (closest_timeindex != PurpleairPM25LastClosestTimeIndex) {
		PurpleairPM25LastClosestTimeIndex = closest_timeindex;
	    }
            //console.log(PurpleairPM25Layer);
	    PurpleairPM25Layer.setMap(map);
	    hideAllLayers(PurpleairPM25Layer);
	    showLayer(PurpleairPM25Layer);
	    
	} else { 
            if ( !(PurpleairPM25Layer === undefined) ) {
                try {
                    PurpleairPM25Layer.setMap(null);
                } catch (err) {
                    // do nothing
                }
            }
	}
        
        if (document.getElementById('addHmsFireLocations').checked && oHmsFire.oSlider_indices) {
	    var closest_timeindex = oHmsFire.oSlider_indices.time[pos];

            // hide existing fire layer
            try {
                HmsFireLayer.setMap(null);
                hideAllLayers(HmsFireLayer);
            } catch (err) {}

            // create new fire layer
            if (closest_timeindex >= 0 && closest_timeindex < oHmsFire.nDays) {    
                HmsFireLayer = new FastMarkerOverlayMJF(null, HmsFireFastMarker[closest_timeindex]);

                //show new fire layer
                HmsFireLayer.setMap(map);
                showLayer(HmsFireLayer);
            }
	} else { 
            if ( !(HmsFireLayer === undefined) ) {
                try {
                    HmsFireLayer.setMap(null);
                } catch (err) {
                    // do nothing
                }
            }
	}


        for (sensorInd=0; sensorInd<mySensorArray.length; sensorInd++) {
            if (document.getElementById('addMySensorLocations' + sensorInd).checked && mySensorArray[sensorInd].oSlider_indices) {
	        var closest_index = mySensorArray[sensorInd].oSlider_indices.n[pos];
	        var closest_timeindex = mySensorArray[sensorInd].oSlider_indices.time[pos];
	        
	        if (closest_timeindex != allMySensorLastClosestTimeIndexes[sensorInd]) {
		    allMySensorLastClosestTimeIndexes[sensorInd] = closest_timeindex;
	        }
	        allMySensorLayers[sensorInd].setMap(map);
	        hideAllLayers(allMySensorLayers[sensorInd]);
	        showLayer(allMySensorLayers[sensorInd]);
	        
	    } else { 
                if ( !(allMySensorLayers[sensorInd] === undefined) ) {
                    try {
                        allMySensorLayers[sensorInd].setMap(null);
                    } catch (err) {
                        // do nothing
                    }
                }
	    }
        }
        
	
    }
    
    //debug(closest_index);
    //debug(oAirnowOzone.timestamp[closest_index]);
    //debug("closest_timeindex: " + closest_timeindex);
  } 

  function update_choice(pos) {
    update_map(pos);
    update_displayed_data_value(get_selected_varselector_index(), pos);
  }


  function update_displayed_data_value(varindex, pos) {
    var pos;				    
    var data_value_string;
    var nearest_pos;
    if (oUserdata.variable[selected_block][varindex][pos] == fill_value) {
      nearest_pos = get_nearest_singleMarker(pos);
      data_value_string = oUserdata.variable[selected_block][varindex][nearest_pos].toFixed(4).toString();
    } else if (oUserdata.variable[selected_block][varindex][pos] == missing_value) {
        data_value_string = "missing data";
    } else {
      data_value_string = oUserdata.variable[selected_block][varindex][pos].toFixed(4).toString();
    }

    // if at pos=1 and we still have a fill_value, override the displayed string
    if (data_value_string == fill_value) {
      data_value_string = "";
    }						  
      
    //document.getElementById("displayed_data_value").innerHTML = "MyData: " + oUserdata.varname[selected_block][varindex] + " = " + data_value_string;
    document.getElementById("displayed_data_value").innerHTML = "<b>" + oUserdata.varname[selected_block][varindex] + " = " + data_value_string + "</b>";
  } 

  function update_analysisPlotHighlight(highlight_pos) {
//debug("a " + highlight_pos);
    var highlight_pos;
    var showErrorBars = false;
	
    if (document.getElementById("analysis_boxplotoption").checked) {
      showErrorBars = true;
    }

    if (analysisPlot && showErrorBars == false) {
      analysisPlot.unhighlight();
      if (document.getElementById("analysis_separateByID").checked == false) {
        analysisPlot.highlight(0, highlight_pos);
        analysisPlot.highlight(1, highlight_pos);
      } else {
        analysisPlot.highlight(0, highlight_pos);
        analysisPlot.highlight(1, highlight_pos);
        analysisPlot.highlight(2, highlight_pos);
        analysisPlot.highlight(3, highlight_pos);
        analysisPlot.highlight(4, highlight_pos);
        analysisPlot.highlight(5, highlight_pos);
        analysisPlot.highlight(6, highlight_pos);
        analysisPlot.highlight(7, highlight_pos);
        analysisPlot.highlight(8, highlight_pos);
        analysisPlot.highlight(9, highlight_pos);
      }
    }
  }

  function update_scatterPlotHighlight(highlight_pos) {
      //console.log(highlight_pos, oStatsHourly.sliderposlookup[highlight_pos]);
      var highlight_pos;
      
      if (scatterPlot) {
          scatterPlot.unhighlight();

          if (document.getElementById('scatterchoiceHourly').checked) {
              scatterPlot.highlight(0, oStatsHourly.sliderposlookup[highlight_pos]);
          } else {
              scatterPlot.highlight(0, oStatsNative.sliderposlookup[highlight_pos]);
          }
          //scatterPlot.highlight(1, highlight_pos);
          //scatterPlot.highlight(2, highlight_pos);
          //scatterPlot.highlight(3, highlight_pos);
          //scatterPlot.highlight(4, highlight_pos);
      }
  }

  function update_timeseriesPlotHighlight(highlight_pos) {
      //debug("t " + highlight_pos);
      //console.log(highlight_pos);
      var highlight_pos;
      if (timeseriesPlot) {
          timeseriesPlot.unhighlight();
          hourlyOption = document.getElementById("timeseriesHourlyOption").checked;
          if (hourlyOption) {
              timeseriesPlot.highlight(0, oStatsHourly.sliderposlookup[highlight_pos]);
          } else {
              var secondVarIndex = document.getElementById("timeseries_secondVar").selectedIndex;
              if (document.getElementById("timeseries_separateByID").checked == false) {
                  timeseriesPlot.highlight(0, highlight_pos);
                  if (secondVarIndex > 0) {
                      timeseriesPlot.highlight(1, highlight_pos);
                  }
              } else {
                  timeseriesPlot.highlight(0, highlight_pos);
                  timeseriesPlot.highlight(1, highlight_pos);
                  timeseriesPlot.highlight(2, highlight_pos);
                  timeseriesPlot.highlight(3, highlight_pos);
                  timeseriesPlot.highlight(4, highlight_pos);
              }
          }
      }
  }

  function update_windroseHighlight(highlight_pos) {
    // highlight is drawn in update_windrosePlot()

    var highlight_pos;
    //windroseHighlightPos = highlight_pos;
    if ( windroseSortIndex.length > 1) {
      windroseHighlightPos = windroseSortIndex[highlight_pos];
    } else{
      windroseHighlightPos = 0;
    }
  }


  function clear_analysisMarker() {
     clear_analysisMarker_flag = true;
     update_analysisPlot();
  }
 
  function clear_analysisLine() {
     clear_analysisLine_flag = true;
     update_analysisPlot();
  }


  function toggle_timeseriesSeparateByID() {
    if (document.getElementById("timeseries_separateByID").checked) {
      document.getElementById("timeseries_secondVar").disabled = true;

      if (document.getElementById("timeseries_secondVar").value != "None") {
        print("Timeseries separate by ID selected... turning off second timeseries variable.");
        document.getElementById("timeseries_secondVar").value = "None";
      }
    } else {
      document.getElementById("timeseries_secondVar").disabled = false;
    }

    update_timeseriesPlot();
  }


  function toggle_analysisSeparateByID() {
    if (document.getElementById("analysis_separateByID").checked) {
      document.getElementById("analysis_boxplotoption").disabled = true;

      if (document.getElementById("analysis_boxplotoption").checked) {
        print("Analysis separate by ID selected... turning off statistical summary option.");
        document.getElementById("analysis_boxplotoption").checked = false;
      }
    } else {
      document.getElementById("analysis_boxplotoption").disabled = false;
    }

    update_analysisPlot();
  }


  function update_analysisPlot() {

    var ptA;
    var ptB;
    var area;
    var segLength;
    var segHeading;
    var ptARelativeHeading;
    var ptBRelaticeHeading;
    var mindist;

    var abs = Math.abs; //local reference to the global Math.abs function (FASTER)

    var nvars;

    if (oUserdata.varname[0]) {
	nvars = oUserdata.varname[0].length; 
    } else {
	nvars = 0;
    }


    // for data flagger
    flagger  = document.getElementById("excludeFlaggerOption").checked;
    noExport = document.getElementById("chkFlaggerDoNotExport").checked;
    code_constant     = 'C';
    code_missing      = 'M';
    code_outlierStat  = 'T';
    code_outlierSpike = 'P';
    code_above        = 'A';
    code_below        = 'B';
    code_user         = 'U';

      
    // initialize export array
    analysisExportArray = [];

    if (clear_analysisLine_flag == true && clear_analysisMarker_flag == true) {
      analysisExportArray.push('No analysis data to export');
    }

    if ( document.getElementById('analysisPlotOptionButton').checked == true) {
      var mypath = analysisLine.getPath();
      var marker_latlng = analysisMarker.getPosition();
      var plotData = [];
      plotData.length = 0;

      
      // for ploting distance to analysis line
      var plotDataLine = [];
      plotDataLine.length = 0;

      // write info to export array
      if (marker_latlng) {
         if (clear_analysisMarker_flag == false) {
           // write point info to export array
           analysisExportArray.push(['Analysis_point Latitude, Longitude:\n']);
           analysisExportArray.push([marker_latlng.lat().toFixed(6) + ',' + marker_latlng.lng().toFixed(6)]);
           analysisExportArray.push('\n');
         }
          if (flagger && clear_analysisMarker_flag == false && (! noExport) ) {
             analysisExportArray.push(['Data flagger codes: constant=' + code_constant + ', missing=' + code_missing + ', outlierStat=' + code_outlierStat + ', outlierSpike=' + code_outlierSpike + ', aboveValue=' + code_above + ', belowValue=' + code_below + ',  userInvalidated=' + code_user + '\n']);
             analysisExportArray.push(['Data flagger constant repeat num=' + settings.flaggerConstantRepeatNum + '\n']);
             analysisExportArray.push(['Data flagger missing repeat num=' + settings.flaggerMissingRepeatNum + '\n']);
             analysisExportArray.push(['Data flagger missing value=' + settings.flaggerMissingValue + '\n']);
             analysisExportArray.push(['Data flagger outlier stat sd factor value=' + settings.flaggerOutlierStatSDfactor + '\n']);
             analysisExportArray.push(['Data flagger outlier spike time window value=' + settings.flaggerOutlierSpikeTimeWindow + '\n']);
             analysisExportArray.push(['Data flagger outlier spike sd factor value=' + settings.flaggerOutlierSpikeSDfactor + '\n']);
             analysisExportArray.push(['Data flagger above concentration value=' + settings.flaggerAboveConc + '\n']);
             analysisExportArray.push(['Data flagger below concentration value=' + settings.flaggerBelowConc + '\n']);
             analysisExportArray.push(['Data flagger user invalidate start =' + settings.flaggerUserInvalidateStart + '\n']);
             analysisExportArray.push(['Data flagger user invalidate end =' + settings.flaggerUserInvalidateEnd + '\n']);
         }
      }
      if (mypath) {
        // write line info to export array
        if (clear_analysisLine_flag == false) {
          analysisExportArray.push(['Analysis_line Latitude, Longitude:\n']);
          for (segment=0; segment<mypath.length; segment++) {
            ptA = mypath.getAt(segment);
            analysisExportArray.push([ptA.lat().toFixed(6) + ',' + ptA.lng().toFixed(6)]);
            analysisExportArray.push('\n');
          }
        }
      }
      

      // export array header
      if (clear_analysisLine_flag == false || clear_analysisMarker_flag == false) {
        analysisExportArray.push(['Latitude,Longitude']);
      }
      if (clear_analysisLine_flag == false) {
        analysisExportArray.push([',DistanceFromLine(m)']);
      }
      if (clear_analysisMarker_flag == false) {
        analysisExportArray.push([',DistanceFromMarker(m)']);
      }
      if (clear_analysisLine_flag == false || clear_analysisMarker_flag == false) {
        for (vInd=0; vInd<nvars; vInd++){    
          analysisExportArray.push([',' + oUserdata.varname[selected_block][vInd]]);
        }
      }
        if (flagger && (! noExport) && (clear_analysisLine_flag == false || clear_analysisMarker_flag == false)) {
          analysisExportArray.push([',' + 'DataFlaggerCodes']);
      }
      if (clear_analysisLine_flag == false || clear_analysisMarker_flag == false) {
        analysisExportArray.push('\n');
      }

      if (marker_latlng || mypath) {
	var plotDataMin =  100000000000; // default;
        var myXmin      =  100000000000; // default;
        var myXmax      = -100000000000; // default;

	// prepare bins for boxplot option
        binSize = boxplotBinSize;
	if (analysisXmin != myXmin) {
	  //binXmin = analysisXmin;
	  binXmin = 0;

	  binXmax = analysisXmax;
        } else {
          binXmin = 0;
          binXmax = 1000;
        }
        nBins = parseInt((binXmax - binXmin) / binSize) + 1;
        if (nBins == 0) {
          nBins = 1;
        }

        //debug("binXmin = " + binXmin);
        //debug("binXmax = " + binXmax);
        //debug("nBins = " + nBins);
        // initialize arrays
	boxplotPointMean       = new Array(nBins);
        boxplotPointStddev     = new Array(nBins);
        boxplotPointAvgNum     = new Array(nBins);
        boxplotLineMean        = new Array(nBins);
        boxplotLineStddev      = new Array(nBins);
        boxplotLineAvgNum      = new Array(nBins);

        for (aInd=0; aInd<nBins; aInd++) {
          boxplotPointMean[aInd]       = 0.0;
          boxplotPointStddev[aInd]     = 0.0;
          boxplotPointAvgNum[aInd]     = 0.0;     
          boxplotLineMean[aInd]        = 0.0;
          boxplotLineStddev[aInd]      = 0.0;
          boxplotLineAvgNum[aInd]      = 0.0;
        }
 
        var showErrorBars = false;
	if (document.getElementById("analysis_boxplotoption").checked) {
          showErrorBars = true;
        }


        // initialization for "separate by ID" stuff
        if (document.getElementById("analysis_separateByID").checked == true) {
          // build list of up to "maxIDsToShow" selected IDs to show
          var maxIDsToShow = 5; // labels are hardcoded below, so don't increase
          var idCount = 0;
          var checked_ids = [];
          var sepIdPlotData = [];
              sepIdPlotData = new Array(maxIDsToShow);
          var sepIdPlotDataLine = [];
              sepIdPlotDataLine = new Array(maxIDsToShow);
          var checkbox_list = document.getElementsByName("id_checkboxes");

          for (var listInd=0; listInd<checkbox_list.length; listInd++){ 
            this_id_checked = checkbox_list[listInd].checked; 
            if (this_id_checked && idCount < maxIDsToShow) {			  
              checked_ids.push(checkbox_list[listInd].value);
              idCount += 1; 			  
            }
          }
        }
        for (initInd=0; initInd<maxIDsToShow; initInd++) {
          sepIdPlotData[initInd]     = new Array();
          sepIdPlotDataLine[initInd] = new Array();
        }
        label0 = "";
        label1 = "";
        label2 = "";
        label3 = "";
        label4 = "";

        for (ind=0; ind<allLatLng.length; ind++) {

          // handle separate by ID option
          if (document.getElementById("analysis_separateByID").checked == true) {
            var thisIDInd = jQuery.inArray(oUserdata.id[selected_block][ind], checked_ids);
            if (thisIDInd == -1) {
              print("Data point was not found in the first " + maxIDsToShow + " checked IDs: " + checked_ids);
            }
            if ( thisIDInd >= 0) {
              if (thisIDInd == 0) {label0 = oUserdata.id[selected_block][ind];}
              if (thisIDInd == 1) {label1 = oUserdata.id[selected_block][ind];}
              if (thisIDInd == 2) {label2 = oUserdata.id[selected_block][ind];}
              if (thisIDInd == 3) {label3 = oUserdata.id[selected_block][ind];}
              if (thisIDInd == 4) {label4 = oUserdata.id[selected_block][ind];}      
            }
          }

          // write lat/lon to export array
          if (clear_analysisLine_flag == false || clear_analysisMarker_flag == false) {
            analysisExportArray.push([allLatLng[ind].lat().toFixed(6) + ',' + allLatLng[ind].lng().toFixed(6)]);
          }

          mindist         =  1e23;

          // LINE
          if (mypath) {
            
      
            for (segment=0; segment<mypath.length-1; segment++) {
              ptA = mypath.getAt(segment);
              ptB = mypath.getAt(segment+1);

              // area of triangle formed by line segment and point
              area = google.maps.geometry.spherical.computeArea([ptA, ptB, allLatLng[ind]]);

              // length of line segment
              segLength = google.maps.geometry.spherical.computeDistanceBetween(ptA, ptB);

              // heading of line segment
              segHeadingAtoB = google.maps.geometry.spherical.computeHeading(ptA, ptB);

              // make heading 0-360
              if (segHeadingAtoB < 0) {segHeadingAtoB = segHeadingAtoB + 360;} 

              // distance between point and LINE containing ptA and ptB (not line segment!)
              this_mindist = 2*area/segLength;

              // heading of data point to ptA and ptB
              ptAHeading = google.maps.geometry.spherical.computeHeading(ptA, allLatLng[ind]);
              ptBHeading = google.maps.geometry.spherical.computeHeading(ptB, allLatLng[ind]);


              // make headings 0-360
              if (ptAHeading < 0) {ptAHeading = ptAHeading + 360;}
              if (ptBHeading < 0) {ptBHeading = ptBHeading + 360;}

              ptARelativeHeading = ptAHeading - segHeadingAtoB;
              ptBRelativeHeading = ptBHeading - segHeadingAtoB;

              angleBAP = abs(ptARelativeHeading);
              angleABP = 180 - abs(ptBRelativeHeading); // supplementary angle

              // if either is greater than 90, then the distance to the end point should be reported
              if (angleBAP >= 90) {
                this_mindist = google.maps.geometry.spherical.computeDistanceBetween(allLatLng[ind], ptA);
              } else if (angleABP >= 90) {
                this_mindist = google.maps.geometry.spherical.computeDistanceBetween(allLatLng[ind], ptB);
              }

              mindist = Math.min(this_mindist, mindist);
            }

	    if (mindist == 1e23) {
              mindist = -1;
            }

            // write info to export array 
            if (clear_analysisLine_flag == false) {
              analysisExportArray.push(',');
              analysisExportArray.push(mindist.toFixed(6));
            }
          }
          


          // MARKER
          this_distMeters = 0
          if (marker_latlng) {
            this_distMeters = google.maps.geometry.spherical.computeDistanceBetween(marker_latlng, allLatLng[ind]);
            // write info to export array 
            if (clear_analysisMarker_flag == false) {
              // add comma if there was already line info written
              analysisExportArray.push(',');
              analysisExportArray.push(this_distMeters.toFixed(6));
            }
          }

         
            
          // write data to export array
          if (clear_analysisMarker_flag == false || clear_analysisLine_flag == false) {
            for (vInd=0; vInd<nvars; vInd++){    
              analysisExportArray.push(',' + oUserdata.variable[selected_block][vInd][ind].toFixed(6));
            }
          }								    

          // write data flagger codes to export array
            if (flagger && (! noExport) && (clear_analysisMarker_flag == false || clear_analysisLine_flag == false)) {
                
              codeString = ""; //default passed
              dataMsec = oUserdata.msec[selected_block][ind];
              if (oUserdata.flagged_constant_msec.indexOf(dataMsec) > 0)        { codeString += code_constant }
              if (oUserdata.flagged_longMissing_msec.indexOf(dataMsec) > 0)     { codeString += code_missing }
              if (oUserdata.flagged_outlierStat_msec.indexOf(dataMsec) > 0)     { codeString += code_outlierStat }
              if (oUserdata.flagged_outlierSpike_msec.indexOf(dataMsec) > 0)    { codeString += code_outlierSpike }
              if (oUserdata.flagged_aboveConc_msec.indexOf(dataMsec) > 0)       { codeString += code_above }
              if (oUserdata.flagged_belowConc_msec.indexOf(dataMsec) > 0)       { codeString += code_below }
              if (oUserdata.flagged_userInvalidated_msec.indexOf(dataMsec) > 0) { codeString += code_user }
              analysisExportArray.push(',' + codeString);
          }	

          // fold data point into the running boxplot average
          thisBinPoint = parseInt(this_distMeters / binSize);
          thisBinLine  = parseInt(mindist / binSize);
	  thisData     = parseFloat(oUserdata.variable[selected_block][get_selected_varselector_index()][ind]);
          if ( (flagger && (isMsecFlagged(oUserdata.msec[selected_block][ind]))) ) {
              thisData = -9999;
          }
	  if (showErrorBars && thisData != -9999 && thisData != -8888) {
            if ( (oUserdata.show1[selected_block][get_selected_varselector_index()][ind]) && 
                 (oUserdata.show2[selected_block][get_selected_varselector_index()][ind]) ) {

	      if (clear_analysisMarker_flag == false) {
                if (boxplotPointAvgNum[thisBinPoint] == 0) {
                  boxplotPointMean[thisBinPoint]   = thisData;
                  boxplotPointStddev[thisBinPoint] = 0;
                } else {
                  boxplotPointMean[thisBinPoint]   = (boxplotPointMean[thisBinPoint]*boxplotPointAvgNum[thisBinPoint] + thisData) / (boxplotPointAvgNum[thisBinPoint] + 1.0);
                  // compute running variance. We will take square root below.
                  boxplotPointStddev[thisBinPoint] = (boxplotPointStddev[thisBinPoint]*boxplotPointAvgNum[thisBinPoint] + Math.pow(thisData-boxplotPointMean[thisBinPoint], 2) ) / (boxplotPointAvgNum[thisBinPoint] + 1.0)  ;
                }
	        boxplotPointAvgNum[thisBinPoint] += 1;

              } else {
                boxplotPointMean[thisBinPoint]   = null;
                boxplotPointStddev[thisBinPoint] = null;
              }

              // line
              if (clear_analysisLine_flag == false) {
                if (boxplotLineAvgNum[thisBinLine] == 0) {
                  boxplotLineMean[thisBinLine]   = thisData;
                  boxplotLineStddev[thisBinLine] = 0;
                } else {
                  boxplotLineMean[thisBinLine]   = (boxplotLineMean[thisBinLine]*boxplotLineAvgNum[thisBinLine] + thisData) / (boxplotLineAvgNum[thisBinLine] + 1);
                  // compute running variance. We will take square root below.
                  boxplotLineStddev[thisBinLine] = (boxplotLineStddev[thisBinLine]*boxplotLineAvgNum[thisBinLine] + Math.pow(thisData-boxplotLineMean[thisBinLine], 2) ) / (boxplotLineAvgNum[thisBinLine] + 1)  ;
                }
	        boxplotLineAvgNum[thisBinLine] += 1;
              } else {
                boxplotLineMean[thisBinLine]   = null;
                boxplotLineStddev[thisBinLine] = null;
              }
            }
          }

          // plot arrays for non-boxplot. If we are using boxplot, it will be set up outside of the loop over points
          if (showErrorBars == false) { 
            if ( (oUserdata.show1[selected_block][get_selected_varselector_index()][ind]) && 
                 (oUserdata.show2[selected_block][get_selected_varselector_index()][ind]) ) {
                if (clear_analysisMarker_flag == false) {
		  if ( (! flagger) || (flagger && (! isMsecFlagged(oUserdata.msec[selected_block][ind])))) {
                    plotData.push([this_distMeters, oUserdata.variable[selected_block][get_selected_varselector_index()][ind], 0]);
                  } else {
                      plotData.push([null,null]);
                  }
                if (document.getElementById("analysis_separateByID").checked == true && thisIDInd < maxIDsToShow && thisIDInd >= 0) {
                  for (tempInd=0; tempInd<maxIDsToShow; tempInd++) {
                    if (tempInd == thisIDInd) {
                      if ( (! flagger) || (flagger && (! isMsecFlagged(oUserdata.msec[selected_block][ind])))) {
                        sepIdPlotData[tempInd].push([this_distMeters, oUserdata.variable[selected_block][get_selected_varselector_index()][ind]]);
                      }
                    } else {
                      sepIdPlotData[tempInd].push([null,null]);
                    }
                  }
                }
              } else {
                plotData.push([null, null]);
                for (tempInd=0; tempInd<maxIDsToShow; tempInd++) {
                  sepIdPlotData[tempInd].push([null,null]);
                }
              }
              if (clear_analysisLine_flag == false) {
                if ( (! flagger) || (flagger && (! isMsecFlagged(oUserdata.msec[selected_block][ind])))) {
                  plotDataLine.push([mindist, oUserdata.variable[selected_block][get_selected_varselector_index()][ind], 0]); 
                } else {
                    plotDataLine.push([null,null]);
                }
                if (document.getElementById("analysis_separateByID").checked == true && thisIDInd < maxIDsToShow && thisIDInd >= 0) {
                  for (tempInd=0; tempInd<maxIDsToShow; tempInd++) {
                    if (tempInd == thisIDInd) {
                      sepIdPlotDataLine[tempInd].push([mindist, oUserdata.variable[selected_block][get_selected_varselector_index()][ind]]); 
                    } else {
                      sepIdPlotDataLine[tempInd].push([null,null]);
                    }
                  }
                }
              } else {
                plotDataLine.push([null, null]);
                for (tempInd=0; tempInd<maxIDsToShow; tempInd++) {
                  sepIdPlotDataLine[tempInd].push([null,null]);
                }
              }
              if ( (oUserdata.variable[selected_block][get_selected_varselector_index()][ind] < plotDataMin) &&
                   (oUserdata.variable[selected_block][get_selected_varselector_index()][ind] != missing_value) &&
                   (oUserdata.variable[selected_block][get_selected_varselector_index()][ind] != fill_value) ) {
                     plotDataMin = oUserdata.variable[selected_block][get_selected_varselector_index()][ind]
              }
            } else {
              plotData.push([null, null]);
              plotDataLine.push([null, null]);
              for (tempInd=0; tempInd<maxIDsToShow; tempInd++) {
                sepIdPlotData[tempInd].push([null,null]);
                sepIdPlotDataLine[tempInd].push([null,null]);
              }
            }
          }
 
          if (this_distMeters < myXmin) { myXmin = this_distMeters; }
          if (this_distMeters > myXmax) { myXmax = this_distMeters; } 
          if (mindist         < myXmin) { myXmin = mindist; } 
          if (mindist         > myXmax) { myXmax = mindist; }
	  if (myXmin          < 0)      { myXmin = 0; }

          // write newline to export array
          if (clear_analysisMarker_flag == false || clear_analysisLine_flag == false) {
            analysisExportArray.push('\n');
          }
        } // end loop over points



        if (showErrorBars) {
          // point
          for (thisBinPoint=0; thisBinPoint<nBins; thisBinPoint++) {
	    if (boxplotPointMean[thisBinPoint] != null && boxplotPointMean[thisBinPoint] != 0) {
              boxplotPointStddev[thisBinPoint] = Math.sqrt( boxplotPointStddev[thisBinPoint]);
              plotData.push([thisBinPoint*binSize + binSize/2, boxplotPointMean[thisBinPoint], boxplotPointStddev[thisBinPoint]]);
	    }
          } 
	  // line
          for (thisBinLine=0; thisBinLine<nBins; thisBinLine++) {
	    if (boxplotLineMean[thisBinLine] != null && boxplotLineMean[thisBinLine] != 0) {
              boxplotLineStddev[thisBinLine] = Math.sqrt( boxplotLineStddev[thisBinLine]);
              plotDataLine.push([thisBinLine*binSize + binSize/2, boxplotLineMean[thisBinLine], boxplotLineStddev[thisBinLine]]);
	    }
          }

        }

        // override X axis min/max is desired
        if (document.getElementById('analysis_Xaxisoption').checked) {
	  // if min/max are set to default, change them to min/max of data
          myXmin_temp = document.getElementById('analysis_Xmin').value;
          myXmax_temp = document.getElementById('analysis_Xmax').value;
          if ( (myXmin_temp == 0) && (myXmax_temp == 0) ) { // defaults
            document.getElementById('analysis_Xmin').value = myXmin;
            document.getElementById('analysis_Xmax').value = myXmax;
          } else {
            myXmin = myXmin_temp;
            myXmax = myXmax_temp;
          }
        }

	// save x min/max for us in setting up boxplot statistics								
	analysisXmin = myXmin;
	analysisXmax = myXmax;
        if (analysisXmin == analysisXmax) {
          analysisXmax = analysisXmin + 100;
        }
 

        // plot all data on the analysis plot
        var myYmin = Math.max(0, plotDataMin);	

	// override data min/max (computed above) with user specified min/max
        // use global min/max (keyed from "avergage" block)
        //myYmin = oUserdata.mymin[selected_block][get_selected_varselector_index()]			      
        //myYmax = oUserdata.mymax[selected_block][get_selected_varselector_index()]
        myYmin = oUserdata.mymin[0][get_selected_varselector_index()]			      
        myYmax = oUserdata.mymax[0][get_selected_varselector_index()]			      

        //if (document.getElementById("analysis_logoption").checked) {
        if (settings.plotLogAxisFlag == true) {
          mytransform = function (v) { return v <= 0 ? -4 : Math.log(v); };
	  //if (myYmin <= 0) {
	  //  debug("Log plot invalid because Y-axis minimum is <= 0.");
	  //}
        } else {
          mytransform = function (v) { return v; };
        }

        
        //colorPointData = "rgb(166,222,63)";
        colorPointData = "rgb(120,163,39)";
        colorLineData  = "green";


        var aCanvas = $("#analysis_canvas2");

        analysisPlotOptions = { xaxis:{min:myXmin, max:myXmax, axisLabel:"Distance [m]", color:"black"},
                                yaxis:{min:myYmin, max:myYmax, axisLabel:oUserdata.varname[selected_block][get_selected_varselector_index()], color:"black", transform:mytransform},
                                lines:{show:false},
                                selection: {mode:"x"}
                              };

        if (document.getElementById("analysis_separateByID").checked == false) {

          analysisPlot = $.plot(aCanvas, 
                          [{highlightColor:"black", label:"Marker", data:plotData,     color:colorPointData, 
                            points:{show:true, symbol:"circle", errorbars: "y", yerr: {show:showErrorBars, upperCap: "-", lowerCap: "-", radius: 5}}}, 
                           {highlightColor:"black", label:"Line",   data:plotDataLine, color:colorLineData,           
                            points:{show:true, symbol:"triangle", errorbars: "y", yerr: {show:showErrorBars, upperCap: "-", lowerCap: "-", radius: 5}}}], 
                          analysisPlotOptions);
        } else {
          color4 = "rgb(204, 229, 255)";
          color3 = "rgb(153, 205, 255)";
          color2 = "rgb( 51, 153, 255)";
          color1 = "rgb(  0, 102, 204)";
          color0 = "rgb(  0,  51, 102)";

	  color4Line = "rgb(204, 255, 204)";
          color3Line = "rgb(153, 255, 153)";
          color2Line = "rgb( 51, 255,  51)";
          color1Line = "rgb(  0, 204,   0)";
          color0Line = "rgb(  0, 102,   0)";

          if (label0 != "") {label0Marker = label0 + ' marker';} else {label0Marker = "";} 
          if (label1 != "") {label1Marker = label1 + ' marker';} else {label1Marker = "";} 
          if (label2 != "") {label2Marker = label2 + ' marker';} else {label2Marker = "";} 
          if (label3 != "") {label3Marker = label3 + ' marker';} else {label3Marker = "";} 
          if (label4 != "") {label4Marker = label4 + ' marker';} else {label4Marker = "";} 
          if (label0 != "") {label0Line = label0 + ' line';} else {label0Line = "";} 
          if (label1 != "") {label1Line = label1 + ' line';} else {label1Line = "";} 
          if (label2 != "") {label2Line = label2 + ' line';} else {label2Line = "";} 
          if (label3 != "") {label3Line = label3 + ' line';} else {label3Line = "";} 
          if (label4 != "") {label4Line = label4 + ' line';} else {label4Line = "";} 

          analysisPlot = $.plot(aCanvas, 
                            [{highlightColor:"black", label:label0Marker, data:sepIdPlotData[0], color:color0, points:{show:true, symbol:"circle"}},
                             {highlightColor:"black", label:label1Marker, data:sepIdPlotData[1], color:color1, points:{show:true, symbol:"cross"}},
                             {highlightColor:"black", label:label2Marker, data:sepIdPlotData[2], color:color2, points:{show:true, symbol:"diamond"}},
                             {highlightColor:"black", label:label3Marker, data:sepIdPlotData[3], color:color3, points:{show:true, symbol:"triangle"}},
                             {highlightColor:"black", label:label4Marker, data:sepIdPlotData[4], color:color4, points:{show:true, symbol:"square"}},
                             {highlightColor:"black", label:label0Line, data:sepIdPlotDataLine[0], color:color0Line, points:{show:true, symbol:"circle"}},
                             {highlightColor:"black", label:label1Line, data:sepIdPlotDataLine[1], color:color1Line, points:{show:true, symbol:"cross"}},
                             {highlightColor:"black", label:label2Line, data:sepIdPlotDataLine[2], color:color2Line, points:{show:true, symbol:"diamond"}},
                             {highlightColor:"black", label:label3Line, data:sepIdPlotDataLine[3], color:color3Line, points:{show:true, symbol:"triangle"}},
                             {highlightColor:"black", label:label4Line, data:sepIdPlotDataLine[4], color:color4Line, points:{show:true, symbol:"square"}}],
                            analysisPlotOptions);
        }

        update_analysisPlotHighlight(lastpos);
      } else {
        // reset plot
        analysisPlot = $.plot(aCanvas, [0,0]);
      }
    }

  }


  function toggle_scatterSeparateByID() {
      update_scatterPlot();
  }

function update_scatterPlot() {
    //console.log("in update_scatterPlot()");
    if (document.getElementById('scatterPlotOptionButton').checked) {
        try {
            // clear the canvas
            //document.getElementById("scatter_canvas").innerHTML = "";

            if (scatterplotHourlyPopupFlag == true) {
                openEmvlDialog("dialog-scatterplot-hourly");
            }


            isHourly = false; // default
            if (document.getElementById('scatterchoiceHourly').checked) {
                isHourly = true;
            }
            //console.log("isHourly=", isHourly);
            
            var canvas_height = parseInt(document.getElementById('scatter_canvas').style.height);
            var canvas_width  = parseInt(document.getElementById('scatter_canvas').style.width);
            
            var plotData        = [];
            var plotDataInvalid = [];         // for coloring points that have been deemed invalid
            var plotDataColors = [];          // needed if coloring by data value
            var plotDataColors = new Array(); // needed if coloring by data value
            plotData.length = 0;
            plotData_xmin = 1e23;
            plotData_xmax = -1e23;
            plotData_ymin = 1e23;
            plotData_ymax = -1e23;
            
            //if (document.getElementById('scatter_logoption').checked) {
            if (settings.plotLogAxisFlag == true) {
                mytransform = function (v) { return v <= 0 ? -4 : Math.log(v); };
	        //if (myYmin <= 0) {
	        //  debug("Log plot invalid because Y-axis minimum is <= 0.");
	        //}
            } else {
                mytransform = function (v) { return v; };
            }

            xVarIndexHourly = document.getElementById("scatter_xaxisVar").selectedIndex;
            yVarIndexHourly = document.getElementById("scatter_yaxisVar").selectedIndex;
            xVarIndexNative = document.getElementById("scatterNative_xaxisVar").selectedIndex;
            yVarIndexNative = document.getElementById("scatterNative_yaxisVar").selectedIndex;

            
            stats_sliderpos_lookup();
            statsNative_sliderpos_lookup();

            xVarNameHourly = "";
            yVarNameHourly = "";
            xVarNameNative = "";
            yVarNameNative = "";
            //if (xVarIndex >= oStatsHourly.nVars) {  // this must be an external variable (Airnow, etc)
                xVarNameHourly = document.getElementById("scatter_xaxisVar").value;
                xVarNameNative = document.getElementById("scatterNative_xaxisVar").value;
            //}
            //if (yVarIndex >= oStatsHourly.nVars) {  // this must be an external variable (Airnow, etc)
                yVarNameHourly = document.getElementById("scatter_yaxisVar").value;
                yVarNameNative = document.getElementById("scatterNative_yaxisVar").value;
            //}

            if (isHourly) {
                xTitle = xVarNameHourly;
                yTitle = yVarNameHourly;
            } else {
                xTitle = xVarNameNative;
                yTitle = yVarNameNative;
            }

            if (xTitle.indexOf('External Data') == 0) {
                sensorInd = Number(xTitle.slice(-1)) - 1; // -1 because index is zero based
                xTitle = xTitle + " " + mySensorArray[sensorInd].curVarname;
            }
            if (yTitle.indexOf('External Data') == 0) {
                sensorInd = Number(yVarName.slice(-1)) - 1; // -1 because index is zero based
                yTitle = yTitle + " " + mySensorArray[sensorInd].curVarname;
            }
                        
            
            //if (document.getElementById("scatter_separateByID").checked == true) {
            //    // build list of up to "maxIDsToShow" selected IDs to show
            //    var maxIDsToShow = 5; // labels are hardcoded below, so don't increase
            //    var idCount = 0;
            //    var checked_ids = [];
            //    var sepIdPlotData = [];
            //    sepIdPlotData = new Array(maxIDsToShow);
            //    var checkbox_list = document.getElementsByName("id_checkboxes");
            //    for (var listInd=0; listInd<checkbox_list.length; listInd++){ 
            //        this_id_checked = checkbox_list[listInd].checked; 
            //        if (this_id_checked && idCount < maxIDsToShow) {			  
            //            checked_ids.push(checkbox_list[listInd].value);
            //            idCount += 1; 			  
            //        }
            //    }
            //}
            
            //for (initInd=0; initInd<maxIDsToShow; initInd++) {
            //    sepIdPlotData[initInd] = new Array();
            //}
            label0 = "";
            label1 = "";
            label2 = "";
            label3 = "";
            label4 = "";

            // code to support only showing zoom selected in timeseries plot
            var minXPercent = document.getElementById("timeseries_Xmin").value;
            var maxXPercent = document.getElementById("timeseries_Xmax").value;
            
            var minInd = Math.floor(allLatLng.length * parseFloat(minXPercent)/100.);
            var maxInd = Math.floor(allLatLng.length * parseFloat(maxXPercent)/100.);
            
            var startInd = 0;
            var endInd   = allLatLng.length-1;
            if (document.getElementById("timeseries_Xaxisoption").checked) { // for honoring timeseries selection in the scatterplot
                if (minInd >= 0 && minInd < allLatLng.length && minInd < maxInd) {
                    startInd = minInd;
                }
                
                if (maxInd >= 0 && maxInd < allLatLng.length && maxInd > minInd) {
                    endInd   = maxInd;
                }
            }
            
            start_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][startInd]);
            start_UTCTime = start_dateObjectUTC.getTime();
            end_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][endInd]);
            end_UTCTime = end_dateObjectUTC.getTime();

            if (isHourly) {
                xStatsArray   = oStatsHourly;      // default
                yStatsArray   = oStatsHourly;      // default
                xVarIndexPush = xVarIndexHourly;   // index for the variable in the stats array (e.g. n)
                yVarIndexPush = yVarIndexHourly;   // index for the variable in the stats array (e.g. n)
            } else {
                xStatsArray   = oStatsNative;      // default
                yStatsArray   = oStatsNative;      // default
                xVarIndexPush = xVarIndexNative;   // index for the variable in the stats array (e.g. n)
                yVarIndexPush = yVarIndexNative;   // index for the variable in the stats array (e.g. n)
            }
            xIsExternalFlag = false;   // default. Indicates if this is an external variable
            yIsExternalFlag = false;   // default. Indicates if this is an external variable

            
            if (isHourly && xVarIndexHourly >= oStatsHourly.nVars) {
                xIsExternalFlag = true;
                xStatsArray = oStatsHourlyExternal;
                xVarIndexPush = oStatsHourlyExternal.menuItems.indexOf(xVarName); //variable index in the statsExternal array
            }
            if (isHourly && yVarIndexHourly >= oStatsHourly.nVars) {
                yIsExternalFlag = true;
                yStatsArray = oStatsHourlyExternal;
                yVarIndexPush = oStatsHourlyExternal.menuItems.indexOf(yVarName); //variable index in the statsExternal array
            }
            //console.log("plotting");
            //console.log(xStatsArray);
            //console.log("xVarName=", xVarName, "xVarIndexPush=", xVarIndexPush);
            //console.log(yStatsArray);
            //console.log("yVarName=", yVarName, "yVarIndexPush=", yVarIndexPush);

            if (isHourly) {
                for (ind=0; ind<oStatsHourly.nHours; ind++) {                
                    proceed = false;
                    if (oStatsHourly.timestamp[ind] > start_UTCTime && oStatsHourly.timestamp[ind] < end_UTCTime) {
                        proceed = true;
                    }
                    
                    if (proceed) {
                        // handle separate by ID option
                        //if (document.getElementById("scatter_separateByID").checked == true) {
                        //    var thisIDInd = jQuery.inArray(oUserdata.id[selected_block][ind], checked_ids);
                        //    //if (thisIDInd == -1) {
                        //    //    print("Data point was not found in the first " + maxIDsToShow + " checked IDs: " + checked_ids);
                        //    //}
                        //    if ( thisIDInd >= 0) {
                        //        if (thisIDInd == 0) {label0 = oUserdata.id[selected_block][ind];}
                        //        if (thisIDInd == 1) {label1 = oUserdata.id[selected_block][ind];}
                        //        if (thisIDInd == 2) {label2 = oUserdata.id[selected_block][ind];}
                        //        if (thisIDInd == 3) {label3 = oUserdata.id[selected_block][ind];}
                        //        if (thisIDInd == 4) {label4 = oUserdata.id[selected_block][ind];}      
                        //   }
                        //}
                        
                        
                        //if ( (oUserdata.show1[selected_block][get_selected_varselector_index()][ind]) &&
                        //     (oUserdata.show2[selected_block][get_selected_varselector_index()][ind]) ) {
                        
                        
                        
                        //if (xExternalVar == "" && yExternalVar == "") {
                        if (1) {
                            
                            //plotData.push([oStatsHourly.hourAvg[xVarIndex][ind], oStatsHourly.hourAvg[yVarIndex][ind]]);
                            xPush = xStatsArray.hourAvg[xVarIndexPush][ind];
                            yPush = yStatsArray.hourAvg[yVarIndexPush][ind];
                            plotData_xmin = Math.min(...xStatsArray.hourAvg[xVarIndexPush]);
                            plotData_xmax = Math.max(...xStatsArray.hourAvg[xVarIndexPush]);
                            //plotData_ymin = Math.min(...yStatsArray.hourAvg[xVarIndexPush]);
                            //plotData_ymax = Math.max(...yStatsArray.hourAvg[xVarIndexPush]);
                            plotData_ymin = Math.min(...yStatsArray.hourAvg[yVarIndexPush]);
                            plotData_ymax = Math.max(...yStatsArray.hourAvg[yVarIndexPush]);
                            if (xStatsArray.validFlag[ind] && yStatsArray.validFlag[ind]) {
                                plotData.push([xPush, yPush]);
                                //if (xPush != missing_value && xPush < plotData_xmin) {plotData_xmin = xPush;}
                                //if (xPush != missing_value && xPush > plotData_xmax) {plotData_xmax = xPush;}
                                //if (yPush != missing_value && yPush < plotData_ymin) {plotData_ymin = yPush;}
                                //if (yPush != missing_value && yPush > plotData_ymax) {plotData_ymax = yPush;}
                                plotDataInvalid.push([null, null]);
                            } else {
                                plotData.push([null, null]);
                                plotDataInvalid.push([xPush, yPush]);
                            }
                            
                            //if (document.getElementById("scatter_separateByID").checked == true && thisIDInd < maxIDsToShow && thisIDInd >= 0) {
                            //    
                            //    for (tempInd=0; tempInd<maxIDsToShow; tempInd++) {
                            //        if (tempInd == thisIDInd) {
                            //            //sepIdPlotData[tempInd].push([oUserdata.variable[selected_block][xVarIndex][ind], oUserdata.variable[selected_block][yVarIndex][ind]]);
                            //            sepIdPlotData[tempInd].push([oStatsHourly.hourAvg[xVarIndex][ind], oStatsHourly.hourAvg[yVarIndex][ind]]);
                            //            
                            //        } else {
                            //            sepIdPlotData[tempInd].push([null,null]);
                            //        }
                            //    }
                            //}    
                        } else {
                            plotData.push([null, null]);
                            //for (tempInd=0; tempInd<maxIDsToShow; tempInd++) {
                            //    sepIdPlotData[tempInd].push([null,null]);
                            //}
                        }
                        
                    } else {
                        plotData.push([null, null]);
                        plotDataInvalid.push([null, null]);
                    }
                }

            // native
            } else {
                for (tInd=0; tInd<oStatsNative.nTimes; tInd++) {
                    exclude = document.getElementById("excludeFlaggerOption").checked;

                    proceed = false;
                    if (oStatsNative.timestamp[tInd] > start_UTCTime && oStatsNative.timestamp[tInd] < end_UTCTime) {
                        proceed = true;
                    }
                    
                    if (proceed) {
                        xPush = xStatsArray.data[xVarIndexPush][tInd];
                        yPush = yStatsArray.data[yVarIndexPush][tInd];
                        plotData_xmin = Math.min(...xStatsArray.data[xVarIndexPush]);
                        plotData_xmax = Math.max(...xStatsArray.data[xVarIndexPush]);
                        plotData_ymin = Math.min(...yStatsArray.data[yVarIndexPush]);
                        plotData_ymax = Math.max(...yStatsArray.data[yVarIndexPush]);
                        if (xStatsArray.validFlag[tInd] && yStatsArray.validFlag[tInd]) {
                            if ( (! exclude) || (exclude && (! isMsecFlagged(oUserdata.msec[selected_block][tInd])))) {
                                plotData.push([xPush, yPush]);
                                //if (xPush != missing_value && xPush < plotData_xmin) {plotData_xmin = xPush;}
                                //if (xPush != missing_value && xPush > plotData_xmax) {plotData_xmax = xPush;}
                                //if (yPush != missing_value && yPush < plotData_ymin) {plotData_ymin = yPush;}
                                //if (yPush != missing_value && yPush > plotData_ymax) {plotData_ymax = yPush;}
                                plotDataInvalid.push([null, null]);
                            } else {
                                plotData.push([null, null]);
                                plotDataInvalid.push([null, null]);
                            }
                        } else {
                            plotData.push([null, null]);
                            plotDataInvalid.push([xPush, yPush]);
                        }
                    }
                }
            }

            //console.log(plotData);
            
            //this_ymin = oUserdata.mymin[0][get_selected_varselector_index()]
            //this_ymax = oUserdata.mymax[0][get_selected_varselector_index()]
            if (yIsExternalFlag) {
                if (yVarName == "AirNow O3") {
                    this_ymin = oAirnowO3.min;
                    this_ymax = oAirnowO3.max;
                } else if (yVarName == "AirNow PM25") {
                    this_ymin = oAirnowPM25.min;
                    this_ymax = oAirnowPM25.max;
                } else if (yVarName == "AirNow PM10") {
                    this_ymin = oAirnowPM10.min;
                    this_ymax = oAirnowPM10.max;
                } else if (yVarName == "AirNow CO") {
                    this_ymin = oAirnowCO.min;
                    this_ymax = oAirnowCO.max;
                } else if (yVarName == "AirNow NO2") {
                    this_ymin = oAirnowNO2.min;
                    this_ymax = oAirnowNO2.max;
                } else if (yVarName == "AirNow SO2") {
                    this_ymin = oAirnowSO2.min;
                    this_ymax = oAirnowSO2.max;
                } else if (yVarName == "Purpleair PM2.5") {
                    this_ymin = oPurpleairPM25.min;
                    this_ymax = oPurpleairPM25.max;
                } else if (yVarName == "METAR temperature") {
                    this_ymin = oSurfmetTemperature.min;
                    this_ymax = oSurfmetTemperature.max;
                } else if (yVarName == "METAR pressure") {
                    this_ymin = oSurfmetPressure.min;
                    this_ymax = oSurfmetPressure.max;
                } else if (yVarName == "METAR wind speed") {
                    this_ymin = oSurfmetWindSpeed.min;
                    this_ymax = oSurfmetWindSpeed.max;
                } else if (yVarName == "METAR wind direction") {
                    this_ymin = oSurfmetWindDirection.min;
                    this_ymax = oSurfmetWindDirection.max;
                } else if (yVarName == "External Data 1") {
                    this_ymin = mySensorArray[0].min;
                    this_ymax = mySensorArray[0].max;
                } else if (yVarName == "External Data 2") {
                    this_ymin = mySensorArray[1].min;
                    this_ymax = mySensorArray[1].max;
                } else if (yVarName == "External Data 3") {
                    this_ymin = mySensorArray[2].min;
                    this_ymax = mySensorArray[2].max;
                } else if (yVarName == "External Data 4") {
                    this_ymin = mySensorArray[3].min;
                    this_ymax = mySensorArray[3].max;
                } else if (yVarName == "External Data 5") {
                    this_ymin = mySensorArray[4].min;
                    this_ymax = mySensorArray[4].max;
                } else {
                    this_ymin = plotData_ymin;
                    this_ymax = plotData_ymax;
                }
            } else {
                if (isHourly) {
                    this_ymin = oUserdata.mymin[0][yVarIndexHourly]
                    this_ymax = oUserdata.mymax[0][yVarIndexHourly]
                } else {
                    this_ymin = oUserdata.mymin[0][yVarIndexNative]
                    this_ymax = oUserdata.mymax[0][yVarIndexNative]
                }
            }
            if (xIsExternalFlag) {
                //console.log(xVarName);
                if (xVarName == "AirNow O3") {
                    this_xmin = oAirnowO3.min;
                    this_xmax = oAirnowO3.max;
                } else if (xVarName == "AirNow PM2.5") {
                    this_xmin = oAirnowPM25.min;
                    this_xmax = oAirnowPM25.max;
                } else if (xVarName == "AirNow PM10") {
                    this_xmin = oAirnowPM10.min;
                    this_xmax = oAirnowPM10.max;
                } else if (xVarName == "AirNow CO") {
                    this_xmin = oAirnowCO.min;
                    this_xmax = oAirnowCO.max;
                } else if (xVarName == "AirNow NO2") {
                    this_xmin = oAirnowNO2.min;
                    this_xmax = oAirnowNO2.max;
                } else if (xVarName == "AirNow SO2") {
                    this_xmin = oAirnowSO2.min;
                    this_xmax = oAirnowSO2.max;
                } else if (xVarName == "Purpleair PM2.5") {
                    this_xmin = oPurpleairPM25.min;
                    this_xmax = oPurpleairPM25.max;
                } else if (xVarName == "METAR temperature") {
                    this_xmin = oSurfmetTemperature.min;
                    this_xmax = oSurfmetTemperature.max;
                } else if (xVarName == "METAR pressure") {
                    this_xmin = oSurfmetPressure.min;
                    this_xmax = oSurfmetPressure.max;
                } else if (xVarName == "METAR wind speed") {
                    this_xmin = oSurfmetWindSpeed.min;
                    this_xmax = oSurfmetWindSpeed.max;
                } else if (xVarName == "METAR wind direction") {
                    this_xmin = oSurfmetWindDirection.min;
                    this_xmax = oSurfmetWindDirection.max;
                } else if (xVarName == "External Data 1") {
                    this_xmin = mySensorArray[0].min;
                    this_xmax = mySensorArray[0].max;
                } else if (xVarName == "External Data 2") {
                    this_xmin = mySensorArray[1].min;
                    this_xmax = mySensorArray[1].max;
                } else if (xVarName == "External Data 3") {
                    this_xmin = mySensorArray[2].min;
                    this_xmax = mySensorArray[2].max;
                } else if (xVarName == "External Data 4") {
                    this_xmin = mySensorArray[3].min;
                    this_xmax = mySensorArray[3].max;
                } else if (xVarName == "External Data 5") {
                    this_xmin = mySensorArray[4].min;
                    this_xmax = mySensorArray[4].max;
                } else {
                    this_xmin = plotData_xmin;
                    this_xmax = plotData_xmax;
                }
            } else {
                if (isHourly) {
                    this_xmin = oUserdata.mymin[0][xVarIndexHourly]
                    this_xmax = oUserdata.mymax[0][xVarIndexHourly]
                } else {
                    this_xmin = oUserdata.mymin[0][xVarIndexNative]
                    this_xmax = oUserdata.mymax[0][xVarIndexNative]
                }
            }

            //console.log("x min/max:", xVarName, this_xmin, this_xmax);
            //console.log("y min/max:", yVarName, this_ymin, this_ymax);

            if (settings.plotDataColorsFlag == true) {
                for (iii=0; iii<plotData.length; iii++) {
                    //console.log(plotData[iii][1], myYmin, myYmax);
                    plotDataColors.push(colorLookup(plotData[iii][1], this_ymin, this_ymax) + hexOpacityLookup(settings.plotPrimaryOpacity));
                }
            }
            
            //console.log("yVarIndex = ", yVarIndex);
            //diffsum = 0.0;
            //diff2sum = 0.0;
            //for (iii=0; iii<oStatsHourly.diff.length; iii++) {
            //    diffsum += oStatsHourly.diff[yVarIndex][iii];
            //    diff2sum += oStatsHourly.diffSquare[yVarIndex][iii];
            //}
            
            // create regression line
            correlationData = [];
            //if (xExternalVar == "" && yExternalVar == "") {
            if (1) {
                //correlation = computeUserCorrelation(xVarIndex, yVarIndex, xExternalVar, yExternalVar);

                if (isHourly) {
                    correlation = computeUserCorrelation(xVarIndexPush, yVarIndexPush, xVarNameHourly, yVarNameHourly, xIsExternalFlag, yIsExternalFlag);
                    cor         = correlation[0];
                    slope       = correlation[1];
                    yIntercept  = correlation[2];
                } else {
                    computeCovarianceElementsNative();
                    correlation = computeUserCorrelationNative(xVarIndexPush, yVarIndexPush, xVarNameNative, yVarNameNative);
                    cor         = correlation[0];
                    slope       = correlation[1];
                    yIntercept  = correlation[2];
                }

                //console.log("cor=", oStatsHourly.cor);
                //console.log("slope=", oStatsHourly.regression_slope);
                //console.log("yint=", oStatsHourly.regression_yint);
                //console.log("sdevX=", oStatsHourly.sdevX);
                //console.log("sdevY=", oStatsHourly.sdevY);
                //console.log("cov=", oStatsHourly.cov);
                
                //if (document.getElementById('scatter_logoption').checked) {
                if (settings.plotLogAxisFlag == true) {
                    // log plot, generate many points along regression line
                    correlationData = [];
                    cor_nx = 40;
                    corDeltaX = (Number(this_xmax) - Number(this_xmin)) / cor_nx;
                    //correlationData.push([0, yIntercept]);
                    for (ii=0; ii<cor_nx; ii++) {
                        corX = Number(this_xmin) + (ii * corDeltaX);
                        correlationData.push([corX, yIntercept + corX*slope]);
                    }
                } else {
                    // linear plot, just need endpoints
                    //correlationData = [ [0, yIntercept], [this_xmax, yIntercept + this_xmax*slope] ];
                    correlationData = [ [this_xmin, yIntercept + this_xmin*slope], [this_xmax, yIntercept + this_xmax*slope] ];
                }
            }
            
            var sCanvas = $("#scatter_canvas2");

            //fillStyle = document.getElementById("scatter_symbolfill").checked;
            fillStyle = settings.plotFilledSymbolFlag;

            colorData      = settings.plotPrimaryColor   + hexOpacityLookup(settings.plotPrimaryOpacity);
            colorSecondary = settings.plotSecondaryColor + hexOpacityLookup(settings.plotSecondaryOpacity);

            primaryShowLines  = false;
            primaryShowPoints = false;
            if (settings.plotPrimaryStyle.indexOf("Line") >= 0) {
                primaryShowLines = true;
            }
            if (settings.plotPrimaryStyle.indexOf("Points") >= 0) {
                primaryShowPoints = true;
            }

            if (isHourly) {
                document.getElementById("scatterplotTitle").innerHTML = yVarNameHourly + " vs. " + xVarNameHourly;
            } else {
                document.getElementById("scatterplotTitle").innerHTML = yVarNameNative + " vs. " + xVarNameNative;
            }
            
            scatterPlotOptions = { xaxis:{min:this_xmin, max:this_xmax, mode: "null", axisLabel:xTitle, minTickSize: [1], color:"black",transform:mytransform},
				   //yaxis:{min:this_ymin, max:this_ymax, axisLabel:oUserdata.varname[selected_block][get_selected_varselector_index()], color:"black", position:"left",transform:mytransform},
				   yaxis:{min:this_ymin, max:this_ymax, axisLabel:yTitle, color:"black", position:"left", transform:mytransform},
				   selection: {mode:"x"}, legend:{emvlNoBox:true}, grid:{clickable:true}}

            // one variable, NOT separating by ID
            //if (document.getElementById("scatter_separateByID").checked == false) {
            if (1) {
                mylabel = "";

                if (isHourly) {
                    regressionLabel = "r = " + oStatsHourly.cor.toFixed(4).toString() + "<br>" + "y-int = " + oStatsHourly.regression_yint.toFixed(4).toString() + "<br>" + "slope = " + oStatsHourly.regression_slope.toFixed(4).toString() + "<br>" + "rmsError = " + oStatsHourly.rmsError.toFixed(4).toString();

                } else {
                    regressionLabel = "r = " + oStatsNative.cor.toFixed(4).toString() + "<br>" + "y-int = " + oStatsNative.regression_yint.toFixed(4).toString() + "<br>" + "slope = " + oStatsNative.regression_slope.toFixed(4).toString() + "<br>" + "rmsError = " + oStatsNative.rmsError.toFixed(4).toString();
                }

                    
	        scatterPlot = $.plot(sCanvas, 
				     [{highlightColor:"black", label:mylabel, data:plotData, color:colorData, lines:{show:primaryShowLines}, points:{show:primaryShowPoints, symbol:"circle", fill:fillStyle, fillColor:colorData}, colors:plotDataColors, colorByDataFlag:settings.plotDataColorsFlag},
                                      {highlightColor:"black", label:mylabel, data:plotDataInvalid, color:"rgb(100,100,100)", lines:{show:primaryShowLines}, points:{show:primaryShowPoints, symbol:"cross", fill:fillStyle, fillColor:"rgb(100,100,100)"}, colors:"rgb(100,100,100)", colorByDataFlag:settings.plotDataColorsFlag},
                                      {highlightColor:"black", label:regressionLabel, data:correlationData, color:"rgb(255,0,0)", lines:{show:true}, points:{show:true, symbol:"circle"}},


                                     ],
				     scatterPlotOptions);

//                $("#scatter_canvas2").unbind("plotclick").one("plotclick", function (event, pos, item) {
//                    //alert("You clicked at " + pos.x + ", " + pos.y);
//                    // axis coordinates for other axes, if present, are in pos.x2, pos.x3, ...
//                    // if you need global screen coordinates, they are pos.pageX, pos.pageY
//
//                    if (item) {
//                        //highlight(item.series, item.datapoint);
//                        //console.log("before", oStatsHourly.validFlag[item.dataIndex], item.dataIndex);
//                        oStatsHourly.validFlag[item.dataIndex] = !(oStatsHourly.validFlag[item.dataIndex]);
//                        //oStatsHourly.validFlag[item.dataIndex] = false;
//                        //console.log("after", oStatsHourly.validFlag[item.dataIndex], item.dataIndex);
//                    } else {
//                        //console.log("no item found");
//                    }
//                    
//                    setTimeout("update_scatterPlot();",0);
//
//                });
                

	    } else {
            //    // one variable, separating by ID    
            //    color0 = "rgb( 51,  51, 255)";
	    //    color1 = "rgb( 51, 255, 255)";
	    //    color2 = "rgb( 51, 153, 255)";
	    //    color3 = "rgb( 51, 255, 51)";
	    //    color4 = "rgb(153,  51, 255)";
            //    scatterPlot = $.plot(sCanvas, 
		//[{highlightColor:"black", label:label0, data:sepIdPlotData[0], color:color0, points:{show:true, symbol:"circle", fill:fillStyle, fillColor:"rgb(102, 178, 255)"}},
	        //                      {highlightColor:"black", label:label1, data:sepIdPlotData[1], color:color1, points:{show:true, symbol:"cross", fill:fillStyle, fillColor:"rgb(102, 178, 255)"}},
	        //                      {highlightColor:"black", label:label2, data:sepIdPlotData[2], color:color2, points:{show:true, symbol:"diamond", fill:fillStyle, fillColor:"rgb(102, 178, 255)"}},
	        //                      {highlightColor:"black", label:label3, data:sepIdPlotData[3], color:color3, points:{show:true, symbol:"triangle", fill:fillStyle, fillColor:"rgb(102, 178, 255)"}},
	        //                      {highlightColor:"black", label:label4, data:sepIdPlotData[4], color:color4, points:{show:true, symbol:"square", fill:fillStyle, fillColor:"rgb(102, 178, 255)"}},
                //                      {highlightColor:"black", label:'regression', data:correlationData, color:"rgb(255,0,0)", lines:{show:true}, points:{show:true, symbol:"circle"}}],
		//		     scatterPlotOptions);
                
            }

            update_scatterPlotHighlight(lastpos);
            
        } catch (err) {
            console.log(err);
        }   
    }
}




  function isPM25(thisVar) {
      // is this variable PM 2.5?
      return_val = false; // default
      if ( (thisVar.toLowerCase().localeCompare('pm2.5(ug/m3)')  == 0) ||
	   (thisVar.toLowerCase().localeCompare('pm2.5(ug/m^3)') == 0)    ) {
	  return_val = true;
      }

      return return_val;
  }

  function isPM10(thisVar) {
      // is this variable PM 10?
      return_val = false; // default
      if ( (thisVar.toLowerCase().localeCompare('pm10(ug/m3)')  == 0) ||
	   (thisVar.toLowerCase().localeCompare('pm10(ug/m^3)') == 0)    ) {
	  return_val = true;
      }

      return return_val;
  }

  function isOzone(thisVar) {
      // is this variable Ozone?
      return_val = false; // default
      if ( (thisVar.toLowerCase().localeCompare('ozone(ppb)')  == 0) ||
	   (thisVar.toLowerCase().localeCompare('o3(ppb)')     == 0)    ) {
	  return_val = true;
      }

      return return_val;
  }


function showDataFlaggerInfo() {
     openEmvlDialog("dialog-dataFlagger");
}



function processFlaggerCheckboxes() {

    runFlagger();
    updatePlots();

}


function isMsecFlagged(myMsec) {
    if ( (oUserdata.flagged_constant_msec.indexOf(myMsec) < 0)       &&
         (oUserdata.flagged_longMissing_msec.indexOf(myMsec) < 0)    &&
         (oUserdata.flagged_outlierStat_msec.indexOf(myMsec) < 0)    &&
         (oUserdata.flagged_outlierSpike_msec.indexOf(myMsec) < 0)   &&
         (oUserdata.flagged_aboveConc_msec.indexOf(myMsec) < 0)      &&
         (oUserdata.flagged_belowConc_msec.indexOf(myMsec) < 0)      &&
         (oUserdata.flagged_userInvalidated_msec.indexOf(myMsec) < 0) ) {
        return false;
    } else {
        return true;
    }
}
      
function runFlagger() {
    
    //oUserdata.flagger = {nSites    : 1,
    //                     nTimes    : plotData.length,
    //                     id        : new Array(plotData.length).fill(1),
    //                     variable  : plotData.map(row => row[1]),
    //                     msec      : plotData.map(row => row[0]),
    //                     timestamp : plotDataTimestamp
    //                    }


    // checkboxen
    doConstantNum            = document.getElementById("chkConstantNum").checked;
    doMissingNum             = document.getElementById("chkMissingNum").checked;
    doOutlierStatSDfactor    = document.getElementById("chkOutlierStatSDfactor").checked;
    //doOutlierSpikeTimeWindow = document.getElementById("chkOutlierSpikeTimeWindow").checked;
    doOutlierSpikeSDfactor   = document.getElementById("chkOutlierSpikeSDfactor").checked;
    doAboveConcentration     = document.getElementById("chkAboveConcentration").checked;
    doBelowConcentration     = document.getElementById("chkBelowConcentration").checked;
    doUserInvalidate         = document.getElementById("chkUserInvalidate").checked;
    
    if (document.getElementById('runFlaggerOption').checked == true) {
        document.getElementById('flaggerLegendDiv').style.visibility = 'visible';
        thisData      = oUserdata.variable[selected_block][get_selected_varselector_index()];
        thisMsec      = oUserdata.msec[selected_block];
        thisTimestamp = oUserdata.timestamp[selected_block];
        
        oUserdata.flagger = {nSites    : 1,
                             nTimes    : thisData.length,
                             id        : new Array(thisData.length).fill(1),
                             variable  : thisData,
                             msec      : thisMsec,
                             timestamp : thisTimestamp
                            }
        
        oUserdata.flaggedIndices = dataFlagger(oUserdata.flagger,          
                                               1,                          
                                               doConstantNum,              
                                               doMissingNum,               
                                               doOutlierStatSDfactor,      
                                               //doOutlierSpikeTimeWindow,   
                                               doOutlierSpikeSDfactor,     
                                               doAboveConcentration,       
                                               doBelowConcentration,
                                               doUserInvalidate)

        if (oUserdata.flaggedIndices.constant != undefined) {
            oUserdata.flagged_constant_msec        = oUserdata.flaggedIndices.constant.map(d => d[3]);
        }
        if (oUserdata.flaggedIndices.longMissing != undefined) {
            oUserdata.flagged_longMissing_msec     = oUserdata.flaggedIndices.longMissing.map(d => d[3]);
        }
        if (oUserdata.flaggedIndices.outlierStat != undefined) {
            oUserdata.flagged_outlierStat_msec     = oUserdata.flaggedIndices.outlierStat.map(d => d[3]);
        }
        if (oUserdata.flaggedIndices.outlierSpike != undefined) {
            oUserdata.flagged_outlierSpike_msec    = oUserdata.flaggedIndices.outlierSpike.map(d => d[3]);
        }
        if (oUserdata.flaggedIndices.aboveConc != undefined) {
            oUserdata.flagged_aboveConc_msec       = oUserdata.flaggedIndices.aboveConc.map(d => d[3]);
        }
        if (oUserdata.flaggedIndices.belowConc != undefined) {
            oUserdata.flagged_belowConc_msec       = oUserdata.flaggedIndices.belowConc.map(d => d[3]); 
        }
        if (oUserdata.flaggedIndices.userInvalidated != undefined) {
            oUserdata.flagged_userInvalidated_msec = oUserdata.flaggedIndices.userInvalidated.map(d => d[3]);
        }
        
    } else {
        document.getElementById('flaggerLegendDiv').style.visibility = 'hidden';
        oUserdata.flagger = "";
        oUserdata.flaggedIndices = "";
        oUserdata.flagged_constant_msec        = []; 
        oUserdata.flagged_longMissing_msec     = []; 
        oUserdata.flagged_outlierStat_msec     = []; 
        oUserdata.flagged_outlierSpike_msec    = []; 
        oUserdata.flagged_aboveConc_msec       = []; 
        oUserdata.flagged_belowConc_msec       = []; 
        oUserdata.flagged_userInvalidated_msec = []; 
    }
}


function updatePlots() {
    setTimeout("computeGoogleLatLng(oUserdata, false);", 100);
    update_timeseriesPlot();
    update_analysisPlot();
    update_scatterPlot();
    update_windrosePlot();
}

function update_timeseriesPlot() {
    if ( document.getElementById('timeseriesPlotOptionButton').checked == true ) {
        try {

            //if (document.getElementById('runFlaggerOption').checked == true) {
                runFlagger();
            //}
            
            var plotDataAQS;
            var labelAqsPm25 = "";
            var labelAqsPm10 = "";
            var labelAQS = "";
            var yMinAQS;
            var yMaxAQS;
            
            var plotDataSurfmet;
            var labelSurfmetTemperature = "";
            var labelSurfmet = "";
            var yMinSurfmet;
            var yMaxSurfmet;
            
            var plotDataPurpleair;

            var labelPurpleairPM25 = "";
            var labelPurpleair = "";
            var yMinPurpleair;
            var yMaxPurpleair;

            var plotDataMySensor;
            var labelMySensor = "";
            var labelMySensor = "";
            var yMinMySensor;
            var yMaxMySensor;
            
            var plotDataAqsPm25 = [];
            var plotDataAqsPm25 = new Array();
            if (plotFlagAqsPm25) {
	        //if (isPM25(oUserdata.varname[selected_block][get_selected_varselector_index()])) {
	        if (oAirnowPM25.closestTimestamp) {
                    hour_shift = -1 // to align airnow timestamps (beg of hour) with retigo timestamps (end of hour)
	            labelAqsPm25 = "AirNow PM<sub>2.5</sub> (ug/m<sup>3</sup>)";
	            labelAQS = labelAqsPm25;
	            yMinAQS = oAirnowPM25.min;
	            yMaxAQS = oAirnowPM25.max;
	            //document.getElementById("merge_min").value = oAirnowPM25.min;
	            //document.getElementById("merge_max").value = oAirnowPM25.max;
	            //console.log(oAirnowPM25.closestVariable);
	            for (ind=0; ind<oAirnowPM25.closestTimestamp.length; ind++) {
		        AqsPm25_dateObjectUTC = create_dateObjectUTC(oAirnowPM25.closestTimestamp[ind]);
		        AqsPm25_UTCTime = AqsPm25_dateObjectUTC.getTime();
		        AqsPm25_Time = Number(convertUTC_to_timezone(AqsPm25_dateObjectUTC, selected_timezone, "milliseconds", "null", hour_shift));
		        //console.log(AqsPm25_Time);
		        plotDataAqsPm25.push([AqsPm25_Time, oAirnowPM25.closestVariable[ind]]); 
		        
	            }
	            plotDataAQS = plotDataAqsPm25;
                    
	        } else {
	            //print("No matching AQS PM.25 variable found. Variable must be PM2.5(ug/m3).");
	        }
            }

            var plotDataAqsPm10 = [];
            var plotDataAqsPm10 = new Array();
            if (plotFlagAqsPm10) {
	        //if (isPM10(oUserdata.varname[selected_block][get_selected_varselector_index()])) {
	        if (oAirnowPM10.closestTimestamp) {
                    hour_shift = -1 // to align airnow timestamps (beg of hour) with retigo timestamps (end of hour)
	            labelAqsPm10 = "AirNow PM<sub>10</sub> (ug/m<sup>3</sup>)";
	            labelAQS = labelAqsPm10;
	            yMinAQS = oAirnowPM10.min;
	            yMaxAQS = oAirnowPM10.max;
	            //document.getElementById("merge_min").value = oAirnowPM10.min;
	            //document.getElementById("merge_max").value = oAirnowPM10.max;
	            //console.log(oAirnowPM10.closestVariable);
	            for (ind=0; ind<oAirnowPM10.closestTimestamp.length; ind++) {
		        AqsPm10_dateObjectUTC = create_dateObjectUTC(oAirnowPM10.closestTimestamp[ind]);
		        AqsPm10_UTCTime = AqsPm10_dateObjectUTC.getTime();
		        AqsPm10_Time = Number(convertUTC_to_timezone(AqsPm10_dateObjectUTC, selected_timezone, "milliseconds", "null", hour_shift));
		        //console.log(AqsPm10_Time);
		        plotDataAqsPm10.push([AqsPm10_Time, oAirnowPM10.closestVariable[ind]]); 
		        
	            }
	            plotDataAQS = plotDataAqsPm10;
                    
	        } else {
	            //print("No matching AQS PM10 variable found. Variable must be PM2.5(ug/m3).");
	        }
            }           
            
            
            var plotDataAqsOzone = [];
            var plotDataAqsOzone = new Array();
            var labelAqsOzone = "";
            if (plotFlagAqsOzone) {
	        //if (isOzone(oUserdata.varname[selected_block][get_selected_varselector_index()])) {
	        if (oAirnowOzone.closestTimestamp) {
                    hour_shift = -1 // to align airnow timestamps (beg of hour) with retigo timestamps (end of hour)
	            labelAqsOzone = "AirNow O<sub>3</sub> (ppb)";
	            labelAQS = labelAqsOzone;
	            yMinAQS = oAirnowOzone.min;
	            yMaxAQS = oAirnowOzone.max;
	            //document.getElementById("merge_min").value = oAirnowOzone.min;
	            //document.getElementById("merge_max").value = oAirnowOzone.max;
	            for (ind=0; ind<oAirnowOzone.closestTimestamp.length; ind++) {
		        AqsOzone_dateObjectUTC = create_dateObjectUTC(oAirnowOzone.closestTimestamp[ind]);
		        AqsOzone_UTCTime = AqsOzone_dateObjectUTC.getTime();
		        AqsOzone_Time = Number(convertUTC_to_timezone(AqsOzone_dateObjectUTC, selected_timezone, "milliseconds", "null", hour_shift));
		        plotDataAqsOzone.push([AqsOzone_Time, oAirnowOzone.closestVariable[ind]]); 
		        
	            }
	            plotDataAQS = plotDataAqsOzone;
                    
	        } else {
	            //print("No matching AQS Ozone variable found. Variable must be Ozone(ppb).");
	        }
            }
            
            var plotDataAqsCO = [];
            var plotDataAqsCO = new Array();
            var labelAqsCO = "";
            if (plotFlagAqsCO) {
	        if (oAirnowCO.closestTimestamp) {
                    hour_shift = -1 // to align airnow timestamps (beg of hour) with retigo timestamps (end of hour)
	            labelAqsCO = "AirNow CO (ppm)";
	            labelAQS = labelAqsCO;
	            yMinAQS = oAirnowCO.min;
	            yMaxAQS = oAirnowCO.max;
	            //document.getElementById("merge_min").value = oAirnowCO.min;
	            //document.getElementById("merge_max").value = oAirnowCO.max;
	            for (ind=0; ind<oAirnowCO.closestTimestamp.length; ind++) {
		        AqsCO_dateObjectUTC = create_dateObjectUTC(oAirnowCO.closestTimestamp[ind]);
		        AqsCO_UTCTime = AqsCO_dateObjectUTC.getTime();
		        AqsCO_Time = Number(convertUTC_to_timezone(AqsCO_dateObjectUTC, selected_timezone, "milliseconds", "null", hour_shift));
		        plotDataAqsCO.push([AqsCO_Time, oAirnowCO.closestVariable[ind]]); 
		        
	            }
	            plotDataAQS = plotDataAqsCO;
                    
	        } else {
	            //print("No matching AQS CO variable found. Variable must be CO(ppb).");
	        }
            }
            
            var plotDataAqsNO2 = [];
            var plotDataAqsNO2 = new Array();
            var labelAqsNO2 = "";
            if (plotFlagAqsNO2) {
	        if (oAirnowNO2.closestTimestamp) {
                    hour_shift = -1 // to align airnow timestamps (beg of hour) with retigo timestamps (end of hour)
	            labelAqsNO2 = "AirNow NO<sub>2</sub> (ppb)";
	            labelAQS = labelAqsNO2;
	            yMinAQS = oAirnowNO2.min;
	            yMaxAQS = oAirnowNO2.max;
	            //document.getElementById("merge_min").value = oAirnowNO2.min;
	            //document.getElementById("merge_max").value = oAirnowNO2.max;
	            for (ind=0; ind<oAirnowNO2.closestTimestamp.length; ind++) {
		        AqsNO2_dateObjectUTC = create_dateObjectUTC(oAirnowNO2.closestTimestamp[ind]);
		        AqsNO2_UTCTime = AqsNO2_dateObjectUTC.getTime();
		        AqsNO2_Time = Number(convertUTC_to_timezone(AqsNO2_dateObjectUTC, selected_timezone, "milliseconds", "null", hour_shift));
		        plotDataAqsNO2.push([AqsNO2_Time, oAirnowNO2.closestVariable[ind]]); 
		        
	            }
	            plotDataAQS = plotDataAqsNO2;
                    
	        } else {
	            //print("No matching AQS NO2 variable found. Variable must be NO2(ppb).");
	        }
            }
            
            var plotDataAqsSO2 = [];
            var plotDataAqsSO2 = new Array();
            var labelAqsSO2 = "";
            if (plotFlagAqsSO2) {
	        if (oAirnowSO2.closestTimestamp) {
                    hour_shift = -1 // to align airnow timestamps (beg of hour) with retigo timestamps (end of hour)
	            labelAqsSO2 = "AirNow SO<sub>2</sub> (ppb)";
	            labelAQS = labelAqsSO2;
	            yMinAQS = oAirnowSO2.min;
	            yMaxAQS = oAirnowSO2.max;
	            //document.getElementById("merge_min").value = oAirnowSO2.min;
	            //document.getElementById("merge_max").value = oAirnowSO2.max;
	            for (ind=0; ind<oAirnowSO2.closestTimestamp.length; ind++) {
		        AqsSO2_dateObjectUTC = create_dateObjectUTC(oAirnowSO2.closestTimestamp[ind]);
		        AqsSO2_UTCTime = AqsSO2_dateObjectUTC.getTime();
		        AqsSO2_Time = Number(convertUTC_to_timezone(AqsSO2_dateObjectUTC, selected_timezone, "milliseconds", "null", hour_shift));
		        plotDataAqsSO2.push([AqsSO2_Time, oAirnowSO2.closestVariable[ind]]); 
		        
	            }
	            plotDataAQS = plotDataAqsSO2;
                    
	        } else {
	            //print("No matching AQS SO2 variable found. Variable must be SO2(ppb).");
	        }
            }
	    
            
            var plotDataSurfmetTemperature = [];
            var plotDataSurfmetTemperature = new Array();
            var labelSurfmetTemperature = "";
            if (plotFlagSurfmetTemperature) {
	        if (oSurfmetTemperature.closestTimestamp) {
                    hour_shift = -0.75 // to align airnow metar timestamps with retigo timestamps at end of hour
	            labelSurfmetTemperature = "METAR Temperature (C)";
	            labelSurfmet = labelSurfmetTemperature;
	            yMinSurfmet = oSurfmetTemperature.min;
	            yMaxSurfmet = oSurfmetTemperature.max;
	            //document.getElementById("merge_min").value = oSurfmetTemperature.min;
	            //document.getElementById("merge_max").value = oSurfmetTemperature.max;
	            for (ind=0; ind<oSurfmetTemperature.closestTimestamp.length; ind++) {
		        SurfmetTemperature_dateObjectUTC = create_dateObjectUTC(oSurfmetTemperature.closestTimestamp[ind]);
		        SurfmetTemperature_UTCTime = SurfmetTemperature_dateObjectUTC.getTime();
		        SurfmetTemperature_Time = Number(convertUTC_to_timezone(SurfmetTemperature_dateObjectUTC, selected_timezone, "milliseconds", "null", hour_shift));
		        plotDataSurfmetTemperature.push([SurfmetTemperature_Time, oSurfmetTemperature.closestVariable[ind]]); 
		        
	            }
	            plotDataSurfmet = plotDataSurfmetTemperature;
                    
	        } else {
	            // do nothing
	        }
            }
            
            var plotDataSurfmetPressure = [];
            var plotDataSurfmetPressure = new Array();
            var labelSurfmetPressure = "";
            if (plotFlagSurfmetPressure) {
	        if (oSurfmetPressure.closestTimestamp) {
                    hour_shift = -0.75 // to align airnow metar timestamps with retigo timestamps at end of hour
	            labelSurfmetPressure = "METAR Pressure (hPa)";
	            labelSurfmet = labelSurfmetPressure;
	            yMinSurfmet = oSurfmetPressure.min;
	            yMaxSurfmet = oSurfmetPressure.max;
	            //document.getElementById("merge_min").value = oSurfmetPressure.min;
	            //document.getElementById("merge_max").value = oSurfmetPressure.max;
	            for (ind=0; ind<oSurfmetPressure.closestTimestamp.length; ind++) {
		        SurfmetPressure_dateObjectUTC = create_dateObjectUTC(oSurfmetPressure.closestTimestamp[ind]);
		        SurfmetPressure_UTCTime = SurfmetPressure_dateObjectUTC.getTime();
		        SurfmetPressure_Time = Number(convertUTC_to_timezone(SurfmetPressure_dateObjectUTC, selected_timezone, "milliseconds", "null", hour_shift));
		        plotDataSurfmetPressure.push([SurfmetPressure_Time, oSurfmetPressure.closestVariable[ind]]); 
	            }
	            plotDataSurfmet = plotDataSurfmetPressure;
                    
	        } else {
	            // do nothing
	        }
            }
	    
            var plotDataSurfmetWindSpeed = [];
            var plotDataSurfmetWindSpeed = new Array();
            var labelSurfmetWindSpeed = "";
            if (plotFlagSurfmetWindSpeed) {
	        if (oSurfmetWindSpeed.closestTimestamp) {
                    hour_shift = -0.75 // to align airnow metar timestamps with retigo timestamps at end of hour
	            labelSurfmetWindSpeed = "METAR WindSpeed (m/s)";
	            labelSurfmet = labelSurfmetWindSpeed;
	            yMinSurfmet = oSurfmetWindSpeed.min;
	            yMaxSurfmet = oSurfmetWindSpeed.max;
	            //document.getElementById("merge_min").value = oSurfmetWindSpeed.min;
	            //document.getElementById("merge_max").value = oSurfmetWindSpeed.max;
	            for (ind=0; ind<oSurfmetWindSpeed.closestTimestamp.length; ind++) {
		        SurfmetWindSpeed_dateObjectUTC = create_dateObjectUTC(oSurfmetWindSpeed.closestTimestamp[ind]);
		        SurfmetWindSpeed_UTCTime = SurfmetWindSpeed_dateObjectUTC.getTime();
		        SurfmetWindSpeed_Time = Number(convertUTC_to_timezone(SurfmetWindSpeed_dateObjectUTC, selected_timezone, "milliseconds", "null", hour_shift));
		        plotDataSurfmetWindSpeed.push([SurfmetWindSpeed_Time, oSurfmetWindSpeed.closestVariable[ind]]); 
		        
	            }
	            plotDataSurfmet = plotDataSurfmetWindSpeed;
                    
	        } else {
	            // do nothing
	        }
            }

            var plotDataSurfmetWindDirection = [];
            var plotDataSurfmetWindDirection = new Array();
            var labelSurfmetWindDirection = "";
            if (plotFlagSurfmetWindDirection) {
	        if (oSurfmetWindDirection.closestTimestamp) {
                    hour_shift = -0.75 // to align airnow metar timestamps with retigo timestamps at end of hour
	            labelSurfmetWindDirection = "METAR Wind Direction (deg)";
	            labelSurfmet = labelSurfmetWindDirection;
	            yMinSurfmet = oSurfmetWindDirection.min;
	            yMaxSurfmet = oSurfmetWindDirection.max;
	            //document.getElementById("merge_min").value = oSurfmetWindDirection.min;
	            //document.getElementById("merge_max").value = oSurfmetWindDirection.max;
	            for (ind=0; ind<oSurfmetWindDirection.closestTimestamp.length; ind++) {
		        SurfmetWindDirection_dateObjectUTC = create_dateObjectUTC(oSurfmetWindDirection.closestTimestamp[ind]);
		        SurfmetWindDirection_UTCTime = SurfmetWindDirection_dateObjectUTC.getTime();
		        SurfmetWindDirection_Time = Number(convertUTC_to_timezone(SurfmetWindDirection_dateObjectUTC, selected_timezone, "milliseconds", "null", hour_shift));
		        plotDataSurfmetWindDirection.push([SurfmetWindDirection_Time, oSurfmetWindDirection.closestVariable[ind]]); 
		        
	            }
	            plotDataSurfmet = plotDataSurfmetWindDirection;
                    
	        } else {
	            // do nothing
	        }
            }
            
            var plotDataPurpleairPM25 = [];
            var plotDataPurpleairPM25 = new Array();
            var labelPurpleairPM25 = "";
            if (plotFlagPurpleairPM25) {
	        if (oPurpleairPM25.closestTimestamp) {
                    hour_shift = -1.0 // to align airnow metar timestamps with retigo timestamps at end of hour
	            labelPurpleairPM25 = "Purpleair PM2.5 (ug/m3)";
	            labelPurpleair = labelPurpleairPM25;
	            yMinPurpleair = oPurpleairPM25.min;
	            yMaxPurpleair = oPurpleairPM25.max;
	            //document.getElementById("merge_min").value = oPurpleairPM25.min;
	            //document.getElementById("merge_max").value = oPurpleairPM25.max;
	            for (ind=0; ind<oPurpleairPM25.closestTimestamp.length; ind++) {
		        PurpleairPM25_dateObjectUTC = create_dateObjectUTC(oPurpleairPM25.closestTimestamp[ind]);
		        PurpleairPM25_UTCTime = PurpleairPM25_dateObjectUTC.getTime();
		        PurpleairPM25_Time = Number(convertUTC_to_timezone(PurpleairPM25_dateObjectUTC, selected_timezone, "milliseconds", "null", hour_shift));
		        plotDataPurpleairPM25.push([PurpleairPM25_Time, oPurpleairPM25.closestVariable[ind]]); 
		        
	            }
	            plotDataPurpleair = plotDataPurpleairPM25;
                    
	        } else {
	            // do nothing
	        }
            }

            var plotDataMySensor = [];
            var plotDataMySensor = new Array();
            var labelMySensor = "";
            plotMySensor = false;
            if (mySensorArray[0].plotFlag) { sensorInd = 0; plotMySensor = true; }
            if (mySensorArray[1].plotFlag) { sensorInd = 1; plotMySensor = true; }
            if (mySensorArray[2].plotFlag) { sensorInd = 2; plotMySensor = true; }
            if (mySensorArray[3].plotFlag) { sensorInd = 3; plotMySensor = true; }
            if (mySensorArray[4].plotFlag) { sensorInd = 4; plotMySensor = true; }
            if (plotMySensor) {
	        if (mySensorArray[sensorInd].closestTimestamp) {
                    hour_shift = 0.0 // to align mysensor timestamps with retigo timestamps at end of hour
	            labelMySensor = "Ext. Data " + (sensorInd+1) + " " + mySensorArray[sensorInd].curVarname; // sensorInd+1 because mysesnor labels are one-based
	            yMinMySensor = mySensorArray[sensorInd].min;
	            yMaxMySensor = mySensorArray[sensorInd].max;
	            for (ind=0; ind<mySensorArray[sensorInd].closestTimestamp.length; ind++) {
		        MySensor_dateObjectUTC = create_dateObjectUTC(mySensorArray[sensorInd].closestTimestamp[ind]);
		        MySensor_UTCTime = MySensor_dateObjectUTC.getTime();
		        MySensor_Time = Number(convertUTC_to_timezone(MySensor_dateObjectUTC, selected_timezone, "milliseconds", "null", hour_shift));
		        plotDataMySensor.push([MySensor_Time, mySensorArray[sensorInd].closestVariable[ind]]); 
		        
	            }
	            //plotDataMySensor = plotDataMySensor;
                    
	        } else {
	            // do nothing
	        }
            }
            
            var plotData          = [];
            var plotData          = new Array();
            var plotDataColors    = [];          // needed if coloring by data value
            var plotDataColors    = new Array(); // needed if coloring by data value
            var plotDataTimestamp = [];          // needed by dataFlagger

            var plotDataMin = 100000000000; // default;
            var myXmin      =  100000000000000; // default;
            var myXmax      = -100000000000000; // default;
            var myXmin2     =  100000000000000; // default;
            var myXmax2     = -100000000000000; // default;
            
            var plotData2 = [];
            var plotData2 = new Array();
	    
            var this_dateObjectUTC = 0;
            var this_UTCTime; // in milliseconds since Jan 1, 1970
            var this_Time; // corrected to selected timezone

            // flagged indices (msec) from the data flagger
            //flagged_constant_msec        = [];
            //flagged_longMissing_msec     = [];
            //flagged_outlierStat_msec     = [];
            //flagged_outlierSpike_msec    = [];
            //flagged_aboveConc_msec       = [];
            //flagged_belowConc_msec       = [];
            //flagged_userInvalidated_msec = [];
            //if (document.getElementById("excludeFlaggerOption").checked) {
            //    if (oUserdata.flaggedIndices.constant != undefined) {
            //        flagged_constant_msec        = oUserdata.flaggedIndices.constant.map(d => d[3]);
            //    }
            //    if (oUserdata.flaggedIndices.longMissing != undefined) {
            //        flagged_longMissing_msec     = oUserdata.flaggedIndices.longMissing.map(d => d[3]);
            //    }
            //    if (oUserdata.flaggedIndices.outlierStat != undefined) {
            //        flagged_outlierStat_msec     = oUserdata.flaggedIndices.outlierStat.map(d => d[3]);
            //    }
            //    if (oUserdata.flaggedIndices.outlierSpike != undefined) {
            //        flagged_outlierSpike_msec    = oUserdata.flaggedIndices.outlierSpike.map(d => d[3]);
            //    }
            //    if (oUserdata.flaggedIndices.aboveConc != undefined) {
            //        flagged_aboveConc_msec       = oUserdata.flaggedIndices.aboveConc.map(d => d[3]);
            //    }
            //    if (oUserdata.flaggedIndices.belowConc != undefined) {
            //        flagged_belowConc_msec       = oUserdata.flaggedIndices.belowConc.map(d => d[3]); 
            //    }
            //    if (oUserdata.flaggedIndices.userInvalidated != undefined) {
            //        flagged_userInvalidated_msec = oUserdata.flaggedIndices.userInvalidated.map(d => d[3]);
            //    }
            //}
            
            var secondVarIndex;
            if (plotFlagAqsOzone || plotFlagAqsPm25 || plotFlagAqsPm10 || plotFlagAqsCO || plotFlagAqsNO2 || plotFlagAqsSO2) {
	        secondVarIndex = -1;
            } else if (plotFlagSurfmetTemperature || plotFlagSurfmetPressure || plotFlagSurfmetWindSpeed || plotFlagSurfmetWindDirection) {
	        secondVarIndex = -2;
            } else if (plotFlagPurpleairPM25) {
	        secondVarIndex = -3;
            } else if (plotMySensor) {
	        secondVarIndex = -4;
            } else {
	        secondVarIndex = document.getElementById("timeseries_secondVar").selectedIndex;
            }
            
            var minXPercent = document.getElementById("timeseries_Xmin").value;
            var maxXPercent = document.getElementById("timeseries_Xmax").value;
            
            var minInd = Math.floor(allLatLng.length * parseFloat(minXPercent)/100.);
            var maxInd = Math.floor(allLatLng.length * parseFloat(maxXPercent)/100.);
            
            var startInd = 0;
            //var endInd   = allLatLng.length-1;
            var endInd   = oUserdata.timestamp[selected_block].length-1;
            if (document.getElementById("timeseries_Xaxisoption").checked) {
                //if (minInd >= 0 && minInd < allLatLng.length && minInd < maxInd) {
                if (minInd >= 0 && minInd < oUserdata.timestamp[selected_block].length && minInd < maxInd) {
                    startInd = minInd;
                }
                
                //if (maxInd >= 0 && maxInd < allLatLng.length && maxInd > minInd) {
                if (maxInd >= 0 && maxInd < oUserdata.timestamp[selected_block].length && maxInd > minInd) {
                    endInd   = maxInd;
                }
            }
            
            
            if (document.getElementById("timeseries_separateByID").checked == true) {
                // build list of up to "maxIDsToShow" selected IDs to show
                var maxIDsToShow = 5; // labels are hardcoded below, so don't increase
                var idCount = 0;
                var checked_ids = [];
                var sepIdPlotData = [];
                sepIdPlotData = new Array(maxIDsToShow);
                var checkbox_list = document.getElementsByName("id_checkboxes");
                for (var listInd=0; listInd<checkbox_list.length; listInd++){ 
                    this_id_checked = checkbox_list[listInd].checked; 
                    if (this_id_checked && idCount < maxIDsToShow) {			  
                        checked_ids.push(checkbox_list[listInd].value);
                        idCount += 1; 			  
                    }
                }
            }
            
            for (initInd=0; initInd<maxIDsToShow; initInd++) {
                sepIdPlotData[initInd] = new Array();
            }
            label0 = "";
            label1 = "";
            label2 = "";
            label3 = "";
            label4 = "";
            
            hourlyOption = document.getElementById("timeseriesHourlyOption").checked;
            //console.log(startInd, endInd, oUserdata.timestamp[selected_block][startInd], oUserdata.timestamp[selected_block]);
            //console.log(oUserdata.timestamp[selected_block]);
            start_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][startInd]);
            start_UTCTime = start_dateObjectUTC.getTime();
            timeseriesPlotMsecStart = start_UTCTime; // for use in other functions (e.g. computeGoogleLatLng)
            end_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][endInd]);
            end_UTCTime = end_dateObjectUTC.getTime();
            timeseriesPlotMsecEnd = end_UTCTime;  // for use in other functions (e.g. computeGoogleLatLng)
            yVarIndex = get_selected_varselector_index();
            yStatsArray = oStatsHourly;      // default
            yVarIndexPush = yVarIndex; // index for the variable in the stats array (e.g. n)
            yIsExternalFlag = false;   // default. Indicates if this is an external variable

            yAxisLabel = oUserdata.varname[selected_block][get_selected_varselector_index()]; // default. 'Hourly' will be prepended if necessary below
            if (hourlyOption) {
                // for plotting hourly averaged data
                yAxisLabel = 'Hourly ' + yAxisLabel;
                for (ind=0; ind<oStatsHourly.nHours; ind++) {                
                    proceed = false;
                    if (oStatsHourly.timestamp[ind] > start_UTCTime && oStatsHourly.timestamp[ind] < end_UTCTime && !(oStatsHourly.timestamp[ind] === null) ) {
                        proceed = true;
                    }
                    
                    if (proceed) {
                        this_Time = oStatsHourly.timestamp[ind];
                        if (this_Time < myXmin) { myXmin = this_Time; }
                        if (this_Time > myXmax) { myXmax = this_Time; }
                        yPush = yStatsArray.hourAvg[yVarIndexPush][ind];
                        plotData.push([this_Time, yPush]);
                        plotData2.push([null, null]);
                        //if (yPush != missing_value && yPush < plotDataMin) {plotData_ymin = yPush;}
                        //if (yPush != missing_value && yPush > plotDataMax) {plotData_ymax = yPush;}
                        
                    } else {
                        plotData.push([null, null]);
                        plotData2.push([null, null]);
                    }
                }                
            } else {
                // native time resolution (not hourly)
                for (ind=0; ind<allLatLng.length; ind++) {
                    if ( ind>=startInd && ind <=endInd) {  
                        
                        // handle separate by ID option
                        if (document.getElementById("timeseries_separateByID").checked == true) {
                            var thisIDInd = jQuery.inArray(oUserdata.id[selected_block][ind], checked_ids);
                            if ( thisIDInd >= 0) {
                                if (thisIDInd == 0) {label0 = oUserdata.id[selected_block][ind];}
                                if (thisIDInd == 1) {label1 = oUserdata.id[selected_block][ind];}
                                if (thisIDInd == 2) {label2 = oUserdata.id[selected_block][ind];}
                                if (thisIDInd == 3) {label3 = oUserdata.id[selected_block][ind];}
                                if (thisIDInd == 4) {label4 = oUserdata.id[selected_block][ind];}
                                thisLabel = "test";
                                r = parseInt(thisIDInd * 255/maxIDsToShow);
                                thisColor = 'rgb(' + r + ',178, 255)';       
                            } else {
                                thisColor = 'rgb(0, 0, 0)'; 
                            }
                        }
                        
                        
                        this_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][ind]);
                        this_UTCTime = this_dateObjectUTC.getTime();
                        this_Time = Number(convertUTC_to_timezone(this_dateObjectUTC, selected_timezone, "milliseconds", "null"));
                        
                        if ( (oUserdata.show1[selected_block][get_selected_varselector_index()][ind]) &&
                             (oUserdata.show2[selected_block][get_selected_varselector_index()][ind]) ) {

                            //if ( (flagged_constant_msec.indexOf(oUserdata.msec[selected_block][ind]) < 0)       &&
                            //     (flagged_longMissing_msec.indexOf(oUserdata.msec[selected_block][ind]) < 0)    &&
                            //     (flagged_outlierStat_msec.indexOf(oUserdata.msec[selected_block][ind]) < 0)    &&
                            //     (flagged_outlierSpike_msec.indexOf(oUserdata.msec[selected_block][ind]) < 0)   &&
                            //     (flagged_aboveConc_msec.indexOf(oUserdata.msec[selected_block][ind]) < 0)      &&
                            //     (flagged_belowConc_msec.indexOf(oUserdata.msec[selected_block][ind]) < 0)      &&
                            //     (flagged_userInvalidated_msec.indexOf(oUserdata.msec[selected_block][ind]) < 0) ) {
                            exclude = document.getElementById("excludeFlaggerOption").checked;
                            if ( (! exclude) || (exclude && (! isMsecFlagged(oUserdata.msec[selected_block][ind])))) {
                                plotData.push([this_Time, oUserdata.variable[selected_block][get_selected_varselector_index()][ind]]);
                                plotDataTimestamp.push(this_dateObjectUTC.toISOString());
                            } else {
                                plotData.push([this_Time, null]);
                                plotDataTimestamp.push(this_dateObjectUTC.toISOString());
                            }
                            
                            if (document.getElementById("timeseries_separateByID").checked == true && thisIDInd < maxIDsToShow && thisIDInd >= 0) {
                                for (tempInd=0; tempInd<maxIDsToShow; tempInd++) {
                                    if (tempInd == thisIDInd) {
                                        sepIdPlotData[tempInd].push([this_Time, oUserdata.variable[selected_block][get_selected_varselector_index()][ind]]); 
                                    } else {
                                        sepIdPlotData[tempInd].push([null,null]);
                                    }
                                }
                            }
                            if (secondVarIndex > 0) {
                                plotData2.push([this_Time, oUserdata.variable[selected_block][secondVarIndex-1][ind]]); 
                                
                            }
                            if ( (oUserdata.variable[selected_block][get_selected_varselector_index()][ind] < plotDataMin) &&
                                 (oUserdata.variable[selected_block][get_selected_varselector_index()][ind] != missing_value) &&
                                 (oUserdata.variable[selected_block][get_selected_varselector_index()][ind] != fill_value) ) {
                                plotDataMin = oUserdata.variable[selected_block][get_selected_varselector_index()][ind]
                                if (secondVarIndex > 0) {
                                    plotDataMin2 = oUserdata.variable[selected_block][secondVarIndex-1][ind]
                                }
                            }
                        } else {
                            plotData.push([null, null]);
                            plotData2.push([null, null]);
                            plotDataTimestamp.push(null);
                            for (tempInd=0; tempInd<maxIDsToShow; tempInd++) {
                                sepIdPlotData[tempInd].push([null,null]);
                            }
                        }
                        
                        if (this_Time < myXmin) { myXmin = this_Time; }
                        if (this_Time > myXmax) { myXmax = this_Time; }
                        
                    } else {
                        plotData.push([null, null]);
                        plotData2.push([null, null]);
                        plotDataTimestamp.push(null);
                    }
                }
            }
 
            
            // plot all data on the timeseries plot
            var myYmin = Math.max(0, plotDataMin);
            
            // override data min/max (computed above) with user specified min/max
            // use global min/max (keyed from "avergage" block)
            //myYmin = oUserdata.mymin[selected_block][get_selected_varselector_index()]			      
            //myYmax = oUserdata.mymax[selected_block][get_selected_varselector_index()]
            myYmin = oUserdata.mymin[0][get_selected_varselector_index()]			      
            myYmax = oUserdata.mymax[0][get_selected_varselector_index()]
            
            if (settings.plotDataColorsFlag == true) {
                for (iii=0; iii<plotData.length; iii++) {
                    //console.log(plotData[iii][1], myYmin, myYmax);
                    plotDataColors.push(colorLookup(plotData[iii][1], myYmin, myYmax) + hexOpacityLookup(settings.plotPrimaryOpacity));
                }
            }

            
            if (secondVarIndex > 0) {
                // use global min/max (keyed from "avergage" block)
                //myYmin2 = oUserdata.mymin[selected_block][secondVarIndex-1]			      
                //myYmax2 = oUserdata.mymax[selected_block][secondVarIndex-1]
                myYmin2 = oUserdata.mymin[0][secondVarIndex-1]			      
                myYmax2 = oUserdata.mymax[0][secondVarIndex-1]
            } else {
                myYmin2 = myYmin;
                myYmax2 = myYmax;
            }
            
            //if (document.getElementById("timeseries_logoption").checked) {
            if (settings.plotLogAxisFlag == true) {
                mytransform = function (v) { return v <= 0 ? -4 : Math.log(v); };
            } else {
                mytransform = function (v) { return v; };
            }
            



            // process dataflagger
            markings = [];
            sampleRateMsec = 3600 * 1000 / 100;
            let myYrange = myYmax - myYmin;
            //console.log(myYmin, myYmax, myYrange);
            
            if (document.getElementById('runFlaggerOption').checked && oUserdata.flaggedIndices !== undefined && oUserdata.flaggedIndices != "") {
                // pass one - gray bars
                for (i=0; i<oUserdata.flaggedIndices.constant.length; i++) {
                    myFlaggedMsec      = oUserdata.flaggedIndices.constant[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    //markings.push({xaxis: {from: myFlaggedMsec - (sampleRateMsec/2), to: myFlaggedMsec + (sampleRateMsec/2)}, color:flagger_colorGray} );
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsecTo}, color:flagger_colorGray} );
                }
                
                for (i=0; i<oUserdata.flaggedIndices.longMissing.length; i++) {
                    myFlaggedMsec      = oUserdata.flaggedIndices.longMissing[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsec}, color:flagger_colorGray} );
                }
                
                for (i=0; i<oUserdata.flaggedIndices.outlierStat.length; i++) {
                    myFlaggedMsec = oUserdata.flaggedIndices.outlierStat[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsecTo}, color:flagger_colorGray} );
                }
                for (i=0; i<oUserdata.flaggedIndices.outlierSpike.length; i++) {
                    myFlaggedMsec = oUserdata.flaggedIndices.outlierSpike[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsecTo}, color:flagger_colorGray} );
                }
                for (i=0; i<oUserdata.flaggedIndices.aboveConc.length; i++) {
                    myFlaggedMsec = oUserdata.flaggedIndices.aboveConc[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsecTo}, color:flagger_colorGray} );
                }
                for (i=0; i<oUserdata.flaggedIndices.belowConc.length; i++) {
                    myFlaggedMsec = oUserdata.flaggedIndices.belowConc[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsecTo}, color:flagger_colorGray} );
                }
                for (i=0; i<oUserdata.flaggedIndices.userInvalidated.length; i++) {
                    myFlaggedMsec = oUserdata.flaggedIndices.userInvalidated[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsecTo}, color:flagger_colorGray} );
                }
                
                // pass two - colored bars
                for (i=0; i<oUserdata.flaggedIndices.constant.length; i++) {
                    myFlaggedMsec = oUserdata.flaggedIndices.constant[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsecTo},
                                   yaxis: {from: myYmin, to: myYmin + myYrange/7},
                                   color:flagger_colorConstant} );
                }
                
                for (i=0; i<oUserdata.flaggedIndices.longMissing.length; i++) {
                    myFlaggedMsec = oUserdata.flaggedIndices.longMissing[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsecTo},
                                   yaxis: {from: myYmin + myYrange/7, to: myYmin + 2*myYrange/7},
                                   color:flagger_colorLongMissing} );              }
                
                for (i=0; i<oUserdata.flaggedIndices.outlierStat.length; i++) {
                    myFlaggedMsec = oUserdata.flaggedIndices.outlierStat[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsecTo},
                                   yaxis: {from: myYmin + 2*myYrange/7, to: myYmin + 3*myYrange/7},
                                   color:flagger_colorOutlierStat} );
                }
                for (i=0; i<oUserdata.flaggedIndices.outlierSpike.length; i++) {
                    myFlaggedMsec = oUserdata.flaggedIndices.outlierSpike[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsecTo},
                                   yaxis: {from: myYmin + 3*myYrange/7, to: myYmin + 4*myYrange/7},
                                   color:flagger_colorOutlierSpike} );
                }
                for (i=0; i<oUserdata.flaggedIndices.aboveConc.length; i++) {
                    myFlaggedMsec = oUserdata.flaggedIndices.aboveConc[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsecTo},
                                   yaxis: {from: myYmin + 4*myYrange/7, to: myYmin + 5*myYrange/7},
                                   color:flagger_colorAboveConc} );
                }
                for (i=0; i<oUserdata.flaggedIndices.belowConc.length; i++) {
                    myFlaggedMsec = oUserdata.flaggedIndices.belowConc[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsecTo},
                                   yaxis: {from: myYmin + 5*myYrange/7, to: myYmin + 6*myYrange/7},
                                   color:flagger_colorBelowConc} );
                }
                for (i=0; i<oUserdata.flaggedIndices.userInvalidated.length; i++) {
                    myFlaggedMsec = oUserdata.flaggedIndices.userInvalidated[i][3];
                    myFlaggedMsecIndex = oUserdata.msec[selected_block].indexOf(myFlaggedMsec);
                    myFlaggedMsecIndexFrom  = myFlaggedMsecIndex - 1;
                    myFlaggedMsecIndexTo    = myFlaggedMsecIndex + 1;
                    if (myFlaggedMsecIndexFrom < 0) {myFlaggedMsecIndexFrom = 0;} 
                    if (myFlaggedMsecIndexTo   > myFlaggedMsec.length-1) {myFlaggedMsecIndexFrom = myFlaggedMsec.length-1;}
                    myFlaggedMsecFrom = oUserdata.msec[selected_block][myFlaggedMsecIndexFrom];
                    myFlaggedMsecTo   = oUserdata.msec[selected_block][myFlaggedMsecIndexTo];
                    markings.push({xaxis: {from: myFlaggedMsecFrom, to: myFlaggedMsecTo},
                                   yaxis: {from: myYmin + 6*myYrange/7, to: myYmax},
                                   color:flagger_colorInvalidated} );
                }
                
            }

            if (document.getElementById('runFlaggerOption').checked) {
                //YD added this part to add a horizontal line at user-defined Y value
                let flagger_allTimestamps = [];
                for (i=0; i<plotData.length;i++){
                    flagger_allTimestamps.push(plotData[i][0]);
                }
                
                markings.push({xaxis: {from: myXmin, to: myXmax},
                               yaxis: {from: (flagParams.aboveConc) - 0.01*myYrange, to:(flagParams.aboveConc)},
                               color:flagger_colorAboveConc} ); 
                
                let belowThres =  flagParams.belowConc;
                if (belowThres>0){
                    markings.push({xaxis: {from: myXmin, to: myXmax},
                                   yaxis: {from: (flagParams.belowConc) - 0.01*myYrange, to:(flagParams.belowConc)},
                                   color:flagger_colorBelowConc} ); 
                    
                } 
                //YD edit end
            }

            
            var tCanvas = $("#timeseries_canvas2");
            min_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][0]);
            min_UTCTime = min_dateObjectUTC.getTime();
            min_Time = Number(convertUTC_to_timezone(min_dateObjectUTC, selected_timezone, "milliseconds", "null"));
            if (allLatLng.length > 0) {
	        max_dateObjectUTC = create_dateObjectUTC(oUserdata.timestamp[selected_block][allLatLng.length-1]);
            } else {
	        max_dateObjectUTC = min_dateObjectUTC;
            }
            //console.log(allLatLng.length,  min_dateObjectUTC,  max_dateObjectUTC);
            max_UTCTime = max_dateObjectUTC.getTime();
            max_Time = Number(convertUTC_to_timezone(max_dateObjectUTC, selected_timezone, "milliseconds", "null"));
            
            label100 = oUserdata.varname[selected_block][get_selected_varselector_index()];
            
            //colorAQS       = "rgba(102, 0, 0, 1.0)";
            //colorSurfmet   = "rgba(102, 0, 0, 1.0)";
            //colorPurpleair = "rgba(102, 0, 0, 1.0)";
            colorAQS       = settings.plotSecondaryColor + hexOpacityLookup(settings.plotSecondaryOpacity);
            colorSurfmet   = settings.plotSecondaryColor + hexOpacityLookup(settings.plotSecondaryOpacity);
            colorPurpleair = settings.plotSecondaryColor + hexOpacityLookup(settings.plotSecondaryOpacity);
            colorMySensor  = settings.plotSecondaryColor + hexOpacityLookup(settings.plotSecondaryOpacity);

            colorData      = settings.plotPrimaryColor   + hexOpacityLookup(settings.plotPrimaryOpacity);
            colorSecondary = settings.plotSecondaryColor + hexOpacityLookup(settings.plotSecondaryOpacity);

            primaryShowLines  = false;
            primaryShowPoints = false;
            if (settings.plotPrimaryStyle.indexOf("Line") >= 0) {
                primaryShowLines = true;
            }
            if (settings.plotPrimaryStyle.indexOf("Points") >= 0) {
                primaryShowPoints = true;
            }

            secondaryShowLines  = false;
            secondaryShowPoints = false;
            if (settings.plotSecondaryStyle.indexOf("Line") >= 0) {
                secondaryShowLines = true;
            }
            if (settings.plotSecondaryStyle.indexOf("Points") >= 0) {
                secondaryShowPoints = true;
            }
            
            //fillStyle = document.getElementById("timeseries_symbolfill").checked;
            fillStyle = settings.plotFilledSymbolFlag;
            
            if (secondVarIndex == 0) {
	        timeseriesPlotOptions = { xaxis:{min:myXmin, max:myXmax, mode: "time", timezone:selected_timezone, axisLabel:"Time ("+selected_timezone+")", minTickSize: [1, "second"], color:"black"},
				          yaxis:{min:myYmin, max:myYmax, axisLabel:yAxisLabel, color:"black", position:"left",transform:mytransform},
				          selection:{mode:"x"}, grid:{show:true, markings:markings, backgroundColor:"#FFFFFF"}
	                                };
	        // one variable, NOT separating by ID
	        if (document.getElementById("timeseries_separateByID").checked == false) {
	            timeseriesPlot = $.plot(tCanvas, 
				            [{highlightColor:"black", label:label100, data:plotData, color:colorData, points:{show:primaryShowPoints, symbol:"circle", fill:fillStyle, fillColor:colorData}, lines:{show:primaryShowLines}, colors:plotDataColors, colorByDataFlag:settings.plotDataColorsFlag},
	                                     {highlightColor:"black", label:labelAqsPm25, data:plotDataAqsPm25, color:colorAQS, lines:{show:true}, points:{show:true, symbol:"circle", fill:fillStyle, fillColor:colorAQS}},
	                                     {highlightColor:"black", label:labelAqsPm10, data:plotDataAqsPm10, color:colorAQS, lines:{show:true}, points:{show:true, symbol:"circle", fill:fillStyle, fillColor:colorAQS}},
	                                     {highlightColor:"black", label:labelAqsOzone,data:plotDataAqsOzone,color:colorAQS, lines:{show:true}, points:{show:true, symbol:"circle", fill:fillStyle, fillColor:colorAQS}},
	                                     {highlightColor:"black", label:labelAqsCO,data:plotDataAqsCO,color:colorAQS, lines:{show:true}, points:{show:true, symbol:"circle", fill:fillStyle, fillColor:colorAQS}},
	                                     {highlightColor:"black", label:labelAqsNO2,data:plotDataAqsNO2,color:colorAQS, lines:{show:true}, points:{show:true, symbol:"circle", fill:fillStyle, fillColor:colorAQS}},
	                                     {highlightColor:"black", label:labelAqsSO2,data:plotDataAqsSO2,color:colorAQS, lines:{show:true}, points:{show:true, symbol:"circle", fill:fillStyle, fillColor:colorAQS}}],
				            timeseriesPlotOptions);
	            // one variable, separating by ID    
	        } else {
	            
	            //color0 = "rgb( 51,  51, 255)";
	            color0 = colorData;
	            //color1 = "rgb( 51, 255, 255)";
	            color1 = colorSecondary;
	            color2 = "rgb( 51, 153, 255)";
	            color3 = "rgb( 51, 255, 51)";
	            color4 = "rgb(153,  51, 255)";
                    //console.log(label0, label1);         
	            timeseriesPlot = $.plot(tCanvas, 
				            [{highlightColor:"black", label:label0, data:sepIdPlotData[0], color:color0, points:{show:primaryShowPoints, symbol:"circle", fill:fillStyle, fillColor:color0}, lines:{show:primaryShowLines}, colors:plotDataColors, colorByDataFlag:settings.plotDataColorsFlag},
	                                     {highlightColor:"black", label:label1, data:sepIdPlotData[1], color:color1, points:{show:secondaryShowPoints, symbol:"cross", fill:fillStyle, fillColor:color1}, lines:{show:secondaryShowLines}},
	                                     {highlightColor:"black", label:label2, data:sepIdPlotData[2], color:color2, points:{show:true, symbol:"diamond", fill:fillStyle, fillColor:color2}},
	                                     {highlightColor:"black", label:label3, data:sepIdPlotData[3], color:color3, points:{show:true, symbol:"triangle", fill:fillStyle, fillColor:color3}},
	                                     {highlightColor:"black", label:label4, data:sepIdPlotData[4], color:color4, points:{show:true, symbol:"square", fill:fillStyle, fillColor:color4}},
	                                     {highlightColor:"black", label:labelAqsPm25, data:plotDataAqsPm25, color:colorAQS, lines:{show:true}, points:{show:true, symbol:"circle", fill:fillStyle, fillColor:colorAQS}}],
				            timeseriesPlotOptions);
	        }
	        
	        
                // multiple variables, NOT separating by ID
            } else if (secondVarIndex > 0) {
	        label2 = oUserdata.varname[selected_block][secondVarIndex-1];
	        timeseriesPlotOptions = { xaxis:{min:myXmin, max:myXmax, mode: "time", timezone:selected_timezone, axisLabel:"Time ("+selected_timezone+")", minTickSize: [1, "second"], color:"black"},
				          yaxes:[{min:myYmin, max:myYmax,   axisLabel:yAxisLabel, color:"black", position:"left",transform:mytransform},
                                                 {min:myYmin2, max:myYmax2, axisLabel:oUserdata.varname[selected_block][secondVarIndex-1], color:"black", position:"right",transform:mytransform}],
				          lines:{show:false}, selection: {mode:"x"}
	                                };
	        timeseriesPlot = $.plot(tCanvas, 
				        [{highlightColor:"black", label:label100, data:plotData, yaxis:1, color:colorData, points:{show:primaryShowPoints, symbol:"circle", fill:fillStyle, fillColor:colorData}, lines:{show:primaryShowLines}, colors:plotDataColors, colorByDataFlag:settings.plotDataColorsFlag},
                                         {highlightColor:"black", label:label2, data:plotData2, yaxis:2, color:colorSecondary, points:{show:secondaryShowPoints, symbol:"triangle", fill:fillStyle, fillColor:colorSecondary}, lines:{show:secondaryShowLines}},
                                         {highlightColor:"black", label:labelAqsPm25, data:plotDataAqsPm25, color:colorAQS, lines:{show:true}, points:{show:true, symbol:"circle", fill:fillStyle, fillColor:colorAQS}}],
				        timeseriesPlotOptions);
	        
            } else if (secondVarIndex == -1) { // plotting AQS on the second axis
	        //console.log(yMinAQS);
	        //console.log(yMaxAQS);
	        //console.log(labelAQS);
	        //console.log(plotDataAQS);
                
                
	        label2 = labelAQS;
	        timeseriesPlotOptions = { xaxis:{min:myXmin, max:myXmax, mode: "time", timezone:selected_timezone, axisLabel:"Time ("+selected_timezone+")", minTickSize: [1, "second"], color:"black"},
				          yaxes:[{min:myYmin, max:myYmax,   axisLabel:yAxisLabel, color:"black", position:"left",transform:mytransform},
                                                 {min:yMinAQS, max:yMaxAQS, axisLabel:labelAQS, color:colorAQS, position:"right",transform:mytransform}],
				          lines:{show:false}, selection: {mode:"x"}
	                                };
	        timeseriesPlot = $.plot(tCanvas, 
				        [{highlightColor:"black", label:label100, data:plotData, yaxis:1, color:colorData, points:{show:primaryShowPoints, symbol:"circle", fill:fillStyle, fillColor:colorData}, lines:{show:primaryShowLines}, colors:plotDataColors, colorByDataFlag:settings.plotDataColorsFlag},
                                         {highlightColor:"black", label:labelAQS, data:plotDataAQS, yaxis:2, color:colorAQS, lines:{show:secondaryShowLines}, points:{show:secondaryShowPoints, symbol:"circle", fill:fillStyle, fillColor:colorAQS}}],
				        timeseriesPlotOptions);
                
            } else if (secondVarIndex == -2) {// plotting Surfmet on the second axis
	        label2 = labelSurfmet;
	        timeseriesPlotOptions = { xaxis:{min:myXmin, max:myXmax, mode: "time", timezone:selected_timezone, axisLabel:"Time ("+selected_timezone+")", minTickSize: [1, "second"], color:"black"},
				          yaxes:[{min:myYmin, max:myYmax,   axisLabel:yAxisLabel, color:"black", position:"left",transform:mytransform},
                                                 {min:yMinSurfmet, max:yMaxSurfmet, axisLabel:labelSurfmet, color:colorSurfmet, position:"right",transform:mytransform}],
				          lines:{show:false}, selection: {mode:"x"}
	                                };
	        timeseriesPlot = $.plot(tCanvas, 
				        [{highlightColor:"black", label:label100, data:plotData, yaxis:1, color:colorData, points:{show:primaryShowPoints, symbol:"circle", fill:fillStyle, fillColor:colorData}, lines:{show:primaryShowLines}, colors:plotDataColors, colorByDataFlag:settings.plotDataColorsFlag},
                                         {highlightColor:"black", label:labelSurfmet, data:plotDataSurfmet, yaxis:2, color:colorSurfmet, lines:{show:secondaryShowLines}, points:{show:secondaryShowPoints, symbol:"circle", fill:fillStyle, fillColor:colorSurfmet}}],
				        timeseriesPlotOptions);
                
            } else if (secondVarIndex == -3) {// plotting Purpleair on the second axis
	        label2 = labelPurpleair;
	        timeseriesPlotOptions = { xaxis:{min:myXmin, max:myXmax, mode: "time", timezone:selected_timezone, axisLabel:"Time ("+selected_timezone+")", minTickSize: [1, "second"], color:"black"},
				          yaxes:[{min:myYmin, max:myYmax,   axisLabel:yAxisLabel, color:"black", position:"left",transform:mytransform},
                                                 {min:yMinPurpleair, max:yMaxPurpleair, axisLabel:labelPurpleair, color:colorPurpleair, position:"right",transform:mytransform}],
				          lines:{show:false}, selection: {mode:"x"}
	                                };
	        timeseriesPlot = $.plot(tCanvas, 
				        [{highlightColor:"black", label:label100, data:plotData, yaxis:1, color:colorData, points:{show:primaryShowPoints, symbol:"circle", fill:fillStyle, fillColor:colorData}, lines:{show:primaryShowLines}, colors:plotDataColors, colorByDataFlag:settings.plotDataColorsFlag},
                                         {highlightColor:"black", label:labelPurpleair, data:plotDataPurpleair, yaxis:2, color:colorPurpleair, lines:{show:secondaryShowLines}, points:{show:secondaryShowPoints, symbol:"circle", fill:fillStyle, fillColor:colorPurpleair}}],
				        timeseriesPlotOptions);

            } else if (secondVarIndex == -4) {// plotting MySensor on the second axis
	        label2 = labelMySensor;
	        timeseriesPlotOptions = { xaxis:{min:myXmin, max:myXmax, mode: "time", timezone:selected_timezone, axisLabel:"Time ("+selected_timezone+")", minTickSize: [1, "second"], color:"black"},
				          yaxes:[{min:myYmin, max:myYmax,   axisLabel:yAxisLabel, color:"black", position:"left",transform:mytransform},
                                                 {min:yMinMySensor, max:yMaxMySensor, axisLabel:labelMySensor, color:colorMySensor, position:"right",transform:mytransform}],
				          lines:{show:false}, selection: {mode:"x"}
	                                };
	        timeseriesPlot = $.plot(tCanvas, 
				        [{highlightColor:"black", label:label100, data:plotData, yaxis:1, color:colorData, points:{show:primaryShowPoints, symbol:"circle", fill:fillStyle, fillColor:colorData}, lines:{show:primaryShowLines}, colors:plotDataColors, colorByDataFlag:settings.plotDataColorsFlag},
                                         {highlightColor:"black", label:labelMySensor, data:plotDataMySensor, yaxis:2, color:colorMySensor, lines:{show:secondaryShowLines}, points:{show:secondaryShowPoints, symbol:"circle", fill:fillStyle, fillColor:colorMySensor}}],
				        timeseriesPlotOptions);
            }
            
            update_timeseriesPlotHighlight(nearestpos);
            
        } catch (err) {
            console.log(err);
        }    
    }
    
}

function colorLookup(dataValue, min, max) {

    if (dataValue != missing_value && dataValue != fill_value) {
        var display_index = Math.round((dataValue - min)/(max - min) * (N_colors-1));
        var this_color = color_table[display_index];
    } else {
        var this_color = color_gray;
    }

    return this_color;
}

  function get_var_index_by_name(name) {
    var return_ind = -1; // default
    for (thisInd=0; thisInd<oUserdata.varname[selected_block].length; thisInd++) {
      if (oUserdata.varname[selected_block][thisInd].indexOf(name) != -1) {
	return_ind = thisInd;
	break;
      }
    }
    return return_ind;
  }

  function update_windrosePlot() {

    isWindroseActive = false; // default

    if (document.getElementById('windrosePlotOptionButton').checked) {
      
      // clear the canvas
      document.getElementById("windrose_canvas").innerHTML = "";
      
      var canvas_height = parseInt(document.getElementById('windrose_canvas').style.height);
      var canvas_width  = parseInt(document.getElementById('windrose_canvas').style.width);

      // loop through variables and turn on the windrose option if wind vectors are present
      var checkVectorFlag = false; // default
      var units = "";
      for (ind=0; ind<oUserdata.varname[selected_block].length; ind++) {
          if (oUserdata.varname[selected_block][ind].indexOf('wind_vector') >= 0) {
              checkVectorFlag = true;
              units = oUserdata.varname[selected_block][ind].replace('wind_vector',"");
          }
      }

      if (checkVectorFlag == false) {
	var msgText1 = "Plot not available because";
	var msgText2 = "wind data is not present.";
	var c=document.getElementById("windrose_canvas");
	c.width = canvas_width;
	c.height = canvas_height;
	var ctx=c.getContext("2d");
	ctx.textAlign = "center";
	ctx.font = "20px Arial";
	var hOffset = 20;
	ctx.fillText(msgText1,  canvas_width/2,  canvas_height/2 - hOffset);
	ctx.fillText(msgText2,  canvas_width/2,  canvas_height/2 + hOffset);

	
      } else {
	isWindroseActive = true;
	// figure out index of wind vector	
	var windVectorInd;
	for (n=0; n<oUserdata.varname[0].length; n++){
	  //debug(oUserdata.varname[0][n]);
            if (oUserdata.varname[0][n].indexOf('wind_magnitude') >= 0) {
            windVectorInd = n;
          }
	}

	var deg_to_rad = 3.14159265358 / 180.0;
	var max_r = oUserdata.mymax[0][windVectorInd];;
	var binsizeX = 10; // canvas pixels;
	var binsizeY = 10; // canvas pixels

	// set up windrose array
	//var nXpixels = parseInt(canvas_width  / binsizeX);
	//var nYpixels = parseInt(canvas_height / binsizeY);	
	//windroseArray = new Array(nXpixels);
	//for (var i = 0; i < nXpixels; i++) {
	//  windroseArray[i] = new Array(nYpixels);
	//}
	
	// set up canvas for drawing
	var c=document.getElementById("windrose_canvas");
	c.width = canvas_width;
	c.height = canvas_height;
	var ctx=c.getContext("2d");

	ctx.translate(canvas_width/2, canvas_height/2); // translate origin to center of canvas
	var xScale = 0.9* canvas_width/2 / max_r;
	//ctx.scale(xScale, xScale); // scale canvas such that max_r = canvas_width/2

	// draw and label x/y axes
	ctx.strokeStyle = '#000000';
	ctx.beginPath();
	ctx.moveTo(-canvas_width/2,0);
	ctx.lineTo(canvas_width/2, 0);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(0, -canvas_height/2);
	ctx.lineTo(0, canvas_height/2);
	ctx.stroke();
	var offset = 10;
	ctx.font="normal 10pt arial";
	ctx.fillText("N",  offset/2, -canvas_height/2+offset);
	ctx.fillText("S",  offset/2,  canvas_height/2-offset);
	ctx.fillText("E",  canvas_width/2-offset, -offset/2);
	ctx.fillText("W", -canvas_width/2+offset, -offset/2);


	// draw and label rings of constant r
	var rTicks;
	if (max_r <= 5) {
	  rTicks = [1, 2, 3, 4, 5];
	} else if (max_r <= 10) {
	  rTicks = [2, 4, 6, 8, 10];
	} else if (max_r <= 25) {
	  rTicks = [5, 10, 15, 20, 25];
	} else {
	  rTicks = [10, 20, 30, 40, 50];
	}
	var tick_phi = 45;
	ctx.strokeStyle = '#CCCCCC';

	for (rInd=0; rInd<rTicks.length; rInd++) {
	  var tick_r = rTicks[rInd];
	  ctx.beginPath();
	  ctx.arc(0, 0, tick_r*xScale, 0, 2*Math.PI);
	  ctx.stroke();
	  var tickX = tick_r * Math.sin(tick_phi * deg_to_rad) * xScale;
	  var tickY = -1*(tick_r * Math.cos(tick_phi * deg_to_rad) * xScale);
	  ctx.font="normal 10pt arial";
	  var tickString = tick_r.toString();
	  if (rInd == 2) {
              //tickString += ' (m/s)';
	    tickString += ' ' + units;
	  }
	  ctx.fillText(tickString, tickX+5, tickY+5);
	}

          
          // flagged indices (msec) from the data flagger
          //flagged_constant_msec        = [];
          //flagged_longMissing_msec     = [];
          //flagged_outlierStat_msec     = [];
          //flagged_outlierSpike_msec    = [];
          //flagged_aboveConc_msec       = [];
          //flagged_belowConc_msec       = [];
          //flagged_userInvalidated_msec = [];
          //if (document.getElementById("excludeFlaggerOption").checked) {
          //    if (oUserdata.flaggedIndices.constant != undefined) {
          //        flagged_constant_msec        = oUserdata.flaggedIndices.constant.map(d => d[3]);
          //    }
          //    if (oUserdata.flaggedIndices.longMissing != undefined) {
          //        flagged_longMissing_msec     = oUserdata.flaggedIndices.longMissing.map(d => d[3]);
          //    }
          //    if (oUserdata.flaggedIndices.outlierStat != undefined) {
          //        flagged_outlierStat_msec     = oUserdata.flaggedIndices.outlierStat.map(d => d[3]);
          //    }
          //    if (oUserdata.flaggedIndices.outlierSpike != undefined) {
          //        flagged_outlierSpike_msec    = oUserdata.flaggedIndices.outlierSpike.map(d => d[3]);
          //    }
          //    if (oUserdata.flaggedIndices.aboveConc != undefined) {
          //        flagged_aboveConc_msec       = oUserdata.flaggedIndices.aboveConc.map(d => d[3]);
          //    }
          //    if (oUserdata.flaggedIndices.belowConc != undefined) {
          //        flagged_belowConc_msec       = oUserdata.flaggedIndices.belowConc.map(d => d[3]);
          //    }
          //    if (oUserdata.flaggedIndices.userInvalidated != undefined) {
          //        flagged_userInvalidated_msec = oUserdata.flaggedIndices.userInvalidated.map(d => d[3]);
          //    }
          //}
          //console.log("yo", flagged_aboveConc_msec);


          
	var varind = get_selected_varselector_index();

	var wind_magnitude_index = get_var_index_by_name('wind_magnitude');
	var wind_direction_index = get_var_index_by_name('wind_direction');

	var this_min  = oUserdata.mymin[0][varind];
        var this_max  = oUserdata.mymax[0][varind];

          exclude = document.getElementById("excludeFlaggerOption").checked;

	//var sortArray = oUserdata.variable[selected_block][varind].sort(function(a, b){return a-b});

	  // creat sortable structure
	  var unsortedArray = [];
	  windroseSortIndex = new Array(oUserdata.variable[selected_block][varind].length);
	  for (thisPoint=0; thisPoint<oUserdata.variable[selected_block][varind].length; thisPoint++) {

              //if ( (flagged_constant_msec.indexOf(oUserdata.msec[selected_block][thisPoint]) < 0)       &&
              //     (flagged_longMissing_msec.indexOf(oUserdata.msec[selected_block][thisPoint]) < 0)    &&
              //     (flagged_outlierStat_msec.indexOf(oUserdata.msec[selected_block][thisPoint]) < 0)    &&
              //     (flagged_outlierSpike_msec.indexOf(oUserdata.msec[selected_block][thisPoint]) < 0)   &&
              //     (flagged_aboveConc_msec.indexOf(oUserdata.msec[selected_block][thisPoint]) < 0)      &&
              //     (flagged_belowConc_msec.indexOf(oUserdata.msec[selected_block][thisPoint]) < 0)      &&
              //     (flagged_userInvalidated_msec.indexOf(oUserdata.msec[selected_block][thisPoint]) < 0) ) {
              if ( (! exclude) || ( exclude && (! isMsecFlagged(oUserdata.msec[selected_block][thisPoint])))) {
                  //unsortedArray[thisPoint] = {data:oUserdata.variable[selected_block][varind][thisPoint],
	          //                            show1:oUserdata.show1[selected_block][varind][thisPoint],
                  //                            show2:oUserdata.show2[selected_block][varind][thisPoint],
                  //                            r:oUserdata.variable[selected_block][wind_magnitude_index][thisPoint],
	          //                            phi:oUserdata.variable[selected_block][wind_direction_index][thisPoint],
                  //                            timePoint:thisPoint};
                  unsortedArray.push({data:oUserdata.variable[selected_block][varind][thisPoint],
	                              show1:oUserdata.show1[selected_block][varind][thisPoint],
                                      show2:oUserdata.show2[selected_block][varind][thisPoint],
                                      r:oUserdata.variable[selected_block][wind_magnitude_index][thisPoint],
	                              phi:oUserdata.variable[selected_block][wind_direction_index][thisPoint],
                                      timePoint:thisPoint});
	      }
          }
        
	var sortArray = unsortedArray.sort(function(a, b){return a.data-b.data});
	for (sortInd=0; sortInd<sortArray.length; sortInd++) {

	  //for (thisPoint=0; thisPoint<oUserdata.variable[selected_block][varind].length; thisPoint++) {
	  //  if ( (oUserdata.show1[selected_block][varind][thisPoint]) && (oUserdata.show2[selected_block][varind][thisPoint]) ) {
	  //    var this_data = oUserdata.variable[selected_block][varind][thisPoint];
	  //    var this_min  = oUserdata.mymin[0][varind];
          //    var this_max  = oUserdata.mymax[0][varind];
	  //    var this_r    = oUserdata.variable[selected_block][wind_magnitude_index][thisPoint];
	  //    var this_phi  = oUserdata.variable[selected_block][wind_direction_index][thisPoint];
	  
	  windroseSortIndex[sortArray[sortInd].timePoint] = sortInd;
	  if ( sortArray[sortInd].show1 && sortArray[sortInd].show2 ) {
	    this_data = sortArray[sortInd].data;
	    this_r    = sortArray[sortInd].r;
	    this_phi  = sortArray[sortInd].phi;
	    
	    var thisX = this_r * Math.sin(this_phi * deg_to_rad) * xScale;
	    var thisY = -1* (this_r * Math.cos(this_phi * deg_to_rad) * xScale);
	    if (this_data != missing_value && this_data != fill_value) {
                var display_index = Math.round((this_data-this_min)/(this_max-this_min) * (N_colors-1));
                var this_color = color_table[display_index];
            } else {
                var this_color = color_gray;
            }    

	    ctx.fillStyle = this_color;
	    ctx.fillRect(thisX, thisY, 5, 5);
	    
	    // highlight
	    //if (thisPoint == windroseHighlightPos) {
	    if (sortInd == windroseHighlightPos) {
	      var highlightX = thisX;
	      var highlightY = thisY;
	      var highlightColor = this_color;
	    }
	  }
	}



	// draw highlight
	ctx.fillStyle = highlightColor;
	ctx.fillRect(highlightX-5, highlightY-5, 10, 10);
	// black outline 
	ctx.strokeStyle="#000000";
	ctx.strokeRect(highlightX-10, highlightY-10, 20, 20);
	// white outline
	ctx.strokeStyle="#FFFFFF";
	ctx.strokeRect(highlightX-11, highlightY-11, 22, 22);
      }
    }
  }


  function update_kml() {
    if (document.getElementById('kmlPlotOptionButton').checked) {
      //thisCenter = map.getCenter();
      //thisZoom = map.getZoom();
      kmlLayer.setMap(map);
      //setTimeout("map.setCenter(thisCenter)", 50);
      //setTimeout("map.setZoom(thisZoom)", 50);
    } else {
      if (kmlLayer) {
        kmlLayer.setMap(null);
      }
    }


  }

  
  function metinfo_toggle() {
     if (oMetInfo.show == true) {
       // switch to "hide"
       document.getElementById("metInfo").innerHTML = oMetInfo.infostring_short;
       oMetInfo.show = false;
     } else {
       document.getElementById("metInfo").innerHTML = oMetInfo.infostring_long;
       oMetInfo.show = true;
     }
  }

  
  // END UPDATE FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////

  function get_nearest_singleMarker(mypos){
    // find the closest (backward) non-missing singleMarker
    var mypos;
    var thispos;
    var retval = mypos; // default
    var varindex = get_selected_varselector_index();
    for (thispos=mypos; thispos>0; thispos--) {
      if ( (oUserdata.varname[selected_block][varindex] != 'wind_magnitude(m/s)')         && 
           (singleMarker[varindex][thispos].url.indexOf("fill") == -1) ) {
        retval = thispos;
        break;  
      }
      if ( (oUserdata.varname[selected_block][varindex] == 'wind_magnitude(m/s)') && 
           (singleMarker[varindex][thispos].url.indexOf("fill") == -1) ) {
        retval = thispos;
        break;  
      }
    }
    return retval;
  }


  function get_mapMode() {
    var num_checked = 0;
    var mode = 'single';  //default

    if (document.getElementById('mapOptionButton').checked)            { num_checked += 1; }
    if (document.getElementById('analysisPlotOptionButton').checked)   { num_checked += 1; }
    //if (document.getElementById('timeseriesPlotOptionButton').checked) { num_checked += 1; }
    if (document.getElementById('scatterPlotOptionButton').checked)    { num_checked += 1; }
    if (document.getElementById('windrosePlotOptionButton').checked)   { num_checked += 1; }

    if ( num_checked == 1) { mode = 'single'; }
    if ( num_checked == 2) { mode = 'double'; }
    if ( num_checked == 3) { mode = 'triple'; }
    if ( num_checked == 4) { mode = 'quadruple'; }
    if ( num_checked == 5) { mode = 'quintuple'; }
    if ( num_checked == 0 && document.getElementById('timeseriesPlotOptionButton').checked) {
        mode = 'timeseries_only';
    }
      
    return mode;
  }

  function getSelectedTimezone() {
    var timezonelist  = document.getElementById("timezoneList");
    selected_timezone = timezonelist.options[timezonelist.selectedIndex].text;

    // update "block" menu labels
    for (n=0; n<oTimeblock.timestampStart.length; n++) {
      this_timeObject = convertUTC_to_timezone(oTimeblock.timestampStart[n], selected_timezone, "ISO8601-roundToMinute", "null");
      this_label = document.getElementById("timeblockLabel_" + zeroPad(n, 3));
      this_label.firstChild.nodeValue = this_timeObject.substr(0,19);
    }

    update_timeAnnot(lastpos);
    update_timeseriesPlot();
    update_windrosePlot();

  }

  function setUpdateOptionalFlag(flag) {
      updateOptionalFlag = flag;
  }

  function slider_handler(pos, slider) {
    
      update_timeAnnot(pos);
      update_map(pos);
      update_optional(pos);
      update_displayed_data_value(get_selected_varselector_index(), pos);
      update_analysisPlotHighlight(nearestpos);
      update_timeseriesPlotHighlight(nearestpos);
      update_scatterPlotHighlight(nearestpos);
      update_windroseHighlight(nearestpos);
      update_windrosePlot();
      lastpos = pos;
  }



function timeseriesPlotsize_handler(new_height) {
    timeseries_height = new_height;
    document.getElementById('timeseries_canvas').style.height = (new_height).toString() + "px";
    update_timeseriesPlot();


}

  function mapsize_handler(new_height) {
      // handles events from myslider
      // (implictitly called when window is resized)
      //debug('mapsize_handler()');
      //console.log("in mapsize_handler", map_width);
      
      map_height = new_height;
      
      // set the canvas heights
      analysisCanvasOffset  = 10; // vertical shortening to account for controls
      scatterCanvasOffset   = 10;  // vertical shortening to account for controls
      windroseCanvasOffset  = 25;
      if (document.getElementById('timeseriesPlotOptionButton').checked) {
          if (get_mapMode() == 'timeseries_only') {
              topRowHeight    = 0.0;
              bottomRowHeight = map_height;
          } else {
              topRowHeight    = map_height*0.65;
              bottomRowHeight = map_height*0.35;
          }
      } else {
          topRowHeight    = map_height;
          bottomRowHeight = 0.0;
      }
      
      document.getElementById('map_canvas').style.height        = (topRowHeight).toString() + "px";
      document.getElementById('analysis_canvas').style.height   = (topRowHeight-analysisCanvasOffset).toString() + "px";
      //document.getElementById('timeseries_canvas').style.height = (bottomRowHeight).toString() + "px";
      document.getElementById('scatter_canvas').style.height    = (topRowHeight-scatterCanvasOffset).toString() + "px";
      document.getElementById("windrose_canvas").style.height   = (topRowHeight-windroseCanvasOffset).toString() + "px";
      document.getElementById('blank_canvas').style.height      = (topRowHeight).toString() + "px";
      
      // set the canvas widths using existing widths
      document.getElementById('timeseries_canvas').style.width  = map_width.toString() + "px"; // always
      document.getElementById('timeseries_divider').style.width  = map_width.toString() + "px"; // always
      if (get_mapMode() == 'single') {
          if (document.getElementById('mapOptionButton').checked == true) {
              document.getElementById('map_canvas').style.width  = map_width.toString() + "px";
          } else if (document.getElementById('analysisPlotOptionButton').checked == true) {
              document.getElementById('analysis_canvas').style.width  = map_width.toString() + "px";
          } else if (document.getElementById('timeseriesPlotOptionButton').checked == true) {
              //document.getElementById('timeseries_canvas').style.width  = map_width.toString() + "px";
          } else if (document.getElementById('scatterPlotOptionButton').checked == true) {
              document.getElementById('scatter_canvas').style.width  = map_width.toString() + "px";
          } else if (document.getElementById('timeseriesPlotOptionButton').checked == true) {
              document.getElementById('windrose_canvas').style.width  = map_width.toString() + "px";
          } else {
              document.getElementById('blank_canvas').style.width  = map_width.toString() + "px";
          }
      } else if (get_mapMode() == 'double') {
          var half_width = map_width/2;
          document.getElementById('map_canvas').style.width        = half_width.toString() + "px";
          document.getElementById('analysis_canvas').style.width   = half_width.toString() + "px";
          //document.getElementById('timeseries_canvas').style.width = half_width.toString() + "px";
          document.getElementById('scatter_canvas').style.width    = half_width.toString() + "px";
          document.getElementById('windrose_canvas').style.width   = half_width.toString() + "px";
      } else if (get_mapMode() == 'triple') {
          var third_width = map_width/3;
          document.getElementById('map_canvas').style.width        = third_width.toString() + "px";
          document.getElementById('analysis_canvas').style.width   = third_width.toString() + "px";
          //document.getElementById('timeseries_canvas').style.width = third_width.toString() + "px";
          document.getElementById('scatter_canvas').style.width    = third_width.toString() + "px";
          document.getElementById('windrose_canvas').style.width   = third_width.toString() + "px";
      } else if (get_mapMode() == 'quadruple') {
          var fourth_width = map_width/4;
          document.getElementById('map_canvas').style.width        = fourth_width.toString() + "px";
          document.getElementById('analysis_canvas').style.width   = fourth_width.toString() + "px";
          //document.getElementById('timeseries_canvas').style.width = fourth_width.toString() + "px";
          document.getElementById('scatter_canvas').style.width    = fourth_width.toString() + "px";
          document.getElementById('windrose_canvas').style.width   = fourth_width.toString() + "px";
      } else if (get_mapMode() == 'quintuple') {
          var fifth_width = map_width/5;
          document.getElementById('map_canvas').style.width        = fifth_width.toString() + "px";
          document.getElementById('analysis_canvas').style.width   = fifth_width.toString() + "px";
          //document.getElementById('timeseries_canvas').style.width = fifth_width.toString() + "px";
          document.getElementById('scatter_canvas').style.width    = fifth_width.toString() + "px";
          document.getElementById('windrose_canvas').style.width   = fifth_width.toString() + "px";
      }
      
      google.maps.event.trigger(map, 'center_changed');
      map.setCenter(map_center);	  
      update_analysisPlot();
      //update_timeseriesPlot();
      update_scatterPlot();
      update_windrosePlot();
      if (oUserdata.mymin[0]) {
          // reset map colorbar
	  init_colorbar(cbStartX, cbStartY, oUserdata.mymin[0][get_selected_varselector_index()], oUserdata.mymax[0][get_selected_varselector_index()], "MyData range: " + oUserdata.varname[0][get_selected_varselector_index()], 'colorbar_canvas', color_table,0);
          // reset windrose colorbar
          init_colorbar(cbStartX, cbStartY, oUserdata.mymin[0][get_selected_varselector_index()], oUserdata.mymax[0][get_selected_varselector_index()], "MyData range: " + oUserdata.varname[0][get_selected_varselector_index()], 'colorbar_canvas_windrose', color_table,0);
      }
      
      // reset viirs colorbar if viirs is loaded
      if (viirsColorTable.length > 0) {
          init_colorbar(cbStartX, cbStartY, viirsMinVal, viirsMaxVal, 'VIIRS AOD (-)', 'colorbar_satellite_canvas', viirsColorTable,0);
      }
      
      // reset tropomi NO2 colorbar if it is loaded
      if (tropomiNO2ColorTable.length > 0) {
          init_colorbar(cbStartX, cbStartY, tropomiNO2MinVal, tropomiNO2MaxVal, 'TROPOMI NO2 (#/cm2)', 'colorbar_satellite_canvas', tropomiNO2ColorTable,1);
      }

      // reset tempo NO2 colorbar if it is loaded
      if (tempoNO2ColorTable.length > 0) {
          init_colorbar(cbStartX, cbStartY, tempoNO2MinVal, tempoNO2MaxVal, 'TEMPO NO2 (#/cm2)', 'colorbar_satellite_canvas', tempoNO2ColorTable,1);
      }

      // updates for other colorbars
      updateAqsTooltips();
      updateSurfmetTooltips();
      updatePurpleairTooltips();
      updateMySensorTooltips();
      
  }

  function slider_config(pos, slider) {
    //slider.setMax(10);
  }

  function zeroPad(num,count) {
    var numZeropad = num + '';
    while(numZeropad.length < count) {
      numZeropad = "0" + numZeropad;
    }
    return numZeropad;
  }


function validate_merge_minmax(evt) {
    myTarget = evt.target || evt.originalTarget;
    if ( !(evt === undefined) ) { 
        //thisID = evt.originalTarget.id;
        thisID = myTarget.id;
        thisID_min = thisID.replace("max","min");
        thisID_max = thisID.replace("min","max");
        
        var theEvent = evt || window.event;
        var key = theEvent.keyCode || theEvent.which;
        var keystring = String.fromCharCode( key );
        // don't validate the input if below arrow, delete and backspace keys were pressed
        if(key === 37 || key === 38 || key === 39 || key === 40 || key === 8 || key === 46) { // Left, Up, Right, Down Arrow, Backspace, Delete keys
	    // do nothing
        } else if (key === 13 || key === 0 || key === undefined) {// enter key or focusout
	    //var thismin = parseFloat(document.getElementById("merge_min").value); 
	    //var thismax = parseFloat(document.getElementById("merge_max").value);
            var thismin = parseFloat(document.getElementById(thisID_min).value); 
	    var thismax = parseFloat(document.getElementById(thisID_max).value);
	    if (thismin < thismax) { 
	        
	        //if (addAqsPm25.checked) {
	        if (thisID.indexOf("AirnowPM25") > 0) {
		    oAirnowPM25.min = thismin;
		    oAirnowPM25.max = thismax;
	        }
                //if (addAqsPm10.checked) {
	        if (thisID.indexOf("AirnowPM10") > 0) {
		    oAirnowPM10.min = thismin;
		    oAirnowPM10.max = thismax;
	        }
	        //if (addAqsOzone.checked) {
	        else if (thisID.indexOf("AirnowO3") > 0) {
		    oAirnowOzone.min = thismin;
		    oAirnowOzone.max = thismax;
	        }
	        //if (addAqsCO.checked) {
	        else if (thisID.indexOf("AirnowCO") > 0) {
		    oAirnowCO.min = thismin;
		    oAirnowCO.max = thismax;
	        }
	        //if (addAqsNO2.checked) {
	        else if (thisID.indexOf("AirnowNO2") > 0) {
		    oAirnowNO2.min = thismin;
		    oAirnowNO2.max = thismax;
	        }
	        //if (addAqsSO2.checked) {
	        else if (thisID.indexOf("AirnowSO2") > 0) {
		    oAirnowSO2.min = thismin;
		    oAirnowSO2.max = thismax;
	        }
	        //if (addSurfmetTemperature.checked) {
	        else if (thisID.indexOf("SurfmetTemperature") > 0) {
		    oSurfmetTemperature.min = thismin;
		    oSurfmetTemperature.max = thismax;
	        }
                //	    if (addSurfmetPressure.checked) {
	        else if (thisID.indexOf("SurfmetPressure") > 0) {
		    oSurfmetPressure.min = thismin;
		    oSurfmetPressure.max = thismax;
	        }
                //	    if (addSurfmetWindSpeed.checked) {
	        else if (thisID.indexOf("SurfmetWindSpeed") > 0) {
		    oSurfmetWindSpeed.min = thismin;
		    oSurfmetWindSpeed.max = thismax;
	        }
                //	    if (addSurfmetWindDirection.checked) {
	        else if (thisID.indexOf("SurfmetWindDirection") > 0) {
		    oSurfmetWindDirection.min = thismin;
		    oSurfmetWindDirection.max = thismax;
	        }
                //if (addPurpleairPM25.checked) {
	        else if (thisID.indexOf("PurpleairPM25") > 0) {
		    oPurpleairPM25.min = thismin;
		    oPurpleairPM25.max = thismax;
	        }
                //if (addMySensor.checked) {
	        else if (thisID.indexOf("MySensor") > 0) {
                    //console.log(thisID);
                    sensorInd = Number(thisID.slice(-1));
                    //console.log(sensorInd);
		    mySensorArray[sensorInd].min    = thismin;
		    mySensorArray[sensorInd].max    = thismax;
                    mySensorArray[sensorInd].curMin = thismin;
		    mySensorArray[sensorInd].curMax = thismax;
                    mySensorArray[sensorInd].minArray[mySensorArray[sensorInd].curSelectedIndex] = thismin;
                    mySensorArray[sensorInd].maxArray[mySensorArray[sensorInd].curSelectedIndex] = thismax;
	        }
                else {
                    console.log("unrecognized event:", thisID);
                }
                
                updateAqsTooltips();
                updateSurfmetTooltips();
                updatePurpleairTooltips();
                updateMySensorTooltips();
	        update_timeseriesPlot();
                
                // force map to update via a window resize event
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent('resize', true, false);
                window.dispatchEvent(evt);
                
	    } else {
                //console.log(thisID);
                if (!isNaN(thismin) && !isNaN(thismax)) {
                    theEvent.preventDefault();
	            alert("Max must not be less than min");
                    
                    if (thisID.indexOf("AirnowPM25") > 0) {
		        oldMin = oAirnowPM25.min;
		        oldMax = oAirnowPM25.max;
	            }
                    if (thisID.indexOf("AirnowPM10") > 0) {
		        oldMin = oAirnowPM10.min;
		        oldMax = oAirnowPM10.max;
	            }
	            else if (thisID.indexOf("AirnowO3") > 0) {
		        oldMin = oAirnowOzone.min;
		        oldMax = oAirnowOzone.max;
	            }
	            else if (thisID.indexOf("AirnowCO") > 0) {
		        oldMin = oAirnowCO.min;
		        oldMax = oAirnowCO.max;
	            }
	            else if (thisID.indexOf("AirnowNO2") > 0) {
		        oldMin = oAirnowNO2.min;
		        oldMax = oAirnowNO2.max;
	            }
	            else if (thisID.indexOf("AirnowSO2") > 0) {
		        oldMin = oAirnowSO2.min;
		        oldMax = oAirnowSO2.max;
	            }
	            else if (thisID.indexOf("SurfmetTemperature") > 0) {
		        oldMin = oSurfmetTemperature.min;
		        oldMax = oSurfmetTemperature.max;
	            }
	            else if (thisID.indexOf("SurfmetPressure") > 0) {
		        oldMin = oSurfmetPressure.min;
		        oldMax = oSurfmetPressure.max;
	            }
	            else if (thisID.indexOf("SurfmetWindSpeed") > 0) {
		        oldMin = oSurfmetWindSpeed.min;
		        oldMax = oSurfmetWindSpeed.max;
	            }
                    else if (thisID.indexOf("SurfmetWindDirection") > 0) {
		        oldMin = oSurfmetWindDirection.min;
		        oldMax = oSurfmetWindDirection.max;
	            }
	            else if (thisID.indexOf("PurpleairPM25") > 0) {
		        oldMin = oPurpleairPM25.min;
		        oldMax = oPurpleairPM25.max;
	            }
                    else if (thisID.indexOf("MySensor") > 0) {
                        sensorInd = thisID.slice(-1);
		        oldMin = mySensorArray[sensorInd].min;
		        oldMax = mySensorArray[sensorInd].max;
	            }
                    
                    document.getElementById(thisID_min).value = oldMin;
                    document.getElementById(thisID_max).value = oldMax;
                }
	    }
        } else {
	    // make sure we only have numbers or decimal point or minus sign
	    var regex = /[0-9]|\-|\./;
	    if( !regex.test(keystring) ) {
	        theEvent.returnValue = false;
	        if(theEvent.preventDefault) {
		    //theEvent.preventDefault();
	        }
	        
	    }
        }
    }
}




  function validate_number(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    var keystring = String.fromCharCode( key );
    //console.log('key = ', key);
    // don't validate the input if below arrow, delete and backspace keys were pressed
    if(key === 37 || key === 38 || key === 39 || key === 40 || key === 8 || key === 46) { // Left, Up, Right, Down Arrow, Backspace, Delete keys
      // do nothing
    } else if (key === 13 || key === 0 || key === undefined) {// enter key or focusout
      var thismin = parseFloat(document.getElementById("my_min").value); 
      var thismax = parseFloat(document.getElementById("my_max").value);
      if (thismin < thismax) { 
        // use global min/max (keyed from "avergage" block)
        //oUserdata.mymin[selected_block][get_selected_varselector_index()] = document.getElementById("my_min").value; 
        //oUserdata.mymax[selected_block][get_selected_varselector_index()] = document.getElementById("my_max").value;
          oUserdata.mymin[0][get_selected_varselector_index()] = parseFloat(document.getElementById("my_min").value); 
          oUserdata.mymax[0][get_selected_varselector_index()] = parseFloat(document.getElementById("my_max").value);

        // delete old markers
        markerind = markerLayer.length;
	markerLayerSetMapFlag = false;
        while (markerind--) {
          markerLayer[markerind].setMap(null);
        }
        // create new markers and update plots
        setTimeout("computeGoogleLatLng(oUserdata, false);", 100);
        update_timeseriesPlot();
        update_analysisPlot();
        update_scatterPlot();
	update_windrosePlot();
      } else {
          if (!isNaN(thismin) && !isNaN(thismax)) {
              alert("Max must not be less than min");
              document.getElementById("my_min").value = parseFloat(oUserdata.mymin[0][get_selected_varselector_index()]);
              document.getElementById("my_max").value = parseFloat(oUserdata.mymax[0][get_selected_varselector_index()]);
          }
      }
    } else {
      // make sure we only have numbers or decimal point or minus sign
      var regex = /[0-9]|\-|\./;
      if( !regex.test(keystring) ) {
        theEvent.returnValue = false;
        if(theEvent.preventDefault) {
	  //theEvent.preventDefault();
        }

      }
    }
  }

function validatePAkey() {
    var isPAkeyValid = false; // default
    var rawPAkey     = document.getElementById("paKeyInput").value;
    var minLength    = parseInt(document.getElementById("paKeyInput").getAttribute("minlength"));
    var validator    = new RegExp("^[A-Z0-9\-]+$");
    var validation   = validator.test(rawPAkey);
    var lengthTest   = rawPAkey.length >= minLength;
    //console.log(rawPAkey, minLength, validation);

    // test validation criteria
    if (!lengthTest && rawPAkey.length > 0) {
        alert("The specified PurpleAir key is too short.");
        isPAkeyValid = false;
    }
    if (!validation && rawPAkey.length > 0) {
        alert("The specified PurpleAir key contains invalid characters.");
        isPAkeyValid = false;
    }
    
    // determine key validity
    //isPAkeyValid = true; // HACK to true for now
    //// all good.
    //if (isPAkeyValid) {
    //    document.getElementById('addPurpleairLocations').disabled = false;
    //    document.getElementById('addPurpleairPM25').disabled      = false;
    //} else {
    //    document.getElementById('addPurpleairLocations').disabled = true;
    //    document.getElementById('addPurpleairPM25').disabled      = true;
    //}

    if (rawPAkey.length > 0) {
        var arg_string = "CHECK_KEY=" + rawPAkey;
        $.ajax({
	    url: rsigserver + arg_string,
	    dataType: "text",
	    success: function(data, textStatus, jqXHR) {
                //console.log("AHA", data, data.length, data==1);
                
                if (data == 1) {
                    // key was valid
	            document.getElementById('addPurpleairLocations').disabled = false;
                    document.getElementById('addPurpleairPM25').disabled      = false;

                    // store key in cookie
                    setCookie("pak", btoa(rawPAkey), 365);
                    
                } else {
                    document.getElementById('addPurpleairLocations').disabled = true;
                    document.getElementById('addPurpleairPM25').disabled      = true;
                    alert("PurpleAir READ key could not be validated.");
                }
	    },
	    error: function (jqXHR, textStatus, errorThrown) {
                document.getElementById('addPurpleairLocations').disabled = true;
                document.getElementById('addPurpleairPM25').disabled      = true;
	        print("PurpleAir READ key could not be validated..");
	        //print("status: " + textStatus);
	        //print("error: " + errorThrown);
	    } 
        });
    }
}



  function validate_axis(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    var keystring = String.fromCharCode( key );

    var regex = /[0-9]|\.|\-|\n|\r|[\b]/; // only allow numbers, decimal, minus sign, newline, return, or backspace

    //debug(keystring + ' ' + regex.test(keystring));

    if (regex.test(keystring)) {
      if (key === 13) { // enter key pressed
        //debug("enter pressed");
        if (evt.target.id == 'analysis_Xmin' || evt.target.id == 'analysis_Xmax'){
          thismin   = parseFloat(document.getElementById("analysis_Xmin").value); 
          thismax   = parseFloat(document.getElementById("analysis_Xmax").value);
        } else {
          thismin   = parseFloat(document.getElementById("timeseries_Xmin").value); 
          thismax   = parseFloat(document.getElementById("timeseries_Xmax").value);
        }

        if ( thismin < thismax ) { 
          // update plots
          if (evt.target.id == 'analysis_Xmin' || evt.target.id == 'analysis_Xmax'){
            update_analysisPlot(); 
          } else {
              update_timeseriesPlot();
              computeGoogleLatLng(oUserdata, false);
          }
        } else {
            if (!isNaN(thismin) && !isNaN(thismax)) {
                theEvent.preventDefault();
                alert("Max must not be less than min");
                if (evt.target.id == 'analysis_Xmin' || evt.target.id == 'analysis_Xmax'){
                    //document.getElementById("analysis_Xmin").value = 0; 
                    //document.getElementById("analysis_Xmax").value = 0;
                } else {
                    //document.getElementById("timeseries_Xmin").value = 0; 
                    //document.getElementById("timeseries_Xmax").value = 0;
                }
            }
        }
      } else {
        //debug("regex matched but enter not pressed");
      }
    } else {
      //debug("regex not matched");
      theEvent.preventDefault();     
    }
  }

  function setBoxplotBinSize(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    var keystring = String.fromCharCode( key );

    var regex = /[0-9]|\n|\r|[\b]/; // only allow numbers, newline, return, or backspace

    //debug(keystring + ' ' + regex.test(keystring));

    if (regex.test(keystring)) {
      if (key === 13) { // enter key pressed
        //debug("enter pressed");
        if (evt.target.id == 'analysis_binsize'){
          boxplotBinSize   = parseInt(document.getElementById("analysis_binsize").value); 
        } else {
          alert("Boxplot validation error.");
        }

        update_analysisPlot();
        update_timeseriesPlot();
        update_scatterPlot();
	update_windrosePlot();
      }
    }      
  }


  function process_Xaxisoption(evt){

    // toggle enable/disable

    if (evt.target.id == 'analysis_Xaxisoption'){
      if (document.getElementById('analysis_Xmin').disabled) {
        document.getElementById('analysis_Xmin').disabled = false;
      } else {
        document.getElementById('analysis_Xmin').disabled = true;
      }

      if (document.getElementById('analysis_Xmax').disabled) {
        document.getElementById('analysis_Xmax').disabled = false;
      } else {
        document.getElementById('analysis_Xmax').disabled = true;
      }
      update_analysisPlot(); 


    } else {
      if (document.getElementById('timeseries_Xmin').disabled) {
        document.getElementById('timeseries_Xmin').disabled = false;
      } else {
        document.getElementById('timeseries_Xmin').disabled = true;
      }

      if (document.getElementById('timeseries_Xmax').disabled) {
        document.getElementById('timeseries_Xmax').disabled = false;
      } else {
        document.getElementById('timeseries_Xmax').disabled = true;
      }
      update_timeseriesPlot(); 
        update_scatterPlot(); // timeseries selection also affects scatterplot
        computeGoogleLatLng(oUserdata, false);
    }
  }





  function process_radio(callingObj){
      //console.log("in process_radio()");
    // use global min/max (keyed from "avergage" block)
    //document.getElementById("my_min").value = oUserdata.mymin[selected_block][get_selected_varselector_index()];
    //document.getElementById("my_max").value = oUserdata.mymax[selected_block][get_selected_varselector_index()];
    document.getElementById("my_min").value = oUserdata.mymin[0][get_selected_varselector_index()];
    document.getElementById("my_max").value = oUserdata.mymax[0][get_selected_varselector_index()];

    document.getElementById("colorbar_canvas").innerHTML = "";
    document.getElementById("colorbar_canvas_windrose").innerHTML = "";
    // use global min/max (keyed from "avergage" block)
    //cb_min = oUserdata.mymin[selected_block][get_selected_varselector_index()];
    //cb_max = oUserdata.mymax[selected_block][get_selected_varselector_index()];
    cb_min = oUserdata.mymin[0][get_selected_varselector_index()];
    cb_max = oUserdata.mymax[0][get_selected_varselector_index()];
    // reset map colorbar
      init_colorbar(cbStartX, cbStartY, cb_min, cb_max, "MyData range: " + oUserdata.varname[selected_block][get_selected_varselector_index()], 'colorbar_canvas', color_table,0);
    // reset windrose colorbar
      init_colorbar(cbStartX, cbStartY, cb_min, cb_max, "MyData range: " + oUserdata.varname[selected_block][get_selected_varselector_index()], 'colorbar_canvas_windrose', color_table,0);

    markerind = markerLayer.length;
    while (markerind--) {
	if (markerind != get_selected_varselector_index() || !document.getElementById('displaychoiceAll').checked) {
	    markerLayerSetMapFlag = false;
	    markerLayer[markerind].setMap(null);
	} else {
	    markerLayerSetMapFlag = true;
	    markerLayer[markerind].setMap(map);
	}
    }

      //console.log(get_selected_varselector_index());
    update_map(lastpos);
    update_displayed_data_value(get_selected_varselector_index(), lastpos);
    update_analysisPlot();
    update_timeseriesPlot();
    update_scatterPlot();
    update_timeAnnot(lastpos);
    update_windrosePlot();
    set_mapsize(); 

    if (document.getElementById('runFlaggerOption').checked == true && callingObj != "") {
        // callingObj with be != "" is process_radio was initiated by user action
        setTimeout("computeGoogleLatLng(oUserdata, false);", 100);
    }
      
  }


function process_timestyle() {
    //console.log("in process_timestyle()");
    // whether we show data averaged to 1000 points, or show raw data in 1000 point blocks
    get_block();

    // update timeslider to prevent overrunning array
    var maxlength = oUserdata.lat[selected_block].length-1
    $('#time_slider').slider("option", "max", maxlength);
    if (lastpos > maxlength) {
      lastpos = maxlength;
    }

    // delete existing markers
    markerind = markerLayer.length;
    markerLayerSetMapFlag = false;
    while (markerind--) {
      markerLayer[markerind].setMap(null);
    }

    // recalculate slider position indices
    if (!(oAirnowOzone === undefined) && !(oAirnowOzone.oSlider_indices === undefined)) {
	oAirnowOzone.oSlider_indices = airnow_sliderpos_lookup(oAirnowOzone);
    }
    if (!(oAirnowPM25 === undefined) && !(oAirnowPM25.oSlider_indices === undefined)) {
	oAirnowPM25.oSlider_indices = airnow_sliderpos_lookup(oAirnowPM25);
    }
    if (!(oAirnowPM10 === undefined) && !(oAirnowPM10.oSlider_indices === undefined)) {
	oAirnowPM10.oSlider_indices = airnow_sliderpos_lookup(oAirnowPM10);
    }
    if (!(oAirnowCO === undefined) && !(oAirnowCO.oSlider_indices === undefined)) {
	oAirnowCO.oSlider_indices = airnow_sliderpos_lookup(oAirnowCO);
    }
    if (!(oAirnowNO2 === undefined) && !(oAirnowNO2.oSlider_indices === undefined)) {
	oAirnowNO2.oSlider_indices = airnow_sliderpos_lookup(oAirnowNO2);
    }
    if (!(oAirnowSO2 === undefined) && !(oAirnowSO2.oSlider_indices === undefined)) {
	oAirnowSO2.oSlider_indices = airnow_sliderpos_lookup(oAirnowSO2);
    }
    if (!(oSurfmetTemperature === undefined) && !(oSurfmetTemperature.oSlider_indices === undefined)) {
	oSurfmetTemperature.oSlider_indices = airnow_sliderpos_lookup(oSurfmetTemperature);
    }
    if (!(oSurfmetPressure === undefined) && !(oSurfmetPressure.oSlider_indices === undefined)) {
	oSurfmetPressure.oSlider_indices = airnow_sliderpos_lookup(oSurfmetPressure);
    }
    if (!(oSurfmetWindSpeed === undefined) && !(oSurfmetWindSpeed.oSlider_indices === undefined)) {
	oSurfmetWindSpeed.oSlider_indices = airnow_sliderpos_lookup(oSurfmetWindSpeed);
    }
    if (!(oSurfmetWindDirection === undefined) && !(oSurfmetWindDirection.oSlider_indices === undefined)) {
	oSurfmetWindDirection.oSlider_indices = airnow_sliderpos_lookup(oSurfmetWindDirection);
    }
    if (!(oPurpleairPM25 === undefined) && !(oPurpleairPM25.oSlider_indices === undefined)) {
	oPurpleairPM25.oSlider_indices = purpleair_sliderpos_lookup(oPurpleairPM25);
    }
    if (!(oHmsFire === undefined) && !(oHmsFire.oSlider_indices === undefined)) {
	oHmsFire.oSlider_indices = hmsFireFastmarker_sliderpos_lookup(oHmsFire);
    }
    for (sensorInd=0; sensorInd<mySensorArray.length; sensorInd++) {
        if (!(mySensorArray[sensorInd] === undefined) && !(mySensorArray[sensorInd].oSlider_indices === undefined)) {
            //console.log(sensorInd);
	    mySensorArray[sensorInd].oSlider_indices = mysensor_sliderpos_lookup(mySensorArray[sensorInd]);
        }
    }

    initGoogleLatLng();
    //setTimeout("computeGoogleLatLng(oUserdata, true);", 50);
    computeGoogleLatLng(oUserdata, true);

    // enable or disable the timeblock buttons 
    if (document.getElementById("Blocks").checked == true) { 
        disabled_state = false;
        if (document.getElementById("multipleTimeblockOption").checked && !document.getElementById("displaychoiceSingle").checked) {
            document.getElementById("displaychoiceSingle").checked=true;
	    document.getElementById("displaychoiceAll").disabled=true;
	    document.getElementById("displaychoiceSingle").disabled=true;
        }
    } else {
        disabled_state = true;
        document.getElementById("displaychoiceAll").disabled=false;
	document.getElementById("displaychoiceSingle").disabled=false;
    }
    butgroup = document.getElementsByName("timeblock_buttons");
    for (but=0; but<butgroup.length; but++) {
      butgroup[but].disabled=disabled_state;
    } 
    // enable or disable the extended blocks option
    document.getElementById("multipleTimeblockOption").disabled = disabled_state;


    while (flag_computeGoogleLatLngDone == false) {
      // do nothing
    }


    // apply crop using newly loaded data
    cropData(false);

    // UGLY - redo above steps for cropping to be applied
    // delete existing markers
    markerind = markerLayer.length;
    markerLayerSetMapFlag = false;
    while (markerind--) {
      markerLayer[markerind].setMap(null);
    }
    initGoogleLatLng();
    setTimeout("computeGoogleLatLng(oUserdata, true);", 50);

    computeCovarianceElementsNative();
    statsNative_sliderpos_lookup();
    
    subset_by_id();

    update_optional(lastpos);

    updateAqsTooltips();
    updateSurfmetTooltips();
    updatePurpleairTooltips();
    updateMySensorTooltips();

  }


function makeScreenshot() {
  var div1 = document.getElementById("div_printarea");

  // set certain div overflow settings to hidden (preventing unseen info from being rendered)
  document.getElementById("id_selector").style.overflow = "hidden";
  document.getElementById("tb_selector").style.overflow = "hidden";
  document.getElementById("var_selector").style.overflow = "hidden";

  // since Chrome does not implement css transforms, do it manually
  // http://stackoverflow.com/questions/24046778/html2canvas-does-not-work-with-google-maps-pan
  var transform=$(".gm-style>div:first>div").css("transform");
  var comp=transform.split(","); //split up the transform matrix
  var mapleft=parseFloat(comp[4]); //get left value
  var maptop=parseFloat(comp[5]);  //get top value
  $(".gm-style>div:first>div").css({ //get the map container. not sure if stable
    "transform":"none",
    "left":mapleft,
    "top":maptop,
  });

// just print the windrose canvas (no html2canvas needed!)  
var ahaCanvas  = document.getElementById("windrose_canvas");
var ahadata = ahaCanvas.toDataURL("image/png");
window.open(ahadata);

  html2canvas(div1,{
    useCORS: true,
    //allowTaint: true,
    //proxy: 'html2canvasproxy.php',
    //logging:true,
    onrendered: function(canvas) {
      var uridata = canvas.toDataURL("image/png");
      window.open(uridata);

      // works in firefox, but not in chrome
      //canvas.toBlob(function(blob) {
	//saveAs(blob, "retigo_screenshot.png");
      //});


      // now re-implement the css transform
      $(".gm-style>div:first>div").css({
	left:0,
	top:0,
	"transform":transform
      });
	
        
    }
  });

  // restore div overflow settings
  document.getElementById("id_selector").style.overflow = "auto";
  document.getElementById("tb_selector").style.overflow = "auto";
  document.getElementById("var_selector").style.overflow = "auto";

}

function asc2hex(pStr) {
  tempstr = '';
  for (a = 0; a < pStr.length; a = a + 1) {
      tempstr = tempstr + zeroPad(pStr.charCodeAt(a).toString(16), 2);
  }
    return tempstr;
}

function revealFeedback() {
  document.getElementById('feedbackAreaDiv').style.visibility="visible";
  $("#feedbackAreaDiv").slideDown("slow");
}
function cancelFeedback() {
    document.getElementById("feedback_textarea").value = "";

    $("#feedbackAreaDiv").slideUp("slow");
    

}
function sendFeedback() {
    var feedback_string = document.getElementById("feedback_textarea").value;
    
    var arg_string = "SERVICE=retigo&REQUEST=feedback&FEEDBACK=" + asc2hex(feedback_string);

    $.ajax({
	    url: rsigserver + arg_string,
		dataType: "text",
		success: function(data, textStatus, jqXHR) {
		setTimeout('alert("Thank you. Your feedback has been sent!");', 2000);
	    },
		error: function (jqXHR, textStatus, errorThrown) {
		print("Error in sending feedback.");
		print("status: " + textStatus);
		print("error: " + errorThrown);
	    } 
	});

    $("#feedbackAreaDiv").slideUp("slow");
    

}

function sendFeedbackPhp() {
    var feedback_string = document.getElementById("feedback_textarea").value;

    var php_script = rsigserver + 'retigo/feedback/feedback.php';

    $.post(php_script, { field1: feedback_string }, function(result) {
	    //console.log('success ' + feedback_string);
	    setTimeout('alert("Thank you. Your feedback has been sent!");', 2000); 

	});

    $("#feedbackAreaDiv").slideUp("slow");

}

  function highlight_divs() {
    // Diagnostic: used to see where all the divs are
    document.getElementById('div_dataDisplay').style.backgroundColor = "#FFFF00";
    document.getElementById('colorbar_canvas').style.backgroundColor = "#00FF00";
    document.getElementById('colorbar_canvas_windrose').style.backgroundColor = "#00FF00";
    //document.getElementById('colorbar_canvas2').style.backgroundColor = "#00FF00";
    document.getElementById('timebox').style.backgroundColor = "#00FF00";
    //document.getElementById('sliderbox').style.backgroundColor = "#00FF00";
    document.getElementById('time_slider').style.backgroundColor = "#00FF00";
    document.getElementById('table_td1').style.backgroundColor = "#00FF00";
    document.getElementById('table_td2').style.backgroundColor = "#00FF00";
    //document.getElementById('timezoneList').style.backgroundColor = "#00FF00";
    document.getElementById('displayed_data_value').style.backgroundColor = "#00FF00";
    document.getElementById('map_canvas').style.backgroundColor = "#00FF00";
    document.getElementById('display_choice').style.backgroundColor = "#00FF00";
    document.getElementById('var_selector').style.backgroundColor = "#00FFFF";
    document.getElementById('wazup').style.backgroundColor = "#003333";
    document.getElementById('map_size').style.backgroundColor = "#008888";
    document.getElementById('timeseries_size').style.backgroundColor = "#008888";
    document.getElementById('windrose_canvas').style.backgroundColor = "#BB8888";

  }


function isDescendant(parent, child) {
     // is the child part of the parent's tree?
     var node = child.parentNode;
     while (node != null) {
         if (node == parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
}

function setTabIndices() {

  // reset all elements to tabindex = -1, unless they are a child of div_dataDisplay
  allElements = document.getElementsByTagName('*');
  for (eInd=0; eInd<allElements.length; eInd++) {
    thisElem = allElements[eInd];
    if (!isDescendant(document.getElementById('div_dataDisplay'), thisElem)) {
      allElements[eInd].tabIndex = -1;
    }
  }

  document.getElementById('button_back').tabIndex                = 1;
  document.getElementById('export_cferst').tabIndex              = 2;
  document.getElementById('timezoneList').tabIndex               = 3;
  $('#time_slider').attr('tabindex', '4');                      // 4
  $('#time_slider .ui-slider-handle').attr('tabindex',  '5');   // 5
  document.getElementById('home_b').tabIndex                     = 6;
  document.getElementById('hand_b').tabIndex                     = 7;
  document.getElementById('mapOptionButton').tabIndex            = 8;
  document.getElementById('analysisPlotOptionButton').tabIndex   = 9;
  document.getElementById('timeseriesPlotOptionButton').tabIndex = 10;
  //document.getElementById('kmlPlotOptionButton').tabIndex        = 11;
  document.getElementById('connectingLineOptionButton').tabIndex = 12;
  document.getElementById('displaychoiceAll').tabIndex           = 13;
  document.getElementById('displaychoiceSingle').tabIndex        = 14;
  $('#map_size').attr('tabindex', '15');                        // 15
  $('#map_size .ui-slider-handle').attr('tabindex', '16');      // 16
  $('#map_size').attr('tabindex', '17');                        // 17
  $('#map_size .ui-slider-handle').attr('tabindex', '18');      // 18    
  document.getElementById('idSelectAll').tabIndex                = 19;
  document.getElementById('idSelectNone').tabIndex               = 20;

  // ID radio buttons  
  tabindStart = 19;
  for (tabind=tabindStart; tabind<tabindStart+oUserdata.idName.length; tabind++) {
    document.getElementById(oUserdata.idName[tabind-tabindStart]).tabIndex = tabind;
  }

  tabindStart2 = tabindStart + oUserdata.idName.length;										    
  document.getElementById('Average').tabIndex        = tabindStart2;
  document.getElementById('Blocks').tabIndex         = tabindStart2 + 1;

  // timeblock radio buttons
  tabindStart3 = tabindStart2 + 2;
  for (tabind=tabindStart3; tabind<tabindStart3+oTimeblock.indStart.length; tabind++) {
    document.getElementById('timeblockRadio_' + zeroPad(tabind-tabindStart3, 3)).tabIndex = tabind;
  }

  // variable min and max
  tabindStart4 = tabindStart3 + oTimeblock.indStart.length;
  document.getElementById('my_min').tabIndex = tabindStart4;
  document.getElementById('my_max').tabIndex = tabindStart4 + 1;

  // variable list
  tabindStart5 = tabindStart4 + 2;
  document.getElementById('radio0').tabIndex   = tabindStart5 + 0 ;
  document.getElementById('radio1').tabIndex   = tabindStart5 + 1 ;
  document.getElementById('radio2').tabIndex   = tabindStart5 + 2 ;
  document.getElementById('radio3').tabIndex   = tabindStart5 + 3 ;
  document.getElementById('radio4').tabIndex   = tabindStart5 + 4 ;
  document.getElementById('radio5').tabIndex   = tabindStart5 + 5 ;
  document.getElementById('radio6').tabIndex   = tabindStart5 + 6 ;
  document.getElementById('radio7').tabIndex   = tabindStart5 + 7 ;
  document.getElementById('radio8').tabIndex   = tabindStart5 + 8 ;
  document.getElementById('radio9').tabIndex   = tabindStart5 + 9 ;
  document.getElementById('radio10').tabIndex  = tabindStart5 + 10 ;
  document.getElementById('radio11').tabIndex  = tabindStart5 + 11 ;
  document.getElementById('radio12').tabIndex  = tabindStart5 + 12 ;
  document.getElementById('radio13').tabIndex  = tabindStart5 + 13 ;
  document.getElementById('radio14').tabIndex  = tabindStart5 + 14 ;

  // prevent tab stops for certain items
  // RETIGO items
  document.getElementById('var_selector').tabIndex   = -1;
  document.getElementById('error_textarea').tabIndex = -1;
  document.getElementById('marker_b').tabIndex       = -1;
  document.getElementById('line_b').tabIndex         = -1;
  document.getElementById('crop_b').tabIndex         = -1;
  document.getElementById('tb_selector').tabIndex    = -1;
  // EPA items
  //document.getElementById('header').tabIndex         = -1;
  //document.getElementById('logo').tabIndex           = -1;
  //document.getElementById('areaname').tabIndex       = -1;
  //document.getElementById('footer').tabIndex         = -1;
  //document.getElementById('EPAsearch').tabIndex      = -1;
  //document.getElementById('searchbox').tabIndex      = -1;
  //document.getElementById('searchbutton').tabIndex   = -1;
  //document.getElementById('Areaall').tabIndex        = -1;
  //document.getElementById('EPAall').tabIndex         = -1;


}
