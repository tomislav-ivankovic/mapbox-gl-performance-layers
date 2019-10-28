precision mediump float;

uniform mat4 matrix;

attribute vec4 vertPosition;
attribute vec2 vertTexcoord;

varying vec2 fragTexcoord;

void main() {
    gl_Position = matrix * vertPosition;
    fragTexcoord = vertTexcoord;
}
