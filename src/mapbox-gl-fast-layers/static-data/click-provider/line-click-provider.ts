import {ClickProvider} from './click-provider';
import {Feature, FeatureCollection, LineString} from 'geojson';
import {EventData, MapMouseEvent} from 'mapbox-gl';
import {FeatureTree} from './feature-tree';

export interface LineClickProviderOptions<P> {
    onClick?: (feature: Feature<LineString, P>, e: MapMouseEvent & EventData) => void;
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
        addBoundingBoxes(data);
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
        for (const feature of features) {
            const distSqr = pointToLineDistanceSqr(x, y, feature.geometry);
            if (distSqr < minDistanceSqr) {
                closestFeature = feature;
                minDistanceSqr = distSqr;
            }
        }
        const clickDistanceSqr = 0.25 * Math.max(w*w, h*h);
        if (minDistanceSqr <= clickDistanceSqr) {
            this.options.onClick(closestFeature, e);
            e.originalEvent.stopPropagation();
        }
    }
}

function addBoundingBoxes<P>(data: FeatureCollection<LineString, P>): void {
    for (const feature of data.features) {
        if (feature.bbox != null) {
            continue;
        }
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const coords of feature.geometry.coordinates) {
            if (coords[0] < minX) minX = coords[0];
            if (coords[1] < minY) minY = coords[1];
            if (coords[0] > maxX) maxX = coords[0];
            if (coords[1] > maxY) maxY = coords[1];
        }
        feature.bbox = [minX, minY, maxX, maxY];
    }
}

function pointToLineDistanceSqr(x: number, y: number, line: LineString) {
    let min = Infinity;
    for (let i = 0; i < line.coordinates.length - 1; i++) {
        const p1 = line.coordinates[i];
        const p2 = line.coordinates[i + 1];
        const distSqr = pointToLineSegmentDistanceSqr(x, y, p1[0], p1[1], p2[0], p2[1]);
        if (distSqr < min) {
            min = distSqr;
        }
    }
    return min;
}

function pointToLineSegmentDistanceSqr(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
    const segmentLengthSqr = pointToPointDistanceSqr(x1, y1, x2, y2);
    if (segmentLengthSqr === 0) {
        return pointToPointDistanceSqr(x1, y1, x, y);
    }
    const projectionFactor = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / segmentLengthSqr;
    const projectionFactorClamped = Math.max(0, Math.min(1, projectionFactor));
    const projectionX = x1 + projectionFactorClamped * (x2 - x1);
    const projectionY = y1 + projectionFactorClamped * (y2 - y1);
    return pointToPointDistanceSqr(x, y, projectionX, projectionY);
}

function pointToPointDistanceSqr(x1: number, y1: number, x2: number, y2: number) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}
