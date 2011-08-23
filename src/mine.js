var Mine = {};
Mine.RESOURCE_LOCATION = "resources";

#include "base.js"
#include "colors.js"
#include "shaders.js"
#include "primatives.js"
#include "thing.js"
#include "basic_shapes.js"
#include "blocks.js"
#include "stage.js"
#include "texture.js"

Mine.debug = true;
Mine.debug = false;

Mine.perror = function(force){
  if(!Mine.debug && !force){
    return;
  }

  var getError = function(){
    try{
      throw Error('')
    }
    catch(err){
      return err;
    }
  }
  var err = getError();
  var error = Mine.gl.getError();
  var temp = err.stack;
  if(force || error != 0){
    console.log("Checking for errors "+(temp.split("\n")[4]));
    console.log("\t"+error);
    console.log("\t"+WebGLDebugUtils.glEnumToString(error));
  }
};



Mine.dm = function(message){
  if(!Mine.debug){
    return;
  }

  console.log(message);
};



// "Main" function :)
$(document).ready(function(){
  //Create the WebGL stage.
  var stage = Mine.GL_stage("minedotjs");
  var shader = Mine.ShaderProgram("textured");
  var shape = Mine.Blocks.Goomba();
  //shape.drawMe(false);
  Mine.dm("Creating a texture");
  var texture = Mine.Texture("terrain", 16, function(test){
    stage.texture = test;
  });
    Mine.perror();
  
  shape.shape.setColor(Mine.Colors.indigo);

  //shape.addRot([0.5, 0.0, 0.0]);
  shape.setPos([0, -1, -10]);
  //shape2.setTexIndex([8,13]);


  shape.act = function(){
    shape.movePos([-0.1, 0, 0]);
  };
  stage.add(shape);



  //Run the simulation.
  shader.waitFor(function(){
    stage.setProgram(shader);
    setTimeout(function(){
      stage.run();
    },100);
  });

  //Stop the simulation after 5 seconds.
  setTimeout(function(){
    stage.end();
    Mine.dm("Stoping the stage.");
  },5000);

});
