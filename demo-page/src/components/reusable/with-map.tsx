import React, {ComponentType} from 'react';
import {MapContext} from 'react-mapbox-gl';

export interface MapProp {
    map: mapboxgl.Map;
}

export function withMap<P extends MapProp>(
    WrappedComponent: ComponentType<P>
): ComponentType<Omit<P, 'map'>> {
    return props => (
        <MapContext.Consumer>
            {map =>
                <WrappedComponent
                    map={map}
                    {...props as any}
                />
            }
        </MapContext.Consumer>
    );
}
