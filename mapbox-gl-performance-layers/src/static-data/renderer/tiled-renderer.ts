import {FeatureCollection} from 'geojson';
import {Geometry} from 'geojson';
import {Renderer} from './renderer';
import {Bounds, findFeatureCollectionBounds} from '../../shared/geometry-functions';
import {StyleOption} from '../../shared/styles';
import {TileRenderer, TileRendererOptions} from '../../shared/tile/tile-renderer';
import * as glMatrix from 'gl-matrix';

export class TiledRenderer<G extends Geometry, P, S extends {}> implements Renderer<G, P, S> {
    private tileRenderer: TileRenderer;
    private readonly dataBounds: Bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };

    constructor(
        private renderer: Renderer<G, P, S>,
        options: TileRendererOptions
    ) {
        this.tileRenderer = new TileRenderer(renderer, options);
    }

    setDataAndStyle(data: FeatureCollection<G, P>, styleOption: StyleOption<G, P, S>): void {
        findFeatureCollectionBounds(this.dataBounds, data);
        this.renderer.setDataAndStyle(data, styleOption);
        this.tileRenderer.markAllTilesOutdated();
    }

    clearData(): void {
        this.renderer.clearData();
        this.tileRenderer.markAllTilesOutdated();
    }

    initialise(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.tileRenderer.initialise(map, gl);
    }

    dispose(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.tileRenderer.dispose(map, gl);
    }

    prerender(): void {
    }

    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
        this.tileRenderer.render(gl, matrix, this.dataBounds);
    }
}
