import {Shader, ShaderBuffers} from '../shader';
import * as glMatrix from 'gl-matrix';
import vertexSource from './default.vert';
import fragmentSource from './default.frag';
import {FeatureCollection, Geometry} from 'geojson';
import {StyleOption} from '../../../styles';

export abstract class DefaultShader<G extends Geometry, P, S extends {}> implements Shader<G, P, S> {
    vertexSource = vertexSource;
    fragmentSource = fragmentSource;

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

    getArrayBufferElementsPerVertex(): number {
        return 6;
    }

    setUniforms(gl: WebGLRenderingContext, program: WebGLProgram, matrix: glMatrix.mat4 | number[]): void {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_matrix'), false, matrix);
    }

    abstract dataToArrays(data: FeatureCollection<G, P>, styleOption: StyleOption<G, P, S>): ShaderBuffers;
    abstract getPrimitiveType(gl: WebGLRenderingContext): number;
}
