import {FeatureCollection, LineString} from 'geojson';
import {ShaderBuffers} from '../shader';
import {DefaultShader} from '../default/default-shader';
import {LineStyle, resolveLineStyle, StyleOption} from '../styles';
import {transformX, transformY} from '../../../geometry-functions';

export class SimpleLineShader<P> extends DefaultShader<LineString, P, LineStyle> {
    dataToArrays(
        data: FeatureCollection<LineString, P>,
        styleOption: StyleOption<LineString, P, LineStyle>
    ): ShaderBuffers {
        const array: number[] = [];
        const elementsArray: number[] = [];
        let currentIndex = 0;
        for (const feature of data.features) {
            const style = resolveLineStyle(feature, styleOption);
            for (let i = 0; i < feature.geometry.coordinates.length; i++) {
                const coords = feature.geometry.coordinates[i];
                array.push(
                    transformX(coords[0]), transformY(coords[1]),
                    style.color.r, style.color.g, style.color.b, style.opacity
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
