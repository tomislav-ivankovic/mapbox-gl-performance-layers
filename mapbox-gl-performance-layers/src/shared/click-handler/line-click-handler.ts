import {Feature} from 'geojson';
import {LineString} from 'geojson';
import {MultiLineString} from 'geojson';
import {EventData} from 'mapbox-gl';
import {MapMouseEvent} from 'mapbox-gl';
import {
    closestPointOnLine, PackedFeature,
    pointToPointDistanceSqr
} from '../geometry-functions';
import {ResultsClickHandler} from './results-click-handler';

export type LineClickHandler<G extends LineString | MultiLineString, P> =
    (feature: Feature<G, P>, e: MapMouseEvent & EventData, closestPointOnLine: { x: number, y: number }) => void;

export function lineToResultsClickHandler<G extends LineString | MultiLineString, P>(
    onClick: LineClickHandler<G, P>
): ResultsClickHandler<G, P> {
    return function (
        x: number,
        y: number,
        size: number,
        results: PackedFeature<G, P>[],
        e: MapMouseEvent & EventData
    ) {
        let closestResult = results[0];
        let minDistanceSqr = Infinity;
        let closestPoint = {x: 0, y: 0};
        for (const result of results) {
            const point = closestPointOnLine(x, y, result.feature.geometry);
            const distanceSqr = pointToPointDistanceSqr(x, y, point.x, point.y);
            if (distanceSqr < minDistanceSqr) {
                closestResult = result;
                minDistanceSqr = distanceSqr;
                closestPoint = point;
            }
        }
        const clickDistanceSqr = 0.25 * (size * size);
        if (minDistanceSqr <= clickDistanceSqr) {
            onClick(closestResult.feature, e, closestPoint);
        }
    };
}
