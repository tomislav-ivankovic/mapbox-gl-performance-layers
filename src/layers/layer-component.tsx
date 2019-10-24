import React, {ComponentType} from 'react';
import {MapContext} from 'react-mapbox-gl';

export interface LayerComponentProps {
    map: mapboxgl.Map;
}

export const layerComponent = <P extends LayerComponentProps>(WrappedComponent: ComponentType<P>) => {
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
