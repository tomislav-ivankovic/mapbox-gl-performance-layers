import ReactMapboxGl from 'react-mapbox-gl';
import React, {Fragment, ComponentType} from 'react';
import {ExportControl} from './controls/export-control';
import {NavigationControl} from './controls/navigation-control';
import {FullScreenControl} from './controls/full-screen-control';

function addDefaultChildren<P>(WrappedComponent: ComponentType<P>): ComponentType<P> {
    return (props) => {
        const configuredProps = {
            ...props,
            children: (
                <Fragment>
                    <NavigationControl position={'top-left'}/>
                    <FullScreenControl position={'top-left'}/>
                    <ExportControl position={'top-left'}/>
                    {props.children}
                </Fragment>
            )
        };
        return <WrappedComponent {...configuredProps}/>;
    };
}

export const Map = addDefaultChildren(
    // @ts-ignore
    ReactMapboxGl({
        accessToken: 'pk.eyJ1IjoiZmFyYWRheTIiLCJhIjoiTUVHbDl5OCJ9.buFaqIdaIM3iXr1BOYKpsQ'
    })
);
