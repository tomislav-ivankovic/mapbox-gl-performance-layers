precision mediump float;

uniform float u_interpolation;

varying vec4 v_color;
varying vec4 v_outlineColor;
varying float v_size;
varying float v_distance;

void main() {
    bool branch = v_distance < u_interpolation;
    float x = branch ? v_distance : v_size - v_distance;
    vec4 color1 = branch ? v_color : vec4(v_outlineColor.rgb, 0.0);
    vec4 color2 = branch ? v_outlineColor : v_outlineColor;
    float m = smoothstep(0.0, u_interpolation, x);
    gl_FragColor = mix(color1, color2, m);
}
