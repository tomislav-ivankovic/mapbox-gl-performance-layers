import {FeatureCollection} from 'geojson';
import {Polygon} from 'geojson';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import React from 'react';
import {polygonLayer} from 'mapbox-gl-performance-layers';
import {PolygonLayerOptions} from 'mapbox-gl-performance-layers';
import {PolygonStyle} from 'mapbox-gl-performance-layers';
import {StyleOption} from 'mapbox-gl-performance-layers';
import {Visibility} from 'mapbox-gl-performance-layers';
import {StaticDataLayerComponent} from './static-data-layer-component';

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
