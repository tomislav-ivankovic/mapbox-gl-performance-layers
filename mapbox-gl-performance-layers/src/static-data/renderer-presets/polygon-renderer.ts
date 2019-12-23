import {Feature, FeatureCollection, Polygon} from 'geojson';
import {
    SwitchRenderer,
    ShaderRenderer,
    SimplePolygonShader,
    TiledRenderer,
    Renderer,
    FancyPolygonShader,
    PolygonStyle,
    StyleOption
} from '../..';
import {findPolygonCollectionBounds} from '../../geometry-functions';

export interface PolygonRendererOptions<P> {
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
