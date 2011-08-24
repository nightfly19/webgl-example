//"use strict";

var Mine = {};
//Where resources are located.
Mine.RESOURCE_LOCATION = "resources";





//Base class with utility functions to determine if an object is of certain types.
Mine.Base = function () {

    var self = {};



    //Holds what classes the object is.
    self.classes = [];



    //Adds a class to the list of classes the object is.
    self.addClass = function (new_class) {
        this.classes.push(new_class);
    };



    //Returns if an object is a member of the given class.
    self.isA = function (class_name) {
        var a_class;
        for(a_class in this.classes) {
            if(this.classes.hasOwnProperty(a_class)){

                //If class is found in list, it is one.
                if (class_name === this.classes[a_class]) {
                    return true;
                 
                }
            }

        }

        //If class is not found, it is not.
        return false;
    };



    self.className = function () {
        return self.classes[self.classes.length-1];
    };



    self.addClass("Mine.Base");
    return self;
};





//Defines some common color values and enables easy convertion of other formats of colors to the vec4 format that WebGL prefers.
Mine.Colors = {
    white   :new Float32Array([1.0, 1.0, 1.0, 1.0]),
    red     :new Float32Array([1.0, 0.0, 0.0, 1.0]),
    orange  :new Float32Array([1.0, 0.5, 0.0, 1.0]),
    yellow  :new Float32Array([1.0, 1.0, 0.0, 1.0]),
    green   :new Float32Array([0.0, 1.0, 0.0, 1.0]),
    blue    :new Float32Array([0.0, 0.0, 1.0, 1.0]),
    indigo  :new Float32Array([0.5, 0.0, 1.0, 1.0]),
    violet  :new Float32Array([1.0, 0.0, 1.0, 1.0]),
    black:  new Float32Array([0.0, 0.0, 0.0, 1.0]),
    //Converts integer color vectors to floating point color vectors.
    fromInts: function (ints) {
        var i;
        var output = [];
        for(i in ints) {
            if(ints.hasOwnProperty(i)){
                output[i] = ints[i]/255.0;
            }
        }

        return output;
    }
};





//ShaderProgram class begin here. 
Mine.ShaderProgram = function (shader_name) {
    var self = Mine.Base();
    self.addClass("Mine.ShaderProgram");
    var shader_location = Mine.RESOURCE_LOCATION+"/shaders/";
    self.loaded = false;
    self.failed = false;
    self.program = null;

    //Get and compile fragment shader.
    $.get(shader_location+shader_name+".fragment.shader", {},
            function (data) {
                var fragment_shader = self.compile(data, "fragment");
                if (fragment_shader) {
                    Mine.dm("Fragment shader compiled");
                    //Get and compile vertex shader.
                    $.get(shader_location+shader_name+".vertex.shader", {},
                        function (data) {
                            var vertex_shader = self.compile(data, "vertex");
                            if (vertex_shader) {
                                Mine.dm("Fragment shader compiled");
                                //Build the fragment shader program.
                                var gl = Mine.stage.gl;
                                var shader_program = gl.createProgram();
                                gl.attachShader(shader_program, fragment_shader);
                                gl.attachShader(shader_program, vertex_shader);
                                Mine.dm("Trying to link...");
                                gl.linkProgram(shader_program);
                                if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
                                    Mine.dm("Failed to link program");
                                    self.failed = true;
                                }
                                else {
                                    Mine.dm("program linked!!!");
                                    self.program = shader_program;
                                    self.loaded = true;
                                }
                            }
                            else {
                                Mine.dm("Failed to compile vertex shader...");
                                self.failed = true;
                            }
                        }, "html");
                }
                else {
                    Mine.dm("Failed to compile fragment shader...");
                    self.failed = true;
                }
            }, "html");
    self.shader = null;
    self.compile = function (shader_source, type) {
        Mine.dm("Compiling shader");
        var gl = Mine.stage.gl;
        var new_shader;
        //Create the shader.
        if (type === "fragment") {
            Mine.dm("Fragment shader");
            new_shader = gl.createShader(gl.FRAGMENT_SHADER);
        }
        else if (type === "vertex") {
            Mine.dm("Vertex shader");
            new_shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else {
            Mine.dm("Somethings wrong, not known shader type");
        }
        gl.shaderSource(new_shader, String(shader_source));
        gl.compileShader(new_shader);
        if ( !gl.getShaderParameter(new_shader, gl.COMPILE_STATUS)) {
            Mine.dm("Shader failed to compile...");
            Mine.dm(gl.getShaderInfoLog(new_shader));
            return null;
        }
        else {
            return new_shader;
        }
    };



    //Assign a callback function to be called when the shader finishes compiling. If the shader is already compiled this function will be called immediately.
    self.waitFor = function (callback) {
        var timer;
        timer = setInterval(function () {
            if (self.failed) {
                clearInterval(timer);
                Mine.dm("Shader failed to compile...");
            }
            if (self.loaded) {
                clearInterval(timer);
                callback();
            }
        }, 100);
    };



    return self;
};





