import {FeatureCollection} from 'geojson';
import {Polygon} from 'geojson';
import {MultiPolygon} from 'geojson';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import React from 'react';
import {polygonLayer} from 'mapbox-gl-performance-layers';
import {PolygonLayerOptions} from 'mapbox-gl-performance-layers';
import {PolygonStyle} from 'mapbox-gl-performance-layers';
import {StyleOption} from 'mapbox-gl-performance-layers';
import {Visibility} from 'mapbox-gl-performance-layers';
import {StaticDataLayerComponent} from './static-data-layer-component';

export interface PolygonLayerProps<G extends Polygon | MultiPolygon, P> extends Omit<PolygonLayerOptions<G, P>, 'id'> {
    id?: string;
    data: FeatureCollection<G, P>;
    style?: StyleOption<G, P, PolygonStyle>;
    visibility?: Visibility;
    before?: string;
}

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
