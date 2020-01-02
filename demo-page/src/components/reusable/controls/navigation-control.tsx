import React from 'react';
import {NavigationControl as MapboxNavigationControl} from 'mapbox-gl';
import {MapControl, MapControlPosition} from './map-control';

export interface NavigationControlProps {
    position?: MapControlPosition;
}

export function NavigationControl(props: NavigationControlProps) {
    return (
        <MapControl
            position={props.position}
            controlConstructor={() => new MapboxNavigationControl()}
        />
    );
}
