function zerofill(array) {
  for (n=0; n<array.length; n++) {
    array[n] = -0;
  }
  return array;
}
