var Mine = {};

Mine.Base = function(){

  var base = {}

  //Holds what classes the object is.
  base._classes = Array();


  //Adds a class to the list of classes the object is.
  base._add_class = function(new_class){
    this._classes.push(new_class);
  }

  //Returns if an object is a member of the given class.
  base._is_a = function(class_name){
    for(a_class in this._classes){

      //If class is found in list, it is one.
      if(class_name == this._classes[a_class]){
        return true;
      }

    }

    //If class is not found ,it is not.
    return false;
  };

  base._add_class(Mine.Base);
  return base;
}



//This will be populated someday :)
Mine.Colors = {
};





Mine.Shader = function(){
  var shader = Mine.Base();
  shader._add_class(Mine.Shader);

  shader.source = "";
  shader.shader = null;

  //This is one hairy bastard...
  shader.compile = function(){
    var gl = Mine.THE_ONE_GL_STAGE.gl;

    //Create the shader.
    if(shader._is_a(Mine.Shader.Fragment)){
      shader.shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else if(shader._is_a(Mine.Shader.Vertex)){
      shader.shader = gl.createShader(gl.VERTEX_SHADER);

    }
    else{
      console.log("Somethings wrong, not known shader type");
    }

    gl.shaderSource(shader.shader, shader.source);
    gl.compileShader(shader.shader);

    if( !gl.getShaderParameter(shader.shader,gl.COMPILE_STATUS)){
      console.log("Shader failed to compile...");
      console.log(gl.getShaderInfoLog(shader.shader));
    }
  }

  return shader;
};





Mine.Shader.Fragment= function(){
  var vertex = Mine.Shader();

  vertex._add_class(Mine.Shader.Fragment);
  return vertex;
}





//A very simple fragment shader.
Mine.Shader.Fragment.Simple = function(){
  var shader = Mine.Shader.Fragment();
  shader.source = "\
    #ifdef GL_ES \n\
    precision highp float; \n\
    #endif \n\
    void main(void) { \
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); \
    }";

  return shader;
}();





Mine.Shader.Vertex = function(){
  var vertex = Mine.Shader();

  vertex._add_class(Mine.Shader.Vertex);
  return vertex;
}





//A very simple vertex shader.
Mine.Shader.Vertex.Simple = function(){
  var shader = Mine.Shader.Vertex();
  shader.source = "\
    attribute vec3 aVertexPosition;\
    \
    uniform mat4 uMVMatrix;\
    uniform mat4 uPMatrix;\
    \
    void main(void) {\
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\
    }\
  ";

  return shader;
}();




Mine.Shader_program = function(){
  var program = Mine.Base();
  program._add_class(Mine.Shader_program);
  program.shaders = [];



  program.init = function(){
    var gl = Mine.THE_ONE_GL_STAGE.gl;
    program.program = gl.createProgram();
  };



  program.add_shader = function(new_shader){
    var gl = Mine.THE_ONE_GL_STAGE.gl;

    gl.attachShader(program.program, new_shader.shader);

  };



  program.link = function(){
    var gl = Mine.THE_ONE_GL_STAGE.gl;
    console.log("Trying to link...");
    gl.linkProgram(program.program);

    if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)){
      console.log("Failed to link program");
      return false;
    }
    else{
      console.log("program linked!!!");
      gl.useProgram(program.program);
      program.program.vertexPositionAttribute = gl.getAttribLocation(program.program, "aVertexPosition");
      //console.log("aVertexPosition: "+program.program.vertexPositionAttribute);
      gl.enableVertexAttribArray(program.program.vertexPositionAttribute);
      program.program.pMatrixUniform = gl.getUniformLocation(program.program,"uPMatrix");
      //console.log(program.program.pMatrixUniform);
      program.program.mvMatrixUniform = gl.getUniformLocation(program.program,"uMVMatrix");
      //console.log(program.program.mvMatrixUniform);
      return true;
    }
  };



  return program;
}



//The one and only shader program.
Mine.shader_program = Mine.Shader_program();




Mine.GL_stage = function(id){
  var gl_stage = Mine.Base();
  gl_stage._add_class(Mine.Gl_stage);

  //Initialize the stage.
  gl_stage.canvas = document.getElementById(id);
  try{
    gl_stage.gl = gl_stage.canvas.getContext("experimental-webgl");
  }
  catch(e){
    console.log("Failed to initialize webgl");
    console.log(e)
  }





  //Clear the stage.
  gl_stage.clear = function(){
    gl_stage.gl.clearColor(0.0, 0.0, 0.0, 1);
    gl_stage.gl.enable(gl_stage.gl.DEPTH_TEST);
    gl_stage.gl.depthFunc(gl_stage.glLEQUAL);
    gl_stage.gl.clear(gl_stage.gl.COLOR_BUFFER_BIT|gl_stage.gl.DEPTH_BUFFER_BIT);
  };


  if(gl_stage.gl){
    //gl_stage.clear();
    gl_stage.gl.viewportWidth = gl_stage.canvas.width;
    gl_stage.gl.viewportHeight = gl_stage.canvas.height;
  }
  else{
    console.log("Failed somehow");
  }

  Mine.THE_ONE_GL_STAGE = gl_stage;
  return gl_stage;
}






// "Main" function :)
$(document).ready(function(){
  //Create the WebGL stage.
  var stage = Mine.GL_stage("minedotjs")

  //Compile the shaders.
  Mine.Shader.Fragment.Simple.compile()
  Mine.Shader.Vertex.Simple.compile()

  //Add the shaders to the shader program.
  Mine.shader_program.init();
  Mine.shader_program.add_shader(Mine.Shader.Fragment.Simple);
  Mine.shader_program.add_shader(Mine.Shader.Vertex.Simple);
  Mine.shader_program.link();

  //Strictly following the tutorial below.
  var gl = Mine.THE_ONE_GL_STAGE.gl;


  var mvMatrix = mat4.create();
  var pMatrix = mat4.create();

  function setMatrixUniforms(){
    gl.uniformMatrix4fv(Mine.shader_program.program.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(Mine.shader_program.program.mvMatrixUniform, false, mvMatrix);
  }

  var triangleDotsBuffer;

  function initBuffers(){
    console.log("Creating the fucking triangle");
    triangleDotsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,triangleDotsBuffer);
    var vertices = [
         0.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleDotsBuffer.itemSize = 3;
    triangleDotsBuffer.numItems = 3;
  }

  function drawScene(){
    console.log("The fucker should be drawn here...");
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, [0.0, 0.0, -5]);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleDotsBuffer);
    //console.log(triangleDotsBuffer);

    gl.vertexAttribPointer(Mine.shader_program.program.vertexPositionAttribute, triangleDotsBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();

    gl.drawArrays(gl.TRIANGLES, 0, triangleDotsBuffer.numItems);
    console.log("It should have drawn...");
  }

  initBuffers();

  gl.clearColor(0.0, 1.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  drawScene();
  
});
