import {TileGenerator} from './tile-generator';
import {Bounds, transformX, transformY} from '../geometry-functions';

interface Tile {
    x: number,
    y: number,
    zoom: number,
    age: number,
    texture: WebGLTexture
}

export class TileManager {
    private tiles: Tile[] | null = null;

    constructor(
        private generator: TileGenerator,
        private numberOfTiles: number,
        private tileWidth: number,
        private tileHeight: number
    ) {
    }

    public markAllTilesOutdated(): void {
        if (this.tiles == null) {
            return;
        }
        for (const tile of this.tiles) {
            tile.zoom = -1;
            tile.age = Number.MAX_VALUE / 2;
        }
    }

    public markOutdatedTiles(bounds: Bounds): void {
        if (this.tiles == null) {
            return;
        }
        for (const tile of this.tiles) {
            if (isTileInDataBounds(tile.x, tile.y, tile.zoom, bounds)) {
                tile.zoom = -1;
                tile.age = Number.MAX_VALUE / 2;
            }
        }
    }

    public initialise(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.generator.initialise(map, gl);

        const tiles: Tile[] = [];
        for (let i = 0; i < this.numberOfTiles; i++) {
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
            tiles.push({
                x: 0,
                y: 0,
                zoom: -1,
                age: Number.MAX_VALUE / 2,
                texture: texture
            });
        }
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.tiles = tiles;
    }

    public dispose(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        if (this.tiles != null) {
            this.tiles.forEach(tile => gl.deleteTexture(tile.texture));
        }
        this.tiles = null;
        this.generator.dispose(map, gl);
    }

    public getTileTexture(
        gl: WebGLRenderingContext,
        x: number,
        y: number,
        zoom: number,
        dataBounds: Bounds | null
    ): WebGLTexture | null {
        const tiles = this.tiles;
        if (tiles == null) {
            throw Error('TileManager can not get a tile texture before it is initialised.');
        }

        if (!isTileInDataBounds(x, y, zoom, dataBounds)) {
            return null;
        }

        const foundTile = tiles.find(t => t.x === x && t.y === y && t.zoom === zoom);
        if (foundTile != null) {
            foundTile.age = 0;
            return foundTile.texture;
        }

        let leastUsedTile = tiles[0];
        for (const tile of tiles) {
            if (tile.age > leastUsedTile.age) {
                leastUsedTile = tile;
            }
        }
        leastUsedTile.x = x;
        leastUsedTile.y = y;
        leastUsedTile.zoom = zoom;
        leastUsedTile.age = 0;
        this.generator.generateTile(
            gl,
            leastUsedTile.texture,
            this.tileWidth,
            this.tileHeight,
            x,
            y,
            zoom
        );

        return leastUsedTile.texture;
    }

    public incrementAge() {
        if (this.tiles == null) {
            throw Error('TileManager can not increment age before it is initialised.');
        }
        for (const tile of this.tiles) {
            tile.age++;
        }
    }
}

function isTileInDataBounds(x: number, y: number, zoom: number, bounds: Bounds | null): boolean {
    if (bounds == null) {
        return true;
    }
    const size = Math.pow(2, -zoom);
    const tileMinX = x * size;
    const tileMinY = y * size;
    const tileMaxX = tileMinX + size;
    const tileMaxY = tileMinY + size;
    const minX = transformX(bounds.minX);
    const minY = transformY(bounds.maxY);
    const maxX = transformX(bounds.maxX);
    const maxY = transformY(bounds.minY);
    return tileMinX <= maxX &&
        tileMaxX >= minX &&
        tileMinY <= maxY &&
        tileMaxY >= minY;
}
