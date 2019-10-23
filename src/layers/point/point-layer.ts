import {CustomLayerInterface, MercatorCoordinate} from 'mapbox-gl';

const numberOfPoints = 1000000;
const centerX = 15.9819;
const centerY = 45.8150;
const spread = 10;
const pointsToRender: number[] = [];
for (let i = 0; i < numberOfPoints; i++) {
    const x = centerX + (Math.random() - 0.5) * spread;
    const y = centerY + (Math.random() - 0.5) * spread;
    const transformed = MercatorCoordinate.fromLngLat({lon: x, lat: y}, 0);
    pointsToRender.push(transformed.x);
    pointsToRender.push(transformed.y);
}

export class PointLayer implements CustomLayerInterface {
    public id: string;
    public renderingMode: '2d' | '3d';
    public type: 'custom';

    private program: WebGLProgram | null = null;

    constructor() {
        this.id = 'point-layer';
        this.renderingMode = '2d';
        this.type = 'custom';
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsToRender), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        const vertexSource = `
        uniform mat4 u_matrix;
		attribute vec2 coordinates;
        void main() {
            gl_Position = u_matrix * vec4(coordinates, 0.0, 1.0);
            gl_PointSize = 2.0;
        }
		`;

        const fragmentSource = `
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
		`;

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        if (vertexShader == null) {
            console.error('Vertex shader is NULL.');
            return;
        }
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (fragmentShader == null) {
            console.error('Fragment shader is NULL.');
            return;
        }
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);

        const program = gl.createProgram();
        if (program == null) {
            console.error('Program is NULL.');
            return;
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        this.program = program;

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        const coord = gl.getAttribLocation(this.program, 'coordinates');
        gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coord);
    }

    onRemove(map: mapboxgl.Map, gl: WebGLRenderingContext): void {

    }

    prerender(gl: WebGLRenderingContext, matrix: number[]): void {

    }

    render(gl: WebGLRenderingContext, matrix: number[]): void {
        if (this.program == null) {
            return;
        }
        gl.useProgram(this.program);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'u_matrix'), false, matrix);
        gl.drawArrays(gl.POINTS, 0, numberOfPoints);
    }
}
