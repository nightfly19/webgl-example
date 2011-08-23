#ifndef basic_shapes_js
#define basic_shapes_js

Mine.BasicShapes = {};

Mine.BasicShapes.Square = function(){
  var square = Mine.Thing();
  square._addClass(Mine.BasicShapes.Square);

  square.shape = Mine.Primatives.Square();
  return square;
};





Mine.BasicShapes.Cube= function(){
  var cube = Mine.Thing();
  cube._addClass(Mine.BasicShapes.Cube);
  if(!Mine.BasicShapes.Cube.cache){
    Mine.BasicShapes.Cube.cache = Mine.Primatives.Cube();
  }
  cube.shape = Mine.BasicShapes.Cube.cache;
  cube.size = Mine.BasicShapes.Cube.size;
  return cube;
};

Mine.BasicShapes.Cube.size = [2,2,2];

Mine.BasicShapes.Cube.cache = null;

#endif
