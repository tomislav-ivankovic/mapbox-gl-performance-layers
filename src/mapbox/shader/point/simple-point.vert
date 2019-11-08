precision mediump float;

uniform mat4 u_matrix;

attribute vec2 a_position;
attribute float a_size;
attribute vec4 a_color;

varying float v_size;
varying vec4 v_color;

void main() {
    v_size = a_size;
    v_color = a_color;

    gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);
    gl_PointSize = a_size;
}
