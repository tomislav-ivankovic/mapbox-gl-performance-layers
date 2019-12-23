precision mediump float;

uniform float u_interpolation;

varying float v_size;
varying vec4 v_color;
varying float v_halfSize;

void main() {
    float dist = v_size * distance(gl_PointCoord, vec2(0.5, 0.5));
    float x = dist - v_halfSize;
    float m = smoothstep(-u_interpolation, 0.0, x);
    gl_FragColor = mix(v_color, vec4(v_color.rgb, 0.0), m);
}
