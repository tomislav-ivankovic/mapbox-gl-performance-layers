import {Renderer} from './renderer';
import {FeatureCollection, Geometry} from 'geojson';
import {StyleOption} from '../../styles';
import * as glMatrix from 'gl-matrix';

export class CompositeRenderer<G extends Geometry, P, S extends {}> implements Renderer<G, P, S> {
    constructor(
        private renderers: Renderer<G, P, S>[]
    ){
    }

    setDataAndStyle(data: FeatureCollection<G, P>, styleOption: StyleOption<G, P, S>): void {
        for (const renderer of this.renderers) {
            renderer.setDataAndStyle(data, styleOption);
        }
    }

    clearData(): void {
        for (const renderer of this.renderers) {
            renderer.clearData();
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
