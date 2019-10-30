import * as glMatrix from 'gl-matrix';
import {Renderer} from '../renderer';

export class TileGenerator<D> {
    private frameBuffer: WebGLFramebuffer | null = null;
    private matrix = glMatrix.mat4.create();

    constructor(
        private renderer: Renderer<D>
    ) {
    }

    public setData(data: D) {
        this.renderer.setData(data);
    }

    public initialise(gl: WebGLRenderingContext) {
        this.frameBuffer = gl.createFramebuffer();
        this.renderer.initialise(gl);
    }

    public dispose(gl: WebGLRenderingContext) {
        this.renderer.dispose(gl);
        gl.deleteFramebuffer(this.frameBuffer);
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
        const oldTexture = gl.getParameter(gl.TEXTURE_BINDING_2D) as WebGLTexture;
        const oldFrameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer;
        const oldViewport = gl.getParameter(gl.VIEWPORT) as [number, number, number, number];

        this.renderer.prerender(gl, this.matrix);

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
        this.renderer.render(gl, this.matrix);

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
    }
}