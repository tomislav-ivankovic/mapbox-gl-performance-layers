import {Feature} from 'geojson';
import {Geometry} from 'geojson';
import {DynamicRenderer} from './dynamic-renderer';
import {createShaderProgram, Shader} from '../../shared/shader/shader';
import {DynamicVertexDataMapper} from '../vertex-data-mapper/dynamic-vertex-data-mapper';
import {DataOperations, DataOperationsExtender} from '../data-operations';
import {StyleOption} from '../../shared/styles';
import * as glMatrix from 'gl-matrix';
import {DynamicShaderDataCollection} from './dynamic-shader-data-collection';

export class DynamicShaderRenderer<G extends Geometry, P, S extends {}> implements DynamicRenderer<G, P, S> {
    private program: WebGLProgram | null = null;
    private arrayBuffer: WebGLBuffer | null = null;
    private readonly collection: DynamicShaderDataCollection<G, P, S>;
    public readonly dataOperations: DataOperations<Feature<G, P>>;

    constructor(
        private shader: Shader,
        vertexDataMapper: DynamicVertexDataMapper<G, P, S>,
        startingBufferSize: number = 512
    ) {
        this.collection = new DynamicShaderDataCollection(vertexDataMapper, startingBufferSize);
        this.dataOperations = new DataOperationsExtender(this.collection);
    }

    setStyle(styleOption: StyleOption<G, P, S>): void {
        this.collection.setStyle(styleOption);
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
        gl.bufferData(gl.ARRAY_BUFFER, this.collection.getVertexArray(), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.shader.setUniforms(gl, this.program, matrix);

        const startIndex = this.collection.getStartIndex();
        const endIndex = this.collection.getEndIndex();
        const elementsPerVertex = this.shader.getArrayBufferElementsPerVertex();
        gl.drawArrays(
            this.shader.getPrimitiveType(gl),
            startIndex / elementsPerVertex,
            (endIndex - startIndex) / elementsPerVertex
        );
    }
}
