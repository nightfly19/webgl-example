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
