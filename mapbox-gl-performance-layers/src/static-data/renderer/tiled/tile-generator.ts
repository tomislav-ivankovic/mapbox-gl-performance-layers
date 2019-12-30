import {Renderer} from '../renderer';
import {FeatureCollection, Geometry} from 'geojson';
import {StyleOption} from '../../shader/styles';
import * as glMatrix from 'gl-matrix';

export class TileGenerator<G extends Geometry, P, S extends {}> {
    private frameBuffer: WebGLFramebuffer | null = null;
    private matrix = glMatrix.mat4.create();

    constructor(
        private renderer: Renderer<G, P, S>
    ) {
    }

    public setDataAndStyle(data: FeatureCollection<G, P>, styleOption: StyleOption<G, P, S>) {
        this.renderer.setDataAndStyle(data, styleOption);
    }

    public clearData(): void {
        this.renderer.clearData();
    }

    public initialise(map: mapboxgl.Map, gl: WebGLRenderingContext) {
        this.frameBuffer = gl.createFramebuffer();
        this.renderer.initialise(map, gl);
    }

    public dispose(map: mapboxgl.Map, gl: WebGLRenderingContext) {
        this.renderer.dispose(map, gl);
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
        if (this.frameBuffer == null) {
            throw Error('TileGenerator can not generate tiles before it is initialised.');
        }
        const oldFrameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer;
        const oldViewport = gl.getParameter(gl.VIEWPORT) as [number, number, number, number];

        this.setMatrixValue(x, y, zoom);
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

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.renderer.render(gl, this.matrix);

        gl.viewport(oldViewport[0], oldViewport[1], oldViewport[2], oldViewport[3]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, oldFrameBuffer);
        gl.bindTexture(gl.TEXTURE_2D, null);
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
