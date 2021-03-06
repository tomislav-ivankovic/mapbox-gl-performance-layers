import {FeatureCollection} from 'geojson';
import {Geometry} from 'geojson';
import {Renderer} from './renderer';
import {createShaderProgram, Shader} from '../../shared/shader/shader';
import {VertexDataMapper} from '../vertex-data-mapper/vertex-data-mapper';
import {StyleOption} from '../../shared/styles';
import * as glMatrix from 'gl-matrix';

export class ShaderRenderer<G extends Geometry, P, S extends {}> implements Renderer<G, P, S> {
    private program: WebGLProgram | null = null;
    private arrayBuffer: WebGLBuffer | null = null;
    private elementArrayBuffer: WebGLBuffer | null = null;
    private array = new Float32Array([]);
    private elementArray: Int32Array | null = null;

    constructor(
        private shader: Shader,
        private vertexDataMapper: VertexDataMapper<G, P, S>
    ) {
    }

    setDataAndStyle(data: FeatureCollection<G, P>, styleOption: StyleOption<G, P, S>): void {
        const arrays = this.vertexDataMapper(data, styleOption);
        this.array = arrays.array;
        this.elementArray = arrays.elementArray;
    }

    clearData(): void {
        this.array = new Float32Array([]);
        this.elementArray = null;
    }

    initialise(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.program = createShaderProgram(gl, this.shader.vertexSource, this.shader.fragmentSource);
        this.arrayBuffer = gl.createBuffer();
        this.elementArrayBuffer = gl.createBuffer();
    }

    dispose(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        gl.deleteBuffer(this.elementArrayBuffer);
        gl.deleteBuffer(this.arrayBuffer);
        gl.deleteProgram(this.program);
    }

    prerender(): void {
    }

    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
        if (this.program == null) {
            throw Error('ShaderRenderer can not render before it is initialised.');
        }

        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.arrayBuffer);
        const cleanAttributes = this.shader.configureAttributes(gl, this.program);
        gl.bufferData(gl.ARRAY_BUFFER, this.array, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.shader.setUniforms(gl, this.program, matrix);

        if (this.elementArray == null) {
            gl.drawArrays(
                this.shader.getPrimitiveType(gl),
                0,
                this.array.length / this.shader.getArrayBufferElementsPerVertex()
            );
        } else {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementArrayBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.elementArray, gl.STATIC_DRAW);
            gl.drawElements(
                this.shader.getPrimitiveType(gl),
                this.elementArray.length,
                gl.UNSIGNED_INT,
                0
            );
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }

        cleanAttributes();
    }
}
