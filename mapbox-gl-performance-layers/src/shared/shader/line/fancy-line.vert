precision mediump float;

uniform mat4 u_matrix;
uniform vec2 u_viewPortSize;

attribute vec2 a_previousPosition;
attribute vec2 a_currentPosition;
attribute vec2 a_nextPosition;
attribute float a_size;
attribute float a_outlineSize;
attribute vec4 a_color;
attribute vec4 a_outlineColor;

varying float v_halfSize;
varying float v_outlineSize;
varying vec4 v_color;
varying vec4 v_outlineColor;
varying float v_distance;

void main() {
    v_halfSize = abs(0.5 * a_size);
    v_outlineSize = abs(a_outlineSize);
    v_color = a_color;
    v_outlineColor = a_outlineColor;
    v_distance = 0.5 * a_size + a_outlineSize;

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
