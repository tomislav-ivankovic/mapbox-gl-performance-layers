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
varying float fragPointSize;
varying float fragHalfSize;

void main() {
    fragSize = vertSize;
    fragColor = vertColor;
    fragOutlineSize = vertOutlineSize;
    fragOutlineColor = vertOutlineColor;
    fragPointSize = vertSize + 2.0*vertOutlineSize;
    fragHalfSize = 0.5*fragSize;

    gl_Position = matrix * vec4(position, 0.0, 1.0);
    gl_PointSize = fragPointSize;
}
