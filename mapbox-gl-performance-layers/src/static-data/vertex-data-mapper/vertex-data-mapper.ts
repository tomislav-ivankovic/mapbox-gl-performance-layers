import {FeatureCollection, Geometry} from 'geojson';
import {StyleOption} from '../../shared/styles';

export interface ShaderBuffers {
    array: Float32Array;
    elementArray: Int32Array | null;
}

export type VertexDataMapper<G extends Geometry, P, S extends {}> =
    (data: FeatureCollection<G, P>, styleOption: StyleOption<G, P, S>) => ShaderBuffers;
