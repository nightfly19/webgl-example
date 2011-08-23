#ifndef TEXTURE_JS
#define TEXTURE_JS
Mine.Texture = function(texture_name, devisions, callback){
  var texture = Mine.Base();
  texture._addClass(Mine.Texture);
  texture.devisions = devisions;
  Mine.dm("Creating a texture"); 
  //Check the cache first!.
  if(Mine.Texture.Cache[texture_name]){
    console.log("Found it?");
    return Mine.Texture.Cache[texture_name];
  }

  texture.glTexture = Mine.stage.gl.createTexture();
  Mine.Debug.perror();
  texture.image = new Image();
  texture.image.onload = function(){
    Mine.stage.gl.bindTexture(Mine.stage.gl.TEXTURE_2D, texture.glTexture);
      Mine.Debug.perror();
    Mine.stage.gl.pixelStorei(Mine.stage.gl.UNPACK_FLIP_Y_WEBGL, true);
      Mine.Debug.perror();
    Mine.stage.gl.texImage2D(Mine.stage.gl.TEXTURE_2D, 0, Mine.stage.gl.RGBA, Mine.stage.gl.RGBA,
        Mine.stage.gl.UNSIGNED_BYTE, 
        texture.image);
      Mine.Debug.perror();
    Mine.stage.gl.texParameteri(Mine.stage.gl.TEXTURE_2D, 
        Mine.stage.gl.TEXTURE_MAG_FILTER, 
        Mine.stage.gl.NEAREST);
      Mine.Debug.perror();
    Mine.stage.gl.texParameteri(Mine.stage.gl.TEXTURE_2D, 
        Mine.stage.gl.TEXTURE_MIN_FILTER, 
        Mine.stage.gl.NEAREST);
      Mine.Debug.perror();
    Mine.stage.gl.bindTexture(Mine.stage.gl.TEXTURE_2D,null);
      Mine.Debug.perror();
    Mine.dm("Texture created.");
    if(callback){
      //console.log(texture.glTexture);
      callback(texture);
    }
  };

  //texture.image.src = "http://localhost/~sage/minedotjs/resources/textures/kitten.png";
  texture.image.src = Mine.Texture.TEXTURE_LOCATION+texture_name+".png"

  //console.log(texture.image.src);

  return texture;
};

Mine.Texture.TEXTURE_LOCATION = Mine.RESOURCE_LOCATION+"/textures/"
Mine.Texture.Cache = {};

#endif
