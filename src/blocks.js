#ifndef BLOCKS_JS
#define BLOCKS_JS

Mine.Blocks = {};

Mine.Blocks.Block = function(){
  var block = new Mine.BasicShapes.Cube();
  block._addClass(Mine.Blocks.Block);
  return block;
};


Mine.Blocks.Air = function(){
  var air = new Mine.Blocks.Block();
  air._addClass(Mine.Blocks.Air);
  air.drawMe(false);
  return air
};



Mine.Blocks.Grass = function(){
  var grass = new Mine.Blocks.Block();
  grass._addClass(Mine.Blocks.Grass);
  grass.setTexIndex([0,15]);
  return grass;
};



Mine.Blocks.Brick= function(){
  var brick= new Mine.Blocks.Block();
  brick._addClass(Mine.Blocks.Brick);
  brick.setTexIndex([8,13]);
  return brick;
};


Mine.Blocks. Goomba = function(){
  var goomba= new Mine.Blocks.Block();
  goomba._addClass(Mine.Blocks.Goomba);
  goomba.shape = Mine.Primatives.Square();
  goomba.setTexIndex([12,14]);
  return goomba;
};




Mine.Blocks.types = {
  "":Mine.Blocks.Air,
  "":Mine.Blocks.Grass,
  "":Mine.Blocks.Brick,
  "":Mine.Blocks.Goomba,
};
#endif