//Begin primatives.
Mine.Primatives = {};

//Mine.Primatives.Types = ["TRIANGLE_STRIP"];




//Base primative class, creates the buffers that decendant primatives will utilize.
Mine.Primatives.Primative = function () {
    Mine.dm("Creating a primative");
    var self = Mine.Base();
    self.addClass("Mine.Primatives.Primative");
    self.vertices = [];
    self.type = null;
    self.vertices = [];
    self.vBuffer = Mine.stage.gl.createBuffer();
    Mine.Debug.printGLError();
    self.vCount = 0;
    self.vSize = 3;
    self.iBuffer = Mine.stage.gl.createBuffer();
    Mine.Debug.printGLError();
    self.iCount= 0;
    self.iSize = 1;
    self.colors = false;
    self.cBuffer = Mine.stage.gl.createBuffer();
    Mine.Debug.printGLError();
    self.cCount = 0;
    self.cSize = 4;
    self.tcBuffer = Mine.stage.gl.createBuffer();
    Mine.Debug.printGLError();
    self.tcCount = 0;
    self.tcSize = 2;
    self.texCoords = [];



    //Fills a primatives color buffer with the color in the vector given.
    self.setColor = function (new_color) {
        var i;
        if (!self.colors) {
            self.colors = new Array(self.cCount * self.cSize);
        }
        for(i = 0; i < self.cCount * self.cSize; i++) {
            self.colors[i] = new_color[i%self.cSize];
        }
        Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, self.cBuffer);
        Mine.Debug.printGLError();
        Mine.stage.gl.bufferData(Mine.stage.gl.ARRAY_BUFFER, new Float32Array(self.colors), Mine.stage.gl.STATIC_DRAW);
        Mine.Debug.printGLError();
    };

    Mine.dm("Created a primative");
    return self;
};





//Triangle primative.
Mine.Primatives.Triangle = function () {
    var self = Mine.Primatives.Primative();
    self.addClass("Mine.Primatives.Triangle");
    //Filling the vBuffer.
    self.vertices = [
        0.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
            ];
    self.vCount = 3;
    Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, self.vBuffer);
    Mine.stage.gl.bufferData(Mine.stage.gl.ARRAY_BUFFER, new Float32Array(self.vertices), Mine.stage.gl.STATIC_DRAW);
    //Color the triangle.
    self.cCount = self.vCount;
    self.setColor([1.0, 1.0, 1.0, 1.0]);
    self.type = "TRIANGLE_STRIP";
    return self;
};





//Square primative.
Mine.Primatives.Square = function () {
    var self = Mine.Primatives.Primative();
    self.addClass("Mine.Primatives.Square");
    self.vertices = [
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
            ];
    self.vCount = 4;
    //Creating and filling the buffer.
    Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, self.vBuffer);
    Mine.stage.gl.bufferData(Mine.stage.gl.ARRAY_BUFFER, new Float32Array(self.vertices), Mine.stage.gl.STATIC_DRAW);
    //TexCoords.
    self.texCoords = [
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0
            ];
    Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, self.tcBuffer);
    Mine.Debug.printGLError();
    Mine.stage.gl.bufferData(Mine.stage.gl.ARRAY_BUFFER, new Float32Array(self.texCoords), Mine.stage.gl.STATIC_DRAW);
    Mine.Debug.printGLError();
    //Color the square
    self.cCount= self.vCount;
    self.setColor([1.0, 1.0, 1.0, 1.0]);
    self.type = "TRIANGLE_STRIP";
    return self;
};





