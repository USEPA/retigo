function where(array, target) {
  // search array for the first instance of target, and return the index to it

  var i;

    for (i=0; i<array.length; i++) {
    if (array[i] == target) {
      return i; 
    }
   }

  // didn't find it, return -1
  return -1;

}

