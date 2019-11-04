import {Color} from '../../misc';
import {Shader} from '../shader';
import {Feature, FeatureCollection, Polygon} from 'geojson';
import {LineStyle} from '../line/line-shader';
import {MercatorCoordinate} from 'mapbox-gl';
import earcut from 'earcut';
import * as glMatrix from 'gl-matrix';
import vertexSource from './polygon.vert';
import fragmentSource from './polygon.frag';

export interface PolygonStyle {
    color: Color;
    outlineSize: number;
    outlineColor: Color;
}

const defaultStyle: PolygonStyle = {
    color: {r: 0, g: 0, b: 1, a: 1},
    outlineSize: 1,
    outlineColor: {r: 0, g: 0, b: 0, a: 1}
};

export class PolygonShader<P> implements Shader<FeatureCollection<Polygon, P>> {
    vertexSource = vertexSource;
    fragmentSource = fragmentSource;

    constructor(
        private style?: (feature: Feature<Polygon, P>) => Partial<LineStyle>,
        private interpolation: number = 1.8
    ) {
    }

    configureAttributes(gl: WebGLRenderingContext, program: WebGLProgram): void {
        const position = gl.getAttribLocation(program, 'a_position');
        const color = gl.getAttribLocation(program, 'a_color');
        const vertexSize = 6 * Float32Array.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(
            position,
            2,
            gl.FLOAT,
            false,
            vertexSize,
            0
        );
        gl.vertexAttribPointer(
            color,
            4,
            gl.FLOAT,
            false,
            vertexSize,
            2 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(position);
        gl.enableVertexAttribArray(color);
    }

    dataToArray(data: FeatureCollection<Polygon, P>): number[] {
        return data.features.flatMap(feature => {
            const style = this.style != null ? {...defaultStyle, ...this.style(feature)} : defaultStyle;
            const transformedCoordinates = feature.geometry.coordinates.map(c => c.map(coords => {
                const transformed = MercatorCoordinate.fromLngLat({lon: coords[0], lat: coords[1]}, 0);
                return [transformed.x, transformed.y];
            }));
            const data = earcut.flatten(transformedCoordinates);
            const triangles = earcut(data.vertices, data.holes, data.dimensions);
            return triangles.flatMap(index => [
                data.vertices[2 * index], data.vertices[2 * index + 1],
                style.color.r, style.color.g, style.color.b, style.color.a,
            ]);
        });
    }

    getNumbersPerVertex(): number {
        return 6;
    }

    setUniforms(gl: WebGLRenderingContext, program: WebGLProgram, matrix: glMatrix.mat4 | number[]): void {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_matrix'), false, matrix);
    }

    getRenderMode(gl: WebGLRenderingContext): number {
        return gl.TRIANGLES;
    }
}
