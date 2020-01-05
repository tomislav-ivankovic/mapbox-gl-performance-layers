import {Feature, Point} from 'geojson';
import {PointStyle, resolvePointStyle, StyleOption} from '../../styles';
import {transformX, transformY} from '../../geometry-functions';

export function simplePointToVertexArray<P>(
    feature: Feature<Point, P>,
    styleOption: StyleOption<Point, P, PointStyle>
): number[] {
    const coords = feature.geometry.coordinates;
    const style = resolvePointStyle(feature, styleOption);
    return [
        transformX(coords[0]), transformY(coords[1]),
        style.size,
        style.color.r, style.color.g, style.color.b, style.opacity
    ];
}
