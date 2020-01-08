import {Feature} from 'geojson';
import {FeatureCollection} from 'geojson';
import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import {ClickProvider} from './click-provider';
import {EventData} from 'mapbox-gl';
import {MapMouseEvent} from 'mapbox-gl';
import {
    PackedFeature,
    packPointFeature,
    pointToMultiPointDistanceSqr,
} from '../../shared/geometry-functions';
import {Visibility, resolveVisibility} from '../../shared/visibility';
import RBush from 'rbush';

export interface PointClickProviderOptions<G extends Point | MultiPoint, P> {
    onClick?: (feature: Feature<G, P>, e: MapMouseEvent & EventData) => void;
    clickSize?: number;
}

export class PointClickProvider<G extends Point | MultiPoint, P> implements ClickProvider<G, P> {
    private map: mapboxgl.Map | null = null;
    private tree: RBush<PackedFeature<G, P>> | null = null;
    private visibility: Visibility = true;

    constructor(
        private options: PointClickProviderOptions<G, P>
    ) {
    }

    setData(data: FeatureCollection<G, P>): void {
        if (this.options.onClick == null) {
            return;
        }
        const packedData = data.features.map((feature, index) => packPointFeature(feature, index));
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
        map.off('click', this.clickHandler);
        this.map = null;
    }

    setVisibility(visibility: Visibility): void {
        this.visibility = visibility;
    }

    private clickHandler = (e: MapMouseEvent & EventData) => {
        if (this.options.onClick == null || this.map == null || this.tree == null) {
            return;
        }
        if (!resolveVisibility(this.visibility, this.map)) {
            return;
        }
        const bounds = this.map.getBounds();
        const canvas = this.map.getCanvas();
        const clickSize = this.options.clickSize != null ? this.options.clickSize : 16;
        const x = e.lngLat.lng;
        const y = e.lngLat.lat;
        const w = clickSize * (bounds.getEast() - bounds.getWest()) / canvas.width;
        const h = clickSize * (bounds.getNorth() - bounds.getSouth()) / canvas.height;
        const results = this.tree.search({
            minX: x - 0.5 * w,
            minY: y - 0.5 * h,
            maxX: x + 0.5 * w,
            maxY: y + 0.5 * h
        });
        if (results.length === 0) {
            return;
        }
        let closestResult = results[0];
        let minDistanceSqr = Infinity;
        for (const result of results) {
            const distanceSqr = pointToMultiPointDistanceSqr(x, y, result.feature.geometry);
            if (distanceSqr < minDistanceSqr) {
                closestResult = result;
                minDistanceSqr = distanceSqr;
            }
        }
        const clickDistanceSqr = 0.25 * Math.max(w * w, h * h);
        if (minDistanceSqr <= clickDistanceSqr) {
            this.options.onClick(closestResult.feature, e);
            e.originalEvent.stopPropagation();
        }
    }
}
