import {Feature, Geometry} from 'geojson';
import {Visibility} from '../../shared/visibility';
import {DataOperations} from '../data-operations';

export interface DynamicClickProvider<G extends Geometry, P> {
    dataOperations: DataOperations<Feature<G, P>>;
    initialise(map: mapboxgl.Map): void;
    dispose(map: mapboxgl.Map): void;
    setVisibility(visibility: Visibility): void;
}
