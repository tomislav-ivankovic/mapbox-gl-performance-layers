import {FeatureCollection, Point} from 'geojson';
import {PointStyle, resolvePointStyle, StyleOption} from '../../styles';
import {transformX, transformY} from '../../geometry-functions';
import {ShaderBuffers} from './vertex-data-mapper';

export function simplePointsToShaderBuffers<P>(
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
            style.color.r, style.color.g, style.color.b, style.opacity
        );
    }
    return {
        array: new Float32Array(array),
        elementArray: null
    };
}
