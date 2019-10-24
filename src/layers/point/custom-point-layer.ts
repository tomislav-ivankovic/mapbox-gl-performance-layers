import {CustomLayerInterface, MercatorCoordinate} from 'mapbox-gl';
import vertexSource from './points.vert';
import fragmentSource from './points.frag';
import {Color} from '../misc';
import {Feature, FeatureCollection, Point} from 'geojson';

export interface PointStyle {
    size: number;
    color: Color;
    outlineSize: number;
    outlineColor: Color;
}

// const defaultStyle: PointStyle = {
//     size: 5,
//     color: {r: 0, g: 0, b: 1, a: 1},
//     outlineSize: 1,
//     outlineColor:  {r: 0, g: 0, b: 0, a: 1}
// };

export class CustomPointLayer<P> implements CustomLayerInterface {
    public id: string = 'point-layer';
    public renderingMode: '2d' | '3d' = '2d';
    public type: 'custom' = 'custom';

    private program: WebGLProgram | null = null;
    private bufferArray = new Float32Array([]);

    constructor(
        private data: FeatureCollection<Point, P>,
        private style?: (feature: Feature<Point, P>) => Partial<PointStyle>,
        private onClick?: (feature: Feature<Point, P>) => void
    ) {
        this.setData(data);
    }

    setData(data: FeatureCollection<Point, P>) {
        this.data = data;
        this.bufferArray = new Float32Array(data.features.flatMap(f => {
            const coords = f.geometry.coordinates;
            const transformed = MercatorCoordinate.fromLngLat({lon: coords[0], lat: coords[1]}, 0);
            return [transformed.x, transformed.y];
        }));
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.bufferArray, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        console.log(vertexSource);

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
        gl.drawArrays(gl.POINTS, 0, this.data.features.length);
    }
}
