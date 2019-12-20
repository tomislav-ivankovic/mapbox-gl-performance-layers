precision mediump float;

uniform mat4 u_matrix;
uniform vec2 u_viewPortSize;
uniform float u_interpolation;

attribute vec2 a_previousPosition;
attribute vec2 a_currentPosition;
attribute vec2 a_nextPosition;
attribute float a_size;
attribute vec4 a_color;

varying vec4 v_color;
varying float v_halfSize;
varying float v_distance;

void main() {
    v_color = a_color;
    v_halfSize = 0.5 * (abs(a_size) + u_interpolation);
    v_distance = sign(a_size) * v_halfSize;

    vec4 previousProjected = u_matrix * vec4(a_previousPosition, 0.0, 1.0);
    vec4 currentProjected = u_matrix * vec4(a_currentPosition, 0.0, 1.0);
    vec4 nextProjected = u_matrix * vec4(a_nextPosition, 0.0, 1.0);

    vec2 previousScreen = previousProjected.xy / previousProjected.w * u_viewPortSize;
    vec2 currentScreen = currentProjected.xy / currentProjected.w * u_viewPortSize;
    vec2 nextScreen = nextProjected.xy / nextProjected.w * u_viewPortSize;

    vec2 dirA = normalize(currentScreen - previousScreen);
    vec2 dirB = normalize(nextScreen - currentScreen);
    vec2 tangent = normalize(dirA + dirB);
    vec2 perp = vec2(-dirA.y, dirA.x);

    vec2 normal = vec2(-tangent.y, tangent.x);
    vec2 offset = (2.0 * v_distance / max(dot(normal, perp), 0.1) * normal) / u_viewPortSize;

    gl_Position = vec4(currentProjected.xy / max(currentProjected.w, 0.0001) + offset, 0.0, 1.0);
}
