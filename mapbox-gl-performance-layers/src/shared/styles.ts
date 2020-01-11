import {Feature} from 'geojson';
import {Geometry} from 'geojson';

export interface Color {
    r: number;
    g: number;
    b: number;
}

export interface PointStyle {
    size: number;
    color: Color;
    opacity: number;
    outlineSize: number;
    outlineColor: Color;
    outlineOpacity: number;
}

export interface LineStyle {
    size: number;
    color: Color;
    opacity: number;
    outlineSize: number;
    outlineColor: Color;
    outlineOpacity: number;
}

export interface PolygonStyle {
    color: Color;
    opacity: number;
    outlineSize: number;
    outlineColor: Color;
    outlineOpacity: number;
}

export const defaultPointStyle: Readonly<PointStyle> = {
    size: 10,
    color: {r: 0, g: 0, b: 1},
    opacity: 0.8,
    outlineSize: 0,
    outlineColor: {r: 0, g: 0, b: 0},
    outlineOpacity: 0.8
};

export const defaultLineStyle: Readonly<LineStyle> = {
    size: 5,
    color: {r: 0, g: 0, b: 1},
    opacity: 0.8,
    outlineSize: 0,
    outlineColor: {r: 0, g: 0, b: 0},
    outlineOpacity: 0.8
};

export const defaultPolygonStyle: Readonly<PolygonStyle> = {
    color: {r: 0, g: 0, b: 1},
    opacity: 0.5,
    outlineSize: 0,
    outlineColor: {r: 0, g: 0, b: 0},
    outlineOpacity: 0.8
};

export type StyleOption<G extends Geometry, P, S extends {}> =
    ((feature: Feature<G, P>) => Partial<S>) |
    Partial<S> |
    undefined;

export function resolveStyle<G extends Geometry, P, S extends {}>(
    output: S,
    feature: Feature<G, P>,
    styleOption: StyleOption<G, P, S>,
    defaultStyle: Readonly<S>
) {
    // @ts-ignore
    Object.keys(defaultStyle).forEach(key => output[key] = defaultStyle[key]);
    if (styleOption != null) {
        const partialStyle = typeof styleOption === 'object' ? styleOption : styleOption(feature);
        // @ts-ignore
        Object.keys(partialStyle).forEach(key => output[key] = partialStyle[key]);
    }
}

export function resolvePointStyle<G extends Geometry, P>(
    output: PointStyle,
    feature: Feature<G, P>,
    styleOption: StyleOption<G, P, PointStyle>
): void {
    resolveStyle(output, feature, styleOption, defaultPointStyle);
    if (output.outlineSize <= 0) {
        output.outlineColor = output.color;
        output.outlineOpacity = output.opacity;
    }
}

export function resolveLineStyle<G extends Geometry, P>(
    output: LineStyle,
    feature: Feature<G, P>,
    styleOption: StyleOption<G, P, LineStyle>
): void {
    resolveStyle(output, feature, styleOption, defaultLineStyle);
    if (output.outlineSize <= 0) {
        output.outlineColor = output.color;
        output.outlineOpacity = output.opacity;
    }
}

export function resolvePolygonStyle<G extends Geometry, P, S extends {}>(
    output: PolygonStyle,
    feature: Feature<G, P>,
    styleOption: StyleOption<G, P, PolygonStyle>
): void {
    resolveStyle(output, feature, styleOption, defaultPolygonStyle);
    if (output.outlineSize <= 0) {
        output.outlineColor = output.color;
        output.outlineOpacity = output.opacity;
    }
}
