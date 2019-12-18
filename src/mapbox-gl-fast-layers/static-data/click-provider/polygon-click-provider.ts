import {ClickProvider} from './click-provider';
import {Feature, FeatureCollection, Polygon} from 'geojson';
import {FeatureTree} from './feature-tree';
import {EventData, MapMouseEvent} from 'mapbox-gl';

export interface PolygonClickProviderOptions<P> {
    onClick?: (feature: Feature<Polygon, P>, e: MapMouseEvent & EventData) => void;
}

export class PolygonClickProvider<P> implements ClickProvider<Polygon, P> {
    private tree: FeatureTree<Polygon, P> | null = null;

    constructor(
        public options: PolygonClickProviderOptions<P>
    ) {
    }

    setData(data: FeatureCollection<Polygon, P>): void {
        if (this.options.onClick == null) {
            return;
        }
        addBoundingBoxes(data);
        this.tree = new FeatureTree<Polygon, P>();
        this.tree.load(data.features);
    }

    clearData(): void {
        this.tree = null;
    }

    initialise(map: mapboxgl.Map): void {
        if (this.options.onClick == null) {
            return;
        }
        map.on('click', this.clickHandler);
    }

    dispose(map: mapboxgl.Map): void {
        if (this.options.onClick == null) {
            return;
        }
        map.off('click', this.clickHandler);
    }

    private clickHandler = (e: MapMouseEvent & EventData) => {
        if (this.options.onClick == null || this.tree == null) {
            return;
        }
        const x = e.lngLat.lng;
        const y = e.lngLat.lat;
        const results = this.tree.search({minX: x, minY: y, maxX: x, maxY: y});
        for (const feature of results) {
            if (isPointInPolygon(x, y, feature.geometry)) {
                this.options.onClick(feature, e);
                e.originalEvent.stopPropagation();
                break;
            }
        }
    }
}

function addBoundingBoxes<P>(data: FeatureCollection<Polygon, P>): void {
    for (const feature of data.features) {
        if (feature.bbox != null) {
            continue;
        }
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const coordinates of feature.geometry.coordinates) {
            for (const coords of coordinates) {
                if (coords[0] < minX) minX = coords[0];
                if (coords[1] < minY) minY = coords[1];
                if (coords[0] > maxX) maxX = coords[0];
                if (coords[1] > maxY) maxY = coords[1];
            }
        }
        feature.bbox = [minX, minY, maxX, maxY];
    }
}

function isPointInPolygon(x: number, y: number, polygon: Polygon): boolean {
    if (polygon.coordinates.length === 0 || !isPointInPolygonNoHoles(x, y, polygon.coordinates[0])) {
        return false;
    }
    for (let i = 1; i < polygon.coordinates.length; i++) {
        const coords = polygon.coordinates[i];
        if (isPointInPolygonNoHoles(x, y, coords)) {
            return false;
        }
    }
    return true;
}

function isPointInPolygonNoHoles(x: number, y: number, coords: number[][]): boolean {
    let isInside = false;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
        const xi = coords[i][0], yi = coords[i][1];
        const xj = coords[j][0], yj = coords[j][1];
        const doseIntersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (doseIntersect) {
            isInside = !isInside;
        }
    }
    return isInside;
}
