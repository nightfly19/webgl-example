//Begin primatives.

Mine.Primatives = {};

//False when a WebGL context hasn't been initialized.
//Mine.Primatives.ready = false;



Mine.Primatives.Types = ["TRIANGLE_STRIP"];





Mine.Primatives.Primative = function(){
  Mine.dm("Creating a primative");
  var primative = Mine.Base();
  primative._add_class(Mine.Primatives.Primative);
  
  primative.vertices = [];
  primative.type = null;
  primative.vertices = [];
  primative.vBuffer = Mine.gl.createBuffer();
    Mine.perror();
  primative.vCount = 0;
  primative.vSize = 3;
  primative.iBuffer = Mine.gl.createBuffer();
    Mine.perror();
  primative.iCount= 0;
  primative.iSize = 1;
  primative.colors = false;
  primative.cBuffer = Mine.gl.createBuffer();
    Mine.perror();
  primative.cCount = 0;
  primative.cSize = 4;
  primative.tcBuffer = Mine.gl.createBuffer();
    Mine.perror();
  primative.tcCount = 0;
  primative.tcSize = 2;
  primative.texCoords = [];

  primative.setColor = function(new_color){
    if(!primative.colors){
      primative.colors = Array(primative.cCount * primative.cSize);
    }

    for(var i = 0; i < primative.cCount * primative.cSize; i++){
      primative.colors[i] = new_color[i%primative.cSize];
    }

    Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, primative.cBuffer);
    Mine.perror();
    Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(primative.colors), Mine.gl.STATIC_DRAW);
    Mine.perror();
  };

  Mine.dm("Created a primative");
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

  //TexCoords.
  square.texCoords = [
     1.0,  1.0,  0.0,
    1.0,  1.0,  0.0,
     0.0, 0.0,  0.0,
    0.0, 0.0,  0.0
    ];
  Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, square.tcBuffer);
  Mine.perror();
  Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(square.texCoords), Mine.gl.STATIC_DRAW);
  Mine.perror();

  //Color the square
  square.cCount= square.vCount;
  square.setColor([1.0,1.0,1.0,1.0]);

  square.type = "TRIANGLE_STRIP";

  return square;
};





Mine.Primatives.Cube = function(){
  var cube = Mine.Primatives.Primative();
  cube._add_class(Mine.Primatives.Cube);
  Mine.dm("Making a cube");
  Mine.perror();

  //The vertices are coming!
  cube.vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,

  ];

  cube.vCount = 24;

  //Filling the vertex buffer.
  Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, cube.vBuffer);
  Mine.perror();
  Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(cube.vertices), Mine.gl.STATIC_DRAW);
  Mine.perror();

  //Fill the index buffer.
  cube.indexes = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face

  ];
  cube.iCount = 36;

  Mine.gl.bindBuffer(Mine.gl.ELEMENT_ARRAY_BUFFER,cube.iBuffer);
  Mine.perror();
  Mine.gl.bufferData(Mine.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.indexes), Mine.gl.STATIC_DRAW);
  Mine.perror();

  //Texture coordinates when all faces are the same.
  cube.texTypes = {};
  cube.texTypes.allSame = [
          // Front face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,

          // Back face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,

          // Top face
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,

          // Bottom face
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,

          // Right face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,

          // Left face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,

  ];

  cube.tcCount = 24;

  //Color the cube
  cube.cCount = cube.vCount;
  cube.setColor(Mine.Colors.red);
  
  cube.type = "ELEMENTS_TRIANGLES";
  //cube.type = "TRIANGLE_STRIP";

  cube.setTextureType = function(textureType){
    Mine.gl.bindBuffer(Mine.gl.ARRAY_BUFFER, cube.tcBuffer);
    Mine.perror();
    Mine.gl.bufferData(Mine.gl.ARRAY_BUFFER, new Float32Array(textureType), Mine.gl.STATIC_DRAW);
    Mine.perror();
  };
  cube.setTextureType(cube.texTypes.allSame);
  Mine.dm("Made a cube");
  return cube;
}
