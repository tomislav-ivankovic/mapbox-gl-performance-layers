precision mediump float;

uniform mat4 u_matrix;
uniform sampler2D u_sampler;

attribute vec2 a_position;
attribute vec2 a_textureCoordinate;

varying vec2 v_textureCoordinate;

void main() {
    v_textureCoordinate = a_textureCoordinate;
    gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);
}
