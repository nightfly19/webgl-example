"use strict";

var Mine = {};
//Where resources are located.
Mine.RESOURCE_LOCATION = "resources";





//Base class with utility functions to determine if an object is of certain types.
Mine.Base = function () {

    var base = {};



    //Holds what classes the object is.
    base.classes = [];



    //Adds a class to the list of classes the object is.
    base.addClass = function (new_class) {
        this.classes.push(new_class);
    };



    //Returns if an object is a member of the given class.
    base.isA = function (class_name) {
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



    base.addClass(Mine.Base);
    return base;
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
    var shader = Mine.Base();
    shader.addClass(Mine.ShaderProgram);
    var shader_location = Mine.RESOURCE_LOCATION+"/shaders/";
    shader.loaded = false;
    shader.failed = false;
    shader.program = null;

    //Get and compile fragment shader.
    $.get(shader_location+shader_name+".fragment.shader", {},
            function (data) {
                var fragment_shader = shader.compile(data, "fragment");
                if (fragment_shader) {
                    Mine.dm("Fragment shader compiled");
                    //Get and compile vertex shader.
                    $.get(shader_location+shader_name+".vertex.shader", {},
                        function (data) {
                            var vertex_shader = shader.compile(data, "vertex");
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
                                    shader.failed = true;
                                }
                                else {
                                    Mine.dm("program linked!!!");
                                    shader.program = shader_program;
                                    shader.loaded = true;
                                }
                            }
                            else {
                                Mine.dm("Failed to compile vertex shader...");
                                shader.failed = true;
                            }
                        }, "html");
                }
                else {
                    Mine.dm("Failed to compile fragment shader...");
                    shader.failed = true;
                }
            }, "html");
    shader.shader = null;
    shader.compile = function (shader_source, type) {
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
    shader.waitFor = function (callback) {
        var timer;
        timer = setInterval(function () {
            if (shader.failed) {
                clearInterval(timer);
                Mine.dm("Shader failed to compile...");
            }
            if (shader.loaded) {
                clearInterval(timer);
                callback();
            }
        }, 100);
    };



    return shader;
};





//Begin primatives.
Mine.Primatives = {};

//Mine.Primatives.Types = ["TRIANGLE_STRIP"];




//Base primative class, creates the buffers that decendant primatives will utilize.
Mine.Primatives.Primative = function () {
    Mine.dm("Creating a primative");
    var primative = Mine.Base();
    primative.addClass(Mine.Primatives.Primative);
    primative.vertices = [];
    primative.type = null;
    primative.vertices = [];
    primative.vBuffer = Mine.stage.gl.createBuffer();
    Mine.Debug.printGLError();
    primative.vCount = 0;
    primative.vSize = 3;
    primative.iBuffer = Mine.stage.gl.createBuffer();
    Mine.Debug.printGLError();
    primative.iCount= 0;
    primative.iSize = 1;
    primative.colors = false;
    primative.cBuffer = Mine.stage.gl.createBuffer();
    Mine.Debug.printGLError();
    primative.cCount = 0;
    primative.cSize = 4;
    primative.tcBuffer = Mine.stage.gl.createBuffer();
    Mine.Debug.printGLError();
    primative.tcCount = 0;
    primative.tcSize = 2;
    primative.texCoords = [];



    //Fills a primatives color buffer with the color in the vector given.
    primative.setColor = function (new_color) {
        var i;
        if (!primative.colors) {
            primative.colors = new Array(primative.cCount * primative.cSize);
        }
        for(i = 0; i < primative.cCount * primative.cSize; i++) {
            primative.colors[i] = new_color[i%primative.cSize];
        }
        Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, primative.cBuffer);
        Mine.Debug.printGLError();
        Mine.stage.gl.bufferData(Mine.stage.gl.ARRAY_BUFFER, new Float32Array(primative.colors), Mine.stage.gl.STATIC_DRAW);
        Mine.Debug.printGLError();
    };

    Mine.dm("Created a primative");
    return primative;
};





//Triangle primative.
Mine.Primatives.Triangle = function () {
    var triangle = Mine.Primatives.Primative();
    triangle.addClass(Mine.Primatives.Triangle);
    //Filling the vBuffer.
    triangle.vertices = [
        0.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
            ];
    triangle.vCount = 3;
    Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, triangle.vBuffer);
    Mine.stage.gl.bufferData(Mine.stage.gl.ARRAY_BUFFER, new Float32Array(triangle.vertices), Mine.stage.gl.STATIC_DRAW);
    //Color the triangle.
    triangle.cCount = triangle.vCount;
    triangle.setColor([1.0, 1.0, 1.0, 1.0]);
    triangle.type = "TRIANGLE_STRIP";
    return triangle;
};





