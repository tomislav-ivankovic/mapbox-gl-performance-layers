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
    opacity: number;
    outlineSize: number;
    outlineColor: Color;
    outlineOpacity: number;
}

export const defaultLineStyle: LineStyle = {
    size: 3,
    color: {r: 0, g: 0, b: 1},
    opacity: 1,
    outlineSize: 0,
    outlineColor: {r: 0, g: 0, b: 0},
    outlineOpacity: 1
};

export interface LineRendererOptions<P> {
    style?: (feature: Feature<LineString, P>) => Partial<LineStyle>;
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
            renderer: new TiledRenderer(new ShaderRenderer(shader)),
            condition: data => data.features.length > 10000
        }
    ]);
}
