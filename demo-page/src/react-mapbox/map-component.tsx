import React, {ComponentType} from 'react';
import {MapContext} from 'react-mapbox-gl';

export interface MapComponentProps {
    map: mapboxgl.Map;
}

export function mapComponent<P extends MapComponentProps>(
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
