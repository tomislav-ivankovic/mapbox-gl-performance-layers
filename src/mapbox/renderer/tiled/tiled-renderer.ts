import {Renderer} from '../renderer';
import {TileGenerator} from './tile-generator';
import {TileManager} from './tile-manager';
import {TextureDrawer} from '../../shader/texture-drawer/texture-drawer';
import * as glMatrix from 'gl-matrix';

export class TiledRenderer<D> implements Renderer<D> {
    private manager: TileManager<D>;
    private textureDrawer = new TextureDrawer();

    constructor(
        renderer: Renderer<D>,
        numberOfTiles = 16,
        private tileWidth = 2048,
        private tileHeight = 2048
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
        this.textureDrawer.initialise(gl);
    }

    dispose(gl: WebGLRenderingContext): void {
        this.textureDrawer.dispose(gl);
        this.manager.dispose(gl);
    }

    prerender(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
    }

    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
        const viewportArray = gl.getParameter(gl.VIEWPORT) as [number, number, number, number];
        const viewport = {
            x: viewportArray[0],
            y: viewportArray[1],
            w: viewportArray[2],
            h: viewportArray[3]
        };
        const bounds = findBoundsFromMatrix(matrix);
        const equationFactor = Math.min(
            this.tileWidth*(bounds.maxX - bounds.minX)/viewport.w,
            this.tileHeight*(bounds.maxY - bounds.minY)/viewport.h
        );
        const zoom = Math.ceil(-Math.log2(equationFactor));
        const size = Math.pow(2, -zoom);
        for (let x = Math.floor(bounds.minX/size); x*size < bounds.maxX; x++) {
            for (let y = Math.floor(bounds.minY/size); y*size < bounds.maxY; y++) {
                const texture = this.manager.getTileTexture(gl, x, y, zoom);
                this.drawTile(gl, texture, matrix, x, y, zoom);
            }
        }
        this.manager.incrementAge();
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
        this.textureDrawer.draw(gl, texture, matrix, x * size, y * size, size, size);
    }
}

interface Bounds{
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
}
const tempMatrix = glMatrix.mat4.create();
function findBoundsFromMatrix(matrix: glMatrix.mat4 | number[]): Bounds {
    if (matrix.length !== 16) {
        throw Error('Input matrix must pe a 4x4 size. The array must contain 16 elements.');
    }

    let invertedMatrix: glMatrix.mat4;
    if (matrix instanceof Array) {
        invertedMatrix = tempMatrix;
        invertedMatrix.set(matrix);
    } else {
        invertedMatrix = matrix;
    }
    glMatrix.mat4.invert(invertedMatrix, invertedMatrix);

    const points = [
        glMatrix.vec4.fromValues(-1, -1, 1, 1),
        glMatrix.vec4.fromValues(-1, 1, 1, 1),
        glMatrix.vec4.fromValues(1, -1, 1, 1),
        glMatrix.vec4.fromValues(1, 1, 1, 1)
    ];

    let minX = +Infinity, minY = +Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach(point => {
        glMatrix.vec4.transformMat4(point, point, invertedMatrix);
        const values = Array.from(point.values());
        const x = values[0]/values[3];
        const y = values[1]/values[3];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    });

    return {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY
    };
}
