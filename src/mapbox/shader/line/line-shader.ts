import {Feature, FeatureCollection, LineString} from 'geojson';
import {ShaderBuffers} from '../shader';
import {MercatorCoordinate} from 'mapbox-gl';
import {Color} from '../../misc';
import {DefaultShader} from '../default/default-shader';

export interface LineStyle {
    size: number;
    color: Color;
    outlineSize: number;
    outlineColor: Color;
}

const defaultStyle: LineStyle = {
    size: 5,
    color: {r: 0, g: 0, b: 1, a: 1},
    outlineSize: 1,
    outlineColor: {r: 0, g: 0, b: 0, a: 1}
};

export class LineShader<P> extends DefaultShader<FeatureCollection<LineString, P>> {
    constructor(
        private style?: (feature: Feature<LineString, P>) => Partial<LineStyle>
    ) {
        super();
    }

    dataToArrays(data: FeatureCollection<LineString, P>): ShaderBuffers {
        const array: number[] = [];
        const elementsArray: number[] = [];
        let currentIndex = 0;
        for (const feature of data.features) {
            const style = this.style != null ? {...defaultStyle, ...this.style(feature)} : defaultStyle;
            for (let i = 0; i < feature.geometry.coordinates.length; i++) {
                const coords = feature.geometry.coordinates[i];
                const transformed = MercatorCoordinate.fromLngLat({lon: coords[0], lat: coords[1]}, 0);
                array.push(
                    transformed.x, transformed.y,
                    style.color.r, style.color.g, style.color.b, style.color.a,
                );
                if (i === 0 || i === feature.geometry.coordinates.length - 1) {
                    elementsArray.push(currentIndex);
                } else {
                    elementsArray.push(currentIndex, currentIndex);
                }
                currentIndex++;
            }
        }
        return {
            array: new Float32Array(array),
            elementArray: new Int32Array(elementsArray)
        };
    }

    getPrimitiveType(gl: WebGLRenderingContext): number {
        return gl.LINES;
    }
}
