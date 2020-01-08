import {FeatureCollection} from 'geojson';
import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import React from 'react';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {pointLayer} from 'mapbox-gl-performance-layers';
import {PointLayerOptions} from 'mapbox-gl-performance-layers';
import {PointStyle} from 'mapbox-gl-performance-layers';
import {StyleOption} from 'mapbox-gl-performance-layers';
import {Visibility} from 'mapbox-gl-performance-layers';
import {StaticDataLayerComponent} from './static-data-layer-component';

export interface PointLayerProps<G extends Point | MultiPoint, P> extends Omit<PointLayerOptions<G, P>, 'id'> {
    id?: string;
    data: FeatureCollection<G, P>;
    style?: StyleOption<G, P, PointStyle>;
    visibility?: Visibility;
    before?: string;
}

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
