import {Renderer} from '../renderer';
import {TileGenerator} from './tile-generator';
import {TileManager} from './tile-manager';
import {TextureDrawer} from '../../../shader/texture-drawer/texture-drawer';
import {Bounds, findViewBounds} from '../../../geometry-functions';
import {FeatureCollection, Geometry} from 'geojson';
import {StyleOption} from '../../../styles';
import * as glMatrix from 'gl-matrix';

export interface TiledRendererOptions {
    numberOfTiles?: number,
    tileWidth?: number,
    tileHeight?: number
}

export class TiledRenderer<G extends Geometry, P, S extends {}> implements Renderer<G, P, S> {
    private manager: TileManager<G, P, S>;
    private textureDrawer = new TextureDrawer();
    private map: mapboxgl.Map | null = null;
    private readonly tileWidth: number;
    private readonly tileHeight: number;

    constructor(
        renderer: Renderer<G, P, S>,
        findDataBounds: (data: FeatureCollection<G, P>) => Bounds,
        options: TiledRendererOptions
    ) {
        const numberOfTiles = options.numberOfTiles != null ? options.numberOfTiles : 16;
        this.tileWidth = options.tileWidth != null ? options.tileWidth : 2048;
        this.tileHeight = options.tileHeight != null ? options.tileHeight : 2048;
        this.manager = new TileManager(
            new TileGenerator(renderer),
            findDataBounds,
            numberOfTiles,
            this.tileWidth,
            this.tileHeight
        );
    }

    setDataAndStyle(data: FeatureCollection<G, P>, styleOption: StyleOption<G, P, S>): void {
        this.manager.setDataAndStyle(data, styleOption);
    }

    clearData(): void {
        this.manager.clearData();
    }

    initialise(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.manager.initialise(map, gl);
        this.textureDrawer.initialise(gl);
        this.map = map;
    }

    dispose(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.map = null;
        this.textureDrawer.dispose(gl);
        this.manager.dispose(map, gl);
    }

    prerender(): void {
    }

    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
        if (this.map == null) {
            throw Error('TiledRenderer can not render without being initialised.');
        }

        const viewportArray = gl.getParameter(gl.VIEWPORT) as [number, number, number, number];
        const viewport = {
            x: viewportArray[0],
            y: viewportArray[1],
            w: viewportArray[2],
            h: viewportArray[3]
        };
        const bounds = findViewBounds(this.map);
        const equationFactor = Math.min(
            this.tileWidth * (bounds.maxX - bounds.minX) / viewport.w,
            this.tileHeight * (bounds.maxY - bounds.minY) / viewport.h
        );
        const zoom = Math.ceil(-Math.log2(equationFactor));
        const size = Math.pow(2, -zoom);
        for (let x = Math.floor(bounds.minX / size); x * size < bounds.maxX; x++) {
            for (let y = Math.floor(bounds.minY / size); y * size < bounds.maxY; y++) {
                const texture = this.manager.getTileTexture(gl, x, y, zoom);
                if (texture != null) {
                    this.drawTile(gl, texture, matrix, x, y, zoom);
                }
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
