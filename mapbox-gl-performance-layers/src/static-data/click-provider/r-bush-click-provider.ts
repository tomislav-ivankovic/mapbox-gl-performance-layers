import {FeatureCollection} from 'geojson';
import {Geometry} from 'geojson';
import {EventData} from 'mapbox-gl';
import {MapMouseEvent} from 'mapbox-gl';
import RBush from 'rbush';
import {ClickProvider} from './click-provider';
import {PackedFeature, packFeature} from '../../shared/geometry-functions';
import {resolveVisibility, Visibility} from '../../shared/visibility';
import {ResultsClickHandler} from '../../shared/click-handler/results-click-handler';

export class RBushClickProvider<G extends Geometry, P> implements ClickProvider<G, P> {
    private map: mapboxgl.Map | null = null;
    private tree: RBush<PackedFeature<G, P>> | null = null;
    private visibility: Visibility = true;

    constructor(
        private resultsHandler: ResultsClickHandler<G, P>,
        private clickSize?: number
    ){
    }

    setData(data: FeatureCollection<G, P>): void {
        const packedData = data.features.map((feature, index) => packFeature(feature, index));
        this.tree = new RBush();
        this.tree.load(packedData);
    }

    clearData(): void {
        this.tree = null;
    }

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


