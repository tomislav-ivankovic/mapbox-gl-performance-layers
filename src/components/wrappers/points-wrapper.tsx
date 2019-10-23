import React, {Component} from 'react';
import {MapContext} from 'react-mapbox-gl';
import {PointLayer} from '../../layers/point/point-layer';
import {Map} from '../map';

interface State {
    center: [number, number];
    zoom: [number];
}

export class PointsWrapper extends Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            center: [16, 44.5],
            zoom: [6.5]
        };
    }

    render() {
        const state = this.state;
        return (
            <Map
                style={'mapbox://styles/mapbox/outdoors-v11'}
                center={state.center}
                zoom={state.zoom}
            >
                <MapContext.Consumer>
                    {(map) => {
                        if (map != null) {
                            map.addLayer(new PointLayer());
                        }
                        return undefined;
                    }}
                </MapContext.Consumer>
            </Map>
        );
    }
}