//Square primative.
Mine.Primatives.Square = function () {
    var square = Mine.Primatives.Primative();
    square.addClass(Mine.Primatives.Square);
    square.vertices = [
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
            ];
    square.vCount = 4;
    //Creating and filling the buffer.
    Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, square.vBuffer);
    Mine.stage.gl.bufferData(Mine.stage.gl.ARRAY_BUFFER, new Float32Array(square.vertices), Mine.stage.gl.STATIC_DRAW);
    //TexCoords.
    square.texCoords = [
        1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0
            ];
    Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, square.tcBuffer);
    Mine.Debug.printGLError();
    Mine.stage.gl.bufferData(Mine.stage.gl.ARRAY_BUFFER, new Float32Array(square.texCoords), Mine.stage.gl.STATIC_DRAW);
    Mine.Debug.printGLError();
    //Color the square
    square.cCount= square.vCount;
    square.setColor([1.0, 1.0, 1.0, 1.0]);
    square.type = "TRIANGLE_STRIP";
    return square;
};





//Cube primative.
Mine.Primatives.Cube = function () {
    var cube = Mine.Primatives.Primative();
    cube.addClass(Mine.Primatives.Cube);
    Mine.dm("Making a cube");
    Mine.Debug.printGLError();
    //The vertices are coming!
    cube.vertices = [
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
    cube.vCount = 24;
    //Filling the vertex buffer.
    Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, cube.vBuffer);
    Mine.Debug.printGLError();
    Mine.stage.gl.bufferData(Mine.stage.gl.ARRAY_BUFFER, new Float32Array(cube.vertices), Mine.stage.gl.STATIC_DRAW);
    Mine.Debug.printGLError();
    //Fill the index buffer.
    cube.indexes = [
        0, 1, 2, 0, 2, 3, // Front face
        4, 5, 6, 4, 6, 7, // Back face
        8, 9, 10, 8, 10, 11, // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23 // Left face
            ];
    cube.iCount = 36;
    Mine.stage.gl.bindBuffer(Mine.stage.gl.ELEMENT_ARRAY_BUFFER, cube.iBuffer);
    Mine.Debug.printGLError();
    Mine.stage.gl.bufferData(Mine.stage.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.indexes), Mine.stage.gl.STATIC_DRAW);
    Mine.Debug.printGLError();
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



    //In the future this will allow you to choose which type of cube you have: one in which all the faces have the same texture, and other which different sides might have different textures. etc, etc..
    cube.setTextureType = function (textureType) {
        Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, cube.tcBuffer);
        Mine.Debug.printGLError();
        Mine.stage.gl.bufferData(Mine.stage.gl.ARRAY_BUFFER, new Float32Array(textureType), Mine.stage.gl.STATIC_DRAW);
        Mine.Debug.printGLError();
    };



    cube.setTextureType(cube.texTypes.allSame);
    Mine.dm("Made a cube");
    return cube;
};





//Thing is the base class for real objects that will interact and be movable in the "world".
Mine.Things = {};
Mine.Things.Thing = function () {
    var thing = Mine.Base();
    thing.addClass(Mine.Things.Thing);
    thing.position = [0, 0, 0];
    thing.rotation = [0, 0, 0];
    thing.size = [0, 0, 0];
    thing.textureLocation = [0, 0];
    thing.needsDrawing= true;
    thing.shape = null;



    //Sets the index of where in the current texture this objects texture lies.
    thing.setTexIndex = function (new_index) {
        thing.textureLocation = new_index;
    };



    //Reports if this object needs to be drawn if called with no arguments. If arguments are supplied sets needsDrawing to the boolean value of the given argument and returns the new value.
    thing.drawMe = function (change) {
        if (change != null) {
            thing.needsDrawing = !!change;
        }
        return thing.needsDrawing;
    };



    //Moves the current position of the object by the vector given.
    thing.movePos = function (movement) {
        var i;
        for(i in thing.position) {
            if(thing.position.hasOwnProperty(i)){
                thing.position[i] += movement[i];
            }
        }
    };



    //Sets the current position of the object to the vector given.
    thing.setPos = function (new_pos) {
        thing.position = new_pos;
    };



    //Returns the current position of the object.
    thing.getPos = function () {
        return thing.position;
    };



    //Sets the current rotation of the objecto to the vector given.
    thing.setRot = function (new_rot) {
        thing.rotation= new_rot;
    };



    //Additionally rotates the object by the vector given.
    thing.addRot = function (new_rot) {
        var i;
        for(i in thing.rotation) {
            if(thing.rotation.hasOwnProperty(i)){
                thing.rotation[i] += new_rot[i];
            }
        }
    };


    
    //Returns the size of the object.
    thing.getSize = function () {
        return thing.size;
    };



    //Returns the rotation of the object.
    thing.getRot = function () {
        return thing.rotation;
    };



    //Performs whatever actions need to be performed on the current object.
    thing.act = function () {
        //Mine.dm("I'm empty...");
    };


    return thing;
};





