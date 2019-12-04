import {CustomLayerInterface} from 'mapbox-gl';
import {Renderer} from './renderer/renderer';
import {ClickProvider} from './click-provider/click-provider';
import {FeatureCollection, Geometry} from 'geojson';

export class CustomLayer<G extends Geometry, P> implements CustomLayerInterface {
    public type: 'custom' = 'custom';

    constructor(
        public id: string,
        private renderer: Renderer<FeatureCollection<G, P>>,
        private clickProvider: ClickProvider<G, P>,
        public renderingMode: '2d' | '3d' = '2d'
    ) {
    }

    public setData(data: FeatureCollection<G, P>) {
        this.renderer.setData(data);
        this.clickProvider.setData(data);
    }

    public clearData() {
        this.renderer.clearData();
        this.clickProvider.clearData();
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        gl.getExtension('OES_element_index_uint');
        this.renderer.initialise(map, gl);
        this.clickProvider.initialise(map);
    }

    onRemove(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.renderer.dispose(map, gl);
        this.clickProvider.dispose(map);
    }

    prerender(gl: WebGLRenderingContext, matrix: number[]): void {
        this.renderer.prerender(gl, matrix);
    }

    render(gl: WebGLRenderingContext, matrix: number[]): void {
        this.renderer.render(gl, matrix);
    }
}
