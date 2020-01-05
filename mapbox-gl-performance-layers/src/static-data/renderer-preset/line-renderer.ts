import {LineString} from 'geojson';
import {LineStyle} from '../../styles';
import {Renderer} from '../renderer/renderer';
import {FancyLineShader} from '../../shader/line/fancy-line-shader';
import {SimpleLineShader} from '../../shader/line/simple-line-shader';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {TiledRenderer, TiledRendererOptions} from '../renderer/tiled/tiled-renderer';
import {findLineStringCollectionBounds} from '../../geometry-functions';
import {simpleLinesToShaderBuffers} from '../vertex-data-mapper/simple-lines-to-shader-buffers';
import {fancyLinesToShaderBuffers} from '../vertex-data-mapper/fancy-lines-to-shader-buffers';

export interface LineRendererOptions<P> extends TiledRendererOptions {
    simpleRendering?: boolean;
    interpolation?: number;
    tileThreshold?: number;
}

export function lineRenderer<P>(options: LineRendererOptions<P>): Renderer<LineString, P, LineStyle> {
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
                findLineStringCollectionBounds,
                options
            ),
            condition: data => data.features.length >= threshold
        }
    ]);
}
