import React from 'react';
import {FullscreenControl as MapboxFullscreenControl} from 'mapbox-gl';
import {MapControl, MapControlPosition} from './map-control';

export interface FullScreenControlProps {
    position?: MapControlPosition;
}

export function FullScreenControl(props: FullScreenControlProps) {
    return (
        <MapControl
            position={props.position}
            controlConstructor={() => new MapboxFullscreenControl()}
        />
    );
}