//Cube primative.
Mine.Primatives.Cube = function () {
    var self = Mine.Primatives.Primative();
    self.addClass("Mine.Primatives.Cube");
    Mine.dm("Making a cube");
    Mine.Debug.printGLError();
    //The vertices are coming!
    self.vertices = [
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,
        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
        ];
    self.vCount = 24;
    //Filling the vertex buffer.
    Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, self.vBuffer);
    Mine.Debug.printGLError();
    Mine.stage.gl.bufferData(Mine.stage.gl.ARRAY_BUFFER, new Float32Array(self.vertices), Mine.stage.gl.STATIC_DRAW);
    Mine.Debug.printGLError();
    //Fill the index buffer.
    self.indexes = [
        0, 1, 2, 0, 2, 3, // Front face
        4, 5, 6, 4, 6, 7, // Back face
        8, 9, 10, 8, 10, 11, // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23 // Left face
            ];
    self.iCount = 36;
    Mine.stage.gl.bindBuffer(Mine.stage.gl.ELEMENT_ARRAY_BUFFER, self.iBuffer);
    Mine.Debug.printGLError();
    Mine.stage.gl.bufferData(Mine.stage.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(self.indexes), Mine.stage.gl.STATIC_DRAW);
    Mine.Debug.printGLError();
    //Texture coordinates when all faces are the same.
    self.texTypes = {};
    self.texTypes.allSame = [
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
    self.tcCount = 24;
    //Color the self
    self.cCount = self.vCount;
    self.setColor(Mine.Colors.red);
    self.type = "ELEMENTS_TRIANGLES";
    //self.type = "TRIANGLE_STRIP";



    //In the future this will allow you to choose which type of cube you have: one in which all the faces have the same texture, and other which different sides might have different textures. etc, etc..
    self.setTextureType = function (textureType) {
        Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, self.tcBuffer);
        Mine.Debug.printGLError();
        Mine.stage.gl.bufferData(Mine.stage.gl.ARRAY_BUFFER, new Float32Array(textureType), Mine.stage.gl.STATIC_DRAW);
        Mine.Debug.printGLError();
    };



    self.setTextureType(self.texTypes.allSame);
    Mine.dm("Made a cube");
    return self;
};





//Object with dimentions
Mine.DimentionalObject = function () {
    var self = Mine.Base();
    self.addClass("Mine.DimentionalObject");

    self.position = [0, 0, 0];
    self.rotation = [0, 0, 0];
    self.size = [0, 0, 0];

    //Moves the current position of the object by the vector given.
    self.movePos = function (movement) {
        var i;
        for(i in self.position) {
            if(self.position.hasOwnProperty(i)){
                self.position[i] += movement[i];
            }
        }
    };



    //Sets the current position of the object to the vector given.
    self.setPos = function (new_pos) {
        self.position = new_pos.slice(0);
    };



    //Returns the current position of the object.
    self.getPos = function () {
        return self.position;
    };



    //Additionally rotates the object by the vector given.
    self.addRot = function (new_rot) {
        var i;
        for(i in self.rotation) {
            if(self.rotation.hasOwnProperty(i)){
                self.rotation[i] += new_rot[i];
            }
        }
    };



    //Sets the current rotation of the objecto to the vector given.
    self.setRot = function (new_rot) {
        self.rotation= new_rot.slice(0);
    };
    


    //Returns the rotation of the object.
    self.getRot = function () {
        return self.rotation;
    };



    //Returns the size of the object.
    self.getSize = function () {
        return self.size;
    };



    return self;
};





//Thing is the base class for real objects that will interact and be movable in the "world".
Mine.Things = {};
Mine.Things.Thing = function () {
    var self = Mine.DimentionalObject();
    self.addClass("Mine.Things.Thing");
    self.textureLocation = [0, 0];
    self.needsDrawing= false;
    self.shape = null;
    self.collides = false;



    //Sets the index of where in the current texture this objects texture lies.
    self.setTexIndex = function (new_index) {
        self.textureLocation = new_index;
    };



    //Reports if this object needs to be drawn if called with no arguments. If arguments are supplied sets needsDrawing to the boolean value of the given argument and returns the new value.
    self.drawMe = function (change) {
        if (change != null) {
            self.needsDrawing = !!change;
        }
        return self.needsDrawing;
    };



    //Performs whatever actions need to be performed on the current object.
    self.act = function () {
        //Mine.dm("I'm empty...");
    };


    return self;
};





//Basically primatives that are wrapped as things, to be inherited from and not used directly.
Mine.BasicShapes = {};




//Basic square shaped thing.
Mine.BasicShapes.Square = function () {
    var self = Mine.Things.Thing();
    self.addClass("Mine.BasicShapes.Square");
    self.shape = Mine.Primatives.Square();
    return self;
};





//Basic cube shaped thing.
Mine.BasicShapes.Cube = function () {
    var self = Mine.Things.Thing();
    self.addClass("Mine.BasicShapes.Cube");
    if (!Mine.BasicShapes.Cube.cache) {
        Mine.BasicShapes.Cube.cache = Mine.Primatives.Cube();
    }
    self.shape = Mine.BasicShapes.Cube.cache;
    self.size = Mine.BasicShapes.Cube.size;
    self.drawMe(true);
    return self;
};
//End basic shapes.




//Sets the size of a Cube at 2 units on all dimentions.
Mine.BasicShapes.Cube.size = [2, 2, 2];
//Clears whatever cached object might have already been attached to the cube basic shape.
Mine.BasicShapes.Cube.cache = null;




