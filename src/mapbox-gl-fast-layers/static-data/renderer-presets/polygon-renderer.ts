import {Feature, FeatureCollection, Polygon} from 'geojson';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {SimplePolygonShader} from '../shader/polygon/simple-polygon-shader';
import {TiledRenderer} from '../renderer/tiled/tiled-renderer';
import {Renderer} from '../renderer/renderer';
import {FancyPolygonShader} from '../shader/polygon/fancy-polygon-shader';
import {PolygonStyle, StyleOption} from '../shader/styles';
import {findPolygonCollectionBounds} from '../../geometry-functions';

export interface PolygonRendererOptions<P>{
    style?: StyleOption<Feature<Polygon, P>, PolygonStyle>;
    fancy?: boolean;
    interpolation?: number;
}

export function polygonRenderer<P>(options: PolygonRendererOptions<P>): Renderer<FeatureCollection<Polygon, P>> {
    const shader = (options.fancy != null && options.fancy) ?
        new FancyPolygonShader(options.style, options.interpolation) :
        new SimplePolygonShader(options.style);
    return new SwitchRenderer([
        {
            renderer: new ShaderRenderer(shader),
            condition: data => data.features.length <= 100000
        },
        {
            renderer: new TiledRenderer(new ShaderRenderer(shader), findPolygonCollectionBounds),
            condition: data => data.features.length > 100000
        }
    ]);
}
