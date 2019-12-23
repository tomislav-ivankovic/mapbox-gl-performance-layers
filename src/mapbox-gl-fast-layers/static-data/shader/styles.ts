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

export type StyleOption<F, S extends {}> = ((feature: F) => Partial<S>) | Partial<S> | undefined;

let singleAllocationObject: object = {};

export function resolveStyle<F, S extends {}>(feature: F, styleOption: StyleOption<F, S>, defaultStyle: S): S {
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

export function resolvePointStyle<F>(feature: F, styleOption: StyleOption<F, PointStyle>): PointStyle {
    return resolveStyle(feature, styleOption, defaultPointStyle);
}

export function resolveLineStyle<F>(feature: F, styleOption: StyleOption<F, LineStyle>): LineStyle {
    return resolveStyle(feature, styleOption, defaultLineStyle);
}

export function resolvePolygonStyle<F>(feature: F, styleOption: StyleOption<F, PolygonStyle>): PolygonStyle {
    return resolveStyle(feature, styleOption, defaultPolygonStyle);
}
