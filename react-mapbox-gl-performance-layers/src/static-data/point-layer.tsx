import {FeatureCollection, Point} from 'geojson';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {StaticDataLayerComponent} from './static-data-layer';
import {pointLayer, PointLayerOptions, PointStyle, StyleOption, Visibility} from 'mapbox-gl-performance-layers';
import React from 'react';

export interface PointLayerProps<P> extends Omit<PointLayerOptions<P>, 'id'> {
    id?: string;
    data: FeatureCollection<Point, P>;
    style?: StyleOption<Point, P, PointStyle>;
    visibility?: Visibility;
    before?: string;
}

export function PointLayer<P>(props: PointLayerProps<P>) {
    const layerOptions: PointLayerOptions<P> = {
        id: `static-data-point-${generateID()}`,
        ...props
    };
    return (
        <StaticDataLayerComponent
            layerConstructor={() => pointLayer(layerOptions)}
            {...props}
        />
    );
}
