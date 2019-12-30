import {Feature, Geometry} from 'geojson';

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

export const defaultPointStyle: PointStyle = {
    size: 10,
    color: {r: 0, g: 0, b: 1},
    opacity: 0.8,
    outlineSize: 0,
    outlineColor: {r: 0, g: 0, b: 0},
    outlineOpacity: 0
};

export const defaultLineStyle: LineStyle = {
    size: 5,
    color: {r: 0, g: 0, b: 1},
    opacity: 0.8,
    outlineSize: 0,
    outlineColor: {r: 0, g: 0, b: 0},
    outlineOpacity: 0
};

export const defaultPolygonStyle: PolygonStyle = {
    color: {r: 0, g: 0, b: 1},
    opacity: 0.5,
    outlineSize: 0,
    outlineColor: {r: 0, g: 0, b: 0},
    outlineOpacity: 0
};

export type StyleOption<G extends Geometry, P, S extends {}> =
    ((feature: Feature<G, P>) => Partial<S>) |
    Partial<S> |
    undefined;

let singleAllocationObject: object = {};

export function resolveStyle<G extends Geometry, P, S extends {}>(
    feature: Feature<G, P>,
    styleOption: StyleOption<G, P, S>,
    defaultStyle: S
): S {
    if (styleOption == null) {
        return defaultStyle;
    }
    const partialStyle = typeof styleOption === 'object' ? styleOption : styleOption(feature);
    // @ts-ignore
    Object.keys(singleAllocationObject).forEach(key => delete singleAllocationObject[key]);
    // @ts-ignore
    Object.keys(defaultStyle).forEach(key => singleAllocationObject[key] = defaultStyle[key]);
    // @ts-ignore
    Object.keys(partialStyle).forEach(key => singleAllocationObject[key] = partialStyle[key]);
    // @ts-ignore
    return singleAllocationObject;
}

export function resolvePointStyle<G extends Geometry, P>(
    feature: Feature<G, P>,
    styleOption: StyleOption<G, P, PointStyle>
): PointStyle {
    return resolveStyle(feature, styleOption, defaultPointStyle);
}

export function resolveLineStyle<G extends Geometry, P>(
    feature: Feature<G, P>,
    styleOption: StyleOption<G, P, LineStyle>
): LineStyle {
    return resolveStyle(feature, styleOption, defaultLineStyle);
}

export function resolvePolygonStyle<G extends Geometry, P, S extends {}>(
    feature: Feature<G, P>,
    styleOption: StyleOption<G, P, PolygonStyle>
): PolygonStyle {
    return resolveStyle(feature, styleOption, defaultPolygonStyle);
}
