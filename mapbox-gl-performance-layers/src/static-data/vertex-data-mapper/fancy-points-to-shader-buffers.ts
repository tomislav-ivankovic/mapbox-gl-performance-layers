import {FeatureCollection} from 'geojson';
import {Point} from 'geojson';
import {PointStyle, resolvePointStyle, StyleOption} from '../../shared/styles';
import {transformX, transformY} from '../../shared/geometry-functions';
import {ShaderBuffers} from './vertex-data-mapper';

export function fancyPointsToShaderBuffers<P>(
    data: FeatureCollection<Point, P>,
    styleOption: StyleOption<Point, P, PointStyle>
): ShaderBuffers {
    const array: number[] = [];
    for (const feature of data.features) {
        const style = resolvePointStyle(feature, styleOption);
        const coords = feature.geometry.coordinates;
        array.push(
            transformX(coords[0]), transformY(coords[1]),
            style.size,
            style.color.r, style.color.g, style.color.b, style.opacity,
            style.outlineSize,
            style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
        );
    }
    return {
        array: new Float32Array(array),
        elementArray: null
    };
}
