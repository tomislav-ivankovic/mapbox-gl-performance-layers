import {useContext} from 'react';
import {useEffect} from 'react';
import {Layer} from 'mapbox-gl';
import {CustomLayerInterface} from 'mapbox-gl';
import {MapContext} from 'react-mapbox-gl';

export function useMapLayer(layer: Layer | CustomLayerInterface, before?: string) {
    const map = useContext(MapContext);
    useEffect(() => {
        if (map != null) {
            map.addLayer(layer, before);
        }
        return () => {
            if (map != null && map.getStyle() != null) {
                map.removeLayer(layer.id);
            }
        };
    }, [map, layer, before]);
}
