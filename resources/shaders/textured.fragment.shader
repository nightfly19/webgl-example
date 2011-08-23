
#ifdef GL_ES 
  precision highp float; 
#endif 
    
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform mat4 textureLocation;
// vec4(devisions,row,column,suprise)

vec2 findLocation(){
  float xChunk = 1.0 / textureLocation[0][0];
  float yChunk = 1.0 / textureLocation[0][0];
  float xCoord = (vTextureCoord.x * xChunk) + xChunk * textureLocation[0][1];
  float yCoord = (vTextureCoord.y * yChunk) + yChunk * textureLocation[0][2];
  return vec2(xCoord,yCoord);
}

void main(void) { 
  gl_FragColor = texture2D(uSampler, findLocation());
}

