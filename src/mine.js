var Mine = {};
Mine.RESOURCE_LOCATION = "resources";

#include "base.js"
#include "shaders.js"
#include "primatives.js"
#include "thing.js"
#include "stage.js"




// "Main" function :)
$(document).ready(function(){
  //Create the WebGL stage.
  var stage = Mine.GL_stage("minedotjs")
  var gl_stage = stage;
  var colored_shader = Mine.ShaderProgram("colored");

  //Strictly following the tutorial below.



  var shape = Mine.Primatives.Triangle();
  var gl = Mine.gl;


  function drawScene(z_position){
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl_stage.gl.viewportWidth / gl_stage.gl.viewportHeight, 0.1, 100.0, gl_stage.pMatrix);
    mat4.identity(gl_stage.mvMatrix);

    mat4.translate(gl_stage.mvMatrix, [0.0, 0.0, z_position]);

    //Square vertex shit.
    gl.bindBuffer(gl_stage.gl.ARRAY_BUFFER, shape.vBuffer);
    gl.vertexAttribPointer(stage.program.vertexPositionAttribute, shape.vSize, gl.FLOAT, false, 0, 0);

    //Square color shit.
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.cBuffer);
    gl.vertexAttribPointer(stage.program.vertexColorAttribute, shape.cSize, gl.FLOAT, false, 0, 0);
    gl_stage.setUniforms();
  
    //Draw the shape.
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, shape.vCount);
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
      var z_position = -1;
      var z_speed = -1;
      var z_min = -50;
      var z_max = -1;
      var test = setInterval(function(){
        z_position += z_speed;
        if(z_position > z_max){
          z_position = z_max;
          z_speed = -1;
        }
        if(z_position < z_min){
          z_position = z_min;
          z_speed = 1;
          clearInterval(test);
        }
      drawScene(z_position);
      },1000/30);
    }
    else{
      console.log("Waiting for shader");
    }
  },100);
  
});
