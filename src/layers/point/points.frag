precision mediump float;

uniform float interpolation;

varying float fragSize;
varying vec4 fragColor;
varying float fragOutlineSize;
varying vec4 fragOutlineColor;
varying float fragPointSize;
varying float fragHalfSize;

void main() {
    float dist = fragPointSize*distance(gl_PointCoord, vec2(0.5, 0.5));
    vec4 color1, color2;
    float x = dist - fragHalfSize;
    if (dist < fragHalfSize) {
        color1 = fragColor;
        color2 = fragOutlineColor;
    } else {
        x -= fragOutlineSize;
        color1 = fragOutlineColor;
        color2 = vec4(fragOutlineColor.rgb, 0.0);
    }
    float m = smoothstep(-interpolation, 0.0, x);
    gl_FragColor = mix(color1, color2, m);
}
