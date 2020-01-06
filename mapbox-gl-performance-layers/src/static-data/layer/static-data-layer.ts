import {CustomLayerInterface} from 'mapbox-gl';
import {Renderer} from '../renderer/renderer';
import {ClickProvider} from '../click-provider/click-provider';
import {FeatureCollection, Geometry} from 'geojson';
import {StyleOption} from '../../shared/styles';
import {resolveVisibility, Visibility} from '../../shared/visibility';

export interface StaticDataLayerOptions<G extends Geometry, P, S extends {}> {
    id: string;
    renderer: Renderer<G, P, S>;
    clickProvider?: ClickProvider<G, P>;
    renderingMode?: '2d' | '3d';
}

export class StaticDataLayer<G extends Geometry, P, S extends {}> implements CustomLayerInterface {
    private map: mapboxgl.Map | null = null;
    private data: FeatureCollection<G, P> | null = null;
    private styleOption: StyleOption<G, P, S> = undefined;
    private visibility: Visibility = true;

    constructor(
        private options: StaticDataLayerOptions<G, P, S>
    ) {
    }

    public get id(): string {
        return this.options.id;
    }

    public get renderingMode(): '2d' | '3d' {
        if (this.options.renderingMode == null) {
            return '2d';
        }
        return this.options.renderingMode;
    }

    public get type(): 'custom' {
        return 'custom';
    }

    public setDataAndStyle(data: FeatureCollection<G, P>, styleOption: StyleOption<G, P, S>) {
        this.data = data;
        this.styleOption = styleOption;
        this.options.renderer.setDataAndStyle(data, styleOption);
        if (this.options.clickProvider != null) {
            this.options.clickProvider.setData(data);
        }
        if (this.map != null) {
            this.map.triggerRepaint();
        }
    }

    public setData(data: FeatureCollection<G, P>) {
        this.setDataAndStyle(data, this.styleOption);
    }

    public setStyle(styleOption: StyleOption<G, P, S>) {
        this.styleOption = styleOption;
        if (this.data == null) {
            return;
        }
        this.options.renderer.setDataAndStyle(this.data, styleOption);
        if (this.map != null) {
            this.map.triggerRepaint();
        }
    }

    public clearData() {
        this.data = null;
        this.options.renderer.clearData();
        if (this.options.clickProvider != null) {
            this.options.clickProvider.clearData();
        }
        if (this.map != null) {
            this.map.triggerRepaint();
        }
    }

    public setVisibility(visibility: Visibility) {
        this.visibility = visibility;
        if (this.options.clickProvider != null) {
            this.options.clickProvider.setVisibility(visibility);
        }
        if (this.map != null) {
            this.map.triggerRepaint();
        }
    }

    public isVisible(): boolean {
        return resolveVisibility(this.visibility, this.map);
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        gl.getExtension('OES_element_index_uint');
        this.map = map;
        this.options.renderer.initialise(map, gl);
        if (this.options.clickProvider != null) {
            this.options.clickProvider.initialise(map);
        }
    }

    onRemove(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.map = null;
        this.options.renderer.dispose(map, gl);
        if (this.options.clickProvider != null) {
            this.options.clickProvider.dispose(map);
        }
    }

    prerender(gl: WebGLRenderingContext, matrix: number[]): void {
        if (this.isVisible()) {
            this.options.renderer.prerender(gl, matrix);
        }
    }

    render(gl: WebGLRenderingContext, matrix: number[]): void {
        if (this.isVisible()) {
            this.options.renderer.render(gl, matrix);
        }
    }
}
