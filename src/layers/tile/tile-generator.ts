import {createShaderProgram} from '../misc';
import * as glMatrix from 'gl-matrix';

export abstract class TileGenerator<D> {
    private frameBuffer: WebGLFramebuffer | null = null;
    private program: WebGLProgram | null = null;
    private vertexBuffer: WebGLBuffer | null = null;
    private bufferArray = new Float32Array([]);
    private vertexBufferNeedsRefresh = false;
    private matrix = glMatrix.mat4.create();

    protected constructor(
        protected data: D,
        private vertexSource: string,
        private fragmentSource: string
    ) {
    }

    public initialise(gl: WebGLRenderingContext) {
        this.setData(this.data);

        this.frameBuffer = gl.createFramebuffer();
        this.program = createShaderProgram(gl, this.vertexSource, this.fragmentSource);
        this.vertexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.configureAttributes(gl, this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    public setData(data: D) {
        this.data = data;
        this.bufferArray = new Float32Array(this.dataToArray(data));
        this.vertexBufferNeedsRefresh = true;
    }

    public generateTile(
        gl: WebGLRenderingContext,
        texture: WebGLTexture,
        textureWidth: number,
        textureHeight: number,
        x: number,
        y: number,
        zoom: number
    ) {
        if (this.vertexBufferNeedsRefresh) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.bufferArray, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            this.vertexBufferNeedsRefresh = false;
        }
        const oldTexture = gl.getParameter(gl.TEXTURE_BINDING_2D) as WebGLTexture;
        const oldFrameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer;
        const oldViewport = gl.getParameter(gl.VIEWPORT) as [number, number, number, number];

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.viewport(0, 0, textureWidth, textureHeight);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            texture,
            0
        );

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        this.setMatrixValue(x, y, zoom);
        gl.useProgram(this.program);
        this.setUniforms(gl, this.program!, this.matrix);
        gl.drawArrays(this.getRenderMode(gl), 0, this.bufferArray.length / this.numbersPerVertex);

        gl.viewport(oldViewport[0], oldViewport[1], oldViewport[2], oldViewport[3]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, oldFrameBuffer);
        gl.bindTexture(gl.TEXTURE_2D, oldTexture);
    }

    private setMatrixValue(x: number, y: number, zoom: number) {
        const viewportSize = Math.pow(2, -zoom);
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

        const centerX = viewportX;
        const centerY = viewportY;
        console.dir({
            centerX: centerX,
            centerY: centerY
        });
        const point = glMatrix.vec4.fromValues(centerX, centerY, 0, 1);
        glMatrix.vec4.transformMat4(point, point, this.matrix);
        const values = Array.from(point.values());
        console.dir({
            pointX: values[0]/values[3],
            pointY: values[1]/values[3],
            pointZ: values[2]/values[3]
        });
    }

    protected abstract configureAttributes(gl: WebGLRenderingContext, program: WebGLProgram): void;

    protected abstract dataToArray(data: D): number[];

    public abstract get numbersPerVertex(): number;

    public abstract getRenderMode(gl: WebGLRenderingContext): GLenum;

    protected abstract setUniforms(gl: WebGLRenderingContext, program: WebGLProgram, matrix: glMatrix.mat4): void;
}
