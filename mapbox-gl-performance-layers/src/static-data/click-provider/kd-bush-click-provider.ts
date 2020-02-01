import {Feature} from 'geojson';
import {FeatureCollection} from 'geojson';
import {MultiPoint} from 'geojson';
import {Point} from 'geojson';
import {EventData} from 'mapbox-gl';
import {MapMouseEvent} from 'mapbox-gl';
import {ClickProvider} from './click-provider';
import {PointClickHandler} from '../../shared/click-handler/point-click-handler';
import {resolveVisibility, Visibility} from '../../shared/visibility';
import {pointToPointDistanceSqr} from '../../shared/geometry-functions';
import KDBush from 'kdbush';

interface PackedFeature<G extends Point | MultiPoint, P> {
    feature: Feature<G, P>;
    x: number;
    y: number;
}

export class KdBushClickProvider<G extends Point | MultiPoint, P> implements ClickProvider<G, P> {
    private map: mapboxgl.Map | null = null;
    private data: PackedFeature<G, P>[] | null = null;
    private index: KDBush<PackedFeature<G, P>> | null = null;
    private visibility: Visibility = true;

    constructor(
        private onClick: PointClickHandler<G, P>,
        private clickSize?: number
    ) {
    }

    setData(data: FeatureCollection<G, P>): void {
        const packedData: PackedFeature<G, P>[] = [];
        for (const feature of data.features) {
            if (feature.geometry.type === 'Point') {
                const coords = (feature.geometry as Point).coordinates;
                const packed: PackedFeature<G, P> = {
                    feature: feature,
                    x: coords[0],
                    y: coords[1]
                };
                packedData.push(packed);
            } else if (feature.geometry.type === 'MultiPoint') {
                const multiPoint = feature.geometry as MultiPoint;
                for (const coords of multiPoint.coordinates) {
                    const packed: PackedFeature<G, P> = {
                        feature: feature,
                        x: coords[0],
                        y: coords[1]
                    };
                    packedData.push(packed);
                }
            }
        }
        this.data = packedData;
        this.index = new KDBush(packedData, p => p.x, p => p.y, 64, Float64Array);
    }

    clearData(): void {
        this.index = null;
        this.data = null;
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
        if (this.map == null || this.data == null || this.index == null) {
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
        const indices = this.index.range(
            x - 0.5 * w,
            y - 0.5 * h,
            x + 0.5 * w,
            y + 0.5 * h
        );
        if (indices.length === 0) {
            return;
        }
        let closestResultIndex = indices[0];
        let minDistanceSqr = Infinity;
        for (const i of indices) {
            const result = this.data[i];
            const distanceSqr = pointToPointDistanceSqr(x, y, result.x, result.y);
            if (distanceSqr < minDistanceSqr) {
                closestResultIndex = i;
                minDistanceSqr = distanceSqr;
            }
        }
        const size = Math.max(w, h);
        const clickDistanceSqr = 0.25 * (size * size);
        if (minDistanceSqr <= clickDistanceSqr) {
            this.onClick(this.data[closestResultIndex].feature, e);
        }
    }
}