Mine.Things.Entities = {};

Mine.Things.Entities.Entity = function () {
    var self = Mine.Things.Thing();
    self.addClass("Mine.Things.Entities.Entity");
    return self;
};





//Player class.
Mine.Things.Entities.Player = function () {
    var self = Mine.Things.Entities.Entity();
    self.addClass("Mine.Things.Entities.Player");

    //The player is currently invisible.
    self.drawMe(false);

    //Where, offset from the player, the camera is positioned.
    self.cameraPosition = [0,1,0]

    self.controlsCamera = true;
    //The players movements control how the camera moves.
    self.act = function () {


        var up, down, left, right;
        up = (self.stage.keys.state.W && !self.stage.keys.state.S) ? true : false;
        down = (!self.stage.keys.state.W && self.stage.keys.state.S) ? true : false;
        left = (self.stage.keys.state.A && !self.stage.keys.state.D) ? true : false;
        right = (!self.stage.keys.state.A && self.stage.keys.state.D) ? true : false;

        var speed = 0.1;
        if(up){
            self.movePos([0, 0, -speed]);
        }
        if(left){
            self.movePos([-speed, 0, 0]);
        }
        if(down){
            self.movePos([0, 0, speed]);
        }
        if(right){
            self.movePos([speed, 0, 0]);
        }

        if(self.controlsCamera){
            self.stage.camera.setPos(self.position);
            self.stage.camera.movePos(self.cameraPosition);
        }
    };

    return self;
};





//Block type things (they are cube shaped.)
Mine.Things.Blocks = {};



//Base block class.
Mine.Things.Blocks.Block = function () {
    var self = new Mine.BasicShapes.Cube();
    self.addClass("Mine.Things.Blocks.Block");
    return self;
};





//Invisible "air" block.
Mine.Things.Blocks.Air = function () {
    var self = new Mine.Things.Blocks.Block();
    self.addClass("Mine.Things.Blocks.Air");
    self.drawMe(false);
    return self;
};




//Grass block.
Mine.Things.Blocks.Grass = function () {
    var self = new Mine.Things.Blocks.Block();
    self.addClass("Mine.Things.Blocks.Grass");
    self.setTexIndex([0, 15]);
    return self;
};




//Brick block.
Mine.Things.Blocks.Brick= function () {
    var self = new Mine.Things.Blocks.Block();
    self.addClass("Mine.Things.Blocks.Brick");
    self.setTexIndex([8, 13]);
    return self;
};




//Goomba block.
Mine.Things.Blocks. Goomba = function () {
    var self= new Mine.Things.Blocks.Block();
    self.addClass("Mine.Things.Blocks.Goomba");
    self.shape = Mine.Primatives.Square();
    self.setTexIndex([12, 14]);
    return self;
};




//Hash map of the existing block types to ease importing scenes from files.
Mine.Things.Blocks.types = {
    "air":Mine.Things.Blocks.Air,
    "grass":Mine.Things.Blocks.Grass,
    "brick":Mine.Things.Blocks.Brick,
    "goomba":Mine.Things.Blocks.Goomba
};




//Chunk class: stores a matrix of blocks that represent the world.
Mine.Chunk = function(){
    var self = Mine.DimentionalObject();
    var x, y, z;
    self.addClass("Mine.Chunk");
    self.grid = null;
    self.unitSize = Mine.BasicShapes.Cube.size;

    self.initGrid = function(){
       self.grid = [];
       for(x = 0; x < Mine.Chunk.G_WIDTH; x += 1){
           self.grid[x] = [];
           for(y = 0; y < Mine.Chunk.G_HEIGHT; y += 1){
               self.grid[x][y] = [];
               for(z = 0; z < Mine.Chunk.G_LENGTH; z += 1){
                   var newBlock = Mine.Things.Blocks.Grass();
                   var blocksPosition = self.position.slice(0);
                   blocksPosition[0] += -(self.unitSize[0] * (Mine.Chunk.G_WIDTH/2))
                       + (x * self.unitSize[0]);
                   blocksPosition[1] += -(self.unitSize[1] * (Mine.Chunk.G_HEIGHT/2))
                       + (y * self.unitSize[1]);
                   blocksPosition[2] += -(self.unitSize[2] * (Mine.Chunk.G_LENGTH/2))
                       + (z * self.unitSize[1]);
                   newBlock.setPos(blocksPosition);
                   newBlock.drawMe(false);
                   self.grid[x][y][z] = newBlock;
               }               
                   //console.log("Position: "+blocksPosition);

               }
           }
    };



    self.getBlock = function (blockVector) {
        if(!self.grid){
            return null;
        }

        return self.grid[blockVector[0]][blockVector[1]][blockVector[2]];
    };



    self.setBlock = function (blockVector, newBlock) {
        if(!self.grid){
            return null;
        }

        self.grid[blockVector[0]][blockVector[1]][blockVector[2]] = newBlock;

        return self.getBlock(blockVector);
    }



    self.act = function () {};



    self.drawMe = function() {return true;};
    self.draw = function () {
        self.forEach(function (block) {
            //console.log("Moo");
            //console.log(block);
            if(block.drawMe()){
                self.stage.draw(block);
            }
            //console.log("Drawing: "+block.className());
        });
    };

    self.forEach = function (callback) {
        var x, y, z;

        for(x = 0; x < Mine.Chunk.G_WIDTH; x += 1){
            for(y = 0; y < Mine.Chunk.G_HEIGHT; y += 1){
                for(z = 0; z < Mine.Chunk.G_LENGTH; z += 1){
                    //console.log(self.grid);
                    callback(self.grid[x][y][z]);
                }
            }
        }

    };



    //console.log("Done");
    self.initGrid();
    return self;
};


