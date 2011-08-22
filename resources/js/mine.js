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
Mine.Colors = {
  white:[1.0, 1.0, 1.0, 1.0],
  red:[1.0, 0.0, 0.0, 1.0],
  orange:[1.0, 0.5, 0.0, 1.0],
  yellow:[1.0, 1.0, 0.0, 1.0],
  green:[0.0, 1.0, 0.0, 1.0],
  blue:[0.0, 0.0, 1.0, 1.0],
  indigo:[0.5, 0.0, 1.0, 1.0],
  violet:[1.0, 0.0, 1.0, 1.0],
  black:[0.0, 0.0, 0.0, 1.0]
};
//Shaders begin here. 
Mine.ShaderProgram = function(shader_name){
  var shader = Mine.Base();
  shader._add_class(Mine.ShaderProgram);
  var shader_location = Mine.RESOURCE_LOCATION+"/shaders/";
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
  shader.waitFor = function(callback){
    var timer = setInterval(function(){
      if(shader.failed){
        clearInterval(timer);
        console.log("Shader failed to compile...");
      }
      if(shader.loaded){
        clearInterval(timer);
        callback();
      }
    },100);
  };
  return shader;
};
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
  primative.iBuffer = Mine.gl.createBuffer();
  primative.iCount= 0;
  primative.iSize = 1;
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
  triangle.setColor([1.0, 1.0, 1.0, 1.0]);
  triangle.type = "TRIANGLE_STRIP";
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
  Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER,square.vBuffer);
  Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(square.vertices), Mine.gl.STATIC_DRAW);
  //Color the square
  square.cCount= square.vCount;
  square.setColor([1.0,1.0,1.0,1.0]);
  square.type = "TRIANGLE_STRIP";
  return square;
};
Mine.Primatives.Cube = function(){
  var cube = Mine.Primatives.Primative();
  cube._add_class(Mine.Primatives.Cube);
  //The vertices are coming!
  cube.vertices = [
    //Front..
    -1.0, -1.0, 1.0,
     1.0, -1.0, 1.0,
     1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,
    //Back
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
     1.0, 1.0, -1.0,
     1.0, -1.0, -1.0,
    //Top
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
     1.0, 1.0, 1.0,
     1.0, 1.0, -1.0,
    //Bottom
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,
    //Right
     1.0, -1.0, -1.0,
     1.0, 1.0, -1.0,
     1.0, 1.0, 1.0,
     1.0, -1.0, 1.0,
    //Left
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0
  ];
  cube.vCount = 24;
  //Creating and filling the buffer.
  Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, cube.vBuffer);
  Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(cube.vertices), Mine.gl.STATIC_DRAW);
  //Fill the index buffer.
  cube.indexes = [
    0, 1, 2, 0, 2, 3, //Front
    4, 5, 6, 4, 6, 7, //Back
    8, 9, 10, 8, 10, 11, //Top
    12, 13, 14, 12, 14, 15, //Bottom
    16, 17, 18, 16, 18, 19, //Right
    20, 21, 22, 20, 22, 23 //Left
  ];
  cube.iCount = 36;
  Mine.gl.bindBuffer(Mine.gl.ELEMENT_ARRAY_BUFFER,cube.iBuffer);
  Mine.gl.bufferData(Mine.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.indexes), Mine.gl.STATIC_DRAW);
  //Color the cube
  cube.cCount = cube.vCount;
  cube.setColor(Mine.Colors.red);
  cube.type = "ELEMENTS_TRIANGLES";
  cube.type = "TRIANGLE_STRIP";
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
  thing.setRot = function(new_rot){
    thing.rotation= new_rot;
  };
  thing.addRot = function(new_rot){
    for(i in thing.rotation){
      thing.rotation[i] += new_rot[i];
    }
  };
  thing.getRot = function(){
    return thing.rotation;
  };
  thing.act = function(){
    console.log("I'm empty...");
  };
  return thing;
};
Mine.BasicShapes = {};
Mine.BasicShapes.Square = function(){
  var square = Mine.Thing();
  square._add_class(Mine.BasicShapes.Square);
  square.shape = Mine.Primatives.Square();
  return square;
};
Mine.BasicShapes.Cube= function(){
  var cube = Mine.Thing();
  cube._add_class(Mine.BasicShapes.Cube);
  cube.shape = Mine.Primatives.Cube();
  return cube;
};
//Stage begins here.
Mine.GL_stage = function(id){
  var gl_stage = Mine.Base();
  gl_stage._add_class(Mine.Gl_stage);
  //Fields
  gl_stage.canvas = null;
  gl_stage.gl = null;
  gl_stage.program = null;
  gl_stage.actors = [];
  gl_stage.mvMatrix = mat4.create();
  gl_stage.pMatrix = mat4.create();
  gl_stage.bgColor = Mine.Colors.black;
  gl_stage.fps = 1000/30;
  gl_stage.interval = null;
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
    gl_stage.gl.clearColor(gl_stage.bgColor[0],
        gl_stage.bgColor[1],
        gl_stage.bgColor[2],
        gl_stage.bgColor[3]
      );
    gl_stage.gl.enable(gl_stage.gl.DEPTH_TEST);
    gl_stage.gl.depthFunc(gl_stage.glLEQUAL);
    gl_stage.gl.clear(gl_stage.gl.COLOR_BUFFER_BIT|gl_stage.gl.DEPTH_BUFFER_BIT);
  };
  gl_stage.draw = function(target){
    //Reset the move matrix.
    mat4.identity(gl_stage.mvMatrix);
    if(target && target._is_a(Mine.Thing)){
      //console.log("Drawing a thing");
      mat4.translate(gl_stage.mvMatrix, target.getPos());
      mat4.rotate(gl_stage.mvMatrix, target.getRot()[0], [1, 0, 0]);
      mat4.rotate(gl_stage.mvMatrix, target.getRot()[1], [0, 1, 0]);
      mat4.rotate(gl_stage.mvMatrix, target.getRot()[2], [0, 0, 1]);
      //Vvertex.
      Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, target.shape.vBuffer);
      Mine.gl.vertexAttribPointer(gl_stage.program.vertexPositionAttribute, target.shape.vSize, Mine.gl.FLOAT, false, 0, 0);
      //Square color shit.
      Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, target.shape.cBuffer);
      Mine.gl.vertexAttribPointer(gl_stage.program.vertexColorAttribute, target.shape.cSize, Mine.gl.FLOAT, false, 0, 0);
        gl_stage.setUniforms();
      //Draw the shape.
      if(target.shape.type == "TRIANGLE_STRIP"){
        Mine.gl.drawArrays(Mine.gl.TRIANGLE_STRIP, 0, target.shape.vCount);
      }
      else if(target.shape.type == "ELEMENTS_TRIANGLES"){
        console.log("Drawing elements");
        //Indexes
        Mine.gl.bindBuffer(Mine.gl.ELEMENT_ARRAY_BUFFER, target.shape.iBuffer);
        gl_stage.setUniforms();
        Mine.gl.drawElements(Mine.gl.TRIANGLES, target.shape.iCount, Mine.gl.UNSIGNED_SHORT, 0);
      }
      else{
        console.log("Not known type...");
      }
    }
  };
  gl_stage.add = function(new_actor){
    gl_stage.actors.push(new_actor);
    new_actor.stage = gl_stage;
  }
  gl_stage.run = function(){
    if(gl_stage.interval){
      return;
    }
    Mine.gl.clearColor(0.0, 1.0, 0.0, 1.0);
    Mine.gl.enable(Mine.gl.DEPTH_TEST);
    mat4.perspective(45, gl_stage.gl.viewportWidth / gl_stage.gl.viewportHeight, 0.1, 100.0, gl_stage.pMatrix);
    gl_stage.interval = setInterval(function(){
      gl_stage.clear();
      for(actor in gl_stage.actors){
        gl_stage.actors[actor].act();
      }
      for(actor in gl_stage.actors){
        gl_stage.draw(gl_stage.actors[actor]);
      }
    },gl_stage.fps);
  };
  gl_stage.end = function(){
    clearInterval(gl_stage.interval);
    gl_stage.interval = null;
  }
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
