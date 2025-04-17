
var satelliteShowWarningFlag              = true; // default
var scatterplotCorrectionShowWarningFlag  = true; // default
var scatterplotHourlyPopupFlag            = true; // default
var mergeFilestreamsPopupFlag             = true; // default
var dialogResponse                        = false; // default. true=ok, false=cancel
var scatterplotHourlyDialogOpen           = false;

// Entry point
function openEmvlDialog(dialogID) {

    if (dialogID == "dialog-confirm-viirs" && $("#dialog-confirm-viirs").css("display") == 'none') {
        openViirsDialog();
        $(".ui-dialog").css("z-index", 40000);
    } else if (dialogID == "dialog-scatterplot-correction" && $("#dialog-scatterplot-correction").css("display") == 'none') {
        openScatterplotCorrectionDialog();
        $(".ui-dialog").css("z-index", 40000);
    } else if (dialogID == "dialog-scatterplot-hourly" && $("#dialog-scatterplot-hourly").css("display") == 'none') {
        openScatterplotHourlyDialog();
        $(".ui-dialog").css("z-index", 40000);
    } else if (dialogID == "dialog-export-kml" && $("#dialog-export-kml").css("display") == 'none') {
        openExportKmlDialog();
        $(".ui-dialog").css("z-index", 40000);
    } else if (dialogID == "dialog-merge-filestreams" && $("#dialog-merge-filestreams").css("display") == 'none') {
        openMergeFilestreamsDialog();
        $(".ui-dialog").css("z-index", 40000);
    } else if (dialogID == "wiz-dialog-columnNames" && $("#wiz-dialog-columnNames").css("display") == 'none') {
        openWizDialogColumnNames();
        $(".ui-dialog").css("z-index", 40000);
    } else if (dialogID == "wiz-dialog-timeConvert" && $("#wiz-dialog-timeConvert").css("display") == 'none') {
        openWizDialogTimeConvert();
        $(".ui-dialog").css("z-index", 40000);
    }   

    return dialogResponse;
}




// Specific dialogs go below 



// SCATTERPLOT HOURLY //////////////////////////////////
function openScatterplotHourlyDialog() {
    
    // NOTE: corresponding HTML entity must be defined in retigo_1.html
    
    // Define the Dialog and its properties.
    $("#dialog-scatterplot-hourly").dialog({
        resizable: false,
        modal: true,
        autoOpen: false,
        title: "RETIGO Information",
        height: 400,
        width: 400,
	create: function (e, ui) {
            var pane = $(this).dialog("widget").find(".ui-dialog-buttonpane")
            $("<label class='dialogOptoutScatterplotHourly' style='float:left; display:inline-block;margin-top:1em;'><input  type='checkbox' unchecked/>&nbsp;&nbsp;Do not show this message again for this session</label>").prependTo(pane)
        },
        buttons: {
            "Ok": function () {
                $(this).dialog('destroy');
            }
        }
    });
    
    if (!$("#dialog-scatterplot-hourly").dialog("isOpen")) {
        $("#dialog-scatterplot-hourly").dialog("open");
    }
}
$(document).on("change", ".dialogOptoutScatterplotHourly input", function () {
    scatterplotHourlyPopupFlag = !(this.checked);       
})
// End of SCATTERPLOT HOURLY ///////////////////////////


// VIIRS ///////////////////////////////////////////////////
function openViirsDialog() {
    
    // NOTE: corresponding HTML entity must be defined in retigo_1.html
    
    // Define the Dialog and its properties.
    $("#dialog-confirm-viirs").dialog({
        resizable: false,
        modal: true,
        autoOpen: false,
        title: "RETIGO Information",
        height: 400,
        width: 400,
	create: function (e, ui) {
            var pane = $(this).dialog("widget").find(".ui-dialog-buttonpane")
            $("<label class='dialogOptoutViirs' style='float:left; display:inline-block;margin-top:1em;'><input  type='checkbox' unchecked/>&nbsp;&nbsp;Do not show this message again for this session</label>").prependTo(pane)
        },
        buttons: {
            "Ok": function () {
                $(this).dialog('destroy');
            }
        }
    });
    
    if (!$("#dialog-confirm-viirs").dialog("isOpen")) {
        $("#dialog-confirm-viirs").dialog("open");
    }
    
}      
$(document).on("change", ".dialogOptoutViirs input", function () {
    satelliteShowWarningFlag = !(this.checked);       
})
// End of VIIRS ////////////////////////////////////////////



// SCATTERPLOT CORRECTION //////////////////////////////////
function openScatterplotCorrectionDialog() {
    
    // NOTE: corresponding HTML entity must be defined in retigo_1.html
    
    // Define the Dialog and its properties.
    $("#dialog-scatterplot-correction").dialog({
        resizable: false,
        modal: true,
        autoOpen: false,
        title: "RETIGO Information",
        height: 400,
        width: 400,
	create: function (e, ui) {
            var pane = $(this).dialog("widget").find(".ui-dialog-buttonpane")
            //$("<label class='dialogOptoutScatterplotCorrection' style='float:left; display:inline-block;margin-top:1em;'><input  type='checkbox' unchecked/>&nbsp;&nbsp;Do not show this message again for this session</label>").prependTo(pane)
        },
        buttons: {
            "Ok": function () {
                dt = document.getElementById("dialog-scatterplot-correction").innerHTML;
                if (dt.indexOf("invalid") == -1) {
                    process_scatterplot_correction();
                }
                $(this).dialog('destroy');
            },
            "Cancel": function() {
                $(this).dialog('destroy');
            }
            
        }
    });
    
    if (!$("#dialog-scatterplot-correction").dialog("isOpen")) {
        $("#dialog-scatterplot-correction").dialog("open");
    }
}
$(document).on("change", ".dialogOptoutScatterplotCorrection input", function () {
    scatterplotCorrectionShowWarningFlag = !(this.checked);       
})
// End of SCATTERPLOT CORRECTION ///////////////////////////




