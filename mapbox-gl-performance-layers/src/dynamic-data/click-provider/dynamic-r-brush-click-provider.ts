import {Feature} from 'geojson';
import {Geometry} from 'geojson';
import {DynamicClickProvider} from './dynamic-click-provider';
import {EventData} from 'mapbox-gl';
import {MapMouseEvent} from 'mapbox-gl';
import RBush from 'rbush';
import {PackedFeature} from '../../shared/geometry-functions';
import {resolveVisibility, Visibility} from '../../shared/visibility';
import {ResultsClickHandler} from '../../shared/click-handler/results-click-handler';
import {DataOperations} from '../data-operations';

export class DynamicRBrushClickProvider<G extends Geometry, P> implements DynamicClickProvider<G, P> {
    private readonly packedFeatures: PackedFeature<G, P>[] = [];
    private readonly tree = new RBush<PackedFeature<G, P>>();
    private map: mapboxgl.Map | null = null;
    private visibility: Visibility = true;
    private currentIndex = 0;

    constructor(
        private featurePacker: (feature: Feature<G, P>, index: number) => PackedFeature<G, P>,
        private resultsHandler: ResultsClickHandler<G, P>,
        private clickSize?: number
    ) {
    }

    dataOperations: DataOperations<Feature<G, P>> = {
        add: (feature: Feature<G, P>) => {
            const packed = this.featurePacker(feature, this.currentIndex);
            this.currentIndex++;
            this.packedFeatures.push(packed);
            this.tree.insert(packed);
        },
        removeFirst: () => {
            const packed = this.packedFeatures.shift();
            if (packed != null) {
                this.tree.remove(packed);
            }
            return packed != null ? packed.feature : null;
        },
        removeLast: () => {
            const packed = this.packedFeatures.pop();
            if (packed != null) {
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
            const packed = features.map((f, index) => this.featurePacker(f, this.currentIndex + index));
            this.currentIndex += features.length;
            this.packedFeatures.push(...packed);
            this.tree.load(packed);
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
        this.map = map;
        map.on('click', this.clickHandler);
    }

    dispose(map: mapboxgl.Map): void {
        this.map = null;
        map.off('click', this.clickHandler);
    }

    setVisibility(visibility: Visibility): void {
        this.visibility = visibility;
    }

    private clickHandler = (e: MapMouseEvent & EventData) => {
        if (this.map == null || this.tree == null) {
            return;
        }
        if (!resolveVisibility(this.visibility, this.map)) {
            return;
        }
        const bounds = this.map.getBounds();
        const canvas = this.map.getCanvas();
        const clickSize = this.clickSize != null ? this.clickSize : 16;
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
        this.resultsHandler(x, y, Math.max(w, h), results, e);
    }
}
