import {Renderer} from './renderer';
import * as glMatrix from 'gl-matrix';

export class CompositeRenderer<D> implements Renderer<D> {
    constructor(
        private renderers: Renderer<D>[]
    ){
    }

    setData(data: D): void {
        for (const renderer of this.renderers) {
            renderer.setData(data);
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
