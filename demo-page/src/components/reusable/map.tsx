import ReactMapboxGl from 'react-mapbox-gl';
import React, {ComponentType, ReactNodeArray} from 'react';

function filterChildren<P>(WrappedComponent: ComponentType<P>): ComponentType<P> {
    return (props) => {
        const children = props.children;
        let filteredChildren: ReactNodeArray;
        if (children == null) {
            filteredChildren = [];
        } else if (Array.isArray(children)) {
            filteredChildren = children.filter(c => c);
        } else {
            filteredChildren = children ? [children] : [];
        }
        return (
            <WrappedComponent
                {...props}
                children={filteredChildren}
            />
        );
    };
}

export const Map = filterChildren(
    // @ts-ignore
    ReactMapboxGl({
        accessToken: 'pk.eyJ1IjoiZmFyYWRheTIiLCJhIjoiTUVHbDl5OCJ9.buFaqIdaIM3iXr1BOYKpsQ'
    })
);
