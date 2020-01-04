import {FeatureCollection, Geometry} from 'geojson';
import {Visibility} from '../../visibility';

export interface ClickProvider<G extends Geometry, P> {
    setData(data: FeatureCollection<G, P>): void;
    clearData(): void;
    initialise(map: mapboxgl.Map): void;
    dispose(map: mapboxgl.Map): void;
    setVisibility(visibility: Visibility): void;
}
