#ifndef basic_shapes_js
#define basic_shapes_js

Mine.BasicShapes = {};

Mine.BasicShapes.Square = function(){
  var square = Mine.Thing();
  square._add_class(Mine.BasicShapes.Square);

  square.shape = Mine.Primatives.Square();
  return square;
}

#endif