// KML EXPORT //////////////////////////////////////////////

function openExportKmlDialog() {

    // NOTE: corresponding HTML entity must be defined in retigo_1.html
    
    // Define the Dialog and its properties.
    $("#dialog-export-kml").dialog({
        resizable: false,
        modal: true,
        autoOpen: false,
        title: "RETIGO Information",
        height: 400,
        width: 400,
        create: function (e, ui) {
            var pane = $(this).dialog("widget").find(".ui-dialog-buttonpane")
            
        },
        buttons: {
            "Export": function () {
                dt = document.getElementById("dialog-export-kml").innerHTML;
                if (dt.indexOf("invalid") == -1) {
                    mslVarname         = "";
                    groundlevelVarname = "";
                    colorbarsize       = document.getElementById("kml-export-varselector_colorbarsize").value;

                    if (kml_hasElevations) {
                        mslVarname         = document.getElementById("kml-export-varselector_msl").value;
                        groundlevelVarname = document.getElementById("kml-export-varselector_groundlevel").value;
                    }
                    //console.log(kml_hasElevations);
                    export_kml(mslVarname, groundlevelVarname, colorbarsize);
                }
                $(this).dialog('destroy');
            },
            "Cancel": function() {
                $(this).dialog('destroy');
            }
            
        }
    });
    
    if (!$("#dialog-export-kml").dialog("isOpen")) {
        $("#dialog-export-kml").dialog("open");
    }
}
//$(document).on("change", ".dialogOptoutScatterplotCorrection input", function () {
//    scatterplotCorrectionShowWarningFlag = !(this.checked);       
//})

// End of KML EXPORT ///////////////////////////////////////


// MERGE FILESTREAMS //////////////////////////////////
function openMergeFilestreamsDialog() {
    
    // NOTE: corresponding HTML entity must be defined in retigo_1.html
    
    // Define the Dialog and its properties.
    $("#dialog-merge-filestreams").dialog({
        resizable: false,
        modal: true,
        autoOpen: false,
        title: "RETIGO Information",
        height: 400,
        width: 400,
	create: function (e, ui) {
            var pane = $(this).dialog("widget").find(".ui-dialog-buttonpane")
            $("<label class='dialogOptoutScatterplotHourly' style='float:left; display:inline-block;margin-top:1em;'><input  type='checkbox' unchecked/>&nbsp;&nbsp;Do not show this message again for this session</label>").prependTo(pane)
        },
        buttons: {
            "Ok": function () {
                $(this).dialog('destroy');
            }
        }
    });
    
    if (!$("#dialog-merge-filestreams").dialog("isOpen")) {
        $("#dialog-merge-filestreams").dialog("open");
    }
}
$(document).on("change", ".dialogOptoutMergeFilestreams input", function () {
    mergeFilestreamsPopupFlag = !(this.checked);       
})
// End of MERGE FILESTREAMS ///////////////////////////



// WIZ dialog s//////////////////////////////////
function openWizDialogColumnNames() {
    
    // NOTE: corresponding HTML entity must be defined in datawizard.html
    
    // Define the Dialog and its properties.
    $("#wiz-dialog-columnNames").dialog({
        resizable: false,
        modal: true,
        autoOpen: false,
        title: "RETIGO Information",
        width: 400,
	create: function (e, ui) {
            var pane = $(this).dialog("widget").find(".ui-dialog-buttonpane")
        },
        buttons: {
            "Accept": function () {
                wizFinalizeColumnSelections('ok');
                $(this).dialog('destroy');
            },
            "Cancel": function () {
                wizFinalizeColumnSelections('cancel');
                $(this).dialog('destroy');
            }
        }
    });
    
    if (!$("#wiz-dialog-columnNames").dialog("isOpen")) {
        $("#wiz-dialog-columnNames").dialog("open");
    }
}

function openWizDialogTimeConvert() {
    
    // NOTE: corresponding HTML entity must be defined in datawizard.html
    
    // Define the Dialog and its properties.
    $("#wiz-dialog-timeConvert").dialog({
        resizable: false,
        modal: true,
        autoOpen: false,
        title: "RETIGO Information",
        width: 400,
	create: function (e, ui) {
            var pane = $(this).dialog("widget").find(".ui-dialog-buttonpane")
        },
        buttons: {
            "Accept": function () {
                wizFinalizeTimeConvert('ok');
                $(this).dialog('destroy');
            },
            "Cancel": function () {
                wizFinalizeTimeConvert('cancel');
                $(this).dialog('destroy');
            }
        }
    });
    
    if (!$("#wiz-dialog-timeConvert").dialog("isOpen")) {
        $("#wiz-dialog-timeConvert").dialog("open");
    }
}
    
// End of WIZ dialogs ///////////////////////////



