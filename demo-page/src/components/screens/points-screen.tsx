import React, {Component} from 'react';
import {Map} from '../reusable/map';
import {Feature, FeatureCollection, Point} from 'geojson';
import {PointLayer} from 'react-mapbox-gl-performance-layers';
import {Popup} from 'react-mapbox-gl';

interface State {
    center: [number, number];
    zoom: [number];
    data: FeatureCollection<Point, null>;
    selection: Feature<Point, null> | null;
}

export class PointsScreen extends Component<{}, State> {
    constructor(props: {}) {
        super(props);

        const numberOfPoints = 1000000;
        const centerX = 15.9819;
        const centerY = 45.8150;
        const spread = 10;
        const points: [number, number][] = [];
        for (let i = 0; i < numberOfPoints; i++) {
            const x = centerX + (Math.random() - 0.5) * spread;
            const y = centerY + (Math.random() - 0.5) * spread;
            points.push([x, y]);
        }

        this.state = {
            center: [16, 44.5],
            zoom: [6.5],
            data: {
                type: 'FeatureCollection',
                features: points.map(p => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: p
                    },
                    properties: null
                }))
            },
            selection: null
        };
    }

    handleClick = (feature: Feature<Point, null>) => {
        const newSelected = feature !== this.state.selection ? feature : null;
        this.setState({selection: newSelected});
    };

    render() {
        const state = this.state;
        return (
            <Map
                style={'mapbox://styles/mapbox/outdoors-v11'}
                center={state.center}
                zoom={state.zoom}
            >
                <PointLayer
                    data={state.data}
                    style={getStyle}
                    onClick={this.handleClick}
                    simpleRendering
                />
                {state.selection != null &&
                <Popup coordinates={state.selection.geometry.coordinates}>
                    <p>{JSON.stringify(state.selection, null, 2)}</p>
                </Popup>
                }
            </Map>
        );
    }
}

function getStyle(feature: Feature<Point, null>) {
    const x = feature.geometry.coordinates[0];
    const y = feature.geometry.coordinates[1];
    return {
        size: 8 + 2 * Math.sin(x - y),
        color: {
            r: x - Math.floor(x),
            g: y - Math.floor(y),
            b: 0.5 + 0.5 * Math.sin(x + y)
        },
        opacity: 0.5
    };
}
