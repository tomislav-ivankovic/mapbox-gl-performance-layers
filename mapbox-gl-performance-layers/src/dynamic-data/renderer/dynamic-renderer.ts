import {Feature} from 'geojson';
import {Geometry} from 'geojson';
import {StyleOption} from '../../shared/styles';
import {DataOperations} from '../data-operations';
import * as glMatrix from 'gl-matrix';

export interface DynamicRenderer<G extends Geometry, P, S extends {}> {
    dataOperations: DataOperations<Feature<G, P>>;
    setStyle(styleOption: StyleOption<G, P, S>): void;
    initialise(map: mapboxgl.Map, gl: WebGLRenderingContext): void;
    dispose(map: mapboxgl.Map, gl: WebGLRenderingContext): void;
    prerender(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void;
    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void;
}
