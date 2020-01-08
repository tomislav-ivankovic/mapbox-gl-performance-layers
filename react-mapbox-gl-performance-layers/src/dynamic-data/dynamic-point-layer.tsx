import {Feature} from 'geojson';
import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import React from 'react';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {DataOperations} from 'mapbox-gl-performance-layers';
import {dynamicPointLayer} from 'mapbox-gl-performance-layers';
import {DynamicPointLayerOptions} from 'mapbox-gl-performance-layers';
import {PointStyle} from 'mapbox-gl-performance-layers';
import {StyleOption} from 'mapbox-gl-performance-layers';
import {Visibility} from 'mapbox-gl-performance-layers';
import {DynamicDataLayerComponent} from './dynamic-data-layer-component';

export interface DynamicPointLayerProps<G extends Point | MultiPoint, P> extends Omit<DynamicPointLayerOptions<G, P>, 'id'> {
    id?: string;
    data: (dataOperations: DataOperations<Feature<G, P>>) => void;
    style?: StyleOption<G, P, PointStyle>;
    visibility?: Visibility;
    before?: string;
}

export function DynamicPointLayer<G extends Point | MultiPoint, P>(props: DynamicPointLayerProps<G, P>) {
    const layerOptions: DynamicPointLayerOptions<G, P> = {
        id: `dynamic-data-point-${generateID()}`,
        ...props
    };
    return (
        <DynamicDataLayerComponent
            layerConstructor={() => dynamicPointLayer(layerOptions)}
            {...props as any}
        />
    );
}
