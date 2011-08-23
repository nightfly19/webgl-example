//Stage begins here.

Mine.GLStage = function(id){
  var glStage = Mine.Base();
  glStage._addClass(Mine.Gl_stage);

  //Fields
  glStage.canvas = null;
  glStage.gl = null;
  glStage.program = null;
  glStage.actors = [];
  glStage.mvMatrix = mat4.create();
  glStage.pMatrix = mat4.create();
  glStage.bgColor = Mine.Colors.fromInts([119, 187, 213, 255]);
  glStage.fps = 1000/30;
  glStage.interval = null;

  //Get the canvas.
  glStage.canvas = document.getElementById(id);

  //Try and initialize WebGL.
  //try{
    Mine.dm("Initializing webgl");
    glStage.gl = glStage.canvas.getContext("experimental-webgl");
    Mine.stage = glStage;
    WebGLDebugUtils.init(Mine.stage.gl);
    Mine.Debug.perror();
  //}
  //catch(e){
  //  console.log("Failed to initialize webgl");
  //  console.log(e)
  //}




  //Set the current shader program.
  glStage.setProgram = function(active_program){
    Mine.dm("Setting shader");
    glStage.program = active_program.program;
    glStage.gl.useProgram(active_program.program);
    Mine.Debug.perror();

    //Vertex position.
    glStage.program.vertexPositionAttribute = glStage.gl.getAttribLocation(glStage.program, "aVertexPosition");
    Mine.Debug.perror();
    glStage.gl.enableVertexAttribArray(glStage.program.vertexPositionAttribute);
    Mine.Debug.perror();

    //Vertex color.
    //glStage.program.vertexColorAttribute = glStage.gl.getAttribLocation(glStage.program, "aVertexColor");
    //Mine.Debug.perror();
    //glStage.gl.enableVertexAttribArray(glStage.program.vertexColorAttribute);
    //Mine.Debug.perror();

    //Vertex texture coord
    Mine.dm("So I can get aTextureCoord?");
    glStage.program.textureCoordAttribute = glStage.gl.getAttribLocation(glStage.program, "aTextureCoord");
    Mine.Debug.perror();
    glStage.gl.enableVertexAttribArray(glStage.program.textureCoordAttribute);
    Mine.Debug.perror();


    glStage.program.pMatrixUniform = glStage.gl.getUniformLocation(glStage.program,"uPMatrix");
    Mine.Debug.perror();
    glStage.program.mvMatrixUniform = glStage.gl.getUniformLocation(glStage.program,"uMVMatrix");
    Mine.Debug.perror();
    glStage.program.samplerUniform = glStage.gl.getUniformLocation(glStage.program,"uSampler");
    glStage.program.textureLocation = glStage.gl.getUniformLocation(glStage.program,"textureLocation");
    Mine.Debug.perror();
 
    Mine.dm("Setting shader done");
  };



  //Set the uniforms.
  glStage.setUniforms = function(){
    Mine.dm("Setting uniforms");
    glStage.gl.uniformMatrix4fv(glStage.program.pMatrixUniform, false, glStage.pMatrix);
    Mine.Debug.perror();
    glStage.gl.uniformMatrix4fv(glStage.program.mvMatrixUniform, false, glStage.mvMatrix);
    Mine.Debug.perror();
    Mine.dm("Uniforms set.");
  }


  //Clear the stage.
  glStage.clear = function(){
    Mine.dm("Clear the stage");
    glStage.gl.clearColor(glStage.bgColor[0], 
        glStage.bgColor[1], 
        glStage.bgColor[2], 
        glStage.bgColor[3] 
      );
    glStage.gl.enable(glStage.gl.BLEND);
    glStage.gl.enable(glStage.gl.DEPTH_TEST);
    glStage.gl.blendFunc(glStage.gl.SRC_ALPHA, glStage.gl.ONE_MINUS_SRC_ALPHA);
    Mine.Debug.perror();
    glStage.gl.depthFunc(glStage.gl.LEQUAL);
    Mine.Debug.perror();
    glStage.gl.clear(glStage.gl.COLOR_BUFFER_BIT|glStage.gl.DEPTH_BUFFER_BIT);
    Mine.Debug.perror();
    Mine.dm("Cleared the stage");
  };



  glStage.draw = function(target){
    Mine.dm("Drawing something");
    //Reset the move matrix.
    mat4.identity(glStage.mvMatrix);

    if(target && target._isA(Mine.Thing)){
      //console.log("Drawing a thing");
      mat4.translate(glStage.mvMatrix, target.getPos());

      mat4.rotate(glStage.mvMatrix, target.getRot()[0], [1, 0, 0]);
      mat4.rotate(glStage.mvMatrix, target.getRot()[1], [0, 1, 0]);
      mat4.rotate(glStage.mvMatrix, target.getRot()[2], [0, 0, 1]);

      //Vvertex.
      Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, target.shape.vBuffer);
      Mine.stage.gl.vertexAttribPointer(glStage.program.vertexPositionAttribute, target.shape.vSize, Mine.stage.gl.FLOAT, false, 0, 0);

      //Colors.
      //Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, target.shape.cBuffer);
      //Mine.Debug.perror();
      //Mine.stage.gl.vertexAttribPointer(glStage.program.vertexColorAttribute, target.shape.cSize, Mine.stage.gl.FLOAT, false, 0, 0);
      //Mine.Debug.perror();
      
      //Texture stuff :)
      //console.log("Using texture: "+target.texture);
      //console.log("Using gltexture: "+target.texture.glTexture);
      //console.log( target.shape.tcBuffer);
      //console.log( target.shape.tcSize);
      Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, target.shape.tcBuffer);
      Mine.Debug.perror();
      Mine.stage.gl.vertexAttribPointer(glStage.program.textureCoordAttribute, target.shape.tcSize, Mine.stage.gl.FLOAT, false, 0, 0);
      Mine.Debug.perror();

      Mine.stage.gl.activeTexture(Mine.stage.gl.TEXTURE0);
      Mine.Debug.perror();
      Mine.stage.gl.bindTexture(Mine.stage.gl.TEXTURE_2D, glStage.texture.glTexture);
      Mine.Debug.perror();
      Mine.stage.gl.uniform1i(glStage.program.samplerUniform, 0);
      Mine.Debug.perror();

      //Set the texture coordinates.
      glStage.setUniforms();
      var test = mat4.create();
      test[0] = glStage.texture.devisions;
      test[1] = target.textureLocation[0];
      test[2] = target.textureLocation[1];
      //console.log("Fucker: "+glStage.program.textureLocation);
      glStage.gl.uniformMatrix4fv(glStage.program.textureLocation, false, test);
  
      //Draw the shape.

      if(target.shape.type == "TRIANGLE_STRIP"){
        glStage.setUniforms();
        Mine.stage.gl.drawArrays(Mine.stage.gl.TRIANGLE_STRIP, 0, target.shape.vCount);
        Mine.Debug.perror();
      }
      else if(target.shape.type == "ELEMENTS_TRIANGLES"){
        //console.log("Drawing elements");

        //Indexes
        Mine.stage.gl.bindBuffer(Mine.stage.gl.ELEMENT_ARRAY_BUFFER, target.shape.iBuffer);
        Mine.Debug.perror();
        

        Mine.stage.gl.drawElements(Mine.stage.gl.TRIANGLES, target.shape.iCount, Mine.stage.gl.UNSIGNED_SHORT, 0);
        Mine.Debug.perror();
      }
      else{
        console.log("Not known type...");
      }
    }
    Mine.dm("Drew something");
  };

  glStage.add = function(new_actor){
    glStage.actors.push(new_actor);
    new_actor.stage = glStage;
  }

  glStage.run = function(){
    if(glStage.interval){
      return;
    }

    Mine.stage.gl.clearColor(0.0, 1.0, 0.0, 1.0);
    Mine.Debug.perror();
    Mine.stage.gl.enable(Mine.stage.gl.BLEND);
    Mine.stage.gl.enable(Mine.stage.gl.DEPTH_TEST);
    Mine.Debug.perror();
    mat4.perspective(45, glStage.gl.viewportWidth / glStage.gl.viewportHeight, 0.1, 100.0, glStage.pMatrix);
    Mine.Debug.perror();
    glStage.interval = setInterval(function(){
      glStage.clear();
      //console.log("Hello");

      for(actor in glStage.actors){
        glStage.actors[actor].act();
        //console.log("\tMoo");
      }
      for(actor in glStage.actors){
        if(glStage.actors[actor].drawMe()){
          glStage.draw(glStage.actors[actor]);
        }
      }
    },glStage.fps);

  };

  glStage.end = function(){
    clearInterval(glStage.interval);
    glStage.interval = null;
  }


  //Constructor stuff.
  if(glStage.gl){
    //glStage.clear();
    glStage.gl.viewportWidth = glStage.canvas.width;
    glStage.gl.viewportHeight = glStage.canvas.height;
  }
  else{
    console.log("Failed somehow");
  }

  Mine.stage = glStage;
  return glStage;
}


