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
      console.log("Compiling a fragment shader");
      shader.shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else if(shader._is_a(Mine.Shader.Vertex)){
      console.log("Compiling a vertex shader");
      shader.shader = gl.createShader(gl.VERTEX_SHADER);

    }
    else{
      console.log("Somethings wrong, not known shader type");
    }

    console.log("Compling the shader...");
    gl.shaderSource(shader.shader, shader.source);
    gl.compileShader(shader.shader);
    console.log(shader.shader);

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
    void  main(void) { \
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); \
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

    //backup the current working program and create a new one.
    var old_program = program.program;
    program.init();

    //Add all the confirmed working shaders to the new program.
    for(shader in program.shaders){
      gl.attachShader(program.program, program.shaders[shader].shader);
    }

    //Add the new shader to the new program.
    gl.attachShader(program.program, new_shader.shader);

    console.log("Trying to link new program...");
    if(! program.link){
      console.log("Failed to link new program");
      program.program = old_program;
    }

    //It worked, lets use it.
    else{
      gl.useProgram(program.program);

      //GLOBAL ALERT!!!
      vertexPositionAttribute = gl.getAttribLocation(program.program, "aVertexPosition");
      gl.enableVertexAttribArray(vertexPositionAttribute);

    }
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
    gl_stage.clear();
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

  //Hacky test below to see if I can even follow directions...
  
  var horizAspect = 480.0/640.0
  var init_buffers = function(){
    var gl = Mine.THE_ONE_GL_STAGE.gl;
    squareVerticesBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

    var vertices = [
       1.0,  1.0, 0.0,
      -1.0,  1.0, 0.0,
       1.0, -1.0, 0.0,
      -1.0, -1.0, 0.0
        ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  };

  var draw_scene = function(){
    var gl = Mine.THE_ONE_GL_STAGE.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

    //loadIdentity();
    //mvTranslate([-0.0, 0.0, -6.0]);
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    //setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  init_buffers();
  draw_scene();

  
});
