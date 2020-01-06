import {FeatureCollection, Polygon} from 'geojson';
import {PolygonStyle, resolvePolygonStyle, StyleOption} from '../../shared/styles';
import {cosOfPointsAngle, transformX, transformY} from '../../shared/geometry-functions';
import {ShaderBuffers} from './vertex-data-mapper';
import earcut from 'earcut';

export function fancyPolygonsToShaderBuffers<P>(
    data: FeatureCollection<Polygon, P>,
    styleOption: StyleOption<Polygon, P, PolygonStyle>
): ShaderBuffers {
    const array: number[] = [];
    const elementArray: number[] = [];
    const indexMapper: number[] = [];
    let currentIndex = 0;
    for (const feature of data.features) {
        const style = resolvePolygonStyle(feature, styleOption);
        const transformedCoords = feature.geometry.coordinates.map(c =>
            c.map(coords => [transformX(coords[0]), transformY(coords[1])])
        );
        indexMapper.length = 0;
        for (const coords of transformedCoords) {
            for (let i = 0; i < coords.length; i++) {
                const previousIndex = i - 1 >= 0 ? i - 1 : coords.length - 2;
                const nextIndex = i + 1 < coords.length ? i + 1 : 1;
                const currentX = coords[i][0];
                const currentY = coords[i][1];
                const previousX = coords[previousIndex][0];
                const previousY = coords[previousIndex][1];
                const nextX = coords[nextIndex][0];
                const nextY = coords[nextIndex][1];
                const cosAngle = cosOfPointsAngle(previousX, previousY, currentX, currentY, nextX, nextY);
                if (cosAngle < 0.8) {
                    array.push(
                        previousX, previousY,
                        currentX, currentY,
                        nextX, nextY,
                        style.outlineSize,
                        0,
                        style.color.r, style.color.g, style.color.b, style.opacity,
                        style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
                        ,
                        previousX, previousY,
                        currentX, currentY,
                        nextX, nextY,
                        style.outlineSize,
                        1,
                        style.color.r, style.color.g, style.color.b, style.opacity,
                        style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
                    );
                    if (i !== 0) {
                        elementArray.push(
                            currentIndex, currentIndex - 2, currentIndex - 1,
                            currentIndex, currentIndex - 1, currentIndex + 1
                        );
                    }
                    indexMapper.push(currentIndex);
                    currentIndex += 2;
                }
                else {
                    const fakePreviousX = 2 * currentX - nextX;
                    const fakePreviousY = 2 * currentY - nextY;
                    const fakeNextX = 2 * currentX - previousX;
                    const fakeNextY = 2 * currentY - previousY;
                    array.push(
                        previousX, previousY,
                        currentX, currentY,
                        fakeNextX, fakeNextY,
                        style.outlineSize,
                        1,
                        style.color.r, style.color.g, style.color.b, style.opacity,
                        style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
                        ,
                        previousX, previousY,
                        currentX, currentY,
                        nextX, nextY,
                        style.outlineSize,
                        0,
                        style.color.r, style.color.g, style.color.b, style.opacity,
                        style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
                        ,
                        fakePreviousX, fakePreviousY,
                        currentX, currentY,
                        nextX, nextY,
                        style.outlineSize,
                        1,
                        style.color.r, style.color.g, style.color.b, style.opacity,
                        style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineOpacity
                    );
                    if (i !== 0) {
                        elementArray.push(
                            currentIndex + 1, currentIndex - 2, currentIndex - 1,
                            currentIndex + 1, currentIndex - 1, currentIndex,
                            currentIndex, currentIndex + 1, currentIndex + 2
                        );
                    }
                    indexMapper.push(currentIndex + 1);
                    currentIndex += 3;
                }
            }
        }
        const data = earcut.flatten(transformedCoords);
        const triangles = earcut(data.vertices, data.holes, data.dimensions);
        for (const index of triangles) {
            elementArray.push(indexMapper[index]);
        }
    }
    return {
        array: new Float32Array(array),
        elementArray: new Int32Array(elementArray)
    };
}
