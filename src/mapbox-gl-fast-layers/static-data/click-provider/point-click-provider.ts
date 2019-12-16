import {ClickProvider} from './click-provider';
import {Feature, FeatureCollection, Point} from 'geojson';
import KDBush from 'kdbush';
import {EventData, MapMouseEvent} from 'mapbox-gl';

export interface PointClickProviderOptions<P> {
    onClick?: (feature: Feature<Point, P>) => void;
    clickSize?: number;
}

export class PointClickProvider<P> implements ClickProvider<Point, P> {
    private map: mapboxgl.Map | null = null;
    private data: FeatureCollection<Point, P> | null = null;
    private index: KDBush<Feature<Point, P>> | null = null;

    constructor(
        public options: PointClickProviderOptions<P>
    ) {
    }

    setData(data: FeatureCollection<Point, P>): void {
        if (this.options.onClick == null) {
            return;
        }
        this.data = data;
        this.index = new KDBush(
            data.features,
            p => p.geometry.coordinates[0],
            p => p.geometry.coordinates[1],
            64,
            Float32Array
        );
    }

    clearData(): void {
        this.index = null;
        this.data = null;
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

    private clickHandler = (e: MapMouseEvent & EventData) => {
        if (this.map == null || this.options.onClick == null || this.data == null || this.index == null) {
            return;
        }
        const bounds = this.map.getBounds();
        const canvas = this.map.getCanvas();
        const clickSize = this.options.clickSize != null ? this.options.clickSize : 16;
        const x = e.lngLat.lng;
        const y = e.lngLat.lat;
        const w = clickSize * (bounds.getEast() - bounds.getWest()) / canvas.width;
        const h = clickSize * (bounds.getNorth() - bounds.getSouth()) / canvas.height;
        const results = this.index.range(x - 0.5 * w, y - 0.5 * h, x + 0.5 * w, y + 0.5 * h);
        if (results.length === 0) {
            return;
        }
        const features = this.data.features;
        let closestIndex = results[0];
        let minDistanceSqr = Infinity;
        for (const index of results) {
            const coords = features[index].geometry.coordinates;
            const distSqr = (coords[0] - x) * (coords[0] - x) + (coords[1] - y) * (coords[1] - y);
            if (distSqr < minDistanceSqr) {
                closestIndex = index;
                minDistanceSqr = distSqr;
            }
        }
        const closestFeature = features[closestIndex];
        this.options.onClick(closestFeature);
        e.originalEvent.stopPropagation();
    }
}
