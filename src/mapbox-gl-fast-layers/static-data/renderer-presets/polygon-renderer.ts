import {Feature, FeatureCollection, Polygon} from 'geojson';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {SimplePolygonShader} from '../shader/polygon/simple-polygon-shader';
import {Bounds, TiledRenderer} from '../renderer/tiled/tiled-renderer';
import {Renderer} from '../renderer/renderer';
import {FancyPolygonShader} from '../shader/polygon/fancy-polygon-shader';
import {PolygonStyle, StyleOption} from '../shader/styles';

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
            renderer: new TiledRenderer(new ShaderRenderer(shader), findDataBounds),
            condition: data => data.features.length > 100000
        }
    ]);
}

function findDataBounds(data: FeatureCollection<Polygon, any>): Bounds {
    const bounds: Bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    for (const feature of data.features) {
        for (const coordinates of feature.geometry.coordinates) {
            for (const coords of coordinates) {
                if (coords[0] < bounds.minX) bounds.minX = coords[0];
                if (coords[1] < bounds.minY) bounds.minY = coords[1];
                if (coords[0] > bounds.maxX) bounds.maxX = coords[0];
                if (coords[1] > bounds.maxY) bounds.maxY = coords[1];
            }
        }
    }
    return bounds;
}