Mine.Chunk.G_WIDTH = 5;
Mine.Chunk.G_LENGTH = 5;
Mine.Chunk.G_HEIGHT = 5;





//Stage class, also where the GL context is stored.
Mine.GLStage = function (id) {
    var self = Mine.Base();
    var i;
    self.addClass("Mine.Gl_stage");

    //Fields
    self.canvas = null;
    self.gl = null;
    self.program = null;
    self.actors = [];
    self.mvMatrix = mat4.create();
    self.pMatrix = mat4.create();
    //The color used by WebGL's color clear function, functions as the background color of the world.
    self.bgColor = Mine.Colors.fromInts([119, 187, 213, 255]);
    //self.bgColor = Mine.Colors.black;
    self.fps = 1000/30;
    self.interval = null;
    //keyboard state info.
    self.keys = Mine.Keys()    
        //Get the canvas.
        self.canvas = document.getElementById(id);
    //Try and initialize WebGL.
    try{
        Mine.dm("Initializing webgl");
        self.gl = self.canvas.getContext("experimental-webgl");
        Mine.stage = self;
        WebGLDebugUtils.init(Mine.stage.gl);
        Mine.Debug.printGLError();
    }
    catch(e) {
        Mine.dm("Failed to initialize webgl");
        Mine.dm(e)
    }



    //Set the current shader program.
    self.setProgram = function (active_program) {
        Mine.dm("Setting shader");
        self.program = active_program.program;
        self.gl.useProgram(active_program.program);
        Mine.Debug.printGLError();

        //Vertex position.
        self.program.vertexPositionAttribute = self.gl.getAttribLocation(self.program, "aVertexPosition");
        Mine.Debug.printGLError();
        self.gl.enableVertexAttribArray(self.program.vertexPositionAttribute);
        Mine.Debug.printGLError();

        //Vertex color.
        //self.program.vertexColorAttribute = self.gl.getAttribLocation(self.program, "aVertexColor");
        //Mine.Debug.printGLError();
        //self.gl.enableVertexAttribArray(self.program.vertexColorAttribute);
        //Mine.Debug.printGLError();

        //Vertex texture coord
        Mine.dm("So I can get aTextureCoord?");
        self.program.textureCoordAttribute = self.gl.getAttribLocation(self.program, "aTextureCoord");
        Mine.Debug.printGLError();
        self.gl.enableVertexAttribArray(self.program.textureCoordAttribute);
        Mine.Debug.printGLError();
        self.program.pMatrixUniform = self.gl.getUniformLocation(self.program, "uPMatrix");
        Mine.Debug.printGLError();
        self.program.mvMatrixUniform = self.gl.getUniformLocation(self.program, "uMVMatrix");
        Mine.Debug.printGLError();
        self.program.samplerUniform = self.gl.getUniformLocation(self.program, "uSampler");
        self.program.textureLocation = self.gl.getUniformLocation(self.program, "textureLocation");
        Mine.Debug.printGLError();
        Mine.dm("Setting shader done");
    };



    //Set the uniforms.
    self.setUniforms = function () {
        Mine.dm("Setting uniforms");
        self.gl.uniformMatrix4fv(self.program.pMatrixUniform, false, self.pMatrix);
        Mine.Debug.printGLError();
        self.gl.uniformMatrix4fv(self.program.mvMatrixUniform, false, self.mvMatrix);
        Mine.Debug.printGLError();
        Mine.dm("Uniforms set.");
    };



    //Sets the current camera.
    self.setCamera = function(newCamera){
        self.camera = newCamera;
        newCamera.stage = self;
    };



    //Clear the stage.
    self.clear = function () {
        Mine.dm("Clear the stage");
        self.gl.clearColor(self.bgColor[0],
                self.bgColor[1],
                self.bgColor[2],
                self.bgColor[3]
                );
        self.gl.enable(self.gl.BLEND);
        self.gl.enable(self.gl.DEPTH_TEST);
        self.gl.blendFunc(self.gl.SRC_ALPHA, self.gl.ONE_MINUS_SRC_ALPHA);
        Mine.Debug.printGLError();
        self.gl.depthFunc(self.gl.LEQUAL);
        Mine.Debug.printGLError();
        self.gl.clear(self.gl.COLOR_BUFFER_BIT|self.gl.DEPTH_BUFFER_BIT);
        Mine.Debug.printGLError();
        Mine.dm("Cleared the stage");
    };



    //Key input bits.
    //Hook keys
    self.hookKeys = function(){
        var importantKeys = [13, 32, 65, 68, 83, 87];
        var i;

        var checkImportant = function(keyCode){
            console.log(keyCode);
            for(i = 0; i < importantKeys.length; i+=1){
                if(keyCode == importantKeys[i]){
                    //console.log("Moo");
                    return false;
                }
            }

            //console.log("Boo");
            return true;
        };

        $(document).keydown(function(e){
            //console.log("Key has been pressed: "+e.keyCode);
            self.keys[e.keyCode] = true;
            return checkImportant(e.keyCode);
        });

        $(document).keyup(function(e){
            //console.log("Key has been released: "+e.keyCode);
            self.keys[e.keyCode] = false;
            return checkImportant(e.keyCode);
        });

    };


    //Draw the stage.
    self.draw = function (target) {
        Mine.dm("Drawing something");
        //Reset the move matrix.
        mat4.identity(self.mvMatrix);
        //Allow the camera to alter the mvMatrix;
        self.camera.changePerspective();

        if(target && target.isA("Mine.Chunk")){
            //console.log("I know this is a chunk :)");
            target.draw();
        }
        else if (target && target.isA("Mine.Things.Thing")) {
            Mine.dm("Drawing a thing");

            //Move to where the shape should be drawn.
            mat4.translate(self.mvMatrix, target.getPos());

            //Apply the shapes rotation.
            mat4.rotate(self.mvMatrix, target.getRot()[0], [1, 0, 0]);
            mat4.rotate(self.mvMatrix, target.getRot()[1], [0, 1, 0]);
            mat4.rotate(self.mvMatrix, target.getRot()[2], [0, 0, 1]);

            //Bind the Vertex buffer
            Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, target.shape.vBuffer);
            Mine.stage.gl.vertexAttribPointer(self.program.vertexPositionAttribute, target.shape.vSize, Mine.stage.gl.FLOAT, false, 0, 0);

            //Bind the color buffer.
            //Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, target.shape.cBuffer);
            //Mine.Debug.printGLError();
            //Mine.stage.gl.vertexAttribPointer(self.program.vertexColorAttribute, target.shape.cSize, Mine.stage.gl.FLOAT, false, 0, 0);
            //Mine.Debug.printGLError();

            //Bind the texture coordinate buffer.
            Mine.dm("Using texture: "+target.texture);
            Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, target.shape.tcBuffer);
            Mine.Debug.printGLError();
            Mine.stage.gl.vertexAttribPointer(self.program.textureCoordAttribute, target.shape.tcSize, Mine.stage.gl.FLOAT, false, 0, 0);
            Mine.Debug.printGLError();

            //Set the current and active texture and bind the texture buffer.
            Mine.stage.gl.activeTexture(Mine.stage.gl.TEXTURE0);
            Mine.Debug.printGLError();
            Mine.stage.gl.bindTexture(Mine.stage.gl.TEXTURE_2D, self.texture.glTexture);
            Mine.Debug.printGLError();
            Mine.stage.gl.uniform1i(self.program.samplerUniform, 0);
            Mine.Debug.printGLError();

            //Sets the mvMatrix and pMatrix uniforms.
            self.setUniforms();

            //Create matrix that will hold the texture indexes. This is inefficent and needs to be done differently.
            var test = mat4.create();
            test[0] = self.texture.devisions;
            test[1] = target.textureLocation[0];
            test[2] = target.textureLocation[1];
            Mine.dm("TextureLocation: "+self.program.textureLocation);
            self.gl.uniformMatrix4fv(self.program.textureLocation, false, test);
            Mine.Debug.printGLError();

            //Draw the shape.
            if (target.shape.type === "TRIANGLE_STRIP") {
                Mine.dm("Drawing triangle strip");
                Mine.stage.gl.drawArrays(Mine.stage.gl.TRIANGLE_STRIP, 0, target.shape.vCount);
                Mine.Debug.printGLError();
            }
            else if (target.shape.type === "ELEMENTS_TRIANGLES") {
                Mine.dm("Drawing elements");
                Mine.stage.gl.bindBuffer(Mine.stage.gl.ELEMENT_ARRAY_BUFFER, target.shape.iBuffer);
                Mine.Debug.printGLError();
                Mine.stage.gl.drawElements(Mine.stage.gl.TRIANGLES, target.shape.iCount, Mine.stage.gl.UNSIGNED_SHORT, 0);
                Mine.Debug.printGLError();
            }
            else {
                Mine.dm("Not known type, not drawing.");
            }
        }
        Mine.dm("Drew something");
    };



    //Addes an object to the stages collection.
    self.add = function (new_actor) {
        self.actors.push(new_actor);
        new_actor.stage = self;
    };



    //Runs the simulation.
    self.run = function () {
        if (self.interval) {
            return;
        }
        //Mine.stage.gl.clearColor(0.0, 1.0, 0.0, 1.0);
        //Mine.Debug.printGLError();
        Mine.stage.gl.enable(Mine.stage.gl.BLEND);
        Mine.Debug.printGLError();
        Mine.stage.gl.enable(Mine.stage.gl.DEPTH_TEST);
        Mine.Debug.printGLError();

        mat4.perspective(45, self.gl.viewportWidth / self.gl.viewportHeight, 0.1, 100.0, self.pMatrix);
        Mine.Debug.printGLError();
        self.interval = setInterval(function () {
            var actor;
            self.clear();

            //The camera is special so it acts here, outside normal loop.
            self.camera.act();

            Mine.dm("Begining acting loop.");
            for(actor in self.actors) {
                if(self.actors.hasOwnProperty(actor)){
                    self.actors[actor].act();
                    //Mine.dm("\tMoo");
                }
            }

            Mine.dm("Begining drawing loop.");
            for(actor in self.actors) {
                if(self.actors.hasOwnProperty(actor)){
                    if (self.actors[actor].drawMe()) {
                        self.draw(self.actors[actor]);
                    }
                }
            }
        }, self.fps);
    };



    //Stops the simulation if it is currently running after the current tick.
    self.end = function () {
        clearInterval(self.interval);
        self.interval = null;
    };



    //Constructor stuff.
    if (self.gl) {
        //self.clear();
        self.keys.hookKeys();
        //Sets the viewport to the current size of the canvas element.
        self.gl.viewportWidth = self.canvas.width;
        self.gl.viewportHeight = self.canvas.height;
    }
    else {
        Mine.dm("Failed somehow");
    }

    Mine.stage = self;
    self.setCamera(Mine.Things.Camera());
    return self;
};





