import {CustomLayerInterface} from 'mapbox-gl';
import {Renderer} from './renderer/renderer';

interface RendererConfiguration<D> {
    renderer: Renderer<D>,
    condition: (data: D) => boolean,
}

export class DataRenderingLayer<D> implements CustomLayerInterface {
    public type: 'custom' = 'custom';

    private currentConfig = this.configs[0];
    private gl: WebGLRenderingContext | null = null;

    constructor(
        public id: string,
        public configs: RendererConfiguration<D>[],
        public renderingMode: '2d' | '3d' = '2d'
    ) {
        if (configs.length === 0) {
            throw Error('DataRenderingLayer must have at least 1 rendering configuration.');
        }
    }

    public setData(data: D) {
        const currentConfig = this.currentConfig;
        if (!currentConfig.condition(data)) {
            const find = this.configs.find(config => config.condition(data));
            const newConfig = find != null ? find : this.configs[this.configs.length - 1];
            if (newConfig !== currentConfig) {
                if (this.gl != null) {
                    currentConfig.renderer.dispose(this.gl);
                    newConfig.renderer.initialise(this.gl);
                }
                this.currentConfig = newConfig;
            }
        }
        this.currentConfig.renderer.setData(data);
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.currentConfig.renderer.initialise(gl);
        this.gl = gl;
    }

    onRemove(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.gl = null;
        this.currentConfig.renderer.dispose(gl);
    }

    prerender(gl: WebGLRenderingContext, matrix: number[]): void {
        this.currentConfig.renderer.prerender(gl, matrix);
    }

    render(gl: WebGLRenderingContext, matrix: number[]): void {
        this.currentConfig.renderer.render(gl, matrix);
    }
}
