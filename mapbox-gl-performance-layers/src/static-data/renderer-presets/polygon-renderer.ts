import {Polygon} from 'geojson';
import {PolygonStyle} from '../shader/styles';
import {Renderer} from '../renderer/renderer';
import {FancyPolygonShader} from '../shader/polygon/fancy-polygon-shader';
import {SimplePolygonShader} from '../shader/polygon/simple-polygon-shader';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {TiledRenderer, TiledRendererOptions} from '../renderer/tiled/tiled-renderer';
import {findPolygonCollectionBounds} from '../../geometry-functions';

export interface PolygonRendererOptions<P> extends TiledRendererOptions{
    fancy?: boolean;
    interpolation?: number;
    tileThreshold?: number;
}

export function polygonRenderer<P>(options: PolygonRendererOptions<P>): Renderer<Polygon, P, PolygonStyle> {
    const shader = (options.fancy != null && options.fancy) ?
        new FancyPolygonShader(options.interpolation) :
        new SimplePolygonShader();
    const threshold = options.tileThreshold != null ? options.tileThreshold : 10000;
    return new SwitchRenderer([
        {
            renderer: new ShaderRenderer(shader),
            condition: data => data.features.length < threshold
        },
        {
            renderer: new TiledRenderer(
                new ShaderRenderer(shader),
                findPolygonCollectionBounds,
                options
            ),
            condition: data => data.features.length >= threshold
        }
    ]);
}
