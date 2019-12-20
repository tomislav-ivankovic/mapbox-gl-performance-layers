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

let lastInputFeature: any | null = null;
let lastInputStyleOption: StyleOption<any, any> | null = null;
let lastOutputStyle: any = null;

export function resolveStyle<F, S extends {}>(feature: F, styleOption: StyleOption<F, S>, defaultStyle: S): S {
    let style: S;
    if (styleOption == null) {
        style = defaultStyle;
    } else if (typeof styleOption == 'object') {
        if (styleOption === lastInputStyleOption) {
            style = lastOutputStyle;
        } else {
            style = {...defaultStyle, ...styleOption};
        }
    } else {
        if (feature === lastInputFeature && styleOption === lastInputStyleOption) {
            style = lastOutputStyle;
        } else {
            style = {...defaultStyle, ...styleOption(feature)};
        }
    }
    lastInputFeature = feature;
    lastInputStyleOption = styleOption;
    lastOutputStyle = style;
    return style;
}
