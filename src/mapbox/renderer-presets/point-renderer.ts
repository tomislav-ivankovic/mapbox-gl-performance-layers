import {Feature, FeatureCollection, Point} from 'geojson';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {SimplePointShader} from '../shader/point/simple-point-shader';
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
    fancy?: boolean;
    interpolation?: number;
}

export function pointRenderer<P>(options: PointRendererOptions<P>): Renderer<FeatureCollection<Point, P>> {
    const fancySwitch = new SwitchRenderer([
        {
            renderer: new ShaderRenderer(new SimplePointShader(
                options.style,
                options.interpolation
            )),
            condition: () => options.fancy == null || !options.fancy
        },
        {
            renderer: new ShaderRenderer(new FancyPointShader(
                options.style,
                options.interpolation
            )),
            condition: () => options.fancy != null && options.fancy
        }
    ]);
    return new SwitchRenderer([
        {
            renderer: fancySwitch,
            condition: data => data.features.length <= 100000
        },
        {
            renderer: new TiledRenderer(fancySwitch),
            condition: data => data.features.length > 100000
        }
    ]);
}
