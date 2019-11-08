import {ShaderBuffers} from '../shader';
import {Feature, FeatureCollection, Polygon} from 'geojson';
import {MercatorCoordinate} from 'mapbox-gl';
import {DefaultShader} from '../default/default-shader';
import {defaultPolygonStyle, PolygonStyle} from '../../renderer-presets/polygon-renderer';
import earcut from 'earcut';

export class PolygonFillShader<P> extends DefaultShader<FeatureCollection<Polygon, P>> {
    constructor(
        private style?: (feature: Feature<Polygon, P>) => Partial<PolygonStyle>,
    ) {
        super();
    }

    dataToArrays(data: FeatureCollection<Polygon, P>): ShaderBuffers {
        const array: number[] = [];
        const elementArray: number[] = [];
        let indexOffset = 0;
        for (const feature of data.features) {
            const style = this.style != null ? {...defaultPolygonStyle, ...this.style(feature)} : defaultPolygonStyle;
            const transformedCoordinates = feature.geometry.coordinates.map(c => c.map(coords => {
                const transformed = MercatorCoordinate.fromLngLat({lon: coords[0], lat: coords[1]}, 0);
                return [transformed.x, transformed.y];
            }));
            const data = earcut.flatten(transformedCoordinates);
            for (let i = 0; i < data.vertices.length; i += 2) {
                array.push(
                    data.vertices[i], data.vertices[i + 1],
                    style.color.r, style.color.g, style.color.b, style.color.a
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

    getPrimitiveType(gl: WebGLRenderingContext): number {
        return gl.TRIANGLES;
    }
}
