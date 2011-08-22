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
  gl_stage.bgColor = Mine.Colors.black;

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

    if(target._is_a(Mine.Thing)){
      console.log("Drawing a thing");
      mat4.translate(gl_stage.mvMatrix, target.getPos());

      //Vvertex.
      Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, target.shape.vBuffer);
      Mine.gl.vertexAttribPointer(gl_stage.program.vertexPositionAttribute, target.shape.vSize, Mine.gl.FLOAT, false, 0, 0);

      //Square color shit.
      Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, target.shape.cBuffer);
      Mine.gl.vertexAttribPointer(gl_stage.program.vertexColorAttribute, target.shape.cSize, Mine.gl.FLOAT, false, 0, 0);
      gl_stage.setUniforms();
  
      //Draw the shape.
      Mine.gl.drawArrays(Mine.gl.TRIANGLE_STRIP, 0, target.shape.vCount);
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


