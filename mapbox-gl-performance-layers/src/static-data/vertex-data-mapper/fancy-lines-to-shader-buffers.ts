import {FeatureCollection} from 'geojson';
import {LineString} from 'geojson';
import {MultiLineString} from 'geojson';
import {LineStyle, resolveLineStyle, StyleOption} from '../../shared/styles';
import {cosOfPointsAngle, transformX, transformY} from '../../shared/geometry-functions';
import {ShaderBuffers} from './vertex-data-mapper';

export function fancyLinesToShaderBuffers<G extends LineString | MultiLineString, P>(
    data: FeatureCollection<G, P>,
    styleOption: StyleOption<G, P, LineStyle>
): ShaderBuffers {
    const array: number[] = [];
    const elementArray: number[] = [];
    let currentIndex = 0;

    function processSingleLine(coords: number[][], style: LineStyle) {
        if (coords.length < 2) {
            return;
        }
        for (let i = 0; i < coords.length; i++) {
            const currentX = transformX(coords[i][0]);
            const currentY = transformY(coords[i][1]);
            let previousX: number, previousY: number, nextX: number, nextY: number;
            if (i === 0) {
                nextX = transformX(coords[i + 1][0]);
                nextY = transformY(coords[i + 1][1]);
                previousX = 2 * currentX - nextX;
                previousY = 2 * currentY - nextY;
            } else if (i === coords.length - 1) {
                previousX = transformX(coords[i - 1][0]);
                previousY = transformY(coords[i - 1][1]);
                nextX = 2 * currentX - previousX;
                nextY = 2 * currentY - previousY;
            } else {
                previousX = transformX(coords[i - 1][0]);
                previousY = transformY(coords[i - 1][1]);
                nextX = transformX(coords[i + 1][0]);
                nextY = transformY(coords[i + 1][1]);
            }
            const cosAngle = cosOfPointsAngle(previousX, previousY, currentX, currentY, nextX, nextY);
            if (cosAngle < 0.8) {
                array.push(
                    previousX, previousY,
                    currentX, currentY,
                    nextX, nextY,
                    style.size,
                    style.outlineSize,
                    style.color.r, style.color.g, style.color.b, style.opacity,
                    style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
                    ,
                    previousX, previousY,
                    currentX, currentY,
                    nextX, nextY,
                    -style.size,
                    -style.outlineSize,
                    style.color.r, style.color.g, style.color.b, style.opacity,
                    style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
                );
                if (i !== 0) {
                    elementArray.push(
                        currentIndex, currentIndex - 2, currentIndex - 1,
                        currentIndex, currentIndex - 1, currentIndex + 1
                    );
                }
                currentIndex += 2;
            } else {
                const fakePreviousX = 2 * currentX - nextX;
                const fakePreviousY = 2 * currentY - nextY;
                const fakeNextX = 2 * currentX - previousX;
                const fakeNextY = 2 * currentY - previousY;
                array.push(
                    previousX, previousY,
                    currentX, currentY,
                    fakeNextX, fakeNextY,
                    style.size,
                    style.outlineSize,
                    style.color.r, style.color.g, style.color.b, style.opacity,
                    style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
                    ,
                    previousX, previousY,
                    currentX, currentY,
                    fakeNextX, fakeNextY,
                    -style.size,
                    -style.outlineSize,
                    style.color.r, style.color.g, style.color.b, style.opacity,
                    style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
                    ,
                    fakePreviousX, fakePreviousY,
                    currentX, currentY,
                    nextX, nextY,
                    style.size,
                    style.outlineSize,
                    style.color.r, style.color.g, style.color.b, style.opacity,
                    style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
                    ,
                    fakePreviousX, fakePreviousY,
                    currentX, currentY,
                    nextX, nextY,
                    -style.size,
                    -style.outlineSize,
                    style.color.r, style.color.g, style.color.b, style.opacity,
                    style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
                );
                if (i !== 0) {
                    elementArray.push(
                        currentIndex, currentIndex - 2, currentIndex - 1,
                        currentIndex, currentIndex - 1, currentIndex + 1
                    );
                }
                currentIndex += 4;
            }
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
        elementArray: new Int32Array(elementArray)
    };
}
