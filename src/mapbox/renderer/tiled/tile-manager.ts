import {TileGenerator} from './tile-generator';

interface Tile {
    x: number,
    y: number,
    zoom: number,
    age: number,
    texture: WebGLTexture
}

export class TileManager<D> {
    private tiles: Tile[] | null = null;

    constructor(
        private generator: TileGenerator<D>,
        private numberOfTiles: number,
        private tileWidth: number,
        private tileHeight: number
    ) {
    }

    public setData(data: D): void {
        this.generator.setData(data);
        if (this.tiles != null) {
            this.tiles.forEach(tile => {
                tile.zoom = -1;
                tile.age = Number.MAX_VALUE / 2;
            });
        }
    }

    public initialise(gl: WebGLRenderingContext): void {
        this.generator.initialise(gl);

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

    public dispose(gl: WebGLRenderingContext): void {
        if(this.tiles != null) {
            this.tiles.forEach(tile => gl.deleteTexture(tile.texture));
        }
        this.tiles = null;
        this.generator.dispose(gl);
    }

    public getTileTexture(
        gl: WebGLRenderingContext,
        x: number,
        y: number,
        zoom: number
    ): WebGLTexture {
        const tiles = this.tiles;
        if (tiles == null) {
            throw Error('TileManager can not get a tile texture before it is initialised.');
        }

        const foundTile = tiles.find(t => t.x === x && t.y === y && t.zoom === zoom);
        if (foundTile != null) {
            foundTile.age = 0;
            return foundTile.texture;
        }

        let leastUsedTile = tiles[0];
        tiles.forEach(tile => {
            if (tile.age > leastUsedTile.age) {
                leastUsedTile = tile;
            }
        });
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
        if (this.tiles != null) {
            this.tiles.forEach(tile => tile.age++);
        }
    }
}
