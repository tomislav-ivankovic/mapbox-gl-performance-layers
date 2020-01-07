import {Feature} from 'geojson';
import {FeatureCollection} from 'geojson';
import {LineString} from 'geojson';
import {EventData} from 'mapbox-gl';
import {MapMouseEvent} from 'mapbox-gl';
import {ClickProvider} from './click-provider';
import {
    closestPointOnLine, PackedFeature, packLineStringFeature,
    pointToPointDistanceSqr
} from '../../shared/geometry-functions';
import RBush from 'rbush';
import {Visibility, resolveVisibility} from '../../shared/visibility';

export interface LineClickProviderOptions<P> {
    onClick?: (
        feature: Feature<LineString, P>,
        e: MapMouseEvent & EventData,
        closestPointOnLine: { x: number, y: number }
    ) => void;
    clickSize?: number;
}

export class LineClickProvider<P> implements ClickProvider<LineString, P> {
    private map: mapboxgl.Map | null = null;
    private tree: RBush<PackedFeature<LineString, P>> | null = null;
    private visibility: Visibility = true;

    constructor(
        private options: LineClickProviderOptions<P>
    ) {
    }

    setData(data: FeatureCollection<LineString, P>): void {
        if (this.options.onClick == null) {
            return;
        }
        const packedData = data.features.map((feature, index) => packLineStringFeature(feature, index));
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
        let closestPoint = {x: 0, y: 0};
        for (const result of results) {
            const point = closestPointOnLine(x, y, result.feature.geometry);
            const distanceSqr = pointToPointDistanceSqr(x, y, point.x, point.y);
            if (distanceSqr < minDistanceSqr) {
                closestResult = result;
                minDistanceSqr = distanceSqr;
                closestPoint = point;
            }
        }
        const clickDistanceSqr = 0.25 * Math.max(w * w, h * h);
        if (minDistanceSqr <= clickDistanceSqr) {
            this.options.onClick(closestResult.feature, e, closestPoint);
            e.originalEvent.stopPropagation();
        }
    }
}
