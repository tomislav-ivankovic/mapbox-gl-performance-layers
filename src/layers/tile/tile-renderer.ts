import {createShaderProgram} from '../misc';
import * as glMatrix from 'gl-matrix';

export abstract class TileRenderer<D> {
    private frameBuffer = this.gl.createFramebuffer();
    private program = createShaderProgram(this.gl, this.vertexSource, this.fragmentSource);
    private vertexBuffer = this.gl.createBuffer()!;
    private bufferArray = new Float32Array([]);
    private matrix = glMatrix.mat4.create();

    protected constructor(
        private gl: WebGLRenderingContext,
        protected data: D,
        private vertexSource: string,
        private fragmentSource: string,
        private tileWidth: number,
        private tileHeight: number
    ) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.configureAttributes(gl, this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.setData(data);
    }

    public setData(data: D) {
        this.data = data;
        const bufferArray = new Float32Array(this.dataToArray(data));
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, bufferArray, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    public renderTile(x: number, y: number, zoom: number): WebGLTexture {
        const gl = this.gl;

        const oldTexture = gl.getParameter(gl.TEXTURE_BINDING_2D) as WebGLTexture;
        const oldFrameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer;
        const oldViewport = gl.getParameter(gl.VIEWPORT) as [number, number, number, number];

        const texture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.tileWidth,
            this.tileHeight,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.viewport(0, 0, this.tileWidth, this.tileHeight);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            texture,
            0
        );

        this.setMatrixValue(x, y, zoom);
        gl.useProgram(this.program);
        this.setUniforms(gl, this.program, this.matrix);
        gl.drawArrays(this.getRenderMode(gl), 0, this.bufferArray.length / this.numbersPerVertex);

        gl.viewport(oldViewport[0], oldViewport[1], oldViewport[2], oldViewport[3]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, oldFrameBuffer);
        gl.bindTexture(gl.TEXTURE_2D, oldTexture);

        return texture;
    }

    private setMatrixValue(x: number, y: number, zoom: number) {
        const viewportSize = 1 / (zoom + 1);
        const viewportX = x * viewportSize;
        const viewportY = y * viewportSize;
        glMatrix.mat4.ortho(
            this.matrix,
            viewportX,
            viewportX + viewportSize,
            viewportY + viewportSize,
            viewportY,
            -1,
            1
        );
    }

    protected abstract configureAttributes(gl: WebGLRenderingContext, program: WebGLProgram): void;

    protected abstract dataToArray(data: D): number[];

    public abstract get numbersPerVertex(): number;

    public abstract getRenderMode(gl: WebGLRenderingContext): GLenum;

    protected abstract setUniforms(gl: WebGLRenderingContext, program: WebGLProgram, matrix: glMatrix.mat4): void;
}
