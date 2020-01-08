import {Feature} from 'geojson';
import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import {EventData} from 'mapbox-gl';
import {MapMouseEvent} from 'mapbox-gl';
import {DynamicClickProvider} from './dynamic-click-provider';
import {DataOperations} from '../data-operations';
import {resolveVisibility, Visibility} from '../../shared/visibility';
import {
    PackedFeature,
    packPointFeature,
    pointToMultiPointDistanceSqr
} from '../../shared/geometry-functions';
import RBush from 'rbush';

export interface DynamicPointClickProviderOptions<G extends Point | MultiPoint, P> {
    onClick?: (feature: Feature<G, P>, e: MapMouseEvent & EventData) => void;
    clickSize?: number;
}

export class DynamicPointClickProvider<G extends Point | MultiPoint, P> implements DynamicClickProvider<G, P> {
    private readonly packedFeatures: PackedFeature<G, P>[] = [];
    private readonly tree = new RBush<PackedFeature<G, P>>();
    private map: mapboxgl.Map | null = null;
    private visibility: Visibility = true;
    private currentIndex = 0;

    constructor(
        private options: DynamicPointClickProviderOptions<G, P>
    ) {
    }

    dataOperations: DataOperations<Feature<G, P>> = {
        add: (feature: Feature<G, P>) => {
            const packed = packPointFeature(feature, this.currentIndex);
            this.currentIndex++;
            this.packedFeatures.push(packed);
            if (this.options.onClick != null) {
                this.tree.insert(packed);
            }
        },
        removeFirst: () => {
            const packed = this.packedFeatures.shift();
            if (this.options.onClick != null && packed != null) {
                this.tree.remove(packed);
            }
            return packed != null ? packed.feature : null;
        },
        removeLast: () => {
            const packed = this.packedFeatures.pop();
            if (this.options.onClick != null && packed != null) {
                this.tree.remove(packed);
            }
            return packed != null ? packed.feature : null;
        },
        clear: () => {
            this.packedFeatures.length = 0;
            this.tree.clear();
        },
        getArray: () => {
            return this.packedFeatures.map(p => p.feature);
        },
        addAll: (features: Feature<G, P>[]) => {
            const packed = features.map((f, index) => packPointFeature(f, this.currentIndex + index));
            this.currentIndex += features.length;
            this.packedFeatures.push(...packed);
            if (this.options.onClick != null) {
                this.tree.load(packed);
            }
        },
        removeNFirst: (n: number) => {
            let removed: Feature<G, P>[] = [];
            for (let i = 0; i < n; i++) {
                const r = this.dataOperations.removeFirst();
                if (r != null) {
                    removed.push(r);
                }
            }
            return removed;
        },
        removeNLast: (n: number) => {
            let removed: Feature<G, P>[] = [];
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


