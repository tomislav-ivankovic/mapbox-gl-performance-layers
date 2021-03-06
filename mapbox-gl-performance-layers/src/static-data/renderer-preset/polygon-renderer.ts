import {Polygon} from 'geojson';
import {MultiPolygon} from 'geojson';
import {PolygonStyle} from '../../shared/styles';
import {Renderer} from '../renderer/renderer';
import {FancyPolygonShader} from '../../shared/shader/polygon/fancy-polygon-shader';
import {SimplePolygonShader} from '../../shared/shader/polygon/simple-polygon-shader';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {TiledRenderer} from '../renderer/tiled-renderer';
import {simplePolygonsToShaderBuffers} from '../vertex-data-mapper/simple-polygons-to-shader-buffers';
import {fancyPolygonsToShaderBuffers} from '../vertex-data-mapper/fancy-polygons-to-shader-buffers';
import {TileRendererOptions} from '../../shared/tile/tile-renderer';

export interface PolygonRendererOptions<P> extends TileRendererOptions{
    simpleRendering?: boolean;
    interpolation?: number;
    tileThreshold?: number;
}

export function polygonRenderer<G extends Polygon | MultiPolygon, P>(
    options: PolygonRendererOptions<P>
): Renderer<G, P, PolygonStyle> {
    const isSimple = options.simpleRendering != null && options.simpleRendering;
    const shader = isSimple ? new SimplePolygonShader() : new FancyPolygonShader(options.interpolation);
    const dataMapper = isSimple ? simplePolygonsToShaderBuffers : fancyPolygonsToShaderBuffers;
    const threshold = options.tileThreshold != null ? options.tileThreshold : 10000;
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
