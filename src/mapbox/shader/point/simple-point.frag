precision mediump float;

uniform float u_interpolation;

varying float v_size;
varying vec4 v_color;

void main() {
    float dist = v_pointSize*distance(gl_PointCoord, vec2(0.5, 0.5));
    float x = dist - v_size;
    float m = smoothstep(-u_interpolation, 0.0, x);
    gl_FragColor = mix(v_color, vec4(v_color.rgb, 0.0), m);
}
