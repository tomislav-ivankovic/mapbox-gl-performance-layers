import {Feature, FeatureCollection, Point} from 'geojson';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {FancyPointShader} from '../shader/point/fancy-point-shader';
import {TiledRenderer} from '../renderer/tiled/tiled-renderer';
import {Renderer} from '../renderer/renderer';
import {Color} from '../misc';

export interface PointStyle {
    size: number;
    color: Color;
    outlineSize: number;
    outlineColor: Color;
}

export const defaultPointStyle: PointStyle = {
    size: 5,
    color: {r: 0, g: 0, b: 1, a: 1},
    outlineSize: 1,
    outlineColor: {r: 0, g: 0, b: 0, a: 1}
};

export interface PointRendererOptions<P> {
    style?: (feature: Feature<Point, P>) => Partial<PointStyle>;
    interpolation?: number;
}

export function pointRenderer<P>(options: PointRendererOptions<P>): Renderer<FeatureCollection<Point, P>> {
    return new SwitchRenderer([
        {
            renderer: new ShaderRenderer(
                new FancyPointShader(
                    options.style,
                    options.interpolation
                )
            ),
            condition: data => data.features.length <= 100000
        },
        {
            renderer: new TiledRenderer(
                new ShaderRenderer(
                    new FancyPointShader(
                        options.style,
                        options.interpolation
                    )
                )
            ),
            condition: data => data.features.length > 100000
        }
    ]);
}
