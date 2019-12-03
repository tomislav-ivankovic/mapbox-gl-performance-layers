import {Feature, FeatureCollection, LineString} from 'geojson';
import {ShaderBuffers, transformX, transformY} from '../shader';
import {DefaultShader} from '../default/default-shader';
import {defaultLineStyle, LineStyle} from '../../renderer-presets/line-renderer';

export class SimpleLineShader<P> extends DefaultShader<FeatureCollection<LineString, P>> {
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
            const style = this.style != null ? {...defaultLineStyle, ...this.style(feature)} : defaultLineStyle;
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
