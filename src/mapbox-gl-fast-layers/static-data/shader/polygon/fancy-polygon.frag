precision mediump float;

uniform float u_interpolation;

varying vec4 v_color;
varying vec4 v_outlineColor;
varying float v_hlafSize;
varying float v_distance;

void main() {
    float x = v_hlafSize - abs(v_distance);
    vec4 color1, color2;
    if (v_distance < 0.0) {
        color1 = v_color;
        color2 = v_outlineColor;
    } else {
        color1 = vec4(v_outlineColor.rgb, 0.0);
        color2 = v_outlineColor;
    }
    float m = smoothstep(0.0, u_interpolation, x);
    gl_FragColor = mix(color1, color2, m);
}
