import {CustomLayerInterface} from 'mapbox-gl';
import {createShaderProgram} from '../misc';
import {TileGenerator} from './tile-generator';
import vertexSource from './tile.vert';
import fragmentSource from './tile.frag';

export class TileRenderingLayer<D> implements CustomLayerInterface {
    public id: string = 'point-layer';
    public renderingMode: '2d' | '3d' = '2d';
    public type: 'custom' = 'custom';

    private program: WebGLProgram | null = null;
    private vertexBuffer: WebGLBuffer | null = null;
    private testTexture: WebGLTexture | null = null;

    constructor(
        private tileGenerator: TileGenerator<D>,
        private tileWidth = 256,
        private tileHeight = 256
    ) {
    }

    public setData(data: D) {
        this.tileGenerator.setData(data);
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.tileGenerator.initialise(gl);
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
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        this.tileGenerator.generateTile(
            gl,
            texture,
            this.tileWidth,
            this.tileHeight,
            17,
            11,
            5
        );
        this.testTexture = texture;

        const program = createShaderProgram(gl, vertexSource, fragmentSource);
        const vertexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        const position = gl.getAttribLocation(program, 'a_position');
        const textureCoordinate = gl.getAttribLocation(program, 'a_textureCoordinate');
        const vertexSize = 4 * Float32Array.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(
            position,
            2,
            gl.FLOAT,
            false,
            vertexSize,
            0
        );
        gl.vertexAttribPointer(
            textureCoordinate,
            2,
            gl.FLOAT,
            false,
            vertexSize,
            2 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(position);
        gl.enableVertexAttribArray(textureCoordinate);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.program = program;
        this.vertexBuffer = vertexBuffer;

        // this.testTexture = gl.createTexture();
        // gl.bindTexture(gl.TEXTURE_2D, this.testTexture);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // gl.texImage2D(
        //     gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        //     gl.UNSIGNED_BYTE,
        //     // @ts-ignore
        //     document.getElementById('test-image')
        // );
        // gl.bindTexture(gl.TEXTURE_2D, null);
    }

    onRemove(map: mapboxgl.Map, gl: WebGLRenderingContext): void {

    }

    prerender(gl: WebGLRenderingContext, matrix: number[]): void {

    }

    render(gl: WebGLRenderingContext, matrix: number[]): void {
        if (this.testTexture == null) {
            return;
        }
        this.drawTile(gl, this.testTexture, matrix, 17, 11, 5);
    }

    private drawTile(gl: WebGLRenderingContext, texture: WebGLTexture, matrix: number[], x: number, y: number, zoom: number) {
        const size = Math.pow(2, -zoom);
        this.drawTexture(gl, texture, matrix, x * size, y * size, size, size);
    }

    private drawTexture(gl: WebGLRenderingContext, texture: WebGLTexture, matrix: number[], x: number, y: number, w: number, h: number) {
        if (this.program == null || this.vertexBuffer == null) {
            return;
        }

        const x1 = x, x2 = x + w, y1 = y, y2 = y + h;
        const bufferArray =  new Float32Array([
            x1, y1, 0, 1,
            x2, y1, 1, 1,
            x2, y2, 1, 0,
            x1, y1, 0, 1,
            x1, y2, 0, 0,
            x2, y2, 1, 0
        ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, bufferArray, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.useProgram(this.program);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'u_matrix'), false, matrix);
        gl.uniform1i(gl.getUniformLocation(this.program, 'u_sampler'), 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
