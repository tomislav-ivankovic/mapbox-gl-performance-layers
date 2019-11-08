import {Feature, FeatureCollection, LineString} from 'geojson';
import {Renderer} from '../renderer/renderer';
import {SwitchRenderer} from '../renderer/switch-renderer';
import {ShaderRenderer} from '../renderer/shader-renderer';
import {SimpleLineShader} from '../shader/line/simple-line-shader';
import {TiledRenderer} from '../renderer/tiled/tiled-renderer';
import {Color} from '../misc';

export interface LineStyle {
    size: number;
    color: Color;
    outlineSize: number;
    outlineColor: Color;
}

export const defaultLineStyle: LineStyle = {
    size: 5,
    color: {r: 0, g: 0, b: 1, a: 1},
    outlineSize: 1,
    outlineColor: {r: 0, g: 0, b: 0, a: 1}
};

export interface LineRendererOptions<P> {
    style?: (feature: Feature<LineString, P>) => Partial<LineStyle>
}

export function lineRenderer<P>(options: LineRendererOptions<P>): Renderer<FeatureCollection<LineString, P>> {
    return new SwitchRenderer([
        {
            renderer: new ShaderRenderer(
                new SimpleLineShader(
                    options.style
                )
            ),
            condition: data => data.features.length <= 100000
        },
        {
            renderer: new TiledRenderer(
                new ShaderRenderer(
                    new SimpleLineShader(
                        options.style
                    )
                )
            ),
            condition: data => data.features.length > 100000
        }
    ]);
}
