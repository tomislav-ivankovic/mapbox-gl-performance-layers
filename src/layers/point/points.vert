uniform mat4 u_matrix;
attribute vec2 coordinates;
void main() {
    gl_Position = u_matrix * vec4(coordinates, 0.0, 1.0);
    gl_PointSize = 2.0;
}
