precision mediump float;

uniform float u_interpolation;

varying float v_halfSize;
varying float v_outlineSize;
varying vec4 v_color;
varying vec4 v_outlineColor;
varying float v_distance;

void main() {
    float dist = abs(v_distance);
    bool branch = dist < v_halfSize;
    float x = branch ? dist - v_halfSize : dist - v_halfSize - v_outlineSize;
    vec4 color1 = branch ? v_color : v_outlineColor;
    vec4 color2 = branch ? v_outlineColor : vec4(v_outlineColor.rgb, 0.0);
    float m = smoothstep(-u_interpolation, 0.0, x);
    gl_FragColor = mix(color1, color2, m);
}
