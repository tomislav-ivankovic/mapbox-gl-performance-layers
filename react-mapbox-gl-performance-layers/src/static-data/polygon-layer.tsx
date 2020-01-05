import {FeatureCollection, Polygon} from 'geojson';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {StaticDataLayerComponent} from './static-data-layer-component';
import {polygonLayer, PolygonLayerOptions, PolygonStyle, StyleOption, Visibility} from 'mapbox-gl-performance-layers';
import React from 'react';

export interface PolygonLayerProps<P> extends Omit<PolygonLayerOptions<P>, 'id'> {
    id?: string;
    data: FeatureCollection<Polygon, P>;
    style?: StyleOption<Polygon, P, PolygonStyle>;
    visibility?: Visibility;
    before?: string;
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
