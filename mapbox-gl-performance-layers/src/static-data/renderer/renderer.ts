import {FeatureCollection, Geometry} from 'geojson';
import {StyleOption} from '../../styles';
import * as glMatrix from 'gl-matrix';

export interface Renderer<G extends Geometry, P, S extends {}> {
    setDataAndStyle(data: FeatureCollection<G, P>, styleOption: StyleOption<G, P, S>): void;
    clearData(): void;
    initialise(map: mapboxgl.Map, gl: WebGLRenderingContext): void;
    dispose(map: mapboxgl.Map, gl: WebGLRenderingContext): void;
    prerender(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void;
    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void;
}
