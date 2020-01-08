import {LineString} from 'geojson';
import {MultiLineString} from 'geojson';
import {LineStyle} from '../../shared/styles';
import {Renderer} from '../renderer/renderer';
import {FancyLineShader} from '../../shared/shader/line/fancy-line-shader';
import {SimpleLineShader} from '../../shared/shader/line/simple-line-shader';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {TiledRenderer} from '../renderer/tiled-renderer';
import {findLinesBounds} from '../../shared/geometry-functions';
import {simpleLinesToShaderBuffers} from '../vertex-data-mapper/simple-lines-to-shader-buffers';
import {fancyLinesToShaderBuffers} from '../vertex-data-mapper/fancy-lines-to-shader-buffers';
import {TileRendererOptions} from '../../shared/tile/tile-renderer';

export interface LineRendererOptions<P> extends TileRendererOptions {
    simpleRendering?: boolean;
    interpolation?: number;
    tileThreshold?: number;
}

export function lineRenderer<G extends LineString | MultiLineString, P>(
    options: LineRendererOptions<P>
): Renderer<G, P, LineStyle> {
    const isSimple = options.simpleRendering != null && options.simpleRendering;
    const shader = isSimple ? new SimpleLineShader() : new FancyLineShader(options.interpolation);
    const dataMapper = isSimple ? simpleLinesToShaderBuffers : fancyLinesToShaderBuffers;
    const threshold = options.tileThreshold != null ? options.tileThreshold : 10000;
    return new SwitchRenderer([
        {
            renderer: new ShaderRenderer(shader, dataMapper),
            condition: data => data.features.length < threshold
        },
        {
            renderer: new TiledRenderer(
                new ShaderRenderer(shader, dataMapper),
                findLinesBounds,
                options
            ),
            condition: data => data.features.length >= threshold
        }
    ]);
}
