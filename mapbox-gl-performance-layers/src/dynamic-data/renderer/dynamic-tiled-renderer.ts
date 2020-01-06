import {DynamicRenderer} from './dynamic-renderer';
import {Feature, Geometry} from 'geojson';
import {DataOperations} from '../data-operations';
import {StyleOption} from '../../shared/styles';
import {TileRenderer, TileRendererOptions} from '../../shared/tile/tile-renderer';
import * as glMatrix from 'gl-matrix';

export class DynamicTiledRenderer<G extends Geometry, P, S extends {}> implements DynamicRenderer<G, P, S> {
    private tileRenderer: TileRenderer;

    constructor(
        private renderer: DynamicRenderer<G, P, S>,
        options: TileRendererOptions
    ){
        this.tileRenderer = new TileRenderer(renderer, options);
    }

    dataOperations: DataOperations<Feature<G, P>> = {
        add: (element: Feature<G, P>) => {
            this.renderer.dataOperations.add(element);
        },
        removeFirst: () => {
            this.renderer.dataOperations.removeFirst();
        },
        removeLast: () => {
            this.renderer.dataOperations.removeLast();
        },
        clear: () => {
            this.renderer.dataOperations.clear();
        },
        getSize: () => {
            return this.renderer.dataOperations.getSize();
        },
        addAll: (elements: Feature<G, P>[]) => {
            this.renderer.dataOperations.addAll(elements);
        },
        removeNFirst: (n: number) => {
            this.renderer.dataOperations.removeNFirst(n);
        },
        removeNLast: (n: number) => {
            this.renderer.dataOperations.removeNLast(n);
        }
    };
    
    setStyle(styleOption: StyleOption<G, P, S>): void {
        this.renderer.setStyle(styleOption);
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
        this.tileRenderer.render(gl, matrix, null);
    }
}
