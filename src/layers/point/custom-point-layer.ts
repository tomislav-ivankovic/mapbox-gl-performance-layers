import {CustomLayerInterface, MercatorCoordinate} from 'mapbox-gl';
import {Feature, FeatureCollection, Point} from 'geojson';
import {Color, createShaderProgram} from '../misc';
import vertexSource from './points.vert';
import fragmentSource from './points.frag';

export interface PointStyle {
    size: number;
    color: Color;
    outlineSize: number;
    outlineColor: Color;
}

const defaultStyle: PointStyle = {
    size: 5,
    color: {r: 0, g: 0, b: 1, a: 1},
    outlineSize: 1,
    outlineColor: {r: 0, g: 0, b: 0, a: 1}
};

export class CustomPointLayer<P> implements CustomLayerInterface {
    public id: string = 'point-layer';
    public renderingMode: '2d' | '3d' = '2d';
    public type: 'custom' = 'custom';

    private program: WebGLProgram | null = null;
    private vertexBuffer: WebGLBuffer | null = null;
    private bufferArray = new Float32Array([]);
    private vertexBufferNeedsRefresh = false;

    constructor(
        private data: FeatureCollection<Point, P>,
        private style?: (feature: Feature<Point, P>) => Partial<PointStyle>,
        private onClick?: (feature: Feature<Point, P>) => void,
        private interpolation: number = 1.8
    ) {
        this.setData(data);
    }

    setData(data: FeatureCollection<Point, P>) {
        this.data = data;
        this.bufferArray = new Float32Array(data.features.flatMap(feature => {
            const coords = feature.geometry.coordinates;
            const transformed = MercatorCoordinate.fromLngLat({lon: coords[0], lat: coords[1]}, 0);
            const style = this.style != null ? {...defaultStyle, ...this.style(feature)} : defaultStyle;
            return [
                transformed.x, transformed.y,
                style.size,
                style.color.r, style.color.g, style.color.b, style.color.a,
                style.outlineSize,
                style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineColor.a
            ];
        }));
        this.vertexBufferNeedsRefresh = true;
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        const program = createShaderProgram(gl, vertexSource, fragmentSource);
        const vertexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        const position = gl.getAttribLocation(program, 'a_position');
        const size = gl.getAttribLocation(program, 'a_size');
        const color = gl.getAttribLocation(program, 'a_color');
        const outlineSize = gl.getAttribLocation(program, 'a_outlineSize');
        const outlineColor = gl.getAttribLocation(program, 'a_outlineColor');
        const vertexSize = 12 * Float32Array.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(
            position,
            2,
            gl.FLOAT,
            false,
            vertexSize,
            0
        );
        gl.vertexAttribPointer(
            size,
            1,
            gl.FLOAT,
            false,
            vertexSize,
            2 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.vertexAttribPointer(
            color,
            4,
            gl.FLOAT,
            false,
            vertexSize,
            3 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.vertexAttribPointer(
            outlineSize,
            1,
            gl.FLOAT,
            false,
            vertexSize,
            7 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.vertexAttribPointer(
            outlineColor,
            4,
            gl.FLOAT,
            false,
            vertexSize,
            8 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(position);
        gl.enableVertexAttribArray(size);
        gl.enableVertexAttribArray(color);
        gl.enableVertexAttribArray(outlineSize);
        gl.enableVertexAttribArray(outlineColor);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.program = program;
        this.vertexBuffer = vertexBuffer;
    }

    onRemove(map: mapboxgl.Map, gl: WebGLRenderingContext): void {

    }

    prerender(gl: WebGLRenderingContext, matrix: number[]): void {

    }

    render(gl: WebGLRenderingContext, matrix: number[]): void {
        if (this.vertexBuffer != null && this.vertexBufferNeedsRefresh) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.bufferArray, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            this.vertexBufferNeedsRefresh = false;
        }
        if (this.program != null) {
            gl.useProgram(this.program);
            gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'u_matrix'), false, matrix);
            gl.uniform1f(gl.getUniformLocation(this.program, 'u_interpolation'), this.interpolation);
            gl.drawArrays(gl.POINTS, 0, this.data.features.length);
        }
    }
}
