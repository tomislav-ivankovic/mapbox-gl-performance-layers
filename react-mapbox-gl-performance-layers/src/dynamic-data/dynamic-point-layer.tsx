import {Feature} from 'geojson';
import {Point} from 'geojson';
import React from 'react';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {DataOperations} from 'mapbox-gl-performance-layers';
import {dynamicPointLayer} from 'mapbox-gl-performance-layers';
import {DynamicPointLayerOptions} from 'mapbox-gl-performance-layers';
import {PointStyle} from 'mapbox-gl-performance-layers';
import {StyleOption} from 'mapbox-gl-performance-layers';
import {Visibility} from 'mapbox-gl-performance-layers';
import {DynamicDataLayerComponent} from './dynamic-data-layer-component';

export interface DynamicPointLayerProps<P> extends Omit<DynamicPointLayerOptions<P>, 'id'> {
    id?: string;
    data: (dataOperations: DataOperations<Feature<Point, P>>) => void;
    style?: StyleOption<Point, P, PointStyle>;
    visibility?: Visibility;
    before?: string;
}

export function DynamicPointLayer<P>(props: DynamicPointLayerProps<P>) {
    const layerOptions: DynamicPointLayerOptions<P> = {
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
