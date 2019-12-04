import {ClickProvider} from './click-provider';
import {Feature, FeatureCollection, Polygon} from 'geojson';

export interface PolygonClickProviderOptions<P> {
    onClick?: (feature: Feature<Polygon, P>) => void;
    clickDistance?: number;
}

export class PolygonClickProvider<P> implements ClickProvider<Polygon, P> {

    constructor(
        public options: PolygonClickProviderOptions<P>
    ) {
    }

    setData(data: FeatureCollection<Polygon, P>): void {
    }

    clearData(): void {
    }

    initialise(map: mapboxgl.Map): void {
    }

    dispose(map: mapboxgl.Map): void {
    }
}
