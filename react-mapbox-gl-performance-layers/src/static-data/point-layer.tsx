import {FeatureCollection} from 'geojson';
import {Point} from 'geojson';
import React from 'react';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {pointLayer} from 'mapbox-gl-performance-layers';
import {PointLayerOptions} from 'mapbox-gl-performance-layers';
import {PointStyle} from 'mapbox-gl-performance-layers';
import {StyleOption} from 'mapbox-gl-performance-layers';
import {Visibility} from 'mapbox-gl-performance-layers';
import {StaticDataLayerComponent} from './static-data-layer-component';

export interface PointLayerProps<P> extends Omit<PointLayerOptions<P>, 'id'> {
    id?: string;
    data: FeatureCollection<Point, P>;
    style?: StyleOption<Point, P, PointStyle>;
    visibility?: Visibility;
    before?: string;
}

export function PointLayer<P>(props: PointLayerProps<P>) {
    const layerOptions: PointLayerOptions<P> = {
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
