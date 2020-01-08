import {FeatureCollection} from 'geojson';
import {LineString} from 'geojson';
import {MultiLineString} from 'geojson';
import {LineStyle, resolveLineStyle, StyleOption} from '../../shared/styles';
import {transformX, transformY} from '../../shared/geometry-functions';
import {ShaderBuffers} from './vertex-data-mapper';

export function simpleLinesToShaderBuffers<G extends LineString | MultiLineString, P>(
    data: FeatureCollection<G, P>,
    styleOption: StyleOption<G, P, LineStyle>
): ShaderBuffers {
    const array: number[] = [];
    const elementsArray: number[] = [];
    let currentIndex = 0;

    function processSingleLine(coordinates: number[][], style: LineStyle) {
        for (let i = 0; i < coordinates.length; i++) {
            const coords = coordinates[i];
            array.push(
                transformX(coords[0]), transformY(coords[1]),
                style.color.r, style.color.g, style.color.b, style.opacity
            );
            if (i === 0 || i === coordinates.length - 1) {
                elementsArray.push(currentIndex);
            } else {
                elementsArray.push(currentIndex, currentIndex);
            }
            currentIndex++;
        }
    }

    for (const feature of data.features) {
        const style = resolveLineStyle(feature, styleOption);
        if (feature.geometry.type === 'LineString') {
            const geometry = feature.geometry as LineString;
            processSingleLine(geometry.coordinates, style);
        } else if (feature.geometry.type === 'MultiLineString') {
            const geometry = feature.geometry as MultiLineString;
            for (const coords of geometry.coordinates) {
                processSingleLine(coords, style);
            }
        }
    }

    return {
        array: new Float32Array(array),
        elementArray: new Int32Array(elementsArray)
    };
}