//Basically primatives that are wrapped as things, to be inherited from and not used directly.
Mine.BasicShapes = {};




//Basic square shaped thing.
Mine.BasicShapes.Square = function () {
    var square = Mine.Things.Thing();
    square.addClass(Mine.BasicShapes.Square);
    square.shape = Mine.Primatives.Square();
    return square;
};





//Basic cube shaped thing.
Mine.BasicShapes.Cube= function () {
    var cube = Mine.Things.Thing();
    cube.addClass(Mine.BasicShapes.Cube);
    if (!Mine.BasicShapes.Cube.cache) {
        Mine.BasicShapes.Cube.cache = Mine.Primatives.Cube();
    }
    cube.shape = Mine.BasicShapes.Cube.cache;
    cube.size = Mine.BasicShapes.Cube.size;
    return cube;
};
//End basic shapes.




//Sets the size of a Cube at 2 units on all dimentions.
Mine.BasicShapes.Cube.size = [2, 2, 2];
//Clears whatever cached object might have already been attached to the cube basic shape.
Mine.BasicShapes.Cube.cache = null;





//Mine.Player





//Block type things (they are cube shaped.)
Mine.Things.Blocks = {};



//Base block class.
Mine.Things.Blocks.Block = function () {
    var block = new Mine.BasicShapes.Cube();
    block.addClass(Mine.Things.Blocks.Block);
    return block;
};





//Invisible "air" block.
Mine.Things.Blocks.Air = function () {
    var air = new Mine.Things.Blocks.Block();
    air.addClass(Mine.Things.Blocks.Air);
    air.drawMe(false);
    return air;
};




//Grass block.
Mine.Things.Blocks.Grass = function () {
    var grass = new Mine.Things.Blocks.Block();
    grass.addClass(Mine.Things.Blocks.Grass);
    grass.setTexIndex([0, 15]);
    return grass;
};




//Brick block.
Mine.Things.Blocks.Brick= function () {
    var brick= new Mine.Things.Blocks.Block();
    brick.addClass(Mine.Things.Blocks.Brick);
    brick.setTexIndex([8, 13]);
    return brick;
};




//Goomba block.
Mine.Things.Blocks. Goomba = function () {
    var goomba= new Mine.Things.Blocks.Block();
    goomba.addClass(Mine.Things.Blocks.Goomba);
    goomba.shape = Mine.Primatives.Square();
    goomba.setTexIndex([12, 14]);
    return goomba;
};




//Hash map of the existing block types to ease importing scenes from files.
Mine.Things.Blocks.types = {
    "air":Mine.Things.Blocks.Air,
    "grass":Mine.Things.Blocks.Grass,
    "brick":Mine.Things.Blocks.Brick,
    "goomba":Mine.Things.Blocks.Goomba
};



