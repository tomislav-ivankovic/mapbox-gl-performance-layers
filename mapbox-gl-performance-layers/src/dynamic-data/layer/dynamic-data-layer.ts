import {Geometry} from 'geojson';
import {DynamicRenderer} from '../renderer/dynamic-renderer';
import {CustomLayerInterface} from 'mapbox-gl';
import {StyleOption} from '../../shared/styles';
import {resolveVisibility, Visibility} from '../../shared/visibility';
import {DataOperationsComposer} from '../data-operations';
import {DynamicClickProvider} from '../click-provider/dynamic-click-provider';

export interface DynamicDataLayerOptions<G extends Geometry, P, S extends {}> {
    id: string;
    renderer: DynamicRenderer<G, P, S>;
    clickProvider?: DynamicClickProvider<G, P>;
    renderingMode?: '2d' | '3d';
}

export class DynamicDataLayer<G extends Geometry, P, S extends {}> implements CustomLayerInterface {
    private map: mapboxgl.Map | null = null;
    private visibility: Visibility = true;

    constructor(
        private options: DynamicDataLayerOptions<G, P, S>
    ) {
    }

    public readonly dataOperations = new DataOperationsComposer(
        this.options.clickProvider != null ?
            [this.options.renderer.dataOperations, this.options.clickProvider.dataOperations] :
            [this.options.renderer.dataOperations]
        ,
        () => {
            if (this.map != null) {
                this.map.triggerRepaint();
            }
        }
    );

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

    public setStyle(styleOption: StyleOption<G, P, S>) {
        this.options.renderer.setStyle(styleOption);
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
