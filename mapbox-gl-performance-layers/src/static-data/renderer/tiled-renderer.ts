import {Renderer} from './renderer';
import {Bounds} from '../../shared/geometry-functions';
import {Feature, FeatureCollection, Geometry} from 'geojson';
import {StyleOption} from '../../shared/styles';
import {TileRenderer, TileRendererOptions} from '../../shared/tile/tile-renderer';
import * as glMatrix from 'gl-matrix';

export class TiledRenderer<G extends Geometry, P, S extends {}> implements Renderer<G, P, S> {
    private tileRenderer: TileRenderer;
    private dataBounds: Bounds | null = null;

    constructor(
        private renderer: Renderer<G, P, S>,
        private findDataBounds: (data: ReadonlyArray<Feature<G, P>>) => Bounds,
        options: TileRendererOptions
    ) {
        this.tileRenderer = new TileRenderer(renderer, options);
    }

    setDataAndStyle(data: FeatureCollection<G, P>, styleOption: StyleOption<G, P, S>): void {
        this.renderer.setDataAndStyle(data, styleOption);
        this.dataBounds = this.findDataBounds(data.features);
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
