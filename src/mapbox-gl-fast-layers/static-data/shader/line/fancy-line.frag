precision mediump float;

uniform float u_interpolation;

varying float v_halfSize;
varying float v_outlineSize;
varying vec4 v_color;
varying vec4 v_outlineColor;
varying float v_distance;

void main() {
    float dist = abs(v_distance);
    vec4 color1, color2;
    float x = dist - v_halfSize;
    if (dist < v_halfSize) {
        color1 = v_color;
        color2 = v_outlineColor;
    } else {
        x -= v_outlineSize;
        color1 = v_outlineColor;
        color2 = vec4(v_outlineColor.rgb, 0.0);
    }
    float m = smoothstep(-u_interpolation, 0.0, x);
    gl_FragColor = mix(color1, color2, m);
}
