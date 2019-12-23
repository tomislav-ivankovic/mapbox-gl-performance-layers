import {Feature, FeatureCollection, Point} from 'geojson';
import {
    SwitchRenderer,
    ShaderRenderer,
    SimplePointShader,
    FancyPointShader,
    TiledRenderer,
    Renderer,
    PointStyle,
    StyleOption
} from '../..';
import {findPointCollectionBounds} from '../../geometry-functions';

export interface PointRendererOptions<P> {
    style?: StyleOption<Feature<Point, P>, PointStyle>;
    fancy?: boolean;
    interpolation?: number;
}

export function pointRenderer<P>(options: PointRendererOptions<P>): Renderer<FeatureCollection<Point, P>> {
    const shader = (options.fancy != null && options.fancy) ?
        new FancyPointShader(options.style, options.interpolation) :
        new SimplePointShader(options.style, options.interpolation);
    return new SwitchRenderer([
        {
            renderer: new ShaderRenderer(shader),
            condition: data => data.features.length <= 100000
        },
        {
            renderer: new TiledRenderer(new ShaderRenderer(shader), findPointCollectionBounds),
            condition: data => data.features.length > 100000
        }
    ]);
}
