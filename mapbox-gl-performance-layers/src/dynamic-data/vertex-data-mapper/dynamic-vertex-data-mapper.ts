import {Feature} from 'geojson';
import {Geometry} from 'geojson';
import {StyleOption} from '../../shared/styles';

export type DynamicVertexDataMapper<G extends Geometry, P, S extends {}> =
    (feature: Feature<G, P>, styleOption: StyleOption<G, P, S>) => number[];
