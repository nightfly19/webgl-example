var Mine = {};
Mine.RESOURCE_LOCATION = "resources";
//Base class begins here.
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
//Shaders begin here. 
Mine.ShaderProgram = function(shader_name){
  var shader = Mine.Base();
  shader._add_class(Mine.ShaderProgram);
  var shader_location = Mine.RESOURCE_LOCATION+"/shaders/";
  console.log("Loading shader: "+shader_name);
  shader.loaded = false;
  shader.failed = false;
  shader.program = null;
  //Get and compile fragment shader.
  $.get(shader_location+shader_name+".fragment.shader",{},
      function(data){
        var fragment_shader = shader.compile(data,"fragment");
        if(fragment_shader){
          //console.log("Fragment shader compiled");
          //Get and compile vertex shader.
          $.get(shader_location+shader_name+".vertex.shader",{},
            function(data){
              var vertex_shader = shader.compile(data,"vertex");
              if(vertex_shader){
                //console.log("Fragment shader compiled");
                //Build the shader program.
                var gl = Mine.THE_ONE_GL_STAGE.gl;
                var shader_program = gl.createProgram();
                gl.attachShader(shader_program, fragment_shader);
                gl.attachShader(shader_program, vertex_shader);
                //console.log("Trying to link...");
                gl.linkProgram(shader_program);
                if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)){
                  console.log("Failed to link program");
                  shader.failed = true;
                }
                else{
                  //console.log("program linked!!!");
                  shader.program = shader_program;
                  shader.loaded = true;
                }
              }
              else{
                console.log("Failed to compile vertex shader...");
                shader.failed = true;
              }
            },"html");
        }
        else{
          console.log("Failed to compile fragment shader...");
          shader.failed = true;
        }
      },"html");
  shader.shader = null;
  //This is one hairy bastard...
  shader.compile = function(shader_source,type){
    //console.log("Compiling shader");
    var gl = Mine.THE_ONE_GL_STAGE.gl;
    var new_shader;
    //Create the shader.
    if(type == "fragment"){
      //console.log("Fragment shader");
      new_shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else if(type == "vertex"){
      //console.log("Vertex shader");
      new_shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else{
      console.log("Somethings wrong, not known shader type");
    }
    gl.shaderSource(new_shader, String(shader_source));
    gl.compileShader(new_shader);
    if( !gl.getShaderParameter(new_shader,gl.COMPILE_STATUS)){
      console.log("Shader failed to compile...");
      console.log(gl.getShaderInfoLog(new_shader));
      return null;
    }
    else{
      return new_shader;
    }
  }
  return shader;
};
/*
Mine.ShaderProgram = function(){
  var program = Mine.Base();
  program._add_class(Mine.ShaderProgram);

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

      //Vertex position.
      program.program.vertexPositionAttribute = gl.getAttribLocation(program.program, "aVertexPosition");
      gl.enableVertexAttribArray(program.program.vertexPositionAttribute);

      //Vertex color.
      program.program.vertexColorAttribute = gl.getAttribLocation(program.program, "aVertexColor");
      gl.enableVertexAttribArray(program.program.vertexColorAttribute);


      program.program.pMatrixUniform = gl.getUniformLocation(program.program,"uPMatrix");
      program.program.mvMatrixUniform = gl.getUniformLocation(program.program,"uMVMatrix");
      return true;
    }
  };



  return program;
}
*/
//Begin primatives.
Mine.Primatives = {};
//False when a WebGL context hasn't been initialized.
Mine.Primatives.ready = false;
//To be ran when a WebGL context is initialized for the first time.
Mine.Primatives.GlInit = function(){
  if(!Mine.Primatives.ready){
    var gl = Mine.THE_ONE_GL_STAGE;
    Mine.Primatives.Types = {"TRIANGLE_STRIP":gl.TRIANGLE_STRIP,"tootsie":1};
    console.log(Mine.Primatives.Types.felix)
    Mine.Primatives.ready = true;
  }
}
Mine.Primatives.Primative = function(){
  var primative = Mine.Base();
  primative._add_class(Mine.Primatives.Primative);
  primative.vertices = [];
  primative.vCount = 0;
  primative.vSize = 3;
  primative.type = null;
  primative.buffer = null;
  return primative;
};
Mine.Primatives.Triangle = function(){
  var triangle = Mine.Primatives.Primative();
  triangle._add_class(Mine.Primatives.Triangle);
  triangle.vertices = [
     0.0, 1.0, -3.0,
    -1.0, -1.0, 3.0,
     1.0, -1.0, 0.0
  ];
  triangle.vCount = 3;
  //Creating and filling the buffer.
  triangle.vBuffer = Mine.gl.createBuffer();
  Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER,triangle.vBuffer);
  Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(triangle.vertices), gl.STATIC_DRAW);
  return triangle;
};
Mine.Primatives.Cube = function(){
  var cube = Mine.Primatives.Primative();
  primatives.add_class(Mine.Primatives.Cube);
  return cube;
}
//Stage begins here.
Mine.GL_stage = function(id){
  var gl_stage = Mine.Base();
  gl_stage._add_class(Mine.Gl_stage);
  //Fields
  gl_stage.canvas = null;
  gl_stage.gl = null;
  gl_stage.program = null;
  gl_stage.mvMatrix = mat4.create();
  gl_stage.pMatrix = mat4.create();
  //Get the canvas.
  gl_stage.canvas = document.getElementById(id);
  //Try and initialize WebGL.
  try{
    gl_stage.gl = gl_stage.canvas.getContext("experimental-webgl");
    Mine.gl = gl_stage.gl;
    Mine.Primatives.GlInit();
  }
  catch(e){
    console.log("Failed to initialize webgl");
    console.log(e)
  }
  //Set the current shader program.
  gl_stage.setProgram = function(active_program){
    gl_stage.program = active_program.program;
    gl_stage.gl.useProgram(active_program.program);
    //Vertex position.
    gl_stage.program.vertexPositionAttribute = gl_stage.gl.getAttribLocation(gl_stage.program, "aVertexPosition");
    gl_stage.gl.enableVertexAttribArray(gl_stage.program.vertexPositionAttribute);
    //Vertex color.
    gl_stage.program.vertexColorAttribute = gl_stage.gl.getAttribLocation(gl_stage.program, "aVertexColor");
    gl_stage.gl.enableVertexAttribArray(gl_stage.program.vertexColorAttribute);
    gl_stage.program.pMatrixUniform = gl_stage.gl.getUniformLocation(gl_stage.program,"uPMatrix");
    gl_stage.program.mvMatrixUniform = gl_stage.gl.getUniformLocation(gl_stage.program,"uMVMatrix");
  };
  //Set the uniforms.
  gl_stage.setUniforms = function(){
    gl_stage.gl.uniformMatrix4fv(gl_stage.program.pMatrixUniform, false, gl_stage.pMatrix);
    gl_stage.gl.uniformMatrix4fv(gl_stage.program.mvMatrixUniform, false, gl_stage.mvMatrix);
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
         0.0, 1.0, -3.0,
        -1.0, -1.0, 3.0,
         1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleDotsBuffer.itemSize = 3;
    triangleDotsBuffer.numItems = 3;
    triangleColorBuffer= gl.createBuffer();
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
