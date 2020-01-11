import {Feature} from 'geojson';
import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import {PointStyle, resolvePointStyle, StyleOption} from '../../shared/styles';
import {transformX, transformY} from '../../shared/geometry-functions';

const style: PointStyle = {} as any;

export function simplePointToVertexArray<G extends Point | MultiPoint, P>(
    feature: Feature<G, P>,
    styleOption: StyleOption<G, P, PointStyle>
): number[] {
    const array: number[] = [];
    resolvePointStyle(style, feature, styleOption);

    function processSinglePoint(coords: number[]) {
        array.push(
            transformX(coords[0]), transformY(coords[1]),
            style.size,
            style.color.r, style.color.g, style.color.b, style.opacity
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
