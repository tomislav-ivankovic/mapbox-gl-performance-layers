import {Feature} from 'geojson';
import {MultiPoint} from 'geojson';
import {Point} from 'geojson';
import {EventData} from 'mapbox-gl';
import {MapMouseEvent} from 'mapbox-gl';
import {PackedFeature, pointToMultiPointDistanceSqr} from '../geometry-functions';
import {ResultsClickHandler} from './results-click-handler';

export type PointClickHandler<G extends Point | MultiPoint, P> =
    (feature: Feature<G, P>, e: MapMouseEvent & EventData) => void;

export function pointToResultsClickHandler<G extends Point | MultiPoint, P>(
    onClick: (feature: Feature<G, P>, e: MapMouseEvent & EventData) => void
): ResultsClickHandler<G, P> {
    return function (
        x: number,
        y: number,
        size: number,
        results: PackedFeature<G, P>[],
        e: MapMouseEvent & EventData
    ): void {
        let closestResult = results[0];
        let minDistanceSqr = Infinity;
        for (const result of results) {
            const distanceSqr = pointToMultiPointDistanceSqr(x, y, result.feature.geometry);
            if (distanceSqr < minDistanceSqr) {
                closestResult = result;
                minDistanceSqr = distanceSqr;
            }
        }
        const clickDistanceSqr = 0.25 * (size * size);
        if (minDistanceSqr <= clickDistanceSqr) {
            onClick(closestResult.feature, e);
        }
    };
}
