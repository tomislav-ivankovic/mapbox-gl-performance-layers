precision mediump float;

uniform mat4 u_matrix;

attribute vec2 a_position;
attribute float a_size;
attribute vec4 a_color;
attribute float a_outlineSize;
attribute vec4 a_outlineColor;

varying float v_size;
varying vec4 v_color;
varying float v_outlineSize;
varying vec4 v_outlineColor;
varying float v_pointSize;
varying float v_halfSize;

void main() {
    v_size = a_size;
    v_color = a_color;
    v_outlineSize = a_outlineSize;
    v_outlineColor = a_outlineColor;
    v_pointSize = a_size + 2.0*a_outlineSize;
    v_halfSize = 0.5*v_size;

    gl_Position = u_matrix * vec4(a_position, 0.0, 1.0);
    gl_PointSize = v_pointSize;
}
