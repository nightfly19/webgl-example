//Begin primatives.

Mine.Primatives = {};

//False when a WebGL context hasn't been initialized.
Mine.Primatives.ready = false;

//To be ran when a WebGL context is initialized for the first time.
Mine.Primatives.GlInit = function(){
  if(!Mine.Primatives.ready){
    var gl = Mine.THE_ONE_GL_STAGE;
    Mine.Primatives.Types = {"TRIANGLE_STRIP":gl.TRIANGLE_STRIP,"tootsie":1};
    console.log(Mine.Primatives.Types.felix)
    Mine.Primatives.ready = true;
  }
}

Mine.Primatives.Primative = function(){
  var primative = Mine.Base();
  primative._add_class(Mine.Primatives.Primative);

  primative.vertices = [];
  primative.vCount = 0;
  primative.vSize = 3;
  primative.type = null;
  primative.buffer = null;
  return primative;
};






Mine.Primatives.Triangle = function(){
  var triangle = Mine.Primatives.Primative();
  triangle._add_class(Mine.Primatives.Triangle);
  triangle.vertices = [
     0.0,  1.0,  -3.0,
    -1.0, -1.0,  3.0,
     1.0, -1.0,  0.0
  ];
  triangle.vCount = 3;

  //Creating and filling the buffer.
  triangle.vBuffer = Mine.gl.createBuffer();
  Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER,triangle.vBuffer);
  Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(triangle.vertices), gl.STATIC_DRAW);

  return triangle;
};





Mine.Primatives.Cube = function(){
  var cube = Mine.Primatives.Primative();
  primatives.add_class(Mine.Primatives.Cube);
  return cube;
}
