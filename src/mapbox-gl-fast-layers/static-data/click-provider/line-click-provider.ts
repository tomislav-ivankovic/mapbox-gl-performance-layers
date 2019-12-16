import {ClickProvider} from './click-provider';
import {Feature, FeatureCollection, LineString} from 'geojson';

export interface LineClickProviderOptions<P> {
    onClick?: (feature: Feature<LineString, P>) => void;
    clickDistance?: number;
}

export class LineClickProvider<P> implements ClickProvider<LineString, P> {

    constructor(
        public options: LineClickProviderOptions<P>
    ) {
    }

    setData(data: FeatureCollection<LineString, P>): void {
    }

    clearData(): void {
    }

    initialise(map: mapboxgl.Map): void {
    }

    dispose(map: mapboxgl.Map): void {
    }
}
