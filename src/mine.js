var Mine = {};
Mine.RESOURCE_LOCATION = "resources";

#include "base.js"
#include "shaders.js"
#include "primatives.js"
#include "stage.js"




// "Main" function :)
$(document).ready(function(){
  //Create the WebGL stage.
  var stage = Mine.GL_stage("minedotjs")
  var gl_stage = stage;
  var colored_shader = Mine.ShaderProgram("colored");

  //Strictly following the tutorial below.
  var gl = Mine.THE_ONE_GL_STAGE.gl;




  var triangleDotsBuffer;
  var triangleColorBuffer;

  function initBuffers(){
    console.log("Creating the fucking triangle");
    triangleDotsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleDotsBuffer);
    var vertices = [
         0.0,  1.0,  -3.0,
        -1.0, -1.0,  3.0,
         1.0, -1.0,  0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleDotsBuffer.itemSize = 3;
    triangleDotsBuffer.numItems = 3;

    triangleColorBuffer=  gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleColorBuffer);
    var colors = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 1.0, 1.0,
      0.0, 0.0, 0.0, 1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colors), gl.STATIC_DRAW);
    triangleColorBuffer.itemSize = 4;
    triangleColorBuffer.numItems = 3;
  }

  function drawScene(z_position){
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl_stage.gl.viewportWidth / gl_stage.gl.viewportHeight, 0.1, 100.0, gl_stage.pMatrix);
    mat4.identity(gl_stage.mvMatrix);

    mat4.translate(gl_stage.mvMatrix, [0.0, 0.0, z_position]);
    gl.bindBuffer(gl_stage.gl.ARRAY_BUFFER, triangleDotsBuffer);

    gl.vertexAttribPointer(stage.program.vertexPositionAttribute, triangleDotsBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorBuffer);
    gl.vertexAttribPointer(stage.program.vertexColorAttribute, triangleColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl_stage.setUniforms();

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, triangleDotsBuffer.numItems);
    console.log("It should have drawn...");
  }

  initBuffers();
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
