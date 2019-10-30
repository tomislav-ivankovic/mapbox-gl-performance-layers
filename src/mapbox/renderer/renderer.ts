import * as glMatrix from 'gl-matrix';

export interface Renderer<D> {
    setData(data: D): void;
    initialise(gl: WebGLRenderingContext): void;
    dispose(gl: WebGLRenderingContext): void;
    prerender(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void;
    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void;
}
