import {CustomLayerInterface} from 'mapbox-gl';
import {Renderer} from '../renderer/renderer';
import {ClickProvider} from '../click-provider/click-provider';
import {FeatureCollection, Geometry} from 'geojson';

export interface StaticDataLayerOptions<G extends Geometry, P> {
    id: string;
    renderer: Renderer<FeatureCollection<G, P>>;
    clickProvider?: ClickProvider<G, P>;
    renderingMode?: '2d' | '3d';
}

export class StaticDataLayer<G extends Geometry, P> implements CustomLayerInterface {
    constructor(
        private options: StaticDataLayerOptions<G, P>
    ) {
    }

    public get id(): string {
        return this.options.id;
    }

    public get renderingMode(): '2d' | '3d' {
        if (this.options.renderingMode == null) {
            return  '2d';
        }
        return this.options.renderingMode;
    }

    public get type(): 'custom' {
        return 'custom';
    }

    public setData(data: FeatureCollection<G, P>) {
        this.options.renderer.setData(data);
        if (this.options.clickProvider != null) {
            this.options.clickProvider.setData(data);
        }
    }

    public clearData() {
        this.options.renderer.clearData();
        if (this.options.clickProvider != null) {
            this.options.clickProvider.clearData();
        }
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        gl.getExtension('OES_element_index_uint');
        this.options.renderer.initialise(map, gl);
        if (this.options.clickProvider != null) {
            this.options.clickProvider.initialise(map);
        }
    }

    onRemove(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.options.renderer.dispose(map, gl);
        if (this.options.clickProvider != null) {
            this.options.clickProvider.dispose(map);
        }
    }

    prerender(gl: WebGLRenderingContext, matrix: number[]): void {
        this.options.renderer.prerender(gl, matrix);
    }

    render(gl: WebGLRenderingContext, matrix: number[]): void {
        this.options.renderer.render(gl, matrix);
    }
}
