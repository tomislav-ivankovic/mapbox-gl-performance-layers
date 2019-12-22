import {Feature, FeatureCollection, LineString} from 'geojson';
import {Renderer} from '../renderer/renderer';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {SimpleLineShader} from '../shader/line/simple-line-shader';
import {FancyLineShader} from '../shader/line/fancy-line-shader';
import {TiledRenderer} from '../renderer/tiled/tiled-renderer';
import {LineStyle, StyleOption} from '../shader/styles';
import {findLineStringCollectionBounds} from '../../geometry-functions';

export interface LineRendererOptions<P> {
    style?: StyleOption<Feature<LineString, P>, LineStyle>;
    fancy?: boolean;
    interpolation?: number;
}

export function lineRenderer<P>(options: LineRendererOptions<P>): Renderer<FeatureCollection<LineString, P>> {
    const shader = (options.fancy != null && options.fancy) ?
        new FancyLineShader(options.style, options.interpolation) :
        new SimpleLineShader(options.style);
    return new SwitchRenderer([
        {
            renderer: new ShaderRenderer(shader),
            condition: data => data.features.length <= 10000
        },
        {
            renderer: new TiledRenderer(new ShaderRenderer(shader), findLineStringCollectionBounds),
            condition: data => data.features.length > 10000
        }
    ]);
}
