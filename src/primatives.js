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
  square.cCount= 4;
  square.setColor([1.0,1.0,1.0,1.0]);

  return square;
};




Mine.Primatives.Cube = function(){
  var cube = Mine.Primatives.Primative();
  primatives.add_class(Mine.Primatives.Cube);
  return cube;
}
