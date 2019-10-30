import React, {ComponentType} from 'react';
import {MapContext} from 'react-mapbox-gl';

export interface MapComponentProps {
    map: mapboxgl.Map;
}

export const mapComponent = <P extends MapComponentProps>(WrappedComponent: ComponentType<P>) => {
    return (props: Omit<P, 'map'>) => (
        <MapContext.Consumer>
            {(map) => (
                <WrappedComponent
                    map={map}
                    {...props as any}
                />
            )}
        </MapContext.Consumer>
    );
};
