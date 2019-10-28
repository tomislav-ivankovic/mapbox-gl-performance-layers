precision mediump float;

uniform float u_interpolation;

varying float v_size;
varying vec4 v_color;
varying float v_outlineSize;
varying vec4 v_outlineColor;
varying float v_pointSize;
varying float v_halfSize;

void main() {
    float dist = v_pointSize*distance(gl_PointCoord, vec2(0.5, 0.5));
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
