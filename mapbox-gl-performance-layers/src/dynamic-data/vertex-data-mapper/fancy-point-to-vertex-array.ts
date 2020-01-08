import {Feature} from 'geojson';
import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import {PointStyle, resolvePointStyle, StyleOption} from '../../shared/styles';
import {transformX, transformY} from '../../shared/geometry-functions';

export function fancyPointToVertexArray<G extends Point | MultiPoint, P>(
    feature: Feature<G, P>,
    styleOption: StyleOption<G, P, PointStyle>
): number[] {
    const array: number[] = [];
    const style = resolvePointStyle(feature, styleOption);

    function processSinglePoint(coords: number[]) {
        array.push(
            transformX(coords[0]), transformY(coords[1]),
            style.size,
            style.color.r, style.color.g, style.color.b, style.opacity,
            style.outlineSize,
            style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
        );
    }

    if (feature.geometry.type === 'Point') {
        const geometry = feature.geometry as Point;
        processSinglePoint(geometry.coordinates);
    } else if (feature.geometry.type === 'MultiPoint') {
        const geometry = feature.geometry as MultiPoint;
        for (const coords of geometry.coordinates) {
            processSinglePoint(coords);
        }
    }

    return array;
}
