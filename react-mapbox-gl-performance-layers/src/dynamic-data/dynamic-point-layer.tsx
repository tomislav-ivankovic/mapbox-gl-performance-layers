import React from 'react';
import {
    DataOperations, dynamicPointLayer,
    DynamicPointLayerOptions,
    PointStyle,
    StyleOption,
    Visibility
} from 'mapbox-gl-performance-layers';
import {Feature, Point} from 'geojson';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
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
        id: `static-data-point-${generateID()}`,
        ...props
    };
    return (
        <DynamicDataLayerComponent
            layerConstructor={() => dynamicPointLayer(layerOptions)}
            {...props}
        />
    );
}
