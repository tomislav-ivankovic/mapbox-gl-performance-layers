import {Color} from '../../misc';
import {Shader, ShaderBuffers} from '../shader';
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

    dataToArrays(data: FeatureCollection<Polygon, P>): ShaderBuffers {
        const array: number[] = [];
        const elementArray: number[] = [];
        let indexOffset = 0;
        for (const feature of data.features) {
            const style = this.style != null ? {...defaultStyle, ...this.style(feature)} : defaultStyle;
            const transformedCoordinates = feature.geometry.coordinates.map(c => c.map(coords => {
                const transformed = MercatorCoordinate.fromLngLat({lon: coords[0], lat: coords[1]}, 0);
                return [transformed.x, transformed.y];
            }));
            const data = earcut.flatten(transformedCoordinates);
            for (let i = 0; i < data.vertices.length; i += 2) {
                array.push(
                    data.vertices[i], data.vertices[i + 1],
                    style.color.r, style.color.g, style.color.b, style.color.a
                );
            }
            const triangles = earcut(data.vertices, data.holes, data.dimensions);
            for (const index of triangles) {
                elementArray.push(index + indexOffset);
            }
            indexOffset += data.vertices.length / 2;
        }
        return {
            array: new Float32Array(array),
            elementArray: new Int32Array(elementArray)
        };
    }

    setUniforms(gl: WebGLRenderingContext, program: WebGLProgram, matrix: glMatrix.mat4 | number[]): void {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_matrix'), false, matrix);
    }

    getArrayBufferElementsPerVertex(): number {
        return 6;
    }

    getPrimitiveType(gl: WebGLRenderingContext): number {
        return gl.TRIANGLES;
    }
}
