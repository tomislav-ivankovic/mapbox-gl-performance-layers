import {Feature} from 'geojson';
import {FeatureCollection} from 'geojson';
import {Polygon} from 'geojson';
import {MultiPolygon} from 'geojson';
import {EventData} from 'mapbox-gl';
import {MapMouseEvent} from 'mapbox-gl';
import {ClickProvider} from './click-provider';
import {PackedFeature, isPointInPolygon, packPolygonFeature} from '../../shared/geometry-functions';
import {Visibility, resolveVisibility} from '../../shared/visibility';
import RBush from 'rbush';

export interface PolygonClickProviderOptions<G extends Polygon | MultiPolygon, P> {
    onClick?: (feature: Feature<G, P>, e: MapMouseEvent & EventData) => void;
}

export class PolygonClickProvider<G extends Polygon | MultiPolygon, P> implements ClickProvider<G, P> {
    private map: mapboxgl.Map | null = null;
    private tree: RBush<PackedFeature<G, P>> | null = null;
    private visibility: Visibility = true;

    constructor(
        private options: PolygonClickProviderOptions<G, P>
    ) {
    }

    setData(data: FeatureCollection<G, P>): void {
        if (this.options.onClick == null) {
            return;
        }
        const packedData = data.features.map((feature, index) => packPolygonFeature(feature, index));
        this.tree = new RBush();
        this.tree.load(packedData);
    }

    clearData(): void {
        this.tree = null;
    }

    initialise(map: mapboxgl.Map): void {
        if (this.options.onClick == null) {
            return;
        }
        this.map = map;
        map.on('click', this.clickHandler);
    }

    dispose(map: mapboxgl.Map): void {
        if (this.options.onClick == null) {
            return;
        }
        this.map = null;
        map.off('click', this.clickHandler);
    }

    setVisibility(visibility: Visibility): void {
        this.visibility = visibility;
    }

    private clickHandler = (e: MapMouseEvent & EventData) => {
        if (this.options.onClick == null || this.tree == null) {
            return;
        }
        if (!resolveVisibility(this.visibility, this.map)) {
            return;
        }
        const x = e.lngLat.lng;
        const y = e.lngLat.lat;
        const results = this.tree.search({minX: x, minY: y, maxX: x, maxY: y});
        let closestResult : PackedFeature<G, P> | null = null;
        let closestIndex = -1;
        for (const result of results) {
            if (result.index > closestIndex && isPointInPolygon(x, y, result.feature.geometry)) {
                closestResult = result;
                closestIndex = result.index;
            }
        }
        if (closestResult != null) {
            this.options.onClick(closestResult.feature, e);
            e.originalEvent.stopPropagation();
        }
    }
}
