import {Polygon} from 'geojson';
import {MultiPolygon} from 'geojson';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import React from 'react';
import {polygonLayer} from 'mapbox-gl-performance-layers';
import {PolygonLayerOptions} from 'mapbox-gl-performance-layers';
import {PolygonStyle} from 'mapbox-gl-performance-layers';
import {StaticDataLayerComponent, StaticDataLayerComponentProps} from './static-data-layer-component';

export type PolygonLayerProps<G extends Polygon | MultiPolygon, P> =
    Omit<PolygonLayerOptions<G, P>, 'id'> &
    Omit<StaticDataLayerComponentProps<G, P, PolygonStyle>, 'layerConstructor'> &
    { id?: string };

export function PolygonLayer<G extends Polygon | MultiPolygon, P>(props: PolygonLayerProps<G, P>) {
    const layerOptions: PolygonLayerOptions<G, P> = {
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
