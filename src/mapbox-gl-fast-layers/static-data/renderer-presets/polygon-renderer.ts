import {Feature, FeatureCollection, Polygon} from 'geojson';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {PolygonFillShader} from '../shader/polygon/polygon-fill-shader';
import {Bounds, TiledRenderer} from '../renderer/tiled/tiled-renderer';
import {Renderer} from '../renderer/renderer';
import {Color} from '../../misc';
import {PolygonOutlineShader} from '../shader/polygon/polygon-outline-shader';
import {CompositeRenderer} from '../renderer/composite-renderer';

export interface PolygonStyle {
    color: Color;
    opacity: number;
    outlineSize: number;
    outlineColor: Color;
    outlineOpacity: number;
}

export const defaultPolygonStyle: PolygonStyle = {
    color: {r: 0, g: 0, b: 1},
    opacity: 0.5,
    outlineSize: 1,
    outlineColor: {r: 0, g: 0, b: 0},
    outlineOpacity: 0.8
};

export interface PolygonRendererOptions<P>{
    style?: (feature: Feature<Polygon, P>) => Partial<PolygonStyle>;
    fancy?: boolean;
    interpolation?: number;
}

export function polygonRenderer<P>(options: PolygonRendererOptions<P>): Renderer<FeatureCollection<Polygon, P>> {
    const shaderRenderer = (options.fancy != null && options.fancy) ?
        new CompositeRenderer([
            new ShaderRenderer(new PolygonFillShader(options.style)),
            new ShaderRenderer(new PolygonOutlineShader(options.style, options.interpolation))
        ]) :
        new ShaderRenderer(new PolygonFillShader(options.style));
    return new SwitchRenderer([
        {
            renderer: shaderRenderer,
            condition: data => data.features.length <= 100000
        },
        {
            renderer: new TiledRenderer(shaderRenderer, findDataBounds),
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
