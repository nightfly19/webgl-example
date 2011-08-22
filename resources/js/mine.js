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
//Mine.Primatives.ready = false;
Mine.Primatives.Types = ["TRIANGLE_STRIP"];
Mine.Primatives.Primative = function(){
  var primative = Mine.Base();
  primative._add_class(Mine.Primatives.Primative);
  primative.vertices = [];
  primative.type = null;
  primative.vertices = [];
  primative.vBuffer = Mine.gl.createBuffer();
  primative.vCount = 0;
  primative.vSize = 3;
  primative.colors = false;
  primative.cBuffer = Mine.gl.createBuffer();
  primative.cCount = 0;
  primative.cSize = 4;
  primative.setColor = function(new_color){
    if(!primative.colors){
      primative.colors = Array(primative.cCount * primative.cSize);
    }
    for(var i = 0; i < primative.cCount * primative.cSize; i++){
      primative.colors[i] = new_color[i%primative.cSize];
    }
    Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, primative.cBuffer);
    console.log(primative.colors);
    Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(primative.colors), Mine.gl.STATIC_DRAW);
  };
  return primative;
};
Mine.Primatives.Triangle = function(){
  var triangle = Mine.Primatives.Primative();
  triangle._add_class(Mine.Primatives.Triangle);
  //Filling the vBuffer.
  triangle.vertices = [
     0.0, 1.0, 0.0,
    -1.0, -1.0, 0.0,
     1.0, -1.0, 0.0
  ];
  triangle.vCount = 3;
  Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER,triangle.vBuffer);
  Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(triangle.vertices), Mine.gl.STATIC_DRAW);
  //Color the triangle.
  triangle.cCount = triangle.vCount;
  triangle.setColor([1.0, 0.0, 0.0, 1.0]);
  console.log(triangle.colors);
  console.log("I made a triangle.");
  return triangle;
};
Mine.Primatives.Square = function(){
  var square = Mine.Primatives.Primative();
  square._add_class(Mine.Primatives.Square);
  square.vertices = [
     1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
     1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
  square.vCount = 4;
  //Creating and filling the buffer.
  square.vBuffer = Mine.gl.createBuffer();
  Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER,square.vBuffer);
  Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(square.vertices), Mine.gl.STATIC_DRAW);
  console.log("I made a square.");
  return square;
};
Mine.Primatives.Cube = function(){
  var cube = Mine.Primatives.Primative();
  primatives.add_class(Mine.Primatives.Cube);
  return cube;
}
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
  //try{
    gl_stage.gl = gl_stage.canvas.getContext("experimental-webgl");
    Mine.gl = gl_stage.gl;
  //}
  //catch(e){
  //  console.log("Failed to initialize webgl");
  //  console.log(e)
  //}
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
  gl_stage.draw = function(target){
    if(target._is_a(Mine.Thing)){
      console.log("Drawing a thing");
    }
  };
  //Constructor stuff.
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
