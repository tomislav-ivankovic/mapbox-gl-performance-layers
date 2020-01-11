import {FeatureCollection} from 'geojson';
import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import {PointStyle, resolvePointStyle, StyleOption} from '../../shared/styles';
import {transformX, transformY} from '../../shared/geometry-functions';
import {ShaderBuffers} from './vertex-data-mapper';

export function fancyPointsToShaderBuffers<G extends Point | MultiPoint, P>(
    data: FeatureCollection<G, P>,
    styleOption: StyleOption<G, P, PointStyle>
): ShaderBuffers {
    const array: number[] = [];

    function processSinglePoint(coords: number[], style: PointStyle) {
        array.push(
            transformX(coords[0]), transformY(coords[1]),
            style.size,
            style.color.r, style.color.g, style.color.b, style.opacity,
            style.outlineSize,
            style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
        );
    }

    const style: PointStyle = {} as any;
    for (const feature of data.features) {
        resolvePointStyle(style, feature, styleOption);
        if (feature.geometry.type === 'Point') {
            const geometry = feature.geometry as Point;
            processSinglePoint(geometry.coordinates, style);
        } else if (feature.geometry.type === 'MultiPoint') {
            const geometry = feature.geometry as MultiPoint;
            for (const coords of geometry.coordinates) {
                processSinglePoint(coords, style);
            }
        }
    }

    return {
        array: new Float32Array(array),
        elementArray: null
    };
}
