import {Polygon} from 'geojson';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {StaticDataLayerComponent, StaticDataLayerComponentProps} from './static-data-layer';
import {
    polygonLayer,
    PolygonLayerOptions,
} from 'mapbox-gl-performance-layers';
import React from 'react';

export interface PolygonLayerProps<P> extends Omit<Omit<StaticDataLayerComponentProps<Polygon, P>, 'map'>, 'layerConstructor'>,
    Omit<PolygonLayerOptions<P>, 'id'> {
    id?: string;
}

export function PolygonLayer<P>(props: PolygonLayerProps<P>) {
    const layerOptions: PolygonLayerOptions<P> = {
        id: `static-data-polygon-${generateID()}`,
        ...props
    };
    return (
        <StaticDataLayerComponent
            layerConstructor={() => polygonLayer(layerOptions)}
            {...props}
        />
    );
}
