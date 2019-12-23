import {ClickProvider} from './click-provider';
import {Feature, FeatureCollection, Polygon} from 'geojson';
import {FeatureTree} from './feature-tree';
import {EventData, MapMouseEvent} from 'mapbox-gl';
import {addPolygonCollectionBoundingBoxes, isPointInPolygon} from '../../geometry-functions';

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
        addPolygonCollectionBoundingBoxes(data);
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
