import {Feature, FeatureCollection, LineString} from 'geojson';
import {Renderer} from '../renderer/renderer';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {SimpleLineShader} from '../shader/line/simple-line-shader';
import {FancyLineShader} from '../shader/line/fancy-line-shader';
import {TiledRenderer} from '../renderer/tiled/tiled-renderer';
import {Color} from '../misc';

export interface LineStyle {
    size: number;
    color: Color;
    outlineSize: number;
    outlineColor: Color;
}

export const defaultLineStyle: LineStyle = {
    size: 3,
    color: {r: 0, g: 0, b: 1, a: 1},
    outlineSize: 0,
    outlineColor: {r: 0, g: 0, b: 0, a: 0}
};

export interface LineRendererOptions<P> {
    style?: (feature: Feature<LineString, P>) => Partial<LineStyle>;
    fancy?: boolean;
    interpolation?: number;
}

export function lineRenderer<P>(options: LineRendererOptions<P>): Renderer<FeatureCollection<LineString, P>> {
    const fancySwitch = new SwitchRenderer([
        {
            renderer: new ShaderRenderer(new SimpleLineShader(
                options.style
            )),
            condition: () => options.fancy == null || !options.fancy
        },
        {
            renderer: new ShaderRenderer(new FancyLineShader(
                options.style,
                options.interpolation
            )),
            condition: () => options.fancy != null && options.fancy
        }
    ]);
    return new SwitchRenderer([
        {
            renderer: fancySwitch,
            condition: data => data.features.length <= 10000
        },
        {
            renderer: new TiledRenderer(fancySwitch),
            condition: data => data.features.length > 10000
        }
    ]);
}
