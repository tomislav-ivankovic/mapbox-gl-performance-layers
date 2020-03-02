import {useContext} from 'react';
import {useEffect} from 'react';
import {Layer} from 'mapbox-gl';
import {CustomLayerInterface} from 'mapbox-gl';
import {MapContext} from 'react-mapbox-gl';

export function useMapLayer(layer: Layer | CustomLayerInterface, before?: string) {
    const map = useContext(MapContext);
    useEffect(() => {
        if (map == null) {
            return;
        }
        map.addLayer(layer, before);
        const onStyleDataChange = () => {
            if (!map.getLayer(layer.id)) {
                map.addLayer(layer, before);
            }
        };
        map.on('styledata', onStyleDataChange);
        return () => {
            map.off('styledata', onStyleDataChange);
            if (map.getStyle() != null) {
                map.removeLayer(layer.id);
            }
        };
    }, [map, layer, before]);
}