//Creates and caches texture objects from names.
Mine.Texture = function (texture_name, devisions, callback) {
    var self = Mine.Base();
    self.addClass("Mine.Texture");
    self.devisions = devisions;
    Mine.dm("Creating a texture");
    //Check the cache first!.
    if (Mine.Texture.Cache[texture_name]) {
        Mine.dm("Found it?");
        return Mine.Texture.Cache[texture_name];
    }

    self.glTexture = Mine.stage.gl.createTexture();
    Mine.Debug.printGLError();

    self.image = new Image();

    //This callback handles loading the texture into a WebGL buffer.
    self.image.onload = function () {
        Mine.stage.gl.bindTexture(Mine.stage.gl.TEXTURE_2D, self.glTexture);
        Mine.Debug.printGLError();
        Mine.stage.gl.pixelStorei(Mine.stage.gl.UNPACK_FLIP_Y_WEBGL, true);
        Mine.Debug.printGLError();
        Mine.stage.gl.texImage2D(Mine.stage.gl.TEXTURE_2D, 0, Mine.stage.gl.RGBA, Mine.stage.gl.RGBA,
                Mine.stage.gl.UNSIGNED_BYTE,
                self.image);
        Mine.Debug.printGLError();
        Mine.stage.gl.texParameteri(Mine.stage.gl.TEXTURE_2D,
                Mine.stage.gl.TEXTURE_MAG_FILTER,
                Mine.stage.gl.NEAREST);
        Mine.Debug.printGLError();
        Mine.stage.gl.texParameteri(Mine.stage.gl.TEXTURE_2D,
                Mine.stage.gl.TEXTURE_MIN_FILTER,
                Mine.stage.gl.NEAREST);
        Mine.Debug.printGLError();
        Mine.stage.gl.bindTexture(Mine.stage.gl.TEXTURE_2D, null);
        Mine.Debug.printGLError();
        Mine.dm("Texture created.");
        if (callback) {
            //Mine.dm(self.glTexture);
            callback(self);
        }
    };

    //Sets the images source (triggers loading the texture).
    self.image.src = Mine.Texture.TEXTURE_LOCATION+texture_name+".png";

    return self;
};

