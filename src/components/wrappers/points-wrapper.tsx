import React, {Component} from 'react';
import {Map} from '../map';
import {PointLayer} from '../../layers/point/point-layer';
import {FeatureCollection, Point} from 'geojson';

interface State {
    center: [number, number];
    zoom: [number];
    data: FeatureCollection<Point, {}>
}

export class PointsWrapper extends Component<{}, State> {
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
                    properties: {}
                }))
            }
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
                <PointLayer
                    data={state.data}
                />
            </Map>
        );
    }
}
