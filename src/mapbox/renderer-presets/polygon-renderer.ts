import {Feature, FeatureCollection, Polygon} from 'geojson';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {PolygonFillShader} from '../shader/polygon/polygon-fill-shader';
import {TiledRenderer} from '../renderer/tiled/tiled-renderer';
import {Renderer} from '../renderer/renderer';
import {Color} from '../misc';

export interface PolygonStyle {
    color: Color;
    opacity: number;
    outlineSize: number;
    outlineColor: Color;
    outlineOpacity: number;
}

export const defaultPolygonStyle: PolygonStyle = {
    color: {r: 0, g: 0, b: 1},
    opacity: 1,
    outlineSize: 1,
    outlineColor: {r: 0, g: 0, b: 0},
    outlineOpacity: 1
};

export interface PolygonRendererOptions<P>{
    style?: (feature: Feature<Polygon, P>) => Partial<PolygonStyle>,
}

export function polygonRenderer<P>(options: PolygonRendererOptions<P>): Renderer<FeatureCollection<Polygon, P>> {
    const shader = new PolygonFillShader(options.style);
    return new SwitchRenderer([
        {
            renderer: new ShaderRenderer(shader),
            condition: data => data.features.length <= 100000
        },
        {
            renderer: new TiledRenderer(new ShaderRenderer(shader)),
            condition: data => data.features.length > 100000
        }
    ]);
}
