import {LineString} from 'geojson';
import {MultiLineString} from 'geojson';
import React from 'react';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {lineLayer} from 'mapbox-gl-performance-layers';
import {LineLayerOptions} from 'mapbox-gl-performance-layers';
import {LineStyle} from 'mapbox-gl-performance-layers';
import {StaticDataLayerComponent, StaticDataLayerComponentProps} from './static-data-layer-component';
import {useClickProxy} from '../shared/use-click-proxy';

export type LineLayerProps<G extends LineString | MultiLineString, P> =
    Omit<LineLayerOptions<G, P>, 'id'> &
    Omit<StaticDataLayerComponentProps<G, P, LineStyle>, 'layerConstructor'> &
    { id?: string };

export function LineLayer<G extends LineString | MultiLineString, P>(props: LineLayerProps<G, P>) {
    const clickProxy = useClickProxy(props.onClick);
    const layerOptions: LineLayerOptions<G, P> = {
        id: `static-data-line-${generateID()}`,
        ...props,
        onClick: clickProxy
    };
    return (
        <StaticDataLayerComponent
            layerConstructor={() => lineLayer(layerOptions)}
            {...props}
        />
    );
}
