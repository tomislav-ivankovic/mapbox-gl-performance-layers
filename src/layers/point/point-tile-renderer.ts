import {Feature, FeatureCollection, Point} from 'geojson';
import {PointStyle} from './custom-point-layer';
import {TileRenderer} from '../tile/tile-renderer';
import {MercatorCoordinate} from 'mapbox-gl';
import * as glMatrix from 'gl-matrix';
import vertexSource from './points.vert';
import fragmentSource from './points.frag';

const defaultStyle: PointStyle = {
    size: 5,
    color: {r: 0, g: 0, b: 1, a: 1},
    outlineSize: 1,
    outlineColor: {r: 0, g: 0, b: 0, a: 1}
};

export class PointTileRenderer<P> extends TileRenderer<FeatureCollection<Point, P>> {
    constructor(
        gl: WebGLRenderingContext,
        data: FeatureCollection<Point, P>,
        private style?: (feature: Feature<Point, P>) => Partial<PointStyle>,
        private interpolation: number = 1.8,
        tileWidth: number = 256,
        tileHeight: number = 256
    ) {
        super(gl, data, vertexSource, fragmentSource, tileWidth, tileHeight);
    }

    protected configureAttributes(gl: WebGLRenderingContext, program: WebGLProgram): void {
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
    }

    protected dataToArray(data: FeatureCollection<Point, P>): number[] {
        return data.features.flatMap(feature => {
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
        });
    }

    get numbersPerVertex(): number {
        return 12;
    }

    getRenderMode(gl: WebGLRenderingContext): number {
        return gl.POINTS;
    }

    protected setUniforms(gl: WebGLRenderingContext, program: WebGLProgram, matrix: glMatrix.mat4): void {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_matrix'), false, matrix);
        gl.uniform1f(gl.getUniformLocation(program, 'u_interpolation'), this.interpolation);
    }
}
