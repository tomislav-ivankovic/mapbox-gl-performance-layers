import {Feature, Geometry} from 'geojson';
import {DynamicRenderer} from './dynamic-renderer';
import {DataOperations, DataOperationsComposer} from '../data-operations';
import {StyleOption} from '../../shared/styles';
import * as glMatrix from 'gl-matrix';

export class DynamicCompositeRenderer<G extends Geometry, P, S extends {}> implements DynamicRenderer<G, P, S> {
    constructor(
        private renderers: DynamicRenderer<G, P, S>[]
    ){
    }

    dataOperations: DataOperations<Feature<G, P>> = new DataOperationsComposer(
        this.renderers.map(r => r.dataOperations)
    );

    setStyle(styleOption: StyleOption<G, P, S>) {
        for (const renderer of this.renderers) {
            renderer.setStyle(styleOption);
        }
    }

    initialise(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        for (const renderer of this.renderers) {
            renderer.initialise(map, gl);
        }
    }

    dispose(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        for (const renderer of this.renderers) {
            renderer.dispose(map, gl);
        }
    }

    prerender(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
        for (const renderer of this.renderers) {
            renderer.prerender(gl, matrix);
        }
    }

    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
        for (const renderer of this.renderers) {
            renderer.render(gl, matrix);
        }
    }
}
