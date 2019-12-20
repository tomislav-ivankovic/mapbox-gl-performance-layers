precision mediump float;

uniform float u_interpolation;

varying float v_halfSize;
varying vec4 v_color;
varying float v_distance;

void main() {
    float dist = abs(v_distance);
    float m = smoothstep(v_halfSize - u_interpolation, v_halfSize, dist);
    gl_FragColor = mix(v_color, vec4(v_color.rgb, 0.0), m);
}
