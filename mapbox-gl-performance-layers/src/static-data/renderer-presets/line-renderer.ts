import {LineString} from 'geojson';
import {LineStyle} from '../../styles';
import {Renderer} from '../renderer/renderer';
import {FancyLineShader} from '../shader/line/fancy-line-shader';
import {SimpleLineShader} from '../shader/line/simple-line-shader';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {TiledRenderer, TiledRendererOptions} from '../renderer/tiled/tiled-renderer';
import {findLineStringCollectionBounds} from '../../geometry-functions';

export interface LineRendererOptions<P> extends TiledRendererOptions {
    simpleRendering?: boolean;
    interpolation?: number;
    tileThreshold?: number;
}

export function lineRenderer<P>(options: LineRendererOptions<P>): Renderer<LineString, P, LineStyle> {
    const shader = (options.simpleRendering != null && options.simpleRendering) ?
        new SimpleLineShader() :
        new FancyLineShader(options.interpolation);
    const threshold = options.tileThreshold != null ? options.tileThreshold : 10000;
    return new SwitchRenderer([
        {
            renderer: new ShaderRenderer(shader),
            condition: data => data.features.length < threshold
        },
        {
            renderer: new TiledRenderer(
                new ShaderRenderer(shader),
                findLineStringCollectionBounds,
                options
            ),
            condition: data => data.features.length >= threshold
        }
    ]);
}
