import {Shader, ShaderBuffers} from '../shader';
import {Feature, FeatureCollection, Point} from 'geojson';
import {defaultPointStyle, PointStyle, resolveStyle, StyleOption} from '../styles';
import {transformX, transformY} from '../../../geometry-functions';
import * as glMatrix from 'gl-matrix';
import vertexSource from './simple-point.vert';
import fragmentSource from './simple-point.frag';

export class SimplePointShader<P> implements Shader<FeatureCollection<Point, P>> {
    vertexSource = vertexSource;
    fragmentSource = fragmentSource;

    constructor(
        private style?: StyleOption<Feature<Point, P>, PointStyle>,
        private interpolation: number = 1.8
    ) {
    }

    configureAttributes(gl: WebGLRenderingContext, program: WebGLProgram): void {
        const position = gl.getAttribLocation(program, 'a_position');
        const size = gl.getAttribLocation(program, 'a_size');
        const color = gl.getAttribLocation(program, 'a_color');
        const vertexSize = 7 * Float32Array.BYTES_PER_ELEMENT;
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
        gl.enableVertexAttribArray(position);
        gl.enableVertexAttribArray(size);
        gl.enableVertexAttribArray(color);
    }

    setUniforms(gl: WebGLRenderingContext, program: WebGLProgram, matrix: glMatrix.mat4 | number[]): void {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_matrix'), false, matrix);
        gl.uniform1f(gl.getUniformLocation(program, 'u_interpolation'), this.interpolation);
    }

    dataToArrays(data: FeatureCollection<Point, P>): ShaderBuffers {
        const array: number[] = [];
        for (const feature of data.features) {
            const style = resolveStyle(feature, this.style, defaultPointStyle);
            const coords = feature.geometry.coordinates;
            array.push(
                transformX(coords[0]), transformY(coords[1]),
                style.size,
                style.color.r, style.color.g, style.color.b, style.opacity
            );
        }
        return {
            array: new Float32Array(array),
            elementArray: null
        };
    }

    getArrayBufferElementsPerVertex(): number {
        return 7;
    }

    getPrimitiveType(gl: WebGLRenderingContext): number {
        return gl.POINTS;
    }
}
