import {Polygon} from 'geojson';
import {PolygonStyle} from '../../shared/styles';
import {Renderer} from '../renderer/renderer';
import {FancyPolygonShader} from '../../shared/shader/polygon/fancy-polygon-shader';
import {SimplePolygonShader} from '../../shared/shader/polygon/simple-polygon-shader';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {TiledRenderer} from '../renderer/tiled-renderer';
import {findPolygonsBounds} from '../../shared/geometry-functions';
import {simplePolygonsToShaderBuffers} from '../vertex-data-mapper/simple-polygons-to-shader-buffers';
import {fancyPolygonsToShaderBuffers} from '../vertex-data-mapper/fancy-polygons-to-shader-buffers';
import {TileRendererOptions} from '../../shared/tile/tile-renderer';

export interface PolygonRendererOptions<P> extends TileRendererOptions{
    simpleRendering?: boolean;
    interpolation?: number;
    tileThreshold?: number;
}

export function polygonRenderer<P>(options: PolygonRendererOptions<P>): Renderer<Polygon, P, PolygonStyle> {
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
                findPolygonsBounds,
                options
            ),
            condition: data => data.features.length >= threshold
        }
    ]);
}
