#ifndef BLOCKS_JS
#define BLOCKS_JS

Mine.Blocks = {};

Mine.Blocks.Block = function(){
  var block = new Mine.BasicShapes.Cube();
  block._add_class(Mine.Blocks.Block);
  return block;
};

Mine.Blocks.Grass = function(){
  var grass = new Mine.Blocks.Block();
  grass._add_class(Mine.Blocks.Grass);
  grass.setTexIndex([0,15]);
  return grass;
};

Mine.Blocks.Goomba= function(){
  var goomba= new Mine.Blocks.Block();
  goomba._add_class(Mine.Blocks.Goomba);
  goomba.shape = Mine.Primatives.Square();
  goomba.setTexIndex([12,14]);
  return goomba;
};
#endif
