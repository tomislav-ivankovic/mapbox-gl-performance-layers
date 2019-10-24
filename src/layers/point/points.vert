precision mediump float;

uniform mat4 matrix;

attribute vec2 position;
attribute float vertSize;
attribute vec4 vertColor;
attribute float vertOutlineSize;
attribute vec4 vertOutlineColor;

varying float fragSize;
varying vec4 fragColor;
varying float fragOutlineSize;
varying vec4 fragOutlineColor;

void main() {
    fragSize = vertSize;
    fragColor = vertColor;
    fragOutlineSize = vertOutlineSize;
    fragOutlineColor = vertOutlineColor;

    gl_Position = matrix * vec4(position, 0.0, 1.0);
    gl_PointSize = vertSize + vertOutlineSize;
}
