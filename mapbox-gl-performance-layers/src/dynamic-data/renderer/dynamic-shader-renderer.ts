import {Feature, Geometry} from 'geojson';
import {DynamicRenderer} from './dynamic-renderer';
import {createShaderProgram, Shader} from '../../shader/shader';
import {DynamicVertexDataMapper} from '../vertex-data-mapper/dynamic-vertex-data-mapper';
import {DataOperations, DataOperationsExtender} from '../data-operations';
import {StyleOption} from '../../styles';
import * as glMatrix from 'gl-matrix';

export class DynamicShaderRenderer<G extends Geometry, P, S extends {}> implements DynamicRenderer<G, P, S> {
    private program: WebGLProgram | null = null;
    private arrayBuffer: WebGLBuffer | null = null;
    private dynamicArray: number[] = [];
    private staticArray = new Float32Array([]);
    private styleOption: StyleOption<G, P, S> = undefined;

    constructor(
        private shader: Shader,
        private vertexDataMapper: DynamicVertexDataMapper<G, P, S>
    ) {
    }

    dataOperations: DataOperations<Feature<G, P>> = new DataOperationsExtender({
        addToFront: (feature: Feature<G, P>) => {
            const mapped = this.vertexDataMapper(feature, this.styleOption);
            this.dynamicArray.push(...mapped);
            this.staticArray = new Float32Array(this.dynamicArray);
        },
        addToBack: (feature: Feature<G, P>) => {
            const mapped = this.vertexDataMapper(feature, this.styleOption);
            this.dynamicArray.unshift(...mapped);
            this.staticArray = new Float32Array(this.dynamicArray);
        },
        removeFirst: () => {
            const n = this.shader.getArrayBufferElementsPerVertex();
            this.dynamicArray.splice(0, n);
            this.staticArray = new Float32Array(this.dynamicArray);
        },
        removeLast: () => {
            const n = this.shader.getArrayBufferElementsPerVertex();
            this.dynamicArray.length = this.dynamicArray.length - n;
            this.staticArray = new Float32Array(this.dynamicArray);
        },
        clear: () => {
            this.dynamicArray.length = 0;
            this.staticArray = new Float32Array([]);
        },
        size: () => this.staticArray.length / this.shader.getArrayBufferElementsPerVertex()
    });

    setStyle(styleOption: StyleOption<G, P, S>): void {
        this.styleOption = styleOption;
    }

    initialise(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.program = createShaderProgram(gl, this.shader.vertexSource, this.shader.fragmentSource);
        this.arrayBuffer = gl.createBuffer();
    }

    dispose(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
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
        this.shader.configureAttributes(gl, this.program);
        gl.bufferData(gl.ARRAY_BUFFER, this.staticArray, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.shader.setUniforms(gl, this.program, matrix);

        gl.drawArrays(
            this.shader.getPrimitiveType(gl),
            0,
            this.staticArray.length / this.shader.getArrayBufferElementsPerVertex()
        );
    }
}