//Stage class, also where the GL context is stored.
Mine.GLStage = function (id) {
    var glStage = Mine.Base();
    var i;
    glStage.addClass(Mine.Gl_stage);

    //Fields
    glStage.canvas = null;
    glStage.gl = null;
    glStage.program = null;
    glStage.actors = [];
    glStage.mvMatrix = mat4.create();
    glStage.pMatrix = mat4.create();
    //The color used by WebGL's color clear function, functions as the background color of the world.
    glStage.bgColor = Mine.Colors.fromInts([119, 187, 213, 255]);
    //glStage.bgColor = Mine.Colors.black;
    glStage.fps = 1000/30;
    glStage.interval = null;
    //keyboard state info.
    glStage.keys = Mine.Keys()    
    //Get the canvas.
    glStage.canvas = document.getElementById(id);
    //Try and initialize WebGL.
    try{
        Mine.dm("Initializing webgl");
        glStage.gl = glStage.canvas.getContext("experimental-webgl");
        Mine.stage = glStage;
        WebGLDebugUtils.init(Mine.stage.gl);
        Mine.Debug.printGLError();
    }
    catch(e) {
        Mine.dm("Failed to initialize webgl");
        Mine.dm(e)
    }



    //Set the current shader program.
    glStage.setProgram = function (active_program) {
        Mine.dm("Setting shader");
        glStage.program = active_program.program;
        glStage.gl.useProgram(active_program.program);
        Mine.Debug.printGLError();

        //Vertex position.
        glStage.program.vertexPositionAttribute = glStage.gl.getAttribLocation(glStage.program, "aVertexPosition");
        Mine.Debug.printGLError();
        glStage.gl.enableVertexAttribArray(glStage.program.vertexPositionAttribute);
        Mine.Debug.printGLError();

        //Vertex color.
        //glStage.program.vertexColorAttribute = glStage.gl.getAttribLocation(glStage.program, "aVertexColor");
        //Mine.Debug.printGLError();
        //glStage.gl.enableVertexAttribArray(glStage.program.vertexColorAttribute);
        //Mine.Debug.printGLError();

        //Vertex texture coord
        Mine.dm("So I can get aTextureCoord?");
        glStage.program.textureCoordAttribute = glStage.gl.getAttribLocation(glStage.program, "aTextureCoord");
        Mine.Debug.printGLError();
        glStage.gl.enableVertexAttribArray(glStage.program.textureCoordAttribute);
        Mine.Debug.printGLError();
        glStage.program.pMatrixUniform = glStage.gl.getUniformLocation(glStage.program, "uPMatrix");
        Mine.Debug.printGLError();
        glStage.program.mvMatrixUniform = glStage.gl.getUniformLocation(glStage.program, "uMVMatrix");
        Mine.Debug.printGLError();
        glStage.program.samplerUniform = glStage.gl.getUniformLocation(glStage.program, "uSampler");
        glStage.program.textureLocation = glStage.gl.getUniformLocation(glStage.program, "textureLocation");
        Mine.Debug.printGLError();
        Mine.dm("Setting shader done");
    };



    //Set the uniforms.
    glStage.setUniforms = function () {
        Mine.dm("Setting uniforms");
        glStage.gl.uniformMatrix4fv(glStage.program.pMatrixUniform, false, glStage.pMatrix);
        Mine.Debug.printGLError();
        glStage.gl.uniformMatrix4fv(glStage.program.mvMatrixUniform, false, glStage.mvMatrix);
        Mine.Debug.printGLError();
        Mine.dm("Uniforms set.");
    };



    //Sets the current camera.
    glStage.setCamera = function(newCamera){
        glStage.camera = newCamera;
        newCamera.stage = glStage;
    };



    //Clear the stage.
    glStage.clear = function () {
        Mine.dm("Clear the stage");
        glStage.gl.clearColor(glStage.bgColor[0],
                glStage.bgColor[1],
                glStage.bgColor[2],
                glStage.bgColor[3]
                );
        glStage.gl.enable(glStage.gl.BLEND);
        glStage.gl.enable(glStage.gl.DEPTH_TEST);
        glStage.gl.blendFunc(glStage.gl.SRC_ALPHA, glStage.gl.ONE_MINUS_SRC_ALPHA);
        Mine.Debug.printGLError();
        glStage.gl.depthFunc(glStage.gl.LEQUAL);
        Mine.Debug.printGLError();
        glStage.gl.clear(glStage.gl.COLOR_BUFFER_BIT|glStage.gl.DEPTH_BUFFER_BIT);
        Mine.Debug.printGLError();
        Mine.dm("Cleared the stage");
    };



    //Key input bits.
    //Hook keys
    glStage.hookKeys = function(){
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
            glStage.keys[e.keyCode] = true;
            return checkImportant(e.keyCode);
        });

        $(document).keyup(function(e){
            //console.log("Key has been released: "+e.keyCode);
            glStage.keys[e.keyCode] = false;
            return checkImportant(e.keyCode);
        });

    };


    //Draw the stage.
    glStage.draw = function (target) {
        Mine.dm("Drawing something");
        //Reset the move matrix.
        mat4.identity(glStage.mvMatrix);
        //Allow the camera to alter the mvMatrix;
        glStage.camera.changePerspective();
        if (target && target.isA(Mine.Things.Thing)) {
            Mine.dm("Drawing a thing");

            //Move to where the shape should be drawn.
            mat4.translate(glStage.mvMatrix, target.getPos());

            //Apply the shapes rotation.
            mat4.rotate(glStage.mvMatrix, target.getRot()[0], [1, 0, 0]);
            mat4.rotate(glStage.mvMatrix, target.getRot()[1], [0, 1, 0]);
            mat4.rotate(glStage.mvMatrix, target.getRot()[2], [0, 0, 1]);

            //Bind the Vertex buffer
            Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, target.shape.vBuffer);
            Mine.stage.gl.vertexAttribPointer(glStage.program.vertexPositionAttribute, target.shape.vSize, Mine.stage.gl.FLOAT, false, 0, 0);

            //Bind the color buffer.
            //Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, target.shape.cBuffer);
            //Mine.Debug.printGLError();
            //Mine.stage.gl.vertexAttribPointer(glStage.program.vertexColorAttribute, target.shape.cSize, Mine.stage.gl.FLOAT, false, 0, 0);
            //Mine.Debug.printGLError();

            //Bind the texture coordinate buffer.
            Mine.dm("Using texture: "+target.texture);
            Mine.stage.gl.bindBuffer(Mine.stage.gl.ARRAY_BUFFER, target.shape.tcBuffer);
            Mine.Debug.printGLError();
            Mine.stage.gl.vertexAttribPointer(glStage.program.textureCoordAttribute, target.shape.tcSize, Mine.stage.gl.FLOAT, false, 0, 0);
            Mine.Debug.printGLError();

            //Set the current and active texture and bind the texture buffer.
            Mine.stage.gl.activeTexture(Mine.stage.gl.TEXTURE0);
            Mine.Debug.printGLError();
            Mine.stage.gl.bindTexture(Mine.stage.gl.TEXTURE_2D, glStage.texture.glTexture);
            Mine.Debug.printGLError();
            Mine.stage.gl.uniform1i(glStage.program.samplerUniform, 0);
            Mine.Debug.printGLError();

            //Sets the mvMatrix and pMatrix uniforms.
            glStage.setUniforms();

            //Create matrix that will hold the texture indexes. This is inefficent and needs to be done differently.
            var test = mat4.create();
            test[0] = glStage.texture.devisions;
            test[1] = target.textureLocation[0];
            test[2] = target.textureLocation[1];
            Mine.dm("TextureLocation: "+glStage.program.textureLocation);
            glStage.gl.uniformMatrix4fv(glStage.program.textureLocation, false, test);
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
    glStage.add = function (new_actor) {
        glStage.actors.push(new_actor);
        new_actor.stage = glStage;
    };



    //Runs the simulation.
    glStage.run = function () {
        if (glStage.interval) {
            return;
        }
        //Mine.stage.gl.clearColor(0.0, 1.0, 0.0, 1.0);
        //Mine.Debug.printGLError();
        Mine.stage.gl.enable(Mine.stage.gl.BLEND);
        Mine.Debug.printGLError();
        Mine.stage.gl.enable(Mine.stage.gl.DEPTH_TEST);
        Mine.Debug.printGLError();

        mat4.perspective(45, glStage.gl.viewportWidth / glStage.gl.viewportHeight, 0.1, 100.0, glStage.pMatrix);
        Mine.Debug.printGLError();
        glStage.interval = setInterval(function () {
            var actor;
            glStage.clear();

            //The camera is special so it acts here, outside normal loop.
            glStage.camera.act();

            Mine.dm("Begining acting loop.");
            for(actor in glStage.actors) {
                if(glStage.actors.hasOwnProperty(actor)){
                    glStage.actors[actor].act();
                    //Mine.dm("\tMoo");
                }
            }

            Mine.dm("Begining drawing loop.");
            for(actor in glStage.actors) {
                if(glStage.actors.hasOwnProperty(actor)){
                    if (glStage.actors[actor].drawMe()) {
                        glStage.draw(glStage.actors[actor]);
                    }
                }
            }
        }, glStage.fps);
    };



    //Stops the simulation if it is currently running after the current tick.
    glStage.end = function () {
        clearInterval(glStage.interval);
        glStage.interval = null;
    };



    //Constructor stuff.
    if (glStage.gl) {
        //glStage.clear();
        glStage.keys.hookKeys();
        //Sets the viewport to the current size of the canvas element.
        glStage.gl.viewportWidth = glStage.canvas.width;
        glStage.gl.viewportHeight = glStage.canvas.height;
    }
    else {
        Mine.dm("Failed somehow");
    }

    Mine.stage = glStage;
    glStage.setCamera(Mine.Things.Camera());
    return glStage;
};





