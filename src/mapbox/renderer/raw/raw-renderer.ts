import {Renderer} from '../renderer';
import {createShaderProgram, Shader} from '../../shader/shader';
import * as glMatrix from 'gl-matrix';

export class RawRenderer<D> implements Renderer<D> {
    private data: D | null = null;
    private program: WebGLProgram | null = null;
    private vertexBuffer: WebGLBuffer | null = null;
    private bufferArray = new Float32Array([]);

    constructor(
        private shader: Shader<D>
    ) {
    }

    setData(data: D): void {
        this.data = data;
        this.bufferArray = new Float32Array(this.shader.dataToArray(data));
    }

    initialise(gl: WebGLRenderingContext): void {
        const shader = this.shader;
        this.program = createShaderProgram(gl, shader.vertexSource, shader.fragmentSource);
        this.vertexBuffer = gl.createBuffer();
    }

    dispose(gl: WebGLRenderingContext): void {
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteProgram(this.program);
    }

    prerender(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
    }

    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
        if (this.program == null) {
            return;
        }
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.shader.configureAttributes(gl, this.program);
        gl.bufferData(gl.ARRAY_BUFFER, this.bufferArray, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.shader.setUniforms(gl, this.program, matrix);

        gl.drawArrays(
            this.shader.getRenderMode(gl),
            0,
            this.bufferArray.length / this.shader.getNumbersPerVertex()
        );
    }
}
