import {useContext, useEffect} from 'react';
import {Control, IControl} from 'mapbox-gl';
import {MapContext} from 'react-mapbox-gl';
import {useLazyRef} from '../../../hooks/use-lazy-ref';

export type MapControlPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface MapControlProps {
    controlConstructor: () => (Control | IControl);
    position?: MapControlPosition;
}

export function MapControl(props: MapControlProps) {
    const control = useLazyRef(props.controlConstructor).current;
    useMapControl(control, props.position);
    return null;
}

export function useMapControl(control: Control | IControl, position?: MapControlPosition) {
    const map = useContext(MapContext);
    useEffect(() => {
        if (map != null) {
            map.addControl(control, position);
        }
        return () => {
            if (map != null && map.getStyle() != null) {
                map.removeControl(control);
            }
        };
    }, [map, control, position]);
}

