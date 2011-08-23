//Shaders begin here. 


Mine.ShaderProgram = function(shader_name){
  var shader = Mine.Base();
  shader._addClass(Mine.ShaderProgram);

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
                var gl = Mine.stage.gl;
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
    var gl = Mine.stage.gl;
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

