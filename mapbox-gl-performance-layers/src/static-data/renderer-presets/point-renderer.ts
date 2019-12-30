import {Point} from 'geojson';
import {PointStyle} from '../shader/styles';
import {Renderer} from '../renderer/renderer';
import {FancyPointShader} from '../shader/point/fancy-point-shader';
import {SimplePointShader} from '../shader/point/simple-point-shader';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {TiledRenderer, TiledRendererOptions} from '../renderer/tiled/tiled-renderer';
import {findPointCollectionBounds} from '../../geometry-functions';

export interface PointRendererOptions<P> extends TiledRendererOptions {
    fancy?: boolean;
    interpolation?: number;
    tileThreshold?: number;
}

export function pointRenderer<P>(options: PointRendererOptions<P>): Renderer<Point, P, PointStyle> {
    const shader = (options.fancy != null && options.fancy) ?
        new FancyPointShader(options.interpolation) :
        new SimplePointShader(options.interpolation);
    const threshold = options.tileThreshold != null ? options.tileThreshold : 100000;
    return new SwitchRenderer([
        {
            renderer: new ShaderRenderer(shader),
            condition: data => data.features.length < threshold
        },
        {
            renderer: new TiledRenderer(
                new ShaderRenderer(shader),
                findPointCollectionBounds,
                options
            ),
            condition: data => data.features.length >= threshold
        }
    ]);
}
