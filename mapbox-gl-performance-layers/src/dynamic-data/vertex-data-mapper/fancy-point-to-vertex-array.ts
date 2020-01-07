import {Feature} from 'geojson';
import {Point} from 'geojson';
import {PointStyle, resolvePointStyle, StyleOption} from '../../shared/styles';
import {transformX, transformY} from '../../shared/geometry-functions';

export function fancyPointToVertexArray<P>(
    feature: Feature<Point, P>,
    styleOption: StyleOption<Point, P, PointStyle>
): number[] {
    const coords = feature.geometry.coordinates;
    const style = resolvePointStyle(feature, styleOption);
    return [
        transformX(coords[0]), transformY(coords[1]),
        style.size,
        style.color.r, style.color.g, style.color.b, style.opacity,
        style.outlineSize,
        style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
    ];
}
