import {FeatureCollection} from 'geojson';
import {Polygon} from 'geojson';
import {MultiPolygon} from 'geojson';
import {PolygonStyle, resolvePolygonStyle, StyleOption} from '../../shared/styles';
import {transformX, transformY} from '../../shared/geometry-functions';
import {ShaderBuffers} from './vertex-data-mapper';
import earcut from 'earcut';

export function simplePolygonsToShaderBuffers<G extends Polygon | MultiPolygon, P>(
    data: FeatureCollection<G, P>,
    styleOption: StyleOption<G, P, PolygonStyle>
): ShaderBuffers {
    const array: number[] = [];
    const elementArray: number[] = [];
    let indexOffset = 0;

    function processSinglePolygon(coordinates: number[][][], style: PolygonStyle) {
        const transformedCoordinates = coordinates.map(c =>
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

    for (const feature of data.features) {
        const style = resolvePolygonStyle(feature, styleOption);
        if (feature.geometry.type === 'Polygon') {
            const geometry = feature.geometry as Polygon;
            processSinglePolygon(geometry.coordinates, style);
        } else if (feature.geometry.type === 'MultiPolygon') {
            const geometry = feature.geometry as MultiPolygon;
            for (const coords of geometry.coordinates) {
                processSinglePolygon(coords, style);
            }
        }
    }

    return {
        array: new Float32Array(array),
        elementArray: new Int32Array(elementArray)
    };
}
