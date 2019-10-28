precision mediump float;

uniform mat4 u_matrix;

attribute vec4 u_position;
attribute vec2 u_texcoord;

varying vec2 v_texcoord;

void main() {
    gl_Position = u_matrix * u_position;
    v_texcoord = u_texcoord;
}
