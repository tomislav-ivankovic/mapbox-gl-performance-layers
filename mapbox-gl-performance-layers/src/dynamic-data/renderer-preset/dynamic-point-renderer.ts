import {Point} from 'geojson';
import {DynamicRenderer} from '../renderer/dynamic-renderer';
import {PointStyle} from '../../styles';
import {SimplePointShader} from '../../shader/point/simple-point-shader';
import {FancyPointShader} from '../../shader/point/fancy-point-shader';
import {simplePointToVertexArray} from '../vertex-data-mapper/simple-point-to-vertex-array';
import {fancyPointToVertexArray} from '../vertex-data-mapper/fancy-point-to-vertex-array';
import {DynamicShaderRenderer} from '../renderer/dynamic-shader-renderer';

export interface DynamicPointRendererOptions<P> {
    simpleRendering?: boolean;
    interpolation?: number;
}

export function dynamicPointRenderer<P>(
    options: DynamicPointRendererOptions<P>
): DynamicRenderer<Point, P, PointStyle> {
    const isSimple = options.simpleRendering != null && options.simpleRendering;
    const shader = isSimple ? new SimplePointShader(options.interpolation) : new FancyPointShader(options.interpolation);
    const dataMapper = isSimple ? simplePointToVertexArray : fancyPointToVertexArray;
    return new DynamicShaderRenderer(shader, dataMapper);
}