Mine.Texture.TEXTURE_LOCATION = Mine.RESOURCE_LOCATION+"/textures/";
Mine.Texture.Cache = {};





//Camera class
Mine.Things.Camera = function(){
    var self = Mine.Things.Thing();
    self.addClass("Mine.Things.Camera");
    self.drawMe(false);
    self.stage = null;

    //Change the mvMatrix to reflect the position of the camera.
    self.changePerspective = function(){
        if(self.stage === null){
            return;
        }
        mat4.rotate(self.stage.mvMatrix, -self.rotation[0],[1,0,0]);
        mat4.rotate(self.stage.mvMatrix, -self.rotation[1],[0,1,0]);
        mat4.rotate(self.stage.mvMatrix, -self.rotation[2],[0,0,1]);
        mat4.translate(self.stage.mvMatrix, [
                -self.position[0],
                -self.position[1],
                -self.position[2]
                ]);

    };



    return self;
};





//Defines debugging functions and properties for the Mine framework.
Mine.Debug = {};
//Holds weither debugging is enabled or not.
Mine.Debug.debug = false;


//Checks to see if the last WebGL opperation was successful, if not prints error information.
Mine.Debug.printGLError = function (force) {
    if (!Mine.Debug.debug && !force) {
        return;
    }
    var getError = function () {
        try{
            throw new Error('');
        }
        catch(err) {
            return err;
        }
    };

    var err = getError();
    var error = Mine.stage.gl.getError();
    var temp = err.stack;
    if (force || error !== 0) {
        Mine.dm("Checking for errors "+(temp.split("\n")[4]));
        Mine.dm("\t"+error);
        Mine.dm("\t"+WebGLDebugUtils.glEnumToString(error));
    }
};



