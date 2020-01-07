import {FeatureCollection} from 'geojson';
import {LineString} from 'geojson';
import React from 'react';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {lineLayer} from 'mapbox-gl-performance-layers';
import {LineLayerOptions} from 'mapbox-gl-performance-layers';
import {LineStyle} from 'mapbox-gl-performance-layers';
import {StyleOption} from 'mapbox-gl-performance-layers';
import {Visibility} from 'mapbox-gl-performance-layers';
import {StaticDataLayerComponent} from './static-data-layer-component';

export interface LineLayerProps<P> extends Omit<LineLayerOptions<P>, 'id'> {
    id?: string;
    data: FeatureCollection<LineString, P>;
    style?: StyleOption<LineString, P, LineStyle>;
    visibility?: Visibility;
    before?: string;
}

export function LineLayer<P>(props: LineLayerProps<P>) {
    const layerOptions: LineLayerOptions<P> = {
        id: `static-data-line-${generateID()}`,
        ...props
    };
    return (
        <StaticDataLayerComponent
            layerConstructor={() => lineLayer(layerOptions)}
            {...props}
        />
    );
}
