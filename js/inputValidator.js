// Javascript function used for validating text input


// disable paste events
function disablePaste(evt) {
  evt.preventDefault();
}



// validate keypress input for characters allowed in NAMES
function validateKeyName(evt) {
  // for validating allowed characters
  var theEvent = evt || window.event;	
  var key = theEvent.keyCode || theEvent.which;
  var keystring = String.fromCharCode( key );
  
  var regex = /[A-Za-z .]|\-|\t/;

  //debug(key + ' ' + keystring);
  //debug(evt.keyCode);

  if(key === 37 || key === 38 || key === 39 || key === 40 || key === 8 || key === 46) { // Left, Up, Right, Down Arrow, Backspace, Delete keys
    // some characters have the same code as the arrows, but have a keyCode of 0
    if(evt.keyCode == 0) {
	if( !regex.test(keystring) ) {
	    theEvent.preventDefault();
	}
    }
  } else {
    // make sure we only have letters, spaces, hyphens, or tabs
    if( !regex.test(keystring) ) {
      theEvent.preventDefault();
    }
  }
}


// validate keypress input for characters allowed in PARAGRAPH
function validateKeyParagraph(evt) {
  // for validating allowed characters
  var theEvent = evt || window.event;	
  var key = theEvent.keyCode || theEvent.which;
  var keystring = String.fromCharCode( key );
  
  //debug(key + ' ' + keystring);
  //debug(evt.keyCode);

  var regex = /[A-Za-z0-9 .]|\-|\t/;

  if(key === 37 || key === 38 || key === 39 || key === 40 || key === 8 || key === 46) { // Left, Up, Right, Down Arrow, Backspace, Delete keys
    // some characters have the same code as the arrows, but have a keyCode of 0
    if(evt.keyCode == 0) {
      	if( !regex.test(keystring) ) {
	    theEvent.preventDefault();
	}
    }
  } else {
    // make sure we only have letters, spaces, hyphens, or tabs
    if( !regex.test(keystring) ) {
      theEvent.preventDefault();
    }
  }
}


// validate keypress input for characters allowed in email addresses
function validateKeyEmail(evt) {
  // for validating allowed characters
  var theEvent = evt || window.event;	
  var key = theEvent.keyCode || theEvent.which;
  var keystring = String.fromCharCode( key );
  
  //debug(key + ' ' + keystring);
  //debug(evt.keyCode);

  if(key === 37 || key === 38 || key === 39 || key === 40 || key === 8 || key === 46) { // Left, Up, Right, Down Arrow, Backspace, Delete keys
    // some characters have the same code as the arrows, but have a keyCode of 0
    if(evt.keyCode == 0 && key != 46) { // 46 = delete and dot
      theEvent.preventDefault();
    }
  } else {
    // make sure we only have letters, spaces, or hyphens
    var regex = /[A-Za-z0-9]|\t|\.|\-|\@|\+|\_|\$|\(|\)/;
    if( !regex.test(keystring) ) {
      theEvent.preventDefault();
    }
  }
}


// validate keypress input for characters allowed in phone numbers
function validateKeyPhone(evt) {
  // for validating allowed characters
  var theEvent = evt || window.event;	
  var key = theEvent.keyCode || theEvent.which;
  var keystring = String.fromCharCode( key );
  
  //debug(key + ' ' + keystring);
  //debug(evt.keyCode);

  if(key === 37 || key === 38 || key === 39 || key === 40 || key === 8 || key === 46) { // Left, Up, Right, Down Arrow, Backspace, Delete keys
    // some characters have the same code as the arrows, but have a keyCode of 0
    if(evt.keyCode == 0 && key != 40) { // 40 = down arrow and left parenthesis
      theEvent.preventDefault();
    }
  } else {
    // make sure we only have numbers, parentheses, and dashes
    var regex = /[0-9]|\x|\+|\t|\-|\(|\)/;
    if( !regex.test(keystring) ) {
      theEvent.preventDefault();
    }
  }
}