//Causes a message to be printed if debugging is enabled.
Mine.dm = function (message) {
    if (!Mine.Debug.debug) {
        return;
    }
    console.log(message);
};





//Handles keyboard input hooking.
Mine.Keys = function () {
    var self = Mine.Base();
    self.addClass("Mine.Keys");

    self.state = {};

    self.hookKeys = function () {

        //On key down events.
        $(document).keydown(function(e){
            var key = Mine.Keys.IMPORTANT_KEYS[e.keyCode];
            if(key){
                self.state[key] = true;
                return false;
            }

            return true;
        });

        //On key upevents.
        $(document).keyup(function(e){
            //console.log("Key has been released: "+e.keyCode);
            var key = Mine.Keys.IMPORTANT_KEYS[e.keyCode];
            if(key){
                self.state[key] = false;
                return false;
            }
            return true;
        });

    };

    return self;
};

Mine.Keys.IMPORTANT_KEYS = {
    13:"ENTER", 
    32:"SPACE", 
    65:"A", 
    68:"D", 
    83:"S",
    87:"W"
};





// "Main" function :)
$(document).ready(function () {
    Mine.Debug.debug = false;

    //Create the WebGL stage.
    var stage = Mine.GLStage("minedotjs");
    //Hook keyboard input.
    //stage.keys = Mine.Keys();
    //stage.keys.hookKeys();
    var shader = Mine.ShaderProgram("textured");

    //Loads the texture.
    Mine.dm("Creating a texture");
    var texture = Mine.Texture("terrain", 16, function (test) {
        stage.texture = test;
    });
    chunk = Mine.Chunk();
    stage.add(chunk);
    var thing = Mine.Things.Blocks.Brick();

    //shape.shape.setColor(Mine.Colors.indigo);
    //shape.addRot([0.5, 0.0, 0.0]);
    //shape2.setTexIndex([8, 13]);
    thing.setPos([0, -1, -10]);
    thing.act = function () {
        //shape.movePos([0.1, 0, 0]);
    };

    var player = Mine.Things.Entities.Player();
    stage.add(player);
    stage.add(thing);

    //Wait for the shader, then run the simulation.
    shader.waitFor(function () {
        stage.setProgram(shader);

        //Wait 0.1 seconds before running (not sure why anymore).
        setTimeout(function () {
            stage.run();
        }, 100);
    });

    //Stop the simulation after 5 seconds.
    setTimeout(function () {
        stage.end();
        Mine.dm("Stoping the stage.");
    }, 500000);
});
