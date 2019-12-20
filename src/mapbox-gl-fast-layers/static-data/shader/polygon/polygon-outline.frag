precision mediump float;

uniform float u_interpolation;

varying vec4 v_color;
varying vec4 v_outlineColor;
varying float v_size;
varying float v_distance;

void main() {
    vec4 color1, color2;
    float m;
    if (v_distance < u_interpolation) {
        color1 = v_color;
        color2 = v_outlineColor;
        m = smoothstep(0.0, u_interpolation, v_distance);
    } else {
        color1 = v_outlineColor;
        color2 = vec4(v_outlineColor.rgb, 0.0);
        m = smoothstep(v_size - u_interpolation, v_size, v_distance);
    }
    gl_FragColor = mix(color1, color2, m);
}