//Creates and caches texture objects from names.
Mine.Texture = function (texture_name, devisions, callback) {
    var texture = Mine.Base();
    texture.addClass(Mine.Texture);
    texture.devisions = devisions;
    Mine.dm("Creating a texture");
    //Check the cache first!.
    if (Mine.Texture.Cache[texture_name]) {
        Mine.dm("Found it?");
        return Mine.Texture.Cache[texture_name];
    }

    texture.glTexture = Mine.stage.gl.createTexture();
    Mine.Debug.printGLError();

    texture.image = new Image();

    //This callback handles loading the texture into a WebGL buffer.
    texture.image.onload = function () {
        Mine.stage.gl.bindTexture(Mine.stage.gl.TEXTURE_2D, texture.glTexture);
        Mine.Debug.printGLError();
        Mine.stage.gl.pixelStorei(Mine.stage.gl.UNPACK_FLIP_Y_WEBGL, true);
        Mine.Debug.printGLError();
        Mine.stage.gl.texImage2D(Mine.stage.gl.TEXTURE_2D, 0, Mine.stage.gl.RGBA, Mine.stage.gl.RGBA,
                Mine.stage.gl.UNSIGNED_BYTE,
                texture.image);
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
            //Mine.dm(texture.glTexture);
            callback(texture);
        }
    };

    //Sets the images source (triggers loading the texture).
    texture.image.src = Mine.Texture.TEXTURE_LOCATION+texture_name+".png";

    return texture;
};

