import {Feature} from 'geojson';
import {Geometry} from 'geojson';
import {useEffect} from 'react';
import {DataOperations} from 'mapbox-gl-performance-layers';
import {DynamicDataLayer} from 'mapbox-gl-performance-layers';
import {StyleOption} from 'mapbox-gl-performance-layers';
import {Visibility} from 'mapbox-gl-performance-layers';
import {useLazyRef} from '../shared/custom-hooks';
import {useMapLayer} from '../shared/use-map-layer';

export interface DynamicDataLayerComponentProps<G extends Geometry, P, S extends {}> {
    layerConstructor: () => DynamicDataLayer<G, P, S>;
    data: (dataOperations: DataOperations<Feature<G, P>>) => void;
    style?: StyleOption<G, P, S>;
    visibility?: Visibility;
    before?: string;
}

export function DynamicDataLayerComponent<G extends Geometry, P, S extends {}>(
    props: DynamicDataLayerComponentProps<G, P, S>
) {
    const layer = useLazyRef(props.layerConstructor).current;

    const data = props.data;
    useEffect(() => {
        data(layer.dataOperations);
    }, [layer, data]);

    useEffect(() => {
        layer.setStyle(props.style);
    }, [layer, props.style]);

    useEffect(() => {
        layer.setVisibility(props.visibility);
    }, [layer, props.visibility]);

    useMapLayer(layer, props.before);

    return null;
}
