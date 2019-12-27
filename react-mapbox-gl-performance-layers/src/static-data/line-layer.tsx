import {StaticDataLayerComponent, StaticDataLayerComponentProps} from './static-data-layer';
import {LineString} from 'geojson';
import {lineLayer, LineLayerOptions} from 'mapbox-gl-performance-layers';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import React from 'react';

export interface LineLayerProps<P> extends Omit<Omit<StaticDataLayerComponentProps<LineString, P>, 'map'>, 'layerConstructor'>,
    Omit<LineLayerOptions<P>, 'id'> {
    id?: string;
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