Mine.Texture.TEXTURE_LOCATION = Mine.RESOURCE_LOCATION+"/textures/";
Mine.Texture.Cache = {};





//Camera class
Mine.Things.Camera = function(){
    var camera = Mine.Things.Thing();
    camera.addClass(Mine.Things.Camera);
    camera.drawMe(false);
    camera.stage = null;

    //Change the mvMatrix to reflect the position of the camera.
    camera.changePerspective = function(){
        if(camera.stage === null){
            return;
        }
        mat4.rotate(camera.stage.mvMatrix, -camera.rotation[0],[1,0,0]);
        mat4.rotate(camera.stage.mvMatrix, -camera.rotation[1],[0,1,0]);
        mat4.rotate(camera.stage.mvMatrix, -camera.rotation[2],[0,0,1]);
        mat4.translate(camera.stage.mvMatrix, [
                -camera.position[0],
                -camera.position[1],
                -camera.position[2]
                ]);

    };



    return camera;
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
    var keys = Mine.Base();

    keys.state = {};

    keys.hookKeys = function () {

        //On key down events.
        $(document).keydown(function(e){
            var key = Mine.Keys.IMPORTANT_KEYS[e.keyCode];
            if(key){
                keys.state[key] = true;
                return false;
            }

            return true;
        });

        //On key upevents.
        $(document).keyup(function(e){
            //console.log("Key has been released: "+e.keyCode);
            var key = Mine.Keys.IMPORTANT_KEYS[e.keyCode];
            if(key){
                keys.state[key] = false;
                return false;
            }
            return true;
        });

    };
    keys.addClass(Mine.Keys);

    return keys;
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
    var thing = Mine.Things.Blocks.Brick();

    //shape.shape.setColor(Mine.Colors.indigo);
    //shape.addRot([0.5, 0.0, 0.0]);
    //shape2.setTexIndex([8, 13]);
    thing.setPos([0, -1, -10]);
    thing.act = function () {
        //shape.movePos([0.1, 0, 0]);
    };
    stage.camera.addRot([0,0.0,0.1]);

    stage.camera.act = function () {
        var up, down, left, right;
        up = (stage.keys.state.W && !stage.keys.state.S) ? true : false;
        down = (!stage.keys.state.W && stage.keys.state.S) ? true : false;
        left = (stage.keys.state.A && !stage.keys.state.D) ? true : false;
        right = (!stage.keys.state.A && stage.keys.state.D) ? true : false;

        var speed = 0.1;
        if(up){
            stage.camera.movePos([0, 0, -speed]);
        };
        if(left){
            stage.camera.movePos([-speed, 0, 0]);
        };
        if(down){
            stage.camera.movePos([0, 0, speed]);
        };
        if(right){
            stage.camera.movePos([speed, 0, 0]);
        };
        //stage.camera.movePos([0.1, 0, 0]);
    }

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
