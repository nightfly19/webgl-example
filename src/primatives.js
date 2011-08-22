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
     0.0,  1.0,  0.0,
    -1.0, -1.0,  0.0,
     1.0, -1.0,  0.0
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
     1.0,  1.0,  0.0,
    -1.0,  1.0,  0.0,
     1.0, -1.0,  0.0,
    -1.0, -1.0,  0.0
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
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    //Back
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,
    //Top
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,
    //Bottom
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,
    //Right
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,
    //Left
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
  ];
  cube.vCount = 24;

  //Creating and filling the buffer.
  Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, cube.vBuffer);
  Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(cube.vertices), Mine.gl.STATIC_DRAW);

  //Fill the index buffer.
  cube.indexes = [
    0, 1, 2,      0, 2, 3,    //Front
    4, 5, 6,      4, 6, 7,    //Back
    8, 9, 10,     8, 10, 11,  //Top
    12, 13, 14,   12, 14, 15, //Bottom
    16, 17, 18,   16, 18, 19, //Right
    20, 21, 22,   20, 22, 23  //Left
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
