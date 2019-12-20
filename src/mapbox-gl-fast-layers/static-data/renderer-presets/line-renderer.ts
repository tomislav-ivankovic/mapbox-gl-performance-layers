import {Feature, FeatureCollection, LineString} from 'geojson';
import {Renderer} from '../renderer/renderer';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {SimpleLineShader} from '../shader/line/simple-line-shader';
import {FancyLineShader} from '../shader/line/fancy-line-shader';
import {Bounds, TiledRenderer} from '../renderer/tiled/tiled-renderer';
import {LineStyle, StyleOption} from '../shader/styles';

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
            renderer: new TiledRenderer(new ShaderRenderer(shader), findDataBounds),
            condition: data => data.features.length > 10000
        }
    ]);
}

function findDataBounds(data: FeatureCollection<LineString, any>): Bounds {
    const bounds: Bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    for (const feature of data.features) {
        for (const coords of feature.geometry.coordinates) {
            if (coords[0] < bounds.minX) bounds.minX = coords[0];
            if (coords[1] < bounds.minY) bounds.minY = coords[1];
            if (coords[0] > bounds.maxX) bounds.maxX = coords[0];
            if (coords[1] > bounds.maxY) bounds.maxY = coords[1];
        }
    }
    return bounds;
}
