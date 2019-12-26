import {Point} from 'geojson';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {StaticDataLayerComponent, StaticDataLayerComponentProps} from './static-data-layer';
import {pointLayer, PointLayerOptions} from 'mapbox-gl-performance-layers';
import React from 'react';

export interface PointLayerProps<P> extends Omit<Omit<StaticDataLayerComponentProps<Point, P>, 'map'>, 'layer'>,
    Omit<PointLayerOptions<P>, 'id'> {
    id?: string;
}

export function PointLayer<P>(props: PointLayerProps<P>) {
    const layerOptions: PointLayerOptions<P> = {
        id: `static-data-point-${generateID()}`,
        ...props
    };
    return (
        <StaticDataLayerComponent
            layer={pointLayer(layerOptions)}
            {...props}
        />
    );
}
