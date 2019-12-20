import {Feature, FeatureCollection, Point} from 'geojson';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {SimplePointShader} from '../shader/point/simple-point-shader';
import {FancyPointShader} from '../shader/point/fancy-point-shader';
import {Bounds, TiledRenderer} from '../renderer/tiled/tiled-renderer';
import {Renderer} from '../renderer/renderer';
import {PointStyle, StyleOption} from '../shader/styles';

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
            renderer: new TiledRenderer(new ShaderRenderer(shader), findDataBounds),
            condition: data => data.features.length > 100000
        }
    ]);
}

function findDataBounds(data: FeatureCollection<Point, any>): Bounds {
    const bounds: Bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    for (const feature of data.features) {
        const coords = feature.geometry.coordinates;
        if (coords[0] < bounds.minX) bounds.minX = coords[0];
        if (coords[1] < bounds.minY) bounds.minY = coords[1];
        if (coords[0] > bounds.maxX) bounds.maxX = coords[0];
        if (coords[1] > bounds.maxY) bounds.maxY = coords[1];
    }
    return bounds;
}