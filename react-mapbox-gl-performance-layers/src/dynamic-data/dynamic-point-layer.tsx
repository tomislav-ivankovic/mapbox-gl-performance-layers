import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import React from 'react';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {dynamicPointLayer} from 'mapbox-gl-performance-layers';
import {DynamicPointLayerOptions} from 'mapbox-gl-performance-layers';
import {PointStyle} from 'mapbox-gl-performance-layers';
import {DynamicDataLayerComponent, DynamicDataLayerComponentProps} from './dynamic-data-layer-component';

export type DynamicPointLayerProps<G extends Point | MultiPoint, P> =
    Omit<DynamicPointLayerOptions<G, P>, 'id'> &
    Omit<DynamicDataLayerComponentProps<G, P, PointStyle>, 'layerConstructor'> &
    { id?: string };

export function DynamicPointLayer<G extends Point | MultiPoint, P>(props: DynamicPointLayerProps<G, P>) {
    const layerOptions: DynamicPointLayerOptions<G, P> = {
        id: `dynamic-data-point-${generateID()}`,
        ...props
    };
    return (
        <DynamicDataLayerComponent
            layerConstructor={() => dynamicPointLayer(layerOptions)}
            {...props as any}
        />
    );
}
