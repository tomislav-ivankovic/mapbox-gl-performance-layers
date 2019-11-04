import {Feature, FeatureCollection, LineString} from 'geojson';
import {Shader} from '../shader';
import {MercatorCoordinate} from 'mapbox-gl';
import {Color} from '../../misc';
import * as glMatrix from 'gl-matrix';
import vertexSource from './line.vert';
import fragmentSource from './line.frag';

export interface LineStyle {
    size: number;
    color: Color;
    outlineSize: number;
    outlineColor: Color;
}

const defaultStyle: LineStyle = {
    size: 5,
    color: {r: 0, g: 0, b: 1, a: 1},
    outlineSize: 1,
    outlineColor: {r: 0, g: 0, b: 0, a: 1}
};

export class LineShader<P> implements Shader<FeatureCollection<LineString, P>> {
    vertexSource = vertexSource;
    fragmentSource = fragmentSource;

    constructor(
        private style?: (feature: Feature<LineString, P>) => Partial<LineStyle>,
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

    dataToArray(data: FeatureCollection<LineString, P>): number[] {
        return data.features.flatMap(feature => {
            const style = this.style != null ? {...defaultStyle, ...this.style(feature)} : defaultStyle;
            return feature.geometry.coordinates.flatMap((coords, index) => {
                const transformed = MercatorCoordinate.fromLngLat({lon: coords[0], lat: coords[1]}, 0);
                if (index === 0 || index === feature.geometry.coordinates.length - 1) {
                    return [
                        transformed.x, transformed.y,
                        style.color.r, style.color.g, style.color.b, style.color.a,
                    ];
                } else {
                    return [
                        transformed.x, transformed.y,
                        style.color.r, style.color.g, style.color.b, style.color.a,
                        transformed.x, transformed.y,
                        style.color.r, style.color.g, style.color.b, style.color.a,
                    ];
                }
            });
        });
    }

    setUniforms(gl: WebGLRenderingContext, program: WebGLProgram, matrix: glMatrix.mat4 | number[]): void {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_matrix'), false, matrix);
    }

    getNumbersPerVertex(): number {
        return 6;
    }

    getRenderMode(gl: WebGLRenderingContext): number {
        return gl.LINES;
    }
}
