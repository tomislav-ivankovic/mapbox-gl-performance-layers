import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import React from 'react';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {pointLayer} from 'mapbox-gl-performance-layers';
import {PointLayerOptions} from 'mapbox-gl-performance-layers';
import {PointStyle} from 'mapbox-gl-performance-layers';
import {StaticDataLayerComponent, StaticDataLayerComponentProps} from './static-data-layer-component';

export type PointLayerProps<G extends Point | MultiPoint, P> =
    Omit<PointLayerOptions<G, P>, 'id'> &
    Omit<StaticDataLayerComponentProps<G, P, PointStyle>, 'layerConstructor'> &
    { id?: string };

export function PointLayer<G extends Point | MultiPoint, P>(props: PointLayerProps<G, P>) {
    const layerOptions: PointLayerOptions<G, P> = {
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
