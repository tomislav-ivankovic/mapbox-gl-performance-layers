import {Point} from 'geojson';
import {DynamicRenderer} from '../renderer/dynamic-renderer';
import {PointStyle} from '../../shared/styles';
import {SimplePointShader} from '../../shared/shader/point/simple-point-shader';
import {FancyPointShader} from '../../shared/shader/point/fancy-point-shader';
import {simplePointToVertexArray} from '../vertex-data-mapper/simple-point-to-vertex-array';
import {fancyPointToVertexArray} from '../vertex-data-mapper/fancy-point-to-vertex-array';
import {DynamicShaderRenderer} from '../renderer/dynamic-shader-renderer';
import {DynamicSwitchRenderer} from '../renderer/dynamic-switch-renderer';
import {findPointBounds, findPointsBounds} from '../../shared/geometry-functions';
import {DynamicTiledRenderer} from '../renderer/dynamic-tiled-renderer';
import {TileRendererOptions} from '../../shared/tile/tile-renderer';

export interface DynamicPointRendererOptions<P> extends TileRendererOptions {
    simpleRendering?: boolean;
    interpolation?: number;
    tileThreshold?: number;
}

export function dynamicPointRenderer<P>(
    options: DynamicPointRendererOptions<P>
): DynamicRenderer<Point, P, PointStyle> {
    const isSimple = options.simpleRendering != null && options.simpleRendering;
    const shaderRenderer: DynamicRenderer<Point, P, PointStyle> = isSimple ?
        new DynamicShaderRenderer(new SimplePointShader(options.interpolation), simplePointToVertexArray) :
        new DynamicShaderRenderer(new FancyPointShader(options.interpolation), fancyPointToVertexArray);
    const threshold = options.tileThreshold != null ? options.tileThreshold : 100000;
    return new DynamicSwitchRenderer([
        {
            renderer: shaderRenderer,
            condition: o => o.getArray().length < threshold
        },
        {
            renderer: new DynamicTiledRenderer(
                shaderRenderer,
                findPointsBounds,
                findPointBounds,
                options
            ),
            condition: o => o.getArray().length >= threshold
        }
    ]);
}
