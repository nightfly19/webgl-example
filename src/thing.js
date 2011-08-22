#ifndef THING_JS
#define THING_JS
Mine.Thing = function(){
  var thing = Mine.Base();
  thing._add_class(Mine.Thing);
  thing.position = [0,0,0];
  thing.rotation = [0,0,0];

  
  thing.shape = null;



  thing.movePos = function(movement){
    for(i in thing.position){
      thing.position[i] += movement[i];
    }
  };



  thing.setPos = function(new_pos){
    thing.position = new_pos;
  };



  thing.getPos = function(){
    return thing.position;
  };



  thing.getRot = function(){
    return thing.rotation;
  };

  return thing;
};
#endif
