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
  var gl_stage = stage;
  var colored_shader = Mine.ShaderProgram("colored");

  //Strictly following the tutorial below.



  var shape = Mine.BasicShapes.Square();
  shape.shape.setColor(Mine.Colors.indigo);
  var gl = Mine.gl;


  function drawScene(z_position){
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl_stage.gl.viewportWidth / gl_stage.gl.viewportHeight, 0.1, 100.0, gl_stage.pMatrix);
    mat4.identity(gl_stage.mvMatrix);

    mat4.translate(gl_stage.mvMatrix, [0.0, 0.0, z_position]);

    //Square vertex shit.
    gl.bindBuffer(gl_stage.gl.ARRAY_BUFFER, shape.shape.vBuffer);
    gl.vertexAttribPointer(stage.program.vertexPositionAttribute, shape.shape.vSize, gl.FLOAT, false, 0, 0);

    //Square color shit.
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.shape.cBuffer);
    gl.vertexAttribPointer(stage.program.vertexColorAttribute, shape.shape.cSize, gl.FLOAT, false, 0, 0);
    gl_stage.setUniforms();
  
    //Draw the shape.
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, shape.shape.vCount);
    console.log("It should have drawn...");
  }


  var timer;
  timer = setInterval(function(){
    if(colored_shader.failed){
      clearInterval(timer);
      console.log("Shader failed to compile...");
    }

    if(colored_shader.loaded){
      clearInterval(timer);
      console.log("Moving on");
      stage.setProgram(colored_shader);
      gl.clearColor(0.0, 1.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      shape.addRot([0.0, 0.0, 0.5]);
      var test = setInterval(function(){

      //Draw the scene.
      mat4.perspective(45, gl_stage.gl.viewportWidth / gl_stage.gl.viewportHeight, 0.1, 100.0, gl_stage.pMatrix);

      shape.setPos([0, 0, -10]);
      shape.addRot([0.0, 0.05, 0]);
      //shape.setRot([0,1,0]);
      gl_stage.clear();
      //mat4.identity(gl_stage.mvMatrix);
      gl_stage.draw(shape);
      },1000/30);
    }
    else{
      console.log("Waiting for shader");
    }
  },100);
  
});
