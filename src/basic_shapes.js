#ifndef basic_shapes_js
#define basic_shapes_js

Mine.BasicShapes = {};

Mine.BasicShapes.Square = function(){
  var square = Mine.Thing();
  square._add_class(Mine.BasicShapes.Square);

  square.shape = Mine.Primatives.Square();
  return square;
};





Mine.BasicShapes.Cube= function(){
  var cube = Mine.Thing();
  cube._add_class(Mine.BasicShapes.Cube);

  cube.shape = Mine.Primatives.Cube();
  cube.size = [2,2,2];
  return cube;
};

#endif
