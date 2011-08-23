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
                //console.log(fragment_shader);
                //console.log(vertex_shader);
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
  Mine.dm("Creating a primative");
  var primative = Mine.Base();
  primative._add_class(Mine.Primatives.Primative);
  primative.vertices = [];
  primative.type = null;
  primative.vertices = [];
  primative.vBuffer = Mine.gl.createBuffer();
    Mine.perror();
  primative.vCount = 0;
  primative.vSize = 3;
  primative.iBuffer = Mine.gl.createBuffer();
    Mine.perror();
  primative.iCount= 0;
  primative.iSize = 1;
  primative.colors = false;
  primative.cBuffer = Mine.gl.createBuffer();
    Mine.perror();
  primative.cCount = 0;
  primative.cSize = 4;
  primative.tcBuffer = Mine.gl.createBuffer();
    Mine.perror();
  primative.tcCount = 0;
  primative.tcSize = 2;
  primative.texCoords = [];
  primative.setColor = function(new_color){
    if(!primative.colors){
      primative.colors = Array(primative.cCount * primative.cSize);
    }
    for(var i = 0; i < primative.cCount * primative.cSize; i++){
      primative.colors[i] = new_color[i%primative.cSize];
    }
    Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, primative.cBuffer);
    Mine.perror();
    Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(primative.colors), Mine.gl.STATIC_DRAW);
    Mine.perror();
  };
  Mine.dm("Created a primative");
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
  //TexCoords.
  square.texCoords = [
     1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
     1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
    ];
  Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, square.tcBuffer);
  Mine.perror();
  Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(square.texCoords), Mine.gl.STATIC_DRAW);
  Mine.perror();
  //Color the square
  square.cCount= square.vCount;
  square.setColor([1.0,1.0,1.0,1.0]);
  square.type = "TRIANGLE_STRIP";
  return square;
};
Mine.Primatives.Cube = function(){
  var cube = Mine.Primatives.Primative();
  cube._add_class(Mine.Primatives.Cube);
  Mine.dm("Making a cube");
  Mine.perror();
  //The vertices are coming!
  cube.vertices = [
            // Front face
            -1.0, -1.0, 1.0,
             1.0, -1.0, 1.0,
             1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,
            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
             1.0, 1.0, -1.0,
             1.0, -1.0, -1.0,
            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
             1.0, 1.0, 1.0,
             1.0, 1.0, -1.0,
            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,
            // Right face
             1.0, -1.0, -1.0,
             1.0, 1.0, -1.0,
             1.0, 1.0, 1.0,
             1.0, -1.0, 1.0,
            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
  ];
  cube.vCount = 24;
  //Filling the vertex buffer.
  Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, cube.vBuffer);
  Mine.perror();
  Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(cube.vertices), Mine.gl.STATIC_DRAW);
  Mine.perror();
  //Fill the index buffer.
  cube.indexes = [
            0, 1, 2, 0, 2, 3, // Front face
            4, 5, 6, 4, 6, 7, // Back face
            8, 9, 10, 8, 10, 11, // Top face
            12, 13, 14, 12, 14, 15, // Bottom face
            16, 17, 18, 16, 18, 19, // Right face
            20, 21, 22, 20, 22, 23 // Left face
  ];
  cube.iCount = 36;
  Mine.gl.bindBuffer(Mine.gl.ELEMENT_ARRAY_BUFFER,cube.iBuffer);
  Mine.perror();
  Mine.gl.bufferData(Mine.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.indexes), Mine.gl.STATIC_DRAW);
  Mine.perror();
  //Fill the texture coordinates...
  cube.texCoords = [
          // Front face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          // Back face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,
          // Top face
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          // Bottom face
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,
          // Right face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,
          // Left face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
  ];
  Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, cube.tcBuffer);
  Mine.perror();
  Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(cube.texCoords), Mine.gl.STATIC_DRAW);
  Mine.perror();
  cube.tcCount = 24;
  //Color the cube
  cube.cCount = cube.vCount;
  cube.setColor(Mine.Colors.red);
  cube.type = "ELEMENTS_TRIANGLES";
  //cube.type = "TRIANGLE_STRIP";
  Mine.dm("Made a cube");
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
    Mine.dm("Initializing webgl");
    gl_stage.gl = gl_stage.canvas.getContext("experimental-webgl");
    Mine.gl = gl_stage.gl;
    WebGLDebugUtils.init(Mine.gl);
    Mine.perror();
  //}
  //catch(e){
  //  console.log("Failed to initialize webgl");
  //  console.log(e)
  //}
  //Set the current shader program.
  gl_stage.setProgram = function(active_program){
    Mine.dm("Setting shader");
    gl_stage.program = active_program.program;
    gl_stage.gl.useProgram(active_program.program);
    Mine.perror();
    //Vertex position.
    gl_stage.program.vertexPositionAttribute = gl_stage.gl.getAttribLocation(gl_stage.program, "aVertexPosition");
    Mine.perror();
    gl_stage.gl.enableVertexAttribArray(gl_stage.program.vertexPositionAttribute);
    Mine.perror();
    //Vertex color.
    //gl_stage.program.vertexColorAttribute = gl_stage.gl.getAttribLocation(gl_stage.program, "aVertexColor");
    //Mine.perror();
    //gl_stage.gl.enableVertexAttribArray(gl_stage.program.vertexColorAttribute);
    //Mine.perror();
    //Vertex texture coord
    Mine.dm("So I can get aTextureCoord?");
    gl_stage.program.textureCoordAttribute = gl_stage.gl.getAttribLocation(gl_stage.program, "aTextureCoord");
    Mine.perror();
    gl_stage.gl.enableVertexAttribArray(gl_stage.program.textureCoordAttribute);
    Mine.perror();
    gl_stage.program.pMatrixUniform = gl_stage.gl.getUniformLocation(gl_stage.program,"uPMatrix");
    Mine.perror();
    gl_stage.program.mvMatrixUniform = gl_stage.gl.getUniformLocation(gl_stage.program,"uMVMatrix");
    Mine.perror();
    gl_stage.program.samplerUniform = gl_stage.gl.getUniformLocation(gl_stage.program,"uSampler");
    Mine.perror();
    Mine.dm("Setting shader done");
  };
  //Set the uniforms.
  gl_stage.setUniforms = function(){
    Mine.dm("Setting uniforms");
    gl_stage.gl.uniformMatrix4fv(gl_stage.program.pMatrixUniform, false, gl_stage.pMatrix);
    Mine.perror();
    gl_stage.gl.uniformMatrix4fv(gl_stage.program.mvMatrixUniform, false, gl_stage.mvMatrix);
    Mine.perror();
    Mine.dm("Uniforms set.");
  }
  //Clear the stage.
  gl_stage.clear = function(){
    Mine.dm("Clear the stage");
    gl_stage.gl.clearColor(gl_stage.bgColor[0],
        gl_stage.bgColor[1],
        gl_stage.bgColor[2],
        gl_stage.bgColor[3]
      );
    gl_stage.gl.enable(gl_stage.gl.DEPTH_TEST);
    Mine.perror();
    gl_stage.gl.depthFunc(gl_stage.gl.LEQUAL);
    Mine.perror();
    gl_stage.gl.clear(gl_stage.gl.COLOR_BUFFER_BIT|gl_stage.gl.DEPTH_BUFFER_BIT);
    Mine.perror();
    Mine.dm("Cleared the stage");
  };
  gl_stage.draw = function(target){
    Mine.dm("Drawing something");
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
      //Colors.
      //Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, target.shape.cBuffer);
      //Mine.perror();
      //Mine.gl.vertexAttribPointer(gl_stage.program.vertexColorAttribute, target.shape.cSize, Mine.gl.FLOAT, false, 0, 0);
      //Mine.perror();
      //Texture stuff :)
      //console.log("Using texture: "+target.texture);
      //console.log("Using gltexture: "+target.texture.glTexture);
      //console.log( target.shape.tcBuffer);
      //console.log( target.shape.tcSize);
      Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, target.shape.tcBuffer);
      Mine.perror();
      Mine.gl.vertexAttribPointer(gl_stage.program.textureCoordAttribute, target.shape.tcSize, Mine.gl.FLOAT, false, 0, 0);
      Mine.perror();
      Mine.gl.activeTexture(Mine.gl.TEXTURE0);
      Mine.perror();
      //console.log("What the fuck is this: "+target.texture.glTexture);
      Mine.gl.bindTexture(Mine.gl.TEXTURE_2D, target.texture.glTexture);
      Mine.perror();
      Mine.gl.uniform1i(gl_stage.program.samplerUniform, 0);
      Mine.perror();
      //Draw the shape.
      if(target.shape.type == "TRIANGLE_STRIP"){
        gl_stage.setUniforms();
        Mine.gl.drawArrays(Mine.gl.TRIANGLE_STRIP, 0, target.shape.vCount);
        Mine.perror();
      }
      else if(target.shape.type == "ELEMENTS_TRIANGLES"){
        console.log("Drawing elements");
        //Indexes
        Mine.gl.bindBuffer(Mine.gl.ELEMENT_ARRAY_BUFFER, target.shape.iBuffer);
        Mine.perror();
        gl_stage.setUniforms();
        Mine.gl.drawElements(Mine.gl.TRIANGLES, target.shape.iCount, Mine.gl.UNSIGNED_SHORT, 0);
        Mine.perror();
      }
      else{
        console.log("Not known type...");
      }
    }
    Mine.dm("Drew something");
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
    Mine.perror();
    Mine.gl.enable(Mine.gl.DEPTH_TEST);
    Mine.perror();
    mat4.perspective(45, gl_stage.gl.viewportWidth / gl_stage.gl.viewportHeight, 0.1, 100.0, gl_stage.pMatrix);
    Mine.perror();
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
Mine.Texture = function(texture_name,callback){
  var texture = Mine.Base();
  texture._add_class(Mine.Texture);
  Mine.dm("Creating a texture");
  //Check the cache first!.
  if(Mine.Texture.Cache[texture_name]){
    console.log("Found it?");
    return Mine.Texture.Cache[texture_name];
  }
  texture.glTexture = Mine.gl.createTexture();
  Mine.perror();
  texture.image = new Image();
  texture.image.onload = function(){
    Mine.gl.bindTexture(Mine.gl.TEXTURE_2D, texture.glTexture);
      Mine.perror();
    Mine.gl.pixelStorei(Mine.gl.UNPACK_FLIP_Y_WEBGL, true);
      Mine.perror();
    Mine.gl.texImage2D(Mine.gl.TEXTURE_2D, 0, Mine.gl.RGBA, Mine.gl.RGBA,
        Mine.gl.UNSIGNED_BYTE,
        texture.image);
      Mine.perror();
    Mine.gl.texParameteri(Mine.gl.TEXTURE_2D,
        Mine.gl.TEXTURE_MAG_FILTER,
        Mine.gl.NEAREST);
      Mine.perror();
    Mine.gl.texParameteri(Mine.gl.TEXTURE_2D,
        Mine.gl.TEXTURE_MIN_FILTER,
        Mine.gl.NEAREST);
      Mine.perror();
    Mine.gl.bindTexture(Mine.gl.TEXTURE_2D,null);
      Mine.perror();
    Mine.dm("Texture created.");
    if(callback){
      //console.log(texture.glTexture);
      callback(texture);
    }
  };
  texture.image.src = "http://localhost/~sage/minedotjs/resources/textures/kitten.gif";
  //texture.image.src = Mine.Texture.TEXTURE_LOCATION+texture_name+".png"
  //console.log(texture.image.src);
  return texture;
};
Mine.Texture.TEXTURE_LOCATION = Mine.RESOURCE_LOCATION+"/textures/"
Mine.Texture.Cache = {};
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
  var shape = Mine.BasicShapes.Cube();
  Mine.dm("Creating a texture");
  var texture = Mine.Texture("kitten",function(test){
    shape.texture = test;
  });
    Mine.perror();
  shape.shape.setColor(Mine.Colors.indigo);
  shape.addRot([0.0, 0.0, 0.5]);
  shape.act = function(){
    shape.setPos([0, 0, -10]);
    shape.addRot([0.0, 0.05, 0.05]);
  };
  stage.add(shape);
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
