import {FeatureCollection} from 'geojson';
import {LineString} from 'geojson';
import {MultiLineString} from 'geojson';
import React from 'react';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {lineLayer} from 'mapbox-gl-performance-layers';
import {LineLayerOptions} from 'mapbox-gl-performance-layers';
import {LineStyle} from 'mapbox-gl-performance-layers';
import {StyleOption} from 'mapbox-gl-performance-layers';
import {Visibility} from 'mapbox-gl-performance-layers';
import {StaticDataLayerComponent} from './static-data-layer-component';

export interface LineLayerProps<G extends LineString | MultiLineString, P> extends Omit<LineLayerOptions<G, P>, 'id'> {
    id?: string;
    data: FeatureCollection<G, P>;
    style?: StyleOption<G, P, LineStyle>;
    visibility?: Visibility;
    before?: string;
}

export function LineLayer<G extends LineString | MultiLineString, P>(props: LineLayerProps<G, P>) {
    const layerOptions: LineLayerOptions<G, P> = {
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
