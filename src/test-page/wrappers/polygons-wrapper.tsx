import React, {Component} from 'react';
import {FeatureCollection, Polygon} from 'geojson';
import {Map} from '../map';
import {PolygonLayer} from '../../react-mapbox/polygon-layer';

interface State {
    center: [number, number];
    zoom: [number];
    data: FeatureCollection<Polygon, {}>;
}

export class PolygonsWrapper extends Component<{}, State> {
    constructor(props: {}) {
        super(props);

        const numberOfPolygons = 10000;
        const numberOfPointsInPolygons = 4;
        const centerX = 15.9819;
        const centerY = 45.8150;
        const spread = 10;
        const polygonSpread = 0.1;
        const polygons: [number, number][][][] = [];
        for (let i = 0; i < numberOfPolygons; i++) {
            let x = centerX + (Math.random() - 0.5) * spread;
            let y = centerY + (Math.random() - 0.5) * spread;
            const points: [number, number][] = [];
            for (let j = 0; j < numberOfPointsInPolygons; j++) {
                points.push([x, y]);
                x += Math.random() * polygonSpread;
                y += Math.random() * polygonSpread;
            }
            polygons.push([points]);
        }

        this.state = {
            center: [16, 44.5],
            zoom: [6.5],
            data: {
                type: 'FeatureCollection',
                features: polygons.map(p => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
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
                <PolygonLayer
                    data={state.data}
                />
            </Map>
        );
    }
}
