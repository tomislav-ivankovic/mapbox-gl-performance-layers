import {Feature} from 'geojson';
import {Point} from 'geojson';
import {EventData} from 'mapbox-gl';
import {MapMouseEvent} from 'mapbox-gl';
import {DynamicClickProvider} from './dynamic-click-provider';
import {DataOperations} from '../data-operations';
import {resolveVisibility, Visibility} from '../../shared/visibility';
import {pointToPointDistanceSqr} from '../../shared/geometry-functions';
import RBush, {BBox} from 'rbush';

class PointTree<P> extends RBush<Feature<Point, P>> {
    toBBox(feature: Feature<Point, P>): BBox {
        const coords = feature.geometry.coordinates;
        return {
            minX: coords[0],
            minY: coords[1],
            maxX: coords[0],
            maxY: coords[1]
        };
    }

    compareMinX(a: Feature<Point, P>, b: Feature<Point, P>): number {
        return a.geometry.coordinates[0] - b.geometry.coordinates[0];
    }

    compareMinY(a: Feature<Point, P>, b: Feature<Point, P>): number {
        return a.geometry.coordinates[1] - b.geometry.coordinates[1];
    }
}

export interface DynamicPointClickProviderOptions<P> {
    onClick?: (feature: Feature<Point, P>, e: MapMouseEvent & EventData) => void;
    clickSize?: number;
}

export class DynamicPointClickProvider<P> implements DynamicClickProvider<Point, P> {
    private readonly features: Feature<Point, P>[] = [];
    private readonly tree = new PointTree<P>();
    private map: mapboxgl.Map | null = null;
    private visibility: Visibility = true;

    constructor(
        private options: DynamicPointClickProviderOptions<P>
    ) {
    }

    dataOperations: DataOperations<Feature<Point, P>> = {
        add: (feature: Feature<Point, P>) => {
            this.features.push(feature);
            if (this.options.onClick != null) {
                this.tree.insert(feature);
            }
        },
        removeFirst: () => {
            const feature = this.features.shift();
            if (this.options.onClick != null && feature != null) {
                this.tree.remove(feature);
            }
            return feature != null ? feature : null;
        },
        removeLast: () => {
            const feature = this.features.pop();
            if (this.options.onClick != null && feature != null) {
                this.tree.remove(feature);
            }
            return feature != null ? feature : null;
        },
        clear: () => {
            this.features.length = 0;
            this.tree.clear();
        },
        getArray: () => {
            return this.features;
        },
        addAll: (features: Feature<Point, P>[]) => {
            this.features.push(...features);
            if (this.options.onClick != null) {
                this.tree.load(features);
            }
        },
        removeNFirst: (n: number) => {
            let removed: Feature<Point, P>[] = [];
            for (let i = 0; i < n; i++) {
                const r = this.dataOperations.removeFirst();
                if (r != null) {
                    removed.push(r);
                }
            }
            return removed;
        },
        removeNLast: (n: number) => {
            let removed: Feature<Point, P>[] = [];
            for (let i = 0; i < n; i++) {
                const r = this.dataOperations.removeLast();
                if (r != null) {
                    removed.unshift(r);
                }
            }
            return removed;
        }
    };

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

    setVisibility(visibility: boolean | ((map: mapboxgl.Map) => boolean) | undefined | null): void {
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
            const coords = result.geometry.coordinates;
            const distanceSqr = pointToPointDistanceSqr(x, y, coords[0], coords[1]);
            if (distanceSqr < minDistanceSqr) {
                closestResult = result;
                minDistanceSqr = distanceSqr;
            }
        }
        const clickDistanceSqr = 0.25 * Math.max(w * w, h * h);
        if (minDistanceSqr <= clickDistanceSqr) {
            this.options.onClick(closestResult, e);
            e.originalEvent.stopPropagation();
        }
    }
}


