var Mine = {};
Mine.RESOURCE_LOCATION = "resources";

#include "base.js"
#include "colors.js"
#include "shaders.js"
#include "primatives.js"
#include "thing.js"
#include "basic_shapes.js"
#include "stage.js"

// "Main" function :)
$(document).ready(function(){
  //Create the WebGL stage.
  var stage = Mine.GL_stage("minedotjs")
  var colored_shader = Mine.ShaderProgram("colored");
  var shape = Mine.BasicShapes.Cube();
  
  shape.shape.setColor(Mine.Colors.indigo);
  shape.addRot([0.0, 0.0, 0.5]);
  shape.act = function(){
    shape.setPos([0, 0, -10]);
    shape.addRot([0.0, 0.05, 0]);
  };

  stage.add(shape);

  colored_shader.waitFor(function(){
    stage.setProgram(colored_shader);
    stage.run();
  });
 
});
