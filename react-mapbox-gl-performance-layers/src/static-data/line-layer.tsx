import {StaticDataLayerComponent} from './static-data-layer';
import {FeatureCollection, LineString} from 'geojson';
import {lineLayer, LineLayerOptions, LineStyle, StyleOption} from 'mapbox-gl-performance-layers';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import React from 'react';

export interface LineLayerProps<P> extends Omit<LineLayerOptions<P>, 'id'> {
    id?: string;
    data: FeatureCollection<LineString, P>;
    style?: StyleOption<LineString, P, LineStyle>;
    before?: string;
}

export function LineLayer<P>(props: LineLayerProps<P>) {
    const layerOptions: LineLayerOptions<P> = {
        id: `static-data-line-${generateID()}`,
        ...props
    };
    return (
        <StaticDataLayerComponent
            layerConstructor={() => lineLayer(layerOptions)}
            {...props}
        />
    );
}
