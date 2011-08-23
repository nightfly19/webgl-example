#ifndef TEXTURE_JS
#define TEXTURE_JS
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

  //texture.image.src = "http://localhost/~sage/minedotjs/resources/textures/kitten.png";
  texture.image.src = Mine.Texture.TEXTURE_LOCATION+texture_name+".png"

  //console.log(texture.image.src);

  return texture;
};

Mine.Texture.TEXTURE_LOCATION = Mine.RESOURCE_LOCATION+"/textures/"
Mine.Texture.Cache = {};

#endif
