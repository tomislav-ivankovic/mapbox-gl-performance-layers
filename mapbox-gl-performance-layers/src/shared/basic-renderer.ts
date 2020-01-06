import * as glMatrix from 'gl-matrix';

export interface BasicRenderer {
    initialise(map: mapboxgl.Map, gl: WebGLRenderingContext): void;
    dispose(map: mapboxgl.Map, gl: WebGLRenderingContext): void;
    prerender(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void;
    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void;
}
