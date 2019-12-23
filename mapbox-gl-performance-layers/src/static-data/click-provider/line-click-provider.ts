import {ClickProvider} from './click-provider';
import {Feature, FeatureCollection, LineString} from 'geojson';
import {EventData, MapMouseEvent} from 'mapbox-gl';
import {FeatureTree} from './feature-tree';
import {
    addLineStringCollectionBoundingBoxes,
    closestPointOnLine,
    pointToPointDistanceSqr
} from '../../geometry-functions';

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
    private tree: FeatureTree<LineString, P> | null = null;

    constructor(
        public options: LineClickProviderOptions<P>
    ) {
    }

    setData(data: FeatureCollection<LineString, P>): void {
        if (this.options.onClick == null) {
            return;
        }
        addLineStringCollectionBoundingBoxes(data);
        this.tree = new FeatureTree<LineString, P>();
        this.tree.load(data.features);
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

    private clickHandler = (e: MapMouseEvent & EventData) => {
        if (this.options.onClick == null || this.map == null || this.tree == null) {
            return;
        }
        const bounds = this.map.getBounds();
        const canvas = this.map.getCanvas();
        const clickSize = this.options.clickSize != null ? this.options.clickSize : 16;
        const x = e.lngLat.lng;
        const y = e.lngLat.lat;
        const w = clickSize * (bounds.getEast() - bounds.getWest()) / canvas.width;
        const h = clickSize * (bounds.getNorth() - bounds.getSouth()) / canvas.height;
        const features = this.tree.search({
            minX: x - 0.5 * w,
            minY: y - 0.5 * h,
            maxX: x + 0.5 * w,
            maxY: y + 0.5 * h
        });
        if (features.length === 0) {
            return;
        }
        let closestFeature = features[0];
        let minDistanceSqr = Infinity;
        let closestPoint = {x: 0, y: 0};
        for (const feature of features) {
            const point = closestPointOnLine(x, y, feature.geometry);
            const distanceSqr = pointToPointDistanceSqr(x, y, point.x, point.y);
            if (distanceSqr < minDistanceSqr) {
                closestFeature = feature;
                minDistanceSqr = distanceSqr;
                closestPoint = point;
            }
        }
        const clickDistanceSqr = 0.25 * Math.max(w * w, h * h);
        if (minDistanceSqr <= clickDistanceSqr) {
            this.options.onClick(closestFeature, e, closestPoint);
            e.originalEvent.stopPropagation();
        }
    }
}
