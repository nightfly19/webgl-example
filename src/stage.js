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
  gl_stage.bgColor = Mine.Colors.fromInts([119, 187, 213, 255]);
  gl_stage.fps = 1000/5;
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
    gl_stage.program.textureLocation = gl_stage.gl.getUniformLocation(gl_stage.program,"textureLocation");
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
      Mine.gl.bindTexture(Mine.gl.TEXTURE_2D, gl_stage.texture.glTexture);
      Mine.perror();
      Mine.gl.uniform1i(gl_stage.program.samplerUniform, 0);
      Mine.perror();

      //Set the texture coordinates.
      gl_stage.setUniforms();
      var test = mat4.create();
      test[0] = gl_stage.texture.devisions;
      test[1] = target.textureLocation[0];
      test[2] = target.textureLocation[1];
      //console.log("Fucker: "+gl_stage.program.textureLocation);
      gl_stage.gl.uniformMatrix4fv(gl_stage.program.textureLocation, false, test);
  
      //Draw the shape.

      if(target.shape.type == "TRIANGLE_STRIP"){
        gl_stage.setUniforms();
        Mine.gl.drawArrays(Mine.gl.TRIANGLE_STRIP, 0, target.shape.vCount);
        Mine.perror();
      }
      else if(target.shape.type == "ELEMENTS_TRIANGLES"){
        //console.log("Drawing elements");

        //Indexes
        Mine.gl.bindBuffer(Mine.gl.ELEMENT_ARRAY_BUFFER, target.shape.iBuffer);
        Mine.perror();
        

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
      //console.log("Hello");

      for(actor in gl_stage.actors){
        gl_stage.actors[actor].act();
        //console.log("\tMoo");
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


