import ReactMapboxGl from 'react-mapbox-gl';
import React, {Fragment, ComponentType, ReactNode} from 'react';
import {ExportControl} from './controls/export-control';
import {NavigationControl} from './controls/navigation-control';
import {FullScreenControl} from './controls/full-screen-control';

const center = [16, 44.5];
const zoom = [6.5];

function addDefaultConfiguration<P>(WrappedComponent: ComponentType<P>): ComponentType<P & {children: ReactNode}> {
    return function Map(props: P & {children: ReactNode}) {
        const configuredProps = {
            style: 'mapbox://styles/mapbox/outdoors-v11',
            center: center,
            zoom: zoom,
            ...props,
            children: (
                <Fragment>
                    <NavigationControl position={'top-left'}/>
                    <FullScreenControl position={'top-left'}/>
                    <ExportControl position={'top-left'} showBottomRightControls/>
                    {props.children}
                </Fragment>
            )
        };
        return <WrappedComponent {...configuredProps}/>;
    };
}

export const Map = addDefaultConfiguration(
    // @ts-ignore
    ReactMapboxGl({
        accessToken: 'pk.eyJ1IjoiZmFyYWRheTIiLCJhIjoiTUVHbDl5OCJ9.buFaqIdaIM3iXr1BOYKpsQ'
    })
);
