import {FeatureCollection, Polygon} from 'geojson';
import {PolygonStyle, resolvePolygonStyle, StyleOption} from '../../shared/styles';
import {transformX, transformY} from '../../shared/geometry-functions';
import {ShaderBuffers} from './vertex-data-mapper';
import earcut from 'earcut';

export function simplePolygonsToShaderBuffers<P>(
    data: FeatureCollection<Polygon, P>,
    styleOption: StyleOption<Polygon, P, PolygonStyle>
): ShaderBuffers {
    const array: number[] = [];
    const elementArray: number[] = [];
    let indexOffset = 0;
    for (const feature of data.features) {
        const style = resolvePolygonStyle(feature, styleOption);
        const transformedCoordinates = feature.geometry.coordinates.map(c =>
            c.map(coords => [transformX(coords[0]), transformY(coords[1])])
        );
        const data = earcut.flatten(transformedCoordinates);
        for (let i = 0; i < data.vertices.length; i += 2) {
            array.push(
                data.vertices[i], data.vertices[i + 1],
                style.color.r, style.color.g, style.color.b, style.opacity
            );
        }
        const triangles = earcut(data.vertices, data.holes, data.dimensions);
        for (const index of triangles) {
            elementArray.push(index + indexOffset);
        }
        indexOffset += data.vertices.length / 2;
    }
    return {
        array: new Float32Array(array),
        elementArray: new Int32Array(elementArray)
    };
}
