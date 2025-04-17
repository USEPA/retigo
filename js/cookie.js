function checkCookie(cookieName) {
    var thisValue = getCookie(cookieName);
    var returl_val;
    if (thisValue != "") {
	//console.log("cookie", cookieName, "=", thisValue==="true");
	return_val = thisValue==="true";
    } else {
	setCookie(cookieName, true, 365);
	return_val = true;
    }

    return return_val;
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
