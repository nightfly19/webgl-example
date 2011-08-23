#ifndef colors_js
#define colors_js

Mine.Colors = {
  white:[1.0, 1.0, 1.0, 1.0],
  red:[1.0, 0.0, 0.0, 1.0],
  orange:[1.0, 0.5, 0.0, 1.0],
  yellow:[1.0, 1.0, 0.0, 1.0],
  green:[0.0, 1.0, 0.0, 1.0],
  blue:[0.0, 0.0, 1.0, 1.0],
  indigo:[0.5, 0.0, 1.0, 1.0],
  violet:[1.0, 0.0, 1.0, 1.0],
  black:[0.0, 0.0, 0.0, 1.0],
  fromInts: function(ints){
    var output = [];
    for(i in ints){
      output[i] = ints[i]/255.0;
    }

    return output;
  }
};
#endif
