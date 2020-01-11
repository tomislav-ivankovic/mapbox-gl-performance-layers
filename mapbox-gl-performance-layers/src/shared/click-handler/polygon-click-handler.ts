import {Feature} from 'geojson';
import {Polygon} from 'geojson';
import {MultiPolygon} from 'geojson';
import {EventData} from 'mapbox-gl';
import {MapMouseEvent} from 'mapbox-gl';
import {PackedFeature, isPointInPolygon} from '../geometry-functions';
import {ResultsClickHandler} from './results-click-handler';

export type PolygonClickHandler<G extends Polygon | MultiPolygon, P> =
    (feature: Feature<G, P>, e: MapMouseEvent & EventData) => void

export function polygonToResultsClickHandler<G extends Polygon | MultiPolygon, P>(
    onClick: PolygonClickHandler<G, P>
): ResultsClickHandler<G, P> {
    return function (
        x: number,
        y: number,
        size: number,
        results: PackedFeature<G, P>[],
        e: MapMouseEvent & EventData
    ) {
        let closestResult : PackedFeature<G, P> | null = null;
        let closestIndex = -1;
        for (const result of results) {
            if (result.index > closestIndex && isPointInPolygon(x, y, result.feature.geometry)) {
                closestResult = result;
                closestIndex = result.index;
            }
        }
        if (closestResult != null) {
            onClick(closestResult.feature, e);
        }
    };
}
