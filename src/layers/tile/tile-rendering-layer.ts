import {TileRenderer} from './tile-renderer';
import {CustomLayerInterface} from 'mapbox-gl';

export class TileRenderingLayer<D> implements CustomLayerInterface {
    public id: string = 'point-layer';
    public renderingMode: '2d' | '3d' = '2d';
    public type: 'custom' = 'custom';

    private renderer: TileRenderer<D> | null = null;
    private testTile: WebGLTexture | null = null;

    constructor(
        private rendererSetter: (gl: WebGLRenderingContext) => TileRenderer<D>
    ) {
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.renderer = this.rendererSetter(gl);
        this.testTile = this.renderer.renderTile(0, 0, 0);
    }

    onRemove(map: mapboxgl.Map, gl: WebGLRenderingContext): void {

    }

    prerender(gl: WebGLRenderingContext, matrix: number[]): void {

    }

    render(gl: WebGLRenderingContext, matrix: number[]): void {

    }
}
