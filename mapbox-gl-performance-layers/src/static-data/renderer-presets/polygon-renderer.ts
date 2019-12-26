import {Feature, FeatureCollection, Polygon} from 'geojson';
import {PolygonStyle, StyleOption} from '../shader/styles';
import {Renderer} from '../renderer/renderer';
import {FancyPolygonShader} from '../shader/polygon/fancy-polygon-shader';
import {SimplePolygonShader} from '../shader/polygon/simple-polygon-shader';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {TiledRenderer} from '../renderer/tiled/tiled-renderer';
import {findPolygonCollectionBounds} from '../../geometry-functions';

export interface PolygonRendererOptions<P> {
    style?: StyleOption<Feature<Polygon, P>, PolygonStyle>;
    fancy?: boolean;
    interpolation?: number;
    tileThreshold?: number;
}

export function polygonRenderer<P>(options: PolygonRendererOptions<P>): Renderer<FeatureCollection<Polygon, P>> {
    const shader = (options.fancy != null && options.fancy) ?
        new FancyPolygonShader(options.style, options.interpolation) :
        new SimplePolygonShader(options.style);
    const threshold = options.tileThreshold != null ? options.tileThreshold : 10000;
    return new SwitchRenderer([
        {
            renderer: new ShaderRenderer(shader),
            condition: data => data.features.length <= threshold
        },
        {
            renderer: new TiledRenderer(new ShaderRenderer(shader), findPolygonCollectionBounds),
            condition: data => data.features.length > threshold
        }
    ]);
}
