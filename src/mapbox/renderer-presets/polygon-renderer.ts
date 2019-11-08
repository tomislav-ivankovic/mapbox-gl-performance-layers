import {Feature, FeatureCollection, Polygon} from 'geojson';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {PolygonFillShader} from '../shader/polygon/polygon-fill-shader';
import {TiledRenderer} from '../renderer/tiled/tiled-renderer';
import {Renderer} from '../renderer/renderer';
import {Color} from '../misc';

export interface PolygonStyle {
    color: Color;
    outlineSize: number;
    outlineColor: Color;
}

export const defaultPolygonStyle: PolygonStyle = {
    color: {r: 0, g: 0, b: 1, a: 1},
    outlineSize: 1,
    outlineColor: {r: 0, g: 0, b: 0, a: 1}
};


export interface PolygonRendererOptions<P>{
    style?: (feature: Feature<Polygon, P>) => Partial<PolygonStyle>,
}

export function polygonRenderer<P>(options: PolygonRendererOptions<P>): Renderer<FeatureCollection<Polygon, P>> {
    return new SwitchRenderer([
        {
            renderer: new ShaderRenderer(
                new PolygonFillShader(
                    options.style
                )
            ),
            condition: data => data.features.length <= 100000
        },
        {
            renderer: new TiledRenderer(
                new ShaderRenderer(
                    new PolygonFillShader(
                        options.style
                    )
                )
            ),
            condition: data => data.features.length > 100000
        }
    ]);
}