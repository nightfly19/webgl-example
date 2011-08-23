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
  var shape = Mine.Blocks.Grass();
  var shape2 = Mine.Blocks.Grass();
  var shape3 = Mine.Blocks.Grass();
  var shape3 = Mine.Blocks.Grass();
  var shape4 = Mine.Blocks.Goomba();
  Mine.dm("Creating a texture");
  var texture = Mine.Texture("terrain", 16, function(test){
    stage.texture = test;
  });
    Mine.perror();
  
  shape.shape.setColor(Mine.Colors.indigo);

  //shape.addRot([0.5, 0.0, 0.0]);
  shape.setPos([0, -2, -10]);
  //shape2.setTexIndex([8,13]);
  shape2.setPos([-2, -2, -10]);
  shape3.setPos([2, -2, -10]);
  shape3.setPos([2, -2, -10]);
  shape4.setPos([2, 0, -10]);
  shape.act = function(){
    //shape.addRot([0.0, 0.05, 0.00]);
  };

  shape2.act = function(){
    //shape2.addRot([0.0, 0.05, 0.00]);
  };
  shape4.act = function(){
    //shape4.addRot([0.0, 0.05, 0.00]);
  };

  stage.add(shape);
  stage.add(shape2);
  stage.add(shape3);
  stage.add(shape4);



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
  },500000);

});
