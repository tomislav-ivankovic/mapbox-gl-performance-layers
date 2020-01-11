import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import {PointStyle} from '../../shared/styles';
import {Renderer} from '../renderer/renderer';
import {FancyPointShader} from '../../shared/shader/point/fancy-point-shader';
import {SimplePointShader} from '../../shared/shader/point/simple-point-shader';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {TiledRenderer} from '../renderer/tiled-renderer';
import {simplePointsToShaderBuffers} from '../vertex-data-mapper/simple-points-to-shader-buffers';
import {fancyPointsToShaderBuffers} from '../vertex-data-mapper/fancy-points-to-shader-buffers';
import {TileRendererOptions} from '../../shared/tile/tile-renderer';

export interface PointRendererOptions<P> extends TileRendererOptions {
    simpleRendering?: boolean;
    interpolation?: number;
    tileThreshold?: number;
}

export function pointRenderer<G extends Point | MultiPoint, P>(
    options: PointRendererOptions<P>
): Renderer<G, P, PointStyle> {
    const isSimple = options.simpleRendering != null && options.simpleRendering;
    const shader = isSimple ? new SimplePointShader(options.interpolation) : new FancyPointShader(options.interpolation);
    const dataMapper = isSimple ? simplePointsToShaderBuffers : fancyPointsToShaderBuffers;
    const threshold = options.tileThreshold != null ? options.tileThreshold : 100000;
    return new SwitchRenderer([
        {
            renderer: new ShaderRenderer(shader, dataMapper),
            condition: data => data.features.length < threshold
        },
        {
            renderer: new TiledRenderer(
                new ShaderRenderer(shader, dataMapper),
                options
            ),
            condition: data => data.features.length >= threshold
        }
    ]);
}
