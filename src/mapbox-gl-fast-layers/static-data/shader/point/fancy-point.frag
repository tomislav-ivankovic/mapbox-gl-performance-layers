precision mediump float;

uniform float u_interpolation;

varying float v_size;
varying vec4 v_color;
varying float v_outlineSize;
varying vec4 v_outlineColor;
varying float v_pointSize;
varying float v_halfSize;

void main() {
    float dist = v_pointSize * distance(gl_PointCoord, vec2(0.5, 0.5));
    bool branch = dist < v_halfSize;
    float x = branch ? dist - v_halfSize : dist - v_halfSize - v_outlineSize;
    vec4 color1 = branch ? v_color : v_outlineColor;
    vec4 color2 = branch ? v_outlineColor : vec4(v_outlineColor.rgb, 0.0);
    float m = smoothstep(-u_interpolation, 0.0, x);
    gl_FragColor = mix(color1, color2, m);
}
