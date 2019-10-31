import {Renderer} from '../renderer';
import * as glMatrix from 'gl-matrix';
import {TileGenerator} from './tile-generator';
import {createShaderProgram} from '../../shader/shader';
import {TileManager} from './tile-manager';
import vertexSource from './tile.vert';
import fragmentSource from './tile.frag';

export class TiledRenderer<D> implements Renderer<D> {
    private manager: TileManager<D>;
    private program: WebGLProgram | null = null;
    private vertexBuffer: WebGLBuffer | null = null;

    constructor(
        renderer: Renderer<D>,
        numberOfTiles = 10,
        private tileWidth = 1024,
        private tileHeight = 1024
    ) {
        this.manager = new TileManager(
            new TileGenerator(renderer),
            numberOfTiles,
            tileWidth,
            tileHeight
        );
    }

    setData(data: D): void {
        this.manager.setData(data);
    }

    initialise(gl: WebGLRenderingContext): void {
        this.manager.initialise(gl);

        const program = createShaderProgram(gl, vertexSource, fragmentSource);
        const vertexBuffer = gl.createBuffer();

        this.program = program;
        this.vertexBuffer = vertexBuffer;
    }

    dispose(gl: WebGLRenderingContext): void {
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteProgram(this.program);
        this.manager.dispose(gl);
    }

    prerender(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {

    }

    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
        const texture = this.manager.getTileTexture(gl, 17, 11, 5);
        this.drawTile(gl, texture, matrix, 17, 11, 5);
    }

    private drawTile(
        gl: WebGLRenderingContext,
        texture: WebGLTexture,
        matrix: glMatrix.mat4 | number[],
        x: number,
        y: number,
        zoom: number
    ) {
        const size = Math.pow(2, -zoom);
        this.drawTexture(gl, texture, matrix, x * size, y * size, size, size);
    }

    private drawTexture(
        gl: WebGLRenderingContext,
        texture: WebGLTexture,
        matrix: glMatrix.mat4 | number[],
        x: number,
        y: number,
        w: number,
        h: number
    ) {
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

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        configureAttributes(gl, this.program);
        gl.bufferData(gl.ARRAY_BUFFER, bufferArray, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        setUniforms(gl, this.program, matrix);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}

function configureAttributes(gl: WebGLRenderingContext, program: WebGLProgram) {
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
}

function setUniforms(gl: WebGLRenderingContext, program: WebGLProgram, matrix: glMatrix.mat4 | number[]) {
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_matrix'), false, matrix);
    gl.uniform1i(gl.getUniformLocation(program, 'u_sampler'), 0);
}
