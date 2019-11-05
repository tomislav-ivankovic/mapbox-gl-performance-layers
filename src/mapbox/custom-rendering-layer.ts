import {CustomLayerInterface} from 'mapbox-gl';
import {Renderer} from './renderer/renderer';

export class CustomRenderingLayer<D> implements CustomLayerInterface {
    public type: 'custom' = 'custom';

    constructor(
        public id: string,
        private renderer: Renderer<D>,
        public renderingMode: '2d' | '3d' = '2d'
    ) {
    }

    public setData(data: D) {
        this.renderer.setData(data);
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.renderer.initialise(gl);
    }

    onRemove(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.renderer.dispose(gl);
    }

    prerender(gl: WebGLRenderingContext, matrix: number[]): void {
        this.renderer.prerender(gl, matrix);
    }

    render(gl: WebGLRenderingContext, matrix: number[]): void {
        this.renderer.render(gl, matrix);
    }
}
