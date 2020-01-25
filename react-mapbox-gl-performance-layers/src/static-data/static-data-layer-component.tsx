import {FeatureCollection} from 'geojson';
import {Geometry} from 'geojson';
import {useEffect} from 'react';
import {StaticDataLayer} from 'mapbox-gl-performance-layers';
import {StyleOption} from 'mapbox-gl-performance-layers';
import {Visibility} from 'mapbox-gl-performance-layers';
import {compareStyles} from '../compare-styles';
import {useLazyRef} from '../shared/custom-hooks';
import {usePrevious} from '../shared/custom-hooks';
import {useMapLayer} from '../shared/use-map-layer';

export interface StaticDataLayerComponentProps<G extends Geometry, P, S extends {}> {
    layerConstructor: () => StaticDataLayer<G, P, S>;
    data: FeatureCollection<G, P> | null | undefined;
    style?: StyleOption<G, P, S>;
    visibility?: Visibility;
    before?: string;
}

export function StaticDataLayerComponent<G extends Geometry, P, S extends {}>(
    props: StaticDataLayerComponentProps<G, P, S>
) {
    const layer = useLazyRef(props.layerConstructor).current;

    const previousData = usePrevious(props.data);
    const previousStyle = usePrevious(props.style);
    useEffect(
        () => {
            const didDataChange = props.data !== previousData;
            const didStyleChange = !compareStyles(props.style, previousStyle);
            if (didDataChange && didStyleChange) {
                if (props.data != null) {
                    layer.setDataAndStyle(props.data, props.style);
                } else {
                    layer.clearData();
                    layer.setStyle(props.style);
                }
            } else if (didDataChange) {
                if (props.data != null) {
                    layer.setData(props.data);
                } else {
                    layer.clearData();
                }
            } else if (didStyleChange) {
                layer.setStyle(props.style);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [layer, props.data, props.style]
    );

    useEffect(() => {
        layer.setVisibility(props.visibility);
    }, [layer, props.visibility]);

    useMapLayer(layer, props.before);

    return null;
}
